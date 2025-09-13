import React, { useState } from "react";
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
  Filter,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreHorizontal,
  RefreshCw,
  MapPin,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useClientInvoices } from "@/lib/api/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  InvoiceDetailModal,
  InvoiceDetail,
} from "@/components/ui/InvoiceDetailModal";
import {
  InvoicePaymentModal,
  InvoicePaymentData,
} from "@/components/ui/InvoicePaymentModal";

// Mock invoice data based on database schema
const mockInvoices = [
  {
    id: "INV-2024-001",
    invoiceNumber: "INV-2024-001",
    cargoId: "#3565432",
    subtotal: 280.0,
    taxAmount: 28.0,
    discountAmount: 0.0,
    totalAmount: 308.0,
    currency: "USD",
    status: "paid",
    dueDate: "2024-02-15",
    paidAt: "2024-02-10",
    paymentMethod: "mobile_money",
    paymentReference: "MM123456",
    createdDate: "2024-01-15",
    cargoDetails: {
      type: "Electronics",
      from: "4140 Parker Rd, Allentown, NM",
      to: "3517 W. Gray St. Utica, PA",
    },
  },
  {
    id: "INV-2024-002",
    invoiceNumber: "INV-2024-002",
    cargoId: "#4832920",
    subtotal: 150.0,
    taxAmount: 15.0,
    discountAmount: 10.0,
    totalAmount: 155.0,
    currency: "USD",
    status: "sent",
    dueDate: "2024-02-20",
    createdDate: "2024-01-20",
    cargoDetails: {
      type: "Documents",
      from: "1050 Elden St. Colma, DE",
      to: "6502 Preston Rd. Inglewood, ME",
    },
  },
  {
    id: "INV-2024-003",
    invoiceNumber: "INV-2024-003",
    cargoId: "#1442654",
    subtotal: 320.0,
    taxAmount: 32.0,
    discountAmount: 0.0,
    totalAmount: 352.0,
    currency: "USD",
    status: "overdue",
    dueDate: "2024-02-01",
    createdDate: "2024-01-25",
    cargoDetails: {
      type: "Furniture",
      from: "2972 Westheimer Rd. Santa Ana, IL",
      to: "6391 Elgin St. Celina, DE",
    },
  },
];

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

