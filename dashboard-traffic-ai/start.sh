#!/bin/bash

echo "🚀 Starting Dashboard Traffic AI..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale Node.js 18+ antes de continuar."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Por favor, instale npm antes de continuar."
    exit 1
fi

echo "✅ Node.js e npm encontrados"

# Setup backend
echo "📦 Instalando dependências do backend..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
fi

# Setup environment file
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "⚙️  Arquivo .env criado. Configure suas API Keys em backend/.env"
fi

echo "🔥 Iniciando servidor backend..."
npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Setup frontend
echo "📦 Instalando dependências do frontend..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    npm install
fi

echo "🎨 Iniciando servidor frontend..."
npm run dev &
FRONTEND_PID=$!

# Wait for servers to start
sleep 5

echo ""
echo "✅ Dashboard Traffic AI iniciado com sucesso!"
echo ""
echo "🌐 Acesse o dashboard em: http://localhost:3000"
echo "🔧 API Backend em: http://localhost:3001"
echo ""
echo "📋 Para parar os servidores:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "⚙️  Configure suas API Keys em: http://localhost:3000/settings"

# Keep the script running
wait