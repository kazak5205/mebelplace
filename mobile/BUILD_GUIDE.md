# 📱 MebelPlace Mobile - Руководство по сборке

## Требования

### Для локальной сборки:
- Node.js 18+
- Java JDK 17
- Android SDK (для Android)
- Xcode (для iOS, только на macOS)

### Для облачной сборки (EAS):
- Аккаунт Expo
- EAS CLI установлен глобально

## 🚀 Быстрая сборка

### 1. APK (для тестирования)

```bash
# Вариант 1: Через Gradle (локально)
cd android
.\gradlew.bat assembleRelease

# Файл будет в: android/app/build/outputs/apk/release/app-release.apk
```

```bash
# Вариант 2: Через EAS (облако)
eas build --profile preview --platform android
```

### 2. AAB (для Google Play Store)

```bash
# Через Gradle (локально)
cd android
.\gradlew.bat bundleRelease

# Файл будет в: android/app/build/outputs/bundle/release/app-release.aab
```

```bash
# Через EAS (облако)
eas build --profile production --platform android
```

## 📋 Детальная инструкция

### Подготовка

1. **Установить зависимости:**
```bash
npm install
```

2. **Проверить конфигурацию:**
```bash
# Проверить app.json
# Проверить eas.json
# Проверить android/app/build.gradle
```

### Сборка через Gradle (локально)

#### APK для тестирования:

```bash
cd android

# Debug APK (с логированием)
.\gradlew.bat assembleDebug

# Release APK (оптимизированный)
.\gradlew.bat assembleRelease
```

**Результат:**
- Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release: `android/app/build/outputs/apk/release/app-release.apk`

#### AAB для публикации:

```bash
cd android

# Release AAB (для Google Play)
.\gradlew.bat bundleRelease
```

**Результат:**
- Release: `android/app/build/outputs/bundle/release/app-release.aab`

### Сборка через EAS (облако)

#### Первая настройка:

```bash
# Логин в Expo
eas login

# Конфигурация проекта
eas build:configure
```

#### Профили сборки (настроены в eas.json):

1. **Preview** - APK для тестирования
2. **Production** - AAB для Play Store

#### Команды сборки:

```bash
# APK для тестирования
eas build --profile preview --platform android

# AAB для публикации
eas build --profile production --platform android

# Обе платформы одновременно
eas build --profile production --platform all
```

## 🔑 Подписание APK/AAB

### Для локальной сборки:

1. **Создать keystore:**
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore mebelplace-upload-key.keystore -alias mebelplace-key -keyalg RSA -keysize 2048 -validity 10000
```

2. **Настроить gradle.properties:**
```properties
MYAPP_UPLOAD_STORE_FILE=mebelplace-upload-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=mebelplace-key
MYAPP_UPLOAD_STORE_PASSWORD=***
MYAPP_UPLOAD_KEY_PASSWORD=***
```

### Для EAS:

EAS автоматически создает и управляет ключами.

## 📦 Размер сборки

Оптимизация для уменьшения размера:

1. **Включить ProGuard/R8:**
```gradle
android {
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
        }
    }
}
```

2. **Split APKs по архитектуре:**
```gradle
android {
    splits {
        abi {
            enable true
            reset()
            include 'armeabi-v7a', 'arm64-v8a', 'x86', 'x86_64'
            universalApk false
        }
    }
}
```

## 🧪 Тестирование сборки

### Установка APK:

```bash
# На подключенное устройство
adb install android/app/build/outputs/apk/release/app-release.apk

# Или просто скопировать APK на телефон и установить
```

### Проверка AAB:

```bash
# Использовать bundletool
bundletool build-apks --bundle=app-release.aab --output=app.apks

# Установить на устройство
bundletool install-apks --apks=app.apks
```

## 📊 Troubleshooting

### Ошибка: "SDK location not found"
```bash
# Создать local.properties в android/
echo "sdk.dir=C:\\Users\\YourUser\\AppData\\Local\\Android\\Sdk" > local.properties
```

### Ошибка: "Execution failed for task ':app:lintVitalRelease'"
```gradle
// В android/app/build.gradle добавить:
lintOptions {
    checkReleaseBuilds false
}
```

### Ошибка нехватки памяти:
```properties
# В gradle.properties добавить:
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m
```

## 🎯 Быстрые скрипты

Используйте готовые скрипты из package.json:

```bash
# APK для тестирования
npm run build:preview

# AAB для производства
npm run build:production
```

## 📱 Установка на устройство

### Через USB (ADB):
```bash
adb devices
adb install path/to/app.apk
```

### Через QR код (EAS):
После облачной сборки EAS предоставит QR код для установки.

## ✅ Checklist перед сборкой

- [ ] Обновлен versionCode в app.json
- [ ] Обновлен version в app.json
- [ ] Проверен app.json (bundle ID, permissions)
- [ ] Настроены иконки и splash screen
- [ ] Проверены environment variables
- [ ] Протестировано на эмуляторе
- [ ] Проверена синхронизация с backend API

## 🚀 Результат

После успешной сборки:

**APK**: ~50-80 MB (для тестирования)  
**AAB**: ~30-50 MB (для Play Store)

Файлы будут в:
- `android/app/build/outputs/apk/release/`
- `android/app/build/outputs/bundle/release/`

