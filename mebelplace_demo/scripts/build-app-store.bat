@echo off
REM MebelPlace App Store Build Script для Windows
REM Этот скрипт подготавливает приложение для публикации в App Store

echo 🚀 Начинаем сборку MebelPlace для App Store...

REM Проверяем наличие Flutter
where flutter >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Flutter не найден! Установите Flutter и добавьте в PATH.
    pause
    exit /b 1
)

REM Переходим в директорию проекта
cd /d "%~dp0.."

REM Очищаем проект
echo [INFO] Очищаем проект...
flutter clean

REM Получаем зависимости
echo [INFO] Получаем зависимости...
flutter pub get

REM Проверяем код
echo [INFO] Проверяем код...
flutter analyze

REM Запускаем тесты
echo [INFO] Запускаем тесты...
flutter test

REM Собираем для iOS (Release)
echo [INFO] Собираем для iOS (Release)...
flutter build ios --release --no-codesign

REM Проверяем сборку
if exist "build\ios\iphoneos\Runner.app" (
    echo [INFO] ✅ Сборка успешно завершена!
    echo [INFO] 📱 Приложение готово для архивирования в Xcode
    echo.
    echo Следующие шаги:
    echo 1. Откройте ios\Runner.xcworkspace в Xcode
    echo 2. Выберите 'Any iOS Device' как цель
    echo 3. Product → Archive
    echo 4. Distribute App → App Store Connect
    echo.
    echo 📁 Путь к сборке: build\ios\iphoneos\Runner.app
) else (
    echo [ERROR] ❌ Сборка не удалась!
    pause
    exit /b 1
)

echo [INFO] 🎉 Готово! Приложение подготовлено для App Store.
pause
