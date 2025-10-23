#!/bin/bash

# MebelPlace Chat API Test Script
# Real program for testing API endpoints

# Configuration
BASE_URL="https://mebelplace.com.kz"
API_URL="$BASE_URL/api/chat"
JWT_TOKEN="your_jwt_token_here"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if JWT token is provided
if [ "$JWT_TOKEN" = "your_jwt_token_here" ]; then
    print_error "Please set JWT_TOKEN variable in the script"
    exit 1
fi

print_status "Testing MebelPlace Chat API..."

# Test 1: Health Check
print_status "1. Testing health check..."
curl -s "$BASE_URL/api/health" | jq '.' || print_warning "Health check failed or jq not installed"

# Test 2: Create Chat
print_status "2. Testing chat creation..."
CHAT_RESPONSE=$(curl -s -X POST "$API_URL/create" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "participants": ["test_user_1", "test_user_2"],
    "type": "private",
    "name": "Test Chat"
  }')

echo "$CHAT_RESPONSE" | jq '.' || echo "$CHAT_RESPONSE"

# Extract chat ID from response
CHAT_ID=$(echo "$CHAT_RESPONSE" | jq -r '.data.id' 2>/dev/null)

if [ "$CHAT_ID" != "null" ] && [ -n "$CHAT_ID" ]; then
    print_status "Chat created successfully with ID: $CHAT_ID"
    
    # Test 3: Get Chat List
    print_status "3. Testing chat list..."
    curl -s -X GET "$API_URL/list" \
      -H "Authorization: Bearer $JWT_TOKEN" | jq '.' || print_warning "Failed to get chat list"
    
    # Test 4: Send Message
    print_status "4. Testing message sending..."
    curl -s -X POST "$API_URL/$CHAT_ID/message" \
      -H "Authorization: Bearer $JWT_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "content": "Hello from API test!",
        "type": "text"
      }' | jq '.' || print_warning "Failed to send message"
    
    # Test 5: Get Messages
    print_status "5. Testing message retrieval..."
    curl -s -X GET "$API_URL/$CHAT_ID/messages" \
      -H "Authorization: Bearer $JWT_TOKEN" | jq '.' || print_warning "Failed to get messages"
    
else
    print_error "Failed to create chat, skipping dependent tests"
fi

# Test 6: Test without authentication (should fail)
print_status "6. Testing unauthorized access (should fail)..."
curl -s -X GET "$API_URL/list" | jq '.' || print_warning "Expected failure for unauthorized access"

print_status "API testing completed!"

# WebSocket connection test (basic)
print_status "7. Testing WebSocket connection..."
if command -v wscat &> /dev/null; then
    echo "WebSocket test requires manual connection with wscat:"
    echo "wscat -c wss://mebelplace.com.kz/socket.io/?token=$JWT_TOKEN"
else
    print_warning "wscat not installed. Install with: npm install -g wscat"
fi

print_status "All tests completed!"
