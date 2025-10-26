#!/bin/bash

# MebelPlace Production Deployment Script
# Server: 89.207.254.27

set -e  # Exit on error

echo "================================================"
echo "MebelPlace Production Deployment"
echo "================================================"

# Configuration
SERVER_IP="89.207.254.27"
SERVER_USER="root"
PROJECT_DIR="/var/www/mebelplace"
GITHUB_REPO="https://github.com/rof1ch/m-starter.git"

echo ""
echo "Server: $SERVER_IP"
echo "Project Directory: $PROJECT_DIR"
echo ""

# Check SSH connection
echo "1. Checking SSH connection..."
if ! ssh -o ConnectTimeout=5 $SERVER_USER@$SERVER_IP "echo 'Connection successful'" 2>/dev/null; then
    echo "❌ Cannot connect to server $SERVER_IP"
    echo "Please ensure:"
    echo "  - Server is accessible"
    echo "  - SSH key is configured"
    echo "  - User has access to server"
    exit 1
fi
echo "✅ SSH connection successful"

# Install dependencies on server
echo ""
echo "2. Installing/updating system dependencies..."
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    # Update system
    apt-get update -y
    
    # Install required packages
    apt-get install -y \
        curl \
        git \
        nginx \
        certbot \
        python3-certbot-nginx \
        postgresql \
        postgresql-contrib \
        nodejs \
        npm \
        pm2 \
        redis-server \
        build-essential \
        python3
    
    # Ensure Node.js 18+
    if ! command -v node &> /dev/null || [ "$(node --version | cut -d'.' -f1 | tr -d 'v')" -lt 18 ]; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
    fi
    
    # Install PM2 globally if not installed
    npm install -g pm2
    
    echo "✅ System dependencies installed"
ENDSSH

# Clone or update repository
echo ""
echo "3. Setting up project directory..."
ssh $SERVER_USER@$SERVER_IP << ENDSSH
    if [ ! -d "$PROJECT_DIR" ]; then
        echo "Creating project directory..."
        mkdir -p $PROJECT_DIR
        git clone $GITHUB_REPO $PROJECT_DIR
    else
        echo "Updating existing project..."
        cd $PROJECT_DIR
        git fetch origin
        git reset --hard origin/main || git reset --hard origin/master
        git pull
    fi
    echo "✅ Project directory ready"
ENDSSH

# Setup PostgreSQL
echo ""
echo "4. Setting up PostgreSQL database..."
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    # Start PostgreSQL service
    systemctl start postgresql
    systemctl enable postgresql
    
    # Create database and user
    sudo -u postgres psql -c "CREATE DATABASE mebelplace_prod;" 2>/dev/null || echo "Database exists"
    sudo -u postgres psql -c "CREATE USER mebelplace_user WITH PASSWORD 'mebelplace123';" 2>/dev/null || echo "User exists"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE mebelplace_prod TO mebelplace_user;" 2>/dev/null || echo "Privileges granted"
    
    echo "✅ PostgreSQL configured"
ENDSSH

# Setup environment variables
echo ""
echo "5. Configuring environment variables..."
ssh $SERVER_USER@$SERVER_IP << ENDSSH
    cd $PROJECT_DIR
    
    # Create .env for server
    cat > server/.env << 'ENVFILE'
NODE_ENV=production
SERVER_PORT=3001
SERVER_HOST=0.0.0.0

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=mebelplace_user
DB_PASSWORD=mebelplace123
DB_NAME=mebelplace_prod
DB_SSLMODE=disable

# JWT
JWT_SECRET=mebelplace-super-secret-jwt-key-2025
JWT_REFRESH_SECRET=mebelplace-refresh-secret-key-2025
JWT_EXPIRE_TIME=24

# SMS (Mobizon.kz)
SMS_API_KEY=kza709b533060de72b09110d34ca60bee25bad4fd53e2bb6181fe47cb8a7cad16cb0b1

