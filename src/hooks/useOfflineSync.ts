import { useState, useEffect, useCallback } from "react";
import { offlineStorageService } from "@/lib/services/offlineStorage";
import { networkService } from "@/lib/services/networkService";
import axiosInstance from "@/lib/api/axios";

export interface SyncItem {
  id: number;
  entityType: string;
  action: "create" | "update" | "delete";
  payload: any;
  timestamp: number;
  status: "pending" | "processing" | "completed" | "failed";
  retryCount: number;
  errorMessage?: string;
}

export interface OfflineSyncHook {
  isOnline: boolean;
  pendingItems: SyncItem[];
  isSyncing: boolean;
  syncProgress: number;
  addToSyncQueue: (
    entityType: string,
    action: "create" | "update" | "delete",
    payload: any
  ) => Promise<void>;
  syncNow: () => Promise<void>;
  retryFailedItems: () => Promise<void>;
  clearCompletedItems: () => Promise<void>;
  getCacheStats: () => Promise<{
    size: number;
    oldestItem: number;
    newestItem: number;
  }>;
}

/**
 * Hook for managing offline sync operations
 */
export const useOfflineSync = (): OfflineSyncHook => {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingItems, setPendingItems] = useState<SyncItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  const loadSyncQueue = useCallback(async () => {
    try {
      const items = await offlineStorageService.getSyncQueue();
      setPendingItems(items);
    } catch (error) {
      console.error("Failed to load sync queue:", error);
    }
  }, []);

  const addToSyncQueue = useCallback(
    async (
      entityType: string,
      action: "create" | "update" | "delete",
      payload: any
    ) => {
      try {
        await offlineStorageService.addToSyncQueue({
          entityType,
          action,
          payload,
          timestamp: Date.now(),
          status: "pending",
          retryCount: 0,
        });

        // Reload sync queue
        await loadSyncQueue();
      } catch (error) {
        console.error("Failed to add item to sync queue:", error);
      }
    },
    [loadSyncQueue]
  );

  const syncNow = useCallback(async () => {
    if (isSyncing || !isOnline) return;

    setIsSyncing(true);
    setSyncProgress(0);

    try {
      const items = await offlineStorageService.getSyncQueue();
      const pendingItems = items.filter(
        (item) => item.status === "pending" || item.status === "failed"
      );

      if (pendingItems.length === 0) {
        setIsSyncing(false);
        return;
      }

      let completed = 0;
      const total = pendingItems.length;

      for (const item of pendingItems) {
        try {
          // Update status to processing
          await offlineStorageService.addToSyncQueue({
            ...item,
            status: "processing",
          });

          // Perform sync based on entity type and action
          const success = await performSyncOperation(item);

          if (success) {
            // Mark as completed and remove from queue
            await offlineStorageService.removeFromSyncQueue(item.id);
            completed++;
          } else {
            // Mark as failed and increment retry count
            await offlineStorageService.addToSyncQueue({
              ...item,
              status: "failed",
              retryCount: item.retryCount + 1,
              errorMessage: "Sync operation failed",
            });
          }

          // Update progress
          setSyncProgress((completed / total) * 100);
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);

          // Mark as failed
          await offlineStorageService.addToSyncQueue({
            ...item,
            status: "failed",
            retryCount: item.retryCount + 1,
            errorMessage:
              error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      // Reload sync queue
      await loadSyncQueue();
    } catch (error) {
      console.error("Sync operation failed:", error);
    } finally {
      setIsSyncing(false);
      setSyncProgress(0);
    }
  }, [isSyncing, isOnline, loadSyncQueue]);

  const performSyncOperation = async (item: SyncItem): Promise<boolean> => {
    try {
      const { entityType, action, payload } = item;

      // Determine API endpoint based on entity type
      let endpoint = "";
      let method = "POST";

      switch (entityType) {
        case "cargo":
          endpoint =
            action === "create" ? "/api/cargos" : `/api/cargos/${payload.id}`;
          method =
            action === "create"
              ? "POST"
              : action === "update"
              ? "PUT"
              : "DELETE";
          break;
        case "delivery":
          endpoint =
            action === "create"
              ? "/api/deliveries"
              : `/api/deliveries/${payload.id}`;
          method =
            action === "create"
              ? "POST"
              : action === "update"
              ? "PUT"
              : "DELETE";
          break;
        case "gps_location":
          endpoint = "/api/batch/gps-locations";
          method = "POST";
          break;
        default:
          console.warn(`Unknown entity type: ${entityType}`);
          return false;
      }

      // Make API call using axios
      let response;
      if (method === "POST") {
        response = await axiosInstance.post(endpoint, payload);
      } else if (method === "PUT") {
        response = await axiosInstance.put(endpoint, payload);
      } else if (method === "DELETE") {
        response = await axiosInstance.delete(endpoint);
      } else {
        response = await axiosInstance.get(endpoint);
      }

      return response.data.success;
    } catch (error) {
      console.error("Sync operation error:", error);
      return false;
    }
  };

  const retryFailedItems = useCallback(async () => {
    try {
      const items = await offlineStorageService.getSyncQueue();
      const failedItems = items.filter(
        (item) => item.status === "failed" && item.retryCount < 3
      );

      for (const item of failedItems) {
        await offlineStorageService.addToSyncQueue({
          ...item,
          status: "pending",
        });
      }

      await loadSyncQueue();
    } catch (error) {
      console.error("Failed to retry failed items:", error);
    }
  }, [loadSyncQueue]);

  const clearCompletedItems = useCallback(async () => {
    try {
      const items = await offlineStorageService.getSyncQueue();
      const completedItems = items.filter(
        (item) => item.status === "completed"
      );

      for (const item of completedItems) {
        await offlineStorageService.removeFromSyncQueue(item.id);
      }

      await loadSyncQueue();
    } catch (error) {
      console.error("Failed to clear completed items:", error);
    }
  }, [loadSyncQueue]);

  const getCacheStats = useCallback(async () => {
    try {
      return await offlineStorageService.getCacheStats();
    } catch (error) {
      console.error("Failed to get cache stats:", error);
      return { size: 0, oldestItem: 0, newestItem: 0 };
    }
  }, []);

  // Monitor network status
  useEffect(() => {
    const unsubscribe = networkService.addListener((status) => {
      setIsOnline(status.isOnline);

      // Auto-sync when coming back online
      if (status.isOnline && pendingItems.length > 0) {
        syncNow();
      }
    });

    return unsubscribe;
  }, [pendingItems.length, syncNow]);

  // Load sync queue on mount
  useEffect(() => {
    loadSyncQueue();
  }, [loadSyncQueue]);

  // Auto-sync periodically when online
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(() => {
      if (pendingItems.length > 0 && !isSyncing) {
        syncNow();
      }
    }, 30000); // Sync every 30 seconds

    return () => clearInterval(interval);
  }, [isOnline, pendingItems.length, isSyncing, syncNow]);

  return {
    isOnline,
    pendingItems,
    isSyncing,
    syncProgress,
    addToSyncQueue,
    syncNow,
    retryFailedItems,
    clearCompletedItems,
    getCacheStats,
  };
};

export default useOfflineSync;
