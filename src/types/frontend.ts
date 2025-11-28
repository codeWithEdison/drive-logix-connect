// ===========================================
// FRONTEND-SPECIFIC TYPES AND UTILITIES
// ===========================================

import {
  UserRole,
  Language,
  CargoStatus,
  DriverStatus,
  VehicleStatus,
  InvoiceStatus,
  PaymentStatus,
} from "./shared";

// ===========================================
// UI STATE TYPES
// ===========================================

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface FilterState {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: any;
}

export interface SortState {
  field: string;
  direction: "asc" | "desc";
}

// ===========================================
// FORM TYPES
// ===========================================

export interface FormField {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "password"
    | "number"
    | "date"
    | "select"
    | "textarea"
    | "checkbox"
    | "file";
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    custom?: (value: any) => string | null;
  };
}

export interface FormState<T = any> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

// ===========================================
// COMPONENT PROPS TYPES
// ===========================================

export interface TableColumn<T = any> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, record: T) => React.ReactNode;
  width?: string | number;
  align?: "left" | "center" | "right";
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: PaginationState;
  filters?: FilterState;
  sort?: SortState;
  onPaginationChange?: (page: number, limit: number) => void;
  onFilterChange?: (filters: FilterState) => void;
  onSortChange?: (sort: SortState) => void;
  onRowClick?: (record: T) => void;
  selectable?: boolean;
  selectedRows?: T[];
  onSelectionChange?: (selectedRows: T[]) => void;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closable?: boolean;
  maskClosable?: boolean;
  children: React.ReactNode;
}

export interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

// ===========================================
// DASHBOARD TYPES
// ===========================================

export interface DashboardCard {
  id: string;
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease";
    period: string;
  };
  icon?: React.ReactNode;
  color?: string;
  onClick?: () => void;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

export interface DashboardStats {
  totalCargos: number;
  activeDeliveries: number;
  completedDeliveries: number;
  totalRevenue: number;
  pendingPayments: number;
  totalDrivers: number;
  totalVehicles: number;
  totalClients: number;
}

// ===========================================
// NOTIFICATION TYPES
// ===========================================

export interface ToastNotification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "delivery" | "payment" | "system" | "promotional";
  isRead: boolean;
  createdAt: string;
  data?: any;
}

// ===========================================
// MAP AND TRACKING TYPES
// ===========================================

export interface MapLocation {
  latitude: number;
  longitude: number;
  address?: string;
  timestamp?: string;
}

export interface TrackingPoint extends MapLocation {
  speed?: number;
  heading?: number;
  accuracy?: number;
  batteryLevel?: number;
}

export interface Route {
  id: string;
  name: string;
  waypoints: MapLocation[];
  totalDistance: number;
  estimatedDuration: number;
  status: "planned" | "active" | "completed" | "cancelled";
}

// ===========================================
// FILE UPLOAD TYPES
// ===========================================

export interface FileUpload {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "completed" | "error";
  error?: string;
  url?: string;
}

export interface FileUploadConfig {
  maxSize: number; // in bytes
  allowedTypes: string[];
  multiple?: boolean;
  onUpload?: (file: File) => Promise<string>;
  onProgress?: (progress: number) => void;
  onError?: (error: string) => void;
}

// ===========================================
// SEARCH AND FILTER TYPES
// ===========================================

export interface SearchFilters {
  query?: string;
  status?: string[];
  dateRange?: {
    from: string;
    to: string;
  };
  location?: {
    city?: string;
    country?: string;
  };
  custom?: Record<string, any>;
}

export interface SearchResult<T = any> {
  data: T[];
  total: number;
  filters: SearchFilters;
  suggestions?: string[];
}

// ===========================================
// USER PREFERENCES TYPES
// ===========================================

export interface UserPreferences {
  language: Language;
  theme: "light" | "dark" | "system";
  timezone: string;
  dateFormat: string;
  currency: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    deliveryUpdates: boolean;
    paymentNotifications: boolean;
    systemNotifications: boolean;
  };
  dashboard: {
    layout: "grid" | "list";
    widgets: string[];
    refreshInterval: number;
  };
}

// ===========================================
// API RESPONSE WRAPPER TYPES
// ===========================================

export interface ApiState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export interface PaginatedApiState<T = any> extends ApiState<T[]> {
  pagination: PaginationState;
}

// ===========================================
// UTILITY TYPES
// ===========================================

export type StatusColor =
  | "green"
  | "yellow"
  | "red"
  | "blue"
  | "gray"
  | "orange";

export interface StatusConfig {
  label: string;
  color: StatusColor;
  icon?: string;
}

export const STATUS_CONFIGS: Record<string, StatusConfig> = {
  // Cargo Status
  "cargo_pending": { label: "Pending", color: "yellow" },
  "cargo_quoted": { label: "Quoted", color: "blue" },
  "cargo_accepted": { label: "Accepted", color: "green" },
  "cargo_partially_assigned": {
    label: "Partially Assigned",
    color: "orange",
  },
  "cargo_fully_assigned": { label: "Fully Assigned", color: "blue" },
  "cargo_picked_up": { label: "Picked Up", color: "green" },
  "cargo_in_transit": { label: "In Transit", color: "blue" },
  "cargo_delivered": { label: "Delivered", color: "green" },
  "cargo_cancelled": { label: "Cancelled", color: "red" },
  "cargo_disputed": { label: "Disputed", color: "red" },

  // Driver Status
  "driver_available": { label: "Available", color: "green" },
  "driver_on_duty": { label: "On Duty", color: "blue" },
  "driver_unavailable": { label: "Unavailable", color: "gray" },
  "driver_suspended": { label: "Suspended", color: "red" },

  // Vehicle Status
  "vehicle_active": { label: "Active", color: "green" },
  "vehicle_maintenance": { label: "Maintenance", color: "yellow" },
  "vehicle_retired": { label: "Retired", color: "gray" },
  "vehicle_suspended": { label: "Suspended", color: "red" },

  // Invoice Status
  "invoice_draft": { label: "Draft", color: "gray" },
  "invoice_sent": { label: "Sent", color: "blue" },
  "invoice_paid": { label: "Paid", color: "green" },
  "invoice_overdue": { label: "Overdue", color: "red" },
  "invoice_cancelled": { label: "Cancelled", color: "red" },

  // Payment Status
  "payment_pending": { label: "Pending", color: "yellow" },
  "payment_completed": { label: "Completed", color: "green" },
  "payment_failed": { label: "Failed", color: "red" },
  "payment_refunded": { label: "Refunded", color: "blue" },
};

// ===========================================
// EXPORT ALL TYPES
// ===========================================

export * from "./shared";
