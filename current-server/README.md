# MebelPlace Backend API

Backend API для платформы MebelPlace - объединение мастеров и клиентов.

## Технологии

- **Node.js** + **Express** - веб-сервер
- **PostgreSQL** - база данных
- **Socket.IO** - real-time коммуникация
- **JWT** - аутентификация
- **Mobizon.kz** - SMS уведомления
- **Multer** - загрузка файлов
- **FFmpeg** - обработка видео

## Установка

1. Установите зависимости:
```bash
npm install
```

2. Создайте файл `.env` на основе `env.example`:
```bash
cp env.example .env
```

3. Настройте переменные окружения в `.env`:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=mebelplace
DB_PASSWORD=mebelplace123
DB_NAME=mebelplace

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# SMS (Mobizon.kz)
SMS_API_KEY=kza709b533060de72b09110d34ca60bee25bad4fd53e2bb6181fe47cb8a7cad16cb0b1

# Server
PORT=3001
CLIENT_URL=http://localhost:5173
```

4. Запустите PostgreSQL и создайте базу данных:
```sql
CREATE DATABASE mebelplace;
CREATE USER mebelplace WITH PASSWORD 'mebelplace123';
GRANT ALL PRIVILEGES ON DATABASE mebelplace TO mebelplace;
```

5. Запустите сервер:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `POST /api/auth/refresh` - Обновление токена
- `POST /api/auth/logout` - Выход
- `POST /api/auth/verify-email` - Подтверждение email
- `POST /api/auth/forgot-password` - Восстановление пароля
- `POST /api/auth/reset-password` - Сброс пароля

### Видео
- `POST /api/videos/upload` - Загрузка видео
- `GET /api/videos/feed` - Лента видео
- `GET /api/videos/:id` - Получить видео
- `POST /api/videos/:id/like` - Лайк/анлайк
- `POST /api/videos/:id/comment` - Комментарий
- `GET /api/videos/:id/comments` - Комментарии видео
- `POST /api/videos/:id/view` - Просмотр видео

### Уведомления
- `GET /api/notifications` - Уведомления пользователя
- `GET /api/notifications/unread-count` - Количество непрочитанных
- `PUT /api/notifications/:id/read` - Отметить как прочитанное
- `PUT /api/notifications/read-all` - Отметить все как прочитанные
- `DELETE /api/notifications/:id` - Удалить уведомление
- `POST /api/notifications/test-sms` - Тестовая SMS (админ)
- `GET /api/notifications/sms-balance` - Баланс SMS (админ)

## WebSocket События

### Видео
- `join_video` - Присоединиться к видео
- `leave_video` - Покинуть видео
- `video_like` - Лайк видео
- `video_comment` - Комментарий к видео
- `video_view` - Просмотр видео
- `video_share` - Поделиться видео
- `video_uploaded` - Видео загружено

### Уведомления
- `video_like_updated` - Лайк обновлен
- `new_comment` - Новый комментарий
- `video_view_updated` - Просмотры обновлены
- `video_shared` - Видео поделено
- `new_video` - Новое видео

## SMS Уведомления

Интегрированы с [Mobizon.kz](https://mobizon.kz) для отправки SMS:

- Коды подтверждения
- Уведомления о новых откликах
- Уведомления о новых сообщениях
- Уведомления о принятии откликов
- Уведомления о новых подписчиках
- Системные уведомления

## Структура проекта

```
server/
├── config/           # Конфигурация БД и Socket.IO
├── middleware/       # Middleware (auth, upload)
├── routes/          # API роуты
├── services/        # Бизнес-логика
├── socket/          # WebSocket обработчики
├── uploads/         # Загруженные файлы
└── index.js         # Главный файл
```

## База данных

### Основные таблицы:
- `users` - Пользователи
- `videos` - Видео
- `video_likes` - Лайки видео
- `video_comments` - Комментарии
- `orders` - Заявки
- `order_responses` - Отклики на заявки
- `chats` - Чаты
- `messages` - Сообщения
- `subscriptions` - Подписки
- `notifications` - Уведомления
- `refresh_tokens` - Refresh токены

## Деплой

1. Установите PM2:
```bash
npm install -g pm2
```

2. Запустите с PM2:
```bash
pm2 start index.js --name mebelplace-api
pm2 save
pm2 startup
```

3. Настройте Nginx как reverse proxy для порта 3001

## Мониторинг

- Логи: `pm2 logs mebelplace-api`
- Статус: `pm2 status`
- Перезапуск: `pm2 restart mebelplace-api`

## Тестирование

### API Testing
```bash
# Использование bash скрипта для тестирования API
cd server/scripts
chmod +x test-api.sh
JWT_TOKEN=your_jwt_token ./test-api.sh

# Ручное тестирование API
curl https://mebelplace.com.kz/api/health
curl -X POST https://mebelplace.com.kz/api/chat/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"participants":["user_id"],"type":"private","name":"Test Chat"}'
```

### WebSocket Testing
```bash
# Использование Node.js скрипта для тестирования WebSocket
cd server/scripts
JWT_TOKEN=your_jwt_token node test-websocket.js

# Установка зависимостей для WebSocket тестирования
npm install socket.io-client
```

### Использование Makefile
```bash
# Установка зависимостей
make install

# Запуск в development режиме
make dev

# Запуск в production режиме
make start

# Тестирование API
JWT_TOKEN=your_token make test-api

# Тестирование WebSocket
JWT_TOKEN=your_token make test-websocket

# Просмотр логов
make logs

# Проверка здоровья
make health
```