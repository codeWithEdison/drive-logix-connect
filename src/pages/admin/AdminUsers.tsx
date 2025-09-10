import React, { useState } from "react";
import { CustomTabs } from "@/components/ui/CustomTabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, UserPlus, RefreshCw, AlertCircle } from "lucide-react";
import { DriverTable, Driver } from "@/components/ui/DriverTable";
import { ClientTable, Client } from "@/components/ui/ClientTable";
import { DriverDetailModal } from "@/components/ui/DriverDetailModal";
import { ClientDetailModal } from "@/components/ui/ClientDetailModal";
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
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { customToast } from "@/lib/utils/toast";

const AdminUsers = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("drivers");
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDriverDetailModalOpen, setIsDriverDetailModalOpen] = useState(false);
  const [isClientDetailModalOpen, setIsClientDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Driver | Client | null>(null);
  const [editingType, setEditingType] = useState<"driver" | "client">("driver");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

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

  // Transform API data
  const drivers: Driver[] =
    usersData?.data?.filter((user: any) => user.role === "driver") || [];
  const clients: Client[] =
    usersData?.data?.filter((user: any) => user.role === "client") || [];

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
      label: t("adminUsers.drivers"),
      count: drivers.length,
    },
    {
      value: "clients",
      label: t("adminUsers.clients"),
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

      {/* Filters */}
      <div className="flex gap-4">
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
      </div>

      {/* Tabs */}
      <CustomTabs tabs={tabs} value={activeTab} onValueChange={setActiveTab} />

      {/* Tab Content */}
      {activeTab === "drivers" && (
        <DriverTable
          drivers={drivers}
          onViewDetails={handleViewDriverDetails}
          onDeleteDriver={handleDeleteDriver}
          onActivateDriver={handleApproveDriver}
          onCallDriver={handleCallUser}
        />
      )}

      {activeTab === "clients" && (
        <ClientTable
          clients={clients}
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

      {/* Create User Modal */}
      <ModernModel
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={t("adminUsers.createNewUser")}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="userType">{t("adminUsers.userType")}</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={t("adminUsers.selectUserType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="driver">{t("common.driver")}</SelectItem>
                <SelectItem value="client">{t("common.client")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsCreateModalOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button className="flex-1">{t("adminUsers.createUser")}</Button>
          </div>
        </div>
      </ModernModel>

      {/* Edit User Modal */}
      <ModernModel
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t("adminUsers.editUser")}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="fullName">{t("common.fullName")}</Label>
            <Input
              id="fullName"
              defaultValue={editingItem?.full_name || ""}
              placeholder={t("common.enterFullName")}
            />
          </div>
          <div>
            <Label htmlFor="email">{t("common.email")}</Label>
            <Input
              id="email"
              type="email"
              defaultValue={editingItem?.email || ""}
              placeholder={t("common.enterEmail")}
            />
          </div>
          <div>
            <Label htmlFor="phone">{t("common.phone")}</Label>
            <Input
              id="phone"
              defaultValue={editingItem?.phone || ""}
              placeholder={t("common.enterPhone")}
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsEditModalOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button className="flex-1">{t("common.save")}</Button>
          </div>
        </div>
      </ModernModel>
    </div>
  );
};

export default AdminUsers;
