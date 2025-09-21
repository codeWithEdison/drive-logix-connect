// ===========================================
// BRANCH MANAGEMENT SERVICE
// ===========================================

import axiosInstance from "../axios";
import {
  Branch,
  CreateBranchRequest,
  UpdateBranchRequest,
  BranchSearchParams,
  BranchListResponse,
  ApiResponse,
} from "../../../types/shared";

export class BranchService {
  /**
   * Get all branches with pagination and filtering
   */
  static async getBranches(
    params?: BranchSearchParams
  ): Promise<BranchListResponse> {
    const response = await axiosInstance.get<ApiResponse<BranchListResponse>>(
      "/branches",
      {
        params,
      }
    );
    return {
      branches: (response.data.data as unknown as Branch[]) || [],
      total: response.data.meta?.pagination?.total || 0,
      page: response.data.meta?.pagination?.page || 1,
      limit: response.data.meta?.pagination?.limit || 10,
      totalPages: response.data.meta?.pagination?.totalPages || 0,
    };
  }

  /**
   * Get a single branch by ID
   */
  static async getBranchById(id: string): Promise<Branch> {
    const response = await axiosInstance.get<ApiResponse<Branch>>(
      `/branches/${id}`
    );
    return response.data.data!;
  }

  /**
   * Create a new branch
   */
  static async createBranch(data: CreateBranchRequest): Promise<Branch> {
    const response = await axiosInstance.post<ApiResponse<Branch>>(
      "/branches",
      data
    );
    return response.data.data!;
  }

  /**
   * Update an existing branch
   */
  static async updateBranch(
    id: string,
    data: UpdateBranchRequest
  ): Promise<Branch> {
    const response = await axiosInstance.put<ApiResponse<Branch>>(
      `/branches/${id}`,
      data
    );
    return response.data.data!;
  }

  /**
   * Delete a branch
   */
  static async deleteBranch(id: string): Promise<void> {
    await axiosInstance.delete<ApiResponse<{ message: string }>>(
      `/branches/${id}`
    );
  }

  /**
   * Get active branches only
   */
  static async getActiveBranches(): Promise<Branch[]> {
    const response = await this.getBranches({ is_active: true, limit: 100 });
    return response.branches;
  }

  /**
   * Search branches by name or code
   */
  static async searchBranches(query: string): Promise<Branch[]> {
    const response = await this.getBranches({ search: query, limit: 50 });
    return response.branches;
  }

  /**
   * Get branches by city
   */
  static async getBranchesByCity(city: string): Promise<Branch[]> {
    const response = await this.getBranches({ city, limit: 100 });
    return response.branches;
  }

  /**
   * Get branches by country
   */
  static async getBranchesByCountry(country: string): Promise<Branch[]> {
    const response = await this.getBranches({ country, limit: 100 });
    return response.branches;
  }

  /**
   * Toggle branch active status
   */
  static async toggleBranchStatus(
    id: string,
    isActive: boolean
  ): Promise<Branch> {
    return this.updateBranch(id, { is_active: isActive });
  }

  /**
   * Validate branch code uniqueness
   */
  static async validateBranchCode(
    code: string,
    excludeId?: string
  ): Promise<boolean> {
    try {
      const branches = await this.searchBranches(code);
      const existingBranch = branches.find(
        (branch) =>
          branch.code.toLowerCase() === code.toLowerCase() &&
          branch.id !== excludeId
      );
      return !existingBranch;
    } catch (error) {
      console.error("Error validating branch code:", error);
      return false;
    }
  }

  /**
   * Get branch statistics
   */
  static async getBranchStats(id: string): Promise<{
    total_districts: number;
    total_drivers: number;
    total_vehicles: number;
    total_cargos: number;
    active_deliveries: number;
  }> {
    const response = await axiosInstance.get<ApiResponse<any>>(
      `/branches/${id}/stats`
    );
    return response.data.data!;
  }
}
