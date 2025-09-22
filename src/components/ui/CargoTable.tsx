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

// Status configuration for different cargo types with meaningful descriptions
const statusConfig = {
  pending: {
    label: "Pending",
    description: "Request submitted, waiting for pricing",
    className: "bg-yellow-100 text-yellow-600",
  },
  quoted: {
    label: "Invoice Sent",
    description: "Price quote provided, awaiting acceptance",
    className: "bg-blue-100 text-blue-600",
  },
  accepted: {
    label: "Invoice Paid",
    description: "Client confirmed, ready for assignment",
    className: "bg-indigo-100 text-indigo-600",
  },
  assigned: {
    label: "Driver Assigned",
    description: "Driver and vehicle assigned for pickup",
    className: "bg-purple-100 text-purple-600",
  },
  picked_up: {
    label: "Cargo Collected",
    description: "Successfully picked up, now in transit",
    className: "bg-orange-100 text-orange-600",
  },
  in_transit: {
    label: "In Transit",
    description: "Being transported to destination",
    className: "bg-blue-100 text-blue-600",
  },
  delivered: {
    label: "Delivered",
    description: "Successfully delivered to destination",
    className: "bg-green-100 text-green-600",
  },
  cancelled: {
    label: "Cancelled",
    description: "Shipment was cancelled",
    className: "bg-red-100 text-red-600",
  },
  disputed: {
    label: "Disputed",
    description: "Issue reported, under investigation",
    className: "bg-red-100 text-red-600",
  },
};

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
  title = "Cargos",
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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    | "all"
    | "active"
    | "pending"
    | "completed"
    | "transit"
    | "delivered"
    | "cancelled"
  >("all");
  const [selectedCargo, setSelectedCargo] = useState<CargoDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredCargos = cargos.filter((cargo) => {
    const matchesSearch =
      String(cargo.client || "")
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
    const config = statusConfig[status as keyof typeof statusConfig];
    return config ? (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className={config.className}>{config.label}</Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{config.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className="bg-gray-100 text-gray-600">{status}</Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Status: {status}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      urgent: {
        label: "Urgent",
        description: "Critical shipment requiring immediate attention",
        className: "bg-red-100 text-red-600",
      },
      high: {
        label: "High",
        description: "Important shipment requiring faster processing",
        className: "bg-orange-100 text-orange-600",
      },
      normal: {
        label: "Normal",
        description: "Standard priority, default processing",
        className: "bg-blue-100 text-blue-600",
      },
      low: {
        label: "Low",
        description: "Non-urgent, can be processed during normal operations",
        className: "bg-gray-100 text-gray-600",
      },
    };

    const config =
      priorityConfig[priority as keyof typeof priorityConfig] ||
      priorityConfig.normal;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className={config.className}>{config.label}</Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{config.description}</p>
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
          label: `Change to ${statusLabel}`,
          icon: <CheckCircle className="h-3 w-3 mr-1" />,
          onClick: () => onStatusChange?.(cargo.id, status),
          variant: "outline" as const,
        });
      });

      // Common admin actions
      if (cargo.client) {
        actions.push({
          key: "call-client",
          label: "Call Client",
          icon: <Phone className="h-3 w-3 mr-1" />,
          onClick: () => onCallClient?.(cargo.clientPhone || cargo.phone),
          variant: "outline" as const,
        });
      }

      if (cargo.driver) {
        actions.push({
          key: "call-driver",
          label: "Call Driver",
          icon: <Phone className="h-3 w-3 mr-1" />,
          onClick: () => onCallDriver?.(cargo.driverPhone || cargo.phone),
          variant: "outline" as const,
        });
      }

      if (onTrackCargo) {
        actions.push({
          key: "track",
          label: "Track",
          icon: <Navigation className="h-3 w-3 mr-1" />,
          onClick: () => onTrackCargo(cargo.id),
          variant: "outline" as const,
        });
      }

      if (onDownloadReceipt) {
        actions.push({
          key: "receipt",
          label: "Download Receipt",
          icon: <Download className="h-3 w-3 mr-1" />,
          onClick: () => onDownloadReceipt(cargo.id),
          variant: "outline" as const,
        });
      }

      if (onUploadPhoto) {
        actions.push({
          key: "photo",
          label: "Upload Photo",
          icon: <Package className="h-3 w-3 mr-1" />,
          onClick: () => onUploadPhoto(cargo.id),
          variant: "outline" as const,
        });
      }

      if (onReportIssue) {
        actions.push({
          key: "issue",
          label: "Report Issue",
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
          label: "Accept Cargo",
          icon: <CheckCircle className="h-3 w-3 mr-1" />,
          onClick: () => onAcceptCargo?.(cargo.id),
          variant: "default" as const,
        });
      }
      if (cargo.status === "assigned") {
        actions.push({
          key: "pickup",
          label: "Mark Picked Up",
          icon: <Package className="h-3 w-3 mr-1" />,
          onClick: () => onStatusChange?.(cargo.id, "picked_up"),
          variant: "default" as const,
        });
      }
      if (cargo.status === "picked_up") {
        actions.push({
          key: "transit",
          label: "Start Transit",
          icon: <Navigation className="h-3 w-3 mr-1" />,
          onClick: () => onStatusChange?.(cargo.id, "in_transit"),
          variant: "default" as const,
        });
      }
      if (cargo.status === "in_transit") {
        actions.push({
          key: "deliver",
          label: "Mark Delivered",
          icon: <CheckCircle className="h-3 w-3 mr-1" />,
          onClick: () => onStatusChange?.(cargo.id, "delivered"),
          variant: "default" as const,
        });
      }
      if (cargo.client) {
        actions.push({
          key: "call",
          label: "Call Client",
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
          label: "Call Driver",
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
          label: "Cancel Cargo",
          icon: <X className="h-3 w-3 mr-1" />,
          onClick: () => onCancelCargo?.(cargo.id),
          variant: "outline" as const,
          className: "text-red-600",
        });
      }

      if (cargo.status === "delivered") {
        actions.push({
          key: "receipt",
          label: "Download Receipt",
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
          label: "Track Cargo",
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
    const config = statusConfig[status as keyof typeof statusConfig];
    return config ? config.label : status.replace("_", " ").toUpperCase();
  };

  // Get available status transitions for admin based on current status
  const getAvailableStatusTransitions = (currentStatus: string) => {
    const transitions: { [key: string]: string[] } = {
      pending: ["quoted", "cancelled"],
      quoted: ["accepted", "cancelled"],
      accepted: ["assigned", "cancelled"],
      assigned: ["picked_up", "cancelled"],
      picked_up: ["in_transit", "cancelled"],
      in_transit: ["delivered", "cancelled"],
      delivered: [], // No transitions from delivered
      cancelled: [], // No transitions from cancelled
      disputed: ["delivered", "cancelled"], // Disputed can be resolved
    };
    return transitions[currentStatus] || [];
  };

  const renderActions = (cargo: CargoDetail) => {
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
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const getDisplayData = (cargo: CargoDetail) => {
    if (user?.role === "driver") {
      return {
        id: cargo.cargo_number || cargo.id, // Use cargo_number if available, fallback to id
        client: cargo.client,
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
        client: cargo.client,
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
      <Card
        key={cargo.id}
        className="mb-4 cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/30 to-white"
        onClick={() => handleRowClick(cargo)}
      >
        <CardContent className="p-4">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white bg-blue-600 px-2 py-1 rounded-full shadow-sm">
                    #{startIndex + index + 1}
                  </span>
                  <Package className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {cargo.cargo_number || data.id || "General Cargo"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="secondary"
                      className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 border-0"
                    >
                      {cargo.type || "General"}
                    </Badge>
                    {getStatusBadge(data.status)}
                  </div>
                </div>
              </div>

              {/* Client Information */}
              <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded-lg">
                <User className="h-4 w-4 text-gray-600" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {String(data.client || "N/A")}
                  </p>
                  {cargo.clientCompany && (
                    <p className="text-xs text-gray-600 truncate">
                      {cargo.clientCompany}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Vehicle & Distance Info */}
            <div className="flex flex-col items-end gap-2 ml-3">
              <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 rounded-lg">
                <Truck className="h-3 w-3 text-orange-600" />
                <span className="text-xs font-medium text-orange-700">
                  {cargo.vehicleInfo?.plate_number || "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-lg">
                <Navigation className="h-3 w-3 text-green-600" />
                <span className="text-xs font-medium text-green-700">
                  {data.distance}
                </span>
              </div>
            </div>
          </div>

          {/* Route Information */}
          <div className="space-y-3 mb-4">
            {/* Pickup Location */}
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <MapPin className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">
                    Pickup Location
                  </p>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {data.from}
                  </p>
                  {cargo.pickupLocation?.name && (
                    <p className="text-xs text-gray-600">
                      📍 {cargo.pickupLocation.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Destination Location */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <MapPin className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">
                    Destination
                  </p>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {data.to}
                  </p>
                  {cargo.destinationLocation?.name && (
                    <p className="text-xs text-gray-600">
                      📍 {cargo.destinationLocation.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {cargo.description && (
            <div className="mb-4 p-2 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Description:</p>
              <p className="text-sm text-gray-700">{cargo.description}</p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-xs text-gray-500">
                Assigned: {cargo.assignedDate || "N/A"}
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRowClick(cargo);
                }}
                className="flex items-center gap-1 text-xs px-3 py-1.5"
              >
                <Eye className="h-3 w-3" />
                Details
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
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-xs px-3 py-1.5"
                  >
                    <Phone className="h-3 w-3" />
                    Call
                  </Button>
                )}
            </div>
          </div>
        </CardContent>
      </Card>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {cargos.length}
                  </p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {user?.role === "driver" ? "Active" : "In Transit"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {
                      cargos.filter(
                        (c) =>
                          c.status ===
                          (user?.role === "driver" ? "active" : "transit")
                      ).length
                    }
                  </p>
                </div>
                <Navigation className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {user?.role === "driver" ? "Pending" : "Delivered"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {
                      cargos.filter(
                        (c) =>
                          c.status ===
                          (user?.role === "driver" ? "pending" : "delivered")
                      ).length
                    }
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {user?.role === "driver" ? "Completed" : "Total Spent"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {user?.role === "driver"
                      ? cargos.filter((c) => c.status === "completed").length
                      : formatFRW(
                          cargos.reduce((sum, c) => sum + (c.cost || 0), 0)
                        )}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      {(showSearch || showFilters) && (
        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {showSearch && (
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by client, location, or type..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              )}
              {showFilters && (
                <div className="flex gap-2">
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
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      {user?.role === "driver" ? (
                        <>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="transit">In Transit</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  {onPriorityFilterChange && (
                    <Select
                      value={priorityFilter}
                      onValueChange={onPriorityFilterChange}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cargos Table */}
      <div className="w-full">
        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden hidden md:block w-full">
          <CardHeader className="pb-4">
            <CardTitle className="text-gray-900">{title}</CardTitle>
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
                      Cargo Info
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-600 w-40">
                      Client
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-600 w-48">
                      Pickup Address
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-600 w-48">
                      Destination Address
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-600 w-20">
                      Distance
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-600 w-32">
                      Vehicle
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-600 w-24">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-600 w-20">
                      Actions
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
                              {cargo.type || "General"}
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
                              {String(data.client || "N/A")}
                            </p>
                            {cargo.clientCompany && (
                              <p className="text-xs text-gray-500 truncate">
                                {cargo.clientCompany}
                              </p>
                            )}
                            {data.phone && (
                              <p className="text-xs text-gray-400">
                                {data.phone}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{data.from}</span>
                            </div>
                            {cargo.pickupLocation?.name && (
                              <p className="text-xs text-gray-500 mt-1">
                                {cargo.pickupLocation.name}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{data.to}</span>
                            </div>
                            {cargo.destinationLocation?.name && (
                              <p className="text-xs text-gray-500 mt-1">
                                {cargo.destinationLocation.name}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-900">
                              {data.distance}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {cargo.vehicleInfo?.plate_number || "N/A"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {cargo.vehicleInfo?.make}{" "}
                              {cargo.vehicleInfo?.model}
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
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <div className="text-sm text-gray-500">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(endIndex, filteredCargos.length)} of{" "}
                  {filteredCargos.length} results
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
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
        </div>
        {currentCargos.map((cargo, index) => renderMobileCard(cargo, index))}

        {/* Mobile Pagination */}
        {showPagination && totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-500">
              {startIndex + 1}-{Math.min(endIndex, filteredCargos.length)} of{" "}
              {filteredCargos.length}
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
          </div>
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
