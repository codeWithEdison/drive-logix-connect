import React, { useState, useEffect } from "react";
import { CustomTabs } from "@/components/ui/CustomTabs";
import { DeliveryCard } from "@/components/ui/DeliveryCard";
import { DeliveryDetailModal } from "@/components/ui/DeliveryDetailModal";
import { DeliveryTable, Delivery } from "@/components/ui/DeliveryTable";
import { CargoTable } from "@/components/ui/CargoTable";
import {
  CargoDetail,
  CargoDetailModal,
} from "@/components/ui/CargoDetailModal";
import { ContactDropdown } from "@/components/ui/ContactDropdown";
import { PhotoUploadModal } from "@/components/ui/PhotoUploadModal";
import { SignatureCapture } from "@/components/ui/SignatureCapture";
import ModernModel from "@/components/modal/ModernModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useDriverCargos, useCargoById } from "@/lib/api/hooks";
import { useUpdateDeliveryStatus } from "@/lib/api/hooks/deliveryHooks";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { customToast } from "@/lib/utils/toast";
import { UserRole } from "@/types/shared";
import {
  mapCargosToCargoDetails,
  mapCargoToCargoDetail,
} from "@/lib/utils/cargoMapper";
import gpsTrackingService, {
  LocationData,
} from "@/services/GpsTrackingService";
import {
  MapPin,
  Navigation,
  Camera,
  Upload,
  PenTool,
  AlertCircle,
  CheckCircle,
  Phone,
  Truck,
  Clock,
  RefreshCw,
  Eye,
} from "lucide-react";

