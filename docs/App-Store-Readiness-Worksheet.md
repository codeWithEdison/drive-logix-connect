# App Store readiness – worksheet

Use this to capture your answers. Fill in each section; we’ll use it to prepare the app and App Store Connect.

---

## 1. Apple Developer & account

| #   | Question                                                                       | Your answer |
| --- | ------------------------------------------------------------------------------ | ----------- |
| 1.1 | Do you already have an**Apple Developer Program** membership ($99/year)? | yes         |
| 1.2 | Is your**Apple ID** the same one you’ll use for App Store Connect?      | yes         |
| 1.3 | Do you have**2FA** enabled on that Apple ID? (Required.)                 | yes         |

---

## 2. App identity

| #   | Question                                                                                    | Your answer                             |
| --- | ------------------------------------------------------------------------------------------- | --------------------------------------- |
| 2.1 | **App name** on the store (e.g. “Loveway Logistics”). Exact spelling?               | Loveway Logistics                       |
| 2.2 | **Bundle ID** – confirm it stays `com.lovelycargo.app` (or write the correct one). | `com.lovelycargo.app`                 |
| 2.3 | **Subtitle** (short line under the name, e.g. “Cargo & delivery tracking”).         | professional logistics  and  delivery |
| 2.4 | **Primary category** (e.g. Business, Productivity).                                   | business                                |
| 2.5 | **Secondary category** (optional).                                                    |                                         |

---

## 3. Listing content

| #   | Question                                                                           | Your answer                                                           |
| --- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 3.1 | **Short description** (max 30 chars for under the icon).logistics  solution | logistics  solution                                                  |
| 3.2 | **Full description** (what the app does, who it’s for). Paste or summarize. | professional logistics  and  delivery across Rwanda                 |
| 3.3 | **Keywords** (comma‑separated, no spaces; max 100 chars total).             | logistics,delivery,loveway,masoro,rwnda                               |
| 3.4 | **Support URL** – full URL (e.g. https://yoursite.com/support).             | https://lovewaylogistics.com/support(not  now  develop  it please) |
| 3.5 | **Marketing URL** (optional).                                                |                                                                       |
| 3.6 | **Privacy Policy URL** – full URL (required).                               | https://lovewaylogistics.com/privacy                                  |

---

## 4. Privacy & data

| #   | Question                                                                                                                | Your answer |
| --- | ----------------------------------------------------------------------------------------------------------------------- | ----------- |
| 4.1 | Do you collect**location** (e.g. for tracking)? When (only when app open / also in background)?                   | yes         |
| 4.2 | Do you collect**photos/camera** (cargo/delivery photos)?                                                          | yes         |
| 4.3 | Do you use**Face ID / Touch ID**?                                                                                 | no          |
| 4.4 | Do you collect**name, email, or phone** (account/sign-up)?                                                        | yes         |
| 4.5 | Do you use**push notifications**?                                                                                 | yes         |
| 4.6 | Do you use**Google Sign-In** or other third‑party login? (If yes, Apple may require “Sign in with Apple” too.) | yes         |
| 4.7 | Do you use**analytics or crash reporting** (e.g. Firebase, Mixpanel)?                                             | no          |
| 4.8 | Do you use**advertising** or an advertising SDK?                                                                  | no          |
| 4.9 | Is your**Privacy Policy** already written and hosted at the URL you’ll submit?                                   | yes         |

---

## 5. App Review (demo access)

| #   | Question                                                                               | Your answer              |
| --- | -------------------------------------------------------------------------------------- | ------------------------ |
| 5.1 | Does the app require**login** to use main features?                              | yes                      |
| 5.2 | If yes:**Demo account username** (email or phone as used in app).                | umuliya@imperiumsarl.com |
| 5.3 | **Demo account password**.                                                       | client123                |
| 5.4 | Any**special steps** for reviewers? (e.g. “Select Rwanda branch after login.”) | no                       |

---

## 6. Technical & compliance

| #   | Question                                                                                                     | Your answer |
| --- | ------------------------------------------------------------------------------------------------------------ | ----------- |
| 6.1 | Do you use**custom encryption** (beyond HTTPS and standard iOS APIs)? (Usually No.)                    | no          |
| 6.2 | Are**all API calls over HTTPS** (no plain http)?                                                       | yes         |
| 6.3 | Do you need**background location** (e.g. driver tracking when app in background)?                      | yes         |
| 6.4 | **Push notifications**: Do you already have an **APNs key** (or certificate) in Apple Developer? | no          |
| 6.5 | **Age rating**: Any content that would require 17+ (e.g. gambling, violence)? (Logistics usually 4+.)  | 4+          |

---

## 7. Assets

| #   | Question                                                                            | Your answer |
| --- | ----------------------------------------------------------------------------------- | ----------- |
| 7.1 | Do you have a**1024×1024 px app icon** (no transparency)?                    | yes         |
| 7.2 | Do you have**screenshots** for required iPhone sizes (e.g. 6.7", 6.5", 5.5")? | yes         |
| 7.3 | Will you support**iPad**? (If yes, iPad screenshots needed too.)              | yes         |

---

## 8. Pricing & availability

| #   | Question                                                                       | Your answer |
| --- | ------------------------------------------------------------------------------ | ----------- |
| 8.1 | **Price**: Free or paid? If paid, which tier?                            | free        |
| 8.2 | **Countries/regions**: All, or only specific (e.g. Rwanda, East Africa)? | all         |

---

## 9. Optional / later

| #   | Question                                                                    | Your answer |
| --- | --------------------------------------------------------------------------- | ----------- |
| 9.1 | **In-app purchases** planned? (e.g. subscriptions, premium features.) | no          |
| 9.2 | **Version number** for first submission (e.g. 1.0.0).                 | 1.0.0       |
| 9.3 | **Build number** (e.g. 1). (Must increase for each upload.)           | 1           |

---

*After you fill this in, we can: add any missing Info.plist keys, draft App Store Connect text, and check encryption/export compliance.*
