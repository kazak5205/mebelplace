# 🎯 ПЛАН ИСПРАВЛЕНИЯ BACKEND ДЛЯ 100% СООТВЕТСТВИЯ OPENAPI

## 📊 Текущее состояние
- **OpenAPI endpoints**: 200
- **Реализованные endpoints**: ~166 (83%)
- **Работающие endpoints**: 13 (7%)
- **Цель**: 100% соответствие OpenAPI + 100% прохождение тестов

---

## 🔍 АНАЛИЗ НЕСООТВЕТСТВИЙ

### 1. **Отсутствующие endpoints в backend**

#### **Системные endpoints (System)**
- [ ] `/ratelimit/status` - ✅ Реализован
- [ ] `/health` - ✅ Реализован  
- [ ] `/live` - ✅ Реализован
- [ ] `/ready` - ✅ Реализован
- [ ] `/metrics` - ✅ Реализован

#### **Аутентификация (Authentication)**
- [ ] `/auth/register` - ✅ Реализован
- [ ] `/auth/verify-sms` - ✅ Реализован
- [ ] `/auth/verify-email` - ✅ Реализован
- [ ] `/auth/login` - ✅ Реализован
- [ ] `/auth/refresh` - ✅ Реализован
- [ ] `/auth/logout` - ✅ Реализован
- [ ] `/auth/oauth/authorize` - ✅ Реализован
- [ ] `/auth/oauth/token` - ✅ Реализован
- [ ] `/auth/oauth/revoke` - ✅ Реализован

#### **Пользователи (Users)**
- [ ] `/users/me` - ✅ Реализован
- [ ] `/users/me/avatar` - ✅ Реализован
- [ ] `/users/{id}` - ✅ Реализован
- [ ] `/users/{id}/block` - ✅ Реализован
- [ ] `/users/blocked` - ✅ Реализован

#### **Видео (Videos)**
- [ ] `/videos/{id}` - ✅ Реализован
- [ ] `/videos/feed` - ✅ Реализован
- [ ] `/videos/upload` - ✅ Реализован
- [ ] `/videos/{id}/like` - ✅ Реализован
- [ ] `/videos/{id}/unlike` - ✅ Реализован
- [ ] `/videos/{id}/comments` - ✅ Реализован
- [ ] `/videos/{id}/analyze` - ✅ Реализован

#### **Заявки (Requests)**
- [ ] `/requests` - ✅ Реализован
- [ ] `/requests/{id}` - ✅ Реализован
- [ ] `/requests/{id}/proposals` - ✅ Реализован
- [ ] `/requests/{id}/proposals/{proposal_id}/accept` - ✅ Реализован

#### **Чаты (Chats)**
- [ ] `/chats` - ✅ Реализован
- [ ] `/chats/{id}/messages` - ✅ Реализован

#### **Каналы (Channels)**
- [ ] `/channels` - ✅ Реализован
- [ ] `/channels/{id}/posts` - ✅ Реализован
- [ ] `/channels/{id}/subscribe` - ✅ Реализован
- [ ] `/channels/{id}/unsubscribe` - ✅ Реализован

#### **Подписки (Subscriptions)**
- [ ] `/subscriptions/{channel_id}` - ✅ Реализован
- [ ] `/subscriptions/my` - ✅ Реализован

#### **Поиск (Search)**
- [ ] `/search` - ✅ Реализован
- [ ] `/search/users` - ✅ Реализован
- [ ] `/search/masters` - ✅ Реализован

#### **Уведомления (Notifications)**
- [ ] `/notifications` - ✅ Реализован
- [ ] `/notifications/{id}/read` - ✅ Реализован
- [ ] `/notifications/read-all` - ✅ Реализован
- [ ] `/notifications/settings` - ✅ Реализован
- [ ] `/notifications/push-token` - ✅ Реализован
- [ ] `/notifications/broadcast` - ✅ Реализован
- [ ] `/notifications/templates` - ✅ Реализован

