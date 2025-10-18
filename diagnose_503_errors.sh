#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Диагностика 503 ошибок${NC}"
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
    
    if [ "$status_code" = "503" ]; then
        echo -e "${RED}❌ $method $endpoint - 503 (сервис недоступен) - $description${NC}"
        # Получаем детальную ошибку
        if [ -n "$data" ]; then
            response=$(curl -s -X $method -H "Authorization: Bearer $TOKEN" \
              -H "Content-Type: application/json" \
              -d "$data" \
              "https://mebelplace.com.kz/api/v2$endpoint")
        else
            response=$(curl -s -X $method -H "Authorization: Bearer $TOKEN" \
              "https://mebelplace.com.kz/api/v2$endpoint")
        fi
        echo "   Ответ: $response"
    elif [ "$status_code" = "200" ]; then
        echo -e "${GREEN}✅ $method $endpoint - 200 (работает) - $description${NC}"
    elif [ "$status_code" = "400" ]; then
        echo -e "${YELLOW}⚠️  $method $endpoint - 400 (валидация) - $description${NC}"
    elif [ "$status_code" = "404" ]; then
        echo -e "${RED}❌ $method $endpoint - 404 (не найден) - $description${NC}"
    elif [ "$status_code" = "500" ]; then
        echo -e "${RED}❌ $method $endpoint - 500 (ошибка сервера) - $description${NC}"
    else
        echo -e "${YELLOW}❓ $method $endpoint - $status_code - $description${NC}"
    fi
}

echo -e "${BLUE}🔔 Проверяем уведомления:${NC}"
check_endpoint "GET" "/notifications" "" "Получить уведомления"
check_endpoint "GET" "/notifications/settings" "" "Получить настройки"
check_endpoint "POST" "/notifications/settings" '{"email":true,"push":true}' "Обновить настройки"
check_endpoint "GET" "/notifications/templates" "" "Получить шаблоны"

echo -e "${BLUE}🎮 Проверяем геймификацию:${NC}"
check_endpoint "GET" "/gamification/achievements" "" "Получить достижения"
check_endpoint "GET" "/gamification/leaderboard" "" "Получить таблицу лидеров"
check_endpoint "POST" "/gamification/award-points" '{"user_id":1,"points":100,"reason":"Test"}' "Начислить очки"
check_endpoint "GET" "/gamification/levels" "" "Получить уровни"
check_endpoint "GET" "/gamification/rules" "" "Получить правила"

echo -e "${BLUE}📞 Проверяем звонки:${NC}"
check_endpoint "GET" "/calls" "" "Получить звонки"
check_endpoint "POST" "/calls/initiate" '{"recipient_id":1}' "Инициировать звонок"
check_endpoint "GET" "/calls/1/webrtc-token-enhanced" "" "Получить улучшенный WebRTC токен"
check_endpoint "POST" "/calls/validate-token" '{"token":"test_token"}' "Валидировать токен"

echo -e "${BLUE}🎯 Проверяем AR/3D модели:${NC}"
check_endpoint "POST" "/ar3d/models" '{"name":"Test Model","product_id":1,"model_url":"http://test.com/model.glb","model_type":"glb"}' "Создать 3D модель"
check_endpoint "GET" "/ar3d/models/product/1" "" "Получить модели продукта"
check_endpoint "GET" "/ar3d/models/search" "" "Поиск моделей"
check_endpoint "POST" "/ar3d/models/upload" '{"file":"test.glb"}' "Загрузить модель"
check_endpoint "GET" "/ar3d/models/1/render" "" "Рендерить модель"
check_endpoint "GET" "/ar3d/models/1/versions" "" "Получить версии модели"

echo -e "${BLUE}🗺️ Проверяем карты:${NC}"
check_endpoint "POST" "/maps/location" '{"latitude":43.2220,"longitude":76.8512}' "Установить локацию"
check_endpoint "GET" "/maps/geo-objects?lat=43.2220&lng=76.8512" "" "Получить геообъекты"
check_endpoint "POST" "/maps/geo-objects" '{"name":"Test Object","latitude":43.2220,"longitude":76.8512}' "Создать геообъект"
check_endpoint "POST" "/maps/geo-objects/1/verify" "" "Верифицировать геообъект"

