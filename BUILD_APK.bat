@echo off
chcp 65001 >nul
echo ====================================
echo   MuslimReminder - Сборка APK
echo ====================================
echo.
echo Выбери способ:
echo.
echo 1. Быстрый тест (Expo Go на телефоне)
echo 2. Собрать APK (через EAS Build)
echo.
set /p choice="Введи 1 или 2: "

if "%choice%"=="1" (
    echo.
    echo Запуск Expo...
    echo Открой камеру на телефоне и отсканируй QR-код
    echo (установи Expo Go из Play Market)
    echo.
    npx expo start
)

if "%choice%"=="2" (
    echo.
    echo Для сборки APK нужен аккаунт на https://expo.dev/signup
    echo.
    set /p email="Email от аккаунта Expo: "
    npx eas-cli login -u %email%
    npx eas-cli build:configure
    npx eas-cli build -p android --profile preview
)

pause
