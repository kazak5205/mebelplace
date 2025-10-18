#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Исправление 404 ошибок${NC}"
echo "=================================="

# Создаем пользователя и получаем токен
echo -e "${YELLOW}👤 Создаем тестового пользователя...${NC}"
USER_RESPONSE=$(curl -s -X POST https://mebelplace.com.kz/api/v2/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email_or_phone": "+7700'$(date +%s)'",
    "password": "TestPassword123!",
    "username": "testuser'$(date +%s)'"
  }')

TOKEN=$(echo $USER_RESPONSE | jq -r '.access_token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Не удалось получить токен авторизации${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Пользователь создан, токен получен${NC}"

# Функция для проверки endpoint
check_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    if [ -n "$data" ]; then
        status_code=$(curl -s -o /dev/null -w "%{http_code}" -X $method -H "Authorization: Bearer $TOKEN" \
          -H "Content-Type: application/json" \
          -d "$data" \
          "https://mebelplace.com.kz/api/v2$endpoint")
    else
        status_code=$(curl -s -o /dev/null -w "%{http_code}" -X $method -H "Authorization: Bearer $TOKEN" \
          "https://mebelplace.com.kz/api/v2$endpoint")
    fi
    
    if [ "$status_code" = "404" ]; then
        echo -e "${RED}❌ $method $endpoint - 404 (не найден) - $description${NC}"
        return 1
    elif [ "$status_code" = "200" ]; then
        echo -e "${GREEN}✅ $method $endpoint - 200 (работает) - $description${NC}"
        return 0
    elif [ "$status_code" = "400" ]; then
        echo -e "${YELLOW}⚠️  $method $endpoint - 400 (валидация) - $description${NC}"
        return 0
    elif [ "$status_code" = "500" ]; then
        echo -e "${RED}❌ $method $endpoint - 500 (ошибка сервера) - $description${NC}"
        return 1
    else
        echo -e "${YELLOW}❓ $method $endpoint - $status_code - $description${NC}"
        return 0
    fi
}

echo -e "${BLUE}📞 Проверяем звонки (404 ошибки):${NC}"
check_endpoint "GET" "/calls/1/webrtc-token-enhanced" "" "Получить улучшенный WebRTC токен"
check_endpoint "POST" "/calls/1/end" "" "Завершить звонок"
check_endpoint "POST" "/calls/1/cancel" "" "Отменить звонок"
check_endpoint "GET" "/calls/1/webrtc-token" "" "Получить WebRTC токен"
check_endpoint "POST" "/calls/1/webrtc-signal" '{"signal":"test"}' "WebRTC сигнал"
check_endpoint "POST" "/calls/1/notify" '{"message":"test"}' "Уведомить о звонке"

echo -e "${BLUE}🎯 Проверяем AR/3D модели (404 ошибки):${NC}"
check_endpoint "GET" "/ar3d/models/1/render" "" "Рендерить модель"
check_endpoint "GET" "/ar3d/models/1/preview" "" "Предпросмотр модели"
check_endpoint "POST" "/ar3d/models/1/versions/1/activate" "" "Активировать версию"

echo -e "${BLUE}📺 Проверяем live стримы (404 ошибки):${NC}"
check_endpoint "GET" "/livestreams/1/viewers" "" "Получить зрителей"
check_endpoint "POST" "/livestreams/1/join" "" "Присоединиться к стриму"
check_endpoint "POST" "/livestreams/1/leave" "" "Покинуть стрим"

echo -e "${BLUE}🎵 Проверяем голосовые комнаты (404 ошибки):${NC}"
check_endpoint "GET" "/voicerooms/1" "" "Получить голосовую комнату"
check_endpoint "POST" "/voicerooms/1/leave" "" "Покинуть комнату"
check_endpoint "POST" "/voicerooms/1/record" "" "Начать запись"
check_endpoint "POST" "/voicerooms/1/stop-record" "" "Остановить запись"
check_endpoint "GET" "/voicerooms/1/participants" "" "Получить участников"
check_endpoint "GET" "/voicerooms/1/recordings" "" "Получить записи"

echo -e "${BLUE}🔧 Проверяем интеграции (404 ошибки):${NC}"
check_endpoint "POST" "/integrations/crm/sync" '{"provider":"salesforce"}' "Синхронизировать CRM"

echo -e "${BLUE}📊 Проверяем аналитику (404 ошибки):${NC}"
check_endpoint "GET" "/analytics/videos/1/engagement" "" "Получить вовлеченность видео"
check_endpoint "GET" "/analytics/users/1/behavior" "" "Получить поведение пользователя"

echo -e "${BLUE}🛡️ Проверяем модерацию (404 ошибки):${NC}"
check_endpoint "GET" "/moderation/reports" "" "Получить жалобы"
check_endpoint "POST" "/moderation/reports" '{"type":"spam","target_id":1}' "Создать жалобу"
check_endpoint "POST" "/moderation/reports/1/resolve" '{"action":"warn"}' "Разрешить жалобу"

echo -e "${GREEN}✅ Проверка 404 ошибок завершена!${NC}"
