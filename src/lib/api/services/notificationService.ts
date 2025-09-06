import axiosInstance from "../axios";
import {
  ApiResponse,
  Notification,
  NotificationType,
  NotificationCategory,
  PaginationResponse,
} from "../../../types/shared";

export class NotificationService {
  // Get user notifications
  static async getNotifications(params?: {
    type?: NotificationType;
    category?: NotificationCategory;
    is_read?: boolean;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginationResponse<Notification>>> {
    const response = await axiosInstance.get("/notifications", { params });
    return response.data;
  }

  // Mark notification as read
  static async markAsRead(id: string): Promise<ApiResponse<Notification>> {
    const response = await axiosInstance.put(`/notifications/${id}/read`, {
      read_at: new Date().toISOString(),
    });
    return response.data;
  }

  // Mark all notifications as read
  static async markAllAsRead(): Promise<ApiResponse<null>> {
    const response = await axiosInstance.put("/notifications/read-all");
    return response.data;
  }

  // Get notification settings
  static async getSettings(): Promise<
    ApiResponse<{
      email_notifications: boolean;
      sms_notifications: boolean;
      push_notifications: boolean;
      delivery_updates: boolean;
      payment_notifications: boolean;
      system_notifications: boolean;
    }>
  > {
    const response = await axiosInstance.get("/notifications/settings");
    return response.data;
  }

  // Update notification settings
  static async updateSettings(data: {
    email_notifications?: boolean;
    sms_notifications?: boolean;
    push_notifications?: boolean;
    delivery_updates?: boolean;
    payment_notifications?: boolean;
    system_notifications?: boolean;
  }): Promise<ApiResponse<any>> {
    const response = await axiosInstance.put("/notifications/settings", data);
    return response.data;
  }

  // Send notification (Admin)
  static async sendNotification(data: {
    user_id: string;
    type: NotificationType;
    title?: string;
    message: string;
    category?: NotificationCategory;
    data?: any;
  }): Promise<ApiResponse<Notification>> {
    const response = await axiosInstance.post("/notifications/send", data);
    return response.data;
  }
}
