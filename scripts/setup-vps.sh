#!/bin/bash

# VPS Initial Setup Script for MebelPlace
# Run this script on your VPS for the first time setup

set -e

echo "🔧 MebelPlace VPS Initial Setup"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    log_warn "Please run as root (use sudo)"
    exit 1
fi

# Update system
log_info "Updating system packages..."
apt update && apt upgrade -y

# Install essential packages
log_info "Installing essential packages..."
apt install -y curl wget git nginx mysql-server build-essential

# Install Node.js 18.x
log_info "Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PM2
log_info "Installing PM2..."
npm install -g pm2

# Setup PM2 to start on boot
log_info "Setting up PM2 startup..."
pm2 startup systemd -u www-data --hp /var/www
pm2 save

# Install FFmpeg (for video processing)
log_info "Installing FFmpeg..."
apt install -y ffmpeg

# Create project directory
log_info "Creating project directory..."
mkdir -p /var/www/mebelplace
mkdir -p /var/backups/mebelplace

# Set permissions
log_info "Setting permissions..."
chown -R www-data:www-data /var/www/mebelplace

# Setup MySQL
log_info "Setting up MySQL..."
mysql -e "CREATE DATABASE IF NOT EXISTS mebelplace CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
log_warn "Please create MySQL user manually:"
echo "  CREATE USER 'mebelplace'@'localhost' IDENTIFIED BY 'your_password';"
echo "  GRANT ALL PRIVILEGES ON mebelplace.* TO 'mebelplace'@'localhost';"
echo "  FLUSH PRIVILEGES;"

# Setup Firewall
log_info "Configuring firewall..."
ufw allow 22/tcp      # SSH
ufw allow 80/tcp      # HTTP
ufw allow 443/tcp     # HTTPS
ufw --force enable

# Clone repository (you'll need to do this manually with your repo)
log_info "To clone your repository, run:"
echo "  cd /var/www"
echo "  git clone https://github.com/YOUR_USERNAME/mebelplace.git"
echo "  cd mebelplace"

log_info "✅ VPS setup completed!"
log_info "Next steps:"
echo "  1. Clone your Git repository to /var/www/mebelplace"
echo "  2. Copy server/env.example to server/.env and configure it"
echo "  3. Setup SSL certificates (Let's Encrypt)"
echo "  4. Configure Nginx"
echo "  5. Run the deployment script"

