import React, { useState, useEffect } from "react";
import { CustomTabs } from "@/components/ui/CustomTabs";
import { DeliveryCard } from "@/components/ui/DeliveryCard";
import { DeliveryDetailModal } from "@/components/ui/DeliveryDetailModal";
import { DeliveryTable, Delivery } from "@/components/ui/DeliveryTable";
import { ContactDropdown } from "@/components/ui/ContactDropdown";
import { PhotoUploadModal } from "@/components/ui/PhotoUploadModal";
import { SignatureCapture } from "@/components/ui/SignatureCapture";
import ModernModel from "@/components/modal/ModernModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useDriverCargos } from "@/lib/api/hooks";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { customToast } from "@/lib/utils/toast";
import { mapCargosToCargoDetails } from "@/lib/utils/cargoMapper";
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
} from "lucide-react";

export default function DriverDeliveries() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("active");
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
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
    data: activeCargosData,
    isLoading: isLoadingActive,
    error: activeError,
    refetch: refetchActive,
  } = useDriverCargos({ status: "assigned" as any, limit: 50 });

  const {
    data: completedCargosData,
    isLoading: isLoadingCompleted,
    error: completedError,
    refetch: refetchCompleted,
  } = useDriverCargos({ status: "delivered" as any, limit: 50 });

  // Transform API data to Delivery format
  const activeDeliveries: Delivery[] = mapCargosToCargoDetails(
    activeCargosData?.data || []
  ).map((cargo) => ({
    id: cargo.id,
    cargo: cargo.type,
    from: cargo.from,
    to: cargo.to,
    client: cargo.client || "",
    phone: cargo.phone || "",
    status: cargo.status as any,
    priority: cargo.priority as any,
    estimatedTime: cargo.estimatedDelivery || "TBD",
    distance: cargo.distance,
    pickupContact: cargo.pickupContact || "",
    pickupContactPhone: cargo.pickupContactPhone || "",
    deliveryContact: cargo.deliveryContact || "",
    deliveryContactPhone: cargo.deliveryContactPhone || "",
  }));

  const completedDeliveries: Delivery[] = mapCargosToCargoDetails(
    completedCargosData?.data || []
  ).map((cargo) => ({
    id: cargo.id,
    cargo: cargo.type,
    from: cargo.from,
    to: cargo.to,
    client: cargo.client || "",
    phone: cargo.phone || "",
    status: "delivered" as const,
    priority: cargo.priority as any,
    completedAt: cargo.assignedDate,
    rating: 4.5, // Default rating since not available in CargoDetail
    distance: cargo.distance,
    pickupContact: cargo.pickupContact || "",
    pickupContactPhone: cargo.pickupContactPhone || "",
    deliveryContact: cargo.deliveryContact || "",
    deliveryContactPhone: cargo.deliveryContactPhone || "",
  }));

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
      refetchCompleted();
    } catch (error) {
      console.error("Delivery completion failed:", error);
      customToast.error(t("errors.completionFailed"));
    }
  };

  const handleReportIssue = (delivery: Delivery) => {
    customToast.info(t("driver.issueReported", { deliveryId: delivery.id }));
  };

  const handleRefresh = () => {
    if (activeTab === "active") {
      refetchActive();
    } else {
      refetchCompleted();
    }
  };

  const tabs = [
    {
      value: "active",
      label: t("navigation.activeDeliveries"),
      count: activeDeliveries.length,
    },
    {
      value: "completed",
      label: t("status.completed"),
      count: completedDeliveries.length,
    },
  ];

  const currentDeliveries =
    activeTab === "active" ? activeDeliveries : completedDeliveries;
  const isLoading =
    activeTab === "active" ? isLoadingActive : isLoadingCompleted;
  const error = activeTab === "active" ? activeError : completedError;

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
          <Skeleton className="h-8 w-24" />
        </div>

        {/* Tabs Skeleton */}
        <div className="flex space-x-1">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-32" />
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-8 w-full" />
              </div>
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
              {t("navigation.myDeliveries")}
            </h1>
            <p className="text-muted-foreground">
              {t("driver.manageDeliveries")}
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t("navigation.myDeliveries")}
          </h1>
          <p className="text-muted-foreground">
            {t("driver.manageDeliveries")}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
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

      {/* Custom Tabs */}
      <CustomTabs value={activeTab} onValueChange={setActiveTab} tabs={tabs} />

      {/* Delivery Table for Large Screens */}
      <div className="hidden lg:block">
        <DeliveryTable
          deliveries={currentDeliveries}
          title={
            activeTab === "active"
              ? t("navigation.activeDeliveries")
              : t("status.completed") + " " + t("navigation.deliveries")
          }
          showStats={false}
          showSearch={true}
          showFilters={true}
          showPagination={true}
          itemsPerPage={5}
          onViewDetails={handleViewDetails}
          onNavigate={handleNavigate}
          onCallClient={handleCallClient}
          onUploadLoadingPhotos={(delivery) => handlePhotoUpload("loading")}
          onUploadDeliveryPhotos={(delivery) => handlePhotoUpload("delivery")}
          onUploadReceiptPhotos={(delivery) => handlePhotoUpload("receipt")}
          onCaptureSignature={handleSignatureCapture}
          onReportIssue={handleReportIssue}
          onMarkDelivered={handleMarkDelivered}
        />
      </div>

      {/* Mobile Cards View */}
      <div className="lg:hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentDeliveries.map((delivery) => (
            <DeliveryCard
              key={delivery.id}
              delivery={delivery}
              onViewDetails={handleViewDetails}
              onNavigate={() => handleNavigate(delivery)}
              onCallClient={() => handleCallClient(delivery.phone)}
              onMarkDelivered={() => handleMarkDelivered(delivery)}
              onUploadLoadingPhotos={() => handlePhotoUpload("loading")}
              onUploadDeliveryPhotos={() => handlePhotoUpload("delivery")}
              onUploadReceiptPhotos={() => handlePhotoUpload("receipt")}
              onCaptureSignature={handleSignatureCapture}
              onReportIssue={() => handleReportIssue(delivery)}
              showActions={activeTab === "active"}
            />
          ))}
        </div>
      </div>

      {/* Empty State */}
      {currentDeliveries.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t("driver.noDeliveries", {
                type:
                  activeTab === "active"
                    ? t("status.active")
                    : t("status.completed"),
              })}
            </h3>
            <p className="text-gray-600">
              {activeTab === "active"
                ? t("driver.noActiveDeliveries")
                : t("driver.noCompletedDeliveries")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Delivery Detail Modal */}
      <DeliveryDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedDelivery(null);
        }}
        delivery={selectedDelivery}
        onCallClient={() =>
          selectedDelivery && handleCallClient(selectedDelivery.phone)
        }
        onNavigate={() => selectedDelivery && handleNavigate(selectedDelivery)}
        onUploadPhoto={() => handlePhotoUpload("delivery")}
        onReportIssue={() =>
          selectedDelivery && handleReportIssue(selectedDelivery)
        }
      />

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
