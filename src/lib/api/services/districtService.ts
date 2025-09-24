// ===========================================
// DISTRICT MANAGEMENT SERVICE
// ===========================================

import axiosInstance from "../axios";
import {
  District,
  CreateDistrictRequest,
  UpdateDistrictRequest,
  DistrictSearchParams,
  DistrictListResponse,
  ApiResponse,
} from "../../../types/shared";

export class DistrictService {
  /**
   * Get all districts with pagination and filtering
   */
  static async getDistricts(
    params?: DistrictSearchParams
  ): Promise<DistrictListResponse> {
    const response = await axiosInstance.get<ApiResponse<DistrictListResponse>>(
      "/districts",
      {
        params,
      }
    );
    return {
      districts: (response.data.data as unknown as District[]) || [],
      total: response.data.meta?.pagination?.total || 0,
      page: response.data.meta?.pagination?.page || 1,
      limit: response.data.meta?.pagination?.limit || 10,
      totalPages: response.data.meta?.pagination?.totalPages || 0,
    };
  }

  /**
   * Get a single district by ID
   */
  static async getDistrictById(id: string): Promise<District> {
    const response = await axiosInstance.get<ApiResponse<District>>(
      `/districts/${id}`
    );
    return response.data.data!;
  }

  /**
   * Create a new district
   */
  static async createDistrict(data: CreateDistrictRequest): Promise<District> {
    const response = await axiosInstance.post<ApiResponse<District>>(
      "/districts",
      data
    );
    return response.data.data!;
  }

  /**
   * Update an existing district
   */
  static async updateDistrict(
    id: string,
    data: UpdateDistrictRequest
  ): Promise<District> {
    const response = await axiosInstance.put<ApiResponse<District>>(
      `/districts/${id}`,
      data
    );
    return response.data.data!;
  }

  /**
   * Delete a district
   */
  static async deleteDistrict(id: string): Promise<void> {
    await axiosInstance.delete<ApiResponse<{ message: string }>>(
      `/districts/${id}`
    );
  }

  /**
   * Get districts by branch ID
   */
  static async getDistrictsByBranch(branchId: string): Promise<District[]> {
    const response = await this.getDistricts({
      branch_id: branchId,
      limit: 100,
    });
    return response.districts;
  }

  /**
   * Get active districts only
   */
  static async getActiveDistricts(): Promise<District[]> {
    const response = await this.getDistricts({ is_active: true, limit: 100 });
    return response.districts;
  }

  /**
   * Get active districts by branch
   */
  static async getActiveDistrictsByBranch(
    branchId: string
  ): Promise<District[]> {
    const response = await this.getDistricts({
      branch_id: branchId,
      is_active: true,
      limit: 100,
    });
    return response.districts;
  }

  /**
   * Search districts by name or code
   */
  static async searchDistricts(query: string): Promise<District[]> {
    const response = await this.getDistricts({ search: query, limit: 50 });
    return response.districts;
  }

  /**
   * Toggle district active status
   */
  static async toggleDistrictStatus(
    id: string,
    isActive: boolean
  ): Promise<District> {
    return this.updateDistrict(id, { is_active: isActive });
  }

  /**
   * Validate district code uniqueness within a branch
   */
  static async validateDistrictCode(
    code: string,
    branchId: string,
    excludeId?: string
  ): Promise<boolean> {
    try {
      const districts = await this.getDistrictsByBranch(branchId);
      const existingDistrict = districts.find(
        (district) =>
          district.code.toLowerCase() === code.toLowerCase() &&
          district.id !== excludeId
      );
      return !existingDistrict;
    } catch (error) {
      console.error("Error validating district code:", error);
      return false;
    }
  }

  /**
   * Get district statistics
   */
  static async getDistrictStats(id: string): Promise<{
    total_locations: number;
    total_cargos: number;
    active_deliveries: number;
    total_revenue: number;
  }> {
    const response = await axiosInstance.get<ApiResponse<any>>(
      `/districts/${id}/stats`
    );
    return response.data.data!;
  }

  /**
   * Bulk update districts status
   */
  static async bulkUpdateDistrictsStatus(
    districtIds: string[],
    isActive: boolean
  ): Promise<void> {
    await axiosInstance.patch<ApiResponse<{ message: string }>>(
      "/districts/bulk-status",
      {
        district_ids: districtIds,
        is_active: isActive,
      }
    );
  }

  /**
   * Get districts with their branch information
   */
  static async getDistrictsWithBranches(): Promise<District[]> {
    const response = await this.getDistricts({ limit: 100 });
    return response.districts;
  }
}
