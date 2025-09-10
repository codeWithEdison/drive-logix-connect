import { CargoTable } from "@/components/ui/CargoTable";
import { CargoDetail } from "@/components/ui/CargoDetailModal";
import { useDriverAssignments } from "@/lib/api/hooks";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { customToast } from "@/lib/utils/toast";
import { mapDeliveryAssignmentsToCargoDetails } from "@/lib/utils/cargoMapper";
import { RefreshCw, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

export function AssignedCargosPage() {
  const { t } = useLanguage();
  const { user } = useAuth();

  // API hooks - Using DriverService.getAssignments for driver assignments
  const {
    data: assignmentsData,
    isLoading,
    error,
    refetch,
  } = useDriverAssignments({limit: 50 });

  const handleAcceptCargo = async (cargoId: string) => {
    try {
      // TODO: Implement accept cargo API call
      console.log("Accepting cargo:", cargoId);
      customToast.success(
        t("common.accept") +
          " " +
          t("cargo.cargoDetails") +
          " " +
          t("common.success")
      );
    } catch (error) {
      customToast.error(t("errors.serverError"));
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

  // Transform API data to CargoDetail format
  const transformedCargos: CargoDetail[] = mapDeliveryAssignmentsToCargoDetails(
    assignmentsData || []
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
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
              {t("navigation.assignedCargos")}
            </h1>
            <p className="text-muted-foreground">
              {t("navigation.assignedCargos")} {t("dashboard.subtitle")}
            </p>
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
                  {error.message || t("dashboard.loadError")}
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

  // No data state
  if (!transformedCargos || transformedCargos.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("navigation.assignedCargos")}
            </h1>
            <p className="text-muted-foreground">
              {t("navigation.assignedCargos")} {t("dashboard.subtitle")}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            {t("common.refresh")}
          </Button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <Package className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            {t("navigation.assignedCargos")}
          </h3>
          <p className="text-blue-600 mb-4">
            {t("myCargos.noCargosDescription")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t("navigation.assignedCargos")}
          </h1>
          <p className="text-muted-foreground">
            {t("navigation.assignedCargos")} {t("dashboard.subtitle")}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          {t("common.refresh")}
        </Button>
      </div>

      <CargoTable
        cargos={transformedCargos}
        title={t("navigation.assignedCargos")}
        onAcceptCargo={handleAcceptCargo}
        onStartDelivery={handleStartDelivery}
        onCallClient={handleCallClient}
        onUploadPhoto={handleUploadPhoto}
        onReportIssue={handleReportIssue}
      />
    </div>
  );
}
