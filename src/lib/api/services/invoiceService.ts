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
  }): Promise<ApiResponse<{ invoices: Invoice[]; pagination: any }>> {
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
