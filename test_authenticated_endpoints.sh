#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔐 Тестируем все endpoints с авторизацией${NC}"
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
    echo $USER_RESPONSE | jq .
    exit 1
fi

echo -e "${GREEN}✅ Пользователь создан, токен получен${NC}"

# Функция для тестирования endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    if [ -n "$data" ]; then
        response=$(curl -s -X $method -H "Authorization: Bearer $TOKEN" \
          -H "Content-Type: application/json" \
          -d "$data" \
          "https://mebelplace.com.kz/api/v2$endpoint")
    else
        response=$(curl -s -X $method -H "Authorization: Bearer $TOKEN" \
          "https://mebelplace.com.kz/api/v2$endpoint")
    fi
    
    status_code=$(curl -s -o /dev/null -w "%{http_code}" -X $method -H "Authorization: Bearer $TOKEN" \
      "https://mebelplace.com.kz/api/v2$endpoint")
    
    if [ "$status_code" = "200" ]; then
        echo -e "${GREEN}✅ $method $endpoint - $description${NC}"
    elif [ "$status_code" = "400" ]; then
        echo -e "${YELLOW}⚠️  $method $endpoint - 400 (валидация)${NC}"
    elif [ "$status_code" = "401" ]; then
        echo -e "${YELLOW}🔐 $method $endpoint - 401 (требует авторизацию)${NC}"
    elif [ "$status_code" = "403" ]; then
        echo -e "${YELLOW}🚫 $method $endpoint - 403 (доступ запрещен)${NC}"
    elif [ "$status_code" = "404" ]; then
        echo -e "${RED}❌ $method $endpoint - 404 (не найден)${NC}"
    elif [ "$status_code" = "500" ]; then
        echo -e "${RED}❌ $method $endpoint - 500 (ошибка сервера)${NC}"
    elif [ "$status_code" = "503" ]; then
        echo -e "${RED}❌ $method $endpoint - 503 (сервис недоступен)${NC}"
    else
        echo -e "${RED}❓ $method $endpoint - $status_code${NC}"
    fi
}

echo -e "${BLUE}👤 Тестируем управление пользователями:${NC}"
test_endpoint "GET" "/users/me" "" "Получить профиль"
test_endpoint "PUT" "/users/me" '{"bio":"Test bio"}' "Обновить профиль"
test_endpoint "POST" "/users/me/avatar" "" "Загрузить аватар"
test_endpoint "GET" "/users/1" "" "Получить пользователя по ID"
test_endpoint "POST" "/users/1/block" "" "Заблокировать пользователя"
test_endpoint "DELETE" "/users/1/block" "" "Разблокировать пользователя"
test_endpoint "GET" "/users/blocked" "" "Получить заблокированных"

echo -e "${BLUE}📝 Тестируем заявки:${NC}"
test_endpoint "POST" "/requests" '{"title":"Test Request","description":"Test description","budget":100000,"category":"furniture","location":"Almaty"}' "Создать заявку"
test_endpoint "GET" "/requests/1" "" "Получить заявку"
test_endpoint "GET" "/requests/1/proposals" "" "Получить предложения"
test_endpoint "POST" "/requests/1/proposals" '{"message":"Test proposal","price":50000}' "Создать предложение"
test_endpoint "POST" "/requests/1/proposals/1/accept" "" "Принять предложение"

echo -e "${BLUE}💬 Тестируем чаты:${NC}"
test_endpoint "GET" "/chats" "" "Получить список чатов"
test_endpoint "POST" "/chats" '{"user_id":1,"message":"Hello"}' "Создать чат"
test_endpoint "GET" "/chats/1/messages" "" "Получить сообщения"
test_endpoint "POST" "/chats/1/messages" '{"content":"Test message"}' "Отправить сообщение"

echo -e "${BLUE}📢 Тестируем каналы:${NC}"
test_endpoint "POST" "/channels/1/subscribe" "" "Подписаться на канал"
test_endpoint "POST" "/channels/1/unsubscribe" "" "Отписаться от канала"
test_endpoint "POST" "/channels/1/posts" '{"content":"Test post"}' "Создать пост"

echo -e "${BLUE}🔔 Тестируем уведомления:${NC}"
test_endpoint "GET" "/notifications" "" "Получить уведомления"
test_endpoint "POST" "/notifications/1/read" "" "Отметить как прочитанное"
test_endpoint "POST" "/notifications/read-all" "" "Отметить все как прочитанные"
test_endpoint "GET" "/notifications/settings" "" "Получить настройки"
test_endpoint "POST" "/notifications/settings" '{"email":true,"push":true}' "Обновить настройки"
test_endpoint "POST" "/notifications/push-token" '{"token":"test_token"}' "Установить push токен"
test_endpoint "POST" "/notifications/broadcast" '{"message":"Test broadcast"}' "Отправить broadcast"
test_endpoint "GET" "/notifications/templates" "" "Получить шаблоны"
test_endpoint "POST" "/notifications/templates" '{"name":"Test","content":"Test template"}' "Создать шаблон"

