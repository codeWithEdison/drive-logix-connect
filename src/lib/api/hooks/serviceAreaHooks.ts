import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ServiceAreaService } from "../services";
import { queryKeys } from "../queryClient";
import {
  CreateServiceAreaRequest,
  UpdateServiceAreaRequest,
  ServiceAreaQueryParams,
  ServiceArea,
} from "../services/serviceAreaService";

export const useServiceAreas = (params?: ServiceAreaQueryParams) => {
  return useQuery({
    queryKey: queryKeys.operational.serviceAreas(params),
    queryFn: () => ServiceAreaService.getServiceAreas(params),
    select: (res) => res.data || [],
  });
};

export const useCreateServiceArea = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateServiceAreaRequest) =>
      ServiceAreaService.createServiceArea(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.operational.serviceAreas() });
    },
  });
};

export const useUpdateServiceArea = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateServiceAreaRequest;
    }) => ServiceAreaService.updateServiceArea(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.operational.serviceAreas() });
      // Could add detail key if we add one later
    },
  });
};

export const useToggleServiceArea = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ServiceAreaService.toggleServiceAreaStatus(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.operational.serviceAreas() });
    },
  });
};
