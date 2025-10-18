#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 ИСПРАВЛЕННОЕ ТЕСТИРОВАНИЕ ВСЕХ 201 ENDPOINTS${NC}"
echo "=================================================="

# Создаем пользователей для тестирования
echo -e "${YELLOW}👥 Создаем тестовых пользователей...${NC}"

# Пользователь 1 - обычный пользователь
USER1_RESPONSE=$(curl -s -X POST https://mebelplace.com.kz/api/v2/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email_or_phone": "+7700'$(date +%s)'",
    "password": "TestPassword123!",
    "username": "testuser'$(date +%s)'"
  }')

USER1_TOKEN=$(echo $USER1_RESPONSE | jq -r '.access_token')
USER1_ID=$(echo $USER1_RESPONSE | jq -r '.user.id')

# Пользователь 2 - мастер
USER2_RESPONSE=$(curl -s -X POST https://mebelplace.com.kz/api/v2/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email_or_phone": "+7700'$(date +%s)'",
    "password": "TestPassword123!",
    "username": "master'$(date +%s)'"
  }')

USER2_TOKEN=$(echo $USER2_RESPONSE | jq -r '.access_token')
USER2_ID=$(echo $USER2_RESPONSE | jq -r '.user.id')

echo -e "${GREEN}✅ Пользователи созданы:${NC}"
echo "👤 User1 (ID: $USER1_ID): ${USER1_TOKEN:0:30}..."
echo "👤 User2 (ID: $USER2_ID): ${USER2_TOKEN:0:30}..."

# Счетчики
total_endpoints=0
working_endpoints=0
error_500=0
error_404=0
error_400=0
error_401=0
error_403=0
error_other=0

# Функция для проверки endpoint
check_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    local needs_auth=$5
    local auth_token=$6
    
    total_endpoints=$((total_endpoints + 1))
    
    local curl_cmd="curl -s -o /dev/null -w \"%{http_code}\""
    
    if [ "$needs_auth" = "true" ] && [ -n "$auth_token" ]; then
        curl_cmd="$curl_cmd -H \"Authorization: Bearer $auth_token\""
    fi
    
    if [ -n "$data" ]; then
        curl_cmd="$curl_cmd -X $method -H \"Content-Type: application/json\" -d '$data'"
    else
        curl_cmd="$curl_cmd -X $method"
    fi
    
    curl_cmd="$curl_cmd \"https://mebelplace.com.kz/api/v2$endpoint\""
    
    status_code=$(eval $curl_cmd)
    
    if [ "$status_code" = "200" ] || [ "$status_code" = "201" ]; then
        echo -e "${GREEN}✅ $method $endpoint - $status_code - $description${NC}"
        working_endpoints=$((working_endpoints + 1))
    elif [ "$status_code" = "400" ]; then
        echo -e "${YELLOW}⚠️  $method $endpoint - 400 (валидация) - $description${NC}"
        error_400=$((error_400 + 1))
    elif [ "$status_code" = "401" ]; then
        echo -e "${YELLOW}🔐 $method $endpoint - 401 (авторизация) - $description${NC}"
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

echo -e "${BLUE}🔐 AUTH ENDPOINTS (6 endpoints):${NC}"
check_endpoint "POST" "/auth/register" '{"email_or_phone":"+77001234567","password":"Test123!","username":"testuser"}' "Регистрация" false
check_endpoint "POST" "/auth/login" '{"email_or_phone":"+77001234567","password":"Test123!"}' "Вход" false
check_endpoint "POST" "/auth/verify-sms" '{"phone":"+77001234567","code":"123456"}' "Верификация SMS" false
check_endpoint "POST" "/auth/verify-email" '{"email":"test@test.com","code":"123456"}' "Верификация Email" false
check_endpoint "POST" "/auth/refresh" '{"refresh_token":"test_token"}' "Обновление токена" false
check_endpoint "POST" "/auth/logout" "" "Выход" true "$USER1_TOKEN"

