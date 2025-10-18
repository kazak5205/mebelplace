# 🚀 MebelPlace - Инструкции по использованию

## 🎯 Быстрый старт

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

## 📚 Для разработчиков

### Backend разработка
```bash
# Изучите API эндпоинты
grep -n "  /" backend-api-spec.yaml

# Настройте development окружение
cp backend-dev.env .env

# Запустите сервер
docker-compose up -d
```

### Frontend разработка
```bash
# Изучите UI компоненты
grep -n "Glass" frontend-ui-spec.yaml

# Настройте API интеграцию
cat frontend-api-spec.yaml

# Запустите development сервер
npm run dev
```

### Mobile разработка
```bash
# Изучите экраны приложения
grep -n "Screen" mobile-api-spec.yaml

# Настройте зависимости
cat mobile-dependencies.yaml

# Запустите приложение
flutter run
```

## 🎨 Для дизайнеров

### Glass Design System
```bash
# Изучите цветовую палитру
grep -A 10 "цветовая палитра" frontend-ui-spec.yaml

# Изучите компоненты
grep -n "Glass" frontend-ui-spec.yaml

# Изучите анимации
grep -A 5 "анимации" frontend-ui-spec.yaml
```

### UI Components
```bash
# Список всех компонентов
grep -n "Glass" frontend-ui-spec.yaml | head -20

# Детали компонентов
grep -A 3 "GlassCard" frontend-ui-spec.yaml
```

## 🔧 Для DevOps

### Deployment
```bash
# Production конфигурация
cat production.env

# Docker настройки
grep -A 10 "docker" ecosystem-documentation.md

# Nginx конфигурация
grep -A 20 "nginx" ecosystem-documentation.md
```

### Monitoring
```bash
# Метрики и логирование
grep -A 10 "monitoring" ecosystem-documentation.md

# Health checks
grep -n "health" backend-api-spec.yaml
```

## 📊 Для аналитиков

### API статистика
```bash
# Количество эндпоинтов
grep -c "  /" backend-api-spec.yaml

# Категории API
grep -n "tags:" backend-api-spec.yaml
```

### Компоненты
```bash
# Количество UI компонентов
grep -c "Glass" frontend-ui-spec.yaml

# Количество экранов
grep -c "Screen" mobile-api-spec.yaml
```

## 🔍 Поиск по документации

### Поиск по ключевым словам
```bash
# Поиск по API
grep -r "authentication" .

# Поиск по UI
grep -r "Glass" .

# Поиск по конфигурации
grep -r "database" .
```

### Поиск по версиям
```bash
# Текущие версии
grep -r "version:" .

# API версии
grep -n "version:" backend-api-spec.yaml
```

## 📱 Для мобильных разработчиков

### Flutter зависимости
```bash
# Изучите зависимости
cat mobile-dependencies.yaml

# Обновите зависимости
flutter pub get
```

### Mobile API
```bash
# Изучите экраны
grep -n "Screen" mobile-api-spec.yaml

# Изучите навигацию
grep -A 5 "navigation" mobile-api-spec.yaml
```

## 🌐 Для веб-разработчиков

### Frontend API
```bash
# Изучите API интеграцию
cat frontend-api-spec.yaml

# Изучите компоненты
grep -n "component" frontend-ui-spec.yaml
```

### UI/UX спецификация
```bash
# Изучите дизайн-систему
grep -A 10 "Glass Design System" frontend-ui-spec.yaml

# Изучите анимации
grep -A 5 "Framer Motion" frontend-ui-spec.yaml
```

## 🔄 Обновление документации

### Проверка актуальности
```bash
# Проверьте версии
grep -r "version:" .

# Проверьте даты
grep -r "2024-01-15" .
```

### Синхронизация
```bash
# Обновите все файлы
cp /opt/mebelplace/openapi.yaml backend-api-spec.yaml
cp "/opt/mebelplace/ui .yaml" frontend-ui-spec.yaml
# ... и так далее
```

## 📞 Поддержка

- **Email**: support@mebelplace.com.kz
- **Документация**: [ecosystem-documentation.md](./ecosystem-documentation.md)
- **API**: [backend-api-spec.yaml](./backend-api-spec.yaml)
- **UI/UX**: [frontend-ui-spec.yaml](./frontend-ui-spec.yaml)

---

*Эти инструкции помогут вам быстро начать работу с документацией MebelPlace.*

