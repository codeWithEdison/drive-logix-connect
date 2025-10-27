import { useState, useCallback } from "react";
import { BatchService } from "@/lib/api/services/batchService";
import { UUID } from "@/types/shared";
import {
  BatchCargoRequest,
  BatchDeliveryStatusRequest,
  BatchGPSLocationRequest,
} from "@/types/mobile";

export interface UseBatchOperationsReturn {
  // Cargo operations
  createMultipleCargos: (request: BatchCargoRequest) => Promise<void>;
  cargoLoading: boolean;
  cargoError: string | null;

  // Delivery operations
  updateDeliveryStatuses: (
    request: BatchDeliveryStatusRequest
  ) => Promise<void>;
  deliveryLoading: boolean;
  deliveryError: string | null;

  // GPS operations
  addGPSLocations: (request: BatchGPSLocationRequest) => Promise<void>;
  gpsLoading: boolean;
  gpsError: string | null;

  // General batch operations
  updateUserPreferences: (userIds: UUID[], preferences: any) => Promise<void>;
  createDeliveryAssignments: (assignments: any[]) => Promise<void>;
  updateCargoStatuses: (updates: any[]) => Promise<void>;
  uploadFiles: (files: any[]) => Promise<void>;
  sendNotifications: (notifications: any[]) => Promise<void>;
  deleteEntities: (entities: any[]) => Promise<void>;

  // Status and history
  getBatchStatus: (batchId: UUID) => Promise<any>;
  retryBatchOperation: (batchId: UUID, options?: any) => Promise<void>;
  getBatchHistory: (
    page?: number,
    limit?: number,
    filters?: any
  ) => Promise<any>;

  // General loading states
  loading: boolean;
  error: string | null;
}

/**
 * Hook for managing batch operations
 * Provides loading states and error handling for batch API calls
 */
