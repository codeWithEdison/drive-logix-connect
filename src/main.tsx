import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./lib/i18n"; // Initialize i18n
import { googleMapsInitService } from "./lib/services/googleMapsInitService";
import { Capacitor } from "@capacitor/core";

// Initialize Capacitor services
import { offlineStorageService } from "./lib/services/offlineStorage";
import { pushNotificationService } from "./lib/services/pushNotificationService";
import { networkService } from "./lib/services/networkService";
import { appStateService } from "./lib/services/appStateService";
import { deviceService } from "./lib/services/deviceService";
import { AppConfigService } from "./lib/api/services/appConfigService";

// Initialize services with error handling
const initializeServices = async () => {
  try {
    // Initialize app configuration first
    console.log("Initializing app configuration...");
    try {
    await AppConfigService.initialize();
    console.log("App configuration initialized successfully");
    } catch (error) {
      console.warn("App configuration initialization failed, continuing:", error);
    }

    // Initialize offline storage
    try {
    await offlineStorageService.initialize();
    } catch (error) {
      console.warn("Offline storage initialization failed, continuing:", error);
    }

    // Initialize device service
    try {
    await deviceService.initialize();
    } catch (error) {
      console.warn("Device service initialization failed, continuing:", error);
    }

    // Initialize network monitoring
    try {
    await networkService.initialize();
    } catch (error) {
      console.warn("Network service initialization failed, continuing:", error);
    }

    // Initialize app state management
    try {
    await appStateService.initialize();
    } catch (error) {
      console.warn("App state service initialization failed, continuing:", error);
    }

    // Initialize push notifications
    try {
    await pushNotificationService.initialize();
    } catch (error) {
      console.warn("Push notification service initialization failed, continuing:", error);
    }

    console.log("Capacitor services initialization completed");
  } catch (error) {
    console.error("Critical error during service initialization:", error);
    // App should still be able to render even if services fail
  }
};

// Initialize Google Maps services during app startup
// This happens in the background and doesn't block the app from rendering
googleMapsInitService.initialize().catch((error) => {
  console.warn("Google Maps initialization failed during startup:", error);
  // App continues to work with fallback behavior
});

// Initialize app configuration for all platforms
const initializeAppConfig = async () => {
  try {
    console.log("Initializing app configuration...");
    await AppConfigService.initialize();
    console.log("App configuration initialized successfully");
  } catch (error) {
    console.error("App configuration initialization failed:", error);
  }
};

// Initialize Capacitor services
if (Capacitor.isNativePlatform()) {
  initializeServices().catch((error) => {
    console.error("Capacitor services initialization failed:", error);
  });
} else {
  // For web platform, only initialize app config
  initializeAppConfig().catch((error) => {
    console.error("App config initialization failed:", error);
  });
}

// Force rebuild to clear cache issues
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
