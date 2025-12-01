import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Receipt,
  Download,
  Eye,
  Search,
  RefreshCw,
  DollarSign,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Edit,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useAllInvoices, useUpdateInvoiceStatus } from "@/lib/api/hooks/invoiceHooks";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import ModernModel from "@/components/modal/ModernModel";
import EditInvoiceStatusModal from "@/components/modals/EditInvoiceStatusModal";
import { InvoiceStatus, PaymentMethod } from "@/types/shared";
import { InvoiceDetailModal } from "@/components/ui/InvoiceDetailModal";

// Status configuration
const statusConfig = {
  draft: {
    label: "Draft",
    className: "bg-gray-100 text-gray-800 border-gray-200",
    icon: FileText,
  },
  sent: {
    label: "Sent",
    className: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Clock,
  },
  paid: {
    label: "Paid",
    className: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
  },
  overdue: {
    label: "Overdue",
    className: "bg-red-100 text-red-800 border-red-200",
    icon: AlertCircle,
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-gray-100 text-gray-800 border-gray-200",
    icon: FileText,
  },
};

// Status tabs configuration
const statusTabs = [
  { key: "all", label: "All Invoices", count: 0 },
  { key: "draft", label: "Draft", count: 0 },
  { key: "sent", label: "Sent", count: 0 },
  { key: "paid", label: "Paid", count: 0 },
  { key: "overdue", label: "Overdue", count: 0 },
  { key: "cancelled", label: "Cancelled", count: 0 },
];

