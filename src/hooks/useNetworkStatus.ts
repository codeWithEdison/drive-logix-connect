import { useState, useEffect, useCallback } from "react";
import { networkService, NetworkStatus } from "@/lib/services/networkService";

export interface NetworkHook {
  status: NetworkStatus;
  isOnline: boolean;
  isConnected: boolean;
  connectionType: string;
  connectionQuality: "excellent" | "good" | "fair" | "poor" | "offline";
  isStable: boolean;
  waitForConnection: (timeout?: number) => Promise<boolean>;
}

/**
 * Hook for monitoring network status
 */
export const useNetworkStatus = (): NetworkHook => {
  const [status, setStatus] = useState<NetworkStatus>({
    connected: true,
    connectionType: "unknown",
    isOnline: true,
  });

  const updateStatus = useCallback((newStatus: NetworkStatus) => {
    setStatus(newStatus);
  }, []);

  const waitForConnection = useCallback(
    async (timeout: number = 30000): Promise<boolean> => {
      return networkService.waitForConnection(timeout);
    },
    []
  );

  // Initialize network monitoring
  useEffect(() => {
    const initializeNetwork = async () => {
      try {
        await networkService.initialize();

        // Set initial status
        setStatus(networkService.getCurrentStatus());

        // Listen for status changes
        const unsubscribe = networkService.addListener(updateStatus);

        return unsubscribe;
      } catch (error) {
        console.error("Failed to initialize network monitoring:", error);
      }
    };

    let unsubscribe: (() => void) | undefined;
    initializeNetwork().then((unsub) => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [updateStatus]);

  return {
    status,
    isOnline: status.isOnline,
    isConnected: status.connected,
    connectionType: status.connectionType,
    connectionQuality: networkService.getConnectionQuality(),
    isStable: networkService.isStableConnection(),
    waitForConnection,
  };
};

export default useNetworkStatus;
