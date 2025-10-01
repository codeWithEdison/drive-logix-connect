import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryClient";
import {
  NotificationService,
  NotificationFilters,
  NotificationListResponse,
  NotificationStatsResponse,
  MarkReadResponse,
  NotificationSettings,
  NotificationSettingsResponse,
} from "../services/notificationService";
import { useAuth } from "../../../contexts/AuthContext";
import { customToast } from "../../utils/toast";

// Hook to get notifications for the current user
export function useNotifications(filters: NotificationFilters = {}) {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.notifications.list(filters),
    queryFn: () => NotificationService.getNotifications(filters),
    enabled: !!user,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}

// Hook to get notification statistics
export function useNotificationStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.notifications.stats(),
    queryFn: () => NotificationService.getNotificationStats(),
    enabled: !!user,
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

// Hook to mark a notification as read
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      NotificationService.markAsRead(notificationId),
    onSuccess: (data: MarkReadResponse) => {
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      });

      customToast.success("Notification marked as read");
    },
    onError: (error: Error) => {
      customToast.error(
        `Failed to mark notification as read: ${error.message}`
      );
    },
  });
}

// Hook to mark all notifications as read
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => NotificationService.markAllAsRead(),
    onSuccess: (data: MarkReadResponse) => {
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      });

      customToast.success("All notifications marked as read");
    },
    onError: (error: Error) => {
      customToast.error(
        `Failed to mark all notifications as read: ${error.message}`
      );
    },
  });
}

// Hook to get notification settings
export function useNotificationSettings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.notifications.settings(),
    queryFn: () => NotificationService.getSettings(),
    enabled: !!user && (user.role === "admin" || user.role === "super_admin"),
    staleTime: 300000, // 5 minutes
  });
}

// Hook to update notification settings
export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: NotificationSettings) =>
      NotificationService.updateSettings(settings),
    onSuccess: (data: NotificationSettingsResponse) => {
      // Invalidate and refetch settings
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.settings(),
      });

      customToast.success("Notification settings updated");
    },
    onError: (error: Error) => {
      customToast.error(`Failed to update settings: ${error.message}`);
    },
  });
}

// Hook to send a notification (admin only)
export function useSendNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      user_id: string;
      type: "sms" | "email" | "push" | "in_app";
      title?: string;
      message: string;
      category?: "delivery_update" | "payment" | "system" | "promotional";
      metadata?: any;
    }) => NotificationService.sendNotification(data),
    onSuccess: () => {
      // Invalidate notifications to show the new one
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      });

      customToast.success("Notification sent successfully");
    },
    onError: (error: Error) => {
      customToast.error(`Failed to send notification: ${error.message}`);
    },
  });
}

// Hook to get unread notifications count
export function useUnreadNotificationsCount() {
  const { data: stats } = useNotificationStats();

  return stats?.data?.unread || 0;
}

// Hook to get notifications with real-time updates
export function useNotificationsWithUpdates(filters: NotificationFilters = {}) {
  const notificationsQuery = useNotifications(filters);
  const statsQuery = useNotificationStats();

  return {
    notifications: notificationsQuery.data?.data?.notifications || [],
    stats: statsQuery.data?.data,
    isLoading: notificationsQuery.isLoading || statsQuery.isLoading,
    error: notificationsQuery.error || statsQuery.error,
    refetch: () => {
      notificationsQuery.refetch();
      statsQuery.refetch();
    },
  };
}
