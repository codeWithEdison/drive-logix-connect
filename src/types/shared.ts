// ===========================================
// SHARED INTERFACES FOR FRONTEND & BACKEND
// Based on MySQL schema and API documentation
// ===========================================

// ===========================================
// COMMON TYPES
// ===========================================

export type UUID = string;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;
  meta?: {
    timestamp: string;
    version: string;
    language: string;
    requestId: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ===========================================
// ENUMS MATCHING DATABASE
// ===========================================

export enum UserRole {
  CLIENT = "client",
  DRIVER = "driver",
  ADMIN = "admin",
  SUPER_ADMIN = "super_admin",
}

export enum Language {
  EN = "en",
  RW = "rw",
  FR = "fr",
}

export enum BusinessType {
  INDIVIDUAL = "individual",
  CORPORATE = "corporate",
  GOVERNMENT = "government",
}

export enum LicenseType {
  A = "A",
  B = "B",
  C = "C",
  D = "D",
  E = "E",
}

export enum DriverStatus {
  AVAILABLE = "available",
  ON_DUTY = "on_duty",
  UNAVAILABLE = "unavailable",
  SUSPENDED = "suspended",
}

export enum DocumentType {
  LICENSE = "license",
  MEDICAL_CERT = "medical_cert",
  INSURANCE = "insurance",
  VEHICLE_REGISTRATION = "vehicle_registration",
  OTHER = "other",
}

export enum VehicleType {
  TRUCK = "truck",
  MOTO = "moto",
  VAN = "van",
  PICKUP = "pickup",
}

export enum VehicleStatus {
  ACTIVE = "active",
  MAINTENANCE = "maintenance",
  RETIRED = "retired",
  SUSPENDED = "suspended",
}

export enum FuelType {
  PETROL = "petrol",
  DIESEL = "diesel",
  ELECTRIC = "electric",
  HYBRID = "hybrid",
}

export enum MaintenanceType {
  ROUTINE = "routine",
  REPAIR = "repair",
  INSPECTION = "inspection",
  EMERGENCY = "emergency",
}

export enum LocationType {
  WAREHOUSE = "warehouse",
  PICKUP_POINT = "pickup_point",
  DELIVERY_POINT = "delivery_point",
  OFFICE = "office",
}

export enum CargoStatus {
  PENDING = "pending",
  QUOTED = "quoted",
  ACCEPTED = "accepted",
  ASSIGNED = "assigned",
  PICKED_UP = "picked_up",
  IN_TRANSIT = "in_transit",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  DISPUTED = "disputed",
}

export enum CargoPriority {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
  URGENT = "urgent",
}

export enum WaypointType {
  PICKUP = "pickup",
  DELIVERY = "delivery",
  STOP = "stop",
  CHECKPOINT = "checkpoint",
}

export enum ConfirmationMethod {
  OTP = "otp",
  SIGNATURE = "signature",
  PHOTO = "photo",
  QR = "qr",
  MANUAL = "manual",
}

export enum InvoiceStatus {
  DRAFT = "draft",
  SENT = "sent",
  PAID = "paid",
  OVERDUE = "overdue",
  CANCELLED = "cancelled",
}

export enum PaymentMethod {
  CASH = "cash",
  MOBILE_MONEY = "mobile_money",
  CARD = "card",
  ONLINE = "online",
  BANK_TRANSFER = "bank_transfer",
}

export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
}

export enum RefundStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  PROCESSED = "processed",
}

export enum NotificationType {
  SMS = "sms",
  EMAIL = "email",
  PUSH = "push",
  IN_APP = "in_app",
}

export enum NotificationCategory {
  DELIVERY_UPDATE = "delivery_update",
  PAYMENT = "payment",
  SYSTEM = "system",
  PROMOTIONAL = "promotional",
}

export enum FileType {
  DOCUMENT = "document",
  IMAGE = "image",
  VIDEO = "video",
  AUDIO = "audio",
  OTHER = "other",
}

// ===========================================
// USER INTERFACES
// ===========================================

