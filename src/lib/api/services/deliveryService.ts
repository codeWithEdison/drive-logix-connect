import axiosInstance from "../axios";
import {
  ApiResponse,
  DeliveryAssignment,
  CreateDeliveryAssignmentRequest,
  PaginationResponse,
  Delivery,
  DeliveryConfirmation,
  DeliveryProof,
  CargoStatus,
  ConfirmationMethod,
} from "../../../types/shared";

export class DeliveryService {
  // Create delivery assignment (Admin)
  static async createDeliveryAssignment(
    data: CreateDeliveryAssignmentRequest
  ): Promise<ApiResponse<DeliveryAssignment>> {
    const response = await axiosInstance.post("/delivery-assignments", data);
    return response.data;
  }

  // Get delivery assignment
  static async getDeliveryAssignment(
    cargoId: string
  ): Promise<ApiResponse<DeliveryAssignment>> {
    const response = await axiosInstance.get(
      `/delivery-assignments/${cargoId}`
    );
    return response.data;
  }

  // Update assignment
  static async updateAssignment(
    id: string,
    data: Partial<CreateDeliveryAssignmentRequest>
  ): Promise<ApiResponse<DeliveryAssignment>> {
    const response = await axiosInstance.put(
      `/delivery-assignments/${id}`,
      data
    );
    return response.data;
  }

  // Get driver assignments
  static async getDriverAssignments(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginationResponse<DeliveryAssignment>>> {
    const response = await axiosInstance.get("/drivers/assignments", {
      params,
    });
    return response.data;
  }

  // Start delivery
  static async startDelivery(
    cargoId: string,
    startTime?: string
  ): Promise<ApiResponse<Delivery>> {
    const response = await axiosInstance.post(`/deliveries/${cargoId}/start`, {
      start_time: startTime || new Date().toISOString(),
    });
    return response.data;
  }

  // Update delivery status
  static async updateDeliveryStatus(
    cargoId: string,
    data: {
      status: CargoStatus;
      actual_pickup_time?: string;
      location_latitude?: number;
      location_longitude?: number;
      notes?: string;
    }
  ): Promise<ApiResponse<Delivery>> {
    const response = await axiosInstance.put(
      `/deliveries/${cargoId}/status`,
      data
    );
    return response.data;
  }

  // Confirm delivery with image proof
  static async confirmDeliveryWithImage(
    cargoId: string,
    data: {
      delivery_proof_url: string;
      notes?: string;
    }
  ): Promise<ApiResponse<Delivery>> {
    const response = await axiosInstance.post(
      `/deliveries/${cargoId}/confirm-image`,
      data
    );
    return response.data;
  }

  // Rate delivery service
  static async rateDelivery(
    cargoId: string,
    data: {
      rating: number;
      review?: string;
    }
  ): Promise<ApiResponse<Delivery>> {
    const response = await axiosInstance.post(
      `/deliveries/${cargoId}/rating`,
      data
    );
    return response.data;
  }

  // Confirm delivery via OTP
  static async confirmDeliveryOTP(
    cargoId: string,
    otp: string
  ): Promise<ApiResponse<Delivery>> {
    const response = await axiosInstance.post(
      `/deliveries/${cargoId}/confirm-otp`,
      { otp }
    );
    return response.data;
  }

  // Confirm delivery via QR
  static async confirmDeliveryQR(
    cargoId: string,
    qrToken: string
  ): Promise<ApiResponse<Delivery>> {
    const response = await axiosInstance.post(
      `/deliveries/${cargoId}/confirm-qr`,
      { qr_token: qrToken }
    );
    return response.data;
  }

  // Complete delivery
  static async completeDelivery(
    cargoId: string,
    data: DeliveryConfirmation
  ): Promise<ApiResponse<Delivery>> {
    const response = await axiosInstance.post(
      `/deliveries/${cargoId}/complete`,
      data
    );
    return response.data;
  }

  // Get delivery details
  static async getDeliveryDetails(
    cargoId: string
  ): Promise<ApiResponse<Delivery>> {
    const response = await axiosInstance.get(`/deliveries/${cargoId}`);
    return response.data;
  }

  // Upload delivery proof
  static async uploadDeliveryProof(
    cargoId: string,
    data: FormData
  ): Promise<ApiResponse<DeliveryProof>> {
    const response = await axiosInstance.post(
      `/deliveries/${cargoId}/proof`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  // Get driver deliveries
  static async getDriverDeliveries(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginationResponse<Delivery>>> {
    const response = await axiosInstance.get("/deliveries/driver/deliveries", {
      params,
    });
    return response.data;
  }

  // Get all deliveries (Admin)
  static async getAllDeliveries(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginationResponse<Delivery>>> {
    const response = await axiosInstance.get("/deliveries", { params });
    return response.data;
  }
}
