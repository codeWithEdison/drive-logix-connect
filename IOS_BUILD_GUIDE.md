# iOS Production Build Guide

## Building Your App for App Store

### Prerequisites
1. ✅ **macOS** (required - cannot build iOS on Windows)
2. ✅ **Xcode** installed (from Mac App Store)
3. ✅ **Apple Developer Program** account (required for App Store submission)
4. ✅ **CocoaPods** installed (for iOS dependencies)

### Install CocoaPods (one-time)
```bash
sudo gem install cocoapods
pod --version
```

---

## Step 1: Install iOS Platform (First Time Only)

If you haven't added iOS platform yet:

```bash
npm install @capacitor/ios
npx cap add ios
```

This creates the `ios/` folder in your project.

---

## Step 2: Build Your Web Assets

From the repo root on your Mac:

```bash
npm ci
npm run build:mobile
```

What this does:
- Builds the web app in `dist/` with `--mode native`
- Syncs Capacitor assets/plugins to both Android and iOS
- Removes push notifications plugin (to avoid crashes)

---

## Step 3: Open iOS Project in Xcode

```bash
npm run ios:open
# Or manually:
npx cap open ios
```

This opens the project in **Xcode**.

---

## Step 4: Configure iOS in Xcode (Must-Do)

Open Xcode → select the **App** target.

### 4.1 Bundle Identifier

- Set the bundle identifier to your app id:
  - Example: `com.lovelycargo.app`
  - Must match your App Store Connect app ID

### 4.2 Signing & Capabilities

- Xcode → **Signing & Capabilities** tab:
  - Select your **Team** (Apple Developer account)
  - Enable **Automatically manage signing**
  - Xcode will create provisioning profiles automatically

### 4.3 Deployment Target

- Choose a reasonable iOS deployment target (e.g., iOS 13.0+)
- Consider your user base's device compatibility

### 4.4 Version Information

- **General** tab → **Identity**:
  - **Version**: Your app version (e.g., "1.0.0")
  - **Build**: Build number (increment for each release, e.g., "1", "2", "3")

---

## Step 5: Required iOS Permissions (Info.plist)

Your app uses Camera, Location, and Biometrics. These **must** be configured or the app will crash or be rejected.

In Xcode:
- Target → **Info** → **Custom iOS Target Properties**
- Add these keys with user-friendly descriptions:

### Camera
- **Key**: `NSCameraUsageDescription`
- **Value**: "We use the camera to capture cargo, delivery, and receipt photos."

### Photos (Gallery)
- **Key**: `NSPhotoLibraryUsageDescription`
- **Value**: "We allow you to upload cargo and delivery photos from your library."

### Location
- **Key**: `NSLocationWhenInUseUsageDescription`
- **Value**: "We use your location to enable cargo tracking and driver live tracking."

> ⚠️ **Note**: Avoid `NSLocationAlwaysAndWhenInUseUsageDescription` unless you truly need background tracking. App Store reviewers are strict about location permissions.

### Face ID / Biometric Authentication
- **Key**: `NSFaceIDUsageDescription`
- **Value**: "We use Face ID to securely authenticate you in the app."

### Network (if needed)
- **Key**: `NSAppTransportSecurity` (if you need HTTP exceptions - not recommended for production)

---

## Step 6: Run on iOS Simulator

In Xcode:
1. Choose a simulator device (e.g., iPhone 15 Pro)
2. Click **Run** (⌘R)

If the app opens but shows a blank screen:
```bash
npm run build:mobile
npm run ios:sync
```

Then rebuild in Xcode.

---

## Step 7: Run on a Real iPhone

### On the iPhone
1. Enable **Developer Mode**:
   - Settings → Privacy & Security → Developer Mode → Enable
   - Restart iPhone if prompted
2. Connect iPhone to Mac via USB
3. Trust the computer when prompted

### In Xcode
1. Select your iPhone as the run target (top toolbar)
2. Click **Run** (⌘R)
3. On iPhone: Settings → General → VPN & Device Management → Trust your developer certificate

Common issues:
- **Provisioning/profile errors**: Ensure Apple Team selected + auto-signing enabled
- **Device not recognized**: Check USB connection, trust computer, enable Developer Mode

---

## Step 8: Networking Rules (ATS / HTTPS)

