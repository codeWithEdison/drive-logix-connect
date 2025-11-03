# JIMI GPS Integration - Implementation Summary

## Overview

This document summarizes the JIMI GPS tracking integration implemented in the frontend, including vehicle sync, live tracking, and fleet monitoring features.

---

## ✅ Completed Features

### 1. Vehicle Sync Flow (Super Admin)

#### **PUSH Vehicles Button**

- **Location**: Admin Vehicles page (`/admin/trucks`)
- **Access**: Super Admin only
- **Action**: Fetches new JIMI devices via `/v1/vehicles/compare-jimi` and opens the sync modal

#### **Vehicle Sync Modal** (`src/components/vehicles/VehicleSyncModal.tsx`)

- **Excel-like validation table** with inline editing
- **Editable fields**:
  - Device IMEI (read-only, from JIMI)
  - Plate Number\* (required)
  - Vehicle Type (dropdown: truck, van, pickup, moto)
  - Make, Model, Year
  - Color
  - Capacity (kg)\* (required, number input)
  - Capacity Volume (m³)
  - Fuel Type (dropdown: diesel, petrol, electric, hybrid)
  - Driver Name, Driver Phone
  - Branch (dropdown, fetched from DB)
  - Status (dropdown: active, inactive, maintenance)
- **Features**:
  - Multi-row selection with checkboxes
  - "Delete Rows" toggle to show/hide per-row delete buttons
  - Client-side validation (required fields, data types, uniqueness)
  - Inline error messages for validation and server-side errors
  - Summary counters (Total, Valid, Errors)
  - Horizontal scrollable table with sticky headers
  - Automatic data coercion (strings → numbers for numeric fields)
  - Empty value pruning before submission
- **Submission**: Selected valid rows sent to `/v1/vehicles/batch-create`
- **Error Handling**: Displays server errors per row, allows fix-and-retry

---

### 2. Socket.IO Integration

#### **Shared Socket Utility** (`src/lib/services/socket.ts`)

- Singleton `SocketManager` class
- Connection with Bearer token auth
- Exponential backoff for retries
- Room management: `join`, `leave`
- Event listeners: `on`, `off`, `disconnect`

#### **WebSocket Service** (`src/lib/api/services/websocketService.ts`)

- Wraps `SocketManager` for tracking-specific operations
- Methods:
  - `connect()`, `disconnect()`
  - `onLocationUpdate(cb)`: Listen for `gps:location:update` events
  - `onStatusUpdate(cb)`: Listen for `gps:status:update` events
  - `subscribeToVehicle(vehicleId)`: Join `vehicle:{vehicleId}` room
  - `subscribeToCargoTracking(cargoId)`: Join `cargo:{cargoId}` room
  - `subscribeFleetMonitor()`: Join `fleet:monitor` room
  - Corresponding unsubscribe methods

#### **Realtime Hooks** (`src/lib/api/hooks/realtimeHooks.ts`)

- `useVehicleLiveSocket(vehicleId)`: Manages vehicle room subscription
- `useCargoSocket(cargoId)`: Manages cargo room subscription
- `useFleetSocket()`: Manages fleet monitor subscription
- Returns: `{ connected, onLocation }` for event handling

---

### 3. GPS Service Updates (`src/lib/api/services/gpsService.ts`)

Added endpoints:

- `getCargoTracking(cargoId)`: Fetch cargo GPS tracking (`/v1/gps/cargos/:cargoId/tracking`)
- `getFleetMonitor(params)`: Fetch fleet list (`/v1/gps/fleet`)
- `getVehicleStatus(vehicleId)`: Fetch vehicle GPS status (`/v1/gps/vehicles/:vehicleId/status`)
- `getVehicleHistory(vehicleId, params)`: Fetch vehicle GPS history (`/v1/gps/vehicles/:vehicleId/history`)
- `getJimiDeviceDetail(imei)`: Fetch JIMI device details (`/v1/gps/jimi/device/detail`)
- `getJimiShareUrl(imei)`: Get JIMI device share URL (`/v1/gps/jimi/device/share-url`)

---

### 4. Vehicle Live Tracking Page (`src/pages/admin/VehicleLiveTracking.tsx`)

