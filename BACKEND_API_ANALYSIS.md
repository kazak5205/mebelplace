# 🔍 ДЕТАЛЬНЫЙ АНАЛИЗ API БЭКЕНДА vs FLUTTER ДОКУМЕНТАЦИЯ

## ✅ **1. АВТОРИЗАЦИЯ (Auth)**

### 1.1. ✅ POST `/api/auth/login` 
**Статус:** ✅ РАБОТАЕТ ПРАВИЛЬНО
- ✅ Принимает: `{ phone, password }`
- ✅ Возвращает: `{ success, data: { user, accessToken, refreshToken }, message, timestamp }`
- ⚠️ **РАСХОЖДЕНИЕ:** Flutter ожидает `token`, бэк возвращает `accessToken`
- ⚠️ **РАСХОЖДЕНИЕ:** Flutter не ожидает `refreshToken` в ответе login

**РЕАЛЬНЫЙ ОТВЕТ БЭКА:**
```json
{
  "success": true,
  "data": {
    "user": { "id", "phone", "username", "firstName", "lastName", "role", "isVerified" },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  },
  "message": "Login successful"
}
```

**FLUTTER ОЖИДАЕТ:**
```json
{
  "success": true,
  "user": { ... },
  "token": "jwt_token",
  "message": "Успешный вход"
}
```

---

### 1.2. ✅ POST `/api/auth/register`
**Статус:** ✅ РАБОТАЕТ ПРАВИЛЬНО
- ✅ Принимает: `{ phone, username, password, firstName, lastName, role }`
- ✅ Возвращает: пользователя и токены
- ⚠️ **РАСХОЖДЕНИЕ:** Тот же что и в login - `accessToken` vs `token`

---

### 1.3. ✅ POST `/api/auth/refresh`
**Статус:** ✅ РАБОТАЕТ ПРАВИЛЬНО
- ✅ Принимает: `{ refreshToken }`
- ✅ Возвращает новый access token
- ⚠️ **РАСХОЖДЕНИЕ:** Flutter ожидает `{ accessToken, refreshToken }`, бэк возвращает `{ accessToken, user }`

**РЕАЛЬНЫЙ ОТВЕТ БЭКА:**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_token",
    "user": { ... }
  }
}
```

**FLUTTER ОЖИДАЕТ:**
```json
{
  "success": true,
  "accessToken": "new_jwt_token",
  "refreshToken": "new_refresh_token"
}
```

---

## ✅ **2. ВИДЕО (Videos)**

### 2.1. ✅ GET `/api/videos/feed`
**Статус:** ✅ РАБОТАЕТ
- ✅ Query: `page`, `limit`, `category`, `author_id`
- ✅ Возвращает массив видео с пагинацией
- ✅ Поля видео соответствуют

**СТРУКТУРА ВИДЕО - ПРОВЕРКА ПОЛЕЙ:**
```javascript
// БЭК ВОЗВРАЩАЕТ:
{
  id, title, description,
  video_url,          // ⚠️ snake_case
  thumbnail_url,      // ⚠️ snake_case
  duration,
  file_size,          // ⚠️ snake_case
  author_id,          // ⚠️ snake_case
  username, 
  first_name,         // ⚠️ snake_case
  last_name,          // ⚠️ snake_case
  avatar,
  category, tags, views,
  like_count,         // ⚠️ snake_case
  comment_count,      // ⚠️ snake_case
  is_liked,           // ⚠️ snake_case
  is_featured,        // ⚠️ snake_case
  priority_order,     // ⚠️ snake_case
  is_public,          // ⚠️ snake_case
  is_active,          // ⚠️ snake_case
  created_at,         // ⚠️ snake_case
  updated_at          // ⚠️ snake_case
}

