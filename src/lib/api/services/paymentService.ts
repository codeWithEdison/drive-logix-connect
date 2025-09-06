import axiosInstance from "../axios";
import {
  ApiResponse,
  Payment,
  CreatePaymentRequest,
  PaymentHistoryParams,
  Refund,
  CreateRefundRequest,
} from "../../../types/shared";

export class PaymentService {
  // Process payment
  static async processPayment(
    data: CreatePaymentRequest
  ): Promise<ApiResponse<Payment>> {
    const response = await axiosInstance.post("/payments", data);
    return response.data;
  }

  // Get payment history
  static async getPaymentHistory(
    params?: PaymentHistoryParams
  ): Promise<ApiResponse<Payment[]>> {
    const response = await axiosInstance.get("/payments", { params });
    return response.data;
  }

  // Get payment by ID
  static async getPaymentById(
    paymentId: string
  ): Promise<ApiResponse<Payment>> {
    const response = await axiosInstance.get(`/payments/${paymentId}`);
    return response.data;
  }

  // Get user payments
  static async getUserPayments(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Payment[]>> {
    const response = await axiosInstance.get("/payments/user/payments", {
      params,
    });
    return response.data;
  }

  // Get payment methods
  static async getPaymentMethods(): Promise<ApiResponse<string[]>> {
    const response = await axiosInstance.get("/payments/methods");
    return response.data;
  }

  // Verify payment
  static async verifyPayment(
    paymentId: string,
    transactionId: string
  ): Promise<ApiResponse<Payment>> {
    const response = await axiosInstance.post(`/payments/${paymentId}/verify`, {
      transaction_id: transactionId,
    });
    return response.data;
  }

  // Cancel payment
  static async cancelPayment(
    paymentId: string,
    reason?: string
  ): Promise<ApiResponse<Payment>> {
    const response = await axiosInstance.post(`/payments/${paymentId}/cancel`, {
      reason,
    });
    return response.data;
  }
}

export class RefundService {
  // Request refund
  static async requestRefund(
    data: CreateRefundRequest
  ): Promise<ApiResponse<Refund>> {
    const response = await axiosInstance.post("/refunds", data);
    return response.data;
  }

  // Get refund status
  static async getRefundStatus(refundId: string): Promise<ApiResponse<Refund>> {
    const response = await axiosInstance.get(`/refunds/${refundId}`);
    return response.data;
  }

  // Get refund history
  static async getRefundHistory(params?: {
    invoice_id?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Refund[]>> {
    const response = await axiosInstance.get("/refunds", { params });
    return response.data;
  }

  // Approve refund (Admin)
  static async approveRefund(
    refundId: string,
    reason?: string
  ): Promise<ApiResponse<Refund>> {
    const response = await axiosInstance.post(`/refunds/${refundId}/approve`, {
      reason,
    });
    return response.data;
  }

  // Reject refund (Admin)
  static async rejectRefund(
    refundId: string,
    reason: string
  ): Promise<ApiResponse<Refund>> {
    const response = await axiosInstance.post(`/refunds/${refundId}/reject`, {
      reason,
    });
    return response.data;
  }
}
