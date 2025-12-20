# iOS Quick Start Guide - Run on Simulator

## ⚡ Quick Steps to Run on iOS Simulator

### Step 1: Switch Xcode Developer Directory (One-time setup)

Open Terminal and run:
```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```
Enter your Mac password when prompted.

### Step 2: Install CocoaPods (One-time setup)

In Terminal, run:
```bash
sudo gem install cocoapods
```
Enter your Mac password when prompted.

### Step 3: Install iOS Dependencies

In Terminal, navigate to the iOS folder and install pods:
```bash
cd /Users/mrdavid/SERVER/SELF/HELP/drive-logix-connect/ios/App
pod install
```

This will take a few minutes the first time.

### Step 4: Open Xcode Workspace

**IMPORTANT**: Always open the `.xcworkspace` file, NOT the `.xcodeproj` file!

```bash
cd /Users/mrdavid/SERVER/SELF/HELP/drive-logix-connect
open ios/App/App.xcworkspace
```

Or use the npm command:
```bash
npm run ios:open
```

### Step 5: Configure in Xcode

1. **Select the App target** (top-left, next to the stop button)
2. **Select "App" scheme** (next to the target selector)
3. **Select a Simulator** (e.g., "iPhone 15 Pro" or "iPhone 15")
   - Click the device selector (next to the scheme)
   - Choose any iPhone simulator

### Step 6: Configure Signing (Required)

1. In Xcode, click on **"App"** in the left sidebar (blue icon)
2. Select the **"App"** target (under TARGETS)
3. Click the **"Signing & Capabilities"** tab
4. Check **"Automatically manage signing"**
5. Select your **Team** from the dropdown
   - If you don't have a team, you can use "Personal Team" (your Apple ID)
   - You may need to sign in with your Apple ID first

### Step 7: Build and Run

1. Click the **Play button** (▶️) in the top-left, or press **⌘R**
2. Xcode will:
   - Build the project
   - Launch the iOS Simulator
   - Install and run the app

### Step 8: If You See Errors

#### Error: "No such module 'Capacitor'"
- Make sure you opened `App.xcworkspace` (NOT `App.xcodeproj`)
- Run `pod install` in `ios/App` folder

#### Error: "Signing requires a development team"
- Go to Signing & Capabilities tab
- Select your Team (or add your Apple ID)

#### Error: "Build failed"
- Check Xcode's Issue Navigator (left sidebar, warning icon)
- Try: Product → Clean Build Folder (⇧⌘K)
- Then build again (⌘R)

#### Simulator doesn't launch
- Go to Xcode → Settings → Platforms
- Download iOS Simulator if needed
- Or: Xcode → Window → Devices and Simulators → Download simulators

### Step 9: View Logs

- In Xcode, click **View** → **Debug Area** → **Show Debug Area** (or press ⇧⌘Y)
- You'll see console logs from your app

---

## 🎯 Quick Commands Reference

```bash
# Build web assets and sync
npm run build:mobile

# Open in Xcode
npm run ios:open

# Sync after web changes
npm run ios:sync

# Install pods (if needed)
cd ios/App && pod install
```

---

## ✅ Checklist Before Running

- [ ] Xcode is installed and opened at least once
- [ ] xcode-select points to Xcode (not CommandLineTools)
- [ ] CocoaPods is installed
- [ ] Pods are installed (`pod install` completed)
- [ ] Opened `App.xcworkspace` (NOT `.xcodeproj`)
- [ ] Selected a simulator device
- [ ] Signing is configured with a Team
- [ ] Web assets are built (`npm run build:mobile`)

---

## 🚀 After First Successful Run

Once the app runs successfully:
- You can make changes to web code
- Run `npm run build:mobile` to rebuild
- In Xcode, just press ⌘R again to rebuild and run

---

## 📱 Testing on Real Device (Optional)

1. Connect iPhone via USB
2. Trust the computer on iPhone
3. In Xcode, select your iPhone as the device
4. You may need to:
   - Enable Developer Mode on iPhone (Settings → Privacy & Security → Developer Mode)
   - Trust your developer certificate on iPhone

---

**Need Help?** Check `IOS_BUILD_GUIDE.md` for detailed troubleshooting.

