import { useQuery } from "@tanstack/react-query";
import { SystemService } from "../services";
import { queryKeys } from "../queryClient";

// System hooks
export const useSystemHealth = () => {
  return useQuery({
    queryKey: queryKeys.system.health,
    queryFn: () => SystemService.getHealth(),
    select: (data) => data.data,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useSystemReady = () => {
  return useQuery({
    queryKey: queryKeys.system.ready,
    queryFn: () => SystemService.getReady(),
    select: (data) => data.data,
    refetchInterval: 10000, // Refetch every 10 seconds
  });
};
