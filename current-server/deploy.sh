#!/bin/bash

# MebelPlace Deployment Script
# Run this script on your Ubuntu VPS

set -e

echo "🚀 Starting MebelPlace deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="mebelplace"
APP_DIR="/var/www/$APP_NAME"
SERVER_DIR="$APP_DIR/server"
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"
DOMAIN="mebelplace.com.kz"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root (use sudo)"
    exit 1
fi

# Update system packages
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install required packages
print_status "Installing required packages..."
apt install -y curl wget git nginx postgresql postgresql-contrib certbot python3-certbot-nginx nodejs npm pm2

# Install Node.js 18.x if not already installed
if ! command -v node &> /dev/null || [ "$(node -v | cut -d'v' -f2 | cut -d'.' -f1)" -lt 18 ]; then
    print_status "Installing Node.js 18.x..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
fi

# Create application directory
print_status "Creating application directory..."
mkdir -p $APP_DIR
mkdir -p $SERVER_DIR
mkdir -p $SERVER_DIR/logs
mkdir -p $SERVER_DIR/uploads/images
mkdir -p $SERVER_DIR/uploads/videos
mkdir -p $SERVER_DIR/uploads/audio
mkdir -p $SERVER_DIR/uploads/files

# Set permissions
chown -R www-data:www-data $APP_DIR
chmod -R 755 $APP_DIR

# Configure PostgreSQL
print_status "Configuring PostgreSQL..."
sudo -u postgres psql -c "CREATE DATABASE $APP_NAME;"
sudo -u postgres psql -c "CREATE USER $APP_NAME WITH PASSWORD 'mebelplace123';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $APP_NAME TO $APP_NAME;"
sudo -u postgres psql -c "ALTER USER $APP_NAME CREATEDB;"

# Install application dependencies
print_status "Installing application dependencies..."
cd $SERVER_DIR
npm install

# Copy application files (assuming they're already in the directory)
print_status "Copying application files..."
# This would typically be done via git clone or file transfer
# For now, we'll assume the files are already in place

# Configure Nginx
print_status "Configuring Nginx..."
cp $SERVER_DIR/nginx.conf $NGINX_SITES_AVAILABLE/$DOMAIN
ln -sf $NGINX_SITES_AVAILABLE/$DOMAIN $NGINX_SITES_ENABLED/

# Remove default Nginx site
rm -f $NGINX_SITES_ENABLED/default

# Test Nginx configuration
nginx -t

# Start and enable Nginx
systemctl start nginx
systemctl enable nginx

# Configure PM2
print_status "Configuring PM2..."
pm2 start $SERVER_DIR/ecosystem.config.js
pm2 save
pm2 startup

# Configure SSL with Let's Encrypt
print_status "Configuring SSL certificate..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# Restart services
print_status "Restarting services..."
systemctl reload nginx
pm2 restart all

# Configure firewall
print_status "Configuring firewall..."
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable

# Set up log rotation
print_status "Setting up log rotation..."
cat > /etc/logrotate.d/mebelplace << EOF
$SERVER_DIR/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# Create backup script
print_status "Creating backup script..."
cat > $SERVER_DIR/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/mebelplace"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -h localhost -U mebelplace mebelplace > $BACKUP_DIR/db_$DATE.sql

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz -C /var/www/mebelplace/server uploads

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
EOF

chmod +x $SERVER_DIR/backup.sh

# Set up cron job for backups
print_status "Setting up automated backups..."
echo "0 2 * * * $SERVER_DIR/backup.sh" | crontab -

# Create monitoring script
print_status "Creating monitoring script..."
cat > $SERVER_DIR/monitor.sh << 'EOF'
#!/bin/bash
# Simple health check script

# Check if PM2 processes are running
if ! pm2 list | grep -q "online"; then
    echo "PM2 processes are not running, restarting..."
    pm2 restart all
fi

# Check if Nginx is running
if ! systemctl is-active --quiet nginx; then
    echo "Nginx is not running, restarting..."
    systemctl start nginx
fi

# Check if PostgreSQL is running
if ! systemctl is-active --quiet postgresql; then
    echo "PostgreSQL is not running, restarting..."
    systemctl start postgresql
fi
EOF

chmod +x $SERVER_DIR/monitor.sh

# Set up cron job for monitoring
echo "*/5 * * * * $SERVER_DIR/monitor.sh" | crontab -

print_status "✅ Deployment completed successfully!"
print_status "🌐 Your application is now available at: https://$DOMAIN"
print_status "📊 Monitor your application with: pm2 monit"
print_status "📝 Check logs with: pm2 logs"
print_status "🔄 Restart application with: pm2 restart all"

print_warning "Don't forget to:"
print_warning "1. Update your environment variables in $SERVER_DIR/.env"
print_warning "2. Configure your domain DNS to point to this server"
print_warning "3. Test your application thoroughly"
print_warning "4. Set up regular database backups"

echo "🎉 Deployment script finished!"
