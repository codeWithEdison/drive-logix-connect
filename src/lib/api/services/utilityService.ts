import axiosInstance from "../axios";
import { ApiResponse, PaginationResponse } from "../../../types/shared";

export class FileService {
  // Upload file
  static async uploadFile(
    file: File,
    type: string,
    category?: string
  ): Promise<
    ApiResponse<{
      id: string;
      filename: string;
      original_name: string;
      mime_type: string;
      size: number;
      file_url: string;
      type: string;
      category?: string;
      uploaded_by: string;
      created_at: string;
    }>
  > {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    if (category) formData.append("category", category);

    const response = await axiosInstance.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  // Get file URL
  static async getFileUrl(id: string): Promise<
    ApiResponse<{
      file_url: string;
      expires_at?: string;
    }>
  > {
    const response = await axiosInstance.get(`/files/${id}/url`);
    return response.data;
  }

  // Delete file
  static async deleteFile(id: string): Promise<ApiResponse<null>> {
    const response = await axiosInstance.delete(`/files/${id}`);
    return response.data;
  }

  // Get user files
  static async getUserFiles(params?: {
    type?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginationResponse<any>>> {
    const response = await axiosInstance.get("/files", { params });
    return response.data;
  }
}

export class SearchService {
  // Search cargos
  static async searchCargos(params?: {
    q?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginationResponse<any>>> {
    const response = await axiosInstance.get("/search/cargos", { params });
    return response.data;
  }

  // Search users
  static async searchUsers(params?: {
    q?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginationResponse<any>>> {
    const response = await axiosInstance.get("/search/users", { params });
    return response.data;
  }

  // Search vehicles
  static async searchVehicles(params?: {
    q?: string;
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginationResponse<any>>> {
    const response = await axiosInstance.get("/search/vehicles", { params });
    return response.data;
  }
}

export class AnalyticsService {
  // Get cargo analytics
  static async getCargoAnalytics(params?: {
    period?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<ApiResponse<any>> {
    const response = await axiosInstance.get("/analytics/cargos", { params });
    return response.data;
  }

  // Get driver analytics
  static async getDriverAnalytics(params?: {
    driver_id?: string;
    period?: string;
  }): Promise<ApiResponse<any>> {
    const response = await axiosInstance.get("/analytics/drivers", { params });
    return response.data;
  }

  // Get financial analytics
  static async getFinancialAnalytics(params?: {
    period?: string;
    group_by?: string;
  }): Promise<ApiResponse<any>> {
    const response = await axiosInstance.get("/analytics/financial", {
      params,
    });
    return response.data;
  }

  // Get performance analytics
  static async getPerformanceAnalytics(params?: {
    metric?: string;
    period?: string;
  }): Promise<ApiResponse<any>> {
    const response = await axiosInstance.get("/analytics/performance", {
      params,
    });
    return response.data;
  }
}
