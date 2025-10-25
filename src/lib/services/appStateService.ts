import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { storage } from "./secureStorage";
import { pushNotificationService } from "./pushNotificationService";
import { offlineStorageService } from "./offlineStorage";

export interface AppState {
  isActive: boolean;
  isInBackground: boolean;
  lastActiveTime: number;
  sessionStartTime: number;
}

export interface AppStateCallbacks {
  onAppResume?: () => void;
  onAppPause?: () => void;
  onAppBackground?: () => void;
  onAppForeground?: () => void;
  onAppStateChange?: (state: AppState) => void;
}

class AppStateService {
  private state: AppState = {
    isActive: true,
    isInBackground: false,
    lastActiveTime: Date.now(),
    sessionStartTime: Date.now(),
  };

  private callbacks: AppStateCallbacks = {};
  private backgroundTimer: NodeJS.Timeout | null = null;
  private sessionTimeout: NodeJS.Timeout | null = null;
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly BACKGROUND_TIMEOUT = 5 * 60 * 1000; // 5 minutes

  /**
   * Initialize app state monitoring
   */
  async initialize(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        await this.initializeNative();
      } else {
        await this.initializeWeb();
      }

      // Set up session timeout
      this.setupSessionTimeout();
    } catch (error) {
      console.error("App state service initialization failed:", error);
    }
  }

  /**
   * Initialize native app state monitoring
   */
  private async initializeNative(): Promise<void> {
    // Listen for app state changes
    App.addListener("appStateChange", ({ isActive }) => {
      this.handleStateChange(isActive);
    });

    // Listen for app resume
    App.addListener("resume", () => {
      this.handleAppResume();
    });

    // Listen for app pause
    App.addListener("pause", () => {
      this.handleAppPause();
    });

    // Listen for back button (Android)
    App.addListener("backButton", () => {
      this.handleBackButton();
    });
  }

  /**
   * Initialize web app state monitoring
   */
  private initializeWeb(): void {
    // Listen for visibility changes
    document.addEventListener("visibilitychange", () => {
      const isActive = !document.hidden;
      this.handleStateChange(isActive);
    });

    // Listen for focus/blur events
    window.addEventListener("focus", () => {
      this.handleAppResume();
    });

    window.addEventListener("blur", () => {
      this.handleAppPause();
    });

    // Listen for beforeunload
    window.addEventListener("beforeunload", () => {
      this.handleAppBackground();
    });
  }

  /**
   * Handle app state change
   */
  private handleStateChange(isActive: boolean): void {
    const wasActive = this.state.isActive;
    this.state.isActive = isActive;
    this.state.lastActiveTime = Date.now();

    if (isActive && !wasActive) {
      this.handleAppForeground();
    } else if (!isActive && wasActive) {
      this.handleAppBackground();
    }

    this.callbacks.onAppStateChange?.(this.state);
  }

  /**
   * Handle app resume
   */
  private handleAppResume(): void {
    this.state.isActive = true;
    this.state.isInBackground = false;
    this.state.lastActiveTime = Date.now();

    // Clear background timer
    if (this.backgroundTimer) {
      clearTimeout(this.backgroundTimer);
      this.backgroundTimer = null;
    }

    // Refresh data
    this.refreshAppData();

    this.callbacks.onAppResume?.();
  }

  /**
   * Handle app pause
   */
  private handleAppPause(): void {
    this.state.isActive = false;
    this.state.lastActiveTime = Date.now();

    // Set background timer
    this.backgroundTimer = setTimeout(() => {
      this.state.isInBackground = true;
    }, this.BACKGROUND_TIMEOUT);

    this.callbacks.onAppPause?.();
  }

  /**
   * Handle app foreground
   */
  private handleAppForeground(): void {
    this.state.isInBackground = false;
    this.refreshAppData();
    this.callbacks.onAppForeground?.();
  }

  /**
   * Handle app background
   */
  private handleAppBackground(): void {
    this.state.isInBackground = true;

    // Save current state
    this.saveAppState();

    this.callbacks.onAppBackground?.();
  }

  /**
   * Handle back button (Android)
   */
  private handleBackButton(): void {
    // You can customize back button behavior here
    // For example, prevent default back behavior in certain screens
    console.log("Back button pressed");
  }

  /**
   * Refresh app data when coming to foreground
   */
  private async refreshAppData(): Promise<void> {
    try {
      // Check if user is still authenticated
      const token = await storage.getItem("access_token");
      if (!token) {
        // User session expired, redirect to login
        window.location.href = "/login";
        return;
      }

      // Sync offline data
      const syncQueue = await offlineStorageService.getSyncQueue();
      if (syncQueue.length > 0) {
        // Trigger sync
        console.log("Syncing offline data...");
      }

      // Refresh push notification token if needed
      await pushNotificationService.initialize();
    } catch (error) {
      console.error("Failed to refresh app data:", error);
    }
  }

  /**
   * Save app state
   */
  private async saveAppState(): Promise<void> {
    try {
      await storage.setObject("app_state", {
        lastActiveTime: this.state.lastActiveTime,
        sessionStartTime: this.state.sessionStartTime,
      });
    } catch (error) {
      console.error("Failed to save app state:", error);
    }
  }

  /**
   * Load app state
   */
  private async loadAppState(): Promise<void> {
    try {
      const savedState = await storage.getObject<{
        lastActiveTime: number;
        sessionStartTime: number;
      }>("app_state");

      if (savedState) {
        this.state.lastActiveTime = savedState.lastActiveTime;
        this.state.sessionStartTime = savedState.sessionStartTime;
      }
    } catch (error) {
      console.error("Failed to load app state:", error);
    }
  }

  /**
   * Setup session timeout
   */
  private setupSessionTimeout(): void {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
    }

    this.sessionTimeout = setTimeout(() => {
      this.handleSessionTimeout();
    }, this.SESSION_TIMEOUT);
  }

  /**
   * Handle session timeout
   */
  private handleSessionTimeout(): void {
    console.log("Session timeout reached");

    // Clear user session
    storage.removeItem("access_token");
    storage.removeItem("refresh_token");
    storage.removeItem("logistics_user");

    // Redirect to login
    window.location.href = "/login";
  }

  /**
   * Reset session timeout
   */
  resetSessionTimeout(): void {
    this.setupSessionTimeout();
  }

  /**
   * Get current app state
   */
  getState(): AppState {
    return { ...this.state };
  }

  /**
   * Check if app is active
   */
  isActive(): boolean {
    return this.state.isActive;
  }

  /**
   * Check if app is in background
   */
  isInBackground(): boolean {
    return this.state.isInBackground;
  }

  /**
   * Get session duration
   */
  getSessionDuration(): number {
    return Date.now() - this.state.sessionStartTime;
  }

  /**
   * Get time since last active
   */
  getTimeSinceLastActive(): number {
    return Date.now() - this.state.lastActiveTime;
  }

  /**
   * Add app state callback
   */
  addCallback(callbacks: AppStateCallbacks): () => void {
    this.callbacks = { ...this.callbacks, ...callbacks };

    // Return unsubscribe function
    return () => {
      Object.keys(callbacks).forEach((key) => {
        delete this.callbacks[key as keyof AppStateCallbacks];
      });
    };
  }

  /**
   * Check if session is about to expire
   */
  isSessionAboutToExpire(): boolean {
    const timeSinceLastActive = this.getTimeSinceLastActive();
    return timeSinceLastActive > this.SESSION_TIMEOUT - 5 * 60 * 1000; // 5 minutes before timeout
  }

  /**
   * Extend session
   */
  extendSession(): void {
    this.state.lastActiveTime = Date.now();
    this.setupSessionTimeout();
  }

  /**
   * Clear session
   */
  clearSession(): void {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
      this.sessionTimeout = null;
    }

    if (this.backgroundTimer) {
      clearTimeout(this.backgroundTimer);
      this.backgroundTimer = null;
    }
  }
}

export const appStateService = new AppStateService();
export default appStateService;
