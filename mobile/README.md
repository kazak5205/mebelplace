# MebelPlace Mobile App

Мобильное приложение для платформы MebelPlace - поиск и продажа мебели с видео-контентом.

## 🚀 Технологии

- **React Native** - кроссплатформенная разработка
- **Expo** - быстрая разработка и деплой
- **TypeScript** - типизация
- **React Navigation** - навигация
- **Socket.IO Client** - real-time обновления
- **React Native Camera** - камера для фото/видео
- **Expo Notifications** - push уведомления
- **React Native Paper** - UI компоненты

## 📱 Функциональность

### Основные экраны
- **Главная** - дашборд с статистикой и быстрыми действиями
- **Видео** - просмотр видео с жестами и свайпами
- **Заявки** - создание и управление заявками
- **Сообщения** - чат с другими пользователями
- **Профиль** - настройки и информация о пользователе

### Нативные функции
- **Жесты для видео:**
  - Свайп вверх → следующее видео
  - Свайп вниз → предыдущее видео
  - Свайп влево → пропустить
  - Свайп вправо → лайк
  - Двойное нажатие → лайк с анимацией

- **Камера:**
  - Фото и видео
  - Переключение камеры (передняя/задняя)
  - Вспышка
  - Загрузка на сервер

- **Real-time функции:**
  - WebSocket подключение
  - Push уведомления
  - Haptic feedback
  - Голосовые сообщения

## 🛠 Установка и запуск

### Требования
- Node.js 18+
- Expo CLI
- Android Studio / Xcode (для эмуляторов)

### Установка
```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm start

# Запуск на Android
npm run android

# Запуск на iOS
npm run ios

# Запуск в веб-браузере
npm run web
```

## 📁 Структура проекта

```
mobile/
├── src/
│   ├── components/          # Переиспользуемые компоненты
│   │   └── LoadingScreen.tsx
│   ├── contexts/           # React контексты
│   │   ├── AuthContext.tsx
│   │   └── SocketContext.tsx
│   ├── navigation/         # Навигация
│   │   └── AppNavigator.tsx
│   ├── screens/           # Экраны приложения
│   │   ├── auth/          # Аутентификация
│   │   ├── main/          # Основные экраны
│   │   ├── video/         # Видео экраны
│   │   ├── orders/        # Заявки
│   │   └── messages/      # Сообщения
│   ├── services/          # API сервисы
│   │   ├── apiService.ts
│   │   └── notificationService.ts
│   └── theme/             # Тема приложения
│       └── theme.ts
├── App.tsx                # Главный компонент
├── app.json              # Конфигурация Expo
└── package.json          # Зависимости
```

## 🔧 Конфигурация

### API Endpoints
Все API запросы идут на `https://mebelplace.com.kz/api/v1/`

### WebSocket
Подключение к `https://mebelplace.com.kz` для real-time обновлений

### Push Notifications
Настроены для работы с Expo Push Notifications

## 📱 Экраны

### Аутентификация
- **LoginScreen** - вход в аккаунт
- **RegisterScreen** - регистрация нового пользователя

### Основные экраны
- **HomeScreen** - главная страница с дашбордом
- **VideosScreen** - список видео с поиском и фильтрами
- **VideoPlayerScreen** - просмотр видео с жестами
- **CameraScreen** - камера для съемки фото/видео
- **OrdersScreen** - список заявок
- **OrderDetailsScreen** - детали заявки
- **CreateOrderScreen** - создание новой заявки
- **MessagesScreen** - список чатов
- **ChatScreen** - чат с пользователем
- **ProfileScreen** - профиль пользователя

## 🎨 UI/UX

### Дизайн
- Material Design 3
- Адаптивный дизайн
- Темная/светлая тема
- Haptic feedback

### Навигация
- Bottom Tab Navigation для основных экранов
- Stack Navigation для детальных экранов
- Модальные окна для камеры и загрузки

## 🔐 Безопасность

- JWT токены для аутентификации
- Secure storage для токенов
- HTTPS для всех API запросов
- Валидация данных на клиенте

## 📊 Производительность

- Lazy loading для списков
- Оптимизация изображений
- Кэширование данных
- Минимальные re-renders

## 🚀 Деплой

### Expo Build
```bash
# Сборка для Android
expo build:android

# Сборка для iOS
expo build:ios
```

### App Store / Google Play
Приложение готово для публикации в магазинах приложений.

## 🤝 Интеграция

Приложение интегрировано с:
- Backend API (Node.js/Express)
- WebSocket сервер
- Push notification сервис
- Файловое хранилище

## 📝 Лицензия

MIT License
