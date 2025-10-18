#!/bin/bash

# Auto-Sync Script - Запускается каждые 5 минут
# Автоматически синхронизирует изменения с GitHub

echo "🤖 Starting Auto-Sync Service..."

# Создаем лог файл
LOG_FILE="/opt/mebelplace/logs/auto_sync.log"
mkdir -p /opt/mebelplace/logs

# Функция логирования
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

log "Auto-sync service started"

# Бесконечный цикл
while true; do
    log "Running auto-sync..."
    
    # Запускаем синхронизацию
    /opt/mebelplace/scripts/git_sync.sh >> $LOG_FILE 2>&1
    
    # Ждем 5 минут
    log "Waiting 5 minutes before next sync..."
    sleep 300
done
