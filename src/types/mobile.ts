// ===========================================
// MOBILE-SPECIFIC TYPE DEFINITIONS
// Based on backend mobile API endpoints
// ===========================================

import {
  ApiResponse,
  UUID,
  CargoStatus,
  CargoPriority,
  PaymentMethod,
  UserRole,
} from "./shared";

// ===========================================
// SYNC INTERFACES
// ===========================================

export interface SyncItem {
  entityType: string;
  entityId?: string;
  action: "create" | "update" | "delete";
  payload: any;
  timestamp?: number;
}

export interface SyncPushRequest {
  changes: SyncItem[];
}

export interface SyncPushResponse {
  queued_count: number;
  processed_count: number;
  conflicts: Array<{
    entityType: string;
    entityId: string;
    conflict_reason: string;
  }>;
}

export interface SyncPullResponse {
  changes: Array<{
    id: string;
    entity_type: string;
    entity_id: string;
    action: "create" | "update" | "delete";
    payload: any;
    created_at: string;
  }>;
  last_sync: string;
}

export interface SyncTriggerResponse {
  processed_count: number;
  failed_count: number;
}

// ===========================================
// APP CONFIGURATION INTERFACES
// ===========================================

export interface AppConfig {
  app_info: {
    name: string;
    version: string;
    min_android_version: string;
    min_ios_version: string;
  };
  api_endpoints: {
    base_url: string;
    websocket_url: string;
    upload_url: string;
  };
  features: {
    real_time_tracking: boolean;
    multi_language: boolean;
    qr_delivery_confirmation: boolean;
    email_notifications: boolean;
    sms_notifications: boolean;
    push_notifications: boolean;
    automatic_driver_assignment: boolean;
    route_optimization: boolean;
    offline_sync: boolean;
  };
  payment_methods: {
    flutterwave: boolean;
    mobile_money: boolean;
    card_payments: boolean;
    cash_payments: boolean;
  };
  languages: {
    supported: string[];
    default: string;
  };
  limits: {
    max_file_size_mb: number;
    max_cargo_weight_kg: number;
    max_delivery_distance_km: number;
    sync_queue_max_size: number;
  };
  notifications: {
    topics: string[];
    categories: string[];
  };
}

export interface AppConfigResponse extends ApiResponse<AppConfig> {}

// ===========================================
// MOBILE CARGO INTERFACES
// ===========================================

export interface MobileCargo {
  id: UUID;
  cargo_number: string;
  type: string;
  status: CargoStatus;
  weight_kg: number;
  pickup_address: string;
  destination_address: string;
  estimated_cost: number;
  created_at: string;
  updated_at: string;
}

export interface MobileCargoDetails extends MobileCargo {
  final_cost?: number;
  description?: string;
  special_requirements?: string;
  current_assignment?: {
    id: UUID;
    status: string;
    driver: {
      id: UUID;
      name: string;
      phone: string;
    };
    vehicle: {
      id: UUID;
      plate_number: string;
      model: string;
    };
    assigned_at: string;
  };
}

