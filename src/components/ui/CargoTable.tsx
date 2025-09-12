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
  CargoDetailModal,
  CargoDetail,
} from "@/components/ui/CargoDetailModal";
import { useAuth } from "@/contexts/AuthContext";

// Status configuration for different cargo types
const statusConfig = {
  pending: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-600",
  },
  assigned: {
    label: "Assigned",
    className: "bg-purple-100 text-purple-600",
  },
  picked_up: {
    label: "Picked Up",
    className: "bg-orange-100 text-orange-600",
  },
  in_transit: {
    label: "In Transit",
    className: "bg-blue-100 text-blue-600",
  },
  delivered: {
    label: "Delivered",
    className: "bg-green-100 text-green-600",
  },
  cancelled: {
    label: "Cancelled",
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
      cargo.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      <Badge className={config.className}>{config.label}</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-600">{status}</Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    return priority === "urgent" ? (
      <Badge className="bg-red-100 text-red-600">Urgent</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-600">Standard</Badge>
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
      // Admin actions based on status flow
      const availableTransitions = getAvailableStatusTransitions(cargo.status);

      // Add status change actions
      availableTransitions.forEach((status) => {
        actions.push({
          key: `status-${status}`,
          label: `Change to ${
            status?.replace("_", " ").toUpperCase() || status
          }`,
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
          onClick: () => onCallClient?.(cargo.phone),
          variant: "outline" as const,
        });
      }

      if (cargo.driver) {
        actions.push({
          key: "call-driver",
          label: "Call Driver",
          icon: <Phone className="h-3 w-3 mr-1" />,
          onClick: () => onCallDriver?.(cargo.phone),
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
      // Driver actions
      if (cargo.status === "pending") {
        actions.push({
          key: "accept",
          label: "Accept",
          icon: <CheckCircle className="h-3 w-3 mr-1" />,
          onClick: () => onAcceptCargo?.(cargo.id),
          variant: "default" as const,
        });
      }
      if (cargo.status === "active") {
        actions.push({
          key: "start",
          label: "Start",
          icon: <Navigation className="h-3 w-3 mr-1" />,
          onClick: () => onStartDelivery?.(cargo.id),
          variant: "default" as const,
        });
      }
      if (cargo.client) {
        actions.push({
          key: "call",
          label: "Call",
          icon: <Phone className="h-3 w-3 mr-1" />,
          onClick: () => onCallClient?.(cargo.phone),
          variant: "outline" as const,
        });
      }
    } else if (user?.role === "client") {
      // Client actions
      if (cargo.driver) {
        actions.push({
          key: "call",
          label: "Call",
          icon: <Phone className="h-3 w-3 mr-1" />,
          onClick: () => onCallDriver?.(cargo.phone),
          variant: "outline" as const,
        });
      }
      if (cargo.status === "pending") {
        actions.push({
          key: "cancel",
          label: "Cancel",
          icon: <X className="h-3 w-3 mr-1" />,
          onClick: () => onCancelCargo?.(cargo.id),
          variant: "outline" as const,
          className: "text-red-600",
        });
      }
      if (cargo.status === "delivered") {
        actions.push({
          key: "receipt",
          label: "Receipt",
          icon: <Download className="h-3 w-3 mr-1" />,
          onClick: () => onDownloadReceipt?.(cargo.id),
          variant: "outline" as const,
        });
      }
    }

    return actions;
  };

  // Get available status transitions for admin based on current status
  const getAvailableStatusTransitions = (currentStatus: string) => {
    const transitions: { [key: string]: string[] } = {
      pending: ["assigned", "cancelled"],
      assigned: ["picked_up", "cancelled"],
      picked_up: ["in_transit", "cancelled"],
      in_transit: ["delivered", "cancelled"],
      delivered: [], // No transitions from delivered
      cancelled: [], // No transitions from cancelled
    };
    return transitions[currentStatus] || [];
  };

  const renderActions = (cargo: CargoDetail) => {
    const actions = getRoleBasedActions(cargo);

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
        client: cargo.client, // Fixed: should be client, not driver
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
        className="mb-4 cursor-pointer hover:shadow-lg transition-shadow duration-200"
        onClick={() => handleRowClick(cargo)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900">
                  {data.type || "General Cargo"}
                </span>
                {getStatusBadge(data.status)}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {user?.role === "driver" ? data.client : data.driver}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">
                {user?.role === "driver"
                  ? data.earnings
                  : formatFRW(data.cost || 0)}
              </p>
              <p className="text-xs text-gray-500">{data.weight}</p>
            </div>
          </div>

          <div className="space-y-2 mb-3">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-gray-900 truncate">
                  {data.from}
                </p>
                <p className="text-gray-500 text-xs">to</p>
                <p className="font-medium text-blue-600 truncate">{data.to}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Navigation className="h-3 w-3" />
              <span>{data.distance}</span>
            </div>
          </div>

          {user?.role === "driver" && (
            <div className="mb-3">
              {getPriorityBadge(cargo.priority || "standard")}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleRowClick(cargo);
              }}
              className="flex items-center gap-1"
            >
              <Eye className="h-3 w-3" />
              View Details
            </Button>
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
                {getRoleBasedActions(cargo).map((action) => (
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
                    {user?.role === "driver" ? (
                      <TableHead className="text-xs font-medium text-gray-600 w-32">
                        Client
                      </TableHead>
                    ) : (
                      <TableHead className="text-xs font-medium text-gray-600 w-36">
                        Client
                      </TableHead>
                    )}
                    <TableHead className="text-xs font-medium text-gray-600 flex-1">
                      Route
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-600 w-24">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-600 w-24">
                      Priority
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-600 w-32">
                      Cost
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
                        <TableCell className="text-sm text-gray-500">
                          {startIndex + index + 1}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {data.client || "N/A"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {data.phone || "N/A"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />{" "}
                              {data.from}{" "}
                              <span className="text-gray-500">to</span>{" "}
                              {data.to}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {data.distance}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(data.status)}</TableCell>
                        <TableCell>
                          {getPriorityBadge(cargo.priority || "normal")}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-bold text-gray-900">
                              {formatFRW(data.cost || 0)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {data.weight}
                            </p>
                          </div>
                        </TableCell>
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
        onUploadPhoto={onUploadPhoto}
        onReportIssue={onReportIssue}
      />
    </div>
  );
}
