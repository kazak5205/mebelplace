# Готовые настройки для Codemagic

## 🔑 Environment Variables (переменные окружения)

Добавьте эти переменные в Codemagic UI:

```
APP_STORE_CONNECT_ISSUER_ID = 94ce68e4-bd5a-4bf4-b266-46f0b9bd0596
APP_STORE_CONNECT_API_KEY_ID = 7R2G5C786A
APP_STORE_CONNECT_API_KEY_CONTENT = -----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgXgSbslYnlaFQ2tWT
0O86ENr1XqEsMRgvLes5n6FdFeOgCgYIKoZIzj0DAQehRANCAARQEldtPVorpEmi
UdVxt8m/0+FCY1M1OzjNWDGPkwyZ8ZjGD0O8jpKs26RAKYZuJWpdV4guIKhpgBNw
CSZUy1HR
-----END PRIVATE KEY-----
APP_STORE_CONNECT_TEAM_ID = MZ64UQ254W
BUNDLE_ID = com.mebelplace.my
```

## ⚙️ Code Signing (подпись кода)

### Настройки в Codemagic:
1. **Code signing** → **iOS code signing**
2. **Выберите "Automatic code signing"**
3. **НЕ загружайте** .p12 файлы вручную
4. **Codemagic автоматически создаст** сертификаты и профили

## 🎯 Пошаговая инструкция:

### Шаг 1: Environment Variables
1. В Codemagic перейдите в **"Environment variables"**
2. Нажмите **"Add variable"**
3. Добавьте каждую переменную из списка выше

### Шаг 2: Code Signing
1. Перейдите в **"Code signing"**
2. Выберите **"iOS code signing"**
3. Выберите **"Automatic code signing"**
4. Codemagic автоматически создаст все необходимые сертификаты

### Шаг 3: Запуск сборки
1. Перейдите в **"Workflows"**
2. Нажмите **"Start new build"**
3. Выберите ветку **"app-store-preparation"**
4. Нажмите **"Start build"**

## ✅ Результат:
- Codemagic автоматически создаст Distribution Certificate
- Codemagic автоматически создаст App Store Provisioning Profile
- Приложение будет собрано и загружено в TestFlight
- Вы получите .ipa файл для скачивания

## 🚀 Готово к запуску!
Все настройки подготовлены. Просто скопируйте переменные в Codemagic и запустите сборку!

