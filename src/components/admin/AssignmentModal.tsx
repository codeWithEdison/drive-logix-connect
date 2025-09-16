import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Search,
} from "lucide-react";
import {
  useCreateAssignment,
  useUpdateDeliveryAssignment,
} from "@/lib/api/hooks/assignmentHooks";
import { useUnassignedCargos } from "@/lib/api/hooks/cargoHooks";
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
}

export default function AssignmentModal({
  isOpen,
  onClose,
  onSuccess,
  mode,
  assignment,
}: AssignmentModalProps) {
  const { t } = useLanguage();

  // Form state
  const [formData, setFormData] = useState({
    cargo_id: "",
    driver_id: "",
    vehicle_id: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search state
  const [cargoSearch, setCargoSearch] = useState("");
  const [driverSearch, setDriverSearch] = useState("");
  const [vehicleSearch, setVehicleSearch] = useState("");

  // API hooks
  const createAssignmentMutation = useCreateAssignment();
  const updateAssignmentMutation = useUpdateDeliveryAssignment();

  // Data hooks - using different endpoints based on mode
  const { data: cargosData, isLoading: cargosLoading } = useUnassignedCargos({
    limit: 100,
  });

  // For edit mode, we need to include the existing assignment's cargo, driver, and vehicle
  // For create mode, we use filtered endpoints
  const pickupDate =
    formData.cargo_id &&
    cargosData?.find((cargo) => cargo.id === formData.cargo_id)?.pickup_date
      ? new Date(
          cargosData.find(
            (cargo) => cargo.id === formData.cargo_id
          )!.pickup_date
        )
          .toISOString()
          .split("T")[0]
      : new Date().toISOString().split("T")[0];

  const { data: driversData, isLoading: driversLoading } =
    useAvailableDriversWithoutAssignments({
      date: pickupDate,
      limit: 100,
    });

  const { data: vehiclesData, isLoading: vehiclesLoading } =
    useAvailableVehiclesWithoutAssignments({
      date: pickupDate,
      capacity_min:
        (formData.cargo_id &&
          cargosData?.find((cargo) => cargo.id === formData.cargo_id)
            ?.weight_kg) ||
        0,
      limit: 100,
    });

  // Initialize form data when editing
  useEffect(() => {
    if (mode === "edit" && assignment) {
      setFormData({
        cargo_id: assignment.cargo_id || "",
        driver_id: assignment.driver_id || "",
        vehicle_id: assignment.vehicle_id || "",
        notes: assignment.notes || "",
      });
    } else {
      setFormData({
        cargo_id: "",
        driver_id: "",
        vehicle_id: "",
        notes: "",
      });
    }
    setErrors({});
    // Clear search terms
    setCargoSearch("");
    setDriverSearch("");
    setVehicleSearch("");
  }, [mode, assignment, isOpen]);

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
  const allCargos =
    mode === "edit" &&
    assignment?.cargo &&
    !cargos.find((c) => c.id === assignment.cargo.id)
      ? [...cargos, assignment.cargo]
      : cargos;

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
  const filteredCargos = allCargos.filter(
    (cargo: any) =>
      cargo.cargo_number?.toLowerCase().includes(cargoSearch.toLowerCase()) ||
      cargo.id.toLowerCase().includes(cargoSearch.toLowerCase()) ||
      cargo.pickup_address?.toLowerCase().includes(cargoSearch.toLowerCase()) ||
      cargo.destination_address
        ?.toLowerCase()
        .includes(cargoSearch.toLowerCase())
  );

  const filteredDrivers = allDrivers.filter(
    (driver: any) =>
      (driver.user?.full_name || driver.name)
        ?.toLowerCase()
        .includes(driverSearch.toLowerCase()) ||
      (driver.user?.phone || driver.phone)
        ?.toLowerCase()
        .includes(driverSearch.toLowerCase()) ||
      driver.license_number?.toLowerCase().includes(driverSearch.toLowerCase())
  );

  const filteredVehicles = allVehicles.filter(
    (vehicle: any) =>
      vehicle.make?.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
      vehicle.model?.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
      vehicle.plate_number
        ?.toLowerCase()
        .includes(vehicleSearch.toLowerCase()) ||
      vehicle.type?.toLowerCase().includes(vehicleSearch.toLowerCase())
  );

  const selectedCargo = allCargos.find(
    (cargo: any) => cargo.id === formData.cargo_id
  );
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

    // Check if cargo weight exceeds vehicle capacity
    if (selectedCargo && selectedVehicle) {
      const cargoWeight = selectedCargo.weight_kg || 0;
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
        await createAssignmentMutation.mutateAsync(formData);
        customToast.success(t("adminAssignments.createdSuccessfully"));
      } else {
        await updateAssignmentMutation.mutateAsync({
          assignmentId: assignment.id,
          data: formData,
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
              {t("adminAssignments.selectCargo")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Cargo Search */}
            <div className="space-y-2">
              <Label htmlFor="cargo_search">Search Cargo</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="cargo_search"
                  placeholder="Search by cargo number, pickup address, or destination..."
                  value={cargoSearch}
                  onChange={(e) => setCargoSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cargo_id">{t("common.cargo")}</Label>
              <Select
                value={formData.cargo_id}
                onValueChange={(value) => handleFieldChange("cargo_id", value)}
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
                      {cargoSearch
                        ? "No cargos found matching your search"
                        : t("adminAssignments.noCargosAvailable")}
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
                              {new Date(cargo.pickup_date).toLocaleDateString()}
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

            {/* Selected Cargo Details */}
            {selectedCargo && (
              <Alert>
                <Package className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="font-medium">
                      {t("adminAssignments.cargoDetails")}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">{t("common.type")}:</span>{" "}
                        {selectedCargo.type || t("common.notAvailable")}
                      </div>
                      <div>
                        <span className="font-medium">
                          {t("common.weight")}:
                        </span>{" "}
                        {selectedCargo.weight_kg}kg
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">
                          {t("common.pickupAddress")}:
                        </span>{" "}
                        {selectedCargo.pickup_address ||
                          t("common.notAvailable")}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">
                          {t("common.destinationAddress")}:
                        </span>{" "}
                        {selectedCargo.destination_address ||
                          t("common.notAvailable")}
                      </div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
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
            {/* Driver Search */}
            <div className="space-y-2">
              <Label htmlFor="driver_search">Search Driver</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="driver_search"
                  placeholder="Search by name, phone, or license number..."
                  value={driverSearch}
                  onChange={(e) => setDriverSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

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
                      {driverSearch
                        ? "No drivers found matching your search"
                        : t("adminAssignments.noDriversAvailable")}
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
            {/* Vehicle Search */}
            <div className="space-y-2">
              <Label htmlFor="vehicle_search">Search Vehicle</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="vehicle_search"
                  placeholder="Search by make, model, plate number, or type..."
                  value={vehicleSearch}
                  onChange={(e) => setVehicleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

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
                      {vehicleSearch
                        ? "No vehicles found matching your search"
                        : t("adminAssignments.noVehiclesAvailable")}
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
            {selectedCargo &&
              selectedVehicle &&
              selectedCargo.weight_kg >
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

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>{t("adminAssignments.additionalNotes")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="notes">{t("common.notes")}</Label>
              <Textarea
                id="notes"
                placeholder={t("adminAssignments.notesPlaceholder")}
                value={formData.notes}
                onChange={(e) => handleFieldChange("notes", e.target.value)}
                rows={3}
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
