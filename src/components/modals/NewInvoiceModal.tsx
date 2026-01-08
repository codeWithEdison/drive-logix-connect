import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calculator, DollarSign, Package, FileText, AlertCircle } from "lucide-react";
import { useGenerateInvoice } from "@/lib/api/hooks/invoiceHooks";
import { useAllCargos, useEstimateCargoCost } from "@/lib/api/hooks/cargoHooks";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils/frontend";

interface NewInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (invoice: any) => void;
  preselectedCargoId?: string;
}

export default function NewInvoiceModal({
  isOpen,
  onClose,
  onSuccess,
  preselectedCargoId,
}: NewInvoiceModalProps) {
  // Form state - simplified to only essential fields
  const [formData, setFormData] = useState({
    cargoId: "",
    subtotal: 0,
    taxAmount: 0,
    discountAmount: 0,
    currency: "RWF",
    dueDate: "",
    notes: "",
  });

  // API hooks
  const generateInvoiceMutation = useGenerateInvoice();
  const { data: cargosData } = useAllCargos({ limit: 100 });
  const estimateCostMutation = useEstimateCargoCost();

  // Request throttling and state tracking
  const [hasEstimatedCost, setHasEstimatedCost] = useState(false);
  const [lastEstimationParams, setLastEstimationParams] = useState<string>("");
  const estimationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isEstimatingRef = useRef(false);

  // Validation errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Extract data with stable reference
  const cargos = useMemo(() => {
    const data = (cargosData as any)?.data || [];
    console.log("📦 Cargos data updated:", data.length, "cargos");
    return data;
  }, [cargosData]);

  // Calculate total amount - this is now computed directly in the render
  const totalAmount =
    formData.subtotal + formData.taxAmount - formData.discountAmount;

  // Throttled estimation function to prevent infinite requests
  const throttledEstimateCost = useCallback(
    (cargo: any, forceRecalculate = false) => {
      const params = `${cargo.weight_kg}-${cargo.distance_km}-${cargo.category_id}`;

      // Skip if already estimated with same parameters (unless forced)
      if (
        !forceRecalculate &&
        hasEstimatedCost &&
        lastEstimationParams === params
      ) {
        console.log(
          "💰 Skipping estimation - already estimated with same parameters"
        );
        return;
      }

      // Skip if already estimating
      if (isEstimatingRef.current) {
        console.log("💰 Skipping estimation - already in progress");
        return;
      }

      // Clear any existing timeout
      if (estimationTimeoutRef.current) {
        clearTimeout(estimationTimeoutRef.current);
      }

      // Set timeout to prevent rapid successive calls
      estimationTimeoutRef.current = setTimeout(() => {
        if (isEstimatingRef.current) {
          console.log("💰 Skipping estimation - timeout but still estimating");
          return;
        }

        isEstimatingRef.current = true;
        setLastEstimationParams(params);

        console.log("💰 Estimating cost for cargo:", {
          weight_kg: cargo.weight_kg,
          distance_km: cargo.distance_km,
          category_id: cargo.category_id,
        });

        estimateCostMutation.mutate(
          {
            weight_kg: cargo.weight_kg,
            distance_km: cargo.distance_km,
            category_id: cargo.category_id,
          },
          {
            onSuccess: (response) => {
              const estimatedCost = response.data?.estimated_cost || 0;
              console.log("💰 Cost estimated:", estimatedCost);
              setFormData((prev) => ({
                ...prev,
                subtotal: estimatedCost,
              }));
              setHasEstimatedCost(true);
              isEstimatingRef.current = false;
            },
            onError: (error) => {
              console.error("💰 Cost estimation failed:", error);
              // Fallback to existing estimated_cost if available
              if (cargo.estimated_cost) {
                setFormData((prev) => ({
                  ...prev,
                  subtotal: Number(cargo.estimated_cost) || 0,
                }));
              }
              setHasEstimatedCost(true);
              isEstimatingRef.current = false;
            },
          }
        );
      }, 500); // 500ms debounce
    },
    [hasEstimatedCost, lastEstimationParams, estimateCostMutation]
  );

  // Auto-populate cargo data when preselectedCargoId is provided
  useEffect(() => {
    if (isOpen && preselectedCargoId && cargos.length > 0) {
      const cargo = cargos.find((c: any) => c.id === preselectedCargoId);
      if (cargo) {
        console.log("📦 Auto-populating cargo data:", {
          cargoId: preselectedCargoId,
          estimated_cost: cargo.estimated_cost,
          weight_kg: cargo.weight_kg,
          distance_km: cargo.distance_km,
          category_id: cargo.category_id,
        });

        // Set cargo ID
        setFormData((prev) => ({
          ...prev,
          cargoId: preselectedCargoId,
        }));

        // Prioritize existing estimated_cost over recalculation
        if (cargo.estimated_cost && cargo.estimated_cost > 0) {
          console.log(
            "💰 Using existing estimated cost:",
            cargo.estimated_cost
          );
          setFormData((prev) => ({
            ...prev,
            subtotal: Number(cargo.estimated_cost) || 0,
          }));
          setHasEstimatedCost(true);
        } else if (cargo.weight_kg && cargo.distance_km && cargo.category_id) {
          console.log("💰 No existing cost, estimating new cost...");
          throttledEstimateCost(cargo);
        } else {
          console.log("⚠️ Insufficient data for cost estimation");
        }

        // Set due date to one day before pickup date
        if (cargo.pickup_date) {
          const pickupDate = new Date(cargo.pickup_date);
          const dueDate = new Date(pickupDate);
          dueDate.setDate(dueDate.getDate() - 1);
          setFormData((prev) => ({
            ...prev,
            dueDate: dueDate.toISOString().split("T")[0],
          }));
        } else {
          // Fallback: 30 days from now if no pickup date
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + 30);
          setFormData((prev) => ({
            ...prev,
            dueDate: futureDate.toISOString().split("T")[0],
          }));
        }
      }
    }
  }, [isOpen, preselectedCargoId, cargos, throttledEstimateCost]);

  // Cleanup effect to clear timeouts
  useEffect(() => {
    return () => {
      if (estimationTimeoutRef.current) {
        clearTimeout(estimationTimeoutRef.current);
      }
    };
  }, []);

  // Handlers
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    // Reset errors
    setErrors({});

    // Frontend validation
    const validationErrors: Record<string, string> = {};

    if (!formData.cargoId) {
      validationErrors.cargoId = "Please select a cargo";
    }

    if (formData.subtotal <= 0) {
      validationErrors.subtotal = "Please enter a valid subtotal amount";
    }

    // Validate notes - required and cannot be empty or whitespace only
    if (!formData.notes || !formData.notes.trim()) {
      validationErrors.notes = "Notes are required and cannot be empty";
    }

    // Show validation errors
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Show toast for first error
      const firstError = Object.values(validationErrors)[0];
      toast.error(firstError);
      return;
    }

    try {
      const invoiceData = {
        cargo_id: formData.cargoId,
        subtotal: formData.subtotal,
        tax_amount: formData.taxAmount,
        discount_amount: formData.discountAmount,
        currency: formData.currency,
        due_date: formData.dueDate,
        notes: formData.notes.trim(), // Trim whitespace before sending
      };

      await generateInvoiceMutation.mutateAsync(invoiceData);
      toast.success("Invoice created successfully!");
      onSuccess?.(invoiceData);
      handleClose();
    } catch (error: any) {
      // Extract and show clear error message from backend
      const errorMessage = getErrorMessage(error, "Failed to create invoice");
      
      // Check if error is specifically about notes field
      if (errorMessage.toLowerCase().includes("notes")) {
        setErrors({ notes: errorMessage });
        toast.error(errorMessage);
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleClose = () => {
    // Reset form and estimation state
    setFormData({
      cargoId: "",
      subtotal: 0,
      taxAmount: 0,
      discountAmount: 0,
      currency: "RWF",
      dueDate: "",
      notes: "",
    });
    setErrors({});
    setHasEstimatedCost(false);
    setLastEstimationParams("");
    isEstimatingRef.current = false;
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("rw-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Debug logging to help identify calculation issues
  console.log("💰 NewInvoiceModal Debug:", {
    subtotal: formData.subtotal,
    taxAmount: formData.taxAmount,
    discountAmount: formData.discountAmount,
    totalAmount: totalAmount,
    formattedTotal: formatCurrency(totalAmount),
  });

  const selectedCargo = cargos.find(
    (cargo: any) => cargo.id === formData.cargoId
  );

  return (
    <div className="space-y-8">
      {/* Enhanced Header Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <DollarSign className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-blue-900">
              Create New Invoice
            </h3>
            <p className="text-sm text-blue-700 font-medium">
              Step 2: Generate billing document
            </p>
          </div>
        </div>
        <p className="text-blue-600">
          Create a professional invoice for the selected cargo delivery with
          automatic cost calculation.
        </p>
      </div>

      {/* Enhanced Cargo Information Display */}
      {selectedCargo && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Cargo Information
                </h3>
                <p className="text-gray-600 text-sm font-normal">
                  Shipment details for invoice
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="text-sm font-medium text-gray-600">Cargo ID</p>
                </div>
                <p className="text-xl font-bold text-gray-900 font-mono">
                  {selectedCargo.cargo_number || selectedCargo.id}
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                </div>
                <Badge
                  variant="outline"
                  className="text-sm px-3 py-1 font-medium"
                >
                  {selectedCargo.status}
                </Badge>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm md:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <p className="text-sm font-medium text-gray-600">Route</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900 truncate">
                    📍 {selectedCargo.pickup_address}
                  </p>
                  <div className="flex items-center justify-center my-1">
                    <div className="w-full h-px bg-gray-300"></div>
                    <span className="px-2 text-gray-400">→</span>
                    <div className="w-full h-px bg-gray-300"></div>
                  </div>
                  <p className="font-medium text-gray-900 truncate">
                    🎯 {selectedCargo.destination_address}
                  </p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <p className="text-sm font-medium text-gray-600">
                    Weight & Type
                  </p>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {selectedCargo.weight_kg}kg •{" "}
                  {selectedCargo.type || "General"}
                </p>
              </div>

              {selectedCargo.estimated_cost && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-sm font-medium text-green-700">
                      Estimated Cost
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(selectedCargo.estimated_cost)}
                  </p>
                  {estimateCostMutation.isPending && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-green-600"></div>
                      Recalculating cost...
                    </div>
                  )}
                </div>
              )}

              {selectedCargo.pickup_date && (
                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <p className="text-sm font-medium text-gray-600">
                      Pickup Date
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(selectedCargo.pickup_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Invoice Details */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Calculator className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                Invoice Details
              </h3>
              <p className="text-gray-600 text-sm font-normal">
                Financial calculations
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          {/* Subtotal Section */}
          <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <h4 className="font-semibold text-gray-800 text-lg">
                Base Amount
              </h4>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="subtotal"
                    className="text-sm font-medium text-gray-700"
                  >
                    Subtotal (RWF) *
                  </Label>
                  {estimateCostMutation.isPending && (
                    <div className="flex items-center gap-1 text-emerald-600">
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-emerald-600"></div>
                      <span className="text-xs">Auto-calculating...</span>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="subtotal"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.subtotal}
                    onChange={(e) =>
                      handleInputChange("subtotal", Number(e.target.value) || 0)
                    }
                    placeholder="Enter subtotal amount"
                    disabled={estimateCostMutation.isPending}
                    className={`h-12 text-lg font-semibold border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 ${
                      estimateCostMutation.isPending ? "bg-emerald-50" : ""
                    }`}
                  />
                  {estimateCostMutation.isPending && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                    </div>
                  )}
                </div>
                {estimateCostMutation.isPending && (
                  <p className="text-xs text-emerald-600">
                    💰 Calculating cost based on cargo details...
                  </p>
                )}
                {selectedCargo &&
                  selectedCargo.weight_kg &&
                  selectedCargo.distance_km &&
                  selectedCargo.category_id && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Force recalculation by resetting estimation state
                        setHasEstimatedCost(false);
                        setLastEstimationParams("");
                        throttledEstimateCost(selectedCargo, true);
                      }}
                      disabled={estimateCostMutation.isPending}
                      className="h-9 border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-400"
                    >
                      <Calculator className="h-3 w-3 mr-1" />
                      Recalculate Cost
                    </Button>
                  )}
              </div>
            </div>
          </div>

          {/* Additional Charges */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <h4 className="font-semibold text-gray-800 text-lg">
                Additional Charges
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label
                  htmlFor="taxAmount"
                  className="text-sm font-medium text-gray-700"
                >
                  Tax Amount (RWF)
                </Label>
                <Input
                  id="taxAmount"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.taxAmount}
                  onChange={(e) =>
                    handleInputChange("taxAmount", Number(e.target.value) || 0)
                  }
                  placeholder="Enter tax amount"
                  className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="discountAmount"
                  className="text-sm font-medium text-gray-700"
                >
                  Discount Amount (RWF)
                </Label>
                <Input
                  id="discountAmount"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.discountAmount}
                  onChange={(e) =>
                    handleInputChange(
                      "discountAmount",
                      Number(e.target.value) || 0
                    )
                  }
                  placeholder="Enter discount amount"
                  className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Due Date */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <h4 className="font-semibold text-gray-800 text-lg">
                Payment Terms
              </h4>
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="dueDate"
                className="text-sm font-medium text-gray-700"
              >
                Due Date *
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange("dueDate", e.target.value)}
                className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Invoice Summary */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                Invoice Summary
              </h3>
              <p className="text-gray-600 text-sm font-normal">
                Final billing amount
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Subtotal:</span>
                <span className="font-semibold text-lg">
                  {formatCurrency(formData.subtotal)}
                </span>
              </div>
            </div>

            {formData.taxAmount > 0 && (
              <div className="bg-white p-4 rounded-lg border border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Tax:</span>
                  <span className="font-semibold text-lg text-blue-600">
                    {formatCurrency(formData.taxAmount)}
                  </span>
                </div>
              </div>
            )}

            {formData.discountAmount > 0 && (
              <div className="bg-white p-4 rounded-lg border border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Discount:</span>
                  <span className="font-semibold text-lg text-red-600">
                    -{formatCurrency(formData.discountAmount)}
                  </span>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-gray-800">
                  Total Amount:
                </span>
                <span className="text-3xl font-bold text-green-600">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              <div className="mt-2 text-sm text-green-700">
                💰 Final amount to be invoiced
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Notes */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <FileText className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                Additional Notes
              </h3>
              <p className="text-gray-600 text-sm font-normal">
                Required invoice details
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            <Label
              htmlFor="notes"
              className="text-sm font-medium text-gray-700"
            >
              Notes <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="notes"
              placeholder="Enter additional notes for the invoice..."
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
              className={`border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none placeholder:text-gray-400 placeholder:opacity-70 placeholder:text-sm placeholder:font-normal ${
                errors.notes ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
              }`}
            />
            {errors.notes && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.notes}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Actions */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={generateInvoiceMutation.isPending}
            className="h-11 px-6 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={generateInvoiceMutation.isPending}
            className="h-11 px-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
          >
            {generateInvoiceMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Creating Invoice...
              </>
            ) : (
              <>
                <DollarSign className="h-4 w-4 mr-2" />
                Create Invoice
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
