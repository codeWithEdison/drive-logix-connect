// GPS Tracking Service for real-time location tracking
export interface LocationData {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
    speed?: number;
    heading?: number;
    altitude?: number;
}

export interface TrackingConfig {
    enableHighAccuracy: boolean;
    timeout: number;
    maximumAge: number;
    updateInterval: number;
}

export interface TrackingCallbacks {
    onLocationUpdate?: (location: LocationData) => void;
    onError?: (error: GeolocationPositionError) => void;
    onStart?: () => void;
    onStop?: () => void;
}

class GpsTrackingService {
    private watchId: number | null = null;
    private isTracking = false;
    private config: TrackingConfig;
    private callbacks: TrackingCallbacks = {};
    private lastLocation: LocationData | null = null;
    private updateInterval: NodeJS.Timeout | null = null;

    constructor(config: Partial<TrackingConfig> = {}) {
        this.config = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 30000,
            updateInterval: 5000, // 5 seconds
            ...config
        };
    }

    // Check if GPS is available
    isGpsAvailable(): boolean {
        return 'geolocation' in navigator;
    }

    // Request GPS permissions
    async requestPermission(): Promise<boolean> {
        if (!this.isGpsAvailable()) {
            throw new Error('GPS is not available on this device');
        }

        try {
            // Try to get current position to trigger permission request
            await this.getCurrentPosition();
            return true;
        } catch (error) {
            console.error('GPS permission denied:', error);
            return false;
        }
    }

    // Get current position once
    async getCurrentPosition(): Promise<LocationData> {
        return new Promise((resolve, reject) => {
            if (!this.isGpsAvailable()) {
                reject(new Error('GPS is not available'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const locationData = this.convertPositionToLocationData(position);
                    this.lastLocation = locationData;
                    resolve(locationData);
                },
                (error) => {
                    reject(error);
                },
                {
                    enableHighAccuracy: this.config.enableHighAccuracy,
                    timeout: this.config.timeout,
                    maximumAge: this.config.maximumAge
                }
            );
        });
    }

    // Start continuous tracking
    startTracking(callbacks: TrackingCallbacks = {}): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (this.isTracking) {
                resolve(true);
                return;
            }

            if (!this.isGpsAvailable()) {
                reject(new Error('GPS is not available'));
                return;
            }

            this.callbacks = callbacks;

            try {
                this.watchId = navigator.geolocation.watchPosition(
                    (position) => {
                        const locationData = this.convertPositionToLocationData(position);
                        this.lastLocation = locationData;
                        this.callbacks.onLocationUpdate?.(locationData);
                    },
                    (error) => {
                        this.callbacks.onError?.(error);
                    },
                    {
                        enableHighAccuracy: this.config.enableHighAccuracy,
                        timeout: this.config.timeout,
                        maximumAge: this.config.maximumAge
                    }
                );

                this.isTracking = true;
                this.callbacks.onStart?.();
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    }

    // Stop tracking
    stopTracking(): void {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }

        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }

        this.isTracking = false;
        this.callbacks.onStop?.();
    }

    // Get last known location
    getLastLocation(): LocationData | null {
        return this.lastLocation;
    }

    // Check if currently tracking
    isCurrentlyTracking(): boolean {
        return this.isTracking;
    }

    // Calculate distance between two points (Haversine formula)
    calculateDistance(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ): number {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) *
            Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in kilometers
        return distance;
    }

    // Calculate bearing between two points
    calculateBearing(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ): number {
        const dLon = this.deg2rad(lon2 - lon1);
        const lat1Rad = this.deg2rad(lat1);
        const lat2Rad = this.deg2rad(lat2);

        const y = Math.sin(dLon) * Math.cos(lat2Rad);
        const x =
            Math.cos(lat1Rad) * Math.sin(lat2Rad) -
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

        const bearing = this.rad2deg(Math.atan2(y, x));
        return (bearing + 360) % 360;
    }

    // Convert degrees to radians
    private deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }

    // Convert radians to degrees
    private rad2deg(rad: number): number {
        return rad * (180 / Math.PI);
    }

    // Convert GeolocationPosition to LocationData
    private convertPositionToLocationData(position: GeolocationPosition): LocationData {
        return {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
            speed: position.coords.speed || undefined,
            heading: position.coords.heading || undefined,
            altitude: position.coords.altitude || undefined
        };
    }

    // Simulate location updates for testing (when GPS is not available)
    startSimulatedTracking(
        startLocation: { lat: number; lng: number },
        destination: { lat: number; lng: number },
        callbacks: TrackingCallbacks = {}
    ): void {
        if (this.isTracking) return;

        this.callbacks = callbacks;
        this.isTracking = true;
        this.callbacks.onStart?.();

        let progress = 0;
        const totalDistance = this.calculateDistance(
            startLocation.lat,
            startLocation.lng,
            destination.lat,
            destination.lng
        );

        this.updateInterval = setInterval(() => {
            progress += 0.02; // 2% progress per update

            if (progress >= 1) {
                progress = 1;
                this.stopTracking();
            }

            // Interpolate position
            const lat = startLocation.lat + (destination.lat - startLocation.lat) * progress;
            const lng = startLocation.lng + (destination.lng - startLocation.lng) * progress;

            const simulatedLocation: LocationData = {
                latitude: lat,
                longitude: lng,
                accuracy: 5,
                timestamp: Date.now(),
                speed: 30, // 30 km/h
                heading: this.calculateBearing(startLocation.lat, startLocation.lng, lat, lng)
            };

            this.lastLocation = simulatedLocation;
            this.callbacks.onLocationUpdate?.(simulatedLocation);
        }, this.config.updateInterval);
    }

    // Get location as address using reverse geocoding
    async getAddressFromLocation(location: LocationData): Promise<string> {
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.latitude},${location.longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
            );

            const data = await response.json();

            if (data.results && data.results.length > 0) {
                return data.results[0].formatted_address;
            }

            return 'Unknown location';
        } catch (error) {
            console.error('Error getting address:', error);
            return 'Unknown location';
        }
    }

    // Share location with admin system
    async shareLocationWithAdmin(
        location: LocationData,
        driverId: string,
        cargoId: string
    ): Promise<boolean> {
        try {
            const response = await fetch('/api/driver/location', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    driverId,
                    cargoId,
                    location: {
                        latitude: location.latitude,
                        longitude: location.longitude,
                        accuracy: location.accuracy,
                        timestamp: location.timestamp,
                        speed: location.speed,
                        heading: location.heading
                    }
                })
            });

            return response.ok;
        } catch (error) {
            console.error('Error sharing location:', error);
            return false;
        }
    }
}

// Create singleton instance
export const gpsTrackingService = new GpsTrackingService();

// Export default instance
export default gpsTrackingService;
