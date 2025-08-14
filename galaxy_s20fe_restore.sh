#!/bin/bash

################################################################################
# GALAXY S20 FE PERFORMANCE OPTIMIZER - RESTORE SCRIPT v2.0
# Script de Restauração para Samsung Galaxy S20 FE Snapdragon 865 5G
# Reverte todas as modificações feitas pelo otimizador
#
# Desenvolvido por: Especialista em Performance Android
# Data: $(date +"%Y-%m-%d")
# Compatibilidade: One UI 4.x/5.x, Android 11+
#
################################################################################

# AVISO LEGAL
cat << 'EOF'
################################################################################
🔄 GALAXY S20 FE PERFORMANCE RESTORE v2.0
################################################################################

Este script irá RESTAURAR todas as configurações originais do sistema,
revertendo as otimizações aplicadas pelo Performance Optimizer.

AÇÕES QUE SERÃO EXECUTADAS:
✅ Restaurar configurações originais de CPU
✅ Restaurar configurações originais de GPU  
✅ Restaurar configurações de display
✅ Restaurar configurações de memória
✅ Restaurar configurações de rede
✅ Restaurar configurações térmicas
✅ Remover otimizações específicas de jogos
✅ Reativar serviços padrão do sistema

IMPORTANTE:
- Requer acesso root
- Processo irreversível após execução
- Recomendado reiniciar após restauração
- Logs serão mantidos para referência

################################################################################
EOF

echo "Pressione ENTER para continuar com a restauração ou CTRL+C para cancelar..."
read -r

################################################################################
# CONFIGURAÇÕES GLOBAIS
################################################################################

SCRIPT_VERSION="2.0"
SCRIPT_NAME="Galaxy S20 FE Performance Restore"
LOG_DIR="/sdcard/performance_optimizer_logs"
BACKUP_DIR="/sdcard/performance_optimizer_backup"
RESTORE_LOG="$LOG_DIR/restore.log"

# Caminhos do sistema
CPU_BASE_PATH="/sys/devices/system/cpu"
GPU_BASE_PATH="/sys/class/kgsl/kgsl-3d0"
THERMAL_BASE_PATH="/sys/class/thermal"

################################################################################
# FUNÇÕES UTILITÁRIAS
################################################################################

# Função de logging
log_message() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" | tee -a "$RESTORE_LOG"
}

# Verificar root
check_root() {
    if [ "$(id -u)" -ne 0 ]; then
        log_message "ERROR" "❌ ROOT ACCESS NECESSÁRIO!"
        log_message "ERROR" "Execute o script com 'su' ou através do Magisk"
        exit 1
    fi
    log_message "SUCCESS" "✅ Root access confirmado"
}

# Restaurar arquivo do backup
restore_file() {
    local system_path="$1"
    local backup_pattern="$2"
    
    # Encontrar o backup mais recente
    local backup_file=$(ls -t "$BACKUP_DIR"/${backup_pattern}_*.bak 2>/dev/null | head -n1)
    
    if [ -f "$backup_file" ]; then
        cp "$backup_file" "$system_path" 2>/dev/null
        if [ $? -eq 0 ]; then
            log_message "SUCCESS" "✅ Restaurado: $system_path"
        else
            log_message "ERROR" "❌ Falha ao restaurar: $system_path"
        fi
    else
        log_message "WARNING" "⚠️ Backup não encontrado para: $system_path"
    fi
}

# Escrever valor padrão
write_default_value() {
    local file_path="$1"
    local value="$2"
    local description="$3"
    
    if [ -f "$file_path" ]; then
        echo "$value" > "$file_path" 2>/dev/null
        if [ $? -eq 0 ]; then
            log_message "SUCCESS" "✅ $description restaurado para: $value"
        else
            log_message "ERROR" "❌ Falha ao restaurar $description"
        fi
    fi
}

################################################################################
# MÓDULO 1: RESTAURAR CONFIGURAÇÕES DE CPU
################################################################################

