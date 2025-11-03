import { useEffect, useRef, useState } from "react";
import { trackingWebSocket } from "@/lib/api/services/websocketService";

export function useVehicleLiveSocket(vehicleId?: string) {
  const [connected, setConnected] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    trackingWebSocket.connect().catch(() => {});
    const off = trackingWebSocket.onConnectionChange(
      (c) => mounted.current && setConnected(c)
    );
    return () => {
      off();
    };
  }, []);

  useEffect(() => {
    if (!vehicleId) return;
    trackingWebSocket.subscribeToVehicle(vehicleId);
    return () => trackingWebSocket.unsubscribeFromVehicle(vehicleId);
  }, [vehicleId]);

  const onLocation = (cb: (data: any) => void) =>
    trackingWebSocket.onLocationUpdate(cb);

  return { connected, onLocation };
}

export function useCargoSocket(cargoId?: string) {
  const [connected, setConnected] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    trackingWebSocket.connect().catch(() => {});
    const off = trackingWebSocket.onConnectionChange(
      (c) => mounted.current && setConnected(c)
    );
    return () => {
      off();
    };
  }, []);

  useEffect(() => {
    if (!cargoId) return;
    trackingWebSocket.subscribeToCargoTracking(cargoId);
    return () => trackingWebSocket.unsubscribeFromCargoTracking(cargoId);
  }, [cargoId]);

  const onLocation = (cb: (data: any) => void) =>
    trackingWebSocket.onLocationUpdate(cb);

  return { connected, onLocation };
}

export function useFleetSocket() {
  const [connected, setConnected] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    trackingWebSocket.connect().catch(() => {});
    const off = trackingWebSocket.onConnectionChange(
      (c) => mounted.current && setConnected(c)
    );
    trackingWebSocket.subscribeFleetMonitor();
    return () => {
      off();
      trackingWebSocket.unsubscribeFleetMonitor();
    };
  }, []);

  const onLocation = (cb: (data: any) => void) =>
    trackingWebSocket.onLocationUpdate(cb);

  return { connected, onLocation };
}
