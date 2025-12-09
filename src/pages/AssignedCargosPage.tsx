import { useState } from "react";
import { CargoTable } from "@/components/ui/CargoTable";
import {
  CargoDetail,
  CargoDetailModal,
} from "@/components/ui/CargoDetailModal";
import {
  useMyAssignments,
  useAcceptAssignment,
  useRejectAssignment,
  useCancelAssignment,
  useUpdateDeliveryAssignment,
  useCreateAssignment,
} from "@/lib/api/hooks/assignmentHooks";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { customToast } from "@/lib/utils/toast";
import { mapDeliveryAssignmentsToCargoDetails } from "@/lib/utils/cargoMapper";
import {
  RefreshCw,
  AlertCircle,
  Package,
  Truck,
  Clock,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function AssignedCargosPage() {
  const { t } = useLanguage();
  const { user } = useAuth();

  // Modal state management
  const [selectedCargo, setSelectedCargo] = useState<CargoDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // API hooks - Using new assignment service for driver assignments
  const {
    data: assignmentsResponse,
    isLoading,
    error,
    refetch,
  } = useMyAssignments({ limit: 50 });

  // Extract assignments data from response (normalize to array)
  const assignmentsData = Array.isArray(assignmentsResponse)
    ? assignmentsResponse
    : Array.isArray((assignmentsResponse as any)?.data?.assignments)
    ? (assignmentsResponse as any).data.assignments
    : Array.isArray((assignmentsResponse as any)?.data)
    ? (assignmentsResponse as any).data
    : [];

  // Assignment mutation hooks
  const acceptAssignmentMutation = useAcceptAssignment();
  const rejectAssignmentMutation = useRejectAssignment();
  const cancelAssignmentMutation = useCancelAssignment();
  const updateAssignmentMutation = useUpdateDeliveryAssignment();
  const createAssignmentMutation = useCreateAssignment();

  const handleAcceptAssignment = async (
    assignmentId: string,
    notes?: string
  ) => {
    try {
      await acceptAssignmentMutation.mutateAsync({
        assignmentId,
        data: { notes },
      });
      customToast.success("Assignment accepted successfully");
      refetch(); // Refresh the assignments list
    } catch (error: any) {
      customToast.error(error.message || "Failed to accept assignment");
    }
  };

  const handleRejectAssignment = async (
    assignmentId: string,
    reason: string,
    notes?: string
  ) => {
    try {
      await rejectAssignmentMutation.mutateAsync({
        assignmentId,
        data: { reason, notes },
      });
      customToast.success("Assignment rejected");
      refetch(); // Refresh the assignments list
    } catch (error: any) {
      customToast.error(error.message || "Failed to reject assignment");
    }
  };

  const handleCancelAssignment = async (assignmentId: string) => {
    try {
      await cancelAssignmentMutation.mutateAsync(assignmentId);
      customToast.success("Assignment cancelled");
      refetch(); // Refresh the assignments list
    } catch (error: any) {
      customToast.error(error.message || "Failed to cancel assignment");
    }
  };

  const handleChangeVehicle = async (
    assignmentId: string,
    vehicleId: string
  ) => {
    try {
      await updateAssignmentMutation.mutateAsync({
        assignmentId,
        data: { vehicle_id: vehicleId },
      });
      customToast.success("Vehicle changed successfully");
    } catch (error: any) {
      customToast.error(error.message || "Failed to change vehicle");
    }
  };

  const handleChangeDriver = async (assignmentId: string, driverId: string) => {
    try {
      await updateAssignmentMutation.mutateAsync({
        assignmentId,
        data: { driver_id: driverId },
      });
      customToast.success("Driver changed successfully");
    } catch (error: any) {
      customToast.error(error.message || "Failed to change driver");
    }
  };

  const handleCreateAssignment = async (
    cargoId: string,
    driverId: string,
    vehicleId: string,
    notes?: string
  ) => {
    try {
      await createAssignmentMutation.mutateAsync({
        cargo_id: cargoId,
        driver_id: driverId,
        vehicle_id: vehicleId,
        notes,
      });
      customToast.success("Assignment created successfully");
    } catch (error: any) {
      customToast.error(error.message || "Failed to create assignment");
    }
  };

  const handleStartDelivery = async (cargoId: string) => {
    try {
      // TODO: Implement start delivery API call
      console.log("Starting delivery for cargo:", cargoId);
      customToast.success(t("delivery.deliveryStarted"));
    } catch (error) {
      customToast.error(t("errors.serverError"));
    }
  };

  const handleCallClient = (phone: string) => {
    console.log("Calling client:", phone);
    window.open(`tel:${phone}`, "_self");
  };

  const handleCallDriver = (phone: string) => {
    console.log("Calling driver:", phone);
    window.open(`tel:${phone}`, "_self");
  };

  const handleUploadPhoto = async (cargoId: string) => {
    try {
      // TODO: Implement upload photo API call
      console.log("Uploading photo for cargo:", cargoId);
      customToast.success(
        t("common.upload") +
          " " +
          t("delivery.uploadProof") +
          " " +
          t("common.success")
      );
    } catch (error) {
      customToast.error(t("errors.serverError"));
    }
  };

  const handleReportIssue = async (cargoId: string) => {
    try {
      // TODO: Implement report issue API call
      console.log("Reporting issue for cargo:", cargoId);
      customToast.success(
        t("common.report") + " " + t("common.issue") + " " + t("common.success")
      );
    } catch (error) {
      customToast.error(t("errors.serverError"));
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  // Handle opening cargo detail modal
  const handleOpenCargoModal = (cargo: CargoDetail) => {
    setSelectedCargo(cargo);
    setIsModalOpen(true);
  };

  // Handle closing cargo detail modal
  const handleCloseCargoModal = () => {
    setIsModalOpen(false);
    setSelectedCargo(null);
  };

  // Handle calling contacts
  const handleCallContact = (phone: string, name?: string) => {
    console.log(`Calling ${name || "contact"} at ${phone}`);
    window.open(`tel:${phone}`, "_self");
  };

  // Transform API data to CargoDetail format
  const assignments = Array.isArray(assignmentsData) ? assignmentsData : [];
  const transformedCargos: CargoDetail[] =
    assignments.length > 0
      ? mapDeliveryAssignmentsToCargoDetails(assignments)
      : [];

  // Calculate stats
  const stats = {
    total: transformedCargos.length,
    pending: transformedCargos.filter((c) => c.status === "pending").length,
    inTransit: transformedCargos.filter((c) => c.status === "in_transit")
      .length,
    completed: transformedCargos.filter((c) => c.status === "delivered").length,
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card
              key={i}
              className="bg-white shadow-lg rounded-xl sm:rounded-2xl overflow-hidden"
            >
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table Skeleton */}
        <Card className="bg-white shadow-lg rounded-xl sm:rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {t("navigation.assignedCargos")}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {t("navigation.assignedCargos")} {t("dashboard.subtitle")}
            </p>
          </div>
        </div>

        <Card className="bg-red-50 border-red-200 shadow-lg rounded-xl sm:rounded-2xl overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-red-800 text-sm sm:text-base">
                  {t("common.error")}
                </h3>
                <p className="text-red-600 text-xs sm:text-sm mt-1 break-words">
                  {error.message || t("dashboard.loadError")}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="mt-3 border-red-300 text-red-600 hover:bg-red-50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t("common.retry")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No data state
  if (!transformedCargos || transformedCargos.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {t("navigation.assignedCargos")}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {t("navigation.assignedCargos")} {t("dashboard.subtitle")}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t("common.refresh")}
          </Button>
        </div>

        <Card className="bg-blue-50 border-blue-200 shadow-lg rounded-xl sm:rounded-2xl overflow-hidden">
          <CardContent className="p-6 sm:p-8 text-center">
            <Package className="h-12 w-12 sm:h-16 sm:w-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-blue-800 mb-2">
              {t("navigation.assignedCargos")}
            </h3>
            <p className="text-blue-600 text-sm sm:text-base mb-4">
              {t("myCargos.noCargosDescription")}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t("common.refresh")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {t("navigation.assignedCargos")}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1"> {t("dashboard.subtitle")}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="border-blue-300 text-blue-600 hover:bg-blue-50"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {t("common.refresh")}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 border-2 hover:shadow-lg transition-all duration-300 rounded-xl sm:rounded-2xl overflow-hidden group">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="space-y-1 sm:space-y-2">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                  {t("dashboard.totalAssigned")}
                </p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  {stats.total}
                </p>
                <p className="text-xs text-gray-500 hidden sm:block">
                  {t("dashboard.allCargos")}
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/50 group-hover:scale-110 transition-transform duration-300 self-start sm:self-auto">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 border-2 hover:shadow-lg transition-all duration-300 rounded-xl sm:rounded-2xl overflow-hidden group">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="space-y-1 sm:space-y-2">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                  {t("dashboard.pendingAssignments")}
                </p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  {stats.pending}
                </p>
                <p className="text-xs text-gray-500 hidden sm:block">
                  {t("dashboard.awaitingPickup")}
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/50 group-hover:scale-110 transition-transform duration-300 self-start sm:self-auto">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 border-2 hover:shadow-lg transition-all duration-300 rounded-xl sm:rounded-2xl overflow-hidden group">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="space-y-1 sm:space-y-2">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                  {t("status.inTransit")}
                </p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  {stats.inTransit}
                </p>
                <p className="text-xs text-gray-500 hidden sm:block">
                  {t("dashboard.currentlyMoving")}
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/50 group-hover:scale-110 transition-transform duration-300 self-start sm:self-auto">
                <Truck className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 border-2 hover:shadow-lg transition-all duration-300 rounded-xl sm:rounded-2xl overflow-hidden group">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="space-y-1 sm:space-y-2">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                  {t("status.completed")}
                </p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  {stats.completed}
                </p>
                <p className="text-xs text-gray-500 hidden sm:block">
                  {t("dashboard.successfullyDelivered")}
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/50 group-hover:scale-110 transition-transform duration-300 self-start sm:self-auto">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cargo Table */}
      <CargoTable
        cargos={transformedCargos}
        title={t("navigation.assignedCargos")}
        showStats={false}
        showSearch={true}
        showFilters={true}
        showPagination={true}
        itemsPerPage={10}
        onAcceptCargo={(cargoId) => {
          // Find the assignment for this cargo and accept it
          const cargo = transformedCargos.find((c) => c.id === cargoId);
          if (cargo && (cargo as any).assignmentId) {
            handleAcceptAssignment((cargo as any).assignmentId);
          }
        }}
        onStartDelivery={handleStartDelivery}
        onCallClient={handleCallClient}
        onUploadPhoto={handleUploadPhoto}
        onReportIssue={handleReportIssue}
        onAcceptAssignment={handleAcceptAssignment}
        onRejectAssignment={handleRejectAssignment}
        onCancelAssignment={handleCancelAssignment}
        onChangeVehicle={handleChangeVehicle}
        onChangeDriver={handleChangeDriver}
        onCreateAssignment={handleCreateAssignment}
        onViewDetails={handleOpenCargoModal}
      />

      {/* Cargo Detail Modal */}
      <CargoDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseCargoModal}
        cargo={selectedCargo}
        userRole={(user?.role as any) || "driver"}
        onAcceptAssignment={handleAcceptAssignment}
        onRejectAssignment={handleRejectAssignment}
        onCancelAssignment={handleCancelAssignment}
        onChangeVehicle={handleChangeVehicle}
        onChangeDriver={handleChangeDriver}
        onCreateAssignment={handleCreateAssignment}
        onStartDelivery={handleStartDelivery}
        onCallClient={handleCallClient}
        onCallDriver={handleCallDriver}
        onUploadPhoto={handleUploadPhoto}
        onReportIssue={handleReportIssue}
        onCallContact={handleCallContact}
        onAccept={(cargoId) => {
          // Find the assignment for this cargo and accept it
          const cargo = transformedCargos.find((c) => c.id === cargoId);
          if (cargo && (cargo as any).assignmentId) {
            handleAcceptAssignment((cargo as any).assignmentId);
          }
        }}
      />
    </div>
  );
}
