import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { CargoTable } from "@/components/ui/CargoTable";
import { CargoDetail } from "@/components/ui/CargoDetailModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  RefreshCw,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Package,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useClientCargos, useCancelCargo } from "@/lib/api/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Rwanda locations data

const MyCargos = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Search states for comboboxes
  const [statusSearch, setStatusSearch] = useState("");
  const [prioritySearch, setPrioritySearch] = useState("");
  const [pageSizeSearch, setPageSizeSearch] = useState("");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showPageSizeDropdown, setShowPageSizeDropdown] = useState(false);

  // Refs for input elements to calculate dropdown positions
  const statusInputRef = useRef<HTMLInputElement>(null);
  const priorityInputRef = useRef<HTMLInputElement>(null);
  const pageSizeInputRef = useRef<HTMLInputElement>(null);

  // Dropdown position states
  const [statusDropdownPos, setStatusDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const [priorityDropdownPos, setPriorityDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const [pageSizeDropdownPos, setPageSizeDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  // Function to calculate dropdown position
  const calculateDropdownPosition = (inputRef: React.RefObject<HTMLInputElement>) => {
    if (!inputRef.current) return { top: 0, left: 0, width: 0 };
    const rect = inputRef.current.getBoundingClientRect();
    // For fixed positioning, use viewport coordinates directly (no scroll offset needed)
    return {
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    };
  };

  // Update positions when dropdowns open
  useEffect(() => {
    if (showStatusDropdown && statusInputRef.current) {
      setStatusDropdownPos(calculateDropdownPosition(statusInputRef));
    }
  }, [showStatusDropdown]);

  useEffect(() => {
    if (showPriorityDropdown && priorityInputRef.current) {
      setPriorityDropdownPos(calculateDropdownPosition(priorityInputRef));
    }
  }, [showPriorityDropdown]);

  useEffect(() => {
    if (showPageSizeDropdown && pageSizeInputRef.current) {
      setPageSizeDropdownPos(calculateDropdownPosition(pageSizeInputRef));
    }
  }, [showPageSizeDropdown]);

  // Handle scroll and resize for all dropdowns
  useEffect(() => {
    const updatePositions = () => {
      if (showStatusDropdown && statusInputRef.current) {
        setStatusDropdownPos(calculateDropdownPosition(statusInputRef));
      }
      if (showPriorityDropdown && priorityInputRef.current) {
        setPriorityDropdownPos(calculateDropdownPosition(priorityInputRef));
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
  }, [showStatusDropdown, showPriorityDropdown, showPageSizeDropdown]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // API hooks
  const {
    data: cargosData,
    isLoading,
    error,
    refetch,
  } = useClientCargos({
    status: statusFilter === "all" ? undefined : (statusFilter as any),
    priority: priorityFilter === "all" ? undefined : (priorityFilter as any),
    search: searchTerm || undefined,
    page: currentPage,
    limit: pageSize,
  });
  const cancelCargoMutation = useCancelCargo();

  // Add useEffect to track data changes
  useEffect(() => {
    console.log("🔄 useEffect - cargosData changed:", cargosData);
    console.log("🔄 useEffect - isLoading:", isLoading);
    console.log("🔄 useEffect - error:", error);
  }, [cargosData, isLoading, error]);

  const handleCallDriver = (phone: string) => {
    console.log("Calling driver:", phone);
    // Add logic to call driver
    window.open(`tel:${phone}`, "_self");
  };

  const handleTrackCargo = (cargoId: string) => {
    console.log("Tracking cargo:", cargoId);
    navigate(`/tracking/${cargoId}`);
  };

  const handleCancelCargo = async (cargoId: string) => {
    try {
      await cancelCargoMutation.mutateAsync({
        id: cargoId,
        reason: t("myCargos.cancelReason"),
      });
      toast.success(t("myCargos.cancelSuccess"));
      refetch();
    } catch (error) {
      console.error("Error cancelling cargo:", error);
      toast.error(t("myCargos.cancelError"));
    }
  };

  const handleDownloadReceipt = (cargoId: string) => {
    console.log("Downloading receipt for cargo:", cargoId);
    // Add logic to download receipt
    toast.info(t("myCargos.downloadReceipt"));
  };

  const handleUploadPhoto = (cargoId: string) => {
    console.log("Uploading photo for cargo:", cargoId);
    // Add logic to upload photo
    toast.info(t("myCargos.uploadPhoto"));
  };

  const handleReportIssue = (cargoId: string) => {
    console.log("Reporting issue for cargo:", cargoId);
    // Add logic to report issue
    toast.info(t("myCargos.reportIssue"));
  };

  const handleCreateNewCargo = () => {
    navigate("/create-cargo");
  };

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

  const handlePriorityFilterChange = (priority: string) => {
    setPriorityFilter(priority);
    setCurrentPage(1);
  };

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
    setCurrentPage(1);
  };

  // Navigation handlers for stats cards
  const handleTotalCargosClick = () => {
    setStatusFilter("all");
    setPriorityFilter("all");
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleInTransitClick = () => {
    setStatusFilter("in_transit");
    setCurrentPage(1);
  };

  const handleDeliveredClick = () => {
    setStatusFilter("delivered");
    setCurrentPage(1);
  };

  const handlePendingClick = () => {
    setStatusFilter("pending");
    setCurrentPage(1);
  };

  // Header component
  const renderHeader = () => (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            {t("myCargos.title")}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
            {t("myCargos.subtitle")}
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
            onClick={handleCreateNewCargo}
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            {t("myCargos.createNewCargo")}
          </Button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      {!isLoading &&
        !error &&
        transformedCargos &&
        transformedCargos.length > 0 && (
          <div className="flex flex-wrap gap-2 sm:gap-3 w-full">
            <motion.div
              className="bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/80 backdrop-blur-sm rounded-xl border border-blue-100/50 px-3 sm:px-4 py-2 sm:py-3 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 flex-1 min-w-[140px] sm:min-w-[160px]"
              onClick={handleTotalCargosClick}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
            >
              <p className="text-[10px] sm:text-xs font-semibold text-gray-700 mb-0.5 sm:mb-1">
                {t("myCargos.stats.totalCargos")}
              </p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {pagination?.total || 0}
              </p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-green-50/80 via-emerald-50/60 to-teal-50/80 backdrop-blur-sm rounded-xl border border-green-100/50 px-3 sm:px-4 py-2 sm:py-3 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 flex-1 min-w-[140px] sm:min-w-[160px]"
              onClick={handleInTransitClick}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <p className="text-[10px] sm:text-xs font-semibold text-gray-700 mb-0.5 sm:mb-1">
                {t("myCargos.stats.inTransit")}
              </p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {
                  transformedCargos.filter(
                    (c) => c.status === "in_transit" || c.status === "picked_up"
                  ).length
                }
              </p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-emerald-50/80 via-green-50/60 to-blue-50/80 backdrop-blur-sm rounded-xl border border-emerald-100/50 px-3 sm:px-4 py-2 sm:py-3 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 flex-1 min-w-[140px] sm:min-w-[160px]"
              onClick={handleDeliveredClick}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
            >
              <p className="text-[10px] sm:text-xs font-semibold text-gray-700 mb-0.5 sm:mb-1">
                {t("myCargos.stats.delivered")}
              </p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                {
                  transformedCargos.filter((c) => c.status === "delivered")
                    .length
                }
              </p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-yellow-50/80 via-amber-50/60 to-orange-50/80 backdrop-blur-sm rounded-xl border border-yellow-100/50 px-3 sm:px-4 py-2 sm:py-3 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 flex-1 min-w-[140px] sm:min-w-[160px]"
              onClick={handlePendingClick}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
            >
              <p className="text-[10px] sm:text-xs font-semibold text-gray-700 mb-0.5 sm:mb-1">
                {t("myCargos.stats.pending")}
              </p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                {
                  transformedCargos.filter((c) =>
                    ["pending", "quoted", "accepted", "assigned"].includes(
                      c.status
                    )
                  ).length
                }
              </p>
            </motion.div>
          </div>
        )}

      {/* Filters Section */}
      {!isLoading &&
        !error &&
        transformedCargos &&
        transformedCargos.length > 0 && (
          <motion.div
            className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 backdrop-blur-sm rounded-2xl border border-blue-100/50 p-3 sm:p-4 md:p-6 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="flex flex-col md:flex-row gap-2 sm:gap-3 md:gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 sm:left-3 md:left-4 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 z-10" />
                  <Input
                    placeholder={t("myCargos.filters.searchPlaceholder")}
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-8 sm:pl-10 md:pl-12 rounded-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-semibold border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/80 backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <input
                    ref={statusInputRef}
                    type="text"
                    value={
                      statusSearch ||
                      (statusFilter !== "all"
                        ? t(`myCargos.status.${statusFilter}`) || statusFilter
                        : t("myCargos.filters.allStatus"))
                    }
                    onChange={(e) => {
                      setStatusSearch(e.target.value);
                      setShowStatusDropdown(true);
                    }}
                    onFocus={() => {
                      if (statusInputRef.current) {
                        setStatusDropdownPos(calculateDropdownPosition(statusInputRef));
                      }
                      setShowStatusDropdown(true);
                    }}
                    placeholder={t("myCargos.filters.filterByStatus")}
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
                  {showStatusDropdown && typeof document !== "undefined" && createPortal(
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
                      {[
                        "all",
                        "pending",
                        "quoted",
                        "accepted",
                        "assigned",
                        "picked_up",
                        "in_transit",
                        "delivered",
                        "cancelled",
                      ]
                        .filter(
                          (status) =>
                            !statusSearch ||
                            (status === "all"
                              ? t("myCargos.filters.allStatus")
                                  .toLowerCase()
                                  .includes(statusSearch.toLowerCase())
                              : t(`myCargos.status.${status}`)
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
                                  ? t("myCargos.filters.allStatus")
                                  : t(`myCargos.status.${status}`) || status}
                              </span>
                            </div>
                          </button>
                        ))}
                    </motion.div>,
                    document.body
                  )}

                  {/* Click outside to close */}
                  {showStatusDropdown && typeof document !== "undefined" && createPortal(
                    <div
                      className="fixed inset-0 z-[9998]"
                      onClick={() => setShowStatusDropdown(false)}
                    />,
                    document.body
                  )}
                </div>

                {/* Priority Filter */}
                <div className="relative">
                  <input
                    ref={priorityInputRef}
                    type="text"
                    value={
                      prioritySearch ||
                      (priorityFilter !== "all"
                        ? t(`myCargos.priority.${priorityFilter}`) ||
                          priorityFilter
                        : t("myCargos.filters.allPriority"))
                    }
                    onChange={(e) => {
                      setPrioritySearch(e.target.value);
                      setShowPriorityDropdown(true);
                    }}
                    onFocus={() => {
                      if (priorityInputRef.current) {
                        setPriorityDropdownPos(calculateDropdownPosition(priorityInputRef));
                      }
                      setShowPriorityDropdown(true);
                    }}
                    placeholder={t("myCargos.filters.priority")}
                    className="w-full sm:w-[140px] px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 pr-10 rounded-full text-xs sm:text-sm md:text-base font-semibold border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/80 backdrop-blur-sm"
                  />
                  <div className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {prioritySearch && (
                      <button
                        onClick={() => {
                          setPrioritySearch("");
                          setShowPriorityDropdown(true);
                        }}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                      </button>
                    )}
                    <Search className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                  </div>

                  {/* Dropdown */}
                  {showPriorityDropdown && typeof document !== "undefined" && createPortal(
                    <motion.div
                      className="fixed z-[9999] bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-60 overflow-y-auto custom-scrollbar"
                      style={{
                        top: `${priorityDropdownPos.top}px`,
                        left: `${priorityDropdownPos.left}px`,
                        width: `${priorityDropdownPos.width}px`,
                      }}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {["all", "low", "normal", "high", "urgent"]
                        .filter(
                          (priority) =>
                            !prioritySearch ||
                            (priority === "all"
                              ? t("myCargos.filters.allPriority")
                                  .toLowerCase()
                                  .includes(prioritySearch.toLowerCase())
                              : t(`myCargos.priority.${priority}`)
                                  ?.toLowerCase()
                                  .includes(prioritySearch.toLowerCase()) ||
                                priority
                                  .toLowerCase()
                                  .includes(prioritySearch.toLowerCase()))
                        )
                        .map((priority) => (
                          <button
                            key={priority}
                            onClick={() => {
                              handlePriorityFilterChange(priority);
                              setPrioritySearch("");
                              setShowPriorityDropdown(false);
                            }}
                            className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                              priorityFilter === priority ? "bg-blue-50" : ""
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Check
                                className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ${
                                  priorityFilter === priority
                                    ? "opacity-100 text-blue-600"
                                    : "opacity-0"
                                }`}
                              />
                              <span className="text-xs sm:text-sm font-medium text-gray-900">
                                {priority === "all"
                                  ? t("myCargos.filters.allPriority")
                                  : t(`myCargos.priority.${priority}`) ||
                                    priority}
                              </span>
                            </div>
                          </button>
                        ))}
                    </motion.div>,
                    document.body
                  )}

                  {/* Click outside to close */}
                  {showPriorityDropdown && typeof document !== "undefined" && createPortal(
                    <div
                      className="fixed inset-0 z-[9998]"
                      onClick={() => setShowPriorityDropdown(false)}
                    />,
                    document.body
                  )}
                </div>
              </div>
            </div>

            {/* Filter Results Summary */}
            <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="text-xs sm:text-sm text-gray-600">
                {hasActiveFilters
                  ? t("myCargos.filters.filteredResults", {
                      total: pagination?.total || 0,
                    })
                  : t("myCargos.filters.showingCargos", {
                      total: pagination?.total || 0,
                    })}
              </div>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTotalCargosClick}
                  className="text-xs sm:text-sm text-gray-600 hover:text-gray-800 w-full sm:w-auto rounded-full px-3 sm:px-4 py-1.5 sm:py-2 border-gray-200 hover:border-blue-500 bg-white/80 backdrop-blur-sm"
                >
                  <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  {t("myCargos.filters.clearFilters")}
                </Button>
              )}
            </div>
          </motion.div>
        )}
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Header with loading skeleton */}
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

        {/* Stats skeleton */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-gray-50/80 to-gray-100/60 backdrop-blur-sm rounded-xl border border-gray-200/50 p-3 sm:p-4 w-fit"
            >
              <div className="space-y-1.5 sm:space-y-2">
                <Skeleton className="h-3 sm:h-4 w-16 sm:w-20 rounded-lg" />
                <Skeleton className="h-5 sm:h-6 w-10 sm:w-12 rounded-lg" />
              </div>
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="space-y-3 sm:space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="border border-gray-200/50 rounded-xl p-3 sm:p-4 bg-gradient-to-br from-white/80 to-gray-50/40 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1.5 sm:space-y-2">
                  <Skeleton className="h-3 sm:h-4 w-20 sm:w-24 rounded-lg" />
                  <Skeleton className="h-2.5 sm:h-3 w-28 sm:w-32 rounded-lg" />
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
      <div className="space-y-4 sm:space-y-6">
        {renderHeader()}

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
                {error.message || t("myCargos.loadError")}
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

  // Extract cargos and pagination data
  const actualCargos = cargosData?.cargos || [];
  const pagination = cargosData?.pagination || null;

  // Debug logging to understand the data structure
  console.log("🔍 MyCargos - cargosData:", cargosData);
  console.log("🔍 MyCargos - actualCargos:", actualCargos);
  console.log("🔍 MyCargos - pagination:", pagination);

  // Transform API data to CargoDetail format
  const transformedCargos: CargoDetail[] =
    (Array.isArray(actualCargos) ? actualCargos : []).map((cargo: any) => {
      // Map API status to CargoDetail status format
      // Keep original API status values for proper display
      const mappedStatus = cargo.status as CargoDetail["status"];

      // Extract driver information from delivery_assignment
      const driverInfo = cargo.delivery_assignment?.driver;
      const vehicleInfo = cargo.delivery_assignment?.vehicle;
      const deliveryInfo = cargo.delivery;

      return {
        id: cargo.id,
        cargo_number: cargo.cargo_number,
        status: mappedStatus,
        from: cargo.pickup_address || "Unknown Location",
        to: cargo.destination_address || "Unknown Location",
        client: cargo.client?.user?.full_name || "Unknown Client",
        driver:
          driverInfo?.user?.full_name ||
          (cargo.status === "assigned" ||
          cargo.status === "picked_up" ||
          cargo.status === "in_transit" ||
          cargo.status === "delivered"
            ? t("myCargos.driverAssigned")
            : t("myCargos.noDriverAssigned")),
        phone: driverInfo?.emergency_phone || "",
        estimatedTime: cargo.delivery_date
          ? new Date(cargo.delivery_date).toLocaleDateString()
          : t("myCargos.estimatedTime"),
        weight: `${cargo.weight_kg || 0} kg`,
        type: cargo.category?.name || cargo.type || t("myCargos.unknownType"),
        priority: cargo.priority || "normal",
        createdDate: cargo.created_at?.split("T")[0] || "",
        cost: parseFloat(
          String(cargo.estimated_cost || cargo.final_cost || "0")
        ),
        pickupDate: cargo.pickup_date ? cargo.pickup_date.split("T")[0] : "",
        deliveryDate: cargo.delivery_date
          ? cargo.delivery_date.split("T")[0]
          : "",
        description: cargo.special_requirements || "",
        specialInstructions: cargo.special_requirements || "",
        vehicleType: vehicleInfo
          ? `${vehicleInfo.make} ${vehicleInfo.model}`
          : t("myCargos.unknownVehicle"),
        distance: cargo.distance_km ? `${cargo.distance_km} km` : "Unknown",
        distance_km: String(cargo.distance_km || ""),
        pickupContact: cargo.pickup_contact || "",
        pickupContactPhone: cargo.pickup_phone || "",
        deliveryContact: cargo.destination_contact || "",
        deliveryContactPhone: cargo.destination_phone || "",
        // Enhanced fields for better data display
        clientPhone: cargo.client?.user?.phone || cargo.pickup_phone || "",
        clientCompany: cargo.client?.company_name || "",
        clientContactPerson: cargo.client?.contact_person || "",
        driverName: driverInfo?.user?.full_name || "",
        driverPhone: driverInfo?.emergency_phone || "",
        driverRating: driverInfo?.rating || "",
        driverLicense: driverInfo?.license_number || "",
        vehiclePlate: vehicleInfo?.plate_number || "",
        vehicleMake: vehicleInfo?.make || "",
        vehicleModel: vehicleInfo?.model || "",
        // Rating fields from delivery object
        rating: deliveryInfo?.rating || undefined,
        review: deliveryInfo?.review || undefined,
        isRated: !!deliveryInfo?.rating,
        // Additional cargo details
        weight_kg: cargo.weight_kg,
        volume: cargo.volume,
        dimensions: cargo.dimensions,
        insurance_required: cargo.insurance_required,
        insurance_amount: cargo.insurance_amount,
        fragile: cargo.fragile,
        temperature_controlled: cargo.temperature_controlled,
        pickup_instructions: cargo.pickup_instructions,
        delivery_instructions: cargo.delivery_instructions,
        // Assignment information
        assignmentStatus: cargo.delivery_assignment?.assignment_status,
        assignmentExpiresAt: cargo.delivery_assignment?.expires_at,
        assignmentNotes: cargo.delivery_assignment?.notes,
        assignmentId: cargo.delivery_assignment?.id,
        // Final cost information
        final_cost: cargo.final_cost,
        estimated_cost: String(cargo.estimated_cost || ""),
      };
    }) || [];

  // Use transformed cargos directly since API handles filtering
  const filteredCargos = transformedCargos;

  // Check if we have any filters applied
  const hasActiveFilters =
    statusFilter !== "all" || priorityFilter !== "all" || searchTerm !== "";

  // Show a message if no data is available
  if (
    !isLoading &&
    !error &&
    (!actualCargos || !Array.isArray(actualCargos) || actualCargos.length === 0)
  ) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {renderHeader()}

        <motion.div
          className="bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/80 backdrop-blur-sm border border-blue-200/50 rounded-2xl p-6 sm:p-8 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="inline-block"
          >
            <Package className="h-10 w-10 sm:h-12 sm:w-12 text-blue-500 mx-auto mb-3 sm:mb-4" />
          </motion.div>
          <h3 className="text-base sm:text-lg font-semibold text-blue-800 mb-1.5 sm:mb-2">
            {hasActiveFilters
              ? t("myCargos.filters.noMatchFilters")
              : t("myCargos.noCargos")}
          </h3>
          <p className="text-xs sm:text-sm text-blue-600 mb-4 sm:mb-6">
            {hasActiveFilters
              ? t("myCargos.filters.adjustFilters")
              : t("myCargos.noCargosDescription")}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={handleTotalCargosClick}
                className="border-blue-300 text-blue-700 hover:bg-blue-100 rounded-full px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold bg-white/80 backdrop-blur-sm"
              >
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                {t("myCargos.filters.clearAllFilters")}
              </Button>
            )}
            <Button
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={handleCreateNewCargo}
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              {t("myCargos.createNewCargo")}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {renderHeader()}

      {/* CargoTable with proper responsive container */}
      <div className="w-full">
        <CargoTable
          cargos={filteredCargos}
          showStats={false} // Hide stats since we have them in header
          showSearch={false} // Hide search since we have it in header
          showFilters={false} // Hide filters since we have them in header
          showPagination={false} // Disable internal pagination - we handle it externally
          onCallDriver={handleCallDriver}
          onTrackCargo={handleTrackCargo}
          onCancelCargo={handleCancelCargo}
          onDownloadReceipt={handleDownloadReceipt}
          onUploadPhoto={handleUploadPhoto}
          onReportIssue={handleReportIssue}
        />
      </div>

      {/* Pagination Controls */}
      {pagination && (
        <motion.div
          className="bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20 backdrop-blur-sm rounded-2xl border border-gray-100/50 p-3 sm:p-4 md:p-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">
                {t("myCargos.pagination.showPerPage")}
              </span>
              <span className="text-xs sm:text-sm text-gray-600 sm:hidden">
                {t("myCargos.pagination.perPage")}
              </span>
              <div className="relative">
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
                      setPageSizeDropdownPos(calculateDropdownPosition(pageSizeInputRef));
                    }
                    setShowPageSizeDropdown(true);
                  }}
                  placeholder={pageSize.toString()}
                  className="w-12 sm:w-16 md:w-20 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/80 backdrop-blur-sm text-center"
                />
                <div className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2">
                  <Search className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                </div>

                {/* Dropdown */}
                {showPageSizeDropdown && typeof document !== "undefined" && createPortal(
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
                          !pageSizeSearch || size.includes(pageSizeSearch)
                      )
                      .map((size) => (
                        <button
                          key={size}
                          onClick={() => {
                            handlePageSizeChange(size);
                            setPageSizeSearch("");
                            setShowPageSizeDropdown(false);
                          }}
                          className={`w-full text-center px-3 sm:px-4 py-2 sm:py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                            pageSize.toString() === size ? "bg-blue-50" : ""
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
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
                {showPageSizeDropdown && typeof document !== "undefined" && createPortal(
                  <div
                    className="fixed inset-0 z-[9998]"
                    onClick={() => setShowPageSizeDropdown(false)}
                  />,
                  document.body
                )}
              </div>
            </div>

            {/* Pagination Info */}
            <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
              <span className="hidden sm:inline">
                {t("myCargos.pagination.showing", {
                  start: (currentPage - 1) * pageSize + 1,
                  end: Math.min(currentPage * pageSize, pagination.total || 0),
                  total: pagination.total || 0,
                })}
              </span>
              <span className="sm:hidden">
                {t("myCargos.pagination.showingMobile", {
                  start: (currentPage - 1) * pageSize + 1,
                  end: Math.min(currentPage * pageSize, pagination.total || 0),
                  total: pagination.total || 0,
                })}
              </span>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="hidden sm:flex rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold border-gray-200 hover:border-blue-500 bg-white/80 backdrop-blur-sm"
              >
                <ChevronLeft className="h-3 w-3 sm:w-4 sm:h-4 mr-1" />
                {t("myCargos.pagination.previous")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="sm:hidden rounded-full p-2 border-gray-200 hover:border-blue-500 bg-white/80 backdrop-blur-sm"
              >
                <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.min(3, pagination.totalPages || 1) },
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
                        className="w-6 h-6 sm:w-8 sm:h-8 p-0 text-xs sm:text-sm rounded-full border-gray-200 hover:border-blue-500 bg-white/80 backdrop-blur-sm"
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
                className="hidden sm:flex rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold border-gray-200 hover:border-blue-500 bg-white/80 backdrop-blur-sm"
              >
                {t("myCargos.pagination.next")}
                <ChevronRight className="h-3 w-3 sm:w-4 sm:h-4 ml-1" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= (pagination.totalPages || 1)}
                className="sm:hidden rounded-full p-2 border-gray-200 hover:border-blue-500 bg-white/80 backdrop-blur-sm"
              >
                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MyCargos;
