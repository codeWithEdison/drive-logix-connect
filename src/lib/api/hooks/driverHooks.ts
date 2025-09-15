import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DriverService } from "../services";
import { queryKeys } from "../queryClient";
import { UpdateDriverRequest, DriverStatus } from "../../../types/shared";
import { AvailableDriverFilters } from "../services/driverService";

// Driver hooks
export const useDriverProfile = () => {
  return useQuery({
    queryKey: queryKeys.drivers.profile,
    queryFn: () => DriverService.getProfile(),
    select: (data) => data.data,
  });
};

export const useAvailableDriversWithoutAssignments = (
  filters: AvailableDriverFilters = {}
) => {
  return useQuery({
    queryKey: ["available-drivers-without-assignments", filters],
    queryFn: () => DriverService.getAvailableDriversWithoutAssignments(filters),
    select: (data) => data.data,
  });
};

export const useUpdateDriverProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateDriverRequest) =>
      DriverService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.drivers.profile });
    },
  });
};

export const useUploadDriverDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormData) => DriverService.uploadDocument(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.drivers.documents });
    },
  });
};

export const useDriverDocuments = () => {
  return useQuery({
    queryKey: queryKeys.drivers.documents,
    queryFn: () => DriverService.getDocuments(),
    select: (data) => data.data,
  });
};

export const useUpdateDriverStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: DriverStatus) => DriverService.updateStatus(status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.drivers.profile });
    },
  });
};

export const useDriverPerformance = () => {
  return useQuery({
    queryKey: queryKeys.drivers.performance,
    queryFn: () => DriverService.getPerformance(),
    select: (data) => data.data,
  });
};

export const useDriverAssignments = (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.drivers.assignments(params),
    queryFn: () => DriverService.getAssignments(params),
    select: (data) => (data.data as any).assignments || [], // Handle actual API response structure
  });
};

export const useAvailableDrivers = (params?: {
  location?: string;
  vehicle_type?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.drivers.available(params),
    queryFn: () => DriverService.getAvailableDrivers(params),
    select: (data) => data.data,
  });
};

export const usePaginatedDrivers = (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.drivers.all(params),
    queryFn: () => DriverService.getAllDrivers(params),
    select: (data) => data,
    placeholderData: (previousData) => previousData, // Keep existing data while loading new data
  });
};

export const useDriverById = (id: string) => {
  return useQuery({
    queryKey: queryKeys.drivers.detail(id),
    queryFn: () => DriverService.getDriverById(id),
    select: (data) => data.data,
    enabled: !!id,
  });
};
