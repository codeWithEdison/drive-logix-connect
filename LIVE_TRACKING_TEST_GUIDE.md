# Live Tracking Integration Test Guide

## 🧪 Testing the Complete Live Tracking System

This guide will help you test the production-ready live tracking implementation.

## Prerequisites

### 1. Environment Setup

Ensure your `.env` file contains:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### 2. Backend Requirements

Your backend should have these endpoints available:

- `GET /tracking/cargo/in-transit` - Returns in-transit cargo list
- `GET /tracking/cargo/{id}` - Returns cargo tracking details
- `GET /tracking/cargo/{id}/progress` - Returns route progress
- `WS /ws/tracking` - WebSocket for real-time updates

## 🚀 Testing Steps

### Step 1: Component Integration Test

1. **Navigate to Client Dashboard**

   ```bash
   # Start your development server
   npm run dev

   # Navigate to: http://localhost:5173/dashboard
   ```

2. **Verify Component Loading**
   - ✅ LiveTrackingMap component should render
   - ✅ Two-panel layout (30% cargo list, 70% map/details)
   - ✅ Connection status indicator shows "Connecting..." or "Live"

### Step 2: API Integration Test

1. **Test Cargo Data Loading**

   ```javascript
   // Open browser dev tools console
   // Check for API calls to:
   console.log("API calls should include:");
   console.log("- GET /tracking/cargo/in-transit");
   console.log("- GET /tracking/cargo/{id} (when cargo selected)");
   console.log("- GET /tracking/cargo/{id}/progress");
   ```

2. **Verify Data Structure**
   - Cargo list should show in-transit deliveries only
   - Each cargo card should display:
     - Type and status
     - Pickup/delivery locations
     - Progress percentage (if available)
     - Priority and creation date

### Step 3: Google Maps Integration Test

1. **Map Initialization**

   - ✅ Map should load with Kigali as center point
   - ✅ No console errors related to Google Maps API
   - ✅ Map controls should be functional

2. **Map Interaction**
   - ✅ Zoom in/out should work
   - ✅ Pan around map should work
   - ✅ Map type switching should work (if implemented)

### Step 4: Real-time Updates Test

1. **WebSocket Connection**

   ```javascript
   // In browser console, check connection:
   console.log("WebSocket status:", window.trackingWebSocket?.isConnected());
   ```

2. **Live Updates Simulation**
   - Select a cargo from the list
   - Map should show markers for pickup, current location, and destination
   - Progress should update in real-time (if backend sends updates)

### Step 5: Error Handling Test

1. **Network Disconnection Test**

   - Disconnect internet
   - Component should show "Offline" status
   - Reconnect internet
   - Should automatically reconnect and show "Live"

2. **API Error Test**

   - Modify backend to return errors
   - Component should show appropriate fallback UI
   - Retry buttons should work

3. **Map Loading Error Test**
   - Remove Google Maps API key
   - Component should show map error fallback
   - Error message should be helpful

## 🔍 Debugging Common Issues

### Issue 1: Map Not Loading

```javascript
// Check in browser console:
console.log("Google Maps API Key:", import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
console.log("Google Maps loaded:", !!window.google?.maps);

// Solutions:
// 1. Verify API key is correct
// 2. Check API key permissions
// 3. Verify internet connection
```

### Issue 2: No Cargo Data

```javascript
// Check API calls in Network tab:
// 1. Verify backend is running
// 2. Check API endpoint URLs
// 3. Verify authentication headers
// 4. Check CORS settings
```

### Issue 3: WebSocket Connection Failed

```javascript
// Check WebSocket connection:
console.log("WebSocket URL:", import.meta.env.VITE_WS_URL);
console.log("WebSocket ready state:", trackingWebSocket.getReadyState());

// Solutions:
// 1. Verify backend WebSocket server is running
// 2. Check WebSocket URL format (ws:// or wss://)
// 3. Verify firewall/proxy settings
```

### Issue 4: Performance Issues

```javascript
// Monitor performance:
// 1. Check React Query DevTools for query states
// 2. Monitor WebSocket message frequency
// 3. Check for memory leaks in component unmounting
```

## 📊 Expected Performance Metrics

### Load Times

- Initial component load: < 2 seconds
- Map initialization: < 3 seconds
- Cargo data fetch: < 1 second
- WebSocket connection: < 2 seconds

### Update Frequencies

- Cargo list refresh: 60 seconds
- Live tracking updates: 15-30 seconds
- Connection status checks: 30 seconds
- Map updates: Real-time (when data changes)

## 🧪 Test Scenarios

### Scenario 1: Normal Operation

1. User opens dashboard
2. Cargo list loads with in-transit deliveries
3. User selects a cargo
4. Map shows route with markers
5. Live updates show progress
6. Connection status shows "Live"

### Scenario 2: Network Issues

1. User opens dashboard
2. Network disconnects
3. Connection status shows "Offline"
4. Cached data still shows
5. Network reconnects
6. Auto-reconnection happens
7. Status returns to "Live"

### Scenario 3: API Errors

1. User opens dashboard
2. Backend returns 500 error
3. Error fallback UI shows
4. Retry button works
5. Data loads after retry

### Scenario 4: Map API Issues

1. User opens dashboard
2. Google Maps API key invalid
3. Map error fallback shows
4. Clear error message displayed
5. Retry button attempts re-initialization

## 🎯 Success Criteria

### ✅ Functional Requirements

- [ ] Cargo list loads and displays correctly
- [ ] Map initializes and shows markers
- [ ] Real-time updates work
- [ ] Error handling works properly
- [ ] Retry mechanisms function
- [ ] Performance is acceptable

### ✅ User Experience

- [ ] Loading states are clear
- [ ] Error messages are helpful
- [ ] Interface is responsive
- [ ] No console errors
- [ ] Smooth animations and transitions

### ✅ Technical Requirements

- [ ] React Query caching works
- [ ] WebSocket reconnection works
- [ ] Memory leaks are prevented
- [ ] Component cleanup works
- [ ] TypeScript types are correct

## 🚨 Troubleshooting Checklist

- [ ] Environment variables are set correctly
- [ ] Backend API endpoints are available
- [ ] WebSocket server is running
- [ ] Google Maps API key is valid
- [ ] Network connectivity is stable
- [ ] Browser supports WebSocket
- [ ] CORS is configured properly
- [ ] Authentication is working
- [ ] Database has test data
- [ ] Logs show no errors

## 📝 Test Report Template

```
Live Tracking Test Report
Date: ___________
Tester: ___________

Environment:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- WebSocket: ws://localhost:3000

Test Results:
[ ] Component loads successfully
[ ] Cargo data fetches correctly
[ ] Map initializes properly
[ ] WebSocket connects
[ ] Real-time updates work
[ ] Error handling functions
[ ] Performance is acceptable

Issues Found:
1. ________________
2. ________________
3. ________________

Recommendations:
1. ________________
2. ________________
3. ________________
```

This comprehensive testing approach ensures your live tracking system is production-ready and provides a great user experience!
