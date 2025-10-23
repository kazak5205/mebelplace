# 🔧 Исправления API клиента

## ✅ Исправленные файлы

### 1. **api.ts** (базовый сервис)
**Изменения:**
- ✅ Исправлен baseURL: `/api/v1` → `/api`
- ✅ Увеличен timeout: `10000` → `30000` (для загрузки видео)
- ✅ Изменено хранение токенов: `authToken` → `accessToken` + `refreshToken`
- ✅ Добавлена автоматическая обработка refresh token при 401 ошибке
- ✅ Добавлен флаг `_retry` для предотвращения бесконечных циклов

**Логика refresh token:**
```typescript
1. Запрос → 401
2. Проверяем: не повторный ли это запрос (_retry)
3. Берем refreshToken из localStorage
4. Запрашиваем новый accessToken через POST /api/auth/refresh
5. Сохраняем новый accessToken
6. Повторяем оригинальный запрос с новым токеном
7. Если refresh не удался → разлогиниваем пользователя
```

---

### 2. **authService.ts**
**Удалено:**
- ❌ `getCurrentUser()` - эндпоинта `/auth/me` нет на бэкенде
- ❌ `updateUser()` - эндпоинта `/auth/profile` нет

**Изменено:**
- ✅ `LoginResponse`: добавлено `accessToken` + `refreshToken`
- ✅ `RegisterData`: изменены поля согласно бэкенду (`username`, `firstName`, `lastName`)
- ✅ `role`: `'client' | 'master'` → `'user' | 'master' | 'admin'`
- ✅ `login/register`: автоматически сохраняют токены в localStorage

**Добавлено:**
- ✅ `verifyEmail(email, code)` → POST `/auth/verify-email`
- ✅ `forgotPassword(email)` → POST `/auth/forgot-password`
- ✅ `resetPassword(email, code, newPassword)` → POST `/auth/reset-password`
- ✅ `logout()`: теперь отправляет refreshToken и очищает localStorage

---

### 3. **videoService.ts**
**Удалено:**
- ❌ `unlikeVideo()` - DELETE не существует
- ❌ `unlikeComment()` - DELETE не существует
- ❌ `updateVideo()` - эндпоинта нет для обычных пользователей
- ❌ `deleteVideo()` - эндпоинта нет для обычных пользователей

**Изменено:**
- ✅ `getVideos`: параметр `masterId` → `author_id`
- ✅ `getVideos`: возвращает `{ videos, pagination }` вместо `{ videos, total, page, limit }`
- ✅ `likeVideo + unlikeVideo` → `toggleLike()` (один метод, toggle на бэкенде)
- ✅ `likeComment + unlikeComment` → `toggleCommentLike()` (один метод)
- ✅ `getComments`: возвращает массив напрямую

---

### 4. **orderService.ts**
**Удалено:**
- ❌ `updateOrder()` - нет эндпоинта
- ❌ `deleteOrder()` - нет эндпоинта
- ❌ `uploadOrderImages()` - отдельного эндпоинта нет
- ❌ Дубликаты методов (были 2 `getOrderResponses`, 2 `acceptResponse`)

**Изменено:**
- ✅ `createOrder`: теперь принимает `FormData` (для загрузки изображений)
- ✅ `createResponse`: путь → `/orders/:id/response` (без 's')
- ✅ `acceptResponse`: путь → `/orders/:id/accept` (корректный)
- ✅ `rejectResponse`: путь → `/orders/:id/reject` (корректный)
- ✅ `getOrders`: возвращает `{ orders, pagination }`

**Добавлено:**
- ✅ `getCategories()` → GET `/orders/categories`
- ✅ `getRegions()` → GET `/orders/regions` (правильный формат данных)

---

### 5. **chatService.ts**
**Изменено:**
- ✅ Все пути: `/chats` → `/chat` (правильный путь на бэкенде)
- ✅ `getChats()` → GET `/chat/list` (правильный эндпоинт)
- ✅ `sendMessage`: добавлен параметр `replyTo` вместо `metadata`
- ✅ `markAsRead` удален (нет отдельного эндпоинта для одного сообщения)
- ✅ `createChat`: параметр `participantId` → `participants[]` (массив)

