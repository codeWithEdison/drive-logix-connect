import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LocationService } from "../services";
import { queryKeys } from "../queryClient";
import {
  CreateLocationRequest,
  UpdateLocationRequest,
  LocationSearchParams,
  LocationType,
} from "../../../types/shared";

// Location hooks
export const useCreateLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLocationRequest) =>
      LocationService.createLocation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.locations.all(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.locations.my(),
      });
    },
  });
};

export const useLocations = (params?: LocationSearchParams) => {
  return useQuery({
    queryKey: queryKeys.locations.all(params),
    queryFn: () => LocationService.getLocations(params),
    select: (data) => {
      // Handle the API response structure
      // API returns: { success: true, data: { locations: Location[], pagination: {...} } }
      return {
        locations: data.data?.locations || [],
        pagination: data.data?.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    },
  });
};

export const useMyLocations = () => {
  return useQuery({
    queryKey: queryKeys.locations.my(),
    queryFn: () => LocationService.getMyLocations(),
    select: (data) => data.data || [],
  });
};

export const useLocationSuggestions = (type?: LocationType) => {
  return useQuery({
    queryKey: queryKeys.locations.suggestions(type),
    queryFn: () => LocationService.getLocationSuggestions(type),
    select: (data) => data.data || [],
  });
};

export const useLocationsByType = (type: LocationType) => {
  return useQuery({
    queryKey: queryKeys.locations.byType(type),
    queryFn: () => LocationService.getLocationsByType(type),
    select: (data) => data.data || [],
    enabled: !!type,
  });
};

export const useLocationById = (id: string) => {
  return useQuery({
    queryKey: queryKeys.locations.detail(id),
    queryFn: () => LocationService.getLocationById(id),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useUpdateLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLocationRequest }) =>
      LocationService.updateLocation(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.locations.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.locations.all(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.locations.my(),
      });
    },
  });
};

export const useDeleteLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => LocationService.deleteLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.locations.all(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.locations.my(),
      });
    },
  });
};
