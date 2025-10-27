# 🔧 ИСПРАВЛЕНИЯ URL ЭНДПОИНТОВ ВО FLUTTER

## 📋 **СПИСОК ИЗМЕНЕНИЙ:**

### ✅ **УЖЕ ИСПРАВЛЕНО:**
1. ✅ Добавлен case converter (snake_case → camelCase)
2. ✅ Исправлен парсинг login (accessToken, refreshToken)

### 🔄 **НУЖНО ИСПРАВИТЬ:**

#### **1. ПОИСК ВИДЕО:**
```dart
// БЫЛО:
GET /videos/search?query=кухня

// СТАЛО:
GET /search?q=кухня&type=video
```

#### **2. МОИ ЗАКАЗЫ:**
```dart
// БЫЛО:
GET /orders/my

// СТАЛО:
GET /orders/feed
// (автоматически фильтрует по текущему пользователю)
```

#### **3. СОЗДАТЬ ЗАКАЗ:**
```dart
// БЫЛО:
POST /orders

// СТАЛО:
POST /orders/create
```

#### **4. СПИСОК ЗАКАЗОВ:**
```dart
// БЫЛО:
GET /orders/list

// СТАЛО:
GET /orders/feed
```

#### **5. ВИДЕО ПОЛЬЗОВАТЕЛЯ:**
```dart
// БЫЛО:
GET /users/:userId/videos

// СТАЛО:
GET /videos/feed?author_id=:userId
```

#### **6. СОЗДАТЬ ЧАТ:**
```dart
// БЫЛО:
POST /chats

// СТАЛО:
POST /chat/create
```

#### **7. ОТПРАВИТЬ СООБЩЕНИЕ:**
```dart
// БЫЛО:
POST /chats/:chatId/messages

// СТАЛО:
POST /chat/:chatId/message
```

#### **8. ОБНОВИТЬ ПРОФИЛЬ:**
```dart
// БЫЛО:
PUT /users/profile

// СТАЛО:
PUT /auth/profile
```

#### **9. ПОДПИСАТЬСЯ:**
```dart
// БЫЛО:
POST /subscriptions/:userId/follow

// СТАЛО:
POST /users/:userId/subscribe
```

#### **10. ОТПИСАТЬСЯ:**
```dart
// БЫЛО:
DELETE /subscriptions/:userId/unfollow

// СТАЛО:
DELETE /users/:userId/unsubscribe
```

#### **11. ДОБАВИТЬ КОММЕНТАРИЙ:**
```dart
// БЫЛО:
POST /videos/:id/comments

// СТАЛО:
POST /videos/:id/comment
```

---

## 📝 **ОСОБЕННОСТИ:**

### **ЧАТЫ:**
- ✅ `/api/chats/*` и `/api/chat/*` - ОБА РАБОТАЮТ (алиас)
- Но лучше использовать `/api/chat/*` (канонический)

### **ЛАЙКИ:**
- ✅ `POST /videos/:id/like` - TOGGLE (один эндпоинт для like/unlike)
- ✅ `DELETE /videos/:id/like` - тоже есть (но не нужен)

### **ПОДПИСКИ:**
- ✅ `/api/users/:id/subscribe` - основной эндпоинт
- ✅ `/api/subscriptions/:id` - тоже есть, но используйте `/users/*`

---

## ✅ **AFTER FIXES:**

После всех исправлений Flutter будет использовать те же URL что и веб-версия = 100% совместимость! 🎉

