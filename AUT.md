# Loveway Logistics Platform

## User Acceptance Test (UAT) – Clear Tester Playbook

**Test window:** November 2025  **Test type:** Guided UAT dry-run  
**Goal:** Give every tester a simple checklist so they know which screen to open, what action to perform, and what result to confirm—no technical background required.  
**Entry page for every run:** [http://lovewaylogistics.com/](http://lovewaylogistics.com/)

**Before you start**

1. Open the shared issue & evidence tracker (Google Sheet): [Loveway UAT Issues](https://docs.google.com/spreadsheets/d/1xurnnZPgICBx8sns1GNRmcjJmKyDc4TSxL3I3D8wVWA/edit?usp=sharing).
2. In the sheet’s “Tester Info” tab, record your `Name`, `Role`, `Date`, `Environment` (`http://lovewaylogistics.com`), and `Device/Browser`.
3. For every step you execute, log the outcome in the “Test Runs” tab—include cargo IDs, invoice IDs, and attach screenshot links for anything that fails or looks odd.
4. After you complete your assigned scenarios, set the “Status” column for those rows to `Done`, 


---

## Quick Reference – Who Tests What

Use this table to know which visible buttons or menu items each role must click. Every row links to a detailed test later in the document.

| Role        | How to reach the screens                                                               | Feature focus                         | Linked Test |
| ----------- | -------------------------------------------------------------------------------------- | ------------------------------------- | ----------- |
| Public      | Home page primary CTAs + top-right Login/Register/Forgot Password links                | Marketing + auth flows                | P1, P2      |
| Client      | Left sidebar → Dashboard                                                               | Widgets, stats, quick actions         | C1          |
| Client      | Left sidebar → Create Cargo                                                            | Create Cargo page                     | C2          |
| Client      | Left sidebar → My Cargos / Track / History tabs                                        | Cargo list, tracking, audit trail     | C3, C4      |
| Client      | Cargo card → Proceed to Payment + Invoices button in header                            | Payment + billing                     | C5          |
| Client      | Top-right avatar → Profile                                                             | Shared profile & logout               | X1          |
| Driver      | Driver sidebar → Dashboard / Assigned Cargos / My Deliveries / History                 | Assignment board + workflow           | D1–D4       |
| Admin       | Admin sidebar → Dashboard / All Cargos / Assignments                                   | Ops dashboard + cargo detail controls | A1–A3       |
| Admin       | Admin sidebar → Drivers / Trucks                                                       | Resource admin                        | A4          |
| Admin       | Admin sidebar → Fleet Monitor / any Vehicle card                                       | Live tracking                         | A5          |
| Admin       | Admin sidebar → Payment Verifications / Invoices / Reports                             | Finance & reporting                   | A6, A7      |
| Super Admin | Super Admin sidebar → Dashboard / Users / Settings / Logs                              | Platform governance                   | S1–S3       |
| Super Admin | Super Admin sidebar → Branches / Branch Details / Districts / Cargo Categories         | Master data                           | S4, S5      |
| Super Admin | Super Admin sidebar → Admin modules shortcut buttons (All Cargos, Assignments, Trucks) | Ensure elevated visibility            | S6          |

---

## Public Entry Flows

### Test P1 – Landing Page & Language Switch (Home page)

**Goal:** Make sure the public home page looks correct in every language.

1. From [http://lovewaylogistics.com/](http://lovewaylogistics.com/) (not logged in), check that the hero banner, statistics, FAQ, and buttons show up.
2. Click the language switcher and confirm the visible text changes.
3. Scroll to the footer and test each contact or social link.
4. Click the main “Get Started” button and confirm the registration form opens.
   **Validation checklist:** Working? Notes? Screenshot?

### Test P2 – Login, Register, and Password Reset (top-right auth links)

**Goal:** Confirm every public authentication flow works end to end.

1. Register a new user from the **Register** button, open the verification email (Mailtrap/inbox), and click the verification link to complete activation.
2. Try logging in before verifying to ensure the system shows the expected warning.
3. Log in after verification and confirm you land on the correct dashboard for that role.
4. Use “Forgot Password”, open the reset link, choose a new password, and log in again.
   **Validation checklist:** Working? Reference IDs? Screenshot?

---

## Client Suite

### Test C1 – Dashboard & Sidebar (Client Dashboard)

**Goal:** Confirm clients see the right menu shortcuts and live stats.

1. Log in as a client; the left sidebar should show Dashboard, Create Cargo, My Cargos, Live Tracking, and Invoices.
2. Check the dashboard cards (totals, quick actions) and make sure numbers load within a few seconds.
3. Collapse the sidebar and hover the icons to confirm the tooltips display the menu names.
   **Validation checklist:** Working? Widget data noted? Screenshot?

### Test C2 – Create Cargo (`Create Cargo` menu)

**Goal:** Make sure a client can request a shipment with all required details.

1. Click **Create Cargo** from the dashboard or sidebar.
2. Enter pickup and drop-off addresses, the desired schedule, cargo size/weight, and upload any required documents.
3. Submit the form and note the Cargo Reference shown in the confirmation message.
4. Go to **My Cargos** and confirm the new record is listed as `Pending`.
   **Validation checklist:** Cargo reference? Issues seen? Screenshot?

### Test C3 – Cargo List & Tracking (`My Cargos`, `Tracking`)

**Goal:** Ensure clients can review cargo status and track a shipment on the map.

1. In **My Cargos**, filter by status, open a record, and click **Track**.
2. On the tracking screen, confirm the map loads, the driver location updates, and offline mode shows the fallback message.
3. Use the search bar to find a cargo by reference.
   **Validation checklist:** Cargo IDs? Map behavior? Screenshot?

### Test C4 – Cargo History (`History`)

**Goal:** Confirm past deliveries remain accessible with export capability.

1. Open **History**, set a date range, and sort the table.
2. Click **Export** and verify the downloaded CSV includes the filtered rows.
3. Open any record in read-only mode to confirm all details display.
   **Validation checklist:** Export filename? Notes? Screenshot?

### Test C5 – Payments & Invoices (`Payment`, `Invoices`)

**Goal:** Verify the online payment flow and access to invoices.

1. From a cargo that is ready for payment, click **Proceed to Payment**.
2. Complete the Flutterwave mock payment and wait for the success page.
3. Open **Invoices**, confirm the related invoice now shows `Paid`, and download the PDF.
   **Validation checklist:** Payment reference? Invoice ID? Screenshot?

### Test C6 – Notifications & Delivery Rating (Cargo detail drawer)

**Goal:** Ensure clients can download receipts and rate the delivery.

1. Open a completed cargo, click **Download Receipt**, and confirm the file opens.
2. Click **Rate Delivery**, give a score and comment, and make sure the badge updates.
3. Check for a notification or email confirming the feedback submission.
   **Validation checklist:** Cargo ID? Rating noted? Screenshot?

---

## Driver Suite

### Test D1 – Driver Dashboard & Availability (`Driver Dashboard`)

**Goal:** Confirm drivers can view KPIs and set their availability.

1. Log in as a driver and review the dashboard cards (today’s jobs, earnings, etc.).
2. Toggle the availability/offline switch (if visible) and refresh the page to ensure the status persists.
   **Validation checklist:** Driver ID? Availability result? Screenshot?

### Test D2 – Assignment Decisions (`Assigned Cargos`)

**Goal:** Make sure drivers can accept or reject new jobs.

1. Open **Assigned Cargos** and pick a cargo that is waiting for driver action.
2. Review the countdown timer, then tap **Accept** and confirm the success message.
3. Open another pending assignment, tap **Reject**, provide a reason, and verify the job moves out of the queue.
   **Validation checklist:** Assignment IDs? Outcome? Screenshot?

### Test D3 – Full Delivery Workflow (`My Deliveries`)

**Goal:** Cover every driver step from pickup to delivery confirmation.

1. Open an accepted cargo in **My Deliveries** and tap **Mark Picked Up**; upload at least one pickup photo.
2. Start the trip (if a start button exists) so the cargo status moves to `In Transit`.
3. Upon arrival, tap **Mark Delivered**, upload proof-of-delivery photos, and submit.
4. Return to the list and confirm the cargo now shows `Delivered`; ask the client tester to verify they also see the update.
   **Validation checklist:** Cargo ID? Photos uploaded? Screenshot?

### Test D4 – Driver History & Profile (`Driver History`, `Profile`)

**Goal:** Ensure drivers can review past jobs and update their profile.

1. Open **Driver History**, apply a date filter, and export if the button is available.
2. Visit **Profile**, change one editable field (phone, avatar, etc.), save, and log out using the sidebar button.
   **Validation checklist:** Profile change noted? Evidence? Screenshot?

---

## Admin Suite

### Test A1 – Admin Dashboard (`Admin Dashboard`)

**Goal:** Make sure operations staff see the correct totals and alerts.

1. Log in as an admin; confirm the summary cards (pending cargos, assignments, etc.) show data.
2. Collapse the sidebar and hover the icons to ensure labels appear.
   **Validation checklist:** Notes? Screenshot?

### Test A2 – Manage Cargos (`Admin → All Cargos`)

**Goal:** Check that admins can review details, approve, or cancel cargos.

1. Open an item in **All Cargos**, review the cost information, and note the current status.
2. Use the available buttons to run through **Review & Invoice**, **Mark as Accepted**, and **Cancel** actions (use different cargos if needed).
3. Confirm the status line updates and toast messages appear after each action.
   **Validation checklist:** Cargo IDs? Actions taken? Screenshot?

### Test A3 – Driver Assignments (`Admin → Assignments`)

**Goal:** Ensure admins can assign, reassign, or cancel jobs.

1. Click **Assign Driver**, pick any available driver and truck, set an ETA, and send the assignment.
2. Edit the same assignment to change the truck, then cancel another assignment to confirm the workflow.
3. Check that the driver receives a notification (ask the driver tester or verify in the notification panel).
   **Validation checklist:** Assignment IDs? Notes? Screenshot?

### Test A4 – Drivers & Trucks (`Admin → Drivers`, `Admin → Trucks`)

**Goal:** Keep the resource lists up to date.

1. In **Drivers**, add or edit a driver record and save the changes.
2. In **Trucks**, update a truck’s capacity or status and verify the list refreshes.
   **Validation checklist:** Driver/truck IDs? Notes? Screenshot?

### Test A5 – Fleet Monitor & Live Vehicle View (`Admin → Fleet Monitor`, `Vehicle Live View`)

**Goal:** Confirm live location data appears on both overview and detail screens.

1. Open **Fleet Monitor**, filter by area or status, and make sure the map markers respond.
2. Click a vehicle card to open the live view and watch for location updates or reconnect prompts if you toggle offline mode.
   **Validation checklist:** Vehicle IDs? Map behavior? Screenshot?

### Test A6 – Payments & Invoices (`Admin → Payment Verifications`, `Admin → Invoices`)

**Goal:** Verify finance workflows for admins.

1. In **Payment Verifications**, review a pending payment and either approve or reject it with a note.
2. In **Invoices**, generate or edit an invoice, send it to the client, and download the PDF for accuracy.
   **Validation checklist:** Invoice IDs? Decision noted? Screenshot?

### Test A7 – Reports & Incident Follow-up (`Admin → Reports`, Alerts/Notifications)

**Goal:** Make sure reporting and customer issue tracking are covered.

1. Export the weekly delivery report and confirm the file includes the latest cargos and incidents.
2. Open the alerts or support-tickets view (if enabled) and change one ticket from `Open` to `Resolved`, adding a resolution note.
   **Validation checklist:** Report filename? Ticket ID? Screenshot?

---

## Super Admin Suite

### Test S1 – Super Admin Dashboard Overview (`Super Admin Dashboard`)

**Goal:** Make sure top-level metrics and shortcuts load for platform owners.

1. Log in as a super admin and confirm KPI cards (users, cargos, revenue, etc.) show realistic numbers.
2. Click a few quick links on the dashboard to verify they open the expected pages.
   **Validation checklist:** Metrics reasonable? Notes? Screenshot?

### Test S2 – Manage Users & Roles (`Super Admin → Users`)

**Goal:** Confirm super admins can add, edit, and suspend accounts.

1. Create a new admin user, assign the correct role, and send the invite/reset email.
2. Suspend an existing user, log in with that user in another browser to confirm access is blocked, then reactivate them.
   **Validation checklist:** User IDs? Outcome? Screenshot?

### Test S3 – Global Settings & Activity Logs (`Super Admin → Settings`, `Super Admin → Logs`)

**Goal:** Ensure configuration changes stick and audit logs capture activity.

1. Update one global setting (example: default currency or SLA hours) and save; refresh to confirm it persists.
2. Open **Logs**, filter by event type or user, and export the log if the option exists.
   **Validation checklist:** Setting changed? Log file? Screenshot?

### Test S4 – Branches & Districts (`Super Admin → Branches`, `Branch Details`, `Districts`)

**Goal:** Cover all master-data screens for branch operations.

1. Add a new branch, edit its contact info, and open the branch detail page to verify the change.
2. Assign one or more districts to that branch using the **Districts** page and confirm the relationship appears in both places.
   **Validation checklist:** Branch/district IDs? Notes? Screenshot?

### Test S5 – Cargo Categories (`Super Admin → Cargo Categories`)

**Goal:** Keep the cargo category list in sync with the client booking form.

1. Add a new category and check (with a client tester) that it appears in the **Create Cargo** dropdown.
2. Try to disable or delete a category that is in use and confirm the system shows the proper warning.
   **Validation checklist:** Category names? Result? Screenshot?

### Test S6 – Access to Admin Screens (Spot Check)

**Goal:** Confirm super admins can open every admin page for oversight.

1. While still logged in as super admin, open **Admin → Cargos**, **Admin → Assignments**, and **Admin → Trucks** using the sidebar or quick links.
2. Make sure each page loads fully and controls are interactive (no permission errors).
   **Validation checklist:** Pages visited? Notes? Screenshot?

---

## Cross-Role Shared Tests

### Test X1 – Profile & Logout (`Profile`)

**Goal:** Ensure the shared profile page works for every role and logout clears the session.

1. For each role, open **Profile**, edit one field (phone, language, avatar, etc.), and save.
2. Click the **Logout** button at the bottom of the sidebar and make sure you are returned to the login page.
   **Validation checklist:** Role tested? Change saved? Screenshot?

### Test X2 – Notification & Offline Handling (mobile build only)

**Goal:** Ensure the mobile shell shows offline warnings and push alerts.

1. On the mobile build, turn on airplane mode and confirm the offline banner appears, then turn connectivity back on.
2. Send yourself a push notification (or use the in-app test button) and make sure the toast/alert appears even if the app was in the background.
   **Validation checklist:** Device info? Notification received? Screenshot?

---

## Sign-off

| Prepared By | Title | Signature | Date |
| ----------- | ----- | --------- | ---- |
|             |       |           |      |

| Approved By | Title | Signature | Date |
| ----------- | ----- | --------- | ---- |
|             |       |           |      |

_Document reference: Derived from Loveway UAT flow, expanded to cover all Loveway Logistics Platform routes and sidebar-driven functionalities._