export const useBatchOperations = (): UseBatchOperationsReturn => {
  const [cargoLoading, setCargoLoading] = useState(false);
  const [cargoError, setCargoError] = useState<string | null>(null);

  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);

  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargo operations
  const createMultipleCargos = useCallback(
    async (request: BatchCargoRequest) => {
      try {
        setCargoLoading(true);
        setCargoError(null);

        const response = await BatchService.createMultipleCargos(request);

        if (!response.success) {
          throw new Error(response.message || "Failed to create cargos");
        }

        console.log(
          `Successfully created ${response.data.created_count} cargos`
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create cargos";
        setCargoError(errorMessage);
        console.error("Batch cargo creation error:", err);
        throw err;
      } finally {
        setCargoLoading(false);
      }
    },
    []
  );

  // Delivery operations
  const updateDeliveryStatuses = useCallback(
    async (request: BatchDeliveryStatusRequest) => {
      try {
        setDeliveryLoading(true);
        setDeliveryError(null);

        const response = await BatchService.updateDeliveryStatuses(request);

        if (!response.success) {
          throw new Error(
            response.message || "Failed to update delivery statuses"
          );
        }

        console.log(
          `Successfully updated ${response.data.updated_count} deliveries`
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to update delivery statuses";
        setDeliveryError(errorMessage);
        console.error("Batch delivery update error:", err);
        throw err;
      } finally {
        setDeliveryLoading(false);
      }
    },
    []
  );

  // GPS operations
  const addGPSLocations = useCallback(
    async (request: BatchGPSLocationRequest) => {
      try {
        setGpsLoading(true);
        setGpsError(null);

        const response = await BatchService.addGPSLocations(request);

        if (!response.success) {
          throw new Error(response.message || "Failed to add GPS locations");
        }

        console.log(
          `Successfully added ${response.data.added_count} GPS locations`
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to add GPS locations";
        setGpsError(errorMessage);
        console.error("Batch GPS location error:", err);
        throw err;
      } finally {
        setGpsLoading(false);
      }
    },
    []
  );

  // General batch operations
  const updateUserPreferences = useCallback(
    async (userIds: UUID[], preferences: any) => {
      try {
        setLoading(true);
        setError(null);

        const response = await BatchService.updateUserPreferences(
          userIds,
          preferences
        );

        if (!response.success) {
          throw new Error(
            response.message || "Failed to update user preferences"
          );
        }

        console.log(
          `Successfully updated ${response.data.updated_count} user preferences`
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to update user preferences";
        setError(errorMessage);
        console.error("Batch user preferences error:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createDeliveryAssignments = useCallback(async (assignments: any[]) => {
    try {
      setLoading(true);
      setError(null);

      const response = await BatchService.createDeliveryAssignments(
        assignments
      );

      if (!response.success) {
        throw new Error(
          response.message || "Failed to create delivery assignments"
        );
      }

      console.log(
        `Successfully created ${response.data.created_count} delivery assignments`
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to create delivery assignments";
      setError(errorMessage);
      console.error("Batch delivery assignment error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCargoStatuses = useCallback(async (updates: any[]) => {
    try {
      setLoading(true);
      setError(null);

      const response = await BatchService.updateCargoStatuses(updates);

      if (!response.success) {
        throw new Error(response.message || "Failed to update cargo statuses");
      }

      console.log(
        `Successfully updated ${response.data.updated_count} cargo statuses`
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update cargo statuses";
      setError(errorMessage);
      console.error("Batch cargo status error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadFiles = useCallback(async (files: any[]) => {
    try {
      setLoading(true);
      setError(null);

      const response = await BatchService.uploadFiles(files);

      if (!response.success) {
        throw new Error(response.message || "Failed to upload files");
      }

      console.log(
        `Successfully uploaded ${response.data.uploaded_count} files`
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to upload files";
      setError(errorMessage);
      console.error("Batch file upload error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendNotifications = useCallback(async (notifications: any[]) => {
    try {
      setLoading(true);
      setError(null);

      const response = await BatchService.sendNotifications(notifications);

      if (!response.success) {
        throw new Error(response.message || "Failed to send notifications");
      }

      console.log(
        `Successfully sent ${response.data.sent_count} notifications`
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send notifications";
      setError(errorMessage);
      console.error("Batch notification error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteEntities = useCallback(async (entities: any[]) => {
    try {
      setLoading(true);
      setError(null);

      const response = await BatchService.deleteEntities(entities);

      if (!response.success) {
        throw new Error(response.message || "Failed to delete entities");
      }

      console.log(
        `Successfully deleted ${response.data.deleted_count} entities`
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete entities";
      setError(errorMessage);
      console.error("Batch delete error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Status and history operations
  const getBatchStatus = useCallback(async (batchId: UUID) => {
    try {
      const response = await BatchService.getBatchStatus(batchId);
      return response.data;
    } catch (err) {
      console.error("Get batch status error:", err);
      throw err;
    }
  }, []);

  const retryBatchOperation = useCallback(
    async (batchId: UUID, options?: any) => {
      try {
        setLoading(true);
        setError(null);

        const response = await BatchService.retryBatchOperation(
          batchId,
          options
        );

        if (!response.success) {
          throw new Error(
            response.message || "Failed to retry batch operation"
          );
        }

        console.log(`Successfully retried batch operation ${batchId}`);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to retry batch operation";
        setError(errorMessage);
        console.error("Retry batch operation error:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getBatchHistory = useCallback(
    async (page: number = 1, limit: number = 20, filters?: any) => {
      try {
        const response = await BatchService.getBatchHistory(
          page,
          limit,
          filters
        );
        return response.data;
      } catch (err) {
        console.error("Get batch history error:", err);
        throw err;
      }
    },
    []
  );

  return {
    // Cargo operations
    createMultipleCargos,
    cargoLoading,
    cargoError,

    // Delivery operations
    updateDeliveryStatuses,
    deliveryLoading,
    deliveryError,

    // GPS operations
    addGPSLocations,
    gpsLoading,
    gpsError,

    // General batch operations
    updateUserPreferences,
    createDeliveryAssignments,
    updateCargoStatuses,
    uploadFiles,
    sendNotifications,
    deleteEntities,

    // Status and history
    getBatchStatus,
    retryBatchOperation,
    getBatchHistory,

    // General loading states
    loading,
    error,
  };
};

export default useBatchOperations;

