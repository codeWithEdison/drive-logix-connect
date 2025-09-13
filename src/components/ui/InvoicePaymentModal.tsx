import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ModernModel from "@/components/modal/ModernModel";
import { PaymentFlow } from "@/components/payments/PaymentFlow";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { toast } from "sonner";

export interface InvoicePaymentData {
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

interface InvoicePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoicePaymentData | null;
  onPaymentSuccess?: (paymentData: any) => void;
}

export function InvoicePaymentModal({
  isOpen,
  onClose,
  invoice,
  onPaymentSuccess,
}: InvoicePaymentModalProps) {
  const { t } = useLanguage();
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  if (!invoice) return null;

  const handlePaymentSuccess = (paymentData: any) => {
    setPaymentCompleted(true);
    toast.success(t("invoices.paymentSuccess"));

    // Call the parent success handler
    if (onPaymentSuccess) {
      onPaymentSuccess(paymentData);
    }

    // Close modal after a short delay
    setTimeout(() => {
      onClose();
      setPaymentCompleted(false);
    }, 2000);
  };

  const handlePaymentCancel = () => {
    onClose();
    toast.info(t("invoices.paymentCancelled"));
  };

  return (
    <ModernModel
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setPaymentCompleted(false);
      }}
      title={t("invoices.paymentTitle")}
    >
      <div className="space-y-6">
        {paymentCompleted ? (
          /* Payment Success State */
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-green-800 mb-2">
                {t("invoices.paymentSuccessTitle")}
              </h3>
              <p className="text-muted-foreground">
                {t("invoices.paymentSuccessMessage")}
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm text-green-800">
                <p className="font-semibold">
                  {t("invoices.invoiceNumber")}: {invoice.invoice_number}
                </p>
                <p className="font-semibold">
                  {t("invoices.amountPaid")}: RWF{" "}
                  {invoice.total_amount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Payment Flow */
          <PaymentFlow
            invoice={invoice}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        )}
      </div>
    </ModernModel>
  );
}
