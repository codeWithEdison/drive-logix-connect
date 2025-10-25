# Android Testing Troubleshooting Guide

## 🚨 Common Issues & Solutions

### 1. Build/Sync Issues

#### Permission Error (EPERM)

```
Error: EPERM: operation not permitted, open 'cordova_plugins.js'
```

**Solutions:**

1. Close Android Studio completely
2. Delete the `android` folder
3. Run `npx cap add android` to recreate
4. Run `npm run build:mobile` again

#### Sync Fails

```
× update android - failed!
```

**Solutions:**

1. Check if Android Studio is running
2. Close Android Studio
3. Run `npx cap sync android`
4. Reopen Android Studio

### 2. App Launch Issues

#### App Crashes on Launch

**Check:**

1. Android Studio logcat for error messages
2. All required permissions are granted
3. Firebase configuration is correct
4. API endpoints are accessible

**Solutions:**

1. Check `capacitor.config.ts` server URL
2. Verify environment variables
3. Test with a simple build first

#### White Screen on Launch

**Causes:**

1. JavaScript errors
2. Missing dependencies
3. Network connectivity issues

**Solutions:**

1. Check browser console (if using Chrome DevTools)
2. Verify all imports are correct
3. Test with `npm run dev` first

### 3. Plugin Issues

#### Capacitor Plugins Not Working

**Check:**

1. Plugin is properly installed
2. Plugin is added to `capacitor.config.ts`
3. Native permissions are granted

**Solutions:**

1. Run `npx cap sync android`
2. Check Android permissions in `AndroidManifest.xml`
3. Verify plugin initialization in code

#### Camera Not Working

**Check:**

1. Camera permission is granted
2. Camera plugin is properly initialized
3. Device has camera hardware

**Solutions:**

1. Grant camera permission in device settings
2. Test on physical device if emulator has no camera
3. Check camera service initialization

#### GPS Not Working

**Check:**

1. Location permission is granted
2. GPS is enabled on device
3. Location services are available

\*\*Solutions:1. Grant location permission 2. Enable GPS in device settings 3. Test with high accuracy mode

### 4. Network Issues

#### API Calls Failing

**Check:**

1. Network connectivity
2. Server URL is correct
3. CORS settings on server
4. Authentication tokens

**Solutions:**

1. Test API endpoints in browser
2. Check network logs in Android Studio
3. Verify server is running
4. Check authentication flow

#### Offline Mode Not Working

**Check:**

1. Network service is initialized
2. Offline storage is working
3. Sync queue is processing

**Solutions:**

1. Test network status changes
2. Verify IndexedDB is working
3. Check sync service initialization

### 5. Performance Issues

#### App is Slow

**Check:**

1. Bundle size is reasonable
2. No memory leaks
3. Images are optimized
4. Network requests are efficient

**Solutions:**

1. Use Chrome DevTools to profile
2. Implement lazy loading
3. Optimize images
4. Reduce API calls

#### Memory Issues

**Check:**

1. No memory leaks in code
2. Images are properly disposed
3. Event listeners are cleaned up

**Solutions:**

1. Use React DevTools Profiler
2. Implement proper cleanup
3. Optimize image handling

### 6. UI Issues

#### Layout Problems

**Check:**

1. CSS is mobile-friendly
2. Touch targets are adequate size
3. Responsive design is working

**Solutions:**

1. Test on different screen sizes
2. Use mobile-first CSS
3. Implement proper breakpoints

#### Touch Issues

**Check:**

1. Touch targets are 44px minimum
2. No overlapping elements
3. Gestures are properly implemented

**Solutions:**

1. Increase button sizes
2. Fix z-index issues
3. Test gesture recognition

## 🔧 Debugging Tools

### Android Studio Logcat

- Filter by your app package name
- Look for ERROR and WARN levels
- Check for JavaScript errors

### Chrome DevTools

- Connect to Android device
- Use `chrome://inspect`
- Debug JavaScript and network

### React DevTools

- Install React DevTools extension
- Use Profiler for performance
- Check component state

## 📱 Testing Devices

### Recommended Emulators

1. **Pixel 6 Pro API 34** - Latest Android
2. **Pixel 8 API 35** - Newest features
3. **Pixel 8a API 35** - Mid-range device

### Physical Device Testing

- Test on actual Android device
- Different screen sizes
- Different Android versions
- Real network conditions

## 🚀 Quick Fixes

### Reset Everything

```bash
# Clean and rebuild
rm -rf android
npx cap add android
npm run build:mobile
npx cap open android
```

### Fix Java Issues

#### JAVA_HOME Error

```
ERROR: JAVA_HOME is set to an invalid directory: C:\Program Files\Eclipse Adoptium\jdk-17.x.x
```

**Solutions:**

1. Find your Java installation: `dir "C:\Program Files\Java"`
2. Set correct JAVA_HOME: `export JAVA_HOME="C:\Program Files\Java\jdk-24"`
3. Verify: `echo $JAVA_HOME`
4. Test: `java -version`

**Permanent Fix:**
Create `run-android.bat` file with:

```batch
@echo off
set JAVA_HOME=C:\Program Files\Java\jdk-24
set PATH=%JAVA_HOME%\bin;%PATH%
npx cap run android --target="Pixel_6_Pro_API_Baklava"
```

#### Missing Capacitor Plugins

```
Failed to resolve import "@capacitor/share"
```

**Solutions:**

1. Install missing plugin: `npm install @capacitor/share`
2. Sync Android: `npx cap sync android`
3. Verify plugins: Check the sync output for plugin list

### Check Dependencies

```bash
# Verify all packages
npm list @capacitor/core
npm list @capacitor/android
npm list @capacitor/cli
```

### Test Web Version First

```bash
# Test in browser first
npm run dev
# Then test mobile
npm run android:dev
```

## 📞 Getting Help

### Logs to Collect

1. Android Studio logcat output
2. Browser console errors
3. Network request logs
4. Screenshots of issues

### Information to Provide

1. Android version
2. Device model
3. Steps to reproduce
4. Expected vs actual behavior

---

**Remember**: Test incrementally - get basic functionality working first, then add advanced features!
