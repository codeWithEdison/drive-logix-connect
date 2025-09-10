import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminService } from "../services/adminService";
import { queryKeys } from "../queryClient";

// Hook to get clients (Admin)
export const useAdminClients = (params?: {
  business_type?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.admin.clients(params),
    queryFn: () => AdminService.getClients(params),
    select: (data) => data.data || [],
  });
};

// Hook to create client (Admin)
export const useCreateAdminClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      full_name: string;
      email: string;
      password: string;
      company_name: string;
      business_type: "individual" | "corporate" | "government";
      phone?: string;
      preferred_language?: "en" | "rw" | "fr";
      tax_id?: string;
      address?: string;
      city?: string;
      country?: string;
      postal_code?: string;
      contact_person?: string;
      credit_limit?: number;
      payment_terms?: number;
    }) => AdminService.createClient(data),
    onSuccess: () => {
      // Invalidate and refetch clients list
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.clients() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
};

// Hook to get drivers (Admin)
export const useAdminDrivers = (params?: {
  status?: string;
  license_type?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.admin.drivers(params),
    queryFn: () => AdminService.getDrivers(params),
    select: (data) => data.data || [],
  });
};

// Hook to create driver (Admin)
export const useCreateAdminDriver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      full_name: string;
      email: string;
      password: string;
      license_number: string;
      license_type: "A" | "B" | "C" | "D" | "E";
      phone?: string;
      preferred_language?: "en" | "rw" | "fr";
      license_expiry?: string;
      date_of_birth?: string;
      emergency_contact?: string;
      emergency_phone?: string;
      blood_type?: string;
      medical_certificate_expiry?: string;
    }) => AdminService.createDriver(data),
    onSuccess: () => {
      // Invalidate and refetch drivers list
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.drivers() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
};