#### **Сторисы (Stories)**
- [ ] `/stories` - ✅ Реализован
- [ ] `/stories/{id}/view` - ✅ Реализован
- [ ] `/stories/{id}` - ✅ Реализован
- [ ] `/stories/{id}/like` - ✅ Реализован

#### **Групповые чаты (Group Chats)**
- [ ] `/group-chats` - ✅ Реализован
- [ ] `/group-chats/{id}` - ✅ Реализован
- [ ] `/group-chats/{id}/members` - ✅ Реализован
- [ ] `/group-chats/{id}/messages` - ✅ Реализован
- [ ] `/group-chats/{id}/leave` - ✅ Реализован

#### **Письменные каналы (Written Channels)**
- [ ] `/written-channels` - ✅ Реализован
- [ ] `/written-channels/{id}/subscribe` - ✅ Реализован
- [ ] `/written-channels/{id}/unsubscribe` - ✅ Реализован
- [ ] `/written-channels/{id}/posts` - ❌ **ПРОБЛЕМА**: 500 ошибка

#### **Поддержка (Support)**
- [ ] `/support/tickets` - ✅ Реализован
- [ ] `/support/tickets/{id}/replies` - ✅ Реализован

#### **Комментарии (Comments)**
- [ ] `/comments/{id}/like` - ✅ Реализован
- [ ] `/comments/{id}/reply` - ✅ Реализован
- [ ] `/comments/{id}/replies` - ✅ Реализован
- [ ] `/comments/{id}` - ✅ Реализован

#### **Геймификация (Gamification)**
- [ ] `/gamification/level` - ✅ Реализован
- [ ] `/gamification/achievements` - ✅ Реализован
- [ ] `/gamification/leaderboard` - ✅ Реализован
- [ ] `/gamification/award-points` - ✅ Реализован
- [ ] `/gamification/rules` - ✅ Реализован
- [ ] `/gamification/rules/{id}` - ✅ Реализован
- [ ] `/gamification/leaderboard/advanced` - ✅ Реализован
- [ ] `/gamification/achievements/user/{user_id}` - ✅ Реализован
- [ ] `/gamification/levels` - ✅ Реализован

#### **Звонки (Calls)**
- [ ] `/calls` - ✅ Реализован
- [ ] `/calls/initiate` - ✅ Реализован
- [ ] `/calls/initiate-secure` - ✅ Реализован
- [ ] `/calls/{id}/answer` - ✅ Реализован
- [ ] `/calls/{id}/end` - ✅ Реализован
- [ ] `/calls/{id}/cancel` - ✅ Реализован
- [ ] `/calls/history` - ✅ Реализован
- [ ] `/calls/active` - ✅ Реализован
- [ ] `/calls/{id}/webrtc-token` - ✅ Реализован
- [ ] `/calls/statistics` - ✅ Реализован
- [ ] `/calls/{id}/webrtc-token-enhanced` - ✅ Реализован
- [ ] `/calls/validate-token` - ✅ Реализован
- [ ] `/calls/{id}/notify` - ✅ Реализован
- [ ] `/calls/{id}/webrtc-signal` - ✅ Реализован

#### **AR/3D модели (AR/3D Models)**
- [ ] `/ar3d/models` - ✅ Реализован
- [ ] `/ar3d/models/{product_id}` - ✅ Реализован
- [ ] `/ar3d/models/upload` - ✅ Реализован
- [ ] `/ar3d/models/{id}/versions` - ✅ Реализован
- [ ] `/ar3d/models/{id}/versions/{version_id}/activate` - ✅ Реализован
- [ ] `/ar3d/models/validate` - ✅ Реализован
- [ ] `/ar3d/models/{id}/render` - ✅ Реализован
- [ ] `/ar3d/models/{id}/preview` - ✅ Реализован
- [ ] `/ar3d/models/search` - ✅ Реализован

