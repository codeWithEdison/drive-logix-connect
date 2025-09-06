import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CargoService, CargoCategoryService } from "../services";
import { queryKeys } from "../queryClient";
import {
  CreateCargoRequest,
  CargoStatus,
  CargoSearchParams,
} from "../../../types/shared";

// Cargo hooks
export const useCreateCargo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCargoRequest) => CargoService.createCargo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.cargos.clientCargos(),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.cargos.all() });
    },
  });
};

export const useCargoById = (id: string) => {
  return useQuery({
    queryKey: queryKeys.cargos.detail(id),
    queryFn: () => CargoService.getCargoById(id),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useUpdateCargoStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: CargoStatus;
      notes?: string;
    }) => CargoService.updateCargoStatus(id, status, notes),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cargos.detail(id) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.cargos.tracking(id),
      });
    },
  });
};

export const useClientCargos = (params?: CargoSearchParams) => {
  return useQuery({
    queryKey: queryKeys.cargos.clientCargos(params),
    queryFn: () => CargoService.getClientCargos(params),
    select: (data) => {
      // Handle the actual API response structure
      // API returns: { success: true, data: Cargo[], meta: { pagination } }
      // We need to return the data array directly
      console.log("🔍 useClientCargos select - raw data:", data);
      console.log("🔍 useClientCargos select - data.data:", data.data);
      return data.data;
    },
    staleTime: 0, // Force fresh data
    cacheTime: 0, // Don't cache
  });
};

export const useDriverCargos = (params?: CargoSearchParams) => {
  return useQuery({
    queryKey: queryKeys.cargos.driverCargos(params),
    queryFn: () => CargoService.getDriverCargos(params),
    select: (data) => data.data,
  });
};

export const useAllCargos = (params?: CargoSearchParams) => {
  return useQuery({
    queryKey: queryKeys.cargos.all(params),
    queryFn: () => CargoService.getAllCargos(params),
    select: (data) => data.data,
  });
};

export const useCancelCargo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      CargoService.cancelCargo(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cargos.detail(id) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.cargos.clientCargos(),
      });
    },
  });
};

export const useCargoTracking = (id: string) => {
  return useQuery({
    queryKey: queryKeys.cargos.tracking(id),
    queryFn: () => CargoService.getCargoTracking(id),
    select: (data) => data.data,
    enabled: !!id,
    refetchInterval: 30000, // Refetch every 30 seconds for live tracking
  });
};

export const useEstimateCargoCost = () => {
  return useMutation({
    mutationFn: (data: Partial<CreateCargoRequest>) =>
      CargoService.estimateCost(data),
  });
};

// Cargo Category hooks
export const useCargoCategories = (params?: {
  is_active?: boolean;
  search?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.cargoCategories.all(params),
    queryFn: () => CargoCategoryService.getCategories(params),
    select: (data) => data.data,
  });
};

export const useCargoCategoryById = (id: string) => {
  return useQuery({
    queryKey: queryKeys.cargoCategories.detail(id),
    queryFn: () => CargoCategoryService.getCategoryById(id),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useCreateCargoCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => CargoCategoryService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.cargoCategories.all(),
      });
    },
  });
};

export const useUpdateCargoCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      CargoCategoryService.updateCategory(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.cargoCategories.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.cargoCategories.all(),
      });
    },
  });
};

export const useDeleteCargoCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => CargoCategoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.cargoCategories.all(),
      });
    },
  });
};
