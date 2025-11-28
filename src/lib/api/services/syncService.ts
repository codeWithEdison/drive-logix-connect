import axiosInstance from "../axios";
import { ApiResponse } from "../../../types/shared";
import {
  SyncItem,
  SyncPushRequest,
  SyncPushResponse,
  SyncPullResponse,
  SyncTriggerResponse,
} from "../../../types/mobile";

/**
 * SyncService handles offline synchronization with backend
 * Implements push/pull sync pattern for mobile applications
 */
class SyncService {
  private static baseUrl = "/sync";

  /**
   * Push local changes to server for synchronization
   */
  static async pushChanges(
    changes: SyncItem[]
  ): Promise<ApiResponse<SyncPushResponse>> {
    try {
      const request: SyncPushRequest = { changes };

      const response = await axiosInstance.post(
        `${SyncService.baseUrl}/push`,
        request
      );

      return response.data;
    } catch (error: any) {
      throw SyncService.handleError(error);
    }
  }

  /**
   * Pull pending changes from server to mobile client
   */
  static async pullChanges(
    lastSync?: string
  ): Promise<ApiResponse<SyncPullResponse>> {
    try {
      const params = new URLSearchParams();
      if (lastSync) {
        params.append("last_sync", lastSync);
      }

      const response = await axiosInstance.get(
        `${SyncService.baseUrl}/pull?${params.toString()}`
      );

      return response.data;
    } catch (error: any) {
      throw SyncService.handleError(error);
    }
  }

  /**
   * Manually trigger processing of the sync queue
   */
  static async triggerProcessing(): Promise<ApiResponse<SyncTriggerResponse>> {
    try {
      const response = await axiosInstance.post(
        `${SyncService.baseUrl}/trigger-processing`
      );

      return response.data;
    } catch (error: any) {
      throw SyncService.handleError(error);
    }
  }

  /**
   * Get sync status and queue information
   */
  static async getSyncStatus(): Promise<
    ApiResponse<{
      queue_size: number;
      last_sync: string;
      pending_changes: number;
      failed_changes: number;
    }>
  > {
    try {
      const response = await axiosInstance.get(`${SyncService.baseUrl}/status`);
      return response.data;
    } catch (error: any) {
      throw SyncService.handleError(error);
    }
  }

  /**
   * Resolve sync conflicts
   */
  static async resolveConflict(
    conflictId: string,
    resolution: "server" | "client" | "manual",
    manualData?: any
  ): Promise<ApiResponse<null>> {
    try {
      const response = await axiosInstance.post(
        `${SyncService.baseUrl}/resolve-conflict`,
        {
          conflict_id: conflictId,
          resolution,
          manual_data: manualData,
        }
      );

      return response.data;
    } catch (error: any) {
      throw SyncService.handleError(error);
    }
  }

  /**
   * Clear sync queue (admin only)
   */
  static async clearQueue(): Promise<
    ApiResponse<{
      cleared_count: number;
    }>
  > {
    try {
      const response = await axiosInstance.delete(
        `${SyncService.baseUrl}/queue`
      );
      return response.data;
    } catch (error: any) {
      throw SyncService.handleError(error);
    }
  }

  /**
   * Get sync history
   */
  static async getSyncHistory(
    page: number = 1,
    limit: number = 20
  ): Promise<
    ApiResponse<{
      history: Array<{
        id: string;
        sync_type: "push" | "pull" | "trigger";
        changes_count: number;
        success: boolean;
        error_message?: string;
        timestamp: string;
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

      const response = await axiosInstance.get(
        `${SyncService.baseUrl}/history?${params.toString()}`
      );

      return response.data;
    } catch (error: any) {
      throw SyncService.handleError(error);
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

    return new Error("Sync operation failed");
  }
}

export { SyncService };
export const syncService = new SyncService();

