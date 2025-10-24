#!/bin/bash

# Скрипт для проверки внутренних эндпоинтов (прямое обращение к backend)
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "========================================="
echo "Проверка ВНУТРЕННИХ эндпоинтов"
echo "========================================="
echo ""

# Проверяем доступность backend контейнера
echo "Проверяем backend контейнер..."
BACKEND_CONTAINER=$(docker ps --filter "name=backend" --format "{{.Names}}" | head -1)
if [ -z "$BACKEND_CONTAINER" ]; then
    BACKEND_CONTAINER=$(docker ps --filter "name=server" --format "{{.Names}}" | head -1)
fi

if [ -z "$BACKEND_CONTAINER" ]; then
    echo -e "${RED}Backend контейнер не найден!${NC}"
    echo "Проверяем запущенные контейнеры:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    exit 1
fi

echo -e "${GREEN}Найден backend контейнер: $BACKEND_CONTAINER${NC}"
echo ""

# Получаем порт backend
BACKEND_PORT=$(docker port $BACKEND_CONTAINER 2>/dev/null | grep "3001" | cut -d: -f2 | head -1)
if [ -z "$BACKEND_PORT" ]; then
    BACKEND_PORT="3001"
fi

echo -e "${BLUE}Backend порт: $BACKEND_PORT${NC}"
echo ""

# Функция для проверки эндпоинта через docker exec
check_internal_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    
    echo -n "[$method] $endpoint - $description: "
    
    if [ "$method" = "GET" ]; then
        response=$(docker exec $BACKEND_CONTAINER curl -s -o /dev/null -w "%{http_code}" "http://localhost:3001$endpoint" 2>/dev/null)
    elif [ "$method" = "POST" ]; then
        response=$(docker exec $BACKEND_CONTAINER curl -s -o /dev/null -w "%{http_code}" -H "Content-Type: application/json" -d "$data" -X POST "http://localhost:3001$endpoint" 2>/dev/null)
    elif [ "$method" = "PUT" ]; then
        response=$(docker exec $BACKEND_CONTAINER curl -s -o /dev/null -w "%{http_code}" -H "Content-Type: application/json" -d "$data" -X PUT "http://localhost:3001$endpoint" 2>/dev/null)
    elif [ "$method" = "DELETE" ]; then
        response=$(docker exec $BACKEND_CONTAINER curl -s -o /dev/null -w "%{http_code}" -X DELETE "http://localhost:3001$endpoint" 2>/dev/null)
    fi
    
    if [ -z "$response" ]; then
        echo -e "${RED}✗ NO RESPONSE${NC}"
        return
    fi
    
    if [ "$response" = "200" ] || [ "$response" = "201" ]; then
        echo -e "${GREEN}✓ $response${NC}"
    elif [ "$response" = "400" ] || [ "$response" = "401" ] || [ "$response" = "403" ]; then
        echo -e "${YELLOW}⚠ $response (expected)${NC}"
    elif [ "$response" = "404" ]; then
        echo -e "${RED}✗ $response (NOT FOUND)${NC}"
    elif [ "$response" = "503" ]; then
        echo -e "${RED}✗ $response (SERVICE UNAVAILABLE)${NC}"
    else
        echo -e "${RED}✗ $response${NC}"
    fi
}

echo "=== HEALTH CHECK ==="
check_internal_endpoint "GET" "/api/health" "Health check"

echo ""
echo "=== AUTH ENDPOINTS ==="
check_internal_endpoint "POST" "/api/auth/register" "Register" '{"phone":"+77771234567","username":"testuser2","password":"test123"}'
check_internal_endpoint "POST" "/api/auth/login" "Login" '{"phone":"+77001234567","password":"test123"}'
check_internal_endpoint "POST" "/api/auth/refresh" "Refresh token" '{"refreshToken":"dummy"}'
check_internal_endpoint "GET" "/api/auth/me" "Get current user"
check_internal_endpoint "POST" "/api/auth/logout" "Logout" '{}'

echo ""
echo "=== VIDEO ENDPOINTS ==="
check_internal_endpoint "GET" "/api/videos/feed" "Get video feed"
check_internal_endpoint "GET" "/api/videos/1" "Get single video"
check_internal_endpoint "GET" "/api/videos/1/comments" "Get comments"
check_internal_endpoint "POST" "/api/videos/1/view" "Record view" '{}'

echo ""
echo "=== SEARCH ENDPOINTS ==="
check_internal_endpoint "GET" "/api/search?q=test" "Search"

echo ""
echo "=== ORDER ENDPOINTS ==="
check_internal_endpoint "GET" "/api/orders/categories" "Get categories"
check_internal_endpoint "GET" "/api/orders/regions" "Get regions"

echo ""
echo "=== PUSH ENDPOINTS ==="
check_internal_endpoint "GET" "/api/push/vapid-key" "Get VAPID key"

echo ""
echo "=== Проверка логов backend ==="
echo -e "${BLUE}Последние 20 строк логов:${NC}"
docker logs $BACKEND_CONTAINER --tail 20 2>&1 | tail -20

echo ""
echo "========================================="
echo "Внутренняя проверка завершена"
echo "========================================="

