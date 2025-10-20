# 🚀 Настройка MebelPlace Mobile App

## Предварительные требования

1. **Node.js** 18+ - [Скачать](https://nodejs.org/)
2. **Expo CLI** - `npm install -g @expo/cli`
3. **Expo Go** - приложение для тестирования на устройстве
4. **Android Studio** или **Xcode** (для эмуляторов)

## Установка

### 1. Клонирование и установка зависимостей
```bash
cd mobile
npm install
```

### 2. Настройка переменных окружения
Создайте файл `.env` в корне папки `mobile`:
```env
EXPO_PUBLIC_API_URL=https://mebelplace.com.kz/api/v1
EXPO_PUBLIC_SOCKET_URL=https://mebelplace.com.kz
EXPO_PUBLIC_PROJECT_ID=your-expo-project-id
```

### 3. Настройка Expo Project ID
В файле `app.json` замените `your-expo-project-id` на ваш реальный Project ID:
```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "your-actual-project-id"
      }
    }
  }
}
```

## Запуск

### Режим разработки
```bash
npm start
```

### На физическом устройстве
1. Установите **Expo Go** из App Store/Google Play
2. Запустите `npm start`
3. Отсканируйте QR-код в приложении Expo Go

### На эмуляторе
```bash
# Android
npm run android

# iOS (только на macOS)
npm run ios
```

### Веб-версия
```bash
npm run web
```

## Структура проекта

```
mobile/
├── src/
│   ├── components/          # UI компоненты
│   ├── contexts/           # React контексты
│   ├── navigation/         # Навигация
│   ├── screens/           # Экраны приложения
│   │   ├── auth/          # Вход/регистрация
│   │   ├── main/          # Основные экраны
│   │   ├── video/         # Видео функциональность
│   │   ├── orders/        # Заявки
│   │   └── messages/      # Чаты
│   ├── services/          # API и сервисы
│   ├── theme/             # Тема приложения
│   └── utils/             # Утилиты
├── App.tsx                # Главный компонент
├── app.json              # Конфигурация Expo
└── package.json          # Зависимости
```

## Основные функции

### 🎥 Видео
- Просмотр видео с жестами
- Свайпы для навигации
- Лайки и комментарии
- Загрузка видео через камеру

### 📝 Заявки
- Создание заявок
- Просмотр и управление
- Отклики поставщиков
- Статусы заявок

### 💬 Сообщения
- Real-time чат
- Голосовые сообщения
- Push уведомления
- Статус онлайн

### 📱 Нативные функции
- Камера для фото/видео
- Haptic feedback
- Push уведомления
- Геолокация (опционально)

## API Интеграция

Приложение интегрировано с backend API:
- **Base URL**: `https://mebelplace.com.kz/api/v1`
- **WebSocket**: `https://mebelplace.com.kz`
- **Аутентификация**: JWT токены
- **Файлы**: Загрузка через multipart/form-data

## Сборка для продакшена

### EAS Build
```bash
# Установка EAS CLI
npm install -g @expo/eas-cli

# Логин в Expo
eas login

# Настройка проекта
eas build:configure

# Сборка для Android
eas build --platform android

# Сборка для iOS
eas build --platform ios
```

### Локальная сборка
```bash
# Android APK
expo build:android

# iOS IPA
expo build:ios
```

## Отладка

### React Native Debugger
1. Установите [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
2. Запустите приложение в режиме разработки
3. Откройте React Native Debugger

### Flipper
1. Установите [Flipper](https://fbflipper.com/)
2. Подключите устройство или эмулятор
3. Откройте Flipper для отладки

### Логи
```bash
# Android
npx react-native log-android

# iOS
npx react-native log-ios
```

## Тестирование

### Unit тесты
```bash
npm test
```

### E2E тесты
```bash
# Detox (если настроен)
npm run e2e:android
npm run e2e:ios
```

## Публикация

### Google Play Store
1. Соберите APK/AAB через EAS Build
2. Загрузите в Google Play Console
3. Заполните метаданные
4. Опубликуйте

### Apple App Store
1. Соберите IPA через EAS Build
2. Загрузите в App Store Connect
3. Заполните метаданные
4. Отправьте на модерацию

## Поддержка

При возникновении проблем:
1. Проверьте логи в консоли
2. Убедитесь, что backend API доступен
3. Проверьте настройки Expo
4. Очистите кэш: `expo start -c`

## Лицензия

MIT License
