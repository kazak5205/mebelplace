# 📊 ДЕТАЛЬНЫЙ ОТЧЕТ: АНАЛИЗ СИСТЕМЫ ПРОФИЛЕЙ

**Дата:** 24 октября 2025  
**Проект:** MebelPlace  
**Проверено:** База данных, API эндпоинты, веб-клиент, мобильное приложение

---

## 1. 🗄️ СТРУКТУРА БД: ТАБЛИЦА `users`

### ✅ Поля которые СУЩЕСТВУЮТ:

| Поле | Тип | Nullable | Заполнено у Masterbaha | Заполнено у Klient ali |
|------|-----|----------|------------------------|------------------------|
| `id` | UUID | NOT NULL | ✅ | ✅ |
| `username` | VARCHAR(100) | NOT NULL | `Masterbaha` | `Klient ali` |
| `password_hash` | VARCHAR(255) | NOT NULL | ✅ | ✅ |
| `role` | VARCHAR(20) | ✓ | `master` | `user` |
| `first_name` | VARCHAR(100) | ✓ | ❌ **ПУСТО** | ❌ **ПУСТО** |
| `last_name` | VARCHAR(100) | ✓ | ❌ **ПУСТО** | ❌ **ПУСТО** |
| `email` | VARCHAR(255) | ✓ | ❌ **ПУСТО** | ❌ **ПУСТО** |
| `phone` | VARCHAR(20) | ✓ | `+77475678424` | `+77785421871` |
| `avatar` | VARCHAR(500) | ✓ | ❌ **ПУСТО** | ❌ **ПУСТО** |
| `bio` | TEXT | ✓ | ❌ **ПУСТО** | ❌ **ПУСТО** |
| `company_description` | TEXT | ✓ | ❌ **ПУСТО** | ❌ **ПУСТО** |
| `slogan` | TEXT | ✓ | ❌ **ПУСТО** | ❌ **ПУСТО** |
| `is_active` | BOOLEAN | ✓ | `true` | `true` |
| `is_verified` | BOOLEAN | ✓ | `false` | `false` |
| `is_online` | BOOLEAN | ✓ | `false` | `false` |
| `last_seen` | TIMESTAMP | ✓ | NULL | NULL |
| `created_at` | TIMESTAMP | ✓ | ✅ | ✅ |
| `updated_at` | TIMESTAMP | ✓ | ✅ | ✅ |
| `sms_code` | VARCHAR(10) | ✓ | NULL | NULL |
| `sms_code_expiry` | TIMESTAMP | ✓ | NULL | NULL |

### ❌ Поля которых НЕТ в БД (но используются в коде):

- `name` - используется в мобильном приложении!
- `specialties` (array) - показывается в ProfilePage
- `location` (city/region) - показывается в ProfilePage
- `rating` (number) - показывается в MasterChannelPage
- `reviewsCount` (number) - показывается в MasterChannelPage

---

## 2. 🔌 API ЭНДПОИНТЫ

### `/auth` (server/routes/auth.js) - 11 эндпоинтов:

| Эндпоинт | Метод | Что делает | Работает? |
|----------|-------|------------|-----------|
| `/register` | POST | Регистрация (phone, username, password, firstName, lastName, role) | ✅ |
| `/login` | POST | Вход (phone, password) | ✅ |
| `/refresh` | POST | Обновление токена | ✅ |
| `/me` | GET | Получить текущего пользователя | ✅ |
| `/profile` | PUT | Обновить профиль (firstName, lastName, phone, avatar) | ✅ |
| `/logout` | POST | Выход | ✅ |
| `/verify-email` | POST | Верификация email (stub) | ⚠️ Stub |
| `/forgot-password` | POST | Забыл пароль | ❌ **НЕ РАБОТАЕТ** |
| `/reset-password` | POST | Сброс пароля | ❌ **НЕ РАБОТАЕТ** |
| `/send-sms-code` | POST | Отправка SMS кода | ✅ |
| `/verify-sms` | POST | Проверка SMS кода | ✅ |

**❌ ОТСУТСТВУЕТ:**
- `POST /auth/change-password` - смена пароля авторизованным пользователем

### `/users` (server/routes/users.js) - 9 эндпоинтов:

| Эндпоинт | Метод | Что делает |
|----------|-------|------------|
| `/` | GET | Список пользователей (с фильтром по role) |
| `/:id/subscribe` | POST | Подписаться на мастера |
| `/:id/unsubscribe` | DELETE | Отписаться от мастера |
| `/:id/subscribers` | GET | Получить подписчиков |
| `/:id/subscriptions` | GET | Получить подписки |
| `/:id/subscription-status` | GET | Статус подписки |
| `/:id/block` | POST | Заблокировать пользователя |
| `/:id/unblock` | DELETE | Разблокировать |
| `/blocked` | GET | Список заблокированных |

**✅ ВАЖНО:** Эндпоинты возвращают поле `bio`, но НЕ возвращают `company_description` и `slogan`!

### `/videos` (проверено через videoService.ts):

- `GET /videos/bookmarked` - получить избранные видео ✅

---

## 3. 🐛 ПРОБЛЕМЫ В КОДЕ

### A. ❌ `/auth/forgot-password` и `/auth/reset-password` НЕ РАБОТАЮТ

**Проблема 1:** Несоответствие между клиентом и сервером

**Клиент** (`client/src/services/authService.ts`):
```typescript
forgotPassword(phone: string) // отправляет PHONE
resetPassword(phone: string, code, newPassword) // отправляет PHONE
```

