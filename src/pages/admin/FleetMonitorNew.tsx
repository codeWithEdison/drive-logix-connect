import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Truck,
  MapPin,
  Navigation,
  RefreshCw,
  Activity,
  Search,
  X,
  ZoomIn,
  ZoomOut,
  Layers,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { GPSService } from "@/lib/api/services/gpsService";
import { useFleetSocket } from "@/lib/api/hooks/realtimeHooks";
import { MapService } from "@/lib/api/services/mapService";
import { formatDistanceToNow } from "date-fns";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useBranches } from "@/lib/api/hooks/branchHooks";

export default function FleetMonitor() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightVehicleId = searchParams.get("highlight");

  const mapRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const infoWindowsRef = useRef<Map<string, any>>(new Map());
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [mapType, setMapType] = useState<"roadmap" | "satellite" | "hybrid">(
    "roadmap"
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showList, setShowList] = useState(true);

  // Fetch branches for filter
  const { data: branches } = useBranches({ page: 1, limit: 100 });

  // Fetch fleet data using JIMI locations
  const {
    data: fleetData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["fleet-monitor", branchFilter],
    queryFn: () =>
      GPSService.getJimiLocations({
        all: true,
        branch_id: branchFilter !== "all" ? branchFilter : undefined,
        page: 1,
        limit: 50,
      }),
    refetchInterval: 30000, // Fallback polling
  });

  // Connect to Socket.IO for real-time fleet updates
  const { connected, onLocation } = useFleetSocket();

  // Initialize map with enhanced controls
  const initializeMap = useCallback(async () => {
    if (!mapRef.current || mapLoaded) return;

    try {
      if (!window.google?.maps) {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          throw new Error("Google Maps API key not configured");
        }
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places`;
        script.async = true;
        script.onload = () => initializeMap();
        document.head.appendChild(script);
        return;
      }

      await MapService.initializeMap(mapRef.current, {
        center: { lat: -1.9441, lng: 30.0619 },
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoomControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        gestureHandling: "greedy",
      });
      setMapLoaded(true);
    } catch (error) {
      console.error("Map init error:", error);
      toast.error("Failed to load map");
    }
  }, [mapLoaded]);

  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  // Update markers when fleet data changes
  useEffect(() => {
    if (!mapLoaded || !fleetData?.data?.positions) return;

    // Clear old markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current.clear();
    infoWindowsRef.current.clear();

    let highlightedVehicle: any = null;

    // Add new markers from JIMI positions
    fleetData.data.positions.forEach((position: any) => {
      if (!position.latitude || !position.longitude) return;

      const markerPosition = {
        lat: position.latitude,
        lng: position.longitude,
      };

      // Determine online status based on heartbeat time (within last 5 minutes)
      const isOnline = position.heartbeat_time
        ? (new Date().getTime() - new Date(position.heartbeat_time).getTime()) /
            1000 <
          300
        : false;

      const isHighlighted = highlightVehicleId === position.imei;

      // Create custom marker with SVG
      const iconColor = isHighlighted
        ? "#ef4444"
        : isOnline
        ? "#10b981"
        : "#64748b";

      const iconSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
          <!-- Shadow -->
          <ellipse cx="24" cy="42" rx="12" ry="3" fill="rgba(0,0,0,0.2)"/>
          <!-- Car body -->
          <g transform="translate(24, 24) rotate(${
            position.heading_degrees || 0
          }) translate(-24, -24)">
            <path d="M 14 18 L 16 14 L 32 14 L 34 18 L 36 18 L 36 30 L 34 30 L 34 32 L 32 32 L 32 30 L 16 30 L 16 32 L 14 32 L 14 30 L 12 30 L 12 18 Z" 
                  fill="${iconColor}" 
                  stroke="#ffffff" 
                  stroke-width="2"/>
            <!-- Windows -->
            <rect x="17" y="16" width="6" height="5" fill="#1e40af" opacity="0.7"/>
            <rect x="25" y="16" width="6" height="5" fill="#1e40af" opacity="0.7"/>
            <!-- Wheels -->
            <circle cx="17" cy="30" r="2.5" fill="#1f2937" stroke="#ffffff" stroke-width="1"/>
            <circle cx="31" cy="30" r="2.5" fill="#1f2937" stroke="#ffffff" stroke-width="1"/>
            <!-- Headlights -->
            <circle cx="24" cy="13" r="1.5" fill="#fef08a"/>
          </g>
          ${
            isHighlighted
              ? `<circle cx="24" cy="24" r="20" fill="none" stroke="${iconColor}" stroke-width="2" opacity="0.5" stroke-dasharray="4 2"/>`
              : ""
          }
        </svg>
      `;

      const marker = new google.maps.Marker({
        position: markerPosition,
        map: MapService.getMapInstance(),
        title: position.device_name || position.imei,
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(iconSvg),
          scaledSize: new google.maps.Size(48, 48),
          anchor: new google.maps.Point(24, 24),
        },
        zIndex: isHighlighted ? 1000 : isOnline ? 100 : 50,
        optimized: false,
      });

      // Create enhanced info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; min-width: 240px; font-family: system-ui, -apple-system, sans-serif;">
            <div style="display: flex; align-items: center; justify-between; margin-bottom: 8px;">
              <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #111;">
                ${position.device_name || position.imei}
              </h3>
              <span style="display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; background: ${
                isOnline ? "#dcfce7" : "#f1f5f9"
              }; color: ${isOnline ? "#166534" : "#475569"};">
                ${isOnline ? "● Online" : "○ Offline"}
              </span>
            </div>
            <div style="font-size: 13px; color: #64748b; line-height: 1.6;">
              <div style="display: flex; align-items: center; margin: 6px 0;">
                <span style="width: 80px; font-weight: 500;">Speed:</span>
                <span style="font-weight: 600; color: #0f172a;">${position.speed_kmh?.toFixed(
                  1
                )} km/h</span>
              </div>
              <div style="display: flex; align-items: center; margin: 6px 0;">
                <span style="width: 80px; font-weight: 500;">Battery:</span>
                <span style="font-weight: 600; color: #0f172a;">${(
                  position.battery_level * 100
                ).toFixed(0)}%</span>
              </div>
              ${
                position.acc_status !== undefined
                  ? `<div style="display: flex; align-items: center; margin: 6px 0;">
                      <span style="width: 80px; font-weight: 500;">Engine:</span>
                      <span style="font-weight: 600; color: ${
                        position.acc_status ? "#16a34a" : "#64748b"
                      };">${position.acc_status ? "ON" : "OFF"}</span>
                    </div>`
                  : ""
              }
              ${
                position.location_description
                  ? `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0;">
                      <div style="font-size: 12px; color: #94a3b8; margin-bottom: 4px;">📍 Location</div>
                      <div style="font-size: 13px; color: #0f172a; font-weight: 500;">${position.location_description}</div>
                    </div>`
                  : ""
              }
            </div>
          </div>
        `,
        maxWidth: 280,
      });

      marker.addListener("click", () => {
        // Close all other info windows
        infoWindowsRef.current.forEach((iw) => iw.close());

        setSelectedVehicle(position);
        MapService.centerMapOnLocation(markerPosition);
        infoWindow.open(MapService.getMapInstance(), marker);
      });

      markersRef.current.set(position.imei, marker);
      infoWindowsRef.current.set(position.imei, infoWindow);

      if (isHighlighted) {
        highlightedVehicle = position;
      }
    });

    // Auto-select and center on highlighted vehicle
    if (highlightedVehicle) {
      setSelectedVehicle(highlightedVehicle);
      const infoWindow = infoWindowsRef.current.get(highlightedVehicle.imei);
      const marker = markersRef.current.get(highlightedVehicle.imei);
      if (infoWindow && marker) {
        infoWindow.open(MapService.getMapInstance(), marker);
      }
      MapService.centerMapOnLocation({
        lat: highlightedVehicle.latitude,
        lng: highlightedVehicle.longitude,
      });
    }
  }, [mapLoaded, fleetData, highlightVehicleId]);

  // Listen for real-time updates
  useEffect(() => {
    if (!connected) return;
    const unsub = onLocation((data: any) => {
      const vehicleId = data.vehicle_id || data.imei;
      if (!vehicleId) return;

      // Update marker position
      const marker = markersRef.current.get(vehicleId);
      if (marker && data.latitude && data.longitude) {
        marker.setPosition({ lat: data.latitude, lng: data.longitude });
        if (data.heading_degrees !== undefined) {
          const icon = marker.getIcon();
          marker.setIcon({ ...icon, rotation: data.heading_degrees });
        }
      }

      // Refetch to update list
      refetch();
    });
    return unsub;
  }, [connected, onLocation, refetch]);

  // Map control functions
  const handleZoomIn = () => {
    const map = MapService.getMapInstance();
    if (map) {
      const currentZoom = map.getZoom() || 13;
      map.setZoom(currentZoom + 1);
    }
  };

  const handleZoomOut = () => {
    const map = MapService.getMapInstance();
    if (map) {
      const currentZoom = map.getZoom() || 13;
      map.setZoom(currentZoom - 1);
    }
  };

  const handleMapTypeChange = (type: "roadmap" | "satellite" | "hybrid") => {
    const map = MapService.getMapInstance();
    if (map) {
      const mapTypeId =
        type === "satellite"
          ? google.maps.MapTypeId.SATELLITE
          : type === "hybrid"
          ? google.maps.MapTypeId.HYBRID
          : google.maps.MapTypeId.ROADMAP;
      map.setMapTypeId(mapTypeId);
      setMapType(type);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      setShowList(false);
    }
  };

  // Filter vehicles by search term
  const filteredVehicles = fleetData?.data?.positions?.filter((v: any) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        v.device_name?.toLowerCase().includes(searchLower) ||
        v.imei?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <div
      className={`relative ${
        isFullscreen ? "fixed inset-0 z-50 bg-background" : "h-screen"
      } overflow-hidden`}
    >
      {/* Full-Screen Map Container */}
      <div className="relative w-full h-full">
        <div
          ref={mapRef}
          className="w-full h-full"
          style={{ background: "#e5e7eb" }}
        />

        {/* Floating Search Bar - Top Center */}
        {!isFullscreen && showList && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-md px-4">
            <Card className="shadow-lg">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search vehicles..."
                      className="pl-10 border-0 focus-visible:ring-0"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={branchFilter} onValueChange={setBranchFilter}>
                    <SelectTrigger className="w-[120px] border-0">
                      <SelectValue placeholder="Branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {branches?.branches?.map((branch: any) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Status Badge - Top Left */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          <Badge
            variant={connected ? "default" : "secondary"}
            className="shadow-md"
          >
            {connected ? "● Live" : "○ Offline"}
          </Badge>
          <Badge variant="outline" className="shadow-md bg-background">
            {filteredVehicles?.length || 0} Vehicles
          </Badge>
        </div>

        {/* Zoom Controls - Right Side */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 flex flex-col gap-2">
          <Button
            variant="outline"
            size="icon"
            className="bg-background shadow-lg hover:shadow-xl transition-shadow"
            onClick={handleZoomIn}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-background shadow-lg hover:shadow-xl transition-shadow"
            onClick={handleZoomOut}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <div className="h-px bg-border my-1" />
          <Button
            variant="outline"
            size="icon"
            className="bg-background shadow-lg hover:shadow-xl transition-shadow"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-background shadow-lg hover:shadow-xl transition-shadow"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Map Type Switcher - Bottom Right */}
        <div className="absolute right-4 bottom-4 z-10">
          <Card className="shadow-lg p-2">
            <div className="flex flex-col gap-1">
              <Button
                variant={mapType === "roadmap" ? "default" : "ghost"}
                size="sm"
                className="justify-start text-xs h-8"
                onClick={() => handleMapTypeChange("roadmap")}
              >
                <Layers className="h-3 w-3 mr-2" />
                Map
              </Button>
              <Button
                variant={mapType === "satellite" ? "default" : "ghost"}
                size="sm"
                className="justify-start text-xs h-8"
                onClick={() => handleMapTypeChange("satellite")}
              >
                <Layers className="h-3 w-3 mr-2" />
                Satellite
              </Button>
              <Button
                variant={mapType === "hybrid" ? "default" : "ghost"}
                size="sm"
                className="justify-start text-xs h-8"
                onClick={() => handleMapTypeChange("hybrid")}
              >
                <Layers className="h-3 w-3 mr-2" />
                Hybrid
              </Button>
            </div>
          </Card>
        </div>

        {/* Vehicle List Panel - Left Side Drawer */}
        {!isFullscreen && showList && (
          <div className="absolute left-4 top-20 bottom-4 z-10 w-80">
            <Card className="h-full shadow-xl flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Vehicles ({filteredVehicles?.length || 0})
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setShowList(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0">
                <div className="h-full overflow-y-auto">
                  {isLoading ? (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      Loading vehicles...
                    </div>
                  ) : filteredVehicles && filteredVehicles.length > 0 ? (
                    filteredVehicles.map((vehicle: any) => {
                      // Determine online status
                      const isOnline = vehicle.heartbeat_time
                        ? (new Date().getTime() -
                            new Date(vehicle.heartbeat_time).getTime()) /
                            1000 <
                          300
                        : false;

                      return (
                        <div
                          key={vehicle.imei}
                          className={`p-3 border-b hover:bg-accent cursor-pointer transition-colors ${
                            selectedVehicle?.imei === vehicle.imei
                              ? "bg-accent"
                              : ""
                          }`}
                          onClick={() => {
                            setSelectedVehicle(vehicle);
                            if (vehicle.latitude) {
                              MapService.centerMapOnLocation({
                                lat: vehicle.latitude,
                                lng: vehicle.longitude,
                              });
                              const infoWindow = infoWindowsRef.current.get(
                                vehicle.imei
                              );
                              const marker = markersRef.current.get(
                                vehicle.imei
                              );
                              if (infoWindow && marker) {
                                infoWindowsRef.current.forEach((iw) =>
                                  iw.close()
                                );
                                infoWindow.open(
                                  MapService.getMapInstance(),
                                  marker
                                );
                              }
                            }
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Truck className="h-3 w-3 text-muted-foreground" />
                                <span className="font-semibold text-sm">
                                  {vehicle.device_name || vehicle.imei}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge
                                  variant={isOnline ? "default" : "secondary"}
                                  className="text-[10px] px-1.5 py-0"
                                >
                                  {isOnline ? "● Online" : "○ Offline"}
                                </Badge>
                                {vehicle.acc_status && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] px-1.5 py-0"
                                  >
                                    Engine ON
                                  </Badge>
                                )}
                              </div>
                              <div className="space-y-0.5 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Navigation className="h-3 w-3" />
                                  <span>
                                    {vehicle.speed_kmh?.toFixed(1) || 0} km/h
                                  </span>
                                </div>
                                {vehicle.gps_time && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>
                                      {formatDistanceToNow(
                                        new Date(vehicle.gps_time),
                                        {
                                          addSuffix: true,
                                        }
                                      )}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      No vehicles found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Toggle List Button - When Hidden */}
        {!isFullscreen && !showList && (
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-4 z-10 bg-background shadow-lg"
            onClick={() => setShowList(true)}
          >
            <Truck className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
