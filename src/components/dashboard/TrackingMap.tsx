import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin,
  Navigation,
  Truck,
  Clock,
  Phone,
  MessageCircle,
  Search,
  Filter,
  Plus,
  Edit,
  Copy,
  Trash2,
  X,
  Route,
} from "lucide-react";
import {
  Cargo,
  CargoStatus,
  CargoPriority,
  CargoTracking,
  GPSTracking,
} from "@/types/shared";
import { useAuth } from "@/contexts/AuthContext";

// Type for cargo with tracking data
type CargoWithTracking = Cargo & {
  tracking?: CargoTracking;
  client?: {
    id: string;
    full_name: string;
    phone?: string;
    email?: string;
  };
};

// Mock tracking data with enhanced structure - only in-transit cargo
const mockCargoList: CargoWithTracking[] = [
  {
    id: "41239110",
    client_id: "client-1",
    weight_kg: 150,
    pickup_address: "456 Oak Avenue, Houston, Texas, USA",
    destination_address: "789 Pine Street, Chicago, Illinois, USA",
    status: CargoStatus.IN_TRANSIT,
    priority: CargoPriority.NORMAL,
    insurance_required: false,
    fragile: false,
    temperature_controlled: false,
    pickup_date: "2024-08-15",
    delivery_date: "2024-08-21",
    distance_km: 1200,
    estimated_cost: 450,
    created_at: "2024-08-14T10:00:00Z",
    updated_at: "2024-08-18T13:40:00Z",
    tracking: {
      cargo_id: "41239110",
      current_status: CargoStatus.IN_TRANSIT,
      location_history: [
        {
          id: "gps-1",
          latitude: 29.7604,
          longitude: -95.3698,
          recorded_at: "2024-08-15T10:00:00Z",
        },
        {
          id: "gps-2",
          latitude: 34.7465,
          longitude: -92.2896,
          recorded_at: "2024-08-18T13:40:00Z",
        },
      ],
      status_updates: [],
      estimated_delivery_time: "2024-08-21T20:00:00Z",
      last_updated: "2024-08-18T13:40:00Z",
      driver: {
        id: "driver-1",
        full_name: "David Martinez",
        phone: "+1 (555) 123-4567",
        rating: 4.8,
      },
    },
    client: {
      id: "client-1",
      full_name: "Sarah Johnson",
      phone: "+1 (555) 111-2222",
      email: "sarah.johnson@email.com",
    },
  },
  {
    id: "3568129",
    client_id: "client-2",
    weight_kg: 200,
    pickup_address: "123 Main Street, Dallas, TX 75201",
    destination_address: "163 Pine St, Chicago, IL 60601",
    status: CargoStatus.IN_TRANSIT,
    priority: CargoPriority.HIGH,
    insurance_required: true,
    fragile: true,
    temperature_controlled: false,
    pickup_date: "2024-08-15",
    delivery_date: "2024-08-21",
    distance_km: 925,
    estimated_cost: 380,
    created_at: "2024-08-14T08:00:00Z",
    updated_at: "2024-08-18T13:40:00Z",
    tracking: {
      cargo_id: "3568129",
      current_status: CargoStatus.IN_TRANSIT,
      location_history: [
        {
          id: "gps-3",
          latitude: 32.7767,
          longitude: -96.797,
          recorded_at: "2024-08-15T22:00:00Z",
        },
        {
          id: "gps-4",
          latitude: 34.7465,
          longitude: -92.2896,
          recorded_at: "2024-08-18T13:40:00Z",
        },
      ],
      status_updates: [],
      estimated_delivery_time: "2024-08-21T20:00:00Z",
      last_updated: "2024-08-18T13:40:00Z",
      driver: {
        id: "driver-2",
        full_name: "Jessica Turner",
        phone: "+1 (555) 987-6543",
        rating: 4.9,
      },
    },
    client: {
      id: "client-2",
      full_name: "Robert Wilson",
      phone: "+1 (555) 333-4444",
      email: "robert.wilson@email.com",
    },
  },
  {
    id: "1248075",
    client_id: "client-3",
    weight_kg: 75,
    pickup_address: "789 Elm Street, Austin, TX 78701",
    destination_address: "456 Maple Ave, Denver, CO 80202",
    status: CargoStatus.IN_TRANSIT,
    priority: CargoPriority.NORMAL,
    insurance_required: false,
    fragile: false,
    temperature_controlled: true,
    pickup_date: "2024-08-22",
    delivery_date: "2024-08-25",
    distance_km: 950,
    estimated_cost: 320,
    created_at: "2024-08-20T14:00:00Z",
    updated_at: "2024-08-22T08:00:00Z",
    tracking: {
      cargo_id: "1248075",
      current_status: CargoStatus.IN_TRANSIT,
      location_history: [
        {
          id: "gps-6",
          latitude: 30.2672,
          longitude: -97.7431,
          recorded_at: "2024-08-22T08:00:00Z",
        },
      ],
      status_updates: [],
      estimated_delivery_time: "2024-08-25T16:00:00Z",
      last_updated: "2024-08-22T08:00:00Z",
      driver: {
        id: "driver-3",
        full_name: "Michael Johnson",
        phone: "+1 (555) 456-7890",
        rating: 4.7,
      },
    },
    client: {
      id: "client-3",
      full_name: "Emily Davis",
      phone: "+1 (555) 555-6666",
      email: "emily.davis@email.com",
    },
  },
];

