#!/bin/bash

# Скрипт для запуска всего проекта MebelPlace
# Использование: ./scripts/start-all.sh [--clean-db]

set -e  # Останавливаться при ошибках

echo "🚀 MebelPlace Startup Script"
echo "=============================="

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Переходим в корень проекта
cd "$(dirname "$0")/.."
PROJECT_ROOT=$(pwd)

echo -e "${YELLOW}📍 Project root: ${PROJECT_ROOT}${NC}"

# Функция для проверки успешности команды
check_success() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1 failed${NC}"
        exit 1
    fi
}

# Проверяем наличие .env файлов
echo ""
echo "🔍 Checking environment files..."

if [ ! -f "${PROJECT_ROOT}/server/.env" ]; then
    echo -e "${YELLOW}⚠️  server/.env not found, copying from env.example${NC}"
    cp "${PROJECT_ROOT}/server/env.example" "${PROJECT_ROOT}/server/.env" 2>/dev/null || \
    cp "${PROJECT_ROOT}/server/env.production" "${PROJECT_ROOT}/server/.env" 2>/dev/null || \
    echo -e "${RED}❌ No .env template found${NC}"
fi

# Очистка БД если указан флаг
if [ "$1" == "--clean-db" ]; then
    echo ""
    echo "🗑️  Cleaning database..."
    
    # Загружаем переменные окружения
    if [ -f "${PROJECT_ROOT}/server/.env" ]; then
        export $(cat "${PROJECT_ROOT}/server/.env" | grep -v '^#' | xargs)
    fi
    
    # Выполняем SQL скрипт очистки
    PGPASSWORD=${DB_PASSWORD:-postgres} psql -h ${DB_HOST:-localhost} -U ${DB_USER:-postgres} -d ${DB_NAME:-mebelplace} -f "${PROJECT_ROOT}/scripts/clean-database.sql"
    check_success "Database cleaned"
fi

# Останавливаем старые процессы
echo ""
echo "🛑 Stopping old processes..."
pkill -f "node.*server/index.js" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
sleep 2
check_success "Old processes stopped"

# Устанавливаем зависимости для сервера
echo ""
echo "📦 Installing server dependencies..."
cd "${PROJECT_ROOT}/server"
npm install --production=false
check_success "Server dependencies installed"

# Устанавливаем зависимости для клиента
echo ""
echo "📦 Installing client dependencies..."
cd "${PROJECT_ROOT}/client"
npm install
check_success "Client dependencies installed"

# Создаём необходимые директории для загрузок
echo ""
echo "📁 Creating upload directories..."
cd "${PROJECT_ROOT}/server"
mkdir -p uploads/videos
mkdir -p uploads/order-photos
mkdir -p uploads/chat-files
mkdir -p uploads/avatars
mkdir -p logs
check_success "Upload directories created"

# Запускаем бэкенд
echo ""
echo "🚀 Starting backend server..."
cd "${PROJECT_ROOT}/server"

# Проверяем наличие PM2
if command -v pm2 &> /dev/null; then
    echo "Using PM2 for process management"
    pm2 delete mebelplace-server 2>/dev/null || true
    pm2 start index.js --name mebelplace-server --watch --ignore-watch="node_modules uploads logs"
    check_success "Backend started with PM2"
else
    echo "PM2 not found, starting with nohup"
    nohup node index.js > logs/server.log 2>&1 &
    SERVER_PID=$!
    echo "Backend PID: $SERVER_PID"
    sleep 3
    
    # Проверяем, что процесс запустился
    if ps -p $SERVER_PID > /dev/null; then
        check_success "Backend started"
    else
        echo -e "${RED}❌ Backend failed to start. Check logs/server.log${NC}"
        exit 1
    fi
fi

# Запускаем фронтенд
echo ""
echo "🎨 Starting frontend..."
cd "${PROJECT_ROOT}/client"

# Проверяем режим
if [ "$2" == "--dev" ] || [ "$1" == "--dev" ]; then
    echo "Starting in development mode..."
    npm run dev &
    FRONTEND_PID=$!
    echo "Frontend PID: $FRONTEND_PID"
else
    echo "Building for production..."
    npm run build
    check_success "Frontend built"
    
    # Для production фронтенд раздаётся через nginx
    echo -e "${YELLOW}ℹ️  Frontend built. Serve dist/ folder with nginx${NC}"
fi

# Ждём несколько секунд для инициализации
echo ""
echo "⏳ Waiting for services to initialize..."
sleep 5

# Проверяем работу бэкенда
echo ""
echo "🔍 Checking backend health..."
BACKEND_URL="http://localhost:3001"

for i in {1..10}; do
    if curl -sf "${BACKEND_URL}/api/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is healthy!${NC}"
        break
    else
        if [ $i -eq 10 ]; then
            echo -e "${RED}❌ Backend health check failed${NC}"
            echo "Check server logs: tail -f ${PROJECT_ROOT}/server/logs/server.log"
            exit 1
        fi
        echo "Waiting for backend... ($i/10)"
        sleep 2
    fi
done

# Финальная информация
echo ""
echo "=============================="
echo -e "${GREEN}🎉 MebelPlace started successfully!${NC}"
echo "=============================="
echo ""
echo "📊 Service URLs:"
echo "  🔧 Backend API:  http://localhost:3001/api"
echo "  🌐 Frontend:     http://localhost:5173 (dev) or https://mebelplace.com.kz (prod)"
echo "  🏥 Health check: http://localhost:3001/api/health"
echo ""
echo "📝 Logs:"
echo "  Server: tail -f ${PROJECT_ROOT}/server/logs/server.log"
if command -v pm2 &> /dev/null; then
    echo "  PM2: pm2 logs mebelplace-server"
fi
echo ""
echo "🛑 To stop:"
if command -v pm2 &> /dev/null; then
    echo "  pm2 stop mebelplace-server"
else
    echo "  pkill -f 'node.*server/index.js'"
fi
echo "  pkill -f 'vite'"
echo ""

# Тестовые пользователи
echo "👥 Test users (password: password123):"
echo "  Admin:  admin@mebelplace.kz"
echo "  Master: master1@mebelplace.kz"
echo "  User:   user1@mebelplace.kz"
echo ""

