import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Truck,
  MapPin,
  Clock,
  User,
  Phone,
  Mail,
  Navigation,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Package,
  Route,
  Search,
  MessageCircle,
  Copy,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useInTransitCargo,
  useLiveCargoTracking,
  useLiveCargoTrackingByNumber,
  useLiveRouteProgress,
  useOptimisticTrackingUpdate,
} from "@/lib/api/hooks/trackingHooks";
import { MapService } from "@/lib/api/services/mapService";
import { trackingWebSocket } from "@/lib/api/services/websocketService";
import {
  CargoStatus,
  CargoPriority,
  UserRole,
  Cargo,
  CargoTracking,
} from "@/types/shared";

// Extend Cargo type to include client data
interface CargoWithClient extends Cargo {
  client?: {
    id: string;
    full_name: string;
    phone?: string;
    email?: string;
    company_name?: string;
    business_type?: string;
    tax_id?: string;
    address?: string;
    city?: string;
    country?: string;
    postal_code?: string;
    contact_person?: string;
    credit_limit?: string;
    payment_terms?: number;
    user?: {
      id: string;
      full_name: string;
      email: string;
      phone: string;
    };
  };
}
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { LiveTrackingErrorBoundary } from "./LiveTrackingErrorBoundary";
import {
  LiveTrackingMapFallback,
  ConnectionStatus,
} from "./LiveTrackingMapFallback";

// Use the actual Cargo type with tracking data
type CargoWithTracking = CargoWithClient & {
  tracking?: CargoTracking;
};

