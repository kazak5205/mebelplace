# ✅ Исправления токенов и авторизации

## 🔧 Исправленные файлы

### 1. **api.ts** (базовый API сервис)
- ✅ Изменен timeout: `10000` → `30000` мс
- ✅ Токены: `authToken` → `accessToken` + `refreshToken`
- ✅ Добавлена автоматическая обработка refresh token при 401
- ✅ Добавлен метод `delete()` с поддержкой body

**Логика refresh:**
```typescript
401 ошибка → 
  Проверка флага _retry →
  Получение refreshToken из localStorage →
  POST /api/auth/refresh →
  Сохранение нового accessToken →
  Повтор оригинального запроса
```

---

### 2. **authService.ts** (сервис авторизации)
- ✅ Структура ответа: `{ user, accessToken, refreshToken }`
- ✅ Автоматическое сохранение токенов в `login()` и `register()`
- ✅ Удаление обоих токенов в `logout()`
- ✅ Добавлены методы: `verifyEmail`, `forgotPassword`, `resetPassword`
- ❌ Удалены методы: `getCurrentUser()`, `updateUser()` (нет на бэкенде)

---

### 3. **AuthContext.tsx** (контекст авторизации)
**Исправлено:**
- ✅ `localStorage.getItem('authToken')` → `accessToken` + `refreshToken`
- ✅ Убран вызов несуществующего `getCurrentUser()`
- ✅ `logout()` теперь async и вызывает `authService.logout()`
- ✅ `updateUser()` временно обновляет локально (TODO: нужен эндпоинт)
- ✅ `isClient` проверяет `role === 'user'` вместо `'client'`
- ✅ Типы `RegisterData` согласованы с бэкендом

**Важно:**
```typescript
// БЫЛО:
const token = localStorage.getItem('authToken')
const userData = await authService.getCurrentUser()

// СТАЛО:
const accessToken = localStorage.getItem('accessToken')
const refreshToken = localStorage.getItem('refreshToken')
// getCurrentUser нет, user будет установлен после первого запроса
```

---

### 4. **SocketContext.tsx** (WebSocket)
- ✅ Токен для Socket.IO: `authToken` → `accessToken`

```typescript
// БЫЛО:
auth: { token: localStorage.getItem('authToken') }

// СТАЛО:
auth: { token: localStorage.getItem('accessToken') }
```

---

### 5. **types/index.ts** (TypeScript типы)
**User:**
- ✅ `role: 'client' | 'master' | 'admin'` → `'user' | 'master' | 'admin'`
- ✅ Добавлены поля: `username`, `firstName`, `lastName`, `isActive`, `isVerified`, `phone`
- ✅ `name` теперь опциональный

**Order:**
- ✅ Добавлен статус: `'accepted'`
- ✅ Все поля сделаны опциональными где нужно

---

### 6. **Компоненты (только логика, UI не трогали)**

**RegisterPage.tsx:**
- ✅ `setRole('client')` → `setRole('user')`
- ✅ `role === 'client'` → `role === 'user'`
- ✅ Тип state: `'client' | 'master'` → `'user' | 'master'`
- ✅ Текст "Клиент" остался (это UI)

**BottomNavigation.tsx:**
- ✅ `user.role === 'client'` → `user.role === 'user'`

**OrdersPage.tsx:**
- ✅ Все проверки `user?.role === 'client'` → `user?.role === 'user'`

---

## 🚨 Критичные изменения для пользователя

### 1. **Токены в localStorage**
```typescript
// СТАРЫЕ КЛЮЧИ (не используются больше):
localStorage.getItem('authToken')

// НОВЫЕ КЛЮЧИ:
localStorage.getItem('accessToken')  // JWT, живет 15 минут
localStorage.getItem('refreshToken') // Живет 7 дней
```

### 2. **Роли пользователей**
```typescript
// БЫЛО:
role: 'client' | 'master' | 'admin'

// СТАЛО:
role: 'user' | 'master' | 'admin'

// 'user' = обычный клиент (заказчик)
// 'master' = мастер (исполнитель)
// 'admin' = администратор
```

