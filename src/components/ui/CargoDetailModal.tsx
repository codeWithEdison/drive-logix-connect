import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ModernModel from "@/components/modal/ModernModel";
import { RejectAssignmentModal } from "@/components/modals/RejectAssignmentModal";
import { PhotoUploadModal } from "@/components/ui/PhotoUploadModal";
import { RatingModal } from "@/components/ui/RatingModal";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { UserRole, CargoImageType, CargoStatus } from "@/types/shared";
import {
  useBulkUploadImages,
  useCargoImages,
} from "@/lib/api/hooks/cargoImageHooks";
import { useUpdateCargoStatus } from "@/lib/api/hooks/cargoHooks";
import { useRateDelivery } from "@/lib/api/hooks/deliveryHooks";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/queryClient";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Phone,
  Clock,
  Package,
  Truck,
  User,
  Calendar,
  Navigation,
  Camera,
  AlertCircle,
  CheckCircle,
  Star,
  Building,
  X,
  Download,
  Image as ImageIcon,
  Eye,
  ExternalLink,
} from "lucide-react";

export interface CargoDetail {
  id: string;
  cargo_number?: string; // LC prefix reference number
  status:
    | "active"
    | "pending"
    | "completed"
    | "transit"
    | "delivered"
    | "cancelled"
    | "assigned"
    | "partially_assigned"
    | "fully_assigned"
    | "picked_up"
    | "in_transit"
    | "quoted"
    | "accepted";
  from: string;
  to: string;
  driver?: string;
  phone: string;
  weight: string;
  type: string;
  pickupTime?: string;
  estimatedDelivery?: string;
  priority?: "urgent" | "standard" | "high" | "normal" | "low";
  assignedDate?: string;
  distance: string;
  earnings?: string;
  cost?: number;
  description?: string;
  specialInstructions?: string;
  vehicleType?: string;
  createdDate?: string;
  pickupDate?: string;
  deliveryDate?: string;
  estimatedTime?: string;
  pickupContact?: string;
  pickupContactPhone?: string;
  deliveryContact?: string;
  deliveryContactPhone?: string;
  // Enhanced fields for better data display
  clientCompany?: string;
  clientContactPerson?: string;
  clientPhone?: string;
  driverName?: string;
  driverPhone?: string;
  driverRating?: string;
  driverLicense?: string;
  vehiclePlate?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleInfo?: {
    plate_number?: string;
    make?: string;
    model?: string;
  };
  // Multi-assignment support
  assignments?: AssignmentDetail[];
  totalAssignedWeight?: number;
  totalAssignedVolume?: number;
  remainingWeight?: number;
  remainingVolume?: number;
  // Extended properties for API compatibility
  client?: any;
  category?: any;
  delivery_assignment?: any;
  pickup_location?: any;
  destination_location?: any;
  pickup_address?: string;
  pickup_contact?: string;
  pickup_phone?: string;
  pickup_instructions?: string;
  destination_address?: string;
  destination_contact?: string;
  destination_phone?: string;
  delivery_instructions?: string;
  weight_kg?: number;
  distance_km?: string;
  assignmentStatus?: string;
  assignmentExpiresAt?: string;
  assignmentNotes?: string;
  assignmentId?: string;
  // Additional properties for cargo details
  final_cost?: string;
  estimated_cost?: string;
  volume?: number;
  dimensions?: {
    width: number;
    height: number;
    length: number;
  };
  insurance_required?: boolean;
  insurance_amount?: number;
  fragile?: boolean;
  temperature_controlled?: boolean;
  // Rating fields
  rating?: number;
  review?: string;
  isRated?: boolean;
}

export interface AssignmentDetail {
  id: string;
  driver_id: string;
  vehicle_id: string;
  assignment_status: "pending" | "accepted" | "rejected" | "cancelled";
  assigned_weight_kg?: number;
  assigned_volume?: number;
  assignment_type: "full" | "partial" | "split";
  expires_at: string;
  driver_responded_at?: string;
  rejection_reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Related data
  driver?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    status: string;
    license_number?: string;
  };
  vehicle?: {
    id: string;
    plate_number: string;
    make: string;
    model: string;
    year?: number;
    capacity_kg: number;
    capacity_volume?: number;
    status: string;
  };
}

interface CargoDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  cargo: CargoDetail | null;
  onAccept?: (cargoId: string) => void;
  onStartDelivery?: (cargoId: string) => void;
  onCallClient?: (phone: string) => void;
  onCallDriver?: (phone: string) => void;
  onUploadPhoto?: (cargoId: string) => void;
  onReportIssue?: (cargoId: string) => void;
  onCancelCargo?: (cargoId: string) => void;
  onDownloadReceipt?: (cargoId: string) => void;
  // Loading states
  isStartingDelivery?: boolean;
  // Assignment system actions
  onAcceptAssignment?: (assignmentId: string, notes?: string) => void;
  onRejectAssignment?: (
    assignmentId: string,
    reason: string,
    notes?: string
  ) => void;
  onCancelAssignment?: (assignmentId: string) => void;
  onChangeVehicle?: (assignmentId: string, vehicleId: string) => void;
  onChangeDriver?: (assignmentId: string, driverId: string) => void;
  onCreateAssignment?: (
    cargoId: string,
    driverId: string,
    vehicleId: string,
    notes?: string
  ) => void;
  // Role-based access control
  userRole?: UserRole;
  // Call functionality
  onCallContact?: (phone: string, name?: string) => void;
  // Assignment modal functionality
  onOpenAssignmentModal?: (cargoId: string) => void;
  // Review and invoice functionality
  onReviewAndInvoice?: (cargoId: string) => void;
  // Callback when cargo data is updated (for parent components to refresh)
  onCargoUpdated?: (cargoId: string) => void;
  // Whether to close modal after successful actions (default: true)
  closeOnSuccess?: boolean;
}

