@echo off
echo ==========================================
echo MebelPlace - Creating App Icon
echo ==========================================

echo Creating MebelPlace icon...
echo This script will create a simple icon for the app

REM Create a simple text-based icon description
echo.
echo Icon Requirements:
echo - Size: 512x512px (main icon)
echo - Format: PNG with transparency
echo - Design: MebelPlace logo with orange background (#f97316)
echo - Text: "M" or "MP" for MebelPlace
echo.

echo For now, we'll use the existing 512x512.png icon
echo Make sure the icon file exists in assets/ folder

if exist "assets\512x512.png" (
    echo ✓ Main icon found: assets\512x512.png
) else (
    echo ✗ Main icon missing: assets\512x512.png
)

if exist "assets\192x192.png" (
    echo ✓ Android icon found: assets\192x192.png
) else (
    echo ✗ Android icon missing: assets\192x192.png
)

if exist "assets\180x180.png" (
    echo ✓ iOS icon found: assets\180x180.png
) else (
    echo ✗ iOS icon missing: assets\180x180.png
)

echo.
echo Note: For production, create proper icons with:
echo - MebelPlace branding
echo - Orange color scheme (#f97316)
echo - Professional design
echo - All required sizes (40x40 to 1024x1024)

pause