echo -e "${BLUE}📖 Тестируем истории:${NC}"
test_endpoint "POST" "/stories" '{"content":"Test story"}' "Создать историю"
test_endpoint "GET" "/stories" "" "Получить истории"
test_endpoint "POST" "/stories/1/view" "" "Просмотреть историю"
test_endpoint "POST" "/stories/1/like" "" "Лайкнуть историю"

echo -e "${BLUE}👥 Тестируем групповые чаты:${NC}"
test_endpoint "POST" "/group-chats" '{"name":"Test Group","description":"Test group chat"}' "Создать групповой чат"
test_endpoint "GET" "/group-chats" "" "Получить групповые чаты"
test_endpoint "GET" "/group-chats/1" "" "Получить групповой чат"
test_endpoint "POST" "/group-chats/1/members" '{"user_id":1}' "Добавить участника"
test_endpoint "GET" "/group-chats/1/members" "" "Получить участников"
test_endpoint "POST" "/group-chats/1/messages" '{"content":"Test message"}' "Отправить сообщение"
test_endpoint "GET" "/group-chats/1/messages" "" "Получить сообщения"
test_endpoint "POST" "/group-chats/1/leave" "" "Покинуть группу"

echo -e "${BLUE}📝 Тестируем письменные каналы:${NC}"
test_endpoint "GET" "/written-channels" "" "Получить письменные каналы"
test_endpoint "POST" "/written-channels" '{"name":"Test Channel","description":"Test written channel"}' "Создать письменный канал"
test_endpoint "POST" "/written-channels/1/subscribe" "" "Подписаться на письменный канал"
test_endpoint "POST" "/written-channels/1/unsubscribe" "" "Отписаться от письменного канала"
test_endpoint "GET" "/written-channels/1/posts" "" "Получить посты"
test_endpoint "POST" "/written-channels/1/posts" '{"content":"Test post"}' "Создать пост"

echo -e "${BLUE}🎮 Тестируем геймификацию:${NC}"
test_endpoint "GET" "/gamification/level" "" "Получить уровень"
test_endpoint "GET" "/gamification/achievements" "" "Получить достижения"
test_endpoint "GET" "/gamification/leaderboard" "" "Получить таблицу лидеров"
test_endpoint "POST" "/gamification/award-points" '{"user_id":1,"points":100,"reason":"Test"}' "Начислить очки"
test_endpoint "GET" "/gamification/leaderboard/advanced" "" "Получить расширенную таблицу"
test_endpoint "GET" "/gamification/levels" "" "Получить уровни"
test_endpoint "GET" "/gamification/achievements/user/1" "" "Получить достижения пользователя"
test_endpoint "GET" "/gamification/rules" "" "Получить правила"
test_endpoint "POST" "/gamification/rules" '{"name":"Test Rule","points":10}' "Создать правило"
test_endpoint "GET" "/gamification/rules/1" "" "Получить правило"
test_endpoint "PUT" "/gamification/rules/1" '{"name":"Updated Rule","points":20}' "Обновить правило"
test_endpoint "DELETE" "/gamification/rules/1" "" "Удалить правило"

echo -e "${BLUE}📞 Тестируем звонки:${NC}"
test_endpoint "GET" "/calls" "" "Получить звонки"
test_endpoint "POST" "/calls/initiate" '{"recipient_id":1}' "Инициировать звонок"
test_endpoint "POST" "/calls/initiate-secure" '{"recipient_id":1}' "Инициировать безопасный звонок"
test_endpoint "POST" "/calls/1/answer" "" "Ответить на звонок"
test_endpoint "POST" "/calls/1/end" "" "Завершить звонок"
test_endpoint "POST" "/calls/1/cancel" "" "Отменить звонок"
test_endpoint "GET" "/calls/history" "" "Получить историю звонков"
test_endpoint "GET" "/calls/active" "" "Получить активные звонки"
test_endpoint "GET" "/calls/1/webrtc-token" "" "Получить WebRTC токен"
test_endpoint "GET" "/calls/statistics" "" "Получить статистику звонков"
test_endpoint "GET" "/calls/1/webrtc-token-enhanced" "" "Получить улучшенный WebRTC токен"
test_endpoint "POST" "/calls/validate-token" '{"token":"test_token"}' "Валидировать токен"
test_endpoint "POST" "/calls/1/notify" '{"message":"Test notification"}' "Уведомить о звонке"
test_endpoint "POST" "/calls/1/webrtc-signal" '{"signal":"test_signal"}' "Отправить WebRTC сигнал"

