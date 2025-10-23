# MebelPlace Chat Integration Guide

## 🚀 Быстрый старт

### 1. Установка зависимостей
```bash
cd server
npm install
```

### 2. Настройка окружения
```bash
cp env.example .env
# Отредактируйте .env файл с вашими настройками
```

### 3. Запуск в development режиме
```bash
npm run dev
```

### 4. Запуск в production режиме
```bash
pm2 start ecosystem.config.js
```

## 📋 Созданные файлы

### API Routes
- `server/routes/chat.js` - REST API для чатов
- `server/services/chatService.js` - Бизнес-логика чатов
- `server/services/webrtcService.js` - WebRTC видеозвонки

### Socket.IO
- `server/socket/chatSocket.js` - Real-time события чатов
- `server/config/socket.js` - Обновленная конфигурация Socket.IO

### Database
- `server/models/Chat.js` - Модели базы данных для чатов
- `server/config/database.js` - Обновленная схема БД

### Middleware
- `server/middleware/fileUpload.js` - Загрузка файлов

### Configuration
- `server/ecosystem.config.js` - PM2 конфигурация
- `server/nginx.conf` - Nginx reverse proxy
- `server/deploy.sh` - Скрипт деплоя

### Documentation
- `server/CHAT_API.md` - API документация
- `server/README.md` - Полная документация
- `server/INTEGRATION_GUIDE.md` - Этот файл

### Testing
- `server/scripts/test-api.sh` - Bash скрипт для тестирования API через curl
- `server/scripts/test-websocket.js` - Node.js скрипт для тестирования WebSocket
- Unit тесты интегрированы в основную кодовую базу

## 🔧 Интеграция с существующим кодом

### 1. Обновление main server file
Файл `server/index.js` уже обновлен для поддержки чатов:
```javascript
const chatRoutes = require('./routes/chat');
app.use('/api/chat', chatRoutes);
```

### 2. Обновление Socket.IO
Файл `server/config/socket.js` интегрирован с новой системой чатов:
```javascript
const ChatSocket = require('../socket/chatSocket');
chatSocketHandler = new ChatSocket(io);
```

### 3. Обновление базы данных
Файл `server/config/database.js` содержит все необходимые таблицы для чатов.

## 📡 API Endpoints

### Создание чата
```bash
POST https://mebelplace.com.kz/api/chat/create
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "participants": ["user_id_1", "user_id_2"],
  "type": "private|group|channel",
  "name": "Chat Name"
}
```

### Получение списка чатов
```bash
GET https://mebelplace.com.kz/api/chat/list
Authorization: Bearer <jwt_token>
```

### Отправка сообщения
```bash
POST https://mebelplace.com.kz/api/chat/:id/message
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "content": "Hello world!",
  "type": "text|image|video|audio|file|sticker|voice",
  "replyTo": "message_id"
}
```

### Загрузка файла
```bash
POST https://mebelplace.com.kz/api/chat/:id/upload
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

file: <file>
type: image|video|audio|file
```

## 🔌 WebSocket Events

### Подключение
```javascript
const socket = io('https://mebelplace.com.kz', {
  auth: { token: 'your_jwt_token' }
});
```

### Основные события
```javascript
// Присоединение к чату
socket.emit('join_chat', { chatId: 'chat_id' });

// Отправка сообщения
socket.emit('send_message', {
  chatId: 'chat_id',
  content: 'Hello!',
  type: 'text'
});

// Индикатор печати
socket.emit('typing_start', { chatId: 'chat_id' });
socket.emit('typing_stop', { chatId: 'chat_id' });

// Видеозвонок
socket.emit('video_call_request', {
  chatId: 'chat_id',
  targetUserId: 'user_id'
});
```

### Обработка событий
```javascript
// Новое сообщение
socket.on('new_message', (message) => {
  console.log('New message:', message);
});

// Пользователь печатает
socket.on('typing_start', (data) => {
  console.log('User typing:', data.userName);
});

// Запрос видеозвонка
socket.on('video_call_request', (data) => {
  console.log('Video call request from:', data.fromUserName);
});
```

## 🗄️ Database Schema

