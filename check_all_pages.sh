#!/bin/bash

# Скрипт для проверки всех страниц
echo "Проверка всех 113 страниц..."

# Получаем список всех страниц
PAGES=$(find /opt/mebelplace/apps/frontend-nextjs/src/app -name "page.tsx" | sed 's|.*/app/[^/]*/||' | sed 's|/page.tsx||' | sort | grep -v "^$")

# Счетчики
TOTAL=0
WORKING=0
NOT_WORKING=0
NOT_WORKING_LIST=""

echo "Начинаем проверку..."

for page in $PAGES; do
    TOTAL=$((TOTAL + 1))
    
    # Проверяем страницу
    status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3002/$page")
    
    if [ "$status" = "200" ]; then
        WORKING=$((WORKING + 1))
        echo "✅ $page - OK ($status)"
    else
        NOT_WORKING=$((NOT_WORKING + 1))
        NOT_WORKING_LIST="$NOT_WORKING_LIST\n❌ $page - $status"
        echo "❌ $page - $status"
    fi
    
    # Небольшая пауза между запросами
    sleep 0.1
done

echo ""
echo "=== РЕЗУЛЬТАТЫ ==="
echo "Всего страниц: $TOTAL"
echo "Работают: $WORKING"
echo "Не работают: $NOT_WORKING"
echo "Процент работы: $((WORKING * 100 / TOTAL))%"
echo ""
echo "Не работающие страницы:"
echo -e "$NOT_WORKING_LIST"

