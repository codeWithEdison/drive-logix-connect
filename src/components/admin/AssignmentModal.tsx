import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Truck,
  User,
  Package,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  Phone,
  Mail,
} from "lucide-react";
import {
  useCreateAssignment,
  useUpdateDeliveryAssignment,
} from "@/lib/api/hooks/assignmentHooks";
import { useUnassignedCargos, useCargoById } from "@/lib/api/hooks/cargoHooks";
import { useAvailableDriversWithoutAssignments } from "@/lib/api/hooks/driverHooks";
import { useAvailableVehiclesWithoutAssignments } from "@/lib/api/hooks/vehicleHooks";
import { CargoStatus, VehicleStatus } from "@/types/shared";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { customToast } from "@/lib/utils/toast";
import ModernModel from "@/components/modal/ModernModel";

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: "create" | "edit";
  assignment?: any;
  preselectedCargoId?: string;
}

export default function AssignmentModal({
  isOpen,
  onClose,
  onSuccess,
  mode,
  assignment,
  preselectedCargoId,
}: AssignmentModalProps) {
  const { t } = useLanguage();

  // Form state
  const [formData, setFormData] = useState({
    cargo_id: "",
    driver_id: "",
    vehicle_id: "",
    assigned_weight_kg: "",
    assigned_volume: "",
    assignment_type: "full" as "full" | "partial" | "split",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API hooks
  const createAssignmentMutation = useCreateAssignment();
  const updateAssignmentMutation = useUpdateDeliveryAssignment();

  // Data hooks - using different endpoints based on mode
  const { data: cargosData, isLoading: cargosLoading } = useUnassignedCargos({
    limit: 100,
  });

  // Fetch preselected cargo data if provided
  const { data: preselectedCargoData, isLoading: preselectedCargoLoading } =
    useCargoById(preselectedCargoId || "");

  // For edit mode, we need to include the existing assignment's cargo, driver, and vehicle
  // For create mode, we use filtered endpoints
  const getCargoData = () => {
    if (preselectedCargoData) {
      return preselectedCargoData;
    }
    if (formData.cargo_id && cargosData) {
      return cargosData.find((cargo) => cargo.id === formData.cargo_id);
    }
    return null;
  };

  const currentCargo = getCargoData();

  const pickupDate = currentCargo?.pickup_date
    ? new Date(currentCargo.pickup_date).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  const { data: driversData, isLoading: driversLoading } =
    useAvailableDriversWithoutAssignments({
      date: pickupDate,
      limit: 100,
    });

  const { data: vehiclesData, isLoading: vehiclesLoading } =
    useAvailableVehiclesWithoutAssignments({
      date: pickupDate,
      capacity_min: currentCargo?.weight_kg || 0,
      limit: 100,
    });

  // Initialize form data when editing or when preselectedCargoId is provided
  useEffect(() => {
    if (mode === "edit" && assignment) {
      setFormData({
        cargo_id: assignment.cargo_id || "",
        driver_id: assignment.driver_id || "",
        vehicle_id: assignment.vehicle_id || "",
        assigned_weight_kg: assignment.assigned_weight_kg?.toString() || "",
        assigned_volume: assignment.assigned_volume?.toString() || "",
        assignment_type: assignment.assignment_type || "full",
        notes: assignment.notes || "",
      });
    } else if (preselectedCargoId) {
      setFormData({
        cargo_id: preselectedCargoId,
        driver_id: "",
        vehicle_id: "",
        assigned_weight_kg: "",
        assigned_volume: "",
        assignment_type: "full",
        notes: "",
      });
    } else {
      setFormData({
        cargo_id: "",
        driver_id: "",
        vehicle_id: "",
        assigned_weight_kg: "",
        assigned_volume: "",
        assignment_type: "full",
        notes: "",
      });
    }
    setErrors({});
  }, [mode, assignment, preselectedCargoId, isOpen]);

  // Get selected cargo, driver, and vehicle details
  const cargos = Array.isArray(cargosData)
    ? cargosData
    : (cargosData as any)?.data || [];
  const drivers = Array.isArray(driversData)
    ? driversData
    : (driversData as any)?.data || [];
  const vehicles = Array.isArray(vehiclesData)
    ? vehiclesData
    : (vehiclesData as any)?.data || [];

  // For edit mode, ensure the existing assignment's cargo, driver, and vehicle are included
  // For preselected cargo, include it in the cargos list
  const allCargos = (() => {
    let result = [...cargos];

    // Add preselected cargo if it's not already in the list
    if (
      preselectedCargoData &&
      !result.find((c) => c.id === preselectedCargoData.id)
    ) {
      result = [preselectedCargoData, ...result];
    }

    // Add assignment cargo for edit mode
    if (
      mode === "edit" &&
      assignment?.cargo &&
      !result.find((c) => c.id === assignment.cargo.id)
    ) {
      result = [...result, assignment.cargo];
    }

    return result;
  })();

  const allDrivers =
    mode === "edit" &&
    assignment?.driver &&
    !drivers.find((d) => d.id === assignment.driver.id)
      ? [...drivers, assignment.driver]
      : drivers;

  const allVehicles =
    mode === "edit" &&
    assignment?.vehicle &&
    !vehicles.find((v) => v.id === assignment.vehicle.id)
      ? [...vehicles, assignment.vehicle]
      : vehicles;

  // Filter data based on search terms
  const filteredCargos = allCargos;

  const filteredDrivers = allDrivers;

  const filteredVehicles = allVehicles;

  const selectedCargo =
    currentCargo ||
    allCargos.find((cargo: any) => cargo.id === formData.cargo_id);
  const selectedDriver = allDrivers.find(
    (driver: any) => driver.id === formData.driver_id
  );
  const selectedVehicle = allVehicles.find(
    (vehicle: any) => vehicle.id === formData.vehicle_id
  );

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.cargo_id) {
      newErrors.cargo_id = t("validation.required");
    }
    if (!formData.driver_id) {
      newErrors.driver_id = t("validation.required");
    }
    if (!formData.vehicle_id) {
      newErrors.vehicle_id = t("validation.required");
    }

    // Validate assignment type specific fields
    if (
      formData.assignment_type === "partial" ||
      formData.assignment_type === "split"
    ) {
      if (!formData.assigned_weight_kg) {
        newErrors.assigned_weight_kg = t("validation.required");
      } else {
        const assignedWeight = parseFloat(formData.assigned_weight_kg);
        const cargoWeight = selectedCargo?.weight_kg || 0;

        if (assignedWeight <= 0) {
          newErrors.assigned_weight_kg = "Weight must be greater than 0";
        } else if (assignedWeight > cargoWeight) {
          newErrors.assigned_weight_kg = `Weight cannot exceed cargo weight (${cargoWeight} kg)`;
        }
      }

      if (formData.assigned_volume) {
        const assignedVolume = parseFloat(formData.assigned_volume);
        const cargoVolume = selectedCargo?.volume || 0;

        if (assignedVolume <= 0) {
          newErrors.assigned_volume = "Volume must be greater than 0";
        } else if (cargoVolume > 0 && assignedVolume > cargoVolume) {
          newErrors.assigned_volume = `Volume cannot exceed cargo volume (${cargoVolume})`;
        }
      }
    }

    // Check if cargo weight exceeds vehicle capacity
    if (currentCargo && selectedVehicle) {
      const cargoWeight =
        formData.assignment_type === "full"
          ? currentCargo.weight_kg || 0
          : parseFloat(formData.assigned_weight_kg) || 0;
      const vehicleCapacity =
        selectedVehicle.capacity_kg || selectedVehicle.capacity || 0;
      if (cargoWeight > vehicleCapacity) {
        newErrors.vehicle_id = t("adminAssignments.cargoExceedsCapacity");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "create") {
        const assignmentData = {
          cargo_id: formData.cargo_id,
          driver_id: formData.driver_id,
          vehicle_id: formData.vehicle_id,
          assigned_weight_kg: formData.assigned_weight_kg
            ? parseFloat(formData.assigned_weight_kg)
            : undefined,
          assigned_volume: formData.assigned_volume
            ? parseFloat(formData.assigned_volume)
            : undefined,
          assignment_type: formData.assignment_type,
          notes: formData.notes,
        };
        await createAssignmentMutation.mutateAsync(assignmentData);
        customToast.success(t("adminAssignments.createdSuccessfully"));
      } else {
        const updateData = {
          driver_id: formData.driver_id,
          vehicle_id: formData.vehicle_id,
          assigned_weight_kg: formData.assigned_weight_kg
            ? parseFloat(formData.assigned_weight_kg)
            : undefined,
          assigned_volume: formData.assigned_volume
            ? parseFloat(formData.assigned_volume)
            : undefined,
          assignment_type: formData.assignment_type,
          notes: formData.notes,
        };
        await updateAssignmentMutation.mutateAsync({
          assignmentId: assignment.id,
          data: updateData,
        });
        customToast.success(t("adminAssignments.updatedSuccessfully"));
      }

      onSuccess();
    } catch (error: any) {
      customToast.error(error.message || t("adminAssignments.operationFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form field changes
  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when field is updated
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      accepted: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      rejected: { color: "bg-red-100 text-red-800", icon: XCircle },
      cancelled: { color: "bg-gray-100 text-gray-800", icon: XCircle },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {t(`assignment.status.${status}`)}
      </Badge>
    );
  };

  return (
    <ModernModel
      isOpen={isOpen}
      onClose={onClose}
      title={
        mode === "create"
          ? t("adminAssignments.createAssignment")
          : t("adminAssignments.editAssignment")
      }
      loading={isSubmitting}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cargo Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {preselectedCargoId
                ? "Cargo Information"
                : t("adminAssignments.selectCargo")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Cargo Selection - Only show when not preselected */}
            {!preselectedCargoId && (
              <div className="space-y-2">
                <Label htmlFor="cargo_id">{t("common.cargo")}</Label>
                <Select
                  value={formData.cargo_id}
                  onValueChange={(value) =>
                    handleFieldChange("cargo_id", value)
                  }
                  disabled={mode === "edit"}
                >
                  <SelectTrigger
                    className={errors.cargo_id ? "border-red-500" : ""}
                  >
                    <SelectValue
                      placeholder={t("adminAssignments.selectCargoPlaceholder")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {cargosLoading ? (
                      <SelectItem value="loading" disabled>
                        {t("common.loading")}...
                      </SelectItem>
                    ) : filteredCargos.length === 0 ? (
                      <SelectItem value="no-cargos" disabled>
                        {t("adminAssignments.noCargosAvailable")}
                      </SelectItem>
                    ) : (
                      filteredCargos.map((cargo: any) => (
                        <SelectItem key={cargo.id} value={cargo.id}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {cargo.cargo_number ||
                                  `Cargo #${cargo.id.slice(-8)}`}
                              </span>
                              <span className="text-xs text-gray-500">
                                Pickup:{" "}
                                {new Date(
                                  cargo.pickup_date
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <Badge variant="outline" className="ml-2">
                              {cargo.weight_kg}kg
                            </Badge>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.cargo_id && (
                  <p className="text-sm text-red-500">{errors.cargo_id}</p>
                )}
              </div>
            )}

            {/* Preselected Cargo Info */}
            {preselectedCargoId && (
              <div className="space-y-2">
                <Label>{t("common.cargo")}</Label>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="font-semibold text-blue-900">
                        {preselectedCargoLoading ? (
                          "Loading cargo details..."
                        ) : (
                          <>
                            {currentCargo?.cargo_number ||
                              `Cargo #${currentCargo?.id.slice(-8)}`}
                            <span className="text-sm text-blue-700 ml-2">
                              ✓ Automatically selected
                            </span>
                          </>
                        )}
                      </p>
                      {currentCargo && (
                        <p className="text-sm text-blue-700">
                          Weight: {currentCargo.weight_kg}kg • Pickup:{" "}
                          {new Date(
                            currentCargo.pickup_date
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Selected Cargo Details */}
            {preselectedCargoLoading && preselectedCargoId ? (
              <Alert>
                <Package className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="font-medium">
                      {t("adminAssignments.cargoDetails")}
                    </div>
                    <div className="text-sm text-gray-500">
                      Loading cargo details...
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ) : currentCargo ? (
              <Alert>
                <Package className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="font-medium">
                      {t("adminAssignments.cargoDetails")}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="col-span-2">
                        <span className="font-medium">
                          {t("common.cargoNumber")}:
                        </span>{" "}
                        <span className="font-bold text-blue-600">
                          {currentCargo.cargo_number ||
                            `Cargo #${currentCargo.id.slice(-8)}`}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">{t("common.type")}:</span>{" "}
                        {currentCargo.type || t("common.notAvailable")}
                      </div>
                      <div>
                        <span className="font-medium">
                          {t("common.weight")}:
                        </span>{" "}
                        {currentCargo.weight_kg}kg
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">
                          {t("common.pickupAddress")}:
                        </span>{" "}
                        {currentCargo.pickup_address ||
                          t("common.notAvailable")}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">
                          {t("common.destinationAddress")}:
                        </span>{" "}
                        {currentCargo.destination_address ||
                          t("common.notAvailable")}
                      </div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ) : null}
          </CardContent>
        </Card>

        {/* Driver Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t("adminAssignments.selectDriver")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="driver_id">{t("common.driver")}</Label>
              <Select
                value={formData.driver_id}
                onValueChange={(value) => handleFieldChange("driver_id", value)}
              >
                <SelectTrigger
                  className={errors.driver_id ? "border-red-500" : ""}
                >
                  <SelectValue
                    placeholder={t("adminAssignments.selectDriverPlaceholder")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {driversLoading ? (
                    <SelectItem value="loading-drivers" disabled>
                      {t("common.loading")}...
                    </SelectItem>
                  ) : filteredDrivers.length === 0 ? (
                    <SelectItem value="no-drivers" disabled>
                      {t("adminAssignments.noDriversAvailable")}
                    </SelectItem>
                  ) : (
                    filteredDrivers.map((driver: any) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {driver.user?.full_name || driver.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {driver.user?.phone || driver.phone} • Rating:{" "}
                              {driver.rating || "N/A"}
                            </span>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            {driver.total_deliveries || 0} deliveries
                          </Badge>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.driver_id && (
                <p className="text-sm text-red-500">{errors.driver_id}</p>
              )}
            </div>

            {/* Selected Driver Details */}
            {selectedDriver && (
              <Alert>
                <User className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="font-medium">
                      {t("adminAssignments.driverDetails")}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">{t("common.name")}:</span>{" "}
                        {selectedDriver.user?.full_name || selectedDriver.name}
                      </div>
                      <div>
                        <span className="font-medium">
                          {t("common.phone")}:
                        </span>{" "}
                        {selectedDriver.user?.phone ||
                          selectedDriver.phone ||
                          t("common.notAvailable")}
                      </div>
                      <div>
                        <span className="font-medium">
                          {t("common.rating")}:
                        </span>{" "}
                        {selectedDriver.rating || "N/A"}
                      </div>
                      <div>
                        <span className="font-medium">
                          {t("common.status")}:
                        </span>
                        <StatusBadge status={selectedDriver.status} />
                      </div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Vehicle Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              {t("adminAssignments.selectVehicle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle_id">{t("common.vehicle")}</Label>
              <Select
                value={formData.vehicle_id}
                onValueChange={(value) =>
                  handleFieldChange("vehicle_id", value)
                }
              >
                <SelectTrigger
                  className={errors.vehicle_id ? "border-red-500" : ""}
                >
                  <SelectValue
                    placeholder={t("adminAssignments.selectVehiclePlaceholder")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {vehiclesLoading ? (
                    <SelectItem value="loading-vehicles" disabled>
                      {t("common.loading")}...
                    </SelectItem>
                  ) : filteredVehicles.length === 0 ? (
                    <SelectItem value="no-vehicles" disabled>
                      {t("adminAssignments.noVehiclesAvailable")}
                    </SelectItem>
                  ) : (
                    filteredVehicles.map((vehicle: any) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {vehicle.make} {vehicle.model} -{" "}
                              {vehicle.plate_number}
                            </span>
                            <span className="text-xs text-gray-500">
                              {vehicle.type} • {vehicle.fuel_type}
                            </span>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            {vehicle.capacity_kg || vehicle.capacity}kg
                          </Badge>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.vehicle_id && (
                <p className="text-sm text-red-500">{errors.vehicle_id}</p>
              )}
            </div>

            {/* Selected Vehicle Details */}
            {selectedVehicle && (
              <Alert>
                <Truck className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="font-medium">
                      {t("adminAssignments.vehicleDetails")}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">
                          {t("common.model")}:
                        </span>{" "}
                        {selectedVehicle.make} {selectedVehicle.model}
                      </div>
                      <div>
                        <span className="font-medium">
                          {t("common.capacity")}:
                        </span>{" "}
                        {selectedVehicle.capacity_kg ||
                          selectedVehicle.capacity}
                        kg
                      </div>
                      <div>
                        <span className="font-medium">
                          {t("common.licensePlate")}:
                        </span>{" "}
                        {selectedVehicle.plate_number}
                      </div>
                      <div>
                        <span className="font-medium">
                          {t("common.status")}:
                        </span>
                        <StatusBadge status={selectedVehicle.status} />
                      </div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Capacity Warning */}
            {currentCargo &&
              selectedVehicle &&
              currentCargo.weight_kg >
                (selectedVehicle.capacity_kg || selectedVehicle.capacity) && (
                <Alert className="border-red-500 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-700">
                    {t("adminAssignments.capacityWarning")}
                  </AlertDescription>
                </Alert>
              )}
          </CardContent>
        </Card>

        {/* Assignment Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Assignment Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Assignment Type */}
            <div className="space-y-2">
              <Label htmlFor="assignment_type">Assignment Type</Label>
              <Select
                value={formData.assignment_type}
                onValueChange={(value) =>
                  handleFieldChange(
                    "assignment_type",
                    value as "full" | "partial" | "split"
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assignment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Assignment</SelectItem>
                  <SelectItem value="partial">Partial Assignment</SelectItem>
                  <SelectItem value="split">Split Assignment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Weight Assignment - Show only for partial/split */}
            {(formData.assignment_type === "partial" ||
              formData.assignment_type === "split") && (
              <div className="space-y-2">
                <Label htmlFor="assigned_weight_kg">
                  Assigned Weight (kg)
                  {selectedCargo && (
                    <span className="text-sm text-gray-500 ml-2">
                      (Total: {selectedCargo.weight_kg} kg)
                    </span>
                  )}
                </Label>
                <Input
                  id="assigned_weight_kg"
                  type="number"
                  min="0"
                  step="0.1"
                  max={selectedCargo?.weight_kg || undefined}
                  value={formData.assigned_weight_kg}
                  onChange={(e) =>
                    handleFieldChange("assigned_weight_kg", e.target.value)
                  }
                  className={errors.assigned_weight_kg ? "border-red-500" : ""}
                  placeholder="Enter weight in kg"
                />
                {errors.assigned_weight_kg && (
                  <p className="text-sm text-red-500">
                    {errors.assigned_weight_kg}
                  </p>
                )}
              </div>
            )}

            {/* Volume Assignment - Show only for partial/split */}
            {(formData.assignment_type === "partial" ||
              formData.assignment_type === "split") && (
              <div className="space-y-2">
                <Label htmlFor="assigned_volume">
                  Assigned Volume (m³)
                  {selectedCargo?.volume && (
                    <span className="text-sm text-gray-500 ml-2">
                      (Total: {selectedCargo.volume} m³)
                    </span>
                  )}
                </Label>
                <Input
                  id="assigned_volume"
                  type="number"
                  min="0"
                  step="0.1"
                  max={selectedCargo?.volume || undefined}
                  value={formData.assigned_volume}
                  onChange={(e) =>
                    handleFieldChange("assigned_volume", e.target.value)
                  }
                  className={errors.assigned_volume ? "border-red-500" : ""}
                  placeholder="Enter volume in m³"
                />
                {errors.assigned_volume && (
                  <p className="text-sm text-red-500">
                    {errors.assigned_volume}
                  </p>
                )}
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => handleFieldChange("notes", e.target.value)}
                placeholder="Add any additional notes for this assignment"
              />
            </div>
          </CardContent>
        </Card>

        {/* Assignment Info */}
        {mode === "edit" && assignment && (
          <Card>
            <CardHeader>
              <CardTitle>{t("adminAssignments.assignmentInfo")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">{t("common.status")}:</span>
                  <StatusBadge status={assignment.assignment_status} />
                </div>
                <div>
                  <span className="font-medium">
                    {t("adminAssignments.createdAt")}:
                  </span>
                  {assignment.created_at
                    ? new Date(assignment.created_at).toLocaleDateString()
                    : t("common.notAvailable")}
                </div>
                {assignment.expires_at && (
                  <div className="col-span-2">
                    <span className="font-medium">
                      {t("adminAssignments.expiresAt")}:
                    </span>
                    {new Date(assignment.expires_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {mode === "create"
                  ? t("adminAssignments.creating")
                  : t("adminAssignments.updating")}
              </>
            ) : mode === "create" ? (
              t("adminAssignments.createAssignment")
            ) : (
              t("adminAssignments.updateAssignment")
            )}
          </Button>
        </div>
      </form>
    </ModernModel>
  );
}
