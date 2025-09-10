import React, { useState } from "react";
import { CustomTabs } from "@/components/ui/CustomTabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, RefreshCw, AlertCircle } from "lucide-react";
import { TruckTable, Truck } from "@/components/ui/TruckTable";
import { TruckDetailModal } from "@/components/ui/TruckDetailModal";
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
import {
  useVehicles,
  useCreateVehicle,
  useUpdateVehicle,
  useApproveVehicle,
} from "@/lib/api/hooks";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { customToast } from "@/lib/utils/toast";

const AdminTrucks = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTruck, setEditingTruck] = useState<Truck | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // API hooks
  const {
    data: vehiclesData,
    isLoading,
    error,
    refetch,
  } = useVehicles({
    status: statusFilter === "all" ? undefined : (statusFilter as any),
    type: typeFilter === "all" ? undefined : (typeFilter as any),
    limit: 100,
  });

  const createVehicleMutation = useCreateVehicle();
  const updateVehicleMutation = useUpdateVehicle();
  const approveVehicleMutation = useApproveVehicle();

  // Transform API data to Truck format
  const trucks: Truck[] =
    vehiclesData?.data?.map((vehicle: any) => ({
      id: vehicle.id,
      model: vehicle.model || vehicle.make + " " + vehicle.model,
      licensePlate: vehicle.license_plate || vehicle.plate_number,
      capacity: vehicle.capacity ? `${vehicle.capacity} tons` : "N/A",
      status: vehicle.status || "available",
      driver: vehicle.driver_name || "Unassigned",
      location: vehicle.current_location || "Unknown",
      lastMaintenance: vehicle.last_maintenance_date || "N/A",
      totalDeliveries: vehicle.total_deliveries || 0,
      fuelLevel: vehicle.fuel_level || 0,
      year: vehicle.year?.toString() || "N/A",
      manufacturer: vehicle.make || vehicle.manufacturer || "Unknown",
      engineType: vehicle.engine_type || "Diesel",
      mileage: vehicle.mileage || vehicle.odometer_reading || 0,
      insuranceExpiry: vehicle.insurance_expiry || "N/A",
      registrationExpiry: vehicle.registration_expiry || "N/A",
      is_active: vehicle.is_active !== false,
    })) || [];

  // Filter trucks based on active tab
  const filteredTrucks = trucks.filter((truck) => {
    switch (activeTab) {
      case "available":
        return truck.status === "available";
      case "in_use":
        return truck.status === "in_use";
      case "maintenance":
        return truck.status === "maintenance";
      case "all":
      default:
        return true;
    }
  });

  // Event handlers
  const handleViewTruckDetails = (truck: Truck) => {
    setSelectedTruck(truck);
    setIsDetailModalOpen(true);
  };

  const handleEditTruck = (truck: Truck) => {
    setEditingTruck(truck);
    setIsEditModalOpen(true);
  };

  const handleDeleteTruck = async (truckId: string) => {
    try {
      // TODO: Implement proper truck deletion API call
      console.log("Deleting truck:", truckId);
      customToast.success(t("adminTrucks.truckDeleted"));
      refetch();
    } catch (error) {
      customToast.error(t("errors.deleteFailed"));
    }
  };

  const handleApproveTruck = async (truckId: string) => {
    try {
      await approveVehicleMutation.mutateAsync({
        id: truckId,
        approved: true,
        reason: "Approved by admin",
      });
      customToast.success(t("adminTrucks.truckApproved"));
      refetch();
    } catch (error) {
      customToast.error(t("errors.approvalFailed"));
    }
  };

  const handleCreateNew = () => {
    setIsCreateModalOpen(true);
  };

  const handleRefresh = () => {
    refetch();
    customToast.success(t("common.refreshed"));
  };

  const handleCallDriver = (phone: string) => {
    window.open(`tel:${phone}`, "_self");
  };

  const handleTrackTruck = (truckId: string) => {
    window.location.href = `/admin/tracking/${truckId}`;
  };

  const handleAddMaintenance = (truckId: string) => {
    window.location.href = `/admin/maintenance/${truckId}`;
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
              {t("adminTrucks.title")}
            </h1>
            <p className="text-muted-foreground">{t("adminTrucks.subtitle")}</p>
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
                  {error.message || t("adminTrucks.loadError")}
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
      value: "all",
      label: t("adminTrucks.allTrucks"),
      count: trucks.length,
    },
    {
      value: "available",
      label: t("adminTrucks.available"),
      count: trucks.filter((t) => t.status === "available").length,
    },
    {
      value: "in_use",
      label: t("adminTrucks.inUse"),
      count: trucks.filter((t) => t.status === "in_use").length,
    },
    {
      value: "maintenance",
      label: t("adminTrucks.maintenance"),
      count: trucks.filter((t) => t.status === "maintenance").length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t("adminTrucks.title")}
          </h1>
          <p className="text-muted-foreground">{t("adminTrucks.subtitle")}</p>
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
            {t("adminTrucks.addNew")}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">{t("common.status")}:</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              <SelectItem value="available">{t("status.available")}</SelectItem>
              <SelectItem value="in_use">{t("status.inUse")}</SelectItem>
              <SelectItem value="maintenance">
                {t("status.maintenance")}
              </SelectItem>
              <SelectItem value="repair">{t("status.repair")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">
            {t("adminTrucks.vehicleType")}:
          </label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              <SelectItem value="truck">{t("adminTrucks.truck")}</SelectItem>
              <SelectItem value="van">{t("adminTrucks.van")}</SelectItem>
              <SelectItem value="pickup">{t("adminTrucks.pickup")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <CustomTabs tabs={tabs} value={activeTab} onValueChange={setActiveTab} />

      {/* Table */}
      <TruckTable
        trucks={filteredTrucks}
        onViewDetails={handleViewTruckDetails}
        onEditTruck={handleEditTruck}
        onDeleteTruck={handleDeleteTruck}
        onAssignDriver={handleApproveTruck}
        onTrackTruck={handleTrackTruck}
        onScheduleMaintenance={handleAddMaintenance}
      />

      {/* Modals */}
      {selectedTruck && (
        <TruckDetailModal
          truck={selectedTruck}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedTruck(null);
          }}
        />
      )}

      {/* Create Truck Modal */}
      <ModernModel
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={t("adminTrucks.createNewTruck")}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="model">{t("adminTrucks.model")}</Label>
            <Input id="model" placeholder={t("adminTrucks.enterModel")} />
          </div>
          <div>
            <Label htmlFor="licensePlate">
              {t("adminTrucks.licensePlate")}
            </Label>
            <Input
              id="licensePlate"
              placeholder={t("adminTrucks.enterLicensePlate")}
            />
          </div>
          <div>
            <Label htmlFor="capacity">{t("adminTrucks.capacity")}</Label>
            <Input id="capacity" placeholder={t("adminTrucks.enterCapacity")} />
          </div>
          <div>
            <Label htmlFor="year">{t("adminTrucks.year")}</Label>
            <Input
              id="year"
              type="number"
              placeholder={t("adminTrucks.enterYear")}
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsCreateModalOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button className="flex-1">{t("adminTrucks.createTruck")}</Button>
          </div>
        </div>
      </ModernModel>

      {/* Edit Truck Modal */}
      <ModernModel
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t("adminTrucks.editTruck")}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="editModel">{t("adminTrucks.model")}</Label>
            <Input
              id="editModel"
              defaultValue={editingTruck?.model || ""}
              placeholder={t("adminTrucks.enterModel")}
            />
          </div>
          <div>
            <Label htmlFor="editLicensePlate">
              {t("adminTrucks.licensePlate")}
            </Label>
            <Input
              id="editLicensePlate"
              defaultValue={editingTruck?.licensePlate || ""}
              placeholder={t("adminTrucks.enterLicensePlate")}
            />
          </div>
          <div>
            <Label htmlFor="editCapacity">{t("adminTrucks.capacity")}</Label>
            <Input
              id="editCapacity"
              defaultValue={editingTruck?.capacity || ""}
              placeholder={t("adminTrucks.enterCapacity")}
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

export default AdminTrucks;
