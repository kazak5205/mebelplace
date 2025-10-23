#!/bin/bash

echo "🚀 Начинаем сборку APK для MebelPlace..."

# Переходим в директорию проекта
cd /opt/mebelplace/mobile

# Проверяем наличие зависимостей
if [ ! -d "node_modules" ]; then
    echo "📦 Установка зависимостей..."
    npm install
fi

# Генерируем нативные файлы
echo "🔧 Генерация нативных файлов Android..."
npx expo prebuild --clean --platform android

# Переходим в папку android
cd android

# Собираем APK
echo "🏗️  Сборка APK..."
./gradlew assembleRelease

# Проверяем результат
APK_PATH="app/build/outputs/apk/release/app-release.apk"
if [ -f "$APK_PATH" ]; then
    echo "✅ APK успешно собран!"
    echo "📍 Путь к файлу: android/$APK_PATH"
    
    # Копируем APK в корень mobile
    cp "$APK_PATH" "../mebelplace-mobile-v1.0.0.apk"
    echo "📦 APK скопирован: mebelplace-mobile-v1.0.0.apk"
else
    echo "❌ Ошибка: APK не найден"
    exit 1
fi

echo "🎉 Готово!"

