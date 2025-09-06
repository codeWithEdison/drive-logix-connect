import axiosInstance from "../axios";
import { ApiResponse } from "../../../types/shared";

export class LocalizationService {
  // Get translations
  static async getTranslations(language?: string): Promise<
    ApiResponse<
      Array<{
        key: string;
        en: string;
        rw: string;
        fr: string;
        created_at: string;
        updated_at: string;
      }>
    >
  > {
    const response = await axiosInstance.get("/localization/translations", {
      params: { language },
    });
    return response.data;
  }

  // Create translation (Admin)
  static async createTranslation(
    key: string,
    translations: {
      en: string;
      rw?: string;
      fr?: string;
    }
  ): Promise<
    ApiResponse<{
      key: string;
      en: string;
      rw: string;
      fr: string;
      created_at: string;
      updated_at: string;
    }>
  > {
    const response = await axiosInstance.post(
      `/localization/translations/${key}`,
      translations
    );
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
  ): Promise<
    ApiResponse<{
      key: string;
      en: string;
      rw: string;
      fr: string;
      created_at: string;
      updated_at: string;
    }>
  > {
    const response = await axiosInstance.put(
      `/localization/translations/${key}`,
      translations
    );
    return response.data;
  }

  // Delete translation (Admin)
  static async deleteTranslation(key: string): Promise<ApiResponse<null>> {
    const response = await axiosInstance.delete(
      `/localization/translations/${key}`
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
