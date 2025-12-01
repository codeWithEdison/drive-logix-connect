import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Package,
  MapPin,
  Clock,
  CheckCircle,
  Search,
  Filter,
  Eye,
  Phone,
  Navigation,
  Calendar,
  Truck,
  User,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreVertical,
  Download,
  X,
  AlertCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CargoDetailModal,
  CargoDetail,
} from "@/components/ui/CargoDetailModal";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { motion } from "framer-motion";

// Status configuration will be created using translations

// Format FRW currency
const formatFRW = (amount: number) => {
  return new Intl.NumberFormat("rw-RW", {
    style: "currency",
    currency: "RWF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export interface CargoTableProps {
  cargos: CargoDetail[];
  title?: string;
  showStats?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  showPagination?: boolean;
  itemsPerPage?: number;
  priorityFilter?: string;
  onPriorityFilterChange?: (priority: string) => void;
  onAcceptCargo?: (cargoId: string) => void;
  onStartDelivery?: (cargoId: string) => void;
  onCallClient?: (phone: string) => void;
  onCallDriver?: (phone: string) => void;
  onUploadPhoto?: (cargoId: string) => void;
  onReportIssue?: (cargoId: string) => void;
  onTrackCargo?: (cargoId: string) => void;
  onCancelCargo?: (cargoId: string) => void;
  onDownloadReceipt?: (cargoId: string) => void;
  onViewDetails?: (cargo: CargoDetail) => void;
  onStatusChange?: (cargoId: string, newStatus: string) => void;
  customActions?: React.ReactNode;
  getCustomActions?: (cargo: CargoDetail) => Array<{
    key: string;
    label: string;
    description?: string;
    icon?: React.ReactNode;
    variant?:
      | "default"
      | "outline"
      | "ghost"
      | "link"
      | "destructive"
      | "secondary";
    className?: string;
    onClick: () => void;
  }>;
  // Assignment system props
  onAcceptAssignment?: (assignmentId: string, notes?: string) => void;
  onRejectAssignment?: (
    assignmentId: string,
    reason: string,
    notes?: string
  ) => void;
  onCancelAssignment?: (assignmentId: string) => void;
  onChangeVehicle?: (assignmentId: string, vehicleId: string) => void;
  onChangeDriver?: (assignmentId: string, driverId: string) => void;
  onCreateAssignment?: (
    cargoId: string,
    driverId: string,
    vehicleId: string,
    notes?: string
  ) => void;
}

export function CargoTable({
  cargos,
  title,
  showStats = true,
  showSearch = true,
  showFilters = false,
  showPagination = true,
  itemsPerPage = 5,
  priorityFilter = "all",
  onPriorityFilterChange,
  onAcceptCargo,
  onStartDelivery,
  onCallClient,
  onCallDriver,
  onUploadPhoto,
  onReportIssue,
  onTrackCargo,
  onCancelCargo,
  onDownloadReceipt,
  onViewDetails,
  onStatusChange,
  customActions,
  getCustomActions,
  onAcceptAssignment,
  onRejectAssignment,
  onCancelAssignment,
  onChangeVehicle,
  onChangeDriver,
  onCreateAssignment,
}: CargoTableProps) {
  const { user } = useAuth();
  const { t } = useLanguage();

  const displayTitle = title || t("cargoTable.title");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    | "all"
    | "active"
    | "pending"
    | "completed"
    | "transit"
    | "delivered"
    | "cancelled"
    | "partially_assigned"
    | "fully_assigned"
    | "picked_up"
    | "in_transit"
    | "quoted"
    | "accepted"
  >("all");
  const [selectedCargo, setSelectedCargo] = useState<CargoDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredCargos = cargos.filter((cargo) => {
    const matchesSearch =
      String(cargo.clientCompany || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      cargo.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cargo.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cargo.type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || cargo.status === statusFilter;

    const matchesPriority =
      priorityFilter === "all" || cargo.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCargos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCargos = filteredCargos.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { className: string } } = {
      pending: { className: "bg-yellow-100 text-yellow-600" },
      quoted: { className: "bg-blue-100 text-blue-600" },
      accepted: { className: "bg-indigo-100 text-indigo-600" },
      partially_assigned: { className: "bg-orange-100 text-orange-600" },
      fully_assigned: { className: "bg-purple-100 text-purple-600" },
      picked_up: { className: "bg-orange-100 text-orange-600" },
      in_transit: { className: "bg-blue-100 text-blue-600" },
      delivered: { className: "bg-green-100 text-green-600" },
      cancelled: { className: "bg-red-100 text-red-600" },
      disputed: { className: "bg-red-100 text-red-600" },
    };

    const config = statusConfig[status];
    // Convert snake_case to camelCase (e.g., "fully_assigned" -> "fullyAssigned")
    const statusKey = status.replace(/_([a-z])/g, (_, letter) =>
      letter.toUpperCase()
    );
    const label =
      t(`cargoTable.status.${statusKey}`) ||
      t(`cargoTable.status.${status}`) ||
      status;
    const description =
      t(`cargoTable.statusDescription.${statusKey}`) ||
      t(`cargoTable.statusDescription.${status}`) ||
      t("cargoTable.status.statusLabel", { status });

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className={config?.className || "bg-gray-100 text-gray-600"}>
              {label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: { [key: string]: { className: string } } = {
      urgent: {
        className: "bg-red-100 text-red-600",
      },
      high: {
        className: "bg-orange-100 text-orange-600",
      },
      normal: {
        className: "bg-blue-100 text-blue-600",
      },
      low: {
        className: "bg-gray-100 text-gray-600",
      },
    };

    const config = priorityConfig[priority] || priorityConfig.normal;
    const label =
      t(`cargoTable.priority.${priority}`) || t("cargoTable.priority.normal");
    const description =
      t(`cargoTable.priorityDescription.${priority}`) ||
      t("cargoTable.priorityDescription.normal");

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className={config.className}>{label}</Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const handleRowClick = (cargo: CargoDetail) => {
    if (onViewDetails) {
      onViewDetails(cargo);
    } else {
      setSelectedCargo(cargo);
      setIsModalOpen(true);
    }
  };

  const getRoleBasedActions = (cargo: CargoDetail) => {
    const actions = [];

    if (user?.role === "admin") {
      // Admin actions based on status flow - can transition between any states
      const availableTransitions = getAvailableStatusTransitions(cargo.status);

      // Add status change actions
      availableTransitions.forEach((status) => {
        const statusLabel = getStatusLabel(status);
        actions.push({
          key: `status-${status}`,
          label: t("cargoTable.actions.changeTo", { status: statusLabel }),
          icon: <CheckCircle className="h-3 w-3 mr-1" />,
          onClick: () => onStatusChange?.(cargo.id, status),
          variant: "outline" as const,
        });
      });

      // Common admin actions
      if (cargo.clientCompany) {
        actions.push({
          key: "call-client",
          label: t("cargoTable.actions.callClient"),
          icon: <Phone className="h-3 w-3 mr-1" />,
          onClick: () => onCallClient?.(cargo.clientPhone || cargo.phone),
          variant: "outline" as const,
        });
      }

      if (cargo.driver) {
        actions.push({
          key: "call-driver",
          label: t("cargoTable.actions.callDriver"),
          icon: <Phone className="h-3 w-3 mr-1" />,
          onClick: () => onCallDriver?.(cargo.driverPhone || cargo.phone),
          variant: "outline" as const,
        });
      }

      if (onTrackCargo) {
        actions.push({
          key: "track",
          label: t("cargoTable.actions.track"),
          icon: <Navigation className="h-3 w-3 mr-1" />,
          onClick: () => onTrackCargo(cargo.id),
          variant: "outline" as const,
        });
      }

      if (onDownloadReceipt) {
        actions.push({
          key: "receipt",
          label: t("cargoTable.actions.downloadReceipt"),
          icon: <Download className="h-3 w-3 mr-1" />,
          onClick: () => onDownloadReceipt(cargo.id),
          variant: "outline" as const,
        });
      }

      if (onUploadPhoto) {
        actions.push({
          key: "photo",
          label: t("cargoTable.actions.uploadPhoto"),
          icon: <Package className="h-3 w-3 mr-1" />,
          onClick: () => onUploadPhoto(cargo.id),
          variant: "outline" as const,
        });
      }

      if (onReportIssue) {
        actions.push({
          key: "issue",
          label: t("cargoTable.actions.reportIssue"),
          icon: <AlertCircle className="h-3 w-3 mr-1" />,
          onClick: () => onReportIssue(cargo.id),
          variant: "outline" as const,
          className: "text-red-600",
        });
      }
    } else if (user?.role === "driver") {
      // Driver actions based on status flow
      if (cargo.status === "pending") {
        actions.push({
          key: "accept",
          label: t("cargoTable.actions.acceptCargo"),
          icon: <CheckCircle className="h-3 w-3 mr-1" />,
          onClick: () => onAcceptCargo?.(cargo.id),
          variant: "default" as const,
        });
      }
      if (cargo.status === "assigned") {
        actions.push({
          key: "pickup",
          label: t("cargoTable.actions.markPickedUp"),
          icon: <Package className="h-3 w-3 mr-1" />,
          onClick: () => onStatusChange?.(cargo.id, "picked_up"),
          variant: "default" as const,
        });
      }
      if (cargo.status === "picked_up") {
        actions.push({
          key: "transit",
          label: t("cargoTable.actions.startTransit"),
          icon: <Navigation className="h-3 w-3 mr-1" />,
          onClick: () => onStatusChange?.(cargo.id, "in_transit"),
          variant: "default" as const,
        });
      }
      if (cargo.status === "in_transit") {
        actions.push({
          key: "deliver",
          label: t("cargoTable.actions.markDelivered"),
          icon: <CheckCircle className="h-3 w-3 mr-1" />,
          onClick: () => onStatusChange?.(cargo.id, "delivered"),
          variant: "default" as const,
        });
      }
      if (cargo.clientCompany) {
        actions.push({
          key: "call",
          label: t("cargoTable.actions.callClient"),
          icon: <Phone className="h-3 w-3 mr-1" />,
          onClick: () => onCallClient?.(cargo.clientPhone || cargo.phone),
          variant: "outline" as const,
        });
      }
    } else if (user?.role === "client") {
      // Client actions based on status flow
      // Show call driver button when driver is assigned (assigned, picked_up, in_transit)
      if (
        cargo.driver &&
        cargo.driverPhone &&
        ["assigned", "picked_up", "in_transit"].includes(cargo.status)
      ) {
        actions.push({
          key: "call-driver",
          label: t("cargoTable.actions.callDriver"),
          icon: <Phone className="h-3 w-3 mr-1" />,
          onClick: () => onCallDriver?.(cargo.driverPhone || cargo.phone),
          variant: "outline" as const,
        });
      }

      // Cancellation is only allowed before picked_up status (except for admins)
      if (
        ["pending", "quoted", "accepted", "assigned"].includes(cargo.status)
      ) {
        actions.push({
          key: "cancel",
          label: t("cargoTable.actions.cancelCargo"),
          icon: <X className="h-3 w-3 mr-1" />,
          onClick: () => onCancelCargo?.(cargo.id),
          variant: "outline" as const,
          className: "text-red-600",
        });
      }

      if (cargo.status === "delivered") {
        actions.push({
          key: "receipt",
          label: t("cargoTable.actions.downloadReceipt"),
          icon: <Download className="h-3 w-3 mr-1" />,
          onClick: () => onDownloadReceipt?.(cargo.id),
          variant: "outline" as const,
        });
      }

      if (
        onTrackCargo &&
        ["assigned", "picked_up", "in_transit"].includes(cargo.status)
      ) {
        actions.push({
          key: "track",
          label: t("cargoTable.actions.trackCargo"),
          icon: <Navigation className="h-3 w-3 mr-1" />,
          onClick: () => onTrackCargo(cargo.id),
          variant: "outline" as const,
        });
      }
    }

    return actions;
  };

  // Get status label for display
  const getStatusLabel = (status: string) => {
    // Convert snake_case to camelCase (e.g., "fully_assigned" -> "fullyAssigned")
    const statusKey = status.replace(/_([a-z])/g, (_, letter) =>
      letter.toUpperCase()
    );
    return (
      t(`cargoTable.status.${statusKey}`) ||
      t(`cargoTable.status.${status}`) ||
      status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    );
  };

  // Get available status transitions for admin based on current status
  const getAvailableStatusTransitions = (currentStatus: string) => {
    const transitions: { [key: string]: string[] } = {
      pending: ["quoted", "cancelled"],
      quoted: ["accepted", "cancelled"],
      accepted: ["partially_assigned", "fully_assigned", "cancelled"],
      partially_assigned: ["fully_assigned", "cancelled"],
      fully_assigned: ["picked_up", "cancelled"],
      picked_up: ["in_transit", "cancelled"],
      in_transit: ["delivered", "cancelled"],
      delivered: [], // No transitions from delivered
      cancelled: [], // No transitions from cancelled
      disputed: ["delivered", "cancelled"], // Disputed can be resolved
    };
    return transitions[currentStatus] || [];
  };

  const renderActions = (cargo: CargoDetail) => {
    const exportCargoAsExcel = (cargoToExport: CargoDetail) => {
      const htmlEscape = (value: any): string => {
        if (value === null || value === undefined) return "";
        const str =
          typeof value === "object" ? JSON.stringify(value) : String(value);
        return str
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");
      };

      const safeCargoNumber =
        cargoToExport.cargo_number || cargoToExport.cargo_number || "cargo";

      const headerHtml = (() => {
        const logoUrl = `${window.location.origin}/logo.png`;
        return `
          <div class="report-header">
            <div class="report-brand">
              <img src="${logoUrl}" alt="Lovely Cargo" class="logo" />
              <div class="brand-text">
                <div class="brand-name">Lovely Cargo Platform</div>
                <div class="brand-subtitle">Cargo Detail Report</div>
              </div>
            </div>
            <div class="report-meta">
              <div><span class="label">Generated At:</span> ${htmlEscape(
                new Date().toLocaleString()
              )}</div>
              <div><span class="label">Cargo Number:</span> ${htmlEscape(
                safeCargoNumber
              )}</div>
              <div><span class="label">Status:</span> ${htmlEscape(
                getStatusLabel(cargoToExport.status)
              )}</div>
            </div>
          </div>
        `;
      })();

      const infoRows: Array<{ label: string; value: string }> = [
        {
          label: "Client",
          value:
            (cargoToExport.clientCompany as string) ||
            (cargoToExport.client as string) ||
            "",
        },
        {
          label: "Driver",
          value: cargoToExport.driverName || "",
        },
        {
          label: "From",
          value: cargoToExport.from,
        },
        {
          label: "To",
          value: cargoToExport.to,
        },
        {
          label: "Type",
          value: cargoToExport.type,
        },
        {
          label: "Priority",
          value: cargoToExport.priority,
        },
        {
          label: "Cost",
          value:
            typeof cargoToExport.cost === "number"
              ? formatFRW(cargoToExport.cost)
              : "",
        },
        {
          label: "Weight",
          value: cargoToExport.weight,
        },
        {
          label: "Distance",
          value: cargoToExport.distance,
        },
        {
          label: "Created Date",
          value: cargoToExport.createdDate || "",
        },
        {
          label: "Estimated Time",
          value: cargoToExport.estimatedTime || "",
        },
      ];

      const detailsTable = `
        <h2 class="section-title">Cargo Overview</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            ${infoRows
              .filter((row) => row.value && row.value !== "undefined")
              .map(
                (row) => `
                  <tr>
                    <td>${htmlEscape(row.label)}</td>
                    <td>${htmlEscape(row.value)}</td>
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>
      `;

      const descriptionSection = cargoToExport.description
        ? `
        <h2 class="section-title">Description</h2>
        <table class="data-table">
          <tbody>
            <tr>
              <td>${htmlEscape(cargoToExport.description)}</td>
            </tr>
          </tbody>
        </table>
      `
        : "";

      const fullHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <title>Cargo Report</title>
            <style>
              body {
                font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                font-size: 13px;
                color: #111827;
                background-color: #ffffff;
              }
              .report-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 16px 8px 16px;
                border-radius: 12px;
                background: linear-gradient(90deg, #4f46e5, #7c3aed, #0ea5e9);
                color: #ffffff;
                margin-bottom: 16px;
              }
              .report-brand {
                display: flex;
                align-items: center;
                gap: 12px;
              }
              .logo {
                width: 40px;
                height: 40px;
                border-radius: 999px;
                border: 2px solid rgba(255,255,255,0.6);
                object-fit: contain;
                background-color: #ffffff;
              }
              .brand-name {
                font-size: 16px;
                font-weight: 700;
              }
              .brand-subtitle {
                font-size: 13px;
                opacity: 0.9;
              }
              .report-meta {
                text-align: right;
                font-size: 11px;
                line-height: 1.4;
              }
              .report-meta .label {
                font-weight: 600;
              }
              .section-title {
                margin: 18px 0 6px 0;
                font-size: 14px;
                font-weight: 600;
                color: #111827;
              }
              table.data-table {
                border-collapse: collapse;
                width: 100%;
                margin-bottom: 12px;
              }
              table.data-table th,
              table.data-table td {
                border: 1px solid #e5e7eb;
                padding: 6px 8px;
                text-align: left;
                vertical-align: top;
              }
              table.data-table th {
                background-color: #f3f4f6;
                font-weight: 600;
              }
              table.data-table tr:nth-child(even) td {
                background-color: #fafafa;
              }
            </style>
          </head>
          <body>
            ${headerHtml}
            ${detailsTable}
            ${descriptionSection}
          </body>
        </html>
      `;

      const blob = new Blob([fullHtml], {
        type: "application/vnd.ms-excel",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cargo-report-${safeCargoNumber}.xls`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    const actions = getCustomActions
      ? getCustomActions(cargo)
      : getRoleBasedActions(cargo);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {actions.map((action) => (
            <DropdownMenuItem
              key={action.key}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
              }}
              className={action.className}
            >
              {action.icon}
              {action.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              exportCargoAsExcel(cargo);
            }}
          >
            <Download className="h-3 w-3 mr-1" />
            {t("cargoTable.actions.downloadExcel") || "Download Excel"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const getDisplayData = (cargo: CargoDetail) => {
    if (user?.role === "driver") {
      return {
        id: cargo.cargo_number || cargo.id, // Use cargo_number if available, fallback to id
        client: cargo.clientCompany,
        phone: cargo.phone,
        from: cargo.from,
        to: cargo.to,
        status: cargo.status,
        priority: cargo.priority,
        earnings: cargo.earnings,
        weight: cargo.weight,
        distance: cargo.distance,
        pickupTime: cargo.pickupTime,
        estimatedDelivery: cargo.estimatedDelivery,
      };
    } else {
      return {
        id: cargo.cargo_number || cargo.id, // Use cargo_number if available, fallback to id
        client: cargo.clientCompany,
        driver: cargo.driver,
        phone: cargo.phone,
        from: cargo.from,
        to: cargo.to,
        status: cargo.status,
        type: cargo.type,
        cost: cargo.cost,
        weight: cargo.weight,
        distance: cargo.distance,
        createdDate: cargo.createdDate,
        estimatedTime: cargo.estimatedTime,
      };
    }
  };

  const renderMobileCard = (cargo: CargoDetail, index: number) => {
    const data = getDisplayData(cargo);

    return (
      <motion.div
        key={cargo.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Card
          className="mb-3 sm:mb-4 cursor-pointer hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50/40 via-white to-indigo-50/30 backdrop-blur-sm rounded-2xl"
          onClick={() => handleRowClick(cargo)}
        >
          <CardContent className="p-3 sm:p-4">
            {/* Header Section */}
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                  <span className="text-[10px] sm:text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 px-2 py-0.5 sm:py-1 rounded-full shadow-sm">
                    #{startIndex + index + 1}
                  </span>
                  <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                      {cargo.cargo_number ||
                        data.id ||
                        t("cargoTable.mobile.generalCargo")}
                    </p>
                    <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1 flex-wrap">
                      <Badge
                        variant="secondary"
                        className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 bg-blue-100 text-blue-700 border-0"
                      >
                        {cargo.type || t("cargoTable.table.general")}
                      </Badge>
                      {getStatusBadge(data.status)}
                    </div>
                  </div>
                </div>

                {/* Client Information */}
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 p-2 bg-gradient-to-r from-gray-50/80 to-gray-100/60 backdrop-blur-sm rounded-xl">
                  <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                      {String(
                        data.client || t("cargoTable.table.notAvailable")
                      )}
                    </p>
                    {cargo.clientCompany && (
                      <p className="text-[10px] sm:text-xs text-gray-600 truncate">
                        {cargo.clientCompany}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Vehicle & Distance Info */}
              <div className="flex flex-col items-end gap-1.5 sm:gap-2 ml-2 sm:ml-3 flex-shrink-0">
                <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gradient-to-r from-orange-50/80 to-orange-100/60 backdrop-blur-sm rounded-lg">
                  <Truck className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-orange-600 flex-shrink-0" />
                  <span className="text-[10px] sm:text-xs font-medium text-orange-700">
                    {(cargo as any).vehicleInfo?.plate_number ||
                      t("cargoTable.table.notAvailable")}
                  </span>
                </div>
                <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gradient-to-r from-green-50/80 to-green-100/60 backdrop-blur-sm rounded-lg">
                  <Navigation className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-600 flex-shrink-0" />
                  <span className="text-[10px] sm:text-xs font-medium text-green-700">
                    {data.distance}
                  </span>
                </div>
              </div>
            </div>

            {/* Route Information */}
            <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
              {/* Pickup Location */}
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-green-50/80 via-emerald-50/60 to-teal-50/40 backdrop-blur-sm rounded-xl border border-green-200/50">
                <div className="flex items-start gap-1.5 sm:gap-2">
                  <div className="flex-shrink-0">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-xs font-semibold text-green-700 uppercase tracking-wide mb-0.5 sm:mb-1">
                      {t("cargoTable.mobile.pickupLocation")}
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-gray-900 mb-0.5 sm:mb-1">
                      {data.from}
                    </p>
                    {(cargo as any).pickupLocation?.name && (
                      <p className="text-[10px] sm:text-xs text-gray-600">
                        📍 {(cargo as any).pickupLocation.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Destination Location */}
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/40 backdrop-blur-sm rounded-xl border border-blue-200/50">
                <div className="flex items-start gap-1.5 sm:gap-2">
                  <div className="flex-shrink-0">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-xs font-semibold text-blue-700 uppercase tracking-wide mb-0.5 sm:mb-1">
                      {t("cargoTable.mobile.destination")}
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-gray-900 mb-0.5 sm:mb-1">
                      {data.to}
                    </p>
                    {(cargo as any).destinationLocation?.name && (
                      <p className="text-[10px] sm:text-xs text-gray-600">
                        📍 {(cargo as any).destinationLocation.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            {cargo.description && (
              <div className="mb-3 sm:mb-4 p-2 bg-gradient-to-r from-gray-50/80 to-gray-100/60 backdrop-blur-sm rounded-xl">
                <p className="text-[10px] sm:text-xs text-gray-600 mb-0.5 sm:mb-1 font-semibold">
                  {t("cargoTable.mobile.description")}
                </p>
                <p className="text-xs sm:text-sm text-gray-700">
                  {cargo.description}
                </p>
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-200/50">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                <span className="text-[10px] sm:text-xs text-gray-500">
                  {t("cargoTable.mobile.assigned")}{" "}
                  {cargo.assignedDate || t("cargoTable.mobile.notAvailable")}
                </span>
              </div>

              <div className="flex gap-1.5 sm:gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRowClick(cargo);
                  }}
                  className="flex items-center gap-1 text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border-gray-200 hover:border-blue-500 bg-white/80 backdrop-blur-sm"
                >
                  <Eye className="h-3 w-3 flex-shrink-0" />
                  {t("cargoTable.actions.details")}
                </Button>

                {/* Show call driver button prominently for clients when driver is assigned */}
                {user?.role === "client" &&
                  cargo.driver &&
                  cargo.driverPhone &&
                  ["assigned", "picked_up", "in_transit"].includes(
                    cargo.status
                  ) && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCallDriver?.(cargo.driverPhone || cargo.phone);
                      }}
                      className="flex items-center gap-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Phone className="h-3 w-3 flex-shrink-0" />
                      {t("cargoTable.actions.call")}
                    </Button>
                  )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-100 text-blue-600">
            {filteredCargos.length} Cargos
          </Badge>
          {customActions}
        </div>
      </div> */}

      {/* Stats Cards */}
      {showStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/80 backdrop-blur-sm border border-blue-100/50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
              <CardContent className="p-4 sm:p-5 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-700">
                      {t("cargoTable.stats.total")}
                    </p>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {cargos.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-green-50/80 via-emerald-50/60 to-teal-50/80 backdrop-blur-sm border border-green-100/50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
              <CardContent className="p-4 sm:p-5 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-700">
                      {user?.role === "driver"
                        ? t("cargoTable.stats.active")
                        : t("cargoTable.stats.inTransit")}
                    </p>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {
                        cargos.filter(
                          (c) =>
                            c.status ===
                            (user?.role === "driver" ? "active" : "transit")
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-yellow-50/80 via-amber-50/60 to-orange-50/80 backdrop-blur-sm border border-yellow-100/50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
              <CardContent className="p-4 sm:p-5 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-700">
                      {user?.role === "driver"
                        ? t("cargoTable.stats.pending")
                        : t("cargoTable.stats.delivered")}
                    </p>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                      {
                        cargos.filter(
                          (c) =>
                            c.status ===
                            (user?.role === "driver" ? "pending" : "delivered")
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-purple-50/80 via-pink-50/60 to-rose-50/80 backdrop-blur-sm border border-purple-100/50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
              <CardContent className="p-4 sm:p-5 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-700">
                      {user?.role === "driver"
                        ? t("cargoTable.stats.completed")
                        : t("cargoTable.stats.totalSpent")}
                    </p>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {user?.role === "driver"
                        ? cargos.filter((c) => c.status === "completed").length
                        : formatFRW(
                            cargos.reduce((sum, c) => sum + (c.cost || 0), 0)
                          )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Filters and Search */}
      {(showSearch || showFilters) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 backdrop-blur-sm border border-blue-100/50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardContent className="p-4 sm:p-5 md:p-6">
              <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
                {showSearch && (
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 z-10" />
                      <Input
                        placeholder={t("cargoTable.search.placeholder")}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 sm:pl-10 rounded-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm md:text-base font-semibold border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/80 backdrop-blur-sm"
                      />
                    </div>
                  </div>
                )}
                {showFilters && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Select
                      value={statusFilter}
                      onValueChange={(
                        value:
                          | "all"
                          | "active"
                          | "pending"
                          | "completed"
                          | "transit"
                          | "delivered"
                          | "cancelled"
                      ) => setStatusFilter(value)}
                    >
                      <SelectTrigger className="w-full sm:w-[160px] md:w-[180px] rounded-full text-xs sm:text-sm font-semibold border-gray-200 focus:border-blue-500 bg-white/80 backdrop-blur-sm">
                        <SelectValue
                          placeholder={t("cargoTable.filters.filterByStatus")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          {t("cargoTable.filters.allStatus")}
                        </SelectItem>
                        {user?.role === "driver" ? (
                          <>
                            <SelectItem value="active">
                              {t("cargoTable.filters.active")}
                            </SelectItem>
                            <SelectItem value="pending">
                              {t("cargoTable.status.pending")}
                            </SelectItem>
                            <SelectItem value="completed">
                              {t("cargoTable.filters.completed")}
                            </SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="pending">
                              {t("cargoTable.status.pending")}
                            </SelectItem>
                            <SelectItem value="transit">
                              {t("cargoTable.filters.transit")}
                            </SelectItem>
                            <SelectItem value="delivered">
                              {t("cargoTable.status.delivered")}
                            </SelectItem>
                            <SelectItem value="cancelled">
                              {t("cargoTable.status.cancelled")}
                            </SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    {onPriorityFilterChange && (
                      <Select
                        value={priorityFilter}
                        onValueChange={onPriorityFilterChange}
                      >
                        <SelectTrigger className="w-full sm:w-[140px] rounded-full text-xs sm:text-sm font-semibold border-gray-200 focus:border-blue-500 bg-white/80 backdrop-blur-sm">
                          <SelectValue
                            placeholder={t("cargoTable.filters.priority")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            {t("cargoTable.filters.allPriority")}
                          </SelectItem>
                          <SelectItem value="low">
                            {t("cargoTable.priority.low")}
                          </SelectItem>
                          <SelectItem value="normal">
                            {t("cargoTable.priority.normal")}
                          </SelectItem>
                          <SelectItem value="high">
                            {t("cargoTable.priority.high")}
                          </SelectItem>
                          <SelectItem value="urgent">
                            {t("cargoTable.priority.urgent")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Cargos Table */}
      <div className="w-full">
        <Card className="bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20 backdrop-blur-sm border border-gray-100/50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden hidden md:block w-full">
          <CardHeader className="pb-4">
            <CardTitle className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
              {displayTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto w-full">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm font-semibold text-gray-700">
                      #
                    </TableHead>
                    <TableHead className="text-xs sm:text-sm font-semibold text-gray-700">
                      {t("cargoTable.table.cargoInfo")}
                    </TableHead>
                    <TableHead className="text-xs sm:text-sm font-semibold text-gray-700">
                      {t("cargoTable.table.client")}
                    </TableHead>
                    <TableHead className="text-xs sm:text-sm font-semibold text-gray-700">
                      {t("cargoTable.table.route")}
                    </TableHead>
                    <TableHead className="text-xs sm:text-sm font-semibold text-gray-700">
                      {t("cargoTable.table.driver")}
                    </TableHead>
                    <TableHead className="text-xs sm:text-sm font-semibold text-gray-700">
                      {t("cargoTable.table.vehicle")}
                    </TableHead>
                    <TableHead className="text-xs sm:text-sm font-semibold text-gray-700">
                      {t("cargoTable.table.status")}
                    </TableHead>
                    <TableHead className="text-xs sm:text-sm font-semibold text-gray-700">
                      {t("cargoTable.table.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentCargos.map((cargo, index) => {
                    const data = getDisplayData(cargo);
                    return (
                      <TableRow
                        key={cargo.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleRowClick(cargo)}
                      >
                        <TableCell className="text-sm text-gray-500 font-medium">
                          {startIndex + index + 1}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {cargo.cargo_number ||
                                data.id ||
                                `#${startIndex + index + 1}`}
                            </p>
                            <p className="text-xs text-blue-600 font-medium">
                              {cargo.type || t("cargoTable.table.general")}
                            </p>
                            {cargo.description && (
                              <p className="text-xs text-gray-500 truncate max-w-32">
                                {cargo.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {cargo.client ||
                                cargo.clientCompany ||
                                t("cargoTable.table.notAvailable")}
                            </p>
                            {cargo.clientCompany &&
                              cargo.client !== cargo.clientCompany && (
                                <p className="text-xs text-gray-500 truncate">
                                  {cargo.clientCompany}
                                </p>
                              )}
                            {cargo.clientPhone && (
                              <p className="text-xs text-gray-400">
                                {cargo.clientPhone}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="flex items-start gap-2 mb-2">
                              <MapPin className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                                  {t("cargoTable.table.from")}
                                </p>
                                <p className="text-sm text-gray-900 truncate">
                                  {data.from}
                                </p>
                                {(cargo as any).pickupLocation?.name && (
                                  <p className="text-xs text-gray-500 truncate">
                                    {(cargo as any).pickupLocation.name}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                                  {t("cargoTable.table.to")}
                                </p>
                                <p className="text-sm text-gray-900 truncate">
                                  {data.to}
                                </p>
                                {(cargo as any).destinationLocation?.name && (
                                  <p className="text-xs text-gray-500 truncate">
                                    {(cargo as any).destinationLocation.name}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {cargo.driverName ||
                                t("cargoTable.table.notAvailable")}
                            </p>
                            {cargo.driverRating && (
                              <p className="text-xs text-yellow-600">
                                ⭐ {cargo.driverRating}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {cargo.vehiclePlate ||
                                t("cargoTable.table.notAvailable")}
                            </p>
                            <p className="text-xs text-gray-500">
                              {cargo.vehicleMake} {cargo.vehicleModel}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(data.status)}</TableCell>
                        <TableCell>{renderActions(cargo)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {showPagination && totalPages > 1 && (
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100/50">
                <div className="text-xs sm:text-sm text-gray-600">
                  {t("cargoTable.pagination.showing", {
                    start: startIndex + 1,
                    end: Math.min(endIndex, filteredCargos.length),
                    total: filteredCargos.length,
                  })}
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
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      )
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mobile Cards View */}
      <div className="md:hidden">
        <div className="mb-3 sm:mb-4">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">
            {displayTitle}
          </h2>
        </div>
        {currentCargos.map((cargo, index) => renderMobileCard(cargo, index))}

        {/* Mobile Pagination */}
        {showPagination && totalPages > 1 && (
          <motion.div
            className="flex items-center justify-between mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20 backdrop-blur-sm rounded-2xl border border-gray-100/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-xs sm:text-sm text-gray-600">
              {t("cargoTable.pagination.showingMobile", {
                start: startIndex + 1,
                end: Math.min(endIndex, filteredCargos.length),
                total: filteredCargos.length,
              })}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Cargo Detail Modal */}
      <CargoDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCargo(null);
        }}
        cargo={selectedCargo}
        onAccept={onAcceptCargo}
        onStartDelivery={onStartDelivery}
        onCallClient={onCallClient}
        onCallDriver={onCallDriver}
        onUploadPhoto={onUploadPhoto}
        onReportIssue={onReportIssue}
        onCancelCargo={onCancelCargo}
        onDownloadReceipt={onDownloadReceipt}
        userRole={user?.role}
        onAcceptAssignment={onAcceptAssignment}
        onRejectAssignment={onRejectAssignment}
        onCancelAssignment={onCancelAssignment}
        onChangeVehicle={onChangeVehicle}
        onChangeDriver={onChangeDriver}
        onCreateAssignment={onCreateAssignment}
      />
    </div>
  );
}
