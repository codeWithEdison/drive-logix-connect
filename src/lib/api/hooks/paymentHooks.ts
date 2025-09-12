import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/api/axios";

interface ProcessPaymentRequest {
  invoice_id: string;
  amount: number;
  payment_method: "cash" | "mobile_money" | "card" | "online" | "bank_transfer";
  transaction_id?: string;
}

interface ProcessPaymentResponse {
  success: boolean;
  message: string;
  data: {
    payment_id: string;
    status: string;
    amount: number;
    payment_method: string;
    transaction_id?: string;
  };
}

interface PaymentHistoryResponse {
  success: boolean;
  message: string;
  data: {
    payments: Array<{
      id: string;
      invoice_id: string;
      amount: number;
      payment_method: string;
      status: string;
      transaction_id?: string;
      created_at: string;
      updated_at: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

interface RequestRefundRequest {
  invoice_id: string;
  amount: number;
  reason: string;
}

interface RequestRefundResponse {
  success: boolean;
  message: string;
  data: {
    refund_id: string;
    status: string;
    amount: number;
    reason: string;
  };
}

interface RefundStatusResponse {
  success: boolean;
  message: string;
  data: {
    refund_id: string;
    status: string;
    amount: number;
    reason: string;
    created_at: string;
    updated_at: string;
  };
}

// Main payment processing
export const useProcessPayment = () => {
  return useMutation({
    mutationFn: async (
      data: ProcessPaymentRequest
    ): Promise<ProcessPaymentResponse> => {
      const response = await axiosInstance.post("/payments", data);
      return response.data;
    },
  });
};

// Payment history
export const usePaymentHistory = (params?: {
  invoice_id?: string;
  payment_method?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["payment-history", params],
    queryFn: async (): Promise<PaymentHistoryResponse> => {
      const response = await axiosInstance.get("/payments", { params });
      return response.data;
    },
  });
};

// Refund requests
export const useRequestRefund = () => {
  return useMutation({
    mutationFn: async (
      data: RequestRefundRequest
    ): Promise<RequestRefundResponse> => {
      const response = await axiosInstance.post("/payments/refunds", data);
      return response.data;
    },
  });
};

// Refund status
export const useRefundStatus = (refundId: string) => {
  return useQuery({
    queryKey: ["refund-status", refundId],
    queryFn: async (): Promise<RefundStatusResponse> => {
      const response = await axiosInstance.get(`/payments/refunds/${refundId}`);
      return response.data;
    },
    enabled: !!refundId,
  });
};

// Flutterwave-specific payment hooks for new backend integration
interface InitializeFlutterwavePaymentRequest {
  invoice_id: string;
  amount: number;
  customer_email: string;
  customer_name: string;
  customer_phone?: string;
}

interface InitializeFlutterwavePaymentResponse {
  success: boolean;
  message: string;
  data: {
    payment_link: string;
    transaction_reference: string;
    payment_transaction_id: string;
  };
}

interface VerifyFlutterwavePaymentResponse {
  success: boolean;
  message: string;
  data: {
    status: "successful" | "failed";
    amount: number;
    currency: string;
    transaction_reference: string;
    flw_reference: string;
    payment_method: string;
    customer: {
      email: string;
      name: string;
      phone: string;
    };
    invoice_update: {
      invoice_number: string;
      status: string;
      is_fully_paid: boolean;
      total_paid: number;
      remaining_amount: number;
    };
    failure_reason?: string;
  };
}

export const useInitializeFlutterwavePayment = () => {
  return useMutation({
    mutationFn: async (
      data: InitializeFlutterwavePaymentRequest
    ): Promise<InitializeFlutterwavePaymentResponse> => {
      const response = await axiosInstance.post(
        "/payments/flutterwave/initialize",
        data
      );
      return response.data;
    },
  });
};

export const useVerifyFlutterwavePayment = () => {
  return useMutation({
    mutationFn: async (
      txRef: string
    ): Promise<VerifyFlutterwavePaymentResponse> => {
      const response = await axiosInstance.get(
        `/payments/flutterwave/verify?tx_ref=${txRef}`
      );
      return response.data;
    },
  });
};
