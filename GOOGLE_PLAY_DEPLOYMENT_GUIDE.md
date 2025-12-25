# Google Play Store Deployment Guide

## Loveway Logistics Android App

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Version Configuration](#version-configuration)
3. [Testing in Android Studio](#testing-in-android-studio)
4. [Building Release APK/AAB](#building-release-apkaab)
5. [Google Play Console Setup](#google-play-console-setup)
6. [Store Listing Requirements](#store-listing-requirements)
7. [Submission Checklist](#submission-checklist)

---

## 🔧 Prerequisites

### Required Tools

- ✅ Android Studio (Latest version recommended)
- ✅ Java JDK 21 (as configured in your project)
- ✅ Google Play Developer Account ($25 one-time fee)

### Before You Start

- [ ] Test app thoroughly on multiple devices
- [ ] Verify all API endpoints are production-ready
- [ ] Check all payment integrations work correctly
- [ ] Ensure Firebase configuration is correct
- [ ] Review and update privacy policy
- [ ] Prepare app screenshots and promotional materials

---

## 🔢 Version Configuration

### Current Configuration

**File**: `android/app/build.gradle`

```gradle
defaultConfig {
    applicationId "com.lovelycargo.app"
    versionCode 1      // Increment for EVERY release
    versionName "1.0.0" // User-visible version
}
```

### Version Update Rules

1. **versionCode**: Must be incremented for every release (Google Play requirement)

   - First release: 1
   - Second release: 2
   - Third release: 3, etc.

2. **versionName**: User-facing version (follow semantic versioning)
   - Major changes: 2.0.0
   - New features: 1.1.0
   - Bug fixes: 1.0.1

**Example for second release:**

```gradle
versionCode 2
versionName "1.0.1"
```

---

## 🧪 Testing in Android Studio

### Step 1: Run Debug Build

1. In Android Studio, click on the **Run** button (green play icon) or press `Shift + F10`
2. Select your connected device or emulator
3. Wait for the app to install and launch

### Step 2: Test Critical Features

- [ ] User registration and login
- [ ] Cargo creation and tracking
- [ ] Real-time GPS tracking
- [ ] Payment processing (use test mode)
- [ ] Photo uploads
- [ ] Notifications (if enabled)
- [ ] Offline functionality
- [ ] App performance and responsiveness

### Step 3: Check Logs

- Open **Logcat** in Android Studio (bottom panel)
- Filter by your package: `com.lovelycargo.app`
- Look for any errors or warnings

### Common Issues:

- **White Screen**: Check Logcat for JavaScript errors
- **Network Errors**: Verify API endpoints are accessible
- **Crash on Launch**: Check permissions in AndroidManifest.xml

---

## 📦 Building Release APK/AAB

### Option A: Build Signed APK/AAB (Recommended)

#### 1. Generate Keystore (First Time Only)

```bash
keytool -genkey -v -keystore loveway-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias loveway-key
```

**Important Prompts:**

- **Password**: Choose a strong password (save it securely!)
- **Name**: Your name or company name
- **Organization**: Loveway Logistics
- **City/State/Country**: Your location details

**⚠️ CRITICAL: Save These Files Safely!**

- `loveway-release-key.jks` - Your keystore file
- **Keystore password**
- **Key alias**: `loveway-key`
- **Key password**

**Store in multiple secure locations - you CANNOT update your app without this keystore!**

#### 2. Configure Signing in Android Studio

1. In Android Studio, go to **Build → Generate Signed Bundle / APK**
2. Select **Android App Bundle** (AAB) - _Google Play requirement_
3. Click **Next**
4. Click **Create new...** (first time) or **Choose existing...**
   - **Key store path**: Browse to your `.jks` file
   - **Password**: Enter your keystore password
   - **Key alias**: `loveway-key`
   - **Key password**: Enter your key password
5. Click **Next**
6. Select **release** build variant
7. Check **Export encrypted key** (recommended)
8. Click **Finish**

#### 3. Build Location

Your signed AAB will be located at:

```
android/app/release/app-release.aab
```

### Option B: Command Line Build

#### Create `keystore.properties` file:

```bash
# Create in android/ directory
cat > android/keystore.properties << EOF
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=loveway-key
storeFile=path/to/loveway-release-key.jks
EOF
```

#### Update `android/app/build.gradle`:

Add before `android {` block:

```gradle
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
keystoreProperties.load(new FileInputStream(keystorePropertiesFile))

android {
    ...
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

#### Build AAB:

```bash
cd android
./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

---

## 🏪 Google Play Console Setup

### Step 1: Create Google Play Developer Account

1. Go to [Google Play Console](https://play.google.com/console)
2. Sign in with your Google account
3. Pay $25 one-time registration fee
4. Complete account verification (may take 24-48 hours)

### Step 2: Create New App

1. Click **Create app**
2. Fill in app details:
   - **App name**: Loveway Logistics
   - **Default language**: English (US) or your preferred language
   - **App or game**: App
   - **Free or paid**: Free (or Paid if applicable)
3. Accept declarations
4. Click **Create app**

### Step 3: Set Up App Dashboard

#### A. Store Listing

Navigate to: **Grow → Store presence → Main store listing**

**Required Information:**

- **App name**: Loveway Logistics
- **Short description** (80 characters max):
  ```
  Professional cargo tracking and logistics management platform
  ```
- **Full description** (4000 characters max):

  ```
  Loveway Logistics is your complete solution for cargo transportation and tracking.

  KEY FEATURES:
  • Real-time GPS tracking of your shipments
  • Easy cargo creation and management
  • Multiple branch support
  • Secure online payments via Paypack
  • Invoice generation and history
  • Driver assignment and monitoring
  • Push notifications for status updates
  • Multi-language support (English, French, Kinyarwanda)

  FOR CLIENTS:
  Track your cargo in real-time, view delivery status, make secure payments, and access your complete shipment history.

  FOR DRIVERS:
  Receive delivery assignments, update cargo status, capture delivery photos, and manage your delivery schedule.

  FOR ADMINISTRATORS:
  Complete dashboard for fleet management, cargo tracking, driver management, and comprehensive reporting.

  Loveway Logistics - Delivering reliability and transparency in every shipment.
  ```

- **App icon**: 512 x 512 px PNG (high-res)
- **Feature graphic**: 1024 x 500 px PNG/JPG
- **Phone screenshots**: At least 2 screenshots (recommended: 4-8)
  - Resolution: 1080 x 1920 px or higher
  - Showcase key features
- **7-inch tablet screenshots**: Optional but recommended
- **10-inch tablet screenshots**: Optional

**Categories:**

- **App category**: Business
- **Tags**: logistics, cargo, tracking, transportation, shipping

**Contact details:**

- Email: support@lovewaylogistics.com (or your support email)
- Phone: Optional
- Website: Your company website

**Privacy policy URL**: Required

- Must be publicly accessible
- Example: `https://lovewaylogistics.com/privacy-policy`

#### B. App Content

Navigate to: **Policy → App content**

**Privacy Policy**: Upload or link your privacy policy

**Ads**: Declare if your app contains ads

- [ ] No ads (if applicable)
- [ ] Contains ads (if applicable)

**App access**: Explain if special access is needed

- Provide test credentials if login is required:
  ```
  Test Account:
  Email: test@lovewaylogistics.com
  Password: [provide test password]
  ```

**Content rating**: Complete the questionnaire

- Answer honestly about app content
- Most business apps are rated "Everyone" or "PEGI 3"

**Target audience**: Select your target age group

- Primary: 18+ (Adults)

**News app**: No (unless applicable)

**COVID-19 contact tracing**: No (unless applicable)

**Data safety**: Required

- **Data collected**:
  - Personal info (name, email, phone)
  - Location (for tracking)
  - Photos (for deliveries)
  - Financial info (for payments)
- **Data sharing**: Describe how data is shared
- **Security practices**: Encryption, secure connections

#### C. Countries and Regions

Navigate to: **Grow → Store presence → Countries / regions**

- Select countries where your app will be available
- Start with your primary market (e.g., Rwanda)
- Can add more countries later

#### D. Pricing & Distribution

- **Price**: Free (or set price)
- **Distributed countries**: Select all applicable
- **Content guidelines**: Agree to policies
- **US export laws**: Agree to compliance

---

## 🚀 App Release Process

### Step 1: Create Release

1. Go to **Release → Production**
2. Click **Create new release**

### Step 2: Upload App Bundle

1. Upload your `app-release.aab` file
2. Google Play will automatically generate APKs for different device configurations

### Step 3: Release Notes

Add release notes for this version:

```
Initial release of Loveway Logistics

Features:
• Real-time cargo tracking
• Secure payment integration
• Multi-role support (Client, Driver, Admin)
• Invoice management
• GPS tracking and route optimization
• Push notifications
• Multi-language support

Thank you for using Loveway Logistics!
```

### Step 4: Review and Rollout

1. Review all information
2. Click **Save**
3. Click **Review release**
4. Click **Start rollout to Production**

### Step 5: Wait for Review

- Google typically reviews apps within 1-3 days
- You'll receive email notifications about review status
- Address any issues if rejected

---

## 📸 Store Listing Requirements

### App Icon (512x512 px)

- Clear, recognizable logo
- No transparency
- PNG format
- High quality

### Feature Graphic (1024x500 px)

- Showcases your app's main benefit
- Include app name if not obvious from icon
- Eye-catching design

### Screenshots (Minimum 2, recommended 4-8)

Required for phone (1080x1920 or higher):

1. **Home/Login Screen**: First impression
2. **Main Dashboard**: Show key features
3. **Cargo Tracking**: Real-time tracking interface
4. **Payment Screen**: Secure payment process
5. **Driver Interface**: Driver features (optional)
6. **Reports/Analytics**: Admin features (optional)

**Screenshot Tips:**

- Use real data (anonymized if needed)
- Show the app in action
- Highlight unique features
- Use device frames for professional look
- Add captions if helpful

### Promo Video (Optional but recommended)

- 30 seconds to 2 minutes
- YouTube link
- Showcase main features
- Professional quality

---

## ✅ Pre-Submission Checklist

### Technical

- [ ] App builds successfully without errors
- [ ] All Capacitor plugins work correctly
- [ ] Tested on multiple Android versions (8.0+)
- [ ] Tested on different screen sizes
- [ ] App icon displays correctly
- [ ] Splash screen works properly
- [ ] Deep links work (if applicable)
- [ ] Permissions are correctly requested
- [ ] App doesn't crash under normal use
- [ ] Performance is acceptable (fast loading, smooth animations)

### Content

- [ ] Privacy policy is published and accessible
- [ ] Terms of service are published
- [ ] Store listing is complete and accurate
- [ ] Screenshots are high quality and represent current version
- [ ] App description is clear and accurate
- [ ] Contact information is correct
- [ ] Content rating questionnaire completed

### Legal & Compliance

- [ ] App complies with Google Play policies
- [ ] GDPR compliance (if applicable)
- [ ] Payment processing is secure and compliant
- [ ] All required disclosures are made
- [ ] Intellectual property rights are cleared
- [ ] Export compliance confirmed

### Production Readiness

- [ ] API endpoints point to production servers
- [ ] Firebase configured for production
- [ ] Payment gateway uses production keys
- [ ] Error tracking/monitoring set up (Sentry, Firebase Crashlytics, etc.)
- [ ] Analytics configured (Firebase Analytics, etc.)
- [ ] Test accounts created for reviewer
- [ ] Support email is monitored

---

## 🔄 Updating Your App

### For Future Updates:

1. **Increment Version**:

   ```gradle
   versionCode 2  // Always increment
   versionName "1.0.1"  // Update as needed
   ```

2. **Build Process**:

   - Run: `npm run build:mobile`
   - Sync: `npx cap sync android`
   - Build: Generate signed AAB in Android Studio

3. **Release Notes**:

   - Describe what's new
   - List bug fixes
   - Mention improvements

4. **Upload to Play Console**:
   - Go to Production track
   - Create new release
   - Upload new AAB
   - Add release notes
   - Review and rollout

---

## 🐛 Common Issues & Solutions

### Build Issues

**Problem**: Build fails with "Keystore not found"
**Solution**: Check keystore path in `keystore.properties`

**Problem**: "Duplicate resources" error
**Solution**: Clean and rebuild:

```bash
cd android
./gradlew clean
./gradlew bundleRelease
```

**Problem**: Out of memory during build
**Solution**: Increase heap size in `android/gradle.properties`:

```
org.gradle.jvmargs=-Xmx4096m
```

### Upload Issues

**Problem**: "Version code has already been used"
**Solution**: Increment `versionCode` in `build.gradle`

**Problem**: "APK signature verification failed"
**Solution**: Ensure you're using the correct keystore

### Review Issues

**Problem**: App rejected for "Incomplete content"
**Solution**: Complete all required sections in Play Console

**Problem**: "Privacy policy not accessible"
**Solution**: Ensure privacy policy URL is public and working

**Problem**: "App crashes on launch"
**Solution**: Test thoroughly, check Logcat, ensure all dependencies are included

---

## 📞 Support Resources

- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Android Developer Documentation](https://developer.android.com/distribute/googleplay)
- [Capacitor Android Documentation](https://capacitorjs.com/docs/android)
- [App Signing Best Practices](https://developer.android.com/studio/publish/app-signing)

---

## 🎯 Quick Command Reference

```bash
# Build for mobile
npm run build:mobile

# Open Android Studio
npx cap open android

# Sync Capacitor
npx cap sync android

# Build release AAB (command line)
cd android
./gradlew bundleRelease

# Build release APK (command line)
./gradlew assembleRelease

# Check connected devices
adb devices

# Install APK on device
adb install android/app/release/app-release.apk

# View logs
adb logcat | grep "com.lovelycargo.app"
```

---

## ✨ Post-Launch Checklist

After your app is live:

- [ ] Monitor crash reports in Play Console
- [ ] Respond to user reviews
- [ ] Track key metrics (installs, ratings, retention)
- [ ] Plan regular updates
- [ ] Set up automated testing
- [ ] Create update schedule
- [ ] Monitor for security issues
- [ ] Keep dependencies updated

---

**Good luck with your launch! 🚀**

For questions or issues, refer to the Capacitor and Android documentation, or check the Play Console help center.