iOS requires HTTPS by default (App Transport Security).

This app should use the production API base URL:
- `https://api.lovewaylogistics.com`

Make sure your API:
- ✅ Uses HTTPS
- ✅ Has a valid SSL certificate
- ✅ CORS is configured correctly

If you try to use `http://...` on iOS, requests will fail unless you add ATS exceptions (not recommended for production).

---

## Step 9: Build for App Store

### Option A: Using Xcode (Recommended)

1. In Xcode, select **Any iOS Device** or **Generic iOS Device** as the target
2. **Product** → **Archive**
3. Wait for the archive to complete
4. **Window** → **Organizer** (or click **Distribute App**)
5. Select your archive
6. Click **Distribute App**
7. Choose **App Store Connect**
8. Click **Next**
9. Choose **Upload** (or Export if you want to save the .ipa file)
10. Select your distribution certificate and provisioning profile (auto-managed if signing is enabled)
11. Click **Upload**

The app will be uploaded to App Store Connect.

### Option B: Using Command Line (Advanced)

```bash
# Build archive
xcodebuild -workspace ios/App/App.xcworkspace \
  -scheme App \
  -configuration Release \
  -archivePath ios/build/App.xcarchive \
  archive

# Export IPA for App Store
xcodebuild -exportArchive \
  -archivePath ios/build/App.xcarchive \
  -exportPath ios/build/ipa \
  -exportOptionsPlist ios/ExportOptions.plist
```

---

## Step 10: TestFlight Release Flow

### In App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to your app
3. Go to **TestFlight** tab
4. Wait for processing (can take 10-30 minutes)
5. Once processed:
   - Add build to a TestFlight group
   - Invite internal testers (up to 100)
   - Invite external testers (up to 10,000)
   - Testers receive email invitations

### Testing Checklist

Before submitting to App Store:
- [ ] Test on multiple iOS devices (iPhone, iPad if supported)
- [ ] Test all features in production mode
- [ ] Verify API calls work with production backend
- [ ] Test camera and photo upload
- [ ] Test location services
- [ ] Test biometric authentication
- [ ] Test payment flows (if applicable)
- [ ] Verify app works offline (if applicable)
- [ ] Check for memory leaks and performance issues

---

## Step 11: App Store Submission

### 11.1 Prepare Store Listing

In App Store Connect:

1. **App Information**:
   - App name
   - Subtitle
   - Category
   - Privacy Policy URL (required)
   - Support URL

2. **Pricing and Availability**:
   - Price tier
   - Availability by country

3. **App Privacy**:
   - Answer privacy questions:
     - Location data (Yes - for tracking)
     - Photos/Camera (Yes - for cargo photos)
     - User account data (Yes)
     - Biometric data (Yes - for Face ID)

4. **Version Information**:
   - What's New (release notes)
   - Screenshots (required):
     - iPhone 6.7" (iPhone 14 Pro Max, 15 Pro Max)
     - iPhone 6.5" (iPhone 11 Pro Max, XS Max)
     - iPhone 5.5" (iPhone 8 Plus)
     - iPad Pro 12.9" (if iPad supported)
   - App Preview (optional video)
   - Description
   - Keywords
   - Support URL
   - Marketing URL (optional)

5. **App Review Information**:
   - Contact information
   - Demo account credentials (if needed)
   - Notes for reviewer

### 11.2 Submit for Review

1. Select the build you want to submit
2. Fill in all required information
3. Answer export compliance questions
4. Click **Submit for Review**

Review typically takes 24-48 hours.

---

## Step 12: Store Compliance Items

Before App Store submission, ensure:

### Required Pages
- ✅ **Privacy Policy** page (example route: `/privacy`)
  - Must be accessible via HTTPS
  - Must explain what data you collect and how you use it
- ✅ **Terms of Service** (recommended)
- ✅ **Account Deletion** instructions (example route: `/delete-account`)
  - Required for apps with user accounts (App Store requirement)

### App Store Connect Privacy Answers
Must match your app's actual behavior:
- ✅ Location usage (Yes - for tracking)
- ✅ Photos/camera usage (Yes - for cargo photos)
- ✅ Account/profile data (Yes)
- ✅ Biometric data (Yes - for Face ID)
- ✅ Diagnostics/analytics (if applicable)

---

## Step 13: Push Notifications (Current Status)

