import axiosInstance from "../axios";
import { ApiResponse } from "../../types/shared";
import { AppConfig, AppConfigResponse } from "../../types/mobile";
import { storage } from "../../services/secureStorage";

/**
 * AppConfigService handles mobile app configuration fetching and caching
 * Provides feature flags, limits, and dynamic configuration
 */
class AppConfigService {
  private static baseUrl = "/app-config";
  private static cacheKey = "app_config";
  private static cacheExpiryKey = "app_config_expiry";
  private static cacheDuration = 60 * 60 * 1000; // 1 hour in milliseconds

  /**
   * Fetch configuration from backend
   */
  static async getConfig(): Promise<AppConfigResponse> {
    try {
      const response = await axiosInstance.get(AppConfigService.baseUrl);
      const configData = response.data;

      // Cache the configuration
      await AppConfigService.cacheConfig(configData.data);

      return configData;
    } catch (error: any) {
      throw AppConfigService.handleError(error);
    }
  }

  /**
   * Get cached configuration
   */
  static async getCachedConfig(): Promise<AppConfig | null> {
    try {
      const cached = await storage.getItem(AppConfigService.cacheKey);
      const expiry = await storage.getItem(AppConfigService.cacheExpiryKey);

      if (!cached || !expiry) {
        return null;
      }

      const expiryTime = parseInt(expiry, 10);
      const now = Date.now();

      if (now > expiryTime) {
        // Cache expired, remove it
        await AppConfigService.clearCache();
        return null;
      }

      return JSON.parse(cached);
    } catch (error) {
      console.error("Error getting cached config:", error);
      return null;
    }
  }

  /**
   * Force refresh configuration from backend
   */
  static async refreshConfig(): Promise<AppConfigResponse> {
    try {
      // Clear cache first
      await AppConfigService.clearCache();

      // Fetch fresh config
      return await AppConfigService.getConfig();
    } catch (error: any) {
      throw AppConfigService.handleError(error);
    }
  }

  /**
   * Get configuration with fallback to cache
   */
  static async getConfigWithFallback(): Promise<AppConfig> {
    try {
      // Try to get fresh config first
      const response = await AppConfigService.getConfig();
      return response.data;
    } catch (error) {
      console.warn("Failed to fetch fresh config, trying cache:", error);

      // Fallback to cached config
      const cached = await AppConfigService.getCachedConfig();
      if (cached) {
        return cached;
      }

      // If no cache available, throw the original error
      throw error;
    }
  }

  /**
   * Check if a feature is enabled
   */
  static async isFeatureEnabled(
    feature: keyof AppConfig["features"]
  ): Promise<boolean> {
    try {
      const config = await AppConfigService.getConfigWithFallback();
      return config.features[feature];
    } catch (error) {
      console.error(`Error checking feature ${feature}:`, error);
      return false; // Default to disabled if error
    }
  }

  /**
   * Get app limits
   */
  static async getLimit(limit: keyof AppConfig["limits"]): Promise<number> {
    try {
      const config = await AppConfigService.getConfigWithFallback();
      return config.limits[limit];
    } catch (error) {
      console.error(`Error getting limit ${limit}:`, error);
      return 0; // Default to 0 if error
    }
  }

  /**
   * Check if payment method is enabled
   */
  static async isPaymentMethodEnabled(
    method: keyof AppConfig["payment_methods"]
  ): Promise<boolean> {
    try {
      const config = await AppConfigService.getConfigWithFallback();
      return config.payment_methods[method];
    } catch (error) {
      console.error(`Error checking payment method ${method}:`, error);
      return false; // Default to disabled if error
    }
  }

  /**
   * Get supported languages
   */
  static async getSupportedLanguages(): Promise<string[]> {
    try {
      const config = await AppConfigService.getConfigWithFallback();
      return config.languages.supported;
    } catch (error) {
      console.error("Error getting supported languages:", error);
      return ["en"]; // Default to English
    }
  }

  /**
   * Get default language
   */
  static async getDefaultLanguage(): Promise<string> {
    try {
      const config = await AppConfigService.getConfigWithFallback();
      return config.languages.default;
    } catch (error) {
      console.error("Error getting default language:", error);
      return "en"; // Default to English
    }
  }

  /**
   * Get API endpoints
   */
  static async getApiEndpoints(): Promise<AppConfig["api_endpoints"]> {
    try {
      const config = await AppConfigService.getConfigWithFallback();
      return config.api_endpoints;
    } catch (error) {
      console.error("Error getting API endpoints:", error);
      return {
        base_url: "",
        websocket_url: "",
        upload_url: "",
      };
    }
  }

  /**
   * Get app info
   */
  static async getAppInfo(): Promise<AppConfig["app_info"]> {
    try {
      const config = await AppConfigService.getConfigWithFallback();
      return config.app_info;
    } catch (error) {
      console.error("Error getting app info:", error);
      return {
        name: "Lovely Cargo Platform",
        version: "1.0.0",
        min_android_version: "1.0.0",
        min_ios_version: "1.0.0",
      };
    }
  }

  /**
   * Cache configuration
   */
  private static async cacheConfig(config: AppConfig): Promise<void> {
    try {
      const expiry = Date.now() + AppConfigService.cacheDuration;

      await storage.setItem(AppConfigService.cacheKey, JSON.stringify(config));
      await storage.setItem(AppConfigService.cacheExpiryKey, expiry.toString());
    } catch (error) {
      console.error("Error caching config:", error);
    }
  }

  /**
   * Clear cached configuration
   */
  static async clearCache(): Promise<void> {
    try {
      await storage.removeItem(AppConfigService.cacheKey);
      await storage.removeItem(AppConfigService.cacheExpiryKey);
    } catch (error) {
      console.error("Error clearing config cache:", error);
    }
  }

  /**
   * Check if cache is valid
   */
  static async isCacheValid(): Promise<boolean> {
    try {
      const expiry = await storage.getItem(AppConfigService.cacheExpiryKey);
      if (!expiry) return false;

      const expiryTime = parseInt(expiry, 10);
      return Date.now() < expiryTime;
    } catch (error) {
      console.error("Error checking cache validity:", error);
      return false;
    }
  }

  /**
   * Initialize configuration on app startup
   */
  static async initialize(): Promise<AppConfig> {
    try {
      console.log("Initializing app configuration...");

      // Try to get config with fallback
      const config = await AppConfigService.getConfigWithFallback();

      console.log("App configuration initialized successfully");
      return config;
    } catch (error) {
      console.error("Failed to initialize app configuration:", error);
      throw error;
    }
  }

  /**
   * Handle API errors
   */
  private static handleError(error: any): Error {
    if (error.response?.data?.error) {
      const apiError = error.response.data.error;
      return new Error(`${apiError.code}: ${apiError.message}`);
    }

    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }

    if (error.message) {
      return new Error(error.message);
    }

    return new Error("Failed to fetch app configuration");
  }
}

export { AppConfigService };
export const appConfigService = new AppConfigService();