- **Route**: `/admin/vehicles/:vehicleId/live`
- **Access**: Admin
- **Features**:
  - Full-screen Google Maps view with vehicle marker
  - Real-time marker updates via Socket.IO
  - Vehicle details panel (plate, make/model, type, IMEI)
  - GPS status panel (online/offline, last update, battery, speed)
  - Current location coordinates
  - Quick actions:
    - View History (placeholder route)
    - Open JIMI Share Link (external)
  - Fallback polling every 30s if WebSocket disconnects
  - Animated vehicle marker with heading indicator

---

### 5. Fleet Monitor Page (`src/pages/admin/FleetMonitor.tsx`)

- **Route**: `/admin/fleet-monitor`
- **Access**: Admin
- **Features**:
  - Full-screen map with all active vehicle markers
  - Real-time marker position/heading updates
  - Vehicle list sidebar with search and filters:
    - Search by plate number
    - Filter by status (active, inactive, maintenance)
    - Filter by branch
  - Vehicle list shows:
    - Plate number, make/model
    - Online/offline badge
    - Speed, last update timestamp
  - Click on list item → pan map to vehicle
  - Click on marker → select vehicle and show details
  - Selected vehicle detail card at bottom
  - "View" button → navigate to vehicle live tracking page
  - Fallback polling every 30s

---

### 6. UI/Navigation Updates

- **Sidebar**: Added "Fleet Monitor" link under Admin navigation
- **Admin Trucks Page**: "Track" button now routes to `/admin/vehicles/:id/live`
- **Routes** (`src/App.tsx`):
  - `/admin/vehicles/:vehicleId/live` → `VehicleLiveTracking`
  - `/admin/fleet-monitor` → `FleetMonitor`

---

## 📦 Files Created/Modified

### **Created**

- `src/lib/services/socket.ts` - Shared Socket.IO manager
- `src/lib/api/services/websocketService.ts` - Tracking-specific WebSocket service
- `src/lib/api/hooks/realtimeHooks.ts` - React hooks for Socket.IO rooms
- `src/pages/admin/VehicleLiveTracking.tsx` - Single vehicle live tracking page
- `src/pages/admin/FleetMonitor.tsx` - Fleet-wide GPS monitor
- `src/components/vehicles/VehicleSyncModal.tsx` - Vehicle sync/validation modal

### **Modified**

- `src/lib/api/services/vehicleService.ts` - Added `compareJimiDevices`, `batchCreateVehicles`
- `src/lib/api/services/gpsService.ts` - Added 6 new GPS endpoints
- `src/pages/admin/AdminTrucks.tsx` - Added "PUSH vehicles" button, sync modal integration, updated track route
- `src/components/dashboard/LiveTrackingMap.tsx` - Already uses `websocketService` for cargo tracking
- `src/components/layout/DynamicSidebar.tsx` - Added "Fleet Monitor" link
- `src/App.tsx` - Added new routes

---

## 🔄 Data Flow

### **Vehicle Sync**

1. Super Admin clicks "PUSH vehicles"
2. Frontend → `GET /v1/vehicles/compare-jimi`
3. Backend returns `{ new: [...], existing: [...] }`
4. Frontend opens `VehicleSyncModal` with `new` devices
5. Admin edits/validates rows
6. Frontend → `POST /v1/vehicles/batch-create` with selected rows
7. Backend creates vehicles in DB, syncs JIMI metadata
8. Frontend displays success/errors, refreshes vehicle list

### **Vehicle Live Tracking**

1. Admin navigates to `/admin/vehicles/:id/live`
2. Frontend → `GET /v1/gps/vehicles/:id/live` (initial data)
3. Frontend connects Socket.IO, joins `vehicle:{id}` room
4. Backend emits `gps:location:update` on GPS updates
5. Frontend updates marker position/heading in real-time
6. Fallback: REST polling every 30s if WebSocket fails

### **Fleet Monitor**

1. Admin navigates to `/admin/fleet-monitor`
2. Frontend → `GET /v1/gps/fleet` (list of vehicles with last location)
3. Frontend connects Socket.IO, joins `fleet:monitor` room
4. Backend emits `gps:location:update` for any vehicle
5. Frontend updates corresponding marker on map
6. Fallback: REST polling every 30s

---

## 🛠️ Technical Details

### **Validation Rules (Sync Modal)**

- **Required**: `plate_number`, `capacity_kg`
- **Data Types**:
  - `capacity_kg`, `capacity_volume`, `year` → numbers (coerced on save)
  - Dates → ISO strings
