import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClientService, AdminService } from "../services";
import { queryKeys } from "../queryClient";
import { UpdateClientRequest } from "../../../types/shared";

// Client hooks
export const useClientProfile = () => {
  return useQuery({
    queryKey: queryKeys.clients.profile,
    queryFn: () => ClientService.getProfile(),
    select: (data) => data.data,
  });
};

export const useUpdateClientProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateClientRequest) =>
      ClientService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.profile });
    },
  });
};

export const useClientCreditStatus = () => {
  return useQuery({
    queryKey: queryKeys.clients.creditStatus,
    queryFn: () => ClientService.getCreditStatus(),
    select: (data) => data.data,
  });
};

export const useAllClients = (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.clients.all(params),
    queryFn: () => ClientService.getAllClients(params),
    select: (data) => data.data,
    placeholderData: (previousData) => previousData, // Keep existing data while loading new data
  });
};

// Admin-specific clients hook
export const useAdminClients = (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["admin", "clients", params],
    queryFn: () => AdminService.getClients(params),
    select: (data) => {
      console.log("🔍 AdminClients hook - raw data:", data);
      // The API returns data directly in the data property
      if (data?.data && Array.isArray(data.data)) {
        return data.data;
      } else if (Array.isArray(data)) {
        return data;
      } else {
        return [];
      }
    },
    placeholderData: (previousData) => previousData,
  });
};