export interface User {
  id: UUID;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  preferred_language: Language;
  avatar_url?: string;
  is_active: boolean;
  is_verified: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  full_name: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
  preferred_language?: Language;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

// ===========================================
// CLIENT INTERFACES
// ===========================================

export interface Client extends User {
  company_name?: string;
  business_type: BusinessType;
  tax_id?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  contact_person?: string;
  credit_limit: number;
  payment_terms: number;
}

export interface UpdateClientRequest {
  company_name?: string;
  business_type?: BusinessType;
  tax_id?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  contact_person?: string;
  credit_limit?: number;
  payment_terms?: number;
}

// ===========================================
// DRIVER INTERFACES
// ===========================================

export interface Driver extends User {
  license_number?: string;
  license_expiry?: string;
  license_type: LicenseType;
  date_of_birth?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  blood_type?: string;
  medical_certificate_expiry?: string;
  status: DriverStatus;
  rating: number;
  total_deliveries: number;
  total_distance_km: number;
}

export interface UpdateDriverRequest {
  license_number?: string;
  license_expiry?: string;
  license_type?: LicenseType;
  date_of_birth?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  blood_type?: string;
  medical_certificate_expiry?: string;
}

export interface DriverDocument {
  id: UUID;
  driver_id: UUID;
  document_type: DocumentType;
  document_number?: string;
  file_url?: string;
  expiry_date?: string;
  is_verified: boolean;
  verified_by?: UUID;
  verified_at?: string;
  created_at: string;
}

// ===========================================
// VEHICLE INTERFACES
// ===========================================

export interface Vehicle {
  id: UUID;
  plate_number: string;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  capacity_kg?: number;
  capacity_volume?: number;
  fuel_type?: FuelType;
  fuel_efficiency?: number;
  type: VehicleType;
  status: VehicleStatus;
  insurance_expiry?: string;
  registration_expiry?: string;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  total_distance_km: number;
  created_at: string;
  updated_at: string;
}

export interface CreateVehicleRequest {
  plate_number: string;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  capacity_kg?: number;
  capacity_volume?: number;
  fuel_type?: FuelType;
  fuel_efficiency?: number;
  type: VehicleType;
  insurance_expiry?: string;
  registration_expiry?: string;
}

// ===========================================
// CARGO INTERFACES
// ===========================================

export interface CargoCategory {
  id: UUID;
  name: string;
  description?: string;
  base_rate_multiplier: number;
  special_handling_required: boolean;
  is_active: boolean;
  cargo_count: number;
  created_at: string;
}

export interface Cargo {
  id: UUID;
  cargo_number?: string; // LC prefix reference number
  client_id: UUID;
  category_id?: UUID;
  type?: string;
  weight_kg: number;
  volume?: number;
  dimensions?: any;
  pickup_location_id?: UUID;
  pickup_address?: string;
  pickup_contact?: string;
  pickup_phone?: string;
  pickup_instructions?: string;
  destination_location_id?: UUID;
  destination_address?: string;
  destination_contact?: string;
  destination_phone?: string;
  delivery_instructions?: string;
  special_requirements?: string;
  insurance_required: boolean;
  insurance_amount?: number;
  fragile: boolean;
  temperature_controlled: boolean;
  status: CargoStatus;
  priority: CargoPriority;
  estimated_cost?: number;
  final_cost?: number;
  pickup_date?: string;
  delivery_date?: string;
  distance_km?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCargoRequest {
  category_id?: UUID;
  type?: string;
  weight_kg: number;
  volume?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  pickup_address?: string;
  pickup_contact?: string;
  pickup_phone?: string;
  pickup_instructions?: string;
  destination_address?: string;
  destination_contact?: string;
  destination_phone?: string;
  delivery_instructions?: string;
  special_requirements?: string;
  insurance_required?: boolean;
  insurance_amount?: number;
  fragile?: boolean;
  temperature_controlled?: boolean;
  priority?: CargoPriority;
  pickup_date?: string;
  delivery_date?: string;
  estimated_cost?: number; // Add estimated cost field
}

// ===========================================
// DELIVERY INTERFACES
// ===========================================

export interface DeliveryAssignment {
  id: UUID;
  cargo_id: UUID;
  driver_id: UUID;
  vehicle_id: UUID;
  assigned_at: string;
}

export interface CreateDeliveryAssignmentRequest {
  cargo_id: UUID;
  driver_id: UUID;
  vehicle_id: UUID;
}

export interface DeliveryStatusUpdate {
  id: UUID;
  cargo_id: UUID;
  status: CargoStatus;
  notes?: string;
  updated_by: UUID;
  created_at: string;
  updated_by_user?: {
    id: UUID;
    full_name: string;
    email: string;
  };
}

// ===========================================
// FINANCIAL INTERFACES
// ===========================================

export interface Invoice {
  id: UUID;
  invoice_number: string;
  cargo_id: UUID;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  status: InvoiceStatus;
  due_date?: string;
  paid: boolean;
  paid_at?: string;
  payment_method?: PaymentMethod;
  payment_reference?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInvoiceRequest {
  cargo_id: UUID;
  subtotal: number;
  tax_amount?: number;
  discount_amount?: number;
  currency?: string;
  due_date?: string;
}

// ===========================================
// GPS TRACKING INTERFACES
// ===========================================

export interface GPSTracking {
  id: UUID;
  vehicle_id?: UUID;
  latitude: number;
  longitude: number;
  altitude?: number;
  speed_kmh?: number;
  heading_degrees?: number;
  accuracy_meters?: number;
  battery_level?: number;
  recorded_at: string;
}

export interface UpdateGPSLocationRequest {
  vehicle_id: UUID;
  latitude: number;
  longitude: number;
  altitude?: number;
  speed_kmh?: number;
  heading_degrees?: number;
  accuracy_meters?: number;
  battery_level?: number;
}

// ===========================================
// NOTIFICATION INTERFACES
// ===========================================

export interface Notification {
  id: UUID;
  user_id: UUID;
  title?: string;
  message: string;
  type: NotificationType;
  category?: NotificationCategory;
  is_read: boolean;
  read_at?: string;
  sent_at?: string;
  created_at: string;
}

// ===========================================
// SEARCH & FILTER INTERFACES
// ===========================================

export interface UserSearchParams extends PaginationParams {
  role?: UserRole;
  status?: "active" | "inactive";
  search?: string;
}

export interface CargoSearchParams extends PaginationParams {
  status?: CargoStatus;
  priority?: CargoPriority;
  client_id?: UUID;
  driver_id?: UUID;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface VehicleSearchParams extends PaginationParams {
  type?: VehicleType;
  status?: VehicleStatus;
  capacity_min?: number;
  search?: string;
}

// ===========================================
// DASHBOARD INTERFACES
// ===========================================

export interface DashboardStats {
  total_users: number;
  total_drivers: number;
  total_vehicles: number;
  total_cargos: number;
  active_deliveries: number;
  completed_deliveries: number;
  total_revenue: number;
  pending_payments: number;
}

// ===========================================
// FILE INTERFACES
// ===========================================

export interface File {
  id: UUID;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  file_url: string;
  type: FileType;
  category?: string;
  uploaded_by: UUID;
  created_at: string;
  updated_at: string;
}

export interface UploadFileRequest {
  type: FileType;
  category?: string;
}

export interface FileUrlResponse {
  file_url: string;
}

// ===========================================
// PAYMENT INTERFACES
// ===========================================

export interface Payment {
  id: UUID;
  invoice_id: UUID;
  amount: number;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  transaction_id?: string;
  payment_reference?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentRequest {
  invoice_id: UUID;
  amount: number;
  payment_method: PaymentMethod;
  transaction_id?: string;
}

export interface Refund {
  id: UUID;
  invoice_id: UUID;
  amount: number;
  reason: string;
  status: RefundStatus;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRefundRequest {
  invoice_id: UUID;
  amount: number;
  reason: string;
}

// ===========================================
// MAINTENANCE INTERFACES
// ===========================================

export interface MaintenanceRecord {
  id: UUID;
  vehicle_id: UUID;
  maintenance_type: MaintenanceType;
  description: string;
  cost: number;
  service_provider: string;
  service_date: string;
  next_service_date?: string;
  mileage_at_service?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMaintenanceRecordRequest {
  maintenance_type: MaintenanceType;
  description: string;
  cost: number;
  service_provider: string;
  service_date: string;
  next_service_date?: string;
  mileage_at_service?: number;
  notes?: string;
}

// ===========================================
// DELIVERY INTERFACES
// ===========================================

export interface Delivery {
  id: UUID;
  cargo_id: UUID;
  driver_id: UUID;
  vehicle_id: UUID;
  start_time?: string;
  end_time?: string;
  actual_pickup_time?: string;
  actual_delivery_time?: string;
  confirmation_method?: ConfirmationMethod;
  recipient_name?: string;
  recipient_signature?: string;
  rating?: number;
  review?: string;
  status: CargoStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DeliveryConfirmation {
  cargo_id: UUID;
  confirmation_method: ConfirmationMethod;
  recipient_name: string;
  recipient_signature?: string;
  rating?: number;
  review?: string;
  end_time?: string;
}

export interface DeliveryProof {
  id: UUID;
  delivery_id: UUID;
  file_url: string;
  file_type: FileType;
  uploaded_at: string;
}

// ===========================================
// TRACKING INTERFACES
// ===========================================

export interface CargoTracking {
  cargo_id: UUID;
  current_status: CargoStatus;
  location_history: GPSTracking[];
  status_updates: DeliveryStatusUpdate[];
  estimated_delivery_time?: string;
  last_updated: string;
  driver?: {
    id: UUID;
    full_name: string;
    phone?: string;
    rating: number;
  };
  vehicle?: {
    id: UUID;
    license_plate: string;
    make?: string;
    model?: string;
  };
  current_location?: string;
  progress_percentage?: number;
}

// ===========================================
// ROUTE INTERFACES
// ===========================================

export interface Route {
  id: UUID;
  cargo_id: UUID;
  route_name: string;
  total_distance_km: number;
  estimated_duration_minutes: number;
  waypoints: RouteWaypoint[];
  status: string;
  created_at: string;
  updated_at: string;
}

export interface RouteWaypoint {
  id: UUID;
  route_id: UUID;
  waypoint_order: number;
  latitude: number;
  longitude: number;
  address: string;
  waypoint_type: "pickup" | "delivery" | "waypoint";
  estimated_time?: string;
  actual_time?: string;
  status: string;
}

export interface RouteProgress {
  route_id: UUID;
  current_waypoint: number;
  total_waypoints: number;
  progress_percentage: number;
  estimated_completion_time?: string;
  current_location?: {
    latitude: number;
    longitude: number;
  };
  completed_waypoints: RouteWaypoint[];
  remaining_waypoints: RouteWaypoint[];
}

export interface CreateRouteRequest {
  cargo_id: UUID;
  route_name: string;
  total_distance_km: number;
  estimated_duration_minutes: number;
  waypoints: Omit<
    RouteWaypoint,
    "id" | "route_id" | "actual_time" | "status"
  >[];
}

// ===========================================
// PAYMENT INTERFACES
// ===========================================

export interface Payment {
  id: UUID;
  invoice_id: UUID;
  amount: number;
  payment_method: PaymentMethod;
  transaction_id?: string;
  status: PaymentStatus;
  processed_at?: string;
  created_at: string;
}

export interface CreatePaymentRequest {
  invoice_id: UUID;
  amount: number;
  payment_method: PaymentMethod;
  transaction_id?: string;
}

export interface PaymentHistoryParams {
  invoice_id?: UUID;
  status?: PaymentStatus;
  page?: number;
  limit?: number;
  date_from?: string;
  date_to?: string;
}

export interface CreateRefundRequest {
  invoice_id: UUID;
  amount: number;
  reason: string;
}

// ===========================================
// INSURANCE INTERFACES
// ===========================================

export interface InsurancePolicy {
  id: UUID;
  cargo_id: UUID;
  policy_number: string;
  coverage_amount: number;
  premium_amount: number;
  insurance_provider: string;
  policy_start_date: string;
  policy_end_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInsurancePolicyRequest {
  cargo_id: UUID;
  policy_number: string;
  coverage_amount: number;
  premium_amount: number;
  insurance_provider: string;
  policy_start_date: string;
  policy_end_date: string;
}

export interface InsuranceClaim {
  id: UUID;
  cargo_id: UUID;
  policy_id: UUID;
  claim_number: string;
  claim_amount: number;
  claim_reason: string;
  status: string;
  approved_by?: UUID;
  approved_at?: string;
  processed_at?: string;
  created_at: string;
}

export interface CreateInsuranceClaimRequest {
  cargo_id: UUID;
  policy_id: UUID;
  claim_number: string;
  claim_amount: number;
  claim_reason: string;
}

// ===========================================
// SEARCH INTERFACES
// ===========================================

export interface SearchParams {
  q: string;
  entity_type?: string;
  filters?: Record<string, any>;
  page?: number;
  limit?: number;
}

export interface SearchResults {
  results: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  facets?: Record<string, any>;
}

// ===========================================
// ANALYTICS INTERFACES
// ===========================================

export interface AnalyticsParams {
  period?: string;
  start_date?: string;
  end_date?: string;
  group_by?: string;
  filters?: Record<string, any>;
}

export interface AnalyticsData {
  metrics: Record<string, number>;
  trends: Array<{
    date: string;
    value: number;
  }>;
  breakdown: Record<string, any>;
}

export interface PerformanceMetrics {
  average_delivery_time: number;
  on_time_delivery_rate: number;
  customer_satisfaction_score: number;
  driver_performance_score: number;
  vehicle_utilization_rate: number;
}

export interface FinancialAnalytics {
  total_revenue: number;
  total_costs: number;
  profit_margin: number;
  revenue_by_period: Array<{
    period: string;
    revenue: number;
  }>;
  cost_breakdown: Record<string, number>;
}

export interface CargoAnalytics {
  total_cargos: number;
  delivered_cargos: number;
  pending_cargos: number;
  cancelled_cargos: number;
  cargo_by_category: Record<string, number>;
  cargo_by_status: Record<string, number>;
}

export interface DriverAnalytics {
  total_drivers: number;
  active_drivers: number;
  average_rating: number;
  total_deliveries: number;
  performance_by_driver: Array<{
    driver_id: UUID;
    driver_name: string;
    deliveries_count: number;
    average_rating: number;
  }>;
}

// ===========================================
// DASHBOARD INTERFACES
// ===========================================

// Main Dashboard Overview
export interface DashboardOverview {
  summary: DashboardStats;
  recent_activities: RecentActivity[];
  alerts: DashboardAlert[];
  quick_stats: QuickStats;
}

// Enhanced Dashboard Stats
export interface DashboardStats {
  // User Statistics
  total_users: number;
  active_users: number;
  new_users_today: number;
  new_users_this_week: number;
  users_by_role: Record<UserRole, number>;

