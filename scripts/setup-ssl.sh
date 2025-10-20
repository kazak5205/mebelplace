#!/bin/bash

# SSL Certificate Setup Script using Let's Encrypt
# Run this on your VPS after domain is pointed to server

set -e

DOMAIN="mebelplace.com.kz"
EMAIL="admin@mebelplace.com.kz"

echo "🔒 Setting up SSL certificates for $DOMAIN"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (use sudo)"
    exit 1
fi

# Install Certbot
echo "Installing Certbot..."
apt update
apt install -y certbot python3-certbot-nginx

# Stop Nginx temporarily
systemctl stop nginx

# Obtain certificate
echo "Obtaining SSL certificate..."
certbot certonly --standalone \
    -d $DOMAIN \
    -d www.$DOMAIN \
    --email $EMAIL \
    --agree-tos \
    --non-interactive

# Start Nginx
systemctl start nginx

# Setup auto-renewal
echo "Setting up auto-renewal..."
systemctl enable certbot.timer
systemctl start certbot.timer

# Test renewal
certbot renew --dry-run

echo "✅ SSL certificates installed successfully!"
echo "Certificates location: /etc/letsencrypt/live/$DOMAIN/"

