import React, { useState, useEffect, useMemo } from "react";
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
import { useAllCargos } from "@/lib/api/hooks/cargoHooks";
import { usePricingPolicies } from "@/lib/api/hooks/utilityHooks";
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
    pricingPolicyId: "", // Selected policy; price calculated from policy × weight
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
  const {
    data: pricingPolicies = [],
    isLoading: isLoadingPolicies,
  } = usePricingPolicies({ is_active: true });

  // Validation errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Extract data with stable reference
  const cargos = useMemo(() => {
    const data = (cargosData as any)?.data || [];
    console.log("📦 Cargos data updated:", data.length, "cargos");
    return data;
  }, [cargosData]);

  const selectedCargo = cargos.find(
    (cargo: any) => cargo.id === formData.cargoId
  );

  // Calculate total amount - this is now computed directly in the render
  const totalAmount =
    formData.subtotal + formData.taxAmount - formData.discountAmount;

  // Auto-populate cargo and due date when preselectedCargoId is provided (price comes from policy)
  useEffect(() => {
    if (isOpen && preselectedCargoId && cargos.length > 0) {
      const cargo = cargos.find((c: any) => c.id === preselectedCargoId);
      if (cargo) {
        setFormData((prev) => ({
          ...prev,
          cargoId: preselectedCargoId,
        }));
        if (cargo.pickup_date) {
          const pickupDate = new Date(cargo.pickup_date);
          const dueDate = new Date(pickupDate);
          dueDate.setDate(dueDate.getDate() - 1);
          setFormData((prev) => ({
            ...prev,
            dueDate: dueDate.toISOString().split("T")[0],
          }));
        } else {
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + 30);
          setFormData((prev) => ({
            ...prev,
            dueDate: futureDate.toISOString().split("T")[0],
          }));
        }
      }
    }
  }, [isOpen, preselectedCargoId, cargos]);

  // Calculate subtotal when policy + weight changes
  useEffect(() => {
    if (formData.pricingPolicyId && selectedCargo?.weight_kg) {
      const policy = pricingPolicies.find((p: any) => p.id === formData.pricingPolicyId);
      if (policy) {
        const calculatedSubtotal = (policy.rate_per_kg || 0) * (selectedCargo.weight_kg || 0);
        const finalSubtotal = policy.minimum_fare && calculatedSubtotal < policy.minimum_fare
          ? policy.minimum_fare
          : calculatedSubtotal;
        setFormData((prev) => ({
          ...prev,
          subtotal: finalSubtotal,
        }));
      }
    }
  }, [formData.pricingPolicyId, selectedCargo?.weight_kg, pricingPolicies]);

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

    if (!formData.pricingPolicyId) {
      validationErrors.pricingPolicyId = "Please select a pricing policy";
    }
    if (formData.subtotal <= 0) {
      validationErrors.subtotal = "Subtotal is calculated after you select a pricing policy";
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
      const invoiceData: any = {
        cargo_id: formData.cargoId,
        tax_amount: formData.taxAmount,
        discount_amount: formData.discountAmount,
        currency: formData.currency,
        due_date: formData.dueDate,
        notes: formData.notes.trim(), // Trim whitespace before sending
      };

      invoiceData.pricing_policy_id = formData.pricingPolicyId;

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
      pricingPolicyId: "",
      subtotal: 0,
      taxAmount: 0,
      discountAmount: 0,
      currency: "RWF",
      dueDate: "",
      notes: "",
    });
    setErrors({});
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

  return (
    <div className="space-y-8">
      {/* Header – clear section */}
      <section
        className="rounded-xl border border-gray-200 bg-white p-6"
        aria-labelledby="new-invoice-heading"
      >
        <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
          <DollarSign className="h-5 w-5 text-blue-600" />
          <div>
            <h2 id="new-invoice-heading" className="text-lg font-semibold text-gray-800">
              Create New Invoice
            </h2>
            <p className="text-sm text-gray-500 font-normal mt-0.5">
              Step 2: Generate billing document
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Create a professional invoice for the selected cargo delivery with
          automatic cost calculation.
        </p>
      </section>

      {/* Cargo Information – single section, clear data */}
      {selectedCargo && (
        <section
          className="rounded-xl border border-gray-200 bg-white p-6"
          aria-labelledby="cargo-info-heading"
        >
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
            <Package className="h-5 w-5 text-blue-600" />
            <h3 id="cargo-info-heading" className="text-lg font-semibold text-gray-800">
              Cargo Information
            </h3>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-sm">
            <div>
              <dt className="text-gray-500 font-medium mb-0.5">Cargo number</dt>
              <dd className="text-gray-900 font-mono font-semibold">
                {selectedCargo.cargo_number || selectedCargo.id}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 font-medium mb-0.5">Status</dt>
              <dd>
                <Badge variant="outline" className="text-xs font-medium">
                  {selectedCargo.status}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 font-medium mb-0.5">Weight & type</dt>
              <dd className="text-gray-900 font-medium">
                {selectedCargo.weight_kg} kg • {selectedCargo.type || "General"}
              </dd>
            </div>
            {selectedCargo.pickup_date ? (
              <div>
                <dt className="text-gray-500 font-medium mb-0.5">Pickup date</dt>
                <dd className="text-gray-900 font-medium">
                  {new Date(selectedCargo.pickup_date).toLocaleDateString()}
                </dd>
              </div>
            ) : null}
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-gray-500 font-medium mb-0.5">Route</dt>
              <dd className="text-gray-900 mt-1 space-y-1">
                <p className="font-medium">Pickup: {selectedCargo.pickup_address || "—"}</p>
                <p className="font-medium">Delivery: {selectedCargo.destination_address || "—"}</p>
              </dd>
            </div>
          </dl>
        </section>
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
          {/* Pricing Policy – select policy, price shown below */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <h4 className="font-semibold text-gray-800 text-lg">
                Pricing Policy
              </h4>
            </div>
            <div className="space-y-3">
              <Label
                htmlFor="pricingPolicyId"
                className="text-sm font-medium text-gray-700"
              >
                Select Pricing Policy *
              </Label>
              <Select
                value={formData.pricingPolicyId}
                onValueChange={(value) => {
                  handleInputChange("pricingPolicyId", value);
                  if (selectedCargo?.weight_kg && value) {
                    const policy = pricingPolicies.find((p: any) => p.id === value);
                    if (policy) {
                      const calculatedSubtotal = (policy.rate_per_kg || 0) * (selectedCargo.weight_kg || 0);
                      const finalSubtotal = policy.minimum_fare && calculatedSubtotal < policy.minimum_fare
                        ? policy.minimum_fare
                        : calculatedSubtotal;
                      setFormData((prev) => ({
                        ...prev,
                        subtotal: finalSubtotal,
                      }));
                    }
                  }
                }}
                disabled={isLoadingPolicies}
              >
                <SelectTrigger id="pricingPolicyId" className="h-11">
                  <SelectValue placeholder={isLoadingPolicies ? "Loading policies..." : "Select a pricing policy"} />
                </SelectTrigger>
                <SelectContent>
                  {pricingPolicies.length === 0 ? (
                    <SelectItem value="none" disabled>
                      {isLoadingPolicies ? "Loading..." : "No active policies available"}
                    </SelectItem>
                  ) : (
                    pricingPolicies.map((policy: any) => (
                      <SelectItem key={policy.id} value={policy.id}>
                        {policy.name} - {formatCurrency(policy.rate_per_kg || 0)}/kg
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.pricingPolicyId && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.pricingPolicyId}
                </p>
              )}
              {formData.pricingPolicyId && selectedCargo?.weight_kg && (
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-gray-800">
                    Subtotal: {formatCurrency(formData.subtotal)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {selectedCargo.weight_kg} kg × {formatCurrency(
                      pricingPolicies.find((p: any) => p.id === formData.pricingPolicyId)?.rate_per_kg || 0
                    )}/kg
                    {(() => {
                      const policy = pricingPolicies.find((p: any) => p.id === formData.pricingPolicyId);
                      if (policy?.minimum_fare && formData.subtotal === policy.minimum_fare) {
                        return " (minimum fare applied)";
                      }
                      return "";
                    })()}
                  </p>
                </div>
              )}
            </div>
          </div>

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
                <Label
                  htmlFor="subtotal"
                  className="text-sm font-medium text-gray-700"
                >
                  Calculated Subtotal (RWF)
                </Label>
                <Input
                  id="subtotal"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.subtotal}
                  readOnly
                  placeholder="Select a pricing policy above"
                  disabled
                  className="h-12 text-lg font-semibold border-gray-200 bg-emerald-50"
                />
                {errors.subtotal && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.subtotal}
                  </p>
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
