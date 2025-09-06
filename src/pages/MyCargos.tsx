import { CargoTable } from "@/components/ui/CargoTable";
import { CargoDetail } from "@/components/ui/CargoDetailModal";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, AlertCircle } from "lucide-react";
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

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
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
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">
            {t("myCargos.title")}
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
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

  // Transform API data to CargoDetail format
  const transformedCargos: CargoDetail[] =
    cargosData?.data?.map((cargo) => ({
      id: cargo.id,
      status: cargo.status.toLowerCase() as
        | "active"
        | "pending"
        | "completed"
        | "transit"
        | "delivered"
        | "cancelled",
      from: cargo.pickup_address || "",
      to: cargo.destination_address || "",
      driver:
        cargo.status === "assigned"
          ? t("myCargos.driverAssigned")
          : t("myCargos.noDriverAssigned"),
      phone: "", // Driver phone would need to be fetched separately
      estimatedTime: cargo.delivery_date || t("myCargos.estimatedTime"),
      weight: `${cargo.weight_kg} kg`,
      type: cargo.type || t("myCargos.unknownType"),
      createdDate: cargo.created_at?.split("T")[0] || "",
      cost: cargo.estimated_cost || 0,
      pickupDate: cargo.pickup_date || "",
      deliveryDate: cargo.delivery_date || "",
      description: cargo.special_requirements || "",
      specialInstructions: cargo.special_requirements || "",
      vehicleType: t("myCargos.unknownVehicle"),
      distance: cargo.distance_km ? `${cargo.distance_km} km` : "",
      pickupContact: cargo.pickup_contact || "",
      pickupContactPhone: cargo.pickup_phone || "",
      deliveryContact: cargo.destination_contact || "",
      deliveryContactPhone: cargo.destination_phone || "",
    })) || [];

  return (
    <CargoTable
      cargos={transformedCargos}
      title={t("myCargos.title")}
      customActions={
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
      }
      onCallDriver={handleCallDriver}
      onTrackCargo={handleTrackCargo}
      onCancelCargo={handleCancelCargo}
      onDownloadReceipt={handleDownloadReceipt}
      onUploadPhoto={handleUploadPhoto}
      onReportIssue={handleReportIssue}
    />
  );
};

export default MyCargos;
