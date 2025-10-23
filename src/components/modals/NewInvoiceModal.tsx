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
import { Calculator, DollarSign, Package } from "lucide-react";
import { useGenerateInvoice } from "@/lib/api/hooks/invoiceHooks";
import { useAllCargos, useEstimateCargoCost } from "@/lib/api/hooks/cargoHooks";
import { toast } from "sonner";

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

  // Extract data with stable reference
  const cargos = useMemo(() => {
    const data = (cargosData as any)?.data || [];
    console.log("📦 Cargos data updated:", data.length, "cargos");
    return data;
  }, [cargosData]);

  // Calculate total amount
  useEffect(() => {
    const totalAmount =
      formData.subtotal + formData.taxAmount - formData.discountAmount;
    setFormData((prev) => ({
      ...prev,
      totalAmount,
    }));
  }, [formData.subtotal, formData.taxAmount, formData.discountAmount]);

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
                  subtotal: cargo.estimated_cost,
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
            subtotal: cargo.estimated_cost,
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
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.cargoId) {
      toast.error("Please select a cargo");
      return;
    }

    if (formData.subtotal <= 0) {
      toast.error("Please enter a valid subtotal amount");
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
        notes: formData.notes,
      };

      await generateInvoiceMutation.mutateAsync(invoiceData);
      toast.success("Invoice created successfully!");
      onSuccess?.(invoiceData);
      handleClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to create invoice");
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

  const selectedCargo = cargos.find(
    (cargo: any) => cargo.id === formData.cargoId
  );

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Create New Invoice</h3>
        <p className="text-sm text-blue-700">
          Create an invoice for the selected cargo delivery.
        </p>
      </div>

      {/* Cargo Information Display */}
      {selectedCargo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              Cargo Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Cargo ID</p>
                <p className="text-lg font-semibold">
                  {selectedCargo.cargo_number || selectedCargo.id}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <Badge variant="outline" className="text-xs">
                  {selectedCargo.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Route</p>
                <p className="text-sm">
                  {selectedCargo.pickup_address} →{" "}
                  {selectedCargo.destination_address}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Weight & Type
                </p>
                <p className="text-sm">
                  {selectedCargo.weight_kg}kg •{" "}
                  {selectedCargo.type || "General"}
                </p>
              </div>
              {selectedCargo.estimated_cost && (
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Estimated Cost
                  </p>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(selectedCargo.estimated_cost)}
                  </p>
                  {estimateCostMutation.isPending && (
                    <p className="text-xs text-blue-600 mt-1">
                      🔄 Recalculating cost...
                    </p>
                  )}
                </div>
              )}
              {selectedCargo.pickup_date && (
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Pickup Date
                  </p>
                  <p className="text-sm">
                    {new Date(selectedCargo.pickup_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoice Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Invoice Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subtotal">Subtotal (RWF) *</Label>
              <div className="relative">
                <Input
                  id="subtotal"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.subtotal}
                  onChange={(e) =>
                    handleInputChange(
                      "subtotal",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="Enter subtotal amount"
                  disabled={estimateCostMutation.isPending}
                />
                {estimateCostMutation.isPending && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
              {estimateCostMutation.isPending && (
                <p className="text-xs text-blue-600">
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
                    className="text-blue-600 border-blue-300 hover:bg-blue-100"
                  >
                    <Calculator className="h-3 w-3 mr-1" />
                    Recalculate Cost
                  </Button>
                )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxAmount">Tax Amount (RWF)</Label>
              <Input
                id="taxAmount"
                type="number"
                min="0"
                step="0.01"
                value={formData.taxAmount}
                onChange={(e) =>
                  handleInputChange(
                    "taxAmount",
                    parseFloat(e.target.value) || 0
                  )
                }
                placeholder="Enter tax amount"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discountAmount">Discount Amount (RWF)</Label>
              <Input
                id="discountAmount"
                type="number"
                min="0"
                step="0.01"
                value={formData.discountAmount}
                onChange={(e) =>
                  handleInputChange(
                    "discountAmount",
                    parseFloat(e.target.value) || 0
                  )
                }
                placeholder="Enter discount amount"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange("dueDate", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Invoice Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">
                {formatCurrency(formData.subtotal)}
              </span>
            </div>
            {formData.taxAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Tax:</span>
                <span className="font-medium">
                  {formatCurrency(formData.taxAmount)}
                </span>
              </div>
            )}
            {formData.discountAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Discount:</span>
                <span className="font-medium text-green-600">
                  -{formatCurrency(formData.discountAmount)}
                </span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total Amount:</span>
              <span>
                {formatCurrency(
                  formData.subtotal +
                    formData.taxAmount -
                    formData.discountAmount
                )}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Additional notes for the invoice..."
          value={formData.notes}
          onChange={(e) => handleInputChange("notes", e.target.value)}
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
          disabled={generateInvoiceMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={generateInvoiceMutation.isPending}
          className="bg-gradient-primary hover:bg-primary-hover"
        >
          {generateInvoiceMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Creating...
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
  );
}
