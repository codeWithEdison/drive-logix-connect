import { Capacitor } from "@capacitor/core";
import { Device } from "@capacitor/device";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { Share } from "@capacitor/share";

export interface DeviceInfo {
  platform: string;
  model: string;
  osVersion: string;
  appVersion: string;
  isVirtual: boolean;
  manufacturer: string;
  webViewVersion: string;
  language: string;
  timezone: string;
}

export interface HapticOptions {
  style?: ImpactStyle;
  duration?: number;
}

class DeviceService {
  private deviceInfo: DeviceInfo | null = null;

  /**
   * Initialize device service
   */
  async initialize(): Promise<void> {
    try {
      await this.loadDeviceInfo();
      await this.configureStatusBar();
      await this.configureSplashScreen();
    } catch (error) {
      console.error("Device service initialization failed:", error);
    }
  }

  /**
   * Load device information
   */
  private async loadDeviceInfo(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        const info = await Device.getInfo();
        this.deviceInfo = {
          platform: info.platform,
          model: info.model,
          osVersion: info.osVersion,
          appVersion: "1.0.0", // Default app version
          isVirtual: info.isVirtual,
          manufacturer: info.manufacturer,
          webViewVersion: info.webViewVersion,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
      } else {
        this.deviceInfo = {
          platform: "web",
          model: navigator.userAgent,
          osVersion: navigator.platform,
          appVersion: "1.0.0",
          isVirtual: false,
          manufacturer: "Unknown",
          webViewVersion: "Unknown",
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
      }
    } catch (error) {
      console.error("Failed to load device info:", error);
    }
  }

  /**
   * Get device information
   */
  getDeviceInfo(): DeviceInfo | null {
    return this.deviceInfo;
  }

  /**
   * Get device model
   */
  getDeviceModel(): string {
    return this.deviceInfo?.model || "Unknown Device";
  }

  /**
   * Get platform
   */
  getPlatform(): string {
    return this.deviceInfo?.platform || "web";
  }

  /**
   * Get OS version
   */
  getOSVersion(): string {
    return this.deviceInfo?.osVersion || "Unknown";
  }

  /**
   * Get app version
   */
  getAppVersion(): string {
    return this.deviceInfo?.appVersion || "1.0.0";
  }

  /**
   * Check if device is virtual/emulator
   */
  isVirtual(): boolean {
    return this.deviceInfo?.isVirtual || false;
  }

  /**
   * Get device language
   */
  getLanguage(): string {
    return this.deviceInfo?.language || "en";
  }

  /**
   * Get device timezone
   */
  getTimezone(): string {
    return this.deviceInfo?.timezone || "UTC";
  }

