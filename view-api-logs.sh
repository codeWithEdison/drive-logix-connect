#!/bin/bash
echo "========================================"
echo "Viewing API Logs from Android Emulator"
echo "========================================"
echo ""
echo "This will show all API calls made by the app"
echo "Press Ctrl+C to stop"
echo ""
echo "Filtering for API logs..."
echo ""

# Clear logcat first
adb -s emulator-5554 logcat -c

# Show logs filtered for API calls
adb -s emulator-5554 logcat | grep --line-buffered -i "API REQUEST\|API RESPONSE\|API ERROR\|Capacitor/Console.*API"

