import { useState, useEffect, useCallback } from "react";
import { offlineStorageService } from "@/lib/services/offlineStorage";
import { networkService } from "@/lib/services/networkService";
import { SyncService } from "@/lib/api/services/syncService";
import { SyncItem, SyncPushRequest } from "@/types/mobile";

export interface LocalSyncItem {
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
  pendingItems: LocalSyncItem[];
  isSyncing: boolean;
  syncProgress: number;
  lastSyncTime: string | null;
  addToSyncQueue: (
    entityType: string,
    action: "create" | "update" | "delete",
    payload: any
  ) => Promise<void>;
  syncNow: () => Promise<void>;
  pullServerChanges: () => Promise<void>;
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
  const [pendingItems, setPendingItems] = useState<LocalSyncItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

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

      // Convert local sync items to backend format
      const syncItems: SyncItem[] = pendingItems.map((item) => ({
        entityType: item.entityType,
        entityId: item.payload.id,
        action: item.action,
        payload: item.payload,
        timestamp: item.timestamp,
      }));

      // Push changes to backend using SyncService
      const response = await SyncService.pushChanges(syncItems);

      if (response.success) {
        const { queued_count, processed_count, conflicts } = response.data;

        // Handle conflicts
        if (conflicts.length > 0) {
          console.warn("Sync conflicts detected:", conflicts);
          // TODO: Implement conflict resolution UI
        }

        // Mark successfully processed items as completed
        let completed = 0;
        for (const item of pendingItems) {
          if (completed < processed_count) {
            await offlineStorageService.removeFromSyncQueue(item.id);
            completed++;
          } else {
            // Mark remaining items as failed
            await offlineStorageService.addToSyncQueue({
              ...item,
              status: "failed",
              retryCount: item.retryCount + 1,
              errorMessage: "Sync operation failed",
            });
          }
        }

        // Update last sync time
        setLastSyncTime(new Date().toISOString());
        setSyncProgress(100);
      } else {
        // Mark all items as failed
        for (const item of pendingItems) {
          await offlineStorageService.addToSyncQueue({
            ...item,
            status: "failed",
            retryCount: item.retryCount + 1,
            errorMessage: "Sync operation failed",
          });
        }
      }

      // Reload sync queue
      await loadSyncQueue();
    } catch (error) {
      console.error("Sync operation failed:", error);

      // Mark all items as failed
      const items = await offlineStorageService.getSyncQueue();
      const pendingItems = items.filter(
        (item) => item.status === "pending" || item.status === "processing"
      );

      for (const item of pendingItems) {
        await offlineStorageService.addToSyncQueue({
          ...item,
          status: "failed",
          retryCount: item.retryCount + 1,
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
        });
      }

      await loadSyncQueue();
    } finally {
      setIsSyncing(false);
      setSyncProgress(0);
    }
  }, [isSyncing, isOnline, loadSyncQueue]);

  const pullServerChanges = useCallback(async () => {
    if (isSyncing || !isOnline) return;

    setIsSyncing(true);

    try {
      // Pull changes from server
      const response = await SyncService.pullChanges(lastSyncTime || undefined);

      if (response.success) {
        const { changes } = response.data;

        // Process server changes
        for (const change of changes) {
          try {
            // Apply server changes to local storage
            await offlineStorageService.setItem(
              `${change.entity_type}_${change.entity_id}`,
              JSON.stringify({
                ...change.payload,
                _serverUpdated: true,
                _serverTimestamp: change.created_at,
              })
            );

            console.log(
              `Applied server change: ${change.entity_type} ${change.action}`
            );
          } catch (error) {
            console.error(`Failed to apply server change:`, error);
          }
        }

        // Update last sync time
        setLastSyncTime(response.data.last_sync);
      }
    } catch (error) {
      console.error("Failed to pull server changes:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, isOnline, lastSyncTime]);

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
    lastSyncTime,
    addToSyncQueue,
    syncNow,
    pullServerChanges,
    retryFailedItems,
    clearCompletedItems,
    getCacheStats,
  };
};

export default useOfflineSync;
