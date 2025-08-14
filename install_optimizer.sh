#!/bin/bash

# =============================================================================
# SAMSUNG GALAXY S20 FE GAMING OPTIMIZER - INSTALADOR AUTOMATIZADO
# =============================================================================
# 
# Script de instalação automatizada para o otimizador de performance
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
INSTALL_DIR="/data/local/tmp/gaming_optimizer"
SCRIPT_NAME="galaxy_s20fe_gaming_optimizer.sh"
VALIDATOR_NAME="performance_validator.sh"
README_NAME="README_GAMING_OPTIMIZER.md"

# Função de logging
log_message() {
    local level="$1"
    local message="$2"
    
    case $level in
        "INFO") echo -e "${GREEN}[INFO]${NC} $message" ;;
        "WARN") echo -e "${YELLOW}[WARN]${NC} $message" ;;
        "ERROR") echo -e "${RED}[ERROR]${NC} $message" ;;
        "SUCCESS") echo -e "${CYAN}[SUCCESS]${NC} $message" ;;
        "STEP") echo -e "${BLUE}[STEP]${NC} $message" ;;
    esac
}

# Função de verificação de root
check_root() {
    log_message "STEP" "Verificando permissões de root..."
    
    if [[ $EUID -ne 0 ]]; then
        log_message "ERROR" "Este script requer permissões de root!"
        log_message "ERROR" "Execute com: su -c 'bash $0'"
        exit 1
    fi
    
    log_message "SUCCESS" "Root verificado com sucesso!"
}

# Função de verificação de compatibilidade
check_compatibility() {
    log_message "STEP" "Verificando compatibilidade do dispositivo..."
    
    # Verificar modelo
    local model=$(getprop ro.product.model 2>/dev/null)
    if [[ -n "$model" ]]; then
        log_message "INFO" "Modelo detectado: $model"
        
        if [[ "$model" == "SM-G781B" || "$model" == "SM-G781N" || "$model" == "SM-G781U" ]]; then
            log_message "SUCCESS" "Dispositivo compatível detectado!"
        else
            log_message "WARN" "Este script foi otimizado para SM-G781B/DS"
            log_message "WARN" "Continuando com instalação genérica..."
        fi
    else
        log_message "WARN" "Não foi possível detectar o modelo do dispositivo"
    fi
    
    # Verificar Android version
    local android_version=$(getprop ro.build.version.release 2>/dev/null)
    if [[ -n "$android_version" ]]; then
        log_message "INFO" "Versão Android: $android_version"
        
        # Verificar se é Android 11+
        local major_version=$(echo "$android_version" | cut -d'.' -f1)
        if [[ $major_version -ge 11 ]]; then
            log_message "SUCCESS" "Versão Android compatível!"
        else
            log_message "WARN" "Versão Android pode ser muito antiga"
        fi
    fi
    
    # Verificar One UI
    local oneui_version=$(getprop ro.build.version.oneui 2>/dev/null)
    if [[ -n "$oneui_version" ]]; then
        log_message "INFO" "One UI version: $oneui_version"
    fi
}

# Função de verificação de dependências
check_dependencies() {
    log_message "STEP" "Verificando dependências do sistema..."
    
    local missing_deps=()
    
    # Verificar comandos essenciais
    if ! command -v bash &> /dev/null; then
        missing_deps+=("bash")
    fi
    
    if ! command -v getprop &> /dev/null; then
        missing_deps+=("getprop")
    fi
    
    if ! command -v pm &> /dev/null; then
        missing_deps+=("pm")
    fi
    
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        log_message "ERROR" "Dependências faltando: ${missing_deps[*]}"
        log_message "ERROR" "Instale as dependências necessárias"
        exit 1
    fi
    
    log_message "SUCCESS" "Todas as dependências estão disponíveis!"
}

