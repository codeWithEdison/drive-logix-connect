import { useEffect, useState } from "react";
import { CargoTable } from "@/components/ui/CargoTable";
import { CargoDetail } from "@/components/ui/CargoDetailModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  RefreshCw,
  AlertCircle,
  Package,
  CheckCircle,
  Clock,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useClientCargos, useCancelCargo } from "@/lib/api/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Rwanda locations data

const MyCargos = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // API hooks
  const {
    data: cargosData,
    isLoading,
    error,
    refetch,
  } = useClientCargos({
    status: statusFilter === "all" ? undefined : (statusFilter as any),
    priority: priorityFilter === "all" ? undefined : (priorityFilter as any),
    search: searchTerm || undefined,
    page: currentPage,
    limit: pageSize,
  });
  const cancelCargoMutation = useCancelCargo();

  // Add useEffect to track data changes
  useEffect(() => {
    console.log("🔄 useEffect - cargosData changed:", cargosData);
    console.log("🔄 useEffect - isLoading:", isLoading);
    console.log("🔄 useEffect - error:", error);
  }, [cargosData, isLoading, error]);

  const handleCallDriver = (phone: string) => {
    console.log("Calling driver:", phone);
    // Add logic to call driver
    window.open(`tel:${phone}`, "_self");
  };

  const handleTrackCargo = (cargoId: string) => {
    console.log("Tracking cargo:", cargoId);
    navigate(`/tracking/${cargoId}`);
  };

  const handleCancelCargo = async (cargoId: string) => {
    try {
      await cancelCargoMutation.mutateAsync({
        id: cargoId,
        reason: t("myCargos.cancelReason"),
      });
      toast.success(t("myCargos.cancelSuccess"));
      refetch();
    } catch (error) {
      console.error("Error cancelling cargo:", error);
      toast.error(t("myCargos.cancelError"));
    }
  };

  const handleDownloadReceipt = (cargoId: string) => {
    console.log("Downloading receipt for cargo:", cargoId);
    // Add logic to download receipt
    toast.info(t("myCargos.downloadReceipt"));
  };

  const handleUploadPhoto = (cargoId: string) => {
    console.log("Uploading photo for cargo:", cargoId);
    // Add logic to upload photo
    toast.info(t("myCargos.uploadPhoto"));
  };

  const handleReportIssue = (cargoId: string) => {
    console.log("Reporting issue for cargo:", cargoId);
    // Add logic to report issue
    toast.info(t("myCargos.reportIssue"));
  };

  const handleCreateNewCargo = () => {
    navigate("/create-cargo");
  };

  const handleRefresh = () => {
    refetch();
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: string) => {
    setPageSize(parseInt(size));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Reset pagination when filters change
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handlePriorityFilterChange = (priority: string) => {
    setPriorityFilter(priority);
    setCurrentPage(1);
  };

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
    setCurrentPage(1);
  };

  // Navigation handlers for stats cards
  const handleTotalCargosClick = () => {
    setStatusFilter("all");
    setPriorityFilter("all");
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleInTransitClick = () => {
    setStatusFilter("in_transit");
    setCurrentPage(1);
  };

  const handleDeliveredClick = () => {
    setStatusFilter("delivered");
    setCurrentPage(1);
  };

  const handlePendingClick = () => {
    setStatusFilter("pending");
    setCurrentPage(1);
  };

  // Header component
  const renderHeader = () => (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t("myCargos.title")}
          </h1>
          <p className="text-muted-foreground mt-2">{t("myCargos.subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            {t("common.refresh")}
          </Button>
          <Button
            className="bg-gradient-primary hover:bg-primary-hover"
            onClick={handleCreateNewCargo}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("myCargos.createNewCargo")}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {!isLoading &&
        !error &&
        transformedCargos &&
        transformedCargos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              className="bg-white rounded-lg border p-4 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300"
              onClick={handleTotalCargosClick}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Cargos
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pagination?.total || 0}
                  </p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div
              className="bg-white rounded-lg border p-4 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300"
              onClick={handleInTransitClick}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    In Transit
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {
                      transformedCargos.filter(
                        (c) =>
                          c.status === "in_transit" || c.status === "picked_up"
                      ).length
                    }
                  </p>
                </div>
                <RefreshCw className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div
              className="bg-white rounded-lg border p-4 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300"
              onClick={handleDeliveredClick}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {
                      transformedCargos.filter((c) => c.status === "delivered")
                        .length
                    }
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div
              className="bg-white rounded-lg border p-4 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300"
              onClick={handlePendingClick}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {
                      transformedCargos.filter((c) =>
                        ["pending", "quoted", "accepted", "assigned"].includes(
                          c.status
                        )
                      ).length
                    }
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
          </div>
        )}

      {/* Filters Section */}
      {!isLoading &&
        !error &&
        transformedCargos &&
        transformedCargos.length > 0 && (
          <div className="bg-white rounded-lg border p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by client, location, cargo number, or type..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex gap-2">
                <Select
                  value={statusFilter}
                  onValueChange={handleStatusFilterChange}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="quoted">Quoted</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="picked_up">Picked Up</SelectItem>
                    <SelectItem value="in_transit">In Transit</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                {/* Priority Filter */}
                <Select
                  value={priorityFilter}
                  onValueChange={handlePriorityFilterChange}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filter Results Summary */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {hasActiveFilters
                  ? `Filtered results (${pagination?.total || 0} total cargos)`
                  : `Showing ${pagination?.total || 0} cargos`}
              </div>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTotalCargosClick}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        )}
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header with loading skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-12" />
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        {renderHeader()}

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <h3 className="font-semibold text-red-800">
                {t("common.error")}
              </h3>
              <p className="text-red-600 text-sm mt-1">
                {error.message || t("myCargos.loadError")}
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
        </div>
      </div>
    );
  }

  // Extract cargos and pagination data
  const actualCargos = cargosData?.cargos || [];
  const pagination = cargosData?.pagination || null;

  // Debug logging to understand the data structure
  console.log("🔍 MyCargos - cargosData:", cargosData);
  console.log("🔍 MyCargos - actualCargos:", actualCargos);
  console.log("🔍 MyCargos - pagination:", pagination);

  // Transform API data to CargoDetail format
  const transformedCargos: CargoDetail[] =
    (Array.isArray(actualCargos) ? actualCargos : []).map((cargo) => {
      // Map API status to CargoDetail status format
      // Keep original API status values for proper display
      const mappedStatus = cargo.status as CargoDetail["status"];

      return {
        id: cargo.id,
        cargo_number: cargo.cargo_number, // Add cargo number
        status: mappedStatus,
        from: cargo.pickup_address || "Unknown Location",
        to: cargo.destination_address || "Unknown Location",
        client:
          (cargo as any).client?.user?.full_name ||
          (cargo as any).client?.contact_person ||
          "Unknown Client",
        driver:
          (cargo as any).delivery_assignment?.driver?.user?.full_name ||
          (cargo.status === "assigned" ||
          cargo.status === "picked_up" ||
          cargo.status === "in_transit" ||
          cargo.status === "delivered"
            ? t("myCargos.driverAssigned")
            : t("myCargos.noDriverAssigned")),
        phone:
          (cargo as any).delivery_assignment?.driver?.emergency_phone || "",
        estimatedTime: cargo.delivery_date
          ? new Date(cargo.delivery_date).toLocaleDateString()
          : t("myCargos.estimatedTime"),
        weight: `${cargo.weight_kg || 0} kg`,
        type: cargo.type || t("myCargos.unknownType"),
        priority: cargo.priority || "normal", // Add priority
        createdDate: cargo.created_at?.split("T")[0] || "",
        cost: parseFloat(
          String(cargo.estimated_cost || cargo.final_cost || "0")
        ),
        pickupDate: cargo.pickup_date ? cargo.pickup_date.split("T")[0] : "",
        deliveryDate: cargo.delivery_date
          ? cargo.delivery_date.split("T")[0]
          : "",
        description: cargo.special_requirements || "",
        specialInstructions: cargo.special_requirements || "",
        vehicleType: (cargo as any).delivery_assignment?.vehicle
          ? `${(cargo as any).delivery_assignment.vehicle.make} ${
              (cargo as any).delivery_assignment.vehicle.model
            }`
          : t("myCargos.unknownVehicle"),
        distance: cargo.distance_km ? `${cargo.distance_km} km` : "Unknown",
        pickupContact: cargo.pickup_contact || "",
        pickupContactPhone: cargo.pickup_phone || "",
        deliveryContact: cargo.destination_contact || "",
        deliveryContactPhone: cargo.destination_phone || "",
        // Enhanced fields for better data display
        clientPhone:
          (cargo as any).client?.user?.phone || cargo.pickup_phone || "",
        clientCompany: (cargo as any).client?.company_name || "",
        clientContactPerson: (cargo as any).client?.contact_person || "",
        driverName:
          (cargo as any).delivery_assignment?.driver?.user?.full_name || "",
        driverPhone:
          (cargo as any).delivery_assignment?.driver?.emergency_phone || "",
        driverRating: (cargo as any).delivery_assignment?.driver?.rating || "",
        driverLicense:
          (cargo as any).delivery_assignment?.driver?.license_number || "",
        vehiclePlate:
          (cargo as any).delivery_assignment?.vehicle?.plate_number || "",
        vehicleMake: (cargo as any).delivery_assignment?.vehicle?.make || "",
        vehicleModel: (cargo as any).delivery_assignment?.vehicle?.model || "",
      };
    }) || [];

  // Use transformed cargos directly since API handles filtering
  const filteredCargos = transformedCargos;

  // Check if we have any filters applied
  const hasActiveFilters =
    statusFilter !== "all" || priorityFilter !== "all" || searchTerm !== "";

  // Show a message if no data is available
  if (
    !isLoading &&
    !error &&
    (!actualCargos || !Array.isArray(actualCargos) || actualCargos.length === 0)
  ) {
    return (
      <div className="space-y-6">
        {renderHeader()}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <Package className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            {hasActiveFilters
              ? "No cargos match your filters"
              : t("myCargos.noCargos")}
          </h3>
          <p className="text-blue-600 mb-4">
            {hasActiveFilters
              ? "Try adjusting your search terms or filters to find what you're looking for."
              : t("myCargos.noCargosDescription")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={handleTotalCargosClick}
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Clear All Filters
              </Button>
            )}
            <Button
              className="bg-gradient-primary hover:bg-primary-hover"
              onClick={handleCreateNewCargo}
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("myCargos.createNewCargo")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderHeader()}

      <CargoTable
        cargos={filteredCargos}
        showStats={false} // Hide stats since we have them in header
        showSearch={false} // Hide search since we have it in header
        showFilters={false} // Hide filters since we have them in header
        showPagination={false} // Disable internal pagination - we handle it externally
        onCallDriver={handleCallDriver}
        onTrackCargo={handleTrackCargo}
        onCancelCargo={handleCancelCargo}
        onDownloadReceipt={handleDownloadReceipt}
        onUploadPhoto={handleUploadPhoto}
        onReportIssue={handleReportIssue}
      />

      {/* Pagination Controls */}
      {pagination && (
        <div className="bg-white rounded-lg border p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show per page:</span>
              <Select
                value={pageSize.toString()}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pagination Info */}
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * pageSize + 1} -{" "}
              {Math.min(currentPage * pageSize, pagination.total || 0)} of{" "}
              {pagination.total || 0} results
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.min(5, pagination.totalPages || 1) },
                  (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  }
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= (pagination.totalPages || 1)}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCargos;
