import axiosInstance from "../axios";
import {
  ApiResponse,
  Route,
  CreateRouteRequest,
  RouteWaypoint,
  RouteProgress,
} from "../../../types/shared";

export class RouteService {
  // Create route
  static async createRoute(
    data: CreateRouteRequest
  ): Promise<ApiResponse<Route>> {
    const response = await axiosInstance.post("/routes", data);
    return response.data;
  }

  // Get route details
  static async getRouteDetails(cargoId: string): Promise<ApiResponse<Route>> {
    const response = await axiosInstance.get(`/routes/${cargoId}`);
    return response.data;
  }

  // Update route waypoint
  static async updateRouteWaypoint(
    routeId: string,
    waypointId: string,
    data: Partial<RouteWaypoint>
  ): Promise<ApiResponse<RouteWaypoint>> {
    const response = await axiosInstance.put(
      `/routes/${routeId}/waypoints/${waypointId}`,
      data
    );
    return response.data;
  }

  // Get route progress
  static async getRouteProgress(
    cargoId: string
  ): Promise<ApiResponse<RouteProgress>> {
    const response = await axiosInstance.get(`/routes/${cargoId}/progress`);
    return response.data;
  }

  // Get all routes (Admin)
  static async getAllRoutes(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Route[]>> {
    const response = await axiosInstance.get("/routes", { params });
    return response.data;
  }

  // Delete route
  static async deleteRoute(routeId: string): Promise<ApiResponse<null>> {
    const response = await axiosInstance.delete(`/routes/${routeId}`);
    return response.data;
  }
}
