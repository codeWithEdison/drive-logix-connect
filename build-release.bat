@echo off
REM Loveway Logistics - Android Release Build Script
REM This script automates the release build process

echo ========================================
echo Loveway Logistics - Android Release Build
echo ========================================
echo.

REM Step 1: Build web assets
echo [1/4] Building web assets...
call npm run build:mobile
if %errorlevel% neq 0 (
    echo ERROR: Web build failed!
    pause
    exit /b %errorlevel%
)
echo Web assets built successfully!
echo.

REM Step 2: Sync with Android
echo [2/4] Syncing with Android...
call npx cap sync android
if %errorlevel% neq 0 (
    echo ERROR: Capacitor sync failed!
    pause
    exit /b %errorlevel%
)
echo Android sync completed!
echo.

REM Step 3: Open Android Studio
echo [3/4] Opening Android Studio...
echo Please wait for Android Studio to open...
call npx cap open android
echo.

echo ========================================
echo [4/4] Next Steps in Android Studio:
echo ========================================
echo 1. Wait for Gradle sync to complete
echo 2. Test the app on an emulator or device:
echo    - Click the green play button (Run)
echo    - Select your device/emulator
echo    - Test all features thoroughly
echo.
echo 3. Build signed APK/AAB for release:
echo    - Go to Build -^> Generate Signed Bundle / APK
echo    - Select "Android App Bundle" (AAB)
echo    - Use your keystore (or create new one)
echo    - Select "release" build variant
echo    - Click Finish
echo.
echo 4. Your release AAB will be in:
echo    android\app\release\app-release.aab
echo.
echo ========================================
echo For detailed instructions, see:
echo GOOGLE_PLAY_DEPLOYMENT_GUIDE.md
echo ========================================
echo.
pause


