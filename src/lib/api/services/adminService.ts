import axiosInstance from "../axios";
import { ApiResponse, PaginationResponse } from "../../../types/shared";

export class AdminService {
  // Get dashboard statistics
  static async getDashboardStats(): Promise<
    ApiResponse<{
      total_users: number;
      total_clients: number;
      total_drivers: number;
      total_cargos: number;
      total_deliveries: number;
      total_revenue: number;
      active_deliveries: number;
      pending_approvals: number;
    }>
  > {
    const response = await axiosInstance.get("/admin/dashboard");
    return response.data;
  }

  // Get system logs
  static async getLogs(params?: {
    user_id?: string;
    action?: string;
    page?: number;
    limit?: number;
    date_from?: string;
    date_to?: string;
  }): Promise<ApiResponse<PaginationResponse<any>>> {
    const response = await axiosInstance.get("/admin/logs", { params });
    return response.data;
  }

  // Get user management
  static async getUserManagement(params?: {
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginationResponse<any>>> {
    const response = await axiosInstance.get("/admin/users", { params });
    return response.data;
  }

  // Update user status (Admin)
  static async updateUserStatus(
    id: string,
    data: {
      is_active: boolean;
      reason?: string;
    }
  ): Promise<ApiResponse<any>> {
    const response = await axiosInstance.put(`/admin/users/${id}/status`, data);
    return response.data;
  }

  // Get financial reports
  static async getFinancialReports(params?: {
    start_date?: string;
    end_date?: string;
    group_by?: string;
  }): Promise<ApiResponse<any>> {
    const response = await axiosInstance.get("/admin/reports/financial", {
      params,
    });
    return response.data;
  }

  // Get performance reports
  static async getPerformanceReports(params?: {
    driver_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<ApiResponse<any>> {
    const response = await axiosInstance.get("/admin/reports/performance", {
      params,
    });
    return response.data;
  }

  // Get clients (Admin)
  static async getClients(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginationResponse<any>>> {
    const response = await axiosInstance.get("/admin/users", {
      params: { ...params, role: "client" },
    });
    return response.data;
  }

  // Unified approvals
  static async approveEntity(data: {
    entity_type: "user" | "vehicle" | "driver";
    entity_id: string;
    approved: boolean;
    reason?: string;
  }): Promise<ApiResponse<any>> {
    const response = await axiosInstance.put("/admin/approvals", data);
    return response.data;
  }
}
