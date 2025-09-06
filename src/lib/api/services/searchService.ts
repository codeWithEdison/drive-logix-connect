import axiosInstance from "../axios";
import {
  ApiResponse,
  SearchResults,
  SearchParams,
} from "../../../types/shared";

export class SearchService {
  // Search cargos
  static async searchCargos(params: {
    q?: string;
    status?: string;
    priority?: string;
    client_id?: string;
    driver_id?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<SearchResults>> {
    const response = await axiosInstance.get("/search/cargos", { params });
    return response.data;
  }

  // Search users
  static async searchUsers(params: {
    q?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<SearchResults>> {
    const response = await axiosInstance.get("/search/users", { params });
    return response.data;
  }

  // Search vehicles
  static async searchVehicles(params: {
    q?: string;
    type?: string;
    status?: string;
    capacity_min?: number;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<SearchResults>> {
    const response = await axiosInstance.get("/search/vehicles", { params });
    return response.data;
  }

  // Search drivers
  static async searchDrivers(params: {
    q?: string;
    status?: string;
    license_type?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<SearchResults>> {
    const response = await axiosInstance.get("/search/drivers", { params });
    return response.data;
  }

  // Search invoices
  static async searchInvoices(params: {
    q?: string;
    status?: string;
    client_id?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<SearchResults>> {
    const response = await axiosInstance.get("/search/invoices", { params });
    return response.data;
  }

  // Global search
  static async globalSearch(
    query: string,
    entityTypes?: string[]
  ): Promise<ApiResponse<SearchResults>> {
    const response = await axiosInstance.get("/search/global", {
      params: {
        q: query,
        entity_types: entityTypes?.join(","),
      },
    });
    return response.data;
  }

  // Get search suggestions
  static async getSearchSuggestions(
    query: string,
    entityType?: string
  ): Promise<ApiResponse<string[]>> {
    const response = await axiosInstance.get("/search/suggestions", {
      params: {
        q: query,
        entity_type: entityType,
      },
    });
    return response.data;
  }

  // Get recent searches
  static async getRecentSearches(): Promise<ApiResponse<string[]>> {
    const response = await axiosInstance.get("/search/recent");
    return response.data;
  }

  // Clear search history
  static async clearSearchHistory(): Promise<ApiResponse<null>> {
    const response = await axiosInstance.delete("/search/history");
    return response.data;
  }

  // Get search statistics
  static async getSearchStatistics(): Promise<
    ApiResponse<{
      total_searches: number;
      searches_by_type: Record<string, number>;
      popular_queries: Array<{ query: string; count: number }>;
      recent_activity: Array<{ query: string; timestamp: string }>;
    }>
  > {
    const response = await axiosInstance.get("/search/statistics");
    return response.data;
  }
}
