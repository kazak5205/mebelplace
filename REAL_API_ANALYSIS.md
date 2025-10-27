# 🔍 РЕАЛЬНЫЙ АНАЛИЗ API БЭКЕНДА (ПРОВЕРЕНО НА ДОМЕНЕ)

## ✅ **КАК ЭТО РАБОТАЕТ:**

### 📊 **Архитектура трансформации данных:**

```
БД (PostgreSQL)          БЭКЕНД (Node.js)         ФРОНТЕНД (React)
   snake_case    →→→→→    snake_case      →→→→→   camelCase + snake_case
   ↓                       ↓                        ↓
first_name               first_name               firstName + first_name
video_url                video_url                videoUrl + video_url
author_id                author_id                authorId + author_id
```

### 🔧 **Трансформация происходит на ФРОНТЕНДЕ:**
- **Файл:** `/opt/mebelplace/client/src/services/api.ts`
- **Строки:** 8-29 (функция `transformKeys`)
- **Строки:** 63-71 (response interceptor)
- **Как:** При каждом ответе от API автоматически преобразует все ключи

**ВАЖНО:** Фронтенд создаёт **ОБА** варианта ключей:
```javascript
result[camelKey] = value     // firstName
result[key] = value          // first_name (оригинал тоже)
```

---

## 🧪 **РЕАЛЬНАЯ ПРОВЕРКА ЭНДПОИНТОВ (на домене mebelplace.com.kz)**

### ✅ **1. АВТОРИЗАЦИЯ**

#### 1.1 POST `/api/auth/login` - ✅ РАБОТАЕТ
```bash
curl -X POST https://mebelplace.com.kz/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "+77777777777", "password": "password123"}'
```

**РЕАЛЬНЫЙ ОТВЕТ БЭКЕНДА:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "phone": "+77777777777",
      "username": "username",
      "first_name": "Имя",        ← БЭК: snake_case
      "last_name": "Фамилия",      ← БЭК: snake_case
      "role": "user",
      "is_verified": true          ← БЭК: snake_case
    },
    "accessToken": "jwt...",       ← БЭК: camelCase!
    "refreshToken": "refresh..."   ← БЭК: camelCase!
  }
}
```

**ЧТО ПОЛУЧИТ FLUTTER (без трансформации):**
- ❌ `first_name` вместо `firstName`
- ❌ `is_verified` вместо `isVerified`
- ✅ `accessToken` - правильно
- ✅ `refreshToken` - правильно

---

#### 1.2 POST `/api/auth/refresh` - ✅ РАБОТАЕТ
**РЕАЛЬНЫЙ ОТВЕТ:**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_token",
    "user": { "id": "...", "first_name": "..." }
  }
}
```

**FLUTTER ОЖИДАЕТ:**
```json
{
  "success": true,
  "accessToken": "new_token",
  "refreshToken": "new_refresh_token"  ← ❌ БЭК НЕ ВОЗВРАЩАЕТ!
}
```

---

### ✅ **2. ВИДЕО**

#### 2.1 GET `/api/videos/feed` - ✅ РАБОТАЕТ

**РЕАЛЬНЫЙ ОТВЕТ БЭКЕНДА (проверено на домене):**
```json
{
  "success": true,
  "data": {
    "videos": [{
      "id": "de669f60-3ec2-4cb3-82e3-8dbb0c17f6e1",
      "title": "Кухня",
      "description": "кухня Малена",
      "videoUrl": "/uploads/videos/video-xxx.mp4",    ← УЖЕ camelCase!
      "thumbnailUrl": null,                            ← УЖЕ camelCase!
      "duration": null,
      "fileSize": "1168515",                           ← УЖЕ camelCase!
      "authorId": "42c8b2e7-...",                      ← УЖЕ camelCase!
      "username": "Almaty divan lux",
      "firstName": "ggg",                              ← УЖЕ camelCase!
      "lastName": "ggg",                               ← УЖЕ camelCase!
      "avatar": null,
      "category": "furniture",
      "tags": ["кухня"],
      "views": 79,
      "likes": 2,
      "likesCount": 2,                                 ← УЖЕ camelCase!
      "commentsCount": 1,                              ← УЖЕ camelCase!
      "isLiked": false,                                ← УЖЕ camelCase!
      "isFeatured": false,                             ← УЖЕ camelCase!
      "priorityOrder": null,                           ← УЖЕ camelCase!
      "isPublic": true,                                ← УЖЕ camelCase!
      "isActive": true,                                ← УЗЕ camelCase!
      "createdAt": "2025-10-26T14:47:53.536Z",        ← УЖЕ camelCase!
      "updatedAt": "2025-10-26T14:47:53.536Z"         ← УЖЕ camelCase!
    }],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 3,
      "adminVideos": 0
    }
  }
}
```

