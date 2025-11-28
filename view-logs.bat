@echo off
REM Quick Log Viewer for Loveway Logistics App
REM This script helps you view app logs on a connected Android device

echo ========================================
echo Loveway Logistics - Debug Log Viewer
echo ========================================
echo.

REM Try to find ADB in common locations
set ADB_PATH=
if exist "%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" (
    set ADB_PATH=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe
) else if exist "%USERPROFILE%\AppData\Local\Android\Sdk\platform-tools\adb.exe" (
    set ADB_PATH=%USERPROFILE%\AppData\Local\Android\Sdk\platform-tools\adb.exe
) else if exist "C:\Android\Sdk\platform-tools\adb.exe" (
    set ADB_PATH=C:\Android\Sdk\platform-tools\adb.exe
) else (
    echo ERROR: ADB not found!
    echo Please install Android SDK or set ADB path manually
    echo.
    echo Common locations:
    echo   %LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe
    echo   %USERPROFILE%\AppData\Local\Android\Sdk\platform-tools\adb.exe
    pause
    exit /b 1
)

echo Using ADB: %ADB_PATH%
echo.

REM Check if device is connected
echo Checking for connected devices...
%ADB_PATH% devices
echo.

echo ========================================
echo Choose an option:
echo ========================================
echo 1. View ALL logs (real-time)
echo 2. View FILTERED logs (errors, app-specific)
echo 3. View ERRORS only
echo 4. View JavaScript/Console logs
echo 5. Check device connection
echo 6. Clear app data and cache
echo 7. Save logs to file
echo 8. Open Chrome DevTools (chrome://inspect)
echo 9. Exit
echo ========================================
echo.

set /p choice="Enter your choice (1-9): "

if "%choice%"=="1" goto view_all
if "%choice%"=="2" goto view_filtered
if "%choice%"=="3" goto view_errors
if "%choice%"=="4" goto view_js
if "%choice%"=="5" goto check_devices
if "%choice%"=="6" goto clear_app
if "%choice%"=="7" goto save_logs
if "%choice%"=="8" goto chrome_devtools
if "%choice%"=="9" goto end

:view_all
echo.
echo Viewing ALL logs (Press Ctrl+C to stop)...
echo.
%ADB_PATH% logcat
goto end

:view_filtered
echo.
echo Viewing FILTERED logs (Press Ctrl+C to stop)...
echo Filtering for: lovelycargo, loveway, capacitor, chromium, webview, error, exception
echo.
%ADB_PATH% logcat | findstr /i "lovelycargo loveway capacitor chromium webview console error exception fatal"
goto end

:view_errors
echo.
echo Viewing ERRORS only (Press Ctrl+C to stop)...
echo.
%ADB_PATH% logcat *:E
goto end

:view_js
echo.
echo Viewing JavaScript/Console logs (Press Ctrl+C to stop)...
echo.
%ADB_PATH% logcat | findstr /i "console javascript js error"
goto end

:check_devices
echo.
echo Checking connected devices...
echo.
%ADB_PATH% devices
echo.
echo If no devices shown:
echo   1. Enable USB Debugging on your phone
echo   2. Connect via USB, OR
echo   3. Connect wirelessly: adb connect IP:PORT
echo.
pause
goto end

:clear_app
echo.
echo Clearing app data and cache...
echo.
%ADB_PATH% shell pm clear com.lovelycargo.app
echo.
echo App data cleared! Please restart the app.
echo.
pause
goto end

:save_logs
echo.
set /p filename="Enter filename (e.g., logs.txt): "
if "%filename%"=="" set filename=app-logs-%date:~-4,4%%date:~-10,2%%date:~-7,2%-%time:~0,2%%time:~3,2%%time:~6,2%.txt
echo.
echo Saving logs to %filename%...
echo Press Ctrl+C to stop logging
echo.
%ADB_PATH% logcat > %filename%
echo.
echo Logs saved to %filename%
echo.
pause
goto end

:chrome_devtools
echo.
echo Opening Chrome DevTools...
echo.
echo Instructions:
echo 1. Chrome will open automatically
echo 2. Go to: chrome://inspect
echo 3. Find your app under "Remote Target"
echo 4. Click "inspect" to see Console and errors
echo.
start chrome chrome://inspect
echo.
echo Chrome should open. If not, manually go to: chrome://inspect
echo.
pause
goto end

:end
echo.
echo Done!
pause
