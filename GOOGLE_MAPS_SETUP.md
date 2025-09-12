# Google Maps Integration Setup Guide

## Overview

This guide explains how to set up Google Maps integration for the Loveway Logistics, enabling location search and automatic distance calculation.

## Prerequisites

- Google Cloud Platform account
- Google Maps API key with appropriate permissions

## Required Google Maps APIs

### 1. Places API

- **Purpose**: Location search and autocomplete functionality
- **Enable**: Go to Google Cloud Console > APIs & Services > Library > Search "Places API" > Enable

### 2. Distance Matrix API

- **Purpose**: Calculate distances between locations
- **Enable**: Go to Google Cloud Console > APIs & Services > Library > Search "Distance Matrix API" > Enable

### 3. Maps JavaScript API

- **Purpose**: Load Google Maps JavaScript library
- **Enable**: Go to Google Cloud Console > APIs & Services > Library > Search "Maps JavaScript API" > Enable

## Environment Setup

### 1. Create Environment File

Create a `.env.local` file in your project root:

```bash
# Google Maps API Configuration
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Backend API Configuration (if needed)
VITE_API_BASE_URL=http://localhost:3000/v1
```

### 2. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "API Key"
5. Copy the generated API key
6. Replace `your_google_maps_api_key_here` in your `.env.local` file

### 3. Configure API Key Restrictions (Recommended)

For security, restrict your API key:

1. In Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click on your API key
3. Under "Application restrictions":
   - Choose "HTTP referrers (web sites)"
   - Add your domain (e.g., `localhost:8080/*`, `yourdomain.com/*`)
4. Under "API restrictions":
   - Choose "Restrict key"
   - Select only the APIs you need:
     - Places API
     - Distance Matrix API
     - Maps JavaScript API

## Features Implemented

### 1. Location Search

- **Autocomplete**: Real-time location suggestions as user types
- **Country Restriction**: Limited to Rwanda (RW) for better accuracy
- **Address Types**: Focuses on addresses for cargo delivery

### 2. Distance Calculation

- **Automatic**: Calculates distance when both pickup and delivery locations are selected
- **Manual Recalculation**: Users can recalculate distance if needed
- **Real-time**: Uses Google Maps Distance Matrix API for accurate results

### 3. User Experience

- **Loading States**: Shows loading indicators during API calls
- **Error Handling**: Graceful error messages for API failures
- **Fallback**: Manual address entry if search fails

## Usage in CreateCargoForm

### Location Search

```typescript
// Search for places
const results = await googleMapsService.searchPlaces(query, "RW");

// Get place details with coordinates
const placeDetails = await googleMapsService.getPlaceDetails(placeId);
```

### Distance Calculation

```typescript
// Calculate distance between coordinates
const result = await googleMapsService.calculateDistance(
  { lat: pickupLat, lng: pickupLng },
  { lat: destinationLat, lng: destinationLng }
);

// Convert meters to kilometers
const distanceKm = googleMapsService.metersToKilometers(result.distance);
```

## Troubleshooting

### Common Issues

1. **"Google Maps API key not found"**

   - Check if `VITE_GOOGLE_MAPS_API_KEY` is set in your `.env.local` file
   - Restart your development server after adding the environment variable

2. **"Failed to load Google Maps script"**

   - Verify your API key is correct
   - Check if Maps JavaScript API is enabled
   - Ensure your domain is allowed in API key restrictions

3. **"Places API error" or "Distance Matrix API error"**

   - Verify the respective APIs are enabled in Google Cloud Console
   - Check if your API key has permission to access these APIs
   - Ensure you haven't exceeded API quotas

4. **Search results not showing**
   - Check if Places API is enabled
   - Verify API key restrictions allow your domain
   - Check browser console for specific error messages

### API Quotas and Billing

- **Places API**: Free tier includes 1,000 requests per month
- **Distance Matrix API**: Free tier includes 2,500 requests per month
- **Maps JavaScript API**: Free tier includes 28,000 map loads per month

Monitor your usage in Google Cloud Console > APIs & Services > Quotas

## Security Best Practices

1. **API Key Restrictions**: Always restrict your API key to specific domains and APIs
2. **Environment Variables**: Never commit API keys to version control
3. **HTTPS**: Use HTTPS in production for secure API calls
4. **Monitoring**: Monitor API usage and set up billing alerts

## Testing

To test the integration:

1. Start your development server: `npm run dev`
2. Navigate to the Create Cargo form
3. Go to Step 2 (Pickup & Delivery Locations)
4. Try searching for locations in Rwanda
5. Verify distance calculation works automatically

## Support

For issues with Google Maps APIs, refer to:

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Maps Platform Support](https://developers.google.com/maps/support)
