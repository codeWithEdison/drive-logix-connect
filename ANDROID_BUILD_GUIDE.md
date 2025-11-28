# Android Production Build Guide

## Building Your App for Google Play Store

### Prerequisites
1. ✅ Java JDK 17+ installed
2. ✅ Android Studio installed
3. ✅ Android SDK configured

### Step 1: Build Your Web Assets
```bash
npm run build
```

### Step 2: Sync Capacitor
```bash
npx cap sync android
```

### Step 3: Open Android Studio
```bash
npx cap open android
```

### Step 4: Build Release APK

#### Option A: Using Android Studio (Recommended)
1. In Android Studio, go to **Build → Generate Signed Bundle / APK**
2. Select **APK** and click **Next**
3. Create a new keystore (first time only):
   - Click **Create new...**
   - Choose a location and name for your keystore file
   - Set a strong password
   - Fill in the certificate information
   - **IMPORTANT**: Save your keystore file and passwords securely!
4. Select your keystore and enter passwords
5. Choose **release** build variant
6. Click **Finish**

Your signed APK will be in: `android/app/release/app-release.apk`

#### Option B: Using Command Line
```bash
cd android
./gradlew assembleRelease
```

The unsigned APK will be in: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

### Step 5: Test Your APK
1. Install on a physical device:
   ```bash
   adb install android/app/release/app-release.apk
   ```
2. Test all features thoroughly before submitting to Google Play

### Common Issues & Solutions

#### White Screen After Build
**Causes:**
- Build errors in JavaScript/TypeScript
- Incorrect Capacitor configuration
- Missing permissions in AndroidManifest.xml

**Solutions:**
1. Check for build errors: `npm run build`
2. Verify `capacitor.config.ts` has correct `webDir: "dist"`
3. Ensure `AndroidManifest.xml` has Internet permission
4. Check Android Studio logcat for JavaScript errors

#### App Crashes on Launch
**Check:**
1. Open Android Studio Logcat
2. Look for JavaScript errors or native crashes
3. Verify all Capacitor plugins are properly synced

**Fix:**
```bash
npx cap sync android
```

#### Permissions Issues
Add required permissions to `android/app/src/main/AndroidManifest.xml`:

```xml
<!-- Required permissions -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.CAMERA" />
```

### Preparing for Google Play Store

#### 1. Update Version Information
Edit `android/app/build.gradle`:
```gradle
defaultConfig {
    versionCode 1      // Increment for each release
    versionName "1.0"  // Your version number
}
```

#### 2. Create App Icons
- Use Android Asset Studio or similar tools
- Place icons in appropriate `res/mipmap-*` folders
- Update `android/app/src/main/AndroidManifest.xml`

#### 3. Generate App Bundle (AAB)
Google Play requires AAB format:

```bash
cd android
./gradlew bundleRelease
```

Your AAB will be in: `android/app/build/outputs/bundle/release/app-release.aab`

#### 4. Create Google Play Console Listing
1. Go to [Google Play Console](https://play.google.com/console)
2. Create new application
3. Fill in store listing information
4. Upload your AAB file
5. Complete content rating questionnaire
6. Submit for review

### Important Notes

⚠️ **Keep Your Keystore Safe**
- Store your keystore file in a secure location
- Never commit it to version control
- Back it up - you cannot update your app without it!

⚠️ **Test Thoroughly**
- Test on multiple devices
- Test all features in production mode
- Verify offline functionality
- Test payment flows

⚠️ **Production API Configuration**
Before building for production, ensure:
- API endpoints point to production servers
- All API keys are production keys
- Firebase configuration is correct
- Payment provider keys are production keys

### Build Scripts (Optional)

Add to `package.json`:
```json
"scripts": {
  "build:android": "npm run build && npx cap sync android && npx cap open android",
  "android:release": "cd android && ./gradlew assembleRelease"
}
```

Then run:
```bash
npm run build:android
```

---

## Quick Reference

### Debug Build (for testing)
```bash
npm run build
npx cap sync android
npx cap run android
```

### Release Build (for production)
```bash
npm run build
npx cap sync android
npx cap open android
# Then use Android Studio to build signed APK/AAB
```

### Check Logs
```bash
npx cap run android
# Or use Android Studio Logcat
```

---

For more help, see:
- [Capacitor Android Documentation](https://capacitorjs.com/docs/android)
- [Android Publishing Guide](https://developer.android.com/studio/publish)
- `android-troubleshooting.md` for common issues
