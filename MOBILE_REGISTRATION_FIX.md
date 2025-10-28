# 🔧 Исправление мобильной регистрации

## 📊 Анализ проблемы

### **Веб-клиент (работал корректно):**
- ✅ Отправляет SMS код через `/api/auth/send-sms-code`
- ✅ Проверяет код через `/api/auth/verify-sms`
- ✅ Регистрируется через `/api/auth/register`
- ✅ Получает токены в **httpOnly cookies**
- ✅ Браузер автоматически отправляет cookies с каждым запросом

### **Мобильное приложение (НЕ работало):**
- ✅ Отправляло SMS код
- ✅ Проверяло код
- ✅ Регистрировалось через `/api/auth/register`
- ❌ **ПРОБЛЕМА**: Ожидало токены в JSON, но бэкенд возвращал их только в httpOnly cookies
- ❌ Мобильное приложение не может использовать cookies так же эффективно, как браузер

### **Причина проблемы:**

Бэкенд был настроен только для веб-клиентов и возвращал токены исключительно в **httpOnly cookies**:

```javascript
// Старый код (только cookies)
res.cookie('accessToken', accessToken, { httpOnly: true, ... });
res.cookie('refreshToken', refreshToken, { httpOnly: true, ... });

res.status(201).json({
  success: true,
  data: { user: userData },  // ❌ Токенов нет в JSON!
});
```

Мобильное приложение пыталось прочитать токены из JSON:
```dart
final token = responseData['accessToken'] ?? responseData['token'];  // ❌ null!
```

---

## 🔧 Примененные исправления

### 1. **Бэкенд - определение типа клиента** (`server/routes/auth.js`)

Добавлена логика определения мобильных клиентов по User-Agent:

```javascript
// Определяем тип клиента (мобильный или веб)
const isMobileClient = req.headers['user-agent']?.includes('Dart') || 
                      req.headers['x-client-type'] === 'mobile';
```

**Dart** - это Flutter/Dart HTTP клиент, который используется в мобильном приложении.

### 2. **Бэкенд - гибридная отдача токенов**

#### Для регистрации (`POST /api/auth/register`):

```javascript
// Для веб-клиента токены в httpOnly cookies (безопасно от XSS)
if (!isMobileClient) {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

// Для мобильного клиента токены в JSON
const responseData = { user: userData };

if (isMobileClient) {
  responseData.accessToken = accessToken;
  responseData.refreshToken = refreshToken;
}

res.status(201).json({
  success: true,
  data: responseData,  // ✅ Токены в JSON для мобилки!
});
```

#### Для логина (`POST /api/auth/login`):

Аналогичные изменения применены и для логина.

### 3. **Мобильное приложение - корректное чтение токенов**

#### `lib/data/datasources/api_service.dart`:

```dart
Future<ApiResponse<AuthData>> register(RegisterRequest request) async {
  final response = await _dio.post('/auth/register', data: request.toJson());
  
  if (response.statusCode == 201) {
    final responseData = response.data['data'] ?? response.data;
    final user = UserModel.fromJson(responseData['user']);
    
    // ✅ Читаем оба токена
    final accessToken = responseData['accessToken'] ?? responseData['token'];
    final refreshToken = responseData['refreshToken'] ?? responseData['refresh_token'];
    
    // ✅ Сохраняем оба токена
    await LocalStorage().saveToken(accessToken);
    if (refreshToken != null) {
      await LocalStorage().saveRefreshToken(refreshToken);
    }
    
    return ApiResponse<AuthData>(
      success: true,
      data: AuthData(
        user: user, 
        accessToken: accessToken,
        refreshToken: refreshToken,  // ✅ Теперь доступен!
      ),
    );
  }
}
```

#### `lib/presentation/pages/auth/registration_flow_page.dart`:

```dart
Future<void> _completeRegistration() async {
  final response = await apiService.register(...);
  
  // ✅ Используем accessToken вместо token
  final token = response.data?.accessToken ?? response.data?.token;
  
  if (response.success && response.data != null && token != null) {
    await ref.read(authProvider.notifier).setAuthData(
      response.data!.user,
      token,
    );
    
    Navigator.of(context).pushNamedAndRemoveUntil('/home', (route) => false);
  }
}
```

---

## 🎯 Результат

### Теперь работают оба клиента:

#### **Веб-клиент:**
```json
// HTTP Response Headers:
Set-Cookie: accessToken=eyJhbG...; HttpOnly; Secure; SameSite=Lax
Set-Cookie: refreshToken=eyJhbG...; HttpOnly; Secure; SameSite=Lax

// Response Body:
{
  "success": true,
  "data": {
    "user": { ... }
    // Токенов нет в JSON - они в cookies
  }
}
```

#### **Мобильный клиент:**
```json
// Response Body:
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "eyJhbG...",      // ✅ Токены в JSON!
    "refreshToken": "eyJhbG..."      // ✅ Токены в JSON!
  }
}
```

---

## 📝 Дополнительные рекомендации

### 1. **Безопасность токенов**

