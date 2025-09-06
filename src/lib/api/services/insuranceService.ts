import axiosInstance from "../axios";
import {
  ApiResponse,
  InsurancePolicy,
  CreateInsurancePolicyRequest,
  InsuranceClaim,
  CreateInsuranceClaimRequest,
} from "../../../types/shared";

export class InsuranceService {
  // Create insurance policy
  static async createInsurancePolicy(
    data: CreateInsurancePolicyRequest
  ): Promise<ApiResponse<InsurancePolicy>> {
    const response = await axiosInstance.post("/insurance/policies", data);
    return response.data;
  }

  // Get insurance policy
  static async getInsurancePolicy(
    cargoId: string
  ): Promise<ApiResponse<InsurancePolicy>> {
    const response = await axiosInstance.get(`/insurance/policies/${cargoId}`);
    return response.data;
  }

  // Update insurance policy
  static async updateInsurancePolicy(
    policyId: string,
    data: Partial<InsurancePolicy>
  ): Promise<ApiResponse<InsurancePolicy>> {
    const response = await axiosInstance.put(
      `/insurance/policies/${policyId}`,
      data
    );
    return response.data;
  }

  // Delete insurance policy
  static async deleteInsurancePolicy(
    policyId: string
  ): Promise<ApiResponse<null>> {
    const response = await axiosInstance.delete(
      `/insurance/policies/${policyId}`
    );
    return response.data;
  }

  // Get all insurance policies
  static async getAllInsurancePolicies(params?: {
    cargo_id?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<InsurancePolicy[]>> {
    const response = await axiosInstance.get("/insurance/policies", { params });
    return response.data;
  }

  // File insurance claim
  static async fileInsuranceClaim(
    data: CreateInsuranceClaimRequest
  ): Promise<ApiResponse<InsuranceClaim>> {
    const response = await axiosInstance.post("/insurance/claims", data);
    return response.data;
  }

  // Get claim status
  static async getClaimStatus(
    claimId: string
  ): Promise<ApiResponse<InsuranceClaim>> {
    const response = await axiosInstance.get(`/insurance/claims/${claimId}`);
    return response.data;
  }

  // Get all insurance claims
  static async getAllInsuranceClaims(params?: {
    cargo_id?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<InsuranceClaim[]>> {
    const response = await axiosInstance.get("/insurance/claims", { params });
    return response.data;
  }

  // Update claim status (Admin)
  static async updateClaimStatus(
    claimId: string,
    status: string,
    notes?: string
  ): Promise<ApiResponse<InsuranceClaim>> {
    const response = await axiosInstance.put(
      `/insurance/claims/${claimId}/status`,
      {
        status,
        notes,
      }
    );
    return response.data;
  }

  // Get insurance providers
  static async getInsuranceProviders(): Promise<ApiResponse<string[]>> {
    const response = await axiosInstance.get("/insurance/providers");
    return response.data;
  }

  // Calculate insurance premium
  static async calculatePremium(data: {
    cargo_value: number;
    cargo_type: string;
    distance_km: number;
    coverage_type: string;
  }): Promise<ApiResponse<{ premium_amount: number }>> {
    const response = await axiosInstance.post(
      "/insurance/calculate-premium",
      data
    );
    return response.data;
  }
}
