import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MapPin,
  Navigation,
  Truck,
  Clock,
  Phone,
  MessageCircle,
  Eye,
  EyeOff
} from "lucide-react";

// Types
interface Vehicle {
  id: string;
  position: { lat: number; lng: number };
  status: 'In Transit' | 'Delivered' | 'Pending' | 'Pickup';
  driver: string;
  cargoId?: string;
  estimatedArrival?: string;
  progress?: number;
  routeIndex?: number;
  routePoints?: { lat: number; lng: number }[];
}

interface TrackingComponentProps {
  vehicles?: Vehicle[];
  center?: { lat: number; lng: number };
  zoom?: number;
  showControls?: boolean;
  showInfoCards?: boolean;
  className?: string;
  height?: string;
}

// Kigali coordinates - Remera to Nyarugenge route
const KIGALI_REMERA = { lat: -1.9441, lng: 30.0619 }; // Starting point
const KIGALI_NYARUGENGE = { lat: -1.9500, lng: 30.0580 }; // Destination

// Calculate route points for smooth animation
const calculateRoutePoints = (start: { lat: number; lng: number }, end: { lat: number; lng: number }, steps: number) => {
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const lat = start.lat + (end.lat - start.lat) * (i / steps);
    const lng = start.lng + (end.lng - start.lng) * (i / steps);
    points.push({ lat, lng });
  }
  return points;
};

// Route from Remera to Nyarugenge
const ROUTE_POINTS = calculateRoutePoints(KIGALI_REMERA, KIGALI_NYARUGENGE, 50);

// Static vehicles at pickup and delivery locations
const DEFAULT_VEHICLES: Vehicle[] = [
  {
    id: "#3565432",
    position: KIGALI_REMERA,
    status: "Pickup",
    driver: "Albert Flores",
    cargoId: "#3565432",
    estimatedArrival: "Ready for pickup",
    progress: 0
  },
  {
    id: "#4832920",
    position: KIGALI_NYARUGENGE,
    status: "Delivered",
    driver: "Guy Hawkins",
    cargoId: "#4832920",
    estimatedArrival: "Delivered",
    progress: 100
  }
];

declare global {
  interface Window {
    google: any;
  }
}

