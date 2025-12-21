import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CreditCard,
  DollarSign,
  Receipt,
  CheckCircle,
  AlertCircle,
  Loader2,
  Smartphone,
  X,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useInitializeFlutterwavePayment } from "@/lib/api/hooks/paymentHooks";
import type { InitializeFlutterwavePaymentRequest } from "@/lib/api/hooks/paymentHooks";
import { PaypackPayment } from "./PaypackPayment";

export interface PaymentFlowData {
  id: string;
  invoice_number: string;
  cargo_id: string;
  total_amount: number;
  currency: string;
  status: string;
  cargo?: {
    id: string;
    cargo_number?: string; // Add cargo_number field
    type: string;
    pickup_address: string;
    destination_address: string;
  };
}

interface PaymentFlowProps {
  invoice: PaymentFlowData;
  onSuccess?: (paymentData: any) => void;
  onCancel?: () => void;
}

type PaymentMethod = "flutterwave" | "paypack";

export function PaymentFlow({
  invoice,
  onSuccess,
  onCancel,
}: PaymentFlowProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isInitializing, setIsInitializing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null
  );
  const [showPaymentUI, setShowPaymentUI] = useState(false);

  const initializePaymentMutation = useInitializeFlutterwavePayment();

  const handleInitializeFlutterwavePayment = async () => {
    setIsInitializing(true);

    try {
      const result = await initializePaymentMutation.mutateAsync({
        invoice_id: invoice.id,
        amount: invoice.total_amount,
        customer_email: user?.email || "",
        customer_name: user?.full_name || user?.email || "",
        customer_phone: user?.phone || "",
        redirect_url: `${window.location.origin}/payment/callback`,
      });

      if (result.success && result.data.payment_link) {
        // Redirect to Flutterwave payment page
        window.location.href = result.data.payment_link;
      } else {
        throw new Error(result.message || "Failed to initialize payment");
      }
    } catch (error: any) {
      console.error("Payment initialization error:", error);
      toast.error(
        error.message || "Failed to initialize payment. Please try again."
      );
      setIsInitializing(false);
    }
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);

    if (method === "flutterwave") {
      handleInitializeFlutterwavePayment();
    } else if (method === "paypack") {
      setShowPaymentUI(true);
    }
  };

  const handlePaypackSuccess = (paymentData: any) => {
    if (onSuccess) {
      onSuccess(paymentData);
    }
  };

  const handlePaypackCancel = () => {
    setShowPaymentUI(false);
    setSelectedMethod(null);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("rw-RW", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCargoNumber = (cargoId: string, cargoNumber?: string) => {
    // Prioritize cargo_number from API response
    if (cargoNumber) {
      return cargoNumber;
    }
    // Fallback to cargo_id with formatting
    return cargoId.startsWith("#") ? cargoId : `#${cargoId}`;
  };

  const getInvoiceNumber = (invoiceNumber: string) => {
    return invoiceNumber.startsWith("LI")
      ? invoiceNumber
      : `LI${invoiceNumber}`;
  };

  // Show Paypack payment UI if selected
  if (showPaymentUI && selectedMethod === "paypack") {
    return (
      <PaypackPayment
        amount={invoice.total_amount}
        invoiceId={invoice.id}
        invoiceNumber={getInvoiceNumber(invoice.invoice_number)}
        cargoNumber={getCargoNumber(
          invoice.cargo_id,
          invoice.cargo?.cargo_number
        )}
        customerPhone={user?.phone || ""}
        onSuccess={handlePaypackSuccess}
        onCancel={handlePaypackCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <Card className="border-2 border-primary/20 shadow-md">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Receipt className="h-5 w-5" />
            {t("invoices.paymentSummary")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">
                {t("invoices.invoiceNumber")}
              </p>
              <p className="font-bold text-gray-900 font-mono">
                {getInvoiceNumber(invoice.invoice_number)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">
                {t("invoices.cargoNumber")}
              </p>
              <p className="font-bold text-gray-900 font-mono">
                {getCargoNumber(invoice.cargo_id, invoice.cargo?.cargo_number)}
              </p>
            </div>
          </div>

          {invoice.cargo && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">
                {t("invoices.cargoType")}
              </p>
              <p className="font-bold text-gray-900 capitalize">
                {invoice.cargo.type}
              </p>
            </div>
          )}

          <div className="border-t-2 border-dashed pt-4 bg-gradient-to-r from-primary/5 to-transparent rounded-lg p-4 -mx-2">
            <div className="flex justify-between items-center">
              <span className="text-base font-semibold text-gray-700">
                {t("invoices.totalAmount")}
              </span>
              <span className="text-3xl font-bold text-primary">
                {formatCurrency(invoice.total_amount, invoice.currency)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      <Card className="shadow-md">
        <CardHeader className="border-b bg-gray-50">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            {t("invoices.selectPaymentMethod")}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {t("invoices.paymentInstructions")}
          </p>
        </CardHeader>
        <CardContent className="space-y-3 pt-6">
          {/* Flutterwave Option */}
          <button
            onClick={() => handlePaymentMethodSelect("flutterwave")}
            disabled={isInitializing}
            className="w-full p-5 border-2 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                <CreditCard className="h-7 w-7 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900 mb-1">
                  {t("invoices.cardPayment")}
                </h3>
                <p className="text-sm text-gray-600">
                  {t("invoices.cardPaymentDescription")}
                </p>
                <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  Instant Payment
                </span>
              </div>
              {isInitializing && selectedMethod === "flutterwave" && (
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              )}
            </div>
          </button>

          {/* Paypack Mobile Money Option */}
          <button
            onClick={() => handlePaymentMethodSelect("paypack")}
            disabled={isInitializing}
            className="w-full p-5 border-2 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="p-4 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
                <Smartphone className="h-7 w-7 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900 mb-1">
                  {t("invoices.mobileMoneyPayment")}
                </h3>
                <p className="text-sm text-gray-600">
                  {t("invoices.mobileMoneyDescription")}
                </p>
                <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Recommended for Rwanda
                </span>
              </div>
            </div>
          </button>
        </CardContent>
      </Card>

      {/* Payment Methods Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-blue-900">
              {t("invoices.paymentInformationTitle")}
            </h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="bg-white rounded-lg p-3 border border-blue-100">
              <p className="text-gray-700">
                <strong className="text-blue-800">
                  {t("invoices.cardPayment")}:
                </strong>{" "}
                {t("invoices.cardPaymentInfo")}
              </p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-blue-100">
              <p className="text-gray-700">
                <strong className="text-blue-800">
                  {t("invoices.mobileMoneyPayment")}:
                </strong>{" "}
                {t("invoices.mobileMoneyInfo")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h4 className="font-bold text-green-900 mb-2 text-base">
              {t("invoices.securePaymentTitle")}
            </h4>
            <p className="text-sm text-green-800 leading-relaxed">
              {t("invoices.securePaymentInfo")}
            </p>
          </div>
        </div>
      </div>

      {/* Cancel Button */}
      <div className="flex justify-center pt-2">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isInitializing}
          className="min-w-[200px] hover:bg-gray-100 border-gray-300"
        >
          <X className="h-4 w-4 mr-2" />
          {t("common.cancel")}
        </Button>
      </div>
    </div>
  );
}
