import axiosInstance from "../axios";

// Types for notification system
export interface AssignmentNotification {
  id: string;
  assignment_id: string;
  notification_type:
    | "assignment_created"
    | "assignment_accepted"
    | "assignment_rejected"
    | "assignment_cancelled";
  message: string;
  is_read: boolean;
  sent_at: string;
  read_at?: string;
  created_at: string;
  assignment?: {
    id: string;
    assignment_status: string;
    expires_at: string;
    cargo?: {
      cargo_number: string;
      pickup_address: string;
      destination_address: string;
    };
  };
}

export interface NotificationFilters {
  unread_only?: boolean;
  notification_type?:
    | "assignment_created"
    | "assignment_accepted"
    | "assignment_rejected"
    | "assignment_cancelled";
  page?: number;
  limit?: number;
}

export interface NotificationListResponse {
  success: boolean;
  message: string;
  data: {
    notifications: AssignmentNotification[];
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
      assignment_created: number;
      assignment_accepted: number;
      assignment_rejected: number;
      assignment_cancelled: number;
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

class NotificationService {
  private baseUrl = "/drivers/notifications";

  /**
   * Get driver notifications
   */
  async getNotifications(
    filters: NotificationFilters = {}
  ): Promise<NotificationListResponse> {
    try {
      const params = new URLSearchParams();

      if (filters.unread_only !== undefined)
        params.append("unread_only", filters.unread_only.toString());
      if (filters.notification_type)
        params.append("notification_type", filters.notification_type);
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());

      const response = await axiosInstance.get(
        `${this.baseUrl}?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<MarkReadResponse> {
    try {
      const response = await axiosInstance.put(
        `${this.baseUrl}/${notificationId}/read`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<MarkReadResponse> {
    try {
      const response = await axiosInstance.put(`${this.baseUrl}/read-all`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(): Promise<NotificationStatsResponse> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/stats`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
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
