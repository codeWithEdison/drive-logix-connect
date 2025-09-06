import axiosInstance from "../axios";
import { ApiResponse, PaginationResponse } from "../../../types/shared";

export class FileService {
  // Upload file
  static async uploadFile(
    file: File,
    type: string,
    category?: string
  ): Promise<
    ApiResponse<{
      id: string;
      filename: string;
      original_name: string;
      mime_type: string;
      size: number;
      file_url: string;
      type: string;
      category?: string;
      uploaded_by: string;
      created_at: string;
    }>
  > {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    if (category) formData.append("category", category);

    const response = await axiosInstance.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  // Get file URL
  static async getFileUrl(id: string): Promise<
    ApiResponse<{
      file_url: string;
      expires_at?: string;
    }>
  > {
    const response = await axiosInstance.get(`/files/${id}/url`);
    return response.data;
  }

  // Delete file
  static async deleteFile(id: string): Promise<ApiResponse<null>> {
    const response = await axiosInstance.delete(`/files/${id}`);
    return response.data;
  }

  // Get user files
  static async getUserFiles(params?: {
    type?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginationResponse<any>>> {
    const response = await axiosInstance.get("/files", { params });
    return response.data;
  }

  // Get file by ID
  static async getFileById(id: string): Promise<ApiResponse<any>> {
    const response = await axiosInstance.get(`/files/${id}`);
    return response.data;
  }

  // Get file statistics
  static async getFileStatistics(): Promise<
    ApiResponse<{
      total_files: number;
      total_size: number;
      by_type: Record<string, number>;
      by_category: Record<string, number>;
    }>
  > {
    const response = await axiosInstance.get("/files/statistics");
    return response.data;
  }
}
