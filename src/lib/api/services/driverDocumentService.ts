import axiosInstance from "../axios";

// Types for driver documents
export interface DriverDocument {
  id: string;
  driver_id: string;
  document_type:
    | "license"
    | "medical_cert"
    | "insurance"
    | "vehicle_registration"
    | "other";
  document_number: string;
  file_url: string;
  expiry_date: string;
  is_verified: boolean;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  verifier?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface DriverDocumentsResponse {
  success: boolean;
  message: string;
  data: DriverDocument[];
  meta: {
    timestamp: string;
    requestId: string;
  };
}

export interface DriverDetailResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      full_name: string;
      email: string;
      phone: string;
      preferred_language: string;
      avatar_url?: string;
      is_active: boolean;
      is_verified: boolean;
      last_login: string;
      branch_id: string;
      created_at: string;
      updated_at: string;
    };
    driver: {
      id: string;
      license_number: string;
      license_expiry: string;
      license_type: string;
      date_of_birth: string;
      emergency_contact: string;
      emergency_phone: string;
      blood_type: string;
      medical_certificate_expiry: string;
      status: string;
      rating: number;
      total_deliveries: number;
      total_distance_km: number;
      branch_id: string;
      code_number: string;
      created_at: string;
      updated_at: string;
    };
    documents: DriverDocument[];
  };
  meta: {
    timestamp: string;
    requestId: string;
  };
}

class DriverDocumentService {
  /**
   * Get driver documents (driver only)
   */
  static async getDriverDocuments(): Promise<DriverDocumentsResponse> {
    try {
      const response = await axiosInstance.get("/drivers/documents");
      return response.data;
    } catch (error: any) {
      throw DriverDocumentService.handleError(error);
    }
  }

  /**
   * Get driver documents by driver ID (admin only)
   */
  static async getDriverDocumentsById(
    driverId: string
  ): Promise<DriverDocumentsResponse> {
    try {
      const response = await axiosInstance.get(
        `/admin/drivers/${driverId}/documents`
      );
      return response.data;
    } catch (error: any) {
      throw DriverDocumentService.handleError(error);
    }
  }

  /**
   * Get driver detail with documents (admin only)
   */
  static async getDriverDetail(
    driverId: string
  ): Promise<DriverDetailResponse> {
    try {
      const response = await axiosInstance.get(`/admin/drivers/${driverId}`);
      return response.data;
    } catch (error: any) {
      throw DriverDocumentService.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  private static handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    return new Error("An error occurred while fetching driver documents");
  }
}

export { DriverDocumentService };
export default DriverDocumentService;
