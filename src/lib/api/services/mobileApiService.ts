import axiosInstance from "../axios";
import { ApiResponse, UUID } from "../../../types/shared";
import {
  MobileCargo,
  MobileCargoDetails,
  MobileCargoListResponse,
  MobileCargoDetailsResponse,
  MobileCargoParams,
  DeviceRegistrationRequest,
  DeviceRegistrationResponse,
  DeviceDeregistrationRequest,
  DeviceDeregistrationResponse,
  MobilePlatform,
} from "../../../types/mobile";

/**
 * MobileApiService handles mobile-optimized API endpoints
 * Provides lightweight data fetching and device management
 */
class MobileApiService {
  private static baseUrl = "/mobile";
  private static cargoUrl = "/cargos";

  /**
   * Get mobile-optimized cargo list
   */
  static async getMobileCargos(
    params: MobileCargoParams = {}
  ): Promise<MobileCargoListResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.status) queryParams.append("status", params.status);
      if (params.sort_by) queryParams.append("sort_by", params.sort_by);
      if (params.sort_order)
        queryParams.append("sort_order", params.sort_order);

      const response = await axiosInstance.get(
        `${MobileApiService.cargoUrl}/mobile?${queryParams.toString()}`
      );

      return response.data;
    } catch (error: any) {
      throw MobileApiService.handleError(error);
    }
  }

  /**
   * Get mobile-optimized cargo details
   */
  static async getMobileCargoDetails(
    cargoId: UUID
  ): Promise<MobileCargoDetailsResponse> {
    try {
      const response = await axiosInstance.get(
        `${MobileApiService.cargoUrl}/${cargoId}/mobile`
      );

      return response.data;
    } catch (error: any) {
      throw MobileApiService.handleError(error);
    }
  }

  /**
   * Register device for push notifications
   */
  static async registerDevice(
    deviceInfo: DeviceRegistrationRequest
  ): Promise<DeviceRegistrationResponse> {
    try {
      const response = await axiosInstance.post(
        `${MobileApiService.baseUrl}/register-device`,
        deviceInfo
      );

      return response.data;
    } catch (error: any) {
      throw MobileApiService.handleError(error);
    }
  }

  /**
   * Deregister device from push notifications
   */
  static async deregisterDevice(
    request: DeviceDeregistrationRequest
  ): Promise<DeviceDeregistrationResponse> {
    try {
      const response = await axiosInstance.post(
        `${MobileApiService.baseUrl}/deregister-device`,
        request
      );

      return response.data;
    } catch (error: any) {
      throw MobileApiService.handleError(error);
    }
  }

  /**
   * Check for app updates
   */
  static async checkForUpdates(): Promise<
    ApiResponse<{
      hasUpdate: boolean;
      update?: {
        version: string;
        isRequired: boolean;
        releaseNotes: string[];
        downloadUrl: string;
        size: string;
      };
    }>
  > {
    try {
      const response = await axiosInstance.get(
        `${MobileApiService.baseUrl}/check-update`
      );
      return response.data;
    } catch (error: any) {
      throw MobileApiService.handleError(error);
    }
  }

  /**
   * Get mobile-specific user profile
   */
  static async getMobileProfile(): Promise<
    ApiResponse<{
      id: UUID;
      full_name: string;
      email: string;
      phone?: string;
      role: string;
      avatar_url?: string;
      preferences: {
        notifications: boolean;
        location_sharing: boolean;
        dark_mode: boolean;
      };
      stats: {
        total_deliveries: number;
        completed_deliveries: number;
        rating: number;
      };
    }>
  > {
    try {
      const response = await axiosInstance.get(
        `${MobileApiService.baseUrl}/profile`
      );
      return response.data;
    } catch (error: any) {
      throw MobileApiService.handleError(error);
    }
  }

  /**
   * Update mobile user preferences
   */
  static async updateMobilePreferences(preferences: {
    notifications?: boolean;
    location_sharing?: boolean;
    dark_mode?: boolean;
  }): Promise<ApiResponse<null>> {
    try {
      const response = await axiosInstance.put(
        `${MobileApiService.baseUrl}/preferences`,
        preferences
      );

      return response.data;
    } catch (error: any) {
      throw MobileApiService.handleError(error);
    }
  }

  /**
   * Get mobile dashboard data
   */
  static async getMobileDashboard(): Promise<
    ApiResponse<{
      stats: {
        pending_deliveries: number;
        completed_today: number;
        total_distance: number;
        rating: number;
      };
      recent_activities: Array<{
        id: UUID;
        type: string;
        title: string;
        timestamp: string;
      }>;
      upcoming_deliveries: Array<{
        id: UUID;
        cargo_number: string;
        pickup_address: string;
        destination_address: string;
        scheduled_time: string;
      }>;
    }>
  > {
    try {
      const response = await axiosInstance.get(
        `${MobileApiService.baseUrl}/dashboard`
      );
      return response.data;
    } catch (error: any) {
      throw MobileApiService.handleError(error);
    }
  }

  /**
   * Get mobile-optimized delivery list
   */
  static async getMobileDeliveries(
    params: {
      page?: number;
      limit?: number;
      status?: string;
      date_from?: string;
      date_to?: string;
    } = {}
  ): Promise<
    ApiResponse<{
      deliveries: Array<{
        id: UUID;
        cargo_id: UUID;
        cargo_number: string;
        status: string;
        pickup_address: string;
        destination_address: string;
        scheduled_time: string;
        estimated_duration: number;
        distance_km: number;
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>
  > {
    try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.status) queryParams.append("status", params.status);
      if (params.date_from) queryParams.append("date_from", params.date_from);
      if (params.date_to) queryParams.append("date_to", params.date_to);

      const response = await axiosInstance.get(
        `${MobileApiService.baseUrl}/deliveries?${queryParams.toString()}`
      );

      return response.data;
    } catch (error: any) {
      throw MobileApiService.handleError(error);
    }
  }

  /**
   * Get mobile-optimized tracking data
   */
  static async getMobileTracking(cargoId: UUID): Promise<
    ApiResponse<{
      cargo_id: UUID;
      cargo_number: string;
      current_status: string;
      current_location?: {
        latitude: number;
        longitude: number;
        address: string;
        timestamp: string;
      };
      estimated_delivery_time?: string;
      progress_percentage: number;
      status_updates: Array<{
        status: string;
        timestamp: string;
        location?: string;
        notes?: string;
      }>;
    }>
  > {
    try {
      const response = await axiosInstance.get(
        `${MobileApiService.baseUrl}/tracking/${cargoId}`
      );

      return response.data;
    } catch (error: any) {
      throw MobileApiService.handleError(error);
    }
  }

  /**
   * Submit mobile feedback
   */
  static async submitFeedback(feedback: {
    type: "bug_report" | "feature_request" | "general";
    subject: string;
    message: string;
    rating?: number;
    attachments?: string[];
  }): Promise<
    ApiResponse<{
      feedback_id: UUID;
      submitted_at: string;
    }>
  > {
    try {
      const response = await axiosInstance.post(
        `${MobileApiService.baseUrl}/feedback`,
        feedback
      );

      return response.data;
    } catch (error: any) {
      throw MobileApiService.handleError(error);
    }
  }

  /**
   * Get mobile app analytics
   */
  static async getMobileAnalytics(): Promise<
    ApiResponse<{
      usage_stats: {
        sessions_count: number;
        total_time_minutes: number;
        features_used: Record<string, number>;
      };
      performance_metrics: {
        average_load_time: number;
        crash_rate: number;
        error_rate: number;
      };
      user_behavior: {
        most_used_features: string[];
        peak_usage_hours: number[];
        common_actions: string[];
      };
    }>
  > {
    try {
      const response = await axiosInstance.get(
        `${MobileApiService.baseUrl}/analytics`
      );
      return response.data;
    } catch (error: any) {
      throw MobileApiService.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  private static handleError(error: any): Error {
    if (error.response?.data?.error) {
      const apiError = error.response.data.error;
      return new Error(`${apiError.code}: ${apiError.message}`);
    }

    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }

    if (error.message) {
      return new Error(error.message);
    }

    return new Error("Mobile API operation failed");
  }
}

export { MobileApiService };
export const mobileApiService = new MobileApiService();


