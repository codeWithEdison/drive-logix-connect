import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { ApiResponse, ApiError } from "../../types/shared";
import { storage } from "../services/secureStorage";

// Extend AxiosRequestConfig to include metadata
declare module "axios" {
  interface AxiosRequestConfig {
    metadata?: { startTime: number };
  }
}

// Base configuration
// Always use deployed backend everywhere unless explicitly overridden via environment variable
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.lovewaylogistics.com";
const API_VERSION = "v1";

// Avoid logging raw axios config/headers objects on mobile.
// Capacitor/Console may try to serialize them and can hit circular refs.
const safeStringify = (value: unknown): string => {
  try {
    const seen = new WeakSet<object>();
    return JSON.stringify(
      value,
      (_key, val) => {
        if (val instanceof Error) {
          return { name: val.name, message: val.message, stack: val.stack };
        }
        if (typeof val === "function") return "[Function]";
        if (typeof val === "object" && val !== null) {
          if (seen.has(val as object)) return "[Circular]";
          seen.add(val as object);
        }
        return val;
      },
      2
    );
  } catch {
    try {
      return String(value);
    } catch {
      return "[Unstringifiable]";
    }
  }
};

const headersToPlainObject = (headers: any): Record<string, unknown> => {
  try {
    if (!headers) return {};
    if (typeof headers.toJSON === "function") return headers.toJSON();
    return { ...(headers as any) };
  } catch {
    return {};
  }
};

// Request throttling
const requestQueue: Array<() => void> = [];
let isProcessingQueue = false;
const MAX_CONCURRENT_REQUESTS = 5;
let activeRequests = 0;

const processQueue = () => {
  if (isProcessingQueue || activeRequests >= MAX_CONCURRENT_REQUESTS) return;

  isProcessingQueue = true;
  while (requestQueue.length > 0 && activeRequests < MAX_CONCURRENT_REQUESTS) {
    const request = requestQueue.shift();
    if (request) {
      activeRequests++;
      request();
    }
  }
  isProcessingQueue = false;
};

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/${API_VERSION}`,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  // For mobile apps, we need to handle CORS differently
  // The backend should allow requests from mobile app origins
  withCredentials: false,
});

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    // Add auth token if available
    const token = await storage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add language header
    const language = (await storage.getItem("preferred_language")) || "en";
    config.headers["Accept-Language"] = language;

    // Add request timestamp for throttling
    config.metadata = { startTime: Date.now() };

    // Log API request
    const method = config.method?.toUpperCase() || "GET";
    const url = config.url || "";
    const fullUrl = `${config.baseURL}${url}`;
    const hasAuth = !!token;

    const headersPlain = headersToPlainObject(config.headers);
    const logPayload = {
      method,
      url: fullUrl,
      headers: {
        ...headersPlain,
        Authorization: hasAuth ? "Bearer ***" : "None",
      },
      hasAuth,
      params: config.params,
      data: config.data,
      timestamp: new Date().toISOString(),
    };

    console.log(`[API REQUEST] ${method} ${fullUrl} ${safeStringify(logPayload)}`);

    return config;
  },
  (error) => {
    console.error(`[API REQUEST ERROR] ${safeStringify(error)}`);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // Decrement active requests counter
    activeRequests = Math.max(0, activeRequests - 1);
    processQueue();

    // Store tokens if present
    if (response.data.data?.tokens) {
      const { accessToken, refreshToken } = response.data.data.tokens;
      if (accessToken) storage.setItem("access_token", accessToken);
      if (refreshToken) storage.setItem("refresh_token", refreshToken);
    }

    // Log API response
    const method = response.config.method?.toUpperCase() || "GET";
    const url = response.config.url || "";
    const fullUrl = `${response.config.baseURL}${url}`;
    const duration = response.config.metadata
      ? Date.now() - response.config.metadata.startTime
      : 0;

    const logPayload = {
      status: response.status,
      statusText: response.statusText,
      durationMs: duration,
      timestamp: new Date().toISOString(),
      // Keep response data, but stringify safely to avoid circulars
      data: response.data,
    };
    console.log(`[API RESPONSE] ${method} ${fullUrl} ${safeStringify(logPayload)}`);

    return response;
  },
  async (error) => {
    // Decrement active requests counter
    activeRequests = Math.max(0, activeRequests - 1);
    processQueue();

    const originalRequest = error.config;

    // Handle 429 errors (rate limiting)
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers["retry-after"] || 1;
      console.warn(`Rate limited. Retrying after ${retryAfter} seconds...`);

      // Wait and retry
      await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
      return axiosInstance(originalRequest);
    }

    // Handle 401 errors (token expired)
    // Skip token refresh for logout endpoint to prevent loops
    const isLogoutRequest = originalRequest?.url?.includes("/auth/logout");
    
    if (error.response?.status === 401 && !originalRequest._retry && !isLogoutRequest) {
      originalRequest._retry = true;

      const refreshToken = await storage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const response = await axiosInstance.post("/auth/refresh", {
            refresh_token: refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } =
            response.data.data;
          await storage.setItem("access_token", accessToken);
          await storage.setItem("refresh_token", newRefreshToken);

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          await storage.removeItem("access_token");
          await storage.removeItem("refresh_token");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        window.location.href = "/login";
      }
    }

    // Log API error
    const method = originalRequest?.method?.toUpperCase() || "GET";
    const url = originalRequest?.url || "";
    const fullUrl = originalRequest?.baseURL
      ? `${originalRequest.baseURL}${url}`
      : url;

    const logPayload = {
      status: error.response?.status || "NO_RESPONSE",
      statusText: error.response?.statusText || error.message,
      error: error.response?.data || error.message,
      config: {
        url: fullUrl,
        method,
        headers: headersToPlainObject(originalRequest?.headers),
      },
      timestamp: new Date().toISOString(),
    };
    console.error(`[API ERROR] ${method} ${fullUrl} ${safeStringify(logPayload)}`);

    // Transform error response to match our ApiError interface
    if (error.response?.data) {
      const responseData = error.response.data;

      // Handle when error is a string (e.g., "User with this email or phone already exists")
      let errorMessage = error.message;
      if (typeof responseData.error === "string") {
        errorMessage = responseData.error;
      } else if (responseData.error?.message) {
        errorMessage = responseData.error.message;
      } else if (responseData.message) {
        errorMessage = responseData.message;
      }

      const apiError: ApiError = {
        success: false,
        error: {
          code: responseData.error?.code || "UNKNOWN_ERROR",
          message: errorMessage,
          details: responseData.error?.details || null,
        },
        timestamp: new Date().toISOString(),
      };
      return Promise.reject(apiError);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
