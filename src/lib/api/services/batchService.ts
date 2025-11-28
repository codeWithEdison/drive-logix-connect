import axiosInstance from "../axios";
import { ApiResponse, UUID } from "../../../types/shared";
import {
  BatchCargoRequest,
  BatchCargoResponse,
  BatchDeliveryStatusRequest,
  BatchDeliveryStatusResponse,
  BatchGPSLocationRequest,
  BatchGPSLocationResponse,
} from "../../../types/mobile";

/**
 * BatchService handles batch operations for improved performance
 * Reduces API calls by processing multiple items in single requests
 */
class BatchService {
  private static baseUrl = "/batch";

  /**
   * Create multiple cargos in a single batch operation
   */
  static async createMultipleCargos(
    request: BatchCargoRequest
  ): Promise<BatchCargoResponse> {
    try {
      const response = await axiosInstance.post(
        `${BatchService.baseUrl}/cargos`,
        request
      );

      return response.data;
    } catch (error: any) {
      throw BatchService.handleError(error);
    }
  }

  /**
   * Update multiple delivery statuses in a single batch operation
   */
  static async updateDeliveryStatuses(
    request: BatchDeliveryStatusRequest
  ): Promise<BatchDeliveryStatusResponse> {
    try {
      const response = await axiosInstance.post(
        `${BatchService.baseUrl}/delivery-statuses`,
        request
      );

      return response.data;
    } catch (error: any) {
      throw BatchService.handleError(error);
    }
  }

  /**
   * Add multiple GPS locations in a single batch operation
   */
  static async addGPSLocations(
    request: BatchGPSLocationRequest
  ): Promise<BatchGPSLocationResponse> {
    try {
      const response = await axiosInstance.post(
        `${BatchService.baseUrl}/gps-locations`,
        request
      );

      return response.data;
    } catch (error: any) {
      throw BatchService.handleError(error);
    }
  }

  /**
   * Batch update user preferences
   */
  static async updateUserPreferences(
    userIds: UUID[],
    preferences: {
      notifications?: boolean;
      location_sharing?: boolean;
      dark_mode?: boolean;
    }
  ): Promise<
    ApiResponse<{
      updated_count: number;
      failed_count: number;
      failed_users: UUID[];
    }>
  > {
    try {
      const response = await axiosInstance.post(
        `${BatchService.baseUrl}/user-preferences`,
        {
          user_ids: userIds,
          preferences,
        }
      );

      return response.data;
    } catch (error: any) {
      throw BatchService.handleError(error);
    }
  }

  /**
   * Batch create delivery assignments
   */
  static async createDeliveryAssignments(
    assignments: Array<{
      cargo_id: UUID;
      driver_id: UUID;
      vehicle_id: UUID;
      assigned_weight_kg?: number;
      assigned_volume?: number;
      notes?: string;
    }>
  ): Promise<
    ApiResponse<{
      created_count: number;
      failed_count: number;
      assignments: Array<{
        id: UUID;
        cargo_id: UUID;
        driver_id: UUID;
        status: string;
        created_at: string;
      }>;
      failures: Array<{
        cargo_id: UUID;
        driver_id: UUID;
        error: string;
      }>;
    }>
  > {
    try {
      const response = await axiosInstance.post(
        `${BatchService.baseUrl}/delivery-assignments`,
        { assignments }
      );

      return response.data;
    } catch (error: any) {
      throw BatchService.handleError(error);
    }
  }

  /**
   * Batch update cargo statuses
   */
  static async updateCargoStatuses(
    updates: Array<{
      cargo_id: UUID;
      status: string;
      notes?: string;
      updated_by: UUID;
    }>
  ): Promise<
    ApiResponse<{
      updated_count: number;
      failed_count: number;
      cargos: Array<{
        id: UUID;
        status: string;
        updated_at: string;
      }>;
      failures: Array<{
        cargo_id: UUID;
        error: string;
      }>;
    }>
  > {
    try {
      const response = await axiosInstance.post(
        `${BatchService.baseUrl}/cargo-statuses`,
        { updates }
      );

      return response.data;
    } catch (error: any) {
      throw BatchService.handleError(error);
    }
  }

