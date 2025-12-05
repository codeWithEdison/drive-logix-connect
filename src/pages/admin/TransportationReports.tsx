import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download,
  RefreshCw,
  Calendar,
  Filter,
  AlertCircle,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useTransportationReports } from "@/lib/api/hooks/utilityHooks";
import { useBranches } from "@/lib/api/hooks/branchHooks";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { customToast } from "@/lib/utils/toast";

interface TransportationReportData {
  serial_number: number;
  year_month: string;
  order_number: string;
  operation_manager: string | null;
  customer_name: string | null;
  shipper_contact: string | null;
  shipper_phone: string | null;
  delivery_date: string | null;
  shipper_address: string | null;
  cargo_category: string;
  recipient_contact: string | null;
  recipient_phone: string | null;
  receiver_address: string | null;
  received_date: string | null;
  distance_km: number | null;
  weight_kg: number;
  unit: string;
  payment_method: string | null;
  payment_account: null;
  transport_nature: string;
  unit_price_rwf: number | null;
  total_price_rwf: number | null;
  fuel_cost_rwf: null;
  other_cost_rwf: number | null;
  gross_profit_rwf: number | null;
  plate_number: string | null;
  driver_name: string | null;
  driver_assistant_name: null;
  time_money_received: string | null;
}

export default function TransportationReports() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "super_admin";

  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedBranchId, setSelectedBranchId] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Fetch branches for super admin
  const { data: branchesData } = useBranches();

  // Fetch transportation reports
  const {
    data: reportsData,
    isLoading,
    error,
    refetch,
  } = useTransportationReports({
    start_date: startDate,
    end_date: endDate,
    branch_id: selectedBranchId === "all" ? undefined : selectedBranchId,
  });

  const reports: TransportationReportData[] = reportsData?.report || [];
  const totalRecords = reportsData?.total_records || 0;

  // Pagination calculations
  const totalPages = Math.ceil(reports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReports = reports.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate, selectedBranchId]);

  // Format number with commas
  const formatNumber = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return "";
    return value.toLocaleString("en-US");
  };

  // Format date from DD/MM/YYYY HH:mm to readable format
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "";
    return dateString;
  };

  // Download Excel/CSV file
  const downloadExcel = () => {
    if (reports.length === 0) {
      customToast.error("No data to export");
      return;
    }

    // CSV Headers matching the template (simplified for CSV compatibility)
    const headers = [
      "序号 S/N",
      "年月 year/month",
      "订单编号 Order No (YYNNDDXX)",
      "业务经理 Operation manager",
      "客户名称 customer name",
      "发货联系人 Contact person of Shipper",
      "联系电话 TEL",
      "发货日期 Delivery date",
      "发货地址 Address of Shipper",
      "货物类别 Cargos category",
      "收货联系人 Recipient contact",
      "联系电话 TEL",
      "收货地址 Address of Receiver",
      "收货日期 Received date",
      "距离（KM)",
      "重量Weight (kg)",
      "Unit",
      "付款方式 Payment methods",
      "付款账号 Payment account",
      "运输性质（专线/顺带） Transport nature (dedicated line or not, Y/N)",
      "运费单价(RWF) Unit Price",
      "总运费(RWF) Total price",
      "燃油费(RWF) Fuel cost",
      "其他费用(RWF) Other cost",
      "毛利润(RWF) Gross profit",
      "运输车牌 Plate number",
      "司机姓名 Driver's name",
      "司机助理姓名 Driver assistant's name",
      "Time the money received",
    ];

    // Escape CSV values
    const escapeValue = (value: any): string => {
      if (value === null || value === undefined) return "";
      const str = String(value);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Build CSV rows
    const rows = reports.map((report) => [
      report.serial_number,
      report.year_month,
      report.order_number,
      report.operation_manager || "",
      report.customer_name || "",
      report.shipper_contact || "",
      report.shipper_phone || "",
      formatDate(report.delivery_date),
      report.shipper_address || "",
      report.cargo_category,
      report.recipient_contact || "",
      report.recipient_phone || "",
      report.receiver_address || "",
      formatDate(report.received_date),
      report.distance_km || "",
      report.weight_kg,
      report.unit,
      report.payment_method || "",
      report.payment_account || "",
      report.transport_nature,
      formatNumber(report.unit_price_rwf),
      formatNumber(report.total_price_rwf),
      report.fuel_cost_rwf || "",
      formatNumber(report.other_cost_rwf),
      formatNumber(report.gross_profit_rwf),
      report.plate_number || "",
      report.driver_name || "",
      report.driver_assistant_name || "",
      formatDate(report.time_money_received),
    ]);

    // Calculate totals
    const totalPrice = reports.reduce(
      (sum, r) => sum + (r.total_price_rwf || 0),
      0
    );

    // Create CSV content
    const csvContent = [
      headers.map(escapeValue).join(","),
      ...rows.map((row) => row.map(escapeValue).join(",")),
      // Add total row
      [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "TOTAL",
        formatNumber(totalPrice),
        "",
        "",
        "",
        "",
        "",
        "",
      ]
        .map(escapeValue)
        .join(","),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const filename = `Loveway_Logistics_Transportation_Order_Management_Form_${startDate}_${endDate}.csv`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    customToast.success("Download started successfully");
  };

  const handleRefresh = () => {
    refetch();
    customToast.success("Data refreshed");
  };

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-full overflow-x-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transportation Reports</h1>
          <p className="text-muted-foreground mt-1">
            View and export transportation order management reports
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 w-full">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
              />
            </div>
            {isSuperAdmin && (
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Select
                  value={selectedBranchId}
                  onValueChange={setSelectedBranchId}
                >
                  <SelectTrigger id="branch" className="w-full">
                    <SelectValue placeholder="All Branches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    {branchesData?.branches?.map((branch: any) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="items-per-page">Items per page</Label>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger id="items-per-page" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1 xl:col-span-1 w-full">
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="flex-1 min-w-0 shrink"
              >
                <RefreshCw className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button
                onClick={downloadExcel}
                className="flex-1 min-w-0 shrink"
                disabled={reports.length === 0}
              >
                <FileSpreadsheet className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Download</span>
                <span className="hidden lg:inline"> Excel</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Records</p>
              <p className="text-2xl font-bold">{totalRecords}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Total Revenue (RWF)
              </p>
              <p className="text-2xl font-bold">
                {formatNumber(
                  reports.reduce((sum, r) => sum + (r.total_price_rwf || 0), 0)
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Total Gross Profit (RWF)
              </p>
              <p className="text-2xl font-bold">
                {formatNumber(
                  reports.reduce((sum, r) => sum + (r.gross_profit_rwf || 0), 0)
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Report Data ({totalRecords} records)</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="flex items-center gap-2 text-destructive mb-4 p-4 bg-destructive/10 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <span>
                Error loading data:{" "}
                {error instanceof Error ? error.message : String(error)}
              </span>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No data available
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Order No</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Delivery Date</TableHead>
                    <TableHead>Weight (kg)</TableHead>
                    <TableHead>Total Price (RWF)</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Vehicle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedReports.map((report) => (
                    <TableRow key={report.serial_number}>
                      <TableCell>{report.serial_number}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {report.order_number}
                      </TableCell>
                      <TableCell>{report.customer_name || "-"}</TableCell>
                      <TableCell>{report.operation_manager || "-"}</TableCell>
                      <TableCell>{formatDate(report.delivery_date)}</TableCell>
                      <TableCell>{formatNumber(report.weight_kg)}</TableCell>
                      <TableCell className="font-semibold">
                        {formatNumber(report.total_price_rwf)}
                      </TableCell>
                      <TableCell>{report.driver_name || "-"}</TableCell>
                      <TableCell>{report.plate_number || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination Controls */}
          {!isLoading && reports.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4 mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, reports.length)}{" "}
                of {reports.length} results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage >= totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