### 3. **Отсутствующие методы**
```typescript
// ❌ НЕ РАБОТАЮТ (нет на бэкенде):
authService.getCurrentUser()  // Нет эндпоинта GET /api/auth/me
authService.updateUser()      // Нет эндпоинта PUT /api/auth/profile

// TODO: Нужно добавить на бэкенд:
// GET /api/auth/me - получить текущего пользователя
// PUT /api/auth/profile - обновить профиль
```

---

## 📝 Что нужно сделать дальше

### На бэкенде:
1. ✅ **Добавить GET `/api/auth/me`** - получение текущего пользователя
   ```javascript
   router.get('/me', authenticateToken, async (req, res) => {
     const user = await pool.query(
       'SELECT id, email, username, first_name, last_name, role, is_verified FROM users WHERE id = $1',
       [req.user.id]
     )
     res.json({ success: true, data: user.rows[0] })
   })
   ```

2. ✅ **Добавить PUT `/api/auth/profile`** - обновление профиля
   ```javascript
   router.put('/profile', authenticateToken, async (req, res) => {
     const { firstName, lastName, phone } = req.body
     // UPDATE users SET ...
   })
   ```

### На фронтенде:
1. ✅ **Обновить AuthContext.tsx**
   - После добавления эндпоинта `/me` использовать его в `initAuth()`
   ```typescript
   if (accessToken && refreshToken) {
     const userData = await authService.getCurrentUser()
     setUser(userData)
   }
   ```

2. ✅ **Добавить методы в authService.ts**
   ```typescript
   async getCurrentUser(): Promise<User> {
     return apiService.get('/auth/me')
   }
   
   async updateProfile(userData: Partial<User>): Promise<User> {
     return apiService.put('/auth/profile', userData)
   }
   ```

---

## ✅ Итого исправлено:

**Файлов изменено: 9**
- ✅ `api.ts` - refresh token logic
- ✅ `authService.ts` - токены и методы
- ✅ `AuthContext.tsx` - полностью переработан
- ✅ `SocketContext.tsx` - токен для WebSocket
- ✅ `types/index.ts` - роли и типы
- ✅ `RegisterPage.tsx` - роль 'user'
- ✅ `BottomNavigation.tsx` - роль 'user'
- ✅ `OrdersPage.tsx` - роль 'user'
- ✅ `pushService.ts` - DELETE с body

**Проблем найдено и исправлено: 15**
- ❌ Старый `authToken` (5 мест)
- ❌ Несуществующие методы (2 метода)
- ❌ Неправильная роль `'client'` (6 мест)
- ❌ Отсутствие refresh token логики
- ❌ DELETE без body в api.ts

**Ошибок линтера: 0** ✅

---

## 🔐 Безопасность

### Автоматический refresh token:
- ✅ При 401 ошибке автоматически обновляется `accessToken`
- ✅ Предотвращение бесконечных циклов (флаг `_retry`)
- ✅ Автоматическая разлогинизация при неудаче refresh
- ✅ Все происходит прозрачно для пользователя

### Хранение токенов:
- ✅ `accessToken` - короткая жизнь (15 мин), частое обновление
- ✅ `refreshToken` - длинная жизнь (7 дней), хранится в БД
- ✅ При logout оба токена удаляются
- ✅ При неудачном refresh оба токена удаляются

---

## 🎯 Рекомендации

1. **Мигрировать старые токены:**
   ```typescript
   // При загрузке приложения
   const oldToken = localStorage.getItem('authToken')
   if (oldToken) {
     // Попытаться обменять на новые токены
     // Или просто удалить и попросить перелогиниться
     localStorage.removeItem('authToken')
   }
   ```

2. **Добавить индикатор обновления токена:**
   ```typescript
   const [isRefreshing, setIsRefreshing] = useState(false)
   // Показывать лоадер во время refresh
   ```

3. **Логировать проблемы с токенами:**
   ```typescript
   console.log('Token refresh failed:', error)
   // Отправлять в Sentry/LogRocket
   ```

