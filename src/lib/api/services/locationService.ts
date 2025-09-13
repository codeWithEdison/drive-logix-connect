import axiosInstance from "../axios";
import {
  ApiResponse,
  Location,
  CreateLocationRequest,
  UpdateLocationRequest,
  LocationSearchParams,
  LocationListResponse,
  LocationType,
} from "../../../types/shared";

export class LocationService {
  // Create a new location
  static async createLocation(
    data: CreateLocationRequest
  ): Promise<ApiResponse<Location>> {
    const response = await axiosInstance.post("/locations", data);
    return response.data;
  }

  // Get locations with search and pagination
  static async getLocations(
    params?: LocationSearchParams
  ): Promise<ApiResponse<LocationListResponse>> {
    const response = await axiosInstance.get("/locations", { params });
    return response.data;
  }

  // Get locations created by current user
  static async getMyLocations(): Promise<ApiResponse<Location[]>> {
    const response = await axiosInstance.get("/locations/my");
    return response.data;
  }

  // Get location suggestions for cargo creation
  static async getLocationSuggestions(
    type?: LocationType
  ): Promise<ApiResponse<Location[]>> {
    const response = await axiosInstance.get("/locations/suggestions", {
      params: type ? { type } : {},
    });
    return response.data;
  }

  // Get locations by type
  static async getLocationsByType(
    type: LocationType
  ): Promise<ApiResponse<Location[]>> {
    const response = await axiosInstance.get(`/locations/type/${type}`);
    return response.data;
  }

  // Get location by ID
  static async getLocationById(id: string): Promise<ApiResponse<Location>> {
    const response = await axiosInstance.get(`/locations/${id}`);
    return response.data;
  }

  // Update location by ID
  static async updateLocation(
    id: string,
    data: UpdateLocationRequest
  ): Promise<ApiResponse<Location>> {
    const response = await axiosInstance.put(`/locations/${id}`, data);
    return response.data;
  }

  // Delete location by ID
  static async deleteLocation(id: string): Promise<ApiResponse<null>> {
    const response = await axiosInstance.delete(`/locations/${id}`);
    return response.data;
  }
}
