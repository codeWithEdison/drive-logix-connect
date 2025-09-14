import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deliveryAssignmentService } from "../services/deliveryAssignmentService";
import { notificationService } from "../services/notificationService";
import type {
  DeliveryAssignment,
  CreateAssignmentRequest,
  UpdateAssignmentRequest,
  AcceptAssignmentRequest,
  RejectAssignmentRequest,
  AssignmentFilters,
} from "../services/deliveryAssignmentService";
import type { NotificationFilters } from "../services/notificationService";

// Query Keys
export const assignmentKeys = {
  all: ["assignments"] as const,
  lists: () => [...assignmentKeys.all, "list"] as const,
  list: (filters: AssignmentFilters) =>
    [...assignmentKeys.lists(), filters] as const,
  details: () => [...assignmentKeys.all, "detail"] as const,
  detail: (id: string) => [...assignmentKeys.details(), id] as const,
  driverAssignments: (driverId: string, filters: AssignmentFilters) =>
    [...assignmentKeys.all, "driver", driverId, filters] as const,
  myAssignments: (filters: AssignmentFilters) =>
    [...assignmentKeys.all, "my", filters] as const,
};

export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (filters: NotificationFilters) =>
    [...notificationKeys.lists(), filters] as const,
  stats: () => [...notificationKeys.all, "stats"] as const,
};

// Admin Assignment Hooks

/**
 * Get all delivery assignments (Admin only)
 */
export function useDeliveryAssignments(filters: AssignmentFilters = {}) {
  return useQuery({
    queryKey: assignmentKeys.list(filters),
    queryFn: () => deliveryAssignmentService.getAssignments(filters),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute for real-time updates
  });
}

/**
 * Get assignment by cargo ID (Admin only)
 */
export function useAssignmentByCargoId(cargoId: string) {
  return useQuery({
    queryKey: assignmentKeys.detail(cargoId),
    queryFn: () => deliveryAssignmentService.getAssignmentByCargoId(cargoId),
    enabled: !!cargoId,
    staleTime: 30000,
  });
}

/**
 * Create delivery assignment (Admin only)
 */
export function useCreateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAssignmentRequest) =>
      deliveryAssignmentService.createAssignment(data),
    onSuccess: () => {
      // Invalidate all assignment lists to refresh data
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
      // Invalidate driver assignments
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
    },
  });
}

/**
 * Update assignment (Admin only)
 */
export function useUpdateDeliveryAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      assignmentId,
      data,
    }: {
      assignmentId: string;
      data: UpdateAssignmentRequest;
    }) => deliveryAssignmentService.updateAssignment(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      // Invalidate specific assignment and all lists
      queryClient.invalidateQueries({
        queryKey: assignmentKeys.detail(assignmentId),
      });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
    },
  });
}

/**
 * Change vehicle in assignment (Admin only)
 */
export function useChangeVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      assignmentId,
      data,
    }: {
      assignmentId: string;
      data: UpdateAssignmentRequest;
    }) => deliveryAssignmentService.updateAssignment(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      // Invalidate specific assignment and all lists
      queryClient.invalidateQueries({
        queryKey: assignmentKeys.detail(assignmentId),
      });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
    },
  });
}

/**
 * Change driver in assignment (Admin only)
 */
export function useChangeDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      assignmentId,
      data,
    }: {
      assignmentId: string;
      data: UpdateAssignmentRequest;
    }) => deliveryAssignmentService.updateAssignment(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      // Invalidate specific assignment and all lists
      queryClient.invalidateQueries({
        queryKey: assignmentKeys.detail(assignmentId),
      });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
    },
  });
}

/**
 * Cancel assignment (Admin only)
 */
export function useCancelAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assignmentId: string) =>
      deliveryAssignmentService.cancelAssignment(assignmentId),
    onSuccess: (_, assignmentId) => {
      // Invalidate specific assignment and all lists
      queryClient.invalidateQueries({
        queryKey: assignmentKeys.detail(assignmentId),
      });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
    },
  });
}

