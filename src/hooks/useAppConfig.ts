import { useState, useEffect, useCallback } from "react";
import { AppConfigService } from "@/lib/api/services/appConfigService";
import { AppConfig } from "@/types/mobile";

export interface UseAppConfigReturn {
  config: AppConfig | null;
  loading: boolean;
  error: string | null;
  refreshConfig: () => Promise<void>;
  isFeatureEnabled: (feature: keyof AppConfig["features"]) => boolean;
  getLimit: (limit: keyof AppConfig["limits"]) => number;
  isPaymentMethodEnabled: (
    method: keyof AppConfig["payment_methods"]
  ) => boolean;
  getSupportedLanguages: () => string[];
  getDefaultLanguage: () => string;
  getApiEndpoints: () => AppConfig["api_endpoints"];
  getAppInfo: () => AppConfig["app_info"];
}

/**
 * Hook for managing app configuration
 * Provides cached configuration with automatic refresh capabilities
 */
export const useAppConfig = (): UseAppConfigReturn => {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get config with fallback to cache
      const appConfig = await AppConfigService.getConfigWithFallback();
      setConfig(appConfig);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load app configuration";
      setError(errorMessage);
      console.error("App config loading error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Force refresh from backend
      const response = await AppConfigService.refreshConfig();
      setConfig(response.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to refresh app configuration";
      setError(errorMessage);
      console.error("App config refresh error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const isFeatureEnabled = useCallback(
    (feature: keyof AppConfig["features"]): boolean => {
      if (!config) return false;
      return config.features[feature];
    },
    [config]
  );

  const getLimit = useCallback(
    (limit: keyof AppConfig["limits"]): number => {
      if (!config) return 0;
      return config.limits[limit];
    },
    [config]
  );

  const isPaymentMethodEnabled = useCallback(
    (method: keyof AppConfig["payment_methods"]): boolean => {
      if (!config) return false;
      return config.payment_methods[method];
    },
    [config]
  );

  const getSupportedLanguages = useCallback((): string[] => {
    if (!config) return ["en"];
    return config.languages.supported;
  }, [config]);

  const getDefaultLanguage = useCallback((): string => {
    if (!config) return "en";
    return config.languages.default;
  }, [config]);

  const getApiEndpoints = useCallback((): AppConfig["api_endpoints"] => {
    if (!config) {
      return {
        base_url: "",
        websocket_url: "",
        upload_url: "",
      };
    }
    return config.api_endpoints;
  }, [config]);

  const getAppInfo = useCallback((): AppConfig["app_info"] => {
    if (!config) {
      return {
        name: "Loveway Logistics",
        version: "1.0.0",
        min_android_version: "1.0.0",
        min_ios_version: "1.0.0",
      };
    }
    return config.app_info;
  }, [config]);

  // Load config on mount
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Auto-refresh config periodically
  useEffect(() => {
    if (!config) return;

    const interval = setInterval(() => {
      // Check if cache is still valid
      AppConfigService.isCacheValid().then((isValid) => {
        if (!isValid) {
          refreshConfig();
        }
      });
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [config, refreshConfig]);

  return {
    config,
    loading,
    error,
    refreshConfig,
    isFeatureEnabled,
    getLimit,
    isPaymentMethodEnabled,
    getSupportedLanguages,
    getDefaultLanguage,
    getApiEndpoints,
    getAppInfo,
  };
};

export default useAppConfig;

