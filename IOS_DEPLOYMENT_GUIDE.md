# iOS Deployment Guide - Loveway Logistics

## Current App Configuration
- **Bundle ID**: `com.lovelycargo.app`
- **App Name**: Loveway Logistics
- **Version**: 1.0
- **Build**: 1
- **iOS Deployment Target**: 14.0

---

## Part 1: Testing on Real iPhone Device

### Prerequisites
1. **Apple Developer Account** (Free or Paid)
   - Free account: Can test on your own device for 7 days
   - Paid account ($99/year): Can test on multiple devices, longer validity

2. **Physical iPhone** connected via USB

3. **Xcode** installed and updated

### Steps to Test on Real Device

#### Step 1: Connect Your iPhone
1. Connect your iPhone to your Mac via USB
2. Unlock your iPhone and trust the computer if prompted
3. In Xcode, go to **Window → Devices and Simulators** (or `Cmd + Shift + 2`)
4. Verify your device appears in the list

#### Step 2: Configure Signing in Xcode
1. Open the project in Xcode: `npx cap open ios`
2. Select the **App** project in the left sidebar
3. Select the **App** target
4. Go to **Signing & Capabilities** tab
5. Check **"Automatically manage signing"**
6. Select your **Team** (your Apple ID)
   - If you don't see your team, click **"Add Account..."** and sign in with your Apple ID
7. Xcode will automatically:
   - Create a provisioning profile
   - Set up code signing
   - Register your device

#### Step 3: Select Your Device
1. In Xcode toolbar, click the device selector (next to the Play button)
2. Select your connected iPhone (not a simulator)

#### Step 4: Build and Run
1. Click the **Play** button (or `Cmd + R`)
2. If prompted, trust the developer certificate on your iPhone:
   - Go to **Settings → General → VPN & Device Management**
   - Tap your developer certificate
   - Tap **"Trust [Your Name]"**

#### Step 5: First Launch
- The app will install and launch on your device
- Test all features, especially:
  - Network connectivity (API calls)
  - Camera functionality
  - Location services
  - Push notifications (if configured)

---

## Part 2: App Store Deployment

### Prerequisites
1. **Paid Apple Developer Account** ($99/year)
   - Sign up at: https://developer.apple.com/programs/
   - Wait for approval (usually instant, but can take 24-48 hours)

2. **App Store Connect** access
   - Go to: https://appstoreconnect.apple.com
   - Sign in with your Apple Developer account

### Step-by-Step App Store Submission

#### Phase 1: Prepare Your App in Xcode

##### 1. Update Version and Build Numbers
1. In Xcode, select **App** project → **App** target
2. Go to **General** tab
3. Update:
   - **Version**: `1.0.0` (user-facing version)
   - **Build**: `1` (increment for each submission)

##### 2. Configure App Icons
1. Ensure all app icon sizes are set in `Assets.xcassets/AppIcon.appiconset`
2. Required sizes:
   - 20x20, 29x29, 40x40, 60x60, 76x76, 83.5x83.5, 1024x1024

##### 3. Configure App Store Screenshots (Optional but Recommended)
- Prepare screenshots for different device sizes
- Store them for later upload in App Store Connect

##### 4. Archive Your App
1. In Xcode, select **Any iOS Device** (or **Generic iOS Device**) from device selector
2. Go to **Product → Archive**
3. Wait for the archive to complete
4. The **Organizer** window will open automatically

#### Phase 2: App Store Connect Setup

##### 1. Create App Record
1. Go to https://appstoreconnect.apple.com
2. Click **"My Apps"**
3. Click **"+"** → **"New App"**
4. Fill in:
   - **Platform**: iOS
   - **Name**: Loveway Logistics
   - **Primary Language**: English
   - **Bundle ID**: `com.lovelycargo.app` (must match your Xcode project)
   - **SKU**: `lovelycargo-ios-001` (unique identifier, can be anything)
   - **User Access**: Full Access (or Limited if you have a team)

##### 2. App Information
1. Go to **App Information** tab
2. Fill in:
   - **Category**: Business / Productivity
   - **Subcategory**: (optional)
   - **Privacy Policy URL**: https://lovewaylogistics.com/privacy (if you have one)

##### 3. Pricing and Availability
1. Set **Price**: Free or Paid
2. Set **Availability**: All countries or specific regions

#### Phase 3: Upload Build to App Store Connect

##### 1. Validate Archive
1. In Xcode Organizer, select your archive
2. Click **"Validate App"**
3. Follow the wizard:
   - Select your team
   - Choose **"Automatically manage signing"**
   - Click **"Validate"**
4. Fix any errors if they appear

