import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryClient";
import {
  DriverDocumentService,
  DriverDocumentsResponse,
  DriverDetailResponse,
} from "../services/driverDocumentService";
import { useAuth } from "../../../contexts/AuthContext";

// Hook to get driver documents (for drivers)
export function useDriverDocuments() {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.drivers.documents(),
    queryFn: () => DriverDocumentService.getDriverDocuments(),
    select: (data: DriverDocumentsResponse) => data.data,
    enabled: !!user && user.role === "driver",
  });
}

// Hook to get driver documents by ID (for admins)
export function useDriverDocumentsById(driverId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.drivers.documents(driverId),
    queryFn: () => DriverDocumentService.getDriverDocumentsById(driverId),
    select: (data: DriverDocumentsResponse) => data.data,
    enabled:
      !!user &&
      (user.role === "admin" || user.role === "super_admin") &&
      !!driverId,
  });
}

// Hook to get driver detail with documents (for admins)
export function useDriverDetail(driverId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.drivers.detail(driverId),
    queryFn: () => DriverDocumentService.getDriverDetail(driverId),
    select: (data: DriverDetailResponse) => data.data,
    enabled:
      !!user &&
      (user.role === "admin" || user.role === "super_admin") &&
      !!driverId,
  });
}