export function TrackingComponent({
  vehicles = DEFAULT_VEHICLES,
  center = KIGALI_REMERA,
  zoom = 14,
  showControls = true,
  showInfoCards = true,
  className = "",
  height = "h-96"
}: TrackingComponentProps) {
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showMap, setShowMap] = useState(true);
  const [staticVehicles, setStaticVehicles] = useState<Vehicle[]>(vehicles);
  const [routeLine, setRouteLine] = useState<any>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);

  // No animation - static vehicles only

  useEffect(() => {
    const loadGoogleMaps = () => {
      setIsMapLoading(true);
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=geometry,places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      script.onerror = () => {
        setIsMapLoading(false);
        console.error('Failed to load Google Maps');
      };
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (mapRef.current && window.google) {
        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: center,
          zoom: zoom,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ],
          // Add smooth pan and zoom options
          panControl: false,
          zoomControl: false,
          mapTypeControl: false,
          scaleControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          gestureHandling: 'cooperative'
        });

        setMap(mapInstance);

        // Draw route line from pickup to delivery
        const routePath = new window.google.maps.Polyline({
          path: ROUTE_POINTS,
          geodesic: true,
          strokeColor: '#3B82F6',
          strokeOpacity: 0.8,
          strokeWeight: 4,
          icons: [{
            icon: {
              path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW
            },
            offset: '50%',
            repeat: '100px'
          }]
        });

        routePath.setMap(mapInstance);
        setRouteLine(routePath);

        // Add pickup and delivery markers
        const pickupMarker = new window.google.maps.Marker({
          position: KIGALI_REMERA,
          map: mapInstance,
          title: "Pickup Location",
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#10B981"/>
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="white"/>
              </svg>
            `)}`,
            scaledSize: new window.google.maps.Size(24, 24),
            anchor: new window.google.maps.Point(12, 12)
          }
        });

        const deliveryMarker = new window.google.maps.Marker({
          position: KIGALI_NYARUGENGE,
          map: mapInstance,
          title: "Delivery Location",
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#EF4444"/>
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="white"/>
              </svg>
            `)}`,
            scaledSize: new window.google.maps.Size(24, 24),
            anchor: new window.google.maps.Point(12, 12)
          }
        });

        // Add info windows for pickup and delivery
        const pickupInfoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; min-width: 120px;">
              <h3 style="margin: 0; font-weight: 600; color: #1f2937; font-size: 12px;">Pickup Location</h3>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #6b7280;">Remera, Kigali</p>
            </div>
          `
        });

        const deliveryInfoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; min-width: 120px;">
              <h3 style="margin: 0; font-weight: 600; color: #1f2937; font-size: 12px;">Delivery Location</h3>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #6b7280;">Nyarugenge, Kigali</p>
            </div>
          `
        });

        pickupMarker.addListener('click', () => {
          pickupInfoWindow.open(mapInstance, pickupMarker);
        });

        deliveryMarker.addListener('click', () => {
          deliveryInfoWindow.open(mapInstance, deliveryMarker);
        });

        // Add markers for vehicles with better icons
        const newMarkers = staticVehicles.map((vehicle) => {
          const marker = new window.google.maps.Marker({
            position: vehicle.position,
            map: mapInstance,
            title: vehicle.id,
            // Use truck icon for better visual representation
            icon: {
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1" y="3" width="15" height="13" rx="2" fill="${getStatusColor(vehicle.status)}"/>
                  <circle cx="7" cy="18" r="2" fill="${getStatusColor(vehicle.status)}"/>
                  <circle cx="17" cy="18" r="2" fill="${getStatusColor(vehicle.status)}"/>
                  <path d="M16 8h4l3 3v5h-3" stroke="${getStatusColor(vehicle.status)}" stroke-width="2" fill="none"/>
                  <path d="M1 8h15" stroke="white" stroke-width="1"/>
                </svg>
              `)}`,
              scaledSize: new window.google.maps.Size(32, 32),
              anchor: new window.google.maps.Point(16, 16)
            },
            // Add smooth animation options
            animation: window.google?.maps?.Animation?.DROP
          });

          // Add info window with better styling
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 12px; min-width: 200px;">
                <h3 style="margin: 0 0 8px 0; font-weight: 600; color: #1f2937;">${vehicle.id}</h3>
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280;">${vehicle.driver}</p>
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280;">Status: ${vehicle.status}</p>
                ${vehicle.cargoId ? `<p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280;">Cargo: ${vehicle.cargoId}</p>` : ''}
                <p style="margin: 0; font-size: 12px; color: #3b82f6; font-weight: 500;">Progress: ${vehicle.progress || 0}%</p>
              </div>
            `
          });

          marker.addListener('click', () => {
            setSelectedVehicle(vehicle);
            infoWindow.open(mapInstance, marker);
          });

          return marker;
        });

        setMarkers(newMarkers);
        setIsMapLoading(false);
      }
    };

    if (!window.google) {
      loadGoogleMaps();
    } else {
      initializeMap();
    }

    return () => {
      markers.forEach(marker => marker.setMap(null));
      if (routeLine) {
        routeLine.setMap(null);
      }
    };
  }, [staticVehicles, center, zoom]);

  const getStatusColor = (status: Vehicle['status']) => {
    switch (status) {
      case 'In Transit':
        return '#3B82F6';
      case 'Delivered':
        return '#10B981';
      case 'Pending':
        return '#F59E0B';
      case 'Pickup':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const getStatusBadgeColor = (status: Vehicle['status']) => {
    switch (status) {
      case 'In Transit':
        return 'bg-blue-100 text-blue-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pickup':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`bg-muted rounded-lg relative overflow-hidden ${height} ${className}`}>
      {/* Loading State */}
      {isMapLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm">Loading map...</p>
          </div>
        </div>
      )}

      {/* Google Maps Container - Always visible */}
      <div ref={mapRef} className="w-full h-full rounded-lg" />

      {/* Tracking Info Overlay - Only show when vehicle is selected */}
      {showInfoCards && selectedVehicle && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{selectedVehicle.cargoId || selectedVehicle.id}</p>
              <p className="text-xs text-gray-600">{selectedVehicle.driver}</p>
            </div>
            <Badge className={getStatusBadgeColor(selectedVehicle.status)}>
              {selectedVehicle.status}
            </Badge>
          </div>

          {selectedVehicle.estimatedArrival && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Est. Arrival</span>
                <span className="font-semibold text-blue-600">{selectedVehicle.estimatedArrival}</span>
              </div>
              {selectedVehicle.progress !== undefined && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold">{selectedVehicle.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${selectedVehicle.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Driver Info Card - Only show when vehicle is selected */}
      {showInfoCards && selectedVehicle && (
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <Navigation className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-sm">{selectedVehicle.driver}</p>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-600">Driver</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1">
              <Phone className="h-3 w-3 mr-1" />
              Call
            </Button>
          
          </div>
        </div>
      )}

      {/* Map Controls */}
      {showControls && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2">
          <div className="flex flex-col gap-1">
            <Button
              size="sm"
              variant="outline"
              className="w-8 h-8 p-0"
              onClick={() => map?.setZoom(map.getZoom() + 1)}
            >
              +
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-8 h-8 p-0"
              onClick={() => map?.setZoom(map.getZoom() - 1)}
            >
              -
            </Button>
          </div>
        </div>
      )}

      {/* Close button for selected vehicle info */}
      {selectedVehicle && (
        <Button
          size="sm"
          variant="outline"
          className="absolute top-4 left-4 bg-white shadow-lg z-10"
          onClick={() => setSelectedVehicle(null)}
        >
          ×
        </Button>
      )}
    </div>
  );
}