#### **Карты (Maps)**
- [ ] `/maps/masters` - ✅ Реализован
- [ ] `/maps/location` - ✅ Реализован
- [ ] `/maps/geo-objects` - ✅ Реализован
- [ ] `/maps/geo-objects/{id}` - ✅ Реализован
- [ ] `/maps/search` - ✅ Реализован
- [ ] `/maps/geo-objects/{id}/reviews` - ✅ Реализован
- [ ] `/maps/geo-objects/{id}/verify` - ✅ Реализован

#### **Интеграции (Integrations)**
- [ ] `/integrations/payments/connect` - ✅ Реализован
- [ ] `/integrations/payments/providers` - ✅ Реализован
- [ ] `/integrations/payments/transactions` - ✅ Реализован
- [ ] `/integrations/payments/transactions/{id}/refund` - ✅ Реализован
- [ ] `/integrations/messengers/whatsapp/send` - ✅ Реализован
- [ ] `/integrations/messengers/telegram/send` - ✅ Реализован
- [ ] `/integrations/crm/contacts` - ✅ Реализован
- [ ] `/integrations/crm/contacts/{id}/sync` - ✅ Реализован

#### **Рефералы (Referrals)**
- [ ] `/referrals/apply` - ✅ Реализован
- [ ] `/referrals/generate` - ✅ Реализован
- [ ] `/referrals/stats` - ✅ Реализован

#### **Прямые трансляции (Live Streams)**
- [ ] `/livestreams/active` - ✅ Реализован
- [ ] `/livestreams/start` - ✅ Реализован
- [ ] `/livestreams/{stream_id}/end` - ✅ Реализован
- [ ] `/livestreams` - ✅ Реализован
- [ ] `/livestreams/{stream_id}/donate` - ✅ Реализован
- [ ] `/livestreams/{stream_id}/publish` - ✅ Реализован

#### **Голосовые комнаты (Voice Rooms)**
- [ ] `/voicerooms/create` - ✅ Реализован
- [ ] `/voicerooms/{room_id}` - ✅ Реализован
- [ ] `/voicerooms/{room_id}/join` - ✅ Реализован
- [ ] `/voicerooms/{room_id}/record` - ✅ Реализован
- [ ] `/voicerooms/{room_id}/record/{recording_id}/stop` - ✅ Реализован
- [ ] `/voicerooms/group/create` - ✅ Реализован

#### **HLS стриминг (HLS Streaming)**
- [ ] `/hls/{video_id}/playlist.m3u8` - ✅ Реализован
- [ ] `/hls/{video_id}/{segment}` - ✅ Реализован
- [ ] `/hls/{video_id}/thumbnail.jpg` - ✅ Реализован
- [ ] `/hls/live/{stream_id}/playlist.m3u8` - ✅ Реализован
- [ ] `/hls/live/{stream_id}/{segment}` - ✅ Реализован
- [ ] `/hls/{video_id}/preview.mp4` - ✅ Реализован
- [ ] `/hls/{video_id}/master.m3u8` - ✅ Реализован
- [ ] `/hls/{video_id}/status` - ✅ Реализован

#### **WebRTC**
- [ ] `/ws/calls/{call_id}` - ✅ Реализован

#### **AI анализ**
- [ ] `/videos/{id}/analyze` - ✅ Реализован

#### **Модерация (Moderation)**
- [ ] `/moderation/videos` - ✅ Реализован
- [ ] `/moderation/videos/{id}/approve` - ✅ Реализован
- [ ] `/moderation/videos/{id}/reject` - ✅ Реализован
- [ ] `/moderation/comments` - ✅ Реализован
- [ ] `/moderation/comments/{id}/approve` - ✅ Реализован
- [ ] `/moderation/comments/{id}/reject` - ✅ Реализован
- [ ] `/moderation/streams` - ✅ Реализован
- [ ] `/moderation/streams/{id}/suspend` - ✅ Реализован
- [ ] `/moderation/streams/{id}/ban` - ✅ Реализован

