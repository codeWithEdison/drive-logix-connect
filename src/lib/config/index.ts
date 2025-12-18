// ===========================================
// ENVIRONMENT CONFIGURATION
// ===========================================

interface AppConfig {
  api: {
    baseUrl: string;
    version: string;
    timeout: number;
  };
  app: {
    name: string;
    version: string;
    environment: string;
  };
  features: {
    enableDevtools: boolean;
    enableAnalytics: boolean;
    enableNotifications: boolean;
    enableTracking: boolean;
  };
  storage: {
    tokenKey: string;
    refreshTokenKey: string;
    languageKey: string;
    themeKey: string;
  };
}

const getConfig = (): AppConfig => {
  const isDevelopment = import.meta.env.MODE === "development";
  const isProduction = import.meta.env.MODE === "production";
  const isNativeBuild = import.meta.env.MODE === "native";

  return {
    api: {
      baseUrl:
        import.meta.env.VITE_API_BASE_URL ||
        (isNativeBuild
          ? "https://api.lovewaylogistics.com"
          : "http://localhost:3000"),
      version: import.meta.env.VITE_API_VERSION || "v1",
      timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || "30000"),
    },
    app: {
      name: import.meta.env.VITE_APP_NAME || "Loveway Logistics",
      version: import.meta.env.VITE_APP_VERSION || "1.0.0",
      environment: import.meta.env.MODE || "development",
    },
    features: {
      enableDevtools:
        isDevelopment || import.meta.env.VITE_ENABLE_DEVTOOLS === "true",
      enableAnalytics:
        isProduction || import.meta.env.VITE_ENABLE_ANALYTICS === "true",
      enableNotifications:
        import.meta.env.VITE_ENABLE_NOTIFICATIONS !== "false",
      enableTracking: import.meta.env.VITE_ENABLE_TRACKING !== "false",
    },
    storage: {
      tokenKey: "access_token",
      refreshTokenKey: "refresh_token",
      languageKey: "preferred_language",
      themeKey: "preferred_theme",
    },
  };
};

export const config = getConfig();

// Environment validation
export const validateEnvironment = (): void => {
  const requiredEnvVars = ["VITE_API_BASE_URL"];

  const missingVars = requiredEnvVars.filter(
    (varName) => !import.meta.env[varName]
  );

  if (missingVars.length > 0) {
    console.warn(
      `Missing environment variables: ${missingVars.join(
        ", "
      )}. Using defaults.`
    );
  }
};

// Export individual config sections for convenience
export const apiConfig = config.api;
export const appConfig = config.app;
export const featureConfig = config.features;
export const storageConfig = config.storage;

export default config;
