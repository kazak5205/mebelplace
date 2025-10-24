#!/bin/bash

# Финальный отчет по всем эндпоинтам MebelPlace
DOMAIN="https://mebelplace.com.kz"
REPORT="/opt/mebelplace/ENDPOINTS_REPORT.md"

echo "# Отчет по эндпоинтам MebelPlace" > $REPORT
echo "**Дата:** $(date)" >> $REPORT
echo "**Домен:** $DOMAIN" >> $REPORT
echo "" >> $REPORT

check() {
    local method=$1
    local endpoint=$2
    local desc=$3
    local data=$4
    
    sleep 0.3
    
    if [ "$method" = "GET" ]; then
        code=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN$endpoint")
    else
        code=$(curl -s -o /dev/null -w "%{http_code}" -H "Content-Type: application/json" -d "$data" -X $method "$DOMAIN$endpoint")
    fi
    
    if [ "$code" = "200" ] || [ "$code" = "201" ]; then
        echo "| ✅ | $method | \`$endpoint\` | $desc | $code |" >> $REPORT
    elif [ "$code" = "401" ] || [ "$code" = "403" ]; then
        echo "| ⚠️ | $method | \`$endpoint\` | $desc | $code (auth required) |" >> $REPORT
    elif [ "$code" = "400" ]; then
        echo "| ⚠️ | $method | \`$endpoint\` | $desc | $code (bad request) |" >> $REPORT
    elif [ "$code" = "404" ]; then
        echo "| ❌ | $method | \`$endpoint\` | $desc | $code (NOT FOUND) |" >> $REPORT
    elif [ "$code" = "500" ]; then
        echo "| ❌ | $method | \`$endpoint\` | $desc | $code (SERVER ERROR) |" >> $REPORT
    else
        echo "| ❓ | $method | \`$endpoint\` | $desc | $code |" >> $REPORT
    fi
}

echo "## 1. Health & System" >> $REPORT
echo "" >> $REPORT
echo "| Status | Method | Endpoint | Description | Code |" >> $REPORT
echo "|--------|--------|----------|-------------|------|" >> $REPORT
check "GET" "/api/health" "Health check"

echo "" >> $REPORT
echo "## 2. Authentication (auth)" >> $REPORT
echo "" >> $REPORT
echo "| Status | Method | Endpoint | Description | Code |" >> $REPORT
echo "|--------|--------|----------|-------------|------|" >> $REPORT
check "POST" "/api/auth/register" "Register user" '{"phone":"+77779998877","username":"testuser999","password":"test123456"}'
check "POST" "/api/auth/login" "Login" '{"phone":"+77001234567","password":"test123"}'
check "POST" "/api/auth/refresh" "Refresh token" '{"refreshToken":"test"}'
check "GET" "/api/auth/me" "Get current user"
check "PUT" "/api/auth/profile" "Update profile"
check "POST" "/api/auth/logout" "Logout"
check "POST" "/api/auth/verify-email" "Verify email"
check "POST" "/api/auth/forgot-password" "Forgot password"
check "POST" "/api/auth/reset-password" "Reset password"

echo "" >> $REPORT
echo "## 3. Videos (videos)" >> $REPORT
echo "" >> $REPORT
echo "| Status | Method | Endpoint | Description | Code |" >> $REPORT
echo "|--------|--------|----------|-------------|------|" >> $REPORT
check "GET" "/api/videos/feed" "Get video feed"
check "POST" "/api/videos/upload" "Upload video"
check "GET" "/api/videos/1" "Get single video"
check "POST" "/api/videos/1/like" "Like video"
check "POST" "/api/videos/1/comment" "Add comment"
check "GET" "/api/videos/1/comments" "Get comments"
check "POST" "/api/videos/1/view" "Record view"
check "POST" "/api/videos/comments/1/like" "Like comment"
check "GET" "/api/videos/trending" "Get trending"
check "GET" "/api/videos/bookmarked" "Get bookmarked"
check "POST" "/api/videos/1/bookmark" "Bookmark video"
check "DELETE" "/api/videos/1/bookmark" "Remove bookmark"

echo "" >> $REPORT
echo "## 4. Search (search)" >> $REPORT
echo "" >> $REPORT
echo "| Status | Method | Endpoint | Description | Code |" >> $REPORT
echo "|--------|--------|----------|-------------|------|" >> $REPORT
check "GET" "/api/search?q=мебель" "Search all"
check "GET" "/api/search?q=test&type=video" "Search videos"
check "GET" "/api/search?q=test&type=channel" "Search channels"

