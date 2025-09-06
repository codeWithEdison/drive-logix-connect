import axiosInstance from "../axios";
import {
  ApiResponse,
  Cargo,
  CreateCargoRequest,
  CargoStatus,
  PaginationResponse,
  CargoSearchParams,
  CargoCategory,
  CargoTracking,
} from "../../../types/shared";

export class CargoService {
  // Create cargo request
  static async createCargo(
    data: CreateCargoRequest
  ): Promise<ApiResponse<Cargo>> {
    const response = await axiosInstance.post("/cargos", data);
    return response.data;
  }

  // Get cargo details
  static async getCargoById(id: string): Promise<ApiResponse<Cargo>> {
    const response = await axiosInstance.get(`/cargos/${id}`);
    return response.data;
  }

  // Update cargo status
  static async updateCargoStatus(
    id: string,
    status: CargoStatus,
    notes?: string
  ): Promise<ApiResponse<Cargo>> {
    const response = await axiosInstance.put(`/cargos/${id}/status`, {
      status,
      notes,
    });
    return response.data;
  }

  // Get client cargos
  static async getClientCargos(
    params?: CargoSearchParams
  ): Promise<ApiResponse<Cargo[]>> {
    const response = await axiosInstance.get("/cargos/clients/cargos", {
      params,
    });
    console.log(
      "🔍 CargoService.getClientCargos - raw response:",
      response.data
    );
    return response.data;
  }

  // Get driver cargos
  static async getDriverCargos(
    params?: CargoSearchParams
  ): Promise<ApiResponse<PaginationResponse<Cargo>>> {
    const response = await axiosInstance.get("/cargos/drivers/cargos", {
      params,
    });
    return response.data;
  }

  // Get all cargos (Admin)
  static async getAllCargos(
    params?: CargoSearchParams
  ): Promise<ApiResponse<PaginationResponse<Cargo>>> {
    const response = await axiosInstance.get("/cargos/admin/cargos", {
      params,
    });
    return response.data;
  }

  // Cancel cargo
  static async cancelCargo(
    id: string,
    reason: string
  ): Promise<ApiResponse<Cargo>> {
    const response = await axiosInstance.post(`/cargos/${id}/cancel`, {
      reason,
    });
    return response.data;
  }

  // Get cargo tracking
  static async getCargoTracking(
    id: string
  ): Promise<ApiResponse<CargoTracking>> {
    const response = await axiosInstance.get(`/cargos/${id}/tracking`);
    return response.data;
  }

  // Estimate cargo cost
  static async estimateCost(
    data: Partial<CreateCargoRequest>
  ): Promise<ApiResponse<{ estimated_cost: number }>> {
    const response = await axiosInstance.post("/cargos/estimate-cost", data);
    return response.data;
  }
}

export class CargoCategoryService {
  // Get cargo categories
  static async getCategories(params?: {
    is_active?: boolean;
    search?: string;
  }): Promise<ApiResponse<CargoCategory[]>> {
    const response = await axiosInstance.get("/cargo-categories", { params });
    return response.data;
  }

  // Get cargo category by ID
  static async getCategoryById(
    id: string
  ): Promise<ApiResponse<CargoCategory>> {
    const response = await axiosInstance.get(`/cargo-categories/${id}`);
    return response.data;
  }

  // Create cargo category (Admin)
  static async createCategory(data: {
    name: string;
    description?: string;
    base_rate_multiplier: number;
    special_handling_required: boolean;
    is_active: boolean;
  }): Promise<ApiResponse<CargoCategory>> {
    const response = await axiosInstance.post("/cargo-categories", data);
    return response.data;
  }

  // Update cargo category (Admin)
  static async updateCategory(
    id: string,
    data: Partial<CargoCategory>
  ): Promise<ApiResponse<CargoCategory>> {
    const response = await axiosInstance.put(`/cargo-categories/${id}`, data);
    return response.data;
  }

  // Delete cargo category (Admin)
  static async deleteCategory(id: string): Promise<ApiResponse<null>> {
    const response = await axiosInstance.delete(`/cargo-categories/${id}`);
    return response.data;
  }
}
