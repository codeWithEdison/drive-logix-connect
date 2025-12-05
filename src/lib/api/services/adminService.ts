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

  // Create admin user
  static async createAdmin(data: {
    full_name: string;
    email: string;
    password: string;
    phone?: string;
    preferred_language?: "en" | "rw" | "fr";
    branch_id: string;
  }): Promise<
    ApiResponse<{
      user: any;
      message: string;
    }>
  > {
    const response = await axiosInstance.post("/auth/register", {
      ...data,
      role: "admin",
    });
    return response.data;
  }

  // Update admin user
  static async updateAdmin(
    adminId: string,
    data: {
      full_name: string;
      email: string;
      phone?: string;
      role: "admin" | "super_admin";
      branch_id: string;
      is_active: boolean;
      preferred_language?: "en" | "rw" | "fr";
    }
  ): Promise<ApiResponse<any>> {
    const response = await axiosInstance.put(`/admin/admins/${adminId}`, data);
    return response.data;
  }

  // Update client user
  static async updateClient(
    clientId: string,
    data: {
      full_name: string;
      email: string;
      phone?: string;
      company_name: string;
      business_type: "individual" | "corporate" | "government";
      tax_id?: string;
      address?: string;
      city?: string;
      country?: string;
      postal_code?: string;
      contact_person?: string;
      credit_limit?: number;
      payment_terms?: number;
      is_active: boolean;
      preferred_language?: "en" | "rw" | "fr";
    }
  ): Promise<ApiResponse<any>> {
    const response = await axiosInstance.put(
      `/admin/clients/${clientId}`,
      data
    );
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
    business_type?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginationResponse<any>>> {
    const response = await axiosInstance.get("/admin/clients", { params });
    return response.data;
  }

  // Create client (Admin)
  static async createClient(data: {
    full_name: string;
    email: string;
    phone: string;
    password: string;
    preferred_language: "en" | "rw" | "fr";
    company_name: string;
    business_type: "individual" | "corporate" | "government";
    tax_id?: string;
    address?: string;
    city?: string;
    country?: string;
    postal_code?: string;
    contact_person?: string;
    credit_limit?: number;
    payment_terms?: number;
  }): Promise<
    ApiResponse<{
      user: any;
      client: any;
      message: string;
    }>
  > {
    const response = await axiosInstance.post("/admin/clients", data);
    return response.data;
  }

  // Get drivers (Admin)
  static async getDrivers(params?: {
    status?: string;
    license_type?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginationResponse<any>>> {
    const response = await axiosInstance.get("/admin/drivers", { params });
    return response.data;
  }

  // Create driver (Admin)
  static async createDriver(data: {
    full_name: string;
    email: string;
    phone: string;
    password: string;
    preferred_language: "en" | "rw" | "fr";
    license_number: string;
    license_expiry?: string;
    license_type: "A" | "B" | "C" | "D" | "E";
    code_number: string;
    date_of_birth?: string;
    emergency_contact?: string;
    emergency_phone?: string;
    blood_type?: string;
    medical_certificate_expiry?: string;
  }): Promise<
    ApiResponse<{
      user: any;
      driver: any;
      message: string;
    }>
  > {
    const response = await axiosInstance.post("/admin/drivers", data);
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

  // Get transportation reports
  static async getTransportationReports(params?: {
    start_date?: string;
    end_date?: string;
    branch_id?: string;
  }): Promise<
    ApiResponse<{
      report: any[];
      total_records: number;
      filters: {
        start_date?: string;
        end_date?: string;
        branch_id?: string | null;
      };
    }>
  > {
    const response = await axiosInstance.get("/admin/reports/transportation", {
      params,
    });
    return response.data;
  }
}
