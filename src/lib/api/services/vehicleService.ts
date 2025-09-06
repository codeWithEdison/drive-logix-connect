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

export class VehicleService {
  // Get all vehicles
  static async getVehicles(
    params?: VehicleSearchParams
  ): Promise<ApiResponse<PaginationResponse<Vehicle>>> {
    const response = await axiosInstance.get("/vehicles", { params });
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
}
