import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, AlertCircle } from "lucide-react";
import { DriverTable, Driver } from "@/components/ui/DriverTable";
import { DriverDetailModal } from "@/components/ui/DriverDetailModal";
import { CreateDriverModal } from "@/components/ui/CreateDriverModal";
import { DocumentPreviewModal } from "@/components/ui/DocumentPreviewModal";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserManagement, useUpdateUserStatus } from "@/lib/api/hooks";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { customToast } from "@/lib/utils/toast";

const AdminDrivers = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isDriverDetailModalOpen, setIsDriverDetailModalOpen] = useState(false);
  const [isCreateDriverModalOpen, setIsCreateDriverModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isDocumentPreviewOpen, setIsDocumentPreviewOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<{
    url: string;
    name: string;
  } | null>(null);

  // API hooks
  const {
    data: driversData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useUserManagement({
    role: "driver",
    status: statusFilter === "all" ? undefined : statusFilter,
    limit: 100,
  });

  const updateUserStatusMutation = useUpdateUserStatus();

  // Transform API data
  // console.log("🔍 AdminDrivers Debug - driversData:", driversData);
  // console.log("🔍 AdminDrivers Debug - driversData structure:", {
  //   hasData: !!driversData,
  //   dataType: typeof driversData,
  //   isArray: Array.isArray(driversData),
  //   dataLength: Array.isArray(driversData) ? driversData.length : "not array",
  //   firstItem: Array.isArray(driversData) ? driversData[0] : "not array",
  // });

  const drivers: Driver[] =
    driversData?.map((user: any) => ({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      license_number: user.driver?.license_number || "N/A",
      license_expiry: user.driver?.license_expiry || "N/A",
      license_type: user.driver?.license_type || "B",
      date_of_birth: user.driver?.date_of_birth || "N/A",
      emergency_contact: user.driver?.emergency_contact || "N/A",
      emergency_phone: user.driver?.emergency_phone || "N/A",
      blood_type: user.driver?.blood_type || "N/A",
      medical_certificate_expiry:
        user.driver?.medical_certificate_expiry || "N/A",
      status: user.driver?.status || "available",
      rating: user.driver?.rating || 0,
      total_deliveries: user.driver?.total_deliveries || 0,
      total_distance_km: user.driver?.total_distance_km || 0,
      driver_number: user.driver?.code_number || "N/A",
      registeredDate: user.created_at,
      lastActive: user.last_login || "Never",
      avatar_url: user.avatar_url,
      is_active: user.is_active,
      is_verified: user.is_verified,
      branch_name: user.branch?.name || user.driver?.branch?.name || "-",
    })) || [];

  console.log("🔍 AdminDrivers Debug - drivers:", drivers);

  // Pagination state (client-side)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const totalItems = drivers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const clampedPage = Math.min(currentPage, totalPages);
  const startIndex = (clampedPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const pagedDrivers = drivers.slice(startIndex, endIndex);

  const handleChangePage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setCurrentPage(nextPage);
  };

  const handleChangePageSize = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Driver handlers
  const handleViewDriverDetails = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsDriverDetailModalOpen(true);
  };

  const handleEditDriver = (driver: Driver) => {
    // TODO: Implement driver edit functionality
    customToast.info("Driver edit functionality coming soon");
  };

  const handleDeleteDriver = async (driverId: string) => {
    try {
      await updateUserStatusMutation.mutateAsync({
        id: driverId,
        data: { is_active: false, reason: "Deleted by admin" },
      });
      customToast.success("Driver deactivated successfully");
      refetch();
    } catch (error) {
      customToast.error("Failed to deactivate driver");
    }
  };

  const handleApproveDriver = async (driverId: string) => {
    try {
      await updateUserStatusMutation.mutateAsync({
        id: driverId,
        data: { is_active: true, reason: "Approved by admin" },
      });
      customToast.success("Driver approved successfully");
      refetch();
    } catch (error) {
      customToast.error("Failed to approve driver");
    }
  };

  // General handlers
  const handleCreateNew = () => {
    setIsCreateDriverModalOpen(true);
  };

  const handleRefresh = async () => {
    await refetch();
    customToast.success("Data refreshed successfully");
  };

  const handleCallDriver = (phone: string) => {
    window.open(`tel:${phone}`, "_self");
  };

  const handleCreateDriverSuccess = () => {
    customToast.success("Driver created successfully");
    setIsCreateDriverModalOpen(false);
    refetch();
  };

  const handlePreviewDocument = (documentUrl: string, documentName: string) => {
    setPreviewDocument({ url: documentUrl, name: documentName });
    setIsDocumentPreviewOpen(true);
  };

  // Loading state
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
        </div>

        {/* Tabs Skeleton */}
        <Skeleton className="h-12 w-full" />

        {/* Table Skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
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
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Driver Management
            </h1>
            <p className="text-muted-foreground">
              Manage and monitor all drivers in the system
            </p>
          </div>
        </div>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <h3 className="font-semibold text-red-800">Error</h3>
                <p className="text-red-600 text-sm mt-1">
                  {error.message || "Failed to load drivers"}
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
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Driver Management
          </h1>
          <p className="text-muted-foreground">
            Manage and monitor all drivers in the system
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading || isFetching}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${
                isLoading || isFetching ? "animate-spin" : ""
              }`}
            />
            {isLoading || isFetching ? "Refreshing..." : "Refresh"}
          </Button>
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Driver
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Status:</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search drivers..."
            className="w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Driver Table */}
      <DriverTable
        drivers={pagedDrivers}
        title=""
        showSearch={false}
        showFilters={false}
        showPagination={false}
        onViewDetails={handleViewDriverDetails}
        onDeleteDriver={handleDeleteDriver}
        onActivateDriver={handleApproveDriver}
        onCallDriver={handleCallDriver}
      />

      {/* Pagination Controls */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-sm text-muted-foreground">
          Showing {totalItems === 0 ? 0 : startIndex + 1}-{endIndex} of{" "}
          {totalItems}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleChangePage(clampedPage - 1)}
            disabled={clampedPage <= 1}
          >
            Previous
          </Button>
          <div className="text-sm">
            Page {clampedPage} / {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleChangePage(clampedPage + 1)}
            disabled={clampedPage >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Modals */}
      {selectedDriver && (
        <DriverDetailModal
          driver={selectedDriver}
          isOpen={isDriverDetailModalOpen}
          onClose={() => {
            setIsDriverDetailModalOpen(false);
            setSelectedDriver(null);
          }}
          onPreviewDocument={handlePreviewDocument}
        />
      )}

      {/* Document Preview Modal */}
      {previewDocument && (
        <DocumentPreviewModal
          isOpen={isDocumentPreviewOpen}
          onClose={() => {
            setIsDocumentPreviewOpen(false);
            setPreviewDocument(null);
          }}
          documentUrl={previewDocument.url}
          documentName={previewDocument.name}
        />
      )}

      {/* Create Driver Modal */}
      <CreateDriverModal
        isOpen={isCreateDriverModalOpen}
        onClose={() => setIsCreateDriverModalOpen(false)}
        onSuccess={handleCreateDriverSuccess}
      />
    </div>
  );
};

export default AdminDrivers;
