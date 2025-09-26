// Google Maps initialization service for app startup
import { googleMapsService } from "./googleMapsService";

class GoogleMapsInitService {
  private initPromise: Promise<void> | null = null;
  private isInitialized: boolean = false;
  private initError: Error | null = null;

  /**
   * Initialize Google Maps services during app startup
   * This should be called once when the app starts
   */
  async initialize(): Promise<void> {
    // Return existing promise if already initializing
    if (this.initPromise) {
      return this.initPromise;
    }

    // Return immediately if already initialized
    if (this.isInitialized) {
      return;
    }

    // Create initialization promise
    this.initPromise = this.performInitialization();
    return this.initPromise;
  }

  private async performInitialization(): Promise<void> {
    try {
      console.log(
        "🚀 Starting Google Maps initialization during app startup..."
      );

      // Trigger the Google Maps service initialization
      // This will load the script and initialize all services
      await googleMapsService.searchPlaces("test"); // This triggers initialization

      this.isInitialized = true;
      this.initError = null;
      console.log(
        "✅ Google Maps services initialized successfully during startup"
      );
    } catch (error) {
      this.initError = error as Error;
      console.warn(
        "⚠️ Google Maps initialization failed during startup:",
        error
      );
      // Don't throw - let the app continue with fallback behavior
    }
  }

  /**
   * Check if Google Maps is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get initialization error if any
   */
  getError(): Error | null {
    return this.initError;
  }

  /**
   * Wait for initialization to complete
   * Returns immediately if already initialized
   */
  async waitForInit(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    // If not started, start initialization now
    return this.initialize();
  }

  /**
   * Reset initialization state (useful for testing)
   */
  reset(): void {
    this.initPromise = null;
    this.isInitialized = false;
    this.initError = null;
  }
}

// Export singleton instance
export const googleMapsInitService = new GoogleMapsInitService();

// React hook for components to check initialization status
export const useGoogleMapsInit = () => {
  const [isReady, setIsReady] = React.useState(googleMapsInitService.isReady());
  const [error, setError] = React.useState(googleMapsInitService.getError());

  React.useEffect(() => {
    const checkStatus = () => {
      setIsReady(googleMapsInitService.isReady());
      setError(googleMapsInitService.getError());
    };

    // Check initial status
    checkStatus();

    // If not ready, wait for initialization
    if (!isReady) {
      googleMapsInitService.waitForInit().then(() => {
        checkStatus();
      });
    }
  }, [isReady]);

  return {
    isReady,
    error,
    waitForInit: () => googleMapsInitService.waitForInit(),
  };
};

// Import React for the hook
import React from "react";
