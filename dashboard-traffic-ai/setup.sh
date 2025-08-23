#!/bin/bash

echo "🚀 Iniciando setup do Dashboard Traffic AI..."
echo ""

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js 18+ primeiro."
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"

# Verificar se o npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Por favor, instale o npm primeiro."
    exit 1
fi

echo "✅ npm encontrado: $(npm --version)"
echo ""

# Setup do Backend
echo "📦 Configurando Backend..."
cd backend

if [ ! -d "node_modules" ]; then
    echo "Instalando dependências do backend..."
    npm install
else
    echo "Dependências do backend já instaladas."
fi

# Criar arquivo .env se não existir
if [ ! -f ".env" ]; then
    echo "Criando arquivo .env..."
    cp .env.example .env
    echo "✅ Arquivo .env criado. Edite-o com suas API keys."
else
    echo "✅ Arquivo .env já existe."
fi

cd ..

# Setup do Frontend
echo ""
echo "📦 Configurando Frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "Instalando dependências do frontend..."
    npm install
else
    echo "Dependências do frontend já instaladas."
fi

cd ..

echo ""
echo "🎉 Setup concluído!"
echo ""
echo "📋 Próximos passos:"
echo "1. Edite o arquivo backend/.env com suas API keys"
echo "2. Execute 'cd backend && npm run dev' para iniciar o servidor"
echo "3. Execute 'cd frontend && npm run dev' para iniciar o frontend"
echo "4. Acesse http://localhost:3000 no seu navegador"
echo ""
echo "🔧 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo "   API Health: http://localhost:3001/api/health"
echo ""
echo "📚 Documentação: README.md"
echo ""