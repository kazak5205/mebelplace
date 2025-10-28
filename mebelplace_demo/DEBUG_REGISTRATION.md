# 🔍 ДИАГНОСТИКА РЕГИСТРАЦИИ

## 📦 Новый APK с подробными логами собран!

```
✅ build/app/outputs/flutter-apk/app-release.apk
📏 52.0 MB
🔍 С детальными логами регистрации
```

---

## 🧪 КАК ПРОТЕСТИРОВАТЬ С ЛОГАМИ

### Вариант 1: Через ADB (если телефон подключен по USB)

```bash
# 1. Установите APK
adb install -r build\app\outputs\flutter-apk\app-release.apk

# 2. Запустите логи в отдельном окне
adb logcat | Select-String "API|Starting registration|Registration response"

# 3. Пройдите регистрацию в приложении
```

### Вариант 2: Без ADB (просто установите и напишите что показывает)

```bash
# Скопируйте APK на телефон и установите
# Попробуйте зарегистрироваться
# Скажите какую ошибку показывает
```

---

## 📊 ЧТО ИСКАТЬ В ЛОГАХ

При успешной регистрации должно быть:

```
🚀 Starting registration:
   Phone: +77475678424
   Username: TestUser
   Password: temp_77475678424
   Role: user

📤 API Request: POST /auth/register
   Body: {phone: +77475678424, username: TestUser, password: temp_77475678424, role: user}

📥 API Response: 201 /auth/register
   Keys (after transform): success, data, user, accessToken, refreshToken

📥 Registration response:
   Success: true
   Message: User registered successfully
   Has data: true
   Has token: true

✅ Registration successful! Saving auth data...
✅ Auth data saved! Navigating to home...
```

---

## ❌ ЕСЛИ РЕГИСТРАЦИЯ ПАДАЕТ

Логи покажут ТОЧНОЕ место:

### Ошибка 1: Телефон уже существует
```
❌ API Response: 409 /auth/register
   Error data: {success: false, message: User with this phone or username already exists}

❌ Registration failed: User with this phone or username already exists
```

**Решение:** Используйте другой номер телефона

---

### Ошибка 2: SMS не был верифицирован
```
❌ API Response: 400 /auth/register
   Error data: {success: false, message: Phone not verified}

❌ Registration failed: Phone not verified
```

**Решение:** Баг в flow - нужно фиксить бэк или мобилку

---

### Ошибка 3: Неверный формат данных
```
❌ API Response: 400 /auth/register
   Error data: {success: false, message: Phone, username, and password are required}

❌ Registration failed: Phone, username, and password are required
```

**Решение:** Проблема с форматом данных

---

### Ошибка 4: Проблема с парсингом ответа
```
📥 API Response: 201 /auth/register

❌ Registration exception: type 'Null' is not a subtype of type 'String'
```

**Решение:** Бэк вернул данные в неверном формате

---

## 🎯 ТЕСТОВЫЙ СЦЕНАРИЙ

1. **Откройте приложение**
2. **Нажмите на любую иконку навигации** (кроме главной)
3. **Выберите "Я хочу заказать мебель"**
4. **Введите НОВЫЙ телефон:** `+7 707 999 8877` (не тот, что раньше использовали!)
5. **Дождитесь SMS**
6. **Введите код из SMS**
7. **Введите никнейм:** `TestUser123`
8. **Нажмите "Завершить регистрацию"**

---

## 📝 ЧТО МНЕ НАПИСАТЬ

Скопируй и отправь логи где:
- `🚀 Starting registration:`
- `📤 API Request: POST /auth/register`
- `📥 API Response: ...`
- `❌` (если есть ошибки)

Или просто напиши **какую ошибку показывает экран** (если без логов).

---

## 🔑 ВАЖНО

**Используй НОВЫЙ номер телефона!** Если старый уже зарегистрирован, будет ошибка `409 Conflict`.

Тестовые номера для Казахстана:
- `+7 707 999 8877`
- `+7 708 888 7766`
- `+7 777 555 4433`

---

**Установи новый APK и дай обратную связь!** 🔍

