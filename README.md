# 🏠 MebelPlace MVP

**Платформа для объединения мастеров и клиентов с видео-контентом, заявками, чатами и уведомлениями.**

## 🚀 **Быстрый старт**

### **1. Установка**
```bash
# Клонировать репозиторий
git clone https://github.com/mebelplace/mvp.git
cd mvp

# Установить все зависимости
npm run install-all

# Настроить переменные окружения
cp server/env.example server/.env
# Отредактировать server/.env
```

### **2. Запуск в разработке**
```bash
# Запустить все сервисы
npm run dev

# Или по отдельности:
npm run server    # Backend API (порт 3001)
npm run client    # Frontend (порт 5173)
npm run mobile    # Mobile app
```

### **3. Сборка для продакшена**
```bash
# Собрать всё
npm run build

# Собрать только APK
npm run build:apk

# Собрать Docker образ
npm run docker:build
```

### **4. Деплой на сервер**
```bash
# Автоматический деплой
npm run deploy

# Или вручную
docker build -t mebelplace-mvp .
docker run -p 3001:3001 -p 80:80 -p 443:443 mebelplace-mvp
```

## 📱 **Скачать APK**

**Android APK**: [mebelplace.com.kz/download/mebelplace.apk](https://mebelplace.com.kz/download/mebelplace.apk)

## 🌐 **Доступ к системе**

- **Веб-сайт**: [https://mebelplace.com.kz](https://mebelplace.com.kz)
- **API**: [https://mebelplace.com.kz/api](https://mebelplace.com.kz/api)
- **Health Check**: [https://mebelplace.com.kz/api/health](https://mebelplace.com.kz/api/health)

## 🏗️ **Архитектура**

```
MebelPlace MVP/
├── 📁 server/          # Node.js Backend API
├── 📁 client/          # React Frontend
├── 📁 mobile/          # React Native Mobile
├── 📁 shared/          # Общие типы и утилиты
├── 📁 docker/          # Docker конфигурации
├── 📁 scripts/         # Скрипты сборки и деплоя
└── 📄 Dockerfile       # Multi-stage Docker build
```

## 🔧 **Технологии**

### **Backend**
- **Node.js** + **Express** - веб-сервер
- **PostgreSQL** - база данных
- **Socket.IO** - real-time коммуникация
- **JWT** - аутентификация
- **Web Push** - push уведомления
- **Mobizon.kz** - SMS уведомления
- **FFmpeg** - обработка видео

### **Frontend**
- **React** + **Vite** - веб-приложение
- **TypeScript** - типизация
- **Tailwind CSS** - стили
- **Glass UI** - дизайн система

### **Mobile**
- **React Native** - мобильное приложение
- **Expo** - инструменты разработки
- **Push Notifications** - уведомления

## 📋 **API Endpoints**

### **Аутентификация**
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `POST /api/auth/refresh` - Обновление токена
- `POST /api/auth/logout` - Выход

### **Видео**
- `POST /api/videos/upload` - Загрузка видео
- `GET /api/videos/feed` - Лента видео
- `POST /api/videos/:id/like` - Лайк видео
- `POST /api/videos/:id/comment` - Комментарий

### **Заявки**
- `POST /api/orders/create` - Создание заявки
- `GET /api/orders/feed` - Лента заявок
- `POST /api/orders/:id/response` - Отклик на заявку
- `POST /api/orders/:id/accept` - Принять отклик

### **Чаты**
- `POST /api/chat/create` - Создание чата
- `GET /api/chat/list` - Список чатов
- `POST /api/chat/:id/message` - Отправить сообщение

### **Уведомления**
- `GET /api/notifications` - Уведомления пользователя
- `POST /api/push/subscribe` - Подписка на push
- `GET /api/push/vapid-key` - VAPID ключ

## 🔌 **WebSocket События**

### **Видео**
- `video_like` - Лайк видео
- `video_comment` - Комментарий к видео
- `video_view` - Просмотр видео
- `video_share` - Поделиться видео

### **Чаты**
- `join_chat` - Присоединиться к чату
- `send_message` - Отправить сообщение
- `typing_start` - Начало печати
- `typing_stop` - Конец печати

### **Заявки**
- `new_order` - Новая заявка
- `order_response` - Отклик на заявку
- `order_accepted` - Заявка принята

## 📊 **База данных**

### **Основные таблицы**
- `users` - Пользователи
- `videos` - Видео
- `video_likes` - Лайки видео
- `video_comments` - Комментарии
- `orders` - Заявки
- `order_responses` - Отклики на заявки
- `chats` - Чаты
- `messages` - Сообщения
- `notifications` - Уведомления
- `push_subscriptions` - Push подписки

## 🔔 **Уведомления**

### **SMS (Mobizon.kz)**
- Коды подтверждения
- Уведомления о новых откликах
- Уведомления о сообщениях
- Уведомления о принятии заявок

### **Push (Web Push API)**
- Новые сообщения в чате
- Новые отклики на заявки
- Новые видео от подписок
- Новые комментарии

## 🎯 **Ключевые функции**

### **Для клиентов**
- ✅ Просмотр видео мастеров
- ✅ Создание заявок на мебель
- ✅ Общение с мастерами в чате
- ✅ Получение уведомлений
- ✅ Подписка на мастеров

### **Для мастеров**
- ✅ Загрузка видео работ
- ✅ Просмотр заявок клиентов
- ✅ Отклики на заявки
- ✅ Общение с клиентами
- ✅ Управление каналом

### **Системные**
- ✅ Real-time чаты
- ✅ Push + SMS уведомления
- ✅ Видео с лайками и комментариями
- ✅ Система заявок и откликов
- ✅ Web + Mobile синхронизация

## 🚀 **Деплой**

### **Автоматический деплой через GitHub Actions**

После настройки, каждый push в ветку `main` автоматически деплоится на VPS:

```bash
# Делаем изменения
git add .
git commit -m "Update feature"
git push origin main
# ✅ Автоматический деплой начнется!
```

**Полная инструкция**: См. [DEPLOYMENT.md](DEPLOYMENT.md)

### **Быстрый старт деплоя**

1. **Настройте VPS**
```bash
# На VPS сервере
curl -o setup-vps.sh https://raw.githubusercontent.com/YOUR_USERNAME/mebelplace/main/scripts/setup-vps.sh
chmod +x setup-vps.sh
sudo ./setup-vps.sh
```

2. **Настройте GitHub Secrets**
   - `VPS_HOST` - IP вашего VPS
   - `VPS_USERNAME` - SSH пользователь
   - `VPS_SSH_KEY` - Приватный SSH ключ
   - `VPS_PORT` - SSH порт (обычно 22)

3. **Push в main**
```bash
git push origin main
```

### **Ручной деплой на VPS**
```bash
# На VPS сервере
cd /var/www/mebelplace
./scripts/deploy.sh
```

### **Требования к серверу**
- **OS**: Ubuntu 20.04+
- **RAM**: 2GB+ (рекомендуется 4GB+)
- **CPU**: 2 cores+
- **Storage**: 20GB+ SSD
- **Node.js**: 18.x
- **MySQL/PostgreSQL**: 13+
- **PM2**: Latest
- **Nginx**: Latest

## 🧪 **Тестирование**

```bash
# Все тесты
npm test

# Тесты сервера
npm run test:server

# Тесты клиента
npm run test:client

# Проверка здоровья API
npm run health
```

## 📝 **Логи**

```bash
# Логи сервера
docker logs mebelplace-mvp

# Логи nginx
docker exec mebelplace-mvp tail -f /var/log/nginx/access.log

# Логи приложения
docker exec mebelplace-mvp tail -f /var/log/supervisor/backend.out.log
```

## 🔧 **Мониторинг**

- **Health Check**: `https://mebelplace.com.kz/api/health`
- **API Status**: `https://mebelplace.com.kz/api/status`
- **SMS Balance**: `https://mebelplace.com.kz/api/notifications/sms-balance`

## 📞 **Поддержка**

- **Email**: support@mebelplace.com.kz
- **Telegram**: @mebelplace_support
- **GitHub Issues**: [github.com/mebelplace/mvp/issues](https://github.com/mebelplace/mvp/issues)

## 📄 **Лицензия**

MIT License - см. [LICENSE](LICENSE) файл.

---

**MebelPlace MVP v1.0.0** - Готов к продакшену! 🚀
