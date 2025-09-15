import axiosInstance from "../axios";
import {
  ApiResponse,
  Vehicle,
  CreateVehicleRequest,
  PaginationResponse,
  VehicleSearchParams,
  MaintenanceRecord,
  CreateMaintenanceRecordRequest,
} from "../../../types/shared";

export interface AvailableVehicleFilters {
  date?: string;
  type?: "truck" | "moto" | "van" | "pickup";
  capacity_min?: number;
  page?: number;
  limit?: number;
}

export class VehicleService {
  // Get all vehicles
  static async getVehicles(
    params?: VehicleSearchParams
  ): Promise<ApiResponse<PaginationResponse<Vehicle>>> {
    const response = await axiosInstance.get("/vehicles", { params });
    return response.data;
  }

  // Get available vehicles without assignments - fallback to regular vehicles
  static async getAvailableVehiclesWithoutAssignments(
    filters: AvailableVehicleFilters = {}
  ): Promise<ApiResponse<Vehicle[]>> {
    const params = new URLSearchParams();

    // Use regular vehicles endpoint as fallback
    params.append("status", "active");
    if (filters.type) params.append("type", filters.type);
    if (filters.capacity_min)
      params.append("capacity_min", filters.capacity_min.toString());
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    const response = await axiosInstance.get(`/vehicles?${params.toString()}`);
    return response.data;
  }

  // Get vehicle details
  static async getVehicleById(id: string): Promise<ApiResponse<Vehicle>> {
    const response = await axiosInstance.get(`/vehicles/${id}`);
    return response.data;
  }

  // Create vehicle (Admin)
  static async createVehicle(
    data: CreateVehicleRequest
  ): Promise<ApiResponse<Vehicle>> {
    const response = await axiosInstance.post("/vehicles", data);
    return response.data;
  }

  // Update vehicle
  static async updateVehicle(
    id: string,
    data: Partial<CreateVehicleRequest>
  ): Promise<ApiResponse<Vehicle>> {
    const response = await axiosInstance.put(`/vehicles/${id}`, data);
    return response.data;
  }

  // Approve or reject vehicle (Admin)
  static async approveVehicle(
    id: string,
    approved: boolean,
    reason?: string
  ): Promise<ApiResponse<Vehicle>> {
    const response = await axiosInstance.put(`/admin/vehicles/${id}/approval`, {
      approved,
      reason,
    });
    return response.data;
  }

  // Add vehicle maintenance record
  static async addMaintenanceRecord(
    id: string,
    data: CreateMaintenanceRecordRequest
  ): Promise<ApiResponse<MaintenanceRecord>> {
    const response = await axiosInstance.post(
      `/vehicles/${id}/maintenance`,
      data
    );
    return response.data;
  }

  // Get vehicle maintenance history
  static async getMaintenanceHistory(
    id: string
  ): Promise<ApiResponse<MaintenanceRecord[]>> {
    const response = await axiosInstance.get(`/vehicles/${id}/maintenance`);
    return response.data;
  }

  // Get available vehicles
  static async getAvailableVehicles(params?: {
    type?: string;
    capacity_min?: number;
  }): Promise<ApiResponse<Vehicle[]>> {
    const response = await axiosInstance.get("/vehicles/available", { params });
    return response.data;
  }

  // Get available trucks with advanced filtering
  static async getAvailableTrucks(params?: {
    capacity_min?: number;
    capacity_max?: number;
    volume_min?: number;
    volume_max?: number;
    sort_by?: "capacity_kg" | "capacity_volume" | "created_at";
    sort_order?: "asc" | "desc";
  }): Promise<ApiResponse<Vehicle[]>> {
    const response = await axiosInstance.get("/vehicles/trucks/available", {
      params,
    });
    return response.data;
  }

  // Get available vehicles for a specific date
  static async getAvailableVehiclesForDate(params: {
    date: string; // YYYY-MM-DD format
    type?: string;
    capacity_min?: number;
    duration_hours?: number;
  }): Promise<ApiResponse<Vehicle[]>> {
    const response = await axiosInstance.get("/vehicles/available-for-date", {
      params,
    });
    return response.data;
  }

  // Get vehicle assignments
  static async getVehicleAssignments(
    vehicleId: string,
    params?: {
      page?: number;
      limit?: number;
    }
  ): Promise<
    ApiResponse<{
      assignments: Array<{
        id: string;
        cargo_id: string;
        driver_id: string;
        vehicle_id: string;
        assigned_at: string;
        cargo: any;
        driver: any;
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>
  > {
    const response = await axiosInstance.get(
      `/vehicles/${vehicleId}/assignments`,
      { params }
    );
    return response.data;
  }
}
