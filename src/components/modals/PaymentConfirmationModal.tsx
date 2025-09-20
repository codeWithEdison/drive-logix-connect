import React, { useState } from "react";
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
import { CheckCircle, DollarSign, AlertCircle, Receipt } from "lucide-react";
import { useUpdateInvoiceStatus } from "@/lib/api/hooks/invoiceHooks";
import { toast } from "sonner";
import { InvoiceStatus, PaymentMethod } from "@/types/shared";

interface PaymentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any;
  onSuccess?: (updatedInvoice: any) => void;
}

export default function PaymentConfirmationModal({
  isOpen,
  onClose,
  invoice,
  onSuccess,
}: PaymentConfirmationModalProps) {
  // Form state
  const [formData, setFormData] = useState({
    paymentMethod: "",
    paymentReference: "",
    amountPaid: 0,
    notes: "",
  });

  // API hooks
  const updateInvoiceStatusMutation = useUpdateInvoiceStatus();

  // Initialize form data when invoice changes
  React.useEffect(() => {
    if (invoice) {
      setFormData({
        paymentMethod: invoice.payment_method || "",
        paymentReference: invoice.payment_reference || "",
        amountPaid: parseFloat(invoice.total_amount || 0),
        notes: "",
      });
    }
  }, [invoice]);

  // Handlers
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    if (!formData.paymentReference) {
      toast.error("Please enter a payment reference");
      return;
    }

    if (formData.amountPaid <= 0) {
      toast.error("Please enter a valid amount paid");
      return;
    }

    try {
      const updateData = {
        status: "paid" as InvoiceStatus,
        payment_method: formData.paymentMethod as PaymentMethod,
        payment_reference: formData.paymentReference,
        notes: formData.notes,
      };

      await updateInvoiceStatusMutation.mutateAsync({
        id: invoice.id,
        data: updateData,
      });

      toast.success("Invoice marked as paid successfully!");
      onSuccess?.({ ...invoice, ...updateData });
      handleClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to update invoice status");
    }
  };

  const handleCancel = async () => {
    try {
      const updateData = {
        status: "cancelled" as InvoiceStatus,
        notes: formData.notes || "Invoice cancelled by admin",
      };

      await updateInvoiceStatusMutation.mutateAsync({
        id: invoice.id,
        data: updateData,
      });

      toast.success("Invoice cancelled successfully!");
      onSuccess?.({ ...invoice, ...updateData });
      handleClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel invoice");
    }
  };

  const handleClose = () => {
    setFormData({
      paymentMethod: "",
      paymentReference: "",
      amountPaid: 0,
      notes: "",
    });
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

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Confirm Payment</h3>
        <p className="text-sm text-blue-700">
          Confirm the payment details for this invoice.
        </p>
      </div>

      {/* Invoice Details */}
      {invoice && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Invoice Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Invoice Number
                  </Label>
                  <p className="text-sm font-mono bg-gray-50 p-2 rounded">
                    {invoice.invoice_number || invoice.id}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Cargo ID
                  </Label>
                  <p className="text-sm font-mono bg-gray-50 p-2 rounded">
                    {invoice.cargo_id || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Client
                  </Label>
                  <p className="text-sm bg-gray-50 p-2 rounded">
                    {invoice.client?.full_name || "Unknown Client"}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Total Amount
                  </Label>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(parseFloat(invoice.total_amount || 0))}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Current Status
                  </Label>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    {invoice.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Due Date
                  </Label>
                  <p className="text-sm bg-gray-50 p-2 rounded">
                    {invoice.due_date
                      ? new Date(invoice.due_date).toLocaleDateString()
                      : "No due date"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Details Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amountPaid">Amount Paid *</Label>
              <Input
                id="amountPaid"
                type="number"
                min="0"
                step="0.01"
                value={formData.amountPaid}
                onChange={(e) =>
                  handleInputChange(
                    "amountPaid",
                    parseFloat(e.target.value) || 0
                  )
                }
                placeholder="Enter amount paid"
              />
              <p className="text-xs text-gray-500">
                Invoice total:{" "}
                {formatCurrency(parseFloat(invoice?.total_amount || 0))}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) =>
                  handleInputChange("paymentMethod", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span>Cash</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="mobile_money">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span>Mobile Money</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="card">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span>Card</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="bank_transfer">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span>Bank Transfer</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="online">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span>Online Payment</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentReference">Payment Reference *</Label>
              <Input
                id="paymentReference"
                placeholder="Enter payment reference (transaction ID, receipt number, etc.)"
                value={formData.paymentReference}
                onChange={(e) =>
                  handleInputChange("paymentReference", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes about this payment..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <h4 className="font-medium text-green-900 mb-2">Payment Summary</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-green-700">Amount Paid:</span>
              <span className="font-semibold text-green-900">
                {formatCurrency(formData.amountPaid)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-green-700">Payment Method:</span>
              <span className="font-semibold text-green-900">
                {formData.paymentMethod
                  ? formData.paymentMethod.replace("_", " ").toUpperCase()
                  : "Not selected"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-green-700">Reference:</span>
              <span className="font-semibold text-green-900">
                {formData.paymentReference || "Not provided"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={updateInvoiceStatusMutation.isPending}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          <AlertCircle className="h-4 w-4 mr-2" />
          Cancel Invoice
        </Button>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={updateInvoiceStatusMutation.isPending}
          >
            Close
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updateInvoiceStatusMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {updateInvoiceStatusMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Payment
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
