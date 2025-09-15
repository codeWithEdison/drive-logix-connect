import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus,
  RefreshCw,
  AlertCircle,
  Eye,
  Edit,
  X,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  User,
  Calendar,
  MapPin,
  Package,
  Search,
  Filter,
  Phone,
  Navigation,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreVertical,
  Download,
} from "lucide-react";
import {
  useDeliveryAssignments,
  useCreateAssignment,
  useUpdateDeliveryAssignment,
  useCancelAssignment,
} from "@/lib/api/hooks/assignmentHooks";
import { useAdminDrivers } from "@/lib/api/hooks/adminHooks";
import { useVehicles } from "@/lib/api/hooks/vehicleHooks";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { customToast } from "@/lib/utils/toast";
import ModernModel from "@/components/modal/ModernModel";
import AssignmentModal from "@/components/admin/AssignmentModal";

export default function AdminAssignments() {
  const { t } = useLanguage();
  const { user } = useAuth();

  // State management
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [assignmentStatusFilter, setAssignmentStatusFilter] =
    useState<string>("all");
  const [driverFilter, setDriverFilter] = useState<string>("all-drivers");
  const [vehicleFilter, setVehicleFilter] = useState<string>("all-vehicles");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Data hooks for dropdowns
  const { data: driversData, isLoading: driversLoading } = useAdminDrivers({
    limit: 100,
  });
  const { data: vehiclesData, isLoading: vehiclesLoading } = useVehicles({
    limit: 100,
  });

  // API hooks
  const {
    data: assignmentsResponse,
    isLoading,
    error,
    refetch,
  } = useDeliveryAssignments({
    status:
      assignmentStatusFilter === "all"
        ? undefined
        : (assignmentStatusFilter as any),
    driver_id:
      driverFilter && driverFilter !== "all-drivers" ? driverFilter : undefined,
    vehicle_id:
      vehicleFilter && vehicleFilter !== "all-vehicles"
        ? vehicleFilter
        : undefined,
    page: currentPage,
    limit: 10,
  });

  // Assignment mutations
  const createAssignmentMutation = useCreateAssignment();
  const updateAssignmentMutation = useUpdateDeliveryAssignment();
  const cancelAssignmentMutation = useCancelAssignment();

  // Extract data and pagination info
  const assignmentsData = useMemo(
    () => (assignmentsResponse as any)?.data || [],
    [assignmentsResponse]
  );
  const pagination = useMemo(
    () =>
      (assignmentsResponse as any)?.meta?.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    [assignmentsResponse]
  );

  // Event handlers
  const handleCreateAssignment = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditAssignment = (assignment: any) => {
    setSelectedAssignment(assignment);
    setIsEditModalOpen(true);
  };

  const handleViewAssignment = (assignment: any) => {
    setSelectedAssignment(assignment);
    setIsDetailModalOpen(true);
  };

  const handleCancelAssignment = async (assignmentId: string) => {
    try {
      await cancelAssignmentMutation.mutateAsync(assignmentId);
      customToast.success(t("adminAssignments.cancelledSuccessfully"));
      refetch();
    } catch (error: any) {
      customToast.error(error.message || t("adminAssignments.cancelFailed"));
    }
  };

  const handleRefresh = () => {
    refetch();
    customToast.success(t("common.refreshed"));
  };

  const handleAssignmentCreated = () => {
    setIsCreateModalOpen(false);
    refetch();
  };

  const handleAssignmentUpdated = () => {
    setIsEditModalOpen(false);
    setSelectedAssignment(null);
    refetch();
  };

  // Status badge component with tooltips
  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
        description: "Assignment is waiting for driver response",
      },
      accepted: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        description: "Driver has accepted the assignment",
      },
      rejected: {
        color: "bg-red-100 text-red-800",
        icon: XCircle,
        description: "Driver has rejected the assignment",
      },
      cancelled: {
        color: "bg-gray-100 text-gray-800",
        icon: X,
        description: "Assignment has been cancelled",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className={`${config.color} border-0`}>
              <Icon className="h-3 w-3 mr-1" />
              {t(`assignment.status.${status}`)}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{config.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate time until expiry
  const getTimeUntilExpiry = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();

    if (diffMs <= 0) return t("assignment.expired");

    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h`;
    if (diffHours > 0) return `${diffHours}h ${diffMins % 60}m`;
    return `${diffMins}m`;
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("adminAssignments.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("adminAssignments.subtitle")}
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t("adminAssignments.loadError")}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t("adminAssignments.loadErrorDescription")}
              </p>
              <Button onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("common.retry")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t("adminAssignments.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("adminAssignments.subtitle")}
          </p>
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
          <Button onClick={handleCreateAssignment}>
            <Plus className="h-4 w-4 mr-2" />
            {t("adminAssignments.createAssignment")}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600">
                  Total Assignments
                </p>
                <p className="text-lg md:text-2xl font-bold text-gray-900">
                  {pagination.total || 0}
                </p>
              </div>
              <Package className="h-6 w-6 md:h-8 md:w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600">
                  Pending
                </p>
                <p className="text-lg md:text-2xl font-bold text-gray-900">
                  {
                    assignmentsData.filter(
                      (a) => a.assignment_status === "pending"
                    ).length
                  }
                </p>
              </div>
              <Clock className="h-6 w-6 md:h-8 md:w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600">
                  Accepted
                </p>
                <p className="text-lg md:text-2xl font-bold text-gray-900">
                  {
                    assignmentsData.filter(
                      (a) => a.assignment_status === "accepted"
                    ).length
                  }
                </p>
              </div>
              <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600">
                  Rejected/Cancelled
                </p>
                <p className="text-lg md:text-2xl font-bold text-gray-900">
                  {
                    assignmentsData.filter((a) =>
                      ["rejected", "cancelled"].includes(a.assignment_status)
                    ).length
                  }
                </p>
              </div>
              <XCircle className="h-6 w-6 md:h-8 md:w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by cargo number, driver name, or vehicle..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Status Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Assignment Status
                </label>
                <Select
                  value={assignmentStatusFilter}
                  onValueChange={setAssignmentStatusFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Assignment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key="all" value="all">
                      All Assignment Status
                    </SelectItem>
                    <SelectItem key="pending" value="pending">
                      Pending
                    </SelectItem>
                    <SelectItem key="accepted" value="accepted">
                      Accepted
                    </SelectItem>
                    <SelectItem key="rejected" value="rejected">
                      Rejected
                    </SelectItem>
                    <SelectItem key="expired" value="expired">
                      Expired
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Driver
                </label>
                <Select value={driverFilter} onValueChange={setDriverFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Driver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key="all-drivers" value="all-drivers">
                      All Drivers
                    </SelectItem>
                    {driversLoading ? (
                      <SelectItem
                        key="loading-drivers"
                        value="loading-drivers"
                        disabled
                      >
                        Loading drivers...
                      </SelectItem>
                    ) : (
                      (Array.isArray(driversData)
                        ? driversData
                        : (driversData as any)?.data || []
                      )?.map((driver: any) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.user?.full_name || driver.name} -{" "}
                          {driver.user?.phone || driver.phone}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Vehicle
                </label>
                <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key="all-vehicles" value="all-vehicles">
                      All Vehicles
                    </SelectItem>
                    {vehiclesLoading ? (
                      <SelectItem
                        key="loading-vehicles"
                        value="loading-vehicles"
                        disabled
                      >
                        Loading vehicles...
                      </SelectItem>
                    ) : (
                      (Array.isArray(vehiclesData)
                        ? vehiclesData
                        : (vehiclesData as any)?.data || []
                      )?.map((vehicle: any) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.make} {vehicle.model} -{" "}
                          {vehicle.plate_number}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setAssignmentStatusFilter("all");
                  setDriverFilter("all-drivers");
                  setVehicleFilter("all-vehicles");
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Clear All Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignments Table - Desktop */}
      <div className="w-full">
        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden hidden md:block w-full">
          <CardHeader className="pb-4">
            <CardTitle className="text-gray-900">
              {t("adminAssignments.assignmentsTable")}
              {pagination.total > 0 && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({pagination.total} {t("common.total")})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-4 p-6">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : assignmentsData.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {t("adminAssignments.noAssignments")}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {t("adminAssignments.noAssignmentsDescription")}
                </p>
                <Button onClick={handleCreateAssignment}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("adminAssignments.createFirstAssignment")}
                </Button>
              </div>
            ) : (
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
                        Driver
                      </TableHead>
                      <TableHead className="text-xs font-medium text-gray-600 w-48">
                        Vehicle
                      </TableHead>
                      <TableHead className="text-xs font-medium text-gray-600 w-24">
                        Status
                      </TableHead>
                      <TableHead className="text-xs font-medium text-gray-600 w-32">
                        Assigned At
                      </TableHead>
                      <TableHead className="text-xs font-medium text-gray-600 w-32">
                        Expires At
                      </TableHead>
                      <TableHead className="text-xs font-medium text-gray-600 w-20">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignmentsData.map((assignment: any, index: number) => (
                      <TableRow
                        key={assignment.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleViewAssignment(assignment)}
                      >
                        <TableCell className="text-sm text-gray-500 font-medium">
                          {(currentPage - 1) * 10 + index + 1}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {assignment.cargo?.cargo_number ||
                                `#${assignment.id.slice(-8)}`}
                            </p>
                            <p className="text-xs text-blue-600 font-medium">
                              {assignment.cargo?.type || "General"}
                            </p>
                            {assignment.cargo?.weight_kg && (
                              <p className="text-xs text-gray-500">
                                {assignment.cargo.weight_kg}kg
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {assignment.driver?.user?.full_name || "N/A"}
                            </p>
                            {assignment.driver?.user?.phone && (
                              <p className="text-xs text-gray-400">
                                {assignment.driver.user.phone}
                              </p>
                            )}
                            {assignment.driver?.rating && (
                              <p className="text-xs text-yellow-600">
                                ⭐ {assignment.driver.rating}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {assignment.vehicle?.plate_number || "N/A"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {assignment.vehicle?.make}{" "}
                              {assignment.vehicle?.model}
                            </p>
                            {assignment.vehicle?.type && (
                              <p className="text-xs text-gray-400">
                                {assignment.vehicle.type}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={assignment.assignment_status} />
                          {assignment.assignment_status === "pending" &&
                            assignment.expires_at && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {t("assignment.expiresIn")}:{" "}
                                {getTimeUntilExpiry(assignment.expires_at)}
                              </div>
                            )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {assignment.assigned_at
                              ? formatDate(assignment.assigned_at)
                              : "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {assignment.expires_at
                              ? formatDate(assignment.expires_at)
                              : "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
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
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewAssignment(assignment);
                                }}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditAssignment(assignment);
                                }}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit Assignment
                              </DropdownMenuItem>
                              {assignment.assignment_status === "pending" && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelAssignment(assignment.id);
                                  }}
                                  className="text-red-600"
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Cancel Assignment
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <div className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * 10 + 1} to{" "}
                  {Math.min(currentPage * 10, pagination.total)} of{" "}
                  {pagination.total} results
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
                    {Array.from(
                      { length: Math.min(5, pagination.totalPages) },
                      (_, i) => {
                        const page =
                          Math.max(
                            1,
                            Math.min(pagination.totalPages - 4, currentPage - 2)
                          ) + i;
                        return (
                          <Button
                            key={page}
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        );
                      }
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(pagination.totalPages)}
                    disabled={currentPage === pagination.totalPages}
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t("adminAssignments.assignmentsTable")}
          </h2>
        </div>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : assignmentsData.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t("adminAssignments.noAssignments")}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t("adminAssignments.noAssignmentsDescription")}
            </p>
            <Button onClick={handleCreateAssignment}>
              <Plus className="h-4 w-4 mr-2" />
              {t("adminAssignments.createFirstAssignment")}
            </Button>
          </div>
        ) : (
          <>
            {assignmentsData.map((assignment: any, index: number) => (
              <Card
                key={assignment.id}
                className="mb-4 cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/30 to-white"
                onClick={() => handleViewAssignment(assignment)}
              >
                <CardContent className="p-4">
                  {/* Header Section */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white bg-blue-600 px-2 py-1 rounded-full shadow-sm">
                            #{(currentPage - 1) * 10 + index + 1}
                          </span>
                          <Package className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {assignment.cargo?.cargo_number ||
                              `#${assignment.id.slice(-8)}`}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="secondary"
                              className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 border-0"
                            >
                              {assignment.cargo?.type || "General"}
                            </Badge>
                            <StatusBadge
                              status={assignment.assignment_status}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Driver Information */}
                      <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded-lg">
                        <User className="h-4 w-4 text-gray-600" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {assignment.driver?.user?.full_name || "N/A"}
                          </p>
                          {assignment.driver?.user?.phone && (
                            <p className="text-xs text-gray-600 truncate">
                              {assignment.driver.user.phone}
                            </p>
                          )}
                          {assignment.driver?.rating && (
                            <p className="text-xs text-yellow-600">
                              ⭐ {assignment.driver.rating}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Vehicle & Status Info */}
                    <div className="flex flex-col items-end gap-2 ml-3">
                      <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 rounded-lg">
                        <Truck className="h-3 w-3 text-orange-600" />
                        <span className="text-xs font-medium text-orange-700">
                          {assignment.vehicle?.plate_number || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-lg">
                        <Calendar className="h-3 w-3 text-green-600" />
                        <span className="text-xs font-medium text-green-700">
                          {assignment.assigned_at
                            ? formatDate(assignment.assigned_at)
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Route Information */}
                  <div className="space-y-3 mb-4">
                    {/* Cargo Details */}
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Package className="h-3 w-3 text-white" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">
                            Cargo Details
                          </p>
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {assignment.cargo?.weight_kg}kg •{" "}
                            {assignment.cargo?.type || "General"}
                          </p>
                          {assignment.cargo?.pickup_address && (
                            <p className="text-xs text-gray-600">
                              📍 {assignment.cargo.pickup_address}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Details */}
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <Truck className="h-3 w-3 text-white" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">
                            Vehicle Details
                          </p>
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {assignment.vehicle?.make}{" "}
                            {assignment.vehicle?.model}
                          </p>
                          {assignment.vehicle?.type && (
                            <p className="text-xs text-gray-600">
                              🚛 {assignment.vehicle.type}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {assignment.assignment_status === "pending" &&
                        assignment.expires_at
                          ? `Expires: ${getTimeUntilExpiry(
                              assignment.expires_at
                            )}`
                          : `Status: ${assignment.assignment_status}`}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewAssignment(assignment);
                        }}
                        className="flex items-center gap-1 text-xs px-3 py-1.5"
                      >
                        <Eye className="h-3 w-3" />
                        Details
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditAssignment(assignment);
                        }}
                        className="flex items-center gap-1 text-xs px-3 py-1.5"
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>

                      {assignment.assignment_status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelAssignment(assignment.id);
                          }}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700 text-xs px-3 py-1.5"
                        >
                          <X className="h-3 w-3" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Mobile Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-500">
                  {(currentPage - 1) * 10 + 1}-
                  {Math.min(currentPage * 10, pagination.total)} of{" "}
                  {pagination.total}
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
                    {currentPage} / {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <AssignmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleAssignmentCreated}
        mode="create"
      />

      <AssignmentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleAssignmentUpdated}
        mode="edit"
        assignment={selectedAssignment}
      />

      {/* Assignment Detail Modal */}
      <ModernModel
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={t("adminAssignments.assignmentDetails")}
      >
        {selectedAssignment && (
          <div className="space-y-6">
            {/* Assignment Header with Actions */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedAssignment.cargo?.cargo_number ||
                      `#${selectedAssignment.id.slice(-8)}`}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Assignment ID: {selectedAssignment.id.slice(-8)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedAssignment.assignment_status} />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      handleEditAssignment(selectedAssignment);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  {selectedAssignment.assignment_status === "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsDetailModalOpen(false);
                        handleCancelAssignment(selectedAssignment.id);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <User className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        Driver
                      </p>
                      <p className="text-lg font-semibold text-green-900">
                        {selectedAssignment.driver?.user?.full_name || "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Truck className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-orange-800">
                        Vehicle
                      </p>
                      <p className="text-lg font-semibold text-orange-900">
                        {selectedAssignment.vehicle?.plate_number || "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-800">
                        Assigned
                      </p>
                      <p className="text-lg font-semibold text-purple-900">
                        {selectedAssignment.assigned_at
                          ? formatDate(selectedAssignment.assigned_at).split(
                              ","
                            )[0]
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cargo Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {t("adminAssignments.cargoDetails")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium text-gray-700">
                        Cargo Number:
                      </span>
                      <p className="text-gray-900">
                        {selectedAssignment.cargo?.cargo_number || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Type:</span>
                      <p className="text-gray-900">
                        {selectedAssignment.cargo?.type || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Weight:</span>
                      <p className="text-gray-900">
                        {selectedAssignment.cargo?.weight_kg}kg
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Priority:
                      </span>
                      <Badge variant="outline" className="ml-2">
                        {selectedAssignment.cargo?.priority || "Normal"}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium text-gray-700">
                        Pickup Address:
                      </span>
                      <p className="text-gray-900">
                        {selectedAssignment.cargo?.pickup_address || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Destination:
                      </span>
                      <p className="text-gray-900">
                        {selectedAssignment.cargo?.destination_address || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Distance:
                      </span>
                      <p className="text-gray-900">
                        {selectedAssignment.cargo?.distance_km}km
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Estimated Cost:
                      </span>
                      <p className="text-gray-900">
                        RWF {selectedAssignment.cargo?.estimated_cost || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Driver Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {t("adminAssignments.driverDetails")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium text-gray-700">Name:</span>
                      <p className="text-gray-900">
                        {selectedAssignment.driver?.user?.full_name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Phone:</span>
                      <p className="text-gray-900">
                        {selectedAssignment.driver?.user?.phone || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Email:</span>
                      <p className="text-gray-900">
                        {selectedAssignment.driver?.user?.email || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        License Number:
                      </span>
                      <p className="text-gray-900">
                        {selectedAssignment.driver?.license_number || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium text-gray-700">Rating:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-600">⭐</span>
                        <p className="text-gray-900">
                          {selectedAssignment.driver?.rating || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Total Deliveries:
                      </span>
                      <p className="text-gray-900">
                        {selectedAssignment.driver?.total_deliveries || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <StatusBadge status={selectedAssignment.driver?.status} />
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        License Type:
                      </span>
                      <p className="text-gray-900">
                        {selectedAssignment.driver?.license_type || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  {t("adminAssignments.vehicleDetails")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium text-gray-700">
                        Make & Model:
                      </span>
                      <p className="text-gray-900">
                        {selectedAssignment.vehicle?.make}{" "}
                        {selectedAssignment.vehicle?.model}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Plate Number:
                      </span>
                      <p className="text-gray-900">
                        {selectedAssignment.vehicle?.plate_number || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Type:</span>
                      <p className="text-gray-900">
                        {selectedAssignment.vehicle?.type || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Capacity:
                      </span>
                      <p className="text-gray-900">
                        {selectedAssignment.vehicle?.capacity_kg ||
                          selectedAssignment.vehicle?.capacity}
                        kg
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium text-gray-700">Year:</span>
                      <p className="text-gray-900">
                        {selectedAssignment.vehicle?.year || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Volume Capacity:
                      </span>
                      <p className="text-gray-900">
                        {selectedAssignment.vehicle?.capacity_volume || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <StatusBadge
                        status={selectedAssignment.vehicle?.status}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assignment Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {t("adminAssignments.assignmentTimeline")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        {t("adminAssignments.assignedAt")}:
                      </span>
                      <p className="text-gray-900">
                        {selectedAssignment.assigned_at
                          ? formatDate(selectedAssignment.assigned_at)
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {selectedAssignment.driver_responded_at && (
                    <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          {t("adminAssignments.driverRespondedAt")}:
                        </span>
                        <p className="text-gray-900">
                          {formatDate(selectedAssignment.driver_responded_at)}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedAssignment.expires_at && (
                    <div className="flex items-center gap-4 p-3 bg-yellow-50 rounded-lg">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Clock className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          {t("adminAssignments.expiresAt")}:
                        </span>
                        <p className="text-gray-900">
                          {formatDate(selectedAssignment.expires_at)}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedAssignment.notes && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium text-gray-700">
                        {t("adminAssignments.notes")}:
                      </span>
                      <p className="text-gray-900 mt-1">
                        {selectedAssignment.notes}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleEditAssignment(selectedAssignment);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Assignment
              </Button>
              {selectedAssignment.assignment_status === "pending" && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleCancelAssignment(selectedAssignment.id);
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel Assignment
                </Button>
              )}
            </div>
          </div>
        )}
      </ModernModel>
    </div>
  );
}
