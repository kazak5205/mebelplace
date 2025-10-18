# 📚 MebelPlace - Ключевые файлы документации

> **Версия**: 2.4.0  
> **Дата обновления**: 2024-01-15  
> **Статус**: ✅ Актуальная (синхронизирована с API v2.4.0)

## 🎯 Обзор

Эта папка содержит все ключевые файлы документации экосистемы MebelPlace - платформы для торговли мебелью с видео-контентом, заявками, чатами и системой подписок.

## 📁 Структура файлов

### 🏗️ **Архитектура и API**
| Файл | Описание | Версия |
|------|----------|--------|
| `ecosystem-documentation.md` | **Главная документация экосистемы** | 2.4.0 |
| `backend-api-spec.yaml` | Backend API спецификация (201 эндпоинт) | 2.4.0 |
| `frontend-api-spec.yaml` | Frontend API спецификация | 2.4.0 |
| `mobile-api-spec.yaml` | Mobile API спецификация | 2.4.0 |

### 🎨 **UI/UX и Frontend**
| Файл | Описание | Версия |
|------|----------|--------|
| `frontend-ui-spec.yaml` | UI/UX спецификация (80+ компонентов) | 1.0.0 |
| `mobile-dependencies.yaml` | Flutter зависимости | 2.0.1+21 |

### ⚙️ **Конфигурация**
| Файл | Описание | Среда |
|------|----------|-------|
| `production.env` | Production конфигурация | Production |
| `backend-dev.env` | Backend development | Development |
| `backend-prod.env` | Backend production | Production |
| `mobile.env` | Mobile конфигурация | Mobile |

## 🚀 Быстрый старт

### 1. 📖 Начните с главной документации
```bash
# Откройте главную документацию экосистемы
cat ecosystem-documentation.md
```

### 2. 🔍 Изучите API спецификации
```bash
# Backend API (201 эндпоинт)
cat backend-api-spec.yaml

# Frontend API
cat frontend-api-spec.yaml

# Mobile API
cat mobile-api-spec.yaml
```

### 3. 🎨 Познакомьтесь с UI/UX
```bash
# UI/UX спецификация с Glass Design System
cat frontend-ui-spec.yaml
```

### 4. ⚙️ Настройте конфигурацию
```bash
# Production конфигурация
cat production.env

# Development конфигурация
cat backend-dev.env
```

## 📊 Статистика экосистемы

### Backend API (v2.4.0)
- **201 эндпоинт** в 25 категориях
- **HLS Streaming** с multi-variant поддержкой
- **Real-time Analytics** и мониторинг
- **AI Integration** для анализа контента
- **AR/3D Models** поддержка

### Frontend (Next.js 15)
- **80+ Glass UI компонентов**
- **63 страницы** с адаптивным дизайном
- **20+ типов анимаций** с Framer Motion
- **Particle Systems** для эффектов
- **PWA поддержка** с offline режимом

### Mobile (Flutter)
- **79 экранов** с нативным UX
- **Clean Architecture** с Riverpod
- **Material Design 3** + Glass UI
- **Offline capabilities** с синхронизацией
- **AR/3D поддержка** для мебели

## 🔧 Технические особенности

### 🎨 Glass Design System
- **Уникальная дизайн-система** с backdrop-blur эффектами
- **Цветовая палитра** с Primary Orange (#FF6600)
- **Типографика** с Google Fonts
- **Анимации** с Framer Motion
- **Responsive Design** для всех устройств

### 🚀 Performance
- **Backend**: +40% производительность
- **Frontend**: 60fps анимации
- **Mobile**: -30% время загрузки
- **Database**: +50% оптимизация запросов

### 🔒 Security
- **JWT Tokens** с улучшенной безопасностью
- **Rate Limiting** с мониторингом
- **CORS** настроенная политика
- **SSL/TLS** обновленные сертификаты

## 📈 Новые возможности v2.4.0

### 🆕 Backend API
- `/ratelimit/status` - мониторинг лимитов запросов
- Multi-variant HLS (360p, 720p, 1080p)
- Real-time Analytics
- AI Integration для анализа контента
- AR/3D Models поддержка (gltf, glb, usdz)

### 🆕 Frontend
- Полная синхронизация с Backend API v2.4.0
- Улучшенная TypeScript типизация
- Продвинутое кэширование с React Query
- HLS.js интеграция для стриминга
- WebRTC поддержка для видеозвонков

### 🆕 Mobile
- Cross-platform поддержка iOS/Android
- Offline capabilities с синхронизацией
- AR Integration для мебели
- Улучшенная WebSocket поддержка
- Performance оптимизация

## 🛠️ Разработка

### Локальная настройка
```bash
# Клонируйте репозиторий
git clone https://github.com/mebelplace/mebelplace.git

# Настройте environment
cp backend-dev.env .env

# Запустите development сервер
docker-compose up -d
```

### Тестирование
```bash
# Unit тесты
npm test

# Integration тесты
npm run test:integration

# E2E тесты
npm run test:e2e
```

## 📞 Поддержка

- **Email**: support@mebelplace.com.kz
- **Документация**: [ecosystem-documentation.md](./ecosystem-documentation.md)
- **API**: [backend-api-spec.yaml](./backend-api-spec.yaml)
- **UI/UX**: [frontend-ui-spec.yaml](./frontend-ui-spec.yaml)

## 📝 Лицензия

Proprietary - MebelPlace Development Team

---

*Эта документация является живым документом и будет обновляться по мере развития платформы.*

