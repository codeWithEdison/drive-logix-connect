import axiosInstance from "../axios";
import {
  ApiResponse,
  PaginationResponse,
  DashboardResponse,
  DashboardOverview,
  DashboardStats,
  QuickStats,
  RecentActivity,
  DashboardAlert,
  RevenueChartData,
  DeliveryPerformanceChart,
  GeographicAnalytics,
  DriverPerformanceDashboard,
  VehicleAnalyticsDashboard,
  ClientAnalyticsDashboard,
  SystemHealthDashboard,
  DashboardFilters,
} from "../../../types/shared";

// ===========================================
// DASHBOARD SERVICE
// ===========================================

export class DashboardService {
  // ===========================================
  // ROLE-SPECIFIC DASHBOARD ENDPOINTS
  // ===========================================

  // Driver Dashboard
  static async getDriverDashboard(): Promise<
    ApiResponse<{
      driver_info: {
        id: string;
        name: string;
        email: string;
        phone: string;
        rating: number;
        status: string;
        license_number: string;
        license_expiry: string;
        total_deliveries: number;
        avatar_url?: string;
      };
      stats: {
        assigned_cargos: number;
        active_deliveries: number;
        completed_deliveries: number;
        rating: number;
        today_deliveries: number;
        weekly_deliveries: number;
        monthly_deliveries: number;
      };
      active_delivery?: {
        cargo_id: string;
        client_name: string;
        client_phone: string;
        pickup_address: string;
        delivery_address: string;
        pickup_time: string;
        estimated_delivery_time: string;
        cargo_type: string;
        weight: number;
        priority: string;
        status: string;
        route_distance_km: number;
        current_location?: {
          latitude: number;
          longitude: number;
        };
        progress_percentage: number;
      };
      assigned_cargos: Array<{
        cargo_id: string;
        client_name: string;
        client_phone: string;
        pickup_address: string;
        delivery_address: string;
        pickup_time: string;
        estimated_delivery_time: string;
        cargo_type: string;
        weight: number;
        priority: string;
        status: string;
        special_instructions?: string;
      }>;
      recent_deliveries: Array<{
        cargo_id: string;
        client_name: string;
        status: string;
        delivery_date: string;
        rating?: number;
        review?: string;
      }>;
      performance: {
        rating: number;
        completed_deliveries: number;
        on_time_percentage: number;
        customer_satisfaction: number;
        total_distance_km: number;
        average_delivery_time_hours: number;
      };
      vehicle_info: {
        vehicle_id: string;
        plate_number: string;
        make: string;
        model: string;
        type: string;
        status: string;
        fuel_level?: number;
        next_maintenance_date?: string;
        insurance_expiry?: string;
      };
    }>
  > {
    const response = await axiosInstance.get("/dashboard/driver");
    return response.data;
  }

  // Client Dashboard
  static async getClientDashboard(): Promise<
    ApiResponse<{
      client_info: {
        id: string;
        name: string;
        email: string;
        phone: string;
        company_name?: string;
        business_type: string;
        credit_limit: number;
        payment_terms: number;
        avatar_url?: string;
      };
      stats: {
        total_cargos: number;
        in_transit_cargos: number;
        pending_cargos: number;
        delivered_cargos: number;
        cancelled_cargos: number;
        total_spent: number;
        pending_payments: number;
        average_order_value: number;
      };
      recent_cargos: Array<{
        cargo_id: string;
        status: string;
        pickup_address: string;
        delivery_address: string;
        driver_name?: string;
        estimated_delivery_time?: string;
        weight: number;
        cargo_type: string;
        priority: string;
        created_at: string;
      }>;
      recent_invoices: Array<{
        invoice_id: string;
        cargo_id: string;
        cargo_number?: string; // Optional field for backward compatibility
        invoice_number: string;
        amount: number;
        status: string;
        due_date: string;
        created_at: string;
      }>;
      recent_activities: Array<{
        id: string;
        type: string;
        title: string;
        description: string;
        timestamp: string;
        cargo_id?: string;
      }>;
      tracking_data?: {
        cargo_id: string;
        current_status: string;
        current_location?: {
          latitude: number;
          longitude: number;
        };
        estimated_delivery_time?: string;
        progress_percentage: number;
        route_history: Array<{
          latitude: number;
          longitude: number;
          timestamp: string;
        }>;
      };
    }>
  > {
    const response = await axiosInstance.get("/dashboard/client");
    return response.data;
  }

