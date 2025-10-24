#!/bin/bash

# Скрипт для проверки всех эндпоинтов на домене mebelplace.com.kz
DOMAIN="https://mebelplace.com.kz"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "Проверка эндпоинтов на $DOMAIN"
echo "========================================="
echo ""

# Функция для проверки эндпоинта
check_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    local token=$5
    
    echo -n "[$method] $endpoint - $description: "
    
    if [ -n "$token" ]; then
        if [ "$method" = "GET" ]; then
            response=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $token" "$DOMAIN$endpoint")
        elif [ "$method" = "POST" ]; then
            response=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d "$data" -X POST "$DOMAIN$endpoint")
        elif [ "$method" = "PUT" ]; then
            response=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d "$data" -X PUT "$DOMAIN$endpoint")
        elif [ "$method" = "DELETE" ]; then
            response=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $token" -X DELETE "$DOMAIN$endpoint")
        fi
    else
        if [ "$method" = "GET" ]; then
            response=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN$endpoint")
        elif [ "$method" = "POST" ]; then
            response=$(curl -s -o /dev/null -w "%{http_code}" -H "Content-Type: application/json" -d "$data" -X POST "$DOMAIN$endpoint")
        fi
    fi
    
    if [ "$response" = "200" ] || [ "$response" = "201" ]; then
        echo -e "${GREEN}✓ $response${NC}"
    elif [ "$response" = "400" ] || [ "$response" = "401" ] || [ "$response" = "403" ]; then
        echo -e "${YELLOW}⚠ $response (expected)${NC}"
    elif [ "$response" = "404" ]; then
        echo -e "${RED}✗ $response (NOT FOUND)${NC}"
    else
        echo -e "${RED}✗ $response${NC}"
    fi
}

echo "=== HEALTH CHECK ==="
check_endpoint "GET" "/api/health" "Health check"

echo ""
echo "=== AUTH ENDPOINTS ==="
check_endpoint "POST" "/api/auth/register" "Register user" '{"phone":"+77001234567","username":"testuser","password":"test123"}'
check_endpoint "POST" "/api/auth/login" "Login user" '{"phone":"+77001234567","password":"test123"}'
check_endpoint "POST" "/api/auth/refresh" "Refresh token" '{"refreshToken":"dummy"}'
check_endpoint "GET" "/api/auth/me" "Get current user"
check_endpoint "PUT" "/api/auth/profile" "Update profile" '{"firstName":"Test"}'
check_endpoint "POST" "/api/auth/logout" "Logout" '{}'
check_endpoint "POST" "/api/auth/verify-email" "Verify email" '{"email":"test@test.com","code":"123456"}'
check_endpoint "POST" "/api/auth/forgot-password" "Forgot password" '{"email":"test@test.com"}'
check_endpoint "POST" "/api/auth/reset-password" "Reset password" '{"email":"test@test.com","code":"123","newPassword":"newpass"}'

echo ""
echo "=== VIDEO ENDPOINTS ==="
check_endpoint "GET" "/api/videos/feed" "Get video feed"
check_endpoint "POST" "/api/videos/upload" "Upload video (requires auth)"
check_endpoint "GET" "/api/videos/1" "Get single video"
check_endpoint "POST" "/api/videos/1/like" "Like video"
check_endpoint "POST" "/api/videos/1/comment" "Add comment" '{"content":"Test comment"}'
check_endpoint "GET" "/api/videos/1/comments" "Get comments"
check_endpoint "POST" "/api/videos/1/view" "Record view" '{}'
check_endpoint "POST" "/api/videos/comments/1/like" "Like comment"
check_endpoint "GET" "/api/videos/trending" "Get trending videos"
check_endpoint "GET" "/api/videos/bookmarked" "Get bookmarked videos"
check_endpoint "POST" "/api/videos/1/bookmark" "Bookmark video"
check_endpoint "DELETE" "/api/videos/1/bookmark" "Remove bookmark"

echo ""
echo "=== SEARCH ENDPOINTS ==="
check_endpoint "GET" "/api/search?q=test" "Search all"
check_endpoint "GET" "/api/search?q=test&type=video" "Search videos"
check_endpoint "GET" "/api/search?q=test&type=channel" "Search channels"

