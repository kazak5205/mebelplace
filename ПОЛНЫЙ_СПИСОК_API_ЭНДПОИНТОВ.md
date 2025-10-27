# 📊 ПОЛНЫЙ СПИСОК ВСЕХ API ЭНДПОИНТОВ БЭКЕНДА

## 🔢 **СТАТИСТИКА:**

**Всего эндпоинтов: ~94** (по данным grep)

### **Распределение по модулям:**
- `orders.js` - 15 эндпоинтов
- `admin.js` - 15 эндпоинтов
- `videos.js` - 14 эндпоинтов
- `chat.js` - 13 эндпоинтов
- `auth.js` - 11 эндпоинтов
- `push.js` - 7 эндпоинтов
- `notifications.js` - 7 эндпоинтов
- `subscriptions.js` - 5 эндпоинтов
- `support.js` - 4 эндпоинта
- `order-status.js` - 3 эндпоинта

---

## 📱 **ЭНДПОИНТЫ ДЛЯ FLUTTER (Публичные)**

### 🔐 **1. АВТОРИЗАЦИЯ** `/api/auth` (11 эндпоинтов)
1. `POST /api/auth/register` - Регистрация
2. `POST /api/auth/login` - Вход
3. `POST /api/auth/refresh` - Обновить токен
4. `POST /api/auth/logout` - Выход
5. `PUT /api/auth/profile` - Обновить профиль
6. `POST /api/auth/upload-avatar` - Загрузить аватар
7. `POST /api/auth/verify-phone` - Проверить телефон
8. `POST /api/auth/reset-password` - Сбросить пароль
9. `POST /api/auth/change-password` - Изменить пароль
10. `GET /api/auth/me` - Текущий пользователь
11. `DELETE /api/auth/account` - Удалить аккаунт

### 🎥 **2. ВИДЕО** `/api/videos` (14 эндпоинтов)
1. `GET /api/videos/feed` - Лента видео
2. `GET /api/videos/master/:masterId` - Видео мастера
3. `GET /api/videos/:id` - Одно видео
4. `POST /api/videos/upload` - Загрузить видео
5. `DELETE /api/videos/:id` - Удалить видео
6. `POST /api/videos/:id/like` - Лайк (toggle)
7. `DELETE /api/videos/:id/like` - Убрать лайк
8. `POST /api/videos/:id/comment` - Добавить комментарий
9. `GET /api/videos/:id/comments` - Комментарии
10. `POST /api/videos/:id/view` - Записать просмотр
11. `POST /api/videos/comments/:id/like` - Лайк комментария
12. `POST /api/videos/:id/bookmark` - Добавить в закладки
13. `DELETE /api/videos/:id/bookmark` - Убрать из закладок
14. `GET /api/videos/bookmarked` - Закладки пользователя

**❌ ОТСУТСТВУЕТ:**
- `GET /api/videos/search` - Поиск видео (НУЖНО ДОБАВИТЬ)

### 📦 **3. ЗАКАЗЫ** `/api/orders` (15 эндпоинтов)
1. `POST /api/orders/create` - Создать заказ
2. `GET /api/orders/feed` - Лента заказов
3. `GET /api/orders/:id` - Один заказ
4. `DELETE /api/orders/:id` - Удалить заказ
5. `POST /api/orders/:id/response` - Создать отклик
6. `GET /api/orders/:id/responses` - Получить отклики
7. `POST /api/orders/:id/responses` - Создать отклик (дубликат)
8. `POST /api/orders/:id/accept` - Принять отклик
9. `POST /api/orders/:id/reject` - Отклонить отклик
10. `PUT /api/orders/:id/status` - Изменить статус
11. `GET /api/orders/regions` - Регионы Казахстана
12. `GET /api/orders/categories` - Категории заказов
13. `POST /api/orders/upload-images` - Загрузить фото
14. `GET /api/order-status/:orderId/history` - История статусов
15. `POST /api/order-status/:orderId` - Обновить статус

**❌ ОТСУТСТВУЕТ:**
- `GET /api/orders/my` - Мои заказы (НУЖНО ДОБАВИТЬ)
- `GET /api/orders/search` - Поиск заказов

### 💬 **4. ЧАТЫ** `/api/chats` (13 эндпоинтов)
1. `GET /api/chats/list` - Список чатов
2. `POST /api/chats/create` - Создать чат
3. `GET /api/chats/:id` - Один чат
4. `GET /api/chats/:id/messages` - Сообщения чата
5. `POST /api/chats/:id/message` - Отправить сообщение
6. `DELETE /api/chats/:id/message/:messageId` - Удалить сообщение
7. `PUT /api/chats/:id/read` - Пометить прочитанным
8. `POST /api/chats/:id/typing` - Набор текста
9. `POST /api/chats/:id/upload` - Загрузить файл
10. `GET /api/chats/unread-count` - Непрочитанные сообщения
11. `POST /api/chats/:id/leave` - Покинуть чат
12. `POST /api/chats/:id/archive` - Архивировать чат
13. `DELETE /api/chats/:id` - Удалить чат

**⚠️ ВНИМАНИЕ:** 
Flutter ожидает `/api/chats/*`, бэк использует `/api/chats/*` - **ВСЁ ПРАВИЛЬНО!**

