#!/bin/bash

# MebelPlace Mobile App Build Script

echo "🚀 Starting MebelPlace Mobile App Build Process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the mobile directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install EAS CLI globally if not already installed
echo "🔧 Installing EAS CLI..."
npm install -g @expo/eas-cli

# Check if user is logged in to Expo
echo "🔐 Checking Expo authentication..."
if ! eas whoami > /dev/null 2>&1; then
    echo "⚠️  Please log in to Expo first:"
    echo "   eas login"
    exit 1
fi

# Build for Android (AAB)
echo "🤖 Building Android AAB..."
eas build --platform android --profile production

# Build for Android (APK)
echo "🤖 Building Android APK..."
eas build --platform android --profile preview

echo "✅ Build process completed!"
echo "📱 Check your Expo dashboard for build status and download links."
