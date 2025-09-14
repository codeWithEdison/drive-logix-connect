import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Truck,
  Clock,
  CheckCircle,
  Plus,
  MapPin,
  DollarSign,
  Bell,
  User,
  Heart,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Star,
  Calendar,
} from "lucide-react";
import { LiveTrackingMap } from "./LiveTrackingMap";
import {
  TotalCargosCard,
  ActiveDeliveriesCard,
  CompletedDeliveriesCard,
  PendingPaymentsCard,
} from "@/components/ui/StatsCard";
import { useClientDashboard } from "@/lib/api/hooks";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

// Mock data for recent activities
const recentActivities = [
  {
    id: 1,
    type: "delivery",
    icon: "check",
    title: "Cargo Delivered",
    description: "Cargo #4832920 delivered successfully",
    time: "2 hours ago",
    avatar: null,
  },
  {
    id: 2,
    type: "transit",
    icon: "truck",
    title: "Cargo In Transit",
    description: "Cargo #3565432 is now in transit",
    time: "4 hours ago",
    avatar: null,
  },
  {
    id: 3,
    type: "created",
    icon: "plus",
    title: "New Cargo Created",
    description: "New cargo request #1442654 created",
    time: "1 day ago",
    avatar: null,
  },
];

// Mock data for recent cargos
const recentCargos = [
  {
    id: "#3565432",
    status: "In Transit",
    from: "4140 Parker Rd, Allentown, NM",
    to: "3517 W. Gray St. Utica, PA",
    driver: "Albert Flores",
    estimatedTime: "2.5 hours",
    weight: "25 kg",
    type: "Electronics",
  },
  {
    id: "#4832920",
    status: "Delivered",
    from: "1050 Elden St. Colma, DE",
    to: "6502 Preston Rd. Inglewood, ME",
    driver: "Guy Hawkins",
    estimatedTime: "Delivered",
    weight: "15 kg",
    type: "Documents",
  },
  {
    id: "#1442654",
    status: "Pending",
    from: "2972 Westheimer Rd. Santa Ana, IL",
    to: "6391 Elgin St. Celina, DE",
    driver: "Kathryn Murphy",
    estimatedTime: "Pending pickup",
    weight: "40 kg",
    type: "Furniture",
  },
];

