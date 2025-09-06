import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClientService } from "../services";
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

export const useClientInvoices = (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.clients.invoices(params),
    queryFn: () => ClientService.getInvoices(params),
    select: (data) => data.data,
  });
};
