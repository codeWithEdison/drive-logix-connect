import axiosInstance from "../axios";
import {
  ApiResponse,
  PaymentVerification,
  SubmitPaymentVerificationRequest,
  PaymentVerificationActionRequest,
} from "../../../types/shared";

export class PaymentVerificationService {
  static async submit(
    data: SubmitPaymentVerificationRequest
  ): Promise<ApiResponse<PaymentVerification>> {
    const response = await axiosInstance.post("/payment-verifications", data);
    return response.data;
  }

  static async approve(
    verificationId: string,
    data?: PaymentVerificationActionRequest
  ): Promise<ApiResponse<{ id: string; status: string }>> {
    const response = await axiosInstance.post(
      `/payment-verifications/${verificationId}/approve`,
      data || {}
    );
    return response.data;
  }

  static async reject(
    verificationId: string,
    data: PaymentVerificationActionRequest
  ): Promise<ApiResponse<{ id: string; status: string }>> {
    const response = await axiosInstance.post(
      `/payment-verifications/${verificationId}/reject`,
      data
    );
    return response.data;
  }

  static async requestMoreInfo(
    verificationId: string,
    data: PaymentVerificationActionRequest
  ): Promise<ApiResponse<{ id: string; status: string }>> {
    const response = await axiosInstance.post(
      `/payment-verifications/${verificationId}/request-more-info`,
      data
    );
    return response.data;
  }
}

export default PaymentVerificationService;

