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
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  // "https://loveway-logistics-backends.onrender.com";
  "http://localhost:3000";
const API_VERSION = "v1";

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

    return config;
  },
  (error) => {
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
    if (error.response?.status === 401 && !originalRequest._retry) {
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