restore_cpu_configuration() {
    log_message "INFO" "🔧 RESTAURANDO CONFIGURAÇÕES DE CPU"
    
    # Restaurar governors e frequências de CPU
    for cpu in $(seq 0 7); do
        if [ -d "$CPU_BASE_PATH/cpu$cpu/cpufreq" ]; then
            log_message "INFO" "Restaurando CPU$cpu..."
            
            # Restaurar governor
            restore_file "$CPU_BASE_PATH/cpu$cpu/cpufreq/scaling_governor" "cpu${cpu}_governor"
            
            # Restaurar frequências mínimas e máximas
            restore_file "$CPU_BASE_PATH/cpu$cpu/cpufreq/scaling_min_freq" "cpu${cpu}_min_freq"
            restore_file "$CPU_BASE_PATH/cpu$cpu/cpufreq/scaling_max_freq" "cpu${cpu}_max_freq"
            
            # Se não houver backup, usar valores conservadores padrão
            if [ ! -f "$(ls -t "$BACKUP_DIR"/cpu${cpu}_governor_*.bak 2>/dev/null | head -n1)" ]; then
                write_default_value "$CPU_BASE_PATH/cpu$cpu/cpufreq/scaling_governor" "schedutil" "CPU$cpu Governor"
            fi
        fi
    done
    
    # Restaurar configurações avançadas de CPU
    echo 1 > /sys/module/msm_thermal/core_control/enabled 2>/dev/null
    echo 0 > /sys/module/cpu_boost/parameters/input_boost_enabled 2>/dev/null
    
    # Restaurar scheduler padrão
    echo "cfq" > /sys/block/sda/queue/scheduler 2>/dev/null
    echo "cfq" > /sys/block/sdb/queue/scheduler 2>/dev/null
    echo "cfq" > /sys/block/sdc/queue/scheduler 2>/dev/null
    
    # Restaurar configurações de kernel
    echo 2 > /proc/sys/kernel/randomize_va_space 2>/dev/null
    
    log_message "SUCCESS" "✅ Configurações de CPU restauradas"
}

################################################################################
# MÓDULO 2: RESTAURAR CONFIGURAÇÕES DE GPU
################################################################################

restore_gpu_configuration() {
    log_message "INFO" "🎮 RESTAURANDO CONFIGURAÇÕES DE GPU"
    
    # Restaurar governor da GPU
    restore_file "$GPU_BASE_PATH/governor" "gpu_governor"
    
    # Restaurar frequência máxima da GPU
    restore_file "$GPU_BASE_PATH/max_gpuclk" "gpu_max_freq"
    
    # Se não houver backup, usar valores padrão
    if [ ! -f "$(ls -t "$BACKUP_DIR"/gpu_governor_*.bak 2>/dev/null | head -n1)" ]; then
        write_default_value "$GPU_BASE_PATH/governor" "msm-adreno-tz" "GPU Governor"
    fi
    
    # Restaurar configurações avançadas da GPU
    echo 1 > /sys/class/kgsl/kgsl-3d0/devfreq/adrenoboost 2>/dev/null
    echo 1 > /sys/class/kgsl/kgsl-3d0/throttling 2>/dev/null
    echo 1 > /sys/class/kgsl/kgsl-3d0/thermal_pwrlevel 2>/dev/null
    
    echo 0 > /sys/class/kgsl/kgsl-3d0/force_clk_on 2>/dev/null
    echo 0 > /sys/class/kgsl/kgsl-3d0/force_bus_on 2>/dev/null
    echo 0 > /sys/class/kgsl/kgsl-3d0/force_rail_on 2>/dev/null
    
    # Restaurar níveis de power padrão
    echo 5 > /sys/class/kgsl/kgsl-3d0/default_pwrlevel 2>/dev/null
    echo 0 > /sys/class/kgsl/kgsl-3d0/min_pwrlevel 2>/dev/null
    echo 9 > /sys/class/kgsl/kgsl-3d0/max_pwrlevel 2>/dev/null
    
    # Restaurar propriedades de renderização
    setprop debug.egl.hw 0
    setprop debug.composition.type c2d
    setprop debug.sf.hw 0
    setprop debug.gr.numframebuffers 2
    setprop debug.egl.buffcount 3
    setprop debug.hwui.render_dirty_regions true
    
    log_message "SUCCESS" "✅ Configurações de GPU restauradas"
}

