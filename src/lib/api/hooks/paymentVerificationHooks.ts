import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "../axios";
import {
  ApiResponse,
  PaymentVerification,
  SubmitPaymentVerificationRequest,
  PaymentVerificationActionRequest,
} from "../../../types/shared";

// Fetch payment verifications (admin)
export const usePaymentVerifications = (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["payment-verifications", params],
    queryFn: async (): Promise<ApiResponse<PaymentVerification[]>> => {
      const response = await axiosInstance.get("/payment-verifications", {
        params,
      });
      return response.data;
    },
  });
};

// Fetch single payment verification
export const usePaymentVerification = (verificationId: string) => {
  return useQuery({
    queryKey: ["payment-verification", verificationId],
    queryFn: async (): Promise<ApiResponse<PaymentVerification>> => {
      const response = await axiosInstance.get(
        `/payment-verifications/${verificationId}`
      );
      return response.data;
    },
    enabled: !!verificationId,
  });
};

// Submit offline payment verification (client)
export const useSubmitPaymentVerification = () => {
  return useMutation({
    mutationFn: async (
      data: SubmitPaymentVerificationRequest
    ): Promise<ApiResponse<PaymentVerification>> => {
      const response = await axiosInstance.post("/payment-verifications", data);
      return response.data;
    },
  });
};

// Approve payment verification (admin)
export const useApprovePaymentVerification = () => {
  return useMutation({
    mutationFn: async (params: {
      verificationId: string;
      data?: PaymentVerificationActionRequest;
    }): Promise<ApiResponse<{ id: string; status: string }>> => {
      const response = await axiosInstance.post(
        `/payment-verifications/${params.verificationId}/approve`,
        params.data || {}
      );
      return response.data;
    },
  });
};

// Reject payment verification (admin)
export const useRejectPaymentVerification = () => {
  return useMutation({
    mutationFn: async (params: {
      verificationId: string;
      data: PaymentVerificationActionRequest;
    }): Promise<ApiResponse<{ id: string; status: string }>> => {
      const response = await axiosInstance.post(
        `/payment-verifications/${params.verificationId}/reject`,
        params.data
      );
      return response.data;
    },
  });
};

// Request more info (admin)
export const useRequestMoreInfoPaymentVerification = () => {
  return useMutation({
    mutationFn: async (params: {
      verificationId: string;
      data: PaymentVerificationActionRequest;
    }): Promise<ApiResponse<{ id: string; status: string }>> => {
      const response = await axiosInstance.post(
        `/payment-verifications/${params.verificationId}/request-more-info`,
        params.data
      );
      return response.data;
    },
  });
};
