#!/bin/bash
# ============================================
# MebelPlace Backup Script
# Date: 2025-10-28
# Description: Automatic backup for PostgreSQL, Redis, and uploads
# ============================================

BACKUP_DIR="/backup/mebelplace"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# Create backup directory
mkdir -p "$BACKUP_DIR"/{postgres,redis,uploads}

echo "🔄 Starting backup at $DATE..."

# 1. PostgreSQL Backup
echo "📦 Backing up PostgreSQL..."
docker exec mebelplace-postgres-prod pg_dump -U mebelplace -d mebelplace_prod \
  | gzip > "$BACKUP_DIR/postgres/mebelplace_prod_$DATE.sql.gz"

if [ $? -eq 0 ]; then
  echo "✅ PostgreSQL backup completed: mebelplace_prod_$DATE.sql.gz"
else
  echo "❌ PostgreSQL backup FAILED"
fi

# 2. Redis Backup
echo "📦 Backing up Redis..."
docker exec mebelplace-redis-prod redis-cli -a temp123 --no-auth-warning SAVE
docker cp mebelplace-redis-prod:/data/dump.rdb "$BACKUP_DIR/redis/dump_$DATE.rdb"

if [ $? -eq 0 ]; then
  echo "✅ Redis backup completed: dump_$DATE.rdb"
else
  echo "❌ Redis backup FAILED"
fi

# 3. Uploads Backup
echo "📦 Backing up uploads..."
docker run --rm \
  -v mebelplace_uploads_data:/source \
  -v "$BACKUP_DIR/uploads":/backup \
  alpine \
  tar czf /backup/uploads_$DATE.tar.gz -C /source .

if [ $? -eq 0 ]; then
  echo "✅ Uploads backup completed: uploads_$DATE.tar.gz"
else
  echo "❌ Uploads backup FAILED"
fi

# 4. Cleanup old backups (older than RETENTION_DAYS)
echo "🧹 Cleaning up old backups (older than $RETENTION_DAYS days)..."
find "$BACKUP_DIR/postgres" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR/redis" -name "dump_*.rdb" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR/uploads" -name "uploads_*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "✅ Backup completed at $(date +%Y%m%d_%H%M%S)"
echo "📁 Backup location: $BACKUP_DIR"

# Send notification (optional)
# curl -X POST "https://notify.example.com/backup" -d "status=success&date=$DATE"

