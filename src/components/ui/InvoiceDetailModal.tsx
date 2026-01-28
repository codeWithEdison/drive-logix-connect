import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ModernModel from "@/components/modal/ModernModel";
import {
  InvoicePaymentModal,
  InvoicePaymentData,
} from "@/components/ui/InvoicePaymentModal";
import { PaypackPayment } from "@/components/payments/PaypackPayment";
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
  Edit,
  X,
  Building2,
  Smartphone,
  Upload,
  Send,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useUpdateInvoiceStatus } from "@/lib/api/hooks/invoiceHooks";
import { InvoiceStatus } from "@/types/shared";
import { toast } from "sonner";
import PaymentConfirmationModal from "@/components/modals/PaymentConfirmationModal";
import OfflinePaymentVerificationModal from "@/components/modals/OfflinePaymentVerificationModal";

export interface InvoiceDetail {
  id: string;
  invoice_number: string;
  cargo_id: string;
  pricing_policy_id?: string | null; // NEW: Policy ID
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
    cargo_number?: string; // Add cargo_number field
    type: string;
    pickup_address: string;
    destination_address: string;
  };
  // NEW: Pricing policy object (from API detail response)
  pricing_policy?: {
    id: string;
    name: string;
    rate_per_kg: number;
    minimum_fare?: number | null;
  };
}

interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceDetail | null;
  onDownload?: (invoiceId: string) => void;
  onPay?: (invoiceId: string) => void;
  onPaymentSuccess?: (paymentData: any) => void;
  showAdminActions?: boolean;
}

