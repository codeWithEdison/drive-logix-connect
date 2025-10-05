import axiosInstance from "../axios";
import { ApiResponse } from "../../../types/shared";

export interface ServiceArea {
  id: string;
  name: string;
  city?: string | null;
  country?: string | null;
  coverage_radius_km?: number | null;
  is_active: boolean;
  created_at: string;
}

export interface ServiceAreaQueryParams {
  city?: string;
  is_active?: boolean;
}

export interface CreateServiceAreaRequest {
  name: string;
  city?: string;
  country?: string;
  coverage_radius_km?: number;
  is_active?: boolean;
}

export interface UpdateServiceAreaRequest {
  name?: string;
  city?: string | null;
  country?: string | null;
  coverage_radius_km?: number | null;
  is_active?: boolean;
}

export class ServiceAreaService {
  static async getServiceAreas(
    params?: ServiceAreaQueryParams
  ): Promise<ApiResponse<ServiceArea[]>> {
    const res = await axiosInstance.get("/operational/service-areas", {
      params,
    });
    return res.data;
  }

  static async createServiceArea(
    data: CreateServiceAreaRequest
  ): Promise<ApiResponse<ServiceArea>> {
    const res = await axiosInstance.post("/operational/service-areas", data);
    return res.data;
  }

  static async updateServiceArea(
    id: string,
    data: UpdateServiceAreaRequest
  ): Promise<ApiResponse<ServiceArea>> {
    const res = await axiosInstance.put(
      `/operational/service-areas/${id}`,
      data
    );
    return res.data;
  }

  static async toggleServiceAreaStatus(
    id: string
  ): Promise<ApiResponse<ServiceArea>> {
    const res = await axiosInstance.patch(
      `/operational/service-areas/${id}/toggle-status`
    );
    return res.data;
  }
}
