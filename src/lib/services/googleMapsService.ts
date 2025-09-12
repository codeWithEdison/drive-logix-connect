// Google Maps API utilities for location search and distance calculation
export interface GooglePlace {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export interface DistanceMatrixResult {
  distance: {
    text: string;
    value: number; // in meters
  };
  duration: {
    text: string;
    value: number; // in seconds
  };
  status: string;
}

export interface DistanceMatrixResponse {
  destination_addresses: string[];
  origin_addresses: string[];
  rows: Array<{
    elements: DistanceMatrixResult[];
  }>;
  status: string;
}

class GoogleMapsService {
  private apiKey: string;
  private placesService: google.maps.places.PlacesService | null = null;
  private autocompleteService: google.maps.places.AutocompleteService | null =
    null;
  private distanceMatrixService: google.maps.DistanceMatrixService | null =
    null;
  private isInitializing: boolean = false;

  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!this.apiKey) {
      console.warn(
        "Google Maps API key not found. Please set VITE_GOOGLE_MAPS_API_KEY in your environment variables."
      );
      console.warn(
        "Location search and distance calculation will use fallback methods."
      );
    }
  }

  // Initialize Google Maps services
  private async initializeServices(): Promise<void> {
    // Prevent multiple simultaneous initializations
    if (this.isInitializing) {
      console.log("⏳ Google Maps already initializing, waiting...");
      // Wait for initialization to complete
      while (this.isInitializing) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return;
    }

    if (!window.google || !window.google.maps || !window.google.maps.places) {
      this.isInitializing = true;
      try {
        await this.loadGoogleMapsScript();
      } finally {
        this.isInitializing = false;
      }
    }

    // Final check - if Places library is still not available, throw error
    if (!window.google.maps.places) {
      console.error(
        "❌ Google Maps Places library not loaded after initialization"
      );
      throw new Error("Google Maps Places library not available");
    }

    console.log("✅ Google Maps Places library confirmed available");

    if (!this.placesService) {
      const mapDiv = document.createElement("div");
      this.placesService = new google.maps.places.PlacesService(mapDiv);
    }

    if (!this.autocompleteService) {
      this.autocompleteService = new google.maps.places.AutocompleteService();
    }

    if (!this.distanceMatrixService) {
      this.distanceMatrixService = new google.maps.DistanceMatrixService();
    }
  }

  // Load Google Maps script dynamically
  private loadGoogleMapsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if Google Maps is already loaded with Places library
      if (window.google && window.google.maps && window.google.maps.places) {
        console.log("✅ Google Maps with Places library already loaded");
        resolve();
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector(
        'script[src*="maps.googleapis.com"]'
      );
      if (existingScript) {
        console.log("⏳ Google Maps script already loading, waiting...");
        // Wait for existing script to load
        const checkLoaded = setInterval(() => {
          if (
            window.google &&
            window.google.maps &&
            window.google.maps.places
          ) {
            clearInterval(checkLoaded);
            console.log(
              "✅ Google Maps with Places library loaded from existing script"
            );
            resolve();
          }
        }, 100);

        // Timeout after 15 seconds
        setTimeout(() => {
          clearInterval(checkLoaded);
          console.log("⚠️ Existing script timeout, removing and reloading...");
          // Remove the existing script and try again
          existingScript.remove();
          // Try to load again after a short delay
          setTimeout(() => {
            this.loadGoogleMapsScript().then(resolve).catch(reject);
          }, 1000);
        }, 15000);
        return;
      }

      console.log("📥 Loading Google Maps script with Places library...");
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;

      // Global callback function
      (window as any).initGoogleMaps = () => {
        console.log("✅ Google Maps script loaded successfully");
        // Wait a bit more to ensure Places library is fully loaded
        setTimeout(() => {
          if (
            window.google &&
            window.google.maps &&
            window.google.maps.places
          ) {
            console.log("✅ Google Maps Places library confirmed loaded");
            resolve();
          } else {
            console.error(
              "❌ Google Maps Places library not available after loading"
            );
            reject(new Error("Google Maps Places library not available"));
          }
        }, 500);
      };

      script.onerror = () => {
        console.error("❌ Failed to load Google Maps script");
        reject(new Error("Failed to load Google Maps script"));
      };

      document.head.appendChild(script);
      console.log("📤 Google Maps script added to document head");
    });
  }

  // Search for places using Google Places Autocomplete
  async searchPlaces(
    query: string,
    countryCode: string = "RW"
  ): Promise<GooglePlace[]> {
    if (!query.trim()) return [];

    console.log("🔍 Searching for:", query);
    console.log("🔑 API Key available:", !!this.apiKey);

    // Fallback if no API key
    if (!this.apiKey) {
      console.log("⚠️ No API key, using fallback results");
      return this.getFallbackSearchResults(query);
    }

    try {
      console.log("🚀 Initializing Google Maps services...");
      await this.initializeServices();
      console.log("✅ Google Maps services initialized");

      return new Promise((resolve, reject) => {
        if (!this.autocompleteService) {
          console.error("❌ Autocomplete service not initialized");
          reject(new Error("Autocomplete service not initialized"));
          return;
        }

        const request: google.maps.places.AutocompleteRequest = {
          input: query,
        };

        console.log("📡 Making Places API request:", request);

        this.autocompleteService.getPlacePredictions(
          request,
          (predictions, status) => {
            console.log("📥 Places API response:", {
              status,
              predictionsCount: predictions?.length,
            });

            if (
              status === google.maps.places.PlacesServiceStatus.OK &&
              predictions
            ) {
              const places: GooglePlace[] = predictions.map((prediction) => ({
                place_id: prediction.place_id,
                description: prediction.description,
                structured_formatting: {
                  main_text: prediction.structured_formatting.main_text,
                  secondary_text:
                    prediction.structured_formatting.secondary_text,
                },
              }));
              console.log("✅ Found places:", places.length);
              resolve(places);
            } else {
              console.error("❌ Places API error:", status);
              console.log("🔄 Falling back to mock results");
              // Fallback to mock results on API error
              resolve(this.getFallbackSearchResults(query));
            }
          }
        );
      });
    } catch (error) {
      console.error("❌ Error searching places:", error);
      console.log("🔄 Falling back to mock results");
      // Fallback to mock results on error
      return this.getFallbackSearchResults(query);
    }
  }

  // Fallback search results when Google Maps API is not available
  private getFallbackSearchResults(query: string): GooglePlace[] {
    const mockResults: GooglePlace[] = [
      {
        place_id: `fallback-${query}-1`,
        description: `${query} - Kigali, Rwanda`,
        structured_formatting: {
          main_text: query,
          secondary_text: "Kigali, Rwanda",
        },
      },
      {
        place_id: `fallback-${query}-2`,
        description: `${query} - Remera, Kigali, Rwanda`,
        structured_formatting: {
          main_text: query,
          secondary_text: "Remera, Kigali, Rwanda",
        },
      },
      {
        place_id: `fallback-${query}-3`,
        description: `${query} - Nyarugenge, Kigali, Rwanda`,
        structured_formatting: {
          main_text: query,
          secondary_text: "Nyarugenge, Kigali, Rwanda",
        },
      },
    ];
    return mockResults;
  }

  // Get place details including coordinates
  async getPlaceDetails(
    placeId: string
  ): Promise<{ lat: number; lng: number; address: string } | null> {
    // Fallback if no API key
    if (!this.apiKey) {
      return this.getFallbackPlaceDetails(placeId);
    }

    try {
      await this.initializeServices();

      return new Promise((resolve, reject) => {
        if (!this.placesService) {
          reject(new Error("Places service not initialized"));
          return;
        }

        const request: google.maps.places.PlaceDetailsRequest = {
          placeId: placeId,
          fields: ["geometry", "formatted_address"],
        };

        this.placesService.getDetails(request, (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            const location = place.geometry?.location;
            if (location) {
              resolve({
                lat: location.lat(),
                lng: location.lng(),
                address: place.formatted_address || "",
              });
            } else {
              resolve(null);
            }
          } else {
            console.error("Place details error:", status);
            // Fallback to mock coordinates on API error
            resolve(this.getFallbackPlaceDetails(placeId));
          }
        });
      });
    } catch (error) {
      console.error("Error getting place details:", error);
      // Fallback to mock coordinates on error
      return this.getFallbackPlaceDetails(placeId);
    }
  }

  // Fallback place details when Google Maps API is not available
  private getFallbackPlaceDetails(
    placeId: string
  ): { lat: number; lng: number; address: string } | null {
    // Generate mock coordinates based on place ID
    const baseLat = -1.9441; // Kigali latitude
    const baseLng = 30.0619; // Kigali longitude

    // Add some variation based on place ID
    const variation = placeId.length * 0.001;

    return {
      lat: baseLat + variation,
      lng: baseLng + variation,
      address: `Mock Address for ${placeId}`,
    };
  }

  // Calculate distance between two coordinates using Distance Matrix API
  async calculateDistance(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<{ distance: number; duration: number } | null> {
    // Fallback if no API key
    if (!this.apiKey) {
      return this.getFallbackDistance(origin, destination);
    }

    try {
      await this.initializeServices();

      return new Promise((resolve, reject) => {
        if (!this.distanceMatrixService) {
          reject(new Error("Distance Matrix service not initialized"));
          return;
        }

        const request: google.maps.DistanceMatrixRequest = {
          origins: [origin],
          destinations: [destination],
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
          avoidHighways: false,
          avoidTolls: false,
        };

        this.distanceMatrixService.getDistanceMatrix(
          request,
          (response, status) => {
            if (status === google.maps.DistanceMatrixStatus.OK && response) {
              const element = response.rows[0]?.elements[0];
              if (
                element &&
                element.status === google.maps.DistanceMatrixElementStatus.OK
              ) {
                resolve({
                  distance: element.distance.value, // in meters
                  duration: element.duration.value, // in seconds
                });
              } else {
                console.error("Distance calculation failed:", element?.status);
                // Fallback to mock distance on API error
                resolve(this.getFallbackDistance(origin, destination));
              }
            } else {
              console.error("Distance Matrix API error:", status);
              // Fallback to mock distance on API error
              resolve(this.getFallbackDistance(origin, destination));
            }
          }
        );
      });
    } catch (error) {
      console.error("Error calculating distance:", error);
      // Fallback to mock distance on error
      return this.getFallbackDistance(origin, destination);
    }
  }

  // Fallback distance calculation when Google Maps API is not available
  private getFallbackDistance(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): { distance: number; duration: number } {
    // Simple Haversine formula for distance calculation
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(destination.lat - origin.lat);
    const dLng = this.toRadians(destination.lng - origin.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(origin.lat)) *
        Math.cos(this.toRadians(destination.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in meters

    // Estimate duration based on distance (assuming average speed of 30 km/h in city)
    const duration = (distance / 1000) * 120; // seconds (2 minutes per km)

    return {
      distance: Math.round(distance),
      duration: Math.round(duration),
    };
  }

  // Helper function to convert degrees to radians
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Calculate distance between two addresses using Distance Matrix API
  async calculateDistanceByAddress(
    originAddress: string,
    destinationAddress: string
  ): Promise<{ distance: number; duration: number } | null> {
    try {
      await this.initializeServices();

      return new Promise((resolve, reject) => {
        if (!this.distanceMatrixService) {
          reject(new Error("Distance Matrix service not initialized"));
          return;
        }

        const request: google.maps.DistanceMatrixRequest = {
          origins: [originAddress],
          destinations: [destinationAddress],
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
          avoidHighways: false,
          avoidTolls: false,
        };

        this.distanceMatrixService.getDistanceMatrix(
          request,
          (response, status) => {
            if (status === google.maps.DistanceMatrixStatus.OK && response) {
              const element = response.rows[0]?.elements[0];
              if (
                element &&
                element.status === google.maps.DistanceMatrixElementStatus.OK
              ) {
                resolve({
                  distance: element.distance.value, // in meters
                  duration: element.duration.value, // in seconds
                });
              } else {
                console.error("Distance calculation failed:", element?.status);
                resolve(null);
              }
            } else {
              console.error("Distance Matrix API error:", status);
              resolve(null);
            }
          }
        );
      });
    } catch (error) {
      console.error("Error calculating distance by address:", error);
      return null;
    }
  }

  // Convert meters to kilometers
  metersToKilometers(meters: number): number {
    return Math.round((meters / 1000) * 100) / 100; // Round to 2 decimal places
  }

  // Convert seconds to hours
  secondsToHours(seconds: number): number {
    return Math.round((seconds / 3600) * 100) / 100; // Round to 2 decimal places
  }

  // Format duration in a human-readable format
  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }
}

// Export singleton instance
export const googleMapsService = new GoogleMapsService();
