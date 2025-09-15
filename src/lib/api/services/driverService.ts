import axiosInstance from "../axios";
import {
  ApiResponse,
  Driver,
  UpdateDriverRequest,
  DriverDocument,
  DriverStatus,
  PaginationResponse,
  DeliveryAssignment,
} from "../../../types/shared";

export interface AvailableDriverFilters {
  date?: string;
  page?: number;
  limit?: number;
}

export class DriverService {
  // Get driver profile
  static async getProfile(): Promise<ApiResponse<Driver>> {
    const response = await axiosInstance.get("/drivers/profile");
    return response.data;
  }

  // Get available drivers without assignments - fallback to regular drivers
  static async getAvailableDriversWithoutAssignments(
    filters: AvailableDriverFilters = {}
  ): Promise<ApiResponse<Driver[]>> {
    const params = new URLSearchParams();

    // Use regular drivers endpoint as fallback
    params.append("status", "available");
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    const response = await axiosInstance.get(`/drivers?${params.toString()}`);
    return response.data;
  }

  // Update driver profile
  static async updateProfile(
    data: UpdateDriverRequest
  ): Promise<ApiResponse<Driver>> {
    const response = await axiosInstance.put("/drivers/profile", data);
    return response.data;
  }

  // Upload driver document
  static async uploadDocument(
    data: FormData
  ): Promise<ApiResponse<DriverDocument>> {
    const response = await axiosInstance.post("/drivers/documents", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  // Get driver documents
  static async getDocuments(): Promise<ApiResponse<DriverDocument[]>> {
    const response = await axiosInstance.get("/drivers/documents");
    return response.data;
  }

  // Update driver status
  static async updateStatus(
    status: DriverStatus
  ): Promise<ApiResponse<Driver>> {
    const response = await axiosInstance.put("/drivers/status", { status });
    return response.data;
  }

  // Get driver performance
  static async getPerformance(): Promise<
    ApiResponse<{
      total_deliveries: number;
      total_distance_km: number;
      average_rating: number;
      on_time_deliveries: number;
      completion_rate: number;
    }>
  > {
    const response = await axiosInstance.get("/drivers/performance");
    return response.data;
  }

  // Get driver assignments
  static async getAssignments(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginationResponse<DeliveryAssignment>>> {
    const response = await axiosInstance.get("/drivers/assignments", {
      params,
    });
    return response.data;
  }

  // Get available drivers (Admin)
  static async getAvailableDrivers(params?: {
    location?: string;
    vehicle_type?: string;
  }): Promise<ApiResponse<Driver[]>> {
    const response = await axiosInstance.get("/drivers/available", { params });
    return response.data;
  }

  // Get all drivers (Admin)
  static async getAllDrivers(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginationResponse<Driver>>> {
    const response = await axiosInstance.get("/drivers", { params });
    return response.data;
  }

  // Get driver by ID (Admin)
  static async getDriverById(id: string): Promise<ApiResponse<Driver>> {
    const response = await axiosInstance.get(`/drivers/${id}`);
    return response.data;
  }
}
