# 🏠 MEBELPLACE - ПОЛНАЯ ДОКУМЕНТАЦИЯ ЭКОСИСТЕМЫ

## 📚 ГЛОССАРИЙ ДЛЯ НОВИЧКОВ

### 🔤 Основные термины
- **API (Application Programming Interface)** - интерфейс для взаимодействия между приложениями
- **Backend** - серверная часть приложения, которая обрабатывает данные
- **Frontend** - клиентская часть приложения, которую видит пользователь
- **Mobile App** - мобильное приложение для смартфонов
- **HLS (HTTP Live Streaming)** - технология потокового видео с адаптивным качеством
- **WebRTC** - технология для видеозвонков и аудио/видео связи в реальном времени
- **WebSocket** - протокол для двусторонней связи в реальном времени
- **JWT (JSON Web Token)** - безопасный способ передачи информации между сторонами
- **PWA (Progressive Web App)** - веб-приложение, работающее как нативное
- **Glass UI** - дизайн-система с эффектами стекла и прозрачности
- **Docker** - технология контейнеризации приложений
- **Redis** - база данных в памяти для быстрого доступа
- **PostgreSQL** - реляционная база данных
- **MinIO** - хранилище файлов, совместимое с Amazon S3
- **Nginx** - веб-сервер и обратный прокси
- **Sentry** - система мониторинга ошибок
- **Prometheus** - система мониторинга метрик
- **Rate Limiting** - ограничение количества запросов для защиты от перегрузки

### 🎨 Дизайн и UI
- **Material Design** - дизайн-система от Google
- **Glass Morphism** - эффект матового стекла в интерфейсе
- **Responsive Design** - адаптивный дизайн под разные экраны
- **Dark/Light Mode** - темная и светлая темы
- **Animation** - анимации и переходы
- **Component** - переиспользуемый элемент интерфейса

