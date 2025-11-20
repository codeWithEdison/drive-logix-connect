# Loveway Logistics Platform

## User Acceptance Test (UAT) – Full Role & Route Coverage

**Test window:** November 2025  **Test type:** Guided UAT dry-run  
**Scope:** Validate every page and critical component wired through `App.tsx`, role-based navigation in `DynamicSidebar.tsx`, and cargo lifecycle controls surfaced in `CargoDetailModal.tsx`.

**Pre-flight checklist**

1. Fill in `Tester Name`, `Role`, `Date`, `Environment` (e.g., `uat.lovewaylogistics.africa`) and `Device/Browser`.
2. Use fresh seeded data where possible; otherwise log referenced IDs.
3. Capture evidence (screenshots/video + browser console logs) for every failed or flaky step.
4. After completing all suites, export this Markdown to PDF, sign, and store in the QA share.

| Tester | Role | Date | Environment | Browser / Device |
| ------ | ---- | ---- | ----------- | ---------------- |
|        |      |      |             |                  |

---

## Route & Feature Coverage Matrix

This matrix maps every route declared in `App.tsx` and the sidebar entries per role to the test IDs below.

| Role        | Route(s) / Nav label                                                                                        | Feature focus                                     | Linked Test |
| ----------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ----------- |
| Public      | `/`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`                          | Marketing + auth flows                            | P1, P2      |
| Client      | `/` (Dashboard)                                                                                             | Widgets, stats, quick actions                     | C1          |
| Client      | `/create-cargo`                                                                                             | `CreateCargoForm`                                 | C2          |
| Client      | `/my-cargos`, `/tracking`, `/history`                                                                       | Cargo list, tracking, audit trail                 | C3, C4      |
| Client      | `/payment/:invoiceId`, `/payment-success`, `/payment/callback`, `/invoices`                                 | Payment + billing                                 | C5          |
| Client      | `/profile`                                                                                                  | Shared profile & logout                           | X1          |
| Driver      | `/driver`, `/driver/cargos`, `/driver/deliveries`, `/driver/history`                                        | Assignment board + workflow                       | D1–D4       |
| Admin       | `/admin`, `/admin/cargos`, `/admin/assignments`                                                             | Ops dashboard + `CargoDetailModal` admin controls | A1–A3       |
| Admin       | `/admin/drivers`, `/admin/trucks`                                                                           | Resource admin                                    | A4          |
| Admin       | `/admin/fleet-monitor`, `/admin/vehicles/:vehicleId/live`                                                   | Live tracking                                     | A5          |
| Admin       | `/admin/payment-verifications`, `/admin/invoices`, `/admin/reports`                                         | Finance & reporting                               | A6, A7      |
| Super Admin | `/super-admin`, `/super-admin/users`, `/super-admin/settings`, `/super-admin/logs`                          | Platform governance                               | S1–S3       |
| Super Admin | `/superadmin/branches`, `/superadmin/branches/:id`, `/superadmin/districts`, `/superadmin/cargo-categories` | Master data                                       | S4, S5      |
| Super Admin | Access to admin routes (per App.tsx)                                                                        | Ensure elevated visibility                        | S6          |

---

## Public Entry Flows

### Test P1 – Landing Page & Localized Marketing (`/`)

**Goal:** Validate `LandingPage` content, SEO tags, and language switch.

1. Visit `/` unauthenticated; ensure hero, statistics, FAQ, and CTA buttons render without console errors.
2. Toggle language via `LanguageSwitcher`; verify translations update.
3. Scroll to footer; confirm contact info and social links open correctly.
4. Hit primary CTA → redirect to `/register`.
   **Validation:** Working? IDs/notes, Screenshots, Other observations.

### Test P2 – Authentication Lifecycle (`/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`)

**Goal:** Ensure all auth routes from `App.tsx` function.

1. Register a new user, capture verification email (Mailtrap), and complete `/verify-email`.
2. Attempt login before verification → expect error.
3. Login after verification; ensure redirect to role default route (`getDefaultRoute`).
4. Trigger Forgot Password flow, receive reset link, update password, and log in again.
   **Validation:** Working? Tokens/IDs, Evidence, Other observations.

---

## Client Suite

### Test C1 – Dashboard & Dynamic Sidebar (`/`)

**Goal:** Confirm client sees correct sidebar entries from `DynamicSidebar.tsx` and widgets load.

1. Log in as client; ensure sidebar shows Dashboard, Create Cargo, My Cargos, Live Tracking, Invoices.
2. Validate widgets (total deliveries, quick actions) load from APIs without errors.
3. Collapse sidebar → verify tooltip labels for icons.
   **Validation:** Working? Widget data references, Evidence, Notes.

### Test C2 – Create Cargo (`/create-cargo`)

**Goal:** Exercise `CreateCargoForm` including document uploads and validation.

1. Launch form via nav or dashboard CTA.
2. Enter pickup/destination, schedule, cargo metadata; upload docs.
3. Submit; capture Cargo Reference number shown in toast/modal.
4. Confirm entry appears under `My Cargos` with status `pending`.
   **Validation:** Cargo ID, Evidence, Errors/observations.

### Test C3 – Cargo Management & Tracking (`/my-cargos`, `/tracking/:id`, `/tracking`)

**Goal:** Ensure lists + tracking map operate.

1. On `My Cargos`, filter by status, open detail row, and launch `TrackingPage`.
2. Validate `LiveTrackingMap` renders, handles offline fallback, and updates ETA.
3. Use search to locate cargo by reference.
   **Validation:** Cargo IDs, Map evidence, Notes.

### Test C4 – History & Audit Trail (`/history`)

**Goal:** Validate completed cargo history and CSV export.

1. Navigate to History, apply date filters, sort columns.
2. Export table; ensure downloaded CSV contains expected rows.
3. Click a record → confirm read-only modal renders.
   **Validation:** Export filename, Evidence, Notes.

### Test C5 – Payments & Billing (`/payment/:invoiceId`, `/payment-success`, `/payment/callback`, `/invoices`)

**Goal:** Verify Flutterwave flow plus invoice center.

1. From cargo detail, click `Proceed to Payment`, land on `/payment/:invoiceId`.
2. Complete mock payment; ensure redirect to `/payment-success` and callback updates invoice status.
3. Visit `/invoices`, verify new invoice shows Paid status and PDF download works.
   **Validation:** Payment reference, Invoice ID, Evidence, Notes.

### Test C6 – Notifications & Rating (`CargoDetailModal`, `DeliveryConfirmationForm`)

**Goal:** Cover client-side interactions tied to `CargoDetailModal`.

1. Open cargo detail after delivery; use `Download Receipt`.
2. Trigger `Rate Delivery`; submit review and ensure rating badge updates.
3. Confirm toast + email notification for rating received.
   **Validation:** Cargo ID, Evidence, Notes.

---

## Driver Suite

### Test D1 – Driver Dashboard & Sidebar (`/driver`)

**Goal:** Ensure driver sees dashboard cards, availability, and sidebar entries (Dashboard, Assigned Cargos, My Deliveries).

1. Login as driver; confirm KPIs load.
2. Toggle availability/offline state if supported and ensure persistence.
   **Validation:** Driver ID, Evidence, Notes.

### Test D2 – Assignment Inbox (`/driver/cargos`) & `CargoDetailModal`

**Goal:** Test accept/reject with countdown logic.

1. Open a pending assignment; verify countdown timer from modal.
2. Accept assignment; ensure status transitions and success toast.
3. For another assignment, reject using reason modal; confirm admin sees update.
   **Validation:** Assignment IDs, Evidence, Notes.

### Test D3 – Active Deliveries & Status Updates (`/driver/deliveries`)

**Goal:** Cover pickup/delivery photo uploads and status changes.

1. Choose active cargo → tap `Mark Picked Up`, upload photos (CargoImageType.PICKUP).
2. After in-transit, tap `Mark Delivered`, upload POD images.
3. Confirm statuses propagate to client view.
   **Validation:** Cargo IDs, Image references, Notes.

### Test D4 – Driver History & Profile (`/driver/history`, `/profile`)

**Goal:** Ensure completed jobs list, filtering, and shared profile route function.

1. Visit driver history, filter by month, export if available.
2. Open `/profile`, update contact info, and log out via sidebar footer (`logout` from `useAuth`).
   **Validation:** Profile change diff, Evidence, Notes.

---

## Admin Suite

### Test A1 – Admin Dashboard (`/admin`)

**Goal:** Validate widgets, alerts, and sidebar entries (Dashboard, All Cargos, Assignments, Drivers, Vehicles, Fleet Monitor, Invoices, Payment Verifications, Reports).

1. Log in as admin; ensure summary stats + alerts match backend data.
2. Collapse sidebar and verify tooltip labels.
   **Validation:** Evidence, Notes.

### Test A2 – All Cargos + `CargoDetailModal` Admin Actions (`/admin/cargos`)

**Goal:** Exercise manual status transitions, cancellation, and cost visibility.

1. Open cargo detail; verify cost info displays (admin role).
2. Trigger `Review and Invoicing`, `Mark as Accepted`, and `Cancel` flows.
3. Confirm toast responses and status updates.
   **Validation:** Cargo IDs, Actions taken, Notes.

### Test A3 – Assignment Board (`/admin/assignments`)

**Goal:** Validate creation and reassignment flows, ensuring parity with modal logic.

1. Use `Assign Driver` to open `TruckAssignmentModal`, select driver/vehicle, set ETA.
2. Edit assignment (change vehicle) and cancel one assignment.
3. Ensure driver notifications fire (check Notification Center or API).
   **Validation:** Assignment IDs, Evidence, Notes.

### Test A4 – Resource Management (`/admin/drivers`, `/admin/trucks`)

**Goal:** Manage driver status, onboarding, and truck records.

1. Add/edit driver; verify validations and persistence.
2. Update truck capacity/status; ensure `VehicleSyncModal` (if triggered) works.
   **Validation:** Driver/vehicle IDs, Evidence, Notes.

### Test A5 – Fleet Monitor & Live Tracking (`/admin/fleet-monitor`, `/admin/vehicles/:vehicleId/live`)

**Goal:** Ensure real-time telemetry renders on both board and per-vehicle page.

1. Open Fleet Monitor; filter by region, ensure map markers respond.
2. Drill into a vehicle; confirm telemetry stream updates and reconnects after simulated offline event (`OfflineIndicator`).
   **Validation:** Vehicle IDs, Evidence, Notes.

### Test A6 – Financial Controls (`/admin/payment-verifications`, `/admin/invoices`)

**Goal:** Cover invoice review and external payments.

1. Verify pending payment, approve/reject with reason.
2. Generate manual invoice, send to client, ensure PDF renders correctly.
   **Validation:** Invoice IDs, Evidence, Notes.

### Test A7 – Reporting & Incident Follow-up (`/admin/reports`, System Alerts)

**Goal:** Validate exports and incident management (ties to client Test C7).

1. Export weekly delivery report; ensure file includes incident metadata.
2. Check `System Alerts` (if surfaced) or notifications area for reported issues, mark resolved.
   **Validation:** Report filename, Ticket IDs, Notes.

---

## Super Admin Suite

### Test S1 – Super Admin Dashboard & Sidebar (`/super-admin`)

**Goal:** Confirm elevated metrics and sidebar items (Users, Settings, Logs, Branches, Districts, Cargo Categories).

1. Log in; ensure KPI cards reflect system-wide data.
2. Verify ability to jump into admin modules via nav shortcuts.
   **Validation:** Evidence, Notes.

### Test S2 – User Management (`/super-admin/users`)

**Goal:** CRUD and role assignment.

1. Create a new admin user, assign permissions, trigger password reset email.
2. Suspend/reactivate a user; confirm they lose/gain access.
   **Validation:** User IDs, Evidence, Notes.

### Test S3 – Platform Settings & Logs (`/super-admin/settings`, `/super-admin/logs`)

**Goal:** Validate configuration panels and audit logs.

1. Update global config (e.g., default currency or SLA thresholds); ensure save sticks.
2. Open logs, filter by event type, and export if available.
   **Validation:** Setting diff, Evidence, Notes.

### Test S4 – Branch & District Management (`/superadmin/branches`, `/superadmin/branches/:id`, `/superadmin/districts`)

**Goal:** CRUD master data.

1. Add branch, edit details, view branch detail page.
2. Assign districts to branch; ensure data reflects on detail view.
   **Validation:** Branch IDs, Evidence, Notes.

### Test S5 – Cargo Categories Catalog (`/superadmin/cargo-categories`)

**Goal:** Ensure categories drive client cargo form dropdowns.

1. Add/disable category; confirm change appears on client `Create Cargo` page.
2. Attempt to delete category in use → expect guard message.
   **Validation:** Category IDs, Evidence, Notes.

### Test S6 – Elevated Access to Admin Modules

**Goal:** Confirm super admins can access admin routes defined in `App.tsx`.

1. From super admin session, open `/admin/cargos`, `/admin/assignments`, `/admin/trucks`.
2. Ensure navigation works and admin controls display.
   **Validation:** Screenshots, Notes.

---

## Cross-Role Shared Tests

### Test X1 – Profile & Logout (`/profile`)

**Goal:** Ensure shared profile page works for all roles and logout clears session.

1. For each role, open `/profile`, edit contact info or avatar.
2. Trigger logout via sidebar footer (`logout` in `DynamicSidebar.tsx`), verify redirect to `/login`.
   **Validation:** Role, Evidence, Notes.

### Test X2 – Notification & Offline Handling (Capacitor build only)

**Goal:** Validate `UpdatePrompt` and `OfflineIndicator`.

1. On native build, toggle airplane mode; ensure offline banner appears.
2. Trigger push notification (via NotificationProvider) and confirm in-app toast.
   **Validation:** Device info, Evidence, Notes.

---

## Sign-off

| Prepared By | Title | Signature | Date |
| ----------- | ----- | --------- | ---- |
|             |       |           |      |

| Approved By | Title | Signature | Date |
| ----------- | ----- | --------- | ---- |
|             |       |           |      |

_Document reference: Derived from IRIMS UAT flow, expanded to cover all Loveway Logistics Platform routes and sidebar-driven functionalities._
