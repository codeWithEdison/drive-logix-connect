import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { createPortal } from "react-dom";
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
  Calendar,
  DollarSign,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreHorizontal,
  RefreshCw,
  MapPin,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
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

// Status config will use translations
const getStatusConfig = (t: (key: string) => string) => ({
  draft: {
    className: "bg-gray-100 text-gray-800 border-gray-200",
  },
  sent: {
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  paid: {
    className: "bg-green-100 text-green-800 border-green-200",
  },
  overdue: {
    className: "bg-red-100 text-red-800 border-red-200",
  },
  cancelled: {
    className: "bg-gray-100 text-gray-800 border-gray-200",
  },
});

export default function Invoices() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Search states for comboboxes
  const [statusSearch, setStatusSearch] = useState("");
  const [sortSearch, setSortSearch] = useState("");
  const [pageSizeSearch, setPageSizeSearch] = useState("");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showPageSizeDropdown, setShowPageSizeDropdown] = useState(false);

  const statusInputRef = useRef<HTMLInputElement>(null);
  const sortInputRef = useRef<HTMLInputElement>(null);
  const pageSizeInputRef = useRef<HTMLInputElement>(null);

  const [statusDropdownPos, setStatusDropdownPos] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const [sortDropdownPos, setSortDropdownPos] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const [pageSizeDropdownPos, setPageSizeDropdownPos] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const calculateDropdownPosition = (
    inputRef: React.RefObject<HTMLInputElement>
  ) => {
    if (!inputRef.current) return { top: 0, left: 0, width: 0 };
    const rect = inputRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    };
  };

  useEffect(() => {
    if (showStatusDropdown && statusInputRef.current) {
      setStatusDropdownPos(calculateDropdownPosition(statusInputRef));
    }
  }, [showStatusDropdown]);

  useEffect(() => {
    if (showSortDropdown && sortInputRef.current) {
      setSortDropdownPos(calculateDropdownPosition(sortInputRef));
    }
  }, [showSortDropdown]);

  useEffect(() => {
    if (showPageSizeDropdown && pageSizeInputRef.current) {
      setPageSizeDropdownPos(calculateDropdownPosition(pageSizeInputRef));
    }
  }, [showPageSizeDropdown]);

  useEffect(() => {
    const updatePositions = () => {
      if (showStatusDropdown && statusInputRef.current) {
        setStatusDropdownPos(calculateDropdownPosition(statusInputRef));
      }
      if (showSortDropdown && sortInputRef.current) {
        setSortDropdownPos(calculateDropdownPosition(sortInputRef));
      }
      if (showPageSizeDropdown && pageSizeInputRef.current) {
        setPageSizeDropdownPos(calculateDropdownPosition(pageSizeInputRef));
      }
    };

    window.addEventListener("scroll", updatePositions, true);
    window.addEventListener("resize", updatePositions);

    return () => {
      window.removeEventListener("scroll", updatePositions, true);
      window.removeEventListener("resize", updatePositions);
    };
  }, [showStatusDropdown, showSortDropdown, showPageSizeDropdown]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
  const {
    data: invoicesData,
    isLoading,
    error,
    refetch,
  } = useClientInvoices({
    status: statusFilter === "all" ? undefined : statusFilter,
    page: currentPage,
    limit: pageSize,
  });

  // Debug: Let's see what we're getting
  console.log("🔍 DEBUGGING Invoices:");
  console.log("📊 invoicesData:", invoicesData);
  console.log("📊 invoicesData.invoices:", invoicesData?.invoices);
  console.log("📊 invoicesData.pagination:", invoicesData?.pagination);
  console.log("📊 isLoading:", isLoading);
  console.log("📊 error:", error);

  const handleRefresh = () => {
    refetch();
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: string) => {
    setPageSize(parseInt(size));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Reset pagination when filters change
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
    setCurrentPage(1);
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
      // Map the invoice data to the expected InvoicePaymentData structure
      const paymentData: InvoicePaymentData = {
        id: invoiceToPay.id,
        invoice_number: invoiceToPay.invoice_number || invoiceToPay.id,
        cargo_id: String(invoiceToPay.cargo_id || invoiceToPay.cargo?.id || ""),
        total_amount: +(invoiceToPay.total_amount || 0),
        currency: invoiceToPay.currency || "RWF",
        status: invoiceToPay.status,
        cargo: invoiceToPay.cargo
          ? {
              id: String(invoiceToPay.cargo.id),
              type: invoiceToPay.cargo.type || "Unknown",
              pickup_address: invoiceToPay.cargo.pickup_address || "Unknown",
              destination_address:
                invoiceToPay.cargo.destination_address || "Unknown",
            }
          : undefined,
      };
      setSelectedPaymentInvoice(paymentData);
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

  const downloadInvoicesCsv = (invoices: any[]) => {
    if (typeof document === "undefined" || typeof window === "undefined") {
      toast.error(t("common.error"));
      return;
    }

    if (!invoices.length) {
      toast.error(t("invoices.noInvoicesFound"));
      return;
    }

    const headers = [
      "Invoice Number",
      "Cargo Number",
      "Status",
      "Total Amount",
      "Currency",
      "Due Date",
      "Paid At",
      "Created At",
      "Cargo Type",
      "Pickup Address",
      "Destination Address",
    ];

    const escapeValue = (value: any) =>
      `"${(value ?? "").toString().replace(/"/g, '""')}"`;

    const rows = invoices.map((invoice) => [
      invoice.invoice_number || invoice.id || "",
      invoice.cargo?.cargo_number || invoice.cargo_id || "",
      invoice.status || "",
      invoice.total_amount || "",
      invoice.currency || "RWF",
      invoice.due_date
        ? new Date(invoice.due_date).toLocaleDateString()
        : "",
      invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString() : "",
      invoice.created_at
        ? new Date(invoice.created_at).toLocaleDateString()
        : "",
      invoice.cargo?.type || "",
      invoice.cargo?.pickup_address || "",
      invoice.cargo?.destination_address || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeValue).join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `invoices-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(t("invoices.downloadAllInfo") || "CSV download started");
  };

  const handleDownloadAll = () => {
    downloadInvoicesCsv(sortedInvoices);
  };

  // Filter and sort invoices (client-side filtering for search only)
  const actualInvoices = invoicesData?.invoices || [];
  const pagination = invoicesData?.pagination || null;

  // Apply client-side search filtering only (status filtering is done server-side)
  const filteredInvoices = actualInvoices.filter((invoice: any) => {
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

  // Use pagination data for all totals (accurate totals from backend)
  const totalInvoices = pagination?.total || actualInvoices.length;
  const totalPaid = pagination?.totalPaid || 0;
  const totalOutstanding = pagination?.totalOutstanding || 0;
  const totalAmount = pagination?.totalAmount || 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6 md:space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div>
            <Skeleton className="h-6 sm:h-8 w-32 sm:w-48 mb-1.5 sm:mb-2 rounded-lg" />
            <Skeleton className="h-3 sm:h-4 w-48 sm:w-64 rounded-lg" />
          </div>
          <div className="flex gap-1.5 sm:gap-2">
            <Skeleton className="h-8 sm:h-10 w-20 sm:w-24 rounded-full" />
            <Skeleton className="h-8 sm:h-10 w-32 sm:w-40 rounded-full" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-gray-50/80 to-gray-100/60 backdrop-blur-sm rounded-xl border border-gray-200/50 p-3 sm:p-4 w-fit"
            >
              <div className="space-y-1.5 sm:space-y-2">
                <Skeleton className="h-3 sm:h-4 w-16 sm:w-20 rounded-lg" />
                <Skeleton className="h-5 sm:h-6 w-12 sm:w-16 rounded-lg" />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 backdrop-blur-sm rounded-2xl border border-blue-100/50 p-3 sm:p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
            <Skeleton className="h-10 flex-1 rounded-full" />
            <Skeleton className="h-10 w-full sm:w-48 rounded-full" />
            <Skeleton className="h-10 w-full sm:w-48 rounded-full" />
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="border border-gray-200/50 rounded-xl p-3 sm:p-4 bg-gradient-to-br from-white/80 to-gray-50/40 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1.5 sm:space-y-2">
                  <Skeleton className="h-3 sm:h-4 w-24 sm:w-32 rounded-lg" />
                  <Skeleton className="h-2.5 sm:h-3 w-28 sm:w-40 rounded-lg" />
                </div>
                <Skeleton className="h-5 sm:h-6 w-12 sm:w-16 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6 md:space-y-8">
        <motion.div
          className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              {t("invoices.title")}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
              {t("invoices.subtitle")}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold border-gray-200 hover:border-blue-500 bg-white/80 backdrop-blur-sm"
          >
            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            {t("common.refresh")}
          </Button>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-red-50/80 via-pink-50/60 to-orange-50/80 backdrop-blur-sm border border-red-200/50 rounded-2xl p-4 sm:p-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm sm:text-base font-semibold text-red-800">
                {t("common.error")}
              </h3>
              <p className="text-xs sm:text-sm text-red-600 mt-1">
                {error.message || t("invoices.loadError")}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="mt-2 sm:mt-3 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold border-red-200 hover:border-red-500 bg-white/80 backdrop-blur-sm"
              >
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                {t("common.retry")}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Header */}
      <motion.div
        className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            {t("invoices.title")}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
            {t("invoices.subtitle")}
          </p>
        </div>
        <div className="flex gap-1.5 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold border-gray-200 hover:border-blue-500 bg-white/80 backdrop-blur-sm"
          >
            <RefreshCw
              className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${
                isLoading ? "animate-spin" : ""
              }`}
            />
            {t("common.refresh")}
          </Button>
          <Button
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={handleDownloadAll}
          >
            <Receipt className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            {t("invoices.downloadAll")}
          </Button>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4">
        <motion.div
          className="bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/80 backdrop-blur-sm rounded-xl border border-blue-100/50 px-3 sm:px-4 py-2 sm:py-3 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 w-fit"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={{ scale: 1.05 }}
        >
          <p className="text-[10px] sm:text-xs font-semibold text-gray-700 mb-0.5 sm:mb-1">
            {t("invoices.totalInvoices")}
          </p>
          <p className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {totalInvoices}
          </p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-green-50/80 via-emerald-50/60 to-teal-50/80 backdrop-blur-sm rounded-xl border border-green-100/50 px-3 sm:px-4 py-2 sm:py-3 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 w-fit"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          whileHover={{ scale: 1.05 }}
        >
          <p className="text-[10px] sm:text-xs font-semibold text-gray-700 mb-0.5 sm:mb-1">
            {t("invoices.totalPaid")}
          </p>
          <p className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            {formatCurrency(totalPaid)}
          </p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-red-50/80 via-orange-50/60 to-yellow-50/80 backdrop-blur-sm rounded-xl border border-red-100/50 px-3 sm:px-4 py-2 sm:py-3 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 w-fit"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
        >
          <p className="text-[10px] sm:text-xs font-semibold text-gray-700 mb-0.5 sm:mb-1">
            {t("invoices.outstanding")}
          </p>
          <p className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            {formatCurrency(totalOutstanding)}
          </p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-purple-50/80 via-pink-50/60 to-rose-50/80 backdrop-blur-sm rounded-xl border border-purple-100/50 px-3 sm:px-4 py-2 sm:py-3 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 w-fit"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
        >
          <p className="text-[10px] sm:text-xs font-semibold text-gray-700 mb-0.5 sm:mb-1">
            {t("invoices.totalAmount")}
          </p>
          <p className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {formatCurrency(totalAmount)}
          </p>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <motion.div
        className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 backdrop-blur-sm rounded-2xl border border-blue-100/50 p-3 sm:p-4 md:p-6 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="flex flex-col md:flex-row gap-2 sm:gap-3 md:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 sm:left-3 md:left-4 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 z-10" />
              <Input
                placeholder={t("invoices.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8 sm:pl-10 md:pl-12 rounded-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-semibold border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/80 backdrop-blur-sm"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <input
              ref={statusInputRef}
              type="text"
              value={
                statusSearch ||
                (statusFilter !== "all"
                  ? t(`invoices.${statusFilter}`) || statusFilter
                  : t("invoices.allStatus"))
              }
              onChange={(e) => {
                setStatusSearch(e.target.value);
                setShowStatusDropdown(true);
              }}
              onFocus={() => {
                if (statusInputRef.current) {
                  setStatusDropdownPos(
                    calculateDropdownPosition(statusInputRef)
                  );
                }
                setShowStatusDropdown(true);
              }}
              placeholder={t("invoices.filterByStatus")}
              className="w-full sm:w-[160px] md:w-[180px] px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 pr-10 rounded-full text-xs sm:text-sm md:text-base font-semibold border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/80 backdrop-blur-sm"
            />
            <div className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {statusSearch && (
                <button
                  onClick={() => {
                    setStatusSearch("");
                    setShowStatusDropdown(true);
                  }}
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                </button>
              )}
              <Search className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
            </div>

            {/* Dropdown */}
            {showStatusDropdown &&
              typeof document !== "undefined" &&
              createPortal(
                <motion.div
                  className="fixed z-[9999] bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-60 overflow-y-auto custom-scrollbar"
                  style={{
                    top: `${statusDropdownPos.top}px`,
                    left: `${statusDropdownPos.left}px`,
                    width: `${statusDropdownPos.width}px`,
                  }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                {["all", "draft", "sent", "paid", "overdue", "cancelled"]
                  .filter(
                    (status) =>
                      !statusSearch ||
                      (status === "all"
                        ? t("invoices.allStatus")
                            .toLowerCase()
                            .includes(statusSearch.toLowerCase())
                        : t(`invoices.${status}`)
                            ?.toLowerCase()
                            .includes(statusSearch.toLowerCase()) ||
                          status
                            .toLowerCase()
                            .includes(statusSearch.toLowerCase()))
                  )
                  .map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        handleStatusFilterChange(status);
                        setStatusSearch("");
                        setShowStatusDropdown(false);
                      }}
                      className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                        statusFilter === status ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Check
                          className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ${
                            statusFilter === status
                              ? "opacity-100 text-blue-600"
                              : "opacity-0"
                          }`}
                        />
                        <span className="text-xs sm:text-sm font-medium text-gray-900">
                          {status === "all"
                            ? t("invoices.allStatus")
                            : t(`invoices.${status}`) || status}
                        </span>
                      </div>
                    </button>
                  ))}
                </motion.div>,
                document.body
              )}

            {/* Click outside to close */}
            {showStatusDropdown &&
              typeof document !== "undefined" &&
              createPortal(
                <div
                  className="fixed inset-0 z-[9998]"
                  onClick={() => setShowStatusDropdown(false)}
                />,
                document.body
              )}
          </div>

          {/* Sort Filter */}
          <div className="relative">
            <input
              ref={sortInputRef}
              type="text"
              value={
                sortSearch ||
                (sortBy === "newest"
                  ? t("invoices.newestFirst")
                  : sortBy === "oldest"
                  ? t("invoices.oldestFirst")
                  : sortBy === "amount-high"
                  ? t("invoices.amountHighToLow")
                  : sortBy === "amount-low"
                  ? t("invoices.amountLowToHigh")
                  : t("invoices.sortBy"))
              }
              onChange={(e) => {
                setSortSearch(e.target.value);
                setShowSortDropdown(true);
              }}
              onFocus={() => {
                if (sortInputRef.current) {
                  setSortDropdownPos(calculateDropdownPosition(sortInputRef));
                }
                setShowSortDropdown(true);
              }}
              placeholder={t("invoices.sortBy")}
              className="w-full sm:w-[160px] md:w-[180px] px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 pr-10 rounded-full text-xs sm:text-sm md:text-base font-semibold border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/80 backdrop-blur-sm"
            />
            <div className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {sortSearch && (
                <button
                  onClick={() => {
                    setSortSearch("");
                    setShowSortDropdown(true);
                  }}
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                </button>
              )}
              <Search className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
            </div>

            {/* Dropdown */}
            {showSortDropdown &&
              typeof document !== "undefined" &&
              createPortal(
                <motion.div
                  className="fixed z-[9999] bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-60 overflow-y-auto custom-scrollbar"
                  style={{
                    top: `${sortDropdownPos.top}px`,
                    left: `${sortDropdownPos.left}px`,
                    width: `${sortDropdownPos.width}px`,
                  }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                {[
                  { value: "newest", label: t("invoices.newestFirst") },
                  { value: "oldest", label: t("invoices.oldestFirst") },
                  {
                    value: "amount-high",
                    label: t("invoices.amountHighToLow"),
                  },
                  { value: "amount-low", label: t("invoices.amountLowToHigh") },
                ]
                  .filter(
                    (option) =>
                      !sortSearch ||
                      option.label
                        .toLowerCase()
                        .includes(sortSearch.toLowerCase()) ||
                      option.value
                        .toLowerCase()
                        .includes(sortSearch.toLowerCase())
                  )
                  .map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setSortSearch("");
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                        sortBy === option.value ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Check
                          className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ${
                            sortBy === option.value
                              ? "opacity-100 text-blue-600"
                              : "opacity-0"
                          }`}
                        />
                        <span className="text-xs sm:text-sm font-medium text-gray-900">
                          {option.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </motion.div>,
                document.body
              )}

            {/* Click outside to close */}
            {showSortDropdown &&
              typeof document !== "undefined" &&
              createPortal(
                <div
                  className="fixed inset-0 z-[9998]"
                  onClick={() => setShowSortDropdown(false)}
                />,
                document.body
              )}
          </div>
        </div>
      </motion.div>

      {/* Invoice Table - Desktop */}
      <motion.div
        className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 backdrop-blur-sm rounded-2xl border border-blue-100/50 shadow-lg overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200/50">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
            {t("invoices.allInvoices")}
          </h2>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="text-[10px] sm:text-xs font-semibold text-gray-700 w-12">
                  #
                </TableHead>
                <TableHead className="text-[10px] sm:text-xs font-semibold text-gray-700 w-32">
                  {t("invoices.invoiceNumber")}
                </TableHead>
                <TableHead className="text-[10px] sm:text-xs font-semibold text-gray-700 w-36">
                  {t("invoices.cargoNumber")}
                </TableHead>
                <TableHead className="text-[10px] sm:text-xs font-semibold text-gray-700 flex-1">
                  {t("invoices.cargo")}
                </TableHead>
                <TableHead className="text-[10px] sm:text-xs font-semibold text-gray-700 w-24">
                  {t("invoices.amount")}
                </TableHead>
                <TableHead className="text-[10px] sm:text-xs font-semibold text-gray-700 w-24">
                  {t("invoices.statusLabel")}
                </TableHead>
                <TableHead className="text-[10px] sm:text-xs font-semibold text-gray-700 w-32">
                  {t("invoices.dueDate")}
                </TableHead>
                <TableHead className="text-[10px] sm:text-xs font-semibold text-gray-700 w-20">
                  {t("invoices.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedInvoices.map((invoice: any, index: number) => {
                const statusConfig = getStatusConfig(t);
                const status =
                  statusConfig[invoice.status as keyof typeof statusConfig];
                return (
                  <TableRow
                    key={invoice.id}
                    className="hover:bg-blue-50/50 cursor-pointer transition-colors duration-200 border-b border-gray-100/50"
                    onClick={() => handleViewInvoice(invoice)}
                  >
                    <TableCell className="text-xs sm:text-sm text-gray-600">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-xs sm:text-sm text-gray-900">
                        {invoice.invoice_number || invoice.id}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-xs sm:text-sm text-gray-600">
                        {invoice.cargo?.cargo_number ||
                          invoice.cargo_id ||
                          t("invoices.noCargoNumber")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <div className="font-semibold text-xs sm:text-sm text-gray-900 mb-1">
                          {invoice.cargo?.type || t("invoices.unknownType")}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          <div className="flex items-start gap-1">
                            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="truncate">
                              {invoice.cargo?.pickup_address ||
                                t("invoices.unknownLocation")}
                            </span>
                          </div>
                          <div className="flex items-start gap-1 mt-1">
                            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="truncate">
                              {invoice.cargo?.destination_address ||
                                t("invoices.unknownLocation")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-gray-900">
                          {formatCurrency(
                            parseFloat(invoice.total_amount || 0)
                          )}
                        </div>
                        {invoice.discount_amount &&
                          parseFloat(invoice.discount_amount) > 0 && (
                            <div className="text-xs sm:text-sm text-green-600">
                              -
                              {formatCurrency(
                                parseFloat(invoice.discount_amount)
                              )}{" "}
                              {t("invoices.discount")}
                            </div>
                          )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          status?.className || "bg-gray-100 text-gray-800"
                        }
                      >
                        {t(`invoices.status.${invoice.status}`) ||
                          invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs sm:text-sm text-gray-900">
                        {invoice.due_date
                          ? new Date(invoice.due_date).toLocaleDateString()
                          : t("invoices.noDueDate")}
                      </div>
                      {invoice.status === "paid" && invoice.paid_at && (
                        <div className="text-xs sm:text-sm text-gray-500">
                          {t("invoices.paid")}:{" "}
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
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewInvoice(invoice);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                            {t("invoices.viewDetails")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadInvoice(invoice.id);
                            }}
                          >
                            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                            {t("invoices.downloadPdf")}
                          </DropdownMenuItem>
                          {invoice.status === "sent" && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePayNow(invoice.id);
                              }}
                            >
                              <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
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

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-2 sm:space-y-3 p-3 sm:p-4">
          {sortedInvoices.map((invoice: any, index: number) => {
            const statusConfig = getStatusConfig(t);
            const status =
              statusConfig[invoice.status as keyof typeof statusConfig];
            return (
              <motion.div
                key={invoice.id}
                className="bg-gradient-to-br from-blue-50/40 via-white to-indigo-50/30 backdrop-blur-sm rounded-xl border border-blue-100/50 p-3 sm:p-4 cursor-pointer hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => handleViewInvoice(invoice)}
              >
                <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5">
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                        {invoice.invoice_number || invoice.id}
                      </h3>
                      <Badge
                        variant="secondary"
                        className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 ${
                          status?.className || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {t(`invoices.status.${invoice.status}`) ||
                          invoice.status}
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 font-mono">
                      {t("invoices.cargoNumber")}:{" "}
                      {invoice.cargo?.cargo_number ||
                        invoice.cargo_id ||
                        t("invoices.noCargoNumber")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm sm:text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {formatCurrency(parseFloat(invoice.total_amount || 0))}
                    </p>
                    {invoice.discount_amount &&
                      parseFloat(invoice.discount_amount) > 0 && (
                        <p className="text-xs sm:text-sm text-green-600 mt-0.5">
                          -{formatCurrency(parseFloat(invoice.discount_amount))}
                        </p>
                      )}
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2 mb-2 sm:mb-3">
                  <div className="flex items-start gap-1.5 sm:gap-2">
                    <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500 font-semibold mb-0.5">
                        {t("invoices.cargo")}
                      </p>
                      <p className="text-sm sm:text-base text-gray-700 font-medium truncate">
                        {invoice.cargo?.type || t("invoices.unknownType")}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 truncate mt-0.5">
                        {invoice.cargo?.pickup_address ||
                          t("invoices.unknownLocation")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5 sm:gap-2">
                    <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-gray-600 truncate">
                      {invoice.cargo?.destination_address ||
                        t("invoices.unknownLocation")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-200/50">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 font-semibold">
                        {t("invoices.dueDate")}
                      </p>
                      <p className="text-sm sm:text-base text-gray-700 font-medium">
                        {invoice.due_date
                          ? new Date(invoice.due_date).toLocaleDateString()
                          : t("invoices.noDueDate")}
                      </p>
                      {invoice.status === "paid" && invoice.paid_at && (
                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                          {t("invoices.paid")}:{" "}
                          {new Date(invoice.paid_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full hover:bg-blue-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewInvoice(invoice);
                        }}
                      >
                        <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                        {t("invoices.viewDetails")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadInvoice(invoice.id);
                        }}
                      >
                        <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                        {t("invoices.downloadPdf")}
                      </DropdownMenuItem>
                      {invoice.status === "sent" && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePayNow(invoice.id);
                          }}
                        >
                          <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                          {t("invoices.payNow")}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            );
          })}
        </div>

        {sortedInvoices.length === 0 && (
          <div className="text-center py-8 sm:py-12 px-4">
            <Receipt className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-400 mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-600 mb-2 sm:mb-3">
              {t("invoices.noInvoicesFound")}
            </h3>
            <p className="text-sm sm:text-base text-gray-500">
              {t("invoices.noInvoicesDescription")}
            </p>
          </div>
        )}
      </motion.div>

      {/* Pagination Controls */}
      {pagination && (
        <motion.div
          className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 backdrop-blur-sm rounded-2xl border border-blue-100/50 shadow-lg p-3 sm:p-4 md:p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            {/* Page Size Selector */}
            <div className="relative w-full sm:w-auto">
              <input
                ref={pageSizeInputRef}
                type="text"
                value={pageSizeSearch || pageSize.toString()}
                onChange={(e) => {
                  setPageSizeSearch(e.target.value);
                  setShowPageSizeDropdown(true);
                }}
                onFocus={() => {
                  if (pageSizeInputRef.current) {
                    setPageSizeDropdownPos(
                      calculateDropdownPosition(pageSizeInputRef)
                    );
                  }
                  setShowPageSizeDropdown(true);
                }}
                placeholder={t("invoices.showPerPage")}
                className="w-full sm:w-[100px] px-3 sm:px-4 py-2 sm:py-2.5 pr-10 rounded-full text-xs sm:text-sm font-semibold border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/80 backdrop-blur-sm"
              />
              <div className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {pageSizeSearch && (
                  <button
                    onClick={() => {
                      setPageSizeSearch("");
                      setShowPageSizeDropdown(true);
                    }}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                  </button>
                )}
                <Search className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
              </div>

              {/* Dropdown */}
              {showPageSizeDropdown &&
                typeof document !== "undefined" &&
                createPortal(
                  <motion.div
                    className="fixed z-[9999] bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-60 overflow-y-auto custom-scrollbar"
                    style={{
                      top: `${pageSizeDropdownPos.top}px`,
                      left: `${pageSizeDropdownPos.left}px`,
                      width: `${pageSizeDropdownPos.width}px`,
                    }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                  {["5", "10", "20", "50"]
                    .filter(
                      (size) =>
                        !pageSizeSearch ||
                        size.includes(pageSizeSearch) ||
                        t("invoices.showPerPage")
                          .toLowerCase()
                          .includes(pageSizeSearch.toLowerCase())
                    )
                    .map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          handlePageSizeChange(size);
                          setPageSizeSearch("");
                          setShowPageSizeDropdown(false);
                        }}
                        className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                          pageSize.toString() === size ? "bg-blue-50" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Check
                            className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ${
                              pageSize.toString() === size
                                ? "opacity-100 text-blue-600"
                                : "opacity-0"
                            }`}
                          />
                          <span className="text-xs sm:text-sm font-medium text-gray-900">
                            {size}
                          </span>
                        </div>
                      </button>
                    ))}
                  </motion.div>,
                  document.body
                )}

              {/* Click outside to close */}
              {showPageSizeDropdown &&
                typeof document !== "undefined" &&
                createPortal(
                  <div
                    className="fixed inset-0 z-[9998]"
                    onClick={() => setShowPageSizeDropdown(false)}
                  />,
                  document.body
                )}
            </div>

            {/* Pagination Info */}
            <div className="text-[10px] sm:text-xs md:text-sm text-gray-600 font-medium text-center sm:text-left">
              <span className="hidden sm:inline">
                {t("invoices.showing")} {(currentPage - 1) * pageSize + 1} -{" "}
                {Math.min(currentPage * pageSize, pagination.total || 0)}{" "}
                {t("invoices.of")} {pagination.total || 0}{" "}
                {t("invoices.results")}
              </span>
              <span className="sm:hidden">
                {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, pagination.total || 0)} /{" "}
                {pagination.total || 0}
              </span>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="rounded-full px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold border-gray-200 hover:border-blue-500 bg-white/80 backdrop-blur-sm disabled:opacity-50"
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
                <span className="hidden sm:inline">{t("common.previous")}</span>
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
                        className={`w-7 h-7 sm:w-8 sm:h-8 p-0 rounded-full text-[10px] sm:text-xs font-semibold ${
                          currentPage === pageNum
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0"
                            : "border-gray-200 hover:border-blue-500 bg-white/80 backdrop-blur-sm"
                        }`}
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
                className="rounded-full px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold border-gray-200 hover:border-blue-500 bg-white/80 backdrop-blur-sm disabled:opacity-50"
              >
                <span className="hidden sm:inline">{t("common.next")}</span>
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-0.5 sm:ml-1" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}

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
