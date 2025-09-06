import axiosInstance from "../axios";
import {
  ApiResponse,
  GPSTracking,
  UpdateGPSLocationRequest,
  PaginationResponse,
} from "../../../types/shared";

export class GPSService {
  // Update GPS location
  static async updateLocation(
    data: UpdateGPSLocationRequest
  ): Promise<ApiResponse<GPSTracking>> {
    const response = await axiosInstance.post("/gps/tracking", data);
    return response.data;
  }

  // Get vehicle location
  static async getVehicleLocation(
    vehicleId: string
  ): Promise<ApiResponse<GPSTracking>> {
    const response = await axiosInstance.get(
      `/gps/vehicles/${vehicleId}/location`
    );
    return response.data;
  }

  // Get tracking history
  static async getTrackingHistory(
    vehicleId: string,
    params?: {
      start_time?: string;
      end_time?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<ApiResponse<PaginationResponse<GPSTracking>>> {
    const response = await axiosInstance.get(
      `/gps/vehicles/${vehicleId}/history`,
      { params }
    );
    return response.data;
  }

  // Get live tracking
  static async getLiveTracking(
    vehicleId: string
  ): Promise<ApiResponse<GPSTracking>> {
    const response = await axiosInstance.get(`/gps/vehicles/${vehicleId}/live`);
    return response.data;
  }

  // Get location history (general)
  static async getLocationHistory(params?: {
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginationResponse<GPSTracking>>> {
    const response = await axiosInstance.get("/gps/history", { params });
    return response.data;
  }
}
