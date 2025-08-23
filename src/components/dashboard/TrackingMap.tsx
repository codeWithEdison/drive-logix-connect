import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Navigation,
  Truck,
  Clock,
  Phone,
  MessageCircle
} from "lucide-react";

// Mock tracking data
const mockTrackingData = {
  cargoId: "#3565432",
  driver: {
    name: "Albert Flores",
    phone: "+1 (555) 123-4567",
    rating: 4.8
  },
  currentLocation: "Highway 45, 15 km from destination",
  estimatedArrival: "2:30 PM",
  status: "In Transit",
  route: {
    pickup: "4140 Parker Rd, Allentown, New Mexico 31134",
    destination: "3517 W. Gray St. Utica, Pennsylvania 57867",
    progress: 68
  }
};

// Kigali coordinates
const KIGALI_COORDS = {
  lat: -1.9441,
  lng: 30.0619
};

// Mock vehicle locations around Kigali
const mockVehicles = [
  {
    id: "#3565432",
    position: { lat: -1.9441, lng: 30.0619 },
    status: "In Transit",
    driver: "Albert Flores"
  },
  {
    id: "#4832920",
    position: { lat: -1.9500, lng: 30.0700 },
    status: "Delivered",
    driver: "Guy Hawkins"
  },
  {
    id: "#1442654",
    position: { lat: -1.9400, lng: 30.0500 },
    status: "Pending",
    driver: "Kathryn Murphy"
  }
];

declare global {
  interface Window {
    google: any;
  }
}

export function TrackingMap() {
  const [selectedCargo, setSelectedCargo] = useState(mockTrackingData.cargoId);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Google Maps API
    const loadGoogleMaps = () => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=geometry,places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (mapRef.current && window.google) {
        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: KIGALI_COORDS,
          zoom: 12,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        });

        setMap(mapInstance);

        // Add markers for vehicles
        const newMarkers = mockVehicles.map((vehicle) => {
          const marker = new window.google.maps.Marker({
            position: vehicle.position,
            map: mapInstance,
            title: vehicle.id,
            icon: {
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="${vehicle.status === 'In Transit' ? '#3B82F6' : vehicle.status === 'Delivered' ? '#10B981' : '#F59E0B'}"/>
                  <path d="M8 12L11 15L16 9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              `)}`,
              scaledSize: new window.google.maps.Size(24, 24),
              anchor: new window.google.maps.Point(12, 12)
            }
          });

          // Add info window
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div class="p-3">
                <h3 class="font-semibold text-sm">${vehicle.id}</h3>
                <p class="text-xs text-gray-600">${vehicle.driver}</p>
                <p class="text-xs text-gray-600">${vehicle.status}</p>
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(mapInstance, marker);
          });

          return marker;
        });

        setMarkers(newMarkers);
      }
    };

    if (!window.google) {
      loadGoogleMaps();
    } else {
      initializeMap();
    }

    return () => {
      // Cleanup markers
      markers.forEach(marker => marker.setMap(null));
    };
  }, []);

  return (
    <div className="h-96 bg-muted rounded-lg relative overflow-hidden">
      {/* Google Maps Container */}
      <div ref={mapRef} className="w-full h-full rounded-lg" />

      {/* Tracking Info Overlay */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <Truck className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">{mockTrackingData.cargoId}</p>
            <p className="text-xs text-gray-600">{mockTrackingData.currentLocation}</p>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {mockTrackingData.status}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Est. Arrival</span>
            <span className="font-semibold text-blue-600">{mockTrackingData.estimatedArrival}</span>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="font-semibold">{mockTrackingData.route.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${mockTrackingData.route.progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Driver Info Card */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <Navigation className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-sm">{mockTrackingData.driver.name}</p>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-600">Rating:</span>
              <span className="text-xs font-semibold text-yellow-600">
                ★ {mockTrackingData.driver.rating}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1">
            <Phone className="h-3 w-3 mr-1" />
            Call
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <MessageCircle className="h-3 w-3 mr-1" />
            Chat
          </Button>
        </div>
      </div>

      {/* Map Controls */}
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
    </div>
  );
}