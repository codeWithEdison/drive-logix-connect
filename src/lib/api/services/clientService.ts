import axiosInstance from "../axios";
import {
  ApiResponse,
  Client,
  UpdateClientRequest,
  Invoice,
  PaginationResponse,
} from "../../../types/shared";

export class ClientService {
  // Get client profile
  static async getProfile(): Promise<ApiResponse<Client>> {
    const response = await axiosInstance.get("/clients/profile");
    return response.data;
  }

  // Update client profile
  static async updateProfile(
    data: UpdateClientRequest
  ): Promise<ApiResponse<Client>> {
    const response = await axiosInstance.put("/clients/profile", data);
    return response.data;
  }

  // Get client credit status
  static async getCreditStatus(): Promise<
    ApiResponse<{
      credit_limit: number;
      current_balance: number;
      available_credit: number;
    }>
  > {
    const response = await axiosInstance.get("/clients/credit-status");
    return response.data;
  }

  // Get client invoices
  static async getInvoices(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginationResponse<Invoice>>> {
    const response = await axiosInstance.get("/clients/invoices", { params });
    return response.data;
  }

  // Get all clients (Admin)
  static async getAllClients(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginationResponse<Client>>> {
    const response = await axiosInstance.get("/admin/users", {
      params: { ...params, role: "client" },
    });
    return response.data;
  }
}
