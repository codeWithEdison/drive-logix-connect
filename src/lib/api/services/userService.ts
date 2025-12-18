import axiosInstance from "../axios";
import {
  ApiResponse,
  User,
  UserSearchParams,
  PaginationResponse,
  DashboardStats,
} from "../../../types/shared";

export class UserService {
  // Get user profile
  static async getProfile(): Promise<ApiResponse<User>> {
    const response = await axiosInstance.get("/users/profile");
    return response.data;
  }

  // Update user profile
  static async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await axiosInstance.put("/users/profile", data);
    return response.data;
  }

  // Change password
  static async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<null>> {
    const response = await axiosInstance.post("/users/change-password", {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  }

  /**
   * Delete the currently authenticated user's account.
   *
   * Backend should:
   * - authenticate the user via the access token
   * - optionally verify current_password (recommended)
   * - delete/disable the account and revoke tokens/sessions
   */
  static async deleteAccount(data?: {
    currentPassword?: string;
    reason?: string;
    confirmation?: string;
  }): Promise<ApiResponse<null>> {
    const response = await axiosInstance.post("/users/delete-account", {
      current_password: data?.currentPassword,
      reason: data?.reason,
      confirmation: data?.confirmation,
    });
    return response.data;
  }

  // Get all users (Admin only)
  static async getUsers(
    params?: UserSearchParams
  ): Promise<ApiResponse<PaginationResponse<User>>> {
    const response = await axiosInstance.get("/users", { params });
    return response.data;
  }

  // Get user by ID (Admin only)
  static async getUserById(id: string): Promise<ApiResponse<User>> {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
  }

  // Create new user (Admin only)
  static async createUser(userData: any): Promise<ApiResponse<User>> {
    const response = await axiosInstance.post("/users", userData);
    return response.data;
  }

  // Approve or reject user (Admin only)
  static async approveUser(
    id: string,
    isActive: boolean,
    reason?: string
  ): Promise<ApiResponse<User>> {
    const response = await axiosInstance.post(`/users/${id}/approve`, {
      is_active: isActive,
      reason,
    });
    return response.data;
  }

  // Get user statistics (Admin only)
  static async getUserStatistics(): Promise<ApiResponse<DashboardStats>> {
    const response = await axiosInstance.get("/users/statistics");
    return response.data;
  }
}
