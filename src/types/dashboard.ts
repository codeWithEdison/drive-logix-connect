// ===========================================
// DASHBOARD TYPES AND INTERFACES
// ===========================================

import {
  UUID,
  UserRole,
  CargoStatus,
  CargoPriority,
  DriverStatus,
  VehicleStatus,
  VehicleType,
  BusinessType,
  InvoiceStatus,
  PaymentStatus,
  MaintenanceType,
  PaymentMethod,
} from "@/types/shared";

// ===========================================
// DRIVER DASHBOARD INTERFACES
// ===========================================

export interface DriverDashboardData {
  driver_info: DriverProfile;
  stats: DriverStats;
  active_delivery?: ActiveDelivery;
  // New assignment system data
  pending_assignments: PendingAssignment[];
  accepted_assignments: AcceptedAssignment[];
  recent_rejections: RejectedAssignment[];
  notifications: AssignmentNotifications;
  // Legacy fields (for backward compatibility)
  assigned_cargos: AssignedCargo[];
  recent_deliveries: RecentDelivery[];
  performance: DriverPerformance;
  vehicle_info?: VehicleInfo;
}

export interface DriverProfile {
  id: UUID;
  name: string;
  email: string;
  phone: string;
  rating: number;
  status: DriverStatus;
  license_number: string;
  license_expiry: string;
  total_deliveries: number;
  avatar_url?: string;
}

export interface DriverStats {
  // New assignment system stats
  pending_assignments: number;
  accepted_assignments: number;
  rejected_assignments: number;
  // Legacy stats (for backward compatibility)
  assigned_cargos: number;
  active_deliveries: number;
  completed_deliveries: number;
  rating: number;
  today_deliveries: number;
  weekly_deliveries: number;
  monthly_deliveries: number;
}

export interface ActiveDelivery {
  cargo_id: UUID;
  cargo_number: string;
  client_name: string;
  client_phone: string;
  pickup_address: string;
  delivery_address: string;
  pickup_time: string;
  estimated_delivery_time: string;
  cargo_type: string;
  weight: number;
  priority: CargoPriority;
  status: CargoStatus;
  route_distance_km: number;
  current_location?: {
    latitude: number;
    longitude: number;
  };
  progress_percentage: number;
}

export interface AssignedCargo {
  cargo_id: UUID;
  cargo_number: string;
  client_name: string;
  client_phone: string;
  pickup_address: string;
  delivery_address: string;
  pickup_time: string;
  estimated_delivery_time: string;
  cargo_type: string;
  weight: number;
  priority: CargoPriority;
  status: CargoStatus;
  special_instructions?: string;
}

export interface RecentDelivery {
  cargo_id: UUID;
  cargo_number: string;
  client_name: string;
  status: CargoStatus;
  delivery_date: string;
  rating?: number;
  review?: string;
}

export interface DriverPerformance {
  rating: number;
  completed_deliveries: number;
  on_time_percentage: number;
  customer_satisfaction: number;
  total_distance_km: number;
  average_delivery_time_hours: number;
}

export interface VehicleInfo {
  vehicle_id: UUID;
  plate_number: string;
  make: string;
  model: string;
  type: VehicleType;
  status: VehicleStatus;
  fuel_level?: number;
  next_maintenance_date?: string;
  insurance_expiry?: string;
}

// ===========================================
// CLIENT DASHBOARD INTERFACES
// ===========================================

export interface ClientDashboardData {
  client_info: ClientProfile;
  stats: ClientStats;
  recent_cargos: ClientCargo[];
  recent_invoices: ClientInvoice[];
  recent_activities: ClientActivity[];
  tracking_data?: TrackingData;
}

export interface ClientProfile {
  id: UUID;
  name: string;
  email: string;
  phone: string;
  company_name?: string;
  business_type: BusinessType;
  credit_limit: number;
  payment_terms: number;
  avatar_url?: string;
}

export interface ClientStats {
  total_cargos: number;
  in_transit_cargos: number;
  pending_cargos: number;
  delivered_cargos: number;
  cancelled_cargos: number;
  total_spent: number;
  pending_payments: number;
  average_order_value: number;
}

export interface ClientCargo {
  cargo_id: UUID;
  status: CargoStatus;
  pickup_address: string;
  delivery_address: string;
  driver_name?: string;
  estimated_delivery_time?: string;
  weight: number;
  cargo_type: string;
  priority: CargoPriority;
  created_at: string;
}

export interface ClientInvoice {
  invoice_id: UUID;
  cargo_id: UUID;
  cargo_number?: string; // Optional field for backward compatibility
  invoice_number: string;
  amount: number;
  status: InvoiceStatus;
  due_date: string;
  created_at: string;
}

export interface ClientActivity {
  id: UUID;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  cargo_id?: UUID;
}

export interface TrackingData {
  cargo_id: UUID;
  current_status: CargoStatus;
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
}

