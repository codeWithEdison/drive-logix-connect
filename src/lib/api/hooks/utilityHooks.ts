import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  GPSService,
  NotificationService,
  AdminService,
  FileService,
  UserService,
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
export const useUpdateGPSLocation = () => {
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
    queryKey: [...queryKeys.notifications.all, params],
    queryFn: () => NotificationService.getNotifications(params),
    select: (data) => data.data,
  });
};

export const useLegacyMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => NotificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      });
    },
  });
};

export const useLegacyMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => NotificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      });
    },
  });
};

export const useLegacyNotificationSettings = () => {
  return useQuery({
    queryKey: queryKeys.notifications.settings(),
    queryFn: () => NotificationService.getSettings(),
    select: (data) => {
      console.log("🔍 useLegacyNotificationSettings hook - raw data:", data);
      // The API returns data directly in the data property
      if (data?.data) {
        return data.data;
      } else {
        return data;
      }
    },
  });
};

export const useLegacyUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => NotificationService.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.settings(),
      });
    },
  });
};

export const useLegacySendNotification = () => {
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
        queryKey: queryKeys.notifications.all,
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

// Hook specifically for user activity logs
export const useUserActivityLogs = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.admin.logs({ user_id: userId }),
    queryFn: () => AdminService.getLogs({ user_id: userId, limit: 20 }),
    select: (data) => {
      // Handle both array and pagination response formats
      if (Array.isArray(data.data)) {
        return data.data;
      } else if (data.data && Array.isArray(data.data.data)) {
        return data.data.data;
      }
      return [];
    },
    enabled: !!userId,
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
    select: (data) => {
      console.log("🔍 useUserManagement hook - raw data:", data);
      // The API returns data directly in the data property
      if (data?.data && Array.isArray(data.data)) {
        return data.data;
      } else if (Array.isArray(data)) {
        return data;
      } else {
        return [];
      }
    },
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
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
};

/**
 * Resend verification email for a user (admin / super_admin only).
 * POST /v1/users/:userId/resend-verification
 */
export const useResendUserVerification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => UserService.resendVerification(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
    },
  });
};

// Create user hooks
export const useCreateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      full_name: string;
      email: string;
      password: string;
      phone?: string;
      preferred_language?: "en" | "rw" | "fr";
      branch_id: string;
    }) => AdminService.createAdmin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
};

export const useUpdateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      adminId,
      data,
    }: {
      adminId: string;
      data: {
        full_name: string;
        email: string;
        phone?: string;
        role: "admin" | "super_admin";
        branch_id: string;
        is_active: boolean;
        preferred_language?: "en" | "rw" | "fr";
      };
    }) => AdminService.updateAdmin(adminId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      clientId,
      data,
    }: {
      clientId: string;
      data: {
        full_name: string;
        email: string;
        phone?: string;
        company_name: string;
        business_type: "individual" | "corporate" | "government";
        tax_id?: string;
        address?: string;
        city?: string;
        country?: string;
        postal_code?: string;
        contact_person?: string;
        credit_limit?: number;
        payment_terms?: number;
        is_active: boolean;
        preferred_language?: "en" | "rw" | "fr";
      };
    }) => AdminService.updateClient(clientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
};

export const useCreateDriver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      full_name: string;
      email: string;
      phone: string;
      password: string;
      preferred_language: "en" | "rw" | "fr";
      license_number: string;
      license_expiry?: string;
      license_type: "A" | "B" | "C" | "D" | "E";
      code_number: string;
      date_of_birth?: string;
      emergency_contact?: string;
      emergency_phone?: string;
      blood_type?: string;
      medical_certificate_expiry?: string;
    }) => AdminService.createDriver(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      full_name: string;
      email: string;
      phone: string;
      password: string;
      preferred_language: "en" | "rw" | "fr";
      company_name: string;
      business_type: "individual" | "corporate" | "government";
      tax_id?: string;
      address?: string;
      city?: string;
      country?: string;
      postal_code?: string;
      contact_person?: string;
      credit_limit?: number;
      payment_terms?: number;
    }) => AdminService.createClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
};

