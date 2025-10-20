# MebelPlace Client

Современный React frontend для платформы MebelPlace с Glass UI эффектами и real-time функциональностью.

## 🚀 Технологии

- **React 18** + **TypeScript** - основной фреймворк
- **Vite** - быстрая сборка и разработка
- **Tailwind CSS** - стилизация с Glass UI эффектами
- **Framer Motion** - плавные анимации
- **React Router** - навигация
- **Socket.IO Client** - real-time коммуникация
- **Axios** - HTTP клиент

## 📁 Структура проекта

```
client/
├── src/
│   ├── components/          # UI компоненты
│   │   ├── Layout.tsx      # Основной layout
│   │   ├── Header.tsx      # Шапка приложения
│   │   ├── Sidebar.tsx     # Боковая панель
│   │   └── GlassCard.tsx   # Glass UI карточка
│   ├── pages/              # Страницы приложения
│   │   ├── HomePage.tsx    # Главная с видео лентой
│   │   ├── ChatListPage.tsx # Список чатов
│   │   ├── ChatPage.tsx    # Конкретный чат
│   │   ├── OrdersPage.tsx  # Заявки
│   │   ├── CreateOrderPage.tsx # Создание заявки
│   │   ├── ProfilePage.tsx # Профиль пользователя
│   │   └── MasterChannelPage.tsx # Канал мастера
│   ├── contexts/           # React контексты
│   │   ├── AuthContext.tsx # Аутентификация
│   │   └── SocketContext.tsx # WebSocket соединение
│   ├── services/           # API сервисы
│   │   ├── api.ts         # Базовый API клиент
│   │   ├── authService.ts # Аутентификация
│   │   ├── videoService.ts # Видео сервис
│   │   ├── chatService.ts # Чат сервис
│   │   └── orderService.ts # Заявки сервис
│   ├── hooks/             # Кастомные хуки
│   │   ├── useDebounce.ts # Дебаунс хук
│   │   ├── useLocalStorage.ts # LocalStorage хук
│   │   └── useApi.ts      # API хук
│   ├── utils/             # Утилиты
│   │   └── index.ts       # Общие утилиты
│   ├── types/             # TypeScript типы
│   │   └── index.ts       # Все типы приложения
│   ├── App.tsx            # Главный компонент
│   ├── main.tsx           # Точка входа
│   └── index.css          # Глобальные стили
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 🎨 Glass UI Эффекты

Приложение использует современные Glass UI эффекты:

- **Полупрозрачные карточки** с размытием фона
- **Плавные анимации** при наведении и клике
- **Градиентные тексты** и границы
- **Адаптивный дизайн** для всех устройств

## 🔌 API Интеграция

Все API запросы используют стандартный формат ответов:

```typescript
{
  "success": true,
  "data": {...},
  "message": "Success",
  "timestamp": "2025-10-20T11:00:00Z"
}
```

## 🌐 WebSocket События

Поддерживаемые real-time события:

- `video_liked` - лайк видео
- `new_comment` - новый комментарий
- `new_message` - новое сообщение
- `new_order_response` - новый отклик на заявку
- `order_accepted` - заявка принята
- `user_online` - пользователь онлайн

## 🚀 Запуск проекта

### Установка зависимостей

```bash
npm install
```

### Разработка

```bash
npm run dev
```

Приложение будет доступно по адресу: `http://localhost:3000`

### Сборка

```bash
npm run build
```

### Предварительный просмотр

```bash
npm run preview
```

## 🔧 Настройка

### Переменные окружения

Создайте файл `.env.local`:

```env
VITE_API_URL=https://mebelplace.com.kz/api
VITE_SOCKET_URL=https://mebelplace.com.kz
```

### API Endpoints

Все API запросы идут на `https://mebelplace.com.kz/api` согласно правилам проекта.

## 📱 Страницы

- **/** - Главная с видео лентой
- **/chat** - Список чатов
- **/chat/:id** - Конкретный чат
- **/orders** - Заявки
- **/orders/create** - Создание заявки
- **/profile** - Профиль пользователя
- **/master/:id** - Канал мастера

## 🎯 Особенности

- **Real-time обновления** через WebSocket
- **Адаптивный дизайн** для мобильных устройств
- **Темная тема** с Glass UI эффектами
- **Плавные анимации** с Framer Motion
- **TypeScript** для типобезопасности
- **Модульная архитектура** для легкого расширения

## 🔒 Безопасность

- JWT токены для аутентификации
- Автоматическое обновление токенов
- Защищенные маршруты
- Валидация данных на клиенте

## 📦 Сборка для продакшена

```bash
npm run build
```

Собранные файлы будут в папке `dist/` и готовы для деплоя на любой статический хостинг.
