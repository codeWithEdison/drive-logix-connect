import { useEffect } from "react";
import { CargoTable } from "@/components/ui/CargoTable";
import { CargoDetail } from "@/components/ui/CargoDetailModal";
import { Button } from "@/components/ui/button";
import {
  Plus,
  RefreshCw,
  AlertCircle,
  Package,
  CheckCircle,
  Clock,
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

  // API hooks
  const { data: cargosData, isLoading, error, refetch } = useClientCargos();
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
      {!isLoading && !error && actualCargos && actualCargos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Cargos
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {actualCargos.length}
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Transit</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    actualCargos.filter(
                      (c) =>
                        c.status === "in_transit" || c.status === "picked_up"
                    ).length
                  }
                </p>
              </div>
              <RefreshCw className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">
                  {actualCargos.filter((c) => c.status === "delivered").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    actualCargos.filter((c) =>
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

  // Debug: Let's see exactly what we're getting
  console.log("🔍 DEBUGGING MyCargos - NEW VERSION:");
  console.log("📊 cargosData:", cargosData);
  console.log("📊 Array.isArray(cargosData):", Array.isArray(cargosData));
  console.log("📊 cargosData?.length:", (cargosData as any[])?.length);
  console.log("📊 isLoading:", isLoading);
  console.log("📊 error:", error);

  // The hook should now return the data array directly
  const actualCargos = (cargosData as any[]) || [];
  console.log("📊 actualCargos:", actualCargos);
  console.log("📊 actualCargos.length:", actualCargos.length);
  console.log("📊 First cargo:", actualCargos[0]);

  // Transform API data to CargoDetail format
  const transformedCargos: CargoDetail[] =
    actualCargos.map((cargo) => {
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
          cargo.client?.user?.full_name ||
          cargo.client?.contact_person ||
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
        clientPhone: cargo.client?.user?.phone || cargo.pickup_phone || "",
        clientCompany: cargo.client?.company_name || "",
        clientContactPerson: cargo.client?.contact_person || "",
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

  // Show a message if no data is available
  if (
    !isLoading &&
    !error &&
    (!actualCargos || (actualCargos as any[]).length === 0)
  ) {
    return (
      <div className="space-y-6">
        {renderHeader()}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <Package className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            {t("myCargos.noCargos")}
          </h3>
          <p className="text-blue-600 mb-4">
            {t("myCargos.noCargosDescription")}
          </p>
          <Button
            className="bg-gradient-primary hover:bg-primary-hover"
            onClick={handleCreateNewCargo}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("myCargos.createNewCargo")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderHeader()}

      <CargoTable
        cargos={transformedCargos}
        showStats={false} // Hide stats since we have them in header
        onCallDriver={handleCallDriver}
        onTrackCargo={handleTrackCargo}
        onCancelCargo={handleCancelCargo}
        onDownloadReceipt={handleDownloadReceipt}
        onUploadPhoto={handleUploadPhoto}
        onReportIssue={handleReportIssue}
      />
    </div>
  );
};

export default MyCargos;
