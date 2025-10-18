#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 ЧЕСТНАЯ ДИАГНОСТИКА ВСЕХ ENDPOINTS${NC}"
echo "=============================================="

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

# Счетчики
total_endpoints=0
working_endpoints=0
error_500=0
error_404=0
error_400=0
error_403=0
error_other=0

# Функция для проверки endpoint
check_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    local needs_auth=$5
    
    total_endpoints=$((total_endpoints + 1))
    
    local headers=""
    if [ "$needs_auth" = "true" ]; then
        headers="-H \"Authorization: Bearer $TOKEN\""
    fi
    
    if [ -n "$data" ]; then
        status_code=$(curl -s -o /dev/null -w "%{http_code}" -X $method $headers \
          -H "Content-Type: application/json" \
          -d "$data" \
          "https://mebelplace.com.kz/api/v2$endpoint")
    else
        status_code=$(curl -s -o /dev/null -w "%{http_code}" -X $method $headers \
          "https://mebelplace.com.kz/api/v2$endpoint")
    fi
    
    if [ "$status_code" = "200" ] || [ "$status_code" = "201" ]; then
        echo -e "${GREEN}✅ $method $endpoint - $status_code (работает) - $description${NC}"
        working_endpoints=$((working_endpoints + 1))
    elif [ "$status_code" = "400" ]; then
        echo -e "${YELLOW}⚠️  $method $endpoint - 400 (валидация) - $description${NC}"
        error_400=$((error_400 + 1))
    elif [ "$status_code" = "401" ]; then
        echo -e "${YELLOW}🔐 $method $endpoint - 401 (нужна авторизация) - $description${NC}"
        error_403=$((error_403 + 1))
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
check_endpoint "POST" "/auth/register" '{"email_or_phone":"+77001234567","password":"Test123!","username":"testuser"}' "Регистрация" false
check_endpoint "POST" "/auth/login" '{"email_or_phone":"+77001234567","password":"Test123!"}' "Вход" false
check_endpoint "POST" "/auth/verify-sms" '{"phone":"+77001234567","code":"123456"}' "Верификация SMS" false
check_endpoint "POST" "/auth/verify-email" '{"email":"test@test.com","code":"123456"}' "Верификация Email" false
check_endpoint "POST" "/auth/refresh" '{"refresh_token":"test_token"}' "Обновление токена" false
check_endpoint "POST" "/auth/logout" "" "Выход" true

echo -e "${BLUE}👤 USER ENDPOINTS:${NC}"
check_endpoint "GET" "/users/me" "" "Получить профиль" true
check_endpoint "GET" "/users/1" "" "Получить пользователя по ID" false
check_endpoint "PUT" "/users/me" '{"username":"newusername"}' "Обновить профиль" true
check_endpoint "POST" "/users/me/avatar" '{"avatar":"base64data"}' "Загрузить аватар" true
check_endpoint "POST" "/users/1/block" "" "Заблокировать пользователя" true
check_endpoint "DELETE" "/users/1/block" "" "Разблокировать пользователя" true
check_endpoint "GET" "/users/blocked" "" "Получить заблокированных" true

echo -e "${BLUE}🎥 VIDEO ENDPOINTS:${NC}"
check_endpoint "GET" "/videos/feed" "" "Лента видео" false
check_endpoint "POST" "/videos/upload" '{"title":"Test Video","description":"Test"}' "Загрузить видео" true
check_endpoint "POST" "/videos/1/like" "" "Лайкнуть видео" true
check_endpoint "POST" "/videos/1/unlike" "" "Убрать лайк" true
check_endpoint "GET" "/videos/1/comments" "" "Получить комментарии" false
check_endpoint "POST" "/videos/1/comments" '{"content":"Test comment"}' "Добавить комментарий" true
check_endpoint "POST" "/videos/1/analyze" "" "Анализ видео" true

echo -e "${BLUE}💬 CHAT ENDPOINTS:${NC}"
check_endpoint "GET" "/chats" "" "Получить чаты" true
check_endpoint "POST" "/chats" '{"request_id":1,"recipient_id":1}' "Создать чат" true
check_endpoint "GET" "/chats/1/messages" "" "Получить сообщения" true
check_endpoint "POST" "/chats/1/messages" '{"content":"Test message"}' "Отправить сообщение" true

