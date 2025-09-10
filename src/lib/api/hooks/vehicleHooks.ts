import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { VehicleService } from "../services";
import { queryKeys } from "../queryClient";
import {
  CreateVehicleRequest,
  VehicleSearchParams,
} from "../../../types/shared";

// Vehicle hooks
export const useVehicles = (params?: VehicleSearchParams) => {
  return useQuery({
    queryKey: queryKeys.vehicles.all(params),
    queryFn: () => VehicleService.getVehicles(params),
    select: (data) => {
      console.log("🔍 useVehicles hook - raw data:", data);
      // The API returns vehicles in data.data.vehicles
      if (data?.data?.vehicles && Array.isArray(data.data.vehicles)) {
        return data.data.vehicles;
      } else if (data?.data && Array.isArray(data.data)) {
        return data.data;
      } else if (Array.isArray(data)) {
        return data;
      } else {
        return [];
      }
    },
  });
};

export const useVehicleById = (id: string) => {
  return useQuery({
    queryKey: queryKeys.vehicles.detail(id),
    queryFn: () => VehicleService.getVehicleById(id),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useCreateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVehicleRequest) =>
      VehicleService.createVehicle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all() });
    },
  });
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateVehicleRequest>;
    }) => VehicleService.updateVehicle(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.vehicles.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all() });
    },
  });
};

export const useApproveVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      approved,
      reason,
    }: {
      id: string;
      approved: boolean;
      reason?: string;
    }) => VehicleService.approveVehicle(id, approved, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.vehicles.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all() });
    },
  });
};

export const useAddMaintenanceRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      VehicleService.addMaintenanceRecord(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.vehicles.maintenance(id),
      });
    },
  });
};

export const useVehicleMaintenanceHistory = (id: string) => {
  return useQuery({
    queryKey: queryKeys.vehicles.maintenance(id),
    queryFn: () => VehicleService.getMaintenanceHistory(id),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useAvailableVehicles = (params?: {
  type?: string;
  capacity_min?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.vehicles.available(params),
    queryFn: () => VehicleService.getAvailableVehicles(params),
    select: (data) => data.data,
  });
};
