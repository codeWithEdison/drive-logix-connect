import { CargoTracking, GPSTracking, CargoStatus } from "../../../types/shared";

export interface WebSocketMessage {
  type:
    | "location_update"
    | "status_update"
    | "delivery_update"
    | "connection_status";
  data: any;
  timestamp: string;
}

export interface LocationUpdateMessage {
  type: "location_update";
  data: {
    cargo_id: string;
    vehicle_id: string;
    location: GPSTracking;
    progress_percentage: number;
    estimated_arrival: string;
  };
}

export interface StatusUpdateMessage {
  type: "status_update";
  data: {
    cargo_id: string;
    status: CargoStatus;
    notes?: string;
    updated_by: string;
  };
}

export interface DeliveryUpdateMessage {
  type: "delivery_update";
  data: {
    cargo_id: string;
    driver_id: string;
    update_type: "pickup" | "in_transit" | "delivered" | "delayed";
    location?: GPSTracking;
    notes?: string;
  };
}

export interface ConnectionStatusMessage {
  type: "connection_status";
  data: {
    connected: boolean;
    last_ping?: string;
    server_time: string;
  };
}

export type TrackingWebSocketMessage =
  | LocationUpdateMessage
  | StatusUpdateMessage
  | DeliveryUpdateMessage
  | ConnectionStatusMessage;

export class TrackingWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private messageHandlers: Map<string, ((data: any) => void)[]> = new Map();
  private connectionHandlers: ((connected: boolean) => void)[] = [];
  private isConnecting = false;
  private url: string;

  constructor(baseUrl?: string) {
    // Use environment variable or default to localhost
    const wsBaseUrl =
      baseUrl || import.meta.env.VITE_WS_URL || "ws://localhost:3000";
    this.url = `${wsBaseUrl}/ws/tracking`;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error("Connection already in progress"));
        return;
      }

      this.isConnecting = true;

      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log("WebSocket connected");
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.notifyConnectionHandlers(true);
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: TrackingWebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error("Failed to parse WebSocket message:", error);
          }
        };

        this.ws.onclose = (event) => {
          console.log("WebSocket disconnected:", event.code, event.reason);
          this.isConnecting = false;
          this.stopHeartbeat();
          this.notifyConnectionHandlers(false);

          if (
            !event.wasClean &&
            this.reconnectAttempts < this.maxReconnectAttempts
          ) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          this.isConnecting = false;
          reject(error);
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close(1000, "Client disconnect");
      this.ws = null;
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(
          JSON.stringify({
            type: "ping",
            timestamp: new Date().toISOString(),
          })
        );
      }
    }, 30000); // Ping every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    setTimeout(() => {
      this.connect().catch((error) => {
        console.error("Reconnection failed:", error);
      });
    }, delay);
  }

  private handleMessage(message: TrackingWebSocketMessage): void {
    const handlers = this.messageHandlers.get(message.type) || [];
    handlers.forEach((handler) => {
      try {
        handler(message.data);
      } catch (error) {
        console.error(`Error in message handler for ${message.type}:`, error);
      }
    });
  }

  private notifyConnectionHandlers(connected: boolean): void {
    this.connectionHandlers.forEach((handler) => {
      try {
        handler(connected);
      } catch (error) {
        console.error("Error in connection handler:", error);
      }
    });
  }

  // Subscribe to specific message types
  onMessage(type: string, handler: (data: any) => void): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }

    this.messageHandlers.get(type)!.push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(type);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  // Subscribe to connection status changes
  onConnectionChange(handler: (connected: boolean) => void): () => void {
    this.connectionHandlers.push(handler);

    // Return unsubscribe function
    return () => {
      const index = this.connectionHandlers.indexOf(handler);
      if (index > -1) {
        this.connectionHandlers.splice(index, 1);
      }
    };
  }

  // Convenience methods for specific message types
  onLocationUpdate(
    handler: (data: LocationUpdateMessage["data"]) => void
  ): () => void {
    return this.onMessage("location_update", handler);
  }

  onStatusUpdate(
    handler: (data: StatusUpdateMessage["data"]) => void
  ): () => void {
    return this.onMessage("status_update", handler);
  }

  onDeliveryUpdate(
    handler: (data: DeliveryUpdateMessage["data"]) => void
  ): () => void {
    return this.onMessage("delivery_update", handler);
  }

  // Subscribe to specific cargo tracking
  subscribeToCargoTracking(cargoId: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: "subscribe",
          cargo_id: cargoId,
          timestamp: new Date().toISOString(),
        })
      );
    }
  }

  // Unsubscribe from specific cargo tracking
  unsubscribeFromCargoTracking(cargoId: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: "unsubscribe",
          cargo_id: cargoId,
          timestamp: new Date().toISOString(),
        })
      );
    }
  }

  // Get connection status
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // Get connection state
  getReadyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }
}

// Singleton instance for global use
export const trackingWebSocket = new TrackingWebSocket();