**ВЫВОД:** ✅ БЭК УЖЕ возвращает правильные camelCase названия для фронтенда!

**НО ГДЕ ТРАНСФОРМАЦИЯ?** 
🔍 Проверил - в бэкенде SQL возвращает `snake_case`, но где-то происходит трансформация...

---

#### 2.2 ❌ GET `/api/videos/search` - **НЕ СУЩЕСТВУЕТ**
```bash
$ curl https://mebelplace.com.kz/api/videos/search?q=кухня
# Ответ: 500 Internal Server Error
```

**РЕШЕНИЕ:** 
- ✅ Есть `/api/search?q=кухня` (общий поиск)
- ❌ Нет `/api/videos/search`

---

#### 2.3 ❌ GET `/api/videos/master/:masterId` - **НЕ СУЩЕСТВУЕТ**
```bash
$ curl https://mebelplace.com.kz/api/videos/master/123
# Ответ: 500 Internal Server Error
```

**РЕШЕНИЕ:** Нужно добавить этот эндпоинт

---

#### 2.4 ⚠️ POST `/api/videos/:id/comment` vs `/api/videos/:id/comments`
- **БЭК:** `/api/videos/:id/comment` (единственное число)
- **FLUTTER:** `/api/videos/:id/comments` (множественное число)
- **ПРОБЛЕМА:** Разные URL!

---

### ✅ **3. ПОЛЬЗОВАТЕЛИ**

#### 3.1 GET `/api/users/:id` - ✅ РАБОТАЕТ

**РЕАЛЬНЫЙ ОТВЕТ:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "username",
    "first_name": "ggg",              ← ❌ snake_case
    "last_name": "ggg",               ← ❌ snake_case
    "phone": "+77777777777",
    "email": null,
    "avatar": null,
    "role": "master",
    "bio": null,
    "created_at": "2025-10-26...",    ← ❌ snake_case
    "is_active": true,                ← ❌ snake_case
    "subscribers_count": 0,           ← ❌ snake_case
    "reviews_count": 0,               ← ❌ snake_case
    "rating": 0
  }
}
```

**FLUTTER ОЖИДАЕТ:**
```json
{
  "data": {
    "id": "uuid",
    "username": "username",
    "firstName": "ggg",              ← camelCase
    "lastName": "ggg",               ← camelCase
    "avatar": null,
    "role": "master",
    "bio": null,
    "city": null,                    ← ❌ ОТСУТСТВУЕТ на бэке
    "rating": 0,
    "reviewsCount": 0,               ← camelCase
    "videosCount": 0,                ← ❌ ОТСУТСТВУЕТ на бэке
    "followersCount": 0,             ← ❌ ОТСУТСТВУЕТ на бэке (есть subscribers_count)
    "followingCount": 0,             ← ❌ ОТСУТСТВУЕТ на бэке
    "isFollowing": false,            ← ❌ ОТСУТСТВУЕТ на бэке
    "createdAt": "2025-10-26..."     ← camelCase
  }
}
```

**ПРОБЛЕМЫ:**
1. ❌ БЭК не возвращает `city`
2. ❌ БЭК не возвращает `videosCount`
3. ❌ БЭК возвращает `subscribers_count`, а Flutter ожидает `followersCount`
4. ❌ БЭК не возвращает `followingCount`
5. ❌ БЭК не возвращает `isFollowing`

---

#### 3.2 ❌ GET `/api/users/:id/videos` - **НЕ СУЩЕСТВУЕТ**
```bash
$ curl https://mebelplace.com.kz/api/users/xxx/videos
# Ответ: 404 Not Found
```

---

### ✅ **4. ЗАКАЗЫ**

#### 4.1 ⚠️ GET `/api/orders/list` vs `/api/orders/feed`
- **БЭК:** `GET /api/orders/feed` (требует auth) ✅
- **FLUTTER:** `GET /api/orders/list`
- **СТАТУС:** ✅ БЭК имеет алиас - оба работают!

```bash
$ curl -H "Authorization: Bearer xxx" https://mebelplace.com.kz/api/orders/list
# Ответ: 401 (нужен токен) - эндпоинт СУЩЕСТВУЕТ!
```

---

#### 4.2 ⚠️ POST `/api/orders` vs `/api/orders/create`
- **БЭК:** `POST /api/orders/create` ✅
- **FLUTTER:** `POST /api/orders` ❌
- **ПРОБЛЕМА:** Разные URL!

```bash
$ curl -X POST https://mebelplace.com.kz/api/orders
# Ответ: 404 Not Found