export function InvoiceDetailModal({
  isOpen,
  onClose,
  invoice,
  onDownload,
  onPay,
  onPaymentSuccess,
  showAdminActions = false,
}: InvoiceDetailModalProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const updateInvoiceStatusMutation = useUpdateInvoiceStatus();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isMobileMoneyPaymentOpen, setIsMobileMoneyPaymentOpen] = useState(false);
  const [isPaymentConfirmationModalOpen, setIsPaymentConfirmationModalOpen] =
    useState(false);
  const [isOfflineVerificationOpen, setIsOfflineVerificationOpen] =
    useState(false);
  const [showTransferOptions, setShowTransferOptions] = useState(false);
  const [selectedTransferType, setSelectedTransferType] = useState<
    "momo" | "bank" | null
  >(null);

  if (!invoice) return null;

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    const statusText = t(`invoices.status.${statusLower}`, status);

    switch (statusLower) {
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            {statusText}
          </Badge>
        );
      case "sent":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            {statusText}
          </Badge>
        );
      case "overdue":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            {statusText}
          </Badge>
        );
      case "draft":
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            {statusText}
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            {statusText}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            {statusText}
          </Badge>
        );
    }
  };

  const formatCurrency = (amount: string | number, currency: string) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
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

  const handlePayNow = () => {
    if (showAdminActions) {
      setIsPaymentConfirmationModalOpen(true);
    } else {
      setIsPaymentModalOpen(true);
    }
  };

  const handlePaymentSuccess = (paymentData: any) => {
    setIsPaymentModalOpen(false);
    setIsMobileMoneyPaymentOpen(false);
    setIsPaymentConfirmationModalOpen(false);
    if (onPaymentSuccess) {
      onPaymentSuccess(paymentData);
    }
    toast.success(t("invoices.paymentProcessedSuccessfully"));
  };

  const handleMobileMoneyPaymentSuccess = (paymentData: any) => {
    handlePaymentSuccess(paymentData);
  };

  const handleMobileMoneyPaymentCancel = () => {
    setIsMobileMoneyPaymentOpen(false);
  };

  // Helper functions for PaypackPayment
  const getCargoNumber = (cargoId: string, cargoNumber?: string) => {
    if (cargoNumber) {
      return cargoNumber;
    }
    return cargoId.startsWith("#") ? cargoId : `#${cargoId}`;
  };

  const getInvoiceNumber = (invoiceNumber: string) => {
    return invoiceNumber.startsWith("LI")
      ? invoiceNumber
      : `LI${invoiceNumber}`;
  };

  const canPay = () => {
    return invoice.status === "sent" && !invoice.paid;
  };

  const canAdminAction = () => {
    return (
      showAdminActions &&
      (invoice.status === "sent" || invoice.status === "draft")
    );
  };

  const handleTransferOption = (type: "momo" | "bank") => {
    setSelectedTransferType(type);
    setShowTransferOptions(true);
  };

  const handlePayOnline = () => {
    // Open mobile money payment modal directly (phone input only)
    setIsMobileMoneyPaymentOpen(true);
  };

  const handleBackToOptions = () => {
    setShowTransferOptions(false);
    setSelectedTransferType(null);
  };

  const handleMarkAsPaid = async () => {
    try {
      await updateInvoiceStatusMutation.mutateAsync({
        id: invoice.id,
        data: { status: InvoiceStatus.PAID },
      });
      toast.success(t("invoices.markAsPaidSuccess") ?? "Invoice marked as paid");
      onPaymentSuccess?.({ invoiceId: invoice.id, status: "paid" });
      onClose?.();
    } catch (err: any) {
      console.error("Mark as paid failed:", err);
      toast.error(
        err?.response?.data?.message ??
          t("invoices.markAsPaidError") ??
          "Failed to mark invoice as paid"
      );
    }
  };

  return (
    <ModernModel
      isOpen={isOpen}
      onClose={onClose}
      title={`${t("invoices.invoiceLabel")} ${invoice.invoice_number} - ${
        invoice.cargo?.cargo_number || invoice.cargo_id || t("invoices.naLabel")
      }`}
    >
      <div className="space-y-6">
        {/* Company Header */}
        <div className="text-center border-b pb-6">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img
              src="/logo.png"
              alt="Loveway Logo"
              className="h-14 w-auto object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t("invoices.companyName")}
              </h1>
              <p className="text-sm text-gray-600">
                {t("invoices.companyTagline")}
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <p>{t("invoices.companyLocation")}</p>
            <p>{t("invoices.companyContact")}</p>
          </div>
        </div>

        {/* Invoice Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {t("invoices.invoiceLabel")}
            </h2>
            <p className="text-sm text-gray-600">
              {t("invoices.invoiceNumberLabel")}: {invoice.invoice_number}
            </p>
            <p className="text-sm text-gray-600">
              {t("invoices.cargoNumberLabel")}:{" "}
              {invoice.cargo?.cargo_number ||
                invoice.cargo_id ||
                t("invoices.naLabel")}
            </p>
            <p className="text-sm text-gray-600">
              {t("invoices.dateLabel")}: {formatDate(invoice.created_at)}
            </p>
          </div>
          <div className="text-right">
            {getStatusBadge(invoice.status)}
            <p className="text-sm text-gray-600 mt-2">
              {t("invoices.dueDateLabel")}: {formatDate(invoice.due_date)}
            </p>
          </div>
        </div>

        {/* Cargo Information */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Package className="h-5 w-5 text-orange-600" />
              <h3 className="font-semibold text-gray-900">
                {t("invoices.cargoInformation")}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">
                  {t("invoices.cargoNumberField")}
                </p>
                <p className="font-semibold font-mono">
                  {invoice.cargo?.cargo_number ||
                    invoice.cargo_id ||
                    t("invoices.naLabel")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {t("invoices.typeField")}
                </p>
                <p className="font-semibold capitalize">
                  {invoice.cargo?.type || t("invoices.naLabel")}
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-green-600 mt-1" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">
                    {t("invoices.pickupLocation")}
                  </p>
                  <p className="text-sm font-semibold">
                    {invoice.cargo?.pickup_address || t("invoices.naLabel")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-red-600 mt-1" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">
                    {t("invoices.deliveryLocation")}
                  </p>
                  <p className="text-sm font-semibold">
                    {invoice.cargo?.destination_address ||
                      t("invoices.naLabel")}
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
              <h3 className="font-semibold text-gray-900">
                {t("invoices.invoiceDetails")}
              </h3>
            </div>
            <div className="space-y-3">
              {/* Pricing Policy Section */}
              {invoice.pricing_policy && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Receipt className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-900">
                      {t("invoices.pricingPolicyUsed") || "Pricing Policy Used"}
                    </span>
                  </div>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">{invoice.pricing_policy.name}</p>
                    <p className="text-xs text-blue-600 mt-1">
                      {t("invoices.ratePerKg") || "Rate"}: {formatCurrency(invoice.pricing_policy.rate_per_kg, invoice.currency)}/kg
                      {invoice.pricing_policy.minimum_fare && (
                        <span className="ml-2">
                          • {t("invoices.minimumFare") || "Min"}: {formatCurrency(invoice.pricing_policy.minimum_fare, invoice.currency)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {t("invoices.subtotalLabel")}:
                </span>
                <span className="font-semibold">
                  {formatCurrency(invoice.subtotal, invoice.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {t("invoices.taxLabel")} ({invoice.currency}):
                </span>
                <span className="font-semibold">
                  {formatCurrency(invoice.tax_amount, invoice.currency)}
                </span>
              </div>
              {parseFloat(invoice.discount_amount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>{t("invoices.discountLabel")}:</span>
                  <span className="font-semibold">
                    -{formatCurrency(invoice.discount_amount, invoice.currency)}
                  </span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                <span>{t("invoices.totalAmountLabel")}:</span>
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
                  {t("invoices.paymentInformation")}
                </h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {t("invoices.paymentDate")}:
                  </span>
                  <span className="font-semibold">
                    {formatDate(invoice.paid_at)}
                  </span>
                </div>
                {invoice.payment_method && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {t("invoices.paymentMethodLabel")}:
                    </span>
                    <span className="font-semibold capitalize">
                      {invoice.payment_method?.replace("_", " ") ||
                        t("invoices.unknownLabel")}
                    </span>
                  </div>
                )}
                {invoice.payment_reference && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {t("invoices.referenceLabel")}:
                    </span>
                    <span className="font-semibold">
                      {invoice.payment_reference}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Options */}
        {!invoice.paid && invoice.status === "sent" && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">
                  {t("invoices.paymentOptions")}
                </h3>
              </div>

              {!showTransferOptions ? (
                /* Initial Payment Options */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Bank Transfer Option */}
                    <Button
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center gap-2 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-900"
                      onClick={() => handleTransferOption("bank")}
                    >
                      <img
                        src="/image/bank.png"
                        alt="Bank of Kigali"
                        className="h-10 w-auto object-contain"
                      />
                      <span className="font-semibold text-gray-900 hover:text-blue-900">
                        {t("invoices.bankTransfer")}
                      </span>
                      <span className="text-xs text-gray-600 hover:text-blue-700">
                        {t("invoices.manualVerification")}
                      </span>
                    </Button>

                    {/* Mobile Money / Airtel Money Option */}
                    <Button
                      className="h-24 flex flex-col items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white border-2 border-green-500"
                      onClick={handlePayOnline}
                    >
                      <img
                        src="/image/aiter_mtn_momo.png"
                        alt="Mobile Money / Airtel Money"
                        className="h-10 w-auto object-contain"
                      />
                      <span className="font-semibold">
                        Mobile Money / Airtel Money
                      </span>
                    </Button>

                    {/* Mobile Money Option - Commented Out */}
                    {/* <Button
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center gap-2 border-2 border-yellow-200 hover:border-yellow-400 hover:bg-yellow-50 hover:text-yellow-900"
                      onClick={() => handleTransferOption("momo")}
                    >
                      <img
                        src="/image/momo.png"
                        alt="MTN Mobile Money"
                        className="h-10 w-auto object-contain"
                      />
                      <span className="font-semibold text-gray-900 hover:text-yellow-900">
                        {t("invoices.mobileMoney")}
                      </span>
                      <span className="text-xs text-gray-600 hover:text-yellow-700">
                        {t("invoices.momoTransfer")}
                      </span>
                    </Button> */}
                  </div>
                </div>
              ) : (
                /* Transfer Details Section */
                <div className="space-y-4">
                  {/* Back Button */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBackToOptions}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <X className="h-4 w-4 mr-1" />
                      {t("invoices.backToOptions")}
                    </Button>
                  </div>

                  {/* Bank Transfer Details */}
                  {selectedTransferType === "bank" && (
                    <div className="border rounded-lg p-4 bg-blue-50">
                      <div className="flex items-center gap-3 mb-3">
                        <Building2 className="h-5 w-5 text-blue-600" />
                        <h4 className="font-semibold text-gray-900">
                          {t("invoices.bankTransfer")}
                        </h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <img
                            src="/image/bank.png"
                            alt="Bank of Kigali"
                            className="h-8 w-auto object-contain"
                          />
                          <span className="font-medium text-gray-700">
                            {t("invoices.bankOfKigali")}
                          </span>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <p className="text-sm text-gray-600">
                            {t("invoices.accountName")}:
                          </p>
                          <p className="font-mono font-semibold text-gray-900">
                            LOVEWAY RWANDA CO LTD
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {t("invoices.accountNumber")}:
                          </p>
                          <p className="font-mono font-semibold text-gray-900">
                            00289-06965230-80
                          </p>
                        </div>
                      </div>
                      <div className="pt-3">
                        <Button
                          variant="default"
                          onClick={() => setIsOfflineVerificationOpen(true)}
                        >
                          {t("invoices.submitBankTransferVerification")}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Mobile Money Details - Commented Out */}
                  {/* {selectedTransferType === "momo" && (
                    <div className="border rounded-lg p-4 bg-yellow-50">
                      <div className="flex items-center gap-3 mb-3">
                        <Smartphone className="h-5 w-5 text-yellow-600" />
                        <h4 className="font-semibold text-gray-900">
                          {t("invoices.mobileMoney")}
                        </h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <img
                            src="/image/momo.png"
                            alt="MTN Mobile Money"
                            className="h-8 w-auto object-contain"
                          />
                          <span className="font-medium text-gray-700">
                            {t("invoices.mtnMobileMoney")}
                          </span>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <p className="text-sm text-gray-600">
                            {t("invoices.momoCode")}:
                          </p>
                          <p className="font-mono font-semibold text-gray-900">
                            *182*6*1*{invoice.invoice_number}#
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {t("invoices.momoNumber")}:
                          </p>
                          <p className="font-mono font-semibold text-gray-900">
                            +250 788 123 456
                          </p>
                        </div>
                      </div>
                      <div className="pt-3">
                        <Button
                          variant="default"
                          onClick={() => setIsOfflineVerificationOpen(true)}
                        >
                          {t("invoices.submitMomoVerification")}
                        </Button>
                      </div>
                    </div>
                  )} */}

                  {/* Payment Instructions */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-amber-800 mb-2">
                          {t("invoices.paymentInstructionsTitle")}
                        </h4>
                        <p className="text-sm text-amber-700">
                          {t("invoices.paymentInstructionsText")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {invoice.notes && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">
                  {t("invoices.notesLabel")}
                </h3>
              </div>
              <p className="text-sm text-gray-700">{invoice.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Admin / Super Admin Action Buttons */}
        {showAdminActions && (!invoice.paid || canAdminAction()) && (
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            {!invoice.paid && (
              <Button
                variant="default"
                className="flex-1 min-w-[140px] bg-green-600 hover:bg-green-700 text-white"
                onClick={handleMarkAsPaid}
                disabled={updateInvoiceStatusMutation.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {updateInvoiceStatusMutation.isPending
                  ? t("common.loading") ?? "Loading..."
                  : t("invoices.markAsPaid") ?? "Mark as Paid"}
              </Button>
            )}
            {canAdminAction() && (
              <Button
                variant="outline"
                className="flex-1 min-w-[140px] text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => setIsPaymentConfirmationModalOpen(true)}
              >
                <X className="h-4 w-4 mr-2" />
                {t("invoices.cancelInvoice")}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <InvoicePaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        invoice={
          {
            ...invoice,
            total_amount: parseFloat(invoice.total_amount),
          } as InvoicePaymentData
        }
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Mobile Money Payment Modal - Direct phone input (no payment summary) */}
      {isMobileMoneyPaymentOpen && (
        <ModernModel
          isOpen={isMobileMoneyPaymentOpen}
          onClose={handleMobileMoneyPaymentCancel}
          title="Mobile Money / Airtel Money Payment"
        >
          <PaypackPayment
            amount={parseFloat(invoice.total_amount)}
            invoiceId={invoice.id}
            invoiceNumber={getInvoiceNumber(invoice.invoice_number)}
            cargoNumber={getCargoNumber(invoice.cargo_id, invoice.cargo?.cargo_number)}
            customerPhone={user?.phone || ""}
            hideSummary={true}
            onSuccess={handleMobileMoneyPaymentSuccess}
            onCancel={handleMobileMoneyPaymentCancel}
          />
        </ModernModel>
      )}

      {/* Offline Payment Verification Modal (Client) */}
      <OfflinePaymentVerificationModal
        isOpen={isOfflineVerificationOpen}
        onClose={() => setIsOfflineVerificationOpen(false)}
        invoiceId={invoice.id}
        defaultAmount={parseFloat(invoice.total_amount)}
        defaultCurrency={invoice.currency}
      />

      {/* Payment Confirmation Modal for Admin */}
      <ModernModel
        isOpen={isPaymentConfirmationModalOpen}
        onClose={() => setIsPaymentConfirmationModalOpen(false)}
        title={t("invoices.paymentConfirmation")}
      >
        <PaymentConfirmationModal
          isOpen={isPaymentConfirmationModalOpen}
          onClose={() => setIsPaymentConfirmationModalOpen(false)}
          invoice={invoice}
          onSuccess={handlePaymentSuccess}
        />
      </ModernModel>
    </ModernModel>
  );
}
