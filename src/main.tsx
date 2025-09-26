import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./lib/i18n"; // Initialize i18n
import { googleMapsInitService } from "./lib/services/googleMapsInitService";

// Initialize Google Maps services during app startup
// This happens in the background and doesn't block the app from rendering
googleMapsInitService.initialize().catch((error) => {
  console.warn("Google Maps initialization failed during startup:", error);
  // App continues to work with fallback behavior
});

// Force rebuild to clear cache issues
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
