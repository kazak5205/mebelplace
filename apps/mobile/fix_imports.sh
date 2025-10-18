#!/bin/bash

# Скрипт для исправления импортов в Dart файлах

echo "Исправляем импорты..."

# Создаем временный файл с правильными импортами
cat > /tmp/correct_imports.txt << 'EOF'
import '../../core/config/api_config_export.dart';
EOF

# Находим все файлы с проблемными импортами и исправляем их
find lib -name "*.dart" -exec grep -l "ApiConfig\|ApiEndpoints" {} \; | while read file; do
    echo "Исправляем: $file"
    
    # Удаляем старые импорты
    sed -i '/import.*api_endpoints\.dart/d' "$file"
    sed -i '/import.*api_config\.dart/d' "$file"
    
    # Добавляем правильный импорт в начало файла (после других импортов)
    if ! grep -q "api_config_export" "$file"; then
        # Находим последний импорт и добавляем после него
        sed -i '/^import/a\
import '\''../../core/config/api_config_export.dart'\'';
' "$file"
    fi
done

echo "Исправление завершено!"