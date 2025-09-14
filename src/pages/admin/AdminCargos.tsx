import React, { useState, useMemo, useEffect } from "react";
import { CargoTable } from "@/components/ui/CargoTable";
import {
  CargoDetailModal,
  CargoDetail,
} from "@/components/ui/CargoDetailModal";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Truck,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import ModernModel from "@/components/modal/ModernModel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useDeliveryAssignments,
  useCreateAssignment,
  useUpdateDeliveryAssignment,
  useCancelAssignment,
  useAcceptAssignment,
  useRejectAssignment,
} from "@/lib/api/hooks/assignmentHooks";
import {
  useAllCargos,
  useUpdateCargoStatus,
  useCancelCargo,
  useAdminClients,
} from "@/lib/api/hooks";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { customToast } from "@/lib/utils/toast";
import { mapCargosToCargoDetails } from "@/lib/utils/cargoMapper";

export default function AdminCargos() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [selectedCargo, setSelectedCargo] = useState<CargoDetail | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isTruckAssignmentModalOpen, setIsTruckAssignmentModalOpen] =
    useState(false);
  const [cargoForAssignment, setCargoForAssignment] =
    useState<CargoDetail | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [clientIdFilter, setClientIdFilter] = useState<string>("all-clients");
  const [dateFromFilter, setDateFromFilter] = useState<string>("");
  const [dateToFilter, setDateToFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // API hooks
  const {
    data: cargosResponse,
    isLoading,
    error,
    refetch,
  } = useAllCargos({
    status: statusFilter === "all" ? undefined : (statusFilter as any),
    priority: priorityFilter === "all" ? undefined : (priorityFilter as any),
    client_id: clientIdFilter === "all-clients" ? undefined : clientIdFilter,
    date_from: dateFromFilter || undefined,
    date_to: dateToFilter || undefined,
    search: searchTerm || undefined,
    page: currentPage,
    limit: pageSize,
  });

  // Get clients for dropdown using admin service
  const {
    data: clientsData,
    isLoading: clientsLoading,
    error: clientsError,
  } = useAdminClients({ limit: 100 }); // Get clients with max allowed limit

  // Extract data and pagination info
  const cargosData = useMemo(
    () => (cargosResponse as any)?.data || [],
    [cargosResponse]
  );
  const pagination = useMemo(
    () =>
      (cargosResponse as any)?.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    [cargosResponse]
  );

  // Mutation hooks
  const updateStatusMutation = useUpdateCargoStatus();
  const cancelCargoMutation = useCancelCargo();

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    statusFilter,
    priorityFilter,
    clientIdFilter,
    dateFromFilter,
    dateToFilter,
    searchTerm,
    pageSize,
  ]);

  // Transform API data to CargoDetail format
  const cargos: CargoDetail[] = mapCargosToCargoDetails(cargosData || []);

  // Debug logging for clients
  console.log("🔍 AdminCargos Debug - clientsData:", clientsData);
  console.log("🔍 AdminCargos Debug - clientsLoading:", clientsLoading);
  console.log("🔍 AdminCargos Debug - clientsError:", clientsError);
  console.log("🔍 AdminCargos Debug - clientsData structure:", {
    hasData: !!clientsData,
    dataType: typeof clientsData,
    isArray: Array.isArray(clientsData),
    dataLength: Array.isArray(clientsData)
      ? (clientsData as any[]).length
      : "not array",
    firstItem: Array.isArray(clientsData)
      ? (clientsData as any[])[0]
      : "not array",
    firstClientStructure:
      Array.isArray(clientsData) && (clientsData as any[])[0]
        ? {
            id: (clientsData as any[])[0].id,
            full_name: (clientsData as any[])[0].full_name,
            client: (clientsData as any[])[0].client,
            company_name: (clientsData as any[])[0].client?.company_name,
          }
        : null,
  });

  // Debug logging
  console.log("🔍 AdminCargos Debug:");
  console.log("Raw API response:", cargosResponse);
  console.log("Cargos data:", cargosData);
  console.log("Pagination:", pagination);
  console.log("Cargos length:", cargosData.length);

  // Get current count based on selected status filter
  const currentCount = useMemo(() => {
    return pagination.total; // This will be the total for the current filter
  }, [pagination.total]);

  // Status tabs configuration
  const statusTabs = [
    { key: "all", label: t("common.all") },
    { key: "pending", label: t("status.pending") },
    { key: "assigned", label: t("status.assigned") },
    { key: "picked_up", label: "Picked Up" },
    { key: "in_transit", label: t("status.inTransit") },
    { key: "delivered", label: t("status.delivered") },
    { key: "cancelled", label: t("status.cancelled") },
  ];

  const handleViewDetails = (cargo: CargoDetail) => {
    setSelectedCargo(cargo);
    setIsDetailModalOpen(true);
  };

  const handleAssignTruck = (cargo: CargoDetail) => {
    setCargoForAssignment(cargo);
    setIsTruckAssignmentModalOpen(true);
  };

  const handleCreateNewCargo = () => {
    customToast.info(t("adminCargos.addNewCargo"));
    window.location.href = "/admin/cargos/new";
  };

  const handleCallClient = (phone: string) => {
    window.open(`tel:${phone}`, "_self");
  };

  const handleCallDriver = (phone: string) => {
    window.open(`tel:${phone}`, "_self");
  };

  const handleRefresh = () => {
    refetch();
    customToast.success(t("common.refreshed"));
  };

  // Assignment mutation hooks
  const createAssignmentMutation = useCreateAssignment();
  const updateAssignmentMutation = useUpdateDeliveryAssignment();
  const cancelAssignmentMutation = useCancelAssignment();
  const acceptAssignmentMutation = useAcceptAssignment();
  const rejectAssignmentMutation = useRejectAssignment();

  const handleTruckAssignment = async (
    cargoId: string,
    truckId: string,
    driverId: string,
    notes?: string
  ) => {
    try {
      await createAssignmentMutation.mutateAsync({
        cargo_id: cargoId,
        driver_id: driverId,
        vehicle_id: truckId,
        notes,
      });
      customToast.success("Assignment created successfully");
      setIsTruckAssignmentModalOpen(false);
      setCargoForAssignment(null);
    } catch (error: any) {
      customToast.error(error.message || "Failed to create assignment");
    }
  };

  const handleAcceptAssignment = async (
    assignmentId: string,
    notes?: string
  ) => {
    try {
      await acceptAssignmentMutation.mutateAsync({
        assignmentId,
        data: { notes },
      });
      customToast.success("Assignment accepted");
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
    } catch (error: any) {
      customToast.error(error.message || "Failed to reject assignment");
    }
  };

  const handleCancelAssignment = async (assignmentId: string) => {
    try {
      await cancelAssignmentMutation.mutateAsync(assignmentId);
      customToast.success("Assignment cancelled");
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

  const handleStatusChange = async (cargoId: string, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: cargoId,
        status: newStatus as any,
        notes: `Status changed to ${newStatus} by admin`,
      });
      customToast.success(t("adminCargos.statusUpdated"));
      refetch();
    } catch (error) {
      customToast.error(t("errors.updateFailed"));
    }
  };

  const handleCancelCargo = async (cargoId: string) => {
    try {
      await cancelCargoMutation.mutateAsync({
        id: cargoId,
        reason: "Cancelled by admin",
      });
      customToast.success(t("adminCargos.cargoCancelled"));
      refetch();
    } catch (error) {
      customToast.error(t("errors.cancellationFailed"));
    }
  };

  // Get available status transitions for admin based on current status
  const getAvailableStatusTransitions = (currentStatus: string) => {
    const transitions: { [key: string]: string[] } = {
      pending: ["assigned", "cancelled"],
      assigned: ["picked_up", "cancelled"],
      picked_up: ["in_transit", "cancelled"],
      in_transit: ["delivered", "cancelled"],
      delivered: [], // No transitions from delivered
      cancelled: [], // No transitions from cancelled
    };
    return transitions[currentStatus] || [];
  };

  const handleTrackCargo = (cargoId: string) => {
    console.log(`Tracking cargo: ${cargoId}`);
    // Navigate to tracking page
    window.location.href = `/admin/tracking/${cargoId}`;
  };

  const handleDownloadReceipt = (cargoId: string) => {
    console.log(`Downloading receipt for: ${cargoId}`);
    // Generate and download receipt
    const cargo = cargosData.find((c) => c.id === cargoId);
    if (cargo) {
      const receiptData = {
        cargoId: cargo.id,
        client: cargo.client,
        from: cargo.from,
        to: cargo.to,
        cost: cargo.cost,
        date: new Date().toISOString(),
        type: "receipt",
      };

      const blob = new Blob([JSON.stringify(receiptData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${cargoId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleUploadPhoto = (cargoId: string) => {
    console.log(`Uploading photo for: ${cargoId}`);
    // Implement photo upload functionality
  };

  const handleReportIssue = (cargoId: string) => {
    console.log(`Reporting issue for: ${cargoId}`);
    // Navigate to issue reporting page
    window.location.href = `/admin/issues/${cargoId}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Tabs Skeleton */}
        <div className="flex gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24" />
          ))}
        </div>

        {/* Priority Filter Skeleton */}
        <div className="flex gap-4">
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Table Skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("adminCargos.title")}
            </h1>
            <p className="text-muted-foreground">{t("adminCargos.subtitle")}</p>
          </div>
        </div>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <h3 className="font-semibold text-red-800">
                  {t("common.error")}
                </h3>
                <p className="text-red-600 text-sm mt-1">
                  {error.message || t("adminCargos.loadError")}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="mt-2"
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

  return (
    <div className="space-y-6">
      {/* Main Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t("adminCargos.title")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("adminCargos.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            {t("common.refresh")}
          </Button>
          <Button onClick={handleCreateNewCargo}>
            <Plus className="h-4 w-4 mr-2" />
            {t("adminCargos.addNew")}
          </Button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              statusFilter === tab.key
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
            {statusFilter === tab.key && (
              <span className="ml-2 px-2 py-1 text-xs bg-gray-100 rounded-full">
                {currentCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search and Filters Section */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Search Input */}
        <div className="flex-1 min-w-64">
          <Input
            placeholder={t("adminCargos.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Priority:</label>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              <SelectItem value="low">{t("priority.low")}</SelectItem>
              <SelectItem value="normal">{t("priority.normal")}</SelectItem>
              <SelectItem value="high">{t("priority.high")}</SelectItem>
              <SelectItem value="urgent">{t("priority.urgent")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Client Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Client:</label>
          <Select value={clientIdFilter} onValueChange={setClientIdFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select client..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-clients">All Clients</SelectItem>
              {clientsLoading ? (
                <SelectItem value="loading-clients" disabled>
                  Loading...
                </SelectItem>
              ) : clientsError ? (
                <SelectItem value="error-clients" disabled>
                  Error loading clients
                </SelectItem>
              ) : (
                <>
                  {(clientsData as any)?.map((client: any) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.client?.company_name ||
                        client.full_name ||
                        `Client ${client.id.slice(0, 8)}`}
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Page Size */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Per Page:</label>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => setPageSize(parseInt(value))}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setStatusFilter("all");
            setPriorityFilter("all");
            setClientIdFilter("all-clients");
            setDateFromFilter("");
            setDateToFilter("");
            setSearchTerm("");
            setCurrentPage(1);
          }}
        >
          Clear
        </Button>
      </div>

      {/* Cargo Table */}
      <CargoTable
        cargos={cargos}
        title=""
        showStats={false}
        showSearch={false} // Disable internal search since we use backend search
        showFilters={false} // Disable internal filters since we use backend filters
        showPagination={false} // We handle pagination manually
        itemsPerPage={pageSize}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        onStatusChange={handleStatusChange}
        onCallClient={handleCallClient}
        onCallDriver={handleCallDriver}
        onTrackCargo={handleTrackCargo}
        onCancelCargo={handleCancelCargo}
        onDownloadReceipt={handleDownloadReceipt}
        onUploadPhoto={handleUploadPhoto}
        onReportIssue={handleReportIssue}
        onViewDetails={handleViewDetails}
      />

      {/* Compact Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} results
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={!pagination.hasPrev}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!pagination.hasPrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  const page =
                    Math.max(
                      1,
                      Math.min(pagination.totalPages - 4, pagination.page - 2)
                    ) + i;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  );
                }
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!pagination.hasNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(pagination.totalPages)}
              disabled={!pagination.hasNext}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Cargo Detail Modal */}
      <CargoDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedCargo(null);
        }}
        cargo={selectedCargo}
        onCallClient={handleCallClient}
        onCallDriver={handleCallDriver}
        onUploadPhoto={handleUploadPhoto}
        onReportIssue={handleReportIssue}
        onAcceptAssignment={handleAcceptAssignment}
        onRejectAssignment={handleRejectAssignment}
        onCancelAssignment={handleCancelAssignment}
        onChangeVehicle={handleChangeVehicle}
        onChangeDriver={handleChangeDriver}
        onCreateAssignment={handleTruckAssignment}
      />

      {/* Truck Assignment Modal using ModernModel */}
      <ModernModel
        isOpen={isTruckAssignmentModalOpen}
        onClose={() => {
          setIsTruckAssignmentModalOpen(false);
          setCargoForAssignment(null);
        }}
        title="Assign Truck & Driver"
      >
        {cargoForAssignment && (
          <div className="space-y-6">
            {/* Cargo Details */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Cargo Details</h3>
                  <Badge
                    className={
                      cargoForAssignment.priority === "urgent"
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-600"
                    }
                  >
                    {cargoForAssignment.priority?.toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Cargo ID
                    </p>
                    <p className="text-lg font-semibold">
                      {cargoForAssignment.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Client</p>
                    <p className="text-lg">{cargoForAssignment.client}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Route</p>
                    <p className="text-lg">
                      {cargoForAssignment.from} → {cargoForAssignment.to}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Weight & Type
                    </p>
                    <p className="text-lg">
                      {cargoForAssignment.weight} • {cargoForAssignment.type}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Distance
                    </p>
                    <p className="text-lg">{cargoForAssignment.distance}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Cost</p>
                    <p className="text-lg font-semibold text-green-600">
                      {new Intl.NumberFormat("rw-RW", {
                        style: "currency",
                        currency: "RWF",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(cargoForAssignment.cost || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assignment Form */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Assignment Details
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Select Truck
                    </label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Choose a truck..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="truck-1">
                          Ford F-650 (ABC-123)
                        </SelectItem>
                        <SelectItem value="truck-2">
                          Chevrolet Silverado (XYZ-789)
                        </SelectItem>
                        <SelectItem value="truck-3">
                          Dodge Ram (DEF-456)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Select Driver
                    </label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Choose a driver..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="driver-1">
                          Albert Flores (4.8★)
                        </SelectItem>
                        <SelectItem value="driver-2">
                          Mike Johnson (4.6★)
                        </SelectItem>
                        <SelectItem value="driver-3">
                          Sarah Wilson (4.9★)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Assignment Notes (Optional)
                    </label>
                    <textarea
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Add any special instructions or notes for the driver..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsTruckAssignmentModalOpen(false);
                  setCargoForAssignment(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() =>
                  handleTruckAssignment(
                    cargoForAssignment.id,
                    "truck-1",
                    "driver-1"
                  )
                }
              >
                <Truck className="h-4 w-4 mr-2" />
                Assign Truck & Driver
              </Button>
            </div>
          </div>
        )}
      </ModernModel>
    </div>
  );
}
