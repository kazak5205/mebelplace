#!/bin/bash

# Git Auto-Sync Script for MebelPlace
# Автоматическая синхронизация с GitHub

set -e

echo "🔄 Starting Git Auto-Sync..."

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция логирования
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Переходим в корень проекта
cd /opt/mebelplace

# Проверяем статус Git
log "Checking Git status..."
git status --porcelain

# Получаем все изменения с удаленного репозитория
log "Fetching latest changes from GitHub..."
git fetch --all

# Проверяем есть ли изменения в удаленном репозитории
CURRENT_BRANCH=$(git branch --show-current)
REMOTE_BRANCH="origin/$CURRENT_BRANCH"

if git rev-list --count HEAD..$REMOTE_BRANCH > /dev/null 2>&1; then
    REMOTE_COMMITS=$(git rev-list --count HEAD..$REMOTE_BRANCH)
    if [ $REMOTE_COMMITS -gt 0 ]; then
        warning "Found $REMOTE_COMMITS new commits in remote repository"
        log "Pulling latest changes..."
        git pull origin $CURRENT_BRANCH
        success "Successfully pulled $REMOTE_COMMITS commits"
    else
        log "No new commits in remote repository"
    fi
else
    log "Remote branch $REMOTE_BRANCH not found, skipping pull"
fi

# Проверяем есть ли локальные изменения
if [ -n "$(git status --porcelain)" ]; then
    warning "Found local changes, committing them..."
    
    # Добавляем все изменения
    git add .
    
    # Создаем коммит с временной меткой
    COMMIT_MSG="Auto-sync: $(date +'%Y-%m-%d %H:%M:%S')"
    git commit -m "$COMMIT_MSG"
    
    # Отправляем изменения
    log "Pushing local changes..."
    git push origin $CURRENT_BRANCH
    
    success "Successfully pushed local changes"
else
    log "No local changes to commit"
fi

# Показываем текущий статус
log "Current branch: $CURRENT_BRANCH"
log "Latest commit: $(git log -1 --oneline)"

success "Git sync completed successfully!"

# Показываем все ветки
echo ""
log "Available branches:"
git branch -a

echo ""
log "Recent commits:"
git log --oneline -5
