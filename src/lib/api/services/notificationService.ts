import axiosInstance from "../axios";

// Types for notification system
export interface Notification {
  id: string;
  assignment_id?: string;
  driver_id?: string;
  notification_type: "sms" | "email" | "push" | "in_app";
  message: string;
  title?: string;
  category?: "delivery_update" | "payment" | "system" | "promotional";
  metadata?: any;
  is_read: boolean;
  sent_at: string;
  read_at?: string;
  created_at: string;
}

export interface NotificationFilters {
  unread_only?: boolean;
  notification_type?: "sms" | "email" | "push" | "in_app";
  category?: "delivery_update" | "payment" | "system" | "promotional";
  page?: number;
  limit?: number;
}

export interface NotificationListResponse {
  success: boolean;
  message: string;
  data: {
    notifications: Notification[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  meta: {
    timestamp: string;
    requestId: string;
  };
}

export interface NotificationStatsResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    unread: number;
    by_type: {
      in_app: number;
      push: number;
      email: number;
      sms: number;
    };
  };
  meta: {
    timestamp: string;
    requestId: string;
  };
}

export interface MarkReadResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    is_read: boolean;
    read_at: string;
  };
  meta: {
    timestamp: string;
    requestId: string;
  };
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  deliveryUpdates: boolean;
  paymentNotifications: boolean;
  systemAlerts: boolean;
  marketingEmails: boolean;
}

export interface NotificationSettingsResponse {
  success: boolean;
  message: string;
  data: NotificationSettings;
  meta: {
    timestamp: string;
    requestId: string;
  };
}

class NotificationService {
  private static baseUrl = "/notifications";

  /**
   * Get user notifications
   */
  static async getNotifications(
    filters: NotificationFilters = {}
  ): Promise<NotificationListResponse> {
    try {
      const params = new URLSearchParams();

      if (filters.unread_only !== undefined)
        params.append("unread_only", filters.unread_only.toString());
      if (filters.notification_type)
        params.append("notification_type", filters.notification_type);
      if (filters.category)
        params.append("category", filters.category);
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());

      const response = await axiosInstance.get(
        `${NotificationService.baseUrl}?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      throw NotificationService.handleError(error);
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<MarkReadResponse> {
    try {
      const response = await axiosInstance.put(
        `${NotificationService.baseUrl}/${notificationId}/read`
      );
      return response.data;
    } catch (error: any) {
      throw NotificationService.handleError(error);
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(): Promise<MarkReadResponse> {
    try {
      const response = await axiosInstance.put(
        `${NotificationService.baseUrl}/read-all`
      );
      return response.data;
    } catch (error: any) {
      throw NotificationService.handleError(error);
    }
  }

  /**
   * Get notification statistics
   */
  static async getNotificationStats(): Promise<NotificationStatsResponse> {
    try {
      const response = await axiosInstance.get(
        `${NotificationService.baseUrl}/stats`
      );
      return response.data;
    } catch (error: any) {
      throw NotificationService.handleError(error);
    }
  }

  /**
   * Get notification settings (admin only)
   */
  static async getSettings(): Promise<NotificationSettingsResponse> {
    try {
      const response = await axiosInstance.get("/admin/notification-settings");
      return response.data;
    } catch (error: any) {
      throw NotificationService.handleError(error);
    }
  }

  /**
   * Update notification settings (admin only)
   */
  static async updateSettings(
    settings: NotificationSettings
  ): Promise<NotificationSettingsResponse> {
    try {
      const response = await axiosInstance.put(
        "/admin/notification-settings",
        settings
      );
      return response.data;
    } catch (error: any) {
      throw NotificationService.handleError(error);
    }
  }

  /**
   * Send notification (admin only)
   */
  static async sendNotification(data: {
    user_id: string;
    type: "sms" | "email" | "push" | "in_app";
    title?: string;
    message: string;
    category?: "delivery_update" | "payment" | "system" | "promotional";
    metadata?: any;
  }): Promise<any> {
    try {
      const response = await axiosInstance.post(
        "/admin/send-notification",
        data
      );
      return response.data;
    } catch (error: any) {
      throw NotificationService.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  private static handleError(error: any): Error {
    if (error.response?.data?.error) {
      const apiError = error.response.data.error;
      return new Error(`${apiError.code}: ${apiError.message}`);
    }

    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }

    if (error.message) {
      return new Error(error.message);
    }

    return new Error("An unexpected error occurred");
  }
}

export { NotificationService };
export const notificationService = new NotificationService();
