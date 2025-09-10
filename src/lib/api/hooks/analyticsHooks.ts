import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnalyticsService } from "../services";
import { queryKeys } from "../queryClient";
import {
  AnalyticsParams,
  AnalyticsData,
  PerformanceMetrics,
  FinancialAnalytics,
  CargoAnalytics,
  DriverAnalytics,
} from "../../../types/shared";

// Analytics hooks
export const useCargoAnalytics = (params: AnalyticsParams) => {
  return useQuery({
    queryKey: queryKeys.analytics.cargos(params),
    queryFn: () => AnalyticsService.getCargoAnalytics(params),
    select: (data) => {
      console.log("🔍 useCargoAnalytics hook - raw data:", data);
      // The API returns data directly in the data property
      if (data?.data) {
        return data.data;
      } else {
        return data;
      }
    },
  });
};

export const useDriverAnalytics = (params: AnalyticsParams) => {
  return useQuery({
    queryKey: queryKeys.analytics.drivers(params),
    queryFn: () => AnalyticsService.getDriverAnalytics(params),
    select: (data) => {
      console.log("🔍 useDriverAnalytics hook - raw data:", data);
      // The API returns data directly in the data property
      if (data?.data) {
        return data.data;
      } else {
        return data;
      }
    },
  });
};

export const useFinancialAnalytics = (params: AnalyticsParams) => {
  return useQuery({
    queryKey: queryKeys.analytics.financial(params),
    queryFn: () => AnalyticsService.getFinancialAnalytics(params),
    select: (data) => {
      console.log("🔍 useFinancialAnalytics hook - raw data:", data);
      // The API returns data directly in the data property
      if (data?.data) {
        return data.data;
      } else {
        return data;
      }
    },
  });
};

export const usePerformanceAnalytics = (params: AnalyticsParams) => {
  return useQuery({
    queryKey: queryKeys.analytics.performance(params),
    queryFn: () => AnalyticsService.getPerformanceAnalytics(params),
    select: (data) => data.data,
  });
};

export const useVehicleAnalytics = (params: AnalyticsParams) => {
  return useQuery({
    queryKey: queryKeys.analytics.vehicles(params),
    queryFn: () => AnalyticsService.getVehicleAnalytics(params),
    select: (data) => data.data,
  });
};

export const useUserAnalytics = (params: AnalyticsParams) => {
  return useQuery({
    queryKey: queryKeys.analytics.users(params),
    queryFn: () => AnalyticsService.getUserAnalytics(params),
    select: (data) => data.data,
  });
};

export const useDashboardAnalytics = (period?: string) => {
  return useQuery({
    queryKey: queryKeys.analytics.dashboard(period),
    queryFn: () => AnalyticsService.getDashboardAnalytics(period),
    select: (data) => data.data,
    refetchInterval: 300000, // Refetch every 5 minutes
  });
};

export const useRevenueAnalytics = (params: AnalyticsParams) => {
  return useQuery({
    queryKey: queryKeys.analytics.revenue(params),
    queryFn: () => AnalyticsService.getRevenueAnalytics(params),
    select: (data) => data.data,
  });
};

export const useDeliveryTimeAnalytics = (params: AnalyticsParams) => {
  return useQuery({
    queryKey: queryKeys.analytics.deliveryTime(params),
    queryFn: () => AnalyticsService.getDeliveryTimeAnalytics(params),
    select: (data) => data.data,
  });
};

export const useGeographicAnalytics = (params: AnalyticsParams) => {
  return useQuery({
    queryKey: queryKeys.analytics.geographic(params),
    queryFn: () => AnalyticsService.getGeographicAnalytics(params),
    select: (data) => data.data,
  });
};

export const useExportAnalyticsData = () => {
  return useMutation({
    mutationFn: ({
      params,
      format = "csv",
    }: {
      params: AnalyticsParams;
      format?: "csv" | "excel" | "pdf";
    }) => AnalyticsService.exportAnalyticsData(params, format),
  });
};

export const useAnalyticsFilters = () => {
  return useQuery({
    queryKey: queryKeys.analytics.filters,
    queryFn: () => AnalyticsService.getAnalyticsFilters(),
    select: (data) => data.data,
  });
};