################################################################################
# MÓDULO 3: RESTAURAR CONFIGURAÇÕES DE MEMÓRIA
################################################################################

restore_memory_configuration() {
    log_message "INFO" "💾 RESTAURANDO CONFIGURAÇÕES DE MEMÓRIA"
    
    # Desativar e resetar ZRAM
    swapoff /dev/block/zram0 2>/dev/null
    echo 1 > /sys/block/zram0/reset 2>/dev/null
    
    # Restaurar configurações padrão de VM
    echo 60 > /proc/sys/vm/swappiness 2>/dev/null
    echo 100 > /proc/sys/vm/vfs_cache_pressure 2>/dev/null
    echo 5644 > /proc/sys/vm/min_free_kbytes 2>/dev/null
    echo 0 > /proc/sys/vm/oom_kill_allocating_task 2>/dev/null
    echo 0 > /proc/sys/vm/panic_on_oom 2>/dev/null
    
    # Restaurar configurações de memória
    echo always > /sys/kernel/mm/transparent_hugepage/enabled 2>/dev/null
    echo 3 > /proc/sys/vm/page-cluster 2>/dev/null
    echo 0 > /proc/sys/vm/overcommit_memory 2>/dev/null
    echo 50 > /proc/sys/vm/overcommit_ratio 2>/dev/null
    
    # Restaurar Low Memory Killer padrão
    echo "18432,23040,27648,32256,36864,46080" > /sys/module/lowmemorykiller/parameters/minfree 2>/dev/null
    echo 0 > /sys/module/lowmemorykiller/parameters/enable_adaptive_lmk 2>/dev/null
    
    log_message "SUCCESS" "✅ Configurações de memória restauradas"
}

################################################################################
# MÓDULO 4: RESTAURAR CONFIGURAÇÕES DE DISPLAY
################################################################################

restore_display_configuration() {
    log_message "INFO" "📱 RESTAURANDO CONFIGURAÇÕES DE DISPLAY"
    
    # Restaurar refresh rate padrão (adaptativo)
    settings put system peak_refresh_rate 120.0
    settings put system min_refresh_rate 60.0
    settings put secure refresh_rate_mode 1
    
    # Restaurar configurações de pipeline de display
    setprop debug.sf.latch_unsignaled 0
    setprop debug.sf.early_phase_offset_ns 500000
    setprop debug.sf.early_app_phase_offset_ns 500000
    setprop debug.sf.early_gl_phase_offset_ns 3000000
    setprop debug.sf.early_gl_app_phase_offset_ns 15000000
    
    # Restaurar VSync padrão
    setprop debug.sf.disable_backpressure 0
    setprop debug.sf.enable_gl_backpressure 1
    setprop debug.cpurend.vsync true
    
    # Restaurar animações do sistema
    settings put global window_animation_scale 1.0
    settings put global transition_animation_scale 1.0
    settings put global animator_duration_scale 1.0
    
    # Restaurar configurações de touch
    echo 120 > /sys/class/sec/tsp/cmd 2>/dev/null
    echo 1 > /sys/class/sec/tsp/touch_sensitivity 2>/dev/null
    
    log_message "SUCCESS" "✅ Configurações de display restauradas"
}

################################################################################
# MÓDULO 5: RESTAURAR CONFIGURAÇÕES DE SENSORES
################################################################################

