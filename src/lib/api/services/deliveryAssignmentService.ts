import axiosInstance from "../axios";

// Types for delivery assignment system
export interface DeliveryAssignment {
  id: string;
  cargo_id: string;
  driver_id: string;
  vehicle_id: string;
  assignment_status: "pending" | "accepted" | "rejected" | "cancelled";
  expires_at: string;
  driver_responded_at?: string;
  rejection_reason?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  cargo?: {
    id: string;
    cargo_number: string;
    status: string;
    weight_kg: number;
    pickup_address: string;
    destination_address: string;
    pickup_date?: string;
    delivery_date?: string;
    client?: {
      id: string;
      full_name: string;
      company_name?: string;
      phone: string;
    };
  };
  driver?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    status:
      | "available"
      | "pending_assignment"
      | "on_duty"
      | "unavailable"
      | "suspended";
    license_number?: string;
  };
  vehicle?: {
    id: string;
    plate_number: string;
    make: string;
    model: string;
    year?: number;
    capacity_kg: number;
    capacity_volume?: number;
    status: string;
  };
}

export interface CreateAssignmentRequest {
  cargo_id: string;
  driver_id: string;
  vehicle_id: string;
  notes?: string;
}

export interface UpdateAssignmentRequest {
  driver_id?: string;
  vehicle_id?: string;
  notes?: string;
}

export interface AcceptAssignmentRequest {
  notes?: string;
}

export interface RejectAssignmentRequest {
  reason: string;
  notes?: string;
}

export interface AssignmentFilters {
  status?: "pending" | "accepted" | "rejected" | "cancelled";
  driver_id?: string;
  vehicle_id?: string;
  page?: number;
  limit?: number;
}

export interface AssignmentResponse {
  success: boolean;
  message: string;
  data: DeliveryAssignment;
  meta: {
    timestamp: string;
    requestId: string;
  };
}

export interface AssignmentListResponse {
  success: boolean;
  message: string;
  data: DeliveryAssignment[];
  meta: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp: string;
    requestId: string;
  };
}

export interface AssignmentError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  meta: {
    timestamp: string;
    requestId: string;
  };
}

class DeliveryAssignmentService {
  private baseUrl = "/delivery-assignments";
  private driverBaseUrl = "/delivery-assignments";

  /**
   * Create a new delivery assignment (Admin only)
   */
  async createAssignment(
    data: CreateAssignmentRequest
  ): Promise<AssignmentResponse> {
    try {
      const response = await axiosInstance.post(this.baseUrl, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all delivery assignments with filters (Admin only)
   */
  async getAssignments(
    filters: AssignmentFilters = {}
  ): Promise<AssignmentListResponse> {
    try {
      const params = new URLSearchParams();

      if (filters.status) params.append("status", filters.status);
      if (filters.driver_id) params.append("driver_id", filters.driver_id);
      if (filters.vehicle_id) params.append("vehicle_id", filters.vehicle_id);
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());

      const response = await axiosInstance.get(
        `${this.baseUrl}?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get assignment by cargo ID (Admin only)
   */
  async getAssignmentByCargoId(cargoId: string): Promise<AssignmentResponse> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/${cargoId}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Update assignment (Admin only)
   */
  async updateAssignment(
    assignmentId: string,
    data: UpdateAssignmentRequest
  ): Promise<AssignmentResponse> {
    try {
      const response = await axiosInstance.put(
        `${this.baseUrl}/${assignmentId}`,
        data
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Cancel assignment (Admin only)
   */
  async cancelAssignment(assignmentId: string): Promise<AssignmentResponse> {
    try {
      const response = await axiosInstance.delete(
        `${this.baseUrl}/${assignmentId}`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Accept assignment (Driver only)
   */
  async acceptAssignment(
    assignmentId: string,
    data: AcceptAssignmentRequest = {}
  ): Promise<AssignmentResponse> {
    try {
      const response = await axiosInstance.post(
        `${this.driverBaseUrl}/${assignmentId}/accept`,
        data
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Reject assignment (Driver only)
   */
  async rejectAssignment(
    assignmentId: string,
    data: RejectAssignmentRequest
  ): Promise<AssignmentResponse> {
    try {
      const response = await axiosInstance.post(
        `${this.driverBaseUrl}/${assignmentId}/reject`,
        data
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get driver assignments (Driver only)
   */
  async getDriverAssignments(
    driverId: string,
    filters: AssignmentFilters = {}
  ): Promise<AssignmentListResponse> {
    try {
      const params = new URLSearchParams();

      if (filters.status) params.append("status", filters.status);
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());

      const response = await axiosInstance.get(
        `/drivers/${driverId}/assignments?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get current driver's assignments (Driver only)
   */
  async getMyAssignments(
    filters: AssignmentFilters = {}
  ): Promise<AssignmentListResponse> {
    try {
      const params = new URLSearchParams();

      if (filters.status) params.append("status", filters.status);
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());

      const response = await axiosInstance.get(
        `/drivers/assignments?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    if (error.response?.data?.error) {
      const apiError = error.response.data.error;
      return new Error(`${apiError.code}: ${apiError.message}`);
    }

    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }

    if (error.message) {
      return new Error(error.message);
    }

    return new Error("An unexpected error occurred");
  }
}

export { DeliveryAssignmentService };
export const deliveryAssignmentService = new DeliveryAssignmentService();