// ===========================================
// ADMIN DASHBOARD INTERFACES
// ===========================================

export interface AdminDashboardData {
  stats: AdminStats;
  charts: AdminCharts;
  tables: AdminTables;
  recent_activities: AdminActivity[];
}

export interface AdminStats {
  monthly_revenue: number;
  active_deliveries: number;
  available_drivers: number;
  total_drivers: number;
  success_rate: number;
  total_cargos: number;
  pending_approvals: number;
  system_alerts: number;
}

export interface AdminCharts {
  revenue_trends: RevenueChartData;
  delivery_status: DeliveryStatusChart;
  fleet_performance: FleetPerformanceChart;
  geographic_distribution: GeographicChart;
  driver_performance: DriverPerformanceChart;
}

export interface AdminTables {
  recent_deliveries: RecentDeliveryTable[];
  pending_approvals: PendingApproval[];
  system_alerts: SystemAlert[];
  financial_transactions: FinancialTransaction[];
}

export interface RecentDeliveryTable {
  cargo_id: UUID;
  client_name: string;
  driver_name: string;
  status: CargoStatus;
  pickup_location: string;
  delivery_location: string;
  created_at: string;
  estimated_delivery: string;
}

export interface PendingApproval {
  id: UUID;
  type: "driver_registration" | "client_registration" | "vehicle_registration";
  name: string;
  email: string;
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
  documents_count: number;
}

export interface SystemAlert {
  id: UUID;
  type: AlertType;
  message: string;
  severity: ActivitySeverity;
  created_at: string;
  is_resolved: boolean;
  resolved_at?: string;
}

export interface FinancialTransaction {
  id: UUID;
  type: "payment" | "refund" | "invoice";
  amount: number;
  currency: string;
  status: PaymentStatus;
  client_name: string;
  created_at: string;
  description: string;
}

export interface AdminActivity {
  id: UUID;
  type: ActivityType;
  title: string;
  description: string;
  user_name: string;
  timestamp: string;
  severity: ActivitySeverity;
}

// ===========================================
// SUPER ADMIN DASHBOARD INTERFACES
// ===========================================

export interface SuperAdminDashboardData {
  stats: SuperAdminStats;
  charts: SuperAdminCharts;
  tables: SuperAdminTables;
  system_health: SystemHealth;
  recent_logs: SystemLog[];
}

export interface SuperAdminStats {
  total_revenue: number;
  active_admins: number;
  total_users: number;
  system_health_percentage: number;
  total_drivers: number;
  total_clients: number;
  total_vehicles: number;
  system_uptime: number;
}

export interface SuperAdminCharts {
  revenue_trends: RevenueChartData;
  usage_trends: UsageTrendsChart;
  admin_performance: AdminPerformanceChart;
  users_distribution: UsersDistributionChart;
}

export interface SuperAdminTables {
  pending_approvals: SuperAdminApproval[];
  system_alerts: SuperAdminAlert[];
}

export interface SuperAdminApproval {
  id: UUID;
  type:
    | "admin_registration"
    | "driver_registration"
    | "client_registration"
    | "system_config";
  name: string;
  email: string;
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
  admin_notes?: string;
}

export interface SuperAdminAlert {
  id: UUID;
  type:
    | "system_maintenance"
    | "security_alert"
    | "performance_alert"
    | "data_backup";
  message: string;
  severity: ActivitySeverity;
  created_at: string;
  is_resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
}

export interface SystemHealth {
  api_performance: {
    average_response_time_ms: number;
    error_rate_percentage: number;
    uptime_percentage: number;
  };
  database_metrics: {
    connection_count: number;
    query_performance_ms: number;
    storage_usage_percentage: number;
  };
  server_resources: {
    cpu_usage_percentage: number;
    memory_usage_percentage: number;
    disk_usage_percentage: number;
  };
}

export interface SystemLog {
  id: UUID;
  type:
    | "user_login"
    | "system_config"
    | "data_export"
    | "user_creation"
    | "security_alert";
  user: string;
  action: string;
  ip_address: string;
  timestamp: string;
  success: boolean;
  details?: Record<string, any>;
}

// ===========================================
// CHART DATA INTERFACES
// ===========================================

export interface RevenueChartData {
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
  revenue_by_payment_method: Record<PaymentMethod, number>;
}

export interface DeliveryStatusChart {
  status_distribution: Record<CargoStatus, number>;
  priority_distribution: Record<CargoPriority, number>;
  delivery_times: Array<{
    date: string;
    average_time_hours: number;
    on_time_percentage: number;
  }>;
}

