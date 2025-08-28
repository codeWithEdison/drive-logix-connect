# Logistics Platform API Endpoints Documentation

## Overview

This document outlines all the API endpoints required for the Logistics Platform backend. The API follows RESTful principles and uses JSON for data exchange.

## Data Model Alignment (Database Compatibility)

- All IDs exposed by the API are UUID strings. Internally, the database stores these as BINARY(16) using UUID_TO_BIN(..., TRUE) and returns them using BIN_TO_UUID(..., TRUE).
- Path params and body fields named "..._id" MUST be valid UUID strings.
- For list endpoints, prefer filters that match indexed columns: status, created_at, user_id, cargo_id, driver_id, vehicle_id, and recorded_at.
- Date/time filters should be inclusive ranges using ISO 8601 timestamps.

## Base URL
```
https://api.logistics-platform.com/v1
```

## Authentication
All endpoints (except public ones) require Bearer token authentication:
```
Authorization: Bearer <jwt_token>
```

## Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {}
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 1. AUTHENTICATION ENDPOINTS

### 1.1 User Registration
```http
POST /auth/register
```

**Request Body:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "+250789123456",
  "password": "securePassword123",
  "role": "client",
  "preferred_language": "en"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "full_name": "John Doe",
      "email": "john@example.com",
      "role": "client",
      "is_verified": false
    },
    "token": "jwt_token_here"
  }
}
```

### 1.2 User Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### 1.3 Password Reset Request
```http
POST /auth/password-reset-request
```

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

### 1.4 Password Reset
```http
POST /auth/password-reset
```

**Request Body:**
```json
{
  "token": "reset_token",
  "new_password": "newSecurePassword123"
}
```

### 1.5 Email Verification
```http
POST /auth/verify-email
```

**Request Body:**
```json
{
  "token": "verification_token"
}
```

### 1.6 Resend Verification Email
```http
POST /auth/resend-verification
```

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

### 1.7 Logout
```http
POST /auth/logout
```

---

## 2. USER MANAGEMENT ENDPOINTS

### 2.1 Get User Profile
```http
GET /users/profile
```

### 2.2 Update User Profile
```http
PUT /users/profile
```

**Request Body:**
```json
{
  "full_name": "John Doe Updated",
  "phone": "+250789123457",
  "preferred_language": "rw",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

### 2.3 Change Password
```http
PUT /users/change-password
```

**Request Body:**
```json
{
  "current_password": "oldPassword123",
  "new_password": "newPassword123"
}
```

### 2.4 Get Users (Admin  and superadmin  Only)
```http
GET /users?role=driver&status=active&page=1&limit=10
```

**Query Parameters:**
- `role`: client, driver, admin, super_admin
- `status`: active, inactive
- `page`: page number
- `limit`: items per page

### 2.5 Approve or Reject User (Admin, Super Admin)
```http
PUT /admin/users/{user_id}/approval
```

**Request Body:**
```json
{
  "approved": true,
  "reason": "All documents verified"
}
```

---

## 3. CLIENT MANAGEMENT ENDPOINTS

### 3.1 Get Client Profile
```http
GET /clients/profile
```

### 3.2 Update Client Profile
```http
PUT /clients/profile
```

**Request Body:**
```json
{
  "company_name": "ABC Logistics",
  "business_type": "corporate",
  "tax_id": "TAX123456",
  "address": "123 Business Street",
  "city": "Kigali",
  "country": "Rwanda",
  "postal_code": "12345",
  "contact_person": "Jane Smith",
  "credit_limit": 5000.00,
  "payment_terms": 30
}
```

### 3.3 Get Client Credit Status
```http
GET /clients/credit-status
```

### 3.4 Get Client Invoices
```http
GET /clients/invoices?status=paid&page=1&limit=10
```

---

## 4. DRIVER MANAGEMENT ENDPOINTS

### 4.1 Get Driver Profile
```http
GET /drivers/profile
```

### 4.2 Update Driver Profile
```http
PUT /drivers/profile
```

**Request Body:**
```json
{
  "license_number": "LIC123456",
  "license_expiry": "2025-12-31",
  "license_type": "B",
  "date_of_birth": "1990-01-01",
  "emergency_contact": "Emergency Contact",
  "emergency_phone": "+250789123458",
  "blood_type": "O+",
  "medical_certificate_expiry": "2024-12-31"
}
```

### 4.3 Upload Driver Document
```http
POST /drivers/documents
```

**Request Body (multipart/form-data):**
```json
{
  "document_type": "license",
  "document_number": "LIC123456",
  "expiry_date": "2025-12-31",
  "file": "document_file"
}
```

### 4.4 Get Driver Documents
```http
GET /drivers/documents
```

### 4.5 Update Driver Status
```http
PUT /drivers/status
```

**Request Body:**
```json
{
  "status": "available"
}
```

### 4.7 Get Driver Assignments
```http
GET /drivers/assignments?status=active&page=1&limit=10
```

### 4.6 Get Driver Performance
```http
GET /drivers/performance
```

### 4.8 Get Available Drivers (Admin)
```http
GET /drivers/available?location=kigali&vehicle_type=truck
```

---

## 5. VEHICLE MANAGEMENT ENDPOINTS

### 5.1 Get Vehicles
```http
GET /vehicles?status=active&type=truck&page=1&limit=10
```

### 5.2 Get Vehicle Details
```http
GET /vehicles/{vehicle_id}
```

### 5.3 Create Vehicle (Admin)
```http
POST /vehicles
```

**Request Body:**
```json
{
  "plate_number": "RAB123A",
  "make": "Toyota",
  "model": "Hilux",
  "year": 2020,
  "color": "White",
  "capacity_kg": 1000,
  "capacity_volume": 5.5,
  "fuel_type": "diesel",
  "fuel_efficiency": 12.5,
  "type": "truck",
  "insurance_expiry": "2024-12-31",
  "registration_expiry": "2024-12-31"
}
```

### 5.4 Update Vehicle
```http
PUT /vehicles/{vehicle_id}
```

### 5.5 Approve or Reject Vehicle (Admin)
```http
PUT /admin/vehicles/{vehicle_id}/approval
```

**Request Body:**
```json
{
  "approved": true,
  "reason": "Inspection passed"
}
```

### 5.6 Add Vehicle Maintenance Record
```http
POST /vehicles/{vehicle_id}/maintenance
```

**Request Body:**
```json
{
  "maintenance_type": "routine",
  "description": "Oil change and filter replacement",
  "cost": 150.00,
  "service_provider": "AutoCare Center",
  "service_date": "2024-01-15",
  "next_service_date": "2024-04-15",
  "mileage_at_service": 50000,
  "notes": "Regular maintenance completed"
}
```

### 5.7 Get Vehicle Maintenance History
```http
GET /vehicles/{vehicle_id}/maintenance
```

### 5.8 Get Available Vehicles
```http
GET /vehicles/available?type=truck&capacity_min=500
```

---

## 6. CARGO MANAGEMENT ENDPOINTS

### 6.1 Create Cargo Request
```http
POST /cargos
```

**Request Body:**
```json
{
  "category_id": "category_uuid",
  "type": "Electronics",
  "weight_kg": 25.5,
  "volume": 0.5,
  "dimensions": {
    "length": 50,
    "width": 30,
    "height": 20
  },
  "pickup_address": "123 Pickup Street, Kigali",
  "pickup_contact": "John Doe",
  "pickup_phone": "+250789123456",
  "pickup_instructions": "Call 30 minutes before arrival",
  "destination_address": "456 Delivery Street, Butare",
  "destination_contact": "Jane Smith",
  "destination_phone": "+250789123457",
  "delivery_instructions": "Leave with security guard",
  "special_requirements": "Handle with care",
  "insurance_required": true,
  "insurance_amount": 1000.00,
  "fragile": true,
  "temperature_controlled": false,
  "priority": "normal",
  "pickup_date": "2024-01-20T08:00:00Z",
  "delivery_date": "2024-01-20T16:00:00Z"
}
```

### 6.2 Get Cargo Details
```http
GET /cargos/{cargo_id}
```

### 6.3 Update Cargo Status
```http
PUT /cargos/{cargo_id}/status
```

**Request Body:**
```json
{
  "status": "in_transit",
  "notes": "Cargo picked up and en route"
}
```

### 6.4 Get Client Cargos
```http
GET /clients/cargos?status=delivered&page=1&limit=10&date_from=2024-01-01&date_to=2024-01-31
```

### 6.5 Get Driver Cargos
```http
GET /drivers/cargos?status=assigned&page=1&limit=10&date_from=2024-01-01&date_to=2024-01-31
```

### 6.6 Cancel Cargo
```http
POST /cargos/{cargo_id}/cancel
```

**Request Body:**
```json
{
  "reason": "Client requested cancellation"
}
```

### 6.7 Admin Assign Driver and Vehicle to Cargo
```http
POST /delivery-assignments
```

**Request Body:**
```json
{
  "cargo_id": "cargo_uuid",
  "driver_id": "driver_uuid",
  "vehicle_id": "vehicle_uuid"
}
```

### 6.7 Get Cargo Tracking
```http
GET /cargos/{cargo_id}/tracking
```

---

## 7. DELIVERY ASSIGNMENT ENDPOINTS

### 7.1 Assign Driver to Cargo (Admin)
```http
POST /delivery-assignments
```

**Request Body:**
```json
{
  "cargo_id": "cargo_uuid",
  "driver_id": "driver_uuid",
  "vehicle_id": "vehicle_uuid"
}
```

### 7.2 Get Delivery Assignment
```http
GET /delivery-assignments/{cargo_id}
```

### 7.3 Update Assignment
```http
PUT /delivery-assignments/{assignment_id}
```

### 7.4 Get Driver Assignments
```http
GET /drivers/assignments?status=active&page=1&limit=10
```

---

## 8. ROUTE MANAGEMENT ENDPOINTS

### 8.1 Create Route
```http
POST /routes
```

**Request Body:**
```json
{
  "cargo_id": "cargo_uuid",
  "route_name": "Kigali to Butare Express",
  "total_distance_km": 125.5,
  "estimated_duration_minutes": 180,
  "waypoints": [
    {
      "waypoint_order": 1,
      "latitude": -1.9441,
      "longitude": 30.0619,
      "address": "Pickup Location, Kigali",
      "waypoint_type": "pickup",
      "estimated_time": "2024-01-20T08:00:00Z"
    },
    {
      "waypoint_order": 2,
      "latitude": -2.5967,
      "longitude": 29.7378,
      "address": "Delivery Location, Butare",
      "waypoint_type": "delivery",
      "estimated_time": "2024-01-20T11:00:00Z"
    }
  ]
}
```

### 8.2 Get Route Details
```http
GET /routes/{cargo_id}
```

### 8.3 Update Route Waypoint
```http
PUT /routes/{route_id}/waypoints/{waypoint_id}
```

### 8.4 Get Route Progress
```http
GET /routes/{cargo_id}/progress
```

---

## 9. DELIVERY EXECUTION ENDPOINTS

### 9.1 Start Delivery
```http
POST /deliveries/{cargo_id}/start
```

**Request Body:**
```json
{
  "start_time": "2024-01-20T08:00:00Z"
}
```

### 9.2 Update Delivery Status
```http
PUT /deliveries/{cargo_id}/status
```

**Request Body:**
```json
{
  "status": "picked_up",
  "actual_pickup_time": "2024-01-20T08:15:00Z",
  "location_latitude": -1.9441,
  "location_longitude": 30.0619,
  "notes": "Cargo picked up successfully"
}
```

### 9.2.1 Confirm Delivery via OTP
```http
POST /deliveries/{cargo_id}/confirm-otp
```

**Request Body:**
```json
{
  "otp": "123456"
}
```

### 9.2.2 Confirm Delivery via QR
```http
POST /deliveries/{cargo_id}/confirm-qr
```

**Request Body:**
```json
{
  "qr_token": "scanned_qr_token"
}
```

### 9.3 Complete Delivery
```http
POST /deliveries/{cargo_id}/complete
```

**Request Body:**
```json
{
  "end_time": "2024-01-20T11:30:00Z",
  "actual_delivery_time": "2024-01-20T11:30:00Z",
  "confirmation_method": "signature",
  "recipient_name": "Jane Smith",
  "recipient_signature": "signature_data",
  "rating": 5,
  "review": "Excellent service, on time delivery"
}
```

### 9.6 Rate Delivery and Driver
```http
POST /deliveries/{cargo_id}/rating
```

**Request Body:**
```json
{
  "rating": 5,
  "review": "Excellent service, on time delivery"
}
```

### 9.4 Get Delivery Details
```http
GET /deliveries/{cargo_id}
```

### 9.5 Upload Delivery Proof
```http
POST /deliveries/{cargo_id}/proof
```

**Request Body (multipart/form-data):**
```json
{
  "confirmation_method": "photo",
  "file": "proof_image"
}
```

---

## 10. INVOICE MANAGEMENT ENDPOINTS

### 10.1 Generate Invoice
```http
POST /invoices
```

**Request Body:**
```json
{
  "cargo_id": "cargo_uuid",
  "subtotal": 150.00,
  "tax_amount": 15.00,
  "discount_amount": 0.00,
  "currency": "USD",
  "due_date": "2024-02-20"
}
```

### 10.2 Get Invoice Details
```http
GET /invoices/{invoice_id}
```

### 10.3 Get Client Invoices
```http
GET /clients/invoices?status=paid&page=1&limit=10
```

### 10.4 Update Invoice Status
```http
PUT /invoices/{invoice_id}/status
```

**Request Body:**
```json
{
  "status": "paid",
  "payment_method": "mobile_money",
  "payment_reference": "MM123456"
}
```

### 10.5 Download Invoice PDF
```http
GET /invoices/{invoice_id}/pdf
```

---

## 11. PAYMENT MANAGEMENT ENDPOINTS

### 11.1 Process Payment
```http
POST /payments
```

**Request Body:**
```json
{
  "invoice_id": "invoice_uuid",
  "amount": 165.00,
  "payment_method": "mobile_money",
  "transaction_id": "MM123456"
}
```

### 11.2 Get Payment History
```http
GET /payments?invoice_id=invoice_uuid&page=1&limit=10&date_from=2024-01-01&date_to=2024-01-31
```

### 11.3 Request Refund
```http
POST /refunds
```

**Request Body:**
```json
{
  "invoice_id": "invoice_uuid",
  "amount": 50.00,
  "reason": "Service not as expected"
}
```

### 11.4 Get Refund Status
```http
GET /refunds/{refund_id}
```

---

## 12. INSURANCE MANAGEMENT ENDPOINTS

### 12.1 Create Insurance Policy
```http
POST /insurance/policies
```

**Request Body:**
```json
{
  "cargo_id": "cargo_uuid",
  "policy_number": "INS123456",
  "coverage_amount": 1000.00,
  "premium_amount": 25.00,
  "insurance_provider": "Rwanda Insurance Co.",
  "policy_start_date": "2024-01-20",
  "policy_end_date": "2024-01-21"
}
```

### 12.2 Get Insurance Policy
```http
GET /insurance/policies/{cargo_id}
```

### 12.3 File Insurance Claim
```http
POST /insurance/claims
```

**Request Body:**
```json
{
  "cargo_id": "cargo_uuid",
  "claim_number": "CLM123456",
  "claim_amount": 500.00,
  "claim_reason": "Cargo damaged during transit"
}
```

### 12.4 Get Claim Status
```http
GET /insurance/claims/{claim_id}
```

---

## 13. GPS TRACKING ENDPOINTS

### 13.1 Update GPS Location
```http
POST /gps/tracking
```

**Request Body:**
```json
{
  "vehicle_id": "vehicle_uuid",
  "latitude": -1.9441,
  "longitude": 30.0619,
  "altitude": 1500.5,
  "speed_kmh": 45.2,
  "heading_degrees": 180.5,
  "accuracy_meters": 5.0,
  "battery_level": 85
}
```

### 13.2 Get Vehicle Location
```http
GET /gps/vehicles/{vehicle_id}/location
```

### 13.3 Get Tracking History
```http
GET /gps/vehicles/{vehicle_id}/history?start_time=2024-01-20T08:00:00Z&end_time=2024-01-20T18:00:00Z
```

Guidelines:
- Always provide both start_time and end_time to leverage `(vehicle_id, recorded_at)` index.
- Use pagination for long ranges: `page`, `limit`.

### 13.4 Get Live Tracking
```http
GET /gps/vehicles/{vehicle_id}/live
```

---

## 14. NOTIFICATION ENDPOINTS

### 14.1 Get User Notifications
```http
GET /notifications?type=delivery_update&is_read=false&page=1&limit=10
```

### 14.2 Mark Notification as Read
```http
PUT /notifications/{notification_id}/read
```

### 14.3 Mark All Notifications as Read
```http
PUT /notifications/read-all
```

### 14.4 Get Notification Settings
```http
GET /notifications/settings
```

### 14.5 Update Notification Settings
```http
PUT /notifications/settings
```

**Request Body:**
```json
{
  "email_notifications": true,
  "sms_notifications": false,
  "push_notifications": true,
  "delivery_updates": true,
  "payment_notifications": true,
  "system_notifications": false
}
```

---

## 15. ADMIN MANAGEMENT ENDPOINTS

### 15.1 Get Dashboard Statistics
```http
GET /admin/dashboard
```

### 15.2 Get System Logs
```http
GET /admin/logs?user_id=user_uuid&action=login&page=1&limit=50&date_from=2024-01-01&date_to=2024-01-31
```

### 15.3 Get User Management
```http
GET /admin/users?role=driver&status=active&page=1&limit=10
```

### 15.4 Update User Status (Admin)
```http
PUT /admin/users/{user_id}/status
```

**Request Body:**
```json
{
  "is_active": false,
  "reason": "Account suspended due to policy violation"
}
```

### 15.5 Get Financial Reports
```http
GET /admin/reports/financial?start_date=2024-01-01&end_date=2024-01-31&group_by=day
```

### 15.6 Get Performance Reports
```http
GET /admin/reports/performance?driver_id=driver_uuid&start_date=2024-01-01&end_date=2024-01-31
```

---

## 16. OPERATIONAL ENDPOINTS

### 16.1 Get Service Areas
```http
GET /operational/service-areas?city=kigali&is_active=true
```

### 16.2 Get Operating Hours
```http
GET /operational/operating-hours?entity_type=location&entity_id=location_uuid
```

### 16.3 Update Operating Hours
```http
PUT /operational/operating-hours
```

**Request Body:**
```json
{
  "entity_type": "location",
  "entity_id": "location_uuid",
  "schedule": [
    {
      "day_of_week": 1,
      "start_time": "08:00:00",
      "end_time": "18:00:00",
      "is_available": true
    }
  ]
}
```

### 16.6 Approvals (Unified)
```http
PUT /admin/approvals
```

**Request Body:**
```json
{
  "entity_type": "user|vehicle|driver",
  "entity_id": "uuid",
  "approved": true,
  "reason": "Optional notes"
}
```

### 16.4 Get Cargo Categories
```http
GET /operational/cargo-categories?is_active=true
```

### 16.5 Get Pricing Policies
```http
GET /operational/pricing-policies?is_active=true&vehicle_type=truck
```

---

## 17. LOCALIZATION ENDPOINTS

### 17.1 Get Translations
```http
GET /localization/translations?language=en
```

Notes:
- Backed by `translations` table. Use keys to fetch localized text for UI.

### 17.2 Update Translation
```http
PUT /localization/translations/{key}
```

**Request Body:**
```json
{
  "en": "English text",
  "rw": "Kinyarwanda text",
  "fr": "French text"
}
```

---

## 18. FILE UPLOAD ENDPOINTS

### 18.1 Upload File
```http
POST /files/upload
```

**Request Body (multipart/form-data):**
```json
{
  "file": "file_data",
  "type": "document",
  "category": "driver_license"
}
```

### 18.2 Get File URL
```http
GET /files/{file_id}/url
```

### 18.3 Delete File
```http
DELETE /files/{file_id}
```

---

## 19. SEARCH ENDPOINTS

### 19.1 Search Cargos
```http
GET /search/cargos?q=electronics&status=delivered&date_from=2024-01-01&date_to=2024-01-31
```

### 19.2 Search Users
```http
GET /search/users?q=john&role=driver&status=active
```

### 19.3 Search Vehicles
```http
GET /search/vehicles?q=toyota&type=truck&status=active
```

---

## 20. ANALYTICS ENDPOINTS

### 20.1 Get Cargo Analytics
```http
GET /analytics/cargos?period=month&start_date=2024-01-01&end_date=2024-01-31
```

### 20.2 Get Driver Analytics
```http
GET /analytics/drivers?driver_id=driver_uuid&period=week
```

### 20.3 Get Financial Analytics
```http
GET /analytics/financial?period=month&group_by=category
```

### 20.4 Get Performance Analytics
```http
GET /analytics/performance?metric=delivery_time&period=month
```

---

## Implementation Notes

### 1. Authentication & Authorization
- Use JWT tokens for authentication
- Implement role-based access control (RBAC)
- Validate permissions for each endpoint
- Implement token refresh mechanism

### 2. Validation
- Validate all input data
- Implement proper error handling
- Return meaningful error messages
- Use HTTP status codes correctly

### 3. Rate Limiting
- Implement rate limiting for all endpoints
- Different limits for different user roles
- Monitor API usage

### 4. Security
- Use HTTPS for all endpoints
- Implement CORS properly
- Sanitize all inputs
- Log security events

### 5. Performance
- Implement pagination for list endpoints
- Use database indexes efficiently
- Implement caching where appropriate
- Monitor response times

### 6. Documentation
- Use OpenAPI/Swagger for API documentation
- Provide example requests and responses
- Document error codes and messages

### 7. Testing
- Write unit tests for all endpoints
- Implement integration tests
- Test error scenarios
- Performance testing

### 8. Monitoring
- Log all API calls
- Monitor error rates
- Track response times
- Set up alerts for issues

This comprehensive API documentation covers all the necessary endpoints for a full-featured logistics platform. Each endpoint should be implemented with proper validation, error handling, and security measures.
