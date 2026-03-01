# App Store – action checklist

Based on your [App-Store-Readiness-Worksheet.md](./App-Store-Readiness-Worksheet.md). Use this list before and when submitting.

---

## Done in this project

- **Info.plist**
  - `NSLocationAlwaysAndWhenInUseUsageDescription` added (background location).
  - `UIBackgroundModes` → `location` added for background tracking.
  - `ITSAppUsesNonExemptEncryption` = `false` (export compliance).
- **App name**: Loveway Logistics.
- **Bundle ID**: `com.lovelycargo.app`.
- **Version**: 1.0.0, build 1.
- **Sign in with Apple**: Button on Login (iOS only), `AuthService.appleLogin`, and `loginWithApple` in context. Backend endpoint and Xcode capability still required (see §3 and [App-Store-Do-It-Yourself-Guide.md](./App-Store-Do-It-Yourself-Guide.md)).

---

## You must do before submission

### 1. Support URL (required)

- You noted the support page is not built yet. Apple requires a **working** URL.
- **Action**: Put a live page at `https://lovewaylogistics.com/support` (e.g. contact form, email, or “Contact us at …”) and use that exact URL in App Store Connect.

### 2. Subtitle length (30 characters max)

- Your subtitle: “professional logistics and delivery” = **35 characters** (too long).
- **Action**: In App Store Connect, use **30 characters or fewer**, e.g.:
  - `Logistics & delivery` (21)
  - `Cargo & delivery tracking` (25)

### 3. Sign in with Apple (required) – **implemented in app**

- The app now has a **Sign in with Apple** button on the Login screen (iOS only). You still must:
  1. In [Apple Developer](https://developer.apple.com) → your App ID → enable **Sign in with Apple**.
  2. In Xcode → App target → **Signing & Capabilities** → add **Sign in with Apple** capability.
  3. **Backend:** Implement `POST /auth/apple-login` (see [App-Store-Do-It-Yourself-Guide.md](./App-Store-Do-It-Yourself-Guide.md)). The app sends identityToken and optional email/givenName/familyName; backend verifies with Apple and returns user + tokens.
- Without the backend and Xcode capability, review may be **rejected** (Guideline 4.8).

### 4. APNs key for push notifications

- You don’t have an APNs key yet. Needed for production push.
- **Action**:
  1. [Apple Developer](https://developer.apple.com) → **Certificates, Identifiers & Profiles** → **Keys**.
  2. Create a new key → enable **Apple Push Notifications service (APNs)** → Continue → Register → **Download** the `.p8` file (only once).
  3. Note **Key ID** and **Team ID**; keep the **.p8** file secure.
  4. In **App Store Connect** → your app → **App Information** → **Push Notifications** → upload the key (Key ID, Team ID, .p8).
  5. In Xcode, ensure **Push Notifications** is in **Signing & Capabilities** for the App target.

### 5. App Store Connect – complete these

- **App Information**
  - Name: **Loveway Logistics**
  - Subtitle: (see §2 above, ≤ 30 chars)
  - Category: **Business**
  - Privacy Policy URL: **https://lovewaylogistics.com/privacy**
  - Support URL: **https://lovewaylogistics.com/support** (must be live; see §1)
- **Pricing and Availability**: Free, **All countries/regions** (or your chosen list).
- **App Privacy**: Declare **Location**, **Photos/Camera**, **Contact Info** (name/email/phone), **Identifiers** (for push). No advertising; no custom analytics if you don’t use them.
- **Version 1.0.0**
  - Description, keywords, screenshots (iPhone 6.7", 6.5", 5.5"; iPad if you support it).
  - **App Review Information**:
    - Demo account: **umuliya@imperiumsarl.com** / **client123**
    - Notes: (leave blank or add any special steps).

### 6. Xcode before archive

- **Version**: 1.0.0 (Marketing Version).
- **Build**: 1 (Current Project Version).
- **Team**: Your Apple Developer team.
- **Bundle ID**: `com.lovelycargo.app`.
- **Capabilities**: Push Notifications (and Sign in with Apple once implemented).
- Build for **Release** → **Product → Archive** → **Distribute App** → App Store Connect.

### 7. Export compliance (in App Store Connect)

- When asked about encryption: answer that the app **does not use non‑exempt encryption** (only HTTPS / standard APIs).  
- This matches `ITSAppUsesNonExemptEncryption` = `false` in Info.plist.

### 8. Age rating

- You chose **4+**. Complete the age rating questionnaire in App Store Connect accordingly (no gambling, etc.).

---

## Optional / later

- **iPad**: You said you’ll support iPad; ensure you have iPad screenshots and any iPad-specific settings in App Store Connect.
- **Face ID**: Info.plist still has the Face ID usage description; remove it if you never plan to use Face ID to avoid unnecessary permission.

---

## Quick reference – your answers

| Item            | Value |
|-----------------|--------|
| App name        | Loveway Logistics |
| Bundle ID       | com.lovelycargo.app |
| Demo login      | umuliya@imperiumsarl.com / client123 |
| Version / Build | 1.0.0 / 1 |
| Price           | Free |
| Regions         | All |
| Privacy Policy  | https://lovewaylogistics.com/privacy |
| Support URL     | https://lovewaylogistics.com/support (must be live) |

---

## Submission order

1. Support page live; subtitle ≤ 30 chars.
2. Implement Sign in with Apple and add capability.
3. Create and upload APNs key; enable Push in Xcode.
4. Fill App Store Connect (listing, privacy, pricing, review info).
5. Build → Archive → Upload build; select build in the version; submit for review.
