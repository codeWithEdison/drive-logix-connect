import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthService } from "../services";
import { queryKeys } from "../queryClient";
import { CreateUserRequest, LoginRequest } from "../../../types/shared";

// Auth hooks
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => AuthService.login(data),
    onSuccess: () => {
      // Invalidate user profile query to refetch with new auth
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile });
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => AuthService.register(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => AuthService.logout(),
    onSuccess: () => {
      // Clear all cached data on logout
      queryClient.clear();
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    },
  });
};

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: (refreshToken: string) =>
      AuthService.refreshToken(refreshToken),
  });
};

export const useRequestPasswordReset = () => {
  return useMutation({
    mutationFn: (email: string) => AuthService.requestPasswordReset(email),
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({
      token,
      newPassword,
    }: {
      token: string;
      newPassword: string;
    }) => AuthService.resetPassword(token, newPassword),
  });
};

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: (token: string) => AuthService.verifyEmail(token),
  });
};

export const useResendVerification = () => {
  return useMutation({
    mutationFn: (email: string) => AuthService.resendVerification(email),
  });
};
