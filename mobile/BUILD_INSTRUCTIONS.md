# 📦 Инструкция по сборке APK для MebelPlace

## ✅ Вариант 1: Сборка через EAS Build (Рекомендуется)

### Шаг 1: Установите EAS CLI
```bash
npm install -g eas-cli
```

### Шаг 2: Войдите в Expo аккаунт
```bash
eas login
```
Если нет аккаунта - создайте на https://expo.dev/signup

### Шаг 3: Настройте проект
```bash
cd /opt/mebelplace/mobile
eas build:configure
```

### Шаг 4: Соберите APK
```bash
eas build --platform android --profile preview
```

Это займет 10-15 минут. После завершения вы получите ссылку на скачивание APK.

---

## 🖥️ Вариант 2: Локальная сборка на Windows/Mac

### Требования:
- Node.js 18+
- Android Studio с Android SDK
- Java JDK 17+

### Шаги:

1. **Клонируйте проект** (если еще не сделали)
```bash
git clone <your-repo>
cd mobile
```

2. **Установите зависимости**
```bash
npm install
```

3. **Сгенерируйте нативные файлы**
```bash
npx expo prebuild --clean
```

4. **Соберите APK**
```bash
cd android
./gradlew assembleRelease
```

5. **Найдите APK**
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## 📱 Вариант 3: Тестирование через Expo Go (Быстро)

1. Установите Expo Go на Android:
   - https://play.google.com/store/apps/details?id=host.exp.exponent

2. Запустите сервер разработки:
```bash
cd /opt/mebelplace/mobile
npx expo start --tunnel
```

3. Отсканируйте QR-код в приложении Expo Go

---

## 🔧 Если возникли ошибки:

### Ошибка: "ANDROID_HOME not set"
Установите Android Studio и добавьте в PATH:
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Ошибка: "eas: command not found"
```bash
npm install -g eas-cli
```

### Ошибка: "Not logged in"
```bash
eas login
```

---

## 📋 Информация о приложении

- **Название:** MebelPlace
- **Package:** com.mebelplace.mobile3131
- **Версия:** 1.0.0
- **Build Type:** APK (Android)
- **Минимальная версия Android:** 5.0 (API 21)

---

## 🚀 Готовый APK будет находиться:

- **EAS Build:** Ссылка в консоли + на https://expo.dev
- **Локальная сборка:** `android/app/build/outputs/apk/release/app-release.apk`

---

## 💡 Рекомендация

**Используйте EAS Build** - это проще и не требует настройки Android SDK на вашем компьютере!

