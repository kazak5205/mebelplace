#!/bin/bash

# Скрипт для проверки всех endpoints на production
DOMAIN="https://mebelplace.com.kz"
API_BASE="$DOMAIN/api/v2"

echo "🔍 Проверяем все endpoints на $DOMAIN"
echo "=================================="

# Счетчики
total=0
working=0
not_working=0
auth_required=0

# Функция для проверки endpoint
check_endpoint() {
    local method=$1
    local path=$2
    local expected_status=$3
    local description=$4
    
    total=$((total + 1))
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "%{http_code}" -o /tmp/response.json "$API_BASE$path")
    else
        response=$(curl -s -w "%{http_code}" -o /tmp/response.json -X "$method" "$API_BASE$path")
    fi
    
    http_code="${response: -3}"
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ] || [ "$http_code" = "302" ]; then
        echo "✅ $method $path - $http_code"
        working=$((working + 1))
    elif [ "$http_code" = "401" ] || [ "$http_code" = "403" ]; then
        echo "🔐 $method $path - $http_code (требует авторизацию)"
        auth_required=$((auth_required + 1))
        working=$((working + 1))
    elif [ "$http_code" = "400" ] || [ "$http_code" = "422" ]; then
        echo "⚠️  $method $path - $http_code (валидация)"
        working=$((working + 1))
    elif [ "$http_code" = "404" ]; then
        echo "❌ $method $path - $http_code (не найден)"
        not_working=$((not_working + 1))
    else
        echo "❓ $method $path - $http_code"
        not_working=$((not_working + 1))
    fi
}

echo "📊 Системные endpoints:"
check_endpoint "GET" "/ratelimit/status" "200" "Rate limiting status"
check_endpoint "GET" "/metrics" "200" "Prometheus metrics"
check_endpoint "GET" "/health" "200" "Health check"
check_endpoint "GET" "/live" "200" "Liveness probe"
check_endpoint "GET" "/ready" "200" "Readiness probe"

echo ""
echo "🔐 Аутентификация:"
check_endpoint "POST" "/auth/register" "400" "User registration"
check_endpoint "POST" "/auth/verify-sms" "400" "SMS verification"
check_endpoint "POST" "/auth/verify-email" "400" "Email verification"
check_endpoint "POST" "/auth/login" "400" "User login"
check_endpoint "POST" "/auth/refresh" "400" "Token refresh"
check_endpoint "POST" "/auth/logout" "401" "User logout"

echo ""
echo "🔑 OAuth:"
check_endpoint "GET" "/auth/oauth/authorize" "302" "OAuth authorization"
check_endpoint "POST" "/auth/oauth/token" "400" "OAuth token"
check_endpoint "POST" "/auth/oauth/revoke" "401" "OAuth revoke"

echo ""
echo "👤 Пользователи:"
check_endpoint "GET" "/users/me" "401" "Get current user"
check_endpoint "PUT" "/users/me" "401" "Update profile"
check_endpoint "POST" "/users/me/avatar" "401" "Upload avatar"
check_endpoint "GET" "/users/1" "200" "Get user by ID"
check_endpoint "POST" "/users/1/block" "401" "Block user"
check_endpoint "DELETE" "/users/1/block" "401" "Unblock user"
check_endpoint "GET" "/users/blocked" "401" "Get blocked users"

echo ""
echo "🎥 Видео:"
check_endpoint "GET" "/videos/feed" "200" "Video feed"
check_endpoint "POST" "/videos/upload" "401" "Upload video"
check_endpoint "GET" "/videos/1/comments" "200" "Get video comments"
check_endpoint "POST" "/videos/1/comments" "401" "Add comment"
check_endpoint "POST" "/videos/1/like" "401" "Like video"
check_endpoint "POST" "/videos/1/unlike" "401" "Unlike video"
check_endpoint "POST" "/videos/1/analyze" "401" "Analyze video"

echo ""
echo "📝 Заявки:"
check_endpoint "GET" "/requests" "200" "Get requests"
check_endpoint "POST" "/requests" "401" "Create request"
check_endpoint "GET" "/requests/1" "200" "Get request by ID"
check_endpoint "GET" "/requests/1/proposals" "200" "Get proposals"
check_endpoint "POST" "/requests/1/proposals" "401" "Create proposal"
check_endpoint "POST" "/requests/1/proposals/1/accept" "401" "Accept proposal"

echo ""
echo "💬 Чаты:"
check_endpoint "GET" "/chats" "401" "Get chats"
check_endpoint "POST" "/chats" "401" "Create chat"
check_endpoint "GET" "/chats/1/messages" "401" "Get messages"
check_endpoint "POST" "/chats/1/messages" "401" "Send message"