echo -e "${BLUE}📋 REQUEST ENDPOINTS:${NC}"
check_endpoint "GET" "/requests" "" "Получить запросы" false
check_endpoint "GET" "/requests/1" "" "Получить запрос по ID" false
check_endpoint "POST" "/requests" '{"title":"Test Request","description":"Test"}' "Создать запрос" true
check_endpoint "GET" "/requests/1/proposals" "" "Получить предложения" false
check_endpoint "POST" "/requests/1/proposals" '{"price":1000,"description":"Test proposal"}' "Создать предложение" true
check_endpoint "POST" "/requests/1/proposals/1/accept" "" "Принять предложение" true

echo -e "${BLUE}📺 CHANNEL ENDPOINTS:${NC}"
check_endpoint "GET" "/channels" "" "Получить каналы" false
check_endpoint "GET" "/channels/1/posts" "" "Получить посты канала" false
check_endpoint "POST" "/channels/1/subscribe" "" "Подписаться на канал" true
check_endpoint "POST" "/channels/1/unsubscribe" "" "Отписаться от канала" true
check_endpoint "POST" "/channels/1/posts" '{"title":"Test Post","content":"Test"}' "Создать пост" true

echo -e "${BLUE}👥 GROUP CHAT ENDPOINTS:${NC}"
check_endpoint "GET" "/group-chats" "" "Получить групповые чаты" true
check_endpoint "POST" "/group-chats" '{"name":"Test Group","description":"Test"}' "Создать групповой чат" true
check_endpoint "GET" "/group-chats/1" "" "Получить групповой чат" true
check_endpoint "POST" "/group-chats/1/members" '{"user_id":1}' "Добавить участника" true
check_endpoint "GET" "/group-chats/1/members" "" "Получить участников" true
check_endpoint "POST" "/group-chats/1/messages" '{"content":"Test message"}' "Отправить сообщение" true
check_endpoint "GET" "/group-chats/1/messages" "" "Получить сообщения" true
check_endpoint "POST" "/group-chats/1/leave" "" "Покинуть группу" true

echo -e "${BLUE}📝 WRITTEN CHANNEL ENDPOINTS:${NC}"
check_endpoint "GET" "/written-channels" "" "Получить письменные каналы" false
check_endpoint "POST" "/written-channels" '{"name":"Test Channel","description":"Test"}' "Создать письменный канал" true
check_endpoint "POST" "/written-channels/1/subscribe" "" "Подписаться на письменный канал" true
check_endpoint "POST" "/written-channels/1/unsubscribe" "" "Отписаться от письменного канала" true
check_endpoint "GET" "/written-channels/1/posts" "" "Получить посты письменного канала" false
check_endpoint "POST" "/written-channels/1/posts" '{"title":"Test Post","content":"Test"}' "Создать пост в письменном канале" true

echo -e "${BLUE}📖 STORY ENDPOINTS:${NC}"
check_endpoint "GET" "/stories" "" "Получить истории" false
check_endpoint "POST" "/stories" '{"content":"Test story"}' "Создать историю" true
check_endpoint "POST" "/stories/1/view" "" "Просмотреть историю" true
check_endpoint "POST" "/stories/1/like" "" "Лайкнуть историю" true

echo -e "${BLUE}🔍 SEARCH ENDPOINTS:${NC}"
check_endpoint "GET" "/search" "?q=test" "Универсальный поиск" false
check_endpoint "GET" "/search/users" "?q=test" "Поиск пользователей" false
check_endpoint "GET" "/search/masters" "?q=test&lat=43.2220&lng=76.8512" "Поиск мастеров" false

echo -e "${BLUE}🎮 GAMIFICATION ENDPOINTS:${NC}"
check_endpoint "GET" "/gamification/level" "" "Получить уровень" true
check_endpoint "GET" "/gamification/achievements" "" "Получить достижения" true
check_endpoint "GET" "/gamification/leaderboard" "" "Получить таблицу лидеров" true
check_endpoint "POST" "/gamification/award-points" '{"user_id":1,"points":100,"reason":"Test"}' "Начислить очки" true
check_endpoint "GET" "/gamification/leaderboard/advanced" "" "Расширенная таблица лидеров" true
check_endpoint "GET" "/gamification/levels" "" "Получить уровни" true
check_endpoint "GET" "/gamification/achievements/user/1" "" "Получить достижения пользователя" true
check_endpoint "GET" "/gamification/rules" "" "Получить правила" true
check_endpoint "POST" "/gamification/rules" '{"name":"Test Rule","action":"like","points":10}' "Создать правило" true
check_endpoint "GET" "/gamification/rules/1" "" "Получить правило" true
check_endpoint "PUT" "/gamification/rules/1" '{"name":"Updated Rule"}' "Обновить правило" true
check_endpoint "DELETE" "/gamification/rules/1" "" "Удалить правило" true

