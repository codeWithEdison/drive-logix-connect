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

export function DriverDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [driverStatus, setDriverStatus] = useState<
    "available" | "on_duty" | "unavailable"
  >("available");
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  const [showLiveTracking, setShowLiveTracking] = useState(false);

  // API hooks - Using only DashboardService.getDriverDashboard() for all data
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useDriverDashboard();

  const updateStatusMutation = useUpdateDriverStatus();

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
  const activeDelivery = dashboardData?.data?.active_delivery;
  const assignedCargos = mapDashboardCargosToCargoDetails(
    dashboardData?.data?.assigned_cargos || []
  );
  const recentDeliveries = dashboardData?.data?.recent_deliveries || [];

  // Stats data for driver dashboard
  const driverStatsData = [
    {
      title: t("navigation.assignedCargos"),
      value: dashboardData?.data?.stats?.assigned_cargos?.toString() || "0",
      description: t("common.fromLastWeek"),
      icon: Package,
      iconColor: "text-orange-600",
    },
    {
      title: t("navigation.activeDeliveries"),
      value: dashboardData?.data?.stats?.active_deliveries?.toString() || "0",
      description: t("status.active"),
      icon: Clock,
      iconColor: "text-green-600",
    },
    {
      title: t("status.completed"),
      value:
        dashboardData?.data?.stats?.completed_deliveries?.toString() || "0",
      description: t("common.total"),
      icon: CheckCircle,
      iconColor: "text-blue-600",
    },
    {
      title: t("common.rating"),
      value: dashboardData?.data?.stats?.rating?.toFixed(1) || "0.0",
      description: "★★★★☆",
      icon: Star,
      iconColor: "text-pink-600",
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
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t("navigation.dashboard")}
          </h1>
          <p className="text-muted-foreground">
            {t("dashboard.welcome")}, {user?.full_name || t("common.driver")}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={dashboardLoading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${
                dashboardLoading ? "animate-spin" : ""
              }`}
            />
            {t("common.refresh")}
          </Button>
          <Badge className={statusConfig[driverStatus].color}>
            {statusConfig[driverStatus].label}
          </Badge>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{t("common.status")}:</span>
            <Select
              onValueChange={handleStatusChange}
              defaultValue={driverStatus}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("common.select")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">
                  {t("status.available")}
                </SelectItem>
                <SelectItem value="on_duty">{t("status.onDuty")}</SelectItem>
                <SelectItem value="unavailable">
                  {t("status.unavailable")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Stats Cards - Individual components */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {driverStatsData.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            iconColor={stat.iconColor}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Delivery with Live Tracking */}
        <div className="lg:col-span-2">
          <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Navigation className="h-5 w-5 text-blue-600" />
                {t("navigation.activeDeliveries")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {activeDelivery ? (
                <>
                  {showLiveTracking ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {activeDelivery?.cargo_id}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {t("common.client")}: {activeDelivery?.client_name}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowLiveTracking(false)}
                        >
                          {t("common.hide")} {t("tracking.tracking")}
                        </Button>
                      </div>
                      <TrackingComponent height="h-80" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {activeDelivery?.cargo_id}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {t("common.client")}: {activeDelivery?.client_name}
                          </p>
                        </div>
                        <Badge
                          className={
                            activeDelivery?.priority === "urgent"
                              ? "bg-orange-100 text-orange-600"
                              : "bg-blue-100 text-blue-600"
                          }
                        >
                          {t(
                            `priority.${activeDelivery?.priority || "normal"}`
                          )}
                        </Badge>
                      </div>

                      {/* Route */}
                      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full mt-1"></div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium">
                              {t("tracking.from")}
                            </p>
                            <p className="text-sm font-semibold">
                              {activeDelivery?.pickup_address}
                            </p>
                            <p className="text-xs text-green-600">
                              {activeDelivery?.pickup_time}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pl-6">
                          <div className="w-px h-8 bg-gray-300"></div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full mt-1"></div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium">
                              {t("tracking.to")}
                            </p>
                            <p className="text-sm font-semibold">
                              {activeDelivery?.delivery_address}
                            </p>
                            <p className="text-xs text-red-600">
                              {activeDelivery?.estimated_delivery_time}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Cargo Details */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {t("common.type")}
                          </p>
                          <p className="font-semibold">
                            {activeDelivery?.cargo_type}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {t("common.weight")}
                          </p>
                          <p className="font-semibold">
                            {activeDelivery?.weight} kg
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          className="bg-gradient-primary hover:bg-primary-hover"
                          onClick={handleStartDelivery}
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          {t("delivery.startDelivery")}
                        </Button>
                        <Button variant="outline">
                          <Phone className="h-4 w-4 mr-2" />
                          {t("common.call")} {t("common.client")}
                        </Button>
                        <Button variant="outline">
                          <Camera className="h-4 w-4 mr-2" />
                          {t("common.upload")} {t("delivery.uploadProof")}
                        </Button>
                        <Button
                          variant="outline"
                          className="text-orange-600 border-orange-600 hover:bg-orange-600 hover:text-white"
                        >
                          <AlertCircle className="h-4 w-4 mr-2" />
                          {t("common.report")} {t("common.issue")}
                        </Button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-semibold text-muted-foreground">
                    {t("navigation.activeDeliveries")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("common.accept")} {t("cargo.cargoDetails")}{" "}
                    {t("common.to")} {t("common.start")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Assigned Cargos with Destination Locations */}
        <div>
          <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Route className="h-5 w-5 text-blue-600" />
                  {t("navigation.assignedCargos")}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewAllCargos}
                >
                  {t("common.viewAll")}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="h-96 overflow-y-auto">
              <div className="space-y-4 pr-2">
                {assignedCargos.map((cargo) => (
                  <div
                    key={cargo.id}
                    className="p-4 bg-gray-50 rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{cargo.id}</span>
                      <Badge
                        className={
                          cargo.status === "active"
                            ? "bg-green-100 text-green-600"
                            : "bg-yellow-100 text-yellow-600"
                        }
                      >
                        {t(`status.${cargo.status}`)}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {t("common.client")}
                        </p>
                        <p className="text-sm font-medium">{cargo.client}</p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          {t("common.location")}
                        </p>
                        <p className="text-sm font-medium text-blue-600">
                          {cargo.to}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">
                          {t("common.type")}
                        </p>
                        <p className="font-medium">{cargo.type}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">
                          {t("common.weight")}
                        </p>
                        <p className="font-medium">{cargo.weight} kg</p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant={
                        cargo.status === "active" ? "default" : "outline"
                      }
                      className="w-full"
                      onClick={() => setSelectedDelivery(cargo)}
                    >
                      {cargo.status === "active"
                        ? t("common.continue")
                        : t("common.accept")}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Cards with View All Buttons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Deliveries */}
        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900">
                {t("dashboard.recentActivity")}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewAllDeliveries}
              >
                {t("common.viewAll")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-medium text-gray-600">
                    {t("dashboard.cargoId")}
                  </TableHead>
                  <TableHead className="text-xs font-medium text-gray-600">
                    {t("common.client")}
                  </TableHead>
                  <TableHead className="text-xs font-medium text-gray-600">
                    {t("common.status")}
                  </TableHead>
                  <TableHead className="text-xs font-medium text-gray-600">
                    {t("common.date")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentDeliveries.slice(0, 3).map((delivery) => (
                  <TableRow key={delivery.cargo_id}>
                    <TableCell className="text-sm font-medium text-gray-900">
                      {delivery.cargo_id}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {delivery.client_name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          delivery.status === "delivered"
                            ? "bg-green-100 text-green-600"
                            : "bg-yellow-100 text-yellow-600"
                        }
                      >
                        {t(`status.${delivery.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {delivery.delivery_date}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Driver Performance */}
        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900">
                {t("driver.driverDetails")}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewAllRatings}
              >
                {t("common.viewAll")}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {t("common.rating")}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {dashboardData?.data?.stats?.rating?.toFixed(1) || "0.0"}
                </span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(dashboardData?.data?.stats?.rating || 0)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {t("status.completed")} {t("navigation.deliveries")}
              </span>
              <span className="font-semibold">
                {dashboardData?.data?.stats?.completed_deliveries || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {t("driver.driverStatus")}
              </span>
              <Badge className="bg-green-100 text-green-600">
                {statusConfig[driverStatus].label}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
