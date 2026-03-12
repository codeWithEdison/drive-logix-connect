# App Store submission – full guide

This document explains **what is already set up** for your Loveway Logistics iOS app and **what you need to do** to submit it to the Apple App Store. Use it as your main reference.

---

## Table of contents

1. [What this is about](#1-what-this-is-about)
2. [What is already done (in the code)](#2-what-is-already-done-in-the-code)
3. [What you must do yourself (in order)](#3-what-you-must-do-yourself-in-order)
4. [Quick reference](#4-quick-reference)
5. [Other docs in this folder](#5-other-docs-in-this-folder)

---

## 1. What this is about

- Your app is built with **Capacitor** (web app wrapped for iOS).
- To publish on the **App Store**, Apple requires:
  - Correct **app metadata** (name, description, screenshots, privacy, etc.).
  - A **Support URL** that works.
  - **Sign in with Apple** if you offer other third‑party sign-in (e.g. Google).
  - **Push Notifications** set up (APNs key) if the app uses push.
  - **Export compliance** (encryption) declared.
  - A **demo account** for App Review if the app requires login.

Everything in **section 2** is already implemented in your frontend and backend. Everything in **section 3** you do in Apple Developer, Xcode, App Store Connect, and your server.

---

## 2. What is already done (in the code)

### Frontend (this repo)

| Item                   | Where                                               | What it does                                                                                                                                     |
| ---------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Info.plist**         | `ios/App/App/Info.plist`                            | Background location usage text, export compliance (`ITSAppUsesNonExemptEncryption = false`), `UIBackgroundModes` (location) for driver tracking. |
| **Privacy strings**    | Same file                                           | Camera, Photo Library, Location (when in use + always), Face ID – all have usage descriptions.                                                   |
| **Sign in with Apple** | `src/pages/Login.tsx`, `AuthContext`, `authService` | Apple button on Login (shown only on iOS). Calls `POST /auth/apple-login` with `identityToken` and optional name/email.                          |
| **Support page**       | `src/pages/Support.tsx`                             | Route `/support` with contact emails (support@, info@lovewaylogistics.com) and links to Privacy/Terms. Footer links to it.                       |
| **Capacitor plugin**   | `package.json`                                      | `@capacitor-community/apple-sign-in` for native Sign in with Apple.                                                                              |
| **i18n**               | `src/lib/i18n/locales/*.json`                       | Support page and Sign in with Apple strings in English, Kinyarwanda, French.                                                                     |

### Backend (LOVELY CARGO PLATFORM/backend)

| Item                     | Where                                             | What it does                                                                                                                                                                                                  |
| ------------------------ | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Apple login endpoint** | `POST /auth/apple-login`                          | Accepts `identityToken`, optional `email`, `givenName`, `familyName`. Verifies the JWT with Apple’s keys, finds or creates user by `apple_sub`/email, returns `user` + `tokens` (same shape as Google login). |
| **User model**           | `prisma/schema.prisma`                            | Optional `apple_sub` field to link Apple users.                                                                                                                                                               |
| **Migration**            | `prisma/migrations/20260301000000_add_apple_sub/` | Adds `apple_sub` column to `users`.                                                                                                                                                                           |
| **Dependency**           | `package.json`                                    | `jwks-rsa` for verifying Apple’s JWT.                                                                                                                                                                         |
| **Env**                  | `src/config/env.ts`                               | `APPLE_CLIENT_ID` (default `com.lovelycargo.app`).                                                                                                                                                            |

So in the codebase:

- **Support URL** is implemented at `/support`; once you deploy the frontend, `https://lovewaylogistics.com/support` will work.
- **Sign in with Apple** is implemented in the app and backend; you still need to enable it in Apple Developer and Xcode and add the capability.
- **Export compliance** is declared in Info.plist (no custom encryption).
- **Background location** is declared and configured for drivers.

---

## 3. What you must do yourself (in order)

Do these **outside** the code (Apple portals, Xcode, terminal, hosting).

### Step A: Terminal (frontend)

```bash
cd "path/to/frontend"
npm install
npx cap sync ios
```

Then open the iOS project:

```bash
npx cap open ios
```

### Step B: Terminal (backend)

```bash
cd "path/to/backend"
npm install
npx prisma migrate deploy
npx prisma generate
```

This applies the `apple_sub` migration and regenerates the Prisma client.

### Step C: Apple Developer – Sign in with Apple

1. Go to [developer.apple.com](https://developer.apple.com) → **Certificates, Identifiers & Profiles** → **Identifiers**.
2. Open the App ID **com.lovelycargo.app**.
3. Enable **Sign in with Apple** (checkbox).
4. Save.

### Step D: Xcode – capabilities

1. With the iOS project open (**npx cap open ios**), select the **App** target.
2. Open **Signing & Capabilities**.
3. Click **+ Capability** and add:
   - **Sign in with Apple**
   - **Push Notifications** (if not already there)

### Step E: Apple Developer – APNs key (if not done)

You already created the key **Loveway Logistics Push** (Key ID **7X8SH3S668**). If you still need to:

1. **Keys** → create a new key.
2. Enable **Apple Push Notifications service (APNs)**.
3. Configure for **Production** (and your app).
4. Register and **download the .p8 file once**; store it safely.
5. Note **Key ID** and **Team ID**.

### Step F: App Store Connect – upload APNs key

1. [appstoreconnect.apple.com](https://appstoreconnect.apple.com) → your app → **App Information** (under General).
2. In **Push Notifications**, upload your key: **Key ID**, **Team ID**, and the **.p8** file.

### Step G: Deploy the frontend (Support URL)

Deploy the frontend so that **https://lovewaylogistics.com/support** is live. Apple will check this URL; it must return a real page (the Support page we added).

### Step H: App Store Connect – app and version

1. Create the app (or open it) with bundle ID **com.lovelycargo.app**.
2. Fill in:
   - **Name:** Loveway Logistics
   - **Subtitle:** 30 characters or fewer (e.g. **Logistics & delivery**)
   - **Category:** Business
   - **Privacy Policy URL:** https://lovewaylogistics.com/privacy
   - **Support URL:** https://lovewaylogistics.com/support
3. Create a version (e.g. **1.0.0**), add description, keywords, screenshots (required iPhone sizes; iPad if you support it).
4. **App Privacy:** declare data types (Location, Photos, Contact info, Identifiers) as used by the app.
5. **App Review Information:**
   - Sign-in required: **Yes**
   - Demo account: **umuliya@imperiumsarl.com** / **client123**
   - Notes: optional (e.g. “Select Rwanda branch if prompted”).
6. **Export compliance:** answer that the app does **not** use non‑exempt encryption (only HTTPS/standard APIs).

### Step I: Xcode – archive and upload

1. Select **Any iOS Device** (or a connected device).
2. **Product** → **Archive**.
3. In Organizer: **Distribute App** → **App Store Connect** → upload.
4. In App Store Connect, select the new build for the version and **Submit for Review**.

---

## 4. Quick reference

| What                        | Value                                       |
| --------------------------- | ------------------------------------------- |
| **App name**                | Loveway Logistics                           |
| **Bundle ID**               | com.lovelycargo.app                         |
| **Support URL**             | https://lovewaylogistics.com/support        |
| **Privacy Policy URL**      | https://lovewaylogistics.com/privacy        |
| **Demo account**            | umuliya@imperiumsarl.com / client123        |
| **APNs key name**           | Loveway Logistics Push (Key ID: 7X8SH3S668) |
| **Subtitle (max 30 chars)** | e.g. Logistics & delivery                   |

---

## 5. Other docs in this folder

- **[App-Store-Readiness-Worksheet.md](./App-Store-Readiness-Worksheet.md)** – Questionnaire you filled; answers used for the checklist and guide.
- **[App-Store-Action-Checklist.md](./App-Store-Action-Checklist.md)** – Short checklist of “done in project” vs “you must do” (support URL, subtitle, Sign in with Apple, APNs, App Store Connect).
- **[App-Store-Do-It-Yourself-Guide.md](./App-Store-Do-It-Yourself-Guide.md)** – Step‑by‑step for each manual task (backend endpoint details, Apple Developer, Xcode, App Store Connect, archive/upload).

Use **this file** for the big picture; use the **Action Checklist** and **Do-It-Yourself Guide** when you are doing each step.