echo -e "${BLUE}🎯 Тестируем AR/3D модели:${NC}"
test_endpoint "POST" "/ar3d/models" '{"name":"Test Model","product_id":1,"model_url":"http://test.com/model.glb","model_type":"glb"}' "Создать 3D модель"
test_endpoint "GET" "/ar3d/models/product/1" "" "Получить модели продукта"
test_endpoint "GET" "/ar3d/models/search" "" "Поиск моделей"
test_endpoint "POST" "/ar3d/models/upload" '{"file":"test.glb"}' "Загрузить модель"
test_endpoint "POST" "/ar3d/models/validate" '{"model_url":"http://test.com/model.glb"}' "Валидировать модель"
test_endpoint "GET" "/ar3d/models/1/preview" "" "Получить превью модели"
test_endpoint "GET" "/ar3d/models/1/render" "" "Рендерить модель"
test_endpoint "GET" "/ar3d/models/1/versions" "" "Получить версии модели"
test_endpoint "POST" "/ar3d/models/1/versions" '{"version":"1.1"}' "Создать версию"
test_endpoint "POST" "/ar3d/models/1/versions/1/activate" "" "Активировать версию"

echo -e "${BLUE}🗺️ Тестируем карты:${NC}"
test_endpoint "POST" "/maps/location" '{"latitude":43.2220,"longitude":76.8512}' "Установить локацию"
test_endpoint "GET" "/maps/geo-objects" "" "Получить геообъекты"
test_endpoint "POST" "/maps/geo-objects" '{"name":"Test Object","latitude":43.2220,"longitude":76.8512}' "Создать геообъект"
test_endpoint "GET" "/maps/geo-objects/1" "" "Получить геообъект"
test_endpoint "PUT" "/maps/geo-objects/1" '{"name":"Updated Object"}' "Обновить геообъект"
test_endpoint "DELETE" "/maps/geo-objects/1" "" "Удалить геообъект"
test_endpoint "GET" "/maps/geo-objects/1/reviews" "" "Получить отзывы"
test_endpoint "POST" "/maps/geo-objects/1/reviews" '{"rating":5,"comment":"Great place"}' "Создать отзыв"
test_endpoint "POST" "/maps/geo-objects/1/verify" "" "Верифицировать геообъект"

echo -e "${BLUE}🔧 Тестируем интеграции:${NC}"
test_endpoint "POST" "/integrations/payments/connect" '{"provider":"stripe"}' "Подключить платежи"
test_endpoint "GET" "/integrations/payments/providers" "" "Получить провайдеров"
test_endpoint "GET" "/integrations/payments/transactions" "" "Получить транзакции"
test_endpoint "POST" "/integrations/payments/transactions/1/refund" '{"amount":1000}' "Возврат платежа"
test_endpoint "POST" "/integrations/messengers/whatsapp/send" '{"phone":"+77001234567","message":"Test"}' "Отправить WhatsApp"
test_endpoint "POST" "/integrations/messengers/telegram/send" '{"chat_id":"123","message":"Test"}' "Отправить Telegram"
test_endpoint "GET" "/integrations/crm/contacts" "" "Получить контакты CRM"
test_endpoint "POST" "/integrations/crm/contacts/1/sync" "" "Синхронизировать контакт"

echo -e "${BLUE}🎁 Тестируем рефералы:${NC}"
test_endpoint "POST" "/referrals/apply" '{"code":"TEST123"}' "Применить реферальный код"
test_endpoint "POST" "/referrals/generate" "" "Сгенерировать реферальный код"
test_endpoint "GET" "/referrals/stats" "" "Получить статистику рефералов"

echo -e "${BLUE}📺 Тестируем live стриминг:${NC}"
test_endpoint "POST" "/livestreams/start" '{"title":"Test Stream"}' "Начать стрим"
test_endpoint "POST" "/livestreams/1/end" "" "Завершить стрим"
test_endpoint "POST" "/livestreams/1/donate" '{"amount":1000,"message":"Great stream!"}' "Донат на стрим"
test_endpoint "POST" "/livestreams/1/publish" "" "Опубликовать стрим"

echo -e "${BLUE}🎵 Тестируем голосовые комнаты:${NC}"
test_endpoint "POST" "/voicerooms/create" '{"name":"Test Room"}' "Создать голосовую комнату"
test_endpoint "GET" "/voicerooms/1" "" "Получить голосовую комнату"
test_endpoint "POST" "/voicerooms/1/join" "" "Присоединиться к комнате"
test_endpoint "POST" "/voicerooms/1/record" "" "Начать запись"
test_endpoint "POST" "/voicerooms/1/record/1/stop" "" "Остановить запись"
test_endpoint "POST" "/voicerooms/group/create" '{"name":"Test Group Room"}' "Создать групповую комнату"

