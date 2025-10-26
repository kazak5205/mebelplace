# MebelPlace App Store Configuration

## App Information
- **App Name**: MebelPlace
- **Bundle ID**: com.yourcompany.mebelplace (замените на ваш)
- **Version**: 1.0.0
- **Build Number**: 1
- **Category**: Business / Productivity
- **Primary Language**: Russian / English

## App Store Connect Settings

### Basic Information
```
App Name: MebelPlace
Subtitle: TikTok-style platform for furniture masters
Description: 
MebelPlace - это TikTok-стиль платформа для мастеров мебели, где они могут:
• Создавать и публиковать видео о своей работе
• Получать заказы от клиентов
• Общаться с подписчиками
• Показывать процесс создания мебели
• Строить свой бренд в сфере мебельного дизайна

Особенности:
🎥 Создание коротких видео о работе
📱 Простой и интуитивный интерфейс
💬 Встроенная система сообщений
📋 Управление заказами
👥 Система подписок и лайков
```

### Keywords
```
мебель,мастер,дизайн,видео,заказы,мебельный,творчество,DIY,интерьер,furniture,master,design,video,orders,custom,interior
```

### App Store Screenshots Required

#### iPhone Screenshots
- **6.7" Display (iPhone 14 Pro Max)**: 1290 x 2796 pixels
- **6.5" Display (iPhone 11 Pro Max)**: 1242 x 2688 pixels  
- **5.5" Display (iPhone 8 Plus)**: 1242 x 2208 pixels

#### iPad Screenshots
- **12.9" Display (iPad Pro)**: 2048 x 2732 pixels
- **11" Display (iPad Pro)**: 1668 x 2388 pixels

### App Icon
- **1024 x 1024 pixels** (уже готов в проекте)

### Privacy Policy
Обязательно добавьте ссылку на политику конфиденциальности:
- URL: https://yourwebsite.com/privacy-policy

### App Store Review Information

#### Contact Information
- **First Name**: [Ваше имя]
- **Last Name**: [Ваша фамилия]
- **Phone Number**: [Ваш телефон]
- **Email**: [Ваш email]

#### Demo Account (если требуется)
- **Username**: demo@mebelplace.com
- **Password**: demo123

#### Notes for Review
```
Это приложение для мастеров мебели, которые могут:
1. Создавать короткие видео о своей работе
2. Получать заказы от клиентов
3. Общаться через встроенный чат
4. Управлять своими заказами

Приложение не обрабатывает платежи через Apple - все транзакции происходят между пользователями напрямую.
```

## Technical Requirements

### iOS Deployment Target
- **Minimum iOS Version**: 12.0
- **Target iOS Version**: 16.0+

### Required Permissions
- Camera (для записи видео)
- Photo Library (для выбора медиа)
- Microphone (для записи аудио)
- Push Notifications (для уведомлений)

### App Store Connect Capabilities
- Push Notifications ✅
- App Groups ✅ (опционально)
- Associated Domains ✅ (опционально)

## Build Configuration

### Release Build Settings
```bash
# Сборка для App Store
flutter build ios --release --no-codesign

# Открыть в Xcode для архивирования
open ios/Runner.xcworkspace
```

### Xcode Archive Settings
1. Select "Any iOS Device" as target
2. Product → Archive
3. Distribute App → App Store Connect
4. Upload

## Pre-Launch Checklist

- [ ] Bundle ID создан в Apple Developer Account
- [ ] App Store Connect приложение создано
- [ ] Все скриншоты подготовлены
- [ ] Политика конфиденциальности готова
- [ ] Тестовые аккаунты созданы
- [ ] Приложение протестировано на реальных устройствах
- [ ] Архив создан и загружен в App Store Connect
- [ ] Метаданные заполнены в App Store Connect
- [ ] Приложение отправлено на модерацию

## Post-Launch

После одобрения Apple:
- [ ] Приложение опубликовано в App Store
- [ ] Мониторинг отзывов и рейтингов
- [ ] Обновления приложения по мере необходимости

