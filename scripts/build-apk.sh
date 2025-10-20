#!/bin/bash

# MebelPlace Android APK Build Script

echo "🤖 Building MebelPlace Android APK..."

# Check if we're in the right directory
if [ ! -f "mobile/package.json" ]; then
    echo "❌ Error: mobile/package.json not found. Run this script from the project root."
    exit 1
fi

# Navigate to mobile directory
cd mobile

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install Android dependencies
echo "🔧 Installing Android dependencies..."
npx react-native install

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd android
./gradlew clean
cd ..

# Build APK
echo "🔨 Building APK..."
npx react-native build-android --mode=release

# Check if build was successful
if [ -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
    echo "✅ APK built successfully!"
    
    # Copy APK to project root
    cp android/app/build/outputs/apk/release/app-release.apk ../mebelplace.apk
    
    # Get APK info
    APK_SIZE=$(du -h ../mebelplace.apk | cut -f1)
    echo "📱 APK Size: $APK_SIZE"
    echo "📍 Location: $(pwd)/../mebelplace.apk"
    
    # Generate APK info
    echo "📋 APK Information:" > ../apk-info.txt
    echo "Build Date: $(date)" >> ../apk-info.txt
    echo "Size: $APK_SIZE" >> ../apk-info.txt
    echo "Version: 1.0.0" >> ../apk-info.txt
    echo "Min SDK: 21" >> ../apk-info.txt
    echo "Target SDK: 34" >> ../apk-info.txt
    
    echo "✅ APK build completed successfully!"
else
    echo "❌ APK build failed!"
    exit 1
fi