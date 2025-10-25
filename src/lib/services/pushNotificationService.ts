import {
  PushNotifications,
  Token,
  ActionPerformed,
  PushNotificationSchema,
} from "@capacitor/push-notifications";
import { Capacitor } from "@capacitor/core";
import { storage } from "./secureStorage";
import {
  initializeFirebase,
  getFirebaseMessaging,
  VAPID_KEY,
} from "../config/firebase";
import { getToken, onMessage } from "firebase/messaging";
import axiosInstance from "../api/axios";

export interface NotificationData {
  cargoId?: string;
  deliveryId?: string;
  type: "cargo_update" | "delivery_alert" | "payment_status" | "general";
  action?: string;
}

export interface DeviceInfo {
  token: string;
  platform: "android" | "ios" | "web";
  deviceInfo: {
    model: string;
    osVersion: string;
    appVersion: string;
  };
}

class PushNotificationService {
  private isInitialized = false;
  private fcmToken: string | null = null;

  /**
   * Initialize push notifications
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      if (Capacitor.isNativePlatform()) {
        await this.initializeNative();
      } else {
        await this.initializeWeb();
      }

      this.isInitialized = true;
    } catch (error) {
      console.error("Push notification initialization error:", error);
    }
  }

  /**
   * Initialize native push notifications
   */
  private async initializeNative(): Promise<void> {
    // Request permissions
    const permStatus = await PushNotifications.requestPermissions();

    if (permStatus.receive === "granted") {
      // Register with Apple / Google to receive push via APNS/FCM
      await PushNotifications.register();

      // Listen for registration
      PushNotifications.addListener("registration", (token: Token) => {
        console.log("Push registration success, token: " + token.value);
        this.fcmToken = token.value;
        this.registerDeviceWithBackend();
      });

      // Listen for registration errors
      PushNotifications.addListener("registrationError", (error: any) => {
        console.error("Error on registration: " + JSON.stringify(error));
      });

      // Listen for push notifications received
      PushNotifications.addListener(
        "pushNotificationReceived",
        (notification: PushNotificationSchema) => {
          console.log("Push notification received: ", notification);
          this.handleNotificationReceived(notification);
        }
      );

      // Listen for push notification actions
      PushNotifications.addListener(
        "pushNotificationActionPerformed",
        (notification: ActionPerformed) => {
          console.log("Push notification action performed", notification);
          this.handleNotificationAction(notification);
        }
      );
    } else {
      console.log("Push notification permissions not granted");
    }
  }

  /**
   * Initialize web push notifications
   */
  private async initializeWeb(): Promise<void> {
    try {
      const { messaging } = initializeFirebase();
      if (!messaging) return;

      // Request permission and get token
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
        });

        if (token) {
          this.fcmToken = token;
          this.registerDeviceWithBackend();
        }

        // Listen for foreground messages
        onMessage(messaging, (payload) => {
          console.log("Message received in foreground:", payload);
          this.handleWebNotification(payload);
        });
      }
    } catch (error) {
      console.error("Web push initialization error:", error);
    }
  }

  /**
   * Register device with backend
   */
  private async registerDeviceWithBackend(): Promise<void> {
    if (!this.fcmToken) return;

    try {
      const deviceInfo: DeviceInfo = {
        token: this.fcmToken,
        platform: Capacitor.isNativePlatform() ? "android" : "web",
        deviceInfo: {
          model: await this.getDeviceModel(),
          osVersion: await this.getOSVersion(),
          appVersion: await this.getAppVersion(),
        },
      };

      // Store device info locally
      await storage.setObject("device_info", deviceInfo);

      // Register with backend using axios
      const response = await axiosInstance.post(
        "/mobile/device/register",
        deviceInfo
      );

      if (response.data.success) {
        console.log("Device registered successfully");
      } else {
        console.error("Device registration failed:", response.data.error);
      }
    } catch (error) {
      console.error("Device registration error:", error);
    }
  }

  /**
   * Handle notification received
   */
  private handleNotificationReceived(
    notification: PushNotificationSchema
  ): void {
    // Show in-app notification or update UI
    console.log("Handling notification:", notification);

    // You can emit events or update state here
    // For example, update notification count, show toast, etc.
  }

  /**
   * Handle notification action (tap)
   */
  private handleNotificationAction(notification: ActionPerformed): void {
    const data = notification.notification.data as NotificationData;

    if (data?.cargoId) {
      // Navigate to cargo details
      window.location.href = `/tracking?cargoId=${data.cargoId}`;
    } else if (data?.deliveryId) {
      // Navigate to delivery details
      window.location.href = `/driver/deliveries?deliveryId=${data.deliveryId}`;
    }
  }

  /**
   * Handle web notification
   */
  private handleWebNotification(payload: any): void {
    // Show browser notification
    if (Notification.permission === "granted") {
      new Notification(payload.notification?.title || "Lovely Cargo", {
        body: payload.notification?.body,
        icon: "/logo.png",
        tag: payload.data?.cargoId || "general",
      });
    }
  }

  /**
   * Unregister device
   */
  async unregisterDevice(): Promise<void> {
    try {
      const deviceInfo = await storage.getObject<DeviceInfo>("device_info");

      if (deviceInfo?.token) {
        await axiosInstance.delete("/mobile/device/unregister", {
          data: { token: deviceInfo.token },
        });
      }

      // Clear local device info
      await storage.removeItem("device_info");
      this.fcmToken = null;
    } catch (error) {
      console.error("Device unregistration error:", error);
    }
  }

  /**
   * Get device model
   */
  private async getDeviceModel(): Promise<string> {
    if (Capacitor.isNativePlatform()) {
      // Use Capacitor Device plugin when available
      return "Android Device";
    }
    return navigator.userAgent;
  }

  /**
   * Get OS version
   */
  private async getOSVersion(): Promise<string> {
    if (Capacitor.isNativePlatform()) {
      return "Android";
    }
    return navigator.platform;
  }

  /**
   * Get app version
   */
  private async getAppVersion(): Promise<string> {
    return "1.0.0"; // You can get this from package.json or build config
  }

  /**
   * Check if notifications are enabled
   */
  async areNotificationsEnabled(): Promise<boolean> {
    if (Capacitor.isNativePlatform()) {
      const permStatus = await PushNotifications.checkPermissions();
      return permStatus.receive === "granted";
    } else {
      return Notification.permission === "granted";
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    if (Capacitor.isNativePlatform()) {
      const permStatus = await PushNotifications.requestPermissions();
      return permStatus.receive === "granted";
    } else {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
  }
}

export const pushNotificationService = new PushNotificationService();
export default pushNotificationService;
