import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, AlertCircle } from "lucide-react";
import { DriverTable, Driver } from "@/components/ui/DriverTable";
import { DriverDetailModal } from "@/components/ui/DriverDetailModal";
import { DocumentPreviewModal } from "@/components/ui/DocumentPreviewModal";
import { UserForm } from "@/components/forms/UserForm";
import ModernModel from "@/components/modal/ModernModel";
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
import { useCreateAdminDriver } from "@/lib/api/hooks/adminHooks";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { customToast } from "@/lib/utils/toast";

const AdminUsers = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isDriverDetailModalOpen, setIsDriverDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Driver | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isDocumentPreviewOpen, setIsDocumentPreviewOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<{
    url: string;
    name: string;
  } | null>(null);

  // API hooks
  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useUserManagement({
    role: "driver",
    status: statusFilter === "all" ? undefined : statusFilter,
    limit: 100,
  });

  const updateUserStatusMutation = useUpdateUserStatus();
  const createDriverMutation = useCreateAdminDriver();

  // Transform API data
  // console.log("🔍 AdminUsers Debug - usersData:", usersData);
  // console.log("🔍 AdminUsers Debug - usersData structure:", {
  //   hasData: !!usersData,
  //   dataType: typeof usersData,
  //   isArray: Array.isArray(usersData),
  //   dataLength: Array.isArray(usersData) ? usersData.length : "not array",
  //   firstItem: Array.isArray(usersData) ? usersData[0] : "not array",
  // });

  const drivers: Driver[] =
    usersData?.map((user: any) => ({
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
    })) || [];

  console.log("🔍 AdminUsers Debug - drivers:", drivers);

  // Driver handlers
  const handleViewDriverDetails = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsDriverDetailModalOpen(true);
  };

  const handleEditDriver = (driver: Driver) => {
    setEditingItem(driver);
    setIsEditModalOpen(true);
  };

  const handleDeleteDriver = async (driverId: string) => {
    try {
      await updateUserStatusMutation.mutateAsync({
        id: driverId,
        data: { is_active: false, reason: "Deleted by admin" },
      });
      customToast.success(t("adminUsers.driverDeleted"));
      refetch();
    } catch (error) {
      customToast.error(t("errors.deleteFailed"));
    }
  };

  const handleApproveDriver = async (driverId: string) => {
    try {
      await updateUserStatusMutation.mutateAsync({
        id: driverId,
        data: { is_active: true, reason: "Approved by admin" },
      });
      customToast.success(t("adminUsers.driverApproved"));
      refetch();
    } catch (error) {
      customToast.error(t("errors.approvalFailed"));
    }
  };

  // General handlers
  const handleCreateNew = () => {
    setIsCreateModalOpen(true);
  };

  const handleRefresh = () => {
    refetch();
    customToast.success(t("common.refreshed"));
  };

  const handleCallUser = (phone: string) => {
    window.open(`tel:${phone}`, "_self");
  };

  const handleCreateUser = async (userData: any) => {
    try {
      await createDriverMutation.mutateAsync(userData);
      customToast.success(t("adminUsers.userCreated"));
      setIsCreateModalOpen(false);
      refetch();
    } catch (error) {
      customToast.error(t("errors.createFailed"));
    }
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
              {t("adminUsers.title")}
            </h1>
            <p className="text-muted-foreground">{t("adminUsers.subtitle")}</p>
          </div>
        </div>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <h3 className="font-semibold text-red-800">
                  {t("common.error")}
                </h3>
                <p className="text-red-600 text-sm mt-1">
                  {error.message || t("adminUsers.loadError")}
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
            {t("adminUsers.title")}
          </h1>
          <p className="text-muted-foreground">{t("adminUsers.subtitle")}</p>
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
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            {t("adminUsers.addNew")}
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">{t("common.status")}:</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              <SelectItem value="active">{t("status.active")}</SelectItem>
              <SelectItem value="inactive">{t("status.inactive")}</SelectItem>
              <SelectItem value="pending">{t("status.pending")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder={t("common.search")}
            className="w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Driver Table */}
      <DriverTable
        drivers={drivers}
        title=""
        showSearch={false}
        showFilters={false}
        showPagination={false}
        onViewDetails={handleViewDriverDetails}
        onDeleteDriver={handleDeleteDriver}
        onActivateDriver={handleApproveDriver}
        onCallDriver={handleCallUser}
      />

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

      {/* Create User Modal */}
      <ModernModel
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={t("adminUsers.createNewUser")}
      >
        <UserForm
          onSubmit={handleCreateUser}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={createDriverMutation.isPending}
          mode="create"
        />
      </ModernModel>

      {/* Edit User Modal */}
      <ModernModel
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t("adminUsers.editUser")}
      >
        <UserForm
          initialData={editingItem as any}
          onSubmit={handleCreateUser}
          onCancel={() => setIsEditModalOpen(false)}
          isLoading={createDriverMutation.isPending}
          mode="edit"
        />
      </ModernModel>
    </div>
  );
};

export default AdminUsers;