export default function Invoices() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Modal state
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDetail | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Payment modal state
  const [selectedPaymentInvoice, setSelectedPaymentInvoice] =
    useState<InvoicePaymentData | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // API hooks
  const { data: invoicesData, isLoading, error, refetch } = useClientInvoices();

  // Debug: Let's see what we're getting
  console.log("🔍 DEBUGGING Invoices:");
  console.log("📊 invoicesData:", invoicesData);
  console.log("📊 Array.isArray(invoicesData):", Array.isArray(invoicesData));
  console.log("📊 invoicesData type:", typeof invoicesData);
  console.log("📊 isLoading:", isLoading);
  console.log("📊 error:", error);

  const handleRefresh = () => {
    refetch();
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    // Mock download functionality
    console.log(`Downloading invoice ${invoiceId}`);
    toast.info(t("invoices.downloadInfo"));
    // In real app, this would trigger a PDF download
  };

  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const handlePayNow = (invoiceId: string) => {
    // Find the invoice to pay
    const invoiceToPay = actualInvoices.find(
      (inv: any) => inv.id === invoiceId
    );
    if (invoiceToPay) {
      setSelectedPaymentInvoice(invoiceToPay);
      setIsPaymentModalOpen(true);
    } else {
      toast.error(t("invoices.invoiceNotFound"));
    }
  };

  const handlePaymentSuccess = (paymentData: any) => {
    // Refresh the invoices list to get updated status
    refetch();
    toast.success(t("invoices.paymentProcessedSuccessfully"));
  };

  const formatCurrency = (amount: number, currency: string = "RWF") => {
    return new Intl.NumberFormat("rw-RW", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleDownloadAll = () => {
    toast.info(t("invoices.downloadAllInfo"));
    // In real app, this would download all invoices as a zip file
  };

  // Filter and sort invoices
  const actualInvoices = Array.isArray(invoicesData) ? invoicesData : [];
  const filteredInvoices = actualInvoices.filter((invoice: any) => {
    const matchesSearch =
      searchTerm === "" ||
      invoice.invoice_number
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      invoice.cargo_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
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
        return b.total_amount - a.total_amount;
      case "amount-low":
        return a.total_amount - b.total_amount;
      default:
        return 0;
    }
  });

  const totalPaid = actualInvoices
    .filter((inv: any) => inv.status === "paid")
    .reduce((sum: number, inv: any) => sum + inv.total_amount, 0);
  const totalOutstanding = actualInvoices
    .filter((inv: any) => inv.status === "sent" || inv.status === "overdue")
    .reduce((sum: number, inv: any) => sum + inv.total_amount, 0);

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
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
              {t("invoices.title")}
            </h1>
            <p className="text-muted-foreground">{t("invoices.subtitle")}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            {t("common.refresh")}
          </Button>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <h3 className="font-semibold text-red-800">
                {t("common.error")}
              </h3>
              <p className="text-red-600 text-sm mt-1">
                {error.message || t("invoices.loadError")}
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t("invoices.title")}
          </h1>
          <p className="text-muted-foreground">{t("invoices.subtitle")}</p>
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
            {t("common.refresh")}
          </Button>
          <Button
            className="bg-gradient-primary hover:bg-primary-hover"
            onClick={handleDownloadAll}
          >
            <Receipt className="w-4 h-4 mr-2" />
            {t("invoices.downloadAll")}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("invoices.totalInvoices")}
            </CardTitle>
            <Receipt className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {actualInvoices.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("invoices.allTime")}
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("invoices.totalPaid")}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(totalPaid)}
            </div>
            <p className="text-xs text-success">
              {t("invoices.successfullyPaid")}
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("invoices.outstanding")}
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(totalOutstanding)}
            </div>
            <p className="text-xs text-destructive">
              {t("invoices.pendingPayment")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>{t("invoices.filterSearch")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={t("invoices.searchPlaceholder")}
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder={t("invoices.filterByStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("invoices.allStatus")}</SelectItem>
                <SelectItem value="draft">{t("invoices.draft")}</SelectItem>
                <SelectItem value="sent">{t("invoices.sent")}</SelectItem>
                <SelectItem value="paid">{t("invoices.paid")}</SelectItem>
                <SelectItem value="overdue">{t("invoices.overdue")}</SelectItem>
                <SelectItem value="cancelled">
                  {t("invoices.cancelled")}
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder={t("invoices.sortBy")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">
                  {t("invoices.newestFirst")}
                </SelectItem>
                <SelectItem value="oldest">
                  {t("invoices.oldestFirst")}
                </SelectItem>
                <SelectItem value="amount-high">
                  {t("invoices.amountHighToLow")}
                </SelectItem>
                <SelectItem value="amount-low">
                  {t("invoices.amountLowToHigh")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Table */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>{t("invoices.allInvoices")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("invoices.invoiceNumber")}</TableHead>
                  <TableHead>{t("invoices.cargo")}</TableHead>
                  <TableHead>{t("invoices.amount")}</TableHead>
                  <TableHead>{t("invoices.statusLabel")}</TableHead>
                  <TableHead>{t("invoices.dueDate")}</TableHead>
                  <TableHead>{t("invoices.created")}</TableHead>
                  <TableHead className="text-right">
                    {t("invoices.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedInvoices.map((invoice: any) => {
                  const status =
                    statusConfig[invoice.status as keyof typeof statusConfig];
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoice_number || invoice.id}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-sm">
                            {invoice.cargo?.type || t("invoices.unknownType")}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate max-w-40">
                                {invoice.cargo?.pickup_address ||
                                  t("invoices.unknownLocation")}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate max-w-40">
                                {invoice.cargo?.destination_address ||
                                  t("invoices.unknownLocation")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">
                          {formatCurrency(invoice.total_amount || 0)}
                        </div>
                        {invoice.discount_amount &&
                          invoice.discount_amount > 0 && (
                            <div className="text-xs text-green-600">
                              -{formatCurrency(invoice.discount_amount)}{" "}
                              {t("invoices.discount")}
                            </div>
                          )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={status.className}>
                          {t(`invoices.status.${invoice.status}`)}
                        </Badge>
                        {invoice.status === "paid" &&
                          invoice.payment_method && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {t(
                                `invoices.paymentMethod.${invoice.payment_method}`
                              )}
                            </div>
                          )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {invoice.due_date
                            ? new Date(invoice.due_date).toLocaleDateString()
                            : t("invoices.noDueDate")}
                        </div>
                        {invoice.status === "paid" && invoice.paid_at && (
                          <div className="text-xs text-muted-foreground">
                            {t("invoices.paid")}:{" "}
                            {new Date(invoice.paid_at).toLocaleDateString()}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {invoice.created_at
                          ? new Date(invoice.created_at).toLocaleDateString()
                          : t("invoices.unknownDate")}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewInvoice(invoice)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              {t("invoices.viewDetails")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDownloadInvoice(invoice.id)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              {t("invoices.downloadPdf")}
                            </DropdownMenuItem>
                            {invoice.status === "sent" && (
                              <DropdownMenuItem
                                onClick={() => handlePayNow(invoice.id)}
                              >
                                <DollarSign className="h-4 w-4 mr-2" />
                                {t("invoices.payNow")}
                              </DropdownMenuItem>
                            )}
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
              <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground">
                {t("invoices.noInvoicesFound")}
              </h3>
              <p className="text-muted-foreground">
                {t("invoices.noInvoicesDescription")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Detail Modal */}
      <InvoiceDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        invoice={selectedInvoice}
        onDownload={(invoiceId) => {
          console.log("Downloading invoice:", invoiceId);
          toast.info(t("invoices.downloadInfo"));
        }}
        onPay={(invoiceId) => {
          console.log("Paying invoice:", invoiceId);
          toast.info(t("invoices.payInfo"));
        }}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Invoice Payment Modal */}
      <InvoicePaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedPaymentInvoice(null);
        }}
        invoice={selectedPaymentInvoice}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