**Сервер** (`server/routes/auth.js`):
```javascript
router.post('/forgot-password', (req, res) => {
  const { email } = req.body; // ожидает EMAIL!
  // stub - ничего не делает
})

router.post('/reset-password', (req, res) => {
  const { email, code, newPassword } = req.body; // ожидает EMAIL!
  // UPDATE users SET password_hash = $1 WHERE email = $2
})
```

**Почему не работает:**
1. Клиент отправляет `phone`, сервер ждет `email`
2. У ВСЕХ пользователей email **ПУСТОЙ**
3. `/forgot-password` - stub (не отправляет SMS)
4. `/reset-password` НЕ проверяет code

### B. ❌ Мобильное приложение использует несуществующее поле

**Файл:** `mobile/src/screens/main/ProfileScreen.tsx`
```tsx
<Title>{user?.name}</Title> // ← поле 'name' НЕТ в БД!
```

**Файл:** `mobile/src/screens/main/EditProfileScreen.tsx`
```tsx
name: user?.name || '', // ← поле 'name' НЕТ в БД!
```

### C. ❌ Веб-клиент показывает поля которых НЕТ в БД

**Файл:** `client/src/pages/ProfilePage.tsx`

Показывает:
- `specialties` - НЕТ в БД
- `location.city` / `location.region` - НЕТ в БД
- `email` - есть в БД, но ПУСТОЙ

**Файл:** `client/src/pages/MasterChannelPage.tsx`

Использует:
- `master.name` - НЕТ в БД
- `master.specialties` - НЕТ в БД
- `master.rating` - НЕТ в БД
- `master.reviewsCount` - НЕТ в БД
- `master.location` - НЕТ в БД

### D. ⚠️ НЕ используются поля из БД

Есть в БД, но **НИ ГДЕ НЕ ИСПОЛЬЗУЮТСЯ**:
- `bio` - биография (TEXT)
- `company_description` - описание компании (TEXT)
- `slogan` - слоган (TEXT)

---

## 4. 📊 СТАТИСТИКА ДАННЫХ

| Таблица | Записей |
|---------|---------|
| `users` | 3 (admin, Masterbaha, Klient ali) |
| `videos` | 2 (обе от Masterbaha) |
| `video_bookmarks` | 0 |
| `subscriptions` | 0 |

---

## 5. ✅ ЧТО НУЖНО ИСПРАВИТЬ

### Приоритет 1: Критические ошибки

1. **Исправить систему сброса пароля:**
   - Вариант А: Переделать `/forgot-password` и `/reset-password` для работы с phone + SMS
   - Вариант Б: Создать новый `/auth/change-password` для авторизованных

2. **Убрать несуществующие поля из UI:**
   - Удалить `email` из ProfilePage (он пустой и не нужен)
   - Удалить `specialties` из ProfilePage (нет в БД)
   - Удалить `location` из ProfilePage (нет в БД)
   - Удалить `rating/reviewsCount` из MasterChannelPage (нет в БД)

3. **Исправить мобильное приложение:**
   - Заменить `user.name` на `user.username` или `user.firstName + user.lastName`

### Приоритет 2: Добавить функционал

4. **Добавить в веб-профиль:**
   - Секцию "Избранные видео" (с загрузкой из `/videos/bookmarked`)
   - Секцию "Подписки" (с загрузкой из `/users/:id/subscriptions`)
   - Поля `bio`, `company_description`, `slogan` (для мастеров)
   - Кнопку "Сменить пароль"
   - Кнопку "Сменить телефон"

5. **Добавить в мобильный профиль:**
   - Те же секции что и в веб

6. **Создать API эндпоинт:**
   - `POST /auth/change-password` (oldPassword, newPassword)

### Приоритет 3: Улучшения

7. **Обновить `/auth/profile`:**
   - Добавить поддержку `bio`, `company_description`, `slogan`

8. **Создать роут ChangePasswordScreen:**
   - В мобильном приложении (сейчас переход есть, но экрана нет)

---

## 6. 🎯 РЕКОМЕНДАЦИИ

### A. Для профиля МАСТЕРА добавить:
- `bio` - описание себя/компании
- `company_description` - детальное описание услуг
- `slogan` - слоган/девиз
- Список опубликованных видео
- Избранное
- Подписчики

### B. Для профиля КЛИЕНТА добавить:
- Избранные видео
- Подписки на мастеров
- История заявок

### C. Для ОБОИХ:
- Смена пароля (с проверкой старого)
- Смена телефона (через SMS верификацию)
- Загрузка аватара

---

## 7. 🔐 БЕЗОПАСНОСТЬ

### Текущее состояние:
- ❌ Сброс пароля НЕ работает
- ✅ SMS верификация работает
- ✅ JWT токены работают
- ⚠️ Email НЕ используется (пустой у всех)

### Рекомендации:
1. Убрать зависимость от email
2. Использовать только phone + SMS
3. Добавить смену пароля через старый пароль
4. Добавить 2FA (опционально)

---

## 8. 📝 ИТОГИ ДЕТАЛЬНОГО ИЗУЧЕНИЯ

✅ **Изучено:**
- Структура БД полностью
- Все API эндпоинты
- Веб-клиент (ProfilePage, MasterChannelPage)
- Мобильное приложение (ProfileScreen, EditProfileScreen, SettingsScreen)
- Типы данных (shared/types/index.ts)
- Связанные таблицы (video_bookmarks, subscriptions)

❌ **Найдены критические проблемы:**
- Система сброса пароля НЕ работает
- Несоответствие между клиентом и сервером
- Используются несуществующие поля
- НЕ используются существующие поля (bio, company_description, slogan)

🎯 **Готово к исправлению:**
- Полная картина системы собрана
- Все проблемы задокументированы
- План исправлений составлен


