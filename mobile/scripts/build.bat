@echo off
REM MebelPlace Mobile App Build Script for Windows

echo 🚀 Starting MebelPlace Mobile App Build Process...

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the mobile directory.
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Install EAS CLI globally if not already installed
echo 🔧 Installing EAS CLI...
npm install -g @expo/eas-cli

REM Check if user is logged in to Expo
echo 🔐 Checking Expo authentication...
eas whoami >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Please log in to Expo first:
    echo    eas login
    exit /b 1
)

REM Build for Android (AAB)
echo 🤖 Building Android AAB...
eas build --platform android --profile production

REM Build for Android (APK)
echo 🤖 Building Android APK...
eas build --platform android --profile preview

echo ✅ Build process completed!
echo 📱 Check your Expo dashboard for build status and download links.