// Status colors mapping
const statusColors = {
  [CargoStatus.PENDING]: "bg-yellow-100 text-yellow-800",
  [CargoStatus.QUOTED]: "bg-blue-100 text-blue-800",
  [CargoStatus.ACCEPTED]: "bg-blue-100 text-blue-800",
  [CargoStatus.ASSIGNED]: "bg-blue-100 text-blue-800",
  [CargoStatus.PICKED_UP]: "bg-blue-100 text-blue-800",
  [CargoStatus.IN_TRANSIT]: "bg-blue-100 text-blue-800",
  [CargoStatus.DELIVERED]: "bg-green-100 text-green-800",
  [CargoStatus.CANCELLED]: "bg-red-100 text-red-800",
  [CargoStatus.DISPUTED]: "bg-red-100 text-red-800",
};

// Kigali coordinates
const KIGALI_COORDS = {
  lat: -1.9441,
  lng: 30.0619,
};

declare global {
  interface Window {
    google: any;
  }
}

export function TrackingMap() {
  const { user } = useAuth();
  const [selectedCargo, setSelectedCargo] = useState<CargoWithTracking | null>(
    mockCargoList[0]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "in_transit" | "all_in_transit"
  >("in_transit");
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [routePolyline, setRoutePolyline] = useState<any>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Determine user role for dynamic card display
  const isDriver = user?.role === "driver";
  const isClient = user?.role === "client";

  // Filter cargo list based on search - only in-transit cargo
  const filteredCargoList = mockCargoList.filter((cargo) => {
    // Only show in-transit cargo
    if (cargo.status !== CargoStatus.IN_TRANSIT) return false;

    const matchesSearch =
      cargo.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cargo.pickup_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cargo.destination_address
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Get count for in-transit cargo
  const inTransitCount = mockCargoList.filter(
    (c) => c.status === CargoStatus.IN_TRANSIT
  ).length;

  const updateMapForSelectedCargo = useCallback(
    (mapInstance: any, cargo: CargoWithTracking | null) => {
      if (!mapInstance || !cargo) return;

      // Clear existing markers and polyline
      markers.forEach((marker) => marker.setMap(null));
      if (routePolyline) {
        routePolyline.setMap(null);
      }

      const newMarkers: any[] = [];

      // Add pickup location marker
      if (cargo.pickup_address) {
        const pickupMarker = new window.google.maps.Marker({
          position: { lat: 29.7604, lng: -95.3698 }, // Mock coordinates
          map: mapInstance,
          title: "Pickup Location",
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.3639 3.63604C20.0518 5.32387 21 7.61305 21 10Z" fill="#EF4444"/>
              <circle cx="12" cy="10" r="3" fill="white"/>
            </svg>
          `)}`,
            scaledSize: new window.google.maps.Size(20, 20),
            anchor: new window.google.maps.Point(10, 20),
          },
        });

        // Add pickup info window
        const pickupInfoWindow = new window.google.maps.InfoWindow({
          content: `
          <div class="p-2">
            <h3 class="font-semibold text-sm">Pickup Location</h3>
            <p class="text-xs text-gray-600">${cargo.pickup_address}</p>
          </div>
        `,
        });

        pickupMarker.addListener("click", () => {
          pickupInfoWindow.open(mapInstance, pickupMarker);
        });

        newMarkers.push(pickupMarker);
      }

      // Add destination marker
      if (cargo.destination_address) {
        const destMarker = new window.google.maps.Marker({
          position: { lat: 41.8781, lng: -87.6298 }, // Mock coordinates
          map: mapInstance,
          title: "Destination",
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.3639 3.63604C20.0518 5.32387 21 7.61305 21 10Z" fill="#10B981"/>
              <circle cx="12" cy="10" r="3" fill="white"/>
            </svg>
          `)}`,
            scaledSize: new window.google.maps.Size(20, 20),
            anchor: new window.google.maps.Point(10, 20),
          },
        });

        // Add destination info window
        const destInfoWindow = new window.google.maps.InfoWindow({
          content: `
          <div class="p-2">
            <h3 class="font-semibold text-sm">Destination</h3>
            <p class="text-xs text-gray-600">${cargo.destination_address}</p>
          </div>
        `,
        });

        destMarker.addListener("click", () => {
          destInfoWindow.open(mapInstance, destMarker);
        });

        newMarkers.push(destMarker);
      }

      // Add current location marker if in transit
      if (
        cargo?.tracking?.location_history &&
        cargo.tracking.location_history.length > 0
      ) {
        const currentLocation =
          cargo.tracking.location_history[
            cargo.tracking.location_history.length - 1
          ];

        const currentMarker = new window.google.maps.Marker({
          position: {
            lat: currentLocation.latitude,
            lng: currentLocation.longitude,
          },
          map: mapInstance,
          title: "Current Location",
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" fill="#3B82F6"/>
              <path d="M12 16L15 19L20 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          `)}`,
            scaledSize: new window.google.maps.Size(32, 32),
            anchor: new window.google.maps.Point(16, 16),
          },
        });

        // Add current location info window
        const currentInfoWindow = new window.google.maps.InfoWindow({
          content: `
          <div class="p-2">
            <h3 class="font-semibold text-sm">Current Location</h3>
            <p class="text-xs text-gray-600">${
              cargo.tracking?.driver?.full_name
            }</p>
            <p class="text-xs text-gray-600">Last updated: ${new Date(
              currentLocation.recorded_at
            ).toLocaleString()}</p>
          </div>
        `,
        });

        currentMarker.addListener("click", () => {
          currentInfoWindow.open(mapInstance, currentMarker);
        });

        newMarkers.push(currentMarker);
      }

      // Draw route polyline
      if (
        cargo?.tracking?.location_history &&
        cargo.tracking.location_history.length > 1
      ) {
        const routePath = cargo.tracking.location_history.map((location) => ({
          lat: location.latitude,
          lng: location.longitude,
        }));

        const polyline = new window.google.maps.Polyline({
          path: routePath,
          geodesic: true,
          strokeColor: "#3B82F6",
          strokeOpacity: 1.0,
          strokeWeight: 3,
        });

        polyline.setMap(mapInstance);
        setRoutePolyline(polyline);
      }

      setMarkers(newMarkers);

      // Fit map to show all markers
      if (newMarkers.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        newMarkers.forEach((marker) => bounds.extend(marker.getPosition()));
        mapInstance.fitBounds(bounds);
      }
    },
    [markers, routePolyline]
  );

  useEffect(() => {
    // Load Google Maps API
    const loadGoogleMaps = () => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${
        import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      }&libraries=geometry,places`;
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
              stylers: [{ visibility: "off" }],
            },
          ],
        });

        setMap(mapInstance);
        updateMapForSelectedCargo(mapInstance, selectedCargo);
      }
    };

    if (!window.google) {
      loadGoogleMaps();
    } else {
      initializeMap();
    }

    return () => {
      // Cleanup markers and polyline
      markers.forEach((marker) => marker.setMap(null));
      if (routePolyline) {
        routePolyline.setMap(null);
      }
    };
  }, [selectedCargo, updateMapForSelectedCargo, markers, routePolyline]);

  const handleCargoSelect = (cargo: CargoWithTracking) => {
    setSelectedCargo(cargo);
    if (map) {
      updateMapForSelectedCargo(map, cargo);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left Panel - Cargo List (30% width) */}
      <div className="w-[30%] bg-white border-r border-gray-200 flex flex-col min-w-0">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Tracking Cargo ({inTransitCount})
          </h2>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Cargo List - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2 space-y-2">
            {filteredCargoList.map((cargo) => (
              <Card
                key={cargo.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedCargo?.id === cargo.id
                    ? "ring-2 ring-blue-500 bg-blue-50"
                    : ""
                }`}
                onClick={() => handleCargoSelect(cargo)}
              >
                <CardContent className="p-4">
                  {/* Load ID and Status */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-sm">#{cargo.id}</h3>
                    <Badge className={statusColors[cargo.status]}>
                      {cargo.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>

                  {/* Interactive Route Visualization */}
                  <div className="flex items-center mb-3">
                    <div className="flex-1 flex items-center">
                      {/* Pickup point */}
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>

                      {/* Progress line container */}
                      <div className="flex-1 relative">
                        {/* Background line */}
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 transform -translate-y-1/2"></div>

                        {/* Calculate progress percentage */}
                        {(() => {
                          const progress = cargo.tracking?.location_history
                            ?.length
                            ? Math.min(
                                (cargo.tracking.location_history.length / 3) *
                                  100,
                                100
                              )
                            : 0;
                          const progressPercent = Math.max(progress, 10); // Minimum 10% to show some progress

                          return (
                            <>
                              {/* Completed progress - solid blue line */}
                              <div
                                className="absolute top-1/2 left-0 h-0.5 bg-blue-500 transform -translate-y-1/2"
                                style={{ width: `${progressPercent}%` }}
                              ></div>

                              {/* Remaining progress - dashed gray line */}
                              <div
                                className="absolute top-1/2 h-0.5 bg-gray-400 transform -translate-y-1/2"
                                style={{
                                  left: `${progressPercent}%`,
                                  width: `${100 - progressPercent}%`,
                                  backgroundImage:
                                    "repeating-linear-gradient(to right, #9CA3AF 0, #9CA3AF 4px, transparent 4px, transparent 8px)",
                                }}
                              ></div>

                              {/* Truck icon positioned at progress point */}
                              <div
                                className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2"
                                style={{ left: `${progressPercent}%` }}
                              >
                                <Truck className="h-4 w-4 text-blue-600 bg-white rounded-full p-0.5" />
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      {/* Destination point */}
                      <div className="w-2 h-2 bg-green-500 rounded-full ml-2"></div>
                    </div>
                  </div>

                  {/* Addresses */}
                  <div className="space-y-2 mb-3">
                    <div className="text-xs text-gray-600">
                      <p className="font-medium truncate">
                        {cargo.pickup_address}
                      </p>
                    </div>
                    <div className="text-xs text-gray-600">
                      <p className="font-medium truncate">
                        {cargo.destination_address}
                      </p>
                    </div>
                  </div>

                  {/* ETA Information */}
                  {cargo.tracking?.estimated_delivery_time && (
                    <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mb-3">
                      <Clock className="h-3 w-3" />
                      <span className="font-medium">
                        ETA:{" "}
                        {new Date(
                          cargo.tracking.estimated_delivery_time
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {/* Dynamic Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          {isDriver
                            ? cargo.client?.full_name?.charAt(0) || "C"
                            : cargo.tracking?.driver?.full_name?.charAt(0) ||
                              "D"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">
                          {isDriver
                            ? cargo.client?.full_name || "Client"
                            : cargo.tracking?.driver?.full_name || "Driver"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {isDriver ? "Client" : "Driver"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {isDriver
                            ? cargo.client?.phone || "+250799240909"
                            : cargo.tracking?.driver?.phone || "+250799240909"}
                        </p>
                      </div>
                    </div>

                    {/* Call Buttons */}
                    <div className="flex gap-2">
                      {isClient && cargo.tracking?.driver?.phone && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(
                              `tel:${cargo.tracking.driver.phone}`,
                              "_self"
                            );
                          }}
                          className="flex items-center gap-1 text-xs bg-green-600 hover:bg-green-700 flex-1"
                        >
                          <Phone className="h-3 w-3" />
                          Call Driver
                        </Button>
                      )}

                      {isDriver && (
                        <>
                          {cargo.pickup_phone && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(
                                  `tel:${cargo.pickup_phone}`,
                                  "_self"
                                );
                              }}
                              className="flex items-center gap-1 text-xs flex-1"
                            >
                              <Phone className="h-3 w-3" />
                              Pickup
                            </Button>
                          )}
                          {cargo.destination_phone && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(
                                  `tel:${cargo.destination_phone}`,
                                  "_self"
                                );
                              }}
                              className="flex items-center gap-1 text-xs flex-1"
                            >
                              <Phone className="h-3 w-3" />
                              Delivery
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Map and Details (70% width) */}
      <div className="w-[70%] bg-gray-100 flex flex-col min-w-0 overflow-hidden">
        {selectedCargo ? (
          <>
            {/* Header with Cargo Details */}
            <div className="p-4 bg-white border-b border-gray-200">
              {/* Detail Tabs */}
              <div className="flex gap-4 mt-3">
                <Button variant="ghost" size="sm">
                  Cargo info
                </Button>
                <Button variant="default" size="sm">
                  Tracking
                </Button>
                <Button variant="ghost" size="sm">
                  Docs
                </Button>
              </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 relative min-h-0">
              <div ref={mapRef} className="w-full h-full" />

              {/* Map Controls */}
              <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2">
                <div className="flex flex-col gap-1">
                  <Button size="sm" variant="default" className="w-8 h-8 p-0">
                    Map
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-8 h-8 p-0 text-xs"
                  >
                    Satellite
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-8 h-8 p-0 text-xs"
                  >
                    Layers
                  </Button>
                </div>
              </div>

              {/* Zoom Controls */}
              <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-2">
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

            {/* Tracking Timeline */}
            <div className="p-4 bg-white border-t border-gray-200 max-h-48 overflow-y-auto">
              <h4 className="font-semibold mb-3">Tracking Timeline</h4>
              <div className="space-y-4">
                {selectedCargo.tracking?.location_history?.map(
                  (location, index) => (
                    <div key={location.id} className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-blue-600 rounded-full mt-1"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-sm">
                            {index === 0
                              ? "Pick up"
                              : index ===
                                (selectedCargo.tracking?.location_history
                                  ?.length || 0) -
                                  1
                              ? "Delivered"
                              : "In sorting centre"}
                          </h5>
                          <span className="text-xs text-gray-500">
                            {formatDate(location.recorded_at)} at{" "}
                            {formatTime(location.recorded_at)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {index === 0
                            ? selectedCargo.pickup_address
                            : index ===
                              (selectedCargo.tracking?.location_history
                                ?.length || 0) -
                                1
                            ? selectedCargo.destination_address
                            : "789 Central Ave, Little Rock, AR 77201"}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                Select a cargo to view tracking details
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Only in-transit cargo is shown here
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
