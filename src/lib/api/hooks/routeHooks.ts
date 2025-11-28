import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RouteService } from "../services";
import { queryKeys } from "../queryClient";
import {
  CreateRouteRequest,
  Route,
  RouteWaypoint,
} from "../../../types/shared";

// Route hooks
export const useCreateRoute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRouteRequest) => RouteService.createRoute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routes.all() });
    },
  });
};

export const useRouteDetails = (cargoId: string) => {
  return useQuery({
    queryKey: queryKeys.routes.detail(cargoId),
    queryFn: () => RouteService.getRouteDetails(cargoId),
    select: (data) => data.data,
    enabled: !!cargoId,
  });
};

export const useUpdateRouteWaypoint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      routeId,
      waypointId,
      data,
    }: {
      routeId: string;
      waypointId: string;
      data: Partial<RouteWaypoint>;
    }) => RouteService.updateRouteWaypoint(routeId, waypointId, data),
    onSuccess: (_, { routeId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.routes.detail(routeId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.routes.all() });
    },
  });
};

export const useRouteProgress = (cargoId: string) => {
  return useQuery({
    queryKey: queryKeys.routes.progress(cargoId),
    queryFn: () => RouteService.getRouteProgress(cargoId),
    select: (data) => data.data,
    enabled: !!cargoId,
    refetchInterval: 30000, // Refetch every 30 seconds for live updates
  });
};

export const useAllRoutes = (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.routes.all(params),
    queryFn: () => RouteService.getAllRoutes(params),
    select: (data) => data.data,
  });
};

export const useDeleteRoute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (routeId: string) => RouteService.deleteRoute(routeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routes.all() });
    },
  });
};
