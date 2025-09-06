import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ModernModel from "@/components/modal/ModernModel";
import {
  Download,
  Eye,
  MapPin,
  Calendar,
  Receipt,
  Phone,
  Mail,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Package,
  Truck,
} from "lucide-react";

export interface InvoiceDetail {
  id: string;
  invoice_number: string;
  cargo_id: string;
  subtotal: string;
  tax_amount: string;
  discount_amount: string;
  total_amount: string;
  currency: string;
  status: string;
  due_date: string;
  paid: boolean;
  paid_at?: string;
  payment_method?: string;
  payment_reference?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  cargo: {
    id: string;
    type: string;
    pickup_address: string;
    destination_address: string;
  };
}

interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceDetail | null;
  onDownload?: (invoiceId: string) => void;
  onPay?: (invoiceId: string) => void;
}

export function InvoiceDetailModal({
  isOpen,
  onClose,
  invoice,
  onDownload,
  onPay,
}: InvoiceDetailModalProps) {
  if (!invoice) return null;

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Paid
          </Badge>
        );
      case "sent":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            Sent
          </Badge>
        );
      case "overdue":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Overdue
          </Badge>
        );
      case "draft":
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            Draft
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            {status}
          </Badge>
        );
    }
  };

  const formatCurrency = (amount: string, currency: string) => {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat("rw-RW", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <ModernModel
      isOpen={isOpen}
      onClose={onClose}
      title={`Invoice ${invoice.invoice_number}`}
    >
      <div className="space-y-6">
        {/* Company Header */}
        <div className="text-center border-b pb-6">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img src="/logo.png" alt="Loveway Logo" className="h-12 w-auto" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Loveway Rwanda Co. Ltd
              </h1>
              <p className="text-sm text-gray-600">
                Logistics & Transportation Services
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <p>Kigali, Rwanda</p>
            <p>Phone: +250 788 123 456 | Email: info@loveway.rw</p>
          </div>
        </div>

        {/* Invoice Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900">INVOICE</h2>
            <p className="text-sm text-gray-600">
              Invoice #: {invoice.invoice_number}
            </p>
            <p className="text-sm text-gray-600">
              Date: {formatDate(invoice.created_at)}
            </p>
          </div>
          <div className="text-right">
            {getStatusBadge(invoice.status)}
            <p className="text-sm text-gray-600 mt-2">
              Due Date: {formatDate(invoice.due_date)}
            </p>
          </div>
        </div>

        {/* Cargo Information */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Package className="h-5 w-5 text-orange-600" />
              <h3 className="font-semibold text-gray-900">Cargo Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Cargo ID</p>
                <p className="font-semibold">{invoice.cargo_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <p className="font-semibold">{invoice.cargo.type}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-green-600 mt-1" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">
                    PICKUP LOCATION
                  </p>
                  <p className="text-sm font-semibold">
                    {invoice.cargo.pickup_address}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-red-600 mt-1" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">
                    DELIVERY LOCATION
                  </p>
                  <p className="text-sm font-semibold">
                    {invoice.cargo.destination_address}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Details */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Receipt className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Invoice Details</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">
                  {formatCurrency(invoice.subtotal, invoice.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax ({invoice.currency}):</span>
                <span className="font-semibold">
                  {formatCurrency(invoice.tax_amount, invoice.currency)}
                </span>
              </div>
              {parseFloat(invoice.discount_amount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span className="font-semibold">
                    -{formatCurrency(invoice.discount_amount, invoice.currency)}
                  </span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                <span>Total Amount:</span>
                <span className="text-primary">
                  {formatCurrency(invoice.total_amount, invoice.currency)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        {invoice.paid && invoice.paid_at && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">
                  Payment Information
                </h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Date:</span>
                  <span className="font-semibold">
                    {formatDate(invoice.paid_at)}
                  </span>
                </div>
                {invoice.payment_method && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-semibold capitalize">
                      {invoice.payment_method.replace("_", " ")}
                    </span>
                  </div>
                )}
                {invoice.payment_reference && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reference:</span>
                    <span className="font-semibold">
                      {invoice.payment_reference}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {invoice.notes && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Notes</h3>
              </div>
              <p className="text-sm text-gray-700">{invoice.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onDownload?.(invoice.id)}
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          {invoice.status === "sent" && !invoice.paid && (
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => onPay?.(invoice.id)}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Pay Now
            </Button>
          )}
        </div>
      </div>
    </ModernModel>
  );
}