# Função de criação de diretórios
create_directories() {
    log_message "STEP" "Criando diretórios de instalação..."
    
    # Criar diretório principal
    if mkdir -p "$INSTALL_DIR" 2>/dev/null; then
        log_message "SUCCESS" "Diretório criado: $INSTALL_DIR"
    else
        log_message "ERROR" "Falha ao criar diretório: $INSTALL_DIR"
        exit 1
    fi
    
    # Criar subdiretórios
    mkdir -p "$INSTALL_DIR/logs" 2>/dev/null
    mkdir -p "$INSTALL_DIR/backups" 2>/dev/null
    mkdir -p "$INSTALL_DIR/scripts" 2>/dev/null
    
    log_message "SUCCESS" "Estrutura de diretórios criada!"
}

# Função de instalação dos scripts
install_scripts() {
    log_message "STEP" "Instalando scripts de otimização..."
    
    # Verificar se os arquivos existem no diretório atual
    if [[ ! -f "$SCRIPT_NAME" ]]; then
        log_message "ERROR" "Arquivo principal não encontrado: $SCRIPT_NAME"
        log_message "ERROR" "Execute este script no mesmo diretório dos arquivos"
        exit 1
    fi
    
    # Copiar script principal
    if cp "$SCRIPT_NAME" "$INSTALL_DIR/" 2>/dev/null; then
        log_message "SUCCESS" "Script principal instalado"
    else
        log_message "ERROR" "Falha ao instalar script principal"
        exit 1
    fi
    
    # Copiar validador (se existir)
    if [[ -f "$VALIDATOR_NAME" ]]; then
        if cp "$VALIDATOR_NAME" "$INSTALL_DIR/" 2>/dev/null; then
            log_message "SUCCESS" "Validador de performance instalado"
        else
            log_message "WARN" "Falha ao instalar validador"
        fi
    fi
    
    # Copiar README (se existir)
    if [[ -f "$README_NAME" ]]; then
        if cp "$README_NAME" "$INSTALL_DIR/" 2>/dev/null; then
            log_message "SUCCESS" "Documentação instalada"
        else
            log_message "WARN" "Falha ao instalar documentação"
        fi
    fi
    
    # Definir permissões de execução
    chmod +x "$INSTALL_DIR"/*.sh 2>/dev/null
    log_message "SUCCESS" "Permissões de execução definidas!"
}

# Função de criação de aliases
create_aliases() {
    log_message "STEP" "Criando aliases para fácil acesso..."
    
    # Criar alias no .bashrc (se existir)
    if [[ -f "/data/local/tmp/.bashrc" ]]; then
        echo "alias gaming-optimizer='bash $INSTALL_DIR/$SCRIPT_NAME'" >> "/data/local/tmp/.bashrc"
        echo "alias performance-test='bash $INSTALL_DIR/$VALIDATOR_NAME'" >> "/data/local/tmp/.bashrc"
        log_message "SUCCESS" "Aliases adicionados ao .bashrc"
    fi
    
    # Criar links simbólicos
    if ln -sf "$INSTALL_DIR/$SCRIPT_NAME" "/data/local/tmp/gaming-optimizer" 2>/dev/null; then
        log_message "SUCCESS" "Link simbólico criado: gaming-optimizer"
    fi
    
    if [[ -f "$INSTALL_DIR/$VALIDATOR_NAME" ]]; then
        if ln -sf "$INSTALL_DIR/$VALIDATOR_NAME" "/data/local/tmp/performance-test" 2>/dev/null; then
            log_message "SUCCESS" "Link simbólico criado: performance-test"
        fi
    fi
}

# Função de verificação de instalação
verify_installation() {
    log_message "STEP" "Verificando instalação..."
    
    local errors=0
    
    # Verificar se os arquivos foram instalados
    if [[ ! -f "$INSTALL_DIR/$SCRIPT_NAME" ]]; then
        log_message "ERROR" "Script principal não encontrado"
        errors=$((errors + 1))
    fi
    
    if [[ ! -x "$INSTALL_DIR/$SCRIPT_NAME" ]]; then
        log_message "ERROR" "Script principal sem permissão de execução"
        errors=$((errors + 1))
    fi
    
    # Verificar se o diretório é acessível
    if [[ ! -r "$INSTALL_DIR" ]]; then
        log_message "ERROR" "Diretório de instalação não é legível"
        errors=$((errors + 1))
    fi
    
    if [[ $errors -eq 0 ]]; then
        log_message "SUCCESS" "Instalação verificada com sucesso!"
        return 0
    else
        log_message "ERROR" "Instalação com $errors erro(s)"
        return 1
    fi
}

# Função de teste de instalação
test_installation() {
    log_message "STEP" "Testando instalação..."
    
    # Testar execução do script principal
    if bash "$INSTALL_DIR/$SCRIPT_NAME" --help &>/dev/null; then
        log_message "SUCCESS" "Script principal executado com sucesso!"
    else
        log_message "ERROR" "Falha ao executar script principal"
        return 1
    fi
    
    # Testar validador (se instalado)
    if [[ -f "$INSTALL_DIR/$VALIDATOR_NAME" ]]; then
        if bash "$INSTALL_DIR/$VALIDATOR_NAME" --help &>/dev/null; then
            log_message "SUCCESS" "Validador executado com sucesso!"
        else
            log_message "WARN" "Falha ao executar validador"
        fi
    fi
    
    return 0
}

# Função de criação de script de desinstalação
create_uninstaller() {
    log_message "STEP" "Criando script de desinstalação..."
    
    cat > "$INSTALL_DIR/uninstall.sh" << 'EOF'
#!/bin/bash

# =============================================================================
# SAMSUNG GALAXY S20 FE GAMING OPTIMIZER - DESINSTALADOR
# =============================================================================

echo "=== DESINSTALANDO GAMING OPTIMIZER ==="

# Remover links simbólicos
rm -f /data/local/tmp/gaming-optimizer
rm -f /data/local/tmp/performance-test

# Remover aliases do .bashrc
if [[ -f "/data/local/tmp/.bashrc" ]]; then
    sed -i '/gaming-optimizer/d' "/data/local/tmp/.bashrc"
    sed -i '/performance-test/d' "/data/local/tmp/.bashrc"
fi

# Remover diretório de instalação
rm -rf /data/local/tmp/gaming_optimizer

echo "Desinstalação concluída!"
echo "Recomenda-se reiniciar o dispositivo"
EOF
    
    chmod +x "$INSTALL_DIR/uninstall.sh"
    log_message "SUCCESS" "Script de desinstalação criado!"
}

# Função de exibição de instruções pós-instalação
show_post_install_instructions() {
    log_message "INFO" "=== INSTRUÇÕES PÓS-INSTALAÇÃO ==="
    echo ""
    echo -e "${CYAN}🎮 INSTALAÇÃO CONCLUÍDA COM SUCESSO! 🎮${NC}"
    echo ""
    echo "Seus scripts de otimização estão instalados em:"
    echo -e "${GREEN}$INSTALL_DIR${NC}"
    echo ""
    echo "=== COMO USAR ==="
    echo ""
    echo "1. OTIMIZAÇÃO COMPLETA:"
    echo -e "   ${GREEN}bash $INSTALL_DIR/$SCRIPT_NAME${NC}"
    echo ""
    echo "2. MONITOR DE PERFORMANCE:"
    echo -e "   ${GREEN}bash $INSTALL_DIR/$SCRIPT_NAME --monitor${NC}"
    echo ""
    echo "3. TESTE DE PERFORMANCE:"
    echo -e "   ${GREEN}bash $INSTALL_DIR/$VALIDATOR_NAME${NC}"
    echo ""
    echo "4. RESTAURAR CONFIGURAÇÕES:"
    echo -e "   ${GREEN}bash $INSTALL_DIR/$SCRIPT_NAME --restore${NC}"
    echo ""
    echo "=== ALIAS DISPONÍVEIS ==="
    echo -e "${GREEN}gaming-optimizer${NC}     # Otimização completa"
    echo -e "${GREEN}performance-test${NC}      # Teste de performance"
    echo ""
    echo "=== DESINSTALAÇÃO ==="
    echo -e "${GREEN}bash $INSTALL_DIR/uninstall.sh${NC}"
    echo ""
    echo "⚠️  IMPORTANTE:"
    echo "   - Execute a otimização com root (su)"
    echo "   - Faça backup antes de usar"
    echo "   - Use por conta e risco"
    echo ""
    echo "🚀 BOA SORTE NO ARENA BREAKOUT MOBILE! 🚀"
}

# Função principal de instalação
main_installation() {
    log_message "INFO" "=== INICIANDO INSTALAÇÃO DO GAMING OPTIMIZER ==="
    log_message "INFO" "Dispositivo: Samsung Galaxy S20 FE 5G"
    log_message "INFO" "Objetivo: Arena Breakout Mobile"
    
    # Executar todas as etapas de instalação
    check_root
    check_compatibility
    check_dependencies
    create_directories
    install_scripts
    create_aliases
    create_uninstaller
    
    # Verificar e testar instalação
    if verify_installation && test_installation; then
        log_message "SUCCESS" "=== INSTALAÇÃO CONCLUÍDA COM SUCESSO! ==="
        show_post_install_instructions
    else
        log_message "ERROR" "=== FALHA NA INSTALAÇÃO ==="
        log_message "ERROR" "Verifique os logs e tente novamente"
        exit 1
    fi
}

# Função de ajuda
show_help() {
    echo -e "${CYAN}=== SAMSUNG GALAXY S20 FE GAMING OPTIMIZER - INSTALADOR ===${NC}"
    echo ""
    echo "Uso: $0 [OPÇÃO]"
    echo ""
    echo "OPÇÕES:"
    echo "  --install      Executar instalação completa (PADRÃO)"
    echo "  --uninstall    Desinstalar o otimizador"
    echo "  --verify       Verificar instalação"
    echo "  --help         Mostrar esta ajuda"
    echo ""
    echo "EXEMPLOS:"
    echo "  $0                    # Instalação completa"
    echo "  $0 --uninstall       # Desinstalar"
    echo "  $0 --verify          # Verificar instalação"
    echo ""
    echo "⚠️  REQUISITOS:"
    echo "   - Root obrigatório"
    echo "   - Executar no diretório dos arquivos"
    echo "   - Android 11+ recomendado"
    echo ""
}

# Função de desinstalação
uninstall_optimizer() {
    log_message "INFO" "=== DESINSTALANDO GAMING OPTIMIZER ==="
    
    if [[ -f "$INSTALL_DIR/uninstall.sh" ]]; then
        bash "$INSTALL_DIR/uninstall.sh"
    else
        log_message "ERROR" "Script de desinstalação não encontrado"
        log_message "INFO" "Removendo manualmente..."
        
        # Remoção manual
        rm -f /data/local/tmp/gaming-optimizer
        rm -f /data/local/tmp/performance-test
        rm -rf "$INSTALL_DIR"
        
        log_message "SUCCESS" "Desinstalação manual concluída!"
    fi
}

# Função de verificação
verify_optimizer() {
    log_message "INFO" "=== VERIFICANDO INSTALAÇÃO ==="
    
    if verify_installation; then
        log_message "SUCCESS" "Instalação está funcionando corretamente!"
        show_post_install_instructions
    else
        log_message "ERROR" "Instalação com problemas detectados"
        log_message "INFO" "Execute: $0 --install para reinstalar"
    fi
}

# Função principal
main() {
    case "${1:---install}" in
        "--install")
            main_installation
            ;;
        "--uninstall")
            check_root
            uninstall_optimizer
            ;;
        "--verify")
            check_root
            verify_optimizer
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