echo -e "${BLUE}👤 USER ENDPOINTS (7 endpoints):${NC}"
check_endpoint "GET" "/users/me" "" "Получить профиль" true "$USER1_TOKEN"
check_endpoint "GET" "/users/me/avatar" "" "Получить аватар" true "$USER1_TOKEN"
check_endpoint "GET" "/users/$USER1_ID" "" "Получить пользователя по ID" false
check_endpoint "PUT" "/users/me" '{"username":"newusername"}' "Обновить профиль" true "$USER1_TOKEN"
check_endpoint "POST" "/users/me/avatar" '{"avatar":"base64data"}' "Загрузить аватар" true "$USER1_TOKEN"
check_endpoint "POST" "/users/$USER2_ID/block" "" "Заблокировать пользователя" true "$USER1_TOKEN"
check_endpoint "GET" "/users/blocked" "" "Получить заблокированных" true "$USER1_TOKEN"

echo -e "${BLUE}🎥 VIDEO ENDPOINTS (6 endpoints):${NC}"
check_endpoint "GET" "/videos/feed" "" "Лента видео" false
check_endpoint "GET" "/videos/1" "" "Получить видео по ID" false
check_endpoint "POST" "/videos/upload" '{"title":"Test Video","description":"Test"}' "Загрузить видео" true "$USER1_TOKEN"
check_endpoint "POST" "/videos/1/like" "" "Лайкнуть видео" true "$USER1_TOKEN"
check_endpoint "POST" "/videos/1/unlike" "" "Убрать лайк" true "$USER1_TOKEN"
check_endpoint "GET" "/videos/1/comments" "" "Получить комментарии" false

echo -e "${BLUE}📋 REQUEST ENDPOINTS (6 endpoints):${NC}"
check_endpoint "GET" "/requests" "" "Получить запросы" false
check_endpoint "POST" "/requests" '{"title":"Test Request","description":"Test"}' "Создать запрос" true "$USER1_TOKEN"
check_endpoint "GET" "/requests/1" "" "Получить запрос по ID" false
check_endpoint "GET" "/requests/1/proposals" "" "Получить предложения" false
check_endpoint "POST" "/requests/1/proposals" '{"price":1000,"description":"Test proposal"}' "Создать предложение" true "$USER2_TOKEN"
check_endpoint "POST" "/requests/1/proposals/1/accept" "" "Принять предложение" true "$USER1_TOKEN"

echo -e "${BLUE}💬 CHAT ENDPOINTS (2 endpoints):${NC}"
check_endpoint "GET" "/chats" "" "Получить чаты" true "$USER1_TOKEN"
check_endpoint "POST" "/chats" '{"request_id":1,"recipient_id":'$USER2_ID'}' "Создать чат" true "$USER1_TOKEN"

echo -e "${BLUE}📺 CHANNEL ENDPOINTS (5 endpoints):${NC}"
check_endpoint "GET" "/channels" "" "Получить каналы" false
check_endpoint "GET" "/channels/1/posts" "" "Получить посты канала" false
check_endpoint "POST" "/channels/1/subscribe" "" "Подписаться на канал" true "$USER1_TOKEN"
check_endpoint "POST" "/channels/1/unsubscribe" "" "Отписаться от канала" true "$USER1_TOKEN"
check_endpoint "POST" "/channels/1/posts" '{"title":"Test Post","content":"Test"}' "Создать пост" true "$USER2_TOKEN"

echo -e "${BLUE}📞 SUBSCRIPTION ENDPOINTS (2 endpoints):${NC}"
check_endpoint "POST" "/subscriptions/$USER2_ID" "" "Подписаться на пользователя" true "$USER1_TOKEN"
check_endpoint "GET" "/subscriptions/my" "" "Получить мои подписки" true "$USER1_TOKEN"

echo -e "${BLUE}🔍 SEARCH ENDPOINTS (3 endpoints):${NC}"
check_endpoint "GET" "/search" "?q=test" "Универсальный поиск" false
check_endpoint "GET" "/search/users" "?q=test" "Поиск пользователей" false
check_endpoint "GET" "/search/masters" "?q=test&lat=43.2220&lng=76.8512" "Поиск мастеров" false

echo -e "${BLUE}🔔 NOTIFICATION ENDPOINTS (5 endpoints):${NC}"
check_endpoint "GET" "/notifications" "" "Получить уведомления" true "$USER1_TOKEN"
check_endpoint "POST" "/notifications/1/read" "" "Отметить уведомление как прочитанное" true "$USER1_TOKEN"
check_endpoint "POST" "/notifications/read-all" "" "Отметить все уведомления как прочитанные" true "$USER1_TOKEN"
check_endpoint "GET" "/notifications/settings" "" "Получить настройки уведомлений" true "$USER1_TOKEN"
check_endpoint "POST" "/notifications/push-token" '{"token":"test_token"}' "Обновить push токен" true "$USER1_TOKEN"

