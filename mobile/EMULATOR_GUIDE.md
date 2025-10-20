# Руководство по запуску эмулятора и приложения

## 🚀 Быстрый запуск

### 1. Запуск эмулятора
```powershell
# Установка переменной окружения
$env:ANDROID_SDK_ROOT = "$env:LOCALAPPDATA\Android\Sdk"

# Список доступных эмуляторов
& "$env:ANDROID_SDK_ROOT\emulator\emulator.exe" -list-avds

# Запуск эмулятора (выберите один из доступных)
& "$env:ANDROID_SDK_ROOT\emulator\emulator.exe" -avd "MebelPlace_Fast"
```

### 2. Проверка подключения
```powershell
# Проверка подключенных устройств
& "$env:ANDROID_SDK_ROOT\platform-tools\adb.exe" devices
```

Ожидаемый результат:
```
List of devices attached
emulator-5554    device
```

### 3. Установка APK
```powershell
# Установка приложения на эмулятор
& "$env:ANDROID_SDK_ROOT\platform-tools\adb.exe" install -r "android\app\build\outputs\apk\debug\app-debug.apk"
```

### 4. Запуск приложения
```powershell
# Запуск MebelPlace
& "$env:ANDROID_SDK_ROOT\platform-tools\adb.exe" shell am start -n com.mebelplace.mobile/.MainActivity
```

## 📱 Доступные эмуляторы

В проекте настроены следующие эмуляторы:
- **MebelPlace_Fast** - Быстрый эмулятор для тестирования
- **MebelPlace_Pixel_7** - Эмулятор Pixel 7
- **MebelPlace_Test** - Тестовый эмулятор

## 🛠 Полезные команды

### Проверка статуса
```powershell
# Проверка подключенных устройств
adb devices

# Проверка установленных приложений
adb shell pm list packages | grep mebelplace

# Проверка активных приложений
adb shell dumpsys activity activities | grep -E "mResumedActivity"
```

### Управление приложением
```powershell
# Запуск приложения
adb shell am start -n com.mebelplace.mobile/.MainActivity

# Остановка приложения
adb shell am force-stop com.mebelplace.mobile

# Очистка данных приложения
adb shell pm clear com.mebelplace.mobile

# Переустановка приложения
adb uninstall com.mebelplace.mobile
adb install -r "android\app\build\outputs\apk\debug\app-debug.apk"
```

### Логи и отладка
```powershell
# Просмотр логов приложения
adb logcat | grep "mebelplace"

# Просмотр всех логов
adb logcat

# Очистка логов
adb logcat -c
```

## 🔧 Решение проблем

### Эмулятор не запускается
1. Проверьте, что Android Studio установлен
2. Убедитесь, что SDK путь правильный: `$env:LOCALAPPDATA\Android\Sdk`
3. Перезапустите эмулятор: `adb kill-server && adb start-server`

### Приложение не устанавливается
1. Проверьте, что APK файл существует
2. Убедитесь, что эмулятор запущен
3. Попробуйте переустановить: `adb uninstall com.mebelplace.mobile`

### Приложение не запускается
1. Проверьте логи: `adb logcat | grep "mebelplace"`
2. Перезапустите приложение
3. Проверьте, что все зависимости установлены

## 📊 Информация о приложении

- **Package Name**: `com.mebelplace.mobile`
- **Main Activity**: `.MainActivity`
- **APK Size**: ~207 MB
- **Min SDK**: API 21 (Android 5.0)
- **Target SDK**: API 34 (Android 14)

## 🎯 Тестирование

### Основные функции для тестирования
1. **Регистрация/Вход** - Проверьте создание аккаунтов
2. **Просмотр видео** - Тестируйте видео-портфолио
3. **Создание заказов** - Проверьте создание заказов
4. **Чат** - Тестируйте обмен сообщениями
5. **Профиль** - Проверьте редактирование профиля

### Тестовые данные
- **Тестовый клиент**: test@mebelplace.com / password123
- **Тестовый мастер**: master@mebelplace.com / password123
- **Админ**: admin@mebelplace.com / admin123

## 📝 Примечания

- Эмулятор должен быть запущен перед установкой APK
- Убедитесь, что сервер запущен для полноценного тестирования
- Для тестирования push-уведомлений нужен реальный девайс
- Некоторые функции (камера, GPS) могут работать ограниченно в эмуляторе

---

**Удачного тестирования!** 🚀📱

