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
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-4">
                <CheckCircle className="h-20 w-20 text-green-600" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-green-800 mb-3">
                {t("invoices.paymentSuccessTitle")}
              </h3>
              <p className="text-gray-600 text-base">
                {t("invoices.paymentSuccessMessage")}
              </p>
            </div>
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 shadow-sm">
              <div className="space-y-3 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-green-700">
                    {t("invoices.invoiceNumber")}:
                  </span>
                  <span className="font-bold text-green-900 font-mono">
                    {invoice.invoice_number}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-green-200">
                  <span className="text-sm font-medium text-green-700">
                    {t("invoices.amountPaid")}:
                  </span>
                  <span className="text-xl font-bold text-green-900">
                    RWF {invoice.total_amount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              {t("invoices.paymentSuccessMessage")}
            </p>
          </div>
        ) : (
          /* Payment Flow */
          <div>
            {/* Progress Indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-center space-x-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    {t("invoices.selectPaymentMethod")}
                  </span>
                </div>
                <div className="w-12 h-0.5 bg-gray-300"></div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-500">
                    {t("invoices.processingPayment")}
                  </span>
                </div>
              </div>
            </div>

            <PaymentFlow
              invoice={invoice}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          </div>
        )}
      </div>
    </ModernModel>
  );
}