// Superadmin management hooks
export const useGetSuperadmins = (params?: {
  search?: string;
  is_active?: boolean;
  branch_id?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["superadmins", params],
    queryFn: async () => {
      console.log("🔍 useGetSuperadmins - calling API with params:", params);
      try {
        const result = await AdminService.getSuperadmins(params);
        console.log("🔍 useGetSuperadmins - API response:", JSON.stringify(result, null, 2));
        return result;
      } catch (error) {
        console.error("🔍 useGetSuperadmins - API error:", error);
        throw error;
      }
    },
    select: (data) => {
      console.log("🔍 useGetSuperadmins hook - raw data in select:", JSON.stringify(data, null, 2));
      console.log("🔍 useGetSuperadmins hook - data?.data:", data?.data);
      console.log("🔍 useGetSuperadmins hook - Array.isArray(data?.data):", Array.isArray(data?.data));
      console.log("🔍 useGetSuperadmins hook - data?.meta:", data?.meta);
      
      // The API returns: { success: true, data: [...], meta: { pagination: {...} } }
      // AdminService.getSuperadmins returns response.data which is the ApiResponse
      // So data here is: { success: true, data: [...], meta: { pagination: {...} } }
      if (data?.data && Array.isArray(data.data)) {
        const result = {
          data: data.data,
          pagination: data.meta?.pagination || {},
        };
        console.log("🔍 useGetSuperadmins hook - returning:", JSON.stringify(result, null, 2));
        console.log("🔍 useGetSuperadmins hook - result.data length:", result.data.length);
        return result;
      }
      // Fallback: return empty structure
      console.warn("🔍 useGetSuperadmins hook - returning empty (fallback) - data structure:", {
        hasData: !!data,
        dataType: typeof data,
        dataKeys: data ? Object.keys(data) : [],
        dataData: data?.data,
        dataDataType: typeof data?.data,
        isArray: Array.isArray(data?.data),
      });
      return { data: [], pagination: {} };
    },
  });
};

export const useGetSuperadminById = (superAdminId: string) => {
  return useQuery({
    queryKey: ["superadmins", "detail", superAdminId],
    queryFn: () => AdminService.getSuperadminById(superAdminId),
    select: (data) => data.data,
    enabled: !!superAdminId,
  });
};

export const useCreateSuperadmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      full_name: string;
      email: string;
      password: string;
      phone?: string;
      preferred_language?: "en" | "rw" | "fr";
    }) => AdminService.createSuperadmin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superadmins"] });
    },
  });
};

export const useUpdateSuperadmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      superAdminId,
      data,
    }: {
      superAdminId: string;
      data: {
        full_name?: string;
        email?: string;
        phone?: string;
        preferred_language?: "en" | "rw" | "fr";
        avatar_url?: string;
      };
    }) => AdminService.updateSuperadmin(superAdminId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superadmins"] });
    },
  });
};

export const useToggleSuperadminStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      superAdminId,
      data,
    }: {
      superAdminId: string;
      data: {
        is_active: boolean;
        reason?: string;
      };
    }) => AdminService.toggleSuperadminStatus(superAdminId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superadmins"] });
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
    select: (data) => {
      console.log("🔍 useFinancialReports hook - raw data:", data);
      // The API returns data directly in the data property
      if (data?.data) {
        return data.data;
      } else {
        return data;
      }
    },
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
    select: (data) => {
      console.log("🔍 usePerformanceReports hook - raw data:", data);
      // The API returns data directly in the data property
      if (data?.data) {
        return data.data;
      } else {
        return data;
      }
    },
  });
};

export const useTransportationReports = (params?: {
  start_date?: string;
  end_date?: string;
  branch_id?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.admin.transportationReports(params),
    queryFn: () => AdminService.getTransportationReports(params),
    select: (data) => {
      // API may return data nested in meta.language (language is object here, not string)
      const metaLanguage = (data as { meta?: { language?: { report?: unknown[]; filters?: Record<string, unknown> } } })
        ?.meta?.language;
      if (metaLanguage?.report) {
        return {
          report: metaLanguage.report,
          total_records: metaLanguage.report.length,
          filters: metaLanguage.filters || {},
        };
      }
      // Fallback to standard structure if available
      if (data?.data?.report) {
        return data.data;
      }
      // Return empty structure if no data
      return {
        report: [],
        total_records: 0,
        filters: {},
      };
    },
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
