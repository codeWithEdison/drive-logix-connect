import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SearchService } from "../services";
import { queryKeys } from "../queryClient";
import { SearchResults } from "../../../types/shared";

// Search hooks
export const useSearchCargos = (params: {
  q?: string;
  status?: string;
  priority?: string;
  client_id?: string;
  driver_id?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.search.cargos(params),
    queryFn: () => SearchService.searchCargos(params),
    select: (data) => data.data,
    enabled: !!params.q || !!params.status || !!params.priority,
  });
};

export const useSearchUsers = (params: {
  q?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.search.users(params),
    queryFn: () => SearchService.searchUsers(params),
    select: (data) => data.data,
    enabled: !!params.q || !!params.role || !!params.status,
  });
};

export const useSearchVehicles = (params: {
  q?: string;
  type?: string;
  status?: string;
  capacity_min?: number;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.search.vehicles(params),
    queryFn: () => SearchService.searchVehicles(params),
    select: (data) => data.data,
    enabled: !!params.q || !!params.type || !!params.status,
  });
};

export const useSearchDrivers = (params: {
  q?: string;
  status?: string;
  license_type?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.search.drivers(params),
    queryFn: () => SearchService.searchDrivers(params),
    select: (data) => data.data,
    enabled: !!params.q || !!params.status || !!params.license_type,
  });
};

export const useSearchInvoices = (params: {
  q?: string;
  status?: string;
  client_id?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.search.invoices(params),
    queryFn: () => SearchService.searchInvoices(params),
    select: (data) => data.data,
    enabled: !!params.q || !!params.status || !!params.client_id,
  });
};

export const useGlobalSearch = (query: string, entityTypes?: string[]) => {
  return useQuery({
    queryKey: queryKeys.search.global(query, entityTypes),
    queryFn: () => SearchService.globalSearch(query, entityTypes),
    select: (data) => data.data,
    enabled: !!query && query.length > 2,
  });
};

export const useSearchSuggestions = (query: string, entityType?: string) => {
  return useQuery({
    queryKey: queryKeys.search.suggestions(query, entityType),
    queryFn: () => SearchService.getSearchSuggestions(query, entityType),
    select: (data) => data.data,
    enabled: !!query && query.length > 2,
  });
};

export const useRecentSearches = () => {
  return useQuery({
    queryKey: queryKeys.search.recent,
    queryFn: () => SearchService.getRecentSearches(),
    select: (data) => data.data,
  });
};

export const useSearchStatistics = () => {
  return useQuery({
    queryKey: queryKeys.search.statistics,
    queryFn: () => SearchService.getSearchStatistics(),
    select: (data) => data.data,
  });
};

export const useClearSearchHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => SearchService.clearSearchHistory(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.search.recent });
      queryClient.invalidateQueries({ queryKey: queryKeys.search.statistics });
    },
  });
};