##### 2. Distribute App
1. In Xcode Organizer, select your archive
2. Click **"Distribute App"**
3. Choose **"App Store Connect"**
4. Click **"Next"**
5. Choose **"Upload"**
6. Select your team
7. Choose **"Automatically manage signing"**
8. Review the summary
9. Click **"Upload"**
10. Wait for upload to complete (can take 10-30 minutes)

#### Phase 4: Complete App Store Listing

##### 1. App Store Information
1. Go back to App Store Connect
2. Select your app
3. Go to **"App Store"** tab
4. Fill in required fields:

**App Preview and Screenshots**
- Upload screenshots for iPhone 6.7" (iPhone 14 Pro Max, etc.)
- Upload screenshots for iPhone 6.5" (iPhone 11 Pro Max, etc.)
- Upload screenshots for iPhone 5.5" (iPhone 8 Plus, etc.)
- Minimum: 1 screenshot per device size

**Description**
- App description (up to 4000 characters)
- Keywords (up to 100 characters, comma-separated)
- Support URL: https://lovewaylogistics.com/support
- Marketing URL: (optional)

**App Review Information**
- Contact Information:
  - First Name, Last Name
  - Phone Number
  - Email Address
- Demo Account (if your app requires login):
  - Username
  - Password
  - Notes for reviewer

**Version Information**
- What's New in This Version: (Release notes)
- App Icon: (1024x1024, already set from Xcode)
- Copyright: © 2025 Loveway Logistics

##### 2. Build Selection
1. Go to **"TestFlight"** or **"App Store"** tab
2. Under **"Build"** section, click **"+ Build"**
3. Select the build you just uploaded
4. Wait for processing (can take 10-60 minutes)

#### Phase 5: Submit for Review

##### 1. TestFlight (Optional - Recommended)
1. Go to **"TestFlight"** tab
2. Add internal testers (up to 100)
3. Add external testers (up to 10,000) - requires Beta App Review
4. Test your app before public release

##### 2. Submit for App Store Review
1. Go to **"App Store"** tab
2. Scroll to **"Submit for Review"**
3. Answer **Export Compliance** questions:
   - Does your app use encryption? (Usually "Yes" for HTTPS)
   - If yes, select "My app uses, contains, or implements cryptography"
4. Click **"Submit for Review"**

#### Phase 6: Review Process
- **Typical Review Time**: 24-48 hours
- **Status Updates**: You'll receive emails at each stage
- **Possible Outcomes**:
  - ✅ **Approved**: App goes live immediately or on scheduled date
  - ⚠️ **Rejected**: Fix issues and resubmit
  - 📝 **In Review**: Waiting for Apple's review

---

## Important Notes

### Code Signing
- **Automatic Signing**: Recommended for most cases
- **Manual Signing**: Only if you have specific requirements
- **Certificates**: Xcode manages these automatically with "Automatically manage signing"

### Version Management
- **Version** (CFBundleShortVersionString): User-facing version (e.g., 1.0.0)
- **Build** (CFBundleVersion): Internal build number (must increment for each submission)
- Example: Version 1.0.0, Build 1 → Version 1.0.0, Build 2 → Version 1.0.1, Build 1

### App Store Guidelines
- Review: https://developer.apple.com/app-store/review/guidelines/
- Common rejection reasons:
  - Missing privacy policy
  - Incomplete app functionality
  - Broken links
  - Missing demo account (if login required)

### Privacy Requirements
- **Privacy Policy**: Required if you collect user data
- **App Privacy**: Fill out in App Store Connect
- **NSPrivacyTracking**: Add to Info.plist if you track users

---

## Quick Commands Reference

```bash
# Build for production
npm run build -- --mode native

# Sync to iOS
npx cap copy ios

# Open in Xcode
npx cap open ios

# Archive in Xcode
# Product → Archive (Cmd + B, then Product → Archive)
```

---

## Troubleshooting

### "No devices found"
- Check USB connection
- Trust the computer on iPhone
- Check if device is unlocked

### "Signing certificate not found"
- Go to Xcode → Preferences → Accounts
- Add your Apple ID
- Download certificates

### "Bundle ID already exists"
- Change Bundle ID in Xcode project settings
- Update `capacitor.config.ts` to match
- Or use existing Bundle ID if you own it

### "Upload failed"
- Check internet connection
- Verify Apple Developer account is active
- Try uploading again (sometimes temporary)

---

## Next Steps After Approval

1. **Monitor Reviews**: Check App Store reviews regularly
2. **Update Regularly**: Keep app updated with bug fixes
3. **Analytics**: Consider adding analytics to track usage
4. **Marketing**: Promote your app launch

---

## Support Resources

- **Apple Developer Support**: https://developer.apple.com/support/
- **App Store Connect Help**: https://help.apple.com/app-store-connect/
- **Capacitor iOS Docs**: https://capacitorjs.com/docs/ios

---

Good luck with your deployment! 🚀
