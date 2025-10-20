#!/bin/bash

# MebelPlace Auto-Deploy Script
# This script is executed on VPS after git pull

set -e  # Exit on error

echo "🚀 Starting MebelPlace deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/var/www/mebelplace"
BACKUP_DIR="/var/backups/mebelplace"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create backup directory if not exists
mkdir -p "$BACKUP_DIR"

# Navigate to project directory
cd "$PROJECT_DIR"

log_info "Current directory: $(pwd)"

# Create backup of current state
log_info "Creating backup..."
if [ -f "server/.env" ]; then
    cp server/.env "$BACKUP_DIR/.env.$TIMESTAMP"
fi

# Pull latest changes
log_info "Pulling latest changes from Git..."
git pull origin main || git pull origin master

# Install Server Dependencies
log_info "Installing server dependencies..."
cd server
npm install --production
cd ..

# Install Client Dependencies
log_info "Installing client dependencies..."
cd client
npm install
log_info "Building client..."
npm run build
cd ..

# Copy environment file if not exists
if [ ! -f "server/.env" ] && [ -f "$BACKUP_DIR/.env.$TIMESTAMP" ]; then
    log_info "Restoring .env file..."
    cp "$BACKUP_DIR/.env.$TIMESTAMP" server/.env
fi

# Check if .env exists
if [ ! -f "server/.env" ]; then
    log_error ".env file not found! Please create server/.env file with required configuration."
    log_info "You can use server/env.example as a template."
    exit 1
fi

# Database migrations (if any)
log_info "Running database migrations..."
cd server
if [ -f "database_indexes.sql" ]; then
    # Load environment variables
    source .env
    
    # Run SQL migrations
    if command -v mysql &> /dev/null; then
        mysql -h "${DB_HOST:-localhost}" -u "${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" < database_indexes.sql || log_warn "Database migration failed or already applied"
    fi
fi
cd ..

# Create upload directories
log_info "Creating upload directories..."
mkdir -p server/uploads/{videos,thumbnails,avatars,chat-files,order-photos}

# Set permissions
log_info "Setting permissions..."
chown -R www-data:www-data server/uploads 2>/dev/null || log_warn "Could not change uploads ownership"
chmod -R 755 server/uploads

# Restart services using PM2
log_info "Restarting PM2 services..."
cd server
if command -v pm2 &> /dev/null; then
    pm2 restart mebelplace-api || pm2 start ecosystem.config.js
    pm2 save
else
    log_error "PM2 not found! Please install PM2: npm install -g pm2"
    exit 1
fi
cd ..

# Reload Nginx
log_info "Reloading Nginx..."
if command -v nginx &> /dev/null; then
    nginx -t && nginx -s reload || log_warn "Nginx reload failed"
else
    log_warn "Nginx not found, skipping reload"
fi

# Clean old backups (keep last 10)
log_info "Cleaning old backups..."
cd "$BACKUP_DIR"
ls -t .env.* 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true

log_info "✅ Deployment completed successfully!"
log_info "Server is running on: https://mebelplace.com.kz"

# Display PM2 status
log_info "PM2 Status:"
pm2 status

exit 0