echo "" >> $REPORT
echo "## 5. Notifications (notifications)" >> $REPORT
echo "" >> $REPORT
echo "| Status | Method | Endpoint | Description | Code |" >> $REPORT
echo "|--------|--------|----------|-------------|------|" >> $REPORT
check "GET" "/api/notifications" "Get notifications"
check "GET" "/api/notifications/unread-count" "Get unread count"
check "PUT" "/api/notifications/1/read" "Mark as read"
check "PUT" "/api/notifications/read-all" "Mark all as read"
check "DELETE" "/api/notifications/1" "Delete notification"
check "POST" "/api/notifications/test-sms" "Test SMS"
check "GET" "/api/notifications/sms-balance" "Get SMS balance"

echo "" >> $REPORT
echo "## 6. Orders (orders)" >> $REPORT
echo "" >> $REPORT
echo "| Status | Method | Endpoint | Description | Code |" >> $REPORT
echo "|--------|--------|----------|-------------|------|" >> $REPORT
check "POST" "/api/orders/create" "Create order"
check "GET" "/api/orders/feed" "Get orders feed"
check "GET" "/api/orders/1" "Get single order"
check "POST" "/api/orders/1/response" "Respond to order"
check "POST" "/api/orders/1/accept" "Accept response"
check "POST" "/api/orders/1/reject" "Reject response"
check "PUT" "/api/orders/1/status" "Update status"
check "GET" "/api/orders/categories" "Get categories"
check "GET" "/api/orders/regions" "Get regions"
check "GET" "/api/orders/1/responses" "Get responses"

echo "" >> $REPORT
echo "## 7. Chat (chat)" >> $REPORT
echo "" >> $REPORT
echo "| Status | Method | Endpoint | Description | Code |" >> $REPORT
echo "|--------|--------|----------|-------------|------|" >> $REPORT
check "POST" "/api/chat/create" "Create chat"
check "GET" "/api/chat/list" "Get chat list"
check "GET" "/api/chat/1" "Get single chat"
check "GET" "/api/chat/1/messages" "Get messages"
check "POST" "/api/chat/1/message" "Send message"
check "PUT" "/api/chat/1/read" "Mark as read"
check "POST" "/api/chat/1/leave" "Leave chat"
check "POST" "/api/chat/1/add-participant" "Add participant"

echo "" >> $REPORT
echo "## 8. Push Notifications (push)" >> $REPORT
echo "" >> $REPORT
echo "| Status | Method | Endpoint | Description | Code |" >> $REPORT
echo "|--------|--------|----------|-------------|------|" >> $REPORT
check "GET" "/api/push/vapid-key" "Get VAPID key"
check "POST" "/api/push/subscribe" "Subscribe"
check "DELETE" "/api/push/unsubscribe" "Unsubscribe"
check "POST" "/api/push/test" "Test push"
check "GET" "/api/push/stats" "Get stats"
check "POST" "/api/push/cleanup" "Cleanup"
check "POST" "/api/push/send-to-all" "Send to all"

echo "" >> $REPORT
echo "## 9. Admin (admin)" >> $REPORT
echo "" >> $REPORT
echo "| Status | Method | Endpoint | Description | Code |" >> $REPORT
echo "|--------|--------|----------|-------------|------|" >> $REPORT
check "GET" "/api/admin/dashboard" "Get dashboard"
check "GET" "/api/admin/analytics/videos" "Get video analytics"
check "GET" "/api/admin/videos" "Get all videos"
check "POST" "/api/admin/videos/upload" "Upload video"
check "PUT" "/api/admin/videos/1/priority" "Update priority"
check "PUT" "/api/admin/videos/1/status" "Update status"
check "DELETE" "/api/admin/videos/1" "Delete video"
check "GET" "/api/admin/users" "Get all users"
check "PUT" "/api/admin/users/1/status" "Update user status"
check "GET" "/api/admin/categories" "Get categories"
check "POST" "/api/admin/categories" "Create category"
check "PUT" "/api/admin/categories/1" "Update category"
check "DELETE" "/api/admin/categories/1" "Delete category"
check "GET" "/api/admin/audit-log" "Get audit log"

echo "" >> $REPORT
echo "## Сводка" >> $REPORT
echo "" >> $REPORT
echo "- ✅ - Работает корректно" >> $REPORT
echo "- ⚠️ - Требует аутентификации (ожидаемое поведение)" >> $REPORT
echo "- ❌ - Ошибка (требует исправления)" >> $REPORT
echo "- ❓ - Неожиданный статус" >> $REPORT

cat $REPORT
echo ""
echo "====================================="
echo "Отчет сохранен в: $REPORT"
echo "====================================="

