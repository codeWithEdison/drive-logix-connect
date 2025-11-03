import {
  getSocket,
  joinRoom,
  leaveRoom,
  on,
  off,
  disconnectSocket,
} from "@/lib/services/socket";
import { storage } from "@/lib/services/secureStorage";

type ConnectionListener = (connected: boolean) => void;
type LocationUpdate = {
  vehicle_id?: string;
  cargo_id?: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  speed_kmh?: number;
  heading_degrees?: number;
  battery_level?: number;
  recorded_at?: string;
};

class TrackingWebSocketService {
  private connected = false;
  private connectionListeners = new Set<ConnectionListener>();

  async connect(): Promise<void> {
    const token = (await storage.getItem("access_token")) as string;
    const socket = getSocket(token);
    return new Promise((resolve, reject) => {
      const onConnect = () => {
        this.connected = true;
        this.connectionListeners.forEach((cb) => cb(true));
        socket.off("connect_error", onError as any);
        resolve();
      };
      const onError = (err: any) => {
        this.connected = false;
        this.connectionListeners.forEach((cb) => cb(false));
        socket.off("connect", onConnect as any);
        reject(err);
      };
      socket.once("connect", onConnect);
      socket.once("connect_error", onError);
    });
  }

  disconnect() {
    this.connected = false;
    this.connectionListeners.forEach((cb) => cb(false));
    disconnectSocket();
  }

  onConnectionChange(cb: ConnectionListener) {
    this.connectionListeners.add(cb);
    return () => this.connectionListeners.delete(cb);
  }

  onLocationUpdate(cb: (data: LocationUpdate) => void) {
    const handler = (payload: any) => cb(payload as LocationUpdate);
    on("gps:location:update" as any, handler as any);
    return () => off("gps:location:update" as any, handler as any);
  }

  onStatusUpdate(cb: (data: any) => void) {
    const handler = (payload: any) => cb(payload);
    on("gps:status:update" as any, handler as any);
    return () => off("gps:status:update" as any, handler as any);
  }

  subscribeToCargoTracking(cargoId: string) {
    if (!cargoId) return;
    joinRoom(`cargo:${cargoId}`);
  }

  unsubscribeFromCargoTracking(cargoId: string) {
    if (!cargoId) return;
    leaveRoom(`cargo:${cargoId}`);
  }

  subscribeToVehicle(vehicleId: string) {
    if (!vehicleId) return;
    joinRoom(`vehicle:${vehicleId}`);
  }

  unsubscribeFromVehicle(vehicleId: string) {
    if (!vehicleId) return;
    leaveRoom(`vehicle:${vehicleId}`);
  }

  subscribeFleetMonitor() {
    joinRoom("fleet:monitor");
  }

  unsubscribeFleetMonitor() {
    leaveRoom("fleet:monitor");
  }
}

export const trackingWebSocket = new TrackingWebSocketService();
