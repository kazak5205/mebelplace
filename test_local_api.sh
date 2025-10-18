#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 ЛОКАЛЬНОЕ ТЕСТИРОВАНИЕ API (localhost:8082)${NC}"
echo "=============================================="

# Создаем тестового пользователя
echo -e "${YELLOW}👤 Создаем тестового пользователя...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:8082/api/v2/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email_or_phone": "testuser'$(date +%s)'@example.com",
    "password": "TestPassword123!",
    "username": "testuser'$(date +%s)'"
  }')

TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.access_token // empty')

if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    echo -e "${GREEN}✅ Пользователь создан, токен получен${NC}"
else
    echo -e "${RED}❌ Не удалось создать пользователя${NC}"
    echo "$REGISTER_RESPONSE"
    exit 1
fi

# Счетчики
total_endpoints=0
working_endpoints=0
error_400=0
error_401=0
error_403=0
error_404=0
error_500=0
error_other=0

# Функция для проверки endpoint
check_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    local needs_auth=$5
    
    total_endpoints=$((total_endpoints + 1))
    
    if [ -n "$data" ]; then
        if [ "$needs_auth" = "true" ]; then
            status_code=$(curl -s -o /dev/null -w "%{http_code}" -X $method \
              -H "Content-Type: application/json" \
              -H "Authorization: Bearer $TOKEN" \
              -d "$data" \
              "http://localhost:8082/api/v2$endpoint")
        else
            status_code=$(curl -s -o /dev/null -w "%{http_code}" -X $method \
              -H "Content-Type: application/json" \
              -d "$data" \
              "http://localhost:8082/api/v2$endpoint")
        fi
    else
        if [ "$needs_auth" = "true" ]; then
            status_code=$(curl -s -o /dev/null -w "%{http_code}" -X $method \
              -H "Authorization: Bearer $TOKEN" \
              "http://localhost:8082/api/v2$endpoint")
        else
            status_code=$(curl -s -o /dev/null -w "%{http_code}" -X $method \
              "http://localhost:8082/api/v2$endpoint")
        fi
    fi
    
    if [ "$status_code" = "200" ] || [ "$status_code" = "201" ]; then
        echo -e "${GREEN}✅ $method $endpoint - $status_code (работает) - $description${NC}"
        working_endpoints=$((working_endpoints + 1))
    elif [ "$status_code" = "400" ]; then
        echo -e "${YELLOW}⚠️  $method $endpoint - 400 (валидация) - $description${NC}"
        error_400=$((error_400 + 1))
    elif [ "$status_code" = "401" ]; then
        echo -e "${YELLOW}🔐 $method $endpoint - 401 (нужна авторизация) - $description${NC}"
        error_401=$((error_401 + 1))
    elif [ "$status_code" = "403" ]; then
        echo -e "${YELLOW}🚫 $method $endpoint - 403 (доступ запрещен) - $description${NC}"
        error_403=$((error_403 + 1))
    elif [ "$status_code" = "404" ]; then
        echo -e "${RED}❌ $method $endpoint - 404 (не найден) - $description${NC}"
        error_404=$((error_404 + 1))
    elif [ "$status_code" = "500" ]; then
        echo -e "${RED}💥 $method $endpoint - 500 (ошибка сервера) - $description${NC}"
        error_500=$((error_500 + 1))
    else
        echo -e "${YELLOW}❓ $method $endpoint - $status_code - $description${NC}"
        error_other=$((error_other + 1))
    fi
}

echo -e "${BLUE}🔐 AUTH ENDPOINTS:${NC}"
check_endpoint "POST" "/auth/register" '{"email_or_phone":"test@example.com","password":"Test123!","username":"test"}' "Регистрация" "false"
check_endpoint "POST" "/auth/login" '{"email_or_phone":"test@example.com","password":"Test123!"}' "Вход" "false"
check_endpoint "POST" "/auth/verify-sms" '{"phone":"+77001234567","code":"123456"}' "Верификация SMS" "false"
check_endpoint "POST" "/auth/verify-email" '{"email":"test@example.com","code":"123456"}' "Верификация Email" "false"
check_endpoint "POST" "/auth/refresh" '{"refresh_token":"test"}' "Обновление токена" "false"
check_endpoint "POST" "/auth/logout" '{}' "Выход" "false"

echo -e "${BLUE}👤 USER ENDPOINTS:${NC}"
check_endpoint "GET" "/users/me" "" "Получить профиль" "true"
check_endpoint "GET" "/users/1" "" "Получить пользователя по ID" "false"
check_endpoint "PUT" "/users/me" '{"username":"updated_user_$(date +%s)"}' "Обновить профиль" "true"
check_endpoint "POST" "/users/me/avatar" '{}' "Загрузить аватар" "true"
check_endpoint "POST" "/users/1/block" '{}' "Заблокировать пользователя" "true"
check_endpoint "DELETE" "/users/1/block" "" "Разблокировать пользователя" "true"
check_endpoint "GET" "/users/blocked" "" "Получить заблокированных" "true"

echo -e "${BLUE}🎥 VIDEO ENDPOINTS:${NC}"
check_endpoint "GET" "/videos/feed" "" "Лента видео" "false"
check_endpoint "POST" "/videos/upload" '{}' "Загрузить видео" "true"
check_endpoint "POST" "/videos/1/like" '{}' "Лайкнуть видео" "true"
check_endpoint "POST" "/videos/1/unlike" '{}' "Убрать лайк" "true"
check_endpoint "GET" "/videos/1/comments" "" "Получить комментарии" "false"
check_endpoint "POST" "/videos/1/comments" '{"text":"test comment"}' "Добавить комментарий" "true"
check_endpoint "POST" "/videos/1/analyze" '{}' "Анализ видео" "true"

