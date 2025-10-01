import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Package,
  Truck,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  MapPin,
  Phone,
  MessageCircle,
  Settings,
  MoreHorizontal,
  CheckCheck,
  Trash2,
  Filter,
  RefreshCw,
} from "lucide-react";
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useUnreadNotificationsCount,
} from "@/lib/api/hooks/notificationHooks";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { customToast } from "@/lib/utils/toast";

interface NotificationCenterProps {
  className?: string;
}

export function NotificationCenter({
  className = "",
}: NotificationCenterProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  // Fetch notifications
  const {
    data: notificationsData,
    isLoading,
    error,
    refetch,
  } = useNotifications({
    unread_only: filter === "unread" ? true : undefined,
    limit: 20,
  });

  const notifications = notificationsData?.data?.notifications || [];
  const unreadCount = useUnreadNotificationsCount();

  // Mutations
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsReadMutation.mutateAsync(notificationId);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const handleRefresh = () => {
    refetch();
    customToast.success(t("notifications.refreshed"));
  };

  const getNotificationIcon = (type: string, category?: string) => {
    switch (category) {
      case "delivery_update":
        return <Truck className="h-4 w-4 text-blue-600" />;
      case "payment":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "system":
        return <Settings className="h-4 w-4 text-orange-600" />;
      case "promotional":
        return <MessageCircle className="h-4 w-4 text-purple-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNotificationTitle = (notification: any) => {
    // Use the title from the notification if available
    if (notification.title) {
      return notification.title;
    }

    // Fallback to category-based titles
    switch (notification.category) {
      case "delivery_update":
        return t("notifications.deliveryUpdate");
      case "payment":
        return t("notifications.payment");
      case "system":
        return t("notifications.system");
      case "promotional":
        return t("notifications.promotional");
      default:
        return t("notifications.notification");
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return t("common.justNow");
    if (diffInMinutes < 60)
      return t("common.minutesAgo", { count: diffInMinutes });

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return t("common.hoursAgo", { count: diffInHours });

    const diffInDays = Math.floor(diffInHours / 24);
    return t("common.daysAgo", { count: diffInDays });
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }

    // Handle navigation based on notification metadata
    if (notification.metadata?.cargo_number) {
      // Navigate to cargo details
      window.location.href = `/tracking/${notification.metadata.cargo_number}`;
    } else if (notification.assignment_id) {
      // Navigate to assignment details
      window.location.href = `/assignments/${notification.assignment_id}`;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-9 w-9 p-0 relative text-gray-600 hover:text-gray-900 ${className}`}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                {t("notifications.title")}
              </CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    disabled={markAllAsReadMutation.isPending}
                    className="text-xs h-7 px-2"
                  >
                    <CheckCheck className="h-3 w-3 mr-1" />
                    {t("notifications.markAllRead")}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="h-7 w-7 p-0"
                  title={t("notifications.refresh")}
                >
                  <RefreshCw
                    className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
            </div>

            {/* Filter buttons */}
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter("all")}
                className="text-xs h-7 px-2"
              >
                {t("notifications.all")}
              </Button>
              <Button
                variant={filter === "unread" ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter("unread")}
                className="text-xs h-7 px-2"
              >
                {t("notifications.unread")} ({unreadCount})
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-8 text-red-500">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {t("notifications.errorLoading")}
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-gray-500">
                  <Bell className="h-8 w-8 mr-2" />
                  {t("notifications.noNotifications")}
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 hover:bg-gray-50 cursor-pointer border-l-4 ${
                        notification.is_read
                          ? "border-transparent bg-white"
                          : "border-blue-500 bg-blue-50"
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(
                            notification.notification_type,
                            notification.category
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {getNotificationTitle(notification)}
                            </h4>
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            )}
                          </div>

                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>

                          {notification.metadata?.cargo_number && (
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                              <Package className="h-3 w-3" />
                              <span>{notification.metadata.cargo_number}</span>
                              {notification.metadata.pickup_address && (
                                <>
                                  <MapPin className="h-3 w-3 ml-2" />
                                  <span className="truncate">
                                    {notification.metadata.pickup_address} →{" "}
                                    {notification.metadata.destination_address}
                                  </span>
                                </>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-400">
                              {formatTimeAgo(notification.sent_at)}
                            </span>

                            {!notification.is_read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification.id);
                                }}
                                disabled={markAsReadMutation.isPending}
                                className="text-xs h-6 px-2"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {t("notifications.markRead")}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
