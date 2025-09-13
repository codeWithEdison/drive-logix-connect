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
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useInitializeFlutterwavePayment } from "@/lib/api/hooks/paymentHooks";
import type { InitializeFlutterwavePaymentRequest } from "@/lib/api/hooks/paymentHooks";

export interface PaymentFlowData {
  id: string;
  invoice_number: string;
  cargo_id: string;
  total_amount: number;
  currency: string;
  status: string;
  cargo?: {
    id: string;
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

export function PaymentFlow({
  invoice,
  onSuccess,
  onCancel,
}: PaymentFlowProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isInitializing, setIsInitializing] = useState(false);

  const initializePaymentMutation = useInitializeFlutterwavePayment();

  const handleInitializePayment = async () => {
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

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("rw-RW", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCargoNumber = (cargoId: string) => {
    return cargoId.startsWith("#") ? cargoId : `#${cargoId}`;
  };

  const getInvoiceNumber = (invoiceNumber: string) => {
    return invoiceNumber.startsWith("LI")
      ? invoiceNumber
      : `LI${invoiceNumber}`;
  };

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
              <p className="font-semibold">
                {getCargoNumber(invoice.cargo_id)}
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

      {/* Payment Methods Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold">
              {t("invoices.acceptedPaymentMethods")}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{t("invoices.paymentMethods.card")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>{t("invoices.paymentMethods.mobileMoney")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>{t("invoices.paymentMethods.ussd")}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
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

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={isInitializing}
        >
          {t("common.cancel")}
        </Button>
        <Button
          onClick={handleInitializePayment}
          disabled={isInitializing}
          className="flex-1 bg-gradient-primary hover:bg-primary-hover"
        >
          {isInitializing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("invoices.initializingPayment")}
            </>
          ) : (
            <>
              <DollarSign className="h-4 w-4 mr-2" />
              {t("invoices.payNow")}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