// Driver Assignment Hooks

/**
 * Get driver assignments (Driver only)
 */
export function useDriverDeliveryAssignments(
  driverId: string,
  filters: AssignmentFilters = {}
) {
  return useQuery({
    queryKey: assignmentKeys.driverAssignments(driverId, filters),
    queryFn: () =>
      deliveryAssignmentService.getDriverAssignments(driverId, filters),
    enabled: !!driverId,
    staleTime: 30000,
    refetchInterval: 30000, // Refetch every 30 seconds for pending assignments
  });
}

/**
 * Get current driver's assignments (Driver only)
 */
export function useMyAssignments(filters: AssignmentFilters = {}) {
  return useQuery({
    queryKey: assignmentKeys.myAssignments(filters),
    queryFn: () => deliveryAssignmentService.getMyAssignments(filters),
    staleTime: 30000,
    refetchInterval: 30000, // Refetch every 30 seconds for pending assignments
    select: (data) => data.data.assignments, // Extract assignments array from response
  });
}

/**
 * Accept assignment (Driver only)
 */
export function useAcceptAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      assignmentId,
      data,
    }: {
      assignmentId: string;
      data?: AcceptAssignmentRequest;
    }) => deliveryAssignmentService.acceptAssignment(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      // Invalidate all assignment queries
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
      // Invalidate notifications
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

/**
 * Reject assignment (Driver only)
 */
export function useRejectAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      assignmentId,
      data,
    }: {
      assignmentId: string;
      data: RejectAssignmentRequest;
    }) => deliveryAssignmentService.rejectAssignment(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      // Invalidate all assignment queries
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
      // Invalidate notifications
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

// Notification Hooks

/**
 * Get driver notifications
 */
export function useAssignmentNotifications(filters: NotificationFilters = {}) {
  return useQuery({
    queryKey: notificationKeys.list(filters),
    queryFn: () => notificationService.getNotifications(filters),
    staleTime: 30000,
    refetchInterval: 60000, // Refetch every minute for new notifications
  });
}

/**
 * Get notification statistics
 */
export function useAssignmentNotificationStats() {
  return useQuery({
    queryKey: notificationKeys.stats(),
    queryFn: () => notificationService.getNotificationStats(),
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // Refetch every 5 minutes
  });
}

/**
 * Mark notification as read
 */
export function useMarkAssignmentNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationService.markAsRead(notificationId),
    onSuccess: () => {
      // Invalidate notification queries
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

/**
 * Mark all notifications as read
 */
export function useMarkAllAssignmentNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      // Invalidate notification queries
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

// Utility Hooks

/**
 * Get pending assignments count for current driver
 */
export function usePendingAssignmentsCount() {
  const { data } = useMyAssignments({ status: "pending", limit: 1 });

  return {
    count: data?.meta?.pagination?.total || 0,
    isLoading: !data,
  };
}

/**
 * Get assignment expiry status
 */
export function useAssignmentExpiryStatus(assignmentId: string) {
  const { data: assignment } = useQuery({
    queryKey: assignmentKeys.detail(assignmentId),
    queryFn: () =>
      deliveryAssignmentService.getAssignmentByCargoId(assignmentId),
    enabled: !!assignmentId,
    refetchInterval: 10000, // Check every 10 seconds for expiry
  });

  const isExpired = assignment?.data?.expires_at
    ? new Date() > new Date(assignment.data.expires_at)
    : false;

  const timeUntilExpiry = assignment?.data?.expires_at
    ? Math.max(
        0,
        new Date(assignment.data.expires_at).getTime() - new Date().getTime()
      )
    : 0;

  return {
    isExpired,
    timeUntilExpiry,
    expiresAt: assignment?.data?.expires_at,
    isLoading: !assignment,
  };
}
