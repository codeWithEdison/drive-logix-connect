import React, { useState } from "react";
import { CustomTabs } from "@/components/ui/CustomTabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  Download,
  Printer,
  Mail,
  BarChart3,
  DollarSign,
  Users,
  TrendingUp,
  Package,
  Calendar,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  useFinancialReports,
  usePerformanceReports,
  useFinancialAnalytics,
  useCargoAnalytics,
  useDriverAnalytics,
  useExportAnalyticsData,
} from "@/lib/api/hooks";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { customToast } from "@/lib/utils/toast";

const AdminReports = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("financial");
  const [dateRange, setDateRange] = useState("30");
  const [reportType, setReportType] = useState("summary");
  const [exportFormat, setExportFormat] = useState("pdf");

  // API hooks
  const {
    data: financialReportsData,
    isLoading: financialLoading,
    error: financialError,
    refetch: refetchFinancial,
  } = useFinancialReports({
    start_date: new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
    group_by: reportType,
  });

  const {
    data: performanceReportsData,
    isLoading: performanceLoading,
    error: performanceError,
    refetch: refetchPerformance,
  } = usePerformanceReports({
    start_date: new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
  });

  const {
    data: financialAnalyticsData,
    isLoading: financialAnalyticsLoading,
    error: financialAnalyticsError,
  } = useFinancialAnalytics({
    start_date: new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
    group_by: "day",
  });

  const {
    data: cargoAnalyticsData,
    isLoading: cargoAnalyticsLoading,
    error: cargoAnalyticsError,
  } = useCargoAnalytics({
    start_date: new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
    group_by: "day",
  });

  const {
    data: driverAnalyticsData,
    isLoading: driverAnalyticsLoading,
    error: driverAnalyticsError,
  } = useDriverAnalytics({
    start_date: new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
    group_by: "day",
  });

  const exportAnalyticsMutation = useExportAnalyticsData();

  // Event handlers
  const handleRefresh = () => {
    refetchFinancial();
    refetchPerformance();
    customToast.success(t("common.refreshed"));
  };

  const handleExportReport = async (type: string) => {
    try {
      const params = {
        start_date: new Date(
          Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000
        )
          .toISOString()
          .split("T")[0],
        end_date: new Date().toISOString().split("T")[0],
        group_by: reportType,
        report_type: type,
      };

      await exportAnalyticsMutation.mutateAsync({
        params,
        format: exportFormat as "pdf" | "excel" | "csv",
      });

      customToast.success(t("adminReports.reportExported"));
    } catch (error) {
      customToast.error(t("errors.exportFailed"));
    }
  };

  const handlePrintReport = () => {
    window.print();
    customToast.info(t("adminReports.printingReport"));
  };

  const handleEmailReport = () => {
    customToast.info(t("adminReports.emailReport"));
  };

  // Loading state
  const isLoading =
    financialLoading ||
    performanceLoading ||
    financialAnalyticsLoading ||
    cargoAnalyticsLoading ||
    driverAnalyticsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Filters Skeleton */}
        <div className="flex gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Tabs Skeleton */}
        <Skeleton className="h-12 w-full" />

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  const hasError =
    financialError ||
    performanceError ||
    financialAnalyticsError ||
    cargoAnalyticsError ||
    driverAnalyticsError;

  if (hasError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("adminReports.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("adminReports.subtitle")}
            </p>
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
                  {(
                    financialError ||
                    performanceError ||
                    financialAnalyticsError ||
                    cargoAnalyticsError ||
                    driverAnalyticsError
                  )?.message || t("adminReports.loadError")}
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

  const tabs = [
    {
      value: "financial",
      label: t("adminReports.financial"),
      count: financialReportsData?.data?.total_revenue ? 1 : 0,
    },
    {
      value: "performance",
      label: t("adminReports.performance"),
      count: performanceReportsData?.data?.total_deliveries ? 1 : 0,
    },
    {
      value: "analytics",
      label: t("adminReports.analytics"),
      count: 1,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t("adminReports.title")}
          </h1>
          <p className="text-muted-foreground">{t("adminReports.subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            {t("common.refresh")}
          </Button>
          <Button onClick={() => handleExportReport("summary")}>
            <Download className="h-4 w-4 mr-2" />
            {t("adminReports.export")}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="dateRange">{t("adminReports.dateRange")}:</Label>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">{t("adminReports.last7Days")}</SelectItem>
              <SelectItem value="30">{t("adminReports.last30Days")}</SelectItem>
              <SelectItem value="90">{t("adminReports.last90Days")}</SelectItem>
              <SelectItem value="365">{t("adminReports.lastYear")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="reportType">{t("adminReports.reportType")}:</Label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="summary">
                {t("adminReports.summary")}
              </SelectItem>
              <SelectItem value="detailed">
                {t("adminReports.detailed")}
              </SelectItem>
              <SelectItem value="monthly">
                {t("adminReports.monthly")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="exportFormat">
            {t("adminReports.exportFormat")}:
          </Label>
          <Select value={exportFormat} onValueChange={setExportFormat}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <CustomTabs tabs={tabs} value={activeTab} onValueChange={setActiveTab} />

      {/* Tab Content */}
      {activeTab === "financial" && (
        <div className="space-y-6">
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("adminReports.totalRevenue")}
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  RWF{" "}
                  {financialAnalyticsData?.total_revenue?.toLocaleString() ||
                    "0"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("adminReports.lastPeriod")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("adminReports.totalOrders")}
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {financialAnalyticsData?.total_revenue ? "N/A" : "0"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("adminReports.completedDeliveries")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("adminReports.averageOrderValue")}
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  RWF {financialAnalyticsData?.total_revenue ? "N/A" : "0"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("adminReports.perDelivery")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("adminReports.profitMargin")}
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {financialAnalyticsData?.profit_margin?.toFixed(1) || "0"}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("adminReports.netProfit")}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Financial Reports Table */}
          <Card>
            <CardHeader>
              <CardTitle>{t("adminReports.financialDetails")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("adminReports.date")}</TableHead>
                    <TableHead>{t("adminReports.revenue")}</TableHead>
                    <TableHead>{t("adminReports.orders")}</TableHead>
                    <TableHead>{t("adminReports.profit")}</TableHead>
                    <TableHead>{t("adminReports.status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financialReportsData?.data?.daily_revenue
                    ?.slice(0, 10)
                    .map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>
                          RWF {item.revenue?.toLocaleString()}
                        </TableCell>
                        <TableCell>{item.orders}</TableCell>
                        <TableCell>
                          RWF {item.profit?.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {t("status.completed")}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )) || (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground"
                      >
                        {t("adminReports.noData")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "performance" && (
        <div className="space-y-6">
          {/* Performance Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("adminReports.totalDeliveries")}
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performanceReportsData?.data?.total_deliveries || "0"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("adminReports.completed")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("adminReports.averageDeliveryTime")}
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performanceReportsData?.data?.average_delivery_time || "0"}h
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("adminReports.fromPickupToDelivery")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("adminReports.onTimeDelivery")}
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performanceReportsData?.data?.on_time_delivery_rate?.toFixed(
                    1
                  ) || "0"}
                  %
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("adminReports.onTimeRate")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("adminReports.activeDrivers")}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performanceReportsData?.data?.active_drivers || "0"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("adminReports.currentlyActive")}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Reports Table */}
          <Card>
            <CardHeader>
              <CardTitle>{t("adminReports.performanceDetails")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("adminReports.driver")}</TableHead>
                    <TableHead>{t("adminReports.deliveries")}</TableHead>
                    <TableHead>{t("adminReports.avgTime")}</TableHead>
                    <TableHead>{t("adminReports.rating")}</TableHead>
                    <TableHead>{t("adminReports.status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {performanceReportsData?.data?.driver_performance
                    ?.slice(0, 10)
                    .map((driver: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{driver.driver_name}</TableCell>
                        <TableCell>{driver.total_deliveries}</TableCell>
                        <TableCell>{driver.average_delivery_time}h</TableCell>
                        <TableCell>{driver.rating?.toFixed(1)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {t(`status.${driver.status}`)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )) || (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground"
                      >
                        {t("adminReports.noData")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Analytics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("adminReports.cargoAnalytics")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{t("adminReports.totalCargos")}</span>
                    <span className="font-semibold">
                      {cargoAnalyticsData?.total_cargos || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("adminReports.deliveredCargos")}</span>
                    <span className="font-semibold">
                      {cargoAnalyticsData?.delivered_cargos || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("adminReports.pendingCargos")}</span>
                    <span className="font-semibold">
                      {cargoAnalyticsData?.pending_cargos || "0"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("adminReports.driverAnalytics")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{t("adminReports.totalDrivers")}</span>
                    <span className="font-semibold">
                      {driverAnalyticsData?.total_drivers || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("adminReports.activeDrivers")}</span>
                    <span className="font-semibold">
                      {driverAnalyticsData?.active_drivers || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("adminReports.avgRating")}</span>
                    <span className="font-semibold">
                      {driverAnalyticsData?.average_rating?.toFixed(1) || "0"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("adminReports.actions")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleExportReport("analytics")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {t("adminReports.exportAnalytics")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handlePrintReport}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    {t("adminReports.print")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleEmailReport}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {t("adminReports.email")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
