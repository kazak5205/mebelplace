@echo off
REM Скрипт для быстрой сборки AAB (Google Play Store)

echo ==========================================
echo MebelPlace Mobile - Build AAB
echo ==========================================
echo.

cd /d "%~dp0\.."

echo [1/3] Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

echo.
echo [2/3] Building AAB...
cd android
call gradlew.bat bundleRelease

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [3/3] Success!
    echo ==========================================
    echo AAB built successfully!
    echo Location: android\app\build\outputs\bundle\release\app-release.aab
    echo ==========================================
    echo.
    echo This AAB file is ready for Google Play Store upload!
    echo.
    
    REM Открыть папку с AAB
    start "" "%CD%\app\build\outputs\bundle\release"
) else (
    echo.
    echo ==========================================
    echo ERROR: Build failed!
    echo Check the error messages above
    echo ==========================================
)

pause


