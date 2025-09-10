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
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { customToast } from "@/lib/utils/toast";
import { RefreshCw, AlertCircle } from "lucide-react";
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
} from "lucide-react";

export function AdminDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();

  // API hooks
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useAdminDashboard();

  // Admin statistics data derived from unified API response
  const adminStats = [
    {
      title: t("adminDashboard.totalRevenue"),
      value: dashboardData?.data?.stats?.monthly_revenue
        ? `RWF ${(dashboardData.data.stats.monthly_revenue / 1000000).toFixed(
            1
          )}M`
        : "RWF 0M",
      description: t("common.total"),
      icon: DollarSign,
      iconColor: "text-green-600",
    },
    {
      title: t("adminDashboard.activeDeliveries"),
      value: dashboardData?.data?.stats?.active_deliveries?.toString() || "0",
      description: t("status.active"),
      icon: Package,
      iconColor: "text-blue-600",
    },
    {
      title: t("adminDashboard.totalUsers"),
      value: dashboardData?.data?.stats?.total_drivers?.toString() || "0",
      description: t("common.total"),
      icon: Users,
      iconColor: "text-purple-600",
    },
    {
      title: t("adminDashboard.pendingApprovals"),
      value: dashboardData?.data?.stats?.pending_approvals?.toString() || "0",
      description: t("status.pending"),
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
        language: t("common.language"),
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

  const handleSettings = () => {
    window.location.href = "/admin/settings";
  };

  const handleFilter = () => {
    customToast.info(t("adminDashboard.filterOpened"));
  };

  const handleAddNew = () => {
    window.location.href = "/admin/cargos/new";
  };

  const handleRefresh = () => {
    refetchDashboard();
    customToast.success(t("common.refreshed"));
  };

  const handleViewAll = (type: string) => {
    switch (type) {
      case "deliveries":
        window.location.href = "/admin/cargos";
        break;
      case "approvals":
        window.location.href = "/admin/users";
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
      <div className="space-y-8 p-6">
        {/* Header Skeleton */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-24" />
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
      <div className="space-y-8 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-heading">
              {t("adminDashboard.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("adminDashboard.subtitle")}
            </p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <h3 className="font-semibold text-red-800">
                {t("common.error")}
              </h3>
              <p className="text-red-600 text-sm mt-1">
                {dashboardError?.message || t("adminDashboard.loadError")}
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
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-heading">
            {t("adminDashboard.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("adminDashboard.subtitle")},{" "}
            {user?.full_name || t("common.admin")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={dashboardLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${
                dashboardLoading ? "animate-spin" : ""
              }`}
            />
            {t("common.refresh")}
          </Button>
          <Button variant="outline" onClick={handleFilter}>
            <Filter className="h-4 w-4 mr-2" />
            {t("common.filter")}
          </Button>
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            {t("adminDashboard.exportReport")}
          </Button>
          {/* <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            {t("common.addNew")}
          </Button>
          <Button onClick={handleSettings}>
            <Settings className="h-4 w-4 mr-2" />
            {t("common.settings")}
          </Button> */}
        </div>
      </div>

      {/* Statistics Cards - Individual components */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminStats.map((stat, index) => (
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
      <div className="space-y-8">
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
      <div className="space-y-8">
        {/* Recent Deliveries and Pending Approvals - 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t("adminDashboard.recentActivities")}
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
                      {t(`adminDashboard.${activity.type}`)}
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
              {t("adminDashboard.noRecentActivities")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