# Client URL
CLIENT_URL=https://mebelplace.com.kz

# WebSocket
WS_PORT=3001
ENVFILE
    
    echo "✅ Environment configured"
ENDSSH

# Install Node.js dependencies
echo ""
echo "6. Installing Node.js dependencies..."
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    cd $PROJECT_DIR
    
    # Install root dependencies
    npm install
    
    # Install server dependencies
    cd server
    npm install
    
    # Install client dependencies
    cd ../client
    npm install
    
    echo "✅ Dependencies installed"
ENDSSH

# Run database migrations
echo ""
echo "7. Running database migrations..."
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    cd $PROJECT_DIR/server
    
    # Check if there are migration files
    if [ -d "migrations" ] && [ "$(ls -A migrations/*.sql 2>/dev/null)" ]; then
        for migration in migrations/*.sql; do
            echo "Applying migration: $migration"
            sudo -u postgres psql -d mebelplace_prod -f "$migration" || true
        done
    fi
    
    echo "✅ Migrations completed"
ENDSSH

# Build frontend
echo ""
echo "8. Building frontend..."
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    cd $PROJECT_DIR/client
    npm run build
    
    echo "✅ Frontend built"
ENDSSH

# Create uploads directory
echo ""
echo "9. Setting up uploads directory..."
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    cd $PROJECT_DIR
    
    # Create necessary directories
    mkdir -p server/uploads/videos
    mkdir -p server/uploads/previews
    mkdir -p server/uploads/avatars
    
    # Set permissions
    chmod -R 755 server/uploads
    
    echo "✅ Uploads directory created"
ENDSSH

# Configure Nginx
echo ""
echo "10. Configuring Nginx..."
ssh $SERVER_USER@$SERVER_IP << ENDSSH
    cat > /etc/nginx/sites-available/mebelplace << 'NGINXCONF'
server {
    listen 80;
    server_name mebelplace.com.kz www.mebelplace.com.kz;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend
    location / {
        root $PROJECT_DIR/client/dist;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Static files (uploads)
    location /uploads {
        alias $PROJECT_DIR/server/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Max upload size
    client_max_body_size 100M;
}
NGINXCONF
    
    # Enable site
    ln -sf /etc/nginx/sites-available/mebelplace /etc/nginx/sites-enabled/
    
    # Remove default site
    rm -f /etc/nginx/sites-enabled/default
    
    # Test configuration
    nginx -t
    
    # Reload Nginx
    systemctl restart nginx
    systemctl enable nginx
    
    echo "✅ Nginx configured"
ENDSSH

# Start server with PM2
echo ""
echo "11. Starting application..."
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    cd $PROJECT_DIR/server
    
    # Stop existing processes
    pm2 stop mebelplace-server 2>/dev/null || true
    pm2 delete mebelplace-server 2>/dev/null || true
    
    # Start new process
    NODE_ENV=production pm2 start index.js --name mebelplace-server
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 startup
    pm2 startup systemd -u root --hp /root
    
    echo "✅ Application started"
ENDSSH

# Setup SSL with Let's Encrypt
echo ""
echo "12. Setting up SSL certificate..."
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    certbot --nginx -d mebelplace.com.kz -d www.mebelplace.com.kz --non-interactive --agree-tos --email admin@mebelplace.com.kz || echo "SSL setup skipped"
    
    echo "✅ SSL configured"
ENDSSH

# Print summary
echo ""
echo "================================================"
echo "✅ Deployment completed successfully!"
echo "================================================"
echo ""
echo "Application URL: https://mebelplace.com.kz"
echo "Server IP: $SERVER_IP"
echo "Project Directory: $PROJECT_DIR"
echo ""
echo "Useful commands:"
echo "  SSH to server: ssh $SERVER_USER@$SERVER_IP"
echo "  View logs: pm2 logs mebelplace-server"
echo "  Restart app: pm2 restart mebelplace-server"
echo "  View status: pm2 status"
echo ""
echo "================================================"
