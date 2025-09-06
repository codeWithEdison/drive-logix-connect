import axiosInstance from "../axios";
import { ApiResponse } from "../../../types/shared";

export class LocalizationService {
  // Get translations
  static async getTranslations(
    language: string
  ): Promise<ApiResponse<Record<string, string>>> {
    const response = await axiosInstance.get("/localization/translations", {
      params: { language },
    });
    return response.data;
  }

  // Update translation (Admin)
  static async updateTranslation(
    key: string,
    translations: {
      en?: string;
      rw?: string;
      fr?: string;
    }
  ): Promise<ApiResponse<any>> {
    const response = await axiosInstance.put(
      `/localization/translations/${key}`,
      translations
    );
    return response.data;
  }
}

export class OperationalService {
  // Get service areas
  static async getServiceAreas(params?: {
    city?: string;
    is_active?: boolean;
  }): Promise<ApiResponse<any[]>> {
    const response = await axiosInstance.get("/operational/service-areas", {
      params,
    });
    return response.data;
  }

  // Get operating hours
  static async getOperatingHours(params?: {
    entity_type?: string;
    entity_id?: string;
  }): Promise<ApiResponse<any>> {
    const response = await axiosInstance.get("/operational/operating-hours", {
      params,
    });
    return response.data;
  }

  // Update operating hours
  static async updateOperatingHours(data: {
    entity_type: string;
    entity_id: string;
    schedule: Array<{
      day_of_week: number;
      start_time: string;
      end_time: string;
      is_available: boolean;
    }>;
  }): Promise<ApiResponse<any>> {
    const response = await axiosInstance.put(
      "/operational/operating-hours",
      data
    );
    return response.data;
  }

  // Get cargo categories
  static async getCargoCategories(params?: {
    is_active?: boolean;
  }): Promise<ApiResponse<any[]>> {
    const response = await axiosInstance.get("/operational/cargo-categories", {
      params,
    });
    return response.data;
  }

  // Get pricing policies
  static async getPricingPolicies(params?: {
    is_active?: boolean;
    vehicle_type?: string;
  }): Promise<ApiResponse<any[]>> {
    const response = await axiosInstance.get("/operational/pricing-policies", {
      params,
    });
    return response.data;
  }
}

export class InsuranceService {
  // Create insurance policy
  static async createPolicy(data: {
    cargo_id: string;
    policy_number: string;
    coverage_amount: number;
    premium_amount: number;
    insurance_provider: string;
    policy_start_date: string;
    policy_end_date: string;
  }): Promise<ApiResponse<any>> {
    const response = await axiosInstance.post("/insurance/policies", data);
    return response.data;
  }

  // Get insurance policy
  static async getPolicy(cargoId: string): Promise<ApiResponse<any>> {
    const response = await axiosInstance.get(`/insurance/policies/${cargoId}`);
    return response.data;
  }

  // File insurance claim
  static async fileClaim(data: {
    cargo_id: string;
    claim_number: string;
    claim_amount: number;
    claim_reason: string;
  }): Promise<ApiResponse<any>> {
    const response = await axiosInstance.post("/insurance/claims", data);
    return response.data;
  }

  // Get claim status
  static async getClaimStatus(claimId: string): Promise<ApiResponse<any>> {
    const response = await axiosInstance.get(`/insurance/claims/${claimId}`);
    return response.data;
  }
}
