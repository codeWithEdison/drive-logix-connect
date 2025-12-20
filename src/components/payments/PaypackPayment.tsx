import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Smartphone,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { usePaypackPayment } from "@/hooks/usePaypackPayment";
import {
  formatRwandanPhone,
  isValidRwandanPhone,
  getPhoneValidationError,
  displayRwandanPhone,
  getRwandanOperator,
} from "@/utils/phoneUtils";

interface PaypackPaymentProps {
  amount: number;
  invoiceId: string;
  invoiceNumber: string;
  cargoNumber: string;
  customerPhone?: string; // Optional pre-filled phone
  onSuccess: (paymentData: any) => void;
  onCancel: () => void;
}

export const PaypackPayment: React.FC<PaypackPaymentProps> = ({
  amount,
  invoiceId,
  invoiceNumber,
  cargoNumber,
  customerPhone = "",
  onSuccess,
  onCancel,
}) => {
  const [phone, setPhone] = useState(customerPhone);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const { status, transactionRef, error, isPolling, initialize, reset } =
    usePaypackPayment();

  // Auto-format phone as user types
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(value);

    // Clear error when user starts typing
    if (phoneError) {
      setPhoneError(null);
    }
  };

  // Validate and initiate payment
  const handleInitiatePayment = async () => {
    // Validate phone number
    const formattedPhone = formatRwandanPhone(phone);
    const validationError = getPhoneValidationError(formattedPhone);

    if (validationError) {
      setPhoneError(validationError);
      return;
    }

    // Initialize payment
    await initialize(invoiceId, amount, formattedPhone);
  };

  // Call onSuccess when payment is completed
  useEffect(() => {
    if (status === "completed" && transactionRef) {
      onSuccess({
        transaction_reference: transactionRef,
        status: "completed",
        amount,
        payment_method: "mobile_money",
        provider: "paypack",
      });
    }
  }, [status, transactionRef, amount, onSuccess]);

  const getStatusIcon = () => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case "failed":
        return <XCircle className="h-6 w-6 text-red-500" />;
      case "pending":
        return <Loader2 className="h-6 w-6 animate-spin text-blue-500" />;
      default:
        return <Smartphone className="h-6 w-6 text-primary" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case "completed":
        return "Payment completed successfully!";
      case "failed":
        return error || "Payment failed. Please try again.";
      case "pending":
        if (isPolling) {
          return "Waiting for payment approval on your phone...";
        }
        return "Initializing payment...";
      default:
        return "Enter your phone number to pay with mobile money";
    }
  };

  const getOperatorBadge = () => {
    if (!phone) return null;

    const formattedPhone = formatRwandanPhone(phone);
    if (!isValidRwandanPhone(formattedPhone)) return null;

    const operator = getRwandanOperator(formattedPhone);

    if (operator === "MTN") {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          MTN Mobile Money
        </span>
      );
    } else if (operator === "Airtel") {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Airtel Money
        </span>
      );
    }

    return null;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Mobile Money Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Summary */}
        <div className="space-y-3 pb-4 border-b">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-semibold text-lg">
              RWF {amount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cargo Number:</span>
            <span className="font-medium">{cargoNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Invoice Number:</span>
            <span className="font-medium">{invoiceNumber}</span>
          </div>
        </div>

        {/* Phone Number Input */}
        {status === "idle" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Money Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+250788123456"
                value={phone}
                onChange={handlePhoneChange}
                className={phoneError ? "border-red-500" : ""}
              />
              {phoneError && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {phoneError}
                </p>
              )}
              {!phoneError &&
                phone &&
                isValidRwandanPhone(formatRwandanPhone(phone)) && (
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-green-600">
                      ✓ {displayRwandanPhone(phone)}
                    </p>
                    {getOperatorBadge()}
                  </div>
                )}
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                How it works
              </h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Enter your MTN or Airtel phone number</li>
                <li>Click "Send Payment Request"</li>
                <li>Check your phone for a payment prompt</li>
                <li>Enter your PIN to approve the payment</li>
                <li>Wait for confirmation</li>
              </ol>
            </div>
          </div>
        )}

        {/* Status Message */}
        {status !== "idle" && (
          <div className="space-y-4">
            <div
              className={`text-center p-4 rounded-lg ${
                status === "completed"
                  ? "bg-green-50 border border-green-200"
                  : status === "failed"
                  ? "bg-red-50 border border-red-200"
                  : "bg-blue-50 border border-blue-200"
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  status === "completed"
                    ? "text-green-800"
                    : status === "failed"
                    ? "text-red-800"
                    : "text-blue-800"
                }`}
              >
                {getStatusMessage()}
              </p>
              {transactionRef && (
                <p className="text-xs text-muted-foreground mt-2">
                  Reference: {transactionRef}
                </p>
              )}
            </div>

            {/* Polling Progress Indicator */}
            {isPolling && (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Checking payment status...</span>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  This may take up to 5 minutes. Please don't close this window.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Transaction Reference (when available) */}
        {transactionRef && status !== "completed" && (
          <div className="text-xs text-center text-muted-foreground">
            Transaction Reference: {transactionRef}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={status === "failed" ? reset : onCancel}
            className="flex-1"
            disabled={isPolling}
          >
            {status === "failed" ? "Try Again" : "Cancel"}
          </Button>

          {status === "idle" && (
            <Button
              onClick={handleInitiatePayment}
              disabled={!phone}
              className="flex-1 bg-gradient-primary hover:bg-primary-hover"
            >
              <Smartphone className="mr-2 h-4 w-4" />
              Send Payment Request
            </Button>
          )}

          {status === "completed" && (
            <Button
              onClick={() =>
                onSuccess({ transaction_reference: transactionRef })
              }
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Done
            </Button>
          )}
        </div>

        {/* Payment Provider Info */}
        <div className="text-xs text-center text-muted-foreground pt-4 border-t">
          <p className="flex items-center justify-center gap-1">
            Powered by Paypack
            <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground"></span>
            Secure Mobile Money Payment
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaypackPayment;