echo -e "${BLUE}🔧 Проверяем интеграции:${NC}"
check_endpoint "POST" "/integrations/payments/connect" '{"provider":"stripe"}' "Подключить платежи"
check_endpoint "GET" "/integrations/payments/providers" "" "Получить провайдеров"
check_endpoint "POST" "/integrations/messengers/whatsapp/send" '{"phone":"+77001234567","message":"Test"}' "Отправить WhatsApp"
check_endpoint "POST" "/integrations/messengers/telegram/send" '{"chat_id":"123","message":"Test"}' "Отправить Telegram"

echo -e "${BLUE}🎁 Проверяем рефералы:${NC}"
check_endpoint "POST" "/referrals/apply" '{"code":"TEST123"}' "Применить реферальный код"
check_endpoint "POST" "/referrals/generate" "" "Сгенерировать реферальный код"

echo -e "${BLUE}📺 Проверяем live стриминг:${NC}"
check_endpoint "POST" "/livestreams/start" '{"title":"Test Stream"}' "Начать стрим"
check_endpoint "POST" "/livestreams/1/end" "" "Завершить стрим"
check_endpoint "POST" "/livestreams/1/donate" '{"amount":1000,"message":"Great stream!"}' "Донат на стрим"

echo -e "${BLUE}🎵 Проверяем голосовые комнаты:${NC}"
check_endpoint "POST" "/voicerooms/create" '{"name":"Test Room"}' "Создать голосовую комнату"
check_endpoint "GET" "/voicerooms/1" "" "Получить голосовую комнату"
check_endpoint "POST" "/voicerooms/1/join" "" "Присоединиться к комнате"
check_endpoint "POST" "/voicerooms/1/record" "" "Начать запись"

echo -e "${BLUE}📊 Проверяем аналитику:${NC}"
check_endpoint "GET" "/analytics/user" "" "Получить аналитику пользователя"
check_endpoint "GET" "/analytics/platform" "" "Получить аналитику платформы"
check_endpoint "GET" "/analytics/engagement" "" "Получить аналитику вовлеченности"
check_endpoint "GET" "/analytics/videos/1/heatmap" "" "Получить тепловую карту видео"

echo -e "${BLUE}🛡️ Проверяем модерацию:${NC}"
check_endpoint "POST" "/moderation/videos/1/approve" "" "Одобрить видео"
check_endpoint "POST" "/moderation/videos/1/reject" "" "Отклонить видео"
check_endpoint "GET" "/moderation/comments" "" "Получить комментарии для модерации"
check_endpoint "POST" "/moderation/comments/1/approve" "" "Одобрить комментарий"
check_endpoint "GET" "/moderation/streams" "" "Получить стримы для модерации"

echo -e "${BLUE}👑 Проверяем администрирование:${NC}"
check_endpoint "PATCH" "/admin/support/tickets/1" '{"status":"resolved"}' "Обновить тикет"
check_endpoint "PUT" "/admin/users/1/role" '{"role":"moderator"}' "Изменить роль"
check_endpoint "POST" "/admin/users/1/suspend" '{"reason":"Test suspend","duration":24}' "Приостановить пользователя"

echo -e "${BLUE}👥 Проверяем групповые чаты:${NC}"
check_endpoint "POST" "/group-chats" '{"name":"Test Group","description":"Test group chat"}' "Создать групповой чат"
check_endpoint "GET" "/group-chats" "" "Получить групповые чаты"
check_endpoint "POST" "/group-chats/1/members" '{"user_id":1}' "Добавить участника"
check_endpoint "GET" "/group-chats/1/members" "" "Получить участников"
check_endpoint "POST" "/group-chats/1/messages" '{"content":"Test message"}' "Отправить сообщение"

echo -e "${BLUE}📝 Проверяем письменные каналы:${NC}"
check_endpoint "GET" "/written-channels" "" "Получить письменные каналы"
check_endpoint "POST" "/written-channels" '{"name":"Test Channel","description":"Test written channel"}' "Создать письменный канал"
check_endpoint "POST" "/written-channels/1/subscribe" "" "Подписаться на письменный канал"
check_endpoint "GET" "/written-channels/1/posts" "" "Получить посты"

echo -e "${BLUE}📖 Проверяем истории:${NC}"
check_endpoint "POST" "/stories" '{"content":"Test story"}' "Создать историю"
check_endpoint "POST" "/stories/1/view" "" "Просмотреть историю"
check_endpoint "POST" "/stories/1/like" "" "Лайкнуть историю"

echo -e "${GREEN}✅ Диагностика завершена!${NC}"