  // Admin Dashboard
  static async getAdminDashboard(): Promise<
    ApiResponse<{
      stats: {
        monthly_revenue: number;
        active_deliveries: number;
        available_drivers: number;
        total_drivers: number;
        success_rate: number;
        total_cargos: number;
        pending_approvals: number;
        system_alerts: number;
      };
      charts: {
        revenue_trends: {
          daily_revenue: Array<{
            date: string;
            revenue: number;
            deliveries: number;
          }>;
          monthly_revenue: Array<{
            month: string;
            revenue: number;
            growth_percentage: number;
          }>;
          revenue_by_payment_method: Record<string, number>;
        };
        delivery_status: {
          status_distribution: Record<string, number>;
          priority_distribution: Record<string, number>;
          delivery_times: Array<{
            date: string;
            average_time_hours: number;
            on_time_percentage: number;
          }>;
        };
        fleet_performance: {
          vehicle_utilization: Array<{
            vehicle_id: string;
            plate_number: string;
            utilization_percentage: number;
            total_distance_km: number;
          }>;
          fuel_efficiency: Array<{
            vehicle_id: string;
            plate_number: string;
            fuel_efficiency_km_per_liter: number;
          }>;
          maintenance_schedule: Array<{
            vehicle_id: string;
            plate_number: string;
            next_maintenance_date: string;
            maintenance_type: string;
          }>;
        };
        geographic_distribution: {
          top_pickup_locations: Array<{
            location: string;
            count: number;
            revenue: number;
          }>;
          top_delivery_locations: Array<{
            location: string;
            count: number;
            revenue: number;
          }>;
          route_efficiency: Array<{
            route: string;
            average_time: number;
            distance_km: number;
            efficiency_score: number;
          }>;
        };
        driver_performance: {
          top_performers: Array<{
            driver_id: string;
            driver_name: string;
            deliveries_completed: number;
            average_rating: number;
            on_time_percentage: number;
          }>;
          performance_trends: Array<{
            date: string;
            average_rating: number;
            deliveries_completed: number;
          }>;
        };
      };
      tables: {
        recent_deliveries: Array<{
          cargo_id: string;
          client_name: string;
          driver_name: string;
          status: string;
          pickup_location: string;
          delivery_location: string;
          created_at: string;
          estimated_delivery: string;
        }>;
        pending_approvals: Array<{
          id: string;
          type: string;
          name: string;
          email: string;
          status: string;
          submitted_at: string;
          documents_count: number;
        }>;
        system_alerts: Array<{
          id: string;
          type: string;
          message: string;
          severity: string;
          created_at: string;
          is_resolved: boolean;
          resolved_at?: string;
        }>;
        financial_transactions: Array<{
          id: string;
          type: string;
          amount: number;
          currency: string;
          status: string;
          client_name: string;
          created_at: string;
          description: string;
        }>;
      };
      recent_activities: Array<{
        id: string;
        type: string;
        title: string;
        description: string;
        user_name: string;
        timestamp: string;
        severity: string;
      }>;
    }>
  > {
    const response = await axiosInstance.get("/dashboard/admin");
    return response.data;
  }

  // Super Admin Dashboard
  static async getSuperAdminDashboard(): Promise<
    ApiResponse<DashboardResponse>
  > {
    const response = await axiosInstance.get("/dashboard/super-admin");
    return response.data;
  }

  // ===========================================
  // CHART DATA ENDPOINTS
  // ===========================================