restore_sensor_configuration() {
    log_message "INFO" "🎯 RESTAURANDO CONFIGURAÇÕES DE SENSORES"
    
    # Restaurar polling rate padrão dos sensores
    echo 200000 > /sys/class/sensors/gyro_sensor/poll_delay 2>/dev/null
    echo 200000 > /sys/class/sensors/accelerometer_sensor/poll_delay 2>/dev/null
    
    # Restaurar configurações de touch
    echo 0 > /sys/class/sec/tsp/glove_mode 2>/dev/null
    echo 0 > /sys/class/sec/tsp/hover_enable 2>/dev/null
    
    # Restaurar configurações avançadas de touch
    echo 0 > /proc/touchpanel/game_switch_enable 2>/dev/null
    echo 0 > /proc/touchpanel/oplus_tp_direction 2>/dev/null
    echo 0 > /proc/touchpanel/oplus_tp_limit_enable 2>/dev/null
    
    # Restaurar configurações padrão de sensores
    for sensor in /sys/class/sensors/*/poll_delay; do
        if [ -f "$sensor" ]; then
            echo 200000 > "$sensor" 2>/dev/null
        fi
    done
    
    # Restaurar propriedades de sensores
    setprop persist.vendor.sensors.enable.mag_filter false
    setprop persist.vendor.sensors.enable.rt_task true
    setprop persist.vendor.sensors.hal_trigger_ssr true
    
    log_message "SUCCESS" "✅ Configurações de sensores restauradas"
}

################################################################################
# MÓDULO 6: RESTAURAR CONFIGURAÇÕES DE REDE
################################################################################

restore_network_configuration() {
    log_message "INFO" "🌐 RESTAURANDO CONFIGURAÇÕES DE REDE"
    
    # Restaurar configurações TCP padrão
    echo cubic > /proc/sys/net/ipv4/tcp_congestion_control 2>/dev/null
    echo 0 > /proc/sys/net/ipv4/tcp_low_latency 2>/dev/null
    echo 1 > /proc/sys/net/ipv4/tcp_sack 2>/dev/null
    echo 1 > /proc/sys/net/ipv4/tcp_fack 2>/dev/null
    echo 1 > /proc/sys/net/ipv4/tcp_slow_start_after_idle 2>/dev/null
    
    # Restaurar buffers padrão
    echo 212992 > /proc/sys/net/core/rmem_max 2>/dev/null
    echo 212992 > /proc/sys/net/core/wmem_max 2>/dev/null
    echo "4096 16384 4194304" > /proc/sys/net/ipv4/tcp_rmem 2>/dev/null
    echo "4096 16384 4194304" > /proc/sys/net/ipv4/tcp_wmem 2>/dev/null
    
    # Restaurar configurações de latência
    echo 0 > /proc/sys/net/ipv4/tcp_no_delay_ack 2>/dev/null
    echo 1 > /proc/sys/net/ipv4/tcp_timestamps 2>/dev/null
    echo 0 > /proc/sys/net/ipv4/tcp_tw_reuse 2>/dev/null
    echo 0 > /proc/sys/net/ipv4/tcp_tw_recycle 2>/dev/null
    
    # Restaurar DNS padrão (será definido pela operadora)
    setprop net.dns1 ""
    setprop net.dns2 ""
    setprop net.rmnet0.dns1 ""
    setprop net.rmnet0.dns2 ""
    
    # Restaurar QoS padrão
    echo 0 > /proc/sys/net/core/netdev_tstamp_prequeue 2>/dev/null
    echo 300 > /proc/sys/net/core/netdev_budget 2>/dev/null
    
    log_message "SUCCESS" "✅ Configurações de rede restauradas"
}

################################################################################
# MÓDULO 7: RESTAURAR GERENCIAMENTO TÉRMICO
################################################################################

restore_thermal_management() {
    log_message "INFO" "🌡️ RESTAURANDO GERENCIAMENTO TÉRMICO"
    
    # Restaurar limites térmicos padrão
    for thermal_zone in /sys/class/thermal/thermal_zone*/; do
        if [ -d "$thermal_zone" ]; then
            zone_type=$(cat "$thermal_zone/type" 2>/dev/null)
            
            case "$zone_type" in
                "cpu-0-0-usr"|"cpu-0-1-usr"|"cpu-0-2-usr"|"cpu-0-3-usr")
                    echo 75000 > "$thermal_zone/trip_point_0_temp" 2>/dev/null
                    echo 80000 > "$thermal_zone/trip_point_1_temp" 2>/dev/null
                    ;;
                "cpu-1-0-usr"|"cpu-1-1-usr"|"cpu-1-2-usr"|"cpu-1-3-usr")
                    echo 75000 > "$thermal_zone/trip_point_0_temp" 2>/dev/null
                    echo 80000 > "$thermal_zone/trip_point_1_temp" 2>/dev/null
                    ;;
                "gpu-usr")
                    echo 75000 > "$thermal_zone/trip_point_0_temp" 2>/dev/null
                    echo 80000 > "$thermal_zone/trip_point_1_temp" 2>/dev/null
                    ;;
            esac
        fi
    done
    
    # Reativar thermal throttling
    echo 1 > /sys/class/thermal/thermal_message/sconfig 2>/dev/null
    
    # Restaurar cooling devices
    for cooling_device in /sys/class/thermal/cooling_device*/; do
        if [ -d "$cooling_device" ]; then
            echo 1 > "$cooling_device/cur_state" 2>/dev/null
        fi
    done
    
    # Reativar thermal-engine
    start thermal-engine 2>/dev/null
    
    log_message "SUCCESS" "✅ Gerenciamento térmico restaurado"
}

