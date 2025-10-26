# Codemagic Setup Guide для MebelPlace iOS

## 🚀 Настройка Codemagic для сборки iOS на Windows

### 1. Регистрация в Codemagic

1. Перейдите на [Codemagic](https://codemagic.io/getting-started/personal-account)
2. Войдите через GitHub/GitLab/Bitbucket
3. Подключите ваш репозиторий с проектом MebelPlace

### 2. Настройка Apple Developer Account

#### A. App Store Connect API Key
1. Войдите в [App Store Connect](https://appstoreconnect.apple.com)
2. **Users and Access** → **Keys** → **App Store Connect API**
3. Создайте новый ключ с правами:
   - ✅ **App Manager** (рекомендуется)
   - ✅ **Developer** (для TestFlight)
4. Скачайте `.p8` файл (сохраните!)
5. Запишите:
   - **Key ID** (10 символов)
   - **Issuer ID** (UUID)

#### B. Сертификаты и профили
1. В [Apple Developer Portal](https://developer.apple.com/account)
2. **Certificates, Identifiers & Profiles**
3. Создайте:
   - **iOS Distribution Certificate** (.p12)
   - **App Store Provisioning Profile** для `com.mebelplace.my`

### 3. Настройка Codemagic

#### A. Environment Variables
В Codemagic UI добавьте переменные:

```
APP_STORE_CONNECT_ISSUER_ID = ваш_issuer_id
APP_STORE_CONNECT_API_KEY_ID = ваш_key_id
APP_STORE_CONNECT_API_KEY_CONTENT = содержимое_файла.p8
APP_STORE_CONNECT_TEAM_ID = ваш_team_id
BUNDLE_ID = com.mebelplace.my
```

#### B. Code Signing
1. **Code signing** → **iOS code signing**
2. Загрузите:
   - **Distribution certificate** (.p12 файл)
   - **Provisioning profile** (.mobileprovision файл)
3. Установите пароль для сертификата

### 4. Настройка Workflow

#### A. Автоматический запуск
```yaml
triggering:
  events:
    - push
      branches:
        - app-store-preparation
```

#### B. Ручной запуск
- Перейдите в **Workflows**
- Нажмите **Start new build**
- Выберите ветку `app-store-preparation`

### 5. Мониторинг сборки

#### A. Логи сборки
- Отслеживайте прогресс в реальном времени
- Проверяйте ошибки в логах

#### B. Артефакты
После успешной сборки получите:
- `.ipa` файл приложения
- Логи сборки
- Отчеты о тестах

### 6. Загрузка в App Store

#### A. TestFlight (автоматически)
- Приложение автоматически загружается в TestFlight
- Доступно для бета-тестирования

#### B. App Store (вручную)
1. В App Store Connect перейдите в **My Apps**
2. Выберите **MebelPlace**
3. **TestFlight** → **iOS Builds**
4. Нажмите **Submit for Review**

## 🔧 Troubleshooting

### Частые ошибки:

#### 1. Code Signing Error
```
Error: No matching provisioning profile found
```
**Решение:** Проверьте Bundle ID в профиле и проекте

#### 2. API Key Error
```
Error: Invalid API key
```
**Решение:** Проверьте правильность Key ID и Issuer ID

#### 3. Flutter Version Error
```
Error: Flutter version not found
```
**Решение:** Обновите FLUTTER_VERSION в codemagic.yaml

## 📋 Checklist для запуска

- [ ] Codemagic аккаунт создан
- [ ] Репозиторий подключен
- [ ] App Store Connect API Key создан
- [ ] Сертификаты загружены в Codemagic
- [ ] Environment variables настроены
- [ ] codemagic.yaml добавлен в репозиторий
- [ ] Первая сборка запущена

## 🎯 Результат

После настройки вы сможете:
- ✅ Собирать iOS приложения на Windows
- ✅ Автоматически загружать в TestFlight
- ✅ Отправлять на модерацию в App Store
- ✅ Получать уведомления о статусе сборки

## 📞 Поддержка

- [Codemagic Documentation](https://docs.codemagic.io/)
- [Apple Developer Support](https://developer.apple.com/support/)
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)

