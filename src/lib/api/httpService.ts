import { Capacitor } from "@capacitor/core";
import { Http } from "@capacitor-community/http";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { ApiResponse, ApiError } from "../../types/shared";
import { storage } from "../services/secureStorage";

// Base configuration
// Always use deployed backend unless explicitly overridden via environment variable
const isNativeBuild = import.meta.env.MODE === "native";
const isDevelopment = import.meta.env.MODE === "development";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (isDevelopment && !isNativeBuild
    ? "http://localhost:3000"
    : "https://api.lovewaylogistics.com");
const API_VERSION = "v1";
const BASE_URL = `${API_BASE_URL}/${API_VERSION}`;

// Avoid passing raw objects into console.log on mobile (can cause circular serialization issues).
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

// Create axios instance for web
const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false,
});

/**
 * HTTP Service that uses Capacitor HTTP plugin on native platforms
 * to bypass CORS restrictions, and axios on web
 */
class HttpService {
  /**
   * Make HTTP request
   */
  async request<T = any>(config: {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    url: string;
    data?: any;
    params?: any;
    headers?: Record<string, string>;
  }): Promise<AxiosResponse<ApiResponse<T>>> {
    // Always use native request on native platforms to bypass CORS
    if (Capacitor.isNativePlatform()) {
      console.log("[HTTP SERVICE] Using Capacitor HTTP (bypasses CORS)");
      return this.nativeRequest<T>(config);
    } else {
      console.log("[HTTP SERVICE] Using axios (web platform)");
      return this.webRequest<T>(config);
    }
  }

  /**
   * Native request using Capacitor HTTP plugin (bypasses CORS)
   */
  private async nativeRequest<T>(config: {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    url: string;
    data?: any;
    params?: any;
    headers?: Record<string, string>;
  }): Promise<AxiosResponse<ApiResponse<T>>> {
    try {
      // Get auth token
      const token = await storage.getItem("access_token");
      const language = (await storage.getItem("preferred_language")) || "en";

      // Build headers
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Language": language,
        ...config.headers,
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Build full URL
      let fullUrl = `${BASE_URL}${config.url}`;
      if (config.params) {
        const params = new URLSearchParams(config.params).toString();
        fullUrl += `?${params}`;
      }

      // Log request
      console.log(
        `[API REQUEST] ${config.method} ${fullUrl} ${safeStringify({
          method: config.method,
          url: fullUrl,
          headers: { ...headers, Authorization: token ? "Bearer ***" : "None" },
          params: config.params,
          data: config.data,
          timestamp: new Date().toISOString(),
        })}`
      );

      const startTime = Date.now();

      // Make request using Capacitor HTTP
      let response: any;
      const httpConfig: any = {
        url: fullUrl,
        headers,
      };

      // Add data for methods that support it
      if (config.data && ["POST", "PUT", "PATCH"].includes(config.method)) {
        httpConfig.data =
          typeof config.data === "string"
            ? config.data
            : JSON.stringify(config.data);
      }

      try {
        switch (config.method) {
          case "GET":
            response = await Http.get(httpConfig);
            break;
          case "POST":
            response = await Http.post(httpConfig);
            break;
          case "PUT":
            response = await Http.put(httpConfig);
            break;
          case "DELETE":
            response = await Http.delete(httpConfig);
            break;
          case "PATCH":
            response = await Http.patch(httpConfig);
            break;
        }
      } catch (httpError: any) {
        console.error(`[HTTP SERVICE] Capacitor HTTP error: ${safeStringify(httpError)}`);
        throw httpError;
      }

      const duration = Date.now() - startTime;

      // Parse response data
      let responseData: any;
      try {
        responseData =
          typeof response.data === "string"
            ? JSON.parse(response.data)
            : response.data;
      } catch {
        responseData = response.data;
      }

      // Log response
      console.log(
        `[API RESPONSE] ${config.method} ${fullUrl} ${safeStringify({
          status: response.status,
          durationMs: duration,
          data: responseData,
          timestamp: new Date().toISOString(),
        })}`
      );

      // Transform to axios-like response
      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText || "OK",
        headers: response.headers || {},
        config: {} as any,
      } as AxiosResponse<ApiResponse<T>>;
    } catch (error: any) {
      // Log error
      const fullUrl = `${BASE_URL}${config.url}`;
      console.error(
        `[API ERROR] ${config.method} ${fullUrl} ${safeStringify({
          status: error.status || "NO_RESPONSE",
          error: error?.message || error,
          timestamp: new Date().toISOString(),
        })}`
      );

      // Transform error
      const apiError: ApiError = {
        success: false,
        error: {
          code: error.code || "UNKNOWN_ERROR",
          message: error.message || "Network error",
          details: null,
        },
        timestamp: new Date().toISOString(),
      };

      throw apiError;
    }
  }

  /**
   * Web request using axios
   */
  private async webRequest<T>(config: {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    url: string;
    data?: any;
    params?: any;
    headers?: Record<string, string>;
  }): Promise<AxiosResponse<ApiResponse<T>>> {
    return axiosInstance.request({
      method: config.method.toLowerCase() as any,
      url: config.url,
      data: config.data,
      params: config.params,
      headers: config.headers,
    });
  }

  /**
   * GET request
   */
  async get<T = any>(
    url: string,
    config?: { params?: any; headers?: Record<string, string> }
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.request<T>({
      method: "GET",
      url,
      params: config?.params,
      headers: config?.headers,
    });
  }

  /**
   * POST request
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: { headers?: Record<string, string> }
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.request<T>({
      method: "POST",
      url,
      data,
      headers: config?.headers,
    });
  }

  /**
   * PUT request
   */
  async put<T = any>(
    url: string,
    data?: any,
    config?: { headers?: Record<string, string> }
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.request<T>({
      method: "PUT",
      url,
      data,
      headers: config?.headers,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    url: string,
    config?: { headers?: Record<string, string> }
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.request<T>({
      method: "DELETE",
      url,
      headers: config?.headers,
    });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    url: string,
    data?: any,
    config?: { headers?: Record<string, string> }
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.request<T>({
      method: "PATCH",
      url,
      data,
      headers: config?.headers,
    });
  }
}

export const httpService = new HttpService();


