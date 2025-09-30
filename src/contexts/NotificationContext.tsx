import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import {
  useUnreadNotificationsCount,
  useNotifications,
} from "@/lib/api/hooks/notificationHooks";

interface NotificationContextType {
  unreadCount: number;
  hasNewNotifications: boolean;
  lastNotificationCheck: Date | null;
  refreshNotifications: () => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user } = useAuth();
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [lastNotificationCheck, setLastNotificationCheck] =
    useState<Date | null>(null);

  // Get unread count
  const unreadCount = useUnreadNotificationsCount();

  // Get notifications for checking new ones
  const { data: notificationsData, refetch } = useNotifications({
    limit: 1, // Just get the latest notification
  });

  // Check for new notifications
  useEffect(() => {
    if (notificationsData?.data?.notifications?.[0]) {
      const latestNotification = notificationsData.data.notifications[0];
      const latestNotificationTime = new Date(latestNotification.sent_at);

      if (
        !lastNotificationCheck ||
        latestNotificationTime > lastNotificationCheck
      ) {
        setHasNewNotifications(true);
        setLastNotificationCheck(latestNotificationTime);
      }
    }
  }, [notificationsData, lastNotificationCheck]);

  // Clear new notifications flag when user opens notification center
  const refreshNotifications = () => {
    setHasNewNotifications(false);
    refetch();
  };

  // Placeholder functions - these would be implemented with actual API calls
  const markNotificationAsRead = (notificationId: string) => {
    // This would be implemented with the actual API call
    console.log("Mark notification as read:", notificationId);
  };

  const markAllAsRead = () => {
    // This would be implemented with the actual API call
    console.log("Mark all notifications as read");
  };

  const value: NotificationContextType = {
    unreadCount,
    hasNewNotifications,
    lastNotificationCheck,
    refreshNotifications,
    markNotificationAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider"
    );
  }
  return context;
}
