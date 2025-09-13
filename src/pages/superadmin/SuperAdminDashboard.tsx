import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/ui/StatsCard";
import { RevenueChart } from "@/components/dashboard/charts/RevenueChart";
import { UsageTrendsChart } from "@/components/dashboard/charts/UsageTrendsChart";
import { AdminPerformanceChart } from "@/components/dashboard/charts/AdminPerformanceChart";
import { UsersDistributionChart } from "@/components/dashboard/charts/UsersDistributionChart";
import { PendingApprovalsTable } from "@/components/dashboard/tables/PendingApprovalsTable";
import { SystemAlertsTable } from "@/components/dashboard/tables/SystemAlertsTable";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useSuperAdminDashboard } from "@/lib/api/hooks/dashboardHooks";
import { usePendingApprovalsTable, useSystemAlertsTable } from "@/lib/api/hooks/dashboardHooks";
import {
  TrendingUp,
  Users,
  Shield,
  Activity,
  Filter,
  Download,
  Plus,
  Settings,
  BarChart3,
  DollarSign,
  Package,
  MapPin,
  Calendar,
  Bell,
  Database,
  Eye,
} from "lucide-react";

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('rw-RW', {
    style: 'currency',
    currency: 'RWF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper function to format numbers
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('rw-RW').format(num);
};

export default function SuperAdminDashboard() {
  const { t } = useLanguage();

  // Fetch dashboard data from backend
  const { data: dashboardData, isLoading: isDashboardLoading, error: dashboardError } = useSuperAdminDashboard();
  const { data: pendingApprovalsData, isLoading: isApprovalsLoading } = usePendingApprovalsTable({ limit: 3 });
  const { data: systemAlertsData, isLoading: isAlertsLoading } = useSystemAlertsTable({ limit: 3 });

  // Dashboard data is now properly mapped to the backend response structure

  // Transform dashboard data into stats cards format with proper null checks
  const dashboardResponse = dashboardData?.data as any;
  const superAdminStats = dashboardResponse?.stats ? [
    {
      title: t("superAdminDashboard.totalRevenue"),
      value: formatCurrency(dashboardResponse.stats.total_revenue || 0),
      change: "+12.5%", // This would come from comparison data
      changeType: "increase" as const,
      icon: DollarSign,
      color: "green",
    },
    {
      title: t("superAdminDashboard.activeAdmins"),
      value: formatNumber(dashboardResponse.stats.active_admins || 0),
      change: "+2", // This would come from comparison data
      changeType: "active" as const,
      icon: Shield,
      color: "blue",
    },
    {
      title: t("superAdminDashboard.systemUsers"),
      value: formatNumber(dashboardResponse.stats.total_users || 0),
      change: `+${dashboardResponse.charts?.users_distribution?.registration_trends?.[0]?.new_registrations || 0}`,
      changeType: "increase" as const,
      icon: Users,
      color: "purple",
    },
    {
      title: t("superAdminDashboard.systemHealth"),
      value: `${(dashboardResponse.system_health?.api_performance?.uptime_percentage || 0).toFixed(1)}%`,
      change: "+2.1%", // This would come from comparison data
      changeType: "success" as const,
      icon: Activity,
      color: "green",
    },
  ] : [
    // Fallback stats when data is not available
    {
      title: t("superAdminDashboard.totalRevenue"),
      value: "RWF 0",
      change: "0%",
      changeType: "increase" as const,
      icon: DollarSign,
      color: "green",
    },
    {
      title: t("superAdminDashboard.activeAdmins"),
      value: "0",
      change: "0",
      changeType: "active" as const,
      icon: Shield,
      color: "blue",
    },
    {
      title: t("superAdminDashboard.systemUsers"),
      value: "0",
      change: "+0",
      changeType: "increase" as const,
      icon: Users,
      color: "purple",
    },
    {
      title: t("superAdminDashboard.systemHealth"),
      value: "0.0%",
      change: "0%",
      changeType: "success" as const,
      icon: Activity,
      color: "green",
    },
  ];

  const handleViewAll = (type: string) => {
    console.log(`View all ${type}`);
    // TODO: Navigate to respective pages
  };

  const handleFilter = () => {
    console.log("Filter dashboard data");
  };

  const handleExportReport = () => {
    console.log("Export dashboard report");
  };

  const handleAddNew = () => {
    console.log("Add new item");
  };

  const handleSettings = () => {
    console.log("Open settings");
  };

  // Show loading state only if we don't have any data yet
  if (isDashboardLoading && !dashboardData) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-heading">
              {t("superAdminDashboard.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("superAdminDashboard.subtitle")}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error banner if there's an error, but still show the dashboard
  const showErrorBanner = dashboardError && !dashboardData;

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {showErrorBanner && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <Database className="h-5 w-5 text-red-500 mr-2" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Unable to load dashboard data</h3>
              <p className="text-sm text-red-600 mt-1">
                Showing fallback data. Please check your connection and try refreshing the page.
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.reload()}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-heading">
            {t("superAdminDashboard.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("superAdminDashboard.subtitle")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleFilter}>
            <Filter className="w-4 h-4 mr-2" />
            {t("superAdminDashboard.filter")}
          </Button>
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="w-4 h-4 mr-2" />
            {t("superAdminDashboard.exportReport")}
          </Button>
          <Button variant="outline" onClick={handleAddNew}>
            <Plus className="w-4 h-4 mr-2" />
            {t("common.addNew")}
          </Button>
          <Button variant="outline" onClick={handleSettings}>
            <Settings className="w-4 h-4 mr-2" />
            {t("superAdminDashboard.settings")}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {superAdminStats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={{
              value: parseFloat(stat.change.replace(/[+%]/g, '')),
              label: stat.change,
              isPositive: stat.changeType === 'increase' || stat.changeType === 'success' || stat.changeType === 'active'
            }}
            iconColor={stat.color === 'green' ? 'text-green-600' : stat.color === 'blue' ? 'text-blue-600' : stat.color === 'purple' ? 'text-purple-600' : 'text-primary'}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t("superAdminDashboard.revenueTrends")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>

        {/* Usage Trends Chart */}
        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {t("superAdminDashboard.usageTrends")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UsageTrendsChart />
          </CardContent>
        </Card>

        {/* Admin Performance Chart */}
        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t("superAdminDashboard.adminPerformance")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AdminPerformanceChart />
          </CardContent>
        </Card>

        {/* Users Distribution Chart */}
        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t("superAdminDashboard.usersDistribution")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UsersDistributionChart />
          </CardContent>
        </Card>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t("superAdminDashboard.pendingApprovals")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isApprovalsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
            <PendingApprovalsTable
                data={dashboardResponse?.tables?.pending_approvals || []}
              limit={3}
              onViewAll={() => handleViewAll("approvals")}
            />
            )}
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t("superAdminDashboard.systemAlerts")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isAlertsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
            <SystemAlertsTable
                data={dashboardResponse?.tables?.system_alerts || []}
              limit={3}
              onViewAll={() => handleViewAll("alerts")}
            />
            )}
          </CardContent>
        </Card>

        {/* Recent Logs */}
        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              {t("superAdminDashboard.recentLogs")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isDashboardLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
            <div className="space-y-3">
                  {(dashboardResponse?.recent_logs || []).slice(0, 3).map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {log.user || "System"}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {log.type?.replace("_", " ") || "Unknown"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{log.action}</p>
                    <p className="text-xs text-gray-500 mt-1">IP: {log.ip_address}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{log.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => handleViewAll("logs")}
              >
                {t("superAdminDashboard.viewAllLogs")}
              </Button>
            </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
