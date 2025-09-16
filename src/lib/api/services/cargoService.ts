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

export interface UnassignedCargoFilters {
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export class CargoService {
  // Create cargo request - backend returns cargo data directly with nested invoice
  static async createCargo(
    data: CreateCargoRequest
  ): Promise<ApiResponse<any>> {
    const response = await axiosInstance.post("/cargos", data);
    return response.data;
  }

  // Get unassigned accepted cargo - fallback to regular cargos with status filter
  static async getUnassignedCargos(
    filters: UnassignedCargoFilters = {}
  ): Promise<ApiResponse<Cargo[]>> {
    const params = new URLSearchParams();

    // Use regular cargos endpoint with status filter as fallback
    params.append("status", "accepted");
    if (filters.date_from) params.append("date_from", filters.date_from);
    if (filters.date_to) params.append("date_to", filters.date_to);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    const response = await axiosInstance.get(`/cargos?${params.toString()}`);
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
  ): Promise<ApiResponse<Cargo[]>> {
    const response = await axiosInstance.get("/cargos/admin/cargos", {
      params,
    });
    console.log("🔍 CargoService.getAllCargos - raw response:", response.data);
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
  static async estimateCost(data: {
    weight_kg: number;
    distance_km: number;
    category_id: string;
  }): Promise<
    ApiResponse<{
      estimated_cost: number;
      breakdown: {
        base_cost: number;
        weight_cost: number;
        distance_cost: number;
        category_multiplier: number;
        total_distance_km: number;
        currency: string;
      };
      pricing_policy: {
        base_rate_per_km: number;
        rate_per_kg: number;
        minimum_fare: number;
      };
    }>
  > {
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