echo -e "${BLUE}📞 CALL ENDPOINTS:${NC}"
check_endpoint "GET" "/calls" "" "Получить звонки" true
check_endpoint "POST" "/calls/initiate" '{"recipient_id":1}' "Инициировать звонок" true
check_endpoint "POST" "/calls/initiate-secure" '{"recipient_id":1}' "Инициировать защищенный звонок" true
check_endpoint "POST" "/calls/1/answer" "" "Ответить на звонок" true
check_endpoint "POST" "/calls/1/end" "" "Завершить звонок" true
check_endpoint "POST" "/calls/1/cancel" "" "Отменить звонок" true
check_endpoint "GET" "/calls/history" "" "История звонков" true
check_endpoint "GET" "/calls/active" "" "Активные звонки" true
check_endpoint "GET" "/calls/1/webrtc-token" "" "Получить WebRTC токен" true
check_endpoint "GET" "/calls/1/webrtc-token-enhanced" "" "Получить улучшенный WebRTC токен" true
check_endpoint "POST" "/calls/validate-token" '{"token":"test_token"}' "Валидировать токен" true
check_endpoint "POST" "/calls/1/notify" '{"message":"test"}' "Уведомить о звонке" true
check_endpoint "GET" "/calls/statistics" "" "Статистика звонков" true
check_endpoint "POST" "/calls/1/webrtc-signal" '{"signal":"test"}' "WebRTC сигнал" true

echo -e "${BLUE}🎯 AR/3D MODEL ENDPOINTS:${NC}"
check_endpoint "POST" "/ar3d/models" '{"name":"Test Model","product_id":1,"model_url":"http://test.com/model.glb","model_type":"glb"}' "Создать 3D модель" true
check_endpoint "GET" "/ar3d/models/product/1" "" "Получить модели продукта" true
check_endpoint "GET" "/ar3d/models/search" "?q=test" "Поиск 3D моделей" true
check_endpoint "POST" "/ar3d/models/upload" '{"file":"test.glb"}' "Загрузить 3D модель" true
check_endpoint "POST" "/ar3d/models/validate" '{"model_url":"http://test.com/model.glb"}' "Валидировать 3D модель" true
check_endpoint "GET" "/ar3d/models/1/preview" "" "Предпросмотр 3D модели" true
check_endpoint "GET" "/ar3d/models/1/render" "" "Рендер 3D модели" true
check_endpoint "GET" "/ar3d/models/1/versions" "" "Версии 3D модели" true
check_endpoint "POST" "/ar3d/models/1/versions" '{"version":"1.1"}' "Создать версию 3D модели" true
check_endpoint "POST" "/ar3d/models/1/versions/1/activate" "" "Активировать версию 3D модели" true

echo -e "${BLUE}🗺️ MAP ENDPOINTS:${NC}"
check_endpoint "POST" "/maps/location" '{"latitude":43.2220,"longitude":76.8512}' "Установить локацию" true
check_endpoint "GET" "/maps/geo-objects" "?lat=43.2220&lng=76.8512" "Получить геообъекты" true
check_endpoint "POST" "/maps/geo-objects" '{"name":"Test Object","latitude":43.2220,"longitude":76.8512}' "Создать геообъект" true
check_endpoint "POST" "/maps/geo-objects/1/verify" "" "Верифицировать геообъект" true

echo -e "${BLUE}🛡️ MODERATION ENDPOINTS:${NC}"
check_endpoint "POST" "/moderation/videos/1/approve" "" "Одобрить видео" true
check_endpoint "POST" "/moderation/videos/1/reject" "" "Отклонить видео" true
check_endpoint "GET" "/moderation/comments" "" "Получить комментарии для модерации" true
check_endpoint "POST" "/moderation/comments/1/approve" "" "Одобрить комментарий" true
check_endpoint "POST" "/moderation/comments/1/reject" "" "Отклонить комментарий" true
check_endpoint "GET" "/moderation/streams" "" "Получить стримы для модерации" true
check_endpoint "GET" "/moderation/reports" "" "Получить жалобы" true
check_endpoint "POST" "/moderation/reports" '{"type":"spam","target_id":1}' "Создать жалобу" true
check_endpoint "POST" "/moderation/reports/1/resolve" '{"action":"warn"}' "Разрешить жалобу" true