export const LiveTrackingMap: React.FC = () => {
  const { user } = useAuth();
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedCargo, setSelectedCargo] = useState<CargoWithTracking | null>(
    null
  );
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [connectionRetryCount, setConnectionRetryCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<
    "order" | "driver" | "vehicle" | "customer" | "documents"
  >("driver");

  const isDriver = user?.role === UserRole.DRIVER;
  const isClient = user?.role === UserRole.CLIENT;

  console.log("🔍 LiveTrackingMap user info:", {
    userRole: user?.role,
    isDriver,
    isClient,
    userId: user?.id,
  });

  // Fetch in-transit cargo with live updates (using role-specific endpoints)
  const {
    data: cargoData,
    isLoading: cargoLoading,
    error: cargoError,
    refetch: refetchCargo,
  } = useInTransitCargo(
    {
      page: 1,
      limit: 50,
      ...(isDriver && { driver_id: user?.id }),
      userRole: user?.role as "client" | "driver" | "admin",
    },
    { refetchInterval: 60000 } // Refresh every minute
  );

  // Fetch detailed tracking for selected cargo (using dashboard endpoint for enhanced data)
  const {
    data: trackingData,
    isLoading: trackingLoading,
    refetch: refetchTracking,
  } = useLiveCargoTrackingByNumber(
    selectedCargo?.cargo_number || selectedCargo?.id || "",
    {
      refetchInterval: 30000, // 30 seconds for live tracking
      enabled: !!(selectedCargo?.cargo_number || selectedCargo?.id),
      useDashboard: true, // Use dashboard endpoint for enhanced data
    }
  );

  // Fetch route progress
  const { data: progressData, refetch: refetchProgress } = useLiveRouteProgress(
    selectedCargo?.cargo_number || selectedCargo?.id || "",
    {
      refetchInterval: 30000,
    }
  );

  const updateTrackingMutation = useOptimisticTrackingUpdate();

  // Initialize Google Maps with error handling
  const initializeMap = useCallback(async () => {
    if (!mapRef.current || mapLoaded) return;

    try {
      setMapError(null);

      // Wait for Google Maps to load
      if (!window.google?.maps) {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          throw new Error(
            "Google Maps API key not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your environment variables."
          );
        }

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
        script.async = true;
        script.onload = () => initializeMap();
        script.onerror = () => {
          setMapError(
            new Error(
              "Failed to load Google Maps API. Please check your internet connection and API key."
            )
          );
        };
        document.head.appendChild(script);
        return;
      }

      await MapService.initializeMap(mapRef.current, {
        center: { lat: -1.9441, lng: 30.0619 }, // Kigali
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      });

      setMapLoaded(true);
      setMapError(null);
    } catch (error) {
      console.error("Failed to initialize map:", error);
      setMapError(
        error instanceof Error ? error : new Error("Failed to initialize map")
      );
    }
  }, [mapLoaded]);

  // WebSocket connection management with retry logic
  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        setIsConnecting(true);
        await trackingWebSocket.connect();
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionRetryCount(0);
      } catch (error) {
        console.error("WebSocket connection failed:", error);
        setIsConnected(false);
        setIsConnecting(false);
        setConnectionRetryCount((prev) => prev + 1);
      }
    };

    connectWebSocket();

    // Subscribe to connection status changes
    const unsubscribeConnection = trackingWebSocket.onConnectionChange(
      (connected) => {
        setIsConnected(connected);
        setIsConnecting(false);
        if (connected) {
          setConnectionRetryCount(0);
        }
      }
    );

    return () => {
      unsubscribeConnection();
      trackingWebSocket.disconnect();
    };
  }, []);

  // Retry connection function
  const retryConnection = useCallback(async () => {
    setIsConnecting(true);
    try {
      await trackingWebSocket.connect();
    } catch (error) {
      console.error("Retry connection failed:", error);
    }
  }, []);

  // Subscribe to live updates for selected cargo
  useEffect(() => {
    if ((!selectedCargo?.cargo_number && !selectedCargo?.id) || !isConnected)
      return;

    const unsubscribeLocation = trackingWebSocket.onLocationUpdate((data) => {
      const cargoIdentifier = selectedCargo.cargo_number || selectedCargo.id;
      if (data.cargo_id === cargoIdentifier) {
        setLastUpdate(new Date().toISOString());
        refetchTracking();
        refetchProgress();
      }
    });

    const unsubscribeStatus = trackingWebSocket.onStatusUpdate((data) => {
      const cargoIdentifier = selectedCargo.cargo_number || selectedCargo.id;
      if (data.cargo_id === cargoIdentifier) {
        setLastUpdate(new Date().toISOString());
        refetchTracking();
      }
    });

    // Subscribe to cargo tracking
    const cargoIdentifier = selectedCargo.cargo_number || selectedCargo.id;
    trackingWebSocket.subscribeToCargoTracking(cargoIdentifier);

    return () => {
      unsubscribeLocation();
      unsubscribeStatus();
      trackingWebSocket.unsubscribeFromCargoTracking(cargoIdentifier);
    };
  }, [
    selectedCargo?.cargo_number,
    selectedCargo?.id,
    isConnected,
    refetchTracking,
    refetchProgress,
  ]);

  // Initialize map when component mounts
  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  // Update map when cargo is selected
  const updateMapForSelectedCargo = useCallback(
    (cargo: CargoWithTracking) => {
      if (!mapLoaded || !cargo.tracking) return;

      MapService.clearMarkers();
      MapService.clearPolylines();

      const tracking = cargo.tracking;
      const locationHistory = tracking.location_history || [];

      // Add pickup marker
      if (locationHistory.length > 0) {
        const pickupPoint = locationHistory[0];
        MapService.addMarker({
          id: "pickup",
          position: { lat: pickupPoint.latitude, lng: pickupPoint.longitude },
          title: "Pickup Location",
          icon: MapService.createMarkerIcon("#EF4444", "pickup"),
        });
      }

      // Add destination marker (last point or current location)
      const destinationPoint = locationHistory[locationHistory.length - 1];
      if (destinationPoint) {
        MapService.addMarker({
          id: "destination",
          position: {
            lat: destinationPoint.latitude,
            lng: destinationPoint.longitude,
          },
          title: "Destination",
          icon: MapService.createMarkerIcon("#10B981", "delivery"),
        });
      }

      // Add current location marker if available
      if (locationHistory.length > 1) {
        const currentPoint = locationHistory[locationHistory.length - 1];
        MapService.addMarker({
          id: "current",
          position: { lat: currentPoint.latitude, lng: currentPoint.longitude },
          title: "Current Location",
          icon: MapService.createMarkerIcon("#3B82F6", "current"),
        });

        // Draw route
        MapService.drawRouteFromTracking("route", locationHistory, {
          strokeColor: "#3B82F6",
          strokeOpacity: 0.8,
          strokeWeight: 4,
        });
      }

      // Fit map to show all markers
      MapService.fitMapToMarkers(["pickup", "destination", "current"], 50);
    },
    [mapLoaded]
  );

  // Update map when tracking data changes
  useEffect(() => {
    if (selectedCargo && trackingData) {
      // trackingData is the full cargo with tracking data
      updateMapForSelectedCargo(trackingData as CargoWithTracking);
    }
  }, [selectedCargo, trackingData, updateMapForSelectedCargo]);

  const handleCargoSelect = (cargo: CargoWithTracking) => {
    setSelectedCargo(cargo);
  };

  // Enhanced cargo selection that can handle both ID and cargo number
  const handleCargoSelectByIdOrNumber = (identifier: string) => {
    // First try to find in current cargo list
    const existingCargo = filteredCargoList.find(
      (cargo) => cargo.id === identifier || cargo.cargo_number === identifier
    );

    if (existingCargo) {
      setSelectedCargo(existingCargo);
      return;
    }

    // If not found in current list, we could implement a search function here
    // For now, we'll just log that the cargo wasn't found
    console.warn(
      `Cargo with identifier ${identifier} not found in current list`
    );
  };

  const getStatusColor = (status: CargoStatus) => {
    switch (status) {
      case CargoStatus.IN_TRANSIT:
        return "bg-blue-100 text-blue-800";
      case CargoStatus.DELIVERED:
        return "bg-green-100 text-green-800";
      case CargoStatus.PENDING:
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: CargoPriority) => {
    switch (priority) {
      case CargoPriority.HIGH:
        return "bg-red-100 text-red-800";
      case CargoPriority.NORMAL:
        return "bg-orange-100 text-orange-800";
      case CargoPriority.LOW:
        return "bg-green-100 text-green-800";
      case CargoPriority.URGENT:
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  // Filter cargo list based on search term
  const filteredCargoList = (cargoData || []).filter(
    (cargo: CargoWithTracking) => {
      if (!searchTerm) return true;

      const searchLower = searchTerm.toLowerCase();
      return (
        cargo.id.toLowerCase().includes(searchLower) ||
        cargo.cargo_number?.toLowerCase().includes(searchLower) ||
        cargo.type?.toLowerCase().includes(searchLower) ||
        cargo.pickup_address?.toLowerCase().includes(searchLower) ||
        cargo.destination_address?.toLowerCase().includes(searchLower) ||
        cargo.client?.full_name?.toLowerCase().includes(searchLower)
      );
    }
  );

  // Auto-select first cargo when list loads and no cargo is selected
  useEffect(() => {
    if (filteredCargoList.length > 0 && !selectedCargo && !cargoLoading) {
      console.log("🚀 Auto-selecting first cargo:", filteredCargoList[0]);
      setSelectedCargo(filteredCargoList[0]);
    }
  }, [filteredCargoList, selectedCargo, cargoLoading]);

  console.log("🔍 LiveTrackingMap cargoData:", {
    cargoData,
    cargoDataLength: cargoData?.length,
    filteredCargoListLength: filteredCargoList.length,
    isLoading: cargoLoading,
    error: cargoError,
    userRole: user?.role,
    isDriver,
    isClient,
  });

  return (
    <LiveTrackingErrorBoundary>
      <div className="h-full flex flex-col lg:flex-row gap-2 sm:gap-4 overflow-hidden">
        {/* Left Panel - Cargo List */}
        <div className="w-full lg:w-[30%] flex flex-col min-w-0 h-[40vh] lg:h-full">
          <Card className="flex-1 flex flex-col min-h-0">
            <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg font-semibold">
                  Tracking Cargo
                </CardTitle>
                <div className="flex items-center gap-1 sm:gap-2">
                  <ConnectionStatus
                    isConnected={isConnected}
                    isConnecting={isConnecting}
                    lastUpdate={lastUpdate}
                    onRetry={retryConnection}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => refetchCargo()}
                    disabled={cargoLoading}
                    className="h-8 w-8 sm:h-9 sm:w-9"
                  >
                    <RefreshCw
                      className={cn(
                        "h-3 w-3 sm:h-4 sm:w-4",
                        cargoLoading && "animate-spin"
                      )}
                    />
                  </Button>
                </div>
              </div>

              {/* Search Input */}
              <div className="mt-2 sm:mt-3">
                <div className="relative">
                  <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                  <Input
                    placeholder="Search cargo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-7 sm:pl-10 h-8 sm:h-10 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
                {filteredCargoList.length} of {(cargoData || []).length}{" "}
                in-transit deliveries
              </p>
            </CardHeader>

            <CardContent className="p-0 flex-1 min-h-0">
              <ScrollArea className="h-full">
                {cargoLoading ? (
                  <div className="flex items-center justify-center p-4 sm:p-8">
                    <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
                  </div>
                ) : cargoError ? (
                  <LiveTrackingMapFallback
                    type="data"
                    error={cargoError}
                    onRetry={() => refetchCargo()}
                    isConnecting={cargoLoading}
                  />
                ) : filteredCargoList.length === 0 ? (
                  <div className="flex items-center justify-center p-4 sm:p-8 text-gray-500">
                    <div className="text-center">
                      <Package className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-4 text-gray-400" />
                      <p className="text-sm sm:text-lg font-medium mb-1 sm:mb-2">
                        {searchTerm
                          ? "No matching cargo found"
                          : "No in-transit cargo"}
                      </p>
                      <p className="text-xs sm:text-sm">
                        {searchTerm
                          ? "Try adjusting your search terms"
                          : "Cargo will appear here when shipments are in transit"}
                      </p>
                      {!searchTerm && (
                        <div className="mt-2 sm:mt-4 text-xs text-gray-400">
                          <p>Debug info:</p>
                          <p>User role: {user?.role}</p>
                          <p>Total cargo: {(cargoData || []).length}</p>
                          <p>Filtered cargo: {filteredCargoList.length}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1 sm:space-y-2 p-1 sm:p-2">
                    {filteredCargoList.map((cargo: CargoWithTracking) => (
                      <Card
                        key={cargo.id}
                        className={cn(
                          "cursor-pointer transition-all hover:shadow-md",
                          selectedCargo?.id === cargo.id &&
                            "ring-2 ring-blue-500"
                        )}
                        onClick={() => handleCargoSelect(cargo)}
                      >
                        <CardContent className="p-2 sm:p-4">
                          {/* Header with cargo ID and status */}
                          <div className="flex items-center justify-between mb-2 sm:mb-3">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Package className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                              <h3 className="font-bold text-xs sm:text-sm">
                                #{cargo.cargo_number || cargo.id}
                              </h3>
                            </div>
                            <Badge
                              className={cn(
                                "text-white text-xs",
                                cargo.status === "in_transit"
                                  ? "bg-purple-600"
                                  : cargo.status === "delivered"
                                  ? "bg-green-600"
                                  : "bg-orange-600"
                              )}
                            >
                              {cargo.status === "in_transit"
                                ? "Transit"
                                : cargo.status === "delivered"
                                ? "Delivered"
                                : cargo.status.replace("_", " ")}
                            </Badge>
                          </div>

                          {/* Progress indicator with route visualization */}
                          <div className="flex items-center mb-2 sm:mb-3">
                            <div className="flex-1 flex items-center">
                              {/* Pickup point */}
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mr-1 sm:mr-2"></div>

                              {/* Progress line container */}
                              <div className="flex-1 relative">
                                {/* Background line */}
                                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 transform -translate-y-1/2"></div>

                                {/* Calculate progress percentage */}
                                {(() => {
                                  const progress =
                                    cargo.tracking?.progress_percentage ||
                                    (cargo.tracking?.location_history?.length
                                      ? Math.min(
                                          (cargo.tracking.location_history
                                            .length /
                                            3) *
                                            100,
                                          100
                                        )
                                      : 0);
                                  const progressPercent = Math.max(
                                    progress,
                                    10
                                  ); // Minimum 10% to show some progress

                                  return (
                                    <>
                                      {/* Completed progress - solid green line */}
                                      <div
                                        className="absolute top-1/2 left-0 h-0.5 bg-green-500 transform -translate-y-1/2"
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
                                        <Truck className="h-3 w-3 sm:h-4 sm:w-4 text-gray-700 bg-white rounded-full p-0.5" />
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>

                              {/* Destination point */}
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-600 rounded-full ml-1 sm:ml-2"></div>
                            </div>
                          </div>

                          {/* Addresses */}
                          <div className="space-y-1 sm:space-y-2 mb-2 sm:mb-3">
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

                          {/* Contact Information */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-600">
                                  {isDriver
                                    ? (
                                        cargo as CargoWithTracking
                                      ).client?.full_name?.charAt(0) || "C"
                                    : cargo.tracking?.driver?.full_name?.charAt(
                                        0
                                      ) || "D"}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium truncate">
                                  {isDriver
                                    ? (cargo as CargoWithTracking).client
                                        ?.full_name || "Client"
                                    : cargo.tracking?.driver?.full_name ||
                                      "Driver"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {isDriver ? "Customer" : "Driver"}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-0.5 sm:gap-1">
                              {isClient && cargo.tracking?.driver?.phone && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-5 w-5 sm:h-6 sm:w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(
                                      `tel:${cargo.tracking.driver.phone}`,
                                      "_self"
                                    );
                                  }}
                                >
                                  <Phone className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                </Button>
                              )}
                              {isDriver && (
                                <>
                                  {cargo.pickup_phone && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-5 w-5 sm:h-6 sm:w-6 p-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(
                                          `tel:${cargo.pickup_phone}`,
                                          "_self"
                                        );
                                      }}
                                    >
                                      <Phone className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                    </Button>
                                  )}
                                  {cargo.destination_phone && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-5 w-5 sm:h-6 sm:w-6 p-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(
                                          `tel:${cargo.destination_phone}`,
                                          "_self"
                                        );
                                      }}
                                    >
                                      <Phone className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                    </Button>
                                  )}
                                </>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-5 w-5 sm:h-6 sm:w-6 p-0"
                              >
                                <Mail className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Map and Details */}
        <div className="w-full lg:w-[70%] flex flex-col min-w-0 overflow-hidden h-[60vh] lg:h-full">
          <Card className="flex-1 flex flex-col min-h-0">
            <CardContent className="p-0 h-full flex flex-col min-h-0">
              {/* Map Container */}
              <div
                className="flex-1 relative min-h-0"
                style={{ minHeight: "300px" }}
              >
                {mapError ? (
                  <LiveTrackingMapFallback
                    type="map"
                    error={mapError}
                    onRetry={initializeMap}
                    isConnecting={!mapLoaded}
                  />
                ) : (
                  <>
                    <div
                      ref={mapRef}
                      className="w-full h-full rounded-t-lg"
                      style={{ minHeight: "300px" }}
                    />

                    {/* Map overlay info */}
                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 sm:p-3 shadow-lg">
                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                        <Navigation className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                        <span className="font-medium">Live Tracking</span>
                        {lastUpdate && (
                          <span className="text-xs text-gray-500 hidden sm:inline">
                            Updated{" "}
                            {formatDistanceToNow(new Date(lastUpdate), {
                              addSuffix: true,
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Cargo Details */}
              <div className="flex-shrink-0 border-t bg-white">
                {selectedCargo ? (
                  <div className="p-3 sm:p-6">
                    {/* Header with Tabs */}
                    <div className="flex items-center justify-between mb-3 sm:mb-6">
                      <div className="flex space-x-0.5 sm:space-x-1 bg-gray-100 rounded-lg p-0.5 sm:p-1 overflow-x-auto">
                        <Button
                          variant={activeTab === "order" ? "default" : "ghost"}
                          size="sm"
                          className={`text-xs px-2 sm:px-3 py-1 sm:py-2 ${
                            activeTab === "order"
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : ""
                          }`}
                          onClick={() => setActiveTab("order")}
                        >
                          <span className="hidden sm:inline">
                            Order details
                          </span>
                          <span className="sm:hidden">Order</span>
                        </Button>
                        <Button
                          variant={activeTab === "driver" ? "default" : "ghost"}
                          size="sm"
                          className={`text-xs px-2 sm:px-3 py-1 sm:py-2 ${
                            activeTab === "driver"
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : ""
                          }`}
                          onClick={() => setActiveTab("driver")}
                        >
                          <span className="hidden sm:inline">
                            Driver information
                          </span>
                          <span className="sm:hidden">Driver</span>
                        </Button>
                        <Button
                          variant={
                            activeTab === "vehicle" ? "default" : "ghost"
                          }
                          size="sm"
                          className={`text-xs px-2 sm:px-3 py-1 sm:py-2 ${
                            activeTab === "vehicle"
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : ""
                          }`}
                          onClick={() => setActiveTab("vehicle")}
                        >
                          Vehicle
                        </Button>
                        <Button
                          variant={
                            activeTab === "customer" ? "default" : "ghost"
                          }
                          size="sm"
                          className={`text-xs px-2 sm:px-3 py-1 sm:py-2 ${
                            activeTab === "customer"
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : ""
                          }`}
                          onClick={() => setActiveTab("customer")}
                        >
                          <span className="hidden sm:inline">
                            Customer information
                          </span>
                          <span className="sm:hidden">Customer</span>
                        </Button>
                        <Button
                          variant={
                            activeTab === "documents" ? "default" : "ghost"
                          }
                          size="sm"
                          className={`text-xs px-2 sm:px-3 py-1 sm:py-2 ${
                            activeTab === "documents"
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : ""
                          }`}
                          onClick={() => setActiveTab("documents")}
                        >
                          Docs
                        </Button>
                      </div>
                    </div>

                    {/* Dynamic Content Card */}
                    <div className="bg-white rounded-lg border border-gray-200 p-2 sm:p-4">
                      {activeTab === "order" && (
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                            <h3 className="font-semibold text-sm sm:text-base">
                              {selectedCargo.type || "Cargo"}
                            </h3>
                            <Badge
                              className={cn(
                                "text-xs",
                                getStatusColor(selectedCargo.status)
                              )}
                            >
                              {selectedCargo.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                            <div>
                              <span className="text-gray-500">Weight:</span>
                              <span className="ml-2 font-medium">
                                {selectedCargo.weight_kg} kg
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Cost:</span>
                              <span className="ml-2 font-medium">
                                ${selectedCargo.estimated_cost || "N/A"}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Distance:</span>
                              <span className="ml-2 font-medium">
                                {selectedCargo.distance_km
                                  ? `${selectedCargo.distance_km} km`
                                  : "N/A"}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Created:</span>
                              <span className="ml-2 font-medium">
                                {new Date(
                                  selectedCargo.created_at
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === "driver" && (
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                              {selectedCargo.tracking?.driver?.full_name?.charAt(
                                0
                              ) || "D"}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-sm sm:text-base">
                                {selectedCargo.tracking?.driver?.full_name ||
                                  "Driver"}
                              </h3>
                              {selectedCargo.tracking?.driver?.phone && (
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                  <Phone className="h-3 w-3" />
                                  <span className="truncate">
                                    {selectedCargo.tracking.driver.phone}
                                  </span>
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white h-5 sm:h-6 px-2 text-xs"
                                    onClick={() =>
                                      window.open(
                                        `tel:${selectedCargo.tracking.driver.phone}`,
                                        "_self"
                                      )
                                    }
                                  >
                                    Call
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === "vehicle" && (
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                            <h3 className="font-semibold text-sm sm:text-base">
                              {selectedCargo.tracking?.vehicle?.license_plate ||
                                "Vehicle"}
                            </h3>
                          </div>
                          {selectedCargo.tracking?.vehicle?.make && (
                            <div className="text-xs sm:text-sm text-gray-600">
                              {selectedCargo.tracking.vehicle.make}{" "}
                              {selectedCargo.tracking.vehicle.model}
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === "customer" && (
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                              {selectedCargo.client?.full_name?.charAt(0) ||
                                "C"}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-sm sm:text-base">
                                {selectedCargo.client?.full_name || "Customer"}
                              </h3>
                              {selectedCargo.client?.phone && (
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                  <Phone className="h-3 w-3" />
                                  <span className="truncate">
                                    {selectedCargo.client.phone}
                                  </span>
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white h-5 sm:h-6 px-2 text-xs"
                                    onClick={() =>
                                      window.open(
                                        `tel:${selectedCargo.client.phone}`,
                                        "_self"
                                      )
                                    }
                                  >
                                    Call
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === "documents" && (
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                            <h3 className="font-semibold text-sm sm:text-base">
                              Documents
                            </h3>
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500">
                            No documents available
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Progress and ETA */}
                    {(progressData ||
                      selectedCargo.tracking?.progress_percentage) && (
                      <>
                        <Separator className="my-2 sm:my-3" />
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-xs sm:text-sm text-gray-700">
                              Delivery Progress
                            </h4>
                            <span className="text-xs sm:text-sm font-medium text-blue-600">
                              {Math.round(
                                progressData?.progress_percentage ||
                                  selectedCargo.tracking?.progress_percentage ||
                                  0
                              )}
                              %
                            </span>
                          </div>

                          <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                            <div
                              className="bg-blue-600 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${
                                  progressData?.progress_percentage ||
                                  selectedCargo.tracking?.progress_percentage ||
                                  0
                                }%`,
                              }}
                            />
                          </div>

                          {progressData?.estimated_arrival && (
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="truncate">
                                ETA:{" "}
                                {new Date(
                                  progressData.estimated_arrival
                                ).toLocaleString()}
                              </span>
                            </div>
                          )}

                          {progressData?.current_location && (
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                              <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="truncate">
                                Current: {progressData.current_location}
                              </span>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 p-4 sm:p-6">
                    <div className="text-center">
                      <Package className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-4 text-gray-400" />
                      <p className="text-sm sm:text-lg font-medium mb-1 sm:mb-2">
                        Select a cargo to track
                      </p>
                      <p className="text-xs sm:text-sm">
                        Choose from the list to view live tracking details
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </LiveTrackingErrorBoundary>
  );
};
