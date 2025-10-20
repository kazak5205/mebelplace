# MebelPlace - Мебельная платформа

> Инновационная платформа для поиска и заказа мебели, объединяющая клиентов с мастерами

## 🎯 Описание проекта

**MebelPlace** - это полнофункциональная платформа, состоящая из:
- 📱 **Мобильное приложение** (React Native)
- 🌐 **Веб-клиент** (React + Vite)  
- 🖥️ **Сервер** (Node.js + PostgreSQL)
- 📦 **Общие модули** (TypeScript)

### Ключевые функции
- 🎥 Видео-портфолио мастеров (TikTok-стиль)
- 🔍 Умный поиск по специализации и локации
- 💬 Real-time чат между клиентами и мастерами
- 📝 Система заказов с отслеживанием статусов
- ⭐ Рейтинги и отзывы
- 🔔 Push-уведомления
- 🌙 Темная/светлая тема

## 🚀 Быстрый старт

### Предварительные требования
- Node.js 18+
- Android Studio (для мобильного приложения)
- PostgreSQL 14+

### Установка и запуск

1. **Клонирование репозитория**
```bash
git clone <repository-url>
cd mvp
```

2. **Установка зависимостей**
```bash
# Корневые зависимости
npm install

# Мобильное приложение
cd mobile
npm install

# Веб-клиент
cd ../client
npm install

# Сервер
cd ../server
npm install
```

3. **Настройка базы данных**
```bash
# Создание базы данных PostgreSQL
createdb mebelplace

# Запуск миграций
cd server
npm run migrate
```

4. **Запуск сервера**
```bash
cd server
npm run dev
```

5. **Запуск веб-клиента**
```bash
cd client
npm run dev
```

6. **Запуск мобильного приложения**
```bash
cd mobile
# Для Android
npx expo run:android

# Для iOS
npx expo run:ios
```

## 📁 Структура проекта

```
mvp/
├── mobile/           # React Native приложение
├── client/           # React веб-клиент
├── server/           # Node.js сервер
├── shared/           # Общие модули (типы, API, контексты)
├── docs/             # Документация
└── scripts/          # Скрипты сборки и деплоя
```

## 🛠 Технологический стек

### Frontend
- **React Native** - мобильное приложение
- **React** - веб-клиент
- **TypeScript** - типизация
- **Vite** - сборка веб-клиента
- **Expo** - разработка мобильного приложения
- **React Navigation** - навигация
- **Framer Motion** - анимации
- **Tailwind CSS** - стилизация

### Backend
- **Node.js** - сервер
- **Express** - веб-фреймворк
- **PostgreSQL** - база данных
- **Socket.io** - WebSocket соединения
- **JWT** - аутентификация
- **Multer** - загрузка файлов

### Общие
- **TypeScript** - типизация
- **Zod** - валидация схем
- **Axios** - HTTP клиент

## 📱 Мобильное приложение

### Сборка APK/AAB
```bash
cd mobile

# Локальная сборка APK
.\scripts\build-apk.bat

# Локальная сборка AAB
.\scripts\build-aab.bat

# Облачная сборка через EAS
npx eas-cli build --platform android
```

### Установка на эмулятор
```bash
# Запуск эмулятора
$env:ANDROID_SDK_ROOT = "$env:LOCALAPPDATA\Android\Sdk"
& "$env:ANDROID_SDK_ROOT\emulator\emulator.exe" -avd "MebelPlace_Fast"

# Установка APK
& "$env:ANDROID_SDK_ROOT\platform-tools\adb.exe" install -r "android\app\build\outputs\apk\debug\app-debug.apk"

# Запуск приложения
& "$env:ANDROID_SDK_ROOT\platform-tools\adb.exe" shell am start -n com.mebelplace.mobile/.MainActivity
```

## 🌐 Веб-клиент

### Доступные страницы
- `/` - Главная страница
- `/login` - Вход
- `/register` - Регистрация
- `/admin` - Админ-панель
- `/profile` - Профиль пользователя
- `/chat` - Чаты
- `/orders` - Заказы

## 🗄 База данных

### Основные таблицы
- `users` - Пользователи (клиенты, мастера, админы)
- `videos` - Видео-портфолио мастеров
- `orders` - Заказы
- `chats` - Чаты
- `messages` - Сообщения
- `notifications` - Уведомления

### Миграции
```bash
cd server
npm run migrate        # Применить миграции
npm run migrate:undo   # Откатить последнюю миграцию
```

## 🔐 Аутентификация

### Роли пользователей
- `client` - Клиент (заказывает мебель)
- `master` - Мастер (выполняет заказы)
- `admin` - Администратор (управляет платформой)

### API Endpoints
- `POST /api/auth/login` - Вход
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/refresh` - Обновление токена
- `GET /api/auth/profile` - Профиль пользователя

## 📊 Мониторинг и логи

### Логирование
- Серверные логи в консоли
- Ошибки клиента в браузерной консоли
- Мобильные логи через React Native Debugger

### Метрики
- Количество пользователей
- Активные заказы
- Статистика видео
- Производительность API

## 🚀 Деплой

### Продакшн сборка
```bash
# Веб-клиент
cd client
npm run build

# Мобильное приложение
cd mobile
npx eas-cli build --platform android --profile production

# Сервер
cd server
npm run build
```

### Переменные окружения
Создайте файлы `.env` в каждой папке:
- `mobile/.env`
- `client/.env`
- `server/.env`

## 📝 Документация

- [Описание приложения](mobile/APP_DESCRIPTION.md)
- [Краткое описание](mobile/SHORT_DESCRIPTION.md)
- [Руководство по сборке](mobile/BUILD_GUIDE.md)
- [API документация](server/API.md)

## 🤝 Участие в разработке

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 📞 Поддержка

Если у вас есть вопросы или проблемы:
- Создайте Issue в GitHub
- Обратитесь к команде разработки
- Проверьте документацию

---

**MebelPlace** - революционизируем рынок мебели! 🛋️✨