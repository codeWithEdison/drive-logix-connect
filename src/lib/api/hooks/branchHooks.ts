// ===========================================
// BRANCH MANAGEMENT HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BranchService } from "../services/branchService";
import { queryKeys } from "../queryClient";
import {
  Branch,
  CreateBranchRequest,
  UpdateBranchRequest,
  BranchSearchParams,
} from "../../../types/shared";

// Query Keys
const branchKeys = {
  all: ["branches"] as const,
  lists: () => [...branchKeys.all, "list"] as const,
  list: (params: BranchSearchParams) =>
    [...branchKeys.lists(), params] as const,
  details: () => [...branchKeys.all, "detail"] as const,
  detail: (id: string) => [...branchKeys.details(), id] as const,
  active: () => [...branchKeys.all, "active"] as const,
  search: (query: string) => [...branchKeys.all, "search", query] as const,
  byCity: (city: string) => [...branchKeys.all, "city", city] as const,
  byCountry: (country: string) =>
    [...branchKeys.all, "country", country] as const,
  stats: (id: string) => [...branchKeys.all, "stats", id] as const,
};

// Hooks
export const useBranches = (params?: BranchSearchParams) => {
  return useQuery({
    queryKey: branchKeys.list(params || {}),
    queryFn: () => BranchService.getBranches(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useBranch = (id: string) => {
  return useQuery({
    queryKey: branchKeys.detail(id),
    queryFn: () => BranchService.getBranchById(id),
    enabled: !!id,
  });
};

export const useActiveBranches = () => {
  return useQuery({
    queryKey: branchKeys.active(),
    queryFn: () => BranchService.getActiveBranches(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useSearchBranches = (query: string) => {
  return useQuery({
    queryKey: branchKeys.search(query),
    queryFn: () => BranchService.searchBranches(query),
    enabled: !!query && query.length > 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useBranchesByCity = (city: string) => {
  return useQuery({
    queryKey: branchKeys.byCity(city),
    queryFn: () => BranchService.getBranchesByCity(city),
    enabled: !!city,
  });
};

export const useBranchesByCountry = (country: string) => {
  return useQuery({
    queryKey: branchKeys.byCountry(country),
    queryFn: () => BranchService.getBranchesByCountry(country),
    enabled: !!country,
  });
};

export const useBranchStats = (id: string) => {
  return useQuery({
    queryKey: branchKeys.stats(id),
    queryFn: () => BranchService.getBranchStats(id),
    enabled: !!id,
  });
};

// Mutations
export const useCreateBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBranchRequest) => BranchService.createBranch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
      queryClient.invalidateQueries({ queryKey: branchKeys.active() });
    },
  });
};

export const useUpdateBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBranchRequest }) =>
      BranchService.updateBranch(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: branchKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
      queryClient.invalidateQueries({ queryKey: branchKeys.active() });
    },
  });
};

export const useDeleteBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => BranchService.deleteBranch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
      queryClient.invalidateQueries({ queryKey: branchKeys.active() });
    },
  });
};

export const useToggleBranchStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      BranchService.toggleBranchStatus(id, isActive),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: branchKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
      queryClient.invalidateQueries({ queryKey: branchKeys.active() });
    },
  });
};

export const useValidateBranchCode = () => {
  return useMutation({
    mutationFn: ({ code, excludeId }: { code: string; excludeId?: string }) =>
      BranchService.validateBranchCode(code, excludeId),
  });
};
