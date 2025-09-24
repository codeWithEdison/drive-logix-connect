// ===========================================
// CARGO IMAGE MANAGEMENT HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CargoImageService } from "../services/cargoImageService";
import { queryKeys } from "../queryClient";
import {
  CargoImage,
  CreateCargoImageRequest,
  UpdateCargoImageRequest,
  CargoImageSearchParams,
  CargoImageType,
} from "../../../types/shared";

// Query Keys
const cargoImageKeys = {
  all: ["cargo-images"] as const,
  lists: () => [...cargoImageKeys.all, "list"] as const,
  list: (cargoId: string, params?: CargoImageSearchParams) =>
    [...cargoImageKeys.lists(), cargoId, params] as const,
  details: () => [...cargoImageKeys.all, "detail"] as const,
  detail: (cargoId: string, imageId: string) =>
    [...cargoImageKeys.details(), cargoId, imageId] as const,
  byType: (cargoId: string, type: CargoImageType) =>
    [...cargoImageKeys.all, "type", cargoId, type] as const,
  primary: (cargoId: string) =>
    [...cargoImageKeys.all, "primary", cargoId] as const,
  stats: (cargoId: string) =>
    [...cargoImageKeys.all, "stats", cargoId] as const,
};

// Hooks
export const useCargoImages = (
  cargoId: string,
  params?: CargoImageSearchParams
) => {
  return useQuery({
    queryKey: cargoImageKeys.list(cargoId, params),
    queryFn: () => CargoImageService.getCargoImages(cargoId, params),
    enabled: !!cargoId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCargoImage = (cargoId: string, imageId: string) => {
  return useQuery({
    queryKey: cargoImageKeys.detail(cargoId, imageId),
    queryFn: () => CargoImageService.getCargoImageById(cargoId, imageId),
    enabled: !!cargoId && !!imageId,
  });
};

export const useCargoImagesByType = (
  cargoId: string,
  imageType: CargoImageType
) => {
  return useQuery({
    queryKey: cargoImageKeys.byType(cargoId, imageType),
    queryFn: () => CargoImageService.getCargoImagesByType(cargoId, imageType),
    enabled: !!cargoId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePrimaryCargoImage = (cargoId: string) => {
  return useQuery({
    queryKey: cargoImageKeys.primary(cargoId),
    queryFn: () => CargoImageService.getPrimaryCargoImage(cargoId),
    enabled: !!cargoId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePickupImages = (cargoId: string) => {
  return useCargoImagesByType(cargoId, CargoImageType.PICKUP);
};

export const useDeliveryImages = (cargoId: string) => {
  return useCargoImagesByType(cargoId, CargoImageType.DELIVERY);
};

export const useDamageImages = (cargoId: string) => {
  return useCargoImagesByType(cargoId, CargoImageType.DAMAGE);
};

export const usePackagingImages = (cargoId: string) => {
  return useCargoImagesByType(cargoId, CargoImageType.PACKAGING);
};

export const useDocumentationImages = (cargoId: string) => {
  return useCargoImagesByType(cargoId, CargoImageType.DOCUMENTATION);
};

export const useCargoImageStats = (cargoId: string) => {
  return useQuery({
    queryKey: cargoImageKeys.stats(cargoId),
    queryFn: () => CargoImageService.getCargoImageStats(cargoId),
    enabled: !!cargoId,
  });
};

// Mutations
export const useUploadCargoImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cargoId,
      data,
    }: {
      cargoId: string;
      data: CreateCargoImageRequest;
    }) => CargoImageService.uploadCargoImage(cargoId, data),
    onSuccess: (_, { cargoId }) => {
      queryClient.invalidateQueries({ queryKey: cargoImageKeys.lists() });
      queryClient.invalidateQueries({ queryKey: cargoImageKeys.list(cargoId) });
      queryClient.invalidateQueries({
        queryKey: cargoImageKeys.primary(cargoId),
      });
      queryClient.invalidateQueries({
        queryKey: cargoImageKeys.stats(cargoId),
      });
    },
  });
};

export const useUpdateCargoImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cargoId,
      imageId,
      data,
    }: {
      cargoId: string;
      imageId: string;
      data: UpdateCargoImageRequest;
    }) => CargoImageService.updateCargoImage(cargoId, imageId, data),
    onSuccess: (_, { cargoId, imageId }) => {
      queryClient.invalidateQueries({
        queryKey: cargoImageKeys.detail(cargoId, imageId),
      });
      queryClient.invalidateQueries({ queryKey: cargoImageKeys.list(cargoId) });
      queryClient.invalidateQueries({
        queryKey: cargoImageKeys.primary(cargoId),
      });
    },
  });
};

export const useDeleteCargoImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cargoId, imageId }: { cargoId: string; imageId: string }) =>
      CargoImageService.deleteCargoImage(cargoId, imageId),
    onSuccess: (_, { cargoId }) => {
      queryClient.invalidateQueries({ queryKey: cargoImageKeys.lists() });
      queryClient.invalidateQueries({ queryKey: cargoImageKeys.list(cargoId) });
      queryClient.invalidateQueries({
        queryKey: cargoImageKeys.primary(cargoId),
      });
      queryClient.invalidateQueries({
        queryKey: cargoImageKeys.stats(cargoId),
      });
    },
  });
};

export const useSetPrimaryImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cargoId, imageId }: { cargoId: string; imageId: string }) =>
      CargoImageService.setPrimaryImage(cargoId, imageId),
    onSuccess: (_, { cargoId }) => {
      queryClient.invalidateQueries({ queryKey: cargoImageKeys.list(cargoId) });
      queryClient.invalidateQueries({
        queryKey: cargoImageKeys.primary(cargoId),
      });
    },
  });
};

export const useBulkUploadImages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cargoId,
      images,
    }: {
      cargoId: string;
      images: Array<{
        file: File;
        image_type: CargoImageType;
        description?: string;
        is_primary?: boolean;
      }>;
    }) => CargoImageService.bulkUploadImages(cargoId, images),
    onSuccess: (_, { cargoId }) => {
      queryClient.invalidateQueries({ queryKey: cargoImageKeys.lists() });
      queryClient.invalidateQueries({ queryKey: cargoImageKeys.list(cargoId) });
      queryClient.invalidateQueries({
        queryKey: cargoImageKeys.primary(cargoId),
      });
      queryClient.invalidateQueries({
        queryKey: cargoImageKeys.stats(cargoId),
      });
    },
  });
};

export const useDownloadImage = () => {
  return useMutation({
    mutationFn: (imageUrl: string) => CargoImageService.downloadImage(imageUrl),
  });
};

export const useValidateImageFile = () => {
  return useMutation({
    mutationFn: (file: File) =>
      Promise.resolve(CargoImageService.validateImageFile(file)),
  });
};
