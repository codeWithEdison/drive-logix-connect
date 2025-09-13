import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axiosInstance from "@/lib/api/axios";

interface PaymentCallbackProps {
  onSuccess?: (paymentData: any) => void;
  onError?: (error: any) => void;
}

export function PaymentCallback({ onSuccess, onError }: PaymentCallbackProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "verifying"
  >("loading");
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState<string>("");

  // API call for payment verification (with authentication)
  const verifyPayment = async (txRef: string) => {
    try {
      const response = await axiosInstance.get(
        `/payments/flutterwave/verify?tx_ref=${txRef}`
      );

      return response.data;
    } catch (error) {
      console.error("Payment verification error:", error);
      throw error;
    }
  };

  useEffect(() => {
    const handlePaymentCallback = async () => {
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const txRef = urlParams.get("tx_ref");
        const status = urlParams.get("status");
        const transactionId = urlParams.get("transaction_id");

        console.log("Payment callback received:", {
          txRef,
          status,
          transactionId,
        });

        if (!txRef) {
          throw new Error("Transaction reference not found");
        }

        if (status === "successful" || status === "success") {
          setStatus("verifying");

          // Verify payment with backend using public API
          const verifyResult = await verifyPayment(txRef);

          if (
            verifyResult.success &&
            verifyResult.data.status === "successful"
          ) {
            setStatus("success");
            setPaymentData(verifyResult.data);

            toast.success(t("invoices.paymentSuccess"));

            if (onSuccess) {
              onSuccess(verifyResult.data);
            }
          } else {
            throw new Error(
              verifyResult.message || "Payment verification failed"
            );
          }
        } else {
          throw new Error("Payment was not successful");
        }
      } catch (error: any) {
        console.error("Payment callback error:", error);
        setStatus("error");
        setError(error.message || "Payment failed");

        toast.error(error.message || "Payment failed. Please try again.");

        if (onError) {
          onError(error);
        }
      }
    };

    handlePaymentCallback();
  }, [onSuccess, onError, t]);

  const handleContinue = () => {
    // Clear URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);

    // Navigate to invoices page or dashboard
    navigate("/invoices");
  };

  const handleRetry = () => {
    // Navigate back to invoices page to retry payment
    navigate("/invoices");
  };

  if (status === "loading" || status === "verifying") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            {status === "verifying"
              ? t("invoices.verifyingPayment")
              : t("invoices.processingPayment")}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            {status === "verifying"
              ? t("invoices.verifyingPaymentMessage")
              : t("invoices.processingPaymentMessage")}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (status === "success") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-6 w-6" />
            {t("invoices.paymentSuccessTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              {t("invoices.paymentSuccessMessage")}
            </p>

            {paymentData && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-700">Amount:</span>
                  <span className="font-semibold text-green-800">
                    RWF {paymentData.amount?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-700">Method:</span>
                  <span className="font-semibold text-green-800 capitalize">
                    {paymentData.payment_method}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-700">Reference:</span>
                  <span className="font-semibold text-green-800">
                    {paymentData.transaction_reference}
                  </span>
                </div>
              </div>
            )}
          </div>

          <Button onClick={handleContinue} className="w-full">
            {t("invoices.continueToInvoices")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (status === "error") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="h-6 w-6" />
            {t("invoices.paymentFailedTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              {error || t("invoices.paymentFailedMessage")}
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">
                  {t("invoices.paymentFailedHelp")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleRetry} className="flex-1">
              {t("invoices.retryPayment")}
            </Button>
            <Button onClick={handleContinue} className="flex-1">
              {t("invoices.continueToInvoices")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