echo ""
echo "📢 Каналы:"
check_endpoint "GET" "/channels" "200" "Get channels"
check_endpoint "GET" "/channels/1/posts" "200" "Get channel posts"
check_endpoint "POST" "/channels/1/subscribe" "401" "Subscribe to channel"
check_endpoint "POST" "/channels/1/unsubscribe" "401" "Unsubscribe from channel"
check_endpoint "POST" "/channels/1/posts" "401" "Create post"

echo ""
echo "🔔 Подписки:"
check_endpoint "POST" "/subscriptions/1" "401" "Subscribe to user"
check_endpoint "DELETE" "/subscriptions/1" "401" "Unsubscribe from user"
check_endpoint "GET" "/subscriptions/my" "401" "Get my subscriptions"

echo ""
echo "🔍 Поиск:"
check_endpoint "GET" "/search" "200" "Universal search"
check_endpoint "GET" "/search/users" "200" "Search users"
check_endpoint "GET" "/search/masters" "200" "Search masters"

echo ""
echo "🔔 Уведомления:"
check_endpoint "GET" "/notifications" "401" "Get notifications"
check_endpoint "POST" "/notifications/1/read" "401" "Mark notification read"
check_endpoint "POST" "/notifications/read-all" "401" "Mark all read"
check_endpoint "GET" "/notifications/settings" "401" "Get notification settings"
check_endpoint "POST" "/notifications/settings" "401" "Update notification settings"
check_endpoint "POST" "/notifications/push-token" "401" "Update push token"
check_endpoint "POST" "/notifications/broadcast" "401" "Broadcast notification"
check_endpoint "GET" "/notifications/templates" "401" "Get notification templates"
check_endpoint "POST" "/notifications/templates" "401" "Create notification template"

echo ""
echo "📖 Истории:"
check_endpoint "POST" "/stories" "401" "Create story"
check_endpoint "GET" "/stories" "200" "Get stories"
check_endpoint "POST" "/stories/1/view" "401" "View story"
check_endpoint "POST" "/stories/1/like" "401" "Like story"

echo ""
echo "👥 Групповые чаты:"
check_endpoint "POST" "/group-chats" "401" "Create group chat"
check_endpoint "GET" "/group-chats" "401" "Get my group chats"
check_endpoint "GET" "/group-chats/1" "401" "Get group chat"
check_endpoint "POST" "/group-chats/1/members" "401" "Add member"
check_endpoint "GET" "/group-chats/1/members" "401" "Get members"
check_endpoint "POST" "/group-chats/1/messages" "401" "Send message"
check_endpoint "GET" "/group-chats/1/messages" "401" "Get messages"
check_endpoint "POST" "/group-chats/1/leave" "401" "Leave group"

echo ""
echo "📝 Письменные каналы:"
check_endpoint "GET" "/written-channels" "200" "Get written channels"
check_endpoint "POST" "/written-channels" "401" "Create written channel"
check_endpoint "POST" "/written-channels/1/subscribe" "401" "Subscribe to written channel"
check_endpoint "POST" "/written-channels/1/unsubscribe" "401" "Unsubscribe from written channel"
check_endpoint "GET" "/written-channels/1/posts" "200" "Get written channel posts"
check_endpoint "POST" "/written-channels/1/posts" "401" "Create written channel post"

echo ""
echo "🎮 Геймификация:"
check_endpoint "GET" "/gamification/level" "401" "Get user level"
check_endpoint "GET" "/gamification/achievements" "401" "Get user achievements"
check_endpoint "GET" "/gamification/leaderboard" "401" "Get leaderboard"
check_endpoint "POST" "/gamification/award-points" "401" "Award points"
check_endpoint "GET" "/gamification/leaderboard/advanced" "401" "Get advanced leaderboard"
check_endpoint "GET" "/gamification/levels" "401" "Get gamification levels"
check_endpoint "GET" "/gamification/achievements/user/1" "401" "Get user achievements by ID"
check_endpoint "GET" "/gamification/rules" "401" "Get gamification rules"
check_endpoint "POST" "/gamification/rules" "401" "Create gamification rule"
check_endpoint "GET" "/gamification/rules/1" "401" "Get gamification rule"
check_endpoint "PUT" "/gamification/rules/1" "401" "Update gamification rule"
check_endpoint "DELETE" "/gamification/rules/1" "401" "Delete gamification rule"