  /**
   * Configure status bar
   */
  private async configureStatusBar(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: "#F9FAFE" });
    } catch (error) {
      console.error("Failed to configure status bar:", error);
    }
  }

  /**
   * Configure splash screen
   */
  private async configureSplashScreen(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await SplashScreen.hide();
    } catch (error) {
      console.error("Failed to configure splash screen:", error);
    }
  }

  /**
   * Show splash screen
   */
  async showSplashScreen(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await SplashScreen.show();
    } catch (error) {
      console.error("Failed to show splash screen:", error);
    }
  }

  /**
   * Hide splash screen
   */
  async hideSplashScreen(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await SplashScreen.hide();
    } catch (error) {
      console.error("Failed to hide splash screen:", error);
    }
  }

  /**
   * Set status bar style
   */
  async setStatusBarStyle(style: "light" | "dark"): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await StatusBar.setStyle({
        style: style === "light" ? Style.Light : Style.Dark,
      });
    } catch (error) {
      console.error("Failed to set status bar style:", error);
    }
  }

  /**
   * Set status bar background color
   */
  async setStatusBarColor(color: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await StatusBar.setBackgroundColor({ color });
    } catch (error) {
      console.error("Failed to set status bar color:", error);
    }
  }

  /**
   * Trigger haptic feedback
   */
  async triggerHaptic(options: HapticOptions = {}): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await Haptics.impact({
        style: options.style || ImpactStyle.Medium,
      });
    } catch (error) {
      console.error("Failed to trigger haptic:", error);
    }
  }

  /**
   * Trigger light haptic feedback
   */
  async triggerLightHaptic(): Promise<void> {
    await this.triggerHaptic({ style: ImpactStyle.Light });
  }

  /**
   * Trigger medium haptic feedback
   */
  async triggerMediumHaptic(): Promise<void> {
    await this.triggerHaptic({ style: ImpactStyle.Medium });
  }

  /**
   * Trigger heavy haptic feedback
   */
  async triggerHeavyHaptic(): Promise<void> {
    await this.triggerHaptic({ style: ImpactStyle.Heavy });
  }

  /**
   * Trigger selection haptic feedback
   */
  async triggerSelectionHaptic(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await Haptics.selectionStart();
    } catch (error) {
      console.error("Failed to trigger selection haptic:", error);
    }
  }

  /**
   * Stop selection haptic feedback
   */
  async stopSelectionHaptic(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await Haptics.selectionChanged();
    } catch (error) {
      console.error("Failed to stop selection haptic:", error);
    }
  }

  /**
   * Trigger notification haptic feedback
   */
  async triggerNotificationHaptic(
    type: "success" | "warning" | "error"
  ): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await Haptics.notification({
        type:
          type === "success"
            ? NotificationType.Success
            : type === "warning"
            ? NotificationType.Warning
            : NotificationType.Error,
      });
    } catch (error) {
      console.error("Failed to trigger notification haptic:", error);
    }
  }

  /**
   * Share content
   */
  async shareContent(options: {
    title: string;
    text: string;
    url?: string;
    dialogTitle?: string;
  }): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      // Fallback to Web Share API
      if (navigator.share) {
        try {
          await navigator.share(options);
          return true;
        } catch (error) {
          console.error("Web share failed:", error);
          return false;
        }
      } else {
        // Fallback to clipboard
        try {
          await navigator.clipboard.writeText(
            `${options.title}\n${options.text}\n${options.url || ""}`
          );
          return true;
        } catch (error) {
          console.error("Clipboard write failed:", error);
          return false;
        }
      }
    }

    try {
      await Share.share(options);
      return true;
    } catch (error) {
      console.error("Native share failed:", error);
      return false;
    }
  }

  /**
   * Share tracking link
   */
  async shareTrackingLink(
    trackingNumber: string,
    cargoId: string
  ): Promise<boolean> {
    const url = `${window.location.origin}/tracking?cargoId=${cargoId}`;

    return await this.shareContent({
      title: "Track Your Cargo",
      text: `Track your cargo with number: ${trackingNumber}`,
      url,
      dialogTitle: "Share Tracking Link",
    });
  }

  /**
   * Share app
   */
  async shareApp(): Promise<boolean> {
    return await this.shareContent({
      title: "Loveway Logistics",
      text: "Download Loveway Logistics app for easy cargo tracking and logistics management.",
      url: "https://play.google.com/store/apps/details?id=com.lovelycargo.app",
      dialogTitle: "Share Loveway Logistics",
    });
  }

  /**
   * Get device capabilities
   */
  getDeviceCapabilities(): {
    hasCamera: boolean;
    hasGPS: boolean;
    hasHaptics: boolean;
    hasShare: boolean;
    hasNotifications: boolean;
  } {
    return {
      hasCamera: Capacitor.isNativePlatform() || "mediaDevices" in navigator,
      hasGPS: Capacitor.isNativePlatform() || "geolocation" in navigator,
      hasHaptics: Capacitor.isNativePlatform(),
      hasShare: Capacitor.isNativePlatform() || "share" in navigator,
      hasNotifications: "Notification" in window,
    };
  }

  /**
   * Check if device is mobile
   */
  isMobile(): boolean {
    if (Capacitor.isNativePlatform()) {
      return (
        this.deviceInfo?.platform === "android" ||
        this.deviceInfo?.platform === "ios"
      );
    }

    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  /**
   * Check if device is tablet
   */
  isTablet(): boolean {
    if (Capacitor.isNativePlatform()) {
      return (
        this.deviceInfo?.platform === "ios" &&
        this.deviceInfo?.model.includes("iPad")
      );
    }

    return (
      /iPad|Android/i.test(navigator.userAgent) && window.innerWidth >= 768
    );
  }

  /**
   * Get screen orientation
   */
  getScreenOrientation(): "portrait" | "landscape" {
    return window.innerHeight > window.innerWidth ? "portrait" : "landscape";
  }

  /**
   * Get screen dimensions
   */
  getScreenDimensions(): { width: number; height: number } {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }
}

export const deviceService = new DeviceService();
export default deviceService;
