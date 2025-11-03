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

  // Get cargo live tracking
  static async getCargoTracking(cargoId: string): Promise<ApiResponse<any>> {
    const response = await axiosInstance.get(`/gps/cargos/${cargoId}/tracking`);
    return response.data;
  }

  // Get fleet monitor data
  static async getFleetMonitor(params?: {
    status?: string;
    branch_id?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginationResponse<any>>> {
    const response = await axiosInstance.get("/gps/fleet", { params });
    return response.data;
  }

  // Get vehicle GPS status
  static async getVehicleStatus(vehicleId: string): Promise<ApiResponse<any>> {
    const response = await axiosInstance.get(
      `/gps/vehicles/${vehicleId}/status`
    );
    return response.data;
  }

  // Get vehicle history (JIMI provider)
  static async getVehicleHistory(
    vehicleId: string,
    params?: {
      start_time?: string;
      end_time?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<ApiResponse<any>> {
    const response = await axiosInstance.get(
      `/gps/vehicles/${vehicleId}/history`,
      { params }
    );
    return response.data;
  }

  // Get JIMI device detail
  static async getJimiDeviceDetail(imei: string): Promise<ApiResponse<any>> {
    const response = await axiosInstance.get(`/gps/jimi/device/detail`, {
      params: { imei },
    });
    return response.data;
  }

  // Get JIMI device share URL
  static async getJimiShareUrl(
    imei: string
  ): Promise<ApiResponse<{ share_url: string }>> {
    const response = await axiosInstance.get(`/gps/jimi/device/share-url`, {
      params: { imei },
    });
    return response.data;
  }

  // Get JIMI locations (batch GPS data from JIMI API)
  static async getJimiLocations(params?: {
    imeis?: string; // comma-separated IMEIs
    all?: boolean; // fetch all IMEIs from DB
    branch_id?: string; // filter by branch (super_admin only)
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<any>> {
    const response = await axiosInstance.get(`/gps/jimi/locations`, {
      params,
    });
    return response.data;
  }
}