#### **Админка (Admin)**
- [ ] `/admin/support/tickets` - ✅ Реализован
- [ ] `/admin/support/tickets/{id}` - ✅ Реализован
- [ ] `/admin/support/tickets/{id}/replies` - ✅ Реализован
- [ ] `/admin/users` - ✅ Реализован
- [ ] `/admin/users/{id}/ban` - ✅ Реализован
- [ ] `/admin/users/{id}/unban` - ✅ Реализован
- [ ] `/admin/users/{id}/role` - ✅ Реализован
- [ ] `/admin/users/{id}/suspend` - ✅ Реализован

#### **Аналитика (Analytics)**
- [ ] `/analytics/user` - ✅ Реализован
- [ ] `/analytics/platform` - ✅ Реализован
- [ ] `/analytics/revenue` - ✅ Реализован
- [ ] `/analytics/engagement` - ✅ Реализован
- [ ] `/analytics/videos/{id}/heatmap` - ✅ Реализован
- [ ] `/analytics/videos/{id}/multicast` - ✅ Реализован

---

## 🚨 КРИТИЧЕСКИЕ ПРОБЛЕМЫ

### 1. **Проблемы с базой данных**
- [ ] **Отсутствующая таблица**: `written_channel_posts`
- [ ] **Дублирование ключей**: `users_phone_key` constraint violation
- [ ] **Невыполненные миграции**: Проверить все миграции

### 2. **Проблемы с аутентификацией**
- [ ] **401 ошибки**: 85% endpoints возвращают "Authorization header required"
- [ ] **JWT middleware**: Проблемы с валидацией токенов
- [ ] **Токены**: Неправильная передача Authorization header

### 3. **Проблемы с обработкой ошибок**
- [ ] **500 ошибки**: Критические ошибки сервера
- [ ] **Валидация**: Отсутствует валидация входных данных
- [ ] **Error handling**: Некорректная обработка ошибок

---

## 🛠️ ПЛАН ИСПРАВЛЕНИЯ

### **ФАЗА 1: КРИТИЧЕСКИЕ ИСПРАВЛЕНИЯ (0-30%)**
**Время: 1-2 недели**

#### 1.1 Исправление базы данных
```bash
cd /opt/mebelplace/apps/backend

# 1. Проверить миграции
ls -la migrations/
grep -r "written_channel_posts" migrations/

# 2. Создать отсутствующую таблицу
# Добавить в migrations/:
CREATE TABLE written_channel_posts (
    id BIGSERIAL PRIMARY KEY,
    channel_id BIGINT NOT NULL REFERENCES written_channels(id) ON DELETE CASCADE,
    author_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    media_urls TEXT[],
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

# 3. Исправить дублирование ключей
# В internal/http/v2/auth/handler.go:
# Добавить проверку существования пользователя перед созданием
```

#### 1.2 Исправление 500 ошибок
```go
// В internal/http/v2/writtenchannels/handler.go
// Исправить GetPosts метод:
func (h *Handler) GetPosts(c *gin.Context) {
    // Добавить проверку существования таблицы
    // Добавить обработку ошибок
}
```

#### 1.3 Улучшение обработки ошибок
```go
// Создать internal/errors/errors.go
package errors

import (
    "fmt"
    "net/http"
)

type APIError struct {
    Code    int    `json:"code"`
    Message string `json:"message"`
    Details string `json:"details,omitempty"`
}

func (e *APIError) Error() string {
    return fmt.Sprintf("API Error %d: %s", e.Code, e.Message)
}

// Стандартные ошибки
var (
    ErrUserNotFound     = &APIError{Code: http.StatusNotFound, Message: "User not found"}
    ErrInvalidToken     = &APIError{Code: http.StatusUnauthorized, Message: "Invalid token"}
    ErrDuplicateKey     = &APIError{Code: http.StatusConflict, Message: "Resource already exists"}
    ErrDatabaseError    = &APIError{Code: http.StatusInternalServerError, Message: "Database error"}
)
```

