# How to View API Logs from Android App

## Method 1: Using ADB Logcat (Recommended)

### View all API logs in real-time:

```bash
adb -s emulator-5554 logcat | grep -i "API REQUEST\|API RESPONSE\|API ERROR"
```

### View all console logs (includes API logs):

```bash
adb -s emulator-5554 logcat | grep "Capacitor/Console"
```

### View recent API logs:

```bash
adb -s emulator-5554 logcat -d | grep -i "API REQUEST\|API RESPONSE\|API ERROR" | tail -50
```

## Method 2: Using the Batch Script

Double-click `view-api-logs.bat` or run:

```bash
view-api-logs.bat
```

## Method 3: Using Android Studio

1. Open Android Studio
2. Go to **View → Tool Windows → Logcat**
3. Filter by: `lovelycargo` or `API`
4. You'll see all console logs including API calls

## What You'll See

Each API call will show:

- **API REQUEST**: Method, URL, headers, data, timestamp
- **API RESPONSE**: Status, duration, response data, timestamp
- **API ERROR**: Error status, error message, request details

## Example Log Format

```
[API REQUEST] GET https://api.lovewaylogistics.com/v1/app-config
{
  method: "GET",
  url: "https://api.lovewaylogistics.com/v1/app-config",
  headers: {...},
  timestamp: "2024-12-17T23:40:00.000Z"
}

[API RESPONSE] GET https://api.lovewaylogistics.com/v1/app-config
{
  status: 200,
  duration: "150ms",
  data: {...},
  timestamp: "2024-12-17T23:40:00.150Z"
}
```

## Tips

- Clear logs before testing: `adb -s emulator-5554 logcat -c`
- Save logs to file: `adb -s emulator-5554 logcat > api-logs.txt`
- Filter by specific endpoint: `adb -s emulator-5554 logcat | grep "app-config"`