- **Enums**: Validated against `VehicleType`, `FuelType`, `VehicleStatus`
- **Uniqueness**: IMEI and plate number checked within batch (no duplicates)

### **Socket.IO Events**

- **Emitted by Client**:
  - `join`: `{ room: "vehicle:{id}" | "cargo:{id}" | "fleet:monitor" }`
  - `leave`: `{ room: ... }`
- **Received by Client**:
  - `gps:location:update`: `{ vehicle_id?, cargo_id?, latitude, longitude, speed_kmh, heading_degrees, battery_level, recorded_at }`
  - `gps:status:update`: `{ vehicle_id?, online, last_update }`

### **Map Integration**

- Uses existing `MapService` (`src/lib/api/services/mapService.ts`)
- Google Maps API (requires `VITE_GOOGLE_MAPS_API_KEY`)
- Vehicle markers:
  - Icon: `FORWARD_CLOSED_ARROW` (arrow shape)
  - Color: Green (online) / Gray (offline)
  - Rotation: Based on `heading_degrees` from GPS data

---

## 🚀 Usage

### **For Super Admins**

1. Go to **Admin → Vehicles**
2. Click **"PUSH vehicles"** button (top-right)
3. Wait for new JIMI devices to load
4. Edit/validate data in the sync modal
5. Select rows to create (checkboxes)
6. Click **"Save"** to batch-create vehicles
7. Fix any errors inline and retry

### **For Admins**

1. Go to **Admin → Fleet Monitor**
2. View all vehicles on map in real-time
3. Use filters/search to narrow down
4. Click vehicle in list or marker on map to view details
5. Click **"View"** to open full vehicle live tracking page
6. From vehicle live tracking page:
   - See detailed GPS status, battery, speed
   - View history (future feature)
   - Open JIMI share link

---

## 📝 Known Limitations & Future Improvements

### **Pending TODOs** (from initial plan)

- Performance: Virtualize rows for large datasets (>100 vehicles)
- Debounce validation for large sync batches
- Add stale data indicators (e.g., "Last update 5 minutes ago")
- Accessibility: ARIA labels, keyboard navigation for grid
- Internationalization (i18n) for all new UI strings
- Feature flags for JIMI integration
- Audit logging for vehicle sync actions
- E2E tests for sync flow and tracking features

### **Backend Dependencies**

- `/v1/vehicles/compare-jimi` must return `{ new, existing }`
- `/v1/vehicles/batch-create` must support partial success
- Socket.IO server must emit `gps:location:update` on JIMI webhook
- JIMI API credentials configured in backend

### **Enhancements**

- Add vehicle history page (`/admin/vehicles/:id/history`)
- Add maintenance scheduling from live tracking page
- Add geofence alerts (out-of-route notifications)
- Export fleet data as CSV/Excel
- Heatmap view for fleet distribution
- Playback mode for historical routes
- Driver assignment from vehicle live page

---

## 🎯 Testing Checklist

- [ ] Super Admin can see "PUSH vehicles" button
- [ ] Compare JIMI API returns new devices
- [ ] Sync modal opens with correct data
- [ ] Validation errors show inline
- [ ] Batch create succeeds for valid rows
- [ ] Partial success shows per-row errors
- [ ] Vehicle list refreshes after sync
- [ ] Vehicle live tracking page loads map
- [ ] Socket.IO connects and joins vehicle room
- [ ] Marker updates on `gps:location:update` event
- [ ] Fleet monitor displays all vehicles
- [ ] Fleet monitor markers update in real-time
- [ ] Click vehicle in list pans map
- [ ] Click marker selects vehicle
- [ ] JIMI share URL opens in new tab
- [ ] Fallback polling works if WebSocket fails
- [ ] Mobile responsive (all pages)

---

## 📚 Related Documentation

- Backend guide: `dev_doc/JIMI_GPS_FRONTEND_GUIDE.md`
- Socket.IO docs: [socket.io](https://socket.io/docs/v4/)
- Google Maps API: [developers.google.com/maps](https://developers.google.com/maps/documentation/javascript)
- React Query: [tanstack.com/query](https://tanstack.com/query/latest)

---

**Last Updated**: 2025-11-03  
**Implemented By**: AI Assistant  
**Status**: ✅ Core features complete, enhancements pending
