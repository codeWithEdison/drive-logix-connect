import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Check,
  Building,
  Search,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
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

  // Search states for comboboxes
  const [cargoSearch, setCargoSearch] = useState("");
  const [showCargoDropdown, setShowCargoDropdown] = useState(false);
  const [driverSearch, setDriverSearch] = useState("");
  const [showDriverDropdown, setShowDriverDropdown] = useState(false);
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
  const [splitDriverSearch, setSplitDriverSearch] = useState<
    Record<number, string>
  >({});
  const [showSplitDriverDropdown, setShowSplitDriverDropdown] = useState<
    Record<number, boolean>
  >({});
  const [splitVehicleSearch, setSplitVehicleSearch] = useState<
    Record<number, string>
  >({});
  const [showSplitVehicleDropdown, setShowSplitVehicleDropdown] = useState<
    Record<number, boolean>
  >({});

  // Assignment type combobox state
  const [assignmentTypeSearch, setAssignmentTypeSearch] = useState("");
  const [showAssignmentTypeDropdown, setShowAssignmentTypeDropdown] =
    useState(false);

  // Refs for input elements to calculate dropdown positions
  const cargoInputRef = useRef<HTMLInputElement>(null);
  const driverInputRef = useRef<HTMLInputElement>(null);
  const vehicleInputRef = useRef<HTMLInputElement>(null);
  const assignmentTypeInputRef = useRef<HTMLInputElement>(null);
  const splitDriverInputRefs = useRef<Record<number, HTMLInputElement | null>>(
    {}
  );
  const splitVehicleInputRefs = useRef<Record<number, HTMLInputElement | null>>(
    {}
  );

  // Dropdown position states
  const [cargoDropdownPos, setCargoDropdownPos] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const [driverDropdownPos, setDriverDropdownPos] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const [vehicleDropdownPos, setVehicleDropdownPos] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const [assignmentTypeDropdownPos, setAssignmentTypeDropdownPos] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const [splitDriverDropdownPos, setSplitDriverDropdownPos] = useState<
    Record<number, { top: number; left: number; width: number }>
  >({});
  const [splitVehicleDropdownPos, setSplitVehicleDropdownPos] = useState<
    Record<number, { top: number; left: number; width: number }>
  >({});

  // Function to calculate dropdown position
  const calculateDropdownPosition = (
    inputRef: React.RefObject<HTMLInputElement>
  ) => {
    if (!inputRef.current) return { top: 0, left: 0, width: 0 };
    const rect = inputRef.current.getBoundingClientRect();
    // For fixed positioning, use viewport coordinates directly (no scroll offset needed)
    return {
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    };
  };

  // Update positions when dropdowns open
  useEffect(() => {
    if (showCargoDropdown && cargoInputRef.current) {
      setCargoDropdownPos(calculateDropdownPosition(cargoInputRef));
    }
  }, [showCargoDropdown]);

  useEffect(() => {
    if (showDriverDropdown && driverInputRef.current) {
      setDriverDropdownPos(calculateDropdownPosition(driverInputRef));
    }
  }, [showDriverDropdown]);

  useEffect(() => {
    if (showVehicleDropdown && vehicleInputRef.current) {
      setVehicleDropdownPos(calculateDropdownPosition(vehicleInputRef));
    }
  }, [showVehicleDropdown]);

  useEffect(() => {
    if (showAssignmentTypeDropdown && assignmentTypeInputRef.current) {
      setAssignmentTypeDropdownPos(
        calculateDropdownPosition(assignmentTypeInputRef)
      );
    }
  }, [showAssignmentTypeDropdown]);

  // Handle scroll and resize for all dropdowns
  useEffect(() => {
    const updatePositions = () => {
      if (showCargoDropdown && cargoInputRef.current) {
        setCargoDropdownPos(calculateDropdownPosition(cargoInputRef));
      }
      if (showDriverDropdown && driverInputRef.current) {
        setDriverDropdownPos(calculateDropdownPosition(driverInputRef));
      }
      if (showVehicleDropdown && vehicleInputRef.current) {
        setVehicleDropdownPos(calculateDropdownPosition(vehicleInputRef));
      }
      if (showAssignmentTypeDropdown && assignmentTypeInputRef.current) {
        setAssignmentTypeDropdownPos(
          calculateDropdownPosition(assignmentTypeInputRef)
        );
      }
      // Update split assignment positions
      Object.keys(showSplitDriverDropdown).forEach((indexStr) => {
        const index = parseInt(indexStr);
        if (
          showSplitDriverDropdown[index] &&
          splitDriverInputRefs.current[index]
        ) {
          setSplitDriverDropdownPos((prev) => ({
            ...prev,
            [index]: calculateDropdownPosition({
              current: splitDriverInputRefs.current[index],
            }),
          }));
        }
      });
      Object.keys(showSplitVehicleDropdown).forEach((indexStr) => {
        const index = parseInt(indexStr);
        if (
          showSplitVehicleDropdown[index] &&
          splitVehicleInputRefs.current[index]
        ) {
          setSplitVehicleDropdownPos((prev) => ({
            ...prev,
            [index]: calculateDropdownPosition({
              current: splitVehicleInputRefs.current[index],
            }),
          }));
        }
      });
    };

    window.addEventListener("scroll", updatePositions, true);
    window.addEventListener("resize", updatePositions);

    return () => {
      window.removeEventListener("scroll", updatePositions, true);
      window.removeEventListener("resize", updatePositions);
    };
  }, [
    showCargoDropdown,
    showDriverDropdown,
    showVehicleDropdown,
    showAssignmentTypeDropdown,
    showSplitDriverDropdown,
    showSplitVehicleDropdown,
  ]);

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
      capacity_min: Math.round(currentCargo?.weight_kg ?? 0),
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
        const driverCode =
          item.code ||
          item.driver_code ||
          item.code_number ||
          item.employee_code ||
          item.unique_code ||
          item.user?.code ||
          item.user?.employee_code;
        const phone = item.user?.phone || item.phone || "No phone";
        return `${driverName}${branchInfo} - Code: ${
          driverCode || "N/A"
        } - Phone: ${phone} - Rating: ${item.rating || "N/A"}`;
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 backdrop-blur-sm border border-blue-100/50 shadow-lg">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl font-bold text-gray-900">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                {preselectedCargoId
                  ? t("adminAssignments.cargoInformation") ||
                    "Cargo Information"
                  : t("adminAssignments.selectCargo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {/* Cargo Selection - Only show when not preselected */}
              {!preselectedCargoId && (
                <div className="space-y-2">
                  <Label
                    htmlFor="cargo_id"
                    className="text-sm sm:text-base font-semibold"
                  >
                    {t("common.cargo")}
                  </Label>
                  <div className="relative">
                    <input
                      ref={cargoInputRef}
                      type="text"
                      value={
                        cargoSearch ||
                        (formData.cargo_id
                          ? getDisplayValue(
                              filteredCargos.find(
                                (cargo: any) => cargo.id === formData.cargo_id
                              ) || null,
                              "cargo"
                            )
                          : "")
                      }
                      onChange={(e) => {
                        setCargoSearch(e.target.value);
                        setShowCargoDropdown(true);
                      }}
                      onFocus={() => {
                        if (cargoInputRef.current) {
                          setCargoDropdownPos(
                            calculateDropdownPosition(cargoInputRef)
                          );
                        }
                        setShowCargoDropdown(true);
                      }}
                      disabled={mode === "edit"}
                      placeholder={t("adminAssignments.selectCargoPlaceholder")}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 pr-10 rounded-full text-xs sm:text-sm md:text-base font-semibold border ${
                        errors.cargo_id ? "border-red-500" : "border-gray-200"
                      } focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/80 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                    />
                    <div className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {cargoSearch && (
                        <button
                          onClick={() => {
                            setCargoSearch("");
                            setShowCargoDropdown(true);
                          }}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                          disabled={mode === "edit"}
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                        </button>
                      )}
                      <Search className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                    </div>

                    {/* Dropdown */}
                    {showCargoDropdown &&
                      mode !== "edit" &&
                      typeof document !== "undefined" &&
                      createPortal(
                        <motion.div
                          className="fixed z-[9999] bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-60 overflow-y-auto custom-scrollbar"
                          style={{
                            top: `${cargoDropdownPos.top}px`,
                            left: `${cargoDropdownPos.left}px`,
                            width: `${cargoDropdownPos.width}px`,
                          }}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          {cargosLoading ? (
                            <div className="p-3 sm:p-4 text-center text-xs sm:text-sm text-gray-500">
                              {t("common.loading")}...
                            </div>
                          ) : filteredCargos.length === 0 ? (
                            <div className="p-3 sm:p-4 text-center text-xs sm:text-sm text-gray-500">
                              {t("adminAssignments.noCargosAvailable")}
                            </div>
                          ) : (
                            filteredCargos
                              .filter((cargo: any) => {
                                if (!cargoSearch) return true;
                                const displayValue = getDisplayValue(
                                  cargo,
                                  "cargo"
                                ).toLowerCase();
                                return displayValue.includes(
                                  cargoSearch.toLowerCase()
                                );
                              })
                              .map((cargo: any) => (
                                <button
                                  key={cargo.id}
                                  onClick={() => {
                                    handleFieldChange("cargo_id", cargo.id);
                                    setCargoSearch("");
                                    setShowCargoDropdown(false);
                                  }}
                                  className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                                    formData.cargo_id === cargo.id
                                      ? "bg-blue-50"
                                      : ""
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <Check
                                      className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ${
                                        formData.cargo_id === cargo.id
                                          ? "opacity-100 text-blue-600"
                                          : "opacity-0"
                                      }`}
                                    />
                                    <div className="flex items-center justify-between w-full">
                                      <div className="flex flex-col">
                                        <span className="text-xs sm:text-sm font-medium text-gray-900">
                                          {cargo.cargo_number ||
                                            `Cargo #${cargo.id.slice(-8)}`}
                                        </span>
                                        <span className="text-[10px] sm:text-xs text-gray-500">
                                          {t("common.pickupDate") || "Pickup"}:{" "}
                                          {new Date(
                                            cargo.pickup_date
                                          ).toLocaleDateString()}
                                        </span>
                                      </div>
                                      <Badge
                                        variant="outline"
                                        className="ml-2 text-[10px] sm:text-xs"
                                      >
                                        {cargo.weight_kg}kg
                                      </Badge>
                                    </div>
                                  </div>
                                </button>
                              ))
                          )}
                        </motion.div>,
                        document.body
                      )}

                    {/* Click outside to close */}
                    {showCargoDropdown &&
                      typeof document !== "undefined" &&
                      createPortal(
                        <div
                          className="fixed inset-0 z-[9998]"
                          onClick={() => setShowCargoDropdown(false)}
                        />,
                        document.body
                      )}
                  </div>
                  {errors.cargo_id && (
                    <p className="text-xs sm:text-sm text-red-500 font-medium">
                      {errors.cargo_id}
                    </p>
                  )}
                </div>
              )}

              {/* Preselected Cargo Info */}
              {preselectedCargoId && (
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-semibold">
                    {t("common.cargo")}
                  </Label>
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/80 backdrop-blur-sm border border-blue-200/50 rounded-xl">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base font-semibold text-blue-900">
                          {preselectedCargoLoading ? (
                            t("common.loading") + "..."
                          ) : (
                            <>
                              {currentCargo?.cargo_number ||
                                `Cargo #${currentCargo?.id.slice(-8)}`}
                              <span className="text-xs sm:text-sm text-blue-700 ml-2">
                                ✓{" "}
                                {t("adminAssignments.automaticallySelected") ||
                                  "Automatically selected"}
                              </span>
                            </>
                          )}
                        </p>
                        {currentCargo && (
                          <p className="text-xs sm:text-sm text-blue-700 mt-1">
                            {t("common.weight")}: {currentCargo.weight_kg}kg •{" "}
                            {t("common.pickupDate")}:{" "}
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
                <Alert className="bg-gradient-to-br from-blue-50/80 to-indigo-50/60 backdrop-blur-sm border-blue-200/50 rounded-xl">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="text-sm sm:text-base font-semibold text-gray-900">
                        {t("adminAssignments.cargoDetails")}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">
                        {t("common.loading")}...
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : currentCargo ? (
                <Alert className="bg-gradient-to-br from-blue-50/80 to-indigo-50/60 backdrop-blur-sm border-blue-200/50 rounded-xl">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  <AlertDescription>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="text-sm sm:text-base font-semibold text-gray-900">
                        {t("adminAssignments.cargoDetails")}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                        <div className="col-span-1 sm:col-span-2">
                          <span className="font-semibold text-gray-700">
                            {t("common.cargoNumber")}:
                          </span>{" "}
                          <span className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            {currentCargo.cargo_number ||
                              `Cargo #${currentCargo.id.slice(-8)}`}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">
                            {t("common.type")}:
                          </span>{" "}
                          <span className="text-gray-600">
                            {currentCargo.type || t("common.notAvailable")}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">
                            {t("common.weight")}:
                          </span>{" "}
                          <span className="text-gray-600">
                            {currentCargo.weight_kg}kg
                          </span>
                        </div>
                        <div className="col-span-1 sm:col-span-2">
                          <span className="font-semibold text-gray-700">
                            {t("common.pickupAddress")}:
                          </span>{" "}
                          <span className="text-gray-600 break-words">
                            {currentCargo.pickup_address ||
                              t("common.notAvailable")}
                          </span>
                        </div>
                        <div className="col-span-1 sm:col-span-2">
                          <span className="font-semibold text-gray-700">
                            {t("common.destinationAddress")}:
                          </span>{" "}
                          <span className="text-gray-600 break-words">
                            {currentCargo.destination_address ||
                              t("common.notAvailable")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : null}

              {/* Available Vehicles for Decision Making */}
              {currentCargo && (
                <div className="space-y-3 sm:space-y-4">
                  <Label className="text-sm sm:text-base font-semibold">
                    {t("adminAssignments.availableVehiclesForAssignment") ||
                      "Available Vehicles for Assignment"}
                  </Label>

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
                        <Alert className="border-orange-500/50 bg-gradient-to-br from-orange-50/80 via-yellow-50/60 to-amber-50/80 backdrop-blur-sm rounded-xl">
                          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                          <AlertDescription className="text-orange-700">
                            <div className="text-sm sm:text-base font-semibold">
                              {t("adminAssignments.noSingleVehicleCanCarry") ||
                                "No single vehicle can carry this cargo"}
                            </div>
                            <div className="text-xs sm:text-sm mt-1.5 sm:mt-2">
                              <strong>
                                {t("adminAssignments.recommended") ||
                                  "Recommended"}
                                :
                              </strong>{" "}
                              {t("adminAssignments.useSplitAssignment") ||
                                'Use "Split Assignment"'}{" "}
                              {t("adminAssignments.toDivideCargo") ||
                                "to divide the cargo"}{" "}
                              ({currentCargo.weight_kg}kg){" "}
                              {t("adminAssignments.amongMultipleVehicles") ||
                                "among multiple vehicles"}
                            </div>
                          </AlertDescription>
                        </Alert>
                      );
                    } else if (suitableVehicles.length === 1) {
                      return (
                        <Alert className="border-blue-500/50 bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/80 backdrop-blur-sm rounded-xl">
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                          <AlertDescription className="text-blue-700">
                            <div className="text-sm sm:text-base font-semibold">
                              {t("adminAssignments.perfectMatchFound") ||
                                "Perfect Match Found!"}
                            </div>
                            <div className="text-xs sm:text-sm mt-1.5 sm:mt-2">
                              <strong>
                                {t("adminAssignments.recommended") ||
                                  "Recommended"}
                                :
                              </strong>{" "}
                              {t("adminAssignments.useFullAssignment") ||
                                'Use "Full Assignment"'}{" "}
                              {t("adminAssignments.with") || "with"}{" "}
                              {bestVehicle.make} {bestVehicle.model} (
                              {t("adminAssignments.capacity") || "Capacity"}:{" "}
                              {bestVehicle.capacity_kg || bestVehicle.capacity}
                              kg)
                            </div>
                          </AlertDescription>
                        </Alert>
                      );
                    } else {
                      return (
                        <Alert className="border-green-500/50 bg-gradient-to-br from-green-50/80 via-emerald-50/60 to-teal-50/80 backdrop-blur-sm rounded-xl">
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                          <AlertDescription className="text-green-700">
                            <div className="text-sm sm:text-base font-semibold">
                              {t("adminAssignments.multipleOptionsAvailable") ||
                                "Multiple Options Available"}
                            </div>
                            <div className="text-xs sm:text-sm mt-1.5 sm:mt-2">
                              <strong>
                                {t("adminAssignments.recommended") ||
                                  "Recommended"}
                                :
                              </strong>{" "}
                              {t("adminAssignments.useFullAssignment") ||
                                'Use "Full Assignment"'}{" "}
                              {t("adminAssignments.with") || "with"}{" "}
                              {bestVehicle.make} {bestVehicle.model} (
                              {t("adminAssignments.bestEfficiency") ||
                                "Best efficiency"}
                              :{" "}
                              {(
                                (currentCargo.weight_kg /
                                  (bestVehicle.capacity_kg ||
                                    bestVehicle.capacity ||
                                    1)) *
                                100
                              ).toFixed(1)}
                              %{" "}
                              {t("adminAssignments.capacityUsage") ||
                                "capacity usage"}
                              )
                            </div>
                          </AlertDescription>
                        </Alert>
                      );
                    }
                  })()}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 max-h-48 overflow-y-auto">
                    {vehiclesLoading ? (
                      <div className="col-span-2 text-center text-xs sm:text-sm text-gray-500 py-4">
                        {t("common.loading")}...
                      </div>
                    ) : filteredVehicles.length === 0 ? (
                      <div className="col-span-2 text-center text-xs sm:text-sm text-gray-500 py-4">
                        {t("adminAssignments.noVehiclesAvailable")}
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
                          <motion.div
                            key={vehicle.id}
                            className={`p-2.5 sm:p-3 rounded-xl border-2 relative backdrop-blur-sm ${
                              isBestOption
                                ? "border-blue-500/50 bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/80 ring-2 ring-blue-200/50"
                                : canCarryFull
                                ? "border-green-200/50 bg-gradient-to-br from-green-50/80 to-emerald-50/60"
                                : "border-red-200/50 bg-gradient-to-br from-red-50/80 to-orange-50/60"
                            }`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            {isBestOption && (
                              <div className="absolute -top-1.5 sm:-top-2 -right-1.5 sm:-right-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-semibold shadow-lg">
                                {t("adminAssignments.best") || "BEST"}
                              </div>
                            )}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-xs sm:text-sm text-gray-900 truncate">
                                  {vehicle.make} {vehicle.model}
                                </div>
                                <div className="text-[10px] sm:text-xs text-gray-600 truncate">
                                  {vehicle.plate_number} • {vehicle.type}
                                </div>
                                <div className="text-[10px] sm:text-xs font-semibold text-gray-700">
                                  {t("adminAssignments.capacity") || "Capacity"}
                                  : {vehicle.capacity_kg || vehicle.capacity}kg
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div
                                  className={`text-[10px] sm:text-xs font-semibold ${
                                    isBestOption
                                      ? "text-blue-600"
                                      : canCarryFull
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {isBestOption
                                    ? "⭐ " +
                                      (t("adminAssignments.recommended") ||
                                        "Recommended")
                                    : canCarryFull
                                    ? "✓ " +
                                      (t("adminAssignments.canCarry") ||
                                        "Can carry")
                                    : "✗ " +
                                      (t("adminAssignments.tooSmall") ||
                                        "Too small")}
                                </div>
                                <div className="text-[9px] sm:text-[10px] text-gray-500">
                                  {capacityPercentage}%{" "}
                                  {t("adminAssignments.ofCapacity") ||
                                    "of capacity"}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>

                  {/* Assignment Type Guidance */}
                  <div className="bg-gradient-to-br from-gray-50/80 to-slate-50/60 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-gray-200/50">
                    <div className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                      {t("adminAssignments.assignmentTypeGuide") ||
                        "Assignment Type Guide"}
                      :
                    </div>
                    <div className="space-y-1.5 sm:space-y-2 text-[10px] sm:text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-500 rounded-full flex-shrink-0"></div>
                        <span>
                          <strong>
                            {t("adminAssignments.fullAssignment") ||
                              "Full Assignment"}
                            :
                          </strong>{" "}
                          {t("adminAssignments.fullAssignmentDesc") ||
                            "One vehicle carries the entire cargo"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-yellow-500 rounded-full flex-shrink-0"></div>
                        <span>
                          <strong>
                            {t("adminAssignments.partialAssignment") ||
                              "Partial Assignment"}
                            :
                          </strong>{" "}
                          {t("adminAssignments.partialAssignmentDesc") ||
                            "One vehicle carries part of the cargo"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                        <span>
                          <strong>
                            {t("adminAssignments.splitAssignment") ||
                              "Split Assignment"}
                            :
                          </strong>{" "}
                          {t("adminAssignments.splitAssignmentDesc") ||
                            "Multiple vehicles share the cargo"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Assignment Type Selection - Searchable Combobox */}
              <div className="space-y-2">
                <Label
                  htmlFor="assignment_type"
                  className="text-sm sm:text-base font-semibold"
                >
                  {t("adminAssignments.assignmentType") || "Assignment Type"}
                </Label>
                <div className="relative">
                  <input
                    ref={assignmentTypeInputRef}
                    type="text"
                    value={
                      assignmentTypeSearch ||
                      (formData.assignment_type === "full"
                        ? t("adminAssignments.fullAssignment") ||
                          "Full Assignment"
                        : formData.assignment_type === "partial"
                        ? t("adminAssignments.partialAssignment") ||
                          "Partial Assignment"
                        : formData.assignment_type === "split"
                        ? t("adminAssignments.splitAssignment") ||
                          "Split Assignment"
                        : "")
                    }
                    onChange={(e) => {
                      setAssignmentTypeSearch(e.target.value);
                      setShowAssignmentTypeDropdown(true);
                    }}
                    onFocus={() => {
                      if (assignmentTypeInputRef.current) {
                        setAssignmentTypeDropdownPos(
                          calculateDropdownPosition(assignmentTypeInputRef)
                        );
                      }
                      setShowAssignmentTypeDropdown(true);
                    }}
                    placeholder={
                      t("adminAssignments.selectAssignmentType") ||
                      "Select assignment type"
                    }
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 pr-10 rounded-full text-xs sm:text-sm md:text-base font-semibold border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/80 backdrop-blur-sm"
                  />
                  <div className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {assignmentTypeSearch && (
                      <button
                        onClick={() => {
                          setAssignmentTypeSearch("");
                          setShowAssignmentTypeDropdown(true);
                        }}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                      </button>
                    )}
                    <Search className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                  </div>

                  {/* Dropdown */}
                  {showAssignmentTypeDropdown &&
                    typeof document !== "undefined" &&
                    createPortal(
                      <motion.div
                        className="fixed z-[9999] bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-60 overflow-y-auto custom-scrollbar"
                        style={{
                          top: `${assignmentTypeDropdownPos.top}px`,
                          left: `${assignmentTypeDropdownPos.left}px`,
                          width: `${assignmentTypeDropdownPos.width}px`,
                        }}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {[
                          {
                            value: "full",
                            label:
                              t("adminAssignments.fullAssignment") ||
                              "Full Assignment",
                            description:
                              t("adminAssignments.fullAssignmentDesc") ||
                              "One vehicle carries the entire cargo",
                          },
                          {
                            value: "partial",
                            label:
                              t("adminAssignments.partialAssignment") ||
                              "Partial Assignment",
                            description:
                              t("adminAssignments.partialAssignmentDesc") ||
                              "One vehicle carries part of the cargo",
                          },
                          {
                            value: "split",
                            label:
                              t("adminAssignments.splitAssignment") ||
                              "Split Assignment",
                            description:
                              t("adminAssignments.splitAssignmentDesc") ||
                              "Multiple vehicles share the cargo",
                          },
                        ]
                          .filter(
                            (option) =>
                              !assignmentTypeSearch ||
                              option.label
                                .toLowerCase()
                                .includes(assignmentTypeSearch.toLowerCase()) ||
                              option.value
                                .toLowerCase()
                                .includes(assignmentTypeSearch.toLowerCase())
                          )
                          .map((option) => (
                            <button
                              key={option.value}
                              onClick={() => {
                                handleFieldChange(
                                  "assignment_type",
                                  option.value as "full" | "partial" | "split"
                                );
                                setAssignmentTypeSearch("");
                                setShowAssignmentTypeDropdown(false);
                              }}
                              className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                                formData.assignment_type === option.value
                                  ? "bg-blue-50"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Check
                                  className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ${
                                    formData.assignment_type === option.value
                                      ? "opacity-100 text-blue-600"
                                      : "opacity-0"
                                  }`}
                                />
                                <div className="flex-1">
                                  <span className="text-xs sm:text-sm font-medium text-gray-900 block">
                                    {option.label}
                                  </span>
                                  <span className="text-[10px] sm:text-xs text-gray-500 block mt-0.5">
                                    {option.description}
                                  </span>
                                </div>
                              </div>
                            </button>
                          ))}
                      </motion.div>,
                      document.body
                    )}

                  {/* Click outside to close */}
                  {showAssignmentTypeDropdown &&
                    typeof document !== "undefined" &&
                    createPortal(
                      <div
                        className="fixed inset-0 z-[9998]"
                        onClick={() => setShowAssignmentTypeDropdown(false)}
                      />,
                      document.body
                    )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Driver Selection - Hide for split assignments */}
        {formData.assignment_type !== "split" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20 backdrop-blur-sm border border-green-100/50 shadow-lg">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl font-bold text-gray-900">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  {t("adminAssignments.selectDriver")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="driver_id"
                    className="text-sm sm:text-base font-semibold"
                  >
                    {t("common.driver")}
                  </Label>
                  <div className="relative">
                    <input
                      ref={driverInputRef}
                      type="text"
                      value={
                        driverSearch ||
                        (formData.driver_id
                          ? getDisplayValue(
                              filteredDrivers.find(
                                (driver: any) =>
                                  driver.id === formData.driver_id
                              ) || null,
                              "driver"
                            )
                          : "")
                      }
                      onChange={(e) => {
                        setDriverSearch(e.target.value);
                        setShowDriverDropdown(true);
                      }}
                      onFocus={() => {
                        if (driverInputRef.current) {
                          setDriverDropdownPos(
                            calculateDropdownPosition(driverInputRef)
                          );
                        }
                        setShowDriverDropdown(true);
                      }}
                      placeholder={t(
                        "adminAssignments.selectDriverPlaceholder"
                      )}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 pr-10 rounded-full text-xs sm:text-sm md:text-base font-semibold border ${
                        errors.driver_id ? "border-red-500" : "border-gray-200"
                      } focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/80 backdrop-blur-sm`}
                    />
                    <div className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {driverSearch && (
                        <button
                          onClick={() => {
                            setDriverSearch("");
                            setShowDriverDropdown(true);
                          }}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                        </button>
                      )}
                      <Search className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                    </div>

                    {/* Dropdown */}
                    {showDriverDropdown &&
                      typeof document !== "undefined" &&
                      createPortal(
                        <motion.div
                          className="fixed z-[9999] bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-60 overflow-y-auto custom-scrollbar"
                          style={{
                            top: `${driverDropdownPos.top}px`,
                            left: `${driverDropdownPos.left}px`,
                            width: `${driverDropdownPos.width}px`,
                          }}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          {driversLoading ? (
                            <div className="p-3 sm:p-4 text-center text-xs sm:text-sm text-gray-500">
                              {t("common.loading")}...
                            </div>
                          ) : filteredDrivers.length === 0 ? (
                            <div className="p-3 sm:p-4 text-center text-xs sm:text-sm text-gray-500">
                              {t("adminAssignments.noDriversAvailable")}
                            </div>
                          ) : (
                            filteredDrivers
                              .filter((driver: any) => {
                                if (!driverSearch) return true;
                                const displayValue = getDisplayValue(
                                  driver,
                                  "driver"
                                ).toLowerCase();
                                return displayValue.includes(
                                  driverSearch.toLowerCase()
                                );
                              })
                              .map((driver: any) => (
                                <button
                                  key={driver.id}
                                  onClick={() => {
                                    handleFieldChange("driver_id", driver.id);
                                    setDriverSearch("");
                                    setShowDriverDropdown(false);
                                  }}
                                  className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                                    formData.driver_id === driver.id
                                      ? "bg-blue-50"
                                      : ""
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <Check
                                      className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ${
                                        formData.driver_id === driver.id
                                          ? "opacity-100 text-blue-600"
                                          : "opacity-0"
                                      }`}
                                    />
                                    <div className="flex items-center justify-between w-full">
                                      <div className="flex flex-col">
                                        <span className="text-xs sm:text-sm font-medium text-gray-900">
                                          {driver.user?.full_name ||
                                            driver.name}
                                        </span>
                                        <span className="text-[10px] sm:text-xs text-gray-500">
                                          {t("common.code") || "Code"}:{" "}
                                          {driver.code ||
                                            driver.driver_code ||
                                            driver.code_number ||
                                            driver.employee_code ||
                                            driver.unique_code ||
                                            driver.user?.code ||
                                            driver.user?.employee_code ||
                                            "N/A"}{" "}
                                          • {t("common.phone") || "Phone"}:{" "}
                                          {driver.user?.phone ||
                                            driver.phone ||
                                            t("common.noPhone") ||
                                            "No phone"}{" "}
                                          • {t("common.rating") || "Rating"}:{" "}
                                          {driver.rating || "N/A"}
                                        </span>
                                        {driver.branch && (
                                          <span className="text-[10px] sm:text-xs text-blue-600 flex items-center gap-1">
                                            <Building className="h-3 w-3" />
                                            {driver.branch.name} -{" "}
                                            {driver.branch.code_number}
                                          </span>
                                        )}
                                      </div>
                                      <Badge
                                        variant="outline"
                                        className="ml-2 text-[10px] sm:text-xs"
                                      >
                                        {driver.total_deliveries || 0}{" "}
                                        {t("adminAssignments.deliveries") ||
                                          "deliveries"}
                                      </Badge>
                                    </div>
                                  </div>
                                </button>
                              ))
                          )}
                        </motion.div>,
                        document.body
                      )}

                    {/* Click outside to close */}
                    {showDriverDropdown &&
                      typeof document !== "undefined" &&
                      createPortal(
                        <div
                          className="fixed inset-0 z-[9998]"
                          onClick={() => setShowDriverDropdown(false)}
                        />,
                        document.body
                      )}
                  </div>
                  {errors.driver_id && (
                    <p className="text-xs sm:text-sm text-red-500 font-medium">
                      {errors.driver_id}
                    </p>
                  )}
                </div>

                {/* Selected Driver Details */}
                {selectedDriver && (
                  <Alert className="bg-gradient-to-br from-green-50/80 to-emerald-50/60 backdrop-blur-sm border-green-200/50 rounded-xl">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    <AlertDescription>
                      <div className="space-y-2 sm:space-y-3">
                        <div className="text-sm sm:text-base font-semibold text-gray-900">
                          {t("adminAssignments.driverDetails")}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                          <div>
                            <span className="font-semibold text-gray-700">
                              {t("common.name")}:
                            </span>{" "}
                            <span className="text-gray-600">
                              {selectedDriver.user?.full_name ||
                                selectedDriver.name}
                            </span>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">
                              {t("common.phone")}:
                            </span>{" "}
                            <span className="text-gray-600">
                              {selectedDriver.user?.phone ||
                                selectedDriver.phone ||
                                t("common.notAvailable")}
                            </span>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">
                              {t("common.rating")}:
                            </span>{" "}
                            <span className="text-gray-600">
                              {selectedDriver.rating || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">
                              {t("common.status")}:
                            </span>{" "}
                            <StatusBadge status={selectedDriver.status} />
                          </div>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Vehicle Selection - Hide for split assignments */}
        {formData.assignment_type !== "split" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/20 backdrop-blur-sm border border-purple-100/50 shadow-lg">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl font-bold text-gray-900">
                  <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                  {t("adminAssignments.selectVehicle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="vehicle_id"
                    className="text-sm sm:text-base font-semibold"
                  >
                    {t("common.vehicle")}
                  </Label>
                  <div className="relative">
                    <input
                      ref={vehicleInputRef}
                      type="text"
                      value={
                        vehicleSearch ||
                        (formData.vehicle_id
                          ? getDisplayValue(
                              filteredVehicles.find(
                                (vehicle: any) =>
                                  vehicle.id === formData.vehicle_id
                              ) || null,
                              "vehicle"
                            )
                          : "")
                      }
                      onChange={(e) => {
                        setVehicleSearch(e.target.value);
                        setShowVehicleDropdown(true);
                      }}
                      onFocus={() => {
                        if (vehicleInputRef.current) {
                          setVehicleDropdownPos(
                            calculateDropdownPosition(vehicleInputRef)
                          );
                        }
                        setShowVehicleDropdown(true);
                      }}
                      placeholder={t(
                        "adminAssignments.selectVehiclePlaceholder"
                      )}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 pr-10 rounded-full text-xs sm:text-sm md:text-base font-semibold border ${
                        errors.vehicle_id ? "border-red-500" : "border-gray-200"
                      } focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/80 backdrop-blur-sm`}
                    />
                    <div className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {vehicleSearch && (
                        <button
                          onClick={() => {
                            setVehicleSearch("");
                            setShowVehicleDropdown(true);
                          }}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                        </button>
                      )}
                      <Search className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                    </div>

                    {/* Dropdown */}
                    {showVehicleDropdown &&
                      typeof document !== "undefined" &&
                      createPortal(
                        <motion.div
                          className="fixed z-[9999] bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-60 overflow-y-auto custom-scrollbar"
                          style={{
                            top: `${vehicleDropdownPos.top}px`,
                            left: `${vehicleDropdownPos.left}px`,
                            width: `${vehicleDropdownPos.width}px`,
                          }}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          {vehiclesLoading ? (
                            <div className="p-3 sm:p-4 text-center text-xs sm:text-sm text-gray-500">
                              {t("common.loading")}...
                            </div>
                          ) : filteredVehicles.length === 0 ? (
                            <div className="p-3 sm:p-4 text-center text-xs sm:text-sm text-gray-500">
                              {t("adminAssignments.noVehiclesAvailable")}
                            </div>
                          ) : (
                            filteredVehicles
                              .filter((vehicle: any) => {
                                if (!vehicleSearch) return true;
                                const displayValue = getDisplayValue(
                                  vehicle,
                                  "vehicle"
                                ).toLowerCase();
                                return displayValue.includes(
                                  vehicleSearch.toLowerCase()
                                );
                              })
                              .map((vehicle: any) => (
                                <button
                                  key={vehicle.id}
                                  onClick={() => {
                                    handleFieldChange("vehicle_id", vehicle.id);
                                    setVehicleSearch("");
                                    setShowVehicleDropdown(false);
                                  }}
                                  className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                                    formData.vehicle_id === vehicle.id
                                      ? "bg-blue-50"
                                      : ""
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <Check
                                      className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ${
                                        formData.vehicle_id === vehicle.id
                                          ? "opacity-100 text-blue-600"
                                          : "opacity-0"
                                      }`}
                                    />
                                    <div className="flex items-center justify-between w-full">
                                      <div className="flex flex-col">
                                        <span className="text-xs sm:text-sm font-medium text-gray-900">
                                          {vehicle.make} {vehicle.model} -{" "}
                                          {vehicle.plate_number}
                                        </span>
                                        <span className="text-[10px] sm:text-xs text-gray-500">
                                          {vehicle.type} • {vehicle.fuel_type}
                                        </span>
                                      </div>
                                      <Badge
                                        variant="outline"
                                        className="ml-2 text-[10px] sm:text-xs"
                                      >
                                        {vehicle.capacity_kg ||
                                          vehicle.capacity}
                                        kg
                                      </Badge>
                                    </div>
                                  </div>
                                </button>
                              ))
                          )}
                        </motion.div>,
                        document.body
                      )}

                    {/* Click outside to close */}
                    {showVehicleDropdown &&
                      typeof document !== "undefined" &&
                      createPortal(
                        <div
                          className="fixed inset-0 z-[9998]"
                          onClick={() => setShowVehicleDropdown(false)}
                        />,
                        document.body
                      )}
                  </div>
                  {errors.vehicle_id && (
                    <p className="text-xs sm:text-sm text-red-500 font-medium">
                      {errors.vehicle_id}
                    </p>
                  )}
                </div>

                {/* Selected Vehicle Details */}
                {selectedVehicle && (
                  <Alert className="bg-gradient-to-br from-purple-50/80 to-pink-50/60 backdrop-blur-sm border-purple-200/50 rounded-xl">
                    <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                    <AlertDescription>
                      <div className="space-y-2 sm:space-y-3">
                        <div className="text-sm sm:text-base font-semibold text-gray-900">
                          {t("adminAssignments.vehicleDetails")}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                          <div>
                            <span className="font-semibold text-gray-700">
                              {t("common.model")}:
                            </span>{" "}
                            <span className="text-gray-600">
                              {selectedVehicle.make} {selectedVehicle.model}
                            </span>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">
                              {t("common.capacity")}:
                            </span>{" "}
                            <span className="text-gray-600">
                              {selectedVehicle.capacity_kg ||
                                selectedVehicle.capacity}
                              kg
                            </span>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">
                              {t("common.licensePlate")}:
                            </span>{" "}
                            <span className="text-gray-600">
                              {selectedVehicle.plate_number}
                            </span>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">
                              {t("common.status")}:
                            </span>{" "}
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
                    (selectedVehicle.capacity_kg ||
                      selectedVehicle.capacity) && (
                    <Alert className="border-red-500/50 bg-gradient-to-br from-red-50/80 via-orange-50/60 to-yellow-50/80 backdrop-blur-sm rounded-xl">
                      <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                      <AlertDescription className="text-red-700">
                        <span className="text-xs sm:text-sm font-semibold">
                          {t("adminAssignments.capacityWarning")}
                        </span>
                      </AlertDescription>
                    </Alert>
                  )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Assignment Configuration - Dynamic based on assignment type */}
        {formData.assignment_type === "partial" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-white via-yellow-50/30 to-orange-50/20 backdrop-blur-sm border border-yellow-100/50 shadow-lg">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl font-bold text-gray-900">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                  {t("adminAssignments.partialAssignmentConfiguration") ||
                    "Partial Assignment Configuration"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {/* Weight Assignment */}
                <div className="space-y-2">
                  <Label
                    htmlFor="assigned_weight_kg"
                    className="text-sm sm:text-base font-semibold"
                  >
                    {t("adminAssignments.assignedWeight") || "Assigned Weight"}{" "}
                    (kg)
                    {selectedCargo && (
                      <span className="text-xs sm:text-sm text-gray-500 ml-2 font-normal">
                        ({t("common.total") || "Total"}:{" "}
                        {selectedCargo.weight_kg} kg)
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
                    className={`rounded-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm md:text-base font-semibold border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/80 backdrop-blur-sm ${
                      errors.assigned_weight_kg ? "border-red-500" : ""
                    }`}
                    placeholder={
                      t("adminAssignments.enterWeight") || "Enter weight in kg"
                    }
                  />
                  {errors.assigned_weight_kg && (
                    <p className="text-xs sm:text-sm text-red-500 font-medium">
                      {errors.assigned_weight_kg}
                    </p>
                  )}
                </div>

                {/* Volume Assignment */}
                <div className="space-y-2">
                  <Label
                    htmlFor="assigned_volume"
                    className="text-sm sm:text-base font-semibold"
                  >
                    {t("adminAssignments.assignedVolume") || "Assigned Volume"}{" "}
                    (m³)
                    {selectedCargo?.volume && (
                      <span className="text-xs sm:text-sm text-gray-500 ml-2 font-normal">
                        ({t("common.total") || "Total"}: {selectedCargo.volume}{" "}
                        m³)
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
                    className={`rounded-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm md:text-base font-semibold border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/80 backdrop-blur-sm ${
                      errors.assigned_volume ? "border-red-500" : ""
                    }`}
                    placeholder={
                      t("adminAssignments.enterVolume") || "Enter volume in m³"
                    }
                  />
                  {errors.assigned_volume && (
                    <p className="text-xs sm:text-sm text-red-500 font-medium">
                      {errors.assigned_volume}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Notes Section - Show for all assignment types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-white via-gray-50/30 to-slate-50/20 backdrop-blur-sm border border-gray-100/50 shadow-lg">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl font-bold text-gray-900">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                {t("adminAssignments.additionalInformation") ||
                  "Additional Information"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label
                  htmlFor="notes"
                  className="text-sm sm:text-base font-semibold"
                >
                  {t("adminAssignments.notes") || "Notes"} (
                  {t("common.optional") || "Optional"})
                </Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleFieldChange("notes", e.target.value)}
                  className="rounded-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm md:text-base font-semibold border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/80 backdrop-blur-sm"
                  placeholder={
                    t("adminAssignments.notesPlaceholder") ||
                    "Add any additional notes for this assignment"
                  }
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Split Assignment Configuration */}
        {formData.assignment_type === "split" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 backdrop-blur-sm border border-blue-100/50 shadow-lg">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-base sm:text-lg md:text-xl font-bold text-gray-900">
                    <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    {t("adminAssignments.splitAssignmentConfiguration") ||
                      "Split Assignment Configuration"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addSplitAssignment}
                      disabled={splitAssignments.length >= 5}
                      className="rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold border-gray-200 hover:border-blue-500 bg-white/80 backdrop-blur-sm"
                    >
                      {t("adminAssignments.addDriver") || "Add Driver"}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Split Assignment Summary */}
                {currentCargo && (
                  <Alert className="bg-gradient-to-br from-blue-50/80 to-indigo-50/60 backdrop-blur-sm border-blue-200/50 rounded-xl">
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    <AlertDescription>
                      <div className="space-y-2 sm:space-y-3">
                        <div className="text-sm sm:text-base font-semibold text-gray-900">
                          {t("adminAssignments.splitAssignmentRequirements") ||
                            "Split Assignment Requirements"}
                        </div>
                        <div className="text-xs sm:text-sm space-y-1.5">
                          <div>
                            {t("adminAssignments.totalCargoWeight") ||
                              "Total Cargo Weight"}
                            :{" "}
                            <span className="font-bold text-blue-700">
                              {currentCargo.weight_kg} kg
                            </span>
                          </div>
                          {currentCargo.volume && (
                            <div>
                              {t("adminAssignments.totalCargoVolume") ||
                                "Total Cargo Volume"}
                              :{" "}
                              <span className="font-bold text-blue-700">
                                {currentCargo.volume} m³
                              </span>
                            </div>
                          )}
                          <div>
                            {t("adminAssignments.driversRequired") ||
                              "Drivers Required"}
                            :{" "}
                            <span className="font-bold text-blue-700">
                              2-5 {t("common.drivers") || "drivers"}
                            </span>
                          </div>
                          <div className="text-gray-600">
                            {t("adminAssignments.totalWeightMustEqual") ||
                              "Total assigned weight must equal cargo weight"}
                          </div>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Split Assignment Errors */}
                {errors.split_assignments && (
                  <Alert className="border-red-500/50 bg-gradient-to-br from-red-50/80 via-orange-50/60 to-yellow-50/80 backdrop-blur-sm rounded-xl">
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                    <AlertDescription className="text-red-700">
                      <span className="text-xs sm:text-sm font-semibold">
                        {errors.split_assignments}
                      </span>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Split Assignments List */}
                <div className="space-y-3 sm:space-y-4">
                  {splitAssignments.map((assignment, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="bg-gradient-to-br from-blue-50/40 via-white to-indigo-50/30 backdrop-blur-sm border-l-4 border-l-blue-500 rounded-xl shadow-md">
                        <CardHeader className="pb-2 sm:pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-xs sm:text-sm md:text-base font-semibold text-gray-900">
                              {t("adminAssignments.driverAssignment") ||
                                "Driver Assignment"}{" "}
                              #{index + 1}
                            </CardTitle>
                            {splitAssignments.length > 2 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSplitAssignment(index)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-1.5 sm:p-2 h-7 w-7 sm:h-8 sm:w-8"
                              >
                                <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3 sm:space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            {/* Driver Selection */}
                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm font-semibold">
                                {t("common.driver")}
                              </Label>
                              <div className="relative">
                                <input
                                  ref={(el) => {
                                    splitDriverInputRefs.current[index] = el;
                                  }}
                                  type="text"
                                  value={
                                    splitDriverSearch[index] ||
                                    (assignment.driver_id
                                      ? getDisplayValue(
                                          filteredDrivers.find(
                                            (driver: any) =>
                                              driver.id === assignment.driver_id
                                          ) || null,
                                          "driver"
                                        )
                                      : "")
                                  }
                                  onChange={(e) => {
                                    setSplitDriverSearch((prev) => ({
                                      ...prev,
                                      [index]: e.target.value,
                                    }));
                                    setShowSplitDriverDropdown((prev) => ({
                                      ...prev,
                                      [index]: true,
                                    }));
                                  }}
                                  onFocus={() => {
                                    if (splitDriverInputRefs.current[index]) {
                                      setSplitDriverDropdownPos((prev) => ({
                                        ...prev,
                                        [index]: calculateDropdownPosition({
                                          current:
                                            splitDriverInputRefs.current[index],
                                        }),
                                      }));
                                    }
                                    setShowSplitDriverDropdown((prev) => ({
                                      ...prev,
                                      [index]: true,
                                    }));
                                  }}
                                  placeholder={t(
                                    "adminAssignments.selectDriverPlaceholder"
                                  )}
                                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 pr-10 rounded-full text-xs sm:text-sm font-semibold border ${
                                    splitErrors[`driver_${index}`]
                                      ? "border-red-500"
                                      : "border-gray-200"
                                  } focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/80 backdrop-blur-sm`}
                                />
                                <div className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                  {splitDriverSearch[index] && (
                                    <button
                                      onClick={() => {
                                        setSplitDriverSearch((prev) => ({
                                          ...prev,
                                          [index]: "",
                                        }));
                                        setShowSplitDriverDropdown((prev) => ({
                                          ...prev,
                                          [index]: true,
                                        }));
                                      }}
                                      className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                                    >
                                      <X className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                                    </button>
                                  )}
                                  <Search className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                                </div>

                                {/* Dropdown */}
                                {showSplitDriverDropdown[index] &&
                                  typeof document !== "undefined" &&
                                  createPortal(
                                    <motion.div
                                      className="fixed z-[9999] bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-60 overflow-y-auto custom-scrollbar"
                                      style={{
                                        top: `${
                                          splitDriverDropdownPos[index]?.top ||
                                          0
                                        }px`,
                                        left: `${
                                          splitDriverDropdownPos[index]?.left ||
                                          0
                                        }px`,
                                        width: `${
                                          splitDriverDropdownPos[index]
                                            ?.width || 0
                                        }px`,
                                      }}
                                      initial={{ opacity: 0, y: -10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -10 }}
                                    >
                                      {filteredDrivers
                                        .filter((driver: any) => {
                                          if (!splitDriverSearch[index])
                                            return true;
                                          const displayValue = getDisplayValue(
                                            driver,
                                            "driver"
                                          ).toLowerCase();
                                          return displayValue.includes(
                                            splitDriverSearch[
                                              index
                                            ].toLowerCase()
                                          );
                                        })
                                        .map((driver: any) => (
                                          <button
                                            key={driver.id}
                                            onClick={() => {
                                              handleSplitAssignmentChange(
                                                index,
                                                "driver_id",
                                                driver.id
                                              );
                                              setSplitDriverSearch((prev) => ({
                                                ...prev,
                                                [index]: "",
                                              }));
                                              setShowSplitDriverDropdown(
                                                (prev) => ({
                                                  ...prev,
                                                  [index]: false,
                                                })
                                              );
                                            }}
                                            className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                                              assignment.driver_id === driver.id
                                                ? "bg-blue-50"
                                                : ""
                                            }`}
                                          >
                                            <div className="flex items-center gap-2">
                                              <Check
                                                className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ${
                                                  assignment.driver_id ===
                                                  driver.id
                                                    ? "opacity-100 text-blue-600"
                                                    : "opacity-0"
                                                }`}
                                              />
                                              <div className="flex flex-col flex-1">
                                                <span className="text-xs sm:text-sm font-medium text-gray-900">
                                                  {driver.user?.full_name ||
                                                    driver.name}
                                                </span>
                                                <span className="text-[10px] sm:text-xs text-gray-500">
                                                  {t("common.code") || "Code"}:{" "}
                                                  {driver.code ||
                                                    driver.driver_code ||
                                                    driver.code_number ||
                                                    driver.employee_code ||
                                                    driver.unique_code ||
                                                    driver.user?.code ||
                                                    driver.user
                                                      ?.employee_code ||
                                                    "N/A"}{" "}
                                                  •{" "}
                                                  {t("common.phone") || "Phone"}
                                                  :{" "}
                                                  {driver.user?.phone ||
                                                    driver.phone ||
                                                    t("common.noPhone") ||
                                                    "No phone"}
                                                </span>
                                                {driver.branch && (
                                                  <span className="text-[10px] sm:text-xs text-blue-600 flex items-center gap-1">
                                                    <Building className="h-3 w-3" />
                                                    {driver.branch.name} -{" "}
                                                    {driver.branch.code_number}
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </button>
                                        ))}
                                    </motion.div>,
                                    document.body
                                  )}

                                {/* Click outside to close */}
                                {showSplitDriverDropdown[index] && (
                                  <div
                                    className="fixed inset-0 z-40"
                                    onClick={() =>
                                      setShowSplitDriverDropdown((prev) => ({
                                        ...prev,
                                        [index]: false,
                                      }))
                                    }
                                  />
                                )}
                              </div>
                              {splitErrors[`driver_${index}`] && (
                                <p className="text-xs sm:text-sm text-red-500 font-medium">
                                  {splitErrors[`driver_${index}`]}
                                </p>
                              )}
                            </div>

                            {/* Vehicle Selection */}
                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm font-semibold">
                                {t("common.vehicle")}
                              </Label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={
                                    splitVehicleSearch[index] ||
                                    (assignment.vehicle_id
                                      ? getDisplayValue(
                                          filteredVehicles.find(
                                            (vehicle: any) =>
                                              vehicle.id ===
                                              assignment.vehicle_id
                                          ) || null,
                                          "vehicle"
                                        )
                                      : "")
                                  }
                                  onChange={(e) => {
                                    setSplitVehicleSearch((prev) => ({
                                      ...prev,
                                      [index]: e.target.value,
                                    }));
                                    setShowSplitVehicleDropdown((prev) => ({
                                      ...prev,
                                      [index]: true,
                                    }));
                                  }}
                                  onFocus={() =>
                                    setShowSplitVehicleDropdown((prev) => ({
                                      ...prev,
                                      [index]: true,
                                    }))
                                  }
                                  placeholder={t(
                                    "adminAssignments.selectVehiclePlaceholder"
                                  )}
                                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 pr-10 rounded-full text-xs sm:text-sm font-semibold border ${
                                    splitErrors[`vehicle_${index}`]
                                      ? "border-red-500"
                                      : "border-gray-200"
                                  } focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/80 backdrop-blur-sm`}
                                />
                                <div className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                  {splitVehicleSearch[index] && (
                                    <button
                                      onClick={() => {
                                        setSplitVehicleSearch((prev) => ({
                                          ...prev,
                                          [index]: "",
                                        }));
                                        setShowSplitVehicleDropdown((prev) => ({
                                          ...prev,
                                          [index]: true,
                                        }));
                                      }}
                                      className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                                    >
                                      <X className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                                    </button>
                                  )}
                                  <Search className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                                </div>

                                {/* Dropdown */}
                                {showSplitVehicleDropdown[index] &&
                                typeof document !== "undefined"
                                  ? createPortal(
                                      <motion.div
                                        className="fixed z-[9999] bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-60 overflow-y-auto custom-scrollbar"
                                        style={{
                                          top: `${
                                            splitVehicleDropdownPos[index]
                                              ?.top || 0
                                          }px`,
                                          left: `${
                                            splitVehicleDropdownPos[index]
                                              ?.left || 0
                                          }px`,
                                          width: `${
                                            splitVehicleDropdownPos[index]
                                              ?.width || 0
                                          }px`,
                                        }}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                      >
                                        {filteredVehicles
                                          .filter((vehicle: any) => {
                                            if (!splitVehicleSearch[index])
                                              return true;
                                            const displayValue =
                                              getDisplayValue(
                                                vehicle,
                                                "vehicle"
                                              ).toLowerCase();
                                            return displayValue.includes(
                                              splitVehicleSearch[
                                                index
                                              ].toLowerCase()
                                            );
                                          })
                                          .map((vehicle: any) => (
                                            <button
                                              key={vehicle.id}
                                              onClick={() => {
                                                handleSplitAssignmentChange(
                                                  index,
                                                  "vehicle_id",
                                                  vehicle.id
                                                );
                                                setSplitVehicleSearch(
                                                  (prev) => ({
                                                    ...prev,
                                                    [index]: "",
                                                  })
                                                );
                                                setShowSplitVehicleDropdown(
                                                  (prev) => ({
                                                    ...prev,
                                                    [index]: false,
                                                  })
                                                );
                                              }}
                                              className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                                                assignment.vehicle_id ===
                                                vehicle.id
                                                  ? "bg-blue-50"
                                                  : ""
                                              }`}
                                            >
                                              <div className="flex items-center gap-2">
                                                <Check
                                                  className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ${
                                                    assignment.vehicle_id ===
                                                    vehicle.id
                                                      ? "opacity-100 text-blue-600"
                                                      : "opacity-0"
                                                  }`}
                                                />
                                                <div className="flex flex-col flex-1">
                                                  <span className="text-xs sm:text-sm font-medium text-gray-900">
                                                    {vehicle.make}{" "}
                                                    {vehicle.model}
                                                  </span>
                                                  <span className="text-[10px] sm:text-xs text-gray-500">
                                                    {vehicle.plate_number} •{" "}
                                                    {vehicle.capacity_kg ||
                                                      vehicle.capacity}
                                                    kg
                                                  </span>
                                                </div>
                                              </div>
                                            </button>
                                          ))}
                                      </motion.div>,
                                      document.body
                                    )
                                  : null}

                                {/* Click outside to close */}
                                {showSplitVehicleDropdown[index] &&
                                  typeof document !== "undefined" &&
                                  createPortal(
                                    <div
                                      className="fixed inset-0 z-[9998]"
                                      onClick={() =>
                                        setShowSplitVehicleDropdown((prev) => ({
                                          ...prev,
                                          [index]: false,
                                        }))
                                      }
                                    />,
                                    document.body
                                  )}
                              </div>
                              {splitErrors[`vehicle_${index}`] && (
                                <p className="text-xs sm:text-sm text-red-500 font-medium">
                                  {splitErrors[`vehicle_${index}`]}
                                </p>
                              )}
                            </div>

                            {/* Weight Assignment */}
                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm font-semibold">
                                {t("adminAssignments.weight") || "Weight"} (kg)
                                {currentCargo && (
                                  <span className="text-[10px] sm:text-xs text-gray-500 ml-2 font-normal">
                                    ({t("adminAssignments.max") || "Max"}:{" "}
                                    {currentCargo.weight_kg} kg)
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
                                className={`rounded-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm md:text-base font-semibold border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/80 backdrop-blur-sm ${
                                  splitErrors[`weight_${index}`]
                                    ? "border-red-500"
                                    : ""
                                }`}
                                placeholder={
                                  t("adminAssignments.enterWeight") ||
                                  "Enter weight in kg"
                                }
                              />
                              {splitErrors[`weight_${index}`] && (
                                <p className="text-xs sm:text-sm text-red-500 font-medium">
                                  {splitErrors[`weight_${index}`]}
                                </p>
                              )}
                            </div>

                            {/* Volume Assignment */}
                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm font-semibold">
                                {t("adminAssignments.volume") || "Volume"} (m³)
                                {currentCargo?.volume && (
                                  <span className="text-[10px] sm:text-xs text-gray-500 ml-2 font-normal">
                                    ({t("adminAssignments.max") || "Max"}:{" "}
                                    {currentCargo.volume} m³)
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
                                className="rounded-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm md:text-base font-semibold border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/80 backdrop-blur-sm"
                                placeholder={
                                  t("adminAssignments.enterVolumeOptional") ||
                                  "Enter volume in m³ (optional)"
                                }
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
                                  <Alert className="border-red-500/50 bg-gradient-to-br from-red-50/80 via-orange-50/60 to-yellow-50/80 backdrop-blur-sm rounded-xl mt-3 sm:mt-4">
                                    <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
                                    <AlertDescription className="text-red-700">
                                      <span className="text-xs sm:text-sm font-semibold">
                                        {t(
                                          "adminAssignments.weightExceedsCapacity"
                                        ) || "Weight"}{" "}
                                        ({assignment.weight_kg}kg){" "}
                                        {t("adminAssignments.exceeds") ||
                                          "exceeds"}{" "}
                                        {t(
                                          "adminAssignments.vehicleCapacity"
                                        ) || "vehicle capacity"}{" "}
                                        ({capacity}kg)
                                      </span>
                                    </AlertDescription>
                                  </Alert>
                                );
                              }
                              return null;
                            })()}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Split Assignment Summary */}
                {(() => {
                  const validAssignments = splitAssignments.filter(
                    (assignment) =>
                      assignment.driver_id && assignment.vehicle_id
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
                    <Card className="bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/80 backdrop-blur-sm border-blue-200/50 rounded-xl shadow-lg">
                      <CardContent className="pt-4 sm:pt-6">
                        <div className="space-y-2 sm:space-y-3">
                          <div className="text-sm sm:text-base font-semibold text-blue-900">
                            {t("adminAssignments.splitAssignmentSummary") ||
                              "Split Assignment Summary"}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                            <div>
                              <span className="font-semibold text-gray-700">
                                {t("adminAssignments.totalDrivers") ||
                                  "Total Drivers"}
                                :
                              </span>{" "}
                              <span className="font-bold text-blue-700">
                                {validAssignments.length}
                              </span>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-700">
                                {t("adminAssignments.totalWeight") ||
                                  "Total Weight"}
                                :
                              </span>{" "}
                              <span className="font-bold text-blue-700">
                                {totalWeight} kg
                              </span>
                            </div>
                            {currentCargo?.volume && (
                              <div className="col-span-1 sm:col-span-2">
                                <span className="font-semibold text-gray-700">
                                  {t("adminAssignments.totalVolume") ||
                                    "Total Volume"}
                                  :
                                </span>{" "}
                                <span className="font-bold text-blue-700">
                                  {totalVolume} m³
                                </span>
                              </div>
                            )}
                          </div>
                          {currentCargo && (
                            <div className="text-xs sm:text-sm text-blue-700 mt-2 sm:mt-3 font-semibold">
                              {totalWeight === currentCargo.weight_kg ? (
                                <span className="text-green-600 flex items-center gap-1.5">
                                  <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                  {t(
                                    "adminAssignments.weightAllocationCorrect"
                                  ) || "Weight allocation is correct"}
                                </span>
                              ) : (
                                <span className="text-red-600 flex items-center gap-1.5">
                                  <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                  {t(
                                    "adminAssignments.weightAllocationMismatch"
                                  ) || "Weight allocation mismatch"}{" "}
                                  ({t("adminAssignments.need") || "Need"}:{" "}
                                  {currentCargo.weight_kg}kg,{" "}
                                  {t("adminAssignments.assigned") || "Assigned"}
                                  : {totalWeight}kg)
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
          </motion.div>
        )}

        {/* Assignment Info */}
        {mode === "edit" && assignment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-white via-gray-50/30 to-slate-50/20 backdrop-blur-sm border border-gray-100/50 shadow-lg">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
                  {t("adminAssignments.assignmentInfo")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">
                      {t("common.status")}:
                    </span>{" "}
                    <StatusBadge status={assignment.assignment_status} />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">
                      {t("adminAssignments.createdAt")}:
                    </span>{" "}
                    <span className="text-gray-600">
                      {assignment.created_at
                        ? new Date(assignment.created_at).toLocaleDateString()
                        : t("common.notAvailable")}
                    </span>
                  </div>
                  {assignment.expires_at && (
                    <div className="col-span-1 sm:col-span-2">
                      <span className="font-semibold text-gray-700">
                        {t("adminAssignments.expiresAt")}:
                      </span>{" "}
                      <span className="text-gray-600">
                        {new Date(assignment.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-200/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm md:text-base font-semibold border-gray-200 hover:border-gray-400 bg-white/80 backdrop-blur-sm w-full sm:w-auto"
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm md:text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2"></div>
                <span className="text-xs sm:text-sm">
                  {mode === "create"
                    ? t("adminAssignments.creating") || "Creating Assignment..."
                    : t("adminAssignments.updating") ||
                      "Updating Assignment..."}
                </span>
              </>
            ) : mode === "create" ? (
              t("adminAssignments.createAssignment")
            ) : (
              t("adminAssignments.updateAssignment")
            )}
          </Button>
        </motion.div>
      </form>
    </ModernModel>
  );
}