echo ""
echo "📞 Звонки:"
check_endpoint "GET" "/calls" "401" "Get calls"
check_endpoint "POST" "/calls/initiate" "401" "Initiate call"
check_endpoint "POST" "/calls/initiate-secure" "401" "Initiate secure call"
check_endpoint "POST" "/calls/1/answer" "401" "Answer call"
check_endpoint "POST" "/calls/1/end" "401" "End call"
check_endpoint "POST" "/calls/1/cancel" "401" "Cancel call"
check_endpoint "GET" "/calls/history" "401" "Get call history"
check_endpoint "GET" "/calls/active" "401" "Check active calls"
check_endpoint "GET" "/calls/1/webrtc-token" "401" "Get WebRTC token"
check_endpoint "GET" "/calls/statistics" "401" "Get call statistics"
check_endpoint "GET" "/calls/1/webrtc-token-enhanced" "401" "Get enhanced WebRTC token"
check_endpoint "POST" "/calls/validate-token" "401" "Validate WebRTC token"
check_endpoint "POST" "/calls/1/notify" "401" "Send call notification"
check_endpoint "POST" "/calls/1/webrtc-signal" "401" "WebRTC signal"

echo ""
echo "🎯 AR/3D модели:"
check_endpoint "POST" "/ar3d/models" "401" "Upload 3D model"
check_endpoint "GET" "/ar3d/models/product/1" "401" "Get 3D models for product"
check_endpoint "GET" "/ar3d/models/search" "401" "Search 3D models"
check_endpoint "POST" "/ar3d/models/upload" "401" "Upload 3D model"
check_endpoint "POST" "/ar3d/models/validate" "401" "Validate 3D model"
check_endpoint "GET" "/ar3d/models/1/preview" "401" "Get model preview"
check_endpoint "GET" "/ar3d/models/1/render" "401" "Get model render"
check_endpoint "GET" "/ar3d/models/1/versions" "401" "Get model versions"
check_endpoint "POST" "/ar3d/models/1/versions" "401" "Create model version"
check_endpoint "POST" "/ar3d/models/1/versions/1/activate" "401" "Activate model version"

echo ""
echo "🗺️ Карты:"
check_endpoint "GET" "/maps/masters" "200" "Get masters on map"
check_endpoint "POST" "/maps/location" "401" "Update user location"
check_endpoint "GET" "/maps/geo-objects" "200" "Get geo objects"
check_endpoint "POST" "/maps/geo-objects" "401" "Create geo object"
check_endpoint "GET" "/maps/geo-objects/1" "200" "Get geo object"
check_endpoint "PUT" "/maps/geo-objects/1" "401" "Update geo object"
check_endpoint "DELETE" "/maps/geo-objects/1" "401" "Delete geo object"
check_endpoint "GET" "/maps/geo-objects/1/reviews" "200" "Get geo object reviews"
check_endpoint "POST" "/maps/geo-objects/1/reviews" "401" "Create geo object review"
check_endpoint "POST" "/maps/geo-objects/1/verify" "401" "Verify geo object"
check_endpoint "GET" "/maps/search" "200" "Search on map"

echo ""
echo "🔧 Интеграции:"
check_endpoint "POST" "/integrations/payments/connect" "401" "Connect payment provider"
check_endpoint "GET" "/integrations/payments/providers" "401" "Get connected providers"
check_endpoint "GET" "/integrations/payments/transactions" "401" "Get payment transactions"
check_endpoint "POST" "/integrations/payments/transactions/1/refund" "401" "Refund transaction"
check_endpoint "POST" "/integrations/messengers/whatsapp/send" "401" "Send WhatsApp message"
check_endpoint "POST" "/integrations/messengers/telegram/send" "401" "Send Telegram message"
check_endpoint "GET" "/integrations/crm/contacts" "401" "Get CRM contacts"
check_endpoint "POST" "/integrations/crm/contacts/1/sync" "401" "Sync CRM contact"

echo ""
echo "🎁 Рефералы:"
check_endpoint "POST" "/referrals/apply" "400" "Apply referral code"
check_endpoint "POST" "/referrals/generate" "401" "Generate referral code"
check_endpoint "GET" "/referrals/stats" "401" "Get referral stats"

echo ""
echo "📺 Live стриминг:"
check_endpoint "GET" "/livestreams" "401" "Get live streams"
check_endpoint "GET" "/livestreams/active" "200" "Get active streams"
check_endpoint "POST" "/livestreams/start" "401" "Start live stream"
check_endpoint "POST" "/livestreams/1/end" "401" "End live stream"
check_endpoint "POST" "/livestreams/1/donate" "401" "Donate to stream"
check_endpoint "POST" "/livestreams/1/publish" "401" "Publish live stream"

