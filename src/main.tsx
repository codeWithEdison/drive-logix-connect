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

// Initialize services
const initializeServices = async () => {
  try {
    // Initialize offline storage first
    await offlineStorageService.initialize();

    // Initialize device service
    await deviceService.initialize();

    // Initialize network monitoring
    await networkService.initialize();

    // Initialize app state management
    await appStateService.initialize();

    // Initialize push notifications
    await pushNotificationService.initialize();

    console.log("All Capacitor services initialized successfully");
  } catch (error) {
    console.error("Failed to initialize some services:", error);
  }
};

// Initialize Google Maps services during app startup
// This happens in the background and doesn't block the app from rendering
googleMapsInitService.initialize().catch((error) => {
  console.warn("Google Maps initialization failed during startup:", error);
  // App continues to work with fallback behavior
});

// Initialize Capacitor services
if (Capacitor.isNativePlatform()) {
  initializeServices().catch((error) => {
    console.error("Capacitor services initialization failed:", error);
  });
}

// Force rebuild to clear cache issues
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