echo -e "${BLUE}💬 CHAT ENDPOINTS:${NC}"
check_endpoint "GET" "/chats" "" "Получить чаты" "true"
check_endpoint "POST" "/chats" '{"user_id":1}' "Создать чат" "true"
check_endpoint "GET" "/chats/1/messages" "" "Получить сообщения" "true"
check_endpoint "POST" "/chats/1/messages" '{"text":"test message"}' "Отправить сообщение" "true"

echo -e "${BLUE}📋 REQUEST ENDPOINTS:${NC}"
check_endpoint "GET" "/requests" "" "Получить запросы" "false"
check_endpoint "GET" "/requests/1" "" "Получить запрос по ID" "false"
check_endpoint "POST" "/requests" '{"title":"test request","description":"test"}' "Создать запрос" "true"
check_endpoint "GET" "/requests/1/proposals" "" "Получить предложения" "false"
check_endpoint "POST" "/requests/1/proposals" '{"price":1000,"description":"test proposal"}' "Создать предложение" "true"
check_endpoint "POST" "/requests/1/proposals/2/accept" '{}' "Принять предложение" "true"

echo -e "${BLUE}📺 CHANNEL ENDPOINTS:${NC}"
check_endpoint "GET" "/channels" "" "Получить каналы" "false"
check_endpoint "GET" "/channels/1/posts" "" "Получить посты канала" "false"
check_endpoint "POST" "/channels/1/subscribe" '{}' "Подписаться на канал" "true"
check_endpoint "POST" "/channels/1/unsubscribe" '{}' "Отписаться от канала" "true"
check_endpoint "POST" "/channels/1/posts" '{"title":"test post","content":"test"}' "Создать пост" "true"

echo -e "${BLUE}📝 WRITTEN CHANNEL ENDPOINTS:${NC}"
check_endpoint "GET" "/written-channels" "" "Получить письменные каналы" "false"
check_endpoint "POST" "/written-channels" '{"name":"test channel","description":"test"}' "Создать письменный канал" "true"
check_endpoint "POST" "/written-channels/1/subscribe" '{}' "Подписаться на письменный канал" "true"
check_endpoint "POST" "/written-channels/1/unsubscribe" '{}' "Отписаться от письменного канала" "true"
check_endpoint "GET" "/written-channels/1/posts" "" "Получить посты письменного канала" "false"
check_endpoint "POST" "/written-channels/1/posts" '{"title":"test post","content":"test"}' "Создать пост в письменном канале" "true"

echo -e "${BLUE}🔍 SEARCH ENDPOINTS:${NC}"
check_endpoint "GET" "/search" "?q=test" "Универсальный поиск" "false"
check_endpoint "GET" "/search/users" "?q=test" "Поиск пользователей" "false"
check_endpoint "GET" "/search/masters" "?q=test" "Поиск мастеров" "false"

echo -e "${BLUE}🔧 SYSTEM ENDPOINTS:${NC}"
check_endpoint "GET" "/ratelimit/status" "" "Статус rate limiting" "false"
check_endpoint "GET" "/metrics" "" "Prometheus метрики" "false"
check_endpoint "GET" "/health" "" "Health check" "false"
check_endpoint "GET" "/live" "" "Liveness check" "false"
check_endpoint "GET" "/ready" "" "Readiness check" "false"

echo -e "${BLUE}📊 ИТОГОВАЯ СТАТИСТИКА:${NC}"
echo "=============================================="
echo -e "📊 Всего endpoints: ${BLUE}$total_endpoints${NC}"
echo -e "✅ Работают (200/201): ${GREEN}$working_endpoints${NC}"
echo -e "💥 500 ошибки: ${RED}$error_500${NC}"
echo -e "❌ 404 ошибки: ${RED}$error_404${NC}"
echo -e "⚠️  400 ошибки: ${YELLOW}$error_400${NC}"
echo -e "🚫 403 ошибки: ${YELLOW}$error_403${NC}"
echo -e "🔐 401 ошибки: ${YELLOW}$error_401${NC}"
echo -e "❓ Другие ошибки: ${YELLOW}$error_other${NC}"

echo ""
echo -e "📈 ПРОЦЕНТЫ:"
if [ $total_endpoints -gt 0 ]; then
    working_percent=$((working_endpoints * 100 / total_endpoints))
    error_500_percent=$((error_500 * 100 / total_endpoints))
    error_404_percent=$((error_404 * 100 / total_endpoints))
    error_400_percent=$((error_400 * 100 / total_endpoints))
    error_403_percent=$((error_403 * 100 / total_endpoints))
    error_401_percent=$((error_401 * 100 / total_endpoints))
    
    echo -e "✅ Работают: ${GREEN}$working_percent%${NC}"
    echo -e "💥 500 ошибки: ${RED}$error_500_percent%${NC}"
    echo -e "❌ 404 ошибки: ${RED}$error_404_percent%${NC}"
    echo -e "⚠️  400 ошибки: ${YELLOW}$error_400_percent%${NC}"
    echo -e "🚫 403 ошибки: ${YELLOW}$error_403_percent%${NC}"
    echo -e "🔐 401 ошибки: ${YELLOW}$error_401_percent%${NC}"
fi

echo ""
echo -e "${GREEN}✅ ЛОКАЛЬНОЕ ТЕСТИРОВАНИЕ ЗАВЕРШЕНО!${NC}"
