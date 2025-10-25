import { useState, useEffect, useCallback } from "react";
import { pushNotificationService } from "@/lib/services/pushNotificationService";
import { Capacitor } from "@capacitor/core";

export interface NotificationPermission {
  granted: boolean;
  canRequest: boolean;
  status: "granted" | "denied" | "prompt";
}

export interface PushNotificationHook {
  isInitialized: boolean;
  permission: NotificationPermission;
  requestPermission: () => Promise<boolean>;
  initialize: () => Promise<void>;
  unregister: () => Promise<void>;
}

/**
 * Hook for managing push notifications
 */
export const usePushNotifications = (): PushNotificationHook => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    canRequest: false,
    status: "prompt",
  });

  const initialize = useCallback(async () => {
    try {
      await pushNotificationService.initialize();
      setIsInitialized(true);

      // Check current permission status
      const isEnabled = await pushNotificationService.areNotificationsEnabled();
      setPermission({
        granted: isEnabled,
        canRequest: !isEnabled,
        status: isEnabled ? "granted" : "denied",
      });
    } catch (error) {
      console.error("Failed to initialize push notifications:", error);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const granted = await pushNotificationService.requestPermissions();
      setPermission({
        granted,
        canRequest: !granted,
        status: granted ? "granted" : "denied",
      });
      return granted;
    } catch (error) {
      console.error("Failed to request notification permission:", error);
      return false;
    }
  }, []);

  const unregister = useCallback(async () => {
    try {
      await pushNotificationService.unregisterDevice();
      setPermission({
        granted: false,
        canRequest: true,
        status: "denied",
      });
    } catch (error) {
      console.error("Failed to unregister device:", error);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    isInitialized,
    permission,
    requestPermission,
    initialize,
    unregister,
  };
};

export default usePushNotifications;
