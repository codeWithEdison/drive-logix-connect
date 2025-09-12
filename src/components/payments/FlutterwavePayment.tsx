import React, { useState, useEffect } from "react";
import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CreditCard, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useProcessPayment } from "@/lib/api/hooks/paymentHooks";

interface FlutterwavePaymentProps {
  amount: number;
  email: string;
  phone: string;
  name: string;
  invoiceId: string; // Invoice ID from backend
  invoiceNumber: string; // Invoice number (LI prefix)
  cargoNumber: string; // Cargo number (LC prefix)
  onSuccess: (paymentData: any) => void;
  onCancel: () => void;
}

export const FlutterwavePayment: React.FC<FlutterwavePaymentProps> = ({
  amount,
  email,
  phone,
  name,
  invoiceId,
  invoiceNumber,
  cargoNumber,
  onSuccess,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "failed"
  >("idle");
  const [txRef, setTxRef] = useState<string>("");
  const [paymentConfig, setPaymentConfig] = useState<any>(null);

  const processPaymentMutation = useProcessPayment();

  // Initialize Flutterwave hook with config
  const handleFlutterPayment = useFlutterwave(paymentConfig);

  const handlePayment = async () => {
    setIsLoading(true);
    setPaymentStatus("processing");

    // Check if API key is available
    const publicKey = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY;
    if (!publicKey) {
      console.error("Flutterwave public key not found");
      setIsLoading(false);
      setPaymentStatus("failed");
      toast.error("Payment configuration error. Please contact support.");
      return;
    }

    try {
      // Generate transaction reference manually
      const generatedTxRef = `CARGO_${invoiceId}_${Date.now()}`;
      setTxRef(generatedTxRef);
      
      // Store transaction reference for verification
      localStorage.setItem("tx_ref", generatedTxRef);
      localStorage.setItem("invoice_id", invoiceId);
      localStorage.setItem("cargo_number", cargoNumber);
      localStorage.setItem("invoice_number", invoiceNumber);
      localStorage.setItem("payment_amount", amount.toString());

      // Configure Flutterwave directly
      const config = {
        public_key: publicKey,
        tx_ref: generatedTxRef,
        amount: amount,
        currency: "RWF",
        payment_options: "card,mobilemoney,ussd",
        customer: {
          email: email,
          phone_number: phone,
          name: name,
        },
        customizations: {
          title: "Loveway Logistics",
          description: `Payment for Invoice ${invoiceNumber}`,
          logo: "https://your-logo-url.com/logo.png",
        },
        redirect_url: `${window.location.origin}/payment/callback?tx_ref=${generatedTxRef}&invoice_id=${invoiceId}`,
        meta: {
          consumer_id: invoiceId,
          consumer_mac: "92a3b912c9d1",
          cargo_number: cargoNumber,
          invoice_number: invoiceNumber,
        },
      };

      console.log("Flutterwave config:", config);
      setPaymentConfig(config);
    } catch (error) {
      console.error("Payment configuration error:", error);
      setIsLoading(false);
      setPaymentStatus("failed");
      toast.error("Failed to configure payment. Please try again.");
    }
  };

  // Trigger payment when config is ready
  useEffect(() => {
    if (paymentConfig && handleFlutterPayment) {
      try {
        handleFlutterPayment({
          callback: async (response: any) => {
            console.log("Payment response:", response);
            setIsLoading(false);

            if (response.status === "successful") {
              try {
                // Process payment with backend using generic endpoint
                const paymentResult = await processPaymentMutation.mutateAsync({
                  invoice_id: invoiceId,
                  amount: amount,
                  payment_method: "online",
                  transaction_id: response.transaction_id || response.tx_ref,
                });

                if (paymentResult.success) {
                  setPaymentStatus("success");
                  toast.success("Payment completed successfully!");
                  onSuccess(response);
                } else {
                  setPaymentStatus("failed");
                  toast.error("Payment processing failed. Please contact support.");
                }
              } catch (error) {
                console.error("Payment processing error:", error);
                setPaymentStatus("failed");
                toast.error("Payment processing failed. Please contact support.");
              }
            } else {
              setPaymentStatus("failed");
              toast.error("Payment failed. Please try again.");
            }
          },
          onClose: () => {
            setIsLoading(false);
            setPaymentStatus("idle");
            toast.info("Payment cancelled");
          },
        });
      } catch (error) {
        console.error("Flutterwave payment initialization error:", error);
        setIsLoading(false);
        setPaymentStatus("failed");
        toast.error("Failed to initialize payment. Please try again.");
      }
    }
  }, [
    paymentConfig,
    handleFlutterPayment,
    onSuccess,
    invoiceId,
    amount,
    processPaymentMutation,
  ]);

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case "success":
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case "failed":
        return <XCircle className="h-6 w-6 text-red-500" />;
      case "processing":
        return <Loader2 className="h-6 w-6 animate-spin text-blue-500" />;
      default:
        return <CreditCard className="h-6 w-6 text-primary" />;
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case "success":
        return "Payment completed successfully!";
      case "failed":
        return "Payment failed. Please try again.";
      case "processing":
        return "Processing payment...";
      default:
        return "Ready to process payment";
    }
  };

  // Debug: Check if API key is available
  const publicKey = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY;

  if (!publicKey) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="h-6 w-6" />
            Payment Configuration Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-900 mb-2">Missing API Key</h3>
            <p className="text-sm text-red-700">
              Flutterwave public key is not configured. Please add
              VITE_FLUTTERWAVE_PUBLIC_KEY to your .env file.
            </p>
          </div>
          <Button variant="outline" onClick={onCancel} className="w-full">
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Payment Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Summary */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-semibold">RWF {amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cargo Number:</span>
            <span className="font-medium">{cargoNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Invoice Number:</span>
            <span className="font-medium">{invoiceNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Customer:</span>
            <span className="font-medium">{name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email:</span>
            <span className="font-medium">{email}</span>
          </div>
        </div>

        {/* Status Message */}
        <div className="text-center">
          <p
            className={`text-sm ${
              paymentStatus === "success"
                ? "text-green-600"
                : paymentStatus === "failed"
                ? "text-red-600"
                : paymentStatus === "processing"
                ? "text-blue-600"
                : "text-muted-foreground"
            }`}
          >
            {getStatusMessage()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            disabled={isLoading || paymentStatus === "success"}
            className="flex-1 bg-gradient-primary hover:bg-primary-hover"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Pay Now
              </>
            )}
          </Button>
        </div>

        {/* Payment Methods Info */}
        <div className="text-xs text-muted-foreground text-center">
          <p>Supported payment methods:</p>
          <p>Card, Mobile Money, USSD</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlutterwavePayment;
