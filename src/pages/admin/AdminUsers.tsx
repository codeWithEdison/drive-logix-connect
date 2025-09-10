import React, { useState } from "react";
import { CustomTabs } from "@/components/ui/CustomTabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, UserPlus, RefreshCw, AlertCircle } from "lucide-react";
import { DriverTable, Driver } from "@/components/ui/DriverTable";
import { ClientTable, Client } from "@/components/ui/ClientTable";
import { DriverDetailModal } from "@/components/ui/DriverDetailModal";
import { ClientDetailModal } from "@/components/ui/ClientDetailModal";
import { UserDetailModal } from "@/components/ui/UserDetailModal";
import { UserForm } from "@/components/forms/UserForm";
import ModernModel from "@/components/modal/ModernModel";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserManagement, useUpdateUserStatus } from "@/lib/api/hooks";
import {
  useCreateAdminClient,
  useCreateAdminDriver,
} from "@/lib/api/hooks/adminHooks";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { customToast } from "@/lib/utils/toast";
import { UserRole, BusinessType, LicenseType, Language } from "@/types/shared";

const AdminUsers = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("drivers");
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDriverDetailModalOpen, setIsDriverDetailModalOpen] = useState(false);
  const [isClientDetailModalOpen, setIsClientDetailModalOpen] = useState(false);
  const [isUserDetailModalOpen, setIsUserDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Driver | Client | null>(null);
  const [editingType, setEditingType] = useState<"driver" | "client">("driver");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // API hooks
  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useUserManagement({
    role: roleFilter === "all" ? undefined : roleFilter,
    status: statusFilter === "all" ? undefined : statusFilter,
    limit: 100,
  });

  const updateUserStatusMutation = useUpdateUserStatus();
  const createClientMutation = useCreateAdminClient();
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
    usersData
      ?.filter((user: any) => user.role === "driver")
      .map((user: any) => ({
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
        location: user.driver?.location || "Unknown",
        registeredDate: user.created_at,
        lastActive: user.last_login || "Never",
        avatar_url: user.avatar_url,
        is_active: user.is_active,
        is_verified: user.is_verified,
      })) || [];
  const clients: Client[] =
    usersData
      ?.filter((user: any) => user.role === "client")
      .map((user: any) => ({
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        company_name: user.client?.company_name || "N/A",
        business_type: user.client?.business_type || "individual",
        tax_id: user.client?.tax_id || "N/A",
        address: user.client?.address || "N/A",
        city: user.client?.city || "N/A",
        country: user.client?.country || "N/A",
        postal_code: user.client?.postal_code || "N/A",
        contact_person: user.client?.contact_person || "N/A",
        credit_limit: user.client?.credit_limit || 0,
        payment_terms: user.client?.payment_terms || 30,
        status: user.is_active ? "active" : "inactive",
        location: user.client?.city || "Unknown",
        registeredDate: user.created_at,
        lastActive: user.last_login || "Never",
        totalCargos: user.client?.total_cargos || 0,
        avatar_url: user.avatar_url,
        is_active: user.is_active,
        is_verified: user.is_verified,
      })) || [];

  console.log("🔍 AdminUsers Debug - drivers:", drivers);
  console.log("🔍 AdminUsers Debug - clients:", clients);

  // Driver handlers
  const handleViewDriverDetails = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsDriverDetailModalOpen(true);
  };

  const handleEditDriver = (driver: Driver) => {
    setEditingItem(driver);
    setEditingType("driver");
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

  // Client handlers
  const handleViewClientDetails = (client: Client) => {
    setSelectedClient(client);
    setIsClientDetailModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingItem(client);
    setEditingType("client");
    setIsEditModalOpen(true);
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      await updateUserStatusMutation.mutateAsync({
        id: clientId,
        data: { is_active: false, reason: "Deleted by admin" },
      });
      customToast.success(t("adminUsers.clientDeleted"));
      refetch();
    } catch (error) {
      customToast.error(t("errors.deleteFailed"));
    }
  };

  const handleApproveClient = async (clientId: string) => {
    try {
      await updateUserStatusMutation.mutateAsync({
        id: clientId,
        data: { is_active: true, reason: "Approved by admin" },
      });
      customToast.success(t("adminUsers.clientApproved"));
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

  const handleViewUserDetails = (user: any) => {
    setSelectedUser(user);
    setIsUserDetailModalOpen(true);
  };

  const handleCreateUser = async (userData: any) => {
    try {
      if (userData.role === "client") {
        await createClientMutation.mutateAsync(userData);
        customToast.success(t("adminUsers.userCreated"));
      } else if (userData.role === "driver") {
        await createDriverMutation.mutateAsync(userData);
        customToast.success(t("adminUsers.userCreated"));
      } else {
        throw new Error("Invalid user role");
      }
      setIsCreateModalOpen(false);
      refetch();
    } catch (error) {
      customToast.error(t("errors.createFailed"));
    }
  };

  const handleEditUser = (user: any) => {
    setEditingItem(user);
    setEditingType(user.role);
    setIsEditModalOpen(true);
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

  const tabs = [
    {
      value: "drivers",
      label: t("common.drivers"),
      count: drivers.length,
    },
    {
      value: "clients",
      label: t("common.clients"),
      count: clients.length,
    },
  ];

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
          <label className="text-sm font-medium">{t("common.role")}:</label>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              <SelectItem value="driver">{t("common.driver")}</SelectItem>
              <SelectItem value="client">{t("common.client")}</SelectItem>
              <SelectItem value="admin">{t("common.admin")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
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

      {/* Tabs */}
      <CustomTabs tabs={tabs} value={activeTab} onValueChange={setActiveTab} />

      {/* Tab Content */}
      {activeTab === "drivers" && (
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
      )}

      {activeTab === "clients" && (
        <ClientTable
          clients={clients}
          title=""
          showSearch={false}
          showFilters={false}
          showPagination={false}
          onViewDetails={handleViewClientDetails}
          onDeleteClient={handleDeleteClient}
          onActivateClient={handleApproveClient}
          onCallClient={handleCallUser}
        />
      )}

      {/* Modals */}
      {selectedDriver && (
        <DriverDetailModal
          driver={selectedDriver}
          isOpen={isDriverDetailModalOpen}
          onClose={() => {
            setIsDriverDetailModalOpen(false);
            setSelectedDriver(null);
          }}
        />
      )}

      {selectedClient && (
        <ClientDetailModal
          client={selectedClient}
          isOpen={isClientDetailModalOpen}
          onClose={() => {
            setIsClientDetailModalOpen(false);
            setSelectedClient(null);
          }}
        />
      )}

      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          isOpen={isUserDetailModalOpen}
          onClose={() => {
            setIsUserDetailModalOpen(false);
            setSelectedUser(null);
          }}
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
          isLoading={
            createClientMutation.isPending || createDriverMutation.isPending
          }
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
          isLoading={
            createClientMutation.isPending || createDriverMutation.isPending
          }
          mode="edit"
        />
      </ModernModel>
    </div>
  );
};

export default AdminUsers;