  /**
   * Batch upload files
   */
  static async uploadFiles(
    files: Array<{
      file: File;
      type: string;
      category?: string;
      metadata?: Record<string, any>;
    }>
  ): Promise<
    ApiResponse<{
      uploaded_count: number;
      failed_count: number;
      files: Array<{
        id: UUID;
        filename: string;
        file_url: string;
        size: number;
      }>;
      failures: Array<{
        filename: string;
        error: string;
      }>;
    }>
  > {
    try {
      const formData = new FormData();

      files.forEach((fileData, index) => {
        formData.append(`files[${index}]`, fileData.file);
        formData.append(`types[${index}]`, fileData.type);
        if (fileData.category) {
          formData.append(`categories[${index}]`, fileData.category);
        }
        if (fileData.metadata) {
          formData.append(
            `metadata[${index}]`,
            JSON.stringify(fileData.metadata)
          );
        }
      });

      const response = await axiosInstance.post(
        `${BatchService.baseUrl}/files`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw BatchService.handleError(error);
    }
  }

  /**
   * Batch send notifications
   */
  static async sendNotifications(
    notifications: Array<{
      user_id: UUID;
      title: string;
      message: string;
      type: "push" | "email" | "sms" | "in_app";
      category?: string;
      data?: Record<string, any>;
    }>
  ): Promise<
    ApiResponse<{
      sent_count: number;
      failed_count: number;
      notifications: Array<{
        id: UUID;
        user_id: UUID;
        status: string;
        sent_at: string;
      }>;
      failures: Array<{
        user_id: UUID;
        error: string;
      }>;
    }>
  > {
    try {
      const response = await axiosInstance.post(
        `${BatchService.baseUrl}/notifications`,
        { notifications }
      );

      return response.data;
    } catch (error: any) {
      throw BatchService.handleError(error);
    }
  }

  /**
   * Batch delete entities
   */
  static async deleteEntities(
    entities: Array<{
      type: "cargo" | "delivery" | "user" | "vehicle";
      id: UUID;
    }>
  ): Promise<
    ApiResponse<{
      deleted_count: number;
      failed_count: number;
      deleted_entities: Array<{
        type: string;
        id: UUID;
      }>;
      failures: Array<{
        type: string;
        id: UUID;
        error: string;
      }>;
    }>
  > {
    try {
      const response = await axiosInstance.post(
        `${BatchService.baseUrl}/delete`,
        { entities }
      );

      return response.data;
    } catch (error: any) {
      throw BatchService.handleError(error);
    }
  }

  /**
   * Get batch operation status
   */
  static async getBatchStatus(batchId: UUID): Promise<
    ApiResponse<{
      id: UUID;
      type: string;
      status: "pending" | "processing" | "completed" | "failed";
      progress: number;
      total_items: number;
      processed_items: number;
      failed_items: number;
      created_at: string;
      completed_at?: string;
      error_message?: string;
    }>
  > {
    try {
      const response = await axiosInstance.get(
        `${BatchService.baseUrl}/status/${batchId}`
      );

      return response.data;
    } catch (error: any) {
      throw BatchService.handleError(error);
    }
  }

  /**
   * Retry failed batch operations
   */
  static async retryBatchOperation(
    batchId: UUID,
    retryOptions?: {
      retry_failed_only?: boolean;
      max_retries?: number;
    }
  ): Promise<
    ApiResponse<{
      retry_id: UUID;
      status: string;
      retry_count: number;
    }>
  > {
    try {
      const response = await axiosInstance.post(
        `${BatchService.baseUrl}/retry/${batchId}`,
        retryOptions || {}
      );

      return response.data;
    } catch (error: any) {
      throw BatchService.handleError(error);
    }
  }

  /**
   * Get batch operation history
   */
  static async getBatchHistory(
    page: number = 1,
    limit: number = 20,
    filters?: {
      type?: string;
      status?: string;
      date_from?: string;
      date_to?: string;
    }
  ): Promise<
    ApiResponse<{
      operations: Array<{
        id: UUID;
        type: string;
        status: string;
        total_items: number;
        processed_items: number;
        failed_items: number;
        created_at: string;
        completed_at?: string;
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
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (filters?.type) params.append("type", filters.type);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.date_from) params.append("date_from", filters.date_from);
      if (filters?.date_to) params.append("date_to", filters.date_to);

      const response = await axiosInstance.get(
        `${BatchService.baseUrl}/history?${params.toString()}`
      );

      return response.data;
    } catch (error: any) {
      throw BatchService.handleError(error);
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

    return new Error("Batch operation failed");
  }
}

export { BatchService };
export const batchService = new BatchService();