echo -e "${BLUE}📊 ANALYTICS ENDPOINTS:${NC}"
check_endpoint "GET" "/analytics/user" "" "Получить аналитику пользователя" true
check_endpoint "GET" "/analytics/platform" "" "Получить аналитику платформы" true
check_endpoint "GET" "/analytics/engagement" "" "Получить аналитику вовлеченности" true
check_endpoint "GET" "/analytics/videos/1/heatmap" "" "Получить тепловую карту видео" true
check_endpoint "GET" "/analytics/videos/1/engagement" "" "Получить вовлеченность видео" true
check_endpoint "GET" "/analytics/users/1/behavior" "" "Получить поведение пользователя" true

echo -e "${BLUE}🔧 INTEGRATION ENDPOINTS:${NC}"
check_endpoint "POST" "/integrations/payments/connect" '{"provider":"stripe"}' "Подключить платежи" true
check_endpoint "GET" "/integrations/payments/providers" "" "Получить провайдеров платежей" true
check_endpoint "POST" "/integrations/messengers/whatsapp/send" '{"phone":"+77001234567","message":"Test"}' "Отправить WhatsApp" true
check_endpoint "POST" "/integrations/messengers/telegram/send" '{"chat_id":"123","message":"Test"}' "Отправить Telegram" true
check_endpoint "POST" "/integrations/crm/sync" '{"provider":"salesforce"}' "Синхронизировать CRM" true

echo -e "${BLUE}🎁 REFERRAL ENDPOINTS:${NC}"
check_endpoint "POST" "/referrals/apply" '{"code":"TEST123"}' "Применить реферальный код" true
check_endpoint "POST" "/referrals/generate" "" "Сгенерировать реферальный код" true

echo -e "${BLUE}📺 LIVESTREAM ENDPOINTS:${NC}"
check_endpoint "POST" "/livestreams/start" '{"title":"Test Stream"}' "Начать стрим" true
check_endpoint "POST" "/livestreams/1/end" "" "Завершить стрим" true
check_endpoint "POST" "/livestreams/1/donate" '{"amount":1000,"message":"Great stream!"}' "Донат на стрим" true
check_endpoint "GET" "/livestreams/1/viewers" "" "Получить зрителей" true
check_endpoint "POST" "/livestreams/1/join" "" "Присоединиться к стриму" true
check_endpoint "POST" "/livestreams/1/leave" "" "Покинуть стрим" true

echo -e "${BLUE}🎵 VOICE ROOM ENDPOINTS:${NC}"
check_endpoint "POST" "/voicerooms/create" '{"name":"Test Room"}' "Создать голосовую комнату" true
check_endpoint "GET" "/voicerooms/1" "" "Получить голосовую комнату" true
check_endpoint "POST" "/voicerooms/1/join" "" "Присоединиться к комнате" true
check_endpoint "POST" "/voicerooms/1/leave" "" "Покинуть комнату" true
check_endpoint "POST" "/voicerooms/1/record" "" "Начать запись" true
check_endpoint "POST" "/voicerooms/1/stop-record" "" "Остановить запись" true
check_endpoint "GET" "/voicerooms/1/participants" "" "Получить участников" true
check_endpoint "GET" "/voicerooms/1/recordings" "" "Получить записи" true

echo -e "${BLUE}🔔 NOTIFICATION ENDPOINTS:${NC}"
check_endpoint "GET" "/notifications" "" "Получить уведомления" true
check_endpoint "POST" "/notifications/1/read" "" "Отметить уведомление как прочитанное" true
check_endpoint "POST" "/notifications/read-all" "" "Отметить все уведомления как прочитанные" true
check_endpoint "GET" "/notifications/settings" "" "Получить настройки уведомлений" true
check_endpoint "POST" "/notifications/settings" '{"email":true,"push":true}' "Обновить настройки уведомлений" true
check_endpoint "POST" "/notifications/push-token" '{"token":"test_token"}' "Обновить push токен" true

echo -e "${BLUE}💬 COMMENT ENDPOINTS:${NC}"
check_endpoint "POST" "/comments/1/like" "" "Лайкнуть комментарий" true
check_endpoint "POST" "/comments/1/reply" '{"content":"Test reply"}' "Ответить на комментарий" true
check_endpoint "GET" "/comments/1/replies" "" "Получить ответы на комментарий" true
check_endpoint "DELETE" "/comments/1" "" "Удалить комментарий" true

echo -e "${BLUE}📞 SUBSCRIPTION ENDPOINTS:${NC}"
check_endpoint "POST" "/subscriptions/1" "" "Подписаться на пользователя" true
check_endpoint "DELETE" "/subscriptions/1" "" "Отписаться от пользователя" true
check_endpoint "GET" "/subscriptions/my" "" "Получить мои подписки" true

