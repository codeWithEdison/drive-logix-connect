# Live Tracking Setup Guide

## Environment Variables Required

Create a `.env` file in your project root with the following variables:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000
VITE_API_VERSION=v1
VITE_API_TIMEOUT=30000

# WebSocket Configuration
VITE_WS_URL=ws://localhost:3000

# Google Maps Configuration
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Application Configuration
VITE_APP_NAME=Loveway Logistics
VITE_APP_VERSION=1.0.0
VITE_ENABLE_DEVTOOLS=true
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_TRACKING=true
```

## Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
   - Directions API
   - Distance Matrix API
4. Create credentials (API Key)
5. Restrict the API key to your domain
6. Add the API key to your `.env` file

## Backend API Endpoints Required

The live tracking system expects these endpoints to be available:

### Tracking Endpoints

- `GET /tracking/cargo/in-transit` - Get all in-transit cargo
- `GET /tracking/cargo/{id}` - Get cargo tracking details
- `GET /tracking/cargo/{id}/progress` - Get route progress
- `GET /tracking/vehicles/{id}/live` - Get live vehicle tracking
- `PUT /tracking/cargo/{id}/status` - Update tracking status

### WebSocket Endpoints

- `WS /ws/tracking` - WebSocket for real-time updates

## Features Implemented

### ✅ Production-Ready Components

- **TrackingService**: Complete API service for tracking operations
- **WebSocketService**: Real-time communication with auto-reconnect
- **MapService**: Google Maps integration with markers, polylines, and routes
- **LiveTrackingMap**: Full-featured tracking component with live updates

### ✅ Live Tracking Features

- Real-time GPS updates every 15-30 seconds
- Interactive Google Maps with custom markers
- Route visualization with progress tracking
- WebSocket connection with auto-reconnect
- Optimistic updates for better UX
- Connection status indicators

### ✅ User Experience

- Two-panel layout (cargo list + map)
- Dynamic contact information based on user role
- Progress indicators and ETA display
- Live status updates
- Error handling and fallbacks

### ✅ Performance Optimizations

- React Query caching and background refetching
- Optimistic updates for instant feedback
- Efficient marker and polyline management
- Connection pooling and retry logic

## Usage

### In Client Dashboard

```tsx
import { LiveTrackingMap } from "@/components/dashboard/LiveTrackingMap";

// The component automatically handles:
// - Fetching in-transit cargo
// - Live GPS updates
// - WebSocket connections
// - Map rendering and updates
<LiveTrackingMap />;
```

### WebSocket Integration

```tsx
import { trackingWebSocket } from "@/lib/api/services/websocketService";

// Subscribe to live updates
const unsubscribe = trackingWebSocket.onLocationUpdate((data) => {
  console.log("Location updated:", data);
});

// Clean up
unsubscribe();
```

## Testing

1. Start your backend server
2. Ensure WebSocket endpoint is available
3. Add Google Maps API key to environment
4. The component will automatically:
   - Connect to WebSocket
   - Load in-transit cargo
   - Initialize Google Maps
   - Start live tracking updates

## Troubleshooting

### Map Not Loading

- Check Google Maps API key
- Ensure API key has proper permissions
- Verify internet connection

### WebSocket Connection Failed

- Check backend WebSocket endpoint
- Verify VITE_WS_URL environment variable
- Check browser console for errors

### No Data Loading

- Verify backend API endpoints
- Check network requests in browser dev tools
- Ensure user authentication is working

## Next Steps

1. **Backend Integration**: Connect to your actual backend APIs
2. **WebSocket Implementation**: Implement WebSocket server for real-time updates
3. **GPS Integration**: Connect to actual GPS tracking devices
4. **Testing**: Test with real cargo and driver data
5. **Monitoring**: Add analytics and error tracking