// FLUTTER ОЖИДАЕТ:
{
  id, title, description,
  videoUrl,           // ❌ camelCase
  thumbnailUrl,       // ❌ camelCase
  duration, fileSize, // ❌ camelCase
  authorId,           // ❌ camelCase
  username, firstName, lastName, avatar,
  category, tags, views,
  likes,              // ❌ БЭК возвращает like_count
  likesCount,         // ❌ БЭК возвращает like_count
  commentsCount,      // ❌ БЭК возвращает comment_count
  isLiked,            // ❌ camelCase
  isFeatured,         // ❌ camelCase
  priorityOrder,      // ❌ camelCase
  isPublic,           // ❌ camelCase
  isActive,           // ❌ camelCase
  createdAt,          // ❌ camelCase
  updatedAt           // ❌ camelCase
}
```

**🚨 КРИТИЧЕСКАЯ ПРОБЛЕМА: БЭК ИСПОЛЬЗУЕТ snake_case, FLUTTER ОЖИДАЕТ camelCase**

---

### 2.2. ✅ GET `/api/videos/:videoId`
**Статус:** ✅ РАБОТАЕТ
- ✅ Возвращает одно видео
- ⚠️ Те же проблемы с именованием полей

---

### 2.3. ❌ GET `/api/videos/search`
**Статус:** ❌ НЕ СУЩЕСТВУЕТ
- ❌ Эндпоинт не найден в `routes/videos.js`
- ✅ Есть только `/api/search` (общий поиск)
- **ПРОБЛЕМА:** Flutter ожидает `/api/videos/search?query=...`

---

### 2.4. ❌ GET `/api/videos/master/:masterId`
**Статус:** ❌ НЕ СУЩЕСТВУЕТ
- ❌ Эндпоинт отсутствует
- **РЕШЕНИЕ:** Нужно добавить этот роут или использовать `/api/users/:userId/videos`

---

### 2.5. ✅ POST `/api/videos/upload`
**Статус:** ✅ РАБОТАЕТ
- ✅ Принимает multipart/form-data
- ✅ Поля: `video`, `title`, `description`, `category`, `tags`

---

### 2.6. ✅ POST `/api/videos/:videoId/like`
**Статус:** ✅ РАБОТАЕТ
- ✅ Лайкает/убирает лайк (toggle)
- ⚠️ **ПРОБЛЕМА:** Flutter ожидает отдельные эндпоинты для like и unlike

**БЭК:** 
- `POST /api/videos/:id/like` - toggle (добавить/убрать)

**FLUTTER ОЖИДАЕТ:**
- `POST /api/videos/:id/like` - только добавить лайк
- `DELETE /api/videos/:id/like` - только убрать лайк

---

### 2.7. ❌ DELETE `/api/videos/:videoId/like`
**Статус:** ❌ НЕ СУЩЕСТВУЕТ
- ❌ Отдельного DELETE эндпоинта нет
- **РЕШЕНИЕ:** Нужно добавить или изменить документацию Flutter

---

### 2.8. ✅ POST `/api/videos/:videoId/view`
**Статус:** ✅ РАБОТАЕТ
- ✅ Записывает просмотр

---

### 2.9. ✅ GET `/api/videos/:videoId/comments`
**Статус:** ✅ РАБОТАЕТ
- ✅ Возвращает комментарии с пагинацией
- ⚠️ Проблемы с именованием полей (snake_case vs camelCase)

---

### 2.10. ✅ POST `/api/videos/:videoId/comments`
**Статус:** ⚠️ ЧАСТИЧНО
- **БЭК:** `POST /api/videos/:id/comment` (единственное число)
- **FLUTTER:** `POST /api/videos/:id/comments` (множественное число)
- **ПРОБЛЕМА:** Разные URL!

---

### 2.11. ✅ DELETE `/api/videos/:videoId/comments/:commentId`
**Статус:** ❌ НЕ НАЙДЕН в коде
- ❌ Эндпоинт удаления комментария не найден

---

## ❌ **3. ПОЛЬЗОВАТЕЛИ (Users)**

### 3.1. ✅ GET `/api/users/:userId`
**Статус:** ✅ РАБОТАЕТ
- ✅ Возвращает профиль пользователя
- ⚠️ Проблемы с именованием полей

**БЭК ВОЗВРАЩАЕТ:**
```json
{
  "success": true,
  "data": {
    "id", "username", "first_name", "last_name",
    "phone", "email", "avatar", "role", "bio",
    "created_at", "is_active",
    "subscribers_count", "reviews_count", "rating"
  }
}
```

**FLUTTER ОЖИДАЕТ:**
```json
{
  "success": true,
  "data": {
    "id", "username", "firstName", "lastName",
    "avatar", "role", "bio", "city", "rating",
    "reviewsCount", "videosCount", "followersCount",
    "followingCount", "isFollowing", "createdAt"
  }
}
```

**ПРОБЛЕМЫ:**
- ❌ БЭК не возвращает: `city`, `videosCount`, `followersCount`, `followingCount`, `isFollowing`
- ⚠️ snake_case vs camelCase

---

### 3.2. ❌ GET `/api/users/:userId/videos`
**Статус:** ❌ НЕ СУЩЕСТВУЕТ
- ❌ Эндпоинт отсутствует в `routes/users.js`
- **РЕШЕНИЕ:** Нужно добавить!

---

### 3.3. ❌ PUT `/api/users/profile`
**Статус:** ❌ НЕ ТАМ
- **БЭК:** `PUT /api/auth/profile` (в routes/auth.js)
- **FLUTTER:** `PUT /api/users/profile`
- **ПРОБЛЕМА:** Разные URL!

---

### 3.4. ❌ POST `/api/users/avatar`
**Статус:** ❌ НЕ СУЩЕСТВУЕТ
- ❌ Отдельного эндпоинта для аватара нет
- **БЭК:** Аватар загружается через `PUT /api/auth/profile` с multipart
- **FLUTTER:** Ожидает отдельный `POST /api/users/avatar`

---

## ✅ **4. ЗАКАЗЫ (Orders)**

### 4.1. ⚠️ GET `/api/orders/list`
**Статус:** ⚠️ ЕСТЬ `/api/orders/feed`
- **БЭК:** `GET /api/orders/feed`
- **FLUTTER:** `GET /api/orders/list`
- **ПРОБЛЕМА:** Разные URL!

---

### 4.2. ✅ GET `/api/orders/:orderId`
**Статус:** ✅ РАБОТАЕТ
- ✅ Возвращает заказ с откликами
- ⚠️ Проблемы с именованием полей

---

### 4.3. ❌ POST `/api/orders`
**Статус:** ❌ НЕТ
- **БЭК:** `POST /api/orders/create`
- **FLUTTER:** `POST /api/orders`
- **ПРОБЛЕМА:** Разные URL!

---

### 4.4. ✅ PUT `/api/orders/:orderId`
**Статус:** ❌ НЕ НАЙДЕН
- ❌ Эндпоинт обновления заказа не найден
- ✅ Есть только `PUT /api/orders/:id/status`

---

### 4.5. ✅ DELETE `/api/orders/:orderId`
**Статус:** ❌ НЕ НАЙДЕН
- ❌ Эндпоинт удаления заказа не найден

---

### 4.6. ❌ GET `/api/orders/my`
**Статус:** ❌ НЕ СУЩЕСТВУЕТ
- ❌ Эндпоинт отсутствует
- **БЭК:** Используется `/api/orders/feed` с фильтром по клиенту

---

### 4.7. ✅ GET `/api/orders/:orderId/responses`
**Статус:** ✅ РАБОТАЕТ
- ✅ Возвращает отклики на заказ

---

### 4.8. ✅ POST `/api/orders/:orderId/responses`
**Статус:** ✅ РАБОТАЕТ
- **БЭК:** `POST /api/orders/:id/response` (единственное число)
- **FLUTTER:** `POST /api/orders/:id/responses` (множественное число)
- **ПРОБЛЕМА:** Разные URL!

---

### 4.9. ❌ GET `/api/orders/search`
**Статус:** ❌ НЕ СУЩЕСТВУЕТ
- ❌ Эндпоинт поиска заказов не найден

---

## ✅ **5. ЧАТЫ (Chats)**

### 5.1. ✅ GET `/api/chats/list`
**Статус:** ⚠️ ЕСТЬ `/api/chat/list`
- **БЭК:** `/api/chat/list` (единственное число)
- **FLUTTER:** `/api/chats/list` (множественное число)
- **ПРОБЛЕМА:** Разные URL!

---

### 5.2. ✅ POST `/api/chats`
**Статус:** ⚠️ ЕСТЬ `/api/chat/create`
- **БЭК:** `POST /api/chat/create`
- **FLUTTER:** `POST /api/chats`
- **ПРОБЛЕМА:** Разные URL!

---

### 5.3. ✅ GET `/api/chats/:chatId/messages`
**Статус:** ⚠️ ЕСТЬ `/api/chat/:id/messages`
- **БЭК:** `/api/chat/:id/messages`
- **FLUTTER:** `/api/chats/:chatId/messages`
- **ПРОБЛЕМА:** Разные URL (chat vs chats)!

---

### 5.4. ✅ POST `/api/chats/:chatId/messages`
**Статус:** ⚠️ ЕСТЬ `/api/chat/:id/message`
- **БЭК:** `POST /api/chat/:id/message` (единственное число)
- **FLUTTER:** `POST /api/chats/:chatId/messages` (множественное число)
- **ПРОБЛЕМА:** Разные URL!

---

### 5.5. ✅ PUT `/api/chats/:chatId/read`
**Статус:** ⚠️ ЕСТЬ `/api/chat/:id/read`
- **БЭК:** `/api/chat/:id/read`
- **FLUTTER:** `/api/chats/:chatId/read`
- **ПРОБЛЕМА:** chat vs chats

---

## ✅ **6. УВЕДОМЛЕНИЯ (Notifications)**

### 6.1. ✅ GET `/api/notifications`
**Статус:** ✅ РАБОТАЕТ
- ✅ Возвращает уведомления с пагинацией
- ⚠️ Проблемы с именованием полей

---

### 6.2. ✅ PUT `/api/notifications/:notificationId/read`
**Статус:** ✅ РАБОТАЕТ
- ✅ Помечает как прочитанное

---

### 6.3. ✅ DELETE `/api/notifications/:notificationId`
**Статус:** ✅ РАБОТАЕТ
- ✅ Удаляет уведомление

---

## ❌ **7. ПОДПИСКИ (Subscriptions)**

### 7.1. ❌ POST `/api/subscriptions/:userId/follow`
**Статус:** ❌ НЕТ
- **БЭК:** `POST /api/users/:id/subscribe`
- **FLUTTER:** `POST /api/subscriptions/:userId/follow`
- **ПРОБЛЕМА:** Совершенно разные URL!

---

### 7.2. ❌ DELETE `/api/subscriptions/:userId/unfollow`
**Статус:** ❌ НЕТ
- **БЭК:** `DELETE /api/users/:id/unsubscribe`
- **FLUTTER:** `DELETE /api/subscriptions/:userId/unfollow`
- **ПРОБЛЕМА:** Разные URL!

---

### 7.3. ❌ GET `/api/subscriptions/followers`
**Статус:** ❌ НЕТ
- **БЭК:** `GET /api/users/:id/subscribers`
- **FLUTTER:** `GET /api/subscriptions/followers`
- **ПРОБЛЕМА:** Разные URL!

---

### 7.4. ❌ GET `/api/subscriptions/following`
**Статус:** ❌ НЕТ
- **БЭК:** `GET /api/users/:id/subscriptions`
- **FLUTTER:** `GET /api/subscriptions/following`
- **ПРОБЛЕМА:** Разные URL!

---

## ✅ **8. ПОДДЕРЖКА (Support)**

### 8.1. ✅ POST `/api/support/tickets`
**Статус:** ✅ РАБОТАЕТ
- ✅ Создает тикет поддержки
- ⚠️ Проблемы с полями

**БЭК ПРИНИМАЕТ:**
```json
{ "subject", "message", "priority" }
```

**FLUTTER ОТПРАВЛЯЕТ:**
```json
{ "subject", "message", "category" }
```

**ПРОБЛЕМА:** `priority` vs `category`

---

### 8.2. ✅ GET `/api/support/tickets`
**Статус:** ✅ РАБОТАЕТ
- ✅ Возвращает тикеты пользователя

---

## 📊 **ИТОГОВАЯ СТАТИСТИКА**

### 🚨 **КРИТИЧЕСКИЕ ПРОБЛЕМЫ:**

1. **ИМЕНОВАНИЕ ПОЛЕЙ:**
   - ❌ БЭК использует `snake_case` для ВСЕХ полей
   - ❌ Flutter ожидает `camelCase`
   - **ВЛИЯНИЕ:** Все эндпоинты возвращают неправильные названия полей!

2. **НЕСООТВЕТСТВИЕ URL:**
   - ❌ `/api/chat` vs `/api/chats`
   - ❌ `/api/orders/create` vs `/api/orders`
   - ❌ `/api/orders/feed` vs `/api/orders/list`
   - ❌ `/api/subscriptions/...` vs `/api/users/.../subscribe`
   - ❌ `/api/auth/profile` vs `/api/users/profile`

3. **ОТСУТСТВУЮЩИЕ ЭНДПОИНТЫ:**
   - ❌ `GET /api/users/:userId/videos`
   - ❌ `GET /api/videos/search`
   - ❌ `GET /api/videos/master/:masterId`
   - ❌ `DELETE /api/videos/:id/like`
   - ❌ `GET /api/orders/my`
   - ❌ `GET /api/orders/search`
   - ❌ `POST /api/users/avatar`
   - ❌ `PUT /api/orders/:id`
   - ❌ `DELETE /api/orders/:id`

4. **СТРУКТУРА ОТВЕТОВ:**
   - ⚠️ Login: `token` vs `accessToken` + `refreshToken`
   - ⚠️ Refresh: не возвращает новый `refreshToken`
   - ⚠️ Video: `like_count` vs `likesCount` и `likes`
   - ⚠️ User: отсутствуют поля `city`, `videosCount`, `followersCount`, etc.

---

## 🔧 **ЧТО НУЖНО ИСПРАВИТЬ НА БЭКЕНДЕ:**

### **ПРИОРИТЕТ 1 - КРИТИЧНО:**

1. **Добавить middleware для преобразования snake_case → camelCase**
   ```javascript
   // Все ответы должны автоматически конвертироваться
   ```

2. **Исправить URL эндпоинтов:**
   - Переименовать `/api/chat/*` → `/api/chats/*`
   - Добавить alias или переименовать routes

3. **Добавить отсутствующие эндпоинты:**
   - `GET /api/users/:userId/videos`
   - `GET /api/videos/search`
   - `GET /api/orders/my`

### **ПРИОРИТЕТ 2 - ВАЖНО:**

4. **Исправить структуру ответов:**
   - Login должен возвращать `token`, а не `accessToken`
   - Или изменить Flutter клиент

5. **Добавить недостающие поля:**
   - User: `city`, `videosCount`, `followersCount`, `followingCount`
   - Video: `likesCount` вместо `like_count`

### **ПРИОРИТЕТ 3 - ЖЕЛАТЕЛЬНО:**

6. **Унифицировать naming:**
   - Либо все `snake_case`
   - Либо все `camelCase`
   - Рекомендую `camelCase` для JSON API

---

## 📝 **РЕКОМЕНДАЦИИ:**

1. **Создать middleware для автоматической конвертации:**
   ```javascript
   // server/middleware/camelCase.js
   const camelcaseKeys = require('camelcase-keys');
   
   module.exports = (req, res, next) => {
     const originalJson = res.json;
     res.json = function(data) {
       return originalJson.call(this, camelcaseKeys(data, { deep: true }));
     };
     next();
   };
   ```

2. **Добавить алиасы для роутов:**
   ```javascript
   app.use('/api/chats', chatRoutes);  // новый URL
   app.use('/api/chat', chatRoutes);   // старый URL для совместимости
   ```

3. **Создать единую схему ответов:**
   ```javascript
   {
     success: boolean,
     data: object,
     message: string,
     timestamp: string
   }
   ```

4. **Документировать изменения в CHANGELOG.md**