echo -e "${BLUE}🎫 SUPPORT ENDPOINTS:${NC}"
check_endpoint "GET" "/support/tickets" "" "Получить тикеты поддержки" true
check_endpoint "POST" "/support/tickets" '{"subject":"Test","message":"Test message"}' "Создать тикет поддержки" true
check_endpoint "POST" "/support/tickets/1/replies" '{"message":"Test reply"}' "Ответить на тикет" true

echo -e "${BLUE}👑 ADMIN ENDPOINTS:${NC}"
check_endpoint "GET" "/admin/support/tickets" "" "Получить все тикеты поддержки" true
check_endpoint "PATCH" "/admin/support/tickets/1" '{"status":"resolved"}' "Обновить статус тикета" true
check_endpoint "POST" "/admin/support/tickets/1/replies" '{"message":"Admin reply"}' "Ответить на тикет от имени админа" true
check_endpoint "GET" "/admin/users" "" "Получить всех пользователей" true
check_endpoint "POST" "/admin/users/1/ban" '{"reason":"Test ban"}' "Забанить пользователя" true
check_endpoint "POST" "/admin/users/1/unban" "" "Разбанить пользователя" true
check_endpoint "PUT" "/admin/users/1/role" '{"role":"moderator"}' "Изменить роль пользователя" true
check_endpoint "POST" "/admin/users/1/suspend" '{"reason":"Test suspend","duration":24}' "Приостановить пользователя" true

echo -e "${BLUE}🔧 SYSTEM ENDPOINTS:${NC}"
check_endpoint "GET" "/ratelimit/status" "" "Статус rate limiting" false
check_endpoint "GET" "/metrics" "" "Prometheus метрики" false
check_endpoint "GET" "/health" "" "Health check" false
check_endpoint "GET" "/live" "" "Liveness check" false
check_endpoint "GET" "/ready" "" "Readiness check" false

echo -e "${BLUE}🔐 OAUTH ENDPOINTS:${NC}"
check_endpoint "GET" "/auth/oauth/authorize" "?client_id=test&response_type=code&redirect_uri=http://test.com" "OAuth авторизация" false
check_endpoint "POST" "/auth/oauth/token" '{"grant_type":"authorization_code","code":"test_code","client_id":"test","client_secret":"test"}' "OAuth токен" false
check_endpoint "POST" "/auth/oauth/revoke" '{"token":"test_token"}' "OAuth отзыв токена" false

echo -e "${BLUE}📢 BROADCAST ENDPOINTS:${NC}"
check_endpoint "POST" "/notifications/broadcast" '{"title":"Test Broadcast","message":"Test message"}' "Отправить broadcast уведомление" true
check_endpoint "GET" "/notifications/templates" "" "Получить шаблоны уведомлений" true

echo -e "${BLUE}📊 ИТОГОВАЯ СТАТИСТИКА:${NC}"
echo "=============================================="
echo -e "📊 Всего endpoints: ${BLUE}$total_endpoints${NC}"
echo -e "✅ Работают (200/201): ${GREEN}$working_endpoints${NC}"
echo -e "💥 500 ошибки: ${RED}$error_500${NC}"
echo -e "❌ 404 ошибки: ${RED}$error_404${NC}"
echo -e "⚠️  400 ошибки: ${YELLOW}$error_400${NC}"
echo -e "🚫 403 ошибки: ${YELLOW}$error_403${NC}"
echo -e "❓ Другие ошибки: ${YELLOW}$error_other${NC}"

# Вычисляем проценты
if [ $total_endpoints -gt 0 ]; then
    working_percent=$((working_endpoints * 100 / total_endpoints))
    error_500_percent=$((error_500 * 100 / total_endpoints))
    error_404_percent=$((error_404 * 100 / total_endpoints))
    error_400_percent=$((error_400 * 100 / total_endpoints))
    error_403_percent=$((error_403 * 100 / total_endpoints))
    
    echo ""
    echo -e "📈 ПРОЦЕНТЫ:"
    echo -e "✅ Работают: ${GREEN}$working_percent%${NC}"
    echo -e "💥 500 ошибки: ${RED}$error_500_percent%${NC}"
    echo -e "❌ 404 ошибки: ${RED}$error_404_percent%${NC}"
    echo -e "⚠️  400 ошибки: ${YELLOW}$error_400_percent%${NC}"
    echo -e "🚫 403 ошибки: ${YELLOW}$error_403_percent%${NC}"
fi

echo ""
echo -e "${GREEN}✅ ЧЕСТНАЯ ДИАГНОСТИКА ЗАВЕРШЕНА!${NC}"