  // Revenue Chart Data
  static async getRevenueChartData(params?: {
    period?: string;
    role?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<ApiResponse<RevenueChartData>> {
    const response = await axiosInstance.get("/dashboard/charts/revenue", {
      params,
    });
    return response.data;
  }

  // Delivery Status Chart
  static async getDeliveryStatusChart(params?: {
    period?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<ApiResponse<DeliveryPerformanceChart>> {
    const response = await axiosInstance.get(
      "/dashboard/charts/delivery-status",
      { params }
    );
    return response.data;
  }

  // Fleet Performance Chart
  static async getFleetPerformanceChart(params?: {
    vehicle_type?: string;
    period?: string;
  }): Promise<
    ApiResponse<{
      vehicle_utilization: Array<{
        vehicle_id: string;
        plate_number: string;
        utilization_percentage: number;
        total_distance_km: number;
      }>;
      fuel_efficiency: Array<{
        vehicle_id: string;
        plate_number: string;
        fuel_efficiency_km_per_liter: number;
      }>;
      maintenance_schedule: Array<{
        vehicle_id: string;
        plate_number: string;
        next_maintenance_date: string;
        maintenance_type: string;
      }>;
    }>
  > {
    const response = await axiosInstance.get(
      "/dashboard/charts/fleet-performance",
      { params }
    );
    return response.data;
  }

  // Geographic Chart
  static async getGeographicChart(params?: {
    region?: string;
    period?: string;
  }): Promise<ApiResponse<GeographicAnalytics>> {
    const response = await axiosInstance.get("/dashboard/charts/geographic", {
      params,
    });
    return response.data;
  }

  // Driver Performance Chart
  static async getDriverPerformanceChart(params?: {
    driver_id?: string;
    period?: string;
  }): Promise<ApiResponse<DriverPerformanceDashboard>> {
    const response = await axiosInstance.get(
      "/dashboard/charts/driver-performance",
      { params }
    );
    return response.data;
  }

  // Usage Trends Chart
  static async getUsageTrendsChart(params?: {
    period?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<
    ApiResponse<{
      user_registrations: Array<{
        date: string;
        new_users: number;
        active_users: number;
      }>;
      system_usage: Array<{
        date: string;
        api_calls: number;
        active_sessions: number;
      }>;
    }>
  > {
    const response = await axiosInstance.get("/dashboard/charts/usage-trends", {
      params,
    });
    return response.data;
  }

  // Admin Performance Chart
  static async getAdminPerformanceChart(params?: {
    admin_id?: string;
    period?: string;
  }): Promise<
    ApiResponse<{
      admin_activities: Array<{
        admin_id: string;
        admin_name: string;
        activities_count: number;
        last_activity: string;
      }>;
      performance_metrics: Array<{
        date: string;
        approvals_processed: number;
        issues_resolved: number;
      }>;
    }>
  > {
    const response = await axiosInstance.get(
      "/dashboard/charts/admin-performance",
      { params }
    );
    return response.data;
  }

  // Users Distribution Chart
  static async getUsersDistributionChart(params?: {
    role?: string;
    period?: string;
  }): Promise<
    ApiResponse<{
      users_by_role: Record<string, number>;
      users_by_status: Record<string, number>;
      users_by_business_type: Record<string, number>;
      registration_trends: Array<{
        date: string;
        total_users: number;
        new_registrations: number;
      }>;
    }>
  > {
    const response = await axiosInstance.get(
      "/dashboard/charts/users-distribution",
      { params }
    );
    return response.data;
  }

  // ===========================================
  // TABLE DATA ENDPOINTS
  // ===========================================

  // Recent Deliveries Table
  static async getRecentDeliveriesTable(params?: {
    limit?: number;
    role?: string;
    status?: string;
  }): Promise<
    ApiResponse<
      Array<{
        cargo_id: string;
        client_name: string;
        driver_name: string;
        status: string;
        pickup_location: string;
        delivery_location: string;
        created_at: string;
        estimated_delivery: string;
      }>
    >
  > {
    const response = await axiosInstance.get(
      "/dashboard/tables/recent-deliveries",
      { params }
    );
    return response.data;
  }

  // Pending Approvals Table
  static async getPendingApprovalsTable(params?: {
    status?: string;
    role?: string;
    limit?: number;
  }): Promise<
    ApiResponse<
      Array<{
        id: string;
        type: string;
        name: string;
        email: string;
        status: string;
        submitted_at: string;
        documents_count: number;
        admin_notes?: string;
      }>
    >
  > {
    const response = await axiosInstance.get(
      "/dashboard/tables/pending-approvals",
      { params }
    );
    return response.data;
  }

  // System Alerts Table
  static async getSystemAlertsTable(params?: {
    severity?: string;
    is_resolved?: boolean;
    limit?: number;
  }): Promise<
    ApiResponse<
      Array<{
        id: string;
        type: string;
        message: string;
        severity: string;
        created_at: string;
        is_resolved: boolean;
        resolved_at?: string;
        resolved_by?: string;
      }>
    >
  > {
    const response = await axiosInstance.get(
      "/dashboard/tables/system-alerts",
      { params }
    );
    return response.data;
  }

  // Financial Transactions Table
  static async getFinancialTransactionsTable(params?: {
    period?: string;
    status?: string;
    limit?: number;
  }): Promise<
    ApiResponse<
      Array<{
        id: string;
        type: string;
        amount: number;
        currency: string;
        status: string;
        client_name: string;
        created_at: string;
        description: string;
      }>
    >
  > {
    const response = await axiosInstance.get(
      "/dashboard/tables/financial-transactions",
      { params }
    );
    return response.data;
  }

  // ===========================================
  // SYSTEM HEALTH ENDPOINT
  // ===========================================

  // System Health
  static async getSystemHealth(): Promise<ApiResponse<SystemHealthDashboard>> {
    const response = await axiosInstance.get("/dashboard/system-health");
    return response.data;
  }

  // ===========================================
  // DRIVER STATUS UPDATE
  // ===========================================

  // Update Driver Status
  static async updateDriverStatus(
    status: "available" | "on_duty" | "unavailable"
  ): Promise<
    ApiResponse<{
      status: string;
      updated_at: string;
    }>
  > {
    const response = await axiosInstance.patch("/dashboard/driver/status", {
      status,
    });
    return response.data;
  }

  // ===========================================
  // DASHBOARD FILTERS
  // ===========================================

  // Apply Dashboard Filters
  static async applyDashboardFilters(
    filters: DashboardFilters
  ): Promise<ApiResponse<any>> {
    const response = await axiosInstance.post("/dashboard/filters", filters);
    return response.data;
  }
}