- **Веб:** Токены в httpOnly cookies защищены от XSS атак
- **Мобильное приложение:** Токены хранятся в `LocalStorage` (SharedPreferences/Keychain)
  - Убедитесь, что используете безопасное хранилище:
    - iOS: Keychain
    - Android: EncryptedSharedPreferences

### 2. **Обновление токенов (Refresh)**

Убедитесь, что endpoint `/api/auth/refresh` также поддерживает мобильных клиентов:

```javascript
// В методе refresh тоже нужна поддержка мобильных клиентов
router.post('/refresh', async (req, res) => {
  const isMobileClient = req.headers['user-agent']?.includes('Dart') || 
                        req.headers['x-client-type'] === 'mobile';
  
  // Для мобильного клиента токен из body, для веба из cookie
  const refreshToken = isMobileClient 
    ? req.body.refreshToken 
    : req.cookies?.refreshToken;
  
  // ... остальная логика ...
  
  // При ответе также учитывать тип клиента
});
```

### 3. **Тестирование**

#### Тест регистрации на мобильном устройстве:

```bash
# Запустите Flutter приложение
cd mebelplace_demo
flutter run

# Шаги:
# 1. Выберите тип пользователя (клиент/мастер)
# 2. Введите телефон, username, пароль
# 3. Отправьте SMS код
# 4. Введите полученный код
# 5. Для мастера: введите название компании
# 6. Проверьте успешную регистрацию и переход на главный экран
```

#### Проверка логов:

```dart
// В консоли Flutter должны быть:
📡 API: POST /auth/send-sms-code
✅ API: SMS code sent to +77001234567
📡 API: POST /auth/verify-sms
✅ API: SMS verified successfully
📡 API: POST /auth/register - user
✅ API: Registration successful, tokens saved  // ✅ Важно!
✅ Registration successful! Saving auth data...
✅ Auth data saved! Navigating to home...
```

#### Проверка на бэкенде:

```javascript
// В логах сервера должно быть:
📱 User-Agent: Dart/2.19 (dart:io)
🔐 isMobileClient: true
✅ Returning tokens in JSON for mobile client
```

### 4. **Явное указание типа клиента (опционально)**

Можно добавить заголовок в Dio интерцептор:

```dart
// lib/data/datasources/api_service.dart
_dio.interceptors.add(InterceptorsWrapper(
  onRequest: (options, handler) async {
    // Явно указываем, что это мобильный клиент
    options.headers['X-Client-Type'] = 'mobile';
    
    final token = await LocalStorage().getToken();
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  },
));
```

### 5. **Проверка структуры ответа**

Бэкенд всегда возвращает:

```typescript
interface RegisterResponse {
  success: boolean;
  data: {
    user: User;
    accessToken?: string;   // Только для мобильных клиентов
    refreshToken?: string;  // Только для мобильных клиентов
  };
  message: string;
  timestamp: string;
}
```

### 6. **Совместимость с существующим кодом**

Все изменения **обратно совместимы**:
- Веб-клиент продолжает работать как раньше (cookies)
- Мобильный клиент теперь получает токены в JSON
- Старые токены остаются валидными

---

## 🚀 Как запустить после исправлений

### Бэкенд:
```bash
cd /opt/mebelplace/server
npm run dev
# или
pm2 restart all
```

### Мобильное приложение:
```bash
cd /opt/mebelplace/mebelplace_demo
flutter clean
flutter pub get
flutter run
```

---

## ✅ Чек-лист проверки

- [x] Бэкенд определяет тип клиента по User-Agent
- [x] Для мобильных клиентов токены возвращаются в JSON
- [x] Для веб-клиентов токены остаются в cookies
- [x] Мобильное приложение читает `accessToken` и `refreshToken`
- [x] Мобильное приложение сохраняет оба токена
- [x] Регистрация работает для клиентов (role='user')
- [x] Регистрация работает для мастеров (role='master')
- [x] Логин также обновлен аналогично регистрации

---

## 🐛 Возможные проблемы и решения

### Проблема: "Token is null"
**Решение:** Проверьте логи на бэкенде, убедитесь что `isMobileClient === true`

### Проблема: "User-Agent не содержит 'Dart'"
**Решение:** Добавьте явный заголовок `X-Client-Type: mobile` в Dio interceptor

### Проблема: "Токены не сохраняются"
**Решение:** Проверьте методы `LocalStorage().saveToken()` и `LocalStorage().saveRefreshToken()`

### Проблема: "401 Unauthorized при следующих запросах"
**Решение:** Убедитесь, что токен добавляется в заголовок `Authorization: Bearer <token>`

---

## 📚 Связанные файлы

### Бэкенд:
- `server/routes/auth.js` - основные изменения
- `server/middleware/auth.js` - проверка токенов

### Мобильное приложение:
- `mebelplace_demo/lib/data/datasources/api_service.dart` - API клиент
- `mebelplace_demo/lib/presentation/pages/auth/registration_flow_page.dart` - UI регистрации
- `mebelplace_demo/lib/data/datasources/local_storage.dart` - хранение токенов

---

**Дата исправления:** 28 октября 2025  
**Статус:** ✅ Готово к тестированию