export function CargoDetailModal({
  isOpen,
  onClose,
  cargo,
  onAccept,
  onStartDelivery,
  onCallClient,
  onCallDriver,
  onCancelCargo,
  onDownloadReceipt,
  isStartingDelivery = false,
  onAcceptAssignment,
  onRejectAssignment,
  onCancelAssignment,
  onChangeVehicle,
  onChangeDriver,
  onCreateAssignment,
  userRole = UserRole.CLIENT,
  onCallContact,
  onOpenAssignmentModal,
  onReviewAndInvoice,
  onCargoUpdated,
  closeOnSuccess = true,
}: CargoDetailModalProps) {
  // Get user from auth context to compare roles
  const { user } = useAuth();
  const { t } = useLanguage();

  // Use auth context role as the primary role, fallback to prop if needed
  const effectiveRole = user?.role || userRole;

  // Query client for invalidating queries
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Helper function to invalidate all cargo-related queries
  const invalidateCargoQueries = (cargoId: string) => {
    // Invalidate cargo detail
    queryClient.invalidateQueries({
      queryKey: queryKeys.cargos.detail(cargoId),
    });
    // Invalidate cargo tracking
    queryClient.invalidateQueries({
      queryKey: queryKeys.cargos.tracking(cargoId),
    });
    // Invalidate all cargo lists
    queryClient.invalidateQueries({
      queryKey: queryKeys.cargos.all(),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.cargos.clientCargos(),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.cargos.driverCargos(),
    });
    // Invalidate delivery assignments
    queryClient.invalidateQueries({
      queryKey: queryKeys.deliveryAssignments.all(),
    });
    // Invalidate tracking data
    queryClient.invalidateQueries({
      queryKey: queryKeys.tracking.cargoDetail(cargoId),
    });
    // Notify parent component
    onCargoUpdated?.(cargoId);
  };

  // Debug logging for all props and auth context
  console.log("CargoDetailModal Debug Info:", {
    // Props
    isOpen,
    cargo: cargo
      ? { id: cargo.id, status: cargo.status, cargo_number: cargo.cargo_number }
      : null,
    userRoleProp: userRole,
    onOpenAssignmentModal: !!onOpenAssignmentModal,
    // Auth Context
    authUser: user
      ? { id: user.id, role: user.role, full_name: user.full_name }
      : null,
    // Comparison
    effectiveRole,
    roleFromAuth: user?.role,
    roleFromProp: userRole,
  });

  // State for countdown timer
  const [countdown, setCountdown] = useState<string>("");

  // State for rejection modal
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  // State for pickup image upload modal
  const [isPickupImageModalOpen, setIsPickupImageModalOpen] = useState(false);
  const [isUploadingPickupImages, setIsUploadingPickupImages] = useState(false);

  // State for delivery image upload modal
  const [isDeliveryImageModalOpen, setIsDeliveryImageModalOpen] =
    useState(false);
  const [isUploadingDeliveryImages, setIsUploadingDeliveryImages] =
    useState(false);

  // State for rating modal
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  // API hooks
  const bulkUploadImages = useBulkUploadImages();
  const updateCargoStatus = useUpdateCargoStatus();
  const rateDelivery = useRateDelivery();
  const { toast } = useToast();

  // Fetch cargo images
  const { data: cargoImages, isLoading: isLoadingImages } = useCargoImages(
    cargo?.id || "",
    { limit: 20 } // Limit to 20 images for performance
  );

  // Real-time countdown timer effect
  useEffect(() => {
    if (!cargo) {
      setCountdown("");
      return;
    }

    const expiresAt =
      cargo.delivery_assignment?.expires_at || cargo.assignmentExpiresAt;

    if (!expiresAt) {
      setCountdown("");
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      const expiry = new Date(expiresAt);
      const diffMs = expiry.getTime() - now.getTime();

      if (diffMs <= 0) {
        setCountdown(t("assignment.expired") || "Expired");
        return;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      if (hours > 0) {
        setCountdown(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setCountdown(`${minutes}m ${seconds}s`);
      } else {
        setCountdown(`${seconds}s`);
      }
    };

    // Update immediately
    updateCountdown();

    // Update every second
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [cargo]);

  if (!cargo) {
    return (
      <ModernModel
        isOpen={isOpen}
        onClose={onClose}
        title="Loading Cargo Details..."
      >
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">
            Loading cargo details...
          </span>
        </div>
      </ModernModel>
    );
  }

  // Debug logging for user role and cargo status
  console.log("CargoDetailModal Debug Info:", {
    userRole,
    cargoStatus: cargo.status,
    cargoId: cargo.id,
    cargoNumber: cargo.cargo_number,
    shouldShowAssignButton: userRole === "admin" && cargo.status === "accepted",
  });

  // Helper functions
  const canViewCostInfo = () => {
    return [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(
      effectiveRole as UserRole
    );
  };

  const formatOperatingHours = (operatingHours: any) => {
    if (!operatingHours) return null;

    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return days
      .map((day, index) => {
        const hours = operatingHours[day];
        if (!hours) return null;
        return `${dayNames[index]}: ${hours.start} - ${hours.end}`;
      })
      .filter(Boolean)
      .join(", ");
  };

  const handleCallContact = (phone: string, name?: string) => {
    if (onCallContact) {
      onCallContact(phone, name);
    } else {
      // Fallback to tel: link
      window.open(`tel:${phone}`, "_self");
    }
  };

  const handleRejectAssignment = async (reason: string) => {
    setIsRejecting(true);
    try {
      await onRejectAssignment?.(
        cargo.delivery_assignment?.id || cargo.assignmentId || cargo.id,
        reason
      );

      // Invalidate queries
      invalidateCargoQueries(cargo.id);

      toast({
        title: t("assignment.rejectedSuccessfully"),
        description: t("assignment.assignmentRejected"),
        variant: "default",
      });

      setIsRejectModalOpen(false);

      // Close modal if configured
      if (closeOnSuccess) {
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (error: any) {
      console.error("Failed to reject assignment:", error);
      toast({
        title: t("assignment.failedToReject"),
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to reject assignment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRejecting(false);
    }
  };

  const handlePickupImageUpload = async (data: {
    photos: File[];
    notes: string;
    type: string;
    cargoId: string;
  }) => {
    setIsUploadingPickupImages(true);
    try {
      // Step 1: Upload pickup images using the API
      const images = data.photos.map((file, index) => ({
        file,
        image_type: CargoImageType.PICKUP,
        description: data.notes || `Pickup image ${index + 1}`,
        is_primary: index === 0, // First image as primary
      }));

      await bulkUploadImages.mutateAsync({
        cargoId: data.cargoId,
        images,
      });

      // Step 2: Update cargo status to picked_up after successful image upload
      await updateCargoStatus.mutateAsync({
        id: data.cargoId,
        status: CargoStatus.PICKED_UP,
        notes: t("delivery.pickupConfirmed") || "Cargo picked up successfully",
      });

      // Invalidate queries to refresh data
      invalidateCargoQueries(data.cargoId);

      toast({
        title: t("delivery.pickupConfirmed"),
        description:
          t("delivery.pickupConfirmedDescription") ||
          "Cargo has been marked as picked up successfully.",
        variant: "default",
      });

      setIsPickupImageModalOpen(false);

      // Close modal if configured
      if (closeOnSuccess) {
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error: any) {
      console.error("Failed to upload pickup images or update status:", error);

      // Show user-friendly error message
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        t("errors.uploadFailed") ||
        "Failed to upload images or update cargo status";

      // Show user-friendly error message using toast
      toast({
        title: t("errors.uploadFailed"),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploadingPickupImages(false);
    }
  };

  const handleMarkPickedUp = () => {
    setIsPickupImageModalOpen(true);
  };

  const handleMarkDelivered = () => {
    setIsDeliveryImageModalOpen(true);
  };

  const handleRateDelivery = () => {
    setIsRatingModalOpen(true);
  };

  const handleSubmitRating = async (data: {
    rating: number;
    review?: string;
  }) => {
    // Check permissions before submitting
    if (
      effectiveRole !== UserRole.CLIENT &&
      effectiveRole !== UserRole.ADMIN &&
      effectiveRole !== UserRole.SUPER_ADMIN
    ) {
      toast({
        title: t("common.permissionDenied") || "Permission Denied",
        description:
          t("delivery.ratingPermissionDenied") ||
          "Only clients, admins, and super admins can rate deliveries.",
        variant: "destructive",
      });
      return;
    }

    try {
      await rateDelivery.mutateAsync({
        cargoId: cargo.id,
        data,
      });

      // Invalidate queries to refresh data
      invalidateCargoQueries(cargo.id);

      toast({
        title: t("delivery.ratingSubmitted") || "Rating Submitted",
        description:
          t("delivery.thankYouForFeedback") || "Thank you for your feedback!",
        variant: "default",
      });

      setIsRatingModalOpen(false);

      // Close modal if configured
      if (closeOnSuccess) {
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error: any) {
      console.error("Failed to submit rating:", error);

      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        t("delivery.ratingFailed") ||
        "Failed to submit rating";

      toast({
        title: t("delivery.ratingFailed"),
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDeliveryImageUpload = async (data: {
    photos: File[];
    notes: string;
    type: string;
    cargoId: string;
  }) => {
    setIsUploadingDeliveryImages(true);
    try {
      // Step 1: Upload delivery images using the API
      const images = data.photos.map((file, index) => ({
        file,
        image_type: CargoImageType.DELIVERY,
        description: data.notes || `Delivery image ${index + 1}`,
        is_primary: index === 0, // First image as primary
      }));

      await bulkUploadImages.mutateAsync({
        cargoId: data.cargoId,
        images,
      });

      // Step 2: Update cargo status to delivered after successful image upload
      await updateCargoStatus.mutateAsync({
        id: data.cargoId,
        status: CargoStatus.DELIVERED,
        notes:
          t("delivery.deliveryCompleted") || "Cargo delivered successfully",
      });

      // Invalidate queries to refresh data
      invalidateCargoQueries(data.cargoId);

      toast({
        title: t("delivery.deliveryConfirmed") || "Delivery Confirmed",
        description:
          t("delivery.deliveryConfirmedDescription") ||
          "Cargo has been marked as delivered successfully.",
        variant: "default",
      });

      setIsDeliveryImageModalOpen(false);

      // Close modal if configured
      if (closeOnSuccess) {
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error: any) {
      console.error(
        "Failed to upload delivery images or update status:",
        error
      );

      // Show user-friendly error message
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        t("errors.uploadFailed") ||
        "Failed to upload images or update cargo status";

      // Show user-friendly error message using toast
      toast({
        title: t("errors.uploadFailed"),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploadingDeliveryImages(false);
    }
  };

  const handleGenerateInvoice = async () => {
    try {
      if (onReviewAndInvoice) {
        await onReviewAndInvoice(cargo.id);
        // Invalidate queries to refresh data
        invalidateCargoQueries(cargo.id);
        toast({
          title: t("invoice.generated") || "Invoice Generated",
          description:
            t("invoice.generatedSuccessfully") ||
            "Invoice has been generated successfully.",
          variant: "default",
        });
        // Close modal if configured
        if (closeOnSuccess) {
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      } else {
        // Fallback to navigation if no handler provided
        navigate(`/admin/invoices/create?cargoId=${cargo.id}`);
        onClose();
      }
    } catch (error: any) {
      toast({
        title: t("invoice.generationFailed") || "Failed to Generate Invoice",
        description:
          error?.response?.data?.message ||
          error?.message ||
          t("invoice.generationFailedDescription") ||
          "Failed to generate invoice. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateCargoStatus.mutateAsync({
        id: cargo.id,
        status: newStatus as CargoStatus,
        notes:
          t("cargo.statusChanged", { status: newStatus }) ||
          `Status changed to ${newStatus}`,
      });

      // Invalidate queries to refresh data
      invalidateCargoQueries(cargo.id);

      toast({
        title: t("cargo.statusUpdated"),
        description:
          t("cargo.statusUpdatedDescription", { status: newStatus }) ||
          `Cargo status has been updated to ${newStatus}.`,
        variant: "default",
      });

      // Close modal if configured
      if (closeOnSuccess) {
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error: any) {
      console.error(`Failed to change status to ${newStatus}:`, error);
      toast({
        title: t("cargo.statusUpdateFailed") || "Status Update Failed",
        description:
          error?.response?.data?.message ||
          error?.message ||
          t("cargo.statusUpdateFailedDescription") ||
          "Failed to update status. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get available admin actions based on status transition matrix
  const getAvailableAdminActions = () => {
    const actions = [];
    const status = cargo.status;

    switch (status) {
      case "pending":
        actions.push(
          {
            key: "generate-invoice",
            label: t("cargo.reviewAndInvoicing") || "Review and Invoicing",
            description:
              t("cargo.reviewAndInvoicingDescription") ||
              "Review and invoicing",
            icon: <Package className="h-4 w-4 mr-2" />,
            variant: "default" as const,
            onClick: () => handleGenerateInvoice(),
          },
          {
            key: "mark-accepted",
            label: t("cargo.markAsAccepted") || "Mark as Accepted",
            description:
              t("cargo.markAsAcceptedDescription") ||
              "Manually mark cargo as accepted",
            icon: <CheckCircle className="h-4 w-4 mr-2" />,
            variant: "outline" as const,
            onClick: () => handleStatusChange("accepted"),
          },
          {
            key: "cancel-cargo",
            label: t("cargo.cancelCargo"),
            description:
              t("cargo.cancelCargoDescription") || "Cancel this cargo request",
            icon: <X className="h-4 w-4 mr-2" />,
            variant: "outline" as const,
            className:
              "text-red-600 border-red-600 hover:bg-red-600 hover:text-white",
            onClick: () => onCancelCargo?.(cargo.id),
          }
        );
        break;

      case "quoted":
        actions.push({
          key: "cancel-cargo",
          label: "Cancel Cargo",
          description: "Cancel this cargo request",
          icon: <X className="h-4 w-4 mr-2" />,
          variant: "outline" as const,
          className:
            "text-red-600 border-red-600 hover:bg-red-600 hover:text-white",
          onClick: () => onCancelCargo?.(cargo.id),
        });
        break;

      case "accepted":
        actions.push(
          {
            key: "assign-driver",
            label: t("cargo.assignDriver") || "Assign Driver",
            description:
              t("cargo.assignDriverDescription") ||
              "Assign driver and vehicle to this cargo",
            icon: <User className="h-4 w-4 mr-2" />,
            variant: "default" as const,
            onClick: () => onOpenAssignmentModal?.(cargo.id),
          },
          {
            key: "cancel-cargo",
            label: t("cargo.cancelCargo"),
            description:
              t("cargo.cancelCargoDescription") || "Cancel this cargo request",
            icon: <X className="h-4 w-4 mr-2" />,
            variant: "outline" as const,
            className:
              "text-red-600 border-red-600 hover:bg-red-600 hover:text-white",
            onClick: () => onCancelCargo?.(cargo.id),
          }
        );
        break;

      case "assigned":
      case "fully_assigned":
      case "partially_assigned":
        actions.push({
          key: "cancel-cargo",
          label: "Cancel Cargo",
          description: "Cancel this cargo request",
          icon: <X className="h-4 w-4 mr-2" />,
          variant: "outline" as const,
          className:
            "text-red-600 border-red-600 hover:bg-red-600 hover:text-white",
          onClick: () => onCancelCargo?.(cargo.id),
        });
        break;

      case "picked_up":
        actions.push({
          key: "cancel-cargo",
          label: "Cancel Cargo",
          description: "Cancel this cargo request",
          icon: <X className="h-4 w-4 mr-2" />,
          variant: "outline" as const,
          className:
            "text-red-600 border-red-600 hover:bg-red-600 hover:text-white",
          onClick: () => onCancelCargo?.(cargo.id),
        });
        break;

      case "in_transit":
        actions.push({
          key: "cancel-cargo",
          label: "Cancel Cargo",
          description: "Cancel this cargo request",
          icon: <X className="h-4 w-4 mr-2" />,
          variant: "outline" as const,
          className:
            "text-red-600 border-red-600 hover:bg-red-600 hover:text-white",
          onClick: () => onCancelCargo?.(cargo.id),
        });
        break;

      case "delivered":
      case "cancelled":
        // No actions available for final states
        break;

      default:
        // For any other status, show basic actions
        actions.push({
          key: "cancel-cargo",
          label: "Cancel Cargo",
          description: "Cancel this cargo request",
          icon: <X className="h-4 w-4 mr-2" />,
          variant: "outline" as const,
          className:
            "text-red-600 border-red-600 hover:bg-red-600 hover:text-white",
          onClick: () => onCancelCargo?.(cargo.id),
        });
    }

    return actions;
  };

  // Helper functions for assignment system
  const isAssignmentExpired = () => {
    const expiresAt =
      cargo.delivery_assignment?.expires_at || cargo.assignmentExpiresAt;
    if (!expiresAt) return false;
    return new Date() > new Date(expiresAt);
  };

  const getTimeUntilExpiry = () => {
    const expiresAt =
      cargo.delivery_assignment?.expires_at || cargo.assignmentExpiresAt;
    if (!expiresAt) return null;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();

    if (diffMs <= 0) return "Expired";

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const canDriverRespond = () => {
    // Only drivers can respond to assignments
    if (effectiveRole !== UserRole.DRIVER) return false;

    const assignmentStatus =
      cargo.delivery_assignment?.assignment_status || cargo.assignmentStatus;
    return assignmentStatus === "pending" && !isAssignmentExpired();
  };

  const canAdminManage = () => {
    // Only admins and super admins can manage assignments
    const isAdmin =
      effectiveRole === UserRole.ADMIN ||
      effectiveRole === UserRole.SUPER_ADMIN;
    if (!isAdmin) return false;

    const assignmentStatus =
      cargo.delivery_assignment?.assignment_status || cargo.assignmentStatus;
    return ["pending", "accepted"].includes(assignmentStatus || "");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-600">
            Awaiting Quote
          </Badge>
        );
      case "quoted":
        return <Badge className="bg-blue-100 text-blue-600">Quote Sent</Badge>;
      case "accepted":
        return (
          <Badge className="bg-indigo-100 text-indigo-600">
            Quote Accepted
          </Badge>
        );
      case "assigned":
      case "fully_assigned":
        return (
          <Badge className="bg-purple-100 text-purple-600">
            Driver Assigned
          </Badge>
        );
      case "picked_up":
        return (
          <Badge className="bg-orange-100 text-orange-600">
            Cargo Collected
          </Badge>
        );
      case "in_transit":
        return <Badge className="bg-blue-100 text-blue-600">In Transit</Badge>;
      case "delivered":
        return <Badge className="bg-green-100 text-green-600">Delivered</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-600">Cancelled</Badge>;
      case "disputed":
        return <Badge className="bg-red-100 text-red-600">Disputed</Badge>;
      // Legacy status mappings for backward compatibility
      case "active":
        return <Badge className="bg-green-100 text-green-600">Active</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-600">Completed</Badge>;
      case "transit":
        return <Badge className="bg-blue-100 text-blue-600">In Transit</Badge>;
      default:
        return (
          <Badge className="bg-gray-100 text-gray-600 capitalize">
            {status}
          </Badge>
        );
    }
  };

  const getAssignmentStatusBadge = (assignmentStatus: string) => {
    switch (assignmentStatus) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-600">
            Assignment Pending
          </Badge>
        );
      case "accepted":
        return (
          <Badge className="bg-green-100 text-green-600">
            Assignment Accepted
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-600">Assignment Rejected</Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-gray-100 text-gray-600">
            Assignment Cancelled
          </Badge>
        );
      default:
        return null;
    }
  };

  // const getPriorityBadge = (priority: string) => {
  //   switch (priority) {
  //     case "urgent":
  //       return <Badge className="bg-red-100 text-red-600">Urgent</Badge>;
  //     case "high":
  //       return <Badge className="bg-orange-100 text-orange-600">High</Badge>;
  //     case "normal":
  //       return <Badge className="bg-blue-100 text-blue-600">Normal</Badge>;
  //     case "low":
  //       return <Badge className="bg-gray-100 text-gray-600">Low</Badge>;
  //     default:
  //       return <Badge className="bg-gray-100 text-gray-600">Standard</Badge>;
  //   }
  // };

  // const getPriorityDescription = (priority: string) => {
  //   switch (priority) {
  //     case "urgent":
  //       return "Critical shipment requiring immediate attention (e.g., medical supplies, emergency deliveries)";
  //     case "high":
  //       return "Important shipment requiring faster processing (e.g., business documents, important packages)";
  //     case "normal":
  //       return "Standard priority, default processing for most regular shipments";
  //     case "low":
  //       return "Non-urgent, can be processed during normal operations (e.g., regular deliveries, non-time-sensitive items)";
  //     default:
  //       return "Standard priority processing";
  //   }
  // };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "pending":
        return t("cargoTable.status.pending");
      case "quoted":
        return t("cargoTable.status.quoted");
      case "accepted":
        return t("cargoTable.status.accepted");
      case "assigned":
        return t("cargoTable.status.assigned");
      case "picked_up":
        return t("cargoTable.status.pickedUp");
      case "in_transit":
        return t("cargoTable.status.inTransit");
      case "delivered":
        return t("cargoTable.status.delivered");
      case "cancelled":
        return t("cargoTable.status.cancelled");
      case "disputed":
        return t("cargoTable.status.disputed");
      case "active":
        return t("status.active") || "Active";
      case "completed":
        return t("status.completed");
      case "transit":
        return t("cargoTable.status.inTransit");
      default:
        return t(`cargoTable.status.${status}`) || status;
    }
  };

  const isDriverCargo = cargo.clientCompany && !cargo.driver;
  const isClientCargo = cargo.driver && !cargo.clientCompany;

  return (
    <ModernModel
      isOpen={isOpen}
      onClose={onClose}
      title={t("cargo.cargoDetails") + ` - ${cargo.cargo_number || cargo.id}`}
    >
      <div className="space-y-6">
        {/* Header Info */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {cargo.cargo_number || cargo.id}
            </h3>
            <p className="text-sm text-gray-600">
              {isDriverCargo
                ? `Assigned on ${cargo.assignedDate}`
                : `Created on ${cargo.createdDate}`}
            </p>
            {/* Assignment expiry timer */}
            {(cargo.delivery_assignment?.assignment_status === "pending" ||
              cargo.assignmentStatus === "pending") &&
              (cargo.delivery_assignment?.expires_at ||
                cargo.assignmentExpiresAt) &&
              countdown && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500">
                    {t("assignment.responseRequiredWithin") ||
                      "Response required within:"}{" "}
                    <span
                      className={`font-semibold ${
                        countdown === "Expired" || isAssignmentExpired()
                          ? "text-red-600"
                          : "text-orange-600"
                      }`}
                    >
                      {countdown}
                    </span>
                  </p>
                </div>
              )}
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(cargo.status)}
            {(cargo.delivery_assignment?.assignment_status ||
              cargo.assignmentStatus) &&
              getAssignmentStatusBadge(
                cargo.delivery_assignment?.assignment_status ||
                  cargo.assignmentStatus
              )}
          </div>
        </div>

        {/* Assignment Information - Only show for drivers with pending assignments */}
        {effectiveRole === UserRole.DRIVER &&
          (cargo.delivery_assignment?.assignment_status === "pending" ||
            cargo.assignmentStatus === "pending") && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <h4 className="font-semibold text-orange-900">
                    {t("assignment.responseRequired") ||
                      "Assignment Response Required"}
                  </h4>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      {t("common.status")}:
                    </span>
                    {getAssignmentStatusBadge(
                      cargo.delivery_assignment?.assignment_status ||
                        cargo.assignmentStatus
                    )}
                  </div>
                  {(cargo.delivery_assignment?.expires_at ||
                    cargo.assignmentExpiresAt) &&
                    countdown && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                          {t("assignment.timeRemaining") || "Time Remaining"}:
                        </span>
                        <span
                          className={`text-sm font-semibold ${
                            countdown === (t("assignment.expired") || "Expired")
                              ? "text-red-600"
                              : "text-orange-600"
                          }`}
                        >
                          {countdown}
                        </span>
                      </div>
                    )}
                  {(cargo.delivery_assignment?.notes ||
                    cargo.assignmentNotes) && (
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-1">
                        {t("assignment.notes") || "Assignment Notes"}:
                      </p>
                      <p className="text-sm text-gray-800 bg-white p-2 rounded border">
                        {cargo.delivery_assignment?.notes ||
                          cargo.assignmentNotes}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

        {/* Status and Priority Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-blue-900 mb-1">
                  {t("dashboard.currentStatus")}
                </h4>
                <p className="text-sm text-blue-800 leading-relaxed">
                  {getStatusDescription(cargo.status)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Client Information */}
        {cargo.clientCompany && (
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <User className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-gray-900">
                  {t("cargo.clientInformation") || "Client Information"}
                </h4>
              </div>
              <div className="space-y-3">
                {/* Company Name (if available) */}
                {cargo.clientCompany && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Building className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-600">
                        {t("common.company") || "COMPANY"}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {cargo.clientCompany}
                    </p>
                  </div>
                )}

                {/* Client Name */}
                <div>
                  <p className="text-xs text-gray-500 font-medium">
                    {t("common.client")} {t("common.name")}
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {cargo.clientCompany || t("common.notAvailable")}
                  </p>
                </div>

                {/* Contact Person (if different from client name) */}
                {cargo.clientContactPerson && (
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      Contact Person
                    </p>
                    <p className="text-sm text-gray-900">
                      {cargo.clientContactPerson}
                    </p>
                  </div>
                )}

                {/* Phone Number */}
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-900">
                    {cargo.clientPhone || cargo.phone}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Driver Information - Only show for non-drivers */}
        {effectiveRole !== UserRole.DRIVER &&
          (cargo.driver || cargo.delivery_assignment?.driver) && (
            <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Truck className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-gray-900">
                    {t("driver.driverDetails")}
                  </h4>
                </div>
                <div className="space-y-3">
                  {/* Driver Name */}
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      {t("common.driver")} {t("common.name")}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {(cargo as any).delivery_assignment?.driver?.user
                        ?.full_name ||
                        cargo.driverName ||
                        cargo.driver ||
                        t("common.notAvailable")}
                    </p>
                  </div>

                  {/* Driver Rating */}
                  {(cargo.driverRating ||
                    (cargo as any).delivery_assignment?.driver?.rating) && (
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-900">
                        {(cargo as any).delivery_assignment?.driver?.rating ||
                          cargo.driverRating}
                        ★
                      </span>
                    </div>
                  )}

                  {/* Driver License */}
                  {(cargo.driverLicense ||
                    (cargo as any).delivery_assignment?.driver
                      ?.license_number) && (
                    <div>
                      <p className="text-xs text-gray-500 font-medium">
                        {t("driver.licenseNumber")}
                      </p>
                      <p className="text-sm text-gray-900">
                        {(cargo as any).delivery_assignment?.driver
                          ?.license_number || cargo.driverLicense}
                      </p>
                    </div>
                  )}

                  {/* Driver Phone */}
                  {(cargo.driverPhone ||
                    (cargo as any).delivery_assignment?.driver?.user
                      ?.phone) && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-900">
                        {(cargo as any).delivery_assignment?.driver?.user
                          ?.phone || cargo.driverPhone}
                      </span>
                    </div>
                  )}

                  {/* Driver Status */}
                  {(cargo as any).delivery_assignment?.driver?.status && (
                    <div>
                      <p className="text-xs text-gray-500 font-medium">
                        Status
                      </p>
                      <Badge
                        className={
                          (cargo as any).delivery_assignment.driver.status ===
                          "available"
                            ? "bg-green-100 text-green-700 border-green-200 text-xs"
                            : (cargo as any).delivery_assignment.driver
                                .status === "on_duty"
                            ? "bg-blue-100 text-blue-700 border-blue-200 text-xs"
                            : "bg-gray-100 text-gray-700 border-gray-200 text-xs"
                        }
                      >
                        {(cargo as any).delivery_assignment.driver.status
                          .replace("_", " ")
                          .toUpperCase()}
                      </Badge>
                    </div>
                  )}

                  {/* Total Deliveries */}
                  {(cargo as any).delivery_assignment?.driver
                    ?.total_deliveries && (
                    <div>
                      <p className="text-xs text-gray-500 font-medium">
                        Total Deliveries
                      </p>
                      <p className="text-sm text-gray-900">
                        {
                          (cargo as any).delivery_assignment.driver
                            .total_deliveries
                        }
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

        {/* Vehicle Information */}
        {(cargo.vehiclePlate ||
          cargo.vehicleMake ||
          cargo.vehicleModel ||
          (cargo as any).delivery_assignment?.vehicle) && (
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Truck className="h-5 w-5 text-purple-600" />
                <h4 className="font-semibold text-gray-900">
                  {t("dashboard.vehicleInformation")}
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(cargo.vehiclePlate ||
                  (cargo as any).delivery_assignment?.vehicle
                    ?.plate_number) && (
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      {t("vehicle.plateNumber")}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {(cargo as any).delivery_assignment?.vehicle
                        ?.plate_number || cargo.vehiclePlate}
                    </p>
                  </div>
                )}
                {(cargo.vehicleMake ||
                  cargo.vehicleModel ||
                  (cargo as any).delivery_assignment?.vehicle?.make ||
                  (cargo as any).delivery_assignment?.vehicle?.model) && (
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Vehicle</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {(cargo as any).delivery_assignment?.vehicle?.make ||
                        cargo.vehicleMake}{" "}
                      {(cargo as any).delivery_assignment?.vehicle?.model ||
                        cargo.vehicleModel}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Route Information */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-purple-50/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Navigation className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold text-gray-900">
                {t("cargo.routeDetails") || "Route Details"}
              </h4>
            </div>
            <div className="space-y-4">
              {/* Pickup Location */}
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium">
                    {t("tracking.from")}
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {cargo.pickup_location?.name ||
                      cargo.pickup_address ||
                      cargo.from}
                  </p>
                  <p className="text-xs text-gray-600">
                    {cargo.pickup_location?.address ||
                      cargo.pickup_address ||
                      cargo.from}
                  </p>

                  {/* Operating Hours */}
                  {cargo.pickup_location?.operating_hours && (
                    <div className="mt-2 p-2 bg-green-50 rounded-lg">
                      <p className="text-xs text-green-600 font-medium">
                        {t("cargo.operatingHours") || "Operating Hours:"}
                      </p>
                      <p className="text-xs text-green-800">
                        {formatOperatingHours(
                          cargo.pickup_location.operating_hours
                        )}
                      </p>
                    </div>
                  )}

                  {/* Contact Information with Call Button */}
                  {(cargo.pickup_location?.contact_person ||
                    cargo.pickup_location?.contact_phone ||
                    cargo.pickup_contact ||
                    cargo.pickup_phone ||
                    cargo.pickupContact ||
                    cargo.pickupContactPhone) && (
                    <div className="mt-2 p-2 bg-green-50 rounded-lg">
                      <p className="text-xs text-gray-600 font-medium">
                        {t("common.contactPerson") || "Contact Person:"}
                      </p>
                      <p className="text-xs text-gray-900">
                        {cargo.pickup_location?.contact_person ||
                          cargo.pickup_contact ||
                          cargo.pickupContact}
                      </p>
                      {(cargo.pickup_location?.contact_phone ||
                        cargo.pickup_phone ||
                        cargo.pickupContactPhone) && (
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-gray-500" />
                            <span className="text-xs text-gray-900">
                              {cargo.pickup_location?.contact_phone ||
                                cargo.pickup_phone ||
                                cargo.pickupContactPhone}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-xs"
                            onClick={() =>
                              handleCallContact(
                                cargo.pickup_location?.contact_phone ||
                                  cargo.pickup_phone ||
                                  cargo.pickupContactPhone,
                                cargo.pickup_location?.contact_person ||
                                  cargo.pickup_contact ||
                                  cargo.pickupContact
                              )
                            }
                          >
                            <Phone className="h-3 w-3" />
                            {t("common.call")}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pickup Instructions */}
                  {cargo.pickup_instructions && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-600 font-medium">
                        {t("cargo.pickupInstructions") || "Instructions:"}
                      </p>
                      <p className="text-xs text-blue-800">
                        {cargo.pickup_instructions}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pl-6">
                <div className="w-px h-8 bg-gray-300"></div>
              </div>

              {/* Destination Location */}
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full mt-1.5"></div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium">
                    {t("tracking.to")}
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {cargo.destination_location?.name ||
                      cargo.destination_address ||
                      cargo.to}
                  </p>
                  <p className="text-xs text-gray-600">
                    {cargo.destination_location?.address ||
                      cargo.destination_address ||
                      cargo.to}
                  </p>

                  {/* Operating Hours */}
                  {cargo.destination_location?.operating_hours && (
                    <div className="mt-2 p-2 bg-red-50 rounded-lg">
                      <p className="text-xs text-red-600 font-medium">
                        {t("cargo.operatingHours") || "Operating Hours:"}
                      </p>
                      <p className="text-xs text-red-800">
                        {formatOperatingHours(
                          cargo.destination_location.operating_hours
                        )}
                      </p>
                    </div>
                  )}

                  {/* Contact Information with Call Button */}
                  {(cargo.destination_location?.contact_person ||
                    cargo.destination_location?.contact_phone ||
                    cargo.destination_contact ||
                    cargo.destination_phone ||
                    cargo.deliveryContact ||
                    cargo.deliveryContactPhone) && (
                    <div className="mt-2 p-2 bg-red-50 rounded-lg">
                      <p className="text-xs text-gray-600 font-medium">
                        {t("common.contactPerson") || "Contact Person:"}
                      </p>
                      <p className="text-xs text-gray-900">
                        {cargo.destination_location?.contact_person ||
                          cargo.destination_contact ||
                          cargo.deliveryContact}
                      </p>
                      {(cargo.destination_location?.contact_phone ||
                        cargo.destination_phone ||
                        cargo.deliveryContactPhone) && (
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-gray-500" />
                            <span className="text-xs text-gray-900">
                              {cargo.destination_location?.contact_phone ||
                                cargo.destination_phone ||
                                cargo.deliveryContactPhone}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-xs"
                            onClick={() =>
                              handleCallContact(
                                cargo.destination_location?.contact_phone ||
                                  cargo.destination_phone ||
                                  cargo.deliveryContactPhone,
                                cargo.destination_location?.contact_person ||
                                  cargo.destination_contact ||
                                  cargo.deliveryContact
                              )
                            }
                          >
                            <Phone className="h-3 w-3" />
                            {t("common.call")}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Delivery Instructions */}
                  {cargo.delivery_instructions && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-600 font-medium">
                        {t("cargo.pickupInstructions") || "Instructions:"}
                      </p>
                      <p className="text-xs text-blue-800">
                        {cargo.delivery_instructions}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {t("common.distance")}: {cargo.distance_km || cargo.distance}{" "}
                  km
                </span>
                {cargo.vehicleType && (
                  <span className="text-sm text-gray-600">
                    • {t("common.vehicle")}: {cargo.vehicleType}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cargo Images Section */}
        {cargoImages?.images && cargoImages.images.length > 0 && (
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-indigo-50/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <ImageIcon className="h-5 w-5 text-indigo-600" />
                <h4 className="font-semibold text-gray-900">
                  {t("cargo.cargoImages") || "Cargo Images"} (
                  {cargoImages.images.length})
                </h4>
              </div>

              {isLoadingImages ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <span className="ml-2 text-sm text-gray-600">
                    {t("common.loadingImages") || "Loading images..."}
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {cargoImages.images.map((image: any) => (
                    <div
                      key={image.id}
                      className="relative group bg-gray-100 rounded-lg overflow-hidden aspect-square"
                    >
                      <img
                        src={image.image_url}
                        alt={
                          image.description ||
                          t("cargo.cargoImage") ||
                          "Cargo image"
                        }
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                      />

                      {/* Image overlay with info */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-end">
                        <div className="w-full p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                          <div className="text-white text-xs">
                            <p className="font-medium truncate">
                              {image.image_type
                                ?.replace("_", " ")
                                .toUpperCase() ||
                                t("common.image") ||
                                "IMAGE"}
                            </p>
                            {image.description && (
                              <p className="text-gray-200 truncate text-xs">
                                {image.description}
                              </p>
                            )}
                            {image.is_primary && (
                              <Badge className="bg-blue-500 text-white text-xs mt-1">
                                {t("common.primary") || "Primary"}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* View button */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-6 w-6 p-0 bg-white/90 hover:bg-white"
                          onClick={() => window.open(image.image_url, "_blank")}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Show more images indicator */}
              {cargoImages.total > cargoImages.images.length && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">
                    {t("cargo.showingImages", {
                      current: cargoImages.images.length,
                      total: cargoImages.total,
                    }) ||
                      `Showing ${cargoImages.images.length} of ${cargoImages.total} images`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Cargo Details and Additional Info - 2 cards per row on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Cargo Details */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-orange-50/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Package className="h-5 w-5 text-orange-600" />
                <h4 className="font-semibold text-gray-900">
                  {t("cargo.cargoDetails")}
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">{t("common.type")}</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {cargo.category?.name || cargo.type}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t("common.weight")}</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {cargo.weight_kg ? `${cargo.weight_kg} kg` : cargo.weight}
                  </p>
                </div>
                {canViewCostInfo() && (
                  <div>
                    <p className="text-xs text-gray-500">
                      {isDriverCargo
                        ? t("dashboard.earnings") || "Earnings"
                        : t("common.cost")}
                    </p>
                    <p className="text-sm font-bold text-green-600">
                      {isDriverCargo
                        ? cargo.earnings
                        : cargo.final_cost || cargo.estimated_cost || cargo.cost
                        ? new Intl.NumberFormat("rw-RW", {
                            style: "currency",
                            currency: "RWF",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(
                            parseInt(
                              cargo.final_cost ||
                                cargo.estimated_cost ||
                                cargo.cost.toString()
                            )
                          )
                        : "N/A"}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500">{t("common.status")}</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">
                    {cargo.status}
                  </p>
                </div>
                {cargo.volume && (
                  <div>
                    <p className="text-xs text-gray-500">{t("cargo.volume")}</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {cargo.volume} m³
                    </p>
                  </div>
                )}
                {cargo.dimensions && (
                  <div>
                    <p className="text-xs text-gray-500">
                      {t("cargo.dimensions")}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {cargo.dimensions.length}×{cargo.dimensions.width}×
                      {cargo.dimensions.height} cm
                    </p>
                  </div>
                )}
                {cargo.insurance_required && (
                  <div>
                    <p className="text-xs text-gray-500">
                      {t("cargo.insuranceRequired")}
                    </p>
                    <p className="text-sm font-semibold text-blue-600">
                      Required
                      {cargo.insurance_amount &&
                        ` - ${cargo.insurance_amount} RWF`}
                    </p>
                  </div>
                )}
                {cargo.fragile && (
                  <div>
                    <p className="text-xs text-gray-500">
                      {t("cargo.specialHandling") || "Special Handling"}
                    </p>
                    <p className="text-sm font-semibold text-orange-600">
                      Fragile
                    </p>
                  </div>
                )}
                {cargo.temperature_controlled && (
                  <div>
                    <p className="text-xs text-gray-500">
                      {t("cargo.specialHandling") || "Special Handling"}
                    </p>
                    <p className="text-sm font-semibold text-blue-600">
                      {t("cargo.temperatureControlled")}
                    </p>
                  </div>
                )}
                {cargo.delivery_instructions && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">
                      {t("cargo.deliveryInstructions")}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 bg-blue-50 p-2 rounded border">
                      {cargo.delivery_instructions}
                    </p>
                  </div>
                )}
              </div>
              {cargo.description && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Description</p>
                  <p className="text-sm text-gray-900">{cargo.description}</p>
                </div>
              )}
              {cargo.specialInstructions && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    {t("cargo.specialInstructions")}
                  </p>
                  <p className="text-sm text-gray-900">
                    {cargo.specialInstructions}
                  </p>
                </div>
              )}
              {cargo.estimatedTime && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    {t("cargo.estimatedTime") || "Estimated Time"}
                  </p>
                  <p className="text-sm text-gray-900">{cargo.estimatedTime}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="h-5 w-5 text-purple-600" />
                <h4 className="font-semibold text-gray-900">
                  {t("common.additionalInformation") ||
                    "Additional Information"}
                </h4>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">
                    {t("cargo.cargoNumber") || "Cargo Number"}
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {cargo.cargo_number || cargo.id}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">
                    {t("common.distance")}
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {cargo.distance}
                  </p>
                </div>
                {cargo.vehicleType && (
                  <div>
                    <p className="text-xs text-gray-500">
                      {t("vehicle.vehicleType")}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {cargo.vehicleType}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500">
                    {isDriverCargo ? "Assigned Date" : "Created Date"}
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {(isDriverCargo ? cargo.assignedDate : cargo.createdDate)
                      ? new Date(
                          isDriverCargo ? cargo.assignedDate : cargo.createdDate
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "N/A"}
                  </p>
                </div>
                {cargo.pickupDate && (
                  <div>
                    <p className="text-xs text-gray-500">
                      {t("cargo.pickupDate")}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(cargo.pickupDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                )}
                {cargo.deliveryDate && (
                  <div>
                    <p className="text-xs text-gray-500">
                      {t("cargo.deliveryDate")}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(cargo.deliveryDate).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Assignment System Actions */}
          {(cargo.delivery_assignment?.assignment_status === "pending" ||
            cargo.assignmentStatus === "pending") &&
            canDriverRespond() && (
              <div className="space-y-2">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800 font-medium mb-2">
                    Assignment Response Required
                  </p>
                  <p className="text-xs text-yellow-700">
                    {t("assignment.responseTimeRemaining", {
                      time: countdown || getTimeUntilExpiry(),
                    }) ||
                      `You have ${
                        countdown || getTimeUntilExpiry()
                      } to respond to this assignment.`}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={async () => {
                      try {
                        await onAcceptAssignment?.(
                          cargo.delivery_assignment?.id ||
                            cargo.assignmentId ||
                            cargo.id
                        );
                        // Invalidate queries to refresh data
                        invalidateCargoQueries(cargo.id);
                        toast({
                          title: t("assignment.acceptedSuccessfully"),
                          description:
                            t("assignment.acceptedSuccessfullyDescription") ||
                            "You have successfully accepted this assignment.",
                          variant: "default",
                        });
                        // Close modal if configured
                        if (closeOnSuccess) {
                          setTimeout(() => {
                            onClose();
                          }, 1500);
                        }
                      } catch (error: any) {
                        toast({
                          title: t("assignment.failedToAccept"),
                          description:
                            error?.response?.data?.message ||
                            error?.message ||
                            t("assignment.failedToAcceptDescription") ||
                            "Failed to accept assignment. Please try again.",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {t("assignment.acceptAssignment") || "Accept Assignment"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                    onClick={() => setIsRejectModalOpen(true)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    {t("assignment.rejectAssignment")}
                  </Button>
                </div>
              </div>
            )}

          {/* Assignment Expired */}
          {(cargo.delivery_assignment?.assignment_status === "pending" ||
            cargo.assignmentStatus === "pending") &&
            isAssignmentExpired() && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800 font-medium">
                  {t("assignment.expired") || "Assignment Expired"}
                </p>
                <p className="text-xs text-red-700">
                  {t("assignment.expiredDescription") ||
                    "This assignment has expired and will be automatically rejected."}
                </p>
              </div>
            )}

          {/* Admin Assignment Management */}
          {canAdminManage() && (
            <div className="space-y-2">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800 font-medium mb-2">
                  {t("assignment.management") || "Assignment Management"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={async () => {
                    const vehicleId = prompt(
                      t("assignment.enterVehicleId") || "Enter new vehicle ID:"
                    );
                    if (vehicleId) {
                      try {
                        await onChangeVehicle?.(
                          cargo.delivery_assignment?.id ||
                            cargo.assignmentId ||
                            cargo.id,
                          vehicleId
                        );
                        // Invalidate queries to refresh data
                        invalidateCargoQueries(cargo.id);
                        toast({
                          title:
                            t("assignment.vehicleChanged") || "Vehicle Changed",
                          description:
                            t("assignment.vehicleChangedDescription") ||
                            "The vehicle has been changed successfully.",
                          variant: "default",
                        });
                        // Close modal if configured
                        if (closeOnSuccess) {
                          setTimeout(() => {
                            onClose();
                          }, 1500);
                        }
                      } catch (error: any) {
                        toast({
                          title:
                            t("assignment.vehicleChangeFailed") ||
                            "Failed to Change Vehicle",
                          description:
                            error?.response?.data?.message ||
                            error?.message ||
                            t("assignment.vehicleChangeFailedDescription") ||
                            "Failed to change vehicle. Please try again.",
                          variant: "destructive",
                        });
                      }
                    }
                  }}
                >
                  <Truck className="h-4 w-4 mr-2" />
                  {t("assignment.changeVehicle") || "Change Vehicle"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                  onClick={async () => {
                    try {
                      await onCancelAssignment?.(
                        cargo.delivery_assignment?.id ||
                          cargo.assignmentId ||
                          cargo.id
                      );
                      // Invalidate queries to refresh data
                      invalidateCargoQueries(cargo.id);
                      toast({
                        title: t("assignment.cancelledSuccessfully"),
                        description:
                          t("assignment.cancelledSuccessfullyDescription") ||
                          "The assignment has been cancelled successfully.",
                        variant: "default",
                      });
                      // Close modal if configured
                      if (closeOnSuccess) {
                        setTimeout(() => {
                          onClose();
                        }, 1500);
                      }
                    } catch (error: any) {
                      toast({
                        title:
                          t("assignment.cancelFailed") ||
                          "Failed to Cancel Assignment",
                        description:
                          error?.response?.data?.message ||
                          error?.message ||
                          t("assignment.cancelFailedDescription") ||
                          "Failed to cancel assignment. Please try again.",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  {t("assignment.cancelAssignment") || "Cancel Assignment"}
                </Button>
              </div>
            </div>
          )}

          {/* Admin Actions - Based on Status Transition Matrix */}
          {(() => {
            const isAdmin =
              effectiveRole === UserRole.ADMIN ||
              effectiveRole === UserRole.SUPER_ADMIN;

            if (!isAdmin) return null;

            const adminActions = getAvailableAdminActions();

            return adminActions.length > 0 ? (
              <div className="space-y-2">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800 font-medium mb-2">
                    Admin Actions
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {adminActions.map((action) => (
                    <Button
                      key={action.key}
                      variant={action.variant}
                      className={`w-full ${action.className || ""}`}
                      onClick={action.onClick}
                      title={action.description}
                    >
                      {action.icon}
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null;
          })()}

          {/* Driver Actions */}
          {effectiveRole === UserRole.DRIVER && (
            <>
              {cargo.status === "pending" &&
                !(
                  (cargo.delivery_assignment?.assignment_status === "pending" ||
                    cargo.assignmentStatus === "pending") &&
                  canDriverRespond()
                ) && (
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={async () => {
                      try {
                        await onAccept?.(cargo.id);
                        // Invalidate queries to refresh data
                        invalidateCargoQueries(cargo.id);
                        toast({
                          title: t("cargo.accepted") || "Cargo Accepted",
                          description:
                            t("cargo.acceptedDescription") ||
                            "You have successfully accepted this cargo.",
                          variant: "default",
                        });
                        // Close modal if configured
                        if (closeOnSuccess) {
                          setTimeout(() => {
                            onClose();
                          }, 1500);
                        }
                      } catch (error: any) {
                        toast({
                          title: "Failed to Accept Cargo",
                          description:
                            error?.response?.data?.message ||
                            error?.message ||
                            "Failed to accept cargo. Please try again.",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {t("cargoTable.actions.acceptCargo")}
                  </Button>
                )}

              {cargo.status === "assigned" && (
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={handleMarkPickedUp}
                >
                  <Package className="h-4 w-4 mr-2" />
                  {t("cargoTable.actions.markPickedUp")}
                </Button>
              )}

              {cargo.status === "picked_up" && (
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={async () => {
                    try {
                      await onStartDelivery?.(cargo.id);
                      // Invalidate queries to refresh data
                      invalidateCargoQueries(cargo.id);
                      toast({
                        title: "Transit Started",
                        description:
                          "Cargo is now in transit. You can track it in real-time.",
                        variant: "default",
                      });
                      // Navigate to tracking page
                      navigate(`/tracking/${cargo.id}`);
                      // Close modal
                      if (closeOnSuccess) {
                        setTimeout(() => {
                          onClose();
                        }, 1000);
                      }
                    } catch (error: any) {
                      toast({
                        title:
                          t("delivery.transitFailed") ||
                          "Failed to Start Transit",
                        description:
                          error?.response?.data?.message ||
                          error?.message ||
                          t("delivery.transitFailedDescription") ||
                          "Failed to start transit. Please try again.",
                        variant: "destructive",
                      });
                    }
                  }}
                  disabled={isStartingDelivery}
                >
                  {isStartingDelivery ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t("delivery.startingTransit") || "Starting Transit..."}
                    </>
                  ) : (
                    <>
                      <Navigation className="h-4 w-4 mr-2" />
                      {t("delivery.startTransit")}
                    </>
                  )}
                </Button>
              )}

              {cargo.status === "in_transit" && (
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handleMarkDelivered}
                  disabled={isUploadingDeliveryImages}
                >
                  {isUploadingDeliveryImages ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t("delivery.markingDelivered") || "Marking Delivered..."}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {t("cargoTable.actions.markDelivered")}
                    </>
                  )}
                </Button>
              )}

              {/* Call Client Button for Drivers */}
              {cargo.client && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    onCallClient?.(cargo.clientPhone || cargo.phone)
                  }
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Client
                </Button>
              )}
            </>
          )}

          {/* Client Actions */}
          {effectiveRole === UserRole.CLIENT && (
            <>
              {/* Show call driver button when driver is assigned */}
              {cargo.driver &&
                cargo.driverPhone &&
                ["assigned", "picked_up", "in_transit"].includes(
                  cargo.status
                ) && (
                  <Button
                    variant="default"
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() =>
                      onCallDriver?.(cargo.driverPhone || cargo.phone)
                    }
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    {t("cargoTable.actions.callDriver")}
                  </Button>
                )}

              {/* Cancellation is only allowed before picked_up status */}
              {[
                "pending",
                "quoted",
                "accepted",
                "assigned",
                "fully_assigned",
                "partially_assigned",
              ].includes(cargo.status) && (
                <Button
                  variant="outline"
                  className="w-full text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                  onClick={async () => {
                    try {
                      await onCancelCargo?.(cargo.id);
                      // Invalidate queries to refresh data
                      invalidateCargoQueries(cargo.id);
                      toast({
                        title: t("cargo.cargoCancelled"),
                        description:
                          t("cargo.cancelledSuccessfullyDescription") ||
                          "The cargo has been cancelled successfully.",
                        variant: "default",
                      });
                      // Close modal if configured
                      if (closeOnSuccess) {
                        setTimeout(() => {
                          onClose();
                        }, 1500);
                      }
                    } catch (error: any) {
                      toast({
                        title: "Failed to Cancel Cargo",
                        description:
                          error?.response?.data?.message ||
                          error?.message ||
                          "Failed to cancel cargo. Please try again.",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  {t("cargoTable.actions.cancelCargo")}
                </Button>
              )}

              {/* Track cargo button */}
              {["assigned", "picked_up", "in_transit"].includes(
                cargo.status
              ) && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    // Navigate to tracking page
                    navigate(`/tracking/${cargo.id}`);
                    // Close modal
                    onClose();
                  }}
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Track Cargo
                </Button>
              )}

              {cargo.status === "delivered" && (
                <>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => onDownloadReceipt?.(cargo.id)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {t("cargoTable.actions.downloadReceipt")}
                  </Button>

                  {/* Rating Button - Show if not rated yet and user has permission */}
                  {!cargo.isRated &&
                    !cargo.rating &&
                    (effectiveRole === UserRole.CLIENT ||
                      effectiveRole === UserRole.ADMIN ||
                      effectiveRole === UserRole.SUPER_ADMIN) && (
                      <Button
                        className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold shadow-lg"
                        onClick={handleRateDelivery}
                      >
                        <Star className="h-4 w-4 mr-2 fill-current" />
                        Rate Delivery
                      </Button>
                    )}

                  {/* Show existing rating if rated */}
                  {cargo.isRated && cargo.rating && (
                    <div className="w-full p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Star className="h-5 w-5 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium text-gray-800">
                            {t("delivery.yourRating") || "Your Rating"}:{" "}
                            {cargo.rating}/5
                          </span>
                        </div>
                        <Badge className="bg-green-100 text-green-700">
                          Rated
                        </Badge>
                      </div>
                      {cargo.review && (
                        <p className="text-xs text-gray-600 mt-2 italic">
                          "{cargo.review}"
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* <Button
            variant="outline"
            className="w-full text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
            onClick={() => onReportIssue?.(cargo.id)}
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Report Issue
          </Button> */}
        </div>
      </div>

      {/* Reject Assignment Modal */}
      <RejectAssignmentModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleRejectAssignment}
        isLoading={isRejecting}
      />

      {/* Pickup Image Upload Modal */}
      <PhotoUploadModal
        isOpen={isPickupImageModalOpen}
        onClose={() => setIsPickupImageModalOpen(false)}
        cargoId={cargo.id}
        cargoNumber={cargo.cargo_number}
        uploadType="loading"
        onUpload={handlePickupImageUpload}
        submitButtonText={t("delivery.confirmPickup")}
      />

      {/* Delivery Image Upload Modal */}
      <PhotoUploadModal
        isOpen={isDeliveryImageModalOpen}
        onClose={() => setIsDeliveryImageModalOpen(false)}
        cargoId={cargo.id}
        cargoNumber={cargo.cargo_number}
        uploadType="delivery"
        onUpload={handleDeliveryImageUpload}
        submitButtonText={t("delivery.confirmDelivery")}
      />

      {/* Rating Modal */}
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        cargoId={cargo.id}
        cargoNumber={cargo.cargo_number}
        onRate={handleSubmitRating}
        isLoading={rateDelivery.isPending}
      />
    </ModernModel>
  );
}
