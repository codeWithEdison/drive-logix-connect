import axiosInstance from "../axios";
import {
  ApiResponse,
  AnalyticsData,
  AnalyticsParams,
  PerformanceMetrics,
  FinancialAnalytics,
  CargoAnalytics,
  DriverAnalytics,
} from "../../../types/shared";

export class AnalyticsService {
  // Get cargo analytics
  static async getCargoAnalytics(
    params: AnalyticsParams
  ): Promise<ApiResponse<CargoAnalytics>> {
    const response = await axiosInstance.get("/analytics/cargos", { params });
    return response.data;
  }

  // Get driver analytics
  static async getDriverAnalytics(
    params: AnalyticsParams
  ): Promise<ApiResponse<DriverAnalytics>> {
    const response = await axiosInstance.get("/analytics/drivers", { params });
    return response.data;
  }

  // Get financial analytics
  static async getFinancialAnalytics(
    params: AnalyticsParams
  ): Promise<ApiResponse<FinancialAnalytics>> {
    const response = await axiosInstance.get("/analytics/financial", {
      params,
    });
    return response.data;
  }

  // Get performance analytics
  static async getPerformanceAnalytics(
    params: AnalyticsParams
  ): Promise<ApiResponse<PerformanceMetrics>> {
    const response = await axiosInstance.get("/analytics/performance", {
      params,
    });
    return response.data;
  }

  // Get vehicle analytics
  static async getVehicleAnalytics(
    params: AnalyticsParams
  ): Promise<ApiResponse<AnalyticsData>> {
    const response = await axiosInstance.get("/analytics/vehicles", { params });
    return response.data;
  }

  // Get user analytics
  static async getUserAnalytics(
    params: AnalyticsParams
  ): Promise<ApiResponse<AnalyticsData>> {
    const response = await axiosInstance.get("/analytics/users", { params });
    return response.data;
  }

  // Get dashboard analytics
  static async getDashboardAnalytics(
    period?: string
  ): Promise<ApiResponse<AnalyticsData>> {
    const response = await axiosInstance.get("/analytics/dashboard", {
      params: { period },
    });
    return response.data;
  }

  // Get revenue analytics
  static async getRevenueAnalytics(
    params: AnalyticsParams
  ): Promise<ApiResponse<FinancialAnalytics>> {
    const response = await axiosInstance.get("/analytics/revenue", { params });
    return response.data;
  }

  // Get delivery time analytics
  static async getDeliveryTimeAnalytics(
    params: AnalyticsParams
  ): Promise<ApiResponse<PerformanceMetrics>> {
    const response = await axiosInstance.get("/analytics/delivery-time", {
      params,
    });
    return response.data;
  }

  // Get geographic analytics
  static async getGeographicAnalytics(
    params: AnalyticsParams
  ): Promise<ApiResponse<AnalyticsData>> {
    const response = await axiosInstance.get("/analytics/geographic", {
      params,
    });
    return response.data;
  }

  // Export analytics data
  static async exportAnalyticsData(
    params: AnalyticsParams,
    format: "csv" | "excel" | "pdf" = "csv"
  ): Promise<Blob> {
    const response = await axiosInstance.get("/analytics/export", {
      params: { ...params, format },
      responseType: "blob",
    });
    return response.data;
  }

  // Get analytics filters
  static async getAnalyticsFilters(): Promise<
    ApiResponse<{
      dateRanges: string[];
      periods: string[];
      metrics: string[];
      dimensions: string[];
    }>
  > {
    const response = await axiosInstance.get("/analytics/filters");
    return response.data;
  }
}
