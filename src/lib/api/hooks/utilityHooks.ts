import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  GPSService,
  NotificationService,
  AdminService,
  FileService,
} from "../services";
import { queryKeys } from "../queryClient";
import {
  UpdateGPSLocationRequest,
  NotificationType,
  NotificationCategory,
} from "../../../types/shared";

// File management hooks
export const useUploadFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      type,
      category,
    }: {
      file: File;
      type: string;
      category?: string;
    }) => FileService.uploadFile(file, type, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.files.all() });
    },
  });
};

export const useGetFileUrl = (id: string) => {
  return useQuery({
    queryKey: queryKeys.files.url(id),
    queryFn: () => FileService.getFileUrl(id),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useDeleteFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => FileService.deleteFile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.files.all() });
    },
  });
};

export const useUserFiles = (params?: {
  type?: string;
  category?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.files.all(params),
    queryFn: () => FileService.getUserFiles(params),
    select: (data) => data.data,
  });
};

export const useFileById = (id: string) => {
  return useQuery({
    queryKey: ["files", "detail", id],
    queryFn: () => FileService.getFileById(id),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useFileStatistics = () => {
  return useQuery({
    queryKey: ["files", "statistics"],
    queryFn: () => FileService.getFileStatistics(),
    select: (data) => data.data,
  });
};

// GPS hooks
export const useUpdateLocation = () => {
  return useMutation({
    mutationFn: (data: UpdateGPSLocationRequest) =>
      GPSService.updateLocation(data),
  });
};

export const useVehicleLocation = (vehicleId: string) => {
  return useQuery({
    queryKey: queryKeys.gps.vehicleLocation(vehicleId),
    queryFn: () => GPSService.getVehicleLocation(vehicleId),
    select: (data) => data.data,
    enabled: !!vehicleId,
    refetchInterval: 10000, // Refetch every 10 seconds for live location
  });
};

export const useTrackingHistory = (
  vehicleId: string,
  params?: {
    start_time?: string;
    end_time?: string;
    page?: number;
    limit?: number;
  }
) => {
  return useQuery({
    queryKey: queryKeys.gps.vehicleHistory(vehicleId, params),
    queryFn: () => GPSService.getTrackingHistory(vehicleId, params),
    select: (data) => data.data,
    enabled: !!vehicleId,
  });
};

export const useLiveTracking = (vehicleId: string) => {
  return useQuery({
    queryKey: queryKeys.gps.live(vehicleId),
    queryFn: () => GPSService.getLiveTracking(vehicleId),
    select: (data) => data.data,
    enabled: !!vehicleId,
    refetchInterval: 5000, // Refetch every 5 seconds for live tracking
  });
};

export const useLocationHistory = (params?: {
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.gps.history(params),
    queryFn: () => GPSService.getLocationHistory(params),
    select: (data) => data.data,
  });
};

// Notification hooks
export const useNotifications = (params?: {
  type?: NotificationType;
  category?: NotificationCategory;
  is_read?: boolean;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.notifications.all(params),
    queryFn: () => NotificationService.getNotifications(params),
    select: (data) => data.data,
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => NotificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all(),
      });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => NotificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all(),
      });
    },
  });
};

export const useNotificationSettings = () => {
  return useQuery({
    queryKey: queryKeys.notifications.settings,
    queryFn: () => NotificationService.getSettings(),
    select: (data) => data.data,
  });
};

export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => NotificationService.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.settings,
      });
    },
  });
};

export const useSendNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      user_id: string;
      type: NotificationType;
      title?: string;
      message: string;
      category?: NotificationCategory;
      data?: any;
    }) => NotificationService.sendNotification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all(),
      });
    },
  });
};

// Admin hooks
export const useDashboardStats = () => {
  return useQuery({
    queryKey: queryKeys.admin.dashboard,
    queryFn: () => AdminService.getDashboardStats(),
    select: (data) => data.data,
    refetchInterval: 60000, // Refetch every minute for dashboard stats
  });
};

export const useSystemLogs = (params?: {
  user_id?: string;
  action?: string;
  page?: number;
  limit?: number;
  date_from?: string;
  date_to?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.admin.logs(params),
    queryFn: () => AdminService.getLogs(params),
    select: (data) => data.data,
  });
};

export const useUserManagement = (params?: {
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.admin.users(params),
    queryFn: () => AdminService.getUserManagement(params),
    select: (data) => data.data,
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { is_active: boolean; reason?: string };
    }) => AdminService.updateUserStatus(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
    },
  });
};

export const useFinancialReports = (params?: {
  start_date?: string;
  end_date?: string;
  group_by?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.admin.financialReports(params),
    queryFn: () => AdminService.getFinancialReports(params),
    select: (data) => data.data,
  });
};

export const usePerformanceReports = (params?: {
  driver_id?: string;
  start_date?: string;
  end_date?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.admin.performanceReports(params),
    queryFn: () => AdminService.getPerformanceReports(params),
    select: (data) => data.data,
  });
};

export const useApproveEntity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      entity_type: "user" | "vehicle" | "driver";
      entity_id: string;
      approved: boolean;
      reason?: string;
    }) => AdminService.approveEntity(data),
    onSuccess: (_, { entity_type, entity_id }) => {
      // Invalidate relevant queries based on entity type
      if (entity_type === "user") {
        queryClient.invalidateQueries({
          queryKey: queryKeys.users.detail(entity_id),
        });
        queryClient.invalidateQueries({ queryKey: queryKeys.users.list() });
      } else if (entity_type === "vehicle") {
        queryClient.invalidateQueries({
          queryKey: queryKeys.vehicles.detail(entity_id),
        });
        queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all() });
      } else if (entity_type === "driver") {
        queryClient.invalidateQueries({
          queryKey: queryKeys.drivers.detail(entity_id),
        });
        queryClient.invalidateQueries({ queryKey: queryKeys.drivers.all() });
      }
    },
  });
};
