import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InvoiceService } from "../services";
import { PaymentService } from "../services/paymentService";
import { queryKeys } from "../queryClient";
import {
  CreateInvoiceRequest,
  InvoiceStatus,
  PaymentMethod,
} from "../../../types/shared";

// Invoice hooks
export const useGenerateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvoiceRequest) =>
      InvoiceService.generateInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.invoices.clientInvoices(),
      });
    },
  });
};

export const useInvoiceById = (id: string) => {
  return useQuery({
    queryKey: queryKeys.invoices.detail(id),
    queryFn: () => InvoiceService.getInvoiceById(id),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useUpdateInvoiceStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        status: InvoiceStatus;
        payment_method?: PaymentMethod;
        payment_reference?: string;
      };
    }) => InvoiceService.updateInvoiceStatus(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.invoices.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all() });
    },
  });
};

export const useClientInvoices = (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.invoices.clientInvoices(params),
    queryFn: () => InvoiceService.getClientInvoices(params),
    select: (data) => {
      // Handle the actual API response structure
      // API returns: { success: true, data: { invoices: Invoice[], pagination: {...} } }
      // Return both invoices and pagination data
      console.log("🔍 useClientInvoices select - raw data:", data);
      console.log("🔍 useClientInvoices select - data.data:", data.data);
      console.log(
        "🔍 useClientInvoices select - data.data.invoices:",
        data.data.invoices
      );
      console.log(
        "🔍 useClientInvoices select - data.data.pagination:",
        data.data.pagination
      );
      return {
        invoices: data.data.invoices,
        pagination: data.data.pagination,
      };
    },
  });
};

export const useDownloadInvoicePDF = () => {
  return useMutation({
    mutationFn: (id: string) => InvoiceService.downloadInvoicePDF(id),
  });
};

export const useAllInvoices = (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.invoices.all(params),
    queryFn: () => InvoiceService.getAllInvoices(params),
    select: (data) => data.data,
  });
};
