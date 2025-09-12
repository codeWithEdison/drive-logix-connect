import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useProcessPayment } from "@/lib/api/hooks/paymentHooks";

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    "loading"
  );
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const processPaymentMutation = useProcessPayment();

  const txRef = searchParams.get("tx_ref");
  const invoiceId = searchParams.get("invoice_id");
  const cargoNumber = localStorage.getItem("cargo_number");
  const invoiceNumber = localStorage.getItem("invoice_number");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!txRef || !invoiceId) {
        setStatus("failed");
        setError("No transaction reference or invoice ID found");
        toast.error("Invalid payment callback");
        return;
      }

      try {
        // For now, we'll simulate verification since we're using the generic endpoint
        // In a real scenario, you might want to add a verification endpoint or 
        // check payment status from your backend
        const statusParam = searchParams.get("status");
        
        if (statusParam === "successful") {
          setStatus("success");
          setPaymentData({
            amount: parseFloat(localStorage.getItem("payment_amount") || "0"),
            transaction_reference: txRef,
          });
          toast.success("Payment completed successfully!");
          
          // Clean up localStorage
          localStorage.removeItem("tx_ref");
          localStorage.removeItem("invoice_id");
          localStorage.removeItem("cargo_number");
          localStorage.removeItem("invoice_number");
          localStorage.removeItem("payment_amount");
        } else {
          setStatus("failed");
          setError("Payment failed or was cancelled");
          toast.error("Payment failed");
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        setStatus("failed");
        setError("Failed to verify payment");
        toast.error("Failed to verify payment");
      }
    };

    verifyPayment();
  }, [txRef, invoiceId, searchParams]);

  const getStatusIcon = () => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case "failed":
        return <XCircle className="h-16 w-16 text-red-500" />;
      default:
        return <Loader2 className="h-16 w-16 animate-spin text-blue-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case "success":
        return "Payment completed successfully!";
      case "failed":
        return "Payment failed or was cancelled";
      default:
        return "Verifying payment...";
    }
  };

  const getStatusDescription = () => {
    switch (status) {
      case "success":
        return "Your cargo has been booked and payment confirmed. You will receive a confirmation email shortly.";
      case "failed":
        return "There was an issue with your payment. Please try again or contact support.";
      default:
        return "Please wait while we verify your payment...";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Payment Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            {getStatusIcon()}
            <h2 className="mt-4 text-xl font-semibold">{getStatusMessage()}</h2>
            <p className="mt-2 text-muted-foreground">
              {getStatusDescription()}
            </p>
          </div>

          {cargoNumber && invoiceNumber && (
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Cargo Number:
                </span>
                <span className="font-mono font-medium">{cargoNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Invoice Number:
                </span>
                <span className="font-mono font-medium">{invoiceNumber}</span>
              </div>
              {txRef && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Transaction Reference:
                  </span>
                  <span className="font-mono text-xs">{txRef}</span>
                </div>
              )}
              {paymentData && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Amount Paid:
                  </span>
                  <span className="font-semibold">
                    RWF {paymentData.amount?.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="flex-1"
            >
              Go to Dashboard
            </Button>
            {status === "success" && cargoNumber && (
              <Button
                onClick={() => navigate(`/tracking/${cargoNumber}`)}
                className="flex-1"
              >
                Track Cargo
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCallback;
