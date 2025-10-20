#!/bin/bash

# MebelPlace MVP Complete Setup Script

set -e

echo "🏠 MebelPlace MVP Setup Script"
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

echo "✅ Docker $(docker --version) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm run install-all

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p server/uploads/videos
mkdir -p server/uploads/thumbnails
mkdir -p server/uploads/avatars
mkdir -p server/uploads/order-photos
mkdir -p server/uploads/chat-files
mkdir -p mobile/android/app/src/main/assets

# Set up environment variables
echo "⚙️ Setting up environment variables..."
if [ ! -f "server/.env" ]; then
    cp server/env.example server/.env
    echo "📝 Created server/.env file. Please edit it with your settings."
fi

# Generate VAPID keys for push notifications
echo "🔑 Generating VAPID keys..."
cd server
if [ ! -f ".env" ]; then
    echo "❌ server/.env not found. Please run setup again."
    exit 1
fi

# Generate VAPID keys using web-push
npx web-push generate-vapid-keys > vapid-keys.txt 2>/dev/null || {
    echo "📝 Please add VAPID keys to server/.env:"
    echo "VAPID_PUBLIC_KEY=your_public_key_here"
    echo "VAPID_PRIVATE_KEY=your_private_key_here"
}

cd ..

# Build everything
echo "🔨 Building project..."
npm run build

# Create APK
echo "📱 Building Android APK..."
npm run build:apk

# Build Docker image
echo "🐳 Building Docker image..."
npm run docker:build

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit server/.env with your database and API settings"
echo "2. Start development: npm run dev"
echo "3. Deploy to server: npm run deploy"
echo ""
echo "🌐 URLs:"
echo "- Frontend: http://localhost:5173"
echo "- Backend: http://localhost:3001"
echo "- API Health: http://localhost:3001/api/health"
echo "- APK: ./mebelplace.apk"
echo ""
echo "📱 Mobile:"
echo "- APK ready: ./mebelplace.apk"
echo "- Install on Android device"
echo ""
echo "🚀 Ready to go!"
