# Android Mobile App - Build & Run Commands

This guide contains all commands to build and run the Lovely Cargo mobile app on Android.

## 📱 Quick Start

### Basic Build & Run

```bash
npm run build:mobile && npx cap run android
```

## 🚀 Available Commands

### 1. Build for Mobile

Build the web assets and sync with Android platform:

```bash
npm run build:mobile
```

### 2. Build Only (Production)

Build web assets without syncing Android:

```bash
npm run build
```

### 3. Sync Android Platform

Sync web assets to Android platform:

```bash
npx cap sync android
```

### 4. Run on Emulator

Run the app on connected emulator or device:

```bash
npx cap run android
```

### 5. Run on Specific Emulator

Run on a specific Android emulator:

```bash
npx cap run android --target="Pixel_8a_API_35"
```

### 6. Open in Android Studio

Open the Android project in Android Studio:

```bash
npx cap open android
```

### 7. Build APK

Build APK without running:

```bash
npm run build:mobile && npx cap build android
```

## 🔄 Complete Workflow

### Workflow 1: Build & Run

```bash
npm run build && npx cap sync android && npx cap run android
```

### Workflow 2: Build & Open in Android Studio

```bash
npm run build:mobile && npx cap open android
```

### Workflow 3: Live Reload (ҘDevelopment)

Start dev server first:

```bash
npm run dev
```

Then in another terminal:

```bash
npx cap run android --livereload --external
```

## 🛠 Troubleshooting

### JAVA_HOME Error

If you get JAVA_HOME error, use the batch script:

```bash
./run-android.bat
```

Or set JAVA_HOME manually:

```bash
export JAVA_HOME="C:\Program Files\Java\jdk-24"
```

### Check Connected Devices

List all connected Android devices/emulators:

```bash
adb devices
```

### Install on Connected Device

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## 📝 NPM Scripts

Available scripts in `package.json`:

- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run build:mobile` - Build for mobile (includes Android sync)
- `npm run android:dev` - Build and run on Android
- `npm run android:build` - Build Android APK
- `npm run android:open` - Open Android Studio
- `npm run android:sync` - Sync web assets to Android

## 🎯 Recommended Workflow

### For Development:

1. Start dev server: `npm run dev`
2. In Android Studio: Run the app
3. Changes will auto-reload

### For Testing:

1. Build: `npm run build:mobile`
2. Run: `npx cap open android`
3. Use Android Studio to test on emulator

### For Production:

1. Build APK: `npm run build:mobile && npx cap build android`
2. APK location: `android/app/build/outputs/apk/release/app-release.apk`

## 📱 Testing Checklist

After running the app, test these features:

- ✅ App configuration loads on startup
- ✅ Push notification registration
- ✅ Offline sync functionality
- ✅ Mobile API endpoints work
- ✅ Biometric authentication
- ✅ GPS tracking
- ✅ Camera functionality
- ✅ Network monitoring
- ✅ Device information display

## 🔧 Environment Setup

Required:

- Node.js 18+
- Java JDK 17 or 24
- Android Studio with SDK 35
- Android Emulator or physical device

## 📞 Support

If you encounter issues:

1. Check `android-troubleshooting.md` for common issues
2. Verify JAVA_HOME is set correctly
3. Ensure Android SDK is installed
4. Check emulator is running: `adb devices`

---

**Last Updated**: 2025-01-20
**Platform**: Android API 35
**Capacitor Version**: 7.4.4