### Таблица `chats`
```sql
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('private', 'group', 'channel')),
  name VARCHAR(255),
  description TEXT,
  creator_id UUID NOT NULL REFERENCES users(id),
  avatar VARCHAR(500),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Таблица `chat_participants`
```sql
CREATE TABLE chat_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES chats(id),
  user_id UUID NOT NULL REFERENCES users(id),
  role VARCHAR(20) DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(chat_id, user_id)
);
```

### Таблица `messages`
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES chats(id),
  sender_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'text',
  reply_to UUID REFERENCES messages(id),
  file_path VARCHAR(500),
  file_name VARCHAR(255),
  file_size BIGINT,
  metadata JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'sent',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🚀 Production Deployment

### 1. Подготовка сервера
```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка необходимых пакетов
sudo apt install -y nginx postgresql postgresql-contrib nodejs npm pm2 certbot python3-certbot-nginx
```

### 2. Настройка базы данных
```bash
# Создание базы данных
sudo -u postgres createdb mebelplace
sudo -u postgres createuser mebelplace
sudo -u postgres psql -c "ALTER USER mebelplace PASSWORD 'mebelplace123';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE mebelplace TO mebelplace;"
```

### 3. Деплой приложения
```bash
# Клонирование репозитория
git clone <repository-url> /var/www/mebelplace
cd /var/www/mebelplace/server

# Установка зависимостей
npm install

# Настройка окружения
cp env.example .env
# Отредактируйте .env файл

# Запуск приложения
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. Настройка Nginx
```bash
# Копирование конфигурации
sudo cp nginx.conf /etc/nginx/sites-available/mebelplace.com.kz
sudo ln -s /etc/nginx/sites-available/mebelplace.com.kz /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Настройка SSL
```bash
# Получение SSL сертификата
sudo certbot --nginx -d mebelplace.com.kz
```

## 🧪 Testing

### 1. Unit тесты
```bash
npm test
```

### 2. API тестирование
```bash
# Используйте Postman или curl
curl -X POST https://mebelplace.com.kz/api/chat/create \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{"participants":["user_id"],"type":"private","name":"Test Chat"}'
```

### 3. WebSocket тестирование
```bash
# Использование Node.js скрипта для тестирования WebSocket
cd server/scripts
JWT_TOKEN=your_jwt_token node test-websocket.js

# Установка зависимостей
npm install socket.io-client
```

## 📊 Monitoring

### 1. PM2 мониторинг
```bash
pm2 monit          # Мониторинг процессов
pm2 logs           # Просмотр логов
pm2 restart all    # Перезапуск всех процессов
```

### 2. Health check
```bash
curl https://mebelplace.com.kz/api/health
```

### 3. Логи
- Приложение: `./logs/`
- PM2: `pm2 logs`
- Nginx: `/var/log/nginx/`
- PostgreSQL: `/var/log/postgresql/`

## 🔒 Security

### 1. Аутентификация
- Все API endpoints требуют JWT токен
- WebSocket соединения аутентифицируются через JWT

### 2. Rate Limiting
- API запросы: 100 запросов за 15 минут
- Загрузка файлов: 10 загрузок за 15 минут

### 3. File Upload
- Максимальный размер файла: 50MB
- Разрешенные типы: изображения, видео, аудио, документы
- Валидация MIME типов

### 4. CORS
- Настроен для домена `https://mebelplace.com.kz`
- Поддержка WebSocket соединений

## 🐛 Troubleshooting

### Частые проблемы

1. **Ошибка подключения к базе данных**
   - Проверьте, что PostgreSQL запущен
   - Проверьте credentials в .env файле
   - Убедитесь, что база данных существует

2. **WebSocket не подключается**
   - Проверьте CORS настройки
   - Убедитесь, что JWT токен валиден
   - Проверьте настройки Nginx

3. **Файлы не загружаются**
   - Проверьте права доступа к папке uploads
   - Убедитесь, что размер файла не превышает лимит
   - Проверьте MIME тип файла

4. **PM2 процессы не запускаются**
   - Проверьте логи: `pm2 logs`
   - Перезапустите процессы: `pm2 restart all`
   - Проверьте использование памяти: `pm2 monit`

## 📞 Support

Для получения поддержки:
1. Проверьте логи приложения
2. Убедитесь, что все зависимости установлены
3. Проверьте конфигурацию окружения
4. Обратитесь к документации API

## 🎯 Next Steps

1. **Интеграция с frontend** - Подключение к React/Vue приложению
2. **Мобильное приложение** - Интеграция с React Native/Flutter
3. **Push уведомления** - Настройка уведомлений для мобильных устройств
4. **Аналитика** - Добавление метрик и аналитики чатов
5. **Модерация** - Система модерации сообщений
6. **Архивирование** - Автоматическое архивирование старых чатов
