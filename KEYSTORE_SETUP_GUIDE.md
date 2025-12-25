# Android Keystore Setup Guide
## Loveway Logistics

---

## ⚠️ CRITICAL IMPORTANCE

**Your keystore is the ONLY way to update your app on Google Play Store.**

If you lose your keystore:
- ❌ You CANNOT update your existing app
- ❌ You must create a completely new app listing
- ❌ You lose all reviews, ratings, and downloads
- ❌ Users must uninstall and reinstall

**BACKUP YOUR KEYSTORE IN MULTIPLE SECURE LOCATIONS!**

---

## 🔐 Step 1: Generate Keystore

### Option A: Using Command Line (Recommended)

Open your terminal and run:

```bash
keytool -genkey -v -keystore loveway-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias loveway-key
```

### You'll be prompted for:

1. **Keystore password:** 
   - Choose a STRONG password (at least 12 characters)
   - Mix of uppercase, lowercase, numbers, and symbols
   - Example: `Lw@y2025!Secure#Key`
   - **SAVE THIS PASSWORD IMMEDIATELY!**

2. **First and last name:**
   - Enter your name or company name
   - Example: `Loveway Logistics Ltd`

3. **Organizational unit:**
   - Example: `Development Team`

4. **Organization:**
   - Example: `Loveway Logistics`

5. **City or Locality:**
   - Example: `Kigali`

6. **State or Province:**
   - Example: `Kigali City`

7. **Country Code (2 letters):**
   - Example: `RW` (for Rwanda)

8. **Confirm information:**
   - Type `yes`

