#!/bin/bash

echo "🚀 MebelPlace Mobile - Автоматическая сборка APK через EAS Build"
echo ""

# Проверяем, установлен ли EAS CLI
if ! command -v eas &> /dev/null; then
    echo "📦 Устанавливаем EAS CLI..."
    npm install -g eas-cli
fi

# Переходим в директорию проекта
cd /opt/mebelplace/mobile

echo ""
echo "⚠️  ВАЖНО: Для сборки нужен Expo аккаунт"
echo ""
echo "Если у вас нет аккаунта:"
echo "1. Зарегистрируйтесь на https://expo.dev/signup"
echo "2. Выполните: eas login"
echo ""
read -p "У вас есть Expo аккаунт и вы залогинены? (y/n): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Выполните следующие команды:"
    echo "  1. eas login"
    echo "  2. ./build-eas.sh"
    exit 1
fi

echo ""
echo "🏗️  Запускаем сборку APK..."
echo ""

# Собираем APK через EAS Build
eas build --platform android --profile preview --non-interactive

echo ""
echo "✅ Сборка завершена!"
echo ""
echo "📥 Скачайте APK по ссылке выше или найдите его на:"
echo "   https://expo.dev/accounts/[ваш-аккаунт]/projects/mebelplace-mobile/builds"
echo ""

