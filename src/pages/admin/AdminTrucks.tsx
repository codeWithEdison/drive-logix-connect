import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CustomTabs } from "@/components/ui/CustomTabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Filter,
  Truck as TruckIcon,
} from "lucide-react";
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
import { VehicleService } from "@/lib/api/services/vehicleService";
import { useBranches } from "@/lib/api/hooks/branchHooks";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { customToast } from "@/lib/utils/toast";
import { CreateVehicleRequest, VehicleType, FuelType, VehicleStatus } from "@/types/shared";
import { toast } from "@/hooks/use-toast";
import VehicleSyncModal, {
  VehicleSyncRow,
} from "@/components/vehicles/VehicleSyncModal";
import { getErrorMessage } from "@/lib/utils/frontend";

const AdminTrucks = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncRows, setSyncRows] = useState<VehicleSyncRow[]>([]);
  const [isPushing, setIsPushing] = useState(false);
  const [editingTruck, setEditingTruck] = useState<Truck | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Form state for creating vehicles
  const [createFormData, setCreateFormData] = useState<CreateVehicleRequest>({
    plate_number: "",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
    capacity_kg: 0,
    capacity_volume: 0,
    fuel_type: FuelType.DIESEL,
    fuel_efficiency: 0,
    type: VehicleType.TRUCK,
    status: "active" as VehicleStatus,
    insurance_expiry: "",
    registration_expiry: "",
    last_maintenance_date: "",
    next_maintenance_date: "",
    total_distance_km: 0,
    branch_id: user?.branch_id,
    device_imei: "",
    jimi_device_id: "",
    gps_provider: "manual",
    gps_device_status: "offline",
    sim_number: "",
    device_model: "",
    device_model_alias: "",
    vehicle_icon: "",
    vin_number: "",
    engine_number: "",
    device_expiration: "",
    device_activation_time: "",
    device_remark: "",
    device_name: "",
    driver_name: "",
    driver_phone: "",
  });
  const [isCreatingVehicle, setIsCreatingVehicle] = useState(false);
  const [isUpdatingVehicle, setIsUpdatingVehicle] = useState(false);

  // Form state for editing vehicles
  const [editFormData, setEditFormData] = useState<CreateVehicleRequest>({
    plate_number: "",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
    capacity_kg: 0,
    capacity_volume: 0,
    fuel_type: FuelType.DIESEL,
    fuel_efficiency: 0,
    type: VehicleType.TRUCK,
    status: "active" as VehicleStatus,
    insurance_expiry: "",
    registration_expiry: "",
    last_maintenance_date: "",
    next_maintenance_date: "",
    total_distance_km: 0,
    branch_id: user?.branch_id,
    device_imei: "",
    jimi_device_id: "",
    gps_provider: "manual",
    gps_device_status: "offline",
    sim_number: "",
    device_model: "",
    device_model_alias: "",
    vehicle_icon: "",
    vin_number: "",
    engine_number: "",
    device_expiration: "",
    device_activation_time: "",
    device_remark: "",
    device_name: "",
    driver_name: "",
    driver_phone: "",
  });

  // API hooks
  const {
    data: vehiclesResponse,
    isLoading,
    error,
    refetch,
  } = useVehicles({
    status: statusFilter === "all" ? undefined : (statusFilter as any),
    type: typeFilter === "all" ? undefined : (typeFilter as any),
    search: searchTerm || undefined,
    page: currentPage,
    limit: pageSize,
  });

  const createVehicleMutation = useCreateVehicle();
  const updateVehicleMutation = useUpdateVehicle();
  const approveVehicleMutation = useApproveVehicle();

  // Fetch branches for branch name mapping
  const { data: branchesResponse } = useBranches({ limit: 100 });

  // Create branch ID to name mapping
  const branchMap = useMemo(() => {
    const branches = branchesResponse?.branches || [];
    const map = new Map();
    branches.forEach((branch: any) => {
      map.set(branch.id, branch.name);
    });
    return map;
  }, [branchesResponse]);

  // Extract data and pagination info from API response
  const vehiclesData = useMemo(
    () => (vehiclesResponse as any)?.data?.vehicles || [],
    [vehiclesResponse]
  );

  const pagination = useMemo(
    () =>
      (vehiclesResponse as any)?.data?.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    [vehiclesResponse]
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, typeFilter, searchTerm, pageSize]);

  // Transform API data to Truck format
  const trucks: Truck[] =
    vehiclesData?.map((vehicle: any) => ({
      id: vehicle.id,
      model: vehicle.model || `${vehicle.make} ${vehicle.model}`,
      licensePlate: vehicle.plate_number,
      capacity: vehicle.capacity_kg ? `${vehicle.capacity_kg} kg` : "N/A",
      status: vehicle.status || "active",
      driver: "Unassigned", // Will be updated when driver assignment is implemented
      location: "Unknown", // Will be updated when GPS tracking is implemented
      lastMaintenance: vehicle.last_maintenance_date
        ? new Date(vehicle.last_maintenance_date).toLocaleDateString()
        : "N/A",
      totalDeliveries: 0, // Will be updated when delivery tracking is implemented
      fuelLevel: 0, // Will be updated when fuel tracking is implemented
      year: vehicle.year?.toString() || "N/A",
      manufacturer: vehicle.make || "Unknown",
      engineType: vehicle.fuel_type || "Diesel",
      mileage: parseFloat(vehicle.total_distance_km) || 0,
      insuranceExpiry: vehicle.insurance_expiry
        ? new Date(vehicle.insurance_expiry).toLocaleDateString()
        : "N/A",
      insuranceExpiryISO: vehicle.insurance_expiry
        ? new Date(vehicle.insurance_expiry).toISOString().split("T")[0]
        : null,
      registrationExpiry: vehicle.registration_expiry
        ? new Date(vehicle.registration_expiry).toLocaleDateString()
        : "N/A",
      registrationExpiryISO: vehicle.registration_expiry
        ? new Date(vehicle.registration_expiry).toISOString().split("T")[0]
        : null,
      is_active: vehicle.status === "active",
      color: vehicle.color || "Unknown",
      fuelEfficiency: vehicle.fuel_efficiency || "N/A",
      capacityVolume: vehicle.capacity_volume || 0,
      nextMaintenance: vehicle.next_maintenance_date
        ? new Date(vehicle.next_maintenance_date).toLocaleDateString()
        : "N/A",
      // Additional fields from API response
      vehicleType: vehicle.type || "truck",
      branchId: vehicle.branch_id,
      branchName: branchMap.get(vehicle.branch_id) || "Unknown Branch",
      createdAt: vehicle.created_at,
      updatedAt: vehicle.updated_at,
    })) || [];

  console.log("🚛 AdminTrucks - vehiclesResponse:", vehiclesResponse);
  console.log("🚛 AdminTrucks - vehiclesData:", vehiclesData);
  console.log("🚛 AdminTrucks - pagination:", pagination);
  console.log("🚛 AdminTrucks - trucks:", trucks);

  // Get current count based on selected status filter
  const currentCount = useMemo(() => {
    return pagination.total; // This will be the total for the current filter
  }, [pagination.total]);

  // Status tabs configuration
  const statusTabs = [
    { key: "all", label: t("common.all") },
    { key: "active", label: t("status.active") },
    { key: "maintenance", label: t("status.maintenance") },
  ];

  // Event handlers
  const handleViewTruckDetails = (truck: Truck) => {
    setSelectedTruck(truck);
    setIsDetailModalOpen(true);
  };

  const handleEditTruck = (truck: Truck) => {
    setEditingTruck(truck);

    console.log("🚛 Editing truck data:", {
      truck,
      insuranceExpiryISO: truck.insuranceExpiryISO,
      registrationExpiryISO: truck.registrationExpiryISO,
    });

    // Populate edit form with truck data
    // Get full vehicle data from API if available
    const vehicleData = vehiclesData.find((v: any) => v.id === truck.id);
    setEditFormData({
      plate_number: truck.licensePlate || "",
      make: truck.manufacturer || "",
      model: truck.model || "",
      year: parseInt(truck.year) || new Date().getFullYear(),
      color: truck.color || "",
      capacity_kg: parseInt(truck.capacity?.replace(" kg", "") || "0") || 0,
      capacity_volume: truck.capacityVolume || 0,
      fuel_type: (truck.engineType as FuelType) || FuelType.DIESEL,
      fuel_efficiency: parseFloat(truck.fuelEfficiency?.toString() || "0") || 0,
      type: (truck.vehicleType as VehicleType) || VehicleType.TRUCK,
      status: (vehicleData?.status || truck.status || "active") as VehicleStatus,
      insurance_expiry: truck.insuranceExpiryISO || "",
      registration_expiry: truck.registrationExpiryISO || "",
      last_maintenance_date: vehicleData?.last_maintenance_date
        ? new Date(vehicleData.last_maintenance_date).toISOString().split("T")[0]
        : "",
      next_maintenance_date: vehicleData?.next_maintenance_date
        ? new Date(vehicleData.next_maintenance_date).toISOString().split("T")[0]
        : "",
      total_distance_km: vehicleData?.total_distance_km || 0,
      branch_id: truck.branchId || user?.branch_id,
      device_imei: vehicleData?.device_imei || "",
      jimi_device_id: vehicleData?.jimi_device_id || "",
      gps_provider: (vehicleData?.gps_provider || "manual") as "jimi" | "manual",
      gps_device_status: (vehicleData?.gps_device_status || "offline") as "online" | "offline" | "stale",
      sim_number: vehicleData?.sim_number || "",
      device_model: vehicleData?.device_model || "",
      device_model_alias: vehicleData?.device_model_alias || "",
      vehicle_icon: vehicleData?.vehicle_icon || "",
      vin_number: vehicleData?.vin_number || "",
      engine_number: vehicleData?.engine_number || "",
      device_expiration: vehicleData?.device_expiration
        ? new Date(vehicleData.device_expiration).toISOString().slice(0, 16)
        : "",
      device_activation_time: vehicleData?.device_activation_time
        ? new Date(vehicleData.device_activation_time).toISOString().slice(0, 16)
        : "",
      device_remark: vehicleData?.device_remark || "",
      device_name: vehicleData?.device_name || "",
      driver_name: vehicleData?.driver_name || "",
      driver_phone: vehicleData?.driver_phone || "",
    });

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
    // Reset form data
    setCreateFormData({
      plate_number: "",
      make: "",
      model: "",
      year: new Date().getFullYear(),
      color: "",
      capacity_kg: 0,
      capacity_volume: 0,
      fuel_type: FuelType.DIESEL,
      fuel_efficiency: 0,
      type: VehicleType.TRUCK,
      status: "active" as VehicleStatus,
      insurance_expiry: "",
      registration_expiry: "",
      last_maintenance_date: "",
      next_maintenance_date: "",
      total_distance_km: 0,
      branch_id: user?.branch_id,
      device_imei: "",
      jimi_device_id: "",
      gps_provider: "manual",
      gps_device_status: "offline",
      sim_number: "",
      device_model: "",
      device_model_alias: "",
      vehicle_icon: "",
      vin_number: "",
      engine_number: "",
      device_expiration: "",
      device_activation_time: "",
      device_remark: "",
      device_name: "",
      driver_name: "",
      driver_phone: "",
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateVehicle = async () => {
    // Validate required fields
    if (!createFormData.plate_number.trim()) {
      toast({
        title: "Validation Error",
        description: "License plate number is required",
        variant: "destructive",
      });
      return;
    }

    if (!createFormData.make?.trim()) {
      toast({
        title: "Validation Error",
        description: "Vehicle make is required",
        variant: "destructive",
      });
      return;
    }

    if (!createFormData.model?.trim()) {
      toast({
        title: "Validation Error",
        description: "Vehicle model is required",
        variant: "destructive",
      });
      return;
    }

    if (!createFormData.branch_id) {
      toast({
        title: "Validation Error",
        description: "Branch selection is required",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingVehicle(true);

    try {
      await createVehicleMutation.mutateAsync(createFormData);

      toast({
        title: "Success",
        description: "Vehicle created successfully!",
      });

      setIsCreateModalOpen(false);
      refetch();
    } catch (error: any) {
      console.error("Create vehicle error:", error);

      let errorMessage = "Failed to create vehicle";
      let errorTitle = "Error";

      if (error?.response?.data) {
        const errorData = error.response.data;

        // Handle validation errors
        if (
          errorData.error?.code === "VALIDATION_ERROR" &&
          errorData.error?.details
        ) {
          errorTitle = "Validation Error";
          const validationErrors = errorData.error.details
            .map((detail: any) => `${detail.field}: ${detail.message}`)
            .join(", ");
          errorMessage = validationErrors;
        }
        // Handle other API errors
        else if (errorData.message) {
          errorMessage = errorData.message;
        }
        // Handle error object with message
        else if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        }
      }
      // Handle network or other errors
      else if (error?.message) {
        errorMessage = error.message;
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsCreatingVehicle(false);
    }
  };

  const handleUpdateVehicle = async () => {
    if (!editingTruck) return;

    // Validate required fields
    if (!editFormData.plate_number.trim()) {
      toast({
        title: "Validation Error",
        description: "License plate number is required",
        variant: "destructive",
      });
      return;
    }

    if (!editFormData.make?.trim()) {
      toast({
        title: "Validation Error",
        description: "Vehicle make is required",
        variant: "destructive",
      });
      return;
    }

    if (!editFormData.model?.trim()) {
      toast({
        title: "Validation Error",
        description: "Vehicle model is required",
        variant: "destructive",
      });
      return;
    }

    if (!editFormData.branch_id) {
      toast({
        title: "Validation Error",
        description: "Branch selection is required",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingVehicle(true);

    try {
      console.log("🚛 Updating vehicle with data:", {
        id: editingTruck.id,
        data: editFormData,
        insurance_expiry: editFormData.insurance_expiry,
        registration_expiry: editFormData.registration_expiry,
      });

      await updateVehicleMutation.mutateAsync({
        id: editingTruck.id,
        data: editFormData,
      });

      toast({
        title: "Success",
        description: "Vehicle updated successfully!",
      });

      setIsEditModalOpen(false);
      setEditingTruck(null);
      refetch();
    } catch (error: any) {
      console.error("Update vehicle error:", error);

      let errorTitle = "Error";
      let errorMessage = "Failed to update vehicle";

      // Handle validation errors with details
      if (
        error?.response?.data?.error?.code === "VALIDATION_ERROR" &&
        error?.response?.data?.error?.details
      ) {
        errorTitle = "Validation Error";
        const validationErrors = error.response.data.error.details
          .map((detail: any) => `${detail.field}: ${detail.message}`)
          .join(", ");
        errorMessage = validationErrors;
      } else {
        // Use utility function for standard error extraction
        errorMessage = getErrorMessage(error, "Failed to update vehicle");
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUpdatingVehicle(false);
    }
  };

  const handleRefresh = () => {
    refetch();
    customToast.success(t("common.refreshed"));
  };

  const handleCallDriver = (phone: string) => {
    window.open(`tel:${phone}`, "_self");
  };

  const handleTrackTruck = (truckId: string) => {
    navigate(`/admin/fleet-monitor?highlight=${truckId}`);
  };

  const handleAddMaintenance = (truckId: string) => {
    window.location.href = `/admin/maintenance/${truckId}`;
  };

  const handlePushVehicles = async () => {
    try {
      setIsPushing(true);
      const res = await VehicleService.compareJimiDevices();
      const newRows = (res as any)?.data?.new || [];
      const rows: VehicleSyncRow[] = newRows.map((item: any) => {
        const mv = item.mappedVehicle || {};
        const toCell = (v: any) => ({ value: v ?? "", error: null });
        return {
          device_imei: toCell(mv.device_imei),
          plate_number: toCell(mv.plate_number),
          vehicle_type: toCell(mv.vehicle_type),
          make: toCell(mv.make),
          model: toCell(mv.model),
          year: toCell(mv.year),
          color: toCell(mv.color),
          driver_name: toCell(mv.driver_name),
          driver_phone: toCell(mv.driver_phone),
          sim_number: toCell(mv.sim_number),
          device_model: toCell(mv.device_model),
          device_name: toCell(mv.device_name),
          device_activation_time: toCell(
            mv.device_activation_time || mv.activationTime
          ),
          device_expiration: toCell(mv.device_expiration || mv.expiration),
          capacity_kg: toCell(mv.capacity_kg),
          capacity_volume: toCell(mv.capacity_volume),
          fuel_type: toCell(mv.fuel_type),
          branch_id: toCell(mv.branch_id || user?.branch_id || ""),
          status: toCell(mv.status || "active"),
          gps_provider: toCell(
            mv.gps_provider || (mv.device_imei ? "jimi" : "")
          ),
          __ref__: item.jimiDevice,
        };
      });
      setSyncRows(rows);
      setIsSyncModalOpen(true);
    } catch (e: any) {
      toast({
        title: "Sync failed",
        description: e?.error?.message || e?.message || "Compare failed",
        variant: "destructive",
      });
    } finally {
      setIsPushing(false);
    }
  };

  const handleSyncSave = async (vehicles: any[]) => {
    const res = await VehicleService.batchCreateVehicles(vehicles);
    const created = (res as any)?.data?.created ?? 0;
    const errors = (res as any)?.data?.errors ?? 0;
    if (created > 0) {
      customToast.success(`Created ${created} vehicles`);
    }
    if (errors > 0) {
      const errDetails = (res as any)?.data?.details?.errors || [];
      // Build a map by IMEI or plate
      const errorMap = new Map<string, string>();
      errDetails.forEach((e: any) => {
        const v = e.vehicle || {};
        const key = v.device_imei || v.plate_number;
        if (key) errorMap.set(key, e.error || "Failed to create");
      });
      // Annotate rows with server error on plate_number (visible column)
      setSyncRows((prev) =>
        prev.map((row) => {
          const key = row.device_imei?.value || row.plate_number?.value;
          if (key && errorMap.has(key)) {
            return {
              ...row,
              plate_number: {
                value: row.plate_number?.value,
                error: errorMap.get(key) as string,
              },
              hasErrors: true,
            } as any;
          }
          return row;
        })
      );
      customToast.error(
        `${errors} failed. Check error messages in the table and retry.`
      );
    }
    await refetch();
    if (errors === 0) setIsSyncModalOpen(false);
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

  return (
    <div className="space-y-6">
      {/* Main Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t("adminTrucks.title")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("adminTrucks.subtitle")}
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
          {user?.role === "super_admin" && (
            <Button
              variant="secondary"
              onClick={handlePushVehicles}
              disabled={isPushing}
            >
              {isPushing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Loading...
                </>
              ) : (
                <>Sync JIMI</> 
              )}
            </Button>
          )}
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            {t("adminTrucks.addNew")}
          </Button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              statusFilter === tab.key
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
            {statusFilter === tab.key && (
              <span className="ml-2 px-2 py-1 text-xs bg-gray-100 rounded-full">
                {currentCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search and Filters Section */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Search Input */}
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={
                t("adminTrucks.searchPlaceholder") || "Search trucks..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">{t("common.status")}:</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              <SelectItem value="active">{t("status.active")}</SelectItem>
              <SelectItem value="maintenance">
                {t("status.maintenance")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Type Filter */}
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
              <SelectItem value="moto">{t("adminTrucks.moto")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Page Size */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Per Page:</label>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => setPageSize(parseInt(value))}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setStatusFilter("all");
            setTypeFilter("all");
            setSearchTerm("");
            setCurrentPage(1);
          }}
        >
          Clear
        </Button>
      </div>

      {/* Truck Table */}
      <TruckTable
        trucks={trucks}
        title=""
        showSearch={false} // Disable internal search since we use backend search
        showFilters={false} // Disable internal filters since we use backend filters
        showPagination={false} // We handle pagination manually
        itemsPerPage={pageSize}
        onViewDetails={handleViewTruckDetails}
        onEditTruck={handleEditTruck}
        onDeleteTruck={handleDeleteTruck}
        onAssignDriver={handleApproveTruck}
        onTrackTruck={handleTrackTruck}
        onScheduleMaintenance={handleAddMaintenance}
      />

      {/* Compact Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} results
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={!pagination.hasPrev}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!pagination.hasPrev}
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
                      Math.min(pagination.totalPages - 4, pagination.page - 2)
                    ) + i;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
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
              disabled={!pagination.hasNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(pagination.totalPages)}
              disabled={!pagination.hasNext}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedTruck && (
        <TruckDetailModal
          truck={selectedTruck}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedTruck(null);
          }}
          onTrackTruck={handleTrackTruck}
          onEditTruck={handleEditTruck}
        />
      )}

      {/* Create Truck Modal */}
      <ModernModel
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={t("adminTrucks.createNewTruck")}
      >
        <div className="space-y-6">
          {/* Branch Selection for Super Admin */}
          {user?.role === "super_admin" && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Branch Assignment
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="branch">Branch *</Label>
                    <Select
                      value={createFormData.branch_id || ""}
                      onValueChange={(value) =>
                        setCreateFormData((prev) => ({
                          ...prev,
                          branch_id: value,
                        }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select branch..." />
                      </SelectTrigger>
                      <SelectContent>
                        {branchesResponse?.branches?.map((branch: any) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vehicle Details */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold text-gray-900 mb-4">
                Vehicle Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="make">Make *</Label>
                  <Input
                    id="make"
                    value={createFormData.make}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        make: e.target.value,
                      }))
                    }
                    placeholder="e.g., Toyota, Ford, Honda"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    value={createFormData.model}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        model: e.target.value,
                      }))
                    }
                    placeholder="e.g., Hiace, Transit, CG125"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={createFormData.year}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        year:
                          parseInt(e.target.value) || new Date().getFullYear(),
                      }))
                    }
                    placeholder="2024"
                    min="1990"
                    max="2025"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={createFormData.color}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        color: e.target.value,
                      }))
                    }
                    placeholder="e.g., Silver, Black, Red"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="plateNumber">License Plate *</Label>
                  <Input
                    id="plateNumber"
                    value={createFormData.plate_number}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        plate_number: e.target.value,
                      }))
                    }
                    placeholder="e.g., RAB789C"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="vehicleType">Vehicle Type</Label>
                  <Select
                    value={createFormData.type}
                    onValueChange={(value: VehicleType) =>
                      setCreateFormData((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={VehicleType.TRUCK}>Truck</SelectItem>
                      <SelectItem value={VehicleType.VAN}>Van</SelectItem>
                      <SelectItem value={VehicleType.PICKUP}>Pickup</SelectItem>
                      <SelectItem value={VehicleType.MOTO}>
                        Motorcycle
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Capacity and Performance */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold text-gray-900 mb-4">
                Capacity & Performance
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="capacityKg">Capacity (kg)</Label>
                  <Input
                    id="capacityKg"
                    type="number"
                    value={createFormData.capacity_kg || ""}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        capacity_kg: parseInt(e.target.value) || 0,
                      }))
                    }
                    placeholder="1500"
                    min="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="capacityVolume">Volume (m³)</Label>
                  <Input
                    id="capacityVolume"
                    type="number"
                    step="0.1"
                    value={createFormData.capacity_volume || ""}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        capacity_volume: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="4.0"
                    min="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="fuelType">Fuel Type</Label>
                  <Select
                    value={createFormData.fuel_type}
                    onValueChange={(value: FuelType) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        fuel_type: value,
                      }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select fuel type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={FuelType.PETROL}>Petrol</SelectItem>
                      <SelectItem value={FuelType.DIESEL}>Diesel</SelectItem>
                      <SelectItem value={FuelType.ELECTRIC}>
                        Electric
                      </SelectItem>
                      <SelectItem value={FuelType.HYBRID}>Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fuelEfficiency">
                    Fuel Efficiency (L/100km)
                  </Label>
                  <Input
                    id="fuelEfficiency"
                    type="number"
                    step="0.1"
                    value={createFormData.fuel_efficiency || ""}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        fuel_efficiency: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="10.5"
                    min="0"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insurance and Registration */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold text-gray-900 mb-4">
                Insurance & Registration
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="insuranceExpiry">Insurance Expiry</Label>
                  <Input
                    id="insuranceExpiry"
                    type="date"
                    value={createFormData.insurance_expiry || ""}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        insurance_expiry: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="registrationExpiry">
                    Registration Expiry
                  </Label>
                  <Input
                    id="registrationExpiry"
                    type="date"
                    value={createFormData.registration_expiry || ""}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        registration_expiry: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status and Maintenance */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold text-gray-900 mb-4">
                Status & Maintenance
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={createFormData.status || "active"}
                    onValueChange={(value: VehicleStatus) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        status: value,
                      }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="totalDistance">Total Distance (km)</Label>
                  <Input
                    id="totalDistance"
                    type="number"
                    step="0.1"
                    value={createFormData.total_distance_km || ""}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        total_distance_km: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="0"
                    min="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastMaintenance">Last Maintenance Date</Label>
                  <Input
                    id="lastMaintenance"
                    type="date"
                    value={createFormData.last_maintenance_date || ""}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        last_maintenance_date: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="nextMaintenance">Next Maintenance Date</Label>
                  <Input
                    id="nextMaintenance"
                    type="date"
                    value={createFormData.next_maintenance_date || ""}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        next_maintenance_date: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GPS/Device Information */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold text-gray-900 mb-4">
                GPS/Device Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="deviceImei">Device IMEI</Label>
                  <Input
                    id="deviceImei"
                    value={createFormData.device_imei || ""}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        device_imei: e.target.value,
                      }))
                    }
                    placeholder="123456789012345"
                    maxLength={50}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="jimiDeviceId">JIMI Device ID</Label>
                  <Input
                    id="jimiDeviceId"
                    value={createFormData.jimi_device_id || ""}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        jimi_device_id: e.target.value,
                      }))
                    }
                    placeholder="JIMI123456"
                    maxLength={100}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="gpsProvider">GPS Provider</Label>
                  <Select
                    value={createFormData.gps_provider || "manual"}
                    onValueChange={(value: "jimi" | "manual") =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        gps_provider: value,
                      }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jimi">JIMI</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="gpsDeviceStatus">GPS Device Status</Label>
                  <Select
                    value={createFormData.gps_device_status || "offline"}
                    onValueChange={(value: "online" | "offline" | "stale") =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        gps_device_status: value,
                      }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                      <SelectItem value="stale">Stale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* JIMI Device Details */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold text-gray-900 mb-4">
                JIMI Device Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="simNumber">SIM Number</Label>
                  <Input
                    id="simNumber"
                    value={createFormData.sim_number || ""}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        sim_number: e.target.value,
                      }))
                    }
                    placeholder="+250788123456"
                    maxLength={50}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="deviceModel">Device Model</Label>
                  <Input
                    id="deviceModel"
                    value={createFormData.device_model || ""}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        device_model: e.target.value,
                      }))
                    }
                    placeholder="GT06N"
                    maxLength={100}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="deviceModelAlias">Device Model Alias</Label>
                  <Input
                    id="deviceModelAlias"
                    value={createFormData.device_model_alias || ""}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        device_model_alias: e.target.value,
                      }))
                    }
                    placeholder="GT06N-Alias"
                    maxLength={100}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="vehicleIcon">Vehicle Icon</Label>
                  <Input
                    id="vehicleIcon"
                    value={createFormData.vehicle_icon || ""}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        vehicle_icon: e.target.value,
                      }))
                    }
                    placeholder="truck-icon"
                    maxLength={50}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="vinNumber">VIN Number</Label>
                  <Input
                    id="vinNumber"
                    value={createFormData.vin_number || ""}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        vin_number: e.target.value,
                      }))
                    }
                    placeholder="1HGBH41JXMN109186"
                    maxLength={50}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="engineNumber">Engine Number</Label>
                  <Input
                    id="engineNumber"
                    value={createFormData.engine_number || ""}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        engine_number: e.target.value,
                      }))
                    }
                    placeholder="ENG123456"
                    maxLength={50}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="deviceExpiration">Device Expiration</Label>
                  <Input
                    id="deviceExpiration"
                    type="datetime-local"
                    value={createFormData.device_expiration || ""}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        device_expiration: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="deviceActivationTime">Device Activation Time</Label>
                  <Input
                    id="deviceActivationTime"
                    type="datetime-local"
                    value={createFormData.device_activation_time || ""}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        device_activation_time: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="deviceName">Device Name</Label>
                  <Input
                    id="deviceName"
                    value={createFormData.device_name || ""}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        device_name: e.target.value,
                      }))
                    }
                    placeholder="TRK001-GPS"
                    maxLength={100}
                    className="mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="deviceRemark">Device Remark</Label>
                  <Input
                    id="deviceRemark"
                    value={createFormData.device_remark || ""}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        device_remark: e.target.value,
                      }))
                    }
                    placeholder="Additional notes about the GPS device"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Driver Information */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold text-gray-900 mb-4">
                Driver Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="driverName">Driver Name</Label>
                  <Input
                    id="driverName"
                    value={createFormData.driver_name || ""}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        driver_name: e.target.value,
                      }))
                    }
                    placeholder="John Doe"
                    maxLength={100}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="driverPhone">Driver Phone</Label>
                  <Input
                    id="driverPhone"
                    value={createFormData.driver_phone || ""}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        driver_phone: e.target.value,
                      }))
                    }
                    placeholder="+250788123456"
                    maxLength={20}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isCreatingVehicle}
            >
              {t("common.cancel")}
            </Button>
            <Button
              className="flex-1"
              onClick={handleCreateVehicle}
              disabled={isCreatingVehicle}
            >
              {isCreatingVehicle ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <TruckIcon className="h-4 w-4 mr-2" />
                  {t("adminTrucks.createTruck")}
                </>
              )}
            </Button>
          </div>
        </div>
      </ModernModel>

      {isSyncModalOpen && (
        <VehicleSyncModal
          isOpen={isSyncModalOpen}
          onClose={() => setIsSyncModalOpen(false)}
          rows={syncRows}
          onSave={handleSyncSave}
        />
      )}

      {/* Edit Truck Modal */}
      <ModernModel
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t("adminTrucks.editTruck")}
      >
        {editingTruck && (
          <div className="space-y-6">
            {/* Branch Selection for Super Admin */}
            {user?.role === "super_admin" && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Branch Assignment
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="editBranch">Branch *</Label>
                      <Select
                        value={editFormData.branch_id || ""}
                        onValueChange={(value) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            branch_id: value,
                          }))
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select branch..." />
                        </SelectTrigger>
                        <SelectContent>
                          {branchesResponse?.branches?.map((branch: any) => (
                            <SelectItem key={branch.id} value={branch.id}>
                              {branch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Vehicle Details */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Vehicle Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editMake">Make *</Label>
                    <Input
                      id="editMake"
                      value={editFormData.make}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          make: e.target.value,
                        }))
                      }
                      placeholder="e.g., Toyota, Ford, Honda"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editModel">Model *</Label>
                    <Input
                      id="editModel"
                      value={editFormData.model}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          model: e.target.value,
                        }))
                      }
                      placeholder="e.g., Hiace, Transit, CG125"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editYear">Year</Label>
                    <Input
                      id="editYear"
                      type="number"
                      value={editFormData.year}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          year:
                            parseInt(e.target.value) ||
                            new Date().getFullYear(),
                        }))
                      }
                      placeholder="2024"
                      min="1990"
                      max="2025"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editColor">Color</Label>
                    <Input
                      id="editColor"
                      value={editFormData.color}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          color: e.target.value,
                        }))
                      }
                      placeholder="e.g., Silver, Black, Red"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editLicensePlate">License Plate *</Label>
                    <Input
                      id="editLicensePlate"
                      value={editFormData.plate_number}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          plate_number: e.target.value,
                        }))
                      }
                      placeholder="e.g., RAB789C"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editStatus">Status</Label>
                    <Select defaultValue={editingTruck.status}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Capacity and Performance */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Capacity & Performance
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editCapacityKg">Capacity (kg)</Label>
                    <Input
                      id="editCapacityKg"
                      type="number"
                      value={editFormData.capacity_kg || ""}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          capacity_kg: parseInt(e.target.value) || 0,
                        }))
                      }
                      placeholder="1500"
                      min="0"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editCapacityVolume">Volume (m³)</Label>
                    <Input
                      id="editCapacityVolume"
                      type="number"
                      step="0.1"
                      value={editFormData.capacity_volume || ""}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          capacity_volume: parseFloat(e.target.value) || 0,
                        }))
                      }
                      placeholder="4.0"
                      min="0"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editFuelType">Fuel Type</Label>
                    <Select
                      value={editFormData.fuel_type}
                      onValueChange={(value: FuelType) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          fuel_type: value,
                        }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select fuel type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={FuelType.PETROL}>Petrol</SelectItem>
                        <SelectItem value={FuelType.DIESEL}>Diesel</SelectItem>
                        <SelectItem value={FuelType.ELECTRIC}>
                          Electric
                        </SelectItem>
                        <SelectItem value={FuelType.HYBRID}>Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="editFuelEfficiency">
                      Fuel Efficiency (L/100km)
                    </Label>
                    <Input
                      id="editFuelEfficiency"
                      type="number"
                      step="0.1"
                      value={editFormData.fuel_efficiency || ""}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          fuel_efficiency: parseFloat(e.target.value) || 0,
                        }))
                      }
                      placeholder="10.5"
                      min="0"
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Insurance and Registration */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Insurance & Registration
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editInsuranceExpiry">
                      Insurance Expiry
                    </Label>
                    <Input
                      id="editInsuranceExpiry"
                      type="date"
                      value={editFormData.insurance_expiry || ""}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          insurance_expiry: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editRegistrationExpiry">
                      Registration Expiry
                    </Label>
                    <Input
                      id="editRegistrationExpiry"
                      type="date"
                      value={editFormData.registration_expiry || ""}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          registration_expiry: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status and Maintenance */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Status & Maintenance
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editStatus">Status</Label>
                    <Select
                      value={editFormData.status || editingTruck.status}
                      onValueChange={(value: VehicleStatus) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          status: value,
                        }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="editTotalDistance">Total Distance (km)</Label>
                    <Input
                      id="editTotalDistance"
                      type="number"
                      step="0.1"
                      value={editFormData.total_distance_km || ""}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          total_distance_km: parseFloat(e.target.value) || 0,
                        }))
                      }
                      placeholder="0"
                      min="0"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editLastMaintenance">Last Maintenance Date</Label>
                    <Input
                      id="editLastMaintenance"
                      type="date"
                      value={editFormData.last_maintenance_date || ""}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          last_maintenance_date: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editNextMaintenance">Next Maintenance Date</Label>
                    <Input
                      id="editNextMaintenance"
                      type="date"
                      value={editFormData.next_maintenance_date || ""}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          next_maintenance_date: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* GPS/Device Information */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-900 mb-4">
                  GPS/Device Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editDeviceImei">Device IMEI</Label>
                    <Input
                      id="editDeviceImei"
                      value={editFormData.device_imei || ""}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          device_imei: e.target.value,
                        }))
                      }
                      placeholder="123456789012345"
                      maxLength={50}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editJimiDeviceId">JIMI Device ID</Label>
                    <Input
                      id="editJimiDeviceId"
                      value={editFormData.jimi_device_id || ""}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          jimi_device_id: e.target.value,
                        }))
                      }
                      placeholder="JIMI123456"
                      maxLength={100}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editGpsProvider">GPS Provider</Label>
                    <Select
                      value={editFormData.gps_provider || "manual"}
                      onValueChange={(value: "jimi" | "manual") =>
                        setEditFormData((prev) => ({
                          ...prev,
                          gps_provider: value,
                        }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jimi">JIMI</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="editGpsDeviceStatus">GPS Device Status</Label>
                    <Select
                      value={editFormData.gps_device_status || "offline"}
                      onValueChange={(value: "online" | "offline" | "stale") =>
                        setEditFormData((prev) => ({
                          ...prev,
                          gps_device_status: value,
                        }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                        <SelectItem value="stale">Stale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* JIMI Device Details */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-900 mb-4">
                  JIMI Device Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editSimNumber">SIM Number</Label>
                    <Input
                      id="editSimNumber"
                      value={editFormData.sim_number || ""}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          sim_number: e.target.value,
                        }))
                      }
                      placeholder="+250788123456"
                      maxLength={50}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editDeviceModel">Device Model</Label>
                    <Input
                      id="editDeviceModel"
                      value={editFormData.device_model || ""}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          device_model: e.target.value,
                        }))
                      }
                      placeholder="GT06N"
                      maxLength={100}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editDeviceModelAlias">Device Model Alias</Label>
                    <Input
                      id="editDeviceModelAlias"
                      value={editFormData.device_model_alias || ""}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          device_model_alias: e.target.value,
                        }))
                      }
                      placeholder="GT06N-Alias"
                      maxLength={100}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editVehicleIcon">Vehicle Icon</Label>
                    <Input
                      id="editVehicleIcon"
                      value={editFormData.vehicle_icon || ""}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          vehicle_icon: e.target.value,
                        }))
                      }
                      placeholder="truck-icon"
                      maxLength={50}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editVinNumber">VIN Number</Label>
                    <Input
                      id="editVinNumber"
                      value={editFormData.vin_number || ""}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          vin_number: e.target.value,
                        }))
                      }
                      placeholder="1HGBH41JXMN109186"
                      maxLength={50}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editEngineNumber">Engine Number</Label>
                    <Input
                      id="editEngineNumber"
                      value={editFormData.engine_number || ""}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          engine_number: e.target.value,
                        }))
                      }
                      placeholder="ENG123456"
                      maxLength={50}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editDeviceExpiration">Device Expiration</Label>
                    <Input
                      id="editDeviceExpiration"
                      type="datetime-local"
                      value={editFormData.device_expiration || ""}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          device_expiration: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editDeviceActivationTime">Device Activation Time</Label>
                    <Input
                      id="editDeviceActivationTime"
                      type="datetime-local"
                      value={editFormData.device_activation_time || ""}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          device_activation_time: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editDeviceName">Device Name</Label>
                    <Input
                      id="editDeviceName"
                      value={editFormData.device_name || ""}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          device_name: e.target.value,
                        }))
                      }
                      placeholder="TRK001-GPS"
                      maxLength={100}
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="editDeviceRemark">Device Remark</Label>
                    <Input
                      id="editDeviceRemark"
                      value={editFormData.device_remark || ""}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          device_remark: e.target.value,
                        }))
                      }
                      placeholder="Additional notes about the GPS device"
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Driver Information */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Driver Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editDriverName">Driver Name</Label>
                    <Input
                      id="editDriverName"
                      value={editFormData.driver_name || ""}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          driver_name: e.target.value,
                        }))
                      }
                      placeholder="John Doe"
                      maxLength={100}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editDriverPhone">Driver Phone</Label>
                    <Input
                      id="editDriverPhone"
                      value={editFormData.driver_phone || ""}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          driver_phone: e.target.value,
                        }))
                      }
                      placeholder="+250788123456"
                      maxLength={20}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isUpdatingVehicle}
              >
                {t("common.cancel")}
              </Button>
              <Button
                className="flex-1"
                onClick={handleUpdateVehicle}
                disabled={isUpdatingVehicle}
              >
                {isUpdatingVehicle ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <TruckIcon className="h-4 w-4 mr-2" />
                    {t("common.save")}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </ModernModel>
    </div>
  );
};

export default AdminTrucks;