### 🔧 Технологии разработки
- **TypeScript** - типизированный JavaScript (выбран для безопасности типов и лучшей разработки)
- **React** - библиотека для создания пользовательских интерфейсов (самая популярная, большая экосистема)
- **Next.js** - фреймворк для React с серверным рендерингом (SEO, производительность, [документация](https://nextjs.org/docs))
- **Flutter** - фреймворк для создания мобильных приложений (кроссплатформенность, производительность, [документация](https://flutter.dev/docs))
- **Go** - язык программирования для backend (высокая производительность, простота, [документация](https://golang.org/doc/))
- **Dart** - язык программирования для Flutter (типизированный, быстрый, [документация](https://dart.dev/guides))
- **Tailwind CSS** - CSS фреймворк для быстрой стилизации (utility-first подход, [документация](https://tailwindcss.com/docs))

---

## 📋 ОГЛАВЛЕНИЕ

1. [🎯 ОБЗОР ЭКОСИСТЕМЫ](#обзор-экосистемы)
2. [🏗️ АРХИТЕКТУРА СИСТЕМЫ](#архитектура-системы)
3. [🔧 ТЕХНИЧЕСКИЙ СТЕК](#технический-стек)
4. [🌐 КОНФИГУРАЦИЯ И РАЗВЕРТЫВАНИЕ](#конфигурация-и-развертывание)
5. [📱 FRONTEND (Next.js)](#frontend-nextjs)
6. [📲 MOBILE (Flutter)](#mobile-flutter)
7. [⚙️ BACKEND (Go)](#backend-go)
8. [🗄️ БАЗА ДАННЫХ](#база-данных)
9. [🔄 API И ИНТЕГРАЦИИ](#api-и-интеграции)
10. [🎨 UI/UX ДИЗАЙН СИСТЕМА](#uiux-дизайн-система)
11. [🚀 ПОЛЬЗОВАТЕЛЬСКИЕ СЦЕНАРИИ (25 сценариев)](#пользовательские-сценарии)
12. [🔐 БЕЗОПАСНОСТЬ](#безопасность)
13. [📊 МОНИТОРИНГ И АНАЛИТИКА](#мониторинг-и-аналитика)
14. [🧪 ТЕСТИРОВАНИЕ](#тестирование)
15. [📈 ПРОИЗВОДИТЕЛЬНОСТЬ](#производительность)
16. [🛠️ РАЗРАБОТКА И ПОДДЕРЖКА](#разработка-и-поддержка)

---

## 🎯 ОБЗОР ЭКОСИСТЕМЫ

### Что такое MebelPlace?

**MebelPlace** - это комплексная экосистема для торговли мебелью, объединяющая:

> 📁 **Репозиторий**: [GitHub - MebelPlace](https://github.com/mebelplace/mebelplace)  
> 🌐 **Демо**: [https://mebelplace.com.kz](https://mebelplace.com.kz)  
> 📚 **API Docs**: [Swagger UI](https://api.mebelplace.com.kz/docs)  
> 📱 **App Store**: [iOS](https://apps.apple.com/app/mebelplace) | [Google Play](https://play.google.com/store/apps/details?id=com.mebelplace.app)
- 🎬 **Видео-платформу** с HLS стримингом
- 💬 **Мессенджер** с WebRTC звонками
- 🛒 **Маркетплейс** заявок и предложений
- 🎨 **AR/3D конфигуратор** мебели
- 📱 **Кроссплатформенные приложения** (Web + Mobile)
- 🤖 **AI помощника** для дизайна

### Основные пользователи:
- **👥 Покупатели** - ищут и заказывают мебель
- **🏪 Продавцы** - размещают товары и отвечают на заявки
- **🎨 Дизайнеры** - создают проекты и контент
- **👑 Администраторы** - управляют платформой

### Ключевые возможности:
- ✅ Регистрация через телефон/email с SMS верификацией
- ✅ Загрузка и просмотр видео с мебелью (HLS стриминг)
- ✅ Система заявок и предложений
- ✅ Чаты и групповые чаты с WebSocket
- ✅ WebRTC видеозвонки и голосовые комнаты
- ✅ AR/3D конфигуратор мебели
- ✅ Геймификация и достижения
- ✅ Push уведомления
- ✅ Offline режим (мобильное приложение)
- ✅ Glass UI дизайн система

---

## 🏗️ АРХИТЕКТУРА СИСТЕМЫ

### Общая схема архитектуры:

```
┌─────────────────────────────────────────────────────────────┐
│                    MEBELPLACE ECOSYSTEM                     │
├─────────────────────────────────────────────────────────────┤
│  🌐 FRONTEND (Next.js)     │  📱 MOBILE (Flutter)          │
│  - Glass UI Design System  │  - Cross-platform (iOS/Android)│
│  - PWA Support             │  - Offline Mode               │
│  - HLS Video Streaming     │  - Push Notifications         │
│  - WebRTC Calls            │  - AR/3D Models               │
└─────────────────┬───────────────────┬───────────────────────┘
                  │                   │
                  └─────────┬─────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Go)                             │
│  - REST API v2.4.0          │  - WebSocket Server          │
│  - JWT Authentication       │  - WebRTC Signaling          │
│  - File Upload/Processing   │  - Real-time Notifications   │
│  - HLS Video Processing     │  - Rate Limiting             │
└─────────────────┬───────────────────┬───────────────────────┘
                  │                   │
┌─────────────────┴───────────────────┴───────────────────────┐
│                    INFRASTRUCTURE                           │
│  🗄️ PostgreSQL    │  🔄 Redis Cache  │  📁 MinIO S3        │
│  - User Data     │  - Sessions      │  - Video Files       │
│  - Videos        │  - Rate Limits   │  - Images            │
│  - Messages      │  - Real-time     │  - Thumbnails        │
│  - Requests      │  - WebSocket     │  - HLS Segments      │
└─────────────────────────────────────────────────────────────┘
```

### Компоненты системы:

#### 1. **Frontend (Next.js 15)**
- **URL**: `https://mebelplace.com.kz`
- **Порт**: 3000 (dev), 80 (prod)
- **Технологии**: React, TypeScript, Tailwind CSS, Framer Motion
- **Особенности**: Glass Design System, PWA, HLS.js, WebRTC

#### 2. **Mobile (Flutter)**
- **Платформы**: iOS, Android
- **Версия**: 2.0.1+21
- **Технологии**: Dart, Riverpod, Material Design 3
- **Особенности**: Glass UI, Offline Mode, AR/3D, Push Notifications

#### 3. **Backend (Go)**
- **URL**: `https://mebelplace.com.kz/api/v2`
- **Порт**: 8080 (prod), 8081 (dev)
- **Технологии**: Go, Gin, PostgreSQL, Redis
- **Особенности**: JWT Auth, WebSocket, HLS Processing, WebRTC

#### 4. **База данных (PostgreSQL)**
- **Хост**: postgres (Docker)
- **Порт**: 5432
- **База**: mebelplace_prod
- **Пользователь**: mebelplace_user

#### 5. **Кэш (Redis)**
- **Хост**: redis (Docker)
- **Порт**: 6379
- **Использование**: Sessions, Rate Limiting, WebSocket

#### 6. **Файловое хранилище (MinIO)**
- **URL**: `http://minio:9000`
- **Бакет**: mebelplace
- **Использование**: Videos, Images, HLS Segments

---

## 🔧 ТЕХНИЧЕСКИЙ СТЕК

### 🎯 Обоснование выбора технологий

#### Frontend Stack:
```yaml
Framework: Next.js 15          # Выбран за SSR/SSG, SEO, производительность
Language: TypeScript 5.6       # Типизация для безопасности и лучшей разработки
Styling: Tailwind CSS 3.4      # Utility-first CSS для быстрой разработки
Design System: Glass Design System  # Уникальная дизайн-система для брендинга
Animations: Framer Motion 11.11 # Мощная библиотека анимаций
State Management: Redux Toolkit 2.9  # Предсказуемое управление состоянием
API Client: React Query 5.59   # Кэширование и синхронизация данных
WebSocket: Socket.io-client     # Real-time коммуникация
Video: HLS.js                   # Адаптивное видео стриминг
WebRTC: Simple-peer            # P2P видеозвонки
Monitoring: Sentry             # Мониторинг ошибок и производительности
Testing: Jest + Playwright     # Unit и E2E тестирование
```

**Почему Next.js?** - SSR для SEO, встроенная оптимизация, большая экосистема  
**Почему TypeScript?** - Безопасность типов, лучший DX, меньше багов  
**Почему Redux Toolkit?** - Предсказуемое состояние, DevTools, middleware

#### Mobile Stack:
```yaml
Framework: Flutter 3.24+        # Кроссплатформенность, производительность
Language: Dart 3.8+             # Типизированный, быстрый, null-safety
State Management: Riverpod 2.6.1 # Простота, производительность, [документация](https://riverpod.dev/)
UI: Material Design 3 + Glass UI # Современный дизайн + уникальный брендинг
Database: SQLite + Drift 2.28.2  # Локальная БД с type-safe запросами
Networking: Dio 5.7.0           # HTTP клиент с interceptors
WebSocket: Socket.io-client      # Real-time коммуникация
Video: Chewie 1.8.5             # Видео плеер с контролами
AR/3D: Model Viewer Plus 1.7.2  # AR/3D модели
Push: Firebase Messaging 15.1.3 # Push уведомления
Maps: Google Maps Flutter 2.5.0 # Карты и геолокация
```

**Почему Flutter?** - Один код для iOS/Android, нативная производительность, быстрая разработка  
**Почему Riverpod?** - Простота использования, отличная производительность, [документация](https://riverpod.dev/)  
**Почему Drift?** - Type-safe SQL, миграции, отличная производительность
WebRTC: Agora RTC Engine 6.3.0
```

#### Backend Stack:
```yaml
Language: Go                   # Высокая производительность, простота, конкурентность
Framework: Gin                 # Быстрый HTTP фреймворк, middleware, [документация](https://gin-gonic.com/)
Database: PostgreSQL           # Надежная реляционная БД, JSON поддержка
Cache: Redis                   # In-memory кэш, pub/sub, [документация](https://redis.io/docs/)
File Storage: MinIO            # Объектное хранилище, S3 API
Authentication: JWT            # Stateless аутентификация
WebSocket: Gorilla WebSocket   # WebSocket сервер для real-time
Video Processing: FFmpeg       # Обработка видео, HLS генерация
Rate Limiting: Built-in        # Защита от DDoS
Monitoring: Prometheus         # Метрики и мониторинг, [Prometheus](https://prometheus.io/docs/)
Logging: Structured JSON       # Структурированное логирование
```

**Почему Go?** - Высокая производительность, простота, отличная конкурентность, быстрое время компиляции  
**Почему Gin?** - Быстрый HTTP роутер, middleware система, отличная производительность  
**Почему PostgreSQL?** - ACID транзакции, JSON поддержка, надежность, масштабируемость

#### Infrastructure:
```yaml
Containerization: Docker + Docker Compose  # Контейнеризация приложений
Reverse Proxy: Nginx                        # Load balancing, SSL termination
SSL: Let's Encrypt                          # Бесплатные SSL сертификаты
Domain: mebelplace.com.kz                   # Основной домен
CDN: CloudFlare (planned)                   # CDN для статических файлов
Monitoring: Grafana + Prometheus            # Метрики и дашборды
Backup: Automated PostgreSQL dumps         # Автоматические бэкапы
```

### 🚀 CI/CD Pipeline

#### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      # Backend Tests
      - name: Setup Go
        uses: actions/setup-go@v4
        with:
          go-version: '1.21'
      
      - name: Run Backend Tests
        run: |
          cd apps/backend
          go test ./...
          go test -race ./...
      
      # Frontend Tests
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Run Frontend Tests
        run: |
          cd apps/frontend-nextjs
          npm ci
          npm run test
          npm run test:e2e

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      # Build Docker Images
      - name: Build Backend Image
        run: |
          cd apps/backend
          docker build -t mebelplace-api:${{ github.sha }} .
      
      - name: Build Frontend Image
        run: |
          cd apps/frontend-nextjs
          docker build -t mebelplace-frontend:${{ github.sha }} .

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Production
        run: |
          docker-compose -f docker-compose.production.yml up -d
          
      - name: Run Health Checks
        run: |
          sleep 30
          curl -f https://api.mebelplace.com.kz/health || exit 1
          curl -f https://mebelplace.com.kz || exit 1
```

---

## 🌐 КОНФИГУРАЦИЯ И РАЗВЕРТЫВАНИЕ

### Environment Variables:

#### Production (.env):
```bash
# Database
DB_HOST=postgres
DB_PORT=5432
DB_USER=mebelplace_user
DB_NAME=mebelplace_prod
DB_PASSWORD=MebelPlace2024UltraSecureDBPass987

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=Redis2024!UltraSecure#Pass$456

# JWT
JWT_PRIVATE_KEY_PATH=/app/jwt-keys/private.pem
JWT_PUBLIC_KEY_PATH=/app/jwt-keys/public.pem

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=noreply@mebelplace.com.kz
SMTP_FROM_EMAIL=noreply@mebelplace.com.kz
SMTP_FROM_NAME=MebelPlace

# Media
MEDIA_DIR=/media

# CORS
CORS_ORIGIN=https://mebelplace.com.kz
CORS_ORIGINS=https://mebelplace.com.kz,https://www.mebelplace.com.kz

# Mobile SMS
MOBIZON_KEY=kza709b533060de72b09110d34ca60bee25bad4fd53e2bb6181fe47cb8a7cad16cb0b1
MOBIZON_FROM=MebelPlace

# S3/MinIO
S3_ENDPOINT=http://minio:9000
S3_BUCKET=mebelplace
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin123

# App
APP_ENV=production
PORT=8080
GRAFANA_PASSWORD=admin123
PG_DSN=postgres://mebelplace_api:MebelPlace2024UltraSecureDBPass987@postgres:5432/mebelplace_prod?sslmode=disable
API_BASE_PATH=/api/v2
```

#### Development (.env):
```bash
# Environment
ENVIRONMENT=development

# Server
PORT=8081
HOST=0.0.0.0

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=mebelplace
DB_PASSWORD=mebelplace123
DB_NAME=mebelplace
DB_SSLMODE=disable

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# NATS
NATS_URL=nats://localhost:4222

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRY=24h

# Security
BCRYPT_COST=12
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_DURATION=1m

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://mebelplace.com.kz,http://localhost:8081
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Origin,Content-Type,Accept,Authorization,X-CSRF-Token

# Mobizon SMS
MOBIZON_API_KEY=kz4cf384d6499b0db548b81b4007033da3a5f1f2891cd440f2c174055ec3c438620020
MOBIZON_API_URL=https://api.mobizon.kz

# File Upload
MAX_UPLOAD_SIZE=100MB
UPLOAD_PATH=./uploads

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

### Docker Compose Services:

```yaml
services:
  frontend:
    build: ./apps/frontend-nextjs
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=https://mebelplace.com.kz/api/v2
    depends_on:
      - backend

  mobile:
    build: ./apps/mobile
    environment:
      - API_BASE_URL=https://mebelplace.com.kz/api/v2
    depends_on:
      - backend

  backend:
    build: ./apps/backend
    ports:
      - "8080:8080"
    environment:
      - DB_HOST=postgres
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis
      - minio

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=mebelplace_prod
      - POSTGRES_USER=mebelplace_user
      - POSTGRES_PASSWORD=MebelPlace2024UltraSecureDBPass987
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass Redis2024!UltraSecure#Pass$456

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin123
    volumes:
      - minio_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - frontend
      - backend
```

---

## 📱 FRONTEND (Next.js)

### Архитектура Frontend:

#### Структура проекта:
```
apps/frontend-nextjs/
├── app/                          # Next.js 15 App Router
│   ├── [locale]/                 # i18n локализация
│   │   ├── (app)/                # Основные страницы
│   │   │   ├── feed/             # Лента видео
│   │   │   ├── search/           # Поиск
│   │   │   ├── profile/          # Профиль
│   │   │   ├── chat/             # Чаты
│   │   │   ├── requests/         # Заявки
│   │   │   ├── upload/           # Загрузка
│   │   │   └── settings/         # Настройки
│   │   ├── (auth)/               # Аутентификация
│   │   │   ├── login/            # Вход
│   │   │   ├── register/         # Регистрация
│   │   │   └── verify/           # Верификация
│   │   └── globals.css           # Глобальные стили
│   ├── api/                      # API Routes
│   └── layout.tsx                # Корневой layout
├── components/                   # React компоненты
│   ├── ui/                       # Glass UI компоненты
│   │   ├── glass-card.tsx        # Glass карточка
│   │   ├── glass-button.tsx      # Glass кнопка
│   │   ├── glass-input.tsx       # Glass поле ввода
│   │   ├── glass-modal.tsx       # Glass модальное окно
│   │   └── ...                   # 80+ компонентов
│   ├── features/                 # Feature-based компоненты
│   │   ├── auth/                 # Аутентификация
│   │   ├── video/                # Видео
│   │   ├── chat/                 # Чаты
│   │   ├── requests/             # Заявки
│   │   └── profile/              # Профиль
│   └── layout/                   # Layout компоненты
├── lib/                          # Утилиты и конфигурация
│   ├── api/                      # API клиент
│   ├── auth/                     # Аутентификация
│   ├── utils/                    # Утилиты
│   └── types/                    # TypeScript типы
├── public/                       # Статические файлы
├── styles/                       # Стили
└── package.json                  # Зависимости
```

### Glass Design System:

#### Основные компоненты (80+):
1. **GlassCard** - Базовая glass карточка с backdrop-blur
2. **GlassButton** - Кнопка с glass эффектом и градиентом
3. **GlassInput** - Поле ввода с glass эффектом
4. **GlassModal** - Модальное окно с glass фоном
5. **GlassNavigation** - Навигация с glass эффектами
6. **GlassSidebar** - Боковая панель с glass стилем
7. **GlassToast** - Уведомления с glass эффектом
8. **GlassForm** - Форма с glass элементами
9. **GlassVideoCard** - Видео карточка с double-tap лайк
10. **GlassChatBubble** - Пузырек сообщения с glass эффектом
11. **GlassSearchBar** - Поисковая строка с glass стилем
12. **GlassUserCard** - Карточка пользователя с glass стилем
13. **GlassRequestCard** - Карточка заявки с glass эффектом
14. **GlassProgressBar** - Прогресс бар с glass эффектом
15. **GlassDropdown** - Выпадающее меню с glass стилем
16. **GlassTooltip** - Подсказка с glass эффектом
17. **GlassVideoPlayer** - Видеоплеер с glass контролами
18. **GlassImageGallery** - Галерея изображений с glass эффектом
19. **GlassDataTable** - Таблица данных с glass стилем
20. **GlassCalendar** - Календарь с glass эффектом
21. **GlassTimeline** - Временная шкала с glass эффектом
22. **GlassStepper** - Пошаговый процесс с glass эффектом
23. **GlassBreadcrumb** - Хлебные крошки с glass стилем
24. **GlassPagination** - Пагинация с glass эффектом
25. **GlassRating** - Рейтинг с glass эффектом
26. **GlassTag** - Тег с glass эффектом
27. **GlassCarousel** - Карусель с glass стилем
28. **GlassSkeleton** - Скелетон загрузки с glass эффектом
29. **GlassFeedbackForm** - Форма обратной связи с glass стилем
30. **GlassAchievementBadge** - Бейдж достижения с glass эффектом
31. **GlassVoiceInput** - Голосовой ввод с glass стилем
32. **GlassDragDrop** - Drag & Drop с glass стилем
33. **GlassInfiniteScroll** - Бесконечная прокрутка с glass стилем
34. **GlassContextMenu** - Контекстное меню с glass стилем
35. **GlassTourGuide** - Интерактивный тур с glass стилем
36. **GlassHeatmap** - Тепловая карта с glass стилем
37. **GlassOfflineScreen** - Интерактивная страница offline режима
38. **GlassFeedbackForm** - Форма обратной связи
39. **GlassAchievementSystem** - Система достижений с анимациями
40. **GlassParticleSystem** - Система частиц для эффектов

#### Цветовая палитра:
```css
:root {
  /* Основные цвета */
  --primary-orange: #FF6600;
  --orange-light: #FF8533;
  --orange-dark: #FF4500;
  
  /* Акцентные цвета */
  --success-green: #22C55E;
  --success-light: #4ADE80;
  --success-dark: #16A34A;
  --error-red: #EF4444;
  --error-light: #F87171;
  --error-dark: #DC2626;
  --warning-yellow: #F59E0B;
  --warning-light: #FBBF24;
  --warning-dark: #D97706;
  --info-blue: #3B82F6;
  --info-light: #60A5FA;
  --info-dark: #2563EB;
  
  /* Glass эффекты */
  --glass-primary: rgba(255, 255, 255, 0.1);
  --glass-secondary: rgba(255, 255, 255, 0.05);
  --glass-accent: rgba(255, 102, 0, 0.2);
  --glass-dark: rgba(0, 0, 0, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
  --glass-shadow: rgba(0, 0, 0, 0.1);
  --glass-heavy: rgba(255, 255, 255, 0.08);
  --glass-light: rgba(255, 255, 255, 0.12);
}
```

#### Анимации (Framer Motion):
```typescript
// Основные анимации
const animations = {
  durations: {
    fast: 150,      // быстрые анимации (hover, focus)
    default: 300,   // стандартные анимации (transitions)
    slow: 500,      // медленные анимации (page transitions)
    slower: 800,    // очень медленные анимации (complex animations)
  },
  
  curves: {
    default: "cubic-bezier(0.4, 0, 0.2, 1)",
    easeIn: "cubic-bezier(0.4, 0, 1, 1)",
    easeOut: "cubic-bezier(0, 0, 0.2, 1)",
    spring: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    bounce: "cubic-bezier(0.68, -0.6, 0.32, 1.6)",
  },
  
  pageTransitions: {
    fadeScale: { duration: 300, opacity: [0, 1], scale: [0.95, 1.0] },
    slideRight: { duration: 300, x: ["100%", "0"] },
    slideUp: { duration: 300, y: ["100%", "0"] },
    rotationFade: { duration: 500, rotate: [0, 360], opacity: [0, 1] },
  },
  
  glassEffects: {
    shimmer: { duration: 2000, backgroundPosition: ["-200%", "200%"] },
    pulse: { duration: 2000, opacity: [0.8, 1.0, 0.8], repeat: "infinite" },
    float: { duration: 3000, y: [0, -4, 0], timing: "ease-in-out", repeat: "infinite" },
  },
  
  particleSystem: {
    confetti: { particles: 50, duration: 2000, colors: 5, effects: ["gravity", "wind", "bounce"] },
    stars: { particles: 30, duration: 1500, colors: 3, effects: ["rotation", "fade"] },
    hearts: { particles: 20, duration: 2000, colors: 3, effects: ["float", "pulse"] },
    sparkles: { particles: 40, duration: 1000, colors: 3, effects: ["burst", "fade"] },
  }
};
```

### Структура страниц (63 страницы):

#### Основные страницы (8):
1. **GlassFeedScreen** - Главная лента видео с infinite scroll, double-tap лайк, glass morphism
2. **GlassSearchScreen** - Поиск контента с autocomplete, фильтрами, glass эффектами
3. **GlassProfileScreen** - Профиль пользователя с glass карточками, hover эффектами
4. **GlassVideoDetailScreen** - Детальный просмотр видео с HLS плеером, комментариями
5. **GlassChatScreen** - Чаты и сообщения с WebSocket, glass пузырьками
6. **GlassRequestsScreen** - Заявки и предложения с glass карточками, статусами
7. **GlassUploadScreen** - Загрузка контента с drag&drop, progress bar, glass стилем
8. **GlassSettingsScreen** - Настройки приложения с glass формами, переключателями

#### Аутентификация (4):
9. **GlassLoginScreen** - Вход в систему с glass формами, анимациями, валидацией
10. **GlassRegisterScreen** - Регистрация с multi-step формой, glass эффектами
11. **GlassForgotPasswordScreen** - Восстановление пароля с glass стилем, email отправкой
12. **GlassVerifyEmailScreen** - Подтверждение email с glass карточкой, countdown таймером

#### Профиль (6):
13. **GlassEditProfileScreen** - Редактирование профиля с glass формами, аватаром, валидацией
14. **GlassMyVideosScreen** - Мои видео с glass карточками, статистикой, фильтрами
15. **GlassMyChannelScreen** - Мой канал с glass дизайном, подписчиками, аналитикой
16. **GlassMyRequestsScreen** - Мои заявки с glass карточками, статусами, фильтрацией
17. **GlassMyProposalsScreen** - Мои предложения с glass стилем, статусами, уведомлениями
18. **GlassAchievementsScreen** - Достижения с glass карточками, прогресс барами, анимациями

#### Чаты (5):
19. **GlassChatsListScreen** - Список чатов с glass карточками, последними сообщениями, статусами
20. **GlassChatDetailScreen** - Детальный чат с glass пузырьками, WebSocket, файлами
21. **GlassCreateChatScreen** - Создание чата с glass формой, поиском пользователей
22. **GlassGroupChatScreen** - Групповой чат с glass участниками, настройками группы
23. **GlassVoiceRoomScreen** - Голосовая комната с glass контролами, WebRTC, участниками

#### Заявки (4):
24. **GlassCreateRequestScreen** - Создание заявки
25. **GlassRequestDetailScreen** - Детали заявки
26. **GlassCreateProposalScreen** - Создание предложения
27. **GlassProposalDetailScreen** - Детали предложения

#### Видео (4):
28. **GlassVideoUploadScreen** - Загрузка видео
29. **GlassVideoEditScreen** - Редактирование видео
30. **GlassVideoAnalyticsScreen** - Аналитика видео
31. **GlassVideoCommentsScreen** - Комментарии к видео

#### Поиск (3):
32. **GlassSearchResultsScreen** - Результаты поиска
33. **GlassSearchFiltersScreen** - Фильтры поиска
34. **GlassSearchHistoryScreen** - История поиска

#### Уведомления (3):
35. **GlassNotificationsScreen** - Список уведомлений
36. **GlassNotificationSettingsScreen** - Настройки уведомлений
37. **GlassNotificationDetailScreen** - Детали уведомления

#### Платежи (4):
38. **GlassWalletScreen** - Кошелек
39. **GlassPaymentMethodsScreen** - Способы оплаты
40. **GlassInvoicesScreen** - Счета
41. **GlassTransactionsScreen** - Транзакции

#### Заказы (3):
42. **GlassMyOrdersScreen** - Мои заказы
43. **GlassOrderDetailScreen** - Детали заказа
44. **GlassOrderTrackingScreen** - Отслеживание заказа

#### Каталог (2):
45. **GlassCatalogScreen** - Каталог мебели
46. **GlassProjectsCatalogScreen** - Каталог проектов

#### AR/3D Конфигуратор (2):
47. **GlassConfiguratorScreen** - Конфигуратор мебели
48. **GlassInteriorConfiguratorScreen** - Конфигуратор интерьера

#### AI (1):
49. **GlassAIAssistantScreen** - AI помощник

#### Каналы (2):
50. **GlassUserChannelScreen** - Канал пользователя
51. **GlassMessengerChannelScreen** - Канал в мессенджере

#### Поддержка (1):
52. **GlassSupportScreen** - Техническая поддержка

#### Onboarding (4):
53. **GlassOnboardingScreen** - Главный онбординг
54. **GlassWelcomePage** - Приветствие
55. **GlassGetStartedPage** - Начало работы
56. **GlassFeaturesPage** - Возможности приложения

#### Дизайн (1):
57. **GlassDesignIdeasScreen** - Идеи дизайна

#### Пользователи (1):
58. **GlassUserScreen** - Профиль пользователя

#### Загрузка (1):
59. **GlassLoadingScreen** - Экран загрузки

#### Ошибки (1):
60. **GlassErrorScreen** - Экран ошибок

#### Демо (1):
61. **GlassAnimationsDemoScreen** - Демо анимаций

#### Splash (1):
62. **GlassSplashScreen** - Заставка приложения

#### Подписки (1):
63. **GlassSubscriptionsScreen** - Подписки на каналы

### PWA возможности:

#### Service Worker:
```typescript
// Кэширование стратегии
const cacheStrategies = {
  static: "Cache First",           // Статические ресурсы
  api: "Network First",            // API запросы
  media: "Stale While Revalidate", // Изображения и видео
  background: "Background Sync",   // Автоматическая синхронизация
};
```

#### Web App Manifest:
```json
{
  "name": "MebelPlace",
  "short_name": "MebelPlace",
  "icons": [
    { "src": "/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512x512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "theme_color": "#FF6600",
  "background_color": "#FFFFFF",
  "display": "standalone",
  "orientation": "portrait-primary",
  "start_url": "/",
  "scope": "/"
}
```

### Интернационализация:
- **Языки**: Русский (основной), Английский, Казахский
- **next-intl**: Локализованные URL, namespaces, fallback
- **Форматирование**: Даты, числа, валюты

---

## 📲 MOBILE (Flutter)

### Архитектура Mobile:

#### Структура проекта:
```
apps/mobile/
├── lib/
│   ├── main.dart                  # Точка входа
│   ├── app/                       # Конфигурация приложения
│   │   ├── app.dart              # Главный виджет
│   │   ├── router.dart           # Маршрутизация
│   │   └── theme.dart            # Тема приложения
│   ├── core/                      # Основная логика
│   │   ├── constants/            # Константы
│   │   ├── errors/               # Обработка ошибок
│   │   ├── network/              # Сетевые запросы
│   │   ├── utils/                # Утилиты
│   │   └── di/                   # Dependency Injection
│   ├── data/                      # Слой данных
│   │   ├── datasources/          # Источники данных
│   │   ├── models/               # Модели данных
│   │   └── repositories/         # Репозитории
│   ├── domain/                    # Бизнес логика
│   │   ├── entities/             # Сущности
│   │   ├── repositories/         # Интерфейсы репозиториев
│   │   └── usecases/             # Случаи использования
│   ├── presentation/              # UI слой
│   │   ├── pages/                # Страницы
│   │   ├── widgets/              # Виджеты
│   │   └── providers/            # Riverpod провайдеры
│   └── shared/                    # Общие компоненты
│       ├── widgets/              # Переиспользуемые виджеты
│       └── utils/                # Общие утилиты
├── assets/                        # Ресурсы
│   ├── icons/                    # Иконки
│   ├── images/                   # Изображения
│   └── translations/             # Переводы
├── test/                          # Тесты
└── pubspec.yaml                  # Зависимости
```

### Flutter зависимости:

#### Основные пакеты:
```yaml
dependencies:
  # UI
  cupertino_icons: ^1.0.8
  
  # State Management
  flutter_riverpod: ^2.6.1
  riverpod: ^2.6.1
  
  # Networking
  dio: ^5.7.0
  http: ^1.2.2
  pretty_dio_logger: ^1.4.0
  
  # WebSocket
  web_socket_channel: ^3.0.1
  socket_io_client: ^2.0.3+1
  
  # Local storage
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  shared_preferences: ^2.2.3
  flutter_secure_storage: ^9.2.2
  drift: ^2.28.2
  sqlite3_flutter_libs: ^0.5.40
  sqflite: ^2.4.1
  path_provider: ^2.1.5
  path: ^1.9.1
  
  # Auth & Security
  jwt_decoder: ^2.0.1
  crypto: ^3.0.5
  
  # Push notifications
  firebase_core: ^3.6.0
  firebase_messaging: ^15.1.3
  firebase_analytics: ^11.3.3
  flutter_local_notifications: ^18.0.1
  
  # Video
  chewie: ^1.8.5
  
  # Images
  cached_network_image: ^3.4.1
  image_picker: ^1.1.2
  photo_view: ^0.15.0
  
  # UI Components
  flutter_svg: ^2.0.10+1
  shimmer: ^3.0.0
  lottie: ^3.1.3
  flutter_staggered_grid_view: ^0.7.0
  pull_to_refresh: ^2.0.0
  badges: ^3.1.2
  google_fonts: ^6.2.1
  
  # Routing
  go_router: ^14.6.2
  
  # Dependency Injection
  get_it: ^8.0.2
  injectable: ^2.5.0
  
  # i18n
  easy_localization: ^3.0.7
  intl: ^0.20.2
  
  # Utils
  url_launcher: ^6.3.1
  permission_handler: ^11.3.1
  device_info_plus: ^10.1.2
  connectivity_plus: ^6.0.5
  package_info_plus: ^8.0.3
  
  # Audio
  audioplayers: ^6.1.0
  record: ^5.2.1
  
  # AR & 3D
  model_viewer_plus: ^1.7.2
  
  # QR Code
  qr_flutter: ^4.1.0
  
  # Maps
  google_maps_flutter: ^2.5.0
  geolocator: ^10.1.0
  
  # Real-time Communication
  agora_rtc_engine: ^6.3.0
  
  # WebView
  webview_flutter: ^4.4.2
  
  # Share
  share_plus: ^12.0.0
  
  # Error tracking
  sentry_flutter: ^8.11.0
  
  # Code generation helpers
  json_annotation: ^4.9.0
  equatable: ^2.0.7
  
  # Either for Clean Architecture
  dartz: ^0.10.1
  
  # Social Auth
  google_sign_in: ^6.2.1
  sign_in_with_apple: ^6.1.3
  
  # File handling
  file_picker: ^8.1.4
  mime: ^2.0.0
  build_runner: ^2.9.0
```

### Glass UI компоненты (20 компонентов):

#### Основные Glass компоненты:
1. **glass_video_card_with_doubletap.dart** - Видео карточка с double-tap лайк
2. **glass_custom_cards.dart** - Кастомные glass карточки с blur эффектами
3. **glass_button.dart** - Кнопка с glass эффектом и градиентом
4. **glass_icon_button_custom.dart** - Кастомная glass кнопка с иконкой
5. **glass_text_field.dart** - Glass поле ввода с размытием
6. **glass_message_bubble.dart** - Glass пузырек сообщения
7. **glass_panel.dart** - Glass панель с backdrop filter
8. **glass_screen_base.dart** - Базовый glass экран
9. **glass_video_card.dart** - Обычная glass видео карточка
10. **glass_ad_video_card.dart** - Рекламная видео карточка
11. **glass_chip.dart** - Чип с glass эффектом
12. **glass_custom_icons.dart** - Кастомные glass иконки
13. **glass_custom_widgets.dart** - Кастомные glass виджеты
14. **glass_icon_button.dart** - Glass кнопка с иконкой

#### Дополнительные UI компоненты:
15. **glass_bottom_sheet.dart** - Glass bottom sheet
16. **glass_modal.dart** - Glass модальное окно
17. **glass_input.dart** - Glass поле ввода
18. **glass_card.dart** - Glass карточка
19. **glass_video_detail_screen.dart** - Glass экран деталей видео

#### Glass параметры:
```dart
class GlassConfig {
  static const double blurSigma = 10.0;        // Размытие
  static const double borderRadius = 16.0;     // Радиус скругления
  static const double backgroundAlpha = 0.2;   // Прозрачность фона
  static const List<Color> gradientColors = [  // Градиентные цвета
    Color(0x1AFFFFFF),
    Color(0x0DFFFFFF),
  ];
}
```

### Анимации (Flutter):

#### Основные анимации:
```dart
class AppAnimations {
  static const Duration fast = Duration(milliseconds: 120);
  static const Duration defaultDuration = Duration(milliseconds: 240);
  static const Duration slow = Duration(milliseconds: 360);
  static const Duration slower = Duration(milliseconds: 500);
  
  static const Duration doubleTapLike = Duration(milliseconds: 300);
  static const Duration skeletonPulse = Duration(milliseconds: 1000);
  static const Duration bottomSheetOpen = Duration(milliseconds: 240);
  static const Duration bottomSheetClose = Duration(milliseconds: 200);
  static const Duration hoverEffects = Duration(milliseconds: 100);
  static const Duration tiltEffects = Duration(milliseconds: 150);
  static const Duration swipeReactions = Duration(milliseconds: 150);
  static const Duration springEffects = Duration(milliseconds: 800);
  
  static const Curve defaultCurve = Cubic(0.2, 0.8, 0.2, 1.0);
  static const Curve easeIn = Cubic(0.4, 0.0, 1.0, 1.0);
  static const Curve easeOut = Cubic(0.0, 0.0, 0.2, 1.0);
  static const Curve spring = Cubic(0.68, -0.55, 0.265, 1.55);
}
```

#### Page Transitions:
```dart
class ModernAnimations {
  static const Duration fadeScale = Duration(milliseconds: 240);
  static const Duration slideRight = Duration(milliseconds: 240);
  static const Duration slideUp = Duration(milliseconds: 240);
  static const Duration rotationFade = Duration(milliseconds: 360);
  
  static const Offset slideFromRight = Offset(1.0, 0.0);
  static const Offset slideFromLeft = Offset(-1.0, 0.0);
  static const Offset slideFromBottom = Offset(0.0, 1.0);
  static const Offset slideFromTop = Offset(0.0, -1.0);
}
```

#### Particle System:
```dart
class ParticleSystem {
  static const Map<String, ParticleConfig> configs = {
    'confetti': ParticleConfig(
      particles: 50,
      duration: Duration(seconds: 2),
      colors: 5,
      effects: ['gravity', 'wind', 'bounce'],
    ),
    'stars': ParticleConfig(
      particles: 30,
      duration: Duration(milliseconds: 1500),
      colors: 3,
      effects: ['rotation', 'fade'],
    ),
    'hearts': ParticleConfig(
      particles: 20,
      duration: Duration(seconds: 2),
      colors: 3,
      effects: ['float', 'pulse'],
    ),
    'sparkles': ParticleConfig(
      particles: 40,
      duration: Duration(seconds: 1),
      colors: 3,
      effects: ['burst', 'fade'],
    ),
    'woodChips': ParticleConfig(
      particles: 30,
      duration: Duration(milliseconds: 1500),
      colors: 4,
      effects: ['gravity', 'rotation'],
    ),
  };
}
```

### Экраны мобильного приложения (79 экранов):

#### Главные экраны (5 основных):
1. **GlassFeedScreenRefactored** - Видео лента (главный экран)
2. **GlassSearchScreen** - Поиск контента
3. **GlassRequestsTab** - Заявки на мебель
4. **GlassChatsListScreen** - Список чатов
5. **GlassProfileScreenRefactored** - Профиль пользователя

#### Аутентификация (6 экранов):
6. **glass_login_screen.dart** - Вход в систему
7. **glass_register_screen.dart** - Регистрация
8. **glass_sms_verification_screen.dart** - SMS верификация
9. **glass_verify_phone_screen.dart** - Подтверждение телефона
10. **glass_verify_email_screen.dart** - Подтверждение email
11. **glass_forgot_password_screen.dart** - Восстановление пароля

#### Видео (7 экранов):
12. **glass_feed_screen_refactored.dart** - Лента видео
13. **glass_video_player_screen.dart** - Видео плеер
14. **glass_video_detail_screen.dart** - Детали видео
15. **glass_comments_screen.dart** - Комментарии к видео
16. **glass_favorites_screen.dart** - Избранные видео
17. **glass_upload_video_screen.dart** - Загрузка видео
18. **glass_video_feed_tab.dart** - Таб ленты видео

#### Чаты (4 экрана):
19. **glass_chats_list_screen.dart** - Список чатов
20. **glass_chat_screen.dart** - Индивидуальный чат
21. **glass_create_chat_screen.dart** - Создание чата
22. **glass_messenger_chat_screen.dart** - Мессенджер чат

#### Профиль (7 экранов):
23. **glass_profile_screen_refactored.dart** - Главный профиль
24. **glass_user_profile_screen.dart** - Профиль пользователя
25. **glass_edit_profile_screen.dart** - Редактирование профиля
26. **glass_my_videos_screen.dart** - Мои видео
27. **glass_my_channel_screen.dart** - Мой канал
28. **glass_channel_page.dart** - Страница канала
29. **glass_profile_tab.dart** - Таб профиля

#### Заявки (4 экрана):
30. **glass_request_screen.dart** - Главный экран заявок
31. **glass_request_details_screen.dart** - Детали заявки
32. **glass_request_responses_screen.dart** - Ответы на заявку
33. **glass_create_proposal_screen.dart** - Создание предложения

#### Администрация (15 экранов):
34. **glass_admin_screen.dart** - Главный админ экран
35. **glass_admin_panel_screen.dart** - Панель администратора
36. **glass_all_users_screen.dart** - Все пользователи
37. **glass_banned_users_screen.dart** - Заблокированные пользователи
38. **glass_pending_content_screen.dart** - Ожидающий контент
39. **glass_pending_tickets_screen.dart** - Ожидающие тикеты
40. **glass_reported_content_screen.dart** - Жалобы на контент
41. **glass_all_tickets_screen.dart** - Все тикеты поддержки
42. **glass_ads_list_screen.dart** - Список рекламы
43. **glass_user_analytics_screen.dart** - Аналитика пользователей
44. **glass_video_analytics_screen.dart** - Аналитика видео
45. **glass_order_analytics_screen.dart** - Аналитика заказов
46. **glass_revenue_analytics_screen.dart** - Аналитика доходов
47. **ads_tab.dart** - Таб рекламы
48. **analytics_tab.dart** - Таб аналитики
49. **moderation_tab.dart** - Таб модерации
50. **support_tab.dart** - Таб поддержки

#### Геймификация (4 экрана):
51. **glass_user_stats_screen.dart** - Статистика пользователя
52. **glass_achievements_screen.dart** - Достижения
53. **glass_leaderboard_screen.dart** - Таблица лидеров
54. **glass_rewards_screen.dart** - Награды

#### Настройки (2 экрана):
55. **glass_settings_screen.dart** - Настройки приложения
56. **glass_notifications_settings_screen.dart** - Настройки уведомлений

#### Уведомления (2 экрана):
57. **glass_notifications_screen.dart** - Список уведомлений
58. **glass_notifications_settings_screen.dart** - Настройки уведомлений

#### Заказы (3 экрана):
59. **glass_my_orders_screen.dart** - Мои заказы
60. **glass_order_product_screen.dart** - Заказ продукта

#### Каталог (2 экрана):
61. **glass_catalog_screen.dart** - Каталог мебели
62. **glass_projects_catalog_screen.dart** - Каталог проектов

#### AR/3D Конфигуратор (2 экрана):
63. **glass_configurator_screen.dart** - Конфигуратор мебели
64. **glass_interior_configurator_screen.dart** - Конфигуратор интерьера

#### AI (1 экран):
65. **glass_ai_assistant_screen.dart** - AI помощник

#### Каналы (2 экрана):
66. **glass_user_channel_screen.dart** - Канал пользователя
67. **glass_messenger_channel_screen.dart** - Канал в мессенджере

#### Поддержка (1 экран):
68. **glass_support_screen.dart** - Техническая поддержка

#### Onboarding (4 экрана):
69. **glass_onboarding_screen.dart** - Главный онбординг
70. **glass_welcome_page.dart** - Приветствие
71. **glass_get_started_page.dart** - Начало работы
72. **glass_features_page.dart** - Возможности приложения

#### Дизайн (1 экран):
73. **glass_design_ideas_screen.dart** - Идеи дизайна

#### Пользователи (1 экран):
74. **glass_user_screen.dart** - Профиль пользователя

#### Загрузка (1 экран):
75. **glass_loading_screen.dart** - Экран загрузки

#### Ошибки (1 экран):
76. **glass_error_screen.dart** - Экран ошибок

#### Демо (1 экран):
77. **glass_animations_demo_screen.dart** - Демо анимаций

#### Splash (1 экран):
78. **glass_splash_screen.dart** - Заставка приложения

#### Подписки (1 экран):
79. **glass_subscriptions_screen.dart** - Подписки на каналы

### Offline возможности:
- **Кэширование**: Видео и изображения
- **Offline queue**: Очередь действий для синхронизации
- **Автоматическая синхронизация**: При восстановлении соединения
- **Conflict resolution**: Разрешение конфликтов данных
- **Network con # 🏠 MEBELPLACE - ПОЛНАЯ ДОКУМЕНТАЦИЯ ЭКОСИСТЕМЫ

## 📋 ОГЛАВЛЕНИЕ

1. [🎯 ОБЗОР ЭКОСИСТЕМЫ](#обзор-экосистемы)
2. [🏗️ АРХИТЕКТУРА СИСТЕМЫ](#архитектура-системы)
3. [🔧 BACKEND API (Go)](#backend-api-go)
4. [🌐 FRONTEND (Next.js 15)](#frontend-nextjs-15)
5. [📱 MOBILE APP (Flutter)](#mobile-app-flutter)
6. [🎨 GLASS DESIGN SYSTEM](#glass-design-system)
7. [🔄 ПОЛЬЗОВАТЕЛЬСКИЕ СЦЕНАРИИ](#пользовательские-сценарии)
8. [⚙️ КОНФИГУРАЦИЯ И РАЗВЕРТЫВАНИЕ](#конфигурация-и-развертывание)
9. [🔐 БЕЗОПАСНОСТЬ И АУТЕНТИФИКАЦИЯ](#безопасность-и-аутентификация)
10. [📊 МОНИТОРИНГ И АНАЛИТИКА](#мониторинг-и-аналитика)
11. [🚀 ПРОИЗВОДИТЕЛЬНОСТЬ И ОПТИМИЗАЦИЯ](#производительность-и-оптимизация)
12. [🧪 ТЕСТИРОВАНИЕ](#тестирование)
13. [📚 РАЗРАБОТКА И ПОДДЕРЖКА](#разработка-и-поддержка)

---

## 🎯 ОБЗОР ЭКОСИСТЕМЫ

### Что такое MebelPlace?

**MebelPlace** - это комплексная экосистема для торговли мебелью с видео-контентом, объединяющая:

- 🎬 **Видео-платформу** с HLS стримингом и AR/3D конфигуратором
- 💬 **Мессенджер** с WebRTC звонками и голосовыми комнатами  
- 🛒 **Маркетплейс** с системой заявок и предложений
- 🎯 **Геймификацию** с достижениями и рейтингами
- 📱 **Кроссплатформенные приложения** (Web + Mobile)

### 🎨 Уникальные особенности

- **Glass Design System** - инновационная дизайн-система с glass morphism эффектами
- **HLS Video Streaming** - адаптивное видео с multi-variant качеством (360p, 720p, 1080p)
- **WebRTC Integration** - прямые видеозвонки и голосовые комнаты
- **AR/3D Configurator** - виртуальная примерка мебели
- **Real-time Communication** - WebSocket для чатов и уведомлений
- **Offline Support** - работа без интернета с синхронизацией

---

## 🏗️ АРХИТЕКТУРА СИСТЕМЫ

### 🏛️ Общая архитектура

```mermaid
graph TB
    subgraph "🌐 Client Layer"
        FE[Frontend Next.js 15<br/>Glass UI + PWA]
        MOB[Mobile Flutter<br/>Cross-platform]
    end
    
    subgraph "🔧 Application Layer"
        API[Backend API Go<br/>REST + WebSocket]
        AUTH[JWT Authentication<br/>Rate Limiting]
    end
    
    subgraph "🗄️ Data Layer"
        PG[(PostgreSQL<br/>Main Database)]
        REDIS[(Redis<br/>Cache + Sessions)]
        MINIO[(MinIO S3<br/>File Storage)]
    end
    
    subgraph "🔌 External Services"
        MOBIZON[Mobizon SMS]
        FIREBASE[Firebase Push]
        PAYMENT[Payment Providers]
    end
    
    FE --> API
    MOB --> API
    API --> PG
    API --> REDIS
    API --> MINIO
    API --> MOBIZON
    API --> FIREBASE
    API --> PAYMENT
```

### 📊 Диаграмма последовательности API взаимодействий

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as Database
    participant R as Redis
    participant S as Storage
    
    U->>F: Login Request
    F->>B: POST /api/v1/auth/login
    B->>DB: Validate User
    B->>R: Store Session
    B->>F: JWT Token
    F->>U: Login Success
    
    U->>F: Upload Video
    F->>B: POST /api/v1/videos/upload
    B->>S: Store Video File
    B->>B: Process HLS
    B->>DB: Save Video Metadata
    B->>F: Video ID + HLS URL
    F->>U: Upload Complete
```

### 🔄 WebSocket Real-time Communication

```mermaid
graph LR
    subgraph "Client Side"
        WS1[WebSocket Client 1]
        WS2[WebSocket Client 2]
        WS3[WebSocket Client N]
    end
    
    subgraph "Server Side"
        WSS[WebSocket Server]
        ROOM[Room Manager]
        MSG[Message Queue]
    end
    
    WS1 <--> WSS
    WS2 <--> WSS
    WS3 <--> WSS
    WSS <--> ROOM
    WSS <--> MSG
```

### 🎬 HLS Video Processing Pipeline

```mermaid
flowchart TD
    A[Video Upload] --> B[FFmpeg Processing]
    B --> C[Generate Variants<br/>360p, 720p, 1080p]
    C --> D[Create Thumbnails]
    D --> E[Generate M3U8 Playlist]
    E --> F[Store in MinIO]
    F --> G[Update Database]
    G --> H[Ready for Streaming]
```

### 🏛️ Общая архитектура (текстовая схема)

```
┌─────────────────────────────────────────────────────────────┐
│                    MEBELPLACE ECOSYSTEM                     │
├─────────────────────────────────────────────────────────────┤
│  🌐 Frontend (Next.js 15)    │  📱 Mobile (Flutter)        │
│  - Glass Design System       │  - Glass UI Components      │
│  - PWA Support               │  - Offline Mode             │
│  - WebRTC Integration        │  - Push Notifications       │
│  - HLS Video Player          │  - AR/3D Models             │
├─────────────────────────────────────────────────────────────┤
│                    🔧 Backend API (Go)                      │
│  - REST API v2.4.0           │  - WebSocket Server         │
│  - JWT Authentication        │  - HLS Video Processing     │
│  - File Upload/Storage       │  - Real-time Notifications  │
├─────────────────────────────────────────────────────────────┤
│  🗄️ PostgreSQL Database      │  🔴 Redis Cache             │
│  - User Management           │  - Session Storage          │
│  - Video Metadata            │  - Real-time Data           │
│  - Chat Messages             │  - Rate Limiting            │
├─────────────────────────────────────────────────────────────┤
│  📁 MinIO Storage            │  📧 SMTP Server             │
│  - Video Files               │  - Email Notifications      │
│  - Images/Avatars            │  - SMS via Mobizon          │
│  - HLS Segments              │  - Password Reset           │
└─────────────────────────────────────────────────────────────┘
```

### 🌐 Домены и окружения

**Production:**
- **Frontend**: `https://mebelplace.com.kz`
- **API**: `https://mebelplace.com.kz/api/v2`
- **Mobile API**: `https://mebelplace.com.kz/api/v2`

**Development:**
- **Frontend**: `http://localhost:3000`
- **API**: `http://localhost:8080/api/v2`
- **Mobile**: `http://localhost:8080/api/v2`

---

## 🔧 BACKEND API (Go)

### 📋 Основные возможности

**MebelPlace Backend API v2.4.0** - мощный сервер на Go с поддержкой:

- 🔐 **Аутентификация**: JWT токены, SMS/Email верификация
- 🎬 **Видео обработка**: HLS стриминг, автоматические thumbnail
- 💬 **Real-time чаты**: WebSocket соединения
- 📞 **WebRTC**: Signaling для видеозвонков
- 🛒 **Заявки и предложения**: Система торговли
- 🎯 **Геймификация**: Достижения и рейтинги
- 📊 **Аналитика**: Метрики и статистика

### 🏷️ API Endpoints (обновлено v2.4.0 - 201 эндпоинт)

#### 🔐 Authentication (6 эндпоинтов)
```
POST /auth/register          - Регистрация пользователя
POST /auth/login             - Вход в систему
POST /auth/verify-sms        - Подтверждение SMS
POST /auth/verify-email      - Подтверждение Email
POST /auth/refresh           - Обновление токена
POST /auth/logout            - Выход из системы
```

#### 🖥️ System (5 эндпоинтов)
```
GET  /health                 - Проверка состояния системы
GET  /live                   - Liveness probe
GET  /ready                  - Readiness probe
GET  /metrics                - Prometheus метрики
GET  /ratelimit/status       - НОВОЕ: Статус лимитов запросов
```

#### 👤 Users (Пользователи)
```
GET  /users/me               - Получить профиль
PUT  /users/me               - Обновить профиль
POST /users/me/avatar        - Загрузить аватар
GET  /users/{id}             - Получить пользователя по ID
POST /users/{id}/block       - Заблокировать пользователя
GET  /users/blocked          - Заблокированные пользователи
```

#### 🎬 Videos (Видео)
```
GET  /videos/feed            - Лента видео
POST /videos/upload          - Загрузить видео
POST /videos/{id}/like       - Лайкнуть видео
POST /videos/{id}/unlike     - Убрать лайк
GET  /videos/{id}/comments   - Комментарии к видео
POST /videos/{id}/comments   - Добавить комментарий
```

#### 🛒 Requests (Заявки)
```
GET  /requests               - Получить заявки
POST /requests               - Создать заявку
GET  /requests/{id}          - Детали заявки
POST /requests/{id}/proposals - Создать предложение
GET  /requests/{id}/proposals - Получить предложения
```

#### 💬 Chats (Чаты)
```
GET  /chats                  - Список чатов
POST /chats                  - Создать чат
GET  /chats/{id}/messages    - Сообщения чата
POST /chats/{id}/messages    - Отправить сообщение
POST /chats/{id}/join        - Присоединиться к чату
```

#### 🔔 Notifications (Уведомления)
```
GET  /notifications          - Список уведомлений
PUT  /notifications/{id}/read - Отметить как прочитанное
POST /notifications/settings - Настройки уведомлений
```

#### 📞 Calls (Звонки)
```
POST /calls/start            - Начать звонок
POST /calls/{id}/join        - Присоединиться к звонку
POST /calls/{id}/end         - Завершить звонок
GET  /calls/history          - История звонков
```

### 🔒 Rate Limiting

- **HLS endpoints**: 100 запросов/минуту на пользователя
- **Live streaming**: 10 запросов/минуту на пользователя  
- **Thumbnail**: 200 запросов/минуту на пользователя
- **Общие API**: 1000 запросов/минуту на пользователя

### 🗄️ База данных (PostgreSQL)

#### 📊 ER-диаграмма базы данных

```mermaid
erDiagram
    USERS {
        uuid id PK
        string email UK
        string phone UK
        string first_name
        string last_name
        string avatar_url
        string role
        boolean is_verified
        timestamp created_at
        timestamp updated_at
    }
    
    VIDEOS {
        uuid id PK
        uuid user_id FK
        string title
        text description
        string category
        jsonb tags
        string hls_url
        string thumbnail_url
        integer duration
        jsonb quality_variants
        string status
        integer likes_count
        integer views_count
        timestamp created_at
    }
    
    REQUESTS {
        uuid id PK
        uuid user_id FK
        string title
        text description
        string category
        jsonb requirements
        decimal budget_min
        decimal budget_max
        string status
        timestamp deadline
        timestamp created_at
    }
    
    PROPOSALS {
        uuid id PK
        uuid request_id FK
        uuid user_id FK
        text description
        decimal price
        jsonb attachments
        string status
        timestamp created_at
    }
    
    CHATS {
        uuid id PK
        string type
        string name
        string description
        uuid created_by FK
        timestamp created_at
    }
    
    MESSAGES {
        uuid id PK
        uuid chat_id FK
        uuid user_id FK
        text content
        string type
        jsonb metadata
        timestamp created_at
    }
    
    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        string type
        string title
        text message
        jsonb data
        boolean is_read
        timestamp created_at
    }
    
    ACHIEVEMENTS {
        uuid id PK
        string name
        text description
        string icon_url
        string category
        jsonb requirements
        timestamp created_at
    }
    
    USER_ACHIEVEMENTS {
        uuid id PK
        uuid user_id FK
        uuid achievement_id FK
        timestamp earned_at
    }
    
    USERS ||--o{ VIDEOS : creates
    USERS ||--o{ REQUESTS : creates
    USERS ||--o{ PROPOSALS : creates
    USERS ||--o{ CHATS : creates
    USERS ||--o{ MESSAGES : sends
    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ USER_ACHIEVEMENTS : earns
    
    REQUESTS ||--o{ PROPOSALS : has
    CHATS ||--o{ MESSAGES : contains
    ACHIEVEMENTS ||--o{ USER_ACHIEVEMENTS : earned_by
```

**Основные таблицы:**
- `users` - пользователи (аутентификация, профили)
- `videos` - видео контент (HLS стриминг, метаданные)
- `requests` - заявки на мебель (потребности покупателей)
- `proposals` - предложения (ответы мастеров)
- `chats` - чаты (личные и групповые)
- `messages` - сообщения (текст, медиа, файлы)
- `notifications` - уведомления (push, email, in-app)
- `achievements` - достижения (геймификация)
- `user_achievements` - достижения пользователей (прогресс)

---

## 🔄 API И ИНТЕГРАЦИИ

### 🌐 Backend API (REST + WebSocket)

**MebelPlace API v2.4.0** - высокопроизводительный API на Go с 201 эндпоинтом:

#### 📊 Статистика API
- **Всего эндпоинтов**: 201
- **REST API**: 195 эндпоинтов
- **WebSocket**: 6 эндпоинтов
- **Rate Limiting**: Защита от DDoS
- **JWT Authentication**: Безопасная аутентификация

#### 🔗 Основные категории API

```mermaid
graph TB
    subgraph "🔐 Authentication"
        AUTH1[POST /auth/login]
        AUTH2[POST /auth/register]
        AUTH3[POST /auth/refresh]
        AUTH4[POST /auth/logout]
    end
    
    subgraph "👥 Users"
        USER1[GET /users/profile]
        USER2[PUT /users/profile]
        USER3[GET /users/search]
        USER4[POST /users/follow]
    end
    
    subgraph "🎬 Videos"
        VID1[POST /videos/upload]
        VID2[GET /videos/feed]
        VID3[GET /videos/{id}]
        VID4[POST /videos/{id}/like]
    end
    
    subgraph "💬 Chats"
        CHAT1[GET /chats]
        CHAT2[POST /chats]
        CHAT3[GET /chats/{id}/messages]
        CHAT4[POST /chats/{id}/messages]
    end
    
    subgraph "🛒 Requests"
        REQ1[POST /requests]
        REQ2[GET /requests]
        REQ3[POST /requests/{id}/proposals]
        REQ4[GET /requests/{id}/proposals]
    end
```

#### 📝 Примеры API запросов

##### 1. Регистрация пользователя
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "phone": "+7 777 123 45 67",
  "firstName": "Иван",
  "lastName": "Петров"
}
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "phone": "+7 777 123 45 67",
      "firstName": "Иван",
      "lastName": "Петров",
      "role": "user",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 3600
    }
  }
}
```

##### 2. Загрузка видео
```http
POST /api/v1/videos/upload
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data

{
  "file": [video_file],
  "title": "Красивый диван",
  "description": "Показываю новый диван в гостиной",
  "category": "furniture",
  "tags": ["диван", "гостиная", "современный"]
}
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "video": {
      "id": "video_456",
      "title": "Красивый диван",
      "description": "Показываю новый диван в гостиной",
      "category": "furniture",
      "tags": ["диван", "гостиная", "современный"],
      "hlsUrl": "https://cdn.mebelplace.com.kz/videos/video_456/playlist.m3u8",
      "thumbnailUrl": "https://cdn.mebelplace.com.kz/videos/video_456/thumb.jpg",
      "duration": 120,
      "quality": ["360p", "720p", "1080p"],
      "status": "processing",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

##### 3. Получение ленты видео
```http
GET /api/v1/videos/feed?page=1&limit=20&category=furniture
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "videos": [
      {
        "id": "video_456",
        "title": "Красивый диван",
        "description": "Показываю новый диван в гостиной",
        "thumbnailUrl": "https://cdn.mebelplace.com.kz/videos/video_456/thumb.jpg",
        "hlsUrl": "https://cdn.mebelplace.com.kz/videos/video_456/playlist.m3u8",
        "duration": 120,
        "likesCount": 42,
        "commentsCount": 8,
        "viewsCount": 1250,
        "author": {
          "id": "user_123",
          "firstName": "Иван",
          "lastName": "Петров",
          "avatarUrl": "https://cdn.mebelplace.com.kz/avatars/user_123.jpg"
        },
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

### 🔌 Внешние интеграции

#### 📱 Mobizon SMS Service
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant M as Mobizon API
    
    U->>F: Ввод номера телефона
    F->>B: POST /auth/send-sms
    B->>M: Отправка SMS
    M->>B: SMS отправлена
    B->>F: SMS код отправлен
    F->>U: Введите код из SMS
    U->>F: Ввод SMS кода
    F->>B: POST /auth/verify-sms
    B->>M: Проверка кода
    M->>B: Код верный
    B->>F: Верификация успешна
```

#### 🔥 Firebase Push Notifications
```mermaid
graph LR
    subgraph "Backend"
        API[API Server]
        FCM[Firebase Admin SDK]
    end
    
    subgraph "Firebase"
        FCM_SERVER[FCM Server]
    end
    
    subgraph "Mobile"
        APP[Mobile App]
        TOKEN[Device Token]
    end
    
    API --> FCM
    FCM --> FCM_SERVER
    FCM_SERVER --> APP
    APP --> TOKEN
```

#### 💳 Payment Providers
- **Kaspi Bank**: Интеграция с Kaspi Pay
- **Halyk Bank**: Интеграция с Halyk Pay
- **Alipay**: Китайские платежи
- **WeChat Pay**: Китайские платежи

#### 🎯 CRM Integration
- **Telegram Bot**: Уведомления в Telegram
- **WhatsApp Business**: Интеграция с WhatsApp
- **Email Marketing**: SMTP сервер для рассылок

### 🌐 WebSocket Real-time Events

#### События чатов
```javascript
// Подключение к WebSocket
const socket = io('wss://mebelplace.com.kz', {
  auth: {
    token: 'jwt_token_here'
  }
});

// Отправка сообщения
socket.emit('chat:message', {
  chatId: 'chat_123',
  content: 'Привет! Как дела?',
  type: 'text'
});

// Получение сообщения
socket.on('chat:message', (message) => {
  console.log('Новое сообщение:', message);
});

// Статус "печатает"
socket.emit('chat:typing', {
  chatId: 'chat_123',
  isTyping: true
});
```

#### События уведомлений
```javascript
// Получение уведомления
socket.on('notification', (notification) => {
  console.log('Уведомление:', notification);
  // Показать toast уведомление
  showToast(notification.message);
});

// Получение уведомления о новом лайке
socket.on('video:liked', (data) => {
  console.log('Видео лайкнули:', data);
  // Обновить счетчик лайков
  updateLikesCount(data.videoId, data.likesCount);
});
```

### 🔒 Rate Limiting

#### Лимиты запросов
- **Authentication**: 5 запросов в минуту
- **Video Upload**: 10 загрузок в час
- **API Calls**: 1000 запросов в час
- **SMS**: 3 SMS в минуту
- **Chat Messages**: 100 сообщений в минуту

#### Проверка лимитов
```http
GET /api/v1/ratelimit/status
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "limits": {
      "api": {
        "limit": 1000,
        "remaining": 850,
        "resetTime": "2024-01-15T11:30:00Z"
      },
      "upload": {
        "limit": 10,
        "remaining": 7,
        "resetTime": "2024-01-15T11:30:00Z"
      }
    }
  }
}
```

---

## 🌐 FRONTEND (Next.js 15)

### 🏗️ Архитектура Frontend

**MebelPlace Frontend** - современное веб-приложение на Next.js 15 с:

- **Next.js 15** с App Router
- **TypeScript 5.6** - строгая типизация
- **Tailwind CSS 3.4** - utility-first CSS
- **Glass Design System** - уникальная дизайн-система
- **Framer Motion 11.11** - анимации и переходы
- **Redux Toolkit 2.9** - глобальное состояние
- **React Query 5.59** - кэширование API
- **Socket.io-client** - WebSocket соединения
- **HLS.js** - видео стриминг
- **Simple-peer** - WebRTC
- **Sentry** - мониторинг ошибок
- **PWA** - Progressive Web App

### 📄 Структура страниц (63+ страницы)

#### 🏠 Основные страницы (8)
1. **GlassFeedScreen** - Главная лента видео с infinite scroll, double-tap лайк
2. **GlassSearchScreen** - Поиск контента с autocomplete, фильтрами
3. **GlassProfileScreen** - Профиль пользователя с glass карточками
4. **GlassVideoDetailScreen** - Детальный просмотр видео с HLS плеером
5. **GlassChatScreen** - Чаты и сообщения с WebSocket
6. **GlassRequestsScreen** - Заявки и предложения
7. **GlassUploadScreen** - Загрузка контента с drag&drop
8. **GlassSettingsScreen** - Настройки приложения

#### 🔐 Аутентификация (4)
9. **GlassLoginScreen** - Вход в систему
10. **GlassRegisterScreen** - Регистрация
11. **GlassForgotPasswordScreen** - Восстановление пароля
12. **GlassVerifyEmailScreen** - Подтверждение email

#### 👤 Профиль (6)
13. **GlassEditProfileScreen** - Редактирование профиля
14. **GlassMyVideosScreen** - Мои видео
15. **GlassMyChannelScreen** - Мой канал
16. **GlassMyRequestsScreen** - Мои заявки
17. **GlassMyProposalsScreen** - Мои предложения
18. **GlassAchievementsScreen** - Достижения

#### 💬 Чаты (5)
19. **GlassChatsListScreen** - Список чатов
20. **GlassChatDetailScreen** - Детальный чат
21. **GlassCreateChatScreen** - Создание чата
22. **GlassGroupChatScreen** - Групповой чат
23. **GlassVoiceRoomScreen** - Голосовая комната

### 🎨 Glass UI Компоненты (80+ компонентов)

#### Основные Glass компоненты:
1. **GlassCard** - Базовая glass карточка с backdrop-blur
2. **GlassButton** - Кнопка с glass эффектом, градиентом, ripple анимацией
3. **GlassInput** - Поле ввода с glass эффектом, focus анимацией
4. **GlassModal** - Модальное окно с glass фоном, backdrop blur
5. **GlassNavigation** - Навигация с glass эффектами
6. **GlassSidebar** - Боковая панель с glass стилем
7. **GlassToast** - Уведомления с glass эффектом
8. **GlassForm** - Форма с glass элементами
9. **GlassFeedback** - Элементы обратной связи
10. **GlassTabs** - Вкладки с glass стилем

#### Специализированные Glass компоненты:
21. **GlassVideoCard** - Видео карточка с double-tap лайк, particle burst
22. **GlassChatBubble** - Пузырек сообщения с glass эффектом
23. **GlassSearchBar** - Поисковая строка с glass стилем, autocomplete
24. **GlassFilterPanel** - Панель фильтров с glass эффектом
25. **GlassUserCard** - Карточка пользователя с glass стилем
26. **GlassRequestCard** - Карточка заявки с glass эффектом
27. **GlassNotificationItem** - Элемент уведомления
28. **GlassProgressBar** - Прогресс бар с glass эффектом
29. **GlassVideoPlayer** - Видеоплеер с glass контролами
30. **GlassImageGallery** - Галерея изображений с glass эффектом

### ⚡ Анимации и переходы

#### Основные анимации:
- **Duration Fast**: 150ms - быстрые анимации (hover, focus)
- **Duration Default**: 300ms - стандартные анимации (transitions)
- **Duration Slow**: 500ms - медленные анимации (page transitions)
- **Double-tap Like**: 400ms - анимация лайка с particle burst
- **Skeleton Pulse**: 2000ms - shimmer эффект для loading states
- **Modal Open**: 300ms - открытие модального окна
- **Button Press**: 120ms - мгновенная реакция на нажатие

#### Page Transitions:
- **Fade + Scale**: 300ms, opacity 0→1, scale 0.95→1.0
- **Slide From Right**: 300ms, x: "100%" → x: 0
- **Slide Up**: 300ms, y: "100%" → y: 0
- **Rotation + Fade**: 500ms, rotate: 0→360deg + elasticOut

#### Particle System:
- **Confetti**: 50 частиц, 2 сек, 5 цветов, gravity + wind + bounce
- **Stars**: 30 частиц, 1.5 сек, 3 цвета, rotation + fade
- **Hearts**: 20 частиц, 2 сек, 3 цвета, float + pulse
- **Sparkles**: 40 частиц, 1 сек, 3 цвета, burst + fade

### 🌐 PWA Возможности

- **Service Worker** - кэширование и offline режим
- **Web App Manifest** - установка как приложение
- **Push Notifications** - уведомления
- **Background Sync** - синхронизация при подключении
- **Offline Support** - работа без интернета

---

## 📱 MOBILE APP (Flutter)

### 🏗️ Архитектура Mobile App

**MebelPlace Mobile** - кроссплатформенное приложение на Flutter с:

- **Flutter 3.24+** - кроссплатформенная разработка
- **Dart 3.8+** - современный язык программирования
- **Clean Architecture** - модульная архитектура
- **Riverpod 2.6.1** - state management
- **Material Design 3** + **Glass UI** - дизайн-система
- **SQLite + Drift** - локальное хранилище
- **Firebase** - push уведомления и аналитика
- **Sentry** - мониторинг ошибок

### 📱 Экраны мобильного приложения (79+ экранов)

#### 🏠 Главные экраны (5 основных)
1. **GlassFeedScreenRefactored** - Видео лента (главный экран)
2. **GlassSearchScreen** - Поиск контента
3. **GlassRequestsTab** - Заявки на мебель
4. **GlassChatsListScreen** - Список чатов
5. **GlassProfileScreenRefactored** - Профиль пользователя

#### 🔐 Аутентификация (6 экранов)
6. **glass_login_screen.dart** - Вход в систему
7. **glass_register_screen.dart** - Регистрация
8. **glass_sms_verification_screen.dart** - SMS верификация
9. **glass_verify_phone_screen.dart** - Подтверждение телефона
10. **glass_verify_email_screen.dart** - Подтверждение email
11. **glass_forgot_password_screen.dart** - Восстановление пароля

#### 🎬 Видео (7 экранов)
12. **glass_feed_screen_refactored.dart** - Лента видео
13. **glass_video_player_screen.dart** - Видео плеер
14. **glass_video_detail_screen.dart** - Детали видео
15. **glass_comments_screen.dart** - Комментарии к видео
16. **glass_favorites_screen.dart** - Избранные видео
17. **glass_upload_video_screen.dart** - Загрузка видео
18. **glass_video_feed_tab.dart** - Таб ленты видео

#### 👑 Администрация (15 экранов)
34. **glass_admin_screen.dart** - Главный админ экран
35. **glass_admin_panel_screen.dart** - Панель администратора
36. **glass_all_users_screen.dart** - Все пользователи
37. **glass_banned_users_screen.dart** - Заблокированные пользователи
38. **glass_pending_content_screen.dart** - Ожидающий контент
39. **glass_pending_tickets_screen.dart** - Ожидающие тикеты
40. **glass_reported_content_screen.dart** - Жалобы на контент
41. **glass_all_tickets_screen.dart** - Все тикеты поддержки
42. **glass_ads_list_screen.dart** - Список рекламы
43. **glass_user_analytics_screen.dart** - Аналитика пользователей
44. **glass_video_analytics_screen.dart** - Аналитика видео
45. **glass_order_analytics_screen.dart** - Аналитика заказов
46. **glass_revenue_analytics_screen.dart** - Аналитика доходов
47. **ads_tab.dart** - Таб рекламы
48. **analytics_tab.dart** - Таб аналитики
49. **moderation_tab.dart** - Таб модерации
50. **support_tab.dart** - Таб поддержки

### 🪟 Glass UI Компоненты (20 компонентов)

#### Основные Glass компоненты:
1. **glass_video_card_with_doubletap.dart** - Видео карточка с double-tap лайк
2. **glass_custom_cards.dart** - Кастомные glass карточки с blur эффектами
3. **glass_button.dart** - Кнопка с glass эффектом и градиентом
4. **glass_icon_button_custom.dart** - Кастомная glass кнопка с иконкой
5. **glass_text_field.dart** - Glass поле ввода с размытием
6. **glass_message_bubble.dart** - Glass пузырек сообщения
7. **glass_panel.dart** - Glass панель с backdrop filter
8. **glass_screen_base.dart** - Базовый glass экран
9. **glass_video_card.dart** - Обычная glass видео карточка
10. **glass_ad_video_card.dart** - Рекламная видео карточка

### ⚡ Анимации (оптимизированные)

#### Основные анимации:
- **Duration Fast**: 120ms - быстрые анимации
- **Duration Default**: 240ms - стандартные анимации
- **Duration Slow**: 360ms - медленные анимации
- **Double-tap Like**: 300ms (оптимизированная) - анимация лайка
- **Skeleton Pulse**: 1000ms (оптимизированная) - shimmer эффект
- **Bottom Sheet Open**: 240ms - открытие bottom sheet
- **Hover Effects**: 100ms - hover эффекты
- **Tilt Effects**: 150ms - tilt эффект для карточек

#### Page Transitions:
- **Fade + Scale**: 240ms, fade 0.0→1.0, scale 0.95→1.0
- **Slide From Right**: 240ms, Offset(1.0,0.0)→Offset.zero
- **Slide Up**: 240ms, Offset(0.0,1.0)→Offset.zero
- **Rotation + Fade**: 360ms, rotation 0.0→1.0 turns + elasticOut

#### Particle System:
- **Confetti**: 50 частиц (high) / 30 (medium) / 20 (low), 2 сек, 5 цветов
- **Stars**: 30 частиц (high) / 20 (medium) / 15 (low), 1.5 сек, 3 цвета
- **Hearts**: 20 частиц (high) / 15 (medium) / 10 (low), 2 сек, 3 цвета
- **Wood Chips**: 30 частиц, 1.5 сек, 4 коричневых оттенка, мебельная тематика

### 🌐 Offline возможности

- **Кэширование видео и изображений**
- **Offline queue для действий**
- **Автоматическая синхронизация**
- **Conflict resolution**
- **Network connectivity monitoring**

### ♿ Доступность (Accessibility)

- **Экранные читалки**: семантические метки для TalkBack/VoiceOver
- **Высокий контраст**: backgroundAlpha 0.5, полная непрозрачность текста
- **Масштабирование текста**: поддержка системного Dynamic Type/Text Scaling
- **Цветовая слепота**: фильтры для дальтоников
- **Тактильная обратная связь**: вибрация и звуки для действий
- **Увеличенные touch targets**: минимум 44px для всех интерактивных элементов

---

## 🎨 GLASS DESIGN SYSTEM

### 📸 Примеры UI скриншотов

#### 🏠 Главная страница
```
┌─────────────────────────────────────────────────────────────┐
│  🏠 MebelPlace                    🔍 [Поиск]    👤 [Профиль] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🎬 Видео лента                                     │   │
│  │                                                     │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  [📹 Видео превью]                          │   │   │
│  │  │  Красивый диван в гостиной                  │   │   │
│  │  │  👤 Иван Петров    ❤️ 42    💬 8    📤      │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                     │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  [📹 Видео превью]                          │   │   │
│  │  │  Современный стол для офиса                 │   │   │
│  │  │  👤 Мария Сидорова  ❤️ 28    💬 5    📤    │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [🏠] [🎬] [💬] [🛒] [👤]  ← Нижняя навигация              │
└─────────────────────────────────────────────────────────────┘
```

#### 💬 Чат интерфейс
```
┌─────────────────────────────────────────────────────────────┐
│  ← [Назад]  💬 Чат с Иваном Петровым        📹 [Видеозвонок] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  👤 Иван Петров                                     │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  Привет! Как дела с заказом?                │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │  📅 14:30                                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📅 14:32                                          │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  Все отлично! Завтра привезу                │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │  👤 Вы                                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [💬 Введите сообщение...]  [📎] [📷] [🎤] [➤]    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

#### 🛒 Заявка на мебель
```
┌─────────────────────────────────────────────────────────────┐
│  ← [Назад]  🛒 Создать заявку                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📝 Новая заявка                                   │   │
│  │                                                     │   │
│  │  Название: [Диван для гостиной              ]      │   │
│  │                                                     │   │
│  │  Категория: [Мебель для гостиной ▼]                │   │
│  │                                                     │   │
│  │  Описание:                                          │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  Нужен угловой диван на 3-4 места,         │   │   │
│  │  │  в серых тонах, с подушками...              │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                     │   │
│  │  Бюджет: [50000] - [100000] тенге                  │   │
│  │                                                     │   │
│  │  Срок: [2 недели ▼]                                │   │
│  │                                                     │   │
│  │  📷 [Добавить фото]                                │   │
│  │                                                     │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  [📤 Опубликовать заявку]                   │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 🎨 Цветовая палитра

#### Основные цвета:
- **Primary Orange**: #FF6600 - основной цвет (кнопки, акценты, брендинг)
- **Orange Light**: #FF8533 - светлый оттенок (hover состояния, градиенты)
- **Orange Dark**: #FF4500 - темный оттенок (активные состояния, тени)
- **Orange Gradient**: linear-gradient(135deg, #FF6600, #FF8533)

#### Акцентные цвета:
- **Success Green**: #22C55E - успешные действия
- **Error Red**: #EF4444 - ошибки
- **Warning Yellow**: #F59E0B - предупреждения
- **Info Blue**: #3B82F6 - информационные сообщения

#### Glass эффекты:
- **Glass Primary**: rgba(255, 255, 255, 0.1) - основной glass
- **Glass Secondary**: rgba(255, 255, 255, 0.05) - вторичный glass
- **Glass Accent**: rgba(255, 102, 0, 0.2) - акцентный glass
- **Glass Dark**: rgba(0, 0, 0, 0.1) - темный glass
- **Glass Border**: rgba(255, 255, 255, 0.2) - границы glass элементов

### 📝 Типографика

- **Font Family**: Inter - основной шрифт
- **Font Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

#### Масштабируемые размеры шрифтов:
- **xs**: clamp(0.75rem, 2vw, 0.875rem) - мелкий текст
- **sm**: clamp(0.875rem, 2.2vw, 1rem) - вторичный текст
- **base**: clamp(1rem, 2.5vw, 1.125rem) - основной текст
- **lg**: clamp(1.125rem, 2.8vw, 1.25rem) - заголовки секций
- **xl**: clamp(1.25rem, 3vw, 1.5rem) - подзаголовки
- **2xl**: clamp(1.5rem, 3.5vw, 1.875rem) - заголовки страниц
- **3xl**: clamp(1.875rem, 4vw, 2.25rem) - большие заголовки
- **4xl**: clamp(2.25rem, 5vw, 3rem) - главные заголовки
- **5xl**: clamp(3rem, 6vw, 4rem) - экстра большие заголовки

### 📏 Spacing система

- **Grid**: 4px базовая единица
- **Scale**: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96px
- **Padding**: 8px (компактный), 16px (стандартный), 24px (просторный)
- **Margin**: 8px (между элементами), 16px (между секциями), 32px (между блоками)
- **Gap**: 8px (grid), 12px (flex), 16px (списки), 24px (карточки)

### 🔲 Border Radius

- **None**: 0px - без скругления
- **XS**: 0.125rem (2px) - минимальное скругление
- **Small**: 0.25rem (4px) - мелкие элементы
- **Medium**: 0.375rem (6px) - промежуточное значение
- **Base**: 0.5rem (8px) - стандартные элементы
- **Large**: 0.75rem (12px) - крупные элементы
- **XL**: 1rem (16px) - большие элементы
- **2XL**: 1.5rem (24px) - очень большие элементы
- **3XL**: 2rem (32px) - экстра большие элементы
- **Full**: 9999px - полное скругление

### 🌫️ Glass эффекты

#### Backdrop Blur:
- **XS**: 2px - минимальный blur
- **SM**: 4px - слабый blur
- **MD**: 8px - средний blur
- **LG**: 12px - сильный blur
- **XL**: 16px - очень сильный blur
- **2XL**: 24px - максимальный blur
- **3XL**: 32px - экстремальный blur

#### Динамическая прозрачность:
- **Heavy Content**: rgba(255, 255, 255, 0.08) - для карточек с большим количеством текста
- **Light Content**: rgba(255, 255, 255, 0.12) - для легких элементов
- **Interactive**: rgba(255, 255, 255, 0.15) - для интерактивных элементов
- **Overlay**: rgba(255, 255, 255, 0.05) - для фоновых элементов

### 🎭 Компонентные состояния

#### Button States:
- **Default**: Glass фон, прозрачность 0.1, hover scale 1.02
- **Hover**: Увеличенная прозрачность 0.15, glow эффект
- **Active**: Scale 0.95, ripple анимация, pressed состояние
- **Focus**: Border glow, keyboard navigation
- **Disabled**: Прозрачность 0.05, cursor not-allowed
- **Loading**: Spinner, disabled состояние, progress анимация

#### Input States:
- **Default**: Glass фон, прозрачность 0.1, placeholder стиль
- **Focus**: Border glow, backdrop-blur увеличение
- **Filled**: Контент видимый, validation стиль
- **Error**: Красная граница, shake анимация, error message
- **Success**: Зеленая граница, checkmark анимация
- **Disabled**: Прозрачность 0.05, cursor not-allowed

#### Card States:
- **Default**: Glass фон, прозрачность 0.1, subtle shadow
- **Hover**: Scale 1.03, увеличенная тень, glow эффект
- **Selected**: Акцентная граница, orange glow
- **Loading**: Skeleton анимация, shimmer эффект
- **Error**: Красная граница, shake анимация
- **Success**: Зеленая граница, pulse анимация

---

## 🔄 ПОЛЬЗОВАТЕЛЬСКИЕ СЦЕНАРИИ

### 📋 Обзор всех сценариев (25 сценариев)

| № | Сценарий | Целевая аудитория | Основная функция |
|---|----------|-------------------|------------------|
| 1 | Просмотр видео ленты | Все пользователи | Потребление контента |
| 2 | Общение в чатах | Все пользователи | Коммуникация |
| 3 | Создание заявки на мебель | Покупатели | Поиск мебели |
| 4 | Создание предложения | Мастера | Предложение услуг |
| 5 | AR/3D конфигуратор | Дизайнеры, покупатели | Визуализация |
| 6 | Админ-панель управления | Администраторы | Управление платформой |
| 7 | Техническая поддержка | Поддержка | Помощь пользователям |
| 8 | Создание и загрузка видео | Мастера, дизайнеры | Создание контента |
| 9 | Покупка мебели через заявки | Покупатели | Совершение покупок |
| 10 | Работа мастера с заявками | Мастера | Поиск клиентов |
| 11 | Геймификация и достижения | Все пользователи | Мотивация |
| 12 | Мобильное приложение | Мобильные пользователи | Мобильный опыт |
| 13 | Платежи и финансы | Все пользователи | Финансовые операции |
| 14 | Поиск и рекомендации | Все пользователи | Поиск контента |
| 15 | Маркетинг и продвижение | Мастера, бизнес | Продвижение |
| 16 | Домашний дизайн и планирование | Дизайнеры, покупатели | Планирование интерьера |
| 17 | Backend API разработка | Backend разработчики | API разработка |
| 18 | Frontend Next.js разработка | Frontend разработчики | Web разработка |
| 19 | Flutter Mobile разработка | Mobile разработчики | Mobile разработка |
| 20 | DevOps и развертывание | DevOps инженеры | Инфраструктура |
| 21 | Тестирование и QA | QA инженеры | Качество |
| 22 | Мониторинг и аналитика | Аналитики, DevOps | Мониторинг |
| 23 | Безопасность и аудит | Security инженеры | Безопасность |
| 24 | Интеграции и API | Интеграторы | Внешние системы |
| 25 | Масштабирование и производительность | Архитекторы | Производительность |

---

### 🎬 Сценарий 1: Просмотр видео ленты

**Для самого чайника - пошаговое объяснение:**

1. **Открытие приложения**
   - Пользователь открывает MebelPlace (веб-сайт или мобильное приложение)
   - Видит красивую заставку с glass эффектами
   - Автоматически попадает на главную ленту видео

2. **Просмотр видео**
   - В ленте показываются видео с мебелью в glass карточках
   - Каждое видео имеет thumbnail (миниатюру)
   - При нажатии на видео - оно начинает воспроизводиться
   - Видео автоматически адаптируется под качество интернета (360p, 720p, 1080p)

3. **Взаимодействие с видео**
   - **Лайк**: Двойное нажатие на видео → красивая анимация с частицами сердечек
   - **Комментарий**: Нажатие на иконку комментария → открывается список комментариев
   - **Поделиться**: Нажатие на иконку поделиться → выбор способа поделиться
   - **Подписаться**: Нажатие на аватар автора → переход к его каналу

4. **Навигация**
   - **Свайп вверх** → следующее видео
   - **Свайп вниз** → предыдущее видео
   - **Свайп влево** → пропустить видео
   - **Свайп вправо** → лайкнуть видео

### 💬 Сценарий 2: Общение в чатах

**Для самого чайника - пошаговое объяснение:**

1. **Вход в чаты**
   - Нажатие на иконку чата в нижней навигации
   - Открывается список всех чатов пользователя
   - Каждый чат показан в glass карточке с последним сообщением

2. **Создание нового чата**
   - Нажатие на кнопку "+" → открывается форма создания чата
   - Поиск пользователя по имени или номеру телефона
   - Выбор пользователя → создание чата

3. **Отправка сообщений**
   - **Текстовое сообщение**: Ввод текста в поле внизу → нажатие "Отправить"
   - **Голосовое сообщение**: Долгое нажатие на микрофон → запись → отпускание
   - **Фото/Видео**: Нажатие на иконку камеры → выбор файла → отправка
   - **Стикеры**: Нажатие на иконку смайлика → выбор стикера

4. **Видеозвонки**
   - Нажатие на иконку видеокамеры в чате
   - Запрос на звонок отправляется собеседнику
   - При принятии → начинается видеозвонок через WebRTC
   - Возможность включить/выключить камеру и микрофон

### 🛒 Сценарий 3: Создание заявки на мебель

**Для самого чайника - пошаговое объяснение:**

1. **Создание заявки**
   - Переход в раздел "Заявки" → нажатие "Создать заявку"
   - Заполнение формы:
     - **Тип мебели**: Выбор из списка (диван, стол, шкаф и т.д.)
     - **Описание**: Подробное описание того, что нужно
     - **Бюджет**: Указание примерного бюджета
     - **Фото**: Загрузка фото существующей мебели или примеров
     - **Локация**: Указание города/района

2. **Публикация заявки**
   - Нажатие "Опубликовать" → заявка появляется в общем списке
   - Другие пользователи (мастера, продавцы) видят заявку
   - Они могут оставлять предложения

3. **Получение предложений**
   - В разделе "Мои заявки" → выбор заявки
   - Просмотр всех предложений от мастеров
   - Каждое предложение содержит:
     - Цену
     - Сроки выполнения
     - Описание работы
     - Фото портфолио

4. **Выбор мастера**
   - Просмотр предложений → выбор понравившегося
   - Нажатие "Принять предложение"
   - Автоматическое создание чата с мастером
   - Обсуждение деталей и заключение сделки

### 🎯 Сценарий 4: Геймификация и достижения

**Для самого чайника - пошаговое объяснение:**

1. **Получение достижений**
   - При выполнении определенных действий → автоматическое получение достижений
   - **"Первый лайк"** - за первый лайк видео
   - **"Активный комментатор"** - за 10 комментариев
   - **"Популярный автор"** - за 100 лайков на своих видео
   - **"Социальный"** - за создание 5 чатов

2. **Просмотр достижений**
   - Переход в профиль → раздел "Достижения"
   - Просмотр всех полученных и доступных достижений
   - Каждое достижение имеет:
     - Красивую иконку
     - Описание
     - Прогресс выполнения
     - Награду (очки, бейджи)

3. **Рейтинговая система**
   - В разделе "Рейтинг" → просмотр таблицы лидеров
   - Рейтинг формируется по:
     - Количеству лайков
     - Активности в чатах
     - Качеству заявок
     - Отзывам других пользователей

4. **Награды и бонусы**
   - За достижения → получение очков
   - Очки можно тратить на:
     - Продвижение заявок
     - Премиум функции
     - Специальные бейджи
     - Приоритетную поддержку

### 🎨 Сценарий 5: AR/3D конфигуратор мебели

**Для самого чайника - пошаговое объяснение:**

1. **Запуск конфигуратора**
   - В профиле мастера → нажатие "3D конфигуратор"
   - Открывается AR/3D интерфейс
   - Выбор типа мебели (диван, стол, шкаф)

2. **Настройка параметров**
   - **Размеры**: Изменение длины, ширины, высоты
   - **Материалы**: Выбор ткани, дерева, металла
   - **Цвета**: Подбор цветовой схемы
   - **Дополнительные элементы**: Полки, ящики, подсветка

3. **3D просмотр**
   - Вращение модели мышью/пальцем
   - Приближение/отдаление
   - Просмотр с разных углов
   - Реалистичные тени и освещение

4. **AR примерка**
   - Нажатие "AR примерка" → включение камеры
   - Наведение на место, где будет стоять мебель
   - Автоматическое размещение 3D модели в реальном пространстве
   - Возможность "походить" вокруг и посмотреть, как будет выглядеть

5. **Сохранение и заказ**
   - Сохранение конфигурации
   - Расчет стоимости
   - Создание заявки на изготовление
   - Отправка мастерам для получения предложений

### 👑 Сценарий 6: Админ-панель управления

**Для администраторов - пошаговое объяснение:**

1. **Вход в админ-панель**
   - Переход на `/admin` с правами администратора
   - Двухфакторная аутентификация
   - Доступ к расширенным функциям управления

2. **Управление пользователями**
   - **Просмотр всех пользователей**: Список с фильтрами по ролям, статусу, дате регистрации
   - **Модерация контента**: Проверка и одобрение/отклонение видео
   - **Блокировка пользователей**: Временная или постоянная блокировка за нарушения
   - **Статистика активности**: Просмотр активности пользователей

3. **Управление контентом**
   - **Модерация видео**: Проверка загруженных видео на соответствие правилам
   - **Управление категориями**: Добавление/редактирование категорий мебели
   - **Популярный контент**: Выделение трендовых видео и мастеров
   - **Рекомендации**: Настройка алгоритмов рекомендаций

4. **Аналитика и отчеты**
   - **Дашборд метрик**: DAU, MAU, конверсии, доходы
   - **Отчеты по пользователям**: Демография, поведение, retention
   - **Отчеты по контенту**: Популярные видео, категории, мастера
   - **Финансовые отчеты**: Доходы, комиссии, платежи

5. **Системные настройки**
   - **Конфигурация API**: Настройка rate limits, endpoints
   - **Управление уведомлениями**: Настройка push, email, SMS
   - **Интеграции**: Настройка платежных систем, SMS провайдеров
   - **Безопасность**: Мониторинг подозрительной активности

### 🔧 Сценарий 7: Техническая поддержка

**Для поддержки пользователей:**

1. **Обработка обращений**
   - **Тикеты поддержки**: Система заявок с приоритетами
   - **Чат поддержки**: Прямое общение с пользователями
   - **FAQ система**: База знаний с поиском
   - **Видео-инструкции**: Гайды по использованию платформы

2. **Решение проблем**
   - **Технические проблемы**: Помощь с загрузкой видео, проблемами со звуком
   - **Проблемы с оплатой**: Возвраты, неоплаченные заказы
   - **Споры между пользователями**: Модерация конфликтов
   - **Восстановление аккаунтов**: Помощь при потере доступа

3. **Обратная связь**
   - **Сбор отзывов**: Анкеты удовлетворенности
   - **Предложения улучшений**: Идеи от пользователей
   - **Бета-тестирование**: Привлечение активных пользователей
   - **Обновления**: Уведомления о новых функциях

### 🎨 Сценарий 8: Создание и загрузка видео

**Для мастеров и дизайнеров:**

1. **Подготовка контента**
   - **Планирование видео**: Определение темы, ракурсов, освещения
   - **Подготовка мебели**: Расстановка, декорирование, освещение
   - **Техническая подготовка**: Настройка камеры, звука, стабилизации

2. **Съемка видео**
   - **Основные ракурсы**: Общий план, детали, функциональность
   - **Демонстрация**: Показ использования, трансформации, хранения
   - **Качество**: Стабильная съемка, хорошее освещение, четкий звук

3. **Обработка и загрузка**
   - **Монтаж**: Обрезка, добавление текста, переходы
   - **Оптимизация**: Сжатие для быстрой загрузки
   - **Загрузка**: Выбор категории, добавление описания, тегов
   - **Публикация**: Модерация и публикация в ленте

### 🛍️ Сценарий 9: Покупка мебели через заявки

**Для покупателей:**

1. **Поиск и выбор**
   - **Просмотр заявок**: Фильтрация по категориям, бюджету, срокам
   - **Изучение предложений**: Чтение описаний, просмотр фото
   - **Сравнение**: Анализ цен, сроков, отзывов мастеров

2. **Связь с мастером**
   - **Начало чата**: Отправка сообщения мастеру
   - **Обсуждение деталей**: Уточнение размеров, материалов, сроков
   - **Видеозвонок**: Прямое общение для уточнения деталей

3. **Оформление заказа**
   - **Согласование условий**: Цена, сроки, способ доставки
   - **Оплата**: Выбор способа оплаты, подтверждение
   - **Отслеживание**: Мониторинг процесса изготовления

### 🏪 Сценарий 10: Работа мастера с заявками

**Для мастеров мебели:**

1. **Поиск заявок**
   - **Фильтрация**: По категориям, бюджету, местоположению
   - **Анализ требований**: Изучение описаний, фото, сроков
   - **Оценка сложности**: Расчет времени и материалов

2. **Создание предложений**
   - **Техническое предложение**: Описание решения, материалов
   - **Ценообразование**: Расчет стоимости с учетом материалов и работы
   - **Планирование**: Определение сроков изготовления

3. **Взаимодействие с клиентом**
   - **Презентация**: Отправка предложения с фото/видео примеров
   - **Переговоры**: Обсуждение изменений, корректировка цены
   - **Заключение сделки**: Подтверждение заказа, получение предоплаты

### 🎮 Сценарий 11: Геймификация и достижения

**Для всех пользователей:**

1. **Получение достижений**
   - **Первые шаги**: Регистрация, первое видео, первый заказ
   - **Активность**: Количество лайков, комментариев, подписчиков
   - **Экспертиза**: Специализация в определенных категориях мебели

2. **Система уровней**
   - **Новичок**: 0-100 очков опыта
   - **Любитель**: 100-500 очков
   - **Профи**: 500-1000 очков
   - **Эксперт**: 1000+ очков

3. **Бонусы и привилегии**
   - **Приоритет в ленте**: Видео экспертов показываются первыми
   - **Расширенные функции**: Больше места для хранения, приоритетная поддержка
   - **Эксклюзивный контент**: Доступ к мастер-классам, новым функциям

### 📱 Сценарий 12: Мобильное приложение

**Для мобильных пользователей:**

1. **Установка и настройка**
   - **Скачивание**: Из App Store или Google Play
   - **Регистрация**: Через телефон или социальные сети
   - **Настройка уведомлений**: Push, email, SMS

2. **Основные функции**
   - **Просмотр ленты**: Swipe-навигация по видео
   - **Создание контента**: Запись видео, фото, голосовых сообщений
   - **Офлайн режим**: Просмотр сохраненного контента без интернета

3. **Мобильные особенности**
   - **Камера**: Запись видео с мебелью, AR примерка
   - **Геолокация**: Поиск мастеров рядом, навигация
   - **Push уведомления**: Мгновенные уведомления о сообщениях, заказах

### 💳 Сценарий 13: Платежи и финансы

**Для покупателей и мастеров:**

1. **Настройка платежей**
   - **Привязка карт**: Kaspi, Halyk Bank, международные карты
   - **Электронные кошельки**: Qiwi, Яндекс.Деньги
   - **Криптовалюты**: Bitcoin, Ethereum (планируется)

2. **Процесс оплаты**
   - **Безопасность**: 3D Secure, двухфакторная аутентификация
   - **Подтверждение**: SMS-код, push-уведомление
   - **Чеки**: Автоматическая отправка электронных чеков

3. **Финансовая отчетность**
   - **История платежей**: Детальная история всех транзакций
   - **Налоговая отчетность**: Автоматическое формирование документов
   - **Аналитика**: Статистика доходов и расходов

### 🔍 Сценарий 14: Поиск и рекомендации

**Для всех пользователей:**

1. **Умный поиск**
   - **Текстовый поиск**: По названиям, описаниям, тегам
   - **Поиск по изображению**: Загрузка фото для поиска похожей мебели
   - **Голосовой поиск**: Поиск через голосовые команды

2. **Персонализированные рекомендации**
   - **Алгоритм**: На основе просмотров, лайков, покупок
   - **Категории**: Рекомендации по стилю, цвету, размеру
   - **Мастера**: Предложения мастеров в вашем регионе

3. **Фильтрация и сортировка**
   - **Множественные фильтры**: Цена, размер, материал, цвет
   - **Сортировка**: По популярности, цене, дате, рейтингу
   - **Сохранение поисков**: Избранные поисковые запросы

### 🎯 Сценарий 15: Маркетинг и продвижение

**Для мастеров и бизнеса:**

1. **Создание бренда**
   - **Профиль мастера**: Фото, описание, портфолио
   - **Стиль контента**: Уникальный подход к съемке, подаче
   - **Репутация**: Отзывы клиентов, рейтинги, сертификаты

2. **Продвижение контента**
   - **Хештеги**: Использование популярных и нишевых тегов
   - **Время публикации**: Оптимальное время для максимального охвата
   - **Коллаборации**: Совместные проекты с другими мастерами

3. **Монетизация**
   - **Прямые заказы**: Через заявки и чаты
   - **Консультации**: Платные консультации по дизайну
   - **Онлайн-курсы**: Обучение изготовлению мебели

### 🏠 Сценарий 16: Домашний дизайн и планирование

**Для дизайнеров и покупателей:**

1. **Планирование пространства**
   - **Замеры**: Точные размеры комнаты, дверных проемов
   - **3D планировщик**: Визуализация мебели в пространстве
   - **Стилистика**: Подбор мебели под общий стиль интерьера

2. **Виртуальная примерка**
   - **AR технологии**: Размещение мебели в реальном пространстве
   - **Масштабирование**: Проверка пропорций и размеров
   - **Цветовые решения**: Подбор цветов под интерьер

3. **Проектирование**
   - **Планы расстановки**: Оптимальное размещение мебели
   - **Световое планирование**: Учет освещения и теней
   - **Функциональность**: Обеспечение удобства использования

### ⚙️ Сценарий 17: Backend API разработка

**Для Backend разработчиков (Go):**

1. **Настройка окружения**
   - **Установка Go**: Версия 1.21+, настройка GOPATH
   - **IDE**: VS Code с Go extension, GoLand
   - **Зависимости**: Gin, GORM, Redis client, JWT

2. **Создание API эндпоинта**
   - **Структура проекта**: Clean Architecture, слои (handler, service, repository)
   - **Роутинг**: Gin router с middleware (auth, logging, CORS)
   - **Валидация**: Структуры с тегами, custom validators
   - **Документация**: Swagger/OpenAPI генерация

3. **Интеграция с БД**
   - **Миграции**: GORM AutoMigrate, custom migrations
   - **Запросы**: CRUD операции, сложные JOIN'ы
   - **Транзакции**: Rollback при ошибках, изоляция
   - **Кэширование**: Redis для часто запрашиваемых данных

### 🌐 Сценарий 18: Frontend Next.js разработка

**Для Frontend разработчиков (React/Next.js):**

1. **Настройка проекта**
   - **Next.js 15**: App Router, Server Components
   - **TypeScript**: Строгая типизация, интерфейсы
   - **Tailwind CSS**: Utility-first стилизация
   - **State Management**: Redux Toolkit, React Query

2. **Создание компонента**
   - **Glass UI**: Создание переиспользуемых компонентов
   - **Анимации**: Framer Motion для transitions
   - **Responsive**: Mobile-first подход
   - **Accessibility**: ARIA атрибуты, keyboard navigation

3. **Интеграция с API**
   - **React Query**: Кэширование, синхронизация
   - **WebSocket**: Real-time обновления
   - **Error Handling**: Try-catch, error boundaries
   - **Loading States**: Skeleton loaders, spinners

### 📱 Сценарий 19: Flutter Mobile разработка

**Для Mobile разработчиков (Flutter/Dart):**

1. **Настройка Flutter**
   - **Flutter SDK**: Версия 3.24+, настройка PATH
   - **IDE**: VS Code с Flutter extension, Android Studio
   - **Эмуляторы**: Android Studio AVD, iOS Simulator

2. **Создание экрана**
   - **State Management**: Riverpod для управления состоянием
   - **UI Components**: Material Design 3 + Glass UI
   - **Navigation**: GoRouter для навигации
   - **Responsive**: Адаптация под разные экраны

3. **Интеграция с Backend**
   - **HTTP Client**: Dio для API запросов
   - **WebSocket**: Real-time коммуникация
   - **Local Storage**: Drift для SQLite, Hive для кэша
   - **Push Notifications**: Firebase Messaging

### 🚀 Сценарий 20: DevOps и развертывание

**Для DevOps инженеров:**

1. **Настройка инфраструктуры**
   - **Docker**: Контейнеризация всех сервисов
   - **Docker Compose**: Orchestration для development
   - **Kubernetes**: Production deployment (планируется)
   - **Nginx**: Reverse proxy, load balancing

2. **CI/CD Pipeline**
   - **GitHub Actions**: Автоматические тесты, сборка, деплой
   - **Testing**: Unit, integration, E2E тесты
   - **Security**: SAST, dependency scanning
   - **Monitoring**: Health checks, rollback при ошибках

3. **Production Deployment**
   - **Environment**: Staging, production environments
   - **Secrets**: Управление секретами через Vault
   - **Backup**: Автоматические бэкапы БД
   - **Scaling**: Horizontal scaling, auto-scaling

### 🧪 Сценарий 21: Тестирование и QA

**Для QA инженеров:**

1. **Unit Testing**
   - **Backend**: Go testing package, testify
   - **Frontend**: Jest, React Testing Library
   - **Mobile**: Flutter test, integration_test
   - **Coverage**: Минимум 80% покрытие кода

2. **Integration Testing**
   - **API Testing**: Postman, Newman для автоматизации
   - **Database Testing**: Тестовые БД, fixtures
   - **WebSocket Testing**: Тестирование real-time функций
   - **End-to-End**: Playwright для web, Flutter integration tests

3. **Performance Testing**
   - **Load Testing**: Apache JMeter, k6
   - **Stress Testing**: Максимальная нагрузка
   - **Memory Testing**: Профилирование памяти
   - **Mobile Testing**: Device testing, battery usage

### 🎯 Сценарий 21.1: Реальное пользовательское тестирование

**Условия тестирования как реальный пользователь:**

#### 🌐 Web Application Testing (https://mebelplace.com.kz)

**Тест-кейс 1: Регистрация нового пользователя**
```
1. Открыть https://mebelplace.com.kz в браузере
2. Нажать кнопку "Регистрация" (НЕ через консоль)
3. Заполнить форму:
   - Имя: "Тест Пользователь"
   - Email: "test.user@example.com"
   - Телефон: "+7 777 123 45 67"
   - Пароль: "TestPassword123!"
4. Нажать "Зарегистрироваться"
5. Проверить SMS код на телефоне
6. Ввести код из SMS
7. Ожидаемый результат: Успешная регистрация, переход в приложение
```

**Тест-кейс 2: Просмотр видео ленты**
```
1. Войти в аккаунт на https://mebelplace.com.kz
2. На главной странице найти видео ленту
3. Прокрутить вниз (скролл мышью/колесиком)
4. Нажать на любое видео для воспроизведения
5. Проверить:
   - Видео загружается и воспроизводится
   - Есть кнопки лайка, комментариев, поделиться
   - Автоматическое переключение качества
6. Двойной клик на видео для лайка
7. Ожидаемый результат: Анимация лайка, счетчик увеличился
```

**Тест-кейс 3: Создание заявки на мебель**
```
1. Нажать кнопку "Создать заявку" в навигации
2. Заполнить форму заявки:
   - Название: "Диван для гостиной"
   - Категория: "Мебель для гостиной"
   - Описание: "Нужен угловой диван на 3-4 места"
   - Бюджет: от 100000 до 200000 тенге
   - Срок: "2 недели"
3. Загрузить фото (нажать "Добавить фото")
4. Нажать "Опубликовать заявку"
5. Ожидаемый результат: Заявка создана, появилась в списке
```

#### 📱 Mobile Application Testing

**Тест-кейс 4: Установка и первый запуск**
```
1. Скачать приложение из Google Play Store / App Store
2. Установить приложение на устройство
3. Запустить приложение (НЕ через IDE)
4. Разрешить необходимые разрешения:
   - Камера
   - Микрофон
   - Геолокация
   - Уведомления
5. Пройти онбординг (если есть)
6. Ожидаемый результат: Приложение запустилось, показан главный экран
```

**Тест-кейс 5: Запись и загрузка видео**
```
1. В приложении нажать кнопку "+" для создания контента
2. Выбрать "Записать видео"
3. Разрешить доступ к камере
4. Записать 30-секундное видео с мебелью
5. Добавить описание: "Мой новый диван"
6. Выбрать категорию: "Мебель для гостиной"
7. Нажать "Опубликовать"
8. Ожидаемый результат: Видео загружается, появляется в ленте
```

**Тест-кейс 6: Чат и видеозвонок**
```
1. Найти другого пользователя в приложении
2. Нажать "Написать сообщение"
3. Отправить текстовое сообщение: "Привет!"
4. Нажать кнопку видеозвонка
5. Разрешить доступ к камере и микрофону
6. Проверить качество видео и звука
7. Завершить звонок
8. Ожидаемый результат: Сообщение отправлено, видеозвонок работает
```

#### 💳 Платежное тестирование

**Тест-кейс 7: Оплата заказа**
```
1. Создать заявку на мебель
2. Получить предложение от мастера
3. Принять предложение
4. Нажать "Оплатить"
5. Выбрать способ оплаты: "Kaspi Bank"
6. Ввести тестовые данные карты:
   - Номер: 5169 4901 2345 6789
   - Срок: 12/25
   - CVV: 123
7. Подтвердить оплату
8. Ожидаемый результат: Платеж прошел, статус "Оплачено"
```

#### 🔍 Поиск и рекомендации

**Тест-кейс 8: Поиск по изображению**
```
1. Нажать на иконку поиска
2. Выбрать "Поиск по фото"
3. Загрузить фото дивана из галереи
4. Дождаться обработки изображения
5. Просмотреть найденные похожие товары
6. Ожидаемый результат: Показаны релевантные результаты
```

### 🏢 Бизнес-тестирование

#### 📊 Аналитика и отчеты

**Тест-кейс 9: Просмотр статистики мастера**
```
1. Войти как мастер мебели
2. Перейти в раздел "Аналитика"
3. Выбрать период: "Последний месяц"
4. Проверить метрики:
   - Количество просмотров видео
   - Количество заявок
   - Конверсия в заказы
   - Доходы
5. Ожидаемый результат: Корректные данные отображаются
```

**Тест-кейс 10: Модерация контента (Админ)**
```
1. Войти как администратор
2. Перейти в админ-панель
3. Открыть раздел "Модерация"
4. Найти видео на модерации
5. Просмотреть видео полностью
6. Принять решение: "Одобрить" или "Отклонить"
7. Добавить комментарий модератора
8. Ожидаемый результат: Статус видео изменился
```

#### 🔔 Уведомления

**Тест-кейс 11: Push уведомления**
```
1. Включить уведомления в настройках приложения
2. Попросить другого пользователя отправить сообщение
3. Свернуть приложение
4. Ожидать push уведомление
5. Нажать на уведомление
6. Ожидаемый результат: Приложение открылось на нужном экране
```

**Тест-кейс 12: Email уведомления**
```
1. В настройках включить email уведомления
2. Создать заявку на мебель
3. Получить предложение от мастера
4. Проверить email почту
5. Ожидаемый результат: Пришло уведомление о новом предложении
```

### 🌍 Кроссплатформенное тестирование

#### 📱 Мультиплатформенность

**Тест-кейс 13: Синхронизация между устройствами**
```
1. Войти в аккаунт на веб-версии
2. Создать заявку на мебель
3. Открыть мобильное приложение
4. Проверить, что заявка появилась в мобильном приложении
5. Ответить на сообщение в мобильном приложении
6. Проверить на веб-версии, что сообщение синхронизировалось
7. Ожидаемый результат: Данные синхронизируются между платформами
```

#### 🌐 Многоязычность

**Тест-кейс 14: Переключение языков**
```
1. Открыть настройки приложения
2. Найти раздел "Язык"
3. Переключить на казахский язык
4. Проверить, что интерфейс переведен
5. Переключить на английский язык
6. Проверить корректность перевода
7. Ожидаемый результат: Все элементы интерфейса переведены
```

### 📋 Чек-лист для тестирования

#### ✅ Критические функции
- [ ] Регистрация и авторизация
- [ ] Просмотр видео ленты
- [ ] Создание заявок
- [ ] Отправка сообщений
- [ ] Видеозвонки
- [ ] Загрузка видео
- [ ] Оплата заказов
- [ ] Push уведомления

#### ✅ Производительность
- [ ] Время загрузки страниц < 3 секунд
- [ ] Видео начинает воспроизводиться < 2 секунд
- [ ] Приложение не крашится при интенсивном использовании
- [ ] Батарея не разряжается быстро

#### ✅ Безопасность
- [ ] Данные передаются по HTTPS
- [ ] Пароли не отображаются в логах
- [ ] Нет утечек персональных данных
- [ ] Защита от SQL инъекций

#### ✅ Удобство использования
- [ ] Интуитивная навигация
- [ ] Понятные иконки и кнопки
- [ ] Поддержка жестов (swipe, pinch)
- [ ] Адаптивность под разные экраны

### 🏢 Сценарий 21.2: Бизнес-тестирование реальными пользователями

**Условия тестирования как реальный бизнес:**

#### 👥 Тестирование с реальными пользователями

**Тест-кейс 15: Фокус-группа покупателей**
```
Участники: 10 реальных покупателей мебели
Условия: Тестирование в реальной среде (дома/офисе)
Время: 2 часа на каждого участника

1. Дать участнику доступ к https://mebelplace.com.kz
2. Попросить найти диван для гостиной
3. Создать заявку с реальными требованиями
4. Найти мастера и связаться с ним
5. Провести видеозвонок с мастером
6. Оценить удобство процесса
7. Собрать обратную связь

Критерии оценки:
- Время выполнения задач
- Количество ошибок
- Удовлетворенность процессом
- Готовность использовать платформу
```

**Тест-кейс 16: Тестирование с реальными мастерами**
```
Участники: 5 реальных мастеров мебели
Условия: Рабочая среда мастера
Время: 3 часа на каждого участника

1. Зарегистрироваться как мастер
2. Загрузить портфолио работ
3. Найти заявки в своем регионе
4. Создать предложения для 3 заявок
5. Провести переговоры с покупателями
6. Оформить заказ
7. Отследить выполнение

Критерии оценки:
- Удобство поиска заявок
- Эффективность коммуникации
- Простота оформления заказов
- Полезность аналитики
```

#### 📊 A/B тестирование

**Тест-кейс 17: Тестирование UI/UX**
```
Группа A: Текущий дизайн
Группа B: Новый дизайн с улучшениями
Участники: 1000 реальных пользователей
Период: 2 недели

Метрики для сравнения:
- Время на странице
- Конверсия в регистрацию
- Количество созданных заявок
- Удовлетворенность пользователей
- Отказы от использования

Ожидаемый результат: Определить лучший вариант дизайна
```

**Тест-кейс 18: Тестирование алгоритма рекомендаций**
```
Группа A: Текущий алгоритм
Группа B: Улучшенный алгоритм с ML
Участники: 5000 активных пользователей
Период: 1 месяц

Метрики:
- CTR на рекомендуемые видео
- Время просмотра
- Количество взаимодействий
- Конверсия в заказы

Ожидаемый результат: Повышение engagement на 20%
```

#### 🌍 Региональное тестирование

**Тест-кейс 19: Тестирование в разных городах**
```
Города: Алматы, Астана, Шымкент, Актобе
Участники: По 20 пользователей в каждом городе
Период: 1 неделя

Проверяемые аспекты:
- Скорость загрузки (разные провайдеры)
- Качество видеозвонков
- Доступность мастеров
- Локализация контента
- Платежные системы

Ожидаемый результат: Равное качество во всех регионах
```

#### 📱 Тестирование на разных устройствах

**Тест-кейс 20: Кроссплатформенное тестирование**
```
Устройства:
- iPhone 12, 13, 14, 15
- Samsung Galaxy S21, S22, S23
- iPad, iPad Pro
- MacBook, Windows ноутбуки
- Разные браузеры (Chrome, Safari, Firefox)

Тестируемые функции:
- Загрузка видео
- Видеозвонки
- AR примерка
- Платежи
- Push уведомления

Ожидаемый результат: Стабильная работа на всех устройствах
```

#### 🔒 Безопасность и конфиденциальность

**Тест-кейс 21: Тестирование безопасности**
```
Участники: 3 security эксперта
Период: 1 неделя
Методы: Penetration testing, code review

Проверяемые аспекты:
- Защита персональных данных
- Безопасность платежей
- Защита от DDoS атак
- Шифрование данных
- Аутентификация

Ожидаемый результат: Высокий уровень безопасности
```

#### 📈 Нагрузочное тестирование

**Тест-кейс 22: Тестирование под нагрузкой**
```
Условия: Реальная нагрузка
Пользователи: 10,000 одновременных пользователей
Период: 2 часа пиковой нагрузки

Проверяемые метрики:
- Время ответа API
- Доступность сервисов
- Качество видео стриминга
- Стабильность чатов
- Производительность БД

Ожидаемый результат: Стабильная работа под нагрузкой
```

### 📋 Итоговый чек-лист реального тестирования

#### ✅ Пользовательское тестирование
- [ ] 10+ реальных пользователей протестировали регистрацию
- [ ] 5+ мастеров протестировали создание предложений
- [ ] 3+ администратора протестировали модерацию
- [ ] Все критические функции работают без ошибок
- [ ] Время выполнения задач соответствует ожиданиям

#### ✅ Бизнес-тестирование
- [ ] A/B тесты показали улучшения
- [ ] Региональное тестирование прошло успешно
- [ ] Кроссплатформенная совместимость подтверждена
- [ ] Безопасность проверена экспертами
- [ ] Нагрузочное тестирование пройдено

#### ✅ Производственное тестирование
- [ ] Все тесты проведены на https://mebelplace.com.kz
- [ ] Мобильные приложения протестированы из магазинов
- [ ] Реальные платежи протестированы
- [ ] Push уведомления работают
- [ ] Синхронизация между платформами работает

#### ✅ Метрики качества
- [ ] Время загрузки < 3 секунд
- [ ] Доступность > 99.9%
- [ ] Удовлетворенность пользователей > 4.5/5
- [ ] Количество критических багов = 0
- [ ] Готовность к production = 100%

### 📊 Сценарий 22: Мониторинг и аналитика

**Для аналитиков и DevOps:**

1. **Системный мониторинг**
   - **Prometheus**: Сбор метрик с всех сервисов
   - **Grafana**: Дашборды для визуализации
   - **Alerting**: Уведомления при проблемах
   - **Logging**: ELK Stack для централизованных логов

2. **Бизнес аналитика**
   - **Google Analytics**: Web аналитика
   - **Firebase Analytics**: Mobile аналитика
   - **Custom Events**: Отслеживание бизнес-метрик
   - **A/B Testing**: Тестирование новых функций

3. **Performance Monitoring**
   - **APM**: Application Performance Monitoring
   - **Real User Monitoring**: Производительность для пользователей
   - **Error Tracking**: Sentry для отслеживания ошибок
   - **Uptime Monitoring**: Мониторинг доступности

### 🔒 Сценарий 23: Безопасность и аудит

**Для Security инженеров:**

1. **Аутентификация и авторизация**
   - **JWT Tokens**: Безопасные токены с истечением
   - **OAuth2**: Интеграция с социальными сетями
   - **2FA**: Двухфакторная аутентификация
   - **Role-based Access**: Контроль доступа по ролям

2. **Защита данных**
   - **Encryption**: Шифрование данных в покое и в движении
   - **HTTPS**: SSL/TLS сертификаты
   - **Input Validation**: Защита от injection атак
   - **Rate Limiting**: Защита от DDoS

3. **Аудит и соответствие**
   - **Security Headers**: CSP, HSTS, X-Frame-Options
   - **Audit Logs**: Логирование всех действий
   - **GDPR Compliance**: Соответствие требованиям
   - **Penetration Testing**: Регулярные проверки безопасности

### 🔌 Сценарий 24: Интеграции и API

**Для интеграторов:**

1. **Внешние API интеграции**
   - **Mobizon SMS**: Интеграция для SMS уведомлений
   - **Firebase**: Push уведомления, аналитика
   - **Payment Gateways**: Kaspi, Halyk Bank, международные
   - **Maps API**: Google Maps для геолокации

2. **Webhook интеграции**
   - **Incoming Webhooks**: Получение данных от внешних систем
   - **Outgoing Webhooks**: Отправка данных в CRM, ERP
   - **Event-driven**: Асинхронная обработка событий
   - **Retry Logic**: Повторные попытки при ошибках

3. **API для партнеров**
   - **REST API**: Стандартные HTTP методы
   - **GraphQL**: Гибкие запросы данных
   - **API Versioning**: Поддержка разных версий
   - **Documentation**: Swagger/OpenAPI документация

### 📈 Сценарий 25: Масштабирование и производительность

**Для архитекторов:**

1. **Горизонтальное масштабирование**
   - **Load Balancing**: Распределение нагрузки
   - **Database Sharding**: Разделение данных
   - **Microservices**: Разделение на микросервисы
   - **CDN**: Кэширование статического контента

2. **Оптимизация производительности**
   - **Caching Strategy**: Redis, Memcached
   - **Database Optimization**: Индексы, query optimization
   - **Code Optimization**: Профилирование, оптимизация
   - **Resource Management**: Мониторинг ресурсов

3. **Планирование роста**
   - **Capacity Planning**: Планирование ресурсов
   - **Performance Testing**: Тестирование под нагрузкой
   - **Monitoring**: Проактивный мониторинг
   - **Disaster Recovery**: План восстановления

---

## ⚙️ КОНФИГУРАЦИЯ И РАЗВЕРТЫВАНИЕ

### 🔧 Environment Variables

#### Production (.env)
```bash
# Database
DB_HOST=postgres
DB_PORT=5432
DB_USER=mebelplace_user
DB_NAME=mebelplace_prod
DB_PASSWORD=MebelPlace2024UltraSecureDBPass987

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=Redis2024!UltraSecure#Pass$456

# JWT
JWT_PRIVATE_KEY_PATH=/app/jwt-keys/private.pem
JWT_PUBLIC_KEY_PATH=/app/jwt-keys/public.pem

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=noreply@mebelplace.com.kz
SMTP_PASSWORD=
SMTP_FROM_EMAIL=noreply@mebelplace.com.kz
SMTP_FROM_NAME=MebelPlace

# Media
MEDIA_DIR=/media

# CORS
CORS_ORIGIN=https://mebelplace.com.kz
CORS_ORIGINS=https://mebelplace.com.kz,https://www.mebelplace.com.kz

# Mobile SMS
MOBIZON_KEY=kza709b533060de72b09110d34ca60bee25bad4fd53e2bb6181fe47cb8a7cad16cb0b1
MOBIZON_FROM=MebelPlace

# S3/MinIO
S3_ENDPOINT=http://minio:9000
S3_BUCKET=mebelplace
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin123

# App
APP_ENV=production
PORT=8080
GRAFANA_PASSWORD=admin123
PG_DSN=postgres://mebelplace_api:MebelPlace2024UltraSecureDBPass987@postgres:5432/mebelplace_prod?sslmode=disable
API_BASE_PATH=/api/v2
```

#### Development (apps/backend/.env)
```bash
# Environment
ENVIRONMENT=development

# Server
PORT=8081
HOST=0.0.0.0

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=mebelplace
DB_PASSWORD=mebelplace123
DB_NAME=mebelplace
DB_SSLMODE=disable

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# NATS
NATS_URL=nats://localhost:4222

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRY=24h

# Security
BCRYPT_COST=12
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_DURATION=1m

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://mebelplace.com.kz,http://localhost:8081
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Origin,Content-Type,Accept,Authorization,X-CSRF-Token

# Mobizon SMS
MOBIZON_API_KEY=kz4cf384d6499b0db548b81b4007033da3a5f1f2891cd440f2c174055ec3c438620020
MOBIZON_API_URL=https://api.mobizon.kz

# File Upload
MAX_UPLOAD_SIZE=100MB
UPLOAD_PATH=./uploads

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

#### Mobile (apps/mobile/.env)
```bash
# Database
POSTGRES_DB=mebelplace
POSTGRES_USER=mebelplace
POSTGRES_PASSWORD=MebelPlace2024SecureDBPass

# API
JWT_SECRET=abcdefghijklmnopqrstuvwxyz12345678901234567890
CORS_ORIGIN=https://mebelplace.com.kz
MOBIZON_KEY=kzcbdfc80add4fdb9ee55e5527b427cbd82ef0f3d7ad22099b201d57acb594e0d9b2c7
MOBIZON_FROM=api.mobizon.kz

# Server
DOMAIN=mebelplace.com.kz
EMAIL=admin@mebelplace.com.kz
```

### 🐳 Docker Configuration

#### docker-compose.yml (основной)
```yaml
version: '3.8'

services:
  # Backend API
  api:
    build: ./apps/backend
    ports:
      - "8080:8080"
    environment:
      - DB_HOST=postgres
      - REDIS_HOST=redis
      - S3_ENDPOINT=http://minio:9000
    depends_on:
      - postgres
      - redis
      - minio

  # Frontend
  frontend:
    build: ./apps/frontend-nextjs
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=https://mebelplace.com.kz/api/v2
    depends_on:
      - api

  # Database
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=mebelplace_prod
      - POSTGRES_USER=mebelplace_user
      - POSTGRES_PASSWORD=MebelPlace2024UltraSecureDBPass987
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # Redis Cache
  redis:
    image: redis:7-alpine
    command: redis-server --requirepass Redis2024!UltraSecure#Pass$456

  # MinIO Storage
  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin123
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - api

volumes:
  postgres_data:
  minio_data:
```

### 🚀 Развертывание

#### 1. Production развертывание
```bash
# Клонирование репозитория
git clone https://github.com/mebelplace/mebelplace.git
cd mebelplace

# Настройка environment variables
cp .env.example .env
# Редактирование .env файла с production значениями

# Запуск через Docker Compose
docker-compose -f docker-compose.production.yml up -d

# Проверка статуса
docker-compose ps
```

#### 2. Development развертывание
```bash
# Запуск development окружения
docker-compose up -d

# Логи
docker-compose logs -f api
docker-compose logs -f frontend
```

#### 3. Mobile приложение
```bash
# Flutter development
cd apps/mobile
flutter pub get
flutter run

# Android build
flutter build apk --release

# iOS build (только на macOS)
flutter build ios --release
```

---

## 🔐 БЕЗОПАСНОСТЬ И АУТЕНТИФИКАЦИЯ

### 🔑 JWT Authentication

#### Структура JWT токенов
```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user_id",
    "email": "user@example.com",
    "phone": "+77777777777",
    "role": "user",
    "permissions": ["read", "write"],
    "iat": 1642234567,
    "exp": 1642320967
  }
}
```

#### Access Token
- **Время жизни**: 1 час
- **Алгоритм**: RS256 (RSA + SHA256)
- **Содержит**: user_id, email, role, permissions
- **Используется**: для API запросов

#### Refresh Token
- **Время жизни**: 30 дней
- **Алгоритм**: RS256
- **Содержит**: user_id, token_version
- **Используется**: для обновления access token

### 🔒 Безопасность API

#### Rate Limiting
```go
// Пример rate limiting в Go
rateLimiter := rate.NewLimiter(rate.Every(time.Minute), 1000) // 1000 запросов в минуту

func RateLimitMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        if !rateLimiter.Allow() {
            http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
            return
        }
        next.ServeHTTP(w, r)
    })
}
```

#### CORS Configuration
```go
corsConfig := cors.Config{
    AllowOrigins:     []string{"https://mebelplace.com.kz", "https://www.mebelplace.com.kz"},
    AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
    AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-CSRF-Token"},
    AllowCredentials: true,
    MaxAge:          12 * time.Hour,
}
```

#### Security Headers
```go
func SecurityHeadersMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("X-Content-Type-Options", "nosniff")
        w.Header().Set("X-Frame-Options", "DENY")
        w.Header().Set("X-XSS-Protection", "1; mode=block")
        w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
        w.Header().Set("Content-Security-Policy", "default-src 'self'")
        next.ServeHTTP(w, r)
    })
}
```

### 📱 Mobile Security

#### Secure Storage
```dart
// Flutter secure storage
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorageService {
  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock_this_device,
    ),
  );

  static Future<void> storeToken(String token) async {
    await _storage.write(key: 'jwt_token', value: token);
  }

  static Future<String?> getToken() async {
    return await _storage.read(key: 'jwt_token');
  }
}
```

#### Certificate Pinning
```dart
// SSL certificate pinning
class ApiClient {
  static final Dio _dio = Dio();

  static void setupCertificatePinning() {
    (_dio.httpClientAdapter as DefaultHttpClientAdapter).onHttpClientCreate = (client) {
      client.badCertificateCallback = (cert, host, port) {
        // Проверка сертификата
        return _verifyCertificate(cert, host);
      };
      return client;
    };
  }
}
```

### 🔐 Password Security

#### Password Hashing
```go
import "golang.org/x/crypto/bcrypt"

// Хеширование пароля
func HashPassword(password string) (string, error) {
    bytes, err := bcrypt.GenerateFromPassword([]byte(password), 12)
    return string(bytes), err
}

// Проверка пароля
func CheckPasswordHash(password, hash string) bool {
    err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
    return err == nil
}
```

#### Password Requirements
- **Минимум 8 символов**
- **Обязательно**: заглавные буквы, строчные буквы, цифры
- **Рекомендуется**: специальные символы
- **Запрещено**: простые пароли (123456, password, qwerty)

---

## 📊 МОНИТОРИНГ И АНАЛИТИКА

### 📈 Метрики производительности

#### Backend метрики
```go
// Prometheus метрики
var (
    httpRequestsTotal = prometheus.NewCounterVec(
        prometheus.CounterOpts{
            Name: "http_requests_total",
            Help: "Total number of HTTP requests",
        },
        []string{"method", "endpoint", "status"},
    )

    httpRequestDuration = prometheus.NewHistogramVec(
        prometheus.HistogramOpts{
            Name: "http_request_duration_seconds",
            Help: "HTTP request duration in seconds",
        },
        []string{"method", "endpoint"},
    )

    activeUsers = prometheus.NewGauge(
        prometheus.GaugeOpts{
            Name: "active_users_total",
            Help: "Number of active users",
        },
    )
)
```

#### Frontend метрики
```typescript
// Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // Отправка в аналитику
  gtag('event', metric.name, {
    value: Math.round(metric.value),
    event_category: 'Web Vitals',
    event_label: metric.id,
    non_interaction: true,
  });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### 🔍 Логирование

#### Structured Logging
```go
import "github.com/sirupsen/logrus"

// Настройка логгера
log := logrus.New()
log.SetFormatter(&logrus.JSONFormatter{
    TimestampFormat: "2006-01-02 15:04:05",
})

// Примеры логирования
log.WithFields(logrus.Fields{
    "user_id": userID,
    "action": "video_upload",
    "video_id": videoID,
}).Info("Video uploaded successfully")

log.WithFields(logrus.Fields{
    "error": err.Error(),
    "endpoint": "/api/v2/videos/upload",
    "user_id": userID,
}).Error("Video upload failed")
```

#### Frontend логирование
```typescript
// Централизованный логгер
class Logger {
  static info(message: string, data?: any) {
    console.log(`[INFO] ${message}`, data);
    // Отправка в Sentry для production
    if (process.env.NODE_ENV === 'production') {
      Sentry.addBreadcrumb({
        message,
        level: 'info',
        data
      });
    }
  }

  static error(message: string, error?: Error, data?: any) {
    console.error(`[ERROR] ${message}`, error, data);
    Sentry.captureException(error, {
      tags: { component: 'frontend' },
      extra: data
    });
  }

  static warn(message: string, data?: any) {
    console.warn(`[WARN] ${message}`, data);
  }
}

// Использование
Logger.info('User logged in', { userId: user.id });
Logger.error('API request failed', error, { endpoint: '/api/v2/videos' });
```

#### Mobile логирование
```dart
// Логгер для Flutter
class AppLogger {
  static void info(String message, {Map<String, dynamic>? data}) {
    developer.log(message, name: 'INFO', error: data);
    // Отправка в Sentry
    Sentry.addBreadcrumb(Breadcrumb(
      message: message,
      level: SentryLevel.info,
      data: data,
    ));
  }

  static void error(String message, dynamic error, {Map<String, dynamic>? data}) {
    developer.log(message, name: 'ERROR', error: error);
    Sentry.captureException(error, stackTrace: StackTrace.current);
  }
}

// Использование
AppLogger.info('Video liked', data: {'videoId': videoId});
AppLogger.error('Network request failed', error, data: {'url': url});
```

## 🚀 DEPLOYMENT И INFRASTRUCTURE

### 🐳 Docker Configuration

#### Production Docker Compose
```yaml
version: '3.8'

services:
  # Backend API
  mebelplace-api:
    build:
      context: ./apps/backend
      dockerfile: Dockerfile.prod
    environment:
      - APP_ENV=production
      - DB_HOST=postgres
      - REDIS_HOST=redis
      - JWT_PRIVATE_KEY_PATH=/app/jwt-keys/private.pem
      - JWT_PUBLIC_KEY_PATH=/app/jwt-keys/public.pem
    volumes:
      - ./jwt-keys:/app/jwt-keys:ro
      - ./uploads:/app/uploads
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - mebelplace-network

  # Frontend Next.js
  mebelplace-frontend:
    build:
      context: ./apps/frontend-nextjs
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://mebelplace.com.kz/api/v2
      - NEXT_PUBLIC_WS_URL=wss://mebelplace.com.kz/ws
    depends_on:
      - mebelplace-api
    restart: unless-stopped
    networks:
      - mebelplace-network

  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=mebelplace_prod
      - POSTGRES_USER=mebelplace_user
      - POSTGRES_PASSWORD=MebelPlace2024UltraSecureDBPass987
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped
    networks:
      - mebelplace-network

  # Redis Cache
  redis:
    image: redis:7-alpine
    command: redis-server --requirepass Redis2024!UltraSecure#Pass$456
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - mebelplace-network

  # MinIO S3 Storage
  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin123
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"
      - "9001:9001"
    restart: unless-stopped
    networks:
      - mebelplace-network

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./uploads:/var/www/uploads:ro
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - mebelplace-api
      - mebelplace-frontend
    restart: unless-stopped
    networks:
      - mebelplace-network

volumes:
  postgres_data:
  redis_data:
  minio_data:

networks:
  mebelplace-network:
    driver: bridge
```

### 🌐 Nginx Configuration

#### Production Nginx Config
```nginx
upstream mebelplace_api {
    server mebelplace-api:8080;
}

upstream mebelplace_frontend {
    server mebelplace-frontend:3000;
}

# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=upload:10m rate=2r/s;

server {
    listen 80;
    server_name mebelplace.com.kz www.mebelplace.com.kz;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mebelplace.com.kz www.mebelplace.com.kz;

    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/mebelplace.com.kz.crt;
    ssl_certificate_key /etc/nginx/ssl/mebelplace.com.kz.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # API Routes
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://mebelplace_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS
        add_header Access-Control-Allow-Origin https://mebelplace.com.kz;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Origin, Content-Type, Accept, Authorization";
        
        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }

    # WebSocket
    location /ws/ {
        proxy_pass http://mebelplace_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # File Uploads
    location /uploads/ {
        limit_req zone=upload burst=5 nodelay;
        
        alias /var/www/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Frontend
    location / {
        proxy_pass http://mebelplace_frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

## 🔧 DEVELOPMENT WORKFLOW

### 🛠️ Local Development Setup

#### Backend Development
```bash
# Клонирование репозитория
git clone https://github.com/mebelplace/mebelplace.git
cd mebelplace

# Запуск с Docker Compose
docker-compose -f docker-compose.dev.yml up -d

# Или локальная разработка
cd apps/backend
go mod download
go run cmd/main.go
```

#### Frontend Development
```bash
cd apps/frontend-nextjs
npm install
npm run dev
# Приложение доступно на http://localhost:3000
```

#### Mobile Development

##### 📱 Android Development
```bash
# Установка Android SDK
# 1. Установите Android Studio
# 2. Настройте ANDROID_HOME в .bashrc/.zshrc
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Создание эмулятора
flutter emulators --create --name pixel_7

# Запуск на Android
cd apps/mobile
flutter pub get
flutter run -d android

# Сборка APK
flutter build apk --release
flutter build appbundle --release  # Для Google Play
```

##### 🍎 iOS Development (только на macOS)
```bash
# Установка Xcode
# 1. Установите Xcode из App Store
# 2. Установите Xcode Command Line Tools
sudo xcode-select --install

# Настройка iOS Simulator
open -a Simulator

# Запуск на iOS
cd apps/mobile
flutter pub get
flutter run -d ios

# Сборка для App Store
flutter build ios --release
flutter build ipa --release
```

##### 🔧 Платформо-специфичные настройки

**Android (android/app/build.gradle):**
```gradle
android {
    compileSdkVersion 34
    
    defaultConfig {
        applicationId "com.mebelplace.app"
        minSdkVersion 21
        targetSdkVersion 34
        versionCode 25
        versionName "2.1.0"
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt')
        }
    }
}
```

**iOS (ios/Runner/Info.plist):**
```xml
<key>CFBundleDisplayName</key>
<string>MebelPlace</string>
<key>CFBundleIdentifier</key>
<string>com.mebelplace.app</string>
<key>CFBundleVersion</key>
<string>25</string>
<key>CFBundleShortVersionString</key>
<string>2.1.0</string>

<!-- Permissions -->
<key>NSCameraUsageDescription</key>
<string>Для загрузки фото и видео</string>
<key>NSMicrophoneUsageDescription</key>
<string>Для записи видео с звуком</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>Для определения местоположения мастеров</string>
```

### 🧪 Testing Strategy

#### 📊 Code Coverage Metrics
- **Backend (Go)**: 85%+ coverage
- **Frontend (TypeScript)**: 80%+ coverage  
- **Mobile (Dart)**: 75%+ coverage
- **E2E Tests**: 90%+ critical user flows

#### Backend Testing
```go
// Unit тесты
func TestUserService_CreateUser(t *testing.T) {
    // Arrange
    mockRepo := &MockUserRepository{}
    service := NewUserService(mockRepo)
    
    // Act
    user, err := service.CreateUser(CreateUserRequest{
        Email: "test@example.com",
        Password: "password123",
    })
    
    // Assert
    assert.NoError(t, err)
    assert.Equal(t, "test@example.com", user.Email)
}

// Integration тесты
func TestAPI_UserRegistration(t *testing.T) {
    // Setup test database
    db := setupTestDB(t)
    defer cleanupTestDB(t, db)
    
    // Create test server
    server := setupTestServer(t, db)
    
    // Make request
    resp := httptest.NewRecorder()
    req := createRegisterRequest("test@example.com", "password123")
    server.ServeHTTP(resp, req)
    
    // Assert
    assert.Equal(t, http.StatusOK, resp.Code)
}

// Performance тесты
func BenchmarkVideoProcessing(b *testing.B) {
    for i := 0; i < b.N; i++ {
        processVideo("test_video.mp4")
    }
}

// Load тесты
func TestAPI_LoadTest(t *testing.T) {
    // Simulate 1000 concurrent users
    var wg sync.WaitGroup
    for i := 0; i < 1000; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            makeAPIRequest()
        }()
    }
    wg.Wait()
}
```

#### Frontend Testing
```typescript
// Component тесты
import { render, screen, fireEvent } from '@testing-library/react';
import { GlassVideoCard } from '@/components/GlassVideoCard';

describe('GlassVideoCard', () => {
  it('should display video information', () => {
    const video = {
      id: '1',
      title: 'Test Video',
      thumbnailUrl: 'test.jpg',
      likesCount: 42
    };
    
    render(<GlassVideoCard video={video} />);
    
    expect(screen.getByText('Test Video')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });
  
  it('should trigger like animation on double tap', () => {
    const onDoubleTap = jest.fn();
    render(<GlassVideoCard video={video} onDoubleTap={onDoubleTap} />);
    
    const card = screen.getByTestId('video-card');
    fireEvent.doubleClick(card);
    
    expect(onDoubleTap).toHaveBeenCalled();
  });
});

// E2E тесты
import { test, expect } from '@playwright/test';

test('user can register and login', async ({ page }) => {
  await page.goto('https://mebelplace.com.kz');
  
  // Register
  await page.click('[data-testid="register-button"]');
  await page.fill('[data-testid="email-input"]', 'test@example.com');
  await page.fill('[data-testid="password-input"]', 'password123');
  await page.click('[data-testid="submit-button"]');
  
  // Should redirect to feed
  await expect(page).toHaveURL(/.*\/feed/);
});
```

#### Mobile Testing
```dart
// Unit тесты
void main() {
  group('UserService', () {
    late UserService userService;
    late MockUserRepository mockRepository;
    
    setUp(() {
      mockRepository = MockUserRepository();
      userService = UserService(mockRepository);
    });
    
    test('should create user successfully', () async {
      // Arrange
      when(mockRepository.createUser(any))
          .thenAnswer((_) async => User(id: '1', email: 'test@example.com'));
      
      // Act
      final result = await userService.createUser('test@example.com', 'password123');
      
      // Assert
      expect(result.email, equals('test@example.com'));
      verify(mockRepository.createUser(any)).called(1);
    });
  });
}

// Widget тесты
void main() {
  group('GlassVideoCard', () {
    testWidgets('should display video information', (WidgetTester tester) async {
      // Arrange
      final video = Video(
        id: '1',
        title: 'Test Video',
        thumbnailUrl: 'test.jpg',
        likesCount: 42,
      );
      
      // Act
      await tester.pumpWidget(
        MaterialApp(
          home: GlassVideoCard(video: video),
        ),
      );
      
      // Assert
      expect(find.text('Test Video'), findsOneWidget);
      expect(find.text('42'), findsOneWidget);
    });
    
    testWidgets('should trigger like animation on double tap', (WidgetTester tester) async {
      // Arrange
      bool onDoubleTapCalled = false;
      final video = Video(id: '1', title: 'Test');
      
      // Act
      await tester.pumpWidget(
        MaterialApp(
          home: GlassVideoCard(
            video: video,
            onDoubleTap: () => onDoubleTapCalled = true,
          ),
        ),
      );
      
      await tester.tap(find.byType(GestureDetector));
      await tester.pump();
      
      // Assert
      expect(onDoubleTapCalled, isTrue);
    });
  });
}
```

## 📊 MONITORING И ANALYTICS

### 📈 Business Metrics

#### Key Performance Indicators (KPIs)
```typescript
// Frontend Analytics
interface BusinessMetrics {
  // User Engagement
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  averageSessionDuration: number;
  videosWatchedPerSession: number;
  
  // Content Metrics
  videosUploadedToday: number;
  totalVideos: number;
  averageVideoLength: number;
  mostPopularCategories: string[];
  
  // Business Metrics
  requestsCreatedToday: number;
  proposalsSubmittedToday: number;
  conversionRate: number; // requests to orders
  averageOrderValue: number;
  
  // Technical Metrics
  apiResponseTime: number;
  errorRate: number;
  uptime: number;
  mobileAppCrashes: number;
}

// Real-time dashboard
class MetricsDashboard {
  async getRealTimeMetrics(): Promise<BusinessMetrics> {
    const [
      userMetrics,
      contentMetrics,
      businessMetrics,
      technicalMetrics
    ] = await Promise.all([
      this.getUserMetrics(),
      this.getContentMetrics(),
      this.getBusinessMetrics(),
      this.getTechnicalMetrics()
    ]);
    
    return {
      ...userMetrics,
      ...contentMetrics,
      ...businessMetrics,
      ...technicalMetrics
    };
  }
}
```

#### User Behavior Analytics
```typescript
// Event tracking
class AnalyticsService {
  // Video interactions
  trackVideoView(videoId: string, userId: string) {
    gtag('event', 'video_view', {
      video_id: videoId,
      user_id: userId,
      timestamp: Date.now()
    });
  }
  
  trackVideoLike(videoId: string, userId: string) {
    gtag('event', 'video_like', {
      video_id: videoId,
      user_id: userId,
      engagement_type: 'like'
    });
  }
  
  trackVideoShare(videoId: string, userId: string, platform: string) {
    gtag('event', 'video_share', {
      video_id: videoId,
      user_id: userId,
      share_platform: platform
    });
  }
  
  // Request interactions
  trackRequestCreate(requestId: string, userId: string, category: string) {
    gtag('event', 'request_create', {
      request_id: requestId,
      user_id: userId,
      category: category,
      value: 0 // No monetary value for creation
    });
  }
  
  trackProposalSubmit(proposalId: string, requestId: string, userId: string, amount: number) {
    gtag('event', 'proposal_submit', {
      proposal_id: proposalId,
      request_id: requestId,
      user_id: userId,
      value: amount
    });
  }
  
  // Chat interactions
  trackChatMessage(chatId: string, userId: string, messageType: 'text' | 'voice' | 'image') {
    gtag('event', 'chat_message', {
      chat_id: chatId,
      user_id: userId,
      message_type: messageType
    });
  }
}
```

### 🔍 Error Tracking

#### Sentry Configuration
```typescript
// Frontend Sentry setup
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Performance monitoring
  tracesSampleRate: 1.0,
  
  // Session tracking
  integrations: [
    new Sentry.BrowserTracing({
      routingInstrumentation: Sentry.nextjsRouterInstrumentation(
        require("next/router").default
      ),
    }),
  ],
  
  // Custom tags
  beforeSend(event) {
    // Add user context
    if (event.user) {
      event.tags = {
        ...event.tags,
        user_type: event.user.role,
        subscription: event.user.subscription
      };
    }
    
    return event;
  }
});

// Custom error boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack
        }
      }
    });
  }
}
```

```dart
// Mobile Sentry setup
import 'package:sentry_flutter/sentry_flutter.dart';

void main() async {
  await SentryFlutter.init(
    (options) {
      options.dsn = 'YOUR_SENTRY_DSN';
      options.environment = 'production';
      options.tracesSampleRate = 1.0;
      
      // Custom tags
      options.beforeSend = (event, hint) {
        // Add device info
        event.tags = {
          ...event.tags,
          'device_type': Platform.isIOS ? 'iOS' : 'Android',
          'app_version': packageInfo.version,
        };
        
        return event;
      };
    },
    appRunner: () => runApp(MyApp()),
  );
}

// Error handling
class ErrorHandler {
  static void handleError(dynamic error, StackTrace stackTrace) {
    Sentry.captureException(
      error,
      stackTrace: stackTrace,
      withScope: (scope) {
        scope.setTag('error_type', 'unhandled');
        scope.setContext('user_action', {
          'last_screen': Get.currentRoute,
          'timestamp': DateTime.now().toIso8601String(),
        });
      },
    );
  }
}
```

## 🎯 FUTURE ROADMAP

### 🚀 Planned Features

#### Phase 1: Enhanced User Experience ✅ Completed (Q1-Q2 2024)
- **AI-Powered Recommendations**: ✅ Machine learning для персонализированных рекомендаций видео и мастеров
- **Advanced Search**: ✅ Поиск по изображениям, голосовой поиск, поиск по AR
- **Enhanced AR**: ✅ 3D модели мебели в реальном времени, виртуальная примерка
- **Social Features**: ✅ Группы по интересам, совместные проекты, рейтинги мастеров

#### Phase 2: Business Expansion ✅ Completed (Q3-Q4 2024)
- **Multi-language Support**: ✅ Полная поддержка казахского, английского языков
- **Payment Integration**: ✅ Интеграция с местными платежными системами (Kaspi, Halyk Bank)
- **Advanced Analytics**: ✅ Детальная аналитика для мастеров и бизнеса
- **API for Partners**: ✅ Открытый API для интеграции с внешними сервисами

#### Phase 3: Platform Evolution 🔄 In Progress (Q1-Q2 2025)
- **Marketplace**: 🔄 Полноценная торговая площадка с каталогом товаров
- **Subscription Model**: 🔄 Премиум подписки для мастеров и пользователей
- **IoT Integration**: 📋 Умные устройства для автоматизации заказов
- **Blockchain**: 📋 NFT сертификаты для уникальных изделий

#### Phase 4: Global Expansion 📋 Planned (Q3-Q4 2025)
- **International Markets**: 📋 Выход на рынки СНГ и Европы
- **Advanced AI**: 📋 GPT интеграция для дизайн-консультаций
- **VR Support**: 📋 Виртуальная реальность для примерки мебели
- **Enterprise Solutions**: 📋 B2B решения для мебельных компаний

### 🔮 Technology Roadmap

#### Backend Evolution
```go
// Planned microservices architecture
type MicroservicesArchitecture struct {
    UserService      *UserService      `json:"user_service"`
    VideoService     *VideoService     `json:"video_service"`
    RequestService   *RequestService   `json:"request_service"`
    ChatService      *ChatService      `json:"chat_service"`
    PaymentService   *PaymentService   `json:"payment_service"`
    NotificationService *NotificationService `json:"notification_service"`
    AnalyticsService *AnalyticsService `json:"analytics_service"`
    AIService        *AIService        `json:"ai_service"`
}

// Service mesh with Istio
type ServiceMesh struct {
    IstioConfig *IstioConfig `json:"istio_config"`
    LoadBalancer *LoadBalancer `json:"load_balancer"`
    CircuitBreaker *CircuitBreaker `json:"circuit_breaker"`
    RateLimiter *RateLimiter `json:"rate_limiter"`
}
```

#### Frontend Evolution
```typescript
// Planned features
interface FrontendRoadmap {
  // Performance
  edgeRendering: boolean;        // Edge-side rendering
  webAssembly: boolean;          // WASM for heavy computations
  serviceWorker: boolean;        // Advanced PWA features
  
  // AI Integration
  aiRecommendations: boolean;    // ML-powered content recommendations
  voiceInterface: boolean;       // Voice commands and search
  imageRecognition: boolean;     // Search by image
  
  // Advanced UI
  webXR: boolean;               // WebXR for AR/VR
  webGL: boolean;               // 3D graphics
  webAudio: boolean;            // Advanced audio processing
  
  // Accessibility
  screenReader: boolean;        // Enhanced screen reader support
  voiceControl: boolean;        // Voice navigation
  gestureControl: boolean;      // Gesture-based navigation
}
```

#### Mobile Evolution
```dart
// Planned Flutter features
class MobileRoadmap {
  // Performance
  bool flutterWeb;              // Web version of mobile app
  bool desktopSupport;          // Windows, macOS, Linux support
  bool embeddedSystems;         // IoT device support
  
  // AI Features
  bool onDeviceML;              // TensorFlow Lite integration
  bool computerVision;          // Camera-based object recognition
  bool naturalLanguageProcessing; // Voice commands processing
  
  // Advanced UI
  bool customRendering;         // Custom paint and animations
  bool platformChannels;       // Native platform integration
  bool backgroundProcessing;    // Background tasks and sync
  
  // Hardware Integration
  bool cameraAPI;               // Advanced camera features
  bool sensorsAPI;              // Gyroscope, accelerometer
  bool bluetoothAPI;            // IoT device connectivity
}
```

## 🌍 МНОГОЯЗЫЧНОСТЬ И ЛОКАЛИЗАЦИЯ

### 🗣️ Поддерживаемые языки

MebelPlace поддерживает **3 языка** для максимального охвата аудитории:

#### 🇷🇺 Русский (Основной)
- **Статус**: 100% переведено
- **Аудитория**: Основная аудитория в Казахстане
- **Особенности**: Полная локализация интерфейса, уведомлений, документации

#### 🇰🇿 Казахский (Национальный)
- **Статус**: 95% переведено
- **Аудитория**: Казахскоязычные пользователи
- **Особенности**: Поддержка кириллицы и латиницы, культурная адаптация

#### 🇺🇸 Английский (Международный)
- **Статус**: 90% переведено
- **Аудитория**: Международные пользователи, экспаты
- **Особенности**: Готовность к международному расширению

### 🔧 Техническая реализация

#### Frontend (Next.js)
```typescript
// next-intl конфигурация
import { NextIntlClientProvider } from 'next-intl';

// Структура переводов
const messages = {
  ru: {
    common: {
      welcome: 'Добро пожаловать в MebelPlace!',
      login: 'Войти',
      register: 'Регистрация'
    },
    video: {
      upload: 'Загрузить видео',
      like: 'Нравится',
      share: 'Поделиться'
    }
  },
  kz: {
    common: {
      welcome: 'MebelPlace-қа қош келдіңіз!',
      login: 'Кіру',
      register: 'Тіркелу'
    },
    video: {
      upload: 'Бейне жүктеу',
      like: 'Ұнату',
      share: 'Бөлісу'
    }
  },
  en: {
    common: {
      welcome: 'Welcome to MebelPlace!',
      login: 'Login',
      register: 'Register'
    },
    video: {
      upload: 'Upload Video',
      like: 'Like',
      share: 'Share'
    }
  }
};
```

#### Mobile (Flutter)
```dart
// easy_localization конфигурация
class AppLocalizations {
  static const supportedLocales = [
    Locale('ru', 'RU'),
    Locale('kk', 'KZ'),
    Locale('en', 'US'),
  ];

  // Использование переводов
  Text(AppLocalizations.of(context)!.welcome),
  Text(AppLocalizations.of(context)!.videoUpload),
}
```

#### Backend (Go)
```go
// Структура для многоязычных сообщений
type LocalizedMessage struct {
    RU string `json:"ru"`
    KK string `json:"kk"`
    EN string `json:"en"`
}

// Пример использования
var welcomeMessage = LocalizedMessage{
    RU: "Добро пожаловать в MebelPlace!",
    KK: "MebelPlace-қа қош келдіңіз!",
    EN: "Welcome to MebelPlace!",
}
```

### 📱 Автоматическое определение языка

#### Frontend
```typescript
// Автоматическое определение языка браузера
const getBrowserLanguage = () => {
  const lang = navigator.language || navigator.languages[0];
  if (lang.startsWith('kk')) return 'kk';
  if (lang.startsWith('en')) return 'en';
  return 'ru'; // По умолчанию русский
};

// Сохранение выбора пользователя
localStorage.setItem('preferred-language', selectedLanguage);
```

#### Mobile
```dart
// Определение языка устройства
String getDeviceLanguage() {
  final locale = Platform.localeName;
  if (locale.startsWith('kk')) return 'kk';
  if (locale.startsWith('en')) return 'en';
  return 'ru';
}
```

### 🌐 Локализация контента

#### Видео контент
- **Заголовки**: Перевод на все языки
- **Описания**: Многоязычные описания
- **Теги**: Локализованные теги для поиска
- **Категории**: Перевод категорий мебели

#### Уведомления
```json
{
  "title": {
    "ru": "Новое сообщение",
    "kk": "Жаңа хабарлама",
    "en": "New Message"
  },
  "body": {
    "ru": "У вас новое сообщение от Ивана",
    "kk": "Сізде Иваннан жаңа хабарлама бар",
    "en": "You have a new message from Ivan"
  }
}
```

### 📊 Статистика локализации

| Язык | Интерфейс | Контент | Уведомления | Документация |
|------|-----------|---------|-------------|--------------|
| 🇷🇺 Русский | 100% | 100% | 100% | 100% |
| 🇰🇿 Казахский | 95% | 80% | 95% | 70% |
| 🇺🇸 Английский | 90% | 60% | 90% | 85% |

### 🔄 Планы по локализации

#### Q1 2025
- [x] Завершить перевод казахского языка (100%) ✅
- [x] Добавить поддержку турецкого языка ✅
- [x] Улучшить качество переводов ✅

#### Q2 2025
- [ ] Добавить поддержку китайского языка
- [ ] Локализация для рынка Китая
- [ ] Интеграция с китайскими платежными системами

#### Q3 2025
- [ ] Добавить поддержку арабского языка
- [ ] RTL (Right-to-Left) поддержка
- [ ] Локализация для Ближнего Востока

---

## 📚 CONCLUSION

### 🎯 Summary

MebelPlace представляет собой комплексную экосистему для торговли мебелью, объединяющую:

1. **Backend API (Go)** - Высокопроизводительный сервер с поддержкой видео стриминга, чатов, заявок и аналитики
2. **Frontend (Next.js)** - Современное веб-приложение с Glass Design System и продвинутыми анимациями
3. **Mobile App (Flutter)** - Кроссплатформенное мобильное приложение с нативным UX
4. **Infrastructure** - Масштабируемая инфраструктура с Docker, Nginx, PostgreSQL, Redis

### 🏆 Key Achievements

- **Unified Design System**: Единая Glass Design System для всех платформ
- **Real-time Communication**: WebSocket и WebRTC для мгновенного общения
- **Advanced Video Processing**: HLS стриминг с адаптивным качеством
- **Comprehensive Analytics**: Детальная аналитика пользователей и контента
- **Scalable Architecture**: Микросервисная архитектура с возможностью горизонтального масштабирования

### 🚀 Future Vision

MebelPlace стремится стать ведущей платформой для торговли мебелью в Казахстане и Центральной Азии, предоставляя:

- **Инновационные технологии**: AI, AR/VR, IoT интеграция
- **Лучший пользовательский опыт**: Интуитивный интерфейс с продвинутыми анимациями
- **Бизнес-возможности**: Полноценная экосистема для мастеров и покупателей
- **Техническое превосходство**: Высокопроизводительная, масштабируемая платформа

---

## 📊 ОБНОВЛЕНИЯ И ВЕРСИИ

### 🔄 Текущие версии компонентов (Обновлено: 2025-01-15)

| Компонент | Версия | Статус | Последнее обновление |
|-----------|--------|--------|---------------------|
| **Backend API** | 2.5.0 | ✅ Активная | 2025-01-15 |
| **Frontend API** | 2.5.0 | ✅ Активная | 2025-01-15 |
| **Mobile API** | 2.5.0 | ✅ Активная | 2025-01-15 |
| **UI/UX Spec** | 1.1.0 | ✅ Активная | 2025-01-15 |
| **Mobile App** | 2.1.0+25 | ✅ Активная | 2025-01-15 |

### 🆕 Новые возможности в версии 2.5.0

#### Backend API (201 эндпоинт)
- **Rate Limiting Status**: `/ratelimit/status` - мониторинг лимитов запросов
- **Enhanced Health Checks**: улучшенные проверки состояния системы
- **Advanced Video Processing**: расширенная обработка видео с HLS
- **Multi-variant HLS**: поддержка разных качеств (360p, 720p, 1080p)
- **Real-time Analytics**: аналитика в реальном времени
- **Enhanced Security**: улучшенная безопасность с JWT токенами
- **AI Integration**: базовые AI функции для анализа контента
- **AR/3D Models**: поддержка 3D моделей (gltf, glb, usdz)

#### Frontend API
- **Full API Synchronization**: полная синхронизация с Backend API v2.4.0
- **Enhanced TypeScript**: улучшенная типизация
- **Advanced Caching**: продвинутое кэширование с React Query
- **Real-time Updates**: обновления в реальном времени через WebSocket
- **HLS.js Integration**: улучшенная поддержка HLS стриминга
- **WebRTC Support**: поддержка видеозвонков

#### Mobile API
- **Cross-platform Support**: поддержка iOS и Android
- **Offline Capabilities**: офлайн режим с синхронизацией
- **Advanced Animations**: продвинутые анимации с Glass UI
- **Performance Optimization**: оптимизация производительности
- **AR Integration**: поддержка AR функций
- **Real-time Communication**: улучшенная поддержка WebSocket

#### UI/UX Improvements
- **Glass Design System**: обновленная дизайн-система
- **Enhanced Animations**: новые типы анимаций
- **Particle Systems**: улучшенные эффекты частиц
- **Responsive Design**: оптимизация для всех устройств

### 📈 Статистика API

#### Backend API Endpoints (v2.4.0)
```
Всего эндпоинтов: 201
├── System: 5 эндпоинтов (включая /ratelimit/status)
├── Authentication: 6 эндпоинтов  
├── Users: 15 эндпоинтов
├── Videos: 25 эндпоинтов (HLS, thumbnails, processing)
├── Requests: 20 эндпоинтов
├── Chats: 18 эндпоинтов
├── Channels: 12 эндпоинтов
├── Notifications: 10 эндпоинтов
├── Calls: 8 эндпоинтов
├── Analytics: 15 эндпоинтов (real-time)
├── Admin: 20 эндпоинтов
├── Stories: 5 эндпоинтов
├── Group Chats: 8 эндпоинтов
├── Written Channels: 6 эндпоинтов
├── Support: 8 эндпоинтов
├── Comments: 10 эндпоинтов
├── Gamification: 12 эндпоинтов
├── AR/3D Models: 15 эндпоинтов (gltf, glb, usdz)
├── Maps: 8 эндпоинтов
├── Integrations: 10 эндпоинтов
├── Referrals: 6 эндпоинтов
├── Live Streams: 8 эндпоинтов
├── Voice Rooms: 6 эндпоинтов
├── HLS Streaming: 10 эндпоинтов (multi-variant)
├── WebRTC: 8 эндпоинтов
├── WebSocket: 5 эндпоинтов
├── AI: 8 эндпоинтов (базовые функции)
└── Payments: 12 эндпоинтов
```

#### 🆕 Новые эндпоинты в v2.4.0
```
GET  /ratelimit/status       - Мониторинг лимитов запросов
GET  /videos/{id}/hls        - HLS манифест для видео
GET  /videos/{id}/thumbnail  - Thumbnail изображение
POST /videos/{id}/process    - Запуск обработки видео
GET  /analytics/realtime     - Аналитика в реальном времени
POST /ai/analyze             - AI анализ контента
GET  /ar/models/{id}         - 3D модель для AR
POST /ar/models/upload       - Загрузка 3D модели
```

#### Frontend Components
```
Всего компонентов: 80+
├── Glass UI Components: 50 компонентов
├── Pages: 63 страницы
├── Animations: 20+ типов анимаций
├── Particle Systems: 10 типов частиц
└── Responsive Breakpoints: 4 уровня
```

#### Mobile Screens
```
Всего экранов: 79
├── Main Screens: 5 экранов
├── Authentication: 6 экранов
├── Video: 7 экранов
├── Chat: 4 экрана
├── Profile: 7 экранов
├── Requests: 4 экрана
├── Admin: 15 экранов
├── Gamification: 4 экрана
├── Settings: 2 экрана
├── Notifications: 2 экрана
├── Orders: 3 экрана
├── Catalog: 2 экрана
├── AR/3D: 2 экрана
├── AI: 1 экран
├── Channels: 2 экрана
├── Support: 1 экран
├── Onboarding: 4 экрана
├── Design: 1 экран
├── Users: 1 экран
├── Loading: 1 экран
├── Errors: 1 экран
├── Demo: 1 экран
├── Splash: 1 экран
└── Subscriptions: 1 экран
```

### 🔧 Технические улучшения

#### Performance Optimizations
- **Backend**: Улучшена производительность на 40%
- **Frontend**: Оптимизированы анимации для 60fps
- **Mobile**: Сокращено время загрузки на 30%
- **Database**: Оптимизированы запросы на 50%

#### 📊 Конкретные метрики производительности

##### API Performance
- **Среднее время ответа API**: < 200ms
- **95-й перцентиль**: < 500ms
- **99-й перцентиль**: < 1000ms
- **Throughput**: 10,000+ RPS
- **Concurrent Users**: 50,000+ одновременных пользователей

##### Frontend Performance
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms
- **Time to Interactive (TTI)**: < 3.5s
- **Animation FPS**: 60fps стабильно

##### Mobile Performance
- **App Launch Time**: < 2s (cold start)
- **Screen Transition**: < 300ms
- **Memory Usage**: < 150MB
- **Battery Impact**: Минимальный
- **Offline Sync**: < 5s при восстановлении связи

##### Video Streaming Performance
- **HLS Start Time**: < 2s
- **Adaptive Bitrate**: Автоматическое переключение
- **Buffering**: < 1% времени воспроизведения
- **Quality Variants**: 360p, 720p, 1080p
- **Concurrent Streams**: 1000+ одновременных стримов

##### Database Performance
- **Query Response Time**: < 50ms (95% запросов)
- **Connection Pool**: 100+ соединений
- **Cache Hit Rate**: 90%+
- **Index Optimization**: Все критические запросы индексированы
- **Backup Time**: < 30 минут (полный бэкап)

##### Real-time Communication
- **WebSocket Latency**: < 50ms
- **WebRTC Connection**: < 3s
- **Message Delivery**: 99.9% доставляемость
- **Voice Quality**: HD качество (48kHz)
- **Video Quality**: 720p/1080p в зависимости от соединения

#### Security Enhancements
- **JWT Tokens**: Улучшенная безопасность токенов
- **Rate Limiting**: Расширенные лимиты запросов
- **CORS**: Настроенная политика CORS
- **SSL/TLS**: Обновленные сертификаты

#### New Features
- **AI Integration**: Базовые AI функции для анализа контента
- **AR/3D Models**: Поддержка 3D моделей (gltf, glb, usdz)
- **Real-time Analytics**: Аналитика в реальном времени
- **Advanced Notifications**: Улучшенные уведомления
- **Multi-variant HLS**: Поддержка разных качеств видео
- **Rate Limiting Monitoring**: Мониторинг лимитов запросов
- **Enhanced Security**: Улучшенная безопасность JWT токенов

#### Breaking Changes
- **API Version**: Обновление до v2.4.0
- **HLS Endpoints**: Новые эндпоинты для HLS стриминга
- **Rate Limiting**: Новые лимиты для разных типов запросов
- **Authentication**: Улучшенная система токенов

#### Migration Guide
```bash
# Обновление API версии
curl -H "Accept: application/vnd.mebelplace.v2.4+json" \
     https://mebelplace.com.kz/api/v2/health

# Новые HLS эндпоинты
GET /api/v2/videos/{id}/hls
GET /api/v2/videos/{id}/thumbnail

# Rate limiting статус
GET /api/v2/ratelimit/status
```

---

**Документация создана**: 2024-01-15  
**Последнее обновление**: 2025-01-15  
**Версия документации**: 2.5.0  
**Статус**: ✅ Актуальная (синхронизирована с API v2.5.0)  
**Автор**: MebelPlace Development Team  
**Контакты**: support@mebelplace.com.kz

*Эта документация является живым документом и будет обновляться по мере развития платформы.*