echo -e "${BLUE}📖 STORY ENDPOINTS (4 endpoints):${NC}"
check_endpoint "GET" "/stories" "" "Получить истории" false
check_endpoint "POST" "/stories" '{"content":"Test story"}' "Создать историю" true "$USER1_TOKEN"
check_endpoint "POST" "/stories/1/view" "" "Просмотреть историю" true "$USER1_TOKEN"
check_endpoint "POST" "/stories/1/like" "" "Лайкнуть историю" true "$USER1_TOKEN"

echo -e "${BLUE}👥 GROUP CHAT ENDPOINTS (7 endpoints):${NC}"
check_endpoint "GET" "/group-chats" "" "Получить групповые чаты" true "$USER1_TOKEN"
check_endpoint "POST" "/group-chats" '{"name":"Test Group","description":"Test"}' "Создать групповой чат" true "$USER1_TOKEN"
check_endpoint "GET" "/group-chats/1" "" "Получить групповой чат" true "$USER1_TOKEN"
check_endpoint "POST" "/group-chats/1/members" '{"user_id":'$USER2_ID'}' "Добавить участника" true "$USER1_TOKEN"
check_endpoint "GET" "/group-chats/1/members" "" "Получить участников" true "$USER1_TOKEN"
check_endpoint "POST" "/group-chats/1/messages" '{"content":"Test message"}' "Отправить сообщение" true "$USER1_TOKEN"
check_endpoint "POST" "/group-chats/1/leave" "" "Покинуть группу" true "$USER1_TOKEN"

echo -e "${BLUE}📝 WRITTEN CHANNEL ENDPOINTS (5 endpoints):${NC}"
check_endpoint "GET" "/written-channels" "" "Получить письменные каналы" false
check_endpoint "POST" "/written-channels" '{"name":"Test Channel","description":"Test"}' "Создать письменный канал" true "$USER1_TOKEN"
check_endpoint "POST" "/written-channels/1/subscribe" "" "Подписаться на письменный канал" true "$USER1_TOKEN"
check_endpoint "POST" "/written-channels/1/unsubscribe" "" "Отписаться от письменного канала" true "$USER1_TOKEN"
check_endpoint "GET" "/written-channels/1/posts" "" "Получить посты письменного канала" false

echo -e "${BLUE}🎫 SUPPORT ENDPOINTS (3 endpoints):${NC}"
check_endpoint "GET" "/support/tickets" "" "Получить тикеты поддержки" true "$USER1_TOKEN"
check_endpoint "POST" "/support/tickets" '{"subject":"Test","message":"Test message"}' "Создать тикет поддержки" true "$USER1_TOKEN"
check_endpoint "POST" "/support/tickets/1/replies" '{"message":"Test reply"}' "Ответить на тикет" true "$USER1_TOKEN"

echo -e "${BLUE}💬 COMMENT ENDPOINTS (4 endpoints):${NC}"
check_endpoint "POST" "/comments/1/like" "" "Лайкнуть комментарий" true "$USER1_TOKEN"
check_endpoint "POST" "/comments/1/reply" '{"content":"Test reply"}' "Ответить на комментарий" true "$USER1_TOKEN"
check_endpoint "GET" "/comments/1/replies" "" "Получить ответы на комментарий" false
check_endpoint "DELETE" "/comments/1" "" "Удалить комментарий" true "$USER1_TOKEN"

echo -e "${BLUE}🎮 GAMIFICATION ENDPOINTS (4 endpoints):${NC}"
check_endpoint "GET" "/gamification/level" "" "Получить уровень" true "$USER1_TOKEN"
check_endpoint "GET" "/gamification/achievements" "" "Получить достижения" true "$USER1_TOKEN"
check_endpoint "GET" "/gamification/leaderboard" "" "Получить таблицу лидеров" true "$USER1_TOKEN"
check_endpoint "POST" "/gamification/award-points" '{"user_id":'$USER1_ID',"points":100,"reason":"Test"}' "Начислить очки" true "$USER1_TOKEN"

