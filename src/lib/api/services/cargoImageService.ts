// ===========================================
// CARGO IMAGE MANAGEMENT SERVICE
// ===========================================

import axiosInstance from "../axios";
import {
  CargoImage,
  CreateCargoImageRequest,
  UpdateCargoImageRequest,
  CargoImageSearchParams,
  CargoImageListResponse,
  CargoImageType,
  ApiResponse,
} from "../../../types/shared";

export class CargoImageService {
  /**
   * Upload a new cargo image
   */
  static async uploadCargoImage(
    cargoId: string,
    data: CreateCargoImageRequest
  ): Promise<CargoImage> {
    const formData = new FormData();
    formData.append("image", data.image as any);
    formData.append("image_type", data.image_type);

    if (data.description) {
      formData.append("description", data.description);
    }

    if (data.is_primary !== undefined) {
      formData.append("is_primary", data.is_primary.toString());
    }

    const response = await axiosInstance.post<ApiResponse<CargoImage>>(
      `/cargo-images/${cargoId}/images`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data!;
  }

  /**
   * Get all images for a cargo
   */
  static async getCargoImages(
    cargoId: string,
    params?: CargoImageSearchParams
  ): Promise<CargoImageListResponse> {
    const response = await axiosInstance.get<
      ApiResponse<CargoImageListResponse>
    >(`/cargo-images/${cargoId}/images`, { params });
    return response.data.data!;
  }

  /**
   * Get a single cargo image by ID
   */
  static async getCargoImageById(
    cargoId: string,
    imageId: string
  ): Promise<CargoImage> {
    const response = await axiosInstance.get<ApiResponse<CargoImage>>(
      `/cargo-images/${cargoId}/images/${imageId}`
    );
    return response.data.data!;
  }

  /**
   * Update a cargo image
   */
  static async updateCargoImage(
    cargoId: string,
    imageId: string,
    data: UpdateCargoImageRequest
  ): Promise<CargoImage> {
    const response = await axiosInstance.put<ApiResponse<CargoImage>>(
      `/cargo-images/${cargoId}/images/${imageId}`,
      data
    );
    return response.data.data!;
  }

  /**
   * Delete a cargo image
   */
  static async deleteCargoImage(
    cargoId: string,
    imageId: string
  ): Promise<void> {
    await axiosInstance.delete<ApiResponse<{ message: string }>>(
      `/cargo-images/${cargoId}/images/${imageId}`
    );
  }

  /**
   * Set an image as primary for a cargo
   */
  static async setPrimaryImage(
    cargoId: string,
    imageId: string
  ): Promise<CargoImage> {
    const response = await axiosInstance.put<ApiResponse<CargoImage>>(
      `/cargo-images/${cargoId}/images/${imageId}/primary`
    );
    return response.data.data!;
  }

  /**
   * Get images by type for a cargo
   */
  static async getCargoImagesByType(
    cargoId: string,
    imageType: CargoImageType
  ): Promise<CargoImage[]> {
    const response = await this.getCargoImages(cargoId, {
      image_type: imageType,
      limit: 100,
    });
    return response.images;
  }

  /**
   * Get primary image for a cargo
   */
  static async getPrimaryCargoImage(
    cargoId: string
  ): Promise<CargoImage | null> {
    try {
      const response = await this.getCargoImages(cargoId, {
        is_primary: true,
        limit: 1,
      });
      return response.images[0] || null;
    } catch (error) {
      console.error("Error getting primary cargo image:", error);
      return null;
    }
  }

  /**
   * Get pickup images for a cargo
   */
  static async getPickupImages(cargoId: string): Promise<CargoImage[]> {
    return this.getCargoImagesByType(cargoId, CargoImageType.PICKUP);
  }

  /**
   * Get delivery images for a cargo
   */
  static async getDeliveryImages(cargoId: string): Promise<CargoImage[]> {
    return this.getCargoImagesByType(cargoId, CargoImageType.DELIVERY);
  }

  /**
   * Get damage images for a cargo
   */
  static async getDamageImages(cargoId: string): Promise<CargoImage[]> {
    return this.getCargoImagesByType(cargoId, CargoImageType.DAMAGE);
  }

  /**
   * Get packaging images for a cargo
   */
  static async getPackagingImages(cargoId: string): Promise<CargoImage[]> {
    return this.getCargoImagesByType(cargoId, CargoImageType.PACKAGING);
  }

  /**
   * Get documentation images for a cargo
   */
  static async getDocumentationImages(cargoId: string): Promise<CargoImage[]> {
    return this.getCargoImagesByType(cargoId, CargoImageType.DOCUMENTATION);
  }

  /**
   * Bulk upload multiple images for a cargo
   */
  static async bulkUploadImages(
    cargoId: string,
    images: Array<{
      file: globalThis.File;
      image_type: CargoImageType;
      description?: string;
      is_primary?: boolean;
    }>
  ): Promise<CargoImage[]> {
    const uploadPromises = images.map((imageData) =>
      this.uploadCargoImage(cargoId, {
        image: imageData.file,
        image_type: imageData.image_type,
        description: imageData.description,
        is_primary: imageData.is_primary,
      })
    );

    return Promise.all(uploadPromises);
  }

  /**
   * Get image statistics for a cargo
   */
  static async getCargoImageStats(cargoId: string): Promise<{
    total_images: number;
    images_by_type: Record<CargoImageType, number>;
    has_primary: boolean;
    total_size_mb: number;
  }> {
    const response = await axiosInstance.get<ApiResponse<any>>(
      `/cargo-images/${cargoId}/stats`
    );
    return response.data.data!;
  }

  /**
   * Download image as blob
   */
  static async downloadImage(imageUrl: string): Promise<Blob> {
    const response = await axiosInstance.get(imageUrl, {
      responseType: "blob",
    });
    return response.data;
  }

  /**
   * Get image thumbnail URL
   */
  static getImageThumbnailUrl(
    imageUrl: string,
    size: "small" | "medium" | "large" = "medium"
  ): string {
    // This would depend on your image processing service
    // For now, return the original URL
    return imageUrl;
  }

  /**
   * Validate image file
   */
  static validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    if (file.size > maxSize) {
      return { valid: false, error: "File size must be less than 10MB" };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: "Only JPEG, PNG, WebP, and GIF images are allowed",
      };
    }

    return { valid: true };
  }
}
