import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TrackingService } from "../services";
import { queryKeys } from "../queryClient";
import { CargoStatus } from "../../../types/shared";

// Live tracking hooks with auto-refresh
export const useLiveCargoTracking = (
  cargoId: string,
  options?: {
    refetchInterval?: number;
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: queryKeys.tracking.cargoDetail(cargoId),
    queryFn: () => TrackingService.getCargoTracking(cargoId),
    select: (data) => data.data,
    enabled: !!cargoId && options?.enabled !== false,
    refetchInterval: options?.refetchInterval || 30000, // 30 seconds default
    refetchIntervalInBackground: true,
    staleTime: 15000, // 15 seconds
  });
};

// Live GPS tracking for vehicles
export const useLiveVehicleTracking = (
  vehicleId: string,
  options?: {
    refetchInterval?: number;
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: queryKeys.tracking.vehicleLive(vehicleId),
    queryFn: () => TrackingService.getLiveTracking(vehicleId),
    select: (data) => data.data,
    enabled: !!vehicleId && options?.enabled !== false,
    refetchInterval: options?.refetchInterval || 15000, // 15 seconds for live tracking
    refetchIntervalInBackground: true,
    staleTime: 5000, // 5 seconds
  });
};

// Get all in-transit cargo with live tracking
export const useInTransitCargo = (
  params?: {
    page?: number;
    limit?: number;
    driver_id?: string;
  },
  options?: {
    refetchInterval?: number;
  }
) => {
  return useQuery({
    queryKey: queryKeys.tracking.inTransitCargo(params),
    queryFn: () => TrackingService.getInTransitCargo(params),
    select: (data) => data.data,
    refetchInterval: options?.refetchInterval || 60000, // 1 minute for list
    refetchIntervalInBackground: true,
    staleTime: 30000, // 30 seconds
  });
};

// Get vehicle tracking history
export const useVehicleTrackingHistory = (
  vehicleId: string,
  params?: {
    start_time?: string;
    end_time?: string;
    page?: number;
    limit?: number;
  }
) => {
  return useQuery({
    queryKey: queryKeys.tracking.vehicleHistory(vehicleId, params),
    queryFn: () => TrackingService.getVehicleTrackingHistory(vehicleId, params),
    select: (data) => data.data,
    enabled: !!vehicleId,
  });
};

// Get route progress
export const useLiveRouteProgress = (
  cargoId: string,
  options?: {
    refetchInterval?: number;
  }
) => {
  return useQuery({
    queryKey: queryKeys.tracking.routeProgress(cargoId),
    queryFn: () => TrackingService.getRouteProgress(cargoId),
    select: (data) => data.data,
    enabled: !!cargoId,
    refetchInterval: options?.refetchInterval || 30000,
    refetchIntervalInBackground: true,
    staleTime: 10000,
  });
};

// Update tracking status mutation
export const useUpdateTrackingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cargoId,
      data,
    }: {
      cargoId: string;
      data: {
        status: CargoStatus;
        latitude?: number;
        longitude?: number;
        notes?: string;
      };
    }) => TrackingService.updateTrackingStatus(cargoId, data),
    onSuccess: (_, { cargoId }) => {
      // Invalidate tracking queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.tracking.cargoDetail(cargoId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tracking.routeProgress(cargoId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tracking.inTransitCargo(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tracking.summary(),
      });
    },
  });
};

// Get delivery updates
export const useDeliveryUpdates = (
  cargoId: string,
  lastUpdate?: string,
  options?: {
    refetchInterval?: number;
  }
) => {
  return useQuery({
    queryKey: queryKeys.tracking.deliveryUpdates(cargoId, lastUpdate),
    queryFn: () => TrackingService.getDeliveryUpdates(cargoId, lastUpdate),
    select: (data) => data.data,
    enabled: !!cargoId,
    refetchInterval: options?.refetchInterval || 20000, // 20 seconds
    refetchIntervalInBackground: true,
    staleTime: 10000,
  });
};

// Get nearby vehicles
export const useNearbyVehicles = (
  latitude: number,
  longitude: number,
  radius: number = 5000,
  options?: {
    refetchInterval?: number;
  }
) => {
  return useQuery({
    queryKey: queryKeys.tracking.nearbyVehicles(latitude, longitude, radius),
    queryFn: () =>
      TrackingService.getNearbyVehicles(latitude, longitude, radius),
    select: (data) => data.data,
    enabled: !!(latitude && longitude),
    refetchInterval: options?.refetchInterval || 45000, // 45 seconds
    refetchIntervalInBackground: true,
    staleTime: 20000,
  });
};

// Get tracking summary for dashboard
export const useTrackingSummary = (options?: { refetchInterval?: number }) => {
  return useQuery({
    queryKey: queryKeys.tracking.summary(),
    queryFn: () => TrackingService.getTrackingSummary(),
    select: (data) => data.data,
    refetchInterval: options?.refetchInterval || 120000, // 2 minutes
    refetchIntervalInBackground: true,
    staleTime: 60000, // 1 minute
  });
};

// Get tracking analytics
export const useTrackingAnalytics = (params?: {
  start_date?: string;
  end_date?: string;
  vehicle_id?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.tracking.analytics(params),
    queryFn: () => TrackingService.getTrackingAnalytics(params),
    select: (data) => data.data,
  });
};

// Optimistic update hook for better UX
export const useOptimisticTrackingUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cargoId,
      data,
    }: {
      cargoId: string;
      data: {
        status: CargoStatus;
        latitude?: number;
        longitude?: number;
        notes?: string;
      };
    }) => TrackingService.updateTrackingStatus(cargoId, data),

    onMutate: async ({ cargoId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.tracking.cargoDetail(cargoId),
      });

      // Snapshot previous value
      const previousTracking = queryClient.getQueryData(
        queryKeys.tracking.cargoDetail(cargoId)
      );

      // Optimistically update
      queryClient.setQueryData(
        queryKeys.tracking.cargoDetail(cargoId),
        (old: any) => ({
          ...old,
          current_status: data.status,
          last_updated: new Date().toISOString(),
          ...(data.latitude &&
            data.longitude && {
              location_history: [
                ...(old?.location_history || []),
                {
                  id: `temp-${Date.now()}`,
                  latitude: data.latitude,
                  longitude: data.longitude,
                  recorded_at: new Date().toISOString(),
                },
              ],
            }),
        })
      );

      return { previousTracking };
    },

    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTracking) {
        queryClient.setQueryData(
          queryKeys.tracking.cargoDetail(variables.cargoId),
          context.previousTracking
        );
      }
    },

    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: queryKeys.tracking.cargoDetail(variables.cargoId),
      });
    },
  });
};