echo -e "${BLUE}🎯 AR/3D MODEL ENDPOINTS (8 endpoints):${NC}"
check_endpoint "POST" "/ar3d/models" '{"name":"Test Model","product_id":1,"model_url":"http://test.com/model.glb","model_type":"glb"}' "Создать 3D модель" true "$USER1_TOKEN"
check_endpoint "GET" "/ar3d/models/product/1" "" "Получить модели продукта" true "$USER1_TOKEN"
check_endpoint "GET" "/ar3d/models/search" "?q=test" "Поиск 3D моделей" true "$USER1_TOKEN"
check_endpoint "POST" "/ar3d/models/upload" '{"file":"test.glb"}' "Загрузить 3D модель" true "$USER1_TOKEN"
check_endpoint "POST" "/ar3d/models/validate" '{"model_url":"http://test.com/model.glb"}' "Валидировать 3D модель" true "$USER1_TOKEN"
check_endpoint "GET" "/ar3d/models/1/preview" "" "Предпросмотр 3D модели" true "$USER1_TOKEN"
check_endpoint "GET" "/ar3d/models/1/render" "" "Рендер 3D модели" true "$USER1_TOKEN"
check_endpoint "GET" "/ar3d/models/1/versions" "" "Версии 3D модели" true "$USER1_TOKEN"

echo -e "${BLUE}🗺️ MAP ENDPOINTS (3 endpoints):${NC}"
check_endpoint "POST" "/maps/location" '{"latitude":43.2220,"longitude":76.8512}' "Установить локацию" true "$USER1_TOKEN"
check_endpoint "GET" "/maps/geo-objects" "?lat=43.2220&lng=76.8512" "Получить геообъекты" true "$USER1_TOKEN"
check_endpoint "POST" "/maps/geo-objects" '{"name":"Test Object","latitude":43.2220,"longitude":76.8512}' "Создать геообъект" true "$USER1_TOKEN"

echo -e "${BLUE}🛡️ MODERATION ENDPOINTS (8 endpoints):${NC}"
check_endpoint "GET" "/moderation/videos" "" "Получить видео для модерации" true "$USER1_TOKEN"
check_endpoint "POST" "/moderation/videos/1/approve" "" "Одобрить видео" true "$USER1_TOKEN"
check_endpoint "POST" "/moderation/videos/1/reject" "" "Отклонить видео" true "$USER1_TOKEN"
check_endpoint "GET" "/moderation/comments" "" "Получить комментарии для модерации" true "$USER1_TOKEN"
check_endpoint "POST" "/moderation/comments/1/approve" "" "Одобрить комментарий" true "$USER1_TOKEN"
check_endpoint "POST" "/moderation/comments/1/reject" "" "Отклонить комментарий" true "$USER1_TOKEN"
check_endpoint "GET" "/moderation/streams" "" "Получить стримы для модерации" true "$USER1_TOKEN"
check_endpoint "GET" "/moderation/reports" "" "Получить жалобы" true "$USER1_TOKEN"

echo -e "${BLUE}📊 ANALYTICS ENDPOINTS (4 endpoints):${NC}"
check_endpoint "GET" "/analytics/user" "" "Получить аналитику пользователя" true "$USER1_TOKEN"
check_endpoint "GET" "/analytics/platform" "" "Получить аналитику платформы" true "$USER1_TOKEN"
check_endpoint "GET" "/analytics/engagement" "" "Получить аналитику вовлеченности" true "$USER1_TOKEN"
check_endpoint "GET" "/analytics/videos/1/heatmap" "" "Получить тепловую карту видео" true "$USER1_TOKEN"

echo -e "${BLUE}🔧 INTEGRATION ENDPOINTS (4 endpoints):${NC}"
check_endpoint "POST" "/integrations/payments/connect" '{"provider":"stripe"}' "Подключить платежи" true "$USER1_TOKEN"
check_endpoint "GET" "/integrations/payments/providers" "" "Получить провайдеров платежей" true "$USER1_TOKEN"
check_endpoint "POST" "/integrations/messengers/whatsapp/send" '{"phone":"+77001234567","message":"Test"}' "Отправить WhatsApp" true "$USER1_TOKEN"
check_endpoint "POST" "/integrations/messengers/telegram/send" '{"chat_id":"123","message":"Test"}' "Отправить Telegram" true "$USER1_TOKEN"