**Ожидаемый результат: 30% прохождения тестов**

---

### **ФАЗА 2: ИСПРАВЛЕНИЕ АУТЕНТИФИКАЦИИ (30-60%)**
**Время: 1-2 недели**

#### 2.1 Исправление JWT middleware
```go
// В internal/middleware/jwt_auth.go
func JWTAuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        authHeader := c.GetHeader("Authorization")
        if authHeader == "" {
            c.JSON(http.StatusUnauthorized, gin.H{
                "error": "Authorization header required",
                "code": "AUTH_HEADER_MISSING",
            })
            c.Abort()
            return
        }

        // Проверить формат "Bearer <token>"
        parts := strings.Split(authHeader, " ")
        if len(parts) != 2 || parts[0] != "Bearer" {
            c.JSON(http.StatusUnauthorized, gin.H{
                "error": "Invalid Authorization header format",
                "code": "AUTH_HEADER_INVALID",
            })
            c.Abort()
            return
        }

        tokenString := parts[1]
        claims, err := auth.ValidateAccessToken(tokenString)
        if err != nil {
            c.JSON(http.StatusUnauthorized, gin.H{
                "error": "Invalid or expired token",
                "code": "TOKEN_INVALID",
                "details": err.Error(),
            })
            c.Abort()
            return
        }

        // Установить данные пользователя в контекст
        c.Set("user_id", claims.UserID)
        c.Set("role", claims.Role)
        c.Set("username", claims.Username)
        c.Next()
    }
}
```

#### 2.2 Исправление тестовых скриптов
```bash
# В honest_api_test.sh
# Исправить передачу токенов:
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
    
    # Исправить curl команду
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method $headers \
          -H "Content-Type: application/json" \
          -d "$data" \
          "https://mebelplace.com.kz/api/v2$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method $headers \
          "https://mebelplace.com.kz/api/v2$endpoint")
    fi
    
    # Извлечь статус код
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    # Обработка ответов
    if [ "$status_code" = "200" ] || [ "$status_code" = "201" ]; then
        echo -e "${GREEN}✅ $method $endpoint - $status_code (работает) - $description${NC}"
        working_endpoints=$((working_endpoints + 1))
    elif [ "$status_code" = "400" ]; then
        echo -e "${YELLOW}⚠️  $method $endpoint - 400 (валидация) - $description${NC}"
        error_400=$((error_400 + 1))
    elif [ "$status_code" = "401" ]; then
        echo -e "${YELLOW}🔐 $method $endpoint - 401 (нужна авторизация) - $description${NC}"
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
```

#### 2.3 Создание тестового пользователя
```bash
# Создать скрипт для создания тестового пользователя
#!/bin/bash

# Создать тестового пользователя
USER_RESPONSE=$(curl -s -X POST https://mebelplace.com.kz/api/v2/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email_or_phone": "+7700'$(date +%s)'",
    "password": "TestPassword123!",
    "username": "testuser'$(date +%s)'"
  }')

echo "User Response: $USER_RESPONSE"

# Извлечь токен
TOKEN=$(echo $USER_RESPONSE | jq -r '.access_token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo "❌ Не удалось получить токен авторизации"
    echo "Response: $USER_RESPONSE"
    exit 1
fi

echo "✅ Токен получен: $TOKEN"
```

**Ожидаемый результат: 60% прохождения тестов**

---

### **ФАЗА 3: РЕАЛИЗАЦИЯ ОТСУТСТВУЮЩИХ ФУНКЦИЙ (60-85%)**
**Время: 2-3 недели**

