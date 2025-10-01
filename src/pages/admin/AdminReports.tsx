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
import { toast } from "@/hooks/use-toast";
import ModernModel from "@/components/modal/ModernModel";
import { DriverAnalytics } from "@/types/shared";

const AdminReports = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("financial");
  const [dateRange, setDateRange] = useState("30");
  const [reportType, setReportType] = useState("day"); // Changed from "summary" to "day"
  const [exportFormat, setExportFormat] = useState("pdf");
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedDownloadType, setSelectedDownloadType] = useState("all");
  const [isDownloading, setIsDownloading] = useState(false);

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
    // Remove driver_id parameter as it requires a valid GUID
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
    // Remove group_by for analytics endpoints as it's not allowed
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
    // Remove group_by for analytics endpoints as it's not allowed
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
    // Remove group_by for analytics endpoints as it's not allowed
  });

  const exportAnalyticsMutation = useExportAnalyticsData();

  // Type assertion to help TypeScript understand the data structure
  const driverData = driverAnalyticsData as DriverAnalytics | undefined;

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

  const handleDownloadReport = async () => {
    setIsDownloading(true);

    try {
      let dataToExport: any[] = [];
      let filename = "";

      // Prepare data based on selected type
      if (selectedDownloadType === "financial") {
        dataToExport = financialReportsData?.data || [];
        filename = "financial_report";
      } else if (selectedDownloadType === "performance") {
        // Group performance data by driver
        const driverStats = new Map();
        performanceReportsData?.data?.forEach((cargo: any) => {
          const driverName = cargo.driver
            ? cargo.driver.full_name
            : "Unassigned";
          const isDelivered = cargo.status === "delivered";
          const price = cargo.price || 0;

          if (!driverStats.has(driverName)) {
            driverStats.set(driverName, {
              driver: driverName,
              deliveries: 0,
              totalValue: 0,
            });
          }

          const stats = driverStats.get(driverName);
          if (isDelivered) {
            stats.deliveries += 1;
            stats.totalValue += price;
          }
        });

        dataToExport = Array.from(driverStats.values())
          .filter((driver) => driver.driver !== "Unassigned")
          .sort((a, b) => b.deliveries - a.deliveries);
        filename = "performance_report";
      } else if (selectedDownloadType === "all") {
        // Combine all data
        const allData = {
          financial: financialReportsData?.data || [],
          performance: performanceReportsData?.data || [],
          summary: {
            financial: financialReportsData?.summary || {},
            performance: performanceReportsData?.summary || {},
          },
        };
        dataToExport = [allData];
        filename = "all_reports";
      }

      // Generate and download file
      if (exportFormat === "csv") {
        downloadCSV(dataToExport, filename);
      } else if (exportFormat === "excel") {
        downloadExcel(dataToExport, filename);
      } else if (exportFormat === "pdf") {
        downloadPDF(dataToExport, filename);
      }

      toast({
        title: "Download Complete",
        description: `${
          selectedDownloadType === "all"
            ? "All reports"
            : selectedDownloadType.charAt(0).toUpperCase() +
              selectedDownloadType.slice(1) +
              " report"
        } downloaded successfully as ${exportFormat.toUpperCase()}`,
      });

      setShowDownloadModal(false);
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to download report";
      toast({
        title: "Download Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // CSV Download Function
  const downloadCSV = (data: any[], filename: string) => {
    if (selectedDownloadType === "all") {
      // Handle combined data
      const csvContent = generateAllReportsCSV(data[0]);
      downloadFile(csvContent, `${filename}.csv`, "text/csv");
    } else {
      // Handle single report type
      const csvContent = generateCSV(data);
      downloadFile(csvContent, `${filename}.csv`, "text/csv");
    }
  };

  // Excel Download Function
  const downloadExcel = (data: any[], filename: string) => {
    if (selectedDownloadType === "all") {
      // For all reports, create a simple CSV (Excel can open CSV)
      const csvContent = generateAllReportsCSV(data[0]);
      downloadFile(
        csvContent,
        `${filename}.xlsx`,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
    } else {
      const csvContent = generateCSV(data);
      downloadFile(
        csvContent,
        `${filename}.xlsx`,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
    }
  };

  // PDF Download Function
  const downloadPDF = (data: any[], filename: string) => {
    // Create a simple text-based report for PDF
    let reportContent = "";

    if (selectedDownloadType === "all") {
      reportContent = generateAllReportsText(data[0]);
    } else {
      reportContent = generateTextReport(data);
    }

    downloadFile(reportContent, `${filename}.txt`, "text/plain");
  };

  // Generate CSV content
  const generateCSV = (data: any[]) => {
    if (data.length === 0) return "";

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(",");
    const csvRows = data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          return typeof value === "string" && value.includes(",")
            ? `"${value}"`
            : value;
        })
        .join(",")
    );

    return [csvHeaders, ...csvRows].join("\n");
  };

  // Generate combined reports CSV
  const generateAllReportsCSV = (data: any) => {
    let content = "=== FINANCIAL REPORTS ===\n";
    if (data.financial && data.financial.length > 0) {
      content += generateCSV(data.financial) + "\n\n";
    }

    content += "=== PERFORMANCE REPORTS ===\n";
    if (data.performance && data.performance.length > 0) {
      // Group performance data
      const driverStats = new Map();
      data.performance.forEach((cargo: any) => {
        const driverName = cargo.driver ? cargo.driver.full_name : "Unassigned";
        const isDelivered = cargo.status === "delivered";
        const price = cargo.price || 0;

        if (!driverStats.has(driverName)) {
          driverStats.set(driverName, {
            driver: driverName,
            deliveries: 0,
            totalValue: 0,
          });
        }

        const stats = driverStats.get(driverName);
        if (isDelivered) {
          stats.deliveries += 1;
          stats.totalValue += price;
        }
      });

      const performanceData = Array.from(driverStats.values())
        .filter((driver) => driver.driver !== "Unassigned")
        .sort((a, b) => b.deliveries - a.deliveries);

      content += generateCSV(performanceData) + "\n\n";
    }

    content += "=== SUMMARY ===\n";

    // Financial Summary
    if (data.summary.financial) {
      content += "Financial Summary:\n";
      content += `- Total Revenue: RWF ${
        data.summary.financial.total_revenue || 0
      }\n`;
      content += `- Total Deliveries: ${
        data.summary.financial.total_deliveries || 0
      }\n`;
      content += `- Average Revenue per Delivery: RWF ${
        data.summary.financial.average_revenue_per_delivery || 0
      }\n`;
    }

    // Performance Summary
    if (data.summary.performance) {
      content += "\nPerformance Summary:\n";
      content += `- Total Deliveries: ${
        data.summary.performance.total_deliveries || 0
      }\n`;
      content += `- Completed Deliveries: ${
        data.summary.performance.completed_deliveries || 0
      }\n`;
      content += `- Total Revenue: RWF ${
        data.summary.performance.total_revenue || 0
      }\n`;
      content += `- Average Delivery Time: ${
        data.summary.performance.average_delivery_time_hours || 0
      } hours\n`;
      content += `- Completion Rate: ${
        data.summary.performance.completion_rate || 0
      }%\n`;
    }

    return content;
  };

  // Generate text report
  const generateTextReport = (data: any[]) => {
    let content = `Report Generated: ${new Date().toLocaleString()}\n`;
    content += `Date Range: Last ${dateRange} days\n`;
    content += `Group By: ${reportType}\n\n`;

    if (selectedDownloadType === "financial") {
      content += "=== FINANCIAL REPORTS ===\n";
      data.forEach((item, index) => {
        content += `${index + 1}. Date: ${item.date || "N/A"}, Revenue: RWF ${
          item.revenue || 0
        }, Orders: ${item.orders || 0}, Status: ${item.status || "N/A"}\n`;
      });
    } else if (selectedDownloadType === "performance") {
      content += "=== PERFORMANCE REPORTS ===\n";
      data.forEach((item, index) => {
        content += `${index + 1}. Driver: ${item.driver}, Deliveries: ${
          item.deliveries
        }, Total Value: RWF ${item.totalValue}\n`;
      });
    }

    return content;
  };

  // Generate combined text report
  const generateAllReportsText = (data: any) => {
    let content = `Comprehensive Report Generated: ${new Date().toLocaleString()}\n`;
    content += `Date Range: Last ${dateRange} days\n`;
    content += `Group By: ${reportType}\n\n`;

    content += generateTextReport(data.financial || []);
    content += "\n" + generateTextReport(data.performance || []);

    return content;
  };

  // Generic file download function
  const downloadFile = (
    content: string,
    filename: string,
    mimeType: string
  ) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
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
      count: financialReportsData?.summary?.total_revenue ? 1 : 0,
    },
    {
      value: "performance",
      label: t("adminReports.performance"),
      count: performanceReportsData?.summary?.total_deliveries ? 1 : 0,
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
          <Button onClick={() => setShowDownloadModal(true)}>
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
              <SelectItem value="day">{t("adminReports.daily")}</SelectItem>
              <SelectItem value="week">{t("adminReports.weekly")}</SelectItem>
              <SelectItem value="month">{t("adminReports.monthly")}</SelectItem>
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
                  {financialReportsData?.summary?.total_revenue?.toLocaleString() ||
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
                  {financialReportsData?.summary?.total_deliveries || "0"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("adminReports.completedDeliveries")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("adminReports.completionRate")}
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performanceReportsData?.summary?.completion_rate?.toFixed(
                    1
                  ) || "0"}
                  %
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("adminReports.deliverySuccess")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("adminReports.averageOrderValue")}
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  RWF{" "}
                  {financialReportsData?.summary?.average_revenue_per_delivery?.toFixed(
                    0
                  ) || "0"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("adminReports.perDelivery")}
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
                    <TableHead>{t("adminReports.status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financialReportsData?.data
                    ?.slice(0, 10)
                    .map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>
                          RWF {item.revenue?.toLocaleString()}
                        </TableCell>
                        <TableCell>{item.count}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {t("status.completed")}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )) || (
                    <TableRow>
                      <TableCell
                        colSpan={4}
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
                  {performanceReportsData?.summary?.total_deliveries || "0"}
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
                  {performanceReportsData?.summary?.average_delivery_time_hours?.toFixed(
                    1
                  ) || "0"}
                  h
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
                  {performanceReportsData?.summary?.completion_rate?.toFixed(
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
                  {driverData?.active_drivers || "0"}
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
                    <TableHead>{t("adminReports.deliveryValue")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    // Group cargos by driver and calculate totals
                    const driverStats = new Map();

                    performanceReportsData?.data?.forEach((cargo: any) => {
                      const driverName = cargo.driver
                        ? cargo.driver.full_name
                        : "Unassigned";
                      const isDelivered = cargo.status === "delivered";
                      const price = cargo.price || 0;

                      if (!driverStats.has(driverName)) {
                        driverStats.set(driverName, {
                          name: driverName,
                          deliveries: 0,
                          totalValue: 0,
                        });
                      }

                      const stats = driverStats.get(driverName);
                      if (isDelivered) {
                        stats.deliveries += 1;
                        stats.totalValue += price;
                      }
                    });

                    // Convert to array, filter out unassigned, and sort by deliveries (descending)
                    const sortedDrivers = Array.from(driverStats.values())
                      .filter((driver) => driver.name !== "Unassigned")
                      .sort((a, b) => b.deliveries - a.deliveries)
                      .slice(0, 10);

                    return sortedDrivers.map((driver, index) => (
                      <TableRow key={index}>
                        <TableCell>{driver.name}</TableCell>
                        <TableCell>{driver.deliveries}</TableCell>
                        <TableCell>
                          RWF {driver.totalValue.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ));
                  })() || (
                    <TableRow>
                      <TableCell
                        colSpan={3}
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
                      {performanceReportsData?.summary?.total_deliveries || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("adminReports.deliveredCargos")}</span>
                    <span className="font-semibold">
                      {performanceReportsData?.summary?.completed_deliveries ||
                        "0"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("adminReports.pendingCargos")}</span>
                    <span className="font-semibold">
                      {(performanceReportsData?.summary?.total_deliveries ||
                        0) -
                        (performanceReportsData?.summary
                          ?.completed_deliveries || 0)}
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
                      {driverData?.total_drivers || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("adminReports.activeDrivers")}</span>
                    <span className="font-semibold">
                      {driverData?.active_drivers || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("adminReports.avgRating")}</span>
                    <span className="font-semibold">
                      {driverData?.average_rating?.toFixed(1) || "0"}
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

      {/* Download Modal */}
      <ModernModel
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        title="Download Report"
      >
        <div className="space-y-6">
          {/* Report Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Report Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedDownloadType === "all"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedDownloadType("all")}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          selectedDownloadType === "all"
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedDownloadType === "all" && (
                          <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">All Reports</h4>
                        <p className="text-sm text-gray-600">
                          Download financial, performance, and analytics reports
                          in one file
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedDownloadType === "financial"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedDownloadType("financial")}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          selectedDownloadType === "financial"
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedDownloadType === "financial" && (
                          <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">Financial Report</h4>
                        <p className="text-sm text-gray-600">
                          Revenue, orders, and financial metrics
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedDownloadType === "performance"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedDownloadType("performance")}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          selectedDownloadType === "performance"
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedDownloadType === "performance" && (
                          <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">Performance Report</h4>
                        <p className="text-sm text-gray-600">
                          Delivery metrics, driver performance, and completion
                          rates
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Download Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Download Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="downloadFormat">File Format</Label>
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                      <SelectItem value="csv">CSV File</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="downloadDateRange">Date Range</Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Last 7 Days</SelectItem>
                      <SelectItem value="30">Last 30 Days</SelectItem>
                      <SelectItem value="90">Last 90 Days</SelectItem>
                      <SelectItem value="365">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="downloadGroupBy">Group By</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Daily</SelectItem>
                      <SelectItem value="week">Weekly</SelectItem>
                      <SelectItem value="month">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Download Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Download Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Report Type:</span>
                  <span className="font-medium">
                    {selectedDownloadType === "all"
                      ? "All Reports"
                      : selectedDownloadType === "financial"
                      ? "Financial Report"
                      : "Performance Report"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">File Format:</span>
                  <span className="font-medium">
                    {exportFormat.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date Range:</span>
                  <span className="font-medium">Last {dateRange} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Grouping:</span>
                  <span className="font-medium">
                    {reportType === "day"
                      ? "Daily"
                      : reportType === "week"
                      ? "Weekly"
                      : "Monthly"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowDownloadModal(false)}
              disabled={isDownloading}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleDownloadReport}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </>
              )}
            </Button>
          </div>
        </div>
      </ModernModel>
    </div>
  );
};

export default AdminReports;
