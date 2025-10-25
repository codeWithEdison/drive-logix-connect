import { Network } from "@capacitor/network";
import { Capacitor } from "@capacitor/core";

export interface NetworkStatus {
  connected: boolean;
  connectionType: "wifi" | "cellular" | "ethernet" | "unknown" | "none";
  isOnline: boolean;
}

class NetworkService {
  private listeners: Array<(status: NetworkStatus) => void> = [];
  private currentStatus: NetworkStatus = {
    connected: true,
    connectionType: "unknown",
    isOnline: true,
  };

  /**
   * Initialize network monitoring
   */
  async initialize(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        await this.initializeNative();
      } else {
        await this.initializeWeb();
      }
    } catch (error) {
      console.error("Network service initialization error:", error);
    }
  }

  /**
   * Initialize native network monitoring
   */
  private async initializeNative(): Promise<void> {
    // Get initial status
    const status = await Network.getStatus();
    this.currentStatus = {
      connected: status.connected,
      connectionType: status.connectionType as any,
      isOnline: status.connected,
    };

    // Listen for network changes
    Network.addListener("networkStatusChange", (status) => {
      this.currentStatus = {
        connected: status.connected,
        connectionType: status.connectionType as any,
        isOnline: status.connected,
      };

      this.notifyListeners();
    });
  }

  /**
   * Initialize web network monitoring
   */
  private async initializeWeb(): Promise<void> {
    // Set initial status
    this.currentStatus = {
      connected: navigator.onLine,
      connectionType: this.getWebConnectionType(),
      isOnline: navigator.onLine,
    };

    // Listen for online/offline events
    window.addEventListener("online", () => {
      this.currentStatus = {
        connected: true,
        connectionType: this.getWebConnectionType(),
        isOnline: true,
      };
      this.notifyListeners();
    });

    window.addEventListener("offline", () => {
      this.currentStatus = {
        connected: false,
        connectionType: "none",
        isOnline: false,
      };
      this.notifyListeners();
    });
  }

  /**
   * Get web connection type
   */
  private getWebConnectionType(): "wifi" | "cellular" | "ethernet" | "unknown" {
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    if (connection) {
      switch (connection.effectiveType) {
        case "slow-2g":
        case "2g":
        case "3g":
        case "4g":
          return "cellular";
        case "ethernet":
          return "ethernet";
        default:
          return "wifi";
      }
    }

    return "unknown";
  }

  /**
   * Get current network status
   */
  getCurrentStatus(): NetworkStatus {
    return { ...this.currentStatus };
  }

  /**
   * Check if device is online
   */
  isOnline(): boolean {
    return this.currentStatus.isOnline;
  }

  /**
   * Check if device is connected
   */
  isConnected(): boolean {
    return this.currentStatus.connected;
  }

  /**
   * Get connection type
   */
  getConnectionType(): string {
    return this.currentStatus.connectionType;
  }

  /**
   * Add network status listener
   */
  addListener(callback: (status: NetworkStatus) => void): () => void {
    this.listeners.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(): void {
    this.listeners.forEach((callback) => {
      try {
        callback(this.currentStatus);
      } catch (error) {
        console.error("Network listener error:", error);
      }
    });
  }

  /**
   * Wait for network to be available
   */
  async waitForConnection(timeout: number = 30000): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.isOnline()) {
        resolve(true);
        return;
      }

      const timeoutId = setTimeout(() => {
        unsubscribe();
        resolve(false);
      }, timeout);

      const unsubscribe = this.addListener((status) => {
        if (status.isOnline) {
          clearTimeout(timeoutId);
          unsubscribe();
          resolve(true);
        }
      });
    });
  }

  /**
   * Check if connection is stable (not slow)
   */
  isStableConnection(): boolean {
    if (!this.isOnline()) return false;

    const connectionType = this.getConnectionType();
    return connectionType === "wifi" || connectionType === "ethernet";
  }

  /**
   * Get connection quality
   */
  getConnectionQuality(): "excellent" | "good" | "fair" | "poor" | "offline" {
    if (!this.isOnline()) return "offline";

    const connectionType = this.getConnectionType();

    switch (connectionType) {
      case "ethernet":
      case "wifi":
        return "excellent";
      case "cellular":
        return "good";
      default:
        return "fair";
    }
  }
}

export const networkService = new NetworkService();
export default networkService;
