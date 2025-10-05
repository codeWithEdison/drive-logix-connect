import React from "react";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/ui/StatsCard";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueChart } from "./charts/RevenueChart";
import { DeliveryStatusChart } from "./charts/DeliveryStatusChart";
import { FleetPerformanceChart } from "./charts/FleetPerformanceChart";
import { GeographicChart } from "./charts/GeographicChart";
import { DriverPerformanceChart } from "./charts/DriverPerformanceChart";
import { UsageTrendsChart } from "./charts/UsageTrendsChart";
import { AdminPerformanceChart } from "./charts/AdminPerformanceChart";
import { UsersDistributionChart } from "./charts/UsersDistributionChart";
import { RecentDeliveriesTable } from "./tables/RecentDeliveriesTable";
import { PendingApprovalsTable } from "./tables/PendingApprovalsTable";
import { SystemAlertsTable } from "./tables/SystemAlertsTable";
import { FinancialTransactionsTable } from "./tables/FinancialTransactionsTable";
import { useSuperAdminDashboard } from "@/lib/api/hooks/dashboardHooks";
import { useAuth } from "@/contexts/AuthContext";
import { customToast } from "@/lib/utils/toast";
import {
  RefreshCw,
  AlertCircle,
  Shield,
  TrendingUp,
  Activity,
  Users,
  Database,
  Server,
  AlertTriangle,
  Settings,
  Lock,
  DollarSign,
  Package,
  Clock,
  Eye,
  Download,
  Calendar,
  ChevronDown,
  UserCog,
  HardDrive,
  Zap,
  Building2,
  Map,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// No mock data - using real API data only

export function SuperAdminDashboard() {
  // English-only: lightweight label formatter for legacy keys
  const t = (key: string) => {
    const last = key.includes(".") ? key.split(".").pop() || key : key;
    const spaced = last.replace(/([A-Z])/g, " $1").trim();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  };
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = React.useState("monthly");

  // API hooks
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useSuperAdminDashboard();

  // Super Admin statistics data from API
  const superAdminStats = [
    {
      title: "Total Users",
      value: dashboardData?.data?.stats?.total_users?.toLocaleString() || "0",
      description: "Across all branches",
      icon: Users,
      iconColor: "text-blue-600",
      // No trend data available in current API response
    },
    {
      title: "Total Revenue",
      value: dashboardData?.data?.stats?.total_revenue
        ? `RWF ${(dashboardData.data.stats.total_revenue / 1000000).toFixed(
            1
          )}M`
        : "RWF 0M",
      description: "All branches",
      icon: DollarSign,
      iconColor: "text-green-600",
      // No trend data available in current API response
    },
    {
      title: "Active Admins",
      value: dashboardData?.data?.stats?.active_admins?.toString() || "0",
      description: "System-wide",
      icon: Package,
      iconColor: "text-purple-600",
      // No trend data available in current API response
    },
    {
      title: "System Uptime",
      value: dashboardData?.data?.stats?.system_uptime
        ? `${dashboardData.data.stats.system_uptime}%`
        : "99.9%",
      description: "Last 30 days",
      icon: Activity,
      iconColor: "text-green-600",
    },
  ];

  const handleExportReport = () => {
    try {
      const reportData = {
        timestamp: new Date().toISOString(),
        stats: superAdminStats,
        dashboardData: dashboardData,
        generatedBy: user?.full_name || "Super Admin",
        language: t("common.language"),
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `super-admin-report-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      customToast.success("System report exported successfully");
    } catch (error) {
      customToast.error("Failed to export report");
    }
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    customToast.success(`Filter applied: ${period}`);
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
    customToast.success(t("common.refreshed"));
  };

  const handleViewAll = (type: string) => {
    switch (type) {
      case "users":
        window.location.href = "/super-admin/users";
        break;
      case "cargos":
      case "deliveries":
        window.location.href = "/super-admin/cargos";
        break;
      case "branches":
        window.location.href = "/superadmin/branches";
        break;
      case "logs":
      case "alerts":
        window.location.href = "/super-admin/logs";
        break;
      case "approvals":
        window.location.href = "/super-admin/users"; // Approvals are handled in user management
        break;
      case "transactions":
        window.location.href = "/super-admin/invoices";
        break;
      case "assignments":
        window.location.href = "/super-admin/assignments";
        break;
      case "trucks":
        window.location.href = "/super-admin/trucks";
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
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-700 to-blue-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div className="relative flex-shrink-0">
                <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20" />
                <Skeleton className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full" />
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-6 sm:h-8 w-64 bg-white/20" />
                <Skeleton className="h-4 sm:h-5 w-48 bg-white/20" />
                <div className="flex gap-4">
                  <Skeleton className="h-3 w-24 bg-white/20" />
                  <Skeleton className="h-3 w-20 bg-white/20" />
                </div>
              </div>
            </div>
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

        {/* Content Skeleton */}
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-80 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-80 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (dashboardError) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-700 to-blue-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
                    <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white/80" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 leading-tight">
                    Welcome Back, {user?.full_name || "Super Admin"}!
                  </h1>
                  <p className="text-purple-100 text-sm sm:text-base lg:text-lg mb-2 sm:mb-3">
                    Complete system oversight and management
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-red-500/20 text-red-200 border-red-400/30 text-xs">
                      System Error
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 w-full sm:w-auto"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t("common.retry")}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-red-800 text-sm sm:text-base">
                {t("common.error")}
              </h3>
              <p className="text-red-600 text-xs sm:text-sm mt-1 break-words">
                {dashboardError?.message ||
                  "Failed to load super admin dashboard"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Header with Super Admin Info */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-700 to-blue-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              {/* Super Admin Avatar */}
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

              {/* Super Admin Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-md sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2 leading-tight">
                  Welcome Back, {user?.full_name || "Super Admin"}!
                </h1>
                <p className="text-purple-100 text-sm sm:text-base lg:text-lg mb-2 sm:mb-3">
                  Complete system oversight and management across all branches
                </p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-500/20 text-purple-200 border-purple-400/30 text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Super Administrator
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
                    {t("common.daily")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handlePeriodChange("weekly")}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {t("common.weekly")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handlePeriodChange("monthly")}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {t("common.monthly")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handlePeriodChange("yearly")}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {t("common.yearly")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                size="sm"
                onClick={handleExportReport}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 w-full sm:w-auto"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/5 rounded-full"></div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {superAdminStats.map((stat, index) => (
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

      {/* Charts Section */}
      <div className="space-y-6 sm:space-y-8">
        {/* Revenue Trends Chart - Full Width */}
        <RevenueChart data={dashboardData?.data?.charts?.revenue_trends} />

        {/* Charts Grid - 2x2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* These charts are not available in super admin API response */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                System Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4" />
                <p>No data available</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                {t("superAdminDashboard.performanceOverview")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4" />
                <p>{t("superAdminDashboard.noData")}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Super Admin Specific Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <UsageTrendsChart />
          <AdminPerformanceChart />
          <UsersDistributionChart />

          {/* System Health Monitor */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-success" />
                {t("superAdminDashboard.systemHealth")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData?.data?.system_health ? (
                Object.entries(dashboardData.data.system_health).map(
                  ([service, data]: [string, any]) => (
                    <div
                      key={service}
                      className="flex items-center justify-between p-4 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            data.status === "healthy"
                              ? "bg-green-500"
                              : data.status === "warning"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                        ></div>
                        <div>
                          <p className="font-semibold capitalize">
                            {service.replace(/([A-Z])/g, " $1")}
                          </p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {data.status}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{data.load}%</p>
                        <Progress value={data.load} className="w-24 mt-1" />
                      </div>
                    </div>
                  )
                )
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Server className="h-12 w-12 mx-auto mb-4" />
                  <p>{t("superAdminDashboard.noSystemHealthData")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tables Section - 2 tables per row */}
      <div className="space-y-6 sm:space-y-8">
        {/* Available Tables from API */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <PendingApprovalsTable
            data={dashboardData?.data?.tables?.pending_approvals?.map(
              (approval) => ({
                ...approval,
                documents_count: 0, // Default value since it's not in the API response
              })
            )}
            isLoading={dashboardLoading}
            error={dashboardError}
            limit={3}
            onViewAll={() => handleViewAll("approvals")}
          />
          <SystemAlertsTable
            data={dashboardData?.data?.tables?.system_alerts}
            isLoading={dashboardLoading}
            error={dashboardError}
            limit={3}
            onViewAll={() => handleViewAll("alerts")}
          />
        </div>
      </div>

      {/* Recent Activities from API */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t("superAdminDashboard.recentActivities")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboardData?.data?.recent_logs
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
                  case "user":
                    return UserCog;
                  case "system":
                    return Settings;
                  case "security":
                    return Shield;
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
                  case "user":
                    return "text-purple-600";
                  case "system":
                    return "text-gray-600";
                  case "security":
                    return "text-orange-600";
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
                      {t(`superAdminDashboard.${activity.type}`)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{activity.action}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activity.user} •{" "}
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              );
            }) || (
            <div className="col-span-full text-center text-gray-500 py-8">
              {t("superAdminDashboard.noRecentActivities")}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t("superAdminDashboard.quickActions")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-900">
                {t("navigation.userManagement")}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {t("superAdminDashboard.manageSystemUsers")}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              onClick={() => handleViewAll("users")}
            >
              <Eye className="h-3 w-3 mr-1" />
              {t("common.viewAll")}
            </Button>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-900">
                {t("superAdminDashboard.branchManagement")}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {t("superAdminDashboard.branchesActive")}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              onClick={() => handleViewAll("branches")}
            >
              <Eye className="h-3 w-3 mr-1" />
              {t("common.manage")}
            </Button>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-900">
                {t("navigation.allCargos")}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {t("superAdminDashboard.systemWideCargos")}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              onClick={() => handleViewAll("cargos")}
            >
              <Eye className="h-3 w-3 mr-1" />
              {t("common.viewAll")}
            </Button>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-gray-900">
                {t("superAdminDashboard.systemSecurity")}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {t("superAdminDashboard.monitorSecurity")}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              onClick={() => handleViewAll("alerts")}
            >
              <Eye className="h-3 w-3 mr-1" />
              {t("common.viewLogs")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
