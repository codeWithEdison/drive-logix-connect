@echo off
echo ========================================
echo Viewing API Logs from Android Emulator
echo ========================================
echo.
echo This will show all API calls made by the app
echo Press Ctrl+C to stop
echo.
echo Filtering for API logs...
echo.

adb -s emulator-5554 logcat -c
adb -s emulator-5554 logcat | findstr /i "API REQUEST API RESPONSE API ERROR"


