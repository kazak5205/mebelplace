# 🚀 ПОШАГОВАЯ ИНСТРУКЦИЯ ДЛЯ CODEMAGIC

## 📋 Шаг 1: Добавить Environment Variables в Codemagic UI

### Перейдите в Codemagic:
1. Откройте ваш проект **mebelplace** в Codemagic
2. Перейдите на вкладку **"Environment variables"**
3. Нажмите **"Add variable"**

### Добавьте эти переменные по одной:

#### 1. APP_STORE_CONNECT_ISSUER_ID
- **Name**: `APP_STORE_CONNECT_ISSUER_ID`
- **Value**: `94ce68e4-bd5a-4bf4-b266-46f0b9bd0596`
- **Secure**: ✅ (отметьте галочку)

#### 2. APP_STORE_CONNECT_API_KEY_ID
- **Name**: `APP_STORE_CONNECT_API_KEY_ID`
- **Value**: `7R2G5C786A`
- **Secure**: ✅ (отметьте галочку)

#### 3. APP_STORE_CONNECT_API_KEY_CONTENT
- **Name**: `APP_STORE_CONNECT_API_KEY_CONTENT`
- **Value**: 
```
-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgXgSbslYnlaFQ2tWT
0O86ENr1XqEsMRgvLes5n6FdFeOgCgYIKoZIzj0DAQehRANCAARQEldtPVorpEmi
UdVxt8m/0+FCY1M1OzjNWDGPkwyZ8ZjGD0O8jpKs26RAKYZuJWpdV4guIKhpgBNw
CSZUy1HR
-----END PRIVATE KEY-----
```
- **Secure**: ✅ (отметьте галочку)

#### 4. APP_STORE_CONNECT_TEAM_ID
- **Name**: `APP_STORE_CONNECT_TEAM_ID`
- **Value**: `MZ64UQ254W`
- **Secure**: ✅ (отметьте галочку)

#### 5. BUNDLE_ID
- **Name**: `BUNDLE_ID`
- **Value**: `com.mebelplace.my`
- **Secure**: ❌ (НЕ отмечайте галочку)

## 📋 Шаг 2: Настроить Code Signing

1. Перейдите на вкладку **"Code signing"**
2. Выберите **"iOS code signing"**
3. Выберите **"Automatic code signing"**
4. **НЕ загружайте** никаких .p12 файлов

## 📋 Шаг 3: Запустить сборку

1. Перейдите на вкладку **"Workflows"**
2. Нажмите **"Start new build"**
3. Выберите ветку **"app-store-preparation"**
4. Нажмите **"Start build"**

## ✅ Результат:
- Codemagic автоматически создаст все сертификаты
- Приложение соберется для iOS
- Автоматически загрузится в TestFlight
- Вы получите .ipa файл

## 🎯 Важно:
- Все переменные должны быть **Secure** (кроме BUNDLE_ID)
- Не добавляйте переменные в сам файл codemagic.yaml
- Используйте только Codemagic UI для добавления переменных