echo -e "${BLUE}📊 Тестируем аналитику:${NC}"
test_endpoint "GET" "/analytics/user" "" "Получить аналитику пользователя"
test_endpoint "GET" "/analytics/platform" "" "Получить аналитику платформы"
test_endpoint "GET" "/analytics/revenue" "" "Получить аналитику доходов"
test_endpoint "GET" "/analytics/engagement" "" "Получить аналитику вовлеченности"
test_endpoint "GET" "/analytics/videos/1/heatmap" "" "Получить тепловую карту видео"
test_endpoint "GET" "/analytics/videos/1/multicast" "" "Получить мультикаст видео"

echo -e "${BLUE}🛡️ Тестируем модерацию:${NC}"
test_endpoint "GET" "/moderation/videos" "" "Получить видео для модерации"
test_endpoint "POST" "/moderation/videos/1/approve" "" "Одобрить видео"
test_endpoint "POST" "/moderation/videos/1/reject" "" "Отклонить видео"
test_endpoint "GET" "/moderation/comments" "" "Получить комментарии для модерации"
test_endpoint "POST" "/moderation/comments/1/approve" "" "Одобрить комментарий"
test_endpoint "POST" "/moderation/comments/1/reject" "" "Отклонить комментарий"
test_endpoint "GET" "/moderation/streams" "" "Получить стримы для модерации"
test_endpoint "POST" "/moderation/streams/1/ban" "" "Забанить стрим"
test_endpoint "POST" "/moderation/streams/1/suspend" "" "Приостановить стрим"

echo -e "${BLUE}👑 Тестируем администрирование:${NC}"
test_endpoint "GET" "/admin/support/tickets" "" "Получить тикеты поддержки"
test_endpoint "PATCH" "/admin/support/tickets/1" '{"status":"resolved"}' "Обновить тикет"
test_endpoint "POST" "/admin/support/tickets/1/replies" '{"message":"Test reply"}' "Ответить на тикет"
test_endpoint "GET" "/admin/users" "" "Получить пользователей"
test_endpoint "POST" "/admin/users/1/ban" '{"reason":"Test ban"}' "Забанить пользователя"
test_endpoint "POST" "/admin/users/1/unban" "" "Разбанить пользователя"
test_endpoint "PUT" "/admin/users/1/role" '{"role":"moderator"}' "Изменить роль"
test_endpoint "POST" "/admin/users/1/suspend" '{"reason":"Test suspend","duration":24}' "Приостановить пользователя"

echo -e "${BLUE}🎬 Тестируем HLS стриминг:${NC}"
test_endpoint "GET" "/hls/1/playlist.m3u8" "" "Получить HLS плейлист"
test_endpoint "GET" "/hls/1/master.m3u8" "" "Получить master плейлист"
test_endpoint "GET" "/hls/1/preview.mp4" "" "Получить превью"
test_endpoint "GET" "/hls/1/thumbnail.jpg" "" "Получить миниатюру"
test_endpoint "GET" "/hls/1/segment1.ts" "" "Получить сегмент"
test_endpoint "GET" "/hls/live/1/playlist.m3u8" "" "Получить live плейлист"
test_endpoint "GET" "/hls/live/1/segment1.ts" "" "Получить live сегмент"
test_endpoint "GET" "/hls/1/status" "" "Получить статус HLS"

echo -e "${BLUE}🔌 Тестируем WebSocket:${NC}"
test_endpoint "GET" "/ws/calls/1" "" "WebSocket для звонков"

echo -e "${BLUE}💬 Тестируем комментарии:${NC}"
test_endpoint "POST" "/comments/1/like" "" "Лайкнуть комментарий"
test_endpoint "POST" "/comments/1/reply" '{"text":"Test reply"}' "Ответить на комментарий"
test_endpoint "GET" "/comments/1/replies" "" "Получить ответы"
test_endpoint "DELETE" "/comments/1" "" "Удалить комментарий"

echo -e "${BLUE}🆘 Тестируем поддержку:${NC}"
test_endpoint "GET" "/support/tickets" "" "Получить тикеты поддержки"
test_endpoint "POST" "/support/tickets" '{"subject":"Test Issue","message":"Test message"}' "Создать тикет"
test_endpoint "POST" "/support/tickets/1/replies" '{"message":"Test reply"}' "Ответить на тикет"

echo -e "${BLUE}🎥 Тестируем видео:${NC}"
test_endpoint "POST" "/videos/upload" '{"title":"Test Video","description":"Test description"}' "Загрузить видео"
test_endpoint "POST" "/videos/1/comments" '{"text":"Great video!"}' "Комментировать видео"
test_endpoint "POST" "/videos/1/like" "" "Лайкнуть видео"
test_endpoint "POST" "/videos/1/unlike" "" "Убрать лайк"
test_endpoint "POST" "/videos/1/analyze" "" "Анализировать видео"

echo -e "${GREEN}✅ Тестирование завершено!${NC}"