export interface MobileCargoListResponse
  extends ApiResponse<{
    cargos: MobileCargo[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {}

export interface MobileCargoDetailsResponse
  extends ApiResponse<MobileCargoDetails> {}

export interface MobileCargoParams {
  page?: number;
  limit?: number;
  status?: CargoStatus;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

// ===========================================
// BATCH OPERATIONS INTERFACES
// ===========================================

export interface BatchCargoRequest {
  cargos: Array<{
    type: string;
    weight_kg: number;
    pickup_address: string;
    destination_address: string;
    estimated_cost: number;
  }>;
}

export interface BatchCargoResponse
  extends ApiResponse<{
    created_count: number;
    cargos: Array<{
      id: UUID;
      cargo_number: string;
      status: CargoStatus;
    }>;
  }> {}

export interface BatchDeliveryStatusUpdate {
  deliveryId: UUID;
  status: CargoStatus;
  notes?: string;
}

export interface BatchDeliveryStatusRequest {
  updates: BatchDeliveryStatusUpdate[];
}

export interface BatchDeliveryStatusResponse
  extends ApiResponse<{
    updated_count: number;
    deliveries: Array<{
      id: UUID;
      status: CargoStatus;
      updated_at: string;
    }>;
  }> {}

export interface BatchGPSLocation {
  latitude: number;
  longitude: number;
  timestamp: string;
  accuracy: number;
  speed?: number;
  heading?: number;
}

export interface BatchGPSLocationRequest {
  locations: BatchGPSLocation[];
  vehicleId?: UUID;
  driverId?: UUID;
}

export interface BatchGPSLocationResponse
  extends ApiResponse<{
    added_count: number;
    locations: Array<{
      id: UUID;
      latitude: number;
      longitude: number;
      recorded_at: string;
    }>;
  }> {}

// ===========================================
// DEVICE REGISTRATION INTERFACES
// ===========================================

export interface DeviceRegistrationRequest {
  token: string;
  platform: "android" | "ios" | "web";
  deviceInfo: {
    model: string;
    os_version: string;
    app_version: string;
  };
  appVersion: string;
}

export interface DeviceRegistrationResponse extends ApiResponse<null> {}

export interface DeviceDeregistrationRequest {
  token: string;
}

export interface DeviceDeregistrationResponse extends ApiResponse<null> {}

// ===========================================
// NOTIFICATION INTERFACES
// ===========================================

export interface NotificationCountResponse
  extends ApiResponse<{
    count: number;
  }> {}

export interface SendToRoleRequest {
  role: UserRole;
  title: string;
  message: string;
  type: "push" | "in_app" | "email" | "sms";
  category: "system" | "delivery_update" | "payment_update" | "promotion";
  metadata?: any;
}

export interface SendToRoleResponse
  extends ApiResponse<{
    recipients_count: number;
  }> {}

export interface DeleteNotificationResponse extends ApiResponse<null> {}

// ===========================================
// WEBSOCKET MOBILE EVENTS
// ===========================================

export interface WebSocketMobileEvents {
  // Client → Server Events
  "mobile:sync:request": {
    lastSync?: string;
  };
  "mobile:offline:status": {
    isOffline: boolean;
    timestamp: string;
  };
  "mobile:heartbeat": {
    timestamp: string;
    location?: {
      latitude: number;
      longitude: number;
    };
  };
  "mobile:location:batch": BatchGPSLocationRequest;
  "mobile:notification:received": {
    notificationId: UUID;
    timestamp: string;
  };

  // Server → Client Events
  "mobile:sync:response": SyncPullResponse;
  "mobile:notification:new": {
    id: UUID;
    title: string;
    message: string;
    type: string;
    category: string;
    data?: any;
  };
  "mobile:cargo:update": {
    cargoId: UUID;
    status: CargoStatus;
    updatedAt: string;
  };
  "mobile:delivery:update": {
    deliveryId: UUID;
    status: CargoStatus;
    updatedAt: string;
  };
  "mobile:heartbeat:response": {
    timestamp: string;
    serverTime: string;
  };
}

// ===========================================
// MOBILE-SPECIFIC ERROR CODES
// ===========================================

export enum MobileErrorCode {
  SYNC_CONFLICT = "SYNC_CONFLICT",
  OFFLINE_DATA_LOST = "OFFLINE_DATA_LOST",
  DEVICE_NOT_REGISTERED = "DEVICE_NOT_REGISTERED",
  PUSH_NOTIFICATION_FAILED = "PUSH_NOTIFICATION_FAILED",
  BATCH_OPERATION_PARTIAL_FAILURE = "BATCH_OPERATION_PARTIAL_FAILURE",
  APP_CONFIG_OUTDATED = "APP_CONFIG_OUTDATED",
  MOBILE_FEATURE_DISABLED = "MOBILE_FEATURE_DISABLED",
}

// ===========================================
// MOBILE UTILITY TYPES
// ===========================================

export type MobilePlatform = "android" | "ios" | "web";

export type SyncAction = "create" | "update" | "delete";

// Re-export from shared to avoid conflicts
export { NotificationCategory, NotificationType } from "./shared";

// ===========================================
// MOBILE RESPONSE HELPERS
// ===========================================

export interface MobileApiResponse<T> extends ApiResponse<T> {
  meta: {
    timestamp: string;
    version: string;
    language: string;
    requestId: string;
    mobile_optimized?: boolean;
    offline_capable?: boolean;
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

export interface MobileErrorResponse extends ApiResponse<null> {
  error: {
    code: MobileErrorCode | string;
    message: string;
    details?: any;
    retry_after?: number;
  };
}

