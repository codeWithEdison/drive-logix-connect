# App Store – What You Need to Do Yourself

This guide lists everything **you** must do outside the codebase: Apple Developer portal, backend, App Store Connect, Xcode, and website. The app code is ready; these steps are required for submission and approval.

---

## 1. Install dependencies and sync iOS

Run in the project root:

```bash
npm install
npx cap sync ios
```

Then open the iOS app in Xcode:

```bash
npx cap open ios
```

---

## 2. Backend: Sign in with Apple endpoint

The app sends the Apple identity token to your backend. You **must** add an endpoint that:

- **URL:** `POST /auth/apple-login`
- **Body (JSON):**
  - `identityToken` (required) – JWT from Apple
  - `email` (optional) – from Apple (only on first sign-in)
  - `givenName` (optional)
  - `familyName` (optional)

**What the backend should do:**

1. Verify `identityToken` with Apple’s public keys (decode the JWT and verify signature; see [Apple’s docs](https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_rest_api/verifying_a_user)).
2. Extract the Apple user identifier (`sub` claim) from the token.
3. Find or create a user in your DB linked to that Apple `sub` (and optionally store email/name from the first sign-in).
4. Return the **same shape** as your existing login: `{ success: true, data: { user, tokens: { accessToken, refreshToken } } }`.

If you already have a Google login flow, mirror that for Apple (create/find user, issue your app’s JWT).

---

## 3. Apple Developer: Sign in with Apple

1. Go to [developer.apple.com](https://developer.apple.com) → **Certificates, Identifiers & Profiles** → **Identifiers**.
2. Open your App ID (`com.lovelycargo.app`).
3. Enable **Sign in with Apple** (checkbox).
4. Save.

---

## 4. Xcode: Sign in with Apple capability

1. Open the iOS project: `npx cap open ios`.
2. In the left sidebar, select the **App** target (blue icon).
3. Open the **Signing & Capabilities** tab.
4. Click **+ Capability**.
5. Add **Sign in with Apple**.
6. Xcode will create or update an entitlements file. Leave it as is.

---

## 5. Apple Developer: APNs key (push notifications)

1. [developer.apple.com](https://developer.apple.com) → **Certificates, Identifiers & Profiles** → **Keys**.
2. Click **+** to create a new key.
3. Name it (e.g. “Loveway APNs”).
4. Enable **Apple Push Notifications service (APNs)**.
5. Continue → Register → **Download** the `.p8` file.  
   **Important:** You can download it only once. Store it safely.
6. Note:
   - **Key ID** (shown on the key page)
   - **Team ID** (in the top-right of the Developer portal)
   - **Bundle ID:** `com.lovelycargo.app`

Later you’ll upload this key in App Store Connect (see below).

---

## 6. Xcode: Push Notifications capability

1. In Xcode, **App** target → **Signing & Capabilities**.
2. If **Push Notifications** is not listed, click **+ Capability** and add **Push Notifications**.

---

## 7. Support page (required by Apple)

Apple requires a working **Support URL**. You said the support page is not built yet.

- **Action:** Put a live page at **https://lovewaylogistics.com/support**.
- It can be simple: contact email, “Contact us”, or a short form. The URL must return 200 and real content (no “under construction” that looks broken).
- Use this exact URL in App Store Connect.

---

## 8. App Store Connect: App and version

1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com).
2. **My Apps** → create the app (or open it) with bundle ID **com.lovelycargo.app**.

Fill in:

| Field | Value |
|-------|--------|
| **App name** | Loveway Logistics |
| **Subtitle** | Max 30 characters, e.g. `Logistics & delivery` or `Cargo & delivery tracking` |
| **Category** | Business |
| **Privacy Policy URL** | https://lovewaylogistics.com/privacy |
| **Support URL** | https://lovewaylogistics.com/support (must be live) |

3. Create a version (e.g. **1.0.0**).
4. **Description**, **Keywords** (e.g. `logistics,delivery,loveway,masoro,rwanda`), **Screenshots** (iPhone 6.7", 6.5", 5.5"; iPad if you support it).
5. **App Review Information**:
   - **Sign-in required:** Yes.
   - **Demo account:**  
     - Username: **umuliya@imperiumsarl.com**  
     - Password: **client123**
   - **Notes:** (optional) e.g. “Select Rwanda branch if prompted.”

---

## 9. App Store Connect: Push Notifications key

1. In App Store Connect → your app → **App Information** (under **General**).
2. Find **Push Notifications**.
3. Upload your APNs key: Key ID, Team ID, and the `.p8` file you downloaded.

---

## 10. App Store Connect: App Privacy

1. Your app → **App Privacy**.
2. Declare data types to match the app:
   - **Location** (e.g. for tracking)
   - **Photos/Camera** (cargo/delivery photos)
   - **Contact info** (name, email, phone for account)
   - **Identifiers** (for push, device)
3. For each type, say whether it’s used for tracking, linked to identity, etc. No advertising if you don’t use ads.

---

## 11. App Store Connect: Export compliance

When you submit (or in the version form):

- **Does your app use encryption?**  
  Answer **No** (or “only standard HTTPS / exempt encryption”) if you only use HTTPS and standard APIs. This matches the `ITSAppUsesNonExemptEncryption = false` in Info.plist.

---

## 12. Xcode: Archive and upload

1. In Xcode, select **Any iOS Device** (or a connected device) as the run destination.
2. **Product** → **Archive**.
3. When the Organizer opens: **Distribute App** → **App Store Connect** → **Upload**.
4. Complete the steps (signing, options). After upload, wait until the build appears in App Store Connect (can take several minutes).
5. In App Store Connect, open the version **1.0.0** → **Build** → select the uploaded build.
6. Submit for review.

---

## 13. Subtitle length reminder

- **Max 30 characters** for the subtitle in App Store Connect.
- “professional logistics and delivery” is 35 characters — use something shorter, e.g. **Logistics & delivery** (21).

---

## Quick checklist (you do)

- [ ] `npm install` and `npx cap sync ios`
- [ ] Backend: implement `POST /auth/apple-login` and verify Apple token
- [ ] Apple Developer: enable **Sign in with Apple** for `com.lovelycargo.app`
- [ ] Xcode: add **Sign in with Apple** capability
- [ ] Apple Developer: create **APNs key**, download `.p8`, note Key ID and Team ID
- [ ] Xcode: add **Push Notifications** capability (if not already)
- [ ] Publish **Support URL** (https://lovewaylogistics.com/support)
- [ ] App Store Connect: create app, fill listing, subtitle ≤ 30 chars, demo account, privacy, export compliance
- [ ] App Store Connect: upload APNs key
- [ ] Xcode: Archive → Upload build → select build in App Store Connect → Submit for review

Once these are done, the app and listing are ready for submission.
