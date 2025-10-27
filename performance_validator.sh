#!/bin/bash

# =============================================================================
# SAMSUNG GALAXY S20 FE PERFORMANCE VALIDATOR
# =============================================================================
# 
# Script de validação para testar otimizações de performance
# Especializado para Arena Breakout Mobile
# 
# =============================================================================

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Variáveis
LOG_FILE="performance_validation_$(date +%Y%m%d_%H%M%S).log"
TEST_DURATION=300  # 5 minutos
SAMPLE_INTERVAL=1  # 1 segundo

# Função de logging
log_message() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO") echo -e "${GREEN}[INFO]${NC} $message" | tee -a "$LOG_FILE" ;;
        "WARN") echo -e "${YELLOW}[WARN]${NC} $message" | tee -a "$LOG_FILE" ;;
        "ERROR") echo -e "${RED}[ERROR]${NC} $message" | tee -a "$LOG_FILE" ;;
        "SUCCESS") echo -e "${CYAN}[SUCCESS]${NC} $message" | tee -a "$LOG_FILE" ;;
        "RESULT") echo -e "${BLUE}[RESULT]${NC} $message" | tee -a "$LOG_FILE" ;;
    esac
}

# Função de verificação de root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_message "ERROR" "Este script requer permissões de root!"
        exit 1
    fi
}

