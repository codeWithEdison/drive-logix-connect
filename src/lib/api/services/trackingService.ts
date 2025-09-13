import axiosInstance from "../axios";
import {
  ApiResponse,
  CargoTracking,
  Cargo,
  GPSTracking,
  CargoStatus,
  PaginationResponse,
} from "../../../types/shared";

export class TrackingService {
  // Get cargo tracking details by cargo ID (returns cargo with tracking data)
  static async getCargoTracking(
    cargoId: string
  ): Promise<ApiResponse<Cargo & { tracking?: CargoTracking }>> {
    const response = await axiosInstance.get(`/cargos/track/${cargoId}`);
    return response.data;
  }

  // Get cargo tracking details by cargo number (returns cargo with tracking data)
  static async getCargoTrackingByNumber(
    cargoNumber: string
  ): Promise<ApiResponse<Cargo & { tracking?: CargoTracking }>> {
    const response = await axiosInstance.get(`/cargos/track/${cargoNumber}`);
    return response.data;
  }

  // Get dashboard tracking details by cargo ID (includes additional analytics)
  static async getDashboardTracking(
    cargoId: string,
    params?: {
      include_history?: boolean;
      limit?: number;
    }
  ): Promise<ApiResponse<Cargo & { tracking?: CargoTracking }>> {
    const response = await axiosInstance.get(`/dashboard/tracking/${cargoId}`, {
      params: {
        include_history: params?.include_history ?? true,
        limit: params?.limit ?? 50,
      },
    });
    return response.data;
  }

  // Get dashboard tracking details by cargo number (includes additional analytics)
  static async getDashboardTrackingByNumber(
    cargoNumber: string,
    params?: {
      include_history?: boolean;
      limit?: number;
    }
  ): Promise<ApiResponse<Cargo & { tracking?: CargoTracking }>> {
    const response = await axiosInstance.get(
      `/dashboard/tracking-by-number/${cargoNumber}`,
      {
        params: {
          include_history: params?.include_history ?? true,
          limit: params?.limit ?? 50,
        },
      }
    );
    return response.data;
  }

  // Get live GPS tracking for a vehicle
  static async getLiveTracking(
    vehicleId: string
  ): Promise<ApiResponse<GPSTracking>> {
    const response = await axiosInstance.get(
      `/tracking/vehicles/${vehicleId}/live`
    );
    return response.data;
  }

  // Get GPS history for a vehicle
  static async getVehicleTrackingHistory(
    vehicleId: string,
    params?: {
      start_time?: string;
      end_time?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<ApiResponse<PaginationResponse<GPSTracking>>> {
    const response = await axiosInstance.get(
      `/tracking/vehicles/${vehicleId}/history`,
      { params }
    );
    return response.data;
  }

  // Get all in-transit cargo (role-specific endpoints for listing only)
  static async getInTransitCargo(params?: {
    page?: number;
    limit?: number;
    driver_id?: string;
    userRole?: "client" | "driver" | "admin";
  }): Promise<ApiResponse<(Cargo & { tracking?: CargoTracking })[]>> {
    const { userRole, ...queryParams } = params || {};

    // Use role-specific endpoints for cargo listing (without include_history)
    let endpoint = "/cargo/in-transit"; // fallback for admin or unknown roles

    if (userRole === "client") {
      endpoint = "/cargos/clients/cargos";
    } else if (userRole === "driver") {
      endpoint = "/cargos/drivers/cargos";
    }

    const response = await axiosInstance.get(endpoint, {
      params: {
        ...queryParams,
        status: "in_transit",
        limit: queryParams?.limit ?? 50,
      },
    });

    console.log("🔍 TrackingService.getInTransitCargo:", {
      userRole,
      endpoint,
      queryParams,
      responseData: response.data,
    });

    return response.data;
  }

  // Update cargo tracking status
  static async updateTrackingStatus(
    cargoId: string,
    data: {
      status: CargoStatus;
      latitude?: number;
      longitude?: number;
      notes?: string;
    }
  ): Promise<ApiResponse<CargoTracking>> {
    const response = await axiosInstance.put(
      `/tracking/cargo/${cargoId}/status`,
      data
    );
    return response.data;
  }

  // Get route progress for cargo
  static async getRouteProgress(cargoId: string): Promise<
    ApiResponse<{
      progress_percentage: number;
      estimated_arrival: string;
      current_location: string;
      distance_remaining: number;
      route_distance: number;
    }>
  > {
    const response = await axiosInstance.get(
      `/tracking/cargo/${cargoId}/progress`
    );
    return response.data;
  }

  // Get tracking analytics
  static async getTrackingAnalytics(params?: {
    start_date?: string;
    end_date?: string;
    vehicle_id?: string;
  }): Promise<
    ApiResponse<{
      total_tracked_deliveries: number;
      average_delivery_time: number;
      on_time_delivery_rate: number;
      distance_traveled: number;
    }>
  > {
    const response = await axiosInstance.get("/tracking/analytics", { params });
    return response.data;
  }

  // Get real-time delivery updates
  static async getDeliveryUpdates(
    cargoId: string,
    lastUpdate?: string
  ): Promise<
    ApiResponse<{
      updates: Array<{
        timestamp: string;
        status: CargoStatus;
        location?: { latitude: number; longitude: number };
        notes?: string;
      }>;
      has_more: boolean;
    }>
  > {
    const response = await axiosInstance.get(
      `/tracking/cargo/${cargoId}/updates`,
      {
        params: { since: lastUpdate },
      }
    );
    return response.data;
  }

  // Get nearby vehicles for fleet tracking
  static async getNearbyVehicles(
    latitude: number,
    longitude: number,
    radius: number = 5000
  ): Promise<
    ApiResponse<
      Array<{
        vehicle_id: string;
        plate_number: string;
        driver_name: string;
        latitude: number;
        longitude: number;
        status: string;
        cargo_id?: string;
      }>
    >
  > {
    const response = await axiosInstance.get("/tracking/vehicles/nearby", {
      params: { latitude, longitude, radius },
    });
    return response.data;
  }

  // Get tracking summary for dashboard
  static async getTrackingSummary(): Promise<
    ApiResponse<{
      active_deliveries: number;
      vehicles_on_route: number;
      deliveries_today: number;
      average_delivery_time: number;
      on_time_percentage: number;
    }>
  > {
    const response = await axiosInstance.get("/tracking/summary");
    return response.data;
  }
}
