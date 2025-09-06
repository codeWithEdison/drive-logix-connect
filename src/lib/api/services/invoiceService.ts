import axiosInstance from "../axios";
import {
  ApiResponse,
  Invoice,
  CreateInvoiceRequest,
  InvoiceStatus,
  PaginationResponse,
  PaymentMethod,
  Payment,
  CreatePaymentRequest,
  Refund,
  CreateRefundRequest,
} from "../../../types/shared";

export class InvoiceService {
  // Generate invoice
  static async generateInvoice(
    data: CreateInvoiceRequest
  ): Promise<ApiResponse<Invoice>> {
    const response = await axiosInstance.post("/invoices", data);
    return response.data;
  }

  // Get invoice details
  static async getInvoiceById(id: string): Promise<ApiResponse<Invoice>> {
    const response = await axiosInstance.get(`/invoices/${id}`);
    return response.data;
  }

  // Update invoice status
  static async updateInvoiceStatus(
    id: string,
    data: {
      status: InvoiceStatus;
      payment_method?: PaymentMethod;
      payment_reference?: string;
    }
  ): Promise<ApiResponse<Invoice>> {
    const response = await axiosInstance.put(`/invoices/${id}/status`, data);
    return response.data;
  }

  // Get client invoices
  static async getClientInvoices(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginationResponse<Invoice>>> {
    const response = await axiosInstance.get("/clients/invoices", { params });
    return response.data;
  }

  // Download invoice PDF
  static async downloadInvoicePDF(id: string): Promise<Blob> {
    const response = await axiosInstance.get(`/invoices/${id}/pdf`, {
      responseType: "blob",
    });
    return response.data;
  }

  // Get all invoices (Admin)
  static async getAllInvoices(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginationResponse<Invoice>>> {
    const response = await axiosInstance.get("/invoices", { params });
    return response.data;
  }
}

export class PaymentService {
  // Process payment
  static async processPayment(
    data: CreatePaymentRequest
  ): Promise<ApiResponse<Payment>> {
    const response = await axiosInstance.post("/payments", data);
    return response.data;
  }

  // Get payment history
  static async getPaymentHistory(params?: {
    invoice_id?: string;
    page?: number;
    limit?: number;
    date_from?: string;
    date_to?: string;
  }): Promise<ApiResponse<PaginationResponse<Payment>>> {
    const response = await axiosInstance.get("/payments", { params });
    return response.data;
  }

  // Get payment details
  static async getPaymentById(id: string): Promise<ApiResponse<Payment>> {
    const response = await axiosInstance.get(`/payments/${id}`);
    return response.data;
  }

  // Get user payments
  static async getUserPayments(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginationResponse<Payment>>> {
    const response = await axiosInstance.get("/payments/user/payments", {
      params,
    });
    return response.data;
  }

  // Request refund
  static async requestRefund(
    data: CreateRefundRequest
  ): Promise<ApiResponse<Refund>> {
    const response = await axiosInstance.post("/refunds", data);
    return response.data;
  }

  // Get refund status
  static async getRefundStatus(id: string): Promise<ApiResponse<Refund>> {
    const response = await axiosInstance.get(`/refunds/${id}`);
    return response.data;
  }
}