export interface FleetPerformanceChart {
  vehicle_utilization: Array<{
    vehicle_id: UUID;
    plate_number: string;
    utilization_percentage: number;
    total_distance_km: number;
  }>;
  fuel_efficiency: Array<{
    vehicle_id: UUID;
    plate_number: string;
    fuel_efficiency_km_per_liter: number;
  }>;
  maintenance_schedule: Array<{
    vehicle_id: UUID;
    plate_number: string;
    next_maintenance_date: string;
    maintenance_type: MaintenanceType;
  }>;
  vehicle_deliveries: Array<{
    vehicle_id: UUID;
    plate_number: string;
    total_deliveries: number;
    completed_deliveries: number;
    success_rate: number;
    total_revenue: number;
  }>;
}

export interface GeographicChart {
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
}

export interface DriverPerformanceChart {
  top_performers: Array<{
    driver_id: UUID;
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
}

export interface UsageTrendsChart {
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
}

export interface AdminPerformanceChart {
  admin_activities: Array<{
    admin_id: UUID;
    admin_name: string;
    activities_count: number;
    last_activity: string;
  }>;
  performance_metrics: Array<{
    date: string;
    approvals_processed: number;
    issues_resolved: number;
  }>;
}

export interface UsersDistributionChart {
  users_by_role: Record<UserRole, number>;
  users_by_status: Record<"active" | "inactive", number>;
  users_by_business_type: Record<BusinessType, number>;
  registration_trends: Array<{
    date: string;
    total_users: number;
    new_registrations: number;
  }>;
}

// ===========================================
// COMMON TYPES
// ===========================================

export type ActivityType =
  | "cargo_created"
  | "cargo_assigned"
  | "cargo_picked_up"
  | "cargo_delivered"
  | "cargo_cancelled"
  | "payment_received"
  | "invoice_generated"
  | "driver_registered"
  | "client_registered"
  | "system_alert"
  | "maintenance_due"
  | "license_expiring";

export type AlertType =
  | "system_maintenance"
  | "security_alert"
  | "performance_alert"
  | "data_backup"
  | "license_expiry"
  | "maintenance_due"
  | "payment_overdue"
  | "delivery_delay";

export type ActivitySeverity = "low" | "medium" | "high" | "critical";

// ===========================================
// FILTER INTERFACES
// ===========================================

export interface DashboardFilters {
  period?: "day" | "week" | "month" | "year";
  start_date?: string;
  end_date?: string;
  limit?: number;
  include_vehicle?: boolean;
  include_tracking?: boolean;
  include_charts?: boolean;
  include_tables?: boolean;
  include_system_health?: boolean;
  include_logs?: boolean;
}

export interface ChartFilters extends DashboardFilters {
  chart_type?: string;
  group_by?: string;
  vehicle_type?: string;
  admin_id?: string;
}

export interface TableFilters extends DashboardFilters {
  status?: string;
  priority?: string;
  role?: UserRole;
  type?: string;
  severity?: string;
  is_resolved?: boolean;
  page?: number;
  page_size?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

// ===========================================
// NEW ASSIGNMENT SYSTEM INTERFACES
// ===========================================

export interface PendingAssignment {
  id: UUID;
  cargo: AssignmentCargo;
  vehicle?: AssignmentVehicle | null; // Can be null
  assigned_at: string;
  expires_at: string;
  time_remaining: number; // seconds remaining
  assigned_by?: AssignmentAdmin | null; // Can be null
}

export interface AcceptedAssignment {
  id: UUID;
  cargo: AssignmentCargo;
  vehicle?: AssignmentVehicle | null; // Can be null
  assigned_at: string;
  accepted_at?: string; // Optional field
  assigned_by?: AssignmentAdmin | null; // Can be null
}

export interface RejectedAssignment {
  id: UUID;
  cargo: AssignmentCargo;
  vehicle?: AssignmentVehicle | null; // Can be null
  assigned_at: string;
  rejected_at?: string;
  rejection_reason?: string;
  assigned_by?: AssignmentAdmin | null; // Can be null
}

export interface AssignmentCargo {
  id: UUID;
  cargo_number: string;
  description?: string;
  weight: number;
  dimensions?: any; // Json from Prisma
  value: number;
  status: string | null; // CargoStatus from Prisma - can be null
  pickup_location?: any; // Location from Prisma
  delivery_location?: any; // Location from Prisma
  client: AssignmentClient;
  category?: any; // CargoCategory from Prisma
}

export interface AssignmentClient {
  id: UUID;
  name: string;
  email: string;
  phone: string | null; // Can be null from Prisma
}

export interface AssignmentVehicle {
  id: UUID;
  license_plate: string;
  make: string | null; // Can be null from Prisma
  model: string | null; // Can be null from Prisma
  capacity: number;
}

export interface AssignmentAdmin {
  id: UUID;
  name: string;
}

export interface AssignmentNotifications {
  unread_count: number;
  recent_notifications: AssignmentNotification[];
}

export interface AssignmentNotification {
  id: UUID;
  type: string; // NotificationType from Prisma
  category?: string; // NotificationCategory from Prisma
  title?: string;
  message: string;
  created_at: string;
  is_read: boolean;
}