In this repo, native push notifications were intentionally **disabled** to avoid Android Firebase crashes.

If you want iOS push notifications later, you will need:
- Apple Push Notifications capability in Xcode
- APNs setup (and optionally Firebase/APNs bridging)
- Code changes to enable initialization on iOS
- Push notification certificates in Apple Developer portal

---

## Step 14: Troubleshooting Checklist

### A) `npx cap sync ios` fails

```bash
rm -rf node_modules
npm ci
npx cap sync ios
```

### B) CocoaPods errors

From `ios/App`:
```bash
pod repo update
pod install
```

Then reopen Xcode workspace (not project):
```bash
open ios/App/App.xcworkspace
```

### C) App loads but API doesn't work

- Confirm `VITE_API_BASE_URL` is set correctly for the build you're running
- Confirm backend CORS is not blocking iOS requests
- Confirm backend uses HTTPS with valid certificate
- Check Xcode console for network errors

### D) Camera/Location prompts not shown

- Confirm Info.plist keys exist with proper descriptions
- On simulator, some features behave differently than real devices
- Check Xcode console for permission errors

### E) Archive fails with signing errors

- Ensure **Automatically manage signing** is enabled
- Select correct **Team** in Signing & Capabilities
- Check Apple Developer account has valid certificates
- Try cleaning build folder: **Product** → **Clean Build Folder** (⇧⌘K)

### F) Upload to App Store Connect fails

- Check internet connection
- Verify Apple ID has App Store Connect access
- Check for expired certificates
- Try using **Transporter** app (separate from Xcode)

### G) White screen after build

- Check for build errors: `npm run build`
- Verify `capacitor.config.ts` has correct `webDir: "dist"`
- Check Xcode console for JavaScript errors
- Ensure `dist/` folder is synced: `npm run ios:sync`

---

## Step 15: Recommended iOS Folder Policy

### Do NOT commit to git:
- `GoogleService-Info.plist` (if using Firebase)
- Certificates (`.cer`, `.p12`)
- Provisioning profiles (`.mobileprovision`)
- Private keys (`.pem`)
- `ios/App/App.xcarchive` (build artifacts)

### Keep in git:
- `ios/App/App.xcodeproj`
- `ios/App/App/Info.plist`
- `ios/App/Podfile`
- `ios/App/Podfile.lock` (optional, but recommended)

---

## Quick Reference

### Development Build (for testing)
```bash
npm run build:mobile
npm run ios:open
# Then run in Xcode
```

### Production Build (for App Store)
```bash
npm run build:mobile
npm run ios:open
# Then in Xcode: Product → Archive → Distribute App
```

### Sync iOS (after web changes)
```bash
npm run ios:sync
```

### Check Logs
- Xcode → **View** → **Debug Area** → **Show Debug Area** (⇧⌘Y)
- Or use Console app on Mac to view device logs

---

## Build Scripts Reference

Available npm scripts:
- `npm run build:mobile` - Build web assets and sync both Android & iOS
- `npm run ios:open` - Open iOS project in Xcode
- `npm run ios:sync` - Sync Capacitor plugins and web assets to iOS
- `npm run ios:dev` - Build and run on iOS (requires Xcode)

---

## Important Notes

⚠️ **Keep Your Certificates Safe**
- Store certificates and provisioning profiles securely
- Never commit them to version control
- Back them up - you cannot update your app without them!

⚠️ **Test Thoroughly**
- Test on multiple iOS devices and versions
- Test all features in production mode
- Verify offline functionality
- Test payment flows
- Test with different network conditions

⚠️ **Production API Configuration**
Before building for production, ensure:
- API endpoints point to production servers (`https://api.lovewaylogistics.com`)
- All API keys are production keys
- Firebase configuration is correct (if used)
- Payment provider keys are production keys

⚠️ **App Store Review Guidelines**
- Follow [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- Ensure privacy policy is accessible
- Provide demo account if app requires login
- Respond to reviewer questions promptly

---

## Additional Resources

- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)
- [Apple App Store Connect](https://appstoreconnect.apple.com)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Xcode Documentation](https://developer.apple.com/documentation/xcode)
- [TestFlight Documentation](https://developer.apple.com/testflight/)

---

For Android build instructions, see: `ANDROID_BUILD_GUIDE.md`