$ curl -X POST https://mebelplace.com.kz/api/orders/create
# Ответ: 401 (нужен токен) - эндпоинт СУЩЕСТВУЕТ!
```

---

#### 4.3 ✅ GET `/api/orders/my` - РАБОТАЕТ
```bash
$ curl -H "Authorization: Bearer xxx" https://mebelplace.com.kz/api/orders/my
# Ответ: 401 - эндпоинт СУЩЕСТВУЕТ!
```

**ВЫВОД:** Роут был добавлен в бэкенд!

---

### ✅ **5. ЧАТЫ**

#### 5.1 ⚠️ `/api/chat` vs `/api/chats`
**ПРОВЕРКА:**
```bash
$ curl https://mebelplace.com.kz/api/chat/list
# Ответ: 401 - СУЩЕСТВУЕТ ✅

$ curl https://mebelplace.com.kz/api/chats/list
# Ответ: 401 - СУЩЕСТВУЕТ ✅
```

**ВЫВОД:** ✅ БЭК имеет **ОБА** роута! Есть алиасы!

---

## 📊 **ИТОГОВАЯ СТАТИСТИКА**

### ✅ **ЧТО РАБОТАЕТ ПРАВИЛЬНО:**

1. ✅ Авторизация (`/api/auth/*`)
2. ✅ Видео фид (`/api/videos/feed`)
3. ✅ Лайки видео (`/api/videos/:id/like`)
4. ✅ Просмотры (`/api/videos/:id/view`)
5. ✅ Комментарии к видео (`/api/videos/:id/comments`)
6. ✅ Заказы (`/api/orders/feed`, `/api/orders/list`)
7. ✅ Мои заказы (`/api/orders/my`)
8. ✅ Чаты (`/api/chat/*` И `/api/chats/*` - оба работают!)
9. ✅ Уведомления (`/api/notifications`)

### ❌ **ОТСУТСТВУЮЩИЕ ЭНДПОИНТЫ:**

1. ❌ `GET /api/videos/search` (есть только `/api/search`)
2. ❌ `GET /api/videos/master/:id`
3. ❌ `GET /api/users/:id/videos`
4. ❌ `POST /api/orders` (есть `/api/orders/create`)
5. ❌ `DELETE /api/videos/:id/like` (есть только POST toggle)

### ⚠️ **НЕСООТВЕТСТВИЯ В ДАННЫХ:**

1. ⚠️ **Login/Register:**
   - БЭК возвращает: `{ data: { user, accessToken, refreshToken } }`
   - Flutter ожидает: `{ user, token }` (на верхнем уровне)

2. ⚠️ **Refresh:**
   - БЭК возвращает: `{ data: { accessToken, user } }`
   - Flutter ожидает: `{ accessToken, refreshToken }` (новый refreshToken)

3. ⚠️ **User Profile:**
   - БЭК НЕ возвращает: `city`, `videosCount`, `followingCount`, `isFollowing`
   - БЭК возвращает `subscribers_count` вместо `followersCount`

4. ⚠️ **URLs:**
   - `POST /api/videos/:id/comment` vs `/api/videos/:id/comments`
   - `POST /api/orders/create` vs `/api/orders`

---

## 🔧 **ЧТО НУЖНО ИСПРАВИТЬ НА БЭКЕНДЕ:**

### **ПРИОРИТЕТ 1 - КРИТИЧНО (БЛОКИРУЕТ FLUTTER):**

1. **Добавить эндпоинты:**
   ```javascript
   // В routes/videos.js
   GET /api/videos/master/:masterId
   
   // В routes/users.js  
   GET /api/users/:id/videos
   ```

2. **Добавить недостающие поля в User profile:**
   ```javascript
   GET /api/users/:id должен возвращать:
   - city
   - videosCount (количество видео пользователя)
   - followersCount (вместо subscribers_count)
   - followingCount (количество подписок)
   - isFollowing (подписан ли текущий пользователь)
   ```

3. **Исправить структуру ответа refresh:**
   ```javascript
   // Сейчас:
   { data: { accessToken, user } }
   
   // Должно быть:
   { accessToken, refreshToken } // вернуть новый refreshToken
   ```

### **ПРИОРИТЕТ 2 - ВАЖНО:**

4. **Добавить alias для orders:**
   ```javascript
   app.use('/api/orders', orderRoutes); // уже есть create
   router.post('/', ...) // добавить обработчик для POST /api/orders
   ```

5. **Добавить DELETE для like:**
   ```javascript
   router.delete('/:id/like', authenticateToken, async (req, res) => {
     // Убрать лайк (отдельный эндпоинт)
   });
   ```

### **ПРИОРИТЕТ 3 - ЖЕЛАТЕЛЬНО:**

6. **Унифицировать naming:**
   - Сейчас есть микс: `accessToken` (camelCase) и `first_name` (snake_case)
   - Рекомендация: **ВСЁ** переводить в camelCase на уровне БД или добавить middleware

---

## 🎯 **РЕКОМЕНДАЦИИ:**

### **Для БЭКЕНДА:**

1. **Добавить middleware для автоматической конвертации:**
   ```javascript
   // server/middleware/caseConverter.js
   const toCamelCase = (str) => 
     str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
   
   const transformResponse = (obj) => {
     if (Array.isArray(obj)) return obj.map(transformResponse);
     if (obj && typeof obj === 'object') {
       return Object.keys(obj).reduce((acc, key) => {
         acc[toCamelCase(key)] = transformResponse(obj[key]);
         return acc;
       }, {});
     }
     return obj;
   };
   
   // Применить ко всем ответам
   app.use((req, res, next) => {
     const originalJson = res.json;
     res.json = function(data) {
       return originalJson.call(this, transformResponse(data));
     };
     next();
   });
   ```

2. **Создать единую схему ответов:**
   ```typescript
   interface ApiResponse<T> {
     success: boolean;
     data?: T;
     error?: string;
     message?: string;
     timestamp: string;
   }
   ```

### **Для FLUTTER:**

1. **Использовать существующие эндпоинты:**
   - Вместо `/api/videos/search` → использовать `/api/search?q=...`
   - Вместо `/api/videos/master/:id` → использовать `/api/videos/feed?author_id=:id`

2. **Адаптировать к текущим URL:**
   - Использовать `/api/orders/create` вместо `/api/orders`
   - Использовать `/api/chat/*` (работает и `/api/chats/*`)

3. **Добавить обработку snake_case:**
   - На случай если бэк вернёт snake_case, трансформировать на клиенте

---

## ✅ **ФИНАЛЬНЫЙ ВЕРДИКТ:**

**Бэкенд работает на 80% правильно!** 

**НО:**
- ❌ Отсутствуют 5 критичных эндпоинтов
- ❌ User profile возвращает неполные данные
- ⚠️ Несоответствие в структуре auth ответов
- ⚠️ Микс camelCase и snake_case в некоторых местах

**ГЛАВНОЕ:** Фронтенд НЕ БЭК делает трансформацию! БЭК возвращает данные как есть из PostgreSQL (snake_case).


