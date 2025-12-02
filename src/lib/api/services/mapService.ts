import { GPSTracking } from "../../../types/shared";

export interface MapMarker {
  id: string;
  position: { lat: number; lng: number };
  title: string;
  icon?: string | google.maps.Icon;
  infoWindow?: google.maps.InfoWindow;
}

export interface RoutePolyline {
  id: string;
  path: { lat: number; lng: number }[];
  strokeColor: string;
  strokeOpacity: number;
  strokeWeight: number;
  geodesic: boolean;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export class MapService {
  private static mapInstance: google.maps.Map | null = null;
  private static markers: Map<string, google.maps.Marker> = new Map();
  private static polylines: Map<string, google.maps.Polyline> = new Map();
  private static infoWindows: Map<string, google.maps.InfoWindow> = new Map();

  // Initialize Google Maps
  static async initializeMap(
    container: HTMLElement,
    options: google.maps.MapOptions = {}
  ): Promise<google.maps.Map> {
    if (!window.google?.maps) {
      throw new Error("Google Maps API not loaded");
    }

    const defaultOptions: google.maps.MapOptions = {
      center: { lat: -1.9441, lng: 30.0619 }, // Kigali coordinates
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "transit",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
      ...options,
    };

    this.mapInstance = new google.maps.Map(container, defaultOptions);
    return this.mapInstance;
  }

  // Get map instance
  static getMapInstance(): google.maps.Map | null {
    return this.mapInstance;
  }

  // Create custom marker icon
  static createMarkerIcon(
    color: string,
    type: "pickup" | "delivery" | "vehicle" | "current" = "vehicle"
  ): google.maps.Icon {
    const iconMap = {
      pickup:
        "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
      delivery:
        "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
      vehicle:
        "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
      current:
        "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
    };

    return {
      url: `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}"><path d="${iconMap[type]}"/></svg>`)}`,
      scaledSize: new google.maps.Size(32, 32),
      anchor: new google.maps.Point(16, 32),
    } as google.maps.Icon;
  }

  // Add marker to map
  static addMarker(marker: MapMarker): google.maps.Marker {
    if (!this.mapInstance) {
      throw new Error("Map not initialized");
    }

    const googleMarker = new google.maps.Marker({
      position: marker.position,
      map: this.mapInstance,
      title: marker.title,
      icon: marker.icon || this.createMarkerIcon("#3B82F6"),
    });

    this.markers.set(marker.id, googleMarker);

    // Add info window if provided
    if (marker.infoWindow) {
      this.infoWindows.set(marker.id, marker.infoWindow);
      googleMarker.addListener("click", () => {
        marker.infoWindow!.open(this.mapInstance, googleMarker);
      });
    }

    return googleMarker;
  }

  // Update marker position
  static updateMarkerPosition(
    markerId: string,
    position: { lat: number; lng: number }
  ): void {
    const marker = this.markers.get(markerId);
    if (marker) {
      marker.setPosition(position);
    }
  }

  // Remove marker
  static removeMarker(markerId: string): void {
    const marker = this.markers.get(markerId);
    if (marker) {
      marker.setMap(null);
      this.markers.delete(markerId);
    }

    const infoWindow = this.infoWindows.get(markerId);
    if (infoWindow) {
      infoWindow.close();
      this.infoWindows.delete(markerId);
    }
  }

  // Clear all markers
  static clearMarkers(): void {
    this.markers.forEach((marker) => marker.setMap(null));
    this.markers.clear();

    this.infoWindows.forEach((infoWindow) => infoWindow.close());
    this.infoWindows.clear();
  }

  // Add route polyline
  static addRoutePolyline(polyline: RoutePolyline): google.maps.Polyline {
    if (!this.mapInstance) {
      throw new Error("Map not initialized");
    }

    const googlePolyline = new google.maps.Polyline({
      path: polyline.path,
      geodesic: polyline.geodesic,
      strokeColor: polyline.strokeColor,
      strokeOpacity: polyline.strokeOpacity,
      strokeWeight: polyline.strokeWeight,
      map: this.mapInstance,
    });

    this.polylines.set(polyline.id, googlePolyline);
    return googlePolyline;
  }

  // Update route polyline
  static updateRoutePolyline(
    polylineId: string,
    path: { lat: number; lng: number }[]
  ): void {
    const polyline = this.polylines.get(polylineId);
    if (polyline) {
      polyline.setPath(path);
    }
  }

  // Remove polyline
  static removePolyline(polylineId: string): void {
    const polyline = this.polylines.get(polylineId);
    if (polyline) {
      polyline.setMap(null);
      this.polylines.delete(polylineId);
    }
  }

  // Clear all polylines
  static clearPolylines(): void {
    this.polylines.forEach((polyline) => polyline.setMap(null));
    this.polylines.clear();
  }

  // Draw route from GPS tracking data
  static drawRouteFromTracking(
    routeId: string,
    trackingData: GPSTracking[],
    options: Partial<RoutePolyline> = {}
  ): google.maps.Polyline {
    const path = trackingData.map((point) => ({
      lat: point.latitude,
      lng: point.longitude,
    }));

    const polyline: RoutePolyline = {
      id: routeId,
      path,
      strokeColor: options.strokeColor || "#3B82F6",
      strokeOpacity: options.strokeOpacity || 1.0,
      strokeWeight: options.strokeWeight || 3,
      geodesic: options.geodesic !== false,
    };

    return this.addRoutePolyline(polyline);
  }

  // Create info window content
  static createInfoWindowContent(
    title: string,
    content: string,
    options: { maxWidth?: number; pixelOffset?: google.maps.Size } = {}
  ): google.maps.InfoWindow {
    return new google.maps.InfoWindow({
      content: `
        <div style="padding: 8px; max-width: ${options.maxWidth || 200}px;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">${title}</h3>
          <p style="margin: 0; font-size: 12px; color: #666;">${content}</p>
        </div>
      `,
      pixelOffset: options.pixelOffset || new google.maps.Size(0, -30),
    });
  }

  // Fit map to bounds
  static fitMapToBounds(bounds: MapBounds, padding: number = 50): void {
    if (!this.mapInstance) return;

    const googleBounds = new google.maps.LatLngBounds(
      { lat: bounds.south, lng: bounds.west },
      { lat: bounds.north, lng: bounds.east }
    );

    this.mapInstance.fitBounds(googleBounds, padding);
  }

  // Fit map to markers
  static fitMapToMarkers(markerIds?: string[], padding: number = 50): void {
    if (!this.mapInstance) return;

    const bounds = new google.maps.LatLngBounds();
    const markersToFit = markerIds
      ? markerIds.map((id) => this.markers.get(id)).filter(Boolean)
      : Array.from(this.markers.values());

    if (markersToFit.length === 0) return;

    markersToFit.forEach((marker) => {
      const pos = marker!.getPosition();
      // Guard against markers without a valid position to avoid InvalidValueError
      if (pos) {
        bounds.extend(pos);
      }
    });

    // Only fit bounds if we actually extended them with at least one position
    if (!bounds.isEmpty()) {
      this.mapInstance.fitBounds(bounds, padding);
    }
  }

  // Center map on location
  static centerMapOnLocation(
    position: { lat: number; lng: number },
    zoom?: number
  ): void {
    if (!this.mapInstance) return;

    this.mapInstance.setCenter(position);
    if (zoom) {
      this.mapInstance.setZoom(zoom);
    }
  }

  // Add traffic layer
  static addTrafficLayer(): google.maps.TrafficLayer | null {
    if (!this.mapInstance) return null;

    const trafficLayer = new google.maps.TrafficLayer();
    trafficLayer.setMap(this.mapInstance);
    return trafficLayer;
  }

  // Remove traffic layer
  static removeTrafficLayer(trafficLayer: google.maps.TrafficLayer): void {
    trafficLayer.setMap(null);
  }

  // Set map type
  static setMapType(mapType: google.maps.MapTypeId): void {
    if (!this.mapInstance) return;
    this.mapInstance.setMapTypeId(mapType);
  }

  // Get current map bounds
  static getCurrentBounds(): MapBounds | null {
    if (!this.mapInstance) return null;

    const bounds = this.mapInstance.getBounds();
    if (!bounds) return null;

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    return {
      north: ne.lat(),
      south: sw.lat(),
      east: ne.lng(),
      west: sw.lng(),
    };
  }

  // Calculate distance between two points
  static calculateDistance(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
  ): number {
    return google.maps.geometry.spherical.computeDistanceBetween(
      new google.maps.LatLng(point1.lat, point1.lng),
      new google.maps.LatLng(point2.lat, point2.lng)
    );
  }

  // Calculate route distance
  static calculateRouteDistance(path: { lat: number; lng: number }[]): number {
    let totalDistance = 0;
    for (let i = 0; i < path.length - 1; i++) {
      totalDistance += this.calculateDistance(path[i], path[i + 1]);
    }
    return totalDistance;
  }

  // Clean up map resources
  static cleanup(): void {
    this.clearMarkers();
    this.clearPolylines();
    this.mapInstance = null;
  }
}
