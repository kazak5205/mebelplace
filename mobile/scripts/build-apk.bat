@echo off
REM Скрипт для быстрой сборки APK

echo ==========================================
echo MebelPlace Mobile - Build APK
echo ==========================================
echo.

cd /d "%~dp0\.."

echo [1/3] Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

echo.
echo [2/3] Building APK...
cd android
call gradlew.bat assembleRelease

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [3/3] Success!
    echo ==========================================
    echo APK built successfully!
    echo Location: android\app\build\outputs\apk\release\app-release.apk
    echo ==========================================
    
    REM Открыть папку с APK
    start "" "%CD%\app\build\outputs\apk\release"
) else (
    echo.
    echo ==========================================
    echo ERROR: Build failed!
    echo Check the error messages above
    echo ==========================================
)

pause


