#!/bin/bash

# MebelPlace App Store Build Script
# Этот скрипт подготавливает приложение для публикации в App Store

set -e

echo "🚀 Начинаем сборку MebelPlace для App Store..."

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверяем наличие Flutter
if ! command -v flutter &> /dev/null; then
    error "Flutter не найден! Установите Flutter и добавьте в PATH."
    exit 1
fi

# Проверяем версию Flutter
log "Проверяем версию Flutter..."
flutter --version

# Переходим в директорию проекта
cd "$(dirname "$0")/.."

# Очищаем проект
log "Очищаем проект..."
flutter clean

# Получаем зависимости
log "Получаем зависимости..."
flutter pub get

# Проверяем код
log "Проверяем код..."
flutter analyze

# Запускаем тесты
log "Запускаем тесты..."
flutter test

# Собираем для iOS (Release)
log "Собираем для iOS (Release)..."
flutter build ios --release --no-codesign

# Проверяем сборку
if [ -d "build/ios/iphoneos/Runner.app" ]; then
    log "✅ Сборка успешно завершена!"
    log "📱 Приложение готово для архивирования в Xcode"
    log ""
    log "Следующие шаги:"
    log "1. Откройте ios/Runner.xcworkspace в Xcode"
    log "2. Выберите 'Any iOS Device' как цель"
    log "3. Product → Archive"
    log "4. Distribute App → App Store Connect"
    log ""
    log "📁 Путь к сборке: build/ios/iphoneos/Runner.app"
else
    error "❌ Сборка не удалась!"
    exit 1
fi

log "🎉 Готово! Приложение подготовлено для App Store."