export default function DriverDeliveries() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("active");
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(
    null
  );
  const [selectedCargoId, setSelectedCargoId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCargoModalOpen, setIsCargoModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [photoUploadType, setPhotoUploadType] = useState<
    "loading" | "delivery" | "receipt" | "signature"
  >("loading");
  const [isGpsTracking, setIsGpsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(
    null
  );
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const { toast } = useToast();

  // API hooks - Using CargoService.getDriverCargos for driver deliveries
  const {
    data: allCargosData,
    isLoading: isLoadingActive,
    error: activeError,
    refetch: refetchActive,
  } = useDriverCargos({ limit: 50 });

  // Fetch full cargo details when a cargo is selected
  const {
    data: selectedCargo,
    isLoading: isLoadingCargo,
    error: cargoError,
  } = useCargoById(selectedCargoId || "");

  // Debug logging for selected cargo
  console.log("🔍 selectedCargoId:", selectedCargoId);
  console.log("🔍 selectedCargo:", selectedCargo);
  console.log("🔍 isCargoModalOpen:", isCargoModalOpen);

  // Debug logging for API response
  console.log("🔍 DriverDeliveries - API Response:", allCargosData);
  console.log("🔍 DriverDeliveries - isLoading:", isLoadingActive);
  console.log("🔍 DriverDeliveries - error:", activeError);
  console.log("🔍 DriverDeliveries - allCargosData:", allCargosData);
  console.log(
    "🔍 DriverDeliveries - Array.isArray(allCargosData):",
    Array.isArray(allCargosData)
  );
  console.log(
    "🔍 DriverDeliveries - allCargosData length:",
    Array.isArray(allCargosData) ? allCargosData.length : 0
  );

  // Transform API data to Delivery format
  // Note: useDriverCargos already extracts data.data, so allCargosData is the array directly
  const allCargos = (allCargosData as unknown as any[]) || [];

  // Helper function to map priority values
  const mapPriority = (priority: string): "urgent" | "normal" | "standard" => {
    switch (priority) {
      case "high":
      case "urgent":
        return "urgent";
      case "low":
        return "normal";
      case "normal":
      default:
        return "normal";
    }
  };

  // Filter active deliveries (not delivered status)
  const activeCargos = allCargos.filter(
    (cargo: any) => cargo.status !== "delivered"
  );

  // Filter completed deliveries (delivered status)
  const completedCargos = allCargos.filter(
    (cargo: any) => cargo.status === "delivered"
  );

  console.log("🔍 DriverDeliveries - allCargos:", allCargos);
  console.log("🔍 DriverDeliveries - allCargos length:", allCargos.length);
  console.log("🔍 DriverDeliveries - Sample cargo structure:", allCargos[0]);

  console.log("🔍 DriverDeliveries - activeCargos:", activeCargos);
  console.log(
    "🔍 DriverDeliveries - activeCargos length:",
    activeCargos.length
  );
  console.log("🔍 DriverDeliveries - completedCargos:", completedCargos);
  console.log(
    "🔍 DriverDeliveries - completedCargos length:",
    completedCargos.length
  );

  // Transform API data to CargoDetail format
  const activeCargoDetails: CargoDetail[] =
    mapCargosToCargoDetails(activeCargos);
  const completedCargoDetails: CargoDetail[] =
    mapCargosToCargoDetails(completedCargos);

  console.log("🔍 DriverDeliveries - activeCargoDetails:", activeCargoDetails);
  console.log(
    "🔍 DriverDeliveries - activeCargoDetails length:",
    activeCargoDetails.length
  );
  console.log(
    "🔍 DriverDeliveries - completedCargoDetails:",
    completedCargoDetails
  );
  console.log(
    "🔍 DriverDeliveries - completedCargoDetails length:",
    completedCargoDetails.length
  );

  // GPS Tracking setup
  useEffect(() => {
    const initializeGps = async () => {
      try {
        const hasPermission = await gpsTrackingService.requestPermission();
        if (hasPermission) {
          const location = await gpsTrackingService.getCurrentPosition();
          setCurrentLocation(location);
        }
      } catch (error) {
        console.error("GPS initialization failed:", error);
      }
    };

    initializeGps();
  }, []);

  const handleViewDetails = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setIsDetailModalOpen(true);
  };

  // Handle opening cargo detail modal
  const handleOpenCargoModal = (cargo: CargoDetail) => {
    console.log("🔍 Opening cargo modal for:", cargo.id, cargo);
    console.log("🔍 Modal state before:", {
      isCargoModalOpen,
      selectedCargoId,
    });
    setSelectedCargoId(cargo.id);
    setIsCargoModalOpen(true);
    console.log("🔍 Modal state after:", {
      isCargoModalOpen: true,
      selectedCargoId: cargo.id,
    });
  };

  // Handle closing cargo detail modal
  const handleCloseCargoModal = () => {
    setIsCargoModalOpen(false);
    setSelectedCargoId(null);
  };

  // API hook for updating delivery status
  const updateDeliveryStatus = useUpdateDeliveryStatus();

  const handleStartDelivery = async (cargoId: string) => {
    try {
      console.log("Starting transit for cargo:", cargoId);

      // Get current GPS location
      let locationData = null;
      if (currentLocation) {
        locationData = {
          location_latitude: currentLocation.latitude,
          location_longitude: currentLocation.longitude,
        };
      } else {
        // Try to get current location if not available
        try {
          const location = await gpsTrackingService.getCurrentPosition();
          locationData = {
            location_latitude: location.latitude,
            location_longitude: location.longitude,
          };
        } catch (locationError) {
          console.warn("Could not get GPS location:", locationError);
          // Continue without location data
        }
      }

      // Call the API to update delivery status to "in_transit"
      await updateDeliveryStatus.mutateAsync({
        cargoId,
        data: {
          status: "in_transit",
          ...locationData,
          notes: "Cargo is now in transit",
        },
      });

      customToast.success(
        t("delivery.transitStarted") || "Transit started successfully"
      );
    } catch (error: any) {
      console.error("Failed to start transit:", error);

      // Show user-friendly error message
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to start transit";

      customToast.error(errorMessage);
    }
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

  const handleCallClient = (phone: string) => {
    window.open(`tel:${phone}`, "_self");
  };

  const handleNavigate = async (delivery: Delivery) => {
    try {
      // Start GPS tracking
      await gpsTrackingService.startTracking({
        onLocationUpdate: (location) => {
          setCurrentLocation(location);
          // Share location with admin system
          gpsTrackingService.shareLocationWithAdmin(
            location,
            user?.id || "driver-123",
            delivery.id
          );
        },
        onError: (error) => {
          console.error("GPS tracking error:", error);
          customToast.error(t("errors.gpsError"));
        },
      });

      setIsGpsTracking(true);
      customToast.success(t("driver.navigationStarted"));

      // Open navigation in maps app
      const destination = encodeURIComponent(delivery.to);
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${destination}`,
        "_blank"
      );
    } catch (error) {
      console.error("Navigation failed:", error);
      customToast.error(t("errors.navigationFailed"));
    }
  };

  const handlePhotoUpload = (
    type: "loading" | "delivery" | "receipt" | "signature"
  ) => {
    setPhotoUploadType(type);
    setIsPhotoModalOpen(true);
  };

  const handleSignatureCapture = () => {
    setIsSignatureModalOpen(true);
  };

  const handlePhotoUploadSubmit = async (data: {
    photos: File[];
    notes: string;
    type: string;
    cargoId: string;
  }) => {
    try {
      // Simulate upload
      console.log("Uploading photos:", data);

      // Here you would typically upload to your backend
      // const formData = new FormData();
      // data.photos.forEach(photo => formData.append('photos', photo));
      // formData.append('notes', data.notes);
      // formData.append('type', data.type);
      // formData.append('cargoId', data.cargoId);

      customToast.success(
        t("driver.photosUploaded", {
          count: data.photos.length,
          type: data.type,
        })
      );
      setIsPhotoModalOpen(false);
    } catch (error) {
      console.error("Photo upload failed:", error);
      customToast.error(t("errors.uploadFailed"));
    }
  };

  const handleSignatureSave = async (
    signature: string,
    customerName: string,
    notes: string
  ) => {
    try {
      // Simulate signature save
      console.log("Saving signature:", { signature, customerName, notes });

      customToast.success(t("driver.signatureCaptured", { customerName }));
      setIsSignatureModalOpen(false);
    } catch (error) {
      console.error("Signature save failed:", error);
      customToast.error(t("errors.signatureFailed"));
    }
  };

  const handleMarkDelivered = async (delivery: Delivery) => {
    try {
      // Simulate delivery completion
      console.log("Marking delivery as completed:", delivery.id);

      customToast.success(
        t("driver.deliveryCompleted", { deliveryId: delivery.id })
      );
      // Refresh the data after completion
      refetchActive();
    } catch (error) {
      console.error("Delivery completion failed:", error);
      customToast.error(t("errors.completionFailed"));
    }
  };

  const handleRefresh = () => {
    refetchActive();
  };

  const tabs = [
    {
      value: "active",
      label: t("navigation.activeDeliveries"),
      count: activeCargoDetails.length,
    },
    {
      value: "completed",
      label: t("status.completed"),
      count: completedCargoDetails.length,
    },
  ];

  const currentCargos =
    activeTab === "active" ? activeCargoDetails : completedCargoDetails;
  const isLoading = isLoadingActive;
  const error = activeError;

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
              {t("navigation.myDeliveries")}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {t("driver.manageDeliveries")}
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {t("navigation.myDeliveries")}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {t("driver.manageDeliveries")}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t("common.refresh")}
          </Button>
          {isGpsTracking && (
            <Badge className="bg-green-100 text-green-800 animate-pulse">
              <Navigation className="h-3 w-3 mr-1" />
              {t("driver.gpsActive")}
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 border-2 hover:shadow-lg transition-all duration-300 rounded-xl sm:rounded-2xl overflow-hidden group">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="space-y-1 sm:space-y-2">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                  Total Deliveries
                </p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  {activeCargoDetails.length + completedCargoDetails.length}
                </p>
                <p className="text-xs text-gray-500 hidden sm:block">
                  All deliveries
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/50 group-hover:scale-110 transition-transform duration-300 self-start sm:self-auto">
                <Truck className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 border-2 hover:shadow-lg transition-all duration-300 rounded-xl sm:rounded-2xl overflow-hidden group">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="space-y-1 sm:space-y-2">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                  Active
                </p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  {activeCargoDetails.length}
                </p>
                <p className="text-xs text-gray-500 hidden sm:block">
                  In progress
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/50 group-hover:scale-110 transition-transform duration-300 self-start sm:self-auto">
                <Navigation className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 border-2 hover:shadow-lg transition-all duration-300 rounded-xl sm:rounded-2xl overflow-hidden group">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="space-y-1 sm:space-y-2">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                  Completed
                </p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  {completedCargoDetails.length}
                </p>
                <p className="text-xs text-gray-500 hidden sm:block">
                  Successfully delivered
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/50 group-hover:scale-110 transition-transform duration-300 self-start sm:self-auto">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 border-2 hover:shadow-lg transition-all duration-300 rounded-xl sm:rounded-2xl overflow-hidden group">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="space-y-1 sm:space-y-2">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                  GPS Status
                </p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  {isGpsTracking ? "ON" : "OFF"}
                </p>
                <p className="text-xs text-gray-500 hidden sm:block">
                  {isGpsTracking ? "Tracking active" : "Not tracking"}
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/50 group-hover:scale-110 transition-transform duration-300 self-start sm:self-auto">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom Tabs */}
      <CustomTabs value={activeTab} onValueChange={setActiveTab} tabs={tabs} />

      {/* Delivery Table for Large Screens */}
      <div className="hidden lg:block">
        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl sm:rounded-2xl overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-gray-900">
              {activeTab === "active"
                ? t("navigation.activeDeliveries")
                : t("status.completed") + " " + t("navigation.deliveries")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <CargoTable
              cargos={currentCargos}
              title=""
              showStats={false}
              showSearch={true}
              showFilters={true}
              showPagination={true}
              itemsPerPage={5}
              onViewDetails={handleOpenCargoModal}
              onStartDelivery={handleStartDelivery}
              onCallClient={handleCallClient}
              onUploadPhoto={handleUploadPhoto}
              onReportIssue={handleReportIssue}
              getCustomActions={(cargo) => {
                const actions = [
                  {
                    key: "view-details",
                    label: "View Details",
                    icon: <Eye className="h-3 w-3 mr-1" />,
                    onClick: () => handleOpenCargoModal(cargo),
                    variant: "outline" as const,
                  },
                ];

                // Add other actions based on cargo status for drivers
                if (cargo.status === "assigned") {
                  actions.push({
                    key: "start-delivery",
                    label: "Start Delivery",
                    icon: <Navigation className="h-3 w-3 mr-1" />,
                    onClick: () => handleStartDelivery(cargo.id),
                    variant: "outline" as const,
                  });
                }

                if (cargo.clientPhone || cargo.phone) {
                  actions.push({
                    key: "call-client",
                    label: "Call Client",
                    icon: <Phone className="h-3 w-3 mr-1" />,
                    onClick: () =>
                      handleCallClient(cargo.clientPhone || cargo.phone),
                    variant: "outline" as const,
                  });
                }

                return actions;
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Mobile Cards View */}
      <div className="lg:hidden">
        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl sm:rounded-2xl overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-gray-900">
              {activeTab === "active"
                ? t("navigation.activeDeliveries")
                : t("status.completed") + " " + t("navigation.deliveries")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {currentCargos.map((cargo) => (
                <div
                  key={cargo.id}
                  className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {cargo.cargo_number || cargo.id}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {typeof cargo.client === "string"
                          ? cargo.client
                          : (cargo.client as any)?.user?.full_name ||
                            (cargo.client as any)?.company_name ||
                            "Unknown Client"}
                      </p>
                      <div className="text-sm text-gray-700">
                        <p className="font-medium">{cargo.from}</p>
                        <p className="text-gray-500">→</p>
                        <p className="font-medium">{cargo.to}</p>
                      </div>
                    </div>
                    <Badge
                      className={`ml-2 ${
                        cargo.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {cargo.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleOpenCargoModal(cargo)}
                    >
                      View Details
                    </Button>
                    {activeTab === "active" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartDelivery(cargo.id)}
                      >
                        Start Delivery
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {currentCargos.length === 0 && (
        <Card className="bg-blue-50 border-blue-200 shadow-lg rounded-xl sm:rounded-2xl overflow-hidden">
          <CardContent className="p-6 sm:p-8 text-center">
            <Truck className="h-12 w-12 sm:h-16 sm:w-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-blue-800 mb-2">
              {t("driver.noDeliveries", {
                type:
                  activeTab === "active"
                    ? t("status.active")
                    : t("status.completed"),
              })}
            </h3>
            <p className="text-blue-600 text-sm sm:text-base mb-4">
              {activeTab === "active"
                ? t("driver.noActiveDeliveries")
                : t("driver.noCompletedDeliveries")}
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
      )}

      {/* Cargo Detail Modal */}
      <CargoDetailModal
        isOpen={isCargoModalOpen}
        onClose={handleCloseCargoModal}
        cargo={selectedCargo ? mapCargoToCargoDetail(selectedCargo) : null}
        userRole={user?.role || UserRole.DRIVER}
        onStartDelivery={handleStartDelivery}
        onCallClient={handleCallClient}
        onUploadPhoto={handleUploadPhoto}
        onReportIssue={handleReportIssue}
        isStartingDelivery={updateDeliveryStatus.isPending}
      />

      {/* Debug info */}
      {/* {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 right-4 bg-black text-white p-2 text-xs rounded">
          <div>Modal Open: {isCargoModalOpen ? "Yes" : "No"}</div>
          <div>Selected ID: {selectedCargoId || "None"}</div>
          <div>Cargo Data: {selectedCargo ? "Loaded" : "Loading..."}</div>
        </div>
      )} */}

      {/* Photo Upload Modal */}
      <PhotoUploadModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        cargoId={selectedDelivery?.id || ""}
        uploadType={photoUploadType}
        onUpload={handlePhotoUploadSubmit}
      />

      {/* Signature Capture Modal */}
      <ModernModel
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        title={t("driver.captureSignature")}
      >
        <SignatureCapture
          cargoId={selectedDelivery?.id || ""}
          customerName={selectedDelivery?.client || ""}
          onSave={handleSignatureSave}
          onCancel={() => setIsSignatureModalOpen(false)}
        />
      </ModernModel>

      {/* Contact Dropdown */}
      {showContactDropdown && selectedDelivery && (
        <ContactDropdown
          contacts={[
            {
              id: "1",
              name: selectedDelivery.pickupContact || "",
              phone: selectedDelivery.pickupContactPhone || "",
              type: "pickup",
              company: "Pickup Location",
            },
            {
              id: "2",
              name: selectedDelivery.deliveryContact || "",
              phone: selectedDelivery.deliveryContactPhone || "",
              type: "delivery",
              company: "Delivery Location",
            },
          ]}
          onCall={(contact) => handleCallClient(contact.phone)}
        />
      )}
    </div>
  );
}