echo ""
echo "🎵 Голосовые комнаты:"
check_endpoint "POST" "/voicerooms/create" "401" "Create voice room"
check_endpoint "GET" "/voicerooms/1" "401" "Get voice room"
check_endpoint "POST" "/voicerooms/1/join" "401" "Join voice room"
check_endpoint "POST" "/voicerooms/1/record" "401" "Record voice room"
check_endpoint "POST" "/voicerooms/1/record/1/stop" "401" "Stop recording"
check_endpoint "POST" "/voicerooms/group/create" "401" "Create group voice room"

echo ""
echo "📊 Аналитика:"
check_endpoint "GET" "/analytics/user" "401" "Get user analytics"
check_endpoint "GET" "/analytics/platform" "401" "Get platform analytics"
check_endpoint "GET" "/analytics/revenue" "401" "Get revenue analytics"
check_endpoint "GET" "/analytics/engagement" "401" "Get engagement metrics"
check_endpoint "GET" "/analytics/videos/1/heatmap" "401" "Get video heatmap"
check_endpoint "GET" "/analytics/videos/1/multicast" "401" "Get video multicast"

echo ""
echo "🛡️ Модерация:"
check_endpoint "GET" "/moderation/videos" "401" "Get videos for moderation"
check_endpoint "POST" "/moderation/videos/1/approve" "401" "Approve video"
check_endpoint "POST" "/moderation/videos/1/reject" "401" "Reject video"
check_endpoint "GET" "/moderation/comments" "401" "Get comments for moderation"
check_endpoint "POST" "/moderation/comments/1/approve" "401" "Approve comment"
check_endpoint "POST" "/moderation/comments/1/reject" "401" "Reject comment"
check_endpoint "GET" "/moderation/streams" "401" "Get streams for moderation"
check_endpoint "POST" "/moderation/streams/1/ban" "401" "Ban stream"
check_endpoint "POST" "/moderation/streams/1/suspend" "401" "Suspend stream"

echo ""
echo "👑 Администрирование:"
check_endpoint "GET" "/admin/support/tickets" "401" "Get all support tickets"
check_endpoint "PATCH" "/admin/support/tickets/1" "401" "Update ticket status"
check_endpoint "POST" "/admin/support/tickets/1/replies" "401" "Create admin reply"
check_endpoint "GET" "/admin/users" "401" "Get all users"
check_endpoint "POST" "/admin/users/1/ban" "401" "Ban user"
check_endpoint "POST" "/admin/users/1/unban" "401" "Unban user"
check_endpoint "PUT" "/admin/users/1/role" "401" "Change user role"
check_endpoint "POST" "/admin/users/1/suspend" "401" "Suspend user"

echo ""
echo "🎬 HLS стриминг:"
check_endpoint "GET" "/hls/1/playlist.m3u8" "401" "Get HLS playlist"
check_endpoint "GET" "/hls/1/master.m3u8" "401" "Get HLS master playlist"
check_endpoint "GET" "/hls/1/preview.mp4" "401" "Get HLS preview"
check_endpoint "GET" "/hls/1/thumbnail.jpg" "401" "Get HLS thumbnail"
check_endpoint "GET" "/hls/1/segment1.ts" "401" "Get HLS segment"
check_endpoint "GET" "/hls/live/1/playlist.m3u8" "401" "Get live HLS playlist"
check_endpoint "GET" "/hls/live/1/segment1.ts" "401" "Get live HLS segment"
check_endpoint "GET" "/hls/1/status" "401" "Get HLS status"

echo ""
echo "🔌 WebSocket:"
check_endpoint "GET" "/ws/calls/1" "401" "Call WebSocket"

echo ""
echo "💬 Комментарии:"
check_endpoint "POST" "/comments/1/like" "401" "Like comment"
check_endpoint "POST" "/comments/1/reply" "401" "Reply to comment"
check_endpoint "GET" "/comments/1/replies" "401" "Get comment replies"
check_endpoint "DELETE" "/comments/1" "401" "Delete comment"

echo ""
echo "🆘 Поддержка:"
check_endpoint "GET" "/support/tickets" "401" "Get support tickets"
check_endpoint "POST" "/support/tickets" "401" "Create support ticket"
check_endpoint "POST" "/support/tickets/1/replies" "401" "Create support reply"

echo ""
echo "=================================="
echo "📊 ИТОГОВАЯ СТАТИСТИКА:"
echo "Всего endpoints: $total"
echo "Работают: $working"
echo "Не работают: $not_working"
echo "Требуют авторизацию: $auth_required"
echo "Процент работающих: $(( working * 100 / total ))%"
echo "=================================="