import React from "react";
import { PaymentCallback } from "@/components/payments/PaymentCallback";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const PaymentCallbackPage = () => {
  const { t } = useLanguage();

  const handlePaymentSuccess = (paymentData: any) => {
    console.log("Payment successful:", paymentData);
    // Additional success handling can be added here
  };

  const handlePaymentError = (error: any) => {
    console.error("Payment error:", error);
    // Additional error handling can be added here
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("invoices.paymentTitle")}
          </h1>
          <p className="text-gray-600 mt-2">
            {t("invoices.paymentCallbackMessage")}
          </p>
        </div>

        <PaymentCallback
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      </div>
    </div>
  );
};

export default PaymentCallbackPage;
