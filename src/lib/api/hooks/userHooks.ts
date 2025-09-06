import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserService } from "../services";
import { queryKeys } from "../queryClient";
import { UserSearchParams, User } from "../../../types/shared";

// User hooks
export const useUserProfile = () => {
  return useQuery({
    queryKey: queryKeys.auth.profile,
    queryFn: () => UserService.getProfile(),
    select: (data) => data.data,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<User>) => UserService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => UserService.changePassword(currentPassword, newPassword),
  });
};

export const useUsers = (params?: UserSearchParams) => {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => UserService.getUsers(params),
    select: (data) => data.data,
    enabled: !!params, // Only run if params are provided
  });
};

export const useUserById = (id: string) => {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => UserService.getUserById(id),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useApproveUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      isActive,
      reason,
    }: {
      id: string;
      isActive: boolean;
      reason?: string;
    }) => UserService.approveUser(id, isActive, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
};

export const useUserStatistics = () => {
  return useQuery({
    queryKey: queryKeys.users.statistics,
    queryFn: () => UserService.getUserStatistics(),
    select: (data) => data.data,
  });
};
