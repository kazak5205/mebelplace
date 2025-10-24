#!/bin/bash

# Детальная проверка эндпоинтов с задержками (чтобы обойти rate limiting)
DOMAIN="https://mebelplace.com.kz"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

REPORT_FILE="/opt/mebelplace/endpoint-test-report.txt"
> $REPORT_FILE

echo "=========================================" | tee -a $REPORT_FILE
echo "Детальная проверка эндпоинтов" | tee -a $REPORT_FILE
echo "Домен: $DOMAIN" | tee -a $REPORT_FILE
echo "Дата: $(date)" | tee -a $REPORT_FILE
echo "=========================================" | tee -a $REPORT_FILE
echo "" | tee -a $REPORT_FILE

# Функция для проверки с детальным выводом
check_detailed() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    
    sleep 0.5  # Задержка для обхода rate limiting
    
    echo -n "[$method] $endpoint - $description: " | tee -a $REPORT_FILE
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}\n" "$DOMAIN$endpoint")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}\n" -H "Content-Type: application/json" -d "$data" -X POST "$DOMAIN$endpoint")
    fi
    
    status_code=$(echo "$response" | tail -1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$status_code" = "200" ] || [ "$status_code" = "201" ]; then
        echo -e "${GREEN}✓ $status_code${NC}" | tee -a $REPORT_FILE
    elif [ "$status_code" = "400" ] || [ "$status_code" = "401" ] || [ "$status_code" = "403" ]; then
        echo -e "${YELLOW}⚠ $status_code${NC}" | tee -a $REPORT_FILE
    elif [ "$status_code" = "404" ]; then
        echo -e "${RED}✗ $status_code (NOT FOUND)${NC}" | tee -a $REPORT_FILE
        echo "  Response: $body" >> $REPORT_FILE
    elif [ "$status_code" = "500" ]; then
        echo -e "${RED}✗ $status_code (SERVER ERROR)${NC}" | tee -a $REPORT_FILE
        echo "  Response: $body" >> $REPORT_FILE
    elif [ "$status_code" = "503" ]; then
        echo -e "${RED}✗ $status_code (RATE LIMITED)${NC}" | tee -a $REPORT_FILE
    else
        echo -e "${RED}✗ $status_code${NC}" | tee -a $REPORT_FILE
        echo "  Response: $body" >> $REPORT_FILE
    fi
}

echo "=== Критичные эндпоинты ===" | tee -a $REPORT_FILE
check_detailed "GET" "/api/health" "Health check"
check_detailed "GET" "/api/videos/feed" "Video feed"
check_detailed "GET" "/api/search?q=мебель" "Search"
check_detailed "POST" "/api/auth/register" "Register" '{"phone":"+77773456789","username":"testuser3","password":"test123456"}'
check_detailed "GET" "/api/orders/categories" "Order categories"
check_detailed "GET" "/api/orders/regions" "Regions"

echo "" | tee -a $REPORT_FILE
echo "=== Эндпоинты с ошибками 500 ===" | tee -a $REPORT_FILE
check_detailed "POST" "/api/auth/login" "Login" '{"phone":"+77001234567","password":"test123"}'
check_detailed "GET" "/api/videos/1" "Get video by ID"
check_detailed "GET" "/api/videos/1/comments" "Get video comments"
check_detailed "POST" "/api/videos/1/view" "Record video view" '{}'
check_detailed "GET" "/api/videos/trending" "Get trending videos"

echo "" | tee -a $REPORT_FILE
echo "=== Эндпоинты с ошибками 404 ===" | tee -a $REPORT_FILE
check_detailed "POST" "/api/auth/verify-email" "Verify email" '{"email":"test@test.com","code":"123"}'
check_detailed "POST" "/api/auth/reset-password" "Reset password" '{"email":"test@test.com","code":"123","newPassword":"newpass"}'

echo "" | tee -a $REPORT_FILE
echo "=== Push эндпоинты ===" | tee -a $REPORT_FILE
check_detailed "GET" "/api/push/vapid-key" "Get VAPID key"

echo "" | tee -a $REPORT_FILE
echo "=========================================" | tee -a $REPORT_FILE
echo "Отчет сохранен в: $REPORT_FILE" | tee -a $REPORT_FILE
echo "=========================================" | tee -a $REPORT_FILE