#### 3.1 Платежная система
```go
// Создать internal/payments/payments.go
package payments

import (
    "context"
    "encoding/json"
    "fmt"
    "net/http"
)

type PaymentProvider interface {
    CreatePayment(ctx context.Context, amount float64, currency string, description string) (*PaymentResult, error)
    VerifyPayment(ctx context.Context, paymentID string) (*PaymentStatus, error)
    RefundPayment(ctx context.Context, paymentID string, amount float64) error
}

type KaspiBankProvider struct {
    apiKey    string
    apiSecret string
    baseURL   string
}

func (k *KaspiBankProvider) CreatePayment(ctx context.Context, amount float64, currency string, description string) (*PaymentResult, error) {
    // Реализация интеграции с Kaspi Bank
    // ...
}

type PaymentResult struct {
    PaymentID string `json:"payment_id"`
    Status    string `json:"status"`
    Amount    float64 `json:"amount"`
    Currency  string `json:"currency"`
    RedirectURL string `json:"redirect_url"`
}

type PaymentStatus struct {
    PaymentID string `json:"payment_id"`
    Status    string `json:"status"`
    Amount    float64 `json:"amount"`
    Currency  string `json:"currency"`
    CreatedAt string `json:"created_at"`
    UpdatedAt string `json:"updated_at"`
}
```

#### 3.2 Поиск по изображению
```go
// Создать internal/ai/image_search.go
package ai

import (
    "context"
    "encoding/json"
    "fmt"
    "io"
    "mime/multipart"
    "net/http"
)

type ImageSearchService struct {
    apiKey string
    baseURL string
}

type ImageSearchRequest struct {
    Image     multipart.File `form:"image" binding:"required"`
    Threshold float64        `form:"threshold"`
    Limit     int           `form:"limit"`
}

type ImageSearchResult struct {
    Similarity float64 `json:"similarity"`
    VideoID    int64   `json:"video_id"`
    Title      string  `json:"title"`
    Thumbnail  string  `json:"thumbnail"`
    UserID     int64   `json:"user_id"`
    Username   string  `json:"username"`
}

func (s *ImageSearchService) SearchSimilarImages(ctx context.Context, req *ImageSearchRequest) ([]*ImageSearchResult, error) {
    // Реализация AI поиска по изображению
    // Интеграция с внешним AI сервисом
    // ...
}
```

#### 3.3 Разделы профиля
```go
// В internal/http/v2/users/handler.go
func (h *Handler) GetUserServices(c *gin.Context) {
    userID := c.GetInt64("user_id")
    
    services, err := h.userService.GetUserServices(userID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Failed to get user services",
            "code": "SERVICES_FETCH_ERROR",
        })
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "services": services,
    })
}

func (h *Handler) GetUserFavorites(c *gin.Context) {
    userID := c.GetInt64("user_id")
    
    favorites, err := h.userService.GetUserFavorites(userID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Failed to get user favorites",
            "code": "FAVORITES_FETCH_ERROR",
        })
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "favorites": favorites,
    })
}

func (h *Handler) GetUserRequests(c *gin.Context) {
    userID := c.GetInt64("user_id")
    
    requests, err := h.userService.GetUserRequests(userID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Failed to get user requests",
            "code": "REQUESTS_FETCH_ERROR",
        })
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "requests": requests,
    })
}

func (h *Handler) GetUserReferrals(c *gin.Context) {
    userID := c.GetInt64("user_id")
    
    referrals, err := h.userService.GetUserReferrals(userID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Failed to get user referrals",
            "code": "REFERRALS_FETCH_ERROR",
        })
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "referrals": referrals,
    })
}
```