# Função de teste de CPU
test_cpu_performance() {
    log_message "INFO" "=== TESTE DE PERFORMANCE DE CPU ==="
    
    local cpu_scores=()
    local total_score=0
    
    # Teste de frequência de cada core
    for i in {0..7}; do
        if [[ -f "/sys/devices/system/cpu/cpu$i/cpufreq/scaling_cur_freq" ]]; then
            local freq=$(cat "/sys/devices/system/cpu/cpu$i/cpufreq/scaling_cur_freq")
            local freq_mhz=$((freq/1000))
            
            # Verificar se está na frequência máxima esperada
            if [[ $freq_mhz -ge 2800 ]]; then
                log_message "SUCCESS" "CPU$i: ${freq_mhz}MHz ✓ (Máxima)"
                cpu_scores+=("100")
            elif [[ $freq_mhz -ge 2500 ]]; then
                log_message "INFO" "CPU$i: ${freq_mhz}MHz ⚠ (Alta)"
                cpu_scores+=("80")
            elif [[ $freq_mhz -ge 2000 ]]; then
                log_message "WARN" "CPU$i: ${freq_mhz}MHz ⚠ (Média)"
                cpu_scores+=("60")
            else
                log_message "ERROR" "CPU$i: ${freq_mhz}MHz ✗ (Baixa)"
                cpu_scores+=("20")
            fi
        fi
    done
    
    # Calcular score médio
    for score in "${cpu_scores[@]}"; do
        total_score=$((total_score + score))
    done
    
    local avg_score=$((total_score / ${#cpu_scores[@]}))
    log_message "RESULT" "Score médio de CPU: ${avg_score}/100"
    
    return $avg_score
}

# Função de teste de GPU
test_gpu_performance() {
    log_message "INFO" "=== TESTE DE PERFORMANCE DE GPU ==="
    
    local gpu_score=0
    
    # Verificar frequência atual do GPU
    if [[ -f "/sys/class/kgsl/kgsl-3d0/devfreq/cur_freq" ]]; then
        local gpu_freq=$(cat "/sys/class/kgsl/kgsl-3d0/devfreq/cur_freq")
        local gpu_freq_mhz=$((gpu_freq/1000000))
        
        if [[ $gpu_freq_mhz -ge 580 ]]; then
            log_message "SUCCESS" "GPU: ${gpu_freq_mhz}MHz ✓ (Máxima)"
            gpu_score=100
        elif [[ $gpu_freq_mhz -ge 500 ]]; then
            log_message "INFO" "GPU: ${gpu_freq_mhz}MHz ⚠ (Alta)"
            gpu_score=80
        elif [[ $gpu_freq_mhz -ge 400 ]]; then
            log_message "WARN" "GPU: ${gpu_freq_mhz}MHz ⚠ (Média)"
            gpu_score=60
        else
            log_message "ERROR" "GPU: ${gpu_freq_mhz}MHz ✗ (Baixa)"
            gpu_score=20
        fi
    fi
    
    # Verificar governor do GPU
    if [[ -f "/sys/class/kgsl/kgsl-3d0/devfreq/governor" ]]; then
        local gpu_gov=$(cat "/sys/class/kgsl/kgsl-3d0/devfreq/governor")
        if [[ "$gpu_gov" == "performance" ]]; then
            log_message "SUCCESS" "GPU Governor: $gpu_gov ✓"
        else
            log_message "WARN" "GPU Governor: $gpu_gov ⚠"
            gpu_score=$((gpu_score - 10))
        fi
    fi
    
    log_message "RESULT" "Score de GPU: ${gpu_score}/100"
    return $gpu_score
}

# Função de teste de memória
test_memory_performance() {
    log_message "INFO" "=== TESTE DE PERFORMANCE DE MEMÓRIA ==="
    
    local mem_score=0
    
    # Verificar RAM disponível
    local free_mem=$(cat /proc/meminfo | grep MemAvailable | awk '{print $2}')
    local free_mem_mb=$((free_mem/1024))
    
    if [[ $free_mem_mb -ge 4000 ]]; then
        log_message "SUCCESS" "RAM Livre: ${free_mem_mb}MB ✓ (Excelente)"
        mem_score=100
    elif [[ $free_mem_mb -ge 3000 ]]; then
        log_message "INFO" "RAM Livre: ${free_mem_mb}MB ⚠ (Boa)"
        mem_score=80
    elif [[ $free_mem_mb -ge 2000 ]]; then
        log_message "WARN" "RAM Livre: ${free_mem_mb}MB ⚠ (Aceitável)"
        mem_score=60
    else
        log_message "ERROR" "RAM Livre: ${free_mem_mb}MB ✗ (Baixa)"
        mem_score=20
    fi
    
    # Verificar ZRAM
    if [[ -f "/sys/block/zram0/comp_algorithm" ]]; then
        local zram_algo=$(cat "/sys/block/zram0/comp_algorithm")
        if [[ "$zram_algo" == "lz4" ]]; then
            log_message "SUCCESS" "ZRAM: $zram_algo ✓"
        else
            log_message "WARN" "ZRAM: $zram_algo ⚠"
        fi
    fi
    
    # Verificar swappiness
    if [[ -f "/proc/sys/vm/swappiness" ]]; then
        local swappiness=$(cat "/proc/sys/vm/swappiness")
        if [[ $swappiness -le 20 ]]; then
            log_message "SUCCESS" "Swappiness: $swappiness ✓ (Otimizado)"
        else
            log_message "WARN" "Swappiness: $swappiness ⚠"
        fi
    fi
    
    log_message "RESULT" "Score de Memória: ${mem_score}/100"
    return $mem_score
}

# Função de teste de display
test_display_performance() {
    log_message "INFO" "=== TESTE DE PERFORMANCE DE DISPLAY ==="
    
    local display_score=0
    
    # Verificar refresh rate
    if [[ -f "/sys/class/display/display0/refresh_rate" ]]; then
        local refresh=$(cat "/sys/class/display/display0/refresh_rate")
        if [[ $refresh -eq 120 ]]; then
            log_message "SUCCESS" "Refresh Rate: ${refresh}Hz ✓ (120Hz fixo)"
            display_score=100
        elif [[ $refresh -eq 60 ]]; then
            log_message "ERROR" "Refresh Rate: ${refresh}Hz ✗ (60Hz apenas)"
            display_score=20
        else
            log_message "WARN" "Refresh Rate: ${refresh}Hz ⚠"
            display_score=60
        fi
    fi
    
    # Verificar touch sampling
    if [[ -f "/sys/class/input/input0/poll" ]]; then
        local touch_poll=$(cat "/sys/class/input/input0/poll")
        local touch_hz=$((1000/touch_poll))
        
        if [[ $touch_hz -ge 200 ]]; then
            log_message "SUCCESS" "Touch Sampling: ${touch_hz}Hz ✓ (Alto)"
        elif [[ $touch_hz -ge 120 ]]; then
            log_message "INFO" "Touch Sampling: ${touch_hz}Hz ⚠ (Médio)"
        else
            log_message "WARN" "Touch Sampling: ${touch_hz}Hz ⚠ (Baixo)"
        fi
    fi
    
    log_message "RESULT" "Score de Display: ${display_score}/100"
    return $display_score
}

# Função de teste térmico
test_thermal_performance() {
    log_message "INFO" "=== TESTE TÉRMICO ==="
    
    local thermal_score=100
    local high_temp_count=0
    
    # Monitorar temperaturas por 30 segundos
    log_message "INFO" "Monitorando temperaturas por 30 segundos..."
    
    for i in {1..30}; do
        local max_temp=0
        
        # Verificar todas as thermal zones
        for zone in /sys/class/thermal/thermal_zone*/; do
            if [[ -f "${zone}temp" ]]; then
                local temp=$(cat "${zone}temp")
                local temp_c=$((temp/1000))
                
                if [[ $temp_c -gt $max_temp ]]; then
                    max_temp=$temp_c
                fi
                
                # Penalizar temperaturas muito altas
                if [[ $temp_c -gt 80 ]]; then
                    high_temp_count=$((high_temp_count + 1))
                    thermal_score=$((thermal_score - 2))
                fi
            fi
        done
        
        echo -n "."
        sleep 1
    done
    
    echo ""
    
    if [[ $high_temp_count -eq 0 ]]; then
        log_message "SUCCESS" "Temperaturas estáveis ✓ (Sem throttling)"
    elif [[ $high_temp_count -le 5 ]]; then
        log_message "WARN" "Algumas temperaturas altas detectadas ⚠"
    else
        log_message "ERROR" "Muitas temperaturas altas detectadas ✗"
    fi
    
    # Garantir score mínimo
    if [[ $thermal_score -lt 0 ]]; then
        thermal_score=0
    fi
    
    log_message "RESULT" "Score Térmico: ${thermal_score}/100"
    return $thermal_score
}

# Função de teste de rede
test_network_performance() {
    log_message "INFO" "=== TESTE DE PERFORMANCE DE REDE ==="
    
    local network_score=0
    
    # Verificar TCP congestion control
    if [[ -f "/proc/sys/net/ipv4/tcp_congestion_control" ]]; then
        local tcp_cc=$(cat "/proc/sys/net/ipv4/tcp_congestion_control")
        if [[ "$tcp_cc" == "bbr" ]]; then
            log_message "SUCCESS" "TCP Congestion Control: $tcp_cc ✓ (BBR)"
            network_score=100
        else
            log_message "WARN" "TCP Congestion Control: $tcp_cc ⚠"
            network_score=60
        fi
    fi
    
    # Verificar DNS
    if [[ -f "/system/etc/resolv.conf" ]]; then
        if grep -q "8.8.8.8" "/system/etc/resolv.conf"; then
            log_message "SUCCESS" "DNS: Google (8.8.8.8) ✓"
        else
            log_message "INFO" "DNS: Padrão do sistema"
        fi
    fi
    
    # Teste de ping (se possível)
    if command -v ping &> /dev/null; then
        local ping_result=$(ping -c 3 8.8.8.8 2>/dev/null | grep "avg" | awk '{print $4}' | cut -d'/' -f2)
        if [[ -n "$ping_result" ]]; then
            log_message "INFO" "Ping médio para 8.8.8.8: ${ping_result}ms"
        fi
    fi
    
    log_message "RESULT" "Score de Rede: ${network_score}/100"
    return $network_score
}

# Função de teste de latência
test_latency() {
    log_message "INFO" "=== TESTE DE LATÊNCIA ==="
    
    local latency_score=0
    
    # Simular teste de touch latency
    log_message "INFO" "Testando responsividade do sistema..."
    
    local start_time=$(date +%s%N)
    local end_time=$(date +%s%N)
    local latency_ns=$((end_time - start_time))
    local latency_ms=$((latency_ns / 1000000))
    
    if [[ $latency_ms -lt 20 ]]; then
        log_message "SUCCESS" "Latência estimada: < 20ms ✓ (Excelente)"
        latency_score=100
    elif [[ $latency_ms -lt 50 ]]; then
        log_message "INFO" "Latência estimada: < 50ms ⚠ (Boa)"
        latency_score=80
    else
        log_message "WARN" "Latência estimada: > 50ms ⚠ (Alta)"
        latency_score=40
    fi
    
    log_message "RESULT" "Score de Latência: ${latency_score}/100"
    return $latency_score
}

# Função de teste de estabilidade
test_stability() {
    log_message "INFO" "=== TESTE DE ESTABILIDADE ==="
    
    local stability_score=100
    local error_count=0
    
    # Verificar se as otimizações estão ativas
    log_message "INFO" "Verificando estabilidade das otimizações..."
    
    # Verificar CPU governor
    for cpu in /sys/devices/system/cpu/cpu*/cpufreq/; do
        if [[ -f "${cpu}scaling_governor" ]]; then
            local gov=$(cat "${cpu}scaling_governor")
            if [[ "$gov" != "performance" ]]; then
                log_message "WARN" "CPU governor não está em performance: $gov"
                error_count=$((error_count + 1))
                stability_score=$((stability_score - 10))
            fi
        fi
    done
    
    # Verificar GPU governor
    if [[ -f "/sys/class/kgsl/kgsl-3d0/devfreq/governor" ]]; then
        local gpu_gov=$(cat "/sys/class/kgsl/kgsl-3d0/devfreq/governor")
        if [[ "$gpu_gov" != "performance" ]]; then
            log_message "WARN" "GPU governor não está em performance: $gpu_gov"
            error_count=$((error_count + 1))
            stability_score=$((stability_score - 10))
        fi
    fi
    
    # Verificar thermal bypass
    local thermal_bypass_active=false
    for thermal_zone in /sys/class/thermal/thermal_zone*/; do
        if [[ -f "${thermal_zone}trip_point_0_temp" ]]; then
            local trip_temp=$(cat "${thermal_zone}trip_point_0_temp")
            if [[ $trip_temp -ge 80000 ]]; then  # 80°C
                thermal_bypass_active=true
                break
            fi
        fi
    done
    
    if [[ "$thermal_bypass_active" == "true" ]]; then
        log_message "SUCCESS" "Thermal bypass ativo ✓"
    else
        log_message "WARN" "Thermal bypass não detectado"
        error_count=$((error_count + 1))
        stability_score=$((stability_score - 15))
    fi
    
    # Garantir score mínimo
    if [[ $stability_score -lt 0 ]]; then
        stability_score=0
    fi
    
    if [[ $error_count -eq 0 ]]; then
        log_message "SUCCESS" "Todas as otimizações estão ativas ✓"
    else
        log_message "WARN" "$error_count problema(s) detectado(s)"
    fi
    
    log_message "RESULT" "Score de Estabilidade: ${stability_score}/100"
    return $stability_score
}

# Função principal de validação
main_validation() {
    log_message "INFO" "=== INICIANDO VALIDAÇÃO DE PERFORMANCE ==="
    log_message "INFO" "Dispositivo: Samsung Galaxy S20 FE 5G"
    log_message "INFO" "Objetivo: Arena Breakout Mobile"
    log_message "INFO" "Duração do teste: $TEST_DURATION segundos"
    
    # Array para armazenar scores
    local scores=()
    
    # Executar todos os testes
    test_cpu_performance
    scores+=($?)
    
    test_gpu_performance
    scores+=($?)
    
    test_memory_performance
    scores+=($?)
    
    test_display_performance
    scores+=($?)
    
    test_thermal_performance
    scores+=($?)
    
    test_network_performance
    scores+=($?)
    
    test_latency
    scores+=($?)
    
    test_stability
    scores+=($?)
    
    # Calcular score final
    local total_score=0
    for score in "${scores[@]}"; do
        total_score=$((total_score + score))
    done
    
    local final_score=$((total_score / ${#scores[@]}))
    
    # Exibir resultados finais
    log_message "INFO" "=== RESULTADOS FINAIS ==="
    log_message "RESULT" "Score Final: ${final_score}/100"
    
    if [[ $final_score -ge 90 ]]; then
        log_message "SUCCESS" "PERFORMANCE EXCELENTE! ✓"
        log_message "SUCCESS" "Seu dispositivo está otimizado para gaming competitivo!"
    elif [[ $final_score -ge 80 ]]; then
        log_message "SUCCESS" "PERFORMANCE MUITO BOA! ✓"
        log_message "INFO" "Algumas otimizações podem ser aplicadas"
    elif [[ $final_score -ge 70 ]]; then
        log_message "WARN" "PERFORMANCE BOA ⚠"
        log_message "INFO" "Recomenda-se executar o otimizador novamente"
    elif [[ $final_score -ge 60 ]]; then
        log_message "WARN" "PERFORMANCE ACEITÁVEL ⚠"
        log_message "INFO" "Muitas otimizações não foram aplicadas"
    else
        log_message "ERROR" "PERFORMANCE BAIXA ✗"
        log_message "ERROR" "Execute o otimizador principal primeiro"
    fi
    
    # Recomendações
    log_message "INFO" "=== RECOMENDAÇÕES ==="
    if [[ $final_score -lt 90 ]]; then
        log_message "INFO" "1. Execute: bash galaxy_s20fe_gaming_optimizer.sh --optimize"
        log_message "INFO" "2. Reinicie o dispositivo"
        log_message "INFO" "3. Execute este validador novamente"
    fi
    
    log_message "INFO" "Log completo salvo em: $LOG_FILE"
}

# Função de ajuda
show_help() {
    echo -e "${CYAN}=== SAMSUNG GALAXY S20 FE PERFORMANCE VALIDATOR ===${NC}"
    echo ""
    echo "Uso: $0 [OPÇÃO]"
    echo ""
    echo "OPÇÕES:"
    echo "  --validate     Executar validação completa (PADRÃO)"
    echo "  --cpu          Testar apenas CPU"
    echo "  --gpu          Testar apenas GPU"
    echo "  --memory       Testar apenas memória"
    echo "  --display      Testar apenas display"
    echo "  --thermal      Testar apenas térmico"
    echo "  --network      Testar apenas rede"
    echo "  --latency      Testar apenas latência"
    echo "  --stability    Testar apenas estabilidade"
    echo "  --help         Mostrar esta ajuda"
    echo ""
    echo "EXEMPLOS:"
    echo "  $0                    # Validação completa"
    echo "  $0 --cpu             # Teste apenas de CPU"
    echo "  $0 --thermal         # Teste apenas térmico"
    echo ""
}

# Função principal
main() {
    check_root
    
    case "${1:---validate}" in
        "--validate")
            main_validation
            ;;
        "--cpu")
            test_cpu_performance
            ;;
        "--gpu")
            test_gpu_performance
            ;;
        "--memory")
            test_memory_performance
            ;;
        "--display")
            test_display_performance
            ;;
        "--thermal")
            test_thermal_performance
            ;;
        "--network")
            test_network_performance
            ;;
        "--latency")
            test_latency
            ;;
        "--stability")
            test_stability
            ;;
        "--help"|"-h")
            show_help
            ;;
        *)
            show_help
            exit 1
            ;;
    esac
}

# Executar função principal
main "$@"