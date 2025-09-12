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
  AiOutlineInbox,
  AiOutlineCar,
  AiOutlineClockCircle,
  AiOutlineCheckCircle,
  AiOutlinePlus,
  AiOutlineEnvironment,
  AiOutlineDollar,
  AiOutlineNotification,
  AiOutlineUser,
  AiOutlineHeart,
  AiOutlineArrowUp,
  AiOutlineArrowDown,
} from "react-icons/ai";
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
import { AlertCircle, RefreshCw } from "lucide-react";

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
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
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
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
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
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("dashboard.title")}
            </h1>
            <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
          </div>
          <Button
            className="bg-gradient-primary hover:bg-primary-hover"
            onClick={handleCreateCargo}
          >
            <AiOutlinePlus className="w-4 h-4 mr-2" />
            {t("dashboard.createNewCargo")}
          </Button>
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t("dashboard.title")}
          </h1>
          <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading || isLanguageLoading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            {t("common.refresh")}
          </Button>
          <Button
            className="bg-gradient-primary hover:bg-primary-hover"
            onClick={handleCreateCargo}
          >
            <AiOutlinePlus className="w-4 h-4 mr-2" />
            {t("dashboard.createNewCargo")}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TotalCargosCard value={dashboardData?.data.stats.total_cargos || 0} />
        <ActiveDeliveriesCard
          value={dashboardData?.data.stats.in_transit_cargos || 0}
        />
        <CompletedDeliveriesCard
          value={dashboardData?.data.stats.delivered_cargos || 0}
        />
        <PendingPaymentsCard
          value={`RWF ${
            dashboardData?.data.stats.pending_payments?.toLocaleString() || "0"
          }`}
        />
      </div>

      {/* Live Tracking - Full Width */}
      <div>
        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <AiOutlineEnvironment className="h-5 w-5 text-blue-600" />
              {t("dashboard.liveTracking")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <LiveTrackingMap />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Invoices Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Recent Activity */}
        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900">
                {t("dashboard.recentActivity")}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewAllActivities}
              >
                {t("common.viewAll")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData?.data.recent_activities?.map((activity, index) => (
                <div key={activity.id} className="relative">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      {activity.type === "delivery" && (
                        <AiOutlineCheckCircle className="w-4 h-4 text-green-600" />
                      )}
                      {activity.type === "transit" && (
                        <AiOutlineCar className="w-4 h-4 text-blue-600" />
                      )}
                      {activity.type === "created" && (
                        <AiOutlinePlus className="w-4 h-4 text-orange-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {activity.type === "delivery" && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                        {activity.type === "transit" && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                        {activity.type === "created" && (
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
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
                    <div className="absolute left-4 top-8 w-px h-8 bg-gray-200"></div>
                  )}
                </div>
              )) || (
                <div className="text-center text-gray-500 py-8">
                  <AiOutlineNotification className="w-8 h-8 mx-auto mb-2" />
                  <p>{t("dashboard.noRecentActivity")}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Cargo Invoices */}
        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900">
                {t("dashboard.recentInvoices")}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewAllInvoices}
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
                    {t("dashboard.invoiceNo")}
                  </TableHead>
                  <TableHead className="text-xs font-medium text-gray-600">
                    {t("dashboard.cargoId")}
                  </TableHead>
                  <TableHead className="text-xs font-medium text-gray-600">
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
                      {invoice.invoice_number}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {invoice.cargo_id}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-gray-900">
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
                      className="text-center text-gray-500 py-8"
                    >
                      <AiOutlineDollar className="w-8 h-8 mx-auto mb-2" />
                      <p>{t("dashboard.noRecentInvoices")}</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