#### 3.4 Мультиязычность
```go
// Создать internal/i18n/i18n.go
package i18n

import (
    "encoding/json"
    "fmt"
    "os"
    "path/filepath"
)

type Translator struct {
    translations map[string]map[string]string
    defaultLang  string
}

func NewTranslator(defaultLang string) *Translator {
    return &Translator{
        translations: make(map[string]map[string]string),
        defaultLang:  defaultLang,
    }
}

func (t *Translator) LoadTranslations(dir string) error {
    languages := []string{"en", "ru", "kk"}
    
    for _, lang := range languages {
        filePath := filepath.Join(dir, fmt.Sprintf("%s.json", lang))
        data, err := os.ReadFile(filePath)
        if err != nil {
            return fmt.Errorf("failed to load translations for %s: %w", lang, err)
        }
        
        var translations map[string]string
        if err := json.Unmarshal(data, &translations); err != nil {
            return fmt.Errorf("failed to parse translations for %s: %w", lang, err)
        }
        
        t.translations[lang] = translations
    }
    
    return nil
}

func (t *Translator) Translate(key, lang string) string {
    if translations, exists := t.translations[lang]; exists {
        if translation, exists := translations[key]; exists {
            return translation
        }
    }
    
    // Fallback to default language
    if translations, exists := t.translations[t.defaultLang]; exists {
        if translation, exists := translations[key]; exists {
            return translation
        }
    }
    
    return key // Return key if no translation found
}
```

**Ожидаемый результат: 85% прохождения тестов**

---

### **ФАЗА 4: ОПТИМИЗАЦИЯ И ТЕСТИРОВАНИЕ (85-100%)**
**Время: 1-2 недели**

#### 4.1 Добавление недостающих endpoints
```go
// В internal/http/v2/router.go
// Добавить недостающие routes:

// Users (дополнительные endpoints)
usersGroup.GET("/me/services", middleware.JWTAuthMiddleware(), usersHandler.GetUserServices)
usersGroup.GET("/me/favorites", middleware.JWTAuthMiddleware(), usersHandler.GetUserFavorites)
usersGroup.GET("/me/requests", middleware.JWTAuthMiddleware(), usersHandler.GetUserRequests)
usersGroup.GET("/me/referrals", middleware.JWTAuthMiddleware(), usersHandler.GetUserReferrals)

// Search (поиск по изображению)
searchGroup.POST("/image", middleware.JWTAuthMiddleware(), searchHandler.SearchByImage)

// Payments
paymentsHandler := payments.NewHandler(db)
paymentsGroup := api.Group("/payments", middleware.JWTAuthMiddleware())
{
    paymentsGroup.POST("/create", paymentsHandler.CreatePayment)
    paymentsGroup.GET("/:id/status", paymentsHandler.GetPaymentStatus)
    paymentsGroup.POST("/:id/refund", paymentsHandler.RefundPayment)
}
```

#### 4.2 Валидация данных
```go
// Создать internal/validation/validation.go
package validation

import (
    "regexp"
    "strings"
    "unicode"
)

func ValidateEmail(email string) bool {
    emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
    return emailRegex.MatchString(email)
}

func ValidatePhone(phone string) bool {
    // Казахстанские номера: +7XXXXXXXXXX
    phoneRegex := regexp.MustCompile(`^\+7[0-9]{10}$`)
    return phoneRegex.MatchString(phone)
}

func ValidatePassword(password string) error {
    if len(password) < 8 {
        return fmt.Errorf("password must be at least 8 characters long")
    }
    
    var hasUpper, hasLower, hasNumber, hasSpecial bool
    
    for _, char := range password {
        switch {
        case unicode.IsUpper(char):
            hasUpper = true
        case unicode.IsLower(char):
            hasLower = true
        case unicode.IsNumber(char):
            hasNumber = true
        case unicode.IsPunct(char) || unicode.IsSymbol(char):
            hasSpecial = true
        }
    }
    
    if !hasUpper || !hasLower || !hasNumber || !hasSpecial {
        return fmt.Errorf("password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
    }
    
    return nil
}
```

