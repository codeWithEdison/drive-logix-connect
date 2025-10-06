import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardService } from "../services/dashboardService";
import { queryKeys } from "../queryClient";

// ===========================================
// DASHBOARD HOOKS
// ===========================================

// ===========================================
// ROLE-SPECIFIC DASHBOARD HOOKS
// ===========================================

// Driver Dashboard Hook
export const useDriverDashboard = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.driver(),
    queryFn: () => DashboardService.getDriverDashboard(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // 30 seconds for real-time updates
  });
};

// Client Dashboard Hook
export const useClientDashboard = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.client(),
    queryFn: () => DashboardService.getClientDashboard(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // 30 seconds for real-time updates
  });
};

// Admin Dashboard Hook
export const useAdminDashboard = (params?: {
  period?: string;
  start_date?: string;
  end_date?: string;
}) => {
  return useQuery({
    queryKey: [...queryKeys.dashboard.admin(), params] as any,
    queryFn: () => DashboardService.getAdminDashboard(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // 1 minute for admin updates
  });
};

// Super Admin Dashboard Hook
export const useSuperAdminDashboard = (params?: {
  period?: string;
  start_date?: string;
  end_date?: string;
}) => {
  return useQuery({
    queryKey: [...queryKeys.dashboard.superAdmin(), params] as any,
    queryFn: () => DashboardService.getSuperAdminDashboard(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // 1 minute for super admin updates
  });
};

// ===========================================
// CHART DATA HOOKS
// ===========================================

// Revenue Chart Hook
export const useRevenueChart = (params?: {
  period?: string;
  role?: string;
  start_date?: string;
  end_date?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.dashboard.charts.revenue(params),
    queryFn: () => DashboardService.getRevenueChartData(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Delivery Status Chart Hook
export const useDeliveryStatusChart = (params?: {
  period?: string;
  start_date?: string;
  end_date?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.dashboard.charts.deliveryStatus(params),
    queryFn: () => DashboardService.getDeliveryStatusChart(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Fleet Performance Chart Hook
export const useFleetPerformanceChart = (params?: {
  vehicle_type?: string;
  period?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.dashboard.charts.fleetPerformance(params),
    queryFn: () => DashboardService.getFleetPerformanceChart(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Geographic Chart Hook
export const useGeographicChart = (params?: {
  region?: string;
  period?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.dashboard.charts.geographic(params),
    queryFn: () => DashboardService.getGeographicChart(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Driver Performance Chart Hook
export const useDriverPerformanceChart = (params?: {
  driver_id?: string;
  period?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.dashboard.charts.driverPerformance(params),
    queryFn: () => DashboardService.getDriverPerformanceChart(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Usage Trends Chart Hook
export const useUsageTrendsChart = (params?: {
  period?: string;
  start_date?: string;
  end_date?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.dashboard.charts.usageTrends(params),
    queryFn: () => DashboardService.getUsageTrendsChart(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Admin Performance Chart Hook
export const useAdminPerformanceChart = (params?: {
  admin_id?: string;
  period?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.dashboard.charts.adminPerformance(params),
    queryFn: () => DashboardService.getAdminPerformanceChart(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Users Distribution Chart Hook
export const useUsersDistributionChart = (params?: {
  role?: string;
  period?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.dashboard.charts.usersDistribution(params),
    queryFn: () => DashboardService.getUsersDistributionChart(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// ===========================================
// TABLE DATA HOOKS
// ===========================================

// Recent Deliveries Table Hook
export const useRecentDeliveriesTable = (params?: {
  limit?: number;
  role?: string;
  status?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.dashboard.tables.recentDeliveries(params),
    queryFn: () => DashboardService.getRecentDeliveriesTable(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Pending Approvals Table Hook
export const usePendingApprovalsTable = (params?: {
  status?: string;
  role?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.dashboard.tables.pendingApprovals(params),
    queryFn: () => DashboardService.getPendingApprovalsTable(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// System Alerts Table Hook
export const useSystemAlertsTable = (params?: {
  severity?: string;
  is_resolved?: boolean;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.dashboard.tables.systemAlerts(params),
    queryFn: () => DashboardService.getSystemAlertsTable(params),
    staleTime: 2 * 60 * 1000, // 2 minutes for alerts
    refetchInterval: 30 * 1000, // 30 seconds for real-time alerts
  });
};

// Financial Transactions Table Hook
export const useFinancialTransactionsTable = (params?: {
  period?: string;
  status?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.dashboard.tables.financialTransactions(params),
    queryFn: () => DashboardService.getFinancialTransactionsTable(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// ===========================================
// SYSTEM HEALTH HOOK
// ===========================================

// System Health Hook - Note: This is also available in systemHooks.ts
// Keeping this for dashboard-specific usage with different caching strategy
export const useDashboardSystemHealth = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.systemHealth(),
    queryFn: () => DashboardService.getSystemHealth(),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // 30 seconds for real-time monitoring
  });
};

// ===========================================
// MUTATION HOOKS
// ===========================================

// Update Driver Status Hook - Note: This is also available in driverHooks.ts
// Keeping this for dashboard-specific usage with different invalidation strategy
export const useDashboardUpdateDriverStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: "available" | "on_duty" | "unavailable") =>
      DashboardService.updateDriverStatus(status),
    onSuccess: () => {
      // Invalidate driver dashboard to refresh data
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.driver(),
      });
    },
  });
};

// Apply Dashboard Filters Hook
export const useApplyDashboardFilters = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (filters: {
      date_range?: {
        start_date: string;
        end_date: string;
      };
      period?: string;
      user_role?: string;
      driver_status?: string;
      vehicle_type?: string;
      cargo_status?: string;
      payment_method?: string;
    }) => DashboardService.applyDashboardFilters(filters),
    onSuccess: () => {
      // Invalidate all dashboard queries to refresh with new filters
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.all(),
      });
    },
  });
};

// ===========================================
// UTILITY HOOKS
// ===========================================

// Refresh All Dashboard Data Hook
export const useRefreshDashboard = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.dashboard.all(),
    });
  };
};

// Refresh Specific Dashboard Hook
export const useRefreshSpecificDashboard = () => {
  const queryClient = useQueryClient();

  return (role: "driver" | "client" | "admin" | "super-admin") => {
    switch (role) {
      case "driver":
        queryClient.invalidateQueries({
          queryKey: queryKeys.dashboard.driver(),
        });
        break;
      case "client":
        queryClient.invalidateQueries({
          queryKey: queryKeys.dashboard.client(),
        });
        break;
      case "admin":
        queryClient.invalidateQueries({
          queryKey: queryKeys.dashboard.admin(),
        });
        break;
      case "super-admin":
        queryClient.invalidateQueries({
          queryKey: queryKeys.dashboard.superAdmin(),
        });
        break;
    }
  };
};

// ===========================================
// PRELOADING HOOKS
// ===========================================

// Preload Dashboard Data Hook
export const usePreloadDashboard = () => {
  const queryClient = useQueryClient();

  return (role: "driver" | "client" | "admin" | "super-admin") => {
    switch (role) {
      case "driver":
        queryClient.prefetchQuery({
          queryKey: queryKeys.dashboard.driver(),
          queryFn: () => DashboardService.getDriverDashboard(),
          staleTime: 5 * 60 * 1000,
        });
        break;
      case "client":
        queryClient.prefetchQuery({
          queryKey: queryKeys.dashboard.client(),
          queryFn: () => DashboardService.getClientDashboard(),
          staleTime: 5 * 60 * 1000,
        });
        break;
      case "admin":
        queryClient.prefetchQuery({
          queryKey: queryKeys.dashboard.admin(),
          queryFn: () => DashboardService.getAdminDashboard(),
          staleTime: 5 * 60 * 1000,
        });
        break;
      case "super-admin":
        queryClient.prefetchQuery({
          queryKey: queryKeys.dashboard.superAdmin(),
          queryFn: () => DashboardService.getSuperAdminDashboard(),
          staleTime: 5 * 60 * 1000,
        });
        break;
    }
  };
};