export default function AdminInvoices() {
  const { t } = useLanguage();
  const { user } = useAuth();

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal states
  const [isEditStatusModalOpen, setIsEditStatusModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isInvoiceDetailModalOpen, setIsInvoiceDetailModalOpen] =
    useState(false);

  // API hooks
  const {
    data: invoicesData,
    isLoading,
    error,
    refetch,
  } = useAllInvoices({
    status: statusFilter === "all" ? undefined : statusFilter,
    page: currentPage,
    limit: pageSize,
  });

  const updateInvoiceStatusMutation = useUpdateInvoiceStatus();

  // Extract data and pagination
  const invoices = useMemo(() => {
    if (invoicesData) {
      return invoicesData.data || [];
    }
    return [];
  }, [invoicesData]);

  const pagination = useMemo(() => {
    if (invoicesData?.pagination) {
      return invoicesData.pagination;
    }
    return {
      page: currentPage,
      limit: pageSize,
      total: invoices.length,
      totalPages: Math.ceil(invoices.length / pageSize),
    };
  }, [invoicesData, invoices.length, currentPage, pageSize]);

  // Calculate status counts
  const statusCounts = useMemo(() => {
    const counts = {
      all: invoices.length,
      draft: 0,
      sent: 0,
      paid: 0,
      overdue: 0,
      cancelled: 0,
    };
    invoices.forEach((invoice: any) => {
      if (
        invoice.status &&
        Object.prototype.hasOwnProperty.call(counts, invoice.status)
      ) {
        counts[invoice.status as keyof typeof counts]++;
      }
    });
    return counts;
  }, [invoices]);

  // Update status tabs with counts
  const tabsWithCounts = statusTabs.map((tab) => ({
    ...tab,
    count: statusCounts[tab.key as keyof typeof statusCounts] || 0,
  }));

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm, pageSize]);

  // Handlers
  const handleRefresh = () => {
    refetch();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: string) => {
    setPageSize(parseInt(size));
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
    setCurrentPage(1);
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    console.log(`Downloading invoice ${invoiceId}`);
    toast.info("Downloading invoice PDF...");
  };

  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsInvoiceDetailModalOpen(true);
  };

  const handleEditStatus = (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsEditStatusModalOpen(true);
  };

  const formatCurrency = (amount: number, currency: string = "RWF") => {
    return new Intl.NumberFormat("rw-RW", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Filter and sort invoices
  const filteredInvoices = invoices.filter((invoice: any) => {
    const matchesSearch =
      searchTerm === "" ||
      invoice.invoice_number
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      invoice.cargo_id?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const sortedInvoices = [...filteredInvoices].sort((a: any, b: any) => {
    switch (sortBy) {
      case "newest":
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "oldest":
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      case "amount-high":
        return (
          parseFloat(b.total_amount || 0) - parseFloat(a.total_amount || 0)
        );
      case "amount-low":
        return (
          parseFloat(a.total_amount || 0) - parseFloat(b.total_amount || 0)
        );
      default:
        return 0;
    }
  });

  // Calculate totals
  const totalInvoices = pagination.total || invoices.length;
  const totalPaid = invoices.filter((inv: any) => inv.status === "paid").length;
  const totalOutstanding = invoices.filter(
    (inv: any) => inv.status === "sent" || inv.status === "overdue"
  ).length;
  const totalAmount = invoices.reduce(
    (sum: number, inv: any) => sum + parseFloat(inv.total_amount || 0),
    0
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-48" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Invoice Management
            </h1>
            <p className="text-muted-foreground">
              Manage all invoices in the system
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <h3 className="font-semibold text-red-800">Error</h3>
              <p className="text-red-600 text-sm mt-1">
                {error.message || "Failed to load invoices"}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="mt-2"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Invoice Management
          </h1>
          <p className="text-muted-foreground">
            Manage all invoices in the system
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Invoices
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalInvoices}
                </p>
              </div>
              <Receipt className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Paid Invoices
                </p>
                <p className="text-2xl font-bold text-gray-900">{totalPaid}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Outstanding</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalOutstanding}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Amount
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        {tabsWithCounts.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleStatusFilterChange(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              statusFilter === tab.key
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-gray-100 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filters and Search */}
      <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search invoices..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="amount-high">Amount High to Low</SelectItem>
                <SelectItem value="amount-low">Amount Low to High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Table */}
      <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-gray-900">All Invoices</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-medium text-gray-600 w-16">
                    #
                  </TableHead>
                  <TableHead className="text-xs font-medium text-gray-600 w-32">
                    Invoice #
                  </TableHead>
                  <TableHead className="text-xs font-medium text-gray-600 w-36">
                    Cargo #
                  </TableHead>
                  <TableHead className="text-xs font-medium text-gray-600 flex-1">
                    Client
                  </TableHead>
                  <TableHead className="text-xs font-medium text-gray-600 w-24">
                    Amount
                  </TableHead>
                  <TableHead className="text-xs font-medium text-gray-600 w-24">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-medium text-gray-600 w-32">
                    Due Date
                  </TableHead>
                  <TableHead className="text-xs font-medium text-gray-600 w-20">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedInvoices.map((invoice: any, index: number) => {
                  const status =
                    statusConfig[invoice.status as keyof typeof statusConfig];
                  return (
                    <TableRow
                      key={invoice.id}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <TableCell className="text-sm text-gray-500">
                        {(currentPage - 1) * pageSize + index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-sm text-gray-900">
                          {invoice.invoice_number || invoice.id}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm text-gray-600">
                          {invoice.cargo?.cargo_number ||
                            invoice.cargo_id ||
                            "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="font-medium text-sm text-gray-900 mb-1">
                            {invoice.cargo?.client?.user?.full_name ||
                              invoice.cargo?.client?.company_name ||
                              "Unknown Client"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {invoice.cargo?.client?.user?.email ||
                              invoice.cargo?.client?.contact_person ||
                              "No email"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            {formatCurrency(
                              parseFloat(invoice.total_amount || 0)
                            )}
                          </div>
                          {invoice.discount_amount &&
                            parseFloat(invoice.discount_amount) > 0 && (
                              <div className="text-xs text-green-600">
                                -
                                {formatCurrency(
                                  parseFloat(invoice.discount_amount)
                                )}{" "}
                                discount
                              </div>
                            )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={status.className}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-900">
                          {invoice.due_date
                            ? new Date(invoice.due_date).toLocaleDateString()
                            : "No due date"}
                        </div>
                        {invoice.status === "paid" && invoice.paid_at && (
                          <div className="text-xs text-gray-500">
                            Paid:{" "}
                            {new Date(invoice.paid_at).toLocaleDateString()}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewInvoice(invoice)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDownloadInvoice(invoice.id)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditStatus(invoice)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Status
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {sortedInvoices.length === 0 && (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600">
                No invoices found
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? "Try adjusting your search criteria"
                  : "No invoices match the current filter"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Page Size Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show per page:</span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={handlePageSizeChange}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Pagination Info */}
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * pageSize + 1} -{" "}
                {Math.min(currentPage * pageSize, pagination.total || 0)} of{" "}
                {pagination.total || 0} results
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages || 1) },
                    (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= (pagination.totalPages || 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoice Detail Modal */}
      <InvoiceDetailModal
        isOpen={isInvoiceDetailModalOpen}
        onClose={() => {
          setIsInvoiceDetailModalOpen(false);
          setSelectedInvoice(null);
        }}
        invoice={selectedInvoice}
        showAdminActions={true}
        onDownload={(invoiceId) => {
          console.log("Downloading invoice:", invoiceId);
          toast.info("Downloading invoice PDF...");
        }}
        onPaymentSuccess={(paymentData) => {
          toast.success("Invoice status updated successfully!");
          refetch();
        }}
      />
    </div>
  );
}
