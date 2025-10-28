# Скрипт для тестирования MebelPlace Mobile

Write-Host "🧪 Начало тестирования MebelPlace Mobile" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Проверка запущенного приложения
Write-Host "📱 Проверка статуса приложения..." -ForegroundColor Yellow

$adbPath = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"

if (Test-Path $adbPath) {
    Write-Host "✅ ADB найден: $adbPath" -ForegroundColor Green
    
    # Получаем текущее окно
    $currentWindow = & $adbPath -s emulator-5556 shell dumpsys window windows | Select-String "mCurrentFocus"
    Write-Host "📱 Текущее окно: $currentWindow" -ForegroundColor Cyan
    
    # Делаем скриншот
    Write-Host "📸 Делаем скриншот..." -ForegroundColor Yellow
    & $adbPath -s emulator-5556 exec-out screencap -p > "current_screen.png"
    
    if (Test-Path "current_screen.png") {
        Write-Host "✅ Скриншот сохранен: current_screen.png" -ForegroundColor Green
    }
    
    # Получаем список процессов
    Write-Host "🔍 Проверка запущенного приложения..." -ForegroundColor Yellow
    $mebelplaceProcess = & $adbPath -s emulator-5556 shell "ps | grep mebelplace"
    
    if ($mebelplaceProcess) {
        Write-Host "✅ Приложение MebelPlace запущено!" -ForegroundColor Green
        Write-Host $mebelplaceProcess -ForegroundColor Cyan
    } else {
        Write-Host "⚠️  Приложение MebelPlace не найдено" -ForegroundColor Red
    }
    
} else {
    Write-Host "❌ ADB не найден по пути: $adbPath" -ForegroundColor Red
    Write-Host "⚠️  Проверьте установку Android SDK" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Проверка завершена" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Следующие шаги для ручного тестирования:" -ForegroundColor Yellow
Write-Host "1. Откройте эмулятор" -ForegroundColor White
Write-Host "2. Проверьте что приложение MebelPlace запустилось" -ForegroundColor White
Write-Host "3. Следуйте сценарию из MOBILE_TEST_SCENARIO.md" -ForegroundColor White
Write-Host ""