#### 4.3 Тестирование всех endpoints
```bash
# Создать comprehensive_test.sh
#!/bin/bash

echo "🧪 COMPREHENSIVE API TESTING"
echo "=============================="

# Создать тестового пользователя
echo "👤 Creating test user..."
USER_RESPONSE=$(curl -s -X POST https://mebelplace.com.kz/api/v2/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email_or_phone": "+7700'$(date +%s)'",
    "password": "TestPassword123!",
    "username": "testuser'$(date +%s)'"
  }')

TOKEN=$(echo $USER_RESPONSE | jq -r '.access_token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo "❌ Failed to get auth token"
    exit 1
fi

echo "✅ Auth token obtained: ${TOKEN:0:20}..."

# Тестировать все endpoints
echo "🔍 Testing all endpoints..."

# Системные endpoints
test_endpoint "GET" "/ratelimit/status" "" "Rate limit status" false
test_endpoint "GET" "/health" "" "Health check" false
test_endpoint "GET" "/live" "" "Liveness check" false
test_endpoint "GET" "/ready" "" "Readiness check" false
test_endpoint "GET" "/metrics" "" "Prometheus metrics" false

# Аутентификация
test_endpoint "POST" "/auth/logout" "" "Logout" true

# Пользователи
test_endpoint "GET" "/users/me" "" "Get current user" true
test_endpoint "GET" "/users/me/services" "" "Get user services" true
test_endpoint "GET" "/users/me/favorites" "" "Get user favorites" true
test_endpoint "GET" "/users/me/requests" "" "Get user requests" true
test_endpoint "GET" "/users/me/referrals" "" "Get user referrals" true

# Видео
test_endpoint "GET" "/videos/feed" "" "Get video feed" false
test_endpoint "GET" "/videos/1" "" "Get video by ID" false

# Заявки
test_endpoint "GET" "/requests" "" "Get requests" false
test_endpoint "GET" "/requests/1" "" "Get request by ID" false

# Чаты
test_endpoint "GET" "/chats" "" "Get chats" true
test_endpoint "POST" "/chats" '{"recipient_id":1,"initial_message":"Hello"}' "Create chat" true

# И так далее для всех endpoints...

echo "📊 FINAL STATISTICS:"
echo "===================="
echo "Total endpoints: $total_endpoints"
echo "Working endpoints: $working_endpoints"
echo "Success rate: $((working_endpoints * 100 / total_endpoints))%"
```

**Ожидаемый результат: 100% прохождения тестов**

---

## 📋 ЧЕКЛИСТ ВЫПОЛНЕНИЯ

### **Фаза 1 (0-30%)**
- [ ] Создать таблицу `written_channel_posts`
- [ ] Исправить дублирование ключей в регистрации
- [ ] Выполнить все миграции
- [ ] Исправить 500 ошибки
- [ ] Добавить обработку ошибок

### **Фаза 2 (30-60%)**
- [ ] Исправить JWT middleware
- [ ] Исправить тестовые скрипты
- [ ] Создать тестового пользователя
- [ ] Протестировать все protected endpoints
- [ ] Исправить 401 ошибки

### **Фаза 3 (60-85%)**
- [ ] Реализовать платежную систему
- [ ] Добавить поиск по изображению
- [ ] Создать разделы профиля
- [ ] Добавить мультиязычность
- [ ] Создать демо-контент

### **Фаза 4 (85-100%)**
- [ ] Добавить недостающие endpoints
- [ ] Добавить валидацию данных
- [ ] Протестировать все endpoints
- [ ] Оптимизировать производительность
- [ ] Документировать API

---

## 🎯 КРИТЕРИИ УСПЕХА

### **100% соответствие OpenAPI:**
- [ ] Все 200 endpoints реализованы
- [ ] Все endpoints возвращают правильные статус коды
- [ ] Все endpoints соответствуют OpenAPI схеме
- [ ] Все endpoints проходят валидацию

### **100% прохождение тестов:**
- [ ] 0 критических ошибок (500)
- [ ] 0 ошибок аутентификации (401)
- [ ] 0 ошибок авторизации (403)
- [ ] Все endpoints работают корректно

### **Качество кода:**
- [ ] Покрытие тестами > 80%
- [ ] Время ответа API < 200ms
- [ ] Валидация всех входных данных
- [ ] Обработка всех ошибок

**Готов начать реализацию плана? С какой фазы начнем?**