### 👥 **5. ПОДПИСКИ** `/api/subscriptions` (5 эндпоинтов)
1. `POST /api/subscriptions/:masterId` - Подписаться
2. `DELETE /api/subscriptions/:masterId` - Отписаться
3. `GET /api/subscriptions/:masterId` - Статус подписки
4. `GET /api/subscriptions` - Мои подписки
5. `GET /api/subscriptions/count/:masterId` - Количество подписчиков

### 🔔 **6. УВЕДОМЛЕНИЯ** `/api/notifications` (7 эндпоинтов)
1. `GET /api/notifications` - Список уведомлений
2. `GET /api/notifications/:id` - Одно уведомление
3. `PUT /api/notifications/:id/read` - Пометить прочитанным
4. `PUT /api/notifications/read-all` - Пометить все прочитанными
5. `DELETE /api/notifications/:id` - Удалить уведомление
6. `DELETE /api/notifications/clear-all` - Очистить все
7. `GET /api/notifications/unread-count` - Количество непрочитанных

### 🆘 **7. ПОДДЕРЖКА** `/api/support` (4 эндпоинта)
1. `POST /api/support/tickets` - Создать тикет
2. `GET /api/support/tickets` - Мои тикеты
3. `GET /api/support/tickets/:id` - Один тикет
4. `POST /api/support/tickets/:id/message` - Отправить сообщение

### 📱 **8. PUSH УВЕДОМЛЕНИЯ** `/api/push` (7 эндпоинтов)
1. `POST /api/push/register` - Зарегистрировать устройство
2. `DELETE /api/push/unregister` - Удалить устройство
3. `PUT /api/push/update-token` - Обновить токен
4. `POST /api/push/test` - Тестовое уведомление
5. `GET /api/push/devices` - Мои устройства
6. `PUT /api/push/settings` - Настройки уведомлений
7. `GET /api/push/settings` - Получить настройки

---

## 🔧 **АДМИНИСТРАТИВНЫЕ ЭНДПОИНТЫ** `/api/admin` (15 эндпоинтов)

**⚠️ Только для админов!**

1. `GET /api/admin/users` - Список пользователей
2. `GET /api/admin/users/:id` - Один пользователь
3. `PUT /api/admin/users/:id` - Обновить пользователя
4. `DELETE /api/admin/users/:id` - Удалить пользователя
5. `POST /api/admin/users/:id/ban` - Забанить пользователя
6. `POST /api/admin/users/:id/unban` - Разбанить пользователя
7. `GET /api/admin/videos` - Все видео
8. `PUT /api/admin/videos/:id/priority` - Установить приоритет видео
9. `DELETE /api/admin/videos/:id` - Удалить видео
10. `GET /api/admin/analytics/videos` - Аналитика видео
11. `GET /api/admin/analytics/users` - Аналитика пользователей
12. `GET /api/admin/analytics/orders` - Аналитика заказов
13. `GET /api/admin/audit-log` - Лог действий
14. `GET /api/admin/stats` - Общая статистика
15. `POST /api/admin/broadcast` - Массовая рассылка

---

## 📋 **ЧТО ОТСУТСТВУЕТ И НУЖНО ДОБАВИТЬ:**

### **КРИТИЧНО (для работы Flutter):**
1. ❌ `GET /api/videos/search` - Поиск видео
2. ❌ `GET /api/orders/my` - Мои заказы

### **ЖЕЛАТЕЛЬНО:**
3. ❌ `GET /api/orders/search` - Поиск заказов
4. ❌ `GET /api/users/:id` - Профиль пользователя (публичный)
5. ❌ `GET /api/users/:id/videos` - Видео пользователя
6. ❌ `GET /api/subscriptions/followers` - Мои подписчики
7. ❌ `GET /api/subscriptions/following` - Мои подписки (есть как `GET /api/subscriptions`)

---

## 🎯 **ИТОГО:**

### **ЧТО ЕСТЬ:**
- ✅ **~94 эндпоинта** во всей системе
- ✅ Полноценный API для видео (кроме поиска)
- ✅ Полноценный API для заказов (кроме "мои заказы")
- ✅ Чаты с полным функционалом
- ✅ Подписки на мастеров
- ✅ Push уведомления
- ✅ Поддержка
- ✅ Админ панель

### **ЧТО НУЖНО ДОБАВИТЬ (минимум):**
- ❌ **2 эндпоинта:** 
  1. `GET /api/videos/search`
  2. `GET /api/orders/my`

### **РАСХОЖДЕНИЯ С FLUTTER:**
1. **URL чатов:** ✅ **СОВПАДАЕТ** (`/api/chats/*`)
2. **URL заказов:** ⚠️ `/api/orders/feed` вместо `/api/orders/list` (нужно поправить во Flutter)
3. **Создание заказа:** ⚠️ `/api/orders/create` вместо `/api/orders` (нужно поправить во Flutter)
4. **Auth ответы:** ⚠️ Структура `{ data: { user, accessToken, refreshToken } }` вместо `{ user, token }` (нужно поправить во Flutter)
5. **Snake case:** ⚠️ Все поля в `snake_case`, Flutter ожидает `camelCase` (нужен converter)

---

## 🚀 **ПЛАН ДЕЙСТВИЙ:**

### **1. Добавить 2 эндпоинта на бэк (5 минут):**
- `GET /api/videos/search`
- `GET /api/orders/my`

### **2. Адаптировать Flutter (20 минут):**
- Создать case converter
- Исправить URL (5 мест)
- Исправить парсинг auth

### **3. Тест и деплой (5 минут):**
- Собрать APK
- Протестировать

**ГОТОВО!** 🎉

