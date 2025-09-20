import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { ApiResponse, ApiError } from "../../types/shared";

// Base configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://loveway-logistics-backends.onrender.com";
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
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add language header
    const language = localStorage.getItem("preferred_language") || "en";
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
      if (accessToken) localStorage.setItem("access_token", accessToken);
      if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
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

      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const response = await axiosInstance.post("/auth/refresh", {
            refresh_token: refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } =
            response.data.data;
          localStorage.setItem("access_token", accessToken);
          localStorage.setItem("refresh_token", newRefreshToken);

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
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
      const apiError: ApiError = {
        success: false,
        error: {
          code: error.response.data.error?.code || "UNKNOWN_ERROR",
          message: error.response.data.error?.message || error.message,
          details: error.response.data.error?.details || null,
        },
        timestamp: new Date().toISOString(),
      };
      return Promise.reject(apiError);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