export function ClientDashboard() {
  const navigate = useNavigate();
  const { t, isLoading: isLanguageLoading } = useLanguage();
  const { user } = useAuth();
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch,
  } = useClientDashboard();

  const handleCreateCargo = () => {
    navigate("/create-cargo");
  };

  const handleViewAllActivities = () => {
    navigate("/history");
  };

  const handleViewAllInvoices = () => {
    navigate("/invoices");
  };

  const handleViewAllCargos = () => {
    navigate("/my-cargos");
  };

  const handleRefresh = () => {
    refetch();
  };

  // Loading state
  if (isLoading || isLanguageLoading) {
    return (
      <div className="space-y-6 sm:space-y-8">
        {/* Header Skeleton */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Stats Card Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card
              key={i}
              className="bg-white shadow-lg rounded-xl sm:rounded-2xl overflow-hidden"
            >
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                  <div className="space-y-1 sm:space-y-2">
                    <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
                    <Skeleton className="h-6 sm:h-8 lg:h-10 w-12 sm:w-16" />
                    <Skeleton className="h-3 w-16 hidden sm:block" />
                  </div>
                  <Skeleton className="h-6 w-6 sm:h-8 sm:w-8 rounded-full self-start sm:self-auto" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
          <Card className="lg:col-span-2">
            <CardHeader className="p-4 sm:p-6">
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 sm:gap-4">
                  <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader className="p-4 sm:p-6">
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {t("dashboard.title")}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              {t("dashboard.subtitle")}
            </p>
          </div>
          <Button
            className="bg-gradient-primary hover:bg-primary-hover w-full sm:w-auto"
            onClick={handleCreateCargo}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("dashboard.createNewCargo")}
          </Button>
        </div>

        <Card className="bg-red-50 border-red-200 rounded-xl sm:rounded-2xl">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
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
                  className="mt-2 w-full sm:w-auto"
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
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Header with Client Info */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              {/* Client Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
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

              {/* Client Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 leading-tight">
                  Welcome back,{" "}
                  <span className="break-words">
                    {user?.full_name || t("common.client")}
                  </span>
                  !
                </h1>
                <p className="text-purple-100 text-sm sm:text-base lg:text-lg mb-2 sm:mb-3">
                  Track your shipments and manage deliveries
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <Package className="w-3 h-3 sm:w-4 sm:h-4 text-purple-200" />
                    <span className="font-semibold">
                      {dashboardData?.data?.stats?.total_cargos || 0}
                    </span>
                    <span className="text-purple-200">total shipments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-3 h-3 sm:w-4 sm:h-4 text-purple-200" />
                    <span className="font-semibold">
                      {dashboardData?.data?.stats?.in_transit_cargos || 0}
                    </span>
                    <span className="text-purple-200">in transit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500/20 text-green-200 border-green-400/30 text-xs">
                      Active Client
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
                disabled={isLoading}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 w-full sm:w-auto"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                {t("common.refresh")}
              </Button>
              <Button
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 w-full sm:w-auto"
                onClick={handleCreateCargo}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t("dashboard.createNewCargo")}
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
      </div>

      {/* Stats Cards - Modern Design */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 border-2 hover:shadow-lg transition-all duration-300 rounded-xl sm:rounded-2xl overflow-hidden group">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="space-y-1 sm:space-y-2">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                  Total Shipments
                </p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  {dashboardData?.data?.stats?.total_cargos || 0}
                </p>
                <p className="text-xs text-gray-500 hidden sm:block">
                  All time
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/50 group-hover:scale-110 transition-transform duration-300 self-start sm:self-auto">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 border-2 hover:shadow-lg transition-all duration-300 rounded-xl sm:rounded-2xl overflow-hidden group">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="space-y-1 sm:space-y-2">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                  In Transit
                </p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  {dashboardData?.data?.stats?.in_transit_cargos || 0}
                </p>
                <p className="text-xs text-gray-500 hidden sm:block">
                  Active deliveries
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/50 group-hover:scale-110 transition-transform duration-300 self-start sm:self-auto">
                <Truck className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 border-2 hover:shadow-lg transition-all duration-300 rounded-xl sm:rounded-2xl overflow-hidden group">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="space-y-1 sm:space-y-2">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                  Delivered
                </p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  {dashboardData?.data?.stats?.delivered_cargos || 0}
                </p>
                <p className="text-xs text-gray-500 hidden sm:block">
                  Completed
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/50 group-hover:scale-110 transition-transform duration-300 self-start sm:self-auto">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 border-2 hover:shadow-lg transition-all duration-300 rounded-xl sm:rounded-2xl overflow-hidden group">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                  Pending Payment
                </p>
                <div className="min-w-0">
                  <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 break-words leading-tight">
                    RWF{" "}
                    {dashboardData?.data?.stats?.pending_payments?.toLocaleString() ||
                      "0"}
                  </p>
                </div>
                <p className="text-xs text-gray-500 hidden sm:block">
                  Outstanding
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/50 group-hover:scale-110 transition-transform duration-300 self-start sm:self-auto flex-shrink-0">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Tracking - Full Width */}
      <div>
        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl sm:rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 sm:gap-3 text-gray-900">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold">
                  {t("dashboard.liveTracking")}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 font-normal">
                  Real-time shipment tracking
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <LiveTrackingMap />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Invoices Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
        {/* Recent Activity */}
        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl sm:rounded-2xl overflow-hidden lg:col-span-2">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <CardTitle className="flex items-center gap-2 sm:gap-3 text-gray-900">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold">
                    {t("dashboard.recentActivity")}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 font-normal">
                    Latest updates
                  </p>
                </div>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewAllActivities}
                className="border-green-300 text-green-600 hover:bg-green-50 w-full sm:w-auto"
              >
                {t("common.viewAll")}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {dashboardData?.data.recent_activities?.map((activity, index) => (
                <div key={activity.id} className="relative">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {activity.type === "delivery" && (
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      )}
                      {activity.type === "transit" && (
                        <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      )}
                      {activity.type === "created" && (
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        {activity.type === "delivery" && (
                          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                        )}
                        {activity.type === "transit" && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        )}
                        {activity.type === "created" && (
                          <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                        )}
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {activity.title}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 break-words">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {index <
                    (dashboardData?.data.recent_activities?.length || 0) -
                      1 && (
                    <div className="absolute left-4 sm:left-5 top-8 sm:top-10 w-px h-6 sm:h-8 bg-gray-200"></div>
                  )}
                </div>
              )) || (
                <div className="text-center text-gray-500 py-6 sm:py-8">
                  <Bell className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3" />
                  <p className="text-sm sm:text-base">
                    {t("dashboard.noRecentActivity")}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Cargo Invoices */}
        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl sm:rounded-2xl overflow-hidden lg:col-span-3 flex flex-col h-[400px] sm:h-[450px] lg:h-[500px]">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100 p-4 sm:p-6 flex-shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <CardTitle className="flex items-center gap-2 sm:gap-3 text-gray-900">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold">
                    {t("dashboard.recentInvoices")}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 font-normal">
                    Payment history
                  </p>
                </div>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewAllInvoices}
                className="border-purple-300 text-purple-600 hover:bg-purple-50 w-full sm:w-auto"
              >
                {t("common.viewAll")}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 flex-1 min-h-0 overflow-hidden">
            <div className="h-full overflow-y-auto overflow-x-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    <TableHead className="text-xs font-medium text-gray-600">
                      {t("dashboard.invoiceNo")}
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-600">
                      {t("dashboard.cargoId")}
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-600 hidden sm:table-cell">
                      {t("dashboard.client")}
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-600">
                      {t("dashboard.amount")}
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-600">
                      {t("dashboard.status")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardData?.data.recent_invoices?.map((invoice) => (
                    <TableRow key={invoice.invoice_id}>
                      <TableCell className="text-sm font-medium text-gray-900">
                        <div className="min-w-0">
                          <p className="truncate">{invoice.invoice_number}</p>
                          <p className="text-xs text-gray-500 sm:hidden">
                            {user?.full_name}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        <p className="truncate">{invoice.cargo_id}</p>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-gray-900 hidden sm:table-cell">
                        {user?.full_name}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-gray-900">
                        RWF {invoice.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`text-xs font-medium ${
                            invoice.status === "paid"
                              ? "bg-green-100 text-green-600"
                              : invoice.status === "pending"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-yellow-100 text-yellow-600"
                          }`}
                        >
                          {t(`invoice.status.${invoice.status}`)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-gray-500 py-6 sm:py-8"
                      >
                        <DollarSign className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3" />
                        <p className="text-sm sm:text-base">
                          {t("dashboard.noRecentInvoices")}
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
