import axiosInstance from "../axios";
import {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  CreateUserRequest,
  User,
  UserSearchParams,
  PaginationResponse,
  DashboardStats,
} from "../../../types/shared";

export class AuthService {
  // Register user
  static async register(
    data: CreateUserRequest
  ): Promise<ApiResponse<LoginResponse>> {
    const response = await axiosInstance.post("/auth/register", data);
    return response.data;
  }

  // Login user
  static async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await axiosInstance.post("/auth/login", data);
    return response.data;
  }

  // Refresh token
  static async refreshToken(
    refreshToken: string
  ): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> {
    const response = await axiosInstance.post("/auth/refresh", {
      refresh_token: refreshToken,
    });
    return response.data;
  }

  // Logout
  static async logout(): Promise<ApiResponse<null>> {
    const response = await axiosInstance.post("/auth/logout");
    return response.data;
  }

  // Request password reset
  static async requestPasswordReset(email: string): Promise<ApiResponse<null>> {
    const response = await axiosInstance.post("/auth/password-reset-request", {
      email,
    });
    return response.data;
  }

  // Reset password
  static async resetPassword(
    token: string,
    newPassword: string
  ): Promise<ApiResponse<null>> {
    const response = await axiosInstance.post("/auth/password-reset", {
      token,
      new_password: newPassword,
    });
    return response.data;
  }

  // Verify email
  static async verifyEmail(token: string): Promise<ApiResponse<null>> {
    const response = await axiosInstance.post("/auth/verify-email", { token });
    return response.data;
  }

  // Resend verification email
  static async resendVerification(email: string): Promise<ApiResponse<null>> {
    const response = await axiosInstance.post("/auth/resend-verification", {
      email,
    });
    return response.data;
  }
}
