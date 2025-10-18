#!/bin/bash

# Скрипт для генерации клиентского кода из OpenAPI спецификации

echo "🚀 Генерация клиентского кода из OpenAPI..."

# Проверяем наличие openapi-generator
if ! command -v openapi-generator &> /dev/null; then
    echo "❌ openapi-generator не найден. Установите его:"
    echo "npm install -g @openapitools/openapi-generator-cli"
    exit 1
fi

# Генерируем Dart клиент
echo "📱 Генерация Dart клиента..."
openapi-generator generate \
  -i ../../openapi.yaml \
  -g dart-dio \
  -o lib/core/api/generated \
  --additional-properties=pubName=mebelplace_api,pubVersion=1.0.0,pubDescription="MebelPlace API Client"

echo "✅ Клиентский код сгенерирован в lib/core/api/generated/"
echo "📝 Добавьте в pubspec.yaml:"
echo "  mebelplace_api:"
echo "    path: lib/core/api/generated"
