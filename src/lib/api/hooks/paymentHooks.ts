import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefundService } from "../services";
import { queryKeys } from "../queryClient";
import { CreateRefundRequest, Refund } from "../../../types/shared";

// Refund hooks (Payment hooks are in invoiceHooks.ts)
export const useRequestRefund = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRefundRequest) =>
      RefundService.requestRefund(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.refunds.all });
    },
  });
};

export const useRefundStatus = (refundId: string) => {
  return useQuery({
    queryKey: queryKeys.refunds.detail(refundId),
    queryFn: () => RefundService.getRefundStatus(refundId),
    select: (data) => data.data,
    enabled: !!refundId,
  });
};

export const useRefundHistory = (params?: {
  invoice_id?: string;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.refunds.history(params),
    queryFn: () => RefundService.getRefundHistory(params),
    select: (data) => data.data,
  });
};

export const useApproveRefund = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ refundId, reason }: { refundId: string; reason?: string }) =>
      RefundService.approveRefund(refundId, reason),
    onSuccess: (_, { refundId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.refunds.detail(refundId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.refunds.all });
    },
  });
};

export const useRejectRefund = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ refundId, reason }: { refundId: string; reason: string }) =>
      RefundService.rejectRefund(refundId, reason),
    onSuccess: (_, { refundId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.refunds.detail(refundId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.refunds.all });
    },
  });
};