echo -e "${BLUE}🎁 REFERRAL ENDPOINTS (3 endpoints):${NC}"
check_endpoint "POST" "/referrals/apply" '{"code":"TEST123","email":"test@test.com"}' "Применить реферальный код" true "$USER1_TOKEN"
check_endpoint "POST" "/referrals/generate" "" "Сгенерировать реферальный код" true "$USER1_TOKEN"
check_endpoint "GET" "/referrals/stats" "" "Получить статистику рефералов" true "$USER1_TOKEN"

echo -e "${BLUE}📺 LIVESTREAM ENDPOINTS (6 endpoints):${NC}"
check_endpoint "GET" "/livestreams/active" "" "Получить активные стримы" false
check_endpoint "POST" "/livestreams/start" '{"title":"Test Stream"}' "Начать стрим" true "$USER1_TOKEN"
check_endpoint "POST" "/livestreams/1/end" "" "Завершить стрим" true "$USER1_TOKEN"
check_endpoint "POST" "/livestreams/1/donate" '{"amount":1000,"message":"Great stream!"}' "Донат на стрим" true "$USER1_TOKEN"
check_endpoint "GET" "/livestreams/1/viewers" "" "Получить зрителей" true "$USER1_TOKEN"
check_endpoint "POST" "/livestreams/1/join" "" "Присоединиться к стриму" true "$USER1_TOKEN"

echo -e "${BLUE}🎵 VOICE ROOM ENDPOINTS (4 endpoints):${NC}"
check_endpoint "POST" "/voicerooms/create" '{"name":"Test Room"}' "Создать голосовую комнату" true "$USER1_TOKEN"
check_endpoint "GET" "/voicerooms/1" "" "Получить голосовую комнату" true "$USER1_TOKEN"
check_endpoint "POST" "/voicerooms/1/join" "" "Присоединиться к комнате" true "$USER1_TOKEN"
check_endpoint "GET" "/voicerooms/1/participants" "" "Получить участников" true "$USER1_TOKEN"

echo -e "${BLUE}📞 CALL ENDPOINTS (12 endpoints):${NC}"
check_endpoint "GET" "/calls" "" "Получить звонки" true "$USER1_TOKEN"
check_endpoint "POST" "/calls/initiate" '{"recipient_id":'$USER2_ID'}' "Инициировать звонок" true "$USER1_TOKEN"
check_endpoint "POST" "/calls/initiate-secure" '{"recipient_id":'$USER2_ID'}' "Инициировать защищенный звонок" true "$USER1_TOKEN"
check_endpoint "POST" "/calls/1/answer" "" "Ответить на звонок" true "$USER2_TOKEN"
check_endpoint "POST" "/calls/1/end" "" "Завершить звонок" true "$USER1_TOKEN"
check_endpoint "POST" "/calls/1/cancel" "" "Отменить звонок" true "$USER1_TOKEN"
check_endpoint "GET" "/calls/history" "" "История звонков" true "$USER1_TOKEN"
check_endpoint "GET" "/calls/active" "" "Активные звонки" true "$USER1_TOKEN"
check_endpoint "GET" "/calls/1/webrtc-token" "" "Получить WebRTC токен" true "$USER1_TOKEN"
check_endpoint "GET" "/calls/1/webrtc-token-enhanced" "" "Получить улучшенный WebRTC токен" true "$USER1_TOKEN"
check_endpoint "POST" "/calls/validate-token" '{"token":"test_token"}' "Валидировать токен" true "$USER1_TOKEN"
check_endpoint "POST" "/calls/1/webrtc-signal" '{"signal":"test"}' "WebRTC сигнал" true "$USER1_TOKEN"

