import axiosInstance from "../axios";
import { ApiResponse } from "../../../types/shared";

export class SystemService {
  // Health check
  static async getHealth(): Promise<
    ApiResponse<{
      uptime: number;
      memory: {
        rss: number;
        heapTotal: number;
        heapUsed: number;
        external: number;
      };
      version: string;
    }>
  > {
    const response = await axiosInstance.get("/health");
    return response.data;
  }

  // Ready check
  static async getReady(): Promise<ApiResponse<null>> {
    const response = await axiosInstance.get("/ready");
    return response.data;
  }
}
