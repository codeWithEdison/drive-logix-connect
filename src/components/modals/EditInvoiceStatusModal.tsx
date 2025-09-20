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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  DollarSign,
  Calendar,
  User,
  Package,
  MapPin,
  Edit,
} from "lucide-react";
import { useUpdateInvoiceStatus } from "@/lib/api/hooks/invoiceHooks";
import { toast } from "sonner";
import { InvoiceStatus, PaymentMethod } from "@/types/shared";

interface EditInvoiceStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any;
  onSuccess?: (updatedInvoice: any) => void;
}

// Status configuration
const statusConfig = {
  draft: {
    label: "Draft",
    className: "bg-gray-100 text-gray-800 border-gray-200",
    icon: FileText,
  },
  sent: {
    label: "Sent",
    className: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Clock,
  },
  paid: {
    label: "Paid",
    className: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
  },
  overdue: {
    label: "Overdue",
    className: "bg-red-100 text-red-800 border-red-200",
    icon: AlertCircle,
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-gray-100 text-gray-800 border-gray-200",
    icon: FileText,
  },
};

export default function EditInvoiceStatusModal({
  isOpen,
  onClose,
  invoice,
  onSuccess,
}: EditInvoiceStatusModalProps) {
  // Form state
  const [formData, setFormData] = useState({
    status: "",
    paymentMethod: "",
    paymentReference: "",
    notes: "",
  });

  // API hooks
  const updateInvoiceStatusMutation = useUpdateInvoiceStatus();

  // Initialize form data when invoice changes
  useEffect(() => {
    if (invoice) {
      setFormData({
        status: invoice.status || "",
        paymentMethod: invoice.payment_method || "",
        paymentReference: invoice.payment_reference || "",
        notes: invoice.notes || "",
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
    if (!formData.status) {
      toast.error("Please select a status");
      return;
    }

    if (formData.status === "paid" && !formData.paymentMethod) {
      toast.error("Please select a payment method for paid invoices");
      return;
    }

    try {
      const updateData = {
        status: formData.status as InvoiceStatus,
        payment_method: formData.paymentMethod as PaymentMethod,
        payment_reference: formData.paymentReference,
        notes: formData.notes,
      };

      await updateInvoiceStatusMutation.mutateAsync({
        id: invoice.id,
        data: updateData,
      });

      toast.success("Invoice status updated successfully!");
      onSuccess?.({ ...invoice, ...updateData });
      handleClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to update invoice status");
    }
  };

  const handleClose = () => {
    setFormData({
      status: "",
      paymentMethod: "",
      paymentReference: "",
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

  const currentStatus =
    statusConfig[invoice?.status as keyof typeof statusConfig];
  const StatusIcon = currentStatus?.icon || FileText;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">
          Edit Invoice Status
        </h3>
        <p className="text-sm text-blue-700">
          Update the status and payment information for this invoice.
        </p>
      </div>

      {/* Invoice Details */}
      {invoice && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
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
                    Amount
                  </Label>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(parseFloat(invoice.total_amount || 0))}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Current Status
                  </Label>
                  <div className="flex items-center gap-2">
                    <StatusIcon className="h-4 w-4" />
                    <Badge className={currentStatus?.className}>
                      {currentStatus?.label}
                    </Badge>
                  </div>
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

            {/* Cargo Details */}
            {invoice.cargo && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium text-gray-900 mb-2">
                  Cargo Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <Label className="text-xs text-gray-500">Pickup</Label>
                      <p className="text-sm">{invoice.cargo.pickup_address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-blue-500 mt-0.5" />
                    <div>
                      <Label className="text-xs text-gray-500">
                        Destination
                      </Label>
                      <p className="text-sm">
                        {invoice.cargo.destination_address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Status Update Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Update Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">New Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>Draft</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="sent">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Sent</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="paid">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Paid</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="overdue">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <span>Overdue</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="cancelled">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>Cancelled</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method - Only show if status is paid */}
            {formData.status === "paid" && (
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
            )}

            {/* Payment Reference - Only show if status is paid */}
            {formData.status === "paid" && (
              <div className="space-y-2">
                <Label htmlFor="paymentReference">Payment Reference</Label>
                <Input
                  id="paymentReference"
                  placeholder="Enter payment reference (transaction ID, receipt number, etc.)"
                  value={formData.paymentReference}
                  onChange={(e) =>
                    handleInputChange("paymentReference", e.target.value)
                  }
                />
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes about this status change..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Change Preview */}
      {formData.status && formData.status !== invoice?.status && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <h4 className="font-medium text-blue-900 mb-2">
              Status Change Preview
            </h4>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <StatusIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">From:</span>
                <Badge className={currentStatus?.className}>
                  {currentStatus?.label}
                </Badge>
              </div>
              <div className="text-gray-400">→</div>
              <div className="flex items-center gap-2">
                {React.createElement(
                  statusConfig[formData.status as keyof typeof statusConfig]
                    ?.icon || FileText,
                  {
                    className: "h-4 w-4 text-blue-500",
                  }
                )}
                <span className="text-sm text-gray-600">To:</span>
                <Badge
                  className={
                    statusConfig[formData.status as keyof typeof statusConfig]
                      ?.className
                  }
                >
                  {
                    statusConfig[formData.status as keyof typeof statusConfig]
                      ?.label
                  }
                </Badge>
              </div>
            </div>
            {formData.status === "paid" && formData.paymentMethod && (
              <div className="mt-2 text-sm text-blue-700">
                Payment Method:{" "}
                {formData.paymentMethod.replace("_", " ").toUpperCase()}
                {formData.paymentReference && (
                  <span className="ml-2">
                    | Reference: {formData.paymentReference}
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
          disabled={updateInvoiceStatusMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={updateInvoiceStatusMutation.isPending}
          className="bg-gradient-primary hover:bg-primary-hover"
        >
          {updateInvoiceStatusMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Updating...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Update Status
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
