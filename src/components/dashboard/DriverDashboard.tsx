import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Truck,
  Clock,
  CheckCircle,
  Navigation,
  MapPin,
  Phone,
  Camera,
  User,
  AlertCircle,
  Route,
  Star,
  Eye,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  RefreshCw,
  Calendar,
} from "lucide-react";
import { TrackingComponent } from "./TrackingComponent";
import { StatsCard } from "@/components/ui/StatsCard";
import { useDriverDashboard, useUpdateDriverStatus } from "@/lib/api/hooks";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { customToast } from "@/lib/utils/toast";
import { DriverStatus } from "@/types/shared";
import { mapDashboardCargosToCargoDetails } from "@/lib/utils/cargoMapper";
import {
  useAcceptAssignment,
  useRejectAssignment,
  useMyAssignments,
} from "@/lib/api/hooks/assignmentHooks";
import {
  DriverDashboardData,
  PendingAssignment,
  AcceptedAssignment,
  RejectedAssignment,
  AssignmentNotifications,
  AssignedCargo,
  RecentDelivery,
  ActiveDelivery,
  DriverProfile,
  DriverStats,
  VehicleInfo,
} from "@/types/dashboard";

export function DriverDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [driverStatus, setDriverStatus] = useState<
    "available" | "on_duty" | "unavailable"
  >("available");
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  const [showLiveTracking, setShowLiveTracking] = useState(false);

  // Rejection modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>("");
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [rejectionNotes, setRejectionNotes] = useState<string>("");

  // API hooks - Using only DashboardService.getDriverDashboard() for all data
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useDriverDashboard();

  // Type the dashboard data properly - handle both old and new structure
  const dashboard = dashboardData?.data as any;

  const updateStatusMutation = useUpdateDriverStatus();

  // Assignment system hooks
  const acceptAssignmentMutation = useAcceptAssignment();
  const rejectAssignmentMutation = useRejectAssignment();

  const statusConfig = {
    available: {
      label: t("status.available"),
      color: "bg-green-100 text-green-600",
    },
    on_duty: { label: t("status.onDuty"), color: "bg-blue-100 text-blue-600" },
    unavailable: {
      label: t("status.unavailable"),
      color: "bg-gray-100 text-gray-600",
    },
  };

  // Get data from dashboard service - all data comes from single API call
  const activeDelivery = dashboard?.active_delivery;
  const assignedCargos = dashboard?.assigned_cargos || [];
  const recentDeliveries = dashboard?.recent_deliveries || [];

  // New assignment system data (may not exist in current API)
  const pendingAssignments = (dashboard as any)?.pending_assignments || [];
  const acceptedAssignments = (dashboard as any)?.accepted_assignments || [];
  const recentRejections = (dashboard as any)?.recent_rejections || [];
  const notifications = (dashboard as any)?.notifications;

  // Stats data for driver dashboard - Updated for new assignment system
  const driverStatsData = [
    {
      title: t("dashboard.pendingAssignments"),
      value: (dashboard?.stats as any)?.pending_assignments?.toString() || "0",
      description: t("dashboard.awaitingResponse"),
      icon: Clock,
      iconColor: "text-yellow-600",
      bgColor: "bg-gradient-to-br from-yellow-50 to-yellow-100",
      borderColor: "border-yellow-200",
    },
    {
      title: t("dashboard.acceptedAssignments"),
      value: (dashboard?.stats as any)?.accepted_assignments?.toString() || "0",
      description: t("dashboard.readyToDeliver"),
      icon: Package,
      iconColor: "text-orange-600",
      bgColor: "bg-gradient-to-br from-orange-50 to-orange-100",
      borderColor: "border-orange-200",
    },
    {
      title: t("status.completed"),
      value: dashboard?.stats?.completed_deliveries?.toString() || "0",
      description: t("dashboard.allTime"),
      icon: CheckCircle,
      iconColor: "text-blue-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
      borderColor: "border-blue-200",
    },
    {
      title: t("common.rating"),
      value: dashboard?.stats?.rating?.toFixed(1) || "0.0",
      description: "★★★★☆",
      icon: Star,
      iconColor: "text-pink-600",
      bgColor: "bg-gradient-to-br from-pink-50 to-pink-100",
      borderColor: "border-pink-200",
    },
  ];

  const handleViewAllCargos = () => {
    navigate("/driver/cargos");
  };

  const handleViewAllDeliveries = () => {
    navigate("/driver/deliveries");
  };

  const handleViewAllCompleted = () => {
    navigate("/driver/history");
  };

  const handleViewAllRatings = () => {
    navigate("/driver/ratings");
  };

  const handleStartDelivery = () => {
    setShowLiveTracking(true);
  };

  const handleStatusChange = async (
    newStatus: "available" | "on_duty" | "unavailable"
  ) => {
    try {
      await updateStatusMutation.mutateAsync(newStatus as DriverStatus);
      setDriverStatus(newStatus);
      customToast.success(t("driver.statusUpdated"));
      refetchDashboard();
    } catch (error) {
      customToast.error(t("errors.serverError"));
    }
  };

  const handleRefresh = () => {
    refetchDashboard();
  };

  // Assignment handling functions
  const handleAcceptAssignment = async (assignmentId: string) => {
    try {
      await acceptAssignmentMutation.mutateAsync({
        assignmentId,
        data: { notes: "Accepted from dashboard" },
      });
      customToast.success(t("assignment.acceptedSuccessfully"));
      refetchDashboard();
    } catch (error: any) {
      customToast.error(error.message || t("assignment.failedToAccept"));
    }
  };

  const handleRejectAssignment = async (
    assignmentId: string,
    reason: string
  ) => {
    try {
      await rejectAssignmentMutation.mutateAsync({
        assignmentId,
        data: { reason, notes: t("assignment.rejectedFromDashboard") },
      });
      customToast.success(t("assignment.rejectedSuccessfully"));
      refetchDashboard();
    } catch (error: any) {
      customToast.error(error.message || t("assignment.failedToReject"));
    }
  };

  // Open rejection modal
  const handleOpenRejectModal = (assignmentId: string) => {
    setSelectedAssignmentId(assignmentId);
    setRejectionReason("");
    setRejectionNotes("");
    setShowRejectModal(true);
  };

  // Handle rejection from modal
  const handleRejectFromModal = async () => {
    if (!rejectionReason.trim()) {
      customToast.error(t("assignment.provideRejectionReason"));
      return;
    }

    try {
      await rejectAssignmentMutation.mutateAsync({
        assignmentId: selectedAssignmentId,
        data: {
          reason: rejectionReason,
          notes: rejectionNotes || "Rejected from dashboard",
        },
      });
      customToast.success("Assignment rejected");
      setShowRejectModal(false);
      refetchDashboard();
    } catch (error: any) {
      customToast.error(error.message || t("assignment.failedToReject"));
    }
  };

  // Close rejection modal
  const handleCloseRejectModal = () => {
    setShowRejectModal(false);
    setSelectedAssignmentId("");
    setRejectionReason("");
    setRejectionNotes("");
  };

  // Loading state
  if (dashboardLoading) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Stats Card Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card
              key={i}
              className="bg-white shadow-lg rounded-2xl overflow-hidden"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (dashboardError) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("navigation.dashboard")}
            </h1>
            <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
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
                  {dashboardError?.message || t("dashboard.loadError")}
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
    <div className="space-y-8">
      {/* Welcome Header with Driver Info */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              {/* Driver Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
                  {dashboard?.driver_info?.avatar_url ? (
                    <img
                      src={dashboard.driver_info.avatar_url}
                      alt={dashboard.driver_info.name}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 sm:w-8 sm:h-8 text-white/80" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                </div>
              </div>

              {/* Driver Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 leading-tight">
                  Welcome back,{" "}
                  <span className="break-words">
                    {dashboard?.driver_info?.name ||
                      user?.full_name ||
                      t("common.driver")}
                  </span>
                  !
                </h1>
                <p className="text-blue-100 text-sm sm:text-base lg:text-lg mb-2 sm:mb-3">
                  {t("dashboard.readyToMakeDeliveries")}
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                    <span className="font-semibold">
                      {dashboard?.driver_info?.rating?.toFixed(1) || "0.0"}
                    </span>
                    <span className="text-blue-200">{t("common.rating")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-3 h-3 sm:w-4 sm:h-4 text-blue-200" />
                    <span className="font-semibold">
                      {dashboard?.driver_info?.total_deliveries || 0}
                    </span>
                    <span className="text-blue-200">
                      {t("dashboard.deliveries")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500/20 text-green-200 border-green-400/30 text-xs">
                      {dashboard?.driver_info?.status || driverStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={dashboardLoading}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 w-full sm:w-auto"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${
                    dashboardLoading ? "animate-spin" : ""
                  }`}
                />
                {t("common.refresh")}
              </Button>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-xs sm:text-sm font-medium text-blue-100">
                  {t("common.status")}:
                </span>
                <Select
                  onValueChange={handleStatusChange}
                  defaultValue={driverStatus}
                >
                  <SelectTrigger className="w-full sm:w-[160px] lg:w-[180px] bg-white/10 border-white/30 text-white">
                    <SelectValue placeholder={t("common.select")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">
                      {t("status.available")}
                    </SelectItem>
                    <SelectItem value="on_duty">
                      {t("status.onDuty")}
                    </SelectItem>
                    <SelectItem value="unavailable">
                      {t("status.unavailable")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
      </div>

      {/* Stats Cards - Modern Design */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {driverStatsData.map((stat, index) => (
          <Card
            key={index}
            className={`${stat.bgColor} ${stat.borderColor} border-2 hover:shadow-lg transition-all duration-300 rounded-xl sm:rounded-2xl overflow-hidden group`}
          >
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <div className="space-y-1 sm:space-y-2">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                    {stat.title}
                  </p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    {stat.description}
                  </p>
                </div>
                <div
                  className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/50 group-hover:scale-110 transition-transform duration-300 self-start sm:self-auto`}
                >
                  <stat.icon
                    className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 ${stat.iconColor}`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Active Delivery with Live Tracking */}
        <div className="lg:col-span-2">
          <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl sm:rounded-2xl overflow-hidden border-0">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 p-4 sm:p-6">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-gray-900">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Navigation className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold">
                      {t("navigation.activeDeliveries")}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 font-normal">
                      {t("dashboard.currentDeliveryInProgress")}
                    </p>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              {activeDelivery ? (
                <>
                  {showLiveTracking ? (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="p-2 sm:p-3 bg-blue-100 rounded-lg sm:rounded-xl">
                            <Package className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                              {activeDelivery?.cargo_number ||
                                activeDelivery?.cargo_id}
                            </h3>
                            <p className="text-sm text-gray-600 truncate">
                              {t("common.client")}:{" "}
                              {activeDelivery?.client_name}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowLiveTracking(false)}
                          className="border-gray-300 hover:bg-gray-50 w-full sm:w-auto"
                        >
                          {t("common.hide")} {t("tracking.tracking")}
                        </Button>
                      </div>
                      <TrackingComponent height="h-80" />
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="p-2 sm:p-3 bg-blue-100 rounded-lg sm:rounded-xl">
                            <Package className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                              {activeDelivery?.cargo_number ||
                                activeDelivery?.cargo_id}
                            </h3>
                            <p className="text-sm text-gray-600 truncate">
                              {t("common.client")}:{" "}
                              {activeDelivery?.client_name}
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={
                            activeDelivery?.priority === "urgent"
                              ? "bg-orange-100 text-orange-700 border-orange-200"
                              : "bg-blue-100 text-blue-700 border-blue-200"
                          }
                        >
                          {t(
                            `priority.${activeDelivery?.priority || "normal"}`
                          )}
                        </Badge>
                      </div>

                      {/* Route */}
                      <div className="space-y-3 sm:space-y-4 p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl border border-gray-200">
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              {t("tracking.from")}
                            </p>
                            <p className="text-sm font-semibold text-gray-900 mt-1 break-words">
                              {activeDelivery?.pickup_address}
                            </p>
                            <p className="text-xs text-green-600 font-medium mt-1">
                              {activeDelivery?.pickup_time}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4 pl-6 sm:pl-8">
                          <div className="w-px h-6 sm:h-8 bg-gray-300"></div>
                        </div>

                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full mt-1 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              {t("tracking.to")}
                            </p>
                            <p className="text-sm font-semibold text-gray-900 mt-1 break-words">
                              {activeDelivery?.delivery_address}
                            </p>
                            <p className="text-xs text-red-600 font-medium mt-1">
                              {activeDelivery?.estimated_delivery_time}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Cargo Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-200">
                          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                            {t("common.type")}
                          </p>
                          <p className="font-bold text-gray-900 mt-1">
                            {activeDelivery?.cargo_type}
                          </p>
                        </div>
                        <div className="p-3 sm:p-4 bg-purple-50 rounded-xl border border-purple-200">
                          <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                            {t("common.weight")}
                          </p>
                          <p className="font-bold text-gray-900 mt-1">
                            {activeDelivery?.weight} kg
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Button
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                          onClick={handleStartDelivery}
                        >
                          <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                          {t("delivery.startDelivery")}
                        </Button>
                        <Button
                          variant="outline"
                          className="border-gray-300 hover:bg-gray-50 py-3 rounded-xl font-semibold"
                        >
                          <Phone className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                          {t("common.call")} {t("common.client")}
                        </Button>
                        <Button
                          variant="outline"
                          className="border-gray-300 hover:bg-gray-50 py-3 rounded-xl font-semibold"
                        >
                          <Camera className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                          {t("common.upload")} {t("delivery.uploadProof")}
                        </Button>
                        <Button
                          variant="outline"
                          className="text-orange-600 border-orange-300 hover:bg-orange-50 py-3 rounded-xl font-semibold"
                        >
                          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                          {t("common.report")} {t("common.issue")}
                        </Button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <Package className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    {t("dashboard.noActiveDeliveries")}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4">
                    {t("dashboard.noActiveDeliveriesDescription")}
                  </p>
                  <Button
                    onClick={handleViewAllCargos}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-xl font-semibold"
                  >
                    {t("dashboard.viewAssignedCargos")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pending Assignments */}
        <div>
          <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl sm:rounded-2xl overflow-hidden border-0">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-yellow-100 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-gray-900">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold">
                        {t("dashboard.pendingAssignments")}
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-600 font-normal">
                        {t("dashboard.awaitingYourResponse")}
                      </p>
                    </div>
                  </div>
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewAllCargos}
                  className="border-yellow-300 text-yellow-600 hover:bg-yellow-50 w-full sm:w-auto"
                >
                  {t("common.viewAll")}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="h-80 sm:h-96 overflow-y-auto p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {pendingAssignments.length > 0 ? (
                  pendingAssignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="p-4 sm:p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl border border-gray-200 hover:shadow-md transition-all duration-300 space-y-3 sm:space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Package className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                          </div>
                          <span className="font-bold text-gray-900 text-sm sm:text-base truncate">
                            {assignment.cargo.cargo_number}
                          </span>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs">
                          {t("dashboard.expiresIn")}{" "}
                          {Math.floor(assignment.time_remaining / 60)}m
                        </Badge>
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              {t("common.client")}
                            </p>
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {assignment.cargo.client.name}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              {t("common.destination")}
                            </p>
                            <p className="text-sm font-semibold text-blue-600 truncate">
                              {assignment.cargo.delivery_location?.address ||
                                t("common.locationTBD")}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="p-2 sm:p-3 bg-white rounded-lg border border-gray-200">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {t("common.weight")}
                          </p>
                          <p className="font-semibold text-gray-900 mt-1 text-sm sm:text-base">
                            {assignment.cargo.weight} kg
                          </p>
                        </div>
                        <div className="p-2 sm:p-3 bg-white rounded-lg border border-gray-200">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {t("common.value")}
                          </p>
                          <p className="font-semibold text-gray-900 mt-1 text-sm sm:text-base">
                            ${assignment.cargo.value}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl font-semibold text-sm"
                          onClick={() => handleAcceptAssignment(assignment.id)}
                        >
                          {t("common.accept")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50 py-2 rounded-xl font-semibold text-sm"
                          onClick={() => handleOpenRejectModal(assignment.id)}
                        >
                          {t("common.reject")}
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                      <Clock className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                      {t("dashboard.noPendingAssignments")}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4">
                      {t("dashboard.noPendingAssignmentsDescription")}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Assigned Cargos Section */}
      {assignedCargos.length > 0 && (
        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 shadow-lg rounded-xl sm:rounded-2xl overflow-hidden">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Package className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-orange-900">
                  {t("dashboard.assignedCargos")} ({assignedCargos.length})
                </h3>
                <p className="text-sm text-orange-700">
                  {t("dashboard.assignedCargosDescription", {
                    count: assignedCargos.length,
                  })}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-3">
              {assignedCargos.slice(0, 3).map((cargo) => (
                <div
                  key={cargo.cargo_id}
                  className="p-3 rounded-lg border bg-white border-gray-200 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-2 bg-orange-500"></div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {cargo.cargo_number}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {t("common.client")}: {cargo.client_name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {t("common.from")}: {cargo.pickup_address}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t("common.to")}: {cargo.delivery_address}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                          {cargo.cargo_type}
                        </Badge>
                        <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                          {cargo.weight} kg
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Cards with View All Buttons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Recent Deliveries */}
        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl sm:rounded-2xl overflow-hidden border-0">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-gray-900">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold">
                      {t("dashboard.recentActivity")}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 font-normal">
                      {t("dashboard.latestDeliveries")}
                    </p>
                  </div>
                </div>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewAllDeliveries}
                className="border-purple-300 text-purple-600 hover:bg-purple-50 w-full sm:w-auto"
              >
                {t("common.viewAll")}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {recentDeliveries.slice(0, 3).map((delivery) => (
                <div
                  key={delivery.cargo_id}
                  className="p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-2 sm:mb-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Package className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-900 text-sm sm:text-base truncate">
                          {delivery.cargo_number || delivery.cargo_id}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {delivery.client_name}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={
                        delivery.status === "delivered"
                          ? "bg-green-100 text-green-700 border-green-200 text-xs"
                          : "bg-yellow-100 text-yellow-700 border-yellow-200 text-xs"
                      }
                    >
                      {t(`status.${delivery.status}`)}
                    </Badge>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm gap-2 sm:gap-0">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm">
                        {delivery.delivery_date
                          ? new Date(delivery.delivery_date).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : t("common.notAvailable")}
                      </span>
                    </div>
                    {delivery.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
                        <span className="font-semibold text-gray-900 text-sm sm:text-base">
                          {delivery.rating}
                        </span>
                      </div>
                    )}
                  </div>

                  {delivery.review && (
                    <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-xs sm:text-sm text-gray-700 italic">
                        "{delivery.review}"
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Driver Performance & Vehicle Info */}
        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl sm:rounded-2xl overflow-hidden border-0">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-gray-900">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold">
                      {t("driver.driverDetails")}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 font-normal">
                      {t("dashboard.performanceAndVehicle")}
                    </p>
                  </div>
                </div>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewAllRatings}
                className="border-indigo-300 text-indigo-600 hover:bg-indigo-50 w-full sm:w-auto"
              >
                {t("common.viewAll")}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Performance Stats */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                {t("dashboard.performance")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                    <div>
                      <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wide">
                        {t("common.rating")}
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-gray-900">
                        {dashboard?.stats?.rating?.toFixed(1) || "0.0"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    <div>
                      <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                        {t("status.completed")}
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-gray-900">
                        {dashboard?.stats?.completed_deliveries || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            {dashboard?.vehicle_info && (
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  {t("dashboard.vehicleInformation")}
                </h3>
                <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                      <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                        <p className="text-base sm:text-lg font-bold text-gray-900">
                          {dashboard.vehicle_info.plate_number}
                        </p>
                        <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                          {dashboard.vehicle_info.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {dashboard.vehicle_info.make}{" "}
                        {dashboard.vehicle_info.model}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {dashboard.vehicle_info.type} •{" "}
                        {t("dashboard.insuranceExpires")}:{" "}
                        {dashboard.vehicle_info.insurance_expiry
                          ? new Date(
                              dashboard.vehicle_info.insurance_expiry
                            ).toLocaleDateString()
                          : t("common.notAvailable")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Driver Status */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                {t("dashboard.currentStatus")}
              </h3>
              <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-semibold text-gray-900">
                    {t("common.status")}
                  </span>
                </div>
                <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                  {statusConfig[driverStatus].label}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rejection Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("assignment.rejectAssignment")}</DialogTitle>
            <DialogDescription>
              {t("assignment.rejectAssignmentDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">
                {t("assignment.reasonForRejection")} *
              </Label>
              <Select
                value={rejectionReason}
                onValueChange={setRejectionReason}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("assignment.selectReason")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_available">
                    {t("assignment.notAvailable")}
                  </SelectItem>
                  <SelectItem value="vehicle_issue">
                    {t("assignment.vehicleIssue")}
                  </SelectItem>
                  <SelectItem value="personal_emergency">
                    {t("assignment.personalEmergency")}
                  </SelectItem>
                  <SelectItem value="route_unsuitable">
                    {t("assignment.routeUnsuitable")}
                  </SelectItem>
                  <SelectItem value="cargo_too_heavy">
                    {t("assignment.cargoTooHeavy")}
                  </SelectItem>
                  <SelectItem value="schedule_conflict">
                    {t("assignment.scheduleConflict")}
                  </SelectItem>
                  <SelectItem value="other">{t("common.other")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">{t("assignment.additionalNotes")}</Label>
              <Textarea
                id="notes"
                placeholder={t("assignment.provideAdditionalDetails")}
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseRejectModal}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectFromModal}
              disabled={!rejectionReason.trim()}
            >
              {t("assignment.rejectAssignment")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