echo ""
echo "=== NOTIFICATION ENDPOINTS ==="
check_endpoint "GET" "/api/notifications" "Get notifications"
check_endpoint "GET" "/api/notifications/unread-count" "Get unread count"
check_endpoint "PUT" "/api/notifications/1/read" "Mark as read"
check_endpoint "PUT" "/api/notifications/read-all" "Mark all as read"
check_endpoint "DELETE" "/api/notifications/1" "Delete notification"
check_endpoint "POST" "/api/notifications/test-sms" "Test SMS" '{"phone":"+77001234567","message":"Test"}'
check_endpoint "GET" "/api/notifications/sms-balance" "Get SMS balance"

echo ""
echo "=== ORDER ENDPOINTS ==="
check_endpoint "POST" "/api/orders/create" "Create order" '{"title":"Test","description":"Test order"}'
check_endpoint "GET" "/api/orders/feed" "Get orders feed"
check_endpoint "GET" "/api/orders/1" "Get single order"
check_endpoint "POST" "/api/orders/1/response" "Respond to order" '{"message":"Test response"}'
check_endpoint "POST" "/api/orders/1/accept" "Accept response" '{"responseId":1}'
check_endpoint "POST" "/api/orders/1/reject" "Reject response" '{"responseId":1}'
check_endpoint "PUT" "/api/orders/1/status" "Update order status" '{"status":"in_progress"}'
check_endpoint "GET" "/api/orders/categories" "Get order categories"
check_endpoint "GET" "/api/orders/regions" "Get regions"
check_endpoint "GET" "/api/orders/1/responses" "Get order responses"
check_endpoint "POST" "/api/orders/1/responses" "Create response" '{"message":"Test"}'

echo ""
echo "=== CHAT ENDPOINTS ==="
check_endpoint "POST" "/api/chat/create" "Create chat" '{"participants":[1,2]}'
check_endpoint "GET" "/api/chat/list" "Get chat list"
check_endpoint "GET" "/api/chat/1" "Get single chat"
check_endpoint "GET" "/api/chat/1/messages" "Get messages"
check_endpoint "POST" "/api/chat/1/message" "Send message" '{"content":"Test message"}'
check_endpoint "PUT" "/api/chat/1/read" "Mark as read"
check_endpoint "POST" "/api/chat/1/leave" "Leave chat"
check_endpoint "POST" "/api/chat/1/add-participant" "Add participant" '{"participantId":2}'

echo ""
echo "=== PUSH ENDPOINTS ==="
check_endpoint "GET" "/api/push/vapid-key" "Get VAPID key"
check_endpoint "POST" "/api/push/subscribe" "Subscribe to push" '{"subscription":{"endpoint":"test"}}'
check_endpoint "DELETE" "/api/push/unsubscribe" "Unsubscribe from push" '{"endpoint":"test"}'
check_endpoint "POST" "/api/push/test" "Test push" '{"title":"Test","message":"Test message"}'
check_endpoint "GET" "/api/push/stats" "Get push stats"
check_endpoint "POST" "/api/push/cleanup" "Cleanup subscriptions"
check_endpoint "POST" "/api/push/send-to-all" "Send to all" '{"title":"Test","message":"Test"}'

echo ""
echo "=== ADMIN ENDPOINTS ==="
check_endpoint "GET" "/api/admin/dashboard" "Get dashboard"
check_endpoint "GET" "/api/admin/analytics/videos" "Get video analytics"
check_endpoint "GET" "/api/admin/videos" "Get all videos"
check_endpoint "POST" "/api/admin/videos/upload" "Upload admin video"
check_endpoint "PUT" "/api/admin/videos/1/priority" "Update video priority" '{"priorityOrder":1}'
check_endpoint "PUT" "/api/admin/videos/1/status" "Update video status" '{"isActive":true}'
check_endpoint "DELETE" "/api/admin/videos/1" "Delete video"
check_endpoint "GET" "/api/admin/users" "Get all users"
check_endpoint "PUT" "/api/admin/users/1/status" "Update user status" '{"isActive":true}'
check_endpoint "GET" "/api/admin/categories" "Get categories"
check_endpoint "POST" "/api/admin/categories" "Create category" '{"name":"Test","slug":"test"}'
check_endpoint "PUT" "/api/admin/categories/1" "Update category" '{"name":"Updated"}'
check_endpoint "DELETE" "/api/admin/categories/1" "Delete category"
check_endpoint "GET" "/api/admin/audit-log" "Get audit log"

echo ""
echo "========================================="
echo "Проверка завершена"
echo "========================================="

