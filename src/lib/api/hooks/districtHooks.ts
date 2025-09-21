// ===========================================
// DISTRICT MANAGEMENT HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DistrictService } from "../services/districtService";
import { queryKeys } from "../queryClient";
import {
  District,
  CreateDistrictRequest,
  UpdateDistrictRequest,
  DistrictSearchParams,
} from "../../../types/shared";

// Query Keys
const districtKeys = {
  all: ["districts"] as const,
  lists: () => [...districtKeys.all, "list"] as const,
  list: (params: DistrictSearchParams) =>
    [...districtKeys.lists(), params] as const,
  details: () => [...districtKeys.all, "detail"] as const,
  detail: (id: string) => [...districtKeys.details(), id] as const,
  active: () => [...districtKeys.all, "active"] as const,
  byBranch: (branchId: string) =>
    [...districtKeys.all, "branch", branchId] as const,
  activeByBranch: (branchId: string) =>
    [...districtKeys.all, "active-branch", branchId] as const,
  search: (query: string) => [...districtKeys.all, "search", query] as const,
  stats: (id: string) => [...districtKeys.all, "stats", id] as const,
};

// Hooks
export const useDistricts = (params?: DistrictSearchParams) => {
  return useQuery({
    queryKey: districtKeys.list(params || {}),
    queryFn: () => DistrictService.getDistricts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useDistrict = (id: string) => {
  return useQuery({
    queryKey: districtKeys.detail(id),
    queryFn: () => DistrictService.getDistrictById(id),
    enabled: !!id,
  });
};

export const useActiveDistricts = () => {
  return useQuery({
    queryKey: districtKeys.active(),
    queryFn: () => DistrictService.getActiveDistricts(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useDistrictsByBranch = (branchId: string) => {
  return useQuery({
    queryKey: districtKeys.byBranch(branchId),
    queryFn: () => DistrictService.getDistrictsByBranch(branchId),
    enabled: !!branchId,
  });
};

export const useActiveDistrictsByBranch = (branchId: string) => {
  return useQuery({
    queryKey: districtKeys.activeByBranch(branchId),
    queryFn: () => DistrictService.getActiveDistrictsByBranch(branchId),
    enabled: !!branchId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useSearchDistricts = (query: string) => {
  return useQuery({
    queryKey: districtKeys.search(query),
    queryFn: () => DistrictService.searchDistricts(query),
    enabled: !!query && query.length > 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useDistrictStats = (id: string) => {
  return useQuery({
    queryKey: districtKeys.stats(id),
    queryFn: () => DistrictService.getDistrictStats(id),
    enabled: !!id,
  });
};

export const useDistrictsWithBranches = () => {
  return useQuery({
    queryKey: [...districtKeys.all, "with-branches"],
    queryFn: () => DistrictService.getDistrictsWithBranches(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Mutations
export const useCreateDistrict = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDistrictRequest) =>
      DistrictService.createDistrict(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: districtKeys.lists() });
      queryClient.invalidateQueries({ queryKey: districtKeys.active() });
      queryClient.invalidateQueries({
        queryKey: districtKeys.byBranch(variables.branch_id),
      });
      queryClient.invalidateQueries({
        queryKey: districtKeys.activeByBranch(variables.branch_id),
      });
    },
  });
};

export const useUpdateDistrict = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDistrictRequest }) =>
      DistrictService.updateDistrict(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: districtKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: districtKeys.lists() });
      queryClient.invalidateQueries({ queryKey: districtKeys.active() });
    },
  });
};

export const useDeleteDistrict = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => DistrictService.deleteDistrict(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: districtKeys.lists() });
      queryClient.invalidateQueries({ queryKey: districtKeys.active() });
    },
  });
};

export const useToggleDistrictStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      DistrictService.toggleDistrictStatus(id, isActive),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: districtKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: districtKeys.lists() });
      queryClient.invalidateQueries({ queryKey: districtKeys.active() });
    },
  });
};

export const useBulkUpdateDistrictsStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      districtIds,
      isActive,
    }: {
      districtIds: string[];
      isActive: boolean;
    }) => DistrictService.bulkUpdateDistrictsStatus(districtIds, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: districtKeys.lists() });
      queryClient.invalidateQueries({ queryKey: districtKeys.active() });
    },
  });
};

export const useValidateDistrictCode = () => {
  return useMutation({
    mutationFn: ({
      code,
      branchId,
      excludeId,
    }: {
      code: string;
      branchId: string;
      excludeId?: string;
    }) => DistrictService.validateDistrictCode(code, branchId, excludeId),
  });
};
