import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useInTransitCargo,
  useLiveCargoTracking,
  useLiveRouteProgress,
  useOptimisticTrackingUpdate,
} from "@/lib/api/hooks/trackingHooks";
import { MapService } from "@/lib/api/services/mapService";
import { trackingWebSocket } from "@/lib/api/services/websocketService";
import { CargoStatus, CargoPriority, UserRole } from "@/types/shared";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { LiveTrackingErrorBoundary } from "./LiveTrackingErrorBoundary";
import {
  LiveTrackingMapFallback,
  ConnectionStatus,
} from "./LiveTrackingMapFallback";

interface CargoWithTracking {
  id: string;
  type: string;
  description?: string;
  pickup_location: string;
  delivery_location: string;
  status: CargoStatus;
  priority: CargoPriority;
  created_at: string;
  estimated_pickup_time?: string;
  estimated_delivery_time?: string;
  weight_kg: number;
  volume_m3: number;
  tracking?: {
    current_status: CargoStatus;
    location_history: Array<{
      id: string;
      latitude: number;
      longitude: number;
      recorded_at: string;
    }>;
    driver?: {
      full_name: string;
      phone?: string;
      rating: number;
    };
    vehicle?: {
      license_plate: string;
      make?: string;
      model?: string;
    };
    current_location?: string;
    progress_percentage?: number;
  };
  client?: {
    id: string;
    full_name: string;
    phone?: string;
    email?: string;
  };
}

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

  const isDriver = user?.role === UserRole.DRIVER;
  const isClient = user?.role === UserRole.CLIENT;

  // Fetch in-transit cargo with live updates
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
    },
    { refetchInterval: 60000 } // Refresh every minute
  );

  // Fetch detailed tracking for selected cargo
  const {
    data: trackingData,
    isLoading: trackingLoading,
    refetch: refetchTracking,
  } = useLiveCargoTracking(selectedCargo?.id || "", {
    refetchInterval: 30000, // 30 seconds for live tracking
    enabled: !!selectedCargo?.id,
  });

  // Fetch route progress
  const { data: progressData, refetch: refetchProgress } = useLiveRouteProgress(
    selectedCargo?.id || "",
    {
      refetchInterval: 30000,
      enabled: !!selectedCargo?.id,
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
    if (!selectedCargo?.id || !isConnected) return;

    const unsubscribeLocation = trackingWebSocket.onLocationUpdate((data) => {
      if (data.cargo_id === selectedCargo.id) {
        setLastUpdate(new Date().toISOString());
        refetchTracking();
        refetchProgress();
      }
    });

    const unsubscribeStatus = trackingWebSocket.onStatusUpdate((data) => {
      if (data.cargo_id === selectedCargo.id) {
        setLastUpdate(new Date().toISOString());
        refetchTracking();
      }
    });

    // Subscribe to cargo tracking
    trackingWebSocket.subscribeToCargoTracking(selectedCargo.id);

    return () => {
      unsubscribeLocation();
      unsubscribeStatus();
      trackingWebSocket.unsubscribeFromCargoTracking(selectedCargo.id);
    };
  }, [selectedCargo?.id, isConnected, refetchTracking, refetchProgress]);

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
      const cargoWithTracking: CargoWithTracking = {
        ...selectedCargo,
        tracking: trackingData,
      };
      updateMapForSelectedCargo(cargoWithTracking);
    }
  }, [selectedCargo, trackingData, updateMapForSelectedCargo]);

  const handleCargoSelect = (cargo: CargoWithTracking) => {
    setSelectedCargo(cargo);
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
      case CargoPriority.MEDIUM:
        return "bg-orange-100 text-orange-800";
      case CargoPriority.LOW:
        return "bg-green-100 text-green-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const filteredCargoList = cargoData?.data || [];

  return (
    <LiveTrackingErrorBoundary>
      <div className="h-full flex gap-4">
        {/* Left Panel - Cargo List */}
        <div className="w-[30%] flex flex-col">
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  Tracking Cargo
                </CardTitle>
                <div className="flex items-center gap-2">
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
                  >
                    <RefreshCw
                      className={cn("h-4 w-4", cargoLoading && "animate-spin")}
                    />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {filteredCargoList.length} in-transit deliveries
              </p>
            </CardHeader>

            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-200px)]">
                {cargoLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                ) : cargoError ? (
                  <LiveTrackingMapFallback
                    type="data"
                    error={cargoError}
                    onRetry={() => refetchCargo()}
                    isConnecting={cargoLoading}
                  />
                ) : filteredCargoList.length === 0 ? (
                  <div className="flex items-center justify-center p-8 text-gray-500">
                    <Package className="h-6 w-6 mr-2" />
                    No in-transit cargo
                  </div>
                ) : (
                  <div className="space-y-2 p-2">
                    {filteredCargoList.map((cargo) => (
                      <Card
                        key={cargo.id}
                        className={cn(
                          "cursor-pointer transition-all hover:shadow-md",
                          selectedCargo?.id === cargo.id &&
                            "ring-2 ring-blue-500"
                        )}
                        onClick={() => handleCargoSelect(cargo)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm">
                                {cargo.type}
                              </h4>
                              <Badge className={getStatusColor(cargo.status)}>
                                {cargo.status.replace("_", " ")}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">
                                {cargo.delivery_location}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {formatDistanceToNow(
                                    new Date(cargo.created_at),
                                    { addSuffix: true }
                                  )}
                                </span>
                              </div>
                              <Badge
                                variant="outline"
                                className={getPriorityColor(cargo.priority)}
                              >
                                {cargo.priority}
                              </Badge>
                            </div>

                            {/* Progress indicator */}
                            {cargo.tracking?.progress_percentage && (
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span>Progress</span>
                                  <span>
                                    {Math.round(
                                      cargo.tracking.progress_percentage
                                    )}
                                    %
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div
                                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                    style={{
                                      width: `${cargo.tracking.progress_percentage}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            )}
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
        <div className="w-[70%] flex flex-col">
          <Card className="flex-1">
            <CardContent className="p-0 h-full">
              {/* Map Container */}
              <div className="h-[60%] relative">
                {mapError ? (
                  <LiveTrackingMapFallback
                    type="map"
                    error={mapError}
                    onRetry={initializeMap}
                    isConnecting={!mapLoaded}
                  />
                ) : (
                  <>
                    <div ref={mapRef} className="w-full h-full rounded-t-lg" />

                    {/* Map overlay info */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <Navigation className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">Live Tracking</span>
                        {lastUpdate && (
                          <span className="text-xs text-gray-500">
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
              <div className="h-[40%] p-6 border-t">
                {selectedCargo ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        {selectedCargo.type}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(selectedCargo.status)}>
                          {selectedCargo.status.replace("_", " ")}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={getPriorityColor(selectedCargo.priority)}
                        >
                          {selectedCargo.priority}
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                      {/* Location Info */}
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-1">
                            Pickup Location
                          </h4>
                          <p className="text-sm text-gray-600">
                            {selectedCargo.pickup_location}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-1">
                            Delivery Location
                          </h4>
                          <p className="text-sm text-gray-600">
                            {selectedCargo.delivery_location}
                          </p>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-3">
                        {isDriver && selectedCargo.client && (
                          <>
                            <div>
                              <h4 className="font-medium text-sm text-gray-700 mb-1">
                                Client Contact
                              </h4>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm">
                                  <User className="h-3 w-3" />
                                  <span>{selectedCargo.client.full_name}</span>
                                </div>
                                {selectedCargo.client.phone && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Phone className="h-3 w-3" />
                                    <span>{selectedCargo.client.phone}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        )}

                        {isClient && selectedCargo.tracking?.driver && (
                          <>
                            <div>
                              <h4 className="font-medium text-sm text-gray-700 mb-1">
                                Driver Info
                              </h4>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm">
                                  <User className="h-3 w-3" />
                                  <span>
                                    {selectedCargo.tracking.driver.full_name}
                                  </span>
                                </div>
                                {selectedCargo.tracking.driver.phone && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Phone className="h-3 w-3" />
                                    <span>
                                      {selectedCargo.tracking.driver.phone}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Progress and ETA */}
                    {(progressData ||
                      selectedCargo.tracking?.progress_percentage) && (
                      <>
                        <Separator />
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm text-gray-700">
                              Delivery Progress
                            </h4>
                            <span className="text-sm font-medium text-blue-600">
                              {Math.round(
                                progressData?.progress_percentage ||
                                  selectedCargo.tracking?.progress_percentage ||
                                  0
                              )}
                              %
                            </span>
                          </div>

                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
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
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="h-4 w-4" />
                              <span>
                                ETA:{" "}
                                {new Date(
                                  progressData.estimated_arrival
                                ).toLocaleString()}
                              </span>
                            </div>
                          )}

                          {progressData?.current_location && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span>
                                Current: {progressData.current_location}
                              </span>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-medium mb-2">
                        Select a cargo to track
                      </p>
                      <p className="text-sm">
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
