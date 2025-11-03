import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Truck,
  MapPin,
  Clock,
  Navigation,
  RefreshCw,
  AlertCircle,
  Activity,
  Battery,
  Gauge,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { GPSService } from "@/lib/api/services/gpsService";
import { useVehicleLiveSocket } from "@/lib/api/hooks/realtimeHooks";
import { MapService } from "@/lib/api/services/mapService";
import { formatDistanceToNow } from "date-fns";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { toast } from "sonner";

export default function VehicleLiveTracking() {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<any>(null);

  // Fetch initial live data
  const {
    data: liveData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["vehicle-live", vehicleId],
    queryFn: () =>
      vehicleId ? GPSService.getLiveTracking(vehicleId) : Promise.reject(),
    enabled: !!vehicleId,
    refetchInterval: 30000, // Fallback polling every 30s
  });

  // Fetch vehicle status
  const { data: statusData } = useQuery({
    queryKey: ["vehicle-status", vehicleId],
    queryFn: () =>
      vehicleId ? GPSService.getVehicleStatus(vehicleId) : Promise.reject(),
    enabled: !!vehicleId,
    refetchInterval: 60000,
  });

  // Connect to Socket.IO for real-time updates
  const { connected, onLocation } = useVehicleLiveSocket(vehicleId);

  // Initialize map
  const initializeMap = useCallback(async () => {
    if (!mapRef.current || mapLoaded) return;

    try {
      if (!window.google?.maps) {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          throw new Error("Google Maps API key not configured");
        }
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
        script.async = true;
        script.onload = () => initializeMap();
        document.head.appendChild(script);
        return;
      }

      await MapService.initializeMap(mapRef.current, {
        center: { lat: -1.9441, lng: 30.0619 },
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
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

  // Update map marker when location changes
  useEffect(() => {
    if (!mapLoaded || !currentLocation) return;

    const { latitude, longitude } = currentLocation;
    if (!latitude || !longitude) return;

    const position = { lat: latitude, lng: longitude };

    if (markerRef.current) {
      markerRef.current.setPosition(position);
      MapService.centerMapOnLocation(position);
    } else {
      const marker = new google.maps.Marker({
        position,
        map: MapService.getMapInstance(),
        title: statusData?.data?.vehicle?.plate_number || "Vehicle",
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 5,
          fillColor: "#2563eb",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 2,
          rotation: currentLocation.heading_degrees || 0,
        } as google.maps.Symbol,
      });
      markerRef.current = marker;
    }
  }, [mapLoaded, currentLocation, statusData]);

  // Set initial location from REST
  useEffect(() => {
    if (liveData?.data) {
      setCurrentLocation(liveData.data);
    }
  }, [liveData]);

  // Listen for real-time updates
  useEffect(() => {
    if (!connected || !vehicleId) return;
    const unsub = onLocation((data: any) => {
      if (data.vehicle_id === vehicleId) {
        setCurrentLocation(data);
        refetch(); // Optional: refetch to sync status
      }
    });
    return unsub;
  }, [connected, vehicleId, onLocation, refetch]);

  const vehicle = statusData?.data?.vehicle;
  const gpsStatus = statusData?.data?.gps_status;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {vehicle?.plate_number || "Vehicle"} Live Tracking
            </h1>
            <p className="text-muted-foreground">Real-time GPS location</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={connected ? "default" : "secondary"}>
            {connected ? "Live" : "Offline"}
          </Badge>
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            <div
              ref={mapRef}
              className="w-full h-[600px] rounded-lg"
              style={{ minHeight: "600px" }}
            />
          </CardContent>
        </Card>

        {/* Info Panel */}
        <div className="space-y-4">
          {/* Vehicle Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Vehicle Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {vehicle && (
                <>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Plate Number
                    </p>
                    <p className="font-semibold">{vehicle.plate_number}</p>
                  </div>
                  {vehicle.make && (
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Make/Model
                      </p>
                      <p className="font-semibold">
                        {vehicle.make} {vehicle.model}
                      </p>
                    </div>
                  )}
                  {vehicle.type && (
                    <div>
                      <p className="text-xs text-muted-foreground">Type</p>
                      <Badge>{vehicle.type}</Badge>
                    </div>
                  )}
                  {vehicle.device_imei && (
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Device IMEI
                      </p>
                      <p className="text-sm font-mono">{vehicle.device_imei}</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* GPS Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                GPS Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {gpsStatus ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Status
                    </span>
                    <Badge variant={gpsStatus.online ? "default" : "secondary"}>
                      {gpsStatus.online ? "Online" : "Offline"}
                    </Badge>
                  </div>
                  {gpsStatus.last_update && (
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Last Update
                      </p>
                      <p className="text-sm">
                        {formatDistanceToNow(new Date(gpsStatus.last_update), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  )}
                  {currentLocation?.battery_level !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Battery className="h-4 w-4" />
                        Battery
                      </span>
                      <span className="font-semibold">
                        {currentLocation.battery_level}%
                      </span>
                    </div>
                  )}
                  {currentLocation?.speed_kmh !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Gauge className="h-4 w-4" />
                        Speed
                      </span>
                      <span className="font-semibold">
                        {currentLocation.speed_kmh.toFixed(1)} km/h
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No GPS data available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Current Location */}
          {currentLocation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Current Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Latitude</p>
                  <p className="font-mono text-sm">
                    {currentLocation.latitude}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Longitude</p>
                  <p className="font-mono text-sm">
                    {currentLocation.longitude}
                  </p>
                </div>
                {currentLocation.recorded_at && (
                  <div>
                    <p className="text-xs text-muted-foreground">Recorded</p>
                    <p className="text-sm">
                      {formatDistanceToNow(
                        new Date(currentLocation.recorded_at),
                        {
                          addSuffix: true,
                        }
                      )}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          {vehicle?.device_imei && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() =>
                    navigate(`/admin/vehicles/${vehicleId}/history`)
                  }
                >
                  <Clock className="h-4 w-4 mr-2" />
                  View History
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={async () => {
                    try {
                      const res = await GPSService.getJimiShareUrl(
                        vehicle.device_imei
                      );
                      if (res.success && res.data?.share_url) {
                        window.open(res.data.share_url, "_blank");
                      }
                    } catch (e) {
                      toast.error("Failed to get share URL");
                    }
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  JIMI Share Link
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