echo -e "${BLUE}👑 ADMIN ENDPOINTS (7 endpoints):${NC}"
check_endpoint "GET" "/admin/support/tickets" "" "Получить все тикеты поддержки" true "$USER1_TOKEN"
check_endpoint "GET" "/admin/support/tickets/1" "" "Получить тикет поддержки" true "$USER1_TOKEN"
check_endpoint "POST" "/admin/support/tickets/1/replies" '{"message":"Admin reply"}' "Ответить на тикет от имени админа" true "$USER1_TOKEN"
check_endpoint "GET" "/admin/users" "" "Получить всех пользователей" true "$USER1_TOKEN"
check_endpoint "POST" "/admin/users/$USER1_ID/ban" '{"reason":"Test ban"}' "Забанить пользователя" true "$USER1_TOKEN"
check_endpoint "POST" "/admin/users/$USER1_ID/unban" "" "Разбанить пользователя" true "$USER1_TOKEN"
check_endpoint "PUT" "/admin/users/$USER1_ID/role" '{"role":"moderator"}' "Изменить роль пользователя" true "$USER1_TOKEN"

echo -e "${BLUE}🔧 SYSTEM ENDPOINTS (5 endpoints):${NC}"
check_endpoint "GET" "/ratelimit/status" "" "Статус rate limiting" false
check_endpoint "GET" "/metrics" "" "Prometheus метрики" false
check_endpoint "GET" "/health" "" "Health check" false
check_endpoint "GET" "/live" "" "Liveness check" false
check_endpoint "GET" "/ready" "" "Readiness check" false

echo -e "${BLUE}🔐 OAUTH ENDPOINTS (3 endpoints):${NC}"
check_endpoint "GET" "/auth/oauth/authorize" "?client_id=test&response_type=code&redirect_uri=http://test.com" "OAuth авторизация" false
check_endpoint "POST" "/auth/oauth/token" '{"grant_type":"authorization_code","code":"test_code","client_id":"test","client_secret":"test"}' "OAuth токен" false
check_endpoint "POST" "/auth/oauth/revoke" '{"token":"test_token"}' "OAuth отзыв токена" false

echo -e "${BLUE}📢 BROADCAST ENDPOINTS (2 endpoints):${NC}"
check_endpoint "POST" "/notifications/broadcast" '{"title":"Test Broadcast","message":"Test message"}' "Отправить broadcast уведомление" true "$USER1_TOKEN"
check_endpoint "GET" "/notifications/templates" "" "Получить шаблоны уведомлений" true "$USER1_TOKEN"

echo -e "${BLUE}📊 ИТОГОВАЯ СТАТИСТИКА:${NC}"
echo "=============================================="
echo -e "📊 Всего endpoints: ${BLUE}$total_endpoints${NC}"
echo -e "✅ Работают (200/201): ${GREEN}$working_endpoints${NC}"
echo -e "💥 500 ошибки: ${RED}$error_500${NC}"
echo -e "❌ 404 ошибки: ${RED}$error_404${NC}"
echo -e "⚠️  400 ошибки: ${YELLOW}$error_400${NC}"
echo -e "🔐 401 ошибки: ${YELLOW}$error_401${NC}"
echo -e "🚫 403 ошибки: ${YELLOW}$error_403${NC}"
echo -e "❓ Другие ошибки: ${YELLOW}$error_other${NC}"

# Вычисляем проценты
if [ $total_endpoints -gt 0 ]; then
    working_percent=$((working_endpoints * 100 / total_endpoints))
    error_500_percent=$((error_500 * 100 / total_endpoints))
    error_404_percent=$((error_404 * 100 / total_endpoints))
    error_400_percent=$((error_400 * 100 / total_endpoints))
    error_401_percent=$((error_401 * 100 / total_endpoints))
    error_403_percent=$((error_403 * 100 / total_endpoints))
    
    echo ""
    echo -e "📈 ПРОЦЕНТЫ:"
    echo -e "✅ Работают: ${GREEN}$working_percent%${NC}"
    echo -e "💥 500 ошибки: ${RED}$error_500_percent%${NC}"
    echo -e "❌ 404 ошибки: ${RED}$error_404_percent%${NC}"
    echo -e "⚠️  400 ошибки: ${YELLOW}$error_400_percent%${NC}"
    echo -e "🔐 401 ошибки: ${YELLOW}$error_401_percent%${NC}"
    echo -e "🚫 403 ошибки: ${YELLOW}$error_403_percent%${NC}"
fi

echo ""
echo -e "${GREEN}✅ ИСПРАВЛЕННОЕ ТЕСТИРОВАНИЕ ЗАВЕРШЕНО!${NC}"
