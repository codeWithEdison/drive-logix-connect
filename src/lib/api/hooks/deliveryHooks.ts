import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DeliveryService } from "../services";
import { queryKeys } from "../queryClient";
import { CreateDeliveryAssignmentRequest } from "../../../types/shared";

// Delivery hooks
export const useCreateDeliveryAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDeliveryAssignmentRequest) =>
      DeliveryService.createDeliveryAssignment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deliveries.all() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.deliveryAssignments.all(),
      });
    },
  });
};

export const useDeliveryAssignment = (cargoId: string) => {
  return useQuery({
    queryKey: queryKeys.deliveryAssignments.detail(cargoId),
    queryFn: () => DeliveryService.getDeliveryAssignment(cargoId),
    select: (data) => data.data,
    enabled: !!cargoId,
  });
};

export const useUpdateAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateDeliveryAssignmentRequest>;
    }) => DeliveryService.updateAssignment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.deliveryAssignments.detail(id),
      });
    },
  });
};

export const useStartDelivery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cargoId,
      startTime,
    }: {
      cargoId: string;
      startTime?: string;
    }) => DeliveryService.startDelivery(cargoId, startTime),
    onSuccess: (_, { cargoId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.deliveries.detail(cargoId),
      });
    },
  });
};

export const useUpdateDeliveryStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cargoId, data }: { cargoId: string; data: any }) =>
      DeliveryService.updateDeliveryStatus(cargoId, data),
    onSuccess: (_, { cargoId }) => {
      // Invalidate delivery detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.deliveries.detail(cargoId),
      });

      // Invalidate cargo detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.cargos.detail(cargoId),
      });

      // Invalidate driver cargos list to refresh the main page
      queryClient.invalidateQueries({
        queryKey: queryKeys.cargos.driverCargos(),
      });

      // Invalidate all cargos list
      queryClient.invalidateQueries({
        queryKey: queryKeys.cargos.all(),
      });
    },
  });
};

export const useConfirmDeliveryWithImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cargoId,
      data,
    }: {
      cargoId: string;
      data: {
        delivery_proof_url: string;
        notes?: string;
      };
    }) => DeliveryService.confirmDeliveryWithImage(cargoId, data),
    onSuccess: (_, { cargoId }) => {
      // Invalidate delivery detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.deliveries.detail(cargoId),
      });

      // Invalidate cargo detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.cargos.detail(cargoId),
      });

      // Invalidate driver cargos list to refresh the main page
      queryClient.invalidateQueries({
        queryKey: queryKeys.cargos.driverCargos(),
      });

      // Invalidate all cargos list
      queryClient.invalidateQueries({
        queryKey: queryKeys.cargos.all(),
      });
    },
  });
};

export const useRateDelivery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cargoId,
      data,
    }: {
      cargoId: string;
      data: {
        rating: number;
        review?: string;
      };
    }) => DeliveryService.rateDelivery(cargoId, data),
    onSuccess: (_, { cargoId }) => {
      // Invalidate delivery detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.deliveries.detail(cargoId),
      });

      // Invalidate cargo detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.cargos.detail(cargoId),
      });

      // Invalidate driver cargos list to refresh the main page
      queryClient.invalidateQueries({
        queryKey: queryKeys.cargos.driverCargos(),
      });

      // Invalidate all cargos list
      queryClient.invalidateQueries({
        queryKey: queryKeys.cargos.all(),
      });
    },
  });
};

export const useConfirmDeliveryOTP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cargoId, otp }: { cargoId: string; otp: string }) =>
      DeliveryService.confirmDeliveryOTP(cargoId, otp),
    onSuccess: (_, { cargoId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.deliveries.detail(cargoId),
      });
    },
  });
};

export const useConfirmDeliveryQR = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cargoId, qrToken }: { cargoId: string; qrToken: string }) =>
      DeliveryService.confirmDeliveryQR(cargoId, qrToken),
    onSuccess: (_, { cargoId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.deliveries.detail(cargoId),
      });
    },
  });
};

export const useCompleteDelivery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cargoId, data }: { cargoId: string; data: any }) =>
      DeliveryService.completeDelivery(cargoId, data),
    onSuccess: (_, { cargoId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.deliveries.detail(cargoId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.drivers.assignments(),
      });
    },
  });
};

export const useDeliveryDetails = (cargoId: string) => {
  return useQuery({
    queryKey: queryKeys.deliveries.detail(cargoId),
    queryFn: () => DeliveryService.getDeliveryDetails(cargoId),
    select: (data) => data.data,
    enabled: !!cargoId,
  });
};

export const useUploadDeliveryProof = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cargoId, data }: { cargoId: string; data: FormData }) =>
      DeliveryService.uploadDeliveryProof(cargoId, data),
    onSuccess: (_, { cargoId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.deliveries.detail(cargoId),
      });
    },
  });
};

export const useDriverDeliveries = (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.deliveries.driverDeliveries(params),
    queryFn: () => DeliveryService.getDriverDeliveries(params),
    select: (data) => data.data,
  });
};

export const useAllDeliveries = (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.deliveries.all(params),
    queryFn: () => DeliveryService.getAllDeliveries(params),
    select: (data) => data.data,
  });
};