  // Driver Statistics
  total_drivers: number;
  active_drivers: number;
  available_drivers: number;
  drivers_on_duty: number;
  average_driver_rating: number;

  // Vehicle Statistics
  total_vehicles: number;
  active_vehicles: number;
  vehicles_in_maintenance: number;
  vehicles_available: number;
  vehicle_utilization_rate: number;

  // Cargo & Delivery Statistics
  total_cargos: number;
  pending_cargos: number;
  active_deliveries: number;
  completed_deliveries_today: number;
  completed_deliveries_this_week: number;
  cancelled_deliveries: number;

  // Financial Statistics
  total_revenue: number;
  revenue_today: number;
  revenue_this_week: number;
  revenue_this_month: number;
  pending_payments: number;
  total_outstanding_amount: number;
  average_order_value: number;

  // Performance Metrics
  on_time_delivery_rate: number;
  average_delivery_time_hours: number;
  customer_satisfaction_score: number;
  system_uptime_percentage: number;
}

// Quick Stats for Dashboard Cards
export interface QuickStats {
  today_deliveries: number;
  today_revenue: number;
  pending_approvals: number;
  system_alerts: number;
  active_support_tickets: number;
  maintenance_due: number;
}

// Recent Activities
export interface RecentActivity {
  id: UUID;
  type: ActivityType;
  title: string;
  description: string;
  user_id?: UUID;
  user_name?: string;
  entity_type?: string;
  entity_id?: UUID;
  timestamp: string;
  severity: ActivitySeverity;
}

export enum ActivityType {
  DELIVERY_CREATED = "delivery_created",
  DELIVERY_COMPLETED = "delivery_completed",
  PAYMENT_RECEIVED = "payment_received",
  USER_REGISTERED = "user_registered",
  DRIVER_ASSIGNED = "driver_assigned",
  VEHICLE_MAINTENANCE = "vehicle_maintenance",
  SYSTEM_ALERT = "system_alert",
  INVOICE_GENERATED = "invoice_generated",
  REFUND_PROCESSED = "refund_processed",
}

export enum ActivitySeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

// Dashboard Alerts
export interface DashboardAlert {
  id: UUID;
  type: AlertType;
  title: string;
  message: string;
  severity: ActivitySeverity;
  is_read: boolean;
  created_at: string;
  expires_at?: string;
  action_required: boolean;
  action_url?: string;
}

export enum AlertType {
  PAYMENT_OVERDUE = "payment_overdue",
  VEHICLE_MAINTENANCE_DUE = "vehicle_maintenance_due",
  DRIVER_LICENSE_EXPIRING = "driver_license_expiring",
  INSURANCE_EXPIRING = "insurance_expiring",
  SYSTEM_ERROR = "system_error",
  HIGH_CANCELLATION_RATE = "high_cancellation_rate",
  LOW_DRIVER_RATING = "low_driver_rating",
}

// Charts Data Interfaces
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

// Revenue Chart Data
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

// Delivery Performance Chart
export interface DeliveryPerformanceChart {
  delivery_times: Array<{
    date: string;
    average_time_hours: number;
    on_time_percentage: number;
  }>;
  status_distribution: Record<CargoStatus, number>;
  priority_distribution: Record<CargoPriority, number>;
}

// Geographic Analytics
export interface GeographicAnalytics {
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

// Driver Performance Dashboard
export interface DriverPerformanceDashboard {
  top_performers: Array<{
    driver_id: UUID;
    driver_name: string;
    deliveries_completed: number;
    average_rating: number;
    total_distance_km: number;
    on_time_percentage: number;
  }>;
  performance_trends: Array<{
    date: string;
    average_rating: number;
    deliveries_completed: number;
  }>;
  driver_status_distribution: Record<DriverStatus, number>;
}

// Vehicle Analytics Dashboard
export interface VehicleAnalyticsDashboard {
  vehicle_utilization: Array<{
    vehicle_id: UUID;
    plate_number: string;
    utilization_percentage: number;
    total_distance_km: number;
    maintenance_cost: number;
  }>;
  fuel_efficiency: Array<{
    vehicle_id: UUID;
    plate_number: string;
    fuel_efficiency_km_per_liter: number;
    total_fuel_cost: number;
  }>;
  maintenance_schedule: Array<{
    vehicle_id: UUID;
    plate_number: string;
    next_maintenance_date: string;
    maintenance_type: MaintenanceType;
    estimated_cost: number;
  }>;
}

// Client Analytics Dashboard
export interface ClientAnalyticsDashboard {
  top_clients: Array<{
    client_id: UUID;
    client_name: string;
    total_orders: number;
    total_revenue: number;
    average_order_value: number;
    last_order_date: string;
  }>;
  client_growth: Array<{
    date: string;
    new_clients: number;
    active_clients: number;
  }>;
  business_type_distribution: Record<BusinessType, number>;
}

// System Health Dashboard
export interface SystemHealthDashboard {
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

// Dashboard Response Types
export interface DashboardResponse {
  stats: {
    total_revenue: number;
    active_admins: number;
    total_users: number;
    system_health_percentage: number;
    total_drivers: number;
    total_clients: number;
    total_vehicles: number;
    system_uptime: number;
  };
  charts: {
    revenue_trends: RevenueChartData;
    usage_trends: {
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
    };
    admin_performance: {
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
    };
    users_distribution: {
      users_by_role: Record<string, number>;
      users_by_status: Record<string, number>;
      users_by_business_type: Record<string, number>;
      registration_trends: Array<{
        date: string;
        total_users: number;
        new_registrations: number;
      }>;
    };
  };
  tables: {
    pending_approvals: Array<{
      id: string;
      type: string;
      name: string;
      email: string;
      status: string;
      submitted_at: string;
      admin_notes?: string;
    }>;
    system_alerts: Array<{
      id: string;
      type: string;
      message: string;
      severity: string;
      created_at: string;
      is_resolved: boolean;
      resolved_by?: string;
      resolved_at?: string;
    }>;
  };
  system_health: SystemHealthDashboard;
  recent_logs: Array<{
    id: string;
    type: string;
    user: string;
    action: string;
    ip_address: string;
    timestamp: string;
    success: boolean;
    details?: Record<string, any>;
  }>;
}

// Dashboard Filter Parameters
export interface DashboardFilters {
  date_range?: {
    start_date: string;
    end_date: string;
  };
  period?: "today" | "week" | "month" | "quarter" | "year";
  user_role?: UserRole;
  driver_status?: DriverStatus;
  vehicle_type?: VehicleType;
  cargo_status?: CargoStatus;
  payment_method?: PaymentMethod;
}
