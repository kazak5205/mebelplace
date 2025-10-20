# Проблема с созданием AAB файла

## ❌ Текущая проблема

При попытке создать AAB файл для Google Play возникают ошибки:

### Ошибка 1: expo-module-gradle-plugin не найден
```
Plugin [id: 'expo-module-gradle-plugin'] was not found in any of the following sources
```

### Ошибка 2: Неизвестное свойство 'release'
```
Could not get unknown property 'release' for SoftwareComponent container
```

## 🔧 Возможные решения

### Решение 1: Обновление Expo SDK
```bash
cd mobile
npx expo install --fix
npx expo doctor
```

### Решение 2: Очистка и пересборка
```bash
cd mobile
rm -rf node_modules
npm install
cd android
./gradlew clean
cd ..
npx expo run:android
```

### Решение 3: Использование EAS Build (требует аккаунт Expo)
```bash
# Создать аккаунт на https://expo.dev
npx eas-cli login
npx eas-cli build --platform android --profile production
```

### Решение 4: Альтернативная сборка через Android Studio
1. Открыть проект в Android Studio
2. File → Build → Generate Signed Bundle/APK
3. Выбрать Android App Bundle
4. Создать keystore для подписи

## 📋 Текущий статус

✅ **APK файл создан успешно**: `app-debug.apk` (207 MB)  
✅ **Приложение работает на эмуляторе**  
❌ **AAB файл не создается** из-за проблем с Expo модулями  

## 🎯 Рекомендации

### Для тестирования:
- Используйте APK файл `app-debug.apk`
- Установите на реальное устройство для полного тестирования
- APK можно установить через `adb install` или файловый менеджер

### Для публикации в Google Play:
1. **Создайте аккаунт Expo** и используйте EAS Build
2. **Или** исправьте проблемы с Gradle и соберите AAB локально
3. **Или** используйте Android Studio для создания подписанного AAB

## 📱 Альтернативные способы публикации

### Через Expo Go (для тестирования):
```bash
npx expo start
# Сканировать QR код в Expo Go приложении
```

### Через Expo Development Build:
```bash
npx expo run:android --variant release
```

## 🔍 Диагностика

Проверьте версии:
```bash
npx expo --version
npx eas-cli --version
node --version
npm --version
```

Проверьте конфигурацию:
```bash
cat app.json
cat eas.json
cat android/app/build.gradle
```

---

**Примечание**: APK файл полностью функционален и готов для тестирования. AAB файл нужен только для публикации в Google Play Store.