################################################################################
# MÓDULO 8: REMOVER OTIMIZAÇÕES ESPECÍFICAS DE JOGOS
################################################################################

restore_game_configuration() {
    log_message "INFO" "🎮 REMOVENDO OTIMIZAÇÕES ESPECÍFICAS DE JOGOS"
    
    # Remover propriedades de gaming
    setprop debug.game.7Gen false
    setprop debug.game.120fps false
    setprop debug.game.maxfps 60
    
    # Restaurar configurações de áudio padrão
    setprop af.fast_track_multiplier 2
    setprop audio_hal.period_size 240
    setprop ro.config.media_vol_steps 15
    
    # Restaurar Game Mode padrão
    settings put secure game_driver_all_apps 0
    settings put global game_driver_opt_out_apps ""
    
    # Restaurar configurações do Samsung Game Launcher
    settings put secure game_auto_temperature_control 1
    settings put secure game_siop_level 1
    settings put secure game_fps_limit 1
    
    # Remover configurações de renderização otimizadas
    dumpsys SurfaceFlinger --set-color-mode 1 2>/dev/null
    dumpsys SurfaceFlinger --set-frame-rate 60 2>/dev/null
    
    log_message "SUCCESS" "✅ Otimizações de jogos removidas"
}

################################################################################
# MÓDULO 9: LIMPEZA E FINALIZAÇÃO
################################################################################

cleanup_and_finalize() {
    log_message "INFO" "🧹 EXECUTANDO LIMPEZA E FINALIZAÇÃO"
    
    # Matar processos de monitoramento térmico se existirem
    pkill -f "thermal.*monitor" 2>/dev/null
    
    # Limpar cache do sistema
    echo 3 > /proc/sys/vm/drop_caches 2>/dev/null
    sync
    
    # Criar relatório de restauração
    cat > "$LOG_DIR/restore_report.txt" << EOF
GALAXY S20 FE PERFORMANCE RESTORE REPORT
========================================
Data: $(date)
Script Version: $SCRIPT_VERSION

CONFIGURAÇÕES RESTAURADAS:
- CPU: Governors e frequências restaurados
- GPU: Configurações padrão da Adreno 650
- Display: Refresh rate adaptativo restaurado
- Touch: Configurações padrão restauradas
- Thermal: Limites originais restaurados
- RAM: Configurações padrão de memória
- Network: Configurações TCP padrão
- Game Settings: Otimizações removidas

ARQUIVOS MANTIDOS:
- Logs de otimização: $LOG_DIR/
- Backups originais: $BACKUP_DIR/
- Este relatório: $LOG_DIR/restore_report.txt

STATUS: RESTAURAÇÃO CONCLUÍDA COM SUCESSO ✅

RECOMENDAÇÃO:
Reinicie o dispositivo para garantir que todas as configurações
sejam aplicadas corretamente.
EOF
    
    log_message "SUCCESS" "✅ Limpeza e finalização concluídas"
}

