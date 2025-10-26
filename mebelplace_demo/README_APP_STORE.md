# MebelPlace - App Store Preparation

Эта ветка содержит конфигурацию для публикации MebelPlace в App Store.

## 🚀 Быстрый старт

### 1. Сборка приложения
```bash
# Linux/macOS
./scripts/build-app-store.sh

# Windows
scripts\build-app-store.bat
```

### 2. Архивирование в Xcode
1. Откройте `ios/Runner.xcworkspace` в Xcode
2. Выберите "Any iOS Device" как цель
3. Product → Archive
4. Distribute App → App Store Connect

## 📋 Конфигурация

### Bundle ID
- **Текущий**: `$(PRODUCT_BUNDLE_IDENTIFIER)`
- **Нужно установить**: `com.yourcompany.mebelplace`

### Версия
- **Version**: 1.0.0
- **Build**: 1

### Разрешения
- ✅ Camera (запись видео)
- ✅ Photo Library (выбор медиа)
- ✅ Microphone (запись аудио)
- ✅ Push Notifications (уведомления)

## 📱 Требования App Store

### Скриншоты
- iPhone: 6.7", 6.5", 5.5"
- iPad: 12.9", 11"

### Метаданные
- Название: MebelPlace
- Категория: Business/Productivity
- Ключевые слова: мебель,мастер,дизайн,видео,заказы

## 🔧 Настройка

1. **Apple Developer Account** ($99/год)
2. **Bundle ID** в Apple Developer
3. **App Store Connect** приложение
4. **Подпись** в Xcode

## 📖 Документация

- [APP_STORE_CONFIG.md](APP_STORE_CONFIG.md) - Полная конфигурация
- [Apple Developer Guidelines](https://developer.apple.com/app-store/review/guidelines/)

## ⚠️ Важно

- Требуется Mac с Xcode для финальной сборки
- Bundle ID должен быть уникальным
- Политика конфиденциальности обязательна
- Тестирование на реальных устройствах

## 🎯 Следующие шаги

1. Создать Bundle ID в Apple Developer
2. Настроить App Store Connect
3. Подготовить скриншоты
4. Собрать и загрузить архив
5. Отправить на модерацию