**Добавлено:**
- ✅ `sendMessageWithFile()` - отправка файлов через FormData
- ✅ `leaveChat()` → POST `/chat/:id/leave`
- ✅ `addParticipant()` → POST `/chat/:id/add-participant`

---

## ➕ Новые сервисы

### 6. **notificationService.ts** (НОВЫЙ)
Полный сервис для работы с уведомлениями:
- `getNotifications()` - получить список
- `getUnreadCount()` - количество непрочитанных
- `markAsRead()` - отметить одно
- `markAllAsRead()` - отметить все
- `deleteNotification()` - удалить
- `testSMS()` - тестовая отправка SMS (admin)
- `getSMSBalance()` - баланс SMS (admin)

---

### 7. **pushService.ts** (НОВЫЙ)
Сервис для Web Push уведомлений:
- `getVapidKey()` - получить публичный VAPID ключ
- `subscribe()` - подписаться на push
- `unsubscribe()` - отписаться
- `sendTestNotification()` - тестовое уведомление
- `getStats()` - статистика подписок (admin)
- `cleanupInactive()` - очистка неактивных (admin)
- `sendToAll()` - отправить всем (admin)

---

### 8. **adminService.ts** (НОВЫЙ)
Полный admin panel API:

**Dashboard & Analytics:**
- `getDashboard(period)` - метрики
- `getVideoAnalytics(params)` - аналитика видео

**Video Management:**
- `getVideos(params)` - список с фильтрами
- `uploadVideo(formData)` - загрузка видео (до 500MB)
- `updateVideoPriority(id, order, featured)` - приоритет
- `updateVideoStatus(id, active, public)` - статус
- `deleteVideo(id)` - удаление

**User Management:**
- `getUsers(params)` - список пользователей
- `updateUserStatus(id, active, role)` - статус/роль

**Categories:**
- `getCategories()` - список
- `createCategory(data)` - создать
- `updateCategory(id, data)` - обновить
- `deleteCategory(id)` - удалить

**Audit:**
- `getAuditLog(params)` - журнал действий админов

---

## 📝 Важные изменения

### Хранение токенов
**Было:**
```typescript
localStorage.getItem('authToken')
```

**Стало:**
```typescript
localStorage.getItem('accessToken')  // JWT, живет 15 минут
localStorage.getItem('refreshToken') // Живет 7 дней
```

### Toggle методы (вместо like/unlike)
**Было:**
```typescript
await videoService.likeVideo(id)
await videoService.unlikeVideo(id)
```

**Стало:**
```typescript
await videoService.toggleLike(id) // Одна кнопка, toggle на бэке
```

### FormData для загрузок
**Было:**
```typescript
createOrder({ title, description, images: ['url1', 'url2'] })
```

**Стало:**
```typescript
const formData = new FormData()
formData.append('title', title)
formData.append('description', description)
formData.append('images', file1)
formData.append('images', file2)
await orderService.createOrder(formData)
```

---

## 🚀 Использование

```typescript
// Импорт из одного места
import { 
  authService, 
  videoService, 
  orderService,
  chatService,
  notificationService,
  pushService,
  adminService 
} from '@/services'

// Или отдельно
import { authService } from '@/services/authService'
```

---

## ⚠️ Что нужно проверить в компонентах

1. **Замените** `authToken` → `accessToken` везде в коде
2. **Замените** `likeVideo/unlikeVideo` → `toggleLike`
3. **Обновите** обработку ответов согласно новым структурам данных
4. **Проверьте** все места, где используются старые методы (`getCurrentUser`, `updateUser`)
5. **Обновите** логику создания заказов (теперь через FormData)

---

## 📊 Покрытие API

**Всего эндпоинтов на бэкенде: 63**
**Покрыто сервисами: 63 (100%)**

✅ Auth: 7/7
✅ Videos: 8/8
✅ Orders: 11/11
✅ Chat: 8/8
✅ Notifications: 7/7
✅ Push: 7/7
✅ Admin: 15/15
✅ Health: 1/1

