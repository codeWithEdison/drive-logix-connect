import React from "react";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/ui/StatsCard";
import { RevenueChart } from "./charts/RevenueChart";
import { DeliveryStatusChart } from "./charts/DeliveryStatusChart";
import { FleetPerformanceChart } from "./charts/FleetPerformanceChart";
import { GeographicChart } from "./charts/GeographicChart";
import { DriverPerformanceChart } from "./charts/DriverPerformanceChart";
import { RecentDeliveriesTable } from "./tables/RecentDeliveriesTable";
import { PendingApprovalsTable } from "./tables/PendingApprovalsTable";
import { SystemAlertsTable } from "./tables/SystemAlertsTable";
import { FinancialTransactionsTable } from "./tables/FinancialTransactionsTable";
import { useAdminDashboard, useDashboardStats } from "@/lib/api/hooks";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { customToast } from "@/lib/utils/toast";
import {
  RefreshCw,
  AlertCircle,
  User,
  Shield,
  TrendingUp,
  Activity,
} from "lucide-react";
import {
  Package,
  Users,
  Clock,
  DollarSign,
  AlertTriangle,
  Download,
  Settings,
  Filter,
  Plus,
  Calendar,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export function AdminDashboard() {
  // English-only: lightweight label formatter for legacy keys
  const t = (key: string, _params?: any) => {
    const last = key.includes(".") ? key.split(".").pop() || key : key;
    const words = last
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .trim();
    return words.charAt(0).toUpperCase() + words.slice(1);
  };
  const { user } = useAuth();
  const branchName =
    (user as any)?.branch?.name ||
    (user as any)?.branch_name ||
    (user as any)?.branch?.code ||
    "";
  const [selectedPeriod, setSelectedPeriod] = React.useState("monthly");

  // API hooks
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useAdminDashboard();

  // Note: Admin dashboard API does not accept filter POST; we rely on refetch

  // Admin statistics data derived from unified API response
  const adminStats = [
    {
      title: "Total Revenue",
      value: dashboardData?.data?.stats?.monthly_revenue
        ? `RWF ${(dashboardData.data.stats.monthly_revenue / 1000000).toFixed(
            1
          )}M`
        : "RWF 0M",
      description: "Total",
      icon: DollarSign,
      iconColor: "text-green-600",
    },
    {
      title: "Active Deliveries",
      value: dashboardData?.data?.stats?.active_deliveries?.toString() || "0",
      description: "Active",
      icon: Package,
      iconColor: "text-blue-600",
    },
    {
      title: "Total Users",
      value: dashboardData?.data?.stats?.total_drivers?.toString() || "0",
      description: "Total",
      icon: Users,
      iconColor: "text-purple-600",
    },
    {
      title: "Pending Approvals",
      value: dashboardData?.data?.stats?.pending_approvals?.toString() || "0",
      description: "Pending",
      icon: Clock,
      iconColor: "text-orange-600",
    },
  ];
  const handleExportReport = () => {
    try {
      // Generate and download report
      const reportData = {
        timestamp: new Date().toISOString(),
        stats: adminStats,
        dashboardData: dashboardData,
        generatedBy: user?.full_name || "Admin",
        language: "English",
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `admin-report-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      customToast.success(t("adminDashboard.reportExported"));
    } catch (error) {
      customToast.error(t("errors.exportFailed"));
    }
  };

  const handleFilter = () => {
    customToast.info(t("adminDashboard.filterOpened"));
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    // For admin, just refetch to refresh widgets; backend ignores period
    refetchDashboard();
    customToast.success(`Filter applied: ${t(`common.${period}`)}`);
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case "daily":
        return t("common.daily");
      case "weekly":
        return t("common.weekly");
      case "monthly":
        return t("common.monthly");
      case "yearly":
        return t("common.yearly");
      default:
        return t("common.monthly");
    }
  };

  const handleRefresh = () => {
    refetchDashboard();
    customToast.success("Dashboard refreshed");
  };

  const handleViewAll = (type: string) => {
    switch (type) {
      case "deliveries":
        window.location.href = "/admin/cargos";
        break;
      case "approvals":
        window.location.href = "/admin/drivers";
        break;
      case "alerts":
        window.location.href = "/admin/alerts";
        break;
      case "transactions":
        window.location.href = "/admin/reports";
        break;
      default:
        break;
    }
  };

  // Loading state
  if (dashboardLoading) {
    return (
      <div className="space-y-6 sm:space-y-8">
        {/* Welcome Header Skeleton */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-blue-700 to-purple-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              {/* Avatar Skeleton */}
              <div className="relative flex-shrink-0">
                <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20" />
                <Skeleton className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full" />
              </div>
              {/* Info Skeleton */}
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-6 sm:h-8 w-64 bg-white/20" />
                <Skeleton className="h-4 sm:h-5 w-48 bg-white/20" />
                <div className="flex gap-4">
                  <Skeleton className="h-3 w-24 bg-white/20" />
                  <Skeleton className="h-3 w-20 bg-white/20" />
                </div>
              </div>
            </div>
            {/* Action Buttons Skeleton */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <Skeleton className="h-8 w-20 bg-white/20" />
              <Skeleton className="h-8 w-24 bg-white/20" />
              <Skeleton className="h-8 w-28 bg-white/20" />
            </div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="space-y-8">
          <Skeleton className="h-80 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (dashboardError) {
    return (
      <div className="space-y-6 sm:space-y-8">
        {/* Welcome Header with Error State */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-blue-700 to-purple-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                {/* Admin Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
                    {user?.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.full_name}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover"
                      />
                    ) : (
                      <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white/80" />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                  </div>
                </div>

                {/* Admin Info */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 leading-tight">
                    {t("adminDashboard.header.welcomeBack")}{" "}
                    <span className="break-words">
                      {user?.full_name || t("common.admin")}
                    </span>
                    !
                  </h1>
                  <p className="text-blue-100 text-sm sm:text-base lg:text-lg mb-2 sm:mb-3">
                    {t("adminDashboard.header.manageSystem")}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-red-500/20 text-red-200 border-red-400/30 text-xs">
                      {t("adminDashboard.header.systemError")}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 w-full sm:w-auto"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-red-800 text-sm sm:text-base">
                {t("common.error")}
              </h3>
              <p className="text-red-600 text-xs sm:text-sm mt-1 break-words">
                {dashboardError?.message || t("adminDashboard.loadError")}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Header with Admin Info */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-blue-700 to-purple-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              {/* Admin Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover"
                    />
                  ) : (
                    <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white/80" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                </div>
              </div>

              {/* Admin Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-md sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2 leading-tight">
                  {t("adminDashboard.header.welcomeBack")}{" "}
                  <span className="break-words">
                    {user?.full_name || t("common.admin")}
                  </span>
                  !
                </h1>
                <p className="text-blue-100 text-sm sm:text-base lg:text-lg mb-2 sm:mb-3">
                  {t("adminDashboard.header.manageSystem")}{" "}
                  {branchName && (
                    <span className="font-semibold">- {branchName} branch</span>
                  )}
                </p>
                {/* <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-blue-200" />
                    <span className="font-semibold">
                      RWF{" "}
                      {(
                        dashboardData?.data?.stats?.monthly_revenue / 1000000 ||
                        0
                      ).toFixed(1)}
                      M
                    </span>
                    <span className="text-blue-200">
                      {t("adminDashboard.stats.monthlyRevenueLabel")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="w-3 h-3 sm:w-4 sm:h-4 text-blue-200" />
                    <span className="font-semibold">
                      {dashboardData?.data?.stats?.active_deliveries || 0}
                    </span>
                    <span className="text-blue-200">
                      {t("adminDashboard.stats.activeDeliveriesLabel")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500/20 text-green-200 border-green-400/30 text-xs">
                      {t("adminDashboard.header.systemAdmin")}
                    </Badge>
                  </div>
                </div> */}
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
                {dashboardLoading ? "Refreshing..." : t("common.refresh")}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 w-full sm:w-auto"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {getPeriodLabel(selectedPeriod)}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handlePeriodChange("daily")}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Daily
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handlePeriodChange("weekly")}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Weekly
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handlePeriodChange("monthly")}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Monthly
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handlePeriodChange("yearly")}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Yearly
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {/* <Button
                size="sm"
                onClick={handleExportReport}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 w-full sm:w-auto"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button> */}
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/5 rounded-full"></div>
      </div>

      {/* Statistics Cards - Individual components */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {adminStats.map((stat, index) => {
          const Icon = stat.icon as any;
          const tone = stat.iconColor.includes("blue")
            ? "blue"
            : stat.iconColor.includes("green")
            ? "green"
            : stat.iconColor.includes("purple")
            ? "purple"
            : stat.iconColor.includes("orange")
            ? "orange"
            : "indigo";

          const gradient =
            tone === "blue"
              ? "from-blue-50 to-blue-100 border-blue-200"
              : tone === "green"
              ? "from-green-50 to-green-100 border-green-200"
              : tone === "purple"
              ? "from-purple-50 to-purple-100 border-purple-200"
              : tone === "orange"
              ? "from-orange-50 to-orange-100 border-orange-200"
              : "from-indigo-50 to-indigo-100 border-indigo-200";

          const dot =
            tone === "blue"
              ? "bg-blue-500"
              : tone === "green"
              ? "bg-green-500"
              : tone === "purple"
              ? "bg-purple-500"
              : tone === "orange"
              ? "bg-orange-500"
              : "bg-indigo-500";

          const iconBg = "bg-white/60";

          return (
            <div
              key={index}
              className={`bg-gradient-to-br ${gradient} border-2 hover:shadow-lg transition-all duration-300 rounded-xl sm:rounded-2xl overflow-hidden group`}
            >
              <div className="p-4 sm:p-5 lg:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2.5 h-2.5 ${dot} rounded-full`}></div>
                      <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                        {stat.title}
                      </p>
                    </div>
                    <div className="flex items-end gap-3">
                      <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
                        {stat.value}
                      </p>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 truncate">
                      {stat.description}
                    </p>
                  </div>
                  <div
                    className={`p-3 sm:p-3.5 rounded-lg sm:rounded-xl ${iconBg} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="space-y-6 sm:space-y-8">
        {/* Revenue Trends Chart - Full Width */}
        <RevenueChart data={dashboardData?.data?.charts?.revenue_trends} />

        {/* Charts Grid - 2x2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DeliveryStatusChart
            data={dashboardData?.data?.charts?.delivery_status}
          />
          <FleetPerformanceChart
            data={dashboardData?.data?.charts?.fleet_performance}
          />
          <GeographicChart
            data={dashboardData?.data?.charts?.geographic_distribution}
          />
          <DriverPerformanceChart
            data={dashboardData?.data?.charts?.driver_performance}
          />
        </div>
      </div>

      {/* Tables Section - 2 tables per row */}
      <div className="space-y-6 sm:space-y-8">
        {/* Recent Deliveries and Pending Approvals - 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <RecentDeliveriesTable
            data={dashboardData?.data?.tables?.recent_deliveries}
            isLoading={dashboardLoading}
            error={dashboardError}
            limit={3}
            onViewAll={() => handleViewAll("deliveries")}
          />
          <PendingApprovalsTable
            data={dashboardData?.data?.tables?.pending_approvals}
            isLoading={dashboardLoading}
            error={dashboardError}
            limit={3}
            onViewAll={() => handleViewAll("approvals")}
          />
        </div>

        {/* System Alerts and Financial Transactions - 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <SystemAlertsTable
            data={dashboardData?.data?.tables?.system_alerts}
            isLoading={dashboardLoading}
            error={dashboardError}
            limit={3}
            onViewAll={() => handleViewAll("alerts")}
          />
          <FinancialTransactionsTable
            data={dashboardData?.data?.tables?.financial_transactions}
            isLoading={dashboardLoading}
            error={dashboardError}
            limit={3}
            onViewAll={() => handleViewAll("transactions")}
          />
        </div>
      </div>

      {/* Recent Activities Messages - Dynamic from API */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activities
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboardData?.data?.recent_activities
            ?.slice(0, 4)
            .map((activity, index) => {
              const getIcon = (type: string) => {
                switch (type) {
                  case "delivery":
                    return Package;
                  case "approval":
                    return Users;
                  case "alert":
                    return AlertTriangle;
                  case "payment":
                    return DollarSign;
                  default:
                    return Clock;
                }
              };

              const getIconColor = (type: string) => {
                switch (type) {
                  case "delivery":
                    return "text-green-600";
                  case "approval":
                    return "text-blue-600";
                  case "alert":
                    return "text-red-600";
                  case "payment":
                    return "text-green-600";
                  default:
                    return "text-gray-600";
                }
              };

              const IconComponent = getIcon(activity.type);
              const iconColor = getIconColor(activity.type);

              return (
                <div
                  key={activity.id}
                  className="bg-white rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent className={`h-4 w-4 ${iconColor}`} />
                    <span className="text-sm font-medium text-gray-900">
                      {activity.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              );
            }) || (
            <div className="col-span-full text-center text-gray-500 py-8">
              No recent activities
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
