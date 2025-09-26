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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  ChevronsUpDown,
  Check,
  Building,
} from "lucide-react";
import {
  useCreateAssignment,
  useCreateSplitAssignment,
  useUpdateDeliveryAssignment,
} from "@/lib/api/hooks/assignmentHooks";
import { useUnassignedCargos, useCargoById } from "@/lib/api/hooks/cargoHooks";
import { useAvailableDriversWithoutAssignments } from "@/lib/api/hooks/driverHooks";
import { useAvailableVehiclesWithoutAssignments } from "@/lib/api/hooks/vehicleHooks";
import { CargoStatus, VehicleStatus } from "@/types/shared";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { customToast } from "@/lib/utils/toast";
import ModernModel from "@/components/modal/ModernModel";
import { DriverAssignment } from "@/lib/api/services/deliveryAssignmentService";

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

  // Search states for dropdowns
  const [cargoSearchOpen, setCargoSearchOpen] = useState(false);
  const [driverSearchOpen, setDriverSearchOpen] = useState(false);
  const [vehicleSearchOpen, setVehicleSearchOpen] = useState(false);
  const [splitDriverSearchOpen, setSplitDriverSearchOpen] = useState<
    Record<number, boolean>
  >({});
  const [splitVehicleSearchOpen, setSplitVehicleSearchOpen] = useState<
    Record<number, boolean>
  >({});

  // Split assignment state
  const [splitAssignments, setSplitAssignments] = useState<DriverAssignment[]>([
    { driver_id: "", vehicle_id: "", weight_kg: 0, volume: 0 },
    { driver_id: "", vehicle_id: "", weight_kg: 0, volume: 0 },
  ]);
  const [splitErrors, setSplitErrors] = useState<Record<string, string>>({});

  // API hooks
  const createAssignmentMutation = useCreateAssignment();
  const createSplitAssignmentMutation = useCreateSplitAssignment();
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

  // Auto-fill recommended vehicle and assignment type
  useEffect(() => {
    if (
      currentCargo &&
      filteredVehicles.length > 0 &&
      !formData.vehicle_id &&
      !formData.assignment_type
    ) {
      const suitableVehicles = filteredVehicles.filter(
        (vehicle: any) =>
          currentCargo.weight_kg <=
          (vehicle.capacity_kg || vehicle.capacity || 0)
      );

      if (suitableVehicles.length === 0) {
        // No single vehicle can carry - recommend split assignment
        setFormData((prev) => ({ ...prev, assignment_type: "split" }));
      } else {
        // Find the best vehicle (most efficient)
        const bestVehicle = suitableVehicles.reduce(
          (best: any, vehicle: any) => {
            if (!best) return vehicle;
            const bestEfficiency =
              currentCargo.weight_kg / (best.capacity_kg || best.capacity || 1);
            const vehicleEfficiency =
              currentCargo.weight_kg /
              (vehicle.capacity_kg || vehicle.capacity || 1);
            return vehicleEfficiency > bestEfficiency ? vehicle : best;
          },
          null
        );

        if (bestVehicle) {
          setFormData((prev) => ({
            ...prev,
            vehicle_id: bestVehicle.id,
            assignment_type: "full",
          }));
        }
      }
    }
  }, [
    currentCargo,
    filteredVehicles,
    formData.vehicle_id,
    formData.assignment_type,
  ]);

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.cargo_id) {
      newErrors.cargo_id = t("validation.required");
    }

    // For split assignments, validate split assignments
    if (formData.assignment_type === "split") {
      return validateSplitAssignments();
    }

    // For regular assignments
    if (!formData.driver_id) {
      newErrors.driver_id = t("validation.required");
    }
    if (!formData.vehicle_id) {
      newErrors.vehicle_id = t("validation.required");
    }

    // Validate assignment type specific fields
    if (formData.assignment_type === "partial") {
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

  // Validate split assignments
  const validateSplitAssignments = () => {
    const newErrors: Record<string, string> = {};
    const newSplitErrors: Record<string, string> = {};

    // Check minimum and maximum drivers (2-5)
    const validAssignments = splitAssignments.filter(
      (assignment) => assignment.driver_id && assignment.vehicle_id
    );

    if (validAssignments.length < 2) {
      newErrors.split_assignments =
        "Split assignment requires at least 2 drivers";
    } else if (validAssignments.length > 5) {
      newErrors.split_assignments =
        "Split assignment cannot have more than 5 drivers";
    }

    // Validate each assignment
    validAssignments.forEach((assignment, index) => {
      if (!assignment.driver_id) {
        newSplitErrors[`driver_${index}`] = "Driver is required";
      }
      if (!assignment.vehicle_id) {
        newSplitErrors[`vehicle_${index}`] = "Vehicle is required";
      }
      if (!assignment.weight_kg || assignment.weight_kg <= 0) {
        newSplitErrors[`weight_${index}`] = "Weight must be greater than 0";
      }
    });

    // Check total weight matches cargo weight
    const totalWeight = validAssignments.reduce(
      (sum, assignment) => sum + assignment.weight_kg,
      0
    );
    const cargoWeight = currentCargo?.weight_kg || 0;

    if (totalWeight !== cargoWeight) {
      newErrors.split_assignments = `Total weight (${totalWeight}kg) must equal cargo weight (${cargoWeight}kg)`;
    }

    // Check total volume if cargo has volume
    if (currentCargo?.volume) {
      const totalVolume = validAssignments.reduce(
        (sum, assignment) => sum + (assignment.volume || 0),
        0
      );
      const cargoVolume = currentCargo.volume;

      if (totalVolume !== cargoVolume) {
        newErrors.split_assignments = `Total volume (${totalVolume}m³) must equal cargo volume (${cargoVolume}m³)`;
      }
    }

    // Check vehicle capacities
    validAssignments.forEach((assignment, index) => {
      const vehicle = allVehicles.find((v) => v.id === assignment.vehicle_id);
      if (
        vehicle &&
        assignment.weight_kg > (vehicle.capacity_kg || vehicle.capacity || 0)
      ) {
        newSplitErrors[
          `capacity_${index}`
        ] = `Weight exceeds vehicle capacity (${
          vehicle.capacity_kg || vehicle.capacity
        }kg)`;
      }
    });

    setErrors(newErrors);
    setSplitErrors(newSplitErrors);
    return (
      Object.keys(newErrors).length === 0 &&
      Object.keys(newSplitErrors).length === 0
    );
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
        if (formData.assignment_type === "split") {
          // Handle split assignment
          const validAssignments = splitAssignments.filter(
            (assignment) => assignment.driver_id && assignment.vehicle_id
          );

          const splitAssignmentData = {
            cargo_id: formData.cargo_id,
            driver_assignments: validAssignments,
            notes: formData.notes,
          };

          await createSplitAssignmentMutation.mutateAsync(splitAssignmentData);
          customToast.success("Split assignment created successfully");
        } else {
          // Handle regular assignment
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
        }
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

  // Handle split assignment changes
  const handleSplitAssignmentChange = (
    index: number,
    field: keyof DriverAssignment,
    value: string | number
  ) => {
    setSplitAssignments((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });

    // Clear errors when field is updated
    const errorKey = `${field}_${index}`;
    if (splitErrors[errorKey]) {
      setSplitErrors((prev) => ({ ...prev, [errorKey]: "" }));
    }
  };

  // Add new split assignment
  const addSplitAssignment = () => {
    if (splitAssignments.length < 5) {
      setSplitAssignments((prev) => [
        ...prev,
        { driver_id: "", vehicle_id: "", weight_kg: 0, volume: 0 },
      ]);
    }
  };

  // Remove split assignment
  const removeSplitAssignment = (index: number) => {
    if (splitAssignments.length > 2) {
      setSplitAssignments((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Helper function to get display value for searchable dropdowns
  const getDisplayValue = (item: any, type: "cargo" | "driver" | "vehicle") => {
    if (!item) return "";

    switch (type) {
      case "cargo":
        return `${
          item.cargo_number || `Cargo #${item.id?.slice(-8) || "Unknown"}`
        } - ${item.weight_kg || 0}kg - ${
          item.pickup_date
            ? new Date(item.pickup_date).toLocaleDateString()
            : "Unknown date"
        }`;
      case "driver": {
        const driverName =
          item.user?.full_name || item.name || "Unknown Driver";
        const branchInfo = item.branch
          ? ` (${item.branch.name} - ${item.branch.code_number})`
          : "";
        return `${driverName}${branchInfo} - ${
          item.user?.phone || item.phone || "No phone"
        } - Rating: ${item.rating || "N/A"}`;
      }
      case "vehicle":
        return `${item.make || "Unknown"} ${item.model || "Model"} - ${
          item.plate_number || "No plate"
        } - ${item.capacity_kg || item.capacity || 0}kg - ${
          item.type || "Unknown type"
        }`;
      default:
        return "";
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
                <Popover
                  open={cargoSearchOpen}
                  onOpenChange={setCargoSearchOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={cargoSearchOpen}
                      className={`w-full justify-between ${
                        errors.cargo_id ? "border-red-500" : ""
                      }`}
                      disabled={mode === "edit"}
                    >
                      {formData.cargo_id
                        ? getDisplayValue(
                            filteredCargos.find(
                              (cargo: any) => cargo.id === formData.cargo_id
                            ) || null,
                            "cargo"
                          )
                        : t("adminAssignments.selectCargoPlaceholder")}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search cargos..." />
                      <CommandList>
                        <CommandEmpty>No cargo found.</CommandEmpty>
                        <CommandGroup>
                          {cargosLoading ? (
                            <CommandItem disabled>
                              {t("common.loading")}...
                            </CommandItem>
                          ) : filteredCargos.length === 0 ? (
                            <CommandItem disabled>
                              {t("adminAssignments.noCargosAvailable")}
                            </CommandItem>
                          ) : (
                            filteredCargos.map((cargo: any) => (
                              <CommandItem
                                key={cargo.id}
                                value={getDisplayValue(cargo, "cargo")}
                                onSelect={() => {
                                  handleFieldChange("cargo_id", cargo.id);
                                  setCargoSearchOpen(false);
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    formData.cargo_id === cargo.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  }`}
                                />
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
                              </CommandItem>
                            ))
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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

            {/* Available Vehicles for Decision Making */}
            {currentCargo && (
              <div className="space-y-3">
                <Label>Available Vehicles for Assignment</Label>

                {/* Assignment Recommendation */}
                {(() => {
                  const suitableVehicles = filteredVehicles.filter(
                    (vehicle: any) =>
                      currentCargo.weight_kg <=
                      (vehicle.capacity_kg || vehicle.capacity || 0)
                  );
                  const bestVehicle = suitableVehicles.reduce(
                    (best: any, vehicle: any) => {
                      if (!best) return vehicle;
                      const bestEfficiency =
                        currentCargo.weight_kg /
                        (best.capacity_kg || best.capacity || 1);
                      const vehicleEfficiency =
                        currentCargo.weight_kg /
                        (vehicle.capacity_kg || vehicle.capacity || 1);
                      return vehicleEfficiency > bestEfficiency
                        ? vehicle
                        : best;
                    },
                    null
                  );

                  if (suitableVehicles.length === 0) {
                    return (
                      <Alert className="border-orange-500 bg-orange-50">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        <AlertDescription className="text-orange-700">
                          <div className="font-medium">
                            No single vehicle can carry this cargo
                          </div>
                          <div className="text-sm mt-1">
                            <strong>Recommended:</strong> Use "Split Assignment"
                            to divide the cargo ({currentCargo.weight_kg}kg)
                            among multiple vehicles
                          </div>
                        </AlertDescription>
                      </Alert>
                    );
                  } else if (suitableVehicles.length === 1) {
                    return (
                      <Alert className="border-blue-500 bg-blue-50">
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                        <AlertDescription className="text-blue-700">
                          <div className="font-medium">
                            Perfect Match Found!
                          </div>
                          <div className="text-sm mt-1">
                            <strong>Recommended:</strong> Use "Full Assignment"
                            with {bestVehicle.make} {bestVehicle.model}
                            (Capacity:{" "}
                            {bestVehicle.capacity_kg || bestVehicle.capacity}kg)
                          </div>
                        </AlertDescription>
                      </Alert>
                    );
                  } else {
                    return (
                      <Alert className="border-green-500 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <AlertDescription className="text-green-700">
                          <div className="font-medium">
                            Multiple Options Available
                          </div>
                          <div className="text-sm mt-1">
                            <strong>Recommended:</strong> Use "Full Assignment"
                            with {bestVehicle.make} {bestVehicle.model}
                            (Best efficiency:{" "}
                            {(
                              (currentCargo.weight_kg /
                                (bestVehicle.capacity_kg ||
                                  bestVehicle.capacity ||
                                  1)) *
                              100
                            ).toFixed(1)}
                            % capacity usage)
                          </div>
                        </AlertDescription>
                      </Alert>
                    );
                  }
                })()}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                  {vehiclesLoading ? (
                    <div className="col-span-2 text-center text-gray-500 py-4">
                      Loading vehicles...
                    </div>
                  ) : filteredVehicles.length === 0 ? (
                    <div className="col-span-2 text-center text-gray-500 py-4">
                      No vehicles available
                    </div>
                  ) : (
                    filteredVehicles.map((vehicle: any) => {
                      const canCarryFull =
                        currentCargo.weight_kg <=
                        (vehicle.capacity_kg || vehicle.capacity || 0);
                      const capacityPercentage = (
                        (currentCargo.weight_kg /
                          (vehicle.capacity_kg || vehicle.capacity || 1)) *
                        100
                      ).toFixed(1);

                      // Determine if this is the best option
                      const suitableVehicles = filteredVehicles.filter(
                        (v: any) =>
                          currentCargo.weight_kg <=
                          (v.capacity_kg || v.capacity || 0)
                      );
                      const isBestOption =
                        suitableVehicles.length > 0 &&
                        vehicle.id ===
                          suitableVehicles.reduce((best: any, v: any) => {
                            if (!best) return v;
                            const bestEfficiency =
                              currentCargo.weight_kg /
                              (best.capacity_kg || best.capacity || 1);
                            const vehicleEfficiency =
                              currentCargo.weight_kg /
                              (v.capacity_kg || v.capacity || 1);
                            return vehicleEfficiency > bestEfficiency
                              ? v
                              : best;
                          }, null).id;

                      return (
                        <div
                          key={vehicle.id}
                          className={`p-3 rounded-lg border-2 relative ${
                            isBestOption
                              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                              : canCarryFull
                              ? "border-green-200 bg-green-50"
                              : "border-red-200 bg-red-50"
                          }`}
                        >
                          {isBestOption && (
                            <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                              BEST
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {vehicle.make} {vehicle.model}
                              </div>
                              <div className="text-xs text-gray-600">
                                {vehicle.plate_number} • {vehicle.type}
                              </div>
                              <div className="text-xs font-medium">
                                Capacity:{" "}
                                {vehicle.capacity_kg || vehicle.capacity}kg
                              </div>
                            </div>
                            <div className="text-right">
                              <div
                                className={`text-xs font-medium ${
                                  isBestOption
                                    ? "text-blue-600"
                                    : canCarryFull
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {isBestOption
                                  ? "⭐ Recommended"
                                  : canCarryFull
                                  ? "✓ Can carry"
                                  : "✗ Too small"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {capacityPercentage}% of capacity
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Assignment Type Guidance */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Assignment Type Guide:
                  </div>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>
                        <strong>Full Assignment:</strong> One vehicle carries
                        the entire cargo
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>
                        <strong>Partial Assignment:</strong> One vehicle carries
                        part of the cargo
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>
                        <strong>Split Assignment:</strong> Multiple vehicles
                        share the cargo
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Assignment Type Selection */}
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
          </CardContent>
        </Card>

        {/* Driver Selection - Hide for split assignments */}
        {formData.assignment_type !== "split" && (
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
                <Popover
                  open={driverSearchOpen}
                  onOpenChange={setDriverSearchOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={driverSearchOpen}
                      className={`w-full justify-between ${
                        errors.driver_id ? "border-red-500" : ""
                      }`}
                    >
                      {formData.driver_id
                        ? getDisplayValue(
                            filteredDrivers.find(
                              (driver: any) => driver.id === formData.driver_id
                            ) || null,
                            "driver"
                          )
                        : t("adminAssignments.selectDriverPlaceholder")}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search drivers..." />
                      <CommandList>
                        <CommandEmpty>No driver found.</CommandEmpty>
                        <CommandGroup>
                          {driversLoading ? (
                            <CommandItem disabled>
                              {t("common.loading")}...
                            </CommandItem>
                          ) : filteredDrivers.length === 0 ? (
                            <CommandItem disabled>
                              {t("adminAssignments.noDriversAvailable")}
                            </CommandItem>
                          ) : (
                            filteredDrivers.map((driver: any) => (
                              <CommandItem
                                key={driver.id}
                                value={getDisplayValue(driver, "driver")}
                                onSelect={() => {
                                  handleFieldChange("driver_id", driver.id);
                                  setDriverSearchOpen(false);
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    formData.driver_id === driver.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  }`}
                                />
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {driver.user?.full_name || driver.name}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {driver.user?.phone || driver.phone} •
                                      Rating: {driver.rating || "N/A"}
                                    </span>
                                    {driver.branch && (
                                      <span className="text-xs text-blue-600 flex items-center gap-1">
                                        <Building className="h-3 w-3" />
                                        {driver.branch.name} -{" "}
                                        {driver.branch.code_number}
                                      </span>
                                    )}
                                  </div>
                                  <Badge variant="outline" className="ml-2">
                                    {driver.total_deliveries || 0} deliveries
                                  </Badge>
                                </div>
                              </CommandItem>
                            ))
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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
                          <span className="font-medium">
                            {t("common.name")}:
                          </span>{" "}
                          {selectedDriver.user?.full_name ||
                            selectedDriver.name}
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
        )}

        {/* Vehicle Selection - Hide for split assignments */}
        {formData.assignment_type !== "split" && (
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
                <Popover
                  open={vehicleSearchOpen}
                  onOpenChange={setVehicleSearchOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={vehicleSearchOpen}
                      className={`w-full justify-between ${
                        errors.vehicle_id ? "border-red-500" : ""
                      }`}
                    >
                      {formData.vehicle_id
                        ? getDisplayValue(
                            filteredVehicles.find(
                              (vehicle: any) =>
                                vehicle.id === formData.vehicle_id
                            ) || null,
                            "vehicle"
                          )
                        : t("adminAssignments.selectVehiclePlaceholder")}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search vehicles..." />
                      <CommandList>
                        <CommandEmpty>No vehicle found.</CommandEmpty>
                        <CommandGroup>
                          {vehiclesLoading ? (
                            <CommandItem disabled>
                              {t("common.loading")}...
                            </CommandItem>
                          ) : filteredVehicles.length === 0 ? (
                            <CommandItem disabled>
                              {t("adminAssignments.noVehiclesAvailable")}
                            </CommandItem>
                          ) : (
                            filteredVehicles.map((vehicle: any) => (
                              <CommandItem
                                key={vehicle.id}
                                value={getDisplayValue(vehicle, "vehicle")}
                                onSelect={() => {
                                  handleFieldChange("vehicle_id", vehicle.id);
                                  setVehicleSearchOpen(false);
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    formData.vehicle_id === vehicle.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  }`}
                                />
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
                              </CommandItem>
                            ))
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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
        )}

        {/* Assignment Configuration - Dynamic based on assignment type */}
        {formData.assignment_type === "partial" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Partial Assignment Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Weight Assignment */}
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

              {/* Volume Assignment */}
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
            </CardContent>
          </Card>
        )}

        {/* Notes Section - Show for all assignment types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent>
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

        {/* Split Assignment Configuration */}
        {formData.assignment_type === "split" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Split Assignment Configuration
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSplitAssignment}
                    disabled={splitAssignments.length >= 5}
                  >
                    Add Driver
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Split Assignment Summary */}
              {currentCargo && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="font-medium">
                        Split Assignment Requirements
                      </div>
                      <div className="text-sm">
                        <div>
                          Total Cargo Weight:{" "}
                          <span className="font-bold">
                            {currentCargo.weight_kg} kg
                          </span>
                        </div>
                        {currentCargo.volume && (
                          <div>
                            Total Cargo Volume:{" "}
                            <span className="font-bold">
                              {currentCargo.volume} m³
                            </span>
                          </div>
                        )}
                        <div>
                          Drivers Required:{" "}
                          <span className="font-bold">2-5 drivers</span>
                        </div>
                        <div>Total assigned weight must equal cargo weight</div>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Split Assignment Errors */}
              {errors.split_assignments && (
                <Alert className="border-red-500 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-700">
                    {errors.split_assignments}
                  </AlertDescription>
                </Alert>
              )}

              {/* Split Assignments List */}
              <div className="space-y-4">
                {splitAssignments.map((assignment, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                          Driver Assignment #{index + 1}
                        </CardTitle>
                        {splitAssignments.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSplitAssignment(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Driver Selection */}
                        <div className="space-y-2">
                          <Label>Driver</Label>
                          <Popover
                            open={splitDriverSearchOpen[index] || false}
                            onOpenChange={(open) =>
                              setSplitDriverSearchOpen((prev) => ({
                                ...prev,
                                [index]: open,
                              }))
                            }
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={
                                  splitDriverSearchOpen[index] || false
                                }
                                className={`w-full justify-between ${
                                  splitErrors[`driver_${index}`]
                                    ? "border-red-500"
                                    : ""
                                }`}
                              >
                                {assignment.driver_id
                                  ? getDisplayValue(
                                      filteredDrivers.find(
                                        (driver: any) =>
                                          driver.id === assignment.driver_id
                                      ) || null,
                                      "driver"
                                    )
                                  : "Select driver"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Search drivers..." />
                                <CommandList>
                                  <CommandEmpty>No driver found.</CommandEmpty>
                                  <CommandGroup>
                                    {filteredDrivers.map((driver: any) => (
                                      <CommandItem
                                        key={driver.id}
                                        value={getDisplayValue(
                                          driver,
                                          "driver"
                                        )}
                                        onSelect={() => {
                                          handleSplitAssignmentChange(
                                            index,
                                            "driver_id",
                                            driver.id
                                          );
                                          setSplitDriverSearchOpen((prev) => ({
                                            ...prev,
                                            [index]: false,
                                          }));
                                        }}
                                      >
                                        <Check
                                          className={`mr-2 h-4 w-4 ${
                                            assignment.driver_id === driver.id
                                              ? "opacity-100"
                                              : "opacity-0"
                                          }`}
                                        />
                                        <div className="flex items-center justify-between w-full">
                                          <div className="flex flex-col">
                                            <span className="font-medium">
                                              {driver.user?.full_name ||
                                                driver.name}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                              {driver.user?.phone ||
                                                driver.phone}
                                            </span>
                                            {driver.branch && (
                                              <span className="text-xs text-blue-600 flex items-center gap-1">
                                                <Building className="h-3 w-3" />
                                                {driver.branch.name} -{" "}
                                                {driver.branch.code_number}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          {splitErrors[`driver_${index}`] && (
                            <p className="text-sm text-red-500">
                              {splitErrors[`driver_${index}`]}
                            </p>
                          )}
                        </div>

                        {/* Vehicle Selection */}
                        <div className="space-y-2">
                          <Label>Vehicle</Label>
                          <Popover
                            open={splitVehicleSearchOpen[index] || false}
                            onOpenChange={(open) =>
                              setSplitVehicleSearchOpen((prev) => ({
                                ...prev,
                                [index]: open,
                              }))
                            }
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={
                                  splitVehicleSearchOpen[index] || false
                                }
                                className={`w-full justify-between ${
                                  splitErrors[`vehicle_${index}`]
                                    ? "border-red-500"
                                    : ""
                                }`}
                              >
                                {assignment.vehicle_id
                                  ? getDisplayValue(
                                      filteredVehicles.find(
                                        (vehicle: any) =>
                                          vehicle.id === assignment.vehicle_id
                                      ) || null,
                                      "vehicle"
                                    )
                                  : "Select vehicle"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Search vehicles..." />
                                <CommandList>
                                  <CommandEmpty>No vehicle found.</CommandEmpty>
                                  <CommandGroup>
                                    {filteredVehicles.map((vehicle: any) => (
                                      <CommandItem
                                        key={vehicle.id}
                                        value={getDisplayValue(
                                          vehicle,
                                          "vehicle"
                                        )}
                                        onSelect={() => {
                                          handleSplitAssignmentChange(
                                            index,
                                            "vehicle_id",
                                            vehicle.id
                                          );
                                          setSplitVehicleSearchOpen((prev) => ({
                                            ...prev,
                                            [index]: false,
                                          }));
                                        }}
                                      >
                                        <Check
                                          className={`mr-2 h-4 w-4 ${
                                            assignment.vehicle_id === vehicle.id
                                              ? "opacity-100"
                                              : "opacity-0"
                                          }`}
                                        />
                                        <div className="flex items-center justify-between w-full">
                                          <div className="flex flex-col">
                                            <span className="font-medium">
                                              {vehicle.make} {vehicle.model}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                              {vehicle.plate_number} •{" "}
                                              {vehicle.capacity_kg ||
                                                vehicle.capacity}
                                              kg
                                            </span>
                                          </div>
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          {splitErrors[`vehicle_${index}`] && (
                            <p className="text-sm text-red-500">
                              {splitErrors[`vehicle_${index}`]}
                            </p>
                          )}
                        </div>

                        {/* Weight Assignment */}
                        <div className="space-y-2">
                          <Label>
                            Weight (kg)
                            {currentCargo && (
                              <span className="text-sm text-gray-500 ml-2">
                                (Max: {currentCargo.weight_kg} kg)
                              </span>
                            )}
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.1"
                            max={currentCargo?.weight_kg || undefined}
                            value={assignment.weight_kg || ""}
                            onChange={(e) =>
                              handleSplitAssignmentChange(
                                index,
                                "weight_kg",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className={
                              splitErrors[`weight_${index}`]
                                ? "border-red-500"
                                : ""
                            }
                            placeholder="Enter weight in kg"
                          />
                          {splitErrors[`weight_${index}`] && (
                            <p className="text-sm text-red-500">
                              {splitErrors[`weight_${index}`]}
                            </p>
                          )}
                        </div>

                        {/* Volume Assignment */}
                        <div className="space-y-2">
                          <Label>
                            Volume (m³)
                            {currentCargo?.volume && (
                              <span className="text-sm text-gray-500 ml-2">
                                (Max: {currentCargo.volume} m³)
                              </span>
                            )}
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.1"
                            max={currentCargo?.volume || undefined}
                            value={assignment.volume || ""}
                            onChange={(e) =>
                              handleSplitAssignmentChange(
                                index,
                                "volume",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            placeholder="Enter volume in m³ (optional)"
                          />
                        </div>
                      </div>

                      {/* Capacity Warning */}
                      {assignment.vehicle_id &&
                        assignment.weight_kg > 0 &&
                        (() => {
                          const vehicle = allVehicles.find(
                            (v) => v.id === assignment.vehicle_id
                          );
                          const capacity =
                            vehicle?.capacity_kg || vehicle?.capacity || 0;
                          if (assignment.weight_kg > capacity) {
                            return (
                              <Alert className="border-red-500 bg-red-50">
                                <AlertCircle className="h-4 w-4 text-red-500" />
                                <AlertDescription className="text-red-700">
                                  Weight ({assignment.weight_kg}kg) exceeds
                                  vehicle capacity ({capacity}kg)
                                </AlertDescription>
                              </Alert>
                            );
                          }
                          return null;
                        })()}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Split Assignment Summary */}
              {(() => {
                const validAssignments = splitAssignments.filter(
                  (assignment) => assignment.driver_id && assignment.vehicle_id
                );
                const totalWeight = validAssignments.reduce(
                  (sum, assignment) => sum + assignment.weight_kg,
                  0
                );
                const totalVolume = validAssignments.reduce(
                  (sum, assignment) => sum + (assignment.volume || 0),
                  0
                );

                return (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="font-medium text-blue-900">
                          Split Assignment Summary
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Total Drivers:</span>{" "}
                            {validAssignments.length}
                          </div>
                          <div>
                            <span className="font-medium">Total Weight:</span>{" "}
                            {totalWeight} kg
                          </div>
                          {currentCargo?.volume && (
                            <div className="col-span-2">
                              <span className="font-medium">Total Volume:</span>{" "}
                              {totalVolume} m³
                            </div>
                          )}
                        </div>
                        {currentCargo && (
                          <div className="text-sm text-blue-700 mt-2">
                            {totalWeight === currentCargo.weight_kg ? (
                              <span className="text-green-600">
                                ✓ Weight allocation is correct
                              </span>
                            ) : (
                              <span className="text-red-600">
                                ⚠ Weight allocation mismatch (Need:{" "}
                                {currentCargo.weight_kg}kg, Assigned:{" "}
                                {totalWeight}kg)
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}
            </CardContent>
          </Card>
        )}

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
                  ? "Creating Assignment..."
                  : "Updating Assignment..."}
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