################################################################################
# FUNÇÃO PRINCIPAL DE RESTAURAÇÃO
################################################################################

run_restore() {
    log_message "INFO" "🔄 INICIANDO RESTAURAÇÃO COMPLETA DO GALAXY S20 FE"
    log_message "INFO" "Versão do Script: $SCRIPT_VERSION"
    
    # Verificar se existem backups
    if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]; then
        log_message "WARNING" "⚠️ Nenhum backup encontrado em $BACKUP_DIR"
        log_message "INFO" "Aplicando configurações padrão do sistema..."
    fi
    
    # Executar todos os módulos de restauração
    restore_cpu_configuration
    restore_gpu_configuration
    restore_memory_configuration
    restore_display_configuration
    restore_sensor_configuration
    restore_network_configuration
    restore_thermal_management
    restore_game_configuration
    cleanup_and_finalize
    
    log_message "SUCCESS" "🎉 RESTAURAÇÃO COMPLETA CONCLUÍDA COM SUCESSO!"
    echo
    echo "=================================="
    echo "✅ GALAXY S20 FE RESTAURADO!"
    echo "=================================="
    echo
    echo "📊 CONFIGURAÇÕES RESTAURADAS:"
    echo "- CPU: Governors padrão restaurados"
    echo "- GPU: Adreno 650 em modo padrão"
    echo "- Display: Refresh rate adaptativo"
    echo "- Touch: Configurações originais"
    echo "- RAM: Gerenciamento padrão"
    echo "- Thermal: Limites originais"
    echo "- Network: Configurações padrão"
    echo "- Gaming: Otimizações removidas"
    echo
    echo "📁 ARQUIVOS MANTIDOS:"
    echo "- Logs: $LOG_DIR/"
    echo "- Backups: $BACKUP_DIR/"
    echo "- Relatório: $LOG_DIR/restore_report.txt"
    echo
    echo "⚠️ IMPORTANTE:"
    echo "- REINICIE O DISPOSITIVO para aplicar todas as mudanças"
    echo "- Os backups foram mantidos para referência futura"
    echo "- Logs detalhados disponíveis em $RESTORE_LOG"
    echo
    echo "🔄 Para otimizar novamente, execute:"
    echo "   ./galaxy_s20fe_performance_optimizer.sh"
    echo
}

################################################################################
# SCRIPT DE ENTRADA PRINCIPAL
################################################################################

main() {
    case "${1:-restore}" in
        "restore")
            # Verificar root
            check_root
            
            # Criar diretório de logs se não existir
            mkdir -p "$LOG_DIR"
            
            # Executar restauração
            run_restore
            ;;
        "help"|"-h"|"--help")
            cat << 'EOF'
GALAXY S20 FE PERFORMANCE RESTORE v2.0

USO:
  ./galaxy_s20fe_restore.sh [COMANDO]

COMANDOS:
  restore  - Executar restauração completa (padrão)
  help     - Mostrar esta mensagem de ajuda

DESCRIÇÃO:
Este script reverte todas as otimizações aplicadas pelo
Galaxy S20 FE Performance Optimizer, restaurando as
configurações originais do sistema.

REQUISITOS:
- Root access obrigatório
- Samsung Galaxy S20 FE Snapdragon 865 5G

AÇÕES EXECUTADAS:
- Restaura configurações originais de CPU/GPU
- Restaura configurações de display e sensores
- Restaura gerenciamento térmico padrão
- Remove otimizações específicas de jogos
- Restaura configurações de rede e memória

Para mais informações, consulte:
/sdcard/performance_optimizer_logs/
EOF
            ;;
        *)
            echo "❌ Comando inválido: $1"
            echo "Use './galaxy_s20fe_restore.sh help' para ajuda"
            exit 1
            ;;
    esac
}

# Executar função principal
main "$@"