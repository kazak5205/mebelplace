#!/bin/bash

echo "=== СИСТЕМАТИЧЕСКАЯ ПРОВЕРКА ВСЕХ СТРАНИЦ ==="
echo "Дата: $(date)"
echo ""

# Получаем список всех страниц из файловой системы
echo "Поиск всех page.tsx файлов..."
ALL_PAGES=$(find /opt/mebelplace/apps/frontend-nextjs/src/app -name "page.tsx" -type f)

echo "Найдено файлов: $(echo "$ALL_PAGES" | wc -l)"
echo ""

# Создаем массив для хранения результатов
declare -a WORKING_PAGES=()
declare -a BROKEN_PAGES=()
declare -a ERROR_PAGES=()

TOTAL=0
WORKING=0
BROKEN=0
ERROR=0

echo "Начинаем проверку страниц..."
echo "=================================="

# Функция для проверки страницы
check_page() {
    local file_path="$1"
    local page_name=$(echo "$file_path" | sed 's|.*/app/[^/]*/||' | sed 's|/page.tsx||')
    
    # Пропускаем служебные файлы
    if [[ "$page_name" == *"page.tsx"* ]] || [[ "$page_name" == "" ]] || [[ "$page_name" == *"["* ]]; then
        return
    fi
    
    TOTAL=$((TOTAL + 1))
    
    echo -n "Проверяю: $page_name ... "
    
    # Проверяем статус страницы
    status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3002/$page_name" --max-time 10)
    
    case $status in
        "200")
            WORKING=$((WORKING + 1))
            WORKING_PAGES+=("$page_name")
            echo "✅ OK"
            ;;
        "404")
            BROKEN=$((BROKEN + 1))
            BROKEN_PAGES+=("$page_name")
            echo "❌ 404"
            ;;
        "500")
            ERROR=$((ERROR + 1))
            ERROR_PAGES+=("$page_name")
            echo "🔥 500"
            ;;
        *)
            ERROR=$((ERROR + 1))
            ERROR_PAGES+=("$page_name")
            echo "⚠️  $status"
            ;;
    esac
    
    # Небольшая пауза
    sleep 0.1
}

# Проверяем каждую страницу
while IFS= read -r page_file; do
    check_page "$page_file"
done <<< "$ALL_PAGES"

echo ""
echo "=================================="
echo "=== РЕЗУЛЬТАТЫ ПРОВЕРКИ ==="
echo "Всего страниц: $TOTAL"
echo "Работают (200): $WORKING"
echo "Не найдены (404): $BROKEN" 
echo "Ошибки сервера (500+): $ERROR"
echo ""

if [ $TOTAL -gt 0 ]; then
    percentage=$((WORKING * 100 / TOTAL))
    echo "Процент работы: $percentage%"
    echo ""
fi

# Показываем рабочие страницы
if [ ${#WORKING_PAGES[@]} -gt 0 ]; then
    echo "✅ РАБОТАЮЩИЕ СТРАНИЦЫ (${#WORKING_PAGES[@]}):"
    for page in "${WORKING_PAGES[@]}"; do
        echo "   - $page"
    done
    echo ""
fi

# Показываем сломанные страницы
if [ ${#BROKEN_PAGES[@]} -gt 0 ]; then
    echo "❌ СЛОМАННЫЕ СТРАНИЦЫ (404) - ${#BROKEN_PAGES[@]}:"
    for page in "${BROKEN_PAGES[@]}"; do
        echo "   - $page"
    done
    echo ""
fi

# Показываем страницы с ошибками
if [ ${#ERROR_PAGES[@]} -gt 0 ]; then
    echo "🔥 СТРАНИЦЫ С ОШИБКАМИ (500+) - ${#ERROR_PAGES[@]}:"
    for page in "${ERROR_PAGES[@]}"; do
        echo "   - $page"
    done
    echo ""
fi

echo "=== ПЛАН ДЕЙСТВИЙ ==="
if [ $BROKEN -gt 0 ]; then
    echo "1. Исправить 404 ошибки: ${#BROKEN_PAGES[@]} страниц"
fi
if [ $ERROR -gt 0 ]; then
    echo "2. Исправить 500 ошибки: ${#ERROR_PAGES[@]} страниц"
fi
if [ $WORKING -lt $TOTAL ]; then
    echo "3. Интегрировать API для ${#BROKEN_PAGES[@]} + ${#ERROR_PAGES[@]} страниц"
fi

echo ""
echo "Проверка завершена: $(date)"
