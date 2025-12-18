# iOS Build Guide (Capacitor)

This project is a Vite + React app packaged as a native mobile app using **Capacitor**.

> **Important**: You **cannot build iOS on Windows**. You need a **Mac with Xcode**.

---

## 1) Requirements

### Hardware / OS

- **macOS** (local Mac, MacStadium, Codemagic, Bitrise, GitHub Actions macOS runner, etc.)
- **Xcode** installed (from the Mac App Store)

### Accounts

- **Apple Developer Program** (required to install on real devices reliably and for TestFlight/App Store)

### Software

- Node.js + npm installed on the Mac (use the same major versions you use on Windows when possible)
- CocoaPods (often required by iOS dependencies)

Install CocoaPods (one-time):

```bash
sudo gem install cocoapods
pod --version
```

---

## 2) Prepare the web build for mobile

From the repo root on the Mac:

```bash
npm ci
npm run build:mobile
```

What this does:

- Builds the web app in `dist/`
- Syncs Capacitor assets/plugins to Android (and later iOS)

---

## 3) Create the iOS project (first time only)

```bash
npx cap add ios
npx cap sync ios
npx cap open ios
```

This creates an `ios/` folder and opens the project in **Xcode**.

---

## 4) Configure iOS in Xcode (must-do)

Open Xcode → select the **App** target.

### 4.1 Bundle Identifier

- Set the bundle identifier to your app id (example):
  - `com.lovelycargo.app`

### 4.2 Signing

- Xcode → **Signing & Capabilities**:
  - Select your **Team**
  - Enable **Automatically manage signing**

### 4.3 Deployment target

- Choose a reasonable iOS deployment target supported by your users.

---

## 5) Required iOS permissions (Info.plist)

Your codebase uses Camera, Location, and Biometrics.

In Xcode:

- Target → **Info** → **Custom iOS Target Properties**
- Add these keys (examples):

### Camera

- `NSCameraUsageDescription`:
  - "We use the camera to capture cargo, delivery, and receipt photos."

### Photos (gallery)

- `NSPhotoLibraryUsageDescription`:
  - "We allow you to upload cargo and delivery photos from your library."

### Location

- `NSLocationWhenInUseUsageDescription`:
  - "We use your location to enable cargo tracking and driver live tracking."

> Avoid `NSLocationAlwaysAndWhenInUseUsageDescription` unless you truly need background tracking.

### Face ID (biometric)

- `NSFaceIDUsageDescription`:
  - "We use Face ID to securely authenticate you in the app."

If you miss these, the app may crash or be rejected.

---

## 6) Run on iOS Simulator

In Xcode:

- Choose a simulator device (e.g., iPhone 15)
- Click **Run**

If the app opens but shows a blank screen:

- Re-run:

```bash
npm run build:mobile
npx cap sync ios
```

Then rebuild in Xcode.

---

## 7) Run on a real iPhone

### On the iPhone

- Enable **Developer Mode** (iOS Settings)
- Connect iPhone to Mac via USB
- Trust the computer

### In Xcode

- Select your iPhone as the run target
- Click **Run**

Common issues:

- **Provisioning/profile errors**: ensure Apple Team selected + auto-signing enabled.

---

## 8) Networking rules (ATS / HTTPS)

iOS requires HTTPS by default.

This app should use the production API base URL (example):

- `https://api.lovewaylogistics.com`

Make sure your API is HTTPS and has a valid certificate.

If you try to use `http://...` on iOS, requests may fail unless you add ATS exceptions (not recommended for production).

---

## 9) Push notifications (current status)

In this repo, native push notifications were intentionally disabled to avoid Android Firebase crashes.

If you want iOS push later, you will need:

- Apple Push Notifications capability in Xcode
- APNs setup (and optionally Firebase/APNs bridging)
- Code changes to enable initialization on iOS

---

## 10) Store compliance items (iOS)

Before App Store submission:

- Host and provide:
  - Privacy Policy page (example route): `/privacy`
  - Account deletion instructions page (example route): `/delete-account`
- Ensure App Store Connect privacy answers match the app:
  - Location usage
  - Photos/camera usage
  - Account/profile data
  - Diagnostics

---

## 11) TestFlight release flow

In Xcode:

- Product → **Archive**
- Distribute App → **App Store Connect**
- Then in App Store Connect:
  - Add build to TestFlight
  - Invite internal/external testers

---

## 12) Troubleshooting checklist

### A) `npx cap sync ios` fails

- Run:

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

### C) App loads but API doesn’t work

- Confirm `VITE_API_BASE_URL` is set correctly for the build you’re running
- Confirm backend CORS is not blocking and HTTPS is valid

### D) Camera/Location prompts not shown

- Confirm Info.plist keys exist
- On simulator, some features behave differently than real devices

---

## 13) Recommended iOS folder policy

- Do **not** commit secrets:
  - `GoogleService-Info.plist`
  - certificates
  - provisioning profiles
  - `.p12` / `.pem`

Keep signing material outside git.
