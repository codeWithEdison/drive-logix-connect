import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CargoService, CargoCategoryService } from "../services";
import { queryKeys } from "../queryClient";
import {
  CreateCargoRequest,
  CargoStatus,
  CargoSearchParams,
} from "../../../types/shared";
import { UnassignedCargoFilters } from "../services/cargoService";

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

export const useUnassignedCargos = (filters: UnassignedCargoFilters = {}) => {
  return useQuery({
    queryKey: ["unassigned-cargos", filters],
    queryFn: () => CargoService.getUnassignedCargos(filters),
    select: (data) => data.data,
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

export const useUpdateCargo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        category_id?: string;
        type?: string;
        description?: string;
        weight_kg?: number;
        volume?: number;
        dimensions?: {
          length: number;
          width: number;
          height: number;
        };
        pickup_location_id?: string;
        pickup_address?: string;
        pickup_contact?: string;
        pickup_phone?: string;
        pickup_instructions?: string;
        destination_location_id?: string;
        destination_address?: string;
        destination_contact?: string;
        destination_phone?: string;
        delivery_instructions?: string;
        special_requirements?: string;
        insurance_required?: boolean;
        insurance_amount?: number;
        fragile?: boolean;
        temperature_controlled?: boolean;
        priority?: "low" | "normal" | "high" | "urgent";
        pickup_date?: string;
        delivery_date?: string;
        estimated_cost?: number;
        distance_km?: number;
      };
    }) => CargoService.updateCargo(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.cargos.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.cargos.all() });
    },
  });
};

export const useClientCargos = (params?: CargoSearchParams) => {
  return useQuery({
    queryKey: queryKeys.cargos.clientCargos(params),
    queryFn: () => CargoService.getClientCargos(params),
    select: (data) => {
      console.log("🔍 useClientCargos select - raw data:", data);
      console.log("🔍 useClientCargos select - data.data:", data.data);
      console.log("🔍 useClientCargos select - data.meta:", (data as any).meta);
      console.log(
        "🔍 useClientCargos select - data.meta.pagination:",
        (data as any).meta?.pagination
      );

      // Handle the API response structure with meta object
      const responseData = data.data || [];
      const paginationData = (data as any).meta?.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      };

      return {
        cargos: Array.isArray(responseData) ? responseData : [],
        pagination: paginationData,
      };
    },
    staleTime: 0, // Force fresh data
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
    placeholderData: (previousData) => previousData, // Keep existing data while loading new data
    select: (data) => {
      console.log("🔍 useAllCargos select - raw data:", data);
      console.log("🔍 useAllCargos select - data.data:", data.data);
      console.log("🔍 useAllCargos select - data.meta:", (data as any).meta);
      // Return both the data array and pagination metadata
      return {
        data: data.data || [],
        pagination: (data as any).meta?.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    },
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
    mutationFn: (data: {
      weight_kg: number;
      distance_km: number;
      category_id: string;
    }) => CargoService.estimateCost(data),
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
