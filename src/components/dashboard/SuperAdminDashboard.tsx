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
import { useApplyDashboardFilters } from "@/lib/api/hooks/dashboardHooks";
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
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  Legend as ReLegend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

// No mock data - using real API data only

export function SuperAdminDashboard() {
  // English-only: lightweight label formatter for legacy keys
  const t = (key: string) => {
    const last = key.includes(".") ? key.split(".").pop() || key : key;
    const spaced = last.replace(/([A-Z])/g, " $1").trim();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  };
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = React.useState("yearly");

  // API hooks
  const apiPeriod = React.useMemo(() => {
    switch (selectedPeriod) {
      case "daily":
        return "day";
      case "weekly":
        return "week";
      case "monthly":
        return "month";
      case "yearly":
      default:
        return "year";
    }
  }, [selectedPeriod]);

  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useSuperAdminDashboard({
    period: apiPeriod,
  });
  const applyFilters = useApplyDashboardFilters();

  React.useEffect(() => {
    applyFilters.mutate({
      period: selectedPeriod as "today" | "week" | "month" | "quarter" | "year",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod]);

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
    {
      title: "Total Cargo",
      value:
        (dashboardData?.data as any)?.stats?.total_cargo?.toLocaleString() ||
        "0",
      description: "All cargos",
      icon: Package,
      iconColor: "text-indigo-600",
    },
    {
      title: "Total Vehicles",
      value:
        dashboardData?.data?.stats?.total_vehicles?.toLocaleString() || "0",
      description: "Fleet size",
      icon: HardDrive,
      iconColor: "text-sky-600",
    },
    {
      title: "Total Drivers",
      value: dashboardData?.data?.stats?.total_drivers?.toLocaleString() || "0",
      description: "Active drivers",
      icon: Users,
      iconColor: "text-teal-600",
    },
    {
      title: "Total Clients",
      value: dashboardData?.data?.stats?.total_clients?.toLocaleString() || "0",
      description: "Registered clients",
      icon: Users,
      iconColor: "text-rose-600",
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
        return "Daily";
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
      case "yearly":
        return "Yearly";
      default:
        return "Monthly";
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
                Error
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
        {superAdminStats.map((stat, index) => {
          const Icon = stat.icon;
          const tone = stat.iconColor.includes("blue")
            ? "blue"
            : stat.iconColor.includes("green")
            ? "green"
            : stat.iconColor.includes("purple")
            ? "purple"
            : stat.iconColor.includes("sky")
            ? "sky"
            : stat.iconColor.includes("teal")
            ? "teal"
            : stat.iconColor.includes("rose")
            ? "rose"
            : "indigo";

          const gradient =
            tone === "blue"
              ? "from-blue-50 to-blue-100 border-blue-200"
              : tone === "green"
              ? "from-green-50 to-green-100 border-green-200"
              : tone === "purple"
              ? "from-purple-50 to-purple-100 border-purple-200"
              : tone === "sky"
              ? "from-sky-50 to-sky-100 border-sky-200"
              : tone === "teal"
              ? "from-teal-50 to-teal-100 border-teal-200"
              : tone === "rose"
              ? "from-rose-50 to-rose-100 border-rose-200"
              : "from-indigo-50 to-indigo-100 border-indigo-200";

          const dot =
            tone === "blue"
              ? "bg-blue-500"
              : tone === "green"
              ? "bg-green-500"
              : tone === "purple"
              ? "bg-purple-500"
              : tone === "sky"
              ? "bg-sky-500"
              : tone === "teal"
              ? "bg-teal-500"
              : tone === "rose"
              ? "bg-rose-500"
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
                  {/* <div
                    className={`p-3 sm:p-3.5 rounded-lg sm:rounded-xl ${iconBg} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div> */}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section - prioritized */}
      <div className="space-y-6 sm:space-y-8">
        {/* Highest priority: Cargo status and distribution across branches */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cargo by Branch - Donut */}
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Cargo by Branch
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {(dashboardData?.data as any)?.charts?.cargo_by_branch?.length ? (
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={
                          (dashboardData?.data as any).charts.cargo_by_branch
                        }
                        dataKey="cargo_count"
                        nameKey="branch_name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                      >
                        {(
                          (dashboardData?.data as any).charts
                            .cargo_by_branch as any[]
                        ).map((_: any, index: number) => (
                          <Cell
                            key={`cell-branch-${index}`}
                            fill={
                              [
                                "#4F46E5",
                                "#06B6D4",
                                "#10B981",
                                "#F59E0B",
                                "#EF4444",
                                "#8B5CF6",
                              ][index % 6]
                            }
                          />
                        ))}
                      </Pie>
                      <ReTooltip
                        formatter={(v: any) => Number(v).toLocaleString()}
                      />
                      <ReLegend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cargo Status Distribution - Pie */}
          <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Cargo Status Distribution
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {(dashboardData?.data as any)?.charts
                ?.cargo_status_distribution ? (
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(
                          (dashboardData?.data as any).charts
                            .cargo_status_distribution
                        ).map(([name, value]) => ({
                          name: (name as string).replace(/_/g, " "),
                          value: Number(value),
                        }))}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        paddingAngle={3}
                      >
                        {Object.entries(
                          (dashboardData?.data as any).charts
                            .cargo_status_distribution
                        ).map(([_, __], index) => (
                          <Cell
                            key={`cell-status-${index}`}
                            fill={
                              [
                                "#10B981",
                                "#3B82F6",
                                "#F59E0B",
                                "#EF4444",
                                "#8B5CF6",
                              ][index % 5]
                            }
                          />
                        ))}
                      </Pie>
                      <ReTooltip
                        formatter={(v: any) => Number(v).toLocaleString()}
                      />
                      <ReLegend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Revenue Trends - Full Width */}
        <RevenueChart data={dashboardData?.data?.charts?.revenue_trends} />

        {/* Super Admin Specific Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Next priority: Regional performance and user mix */}
          <UsersDistributionChart />

          {/* Top Districts - Bar */}
          <Card className="bg-white/80 backdrop-blur-sm border-teal-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Top Districts
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {(dashboardData?.data as any)?.charts?.top_districts?.length ? (
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={(dashboardData?.data as any).charts.top_districts}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis
                        dataKey="district_name"
                        stroke="#6B7280"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis
                        stroke="#6B7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => Number(v).toLocaleString()}
                      />
                      <ReTooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #E5E7EB",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                        formatter={(v: any) => Number(v).toLocaleString()}
                        labelStyle={{ color: "#374151", fontWeight: 600 }}
                      />
                      <Bar
                        dataKey="cargo_count"
                        radius={[4, 4, 0, 0]}
                        name="Cargo Count"
                      >
                        {(
                          (dashboardData?.data as any).charts
                            .top_districts as any[]
                        ).map((entry: any, index: number) => (
                          <Cell
                            key={`cell-district-${index}`}
                            fill={
                              entry.cargo_count >= 500
                                ? "#10B981"
                                : entry.cargo_count >= 300
                                ? "#F59E0B"
                                : "#EF4444"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trends and Admin performance */}
          <UsageTrendsChart />
          <AdminPerformanceChart />

          {/* System Health removed as requested */}
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

      {/* Quick Actions removed as requested */}
    </div>
  );
}