9. **Key password:**
   - Press Enter to use same as keystore password
   - OR provide a different password (you'll need to remember both!)

### Result:
You'll have a file named `loveway-release-key.jks` in your current directory.

### Option B: Using Android Studio

1. Open your project in Android Studio
2. Go to **Build → Generate Signed Bundle / APK**
3. Select **Android App Bundle**
4. Click **Next**
5. Click **Create new...**
6. Fill in the form:
   - **Key store path:** Choose where to save (e.g., `D:\keystores\loveway-release-key.jks`)
   - **Password:** Create a strong password
   - **Confirm:** Re-enter password
   - **Alias:** `loveway-key`
   - **Password:** Same as keystore or different
   - **Validity:** 25 years (default)
   - **Certificate:**
     - First and Last Name: Your name/company
     - Organizational Unit: Development
     - Organization: Loveway Logistics
     - City: Kigali
     - State: Kigali City
     - Country Code: RW
7. Click **OK**

---

## 💾 Step 2: Secure Your Keystore

### Where to Store Your Keystore

**DO:**
- ✅ Store in multiple secure locations
- ✅ Use encrypted cloud storage (Google Drive, OneDrive, Dropbox)
- ✅ Keep a backup on an external hard drive
- ✅ Store in a password manager's secure notes
- ✅ Keep in a company vault/safe
- ✅ Share securely with team members who need access

**DON'T:**
- ❌ Commit to Git/GitHub/version control
- ❌ Store in project folder (easy to delete accidentally)
- ❌ Email without encryption
- ❌ Share the password insecurely
- ❌ Keep only one copy

### Recommended Backup Locations

1. **Primary Location:**
   ```
   D:\secure\keystores\loveway-release-key.jks
   ```

2. **Cloud Backup (Encrypted):**
   - Google Drive (in a "Secure" folder)
   - OneDrive
   - Dropbox

3. **Physical Backup:**
   - External hard drive
   - USB drive (in safe)

4. **Password Manager:**
   - Store keystore passwords in 1Password, LastPass, Bitwarden, etc.

---

## 📝 Step 3: Document Your Keystore Information

Create a secure document with this information:

```
===========================================
LOVEWAY LOGISTICS - ANDROID KEYSTORE INFO
===========================================

⚠️ KEEP THIS INFORMATION SECURE AND PRIVATE ⚠️

Keystore File Details:
----------------------
File Name: loveway-release-key.jks
File Location: D:\secure\keystores\loveway-release-key.jks
Key Algorithm: RSA
Key Size: 2048
Validity: 10000 days (expires: [YEAR])

Authentication Details:
-----------------------
Keystore Password: [YOUR_KEYSTORE_PASSWORD]
Key Alias: loveway-key
Key Password: [YOUR_KEY_PASSWORD]

Certificate Information:
------------------------
Common Name (CN): Loveway Logistics Ltd
Organizational Unit (OU): Development Team
Organization (O): Loveway Logistics
Locality (L): Kigali
State (ST): Kigali City
Country (C): RW

Google Play Information:
------------------------
App ID: com.lovelycargo.app
App Name: Loveway Logistics
Package Name: com.lovelycargo.app

Backup Locations:
-----------------
1. Primary: D:\secure\keystores\loveway-release-key.jks
2. Cloud: Google Drive > Secure > loveway-release-key.jks
3. Physical: External HDD (labeled "Backups 2025")
4. Password Manager: 1Password > Secure Notes

Created Date: [DATE]
Created By: [YOUR NAME]

Notes:
------
- DO NOT share this information insecurely
- DO NOT commit to version control
- Update this document if anything changes
- Verify backups regularly

===========================================
```

**Save this document as:** `LOVEWAY_KEYSTORE_INFO_PRIVATE.txt`

**Store in:**
- Password manager (1Password, LastPass, etc.)
- Encrypted USB drive
- Secure company documentation system

**DO NOT:**
- Commit to Git
- Store in plain text on your desktop
- Email without encryption

---

## 🔧 Step 4: Configure Gradle for Signing

### Option A: Manual Signing (Recommended for First Time)

Use Android Studio's GUI:
1. **Build → Generate Signed Bundle / APK**
2. Select your keystore file
3. Enter passwords
4. Build!

### Option B: Automated Signing (For Regular Builds)

#### 1. Create `keystore.properties` file

In your `android/` directory, create a file named `keystore.properties`:

```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=loveway-key
storeFile=D:/secure/keystores/loveway-release-key.jks
```

**IMPORTANT:** Add `keystore.properties` to `.gitignore`!

#### 2. Update `android/.gitignore`

Add this line:
```
keystore.properties
*.jks
*.keystore
```

#### 3. Update `android/app/build.gradle`

Add this code BEFORE the `android {` block:

```gradle
// Load keystore properties
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    namespace "com.lovelycargo.app"
    compileSdk rootProject.ext.compileSdkVersion
    
    defaultConfig {
        applicationId "com.lovelycargo.app"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }
    
    // Add signing config
    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
            }
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
        debug {
            // Debug builds don't need signing
        }
    }
    
    // ... rest of your config
}
```

#### 4. Build Signed AAB from Command Line

```bash
cd android
./gradlew bundleRelease
```

Your signed AAB will be at:
```
android/app/build/outputs/bundle/release/app-release.aab
```

---

## ✅ Step 5: Verify Your Setup

### Test Your Keystore

```bash
# View keystore information
keytool -list -v -keystore loveway-release-key.jks -alias loveway-key

# You'll be prompted for the keystore password
# This will show you certificate details
```

### Expected Output:
```
Alias name: loveway-key
Creation date: [DATE]
Entry type: PrivateKeyEntry
Certificate chain length: 1
Certificate[1]:
Owner: CN=Loveway Logistics Ltd, OU=Development Team, O=Loveway Logistics, L=Kigali, ST=Kigali City, C=RW
Issuer: CN=Loveway Logistics Ltd, OU=Development Team, O=Loveway Logistics, L=Kigali, ST=Kigali City, C=RW
Serial number: [SERIAL]
Valid from: [START DATE] until: [END DATE]
Certificate fingerprints:
    SHA1: [FINGERPRINT]
    SHA256: [FINGERPRINT]
```

### Build Test

Try building a signed APK:
```bash
cd android
./gradlew assembleRelease
```

If successful, you'll see:
```
BUILD SUCCESSFUL in [time]
```

And your APK at:
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## 🔄 Using Your Keystore

### For Each Release

1. **Update version in `build.gradle`:**
   ```gradle
   versionCode 2  // Increment
   versionName "1.0.1"  // Update
   ```

2. **Build:**
   ```bash
   npm run build:mobile
   cd android
   ./gradlew bundleRelease
   ```

3. **Find AAB:**
   ```
   android/app/build/outputs/bundle/release/app-release.aab
   ```

4. **Upload to Play Console**

---

## 🆘 Emergency Recovery

### If You Lose Your Keystore Password

Unfortunately, **there is NO way to recover a lost keystore password.**

Options:
1. If it's before first release: Create a new keystore
2. If already published: Contact Google Play support (they may help in rare cases)
3. Worst case: Create new app listing (lose all data)

### If You Lose Your Keystore File

1. Check all backup locations
2. Check recycle bin / trash
3. Use file recovery software
4. If truly lost and already published: Contact Google Play support

### Prevention is Key!
- Multiple backups
- Secure storage
- Document everything
- Share with trusted team members

---

## 📋 Keystore Security Checklist

- [ ] Keystore file created
- [ ] Strong passwords used
- [ ] Keystore information documented
- [ ] Keystore backed up in 3+ locations
- [ ] Passwords stored in password manager
- [ ] `.gitignore` configured to exclude keystore files
- [ ] `keystore.properties` created (if using automated signing)
- [ ] Team members informed about keystore importance
- [ ] Calendar reminder set to verify backups quarterly
- [ ] Test build completed successfully

---

## 🔗 Additional Resources

- [Android App Signing](https://developer.android.com/studio/publish/app-signing)
- [Keystore Generation Guide](https://developer.android.com/studio/publish/app-signing#generate-key)
- [Play App Signing](https://support.google.com/googleplay/android-developer/answer/9842756)

---

**Remember: Your keystore is irreplaceable. Treat it like a master key to your app! 🔐**


