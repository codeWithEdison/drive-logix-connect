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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            {t("invoices.paymentSummary")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("invoices.invoiceNumber")}
              </p>
              <p className="font-semibold">
                {getInvoiceNumber(invoice.invoice_number)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("invoices.cargoNumber")}
              </p>
              <p className="font-semibold font-mono">
                {getCargoNumber(invoice.cargo_id, invoice.cargo?.cargo_number)}
              </p>
            </div>
          </div>

          {invoice.cargo && (
            <div>
              <p className="text-sm text-muted-foreground">
                {t("invoices.cargoType")}
              </p>
              <p className="font-semibold">{invoice.cargo.type}</p>
            </div>
          )}

          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">
                {t("invoices.totalAmount")}
              </span>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(invoice.total_amount, invoice.currency)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Flutterwave Option */}
          <button
            onClick={() => handlePaymentMethodSelect("flutterwave")}
            disabled={isInitializing}
            className="w-full p-4 border-2 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base">Card Payment</h3>
                <p className="text-sm text-muted-foreground">
                  Pay with Visa, Mastercard, or other cards
                </p>
              </div>
              {isInitializing && selectedMethod === "flutterwave" && (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              )}
            </div>
          </button>

          {/* Paypack Mobile Money Option */}
          <button
            onClick={() => handlePaymentMethodSelect("paypack")}
            disabled={isInitializing}
            className="w-full p-4 border-2 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Smartphone className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base">Mobile Money</h3>
                <p className="text-sm text-muted-foreground">
                  Pay with MTN Mobile Money or Airtel Money
                </p>
              </div>
            </div>
          </button>
        </CardContent>
      </Card>

      {/* Payment Methods Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold">Payment Information</h3>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Card Payment:</strong> Supports Visa, Mastercard, and
              other international cards. You'll be redirected to a secure
              payment page.
            </p>
            <p>
              <strong>Mobile Money:</strong> Pay directly from your MTN or
              Airtel mobile money account. You'll receive a prompt on your phone
              to approve the payment.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">
              {t("invoices.securePayment")}
            </h4>
            <p className="text-sm text-blue-800">
              {t("invoices.securePaymentDescription")}
            </p>
          </div>
        </div>
      </div>

      {/* Cancel Button */}
      <div className="flex justify-center pt-4">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isInitializing}
          className="min-w-[200px]"
        >
          {t("common.cancel")}
        </Button>
      </div>
    </div>
  );
}
