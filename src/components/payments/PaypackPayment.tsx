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
import { useLanguage } from "@/lib/i18n/LanguageContext";
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
  hideSummary?: boolean; // Hide payment summary section
  onSuccess: (paymentData: any) => void;
  onCancel: () => void;
}

export const PaypackPayment: React.FC<PaypackPaymentProps> = ({
  amount,
  invoiceId,
  invoiceNumber,
  cargoNumber,
  customerPhone = "",
  hideSummary = false,
  onSuccess,
  onCancel,
}) => {
  const { t } = useLanguage();
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
        return t("invoices.paymentCompletedSuccess");
      case "failed":
        return error || t("invoices.paymentFailed");
      case "pending":
        if (isPolling) {
          return t("invoices.waitingForApproval");
        }
        return t("invoices.initializingPayment");
      default:
        return t("invoices.enterPhoneToPay");
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
    <Card className="w-full mx-auto border-2 shadow-lg">
      {!hideSummary && (
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b-2">
          <CardTitle className="flex items-center gap-3 text-lg">
            {getStatusIcon()}
            {t("invoices.mobileMoneyPaymentTitle")}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={`space-y-5 ${hideSummary ? "pt-6" : "pt-6"}`}>
        {/* Payment Summary - Compact (hidden if hideSummary is true) */}
        {!hideSummary && (
          <div className="bg-gradient-to-r from-primary/5 to-transparent rounded-xl p-4 border-l-4 border-primary">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">
                {t("invoices.totalAmount")}:
              </span>
              <span className="text-2xl font-bold text-primary">
                RWF {amount.toLocaleString()}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">
                  {t("invoices.cargoNumber")}:
                </span>
                <span className="font-mono ml-1">{cargoNumber}</span>
              </div>
              <div>
                <span className="text-muted-foreground">
                  {t("invoices.invoiceNumber")}:
                </span>
                <span className="font-mono ml-1">{invoiceNumber}</span>
              </div>
            </div>
          </div>
        )}

        {/* Phone Number Input */}
        {status === "idle" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold">
                {t("invoices.mobileMoneyPhoneLabel")}
              </Label>
              <div className="relative">
                <Input
                  id="phone"
                  type="tel"
                  placeholder={t("invoices.phonePlaceholder")}
                  value={phone}
                  onChange={handlePhoneChange}
                  className={`h-12 text-base ${
                    phoneError
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }`}
                />
                <Smartphone className="absolute right-3 top-3.5 h-5 w-5 text-muted-foreground" />
              </div>
              {phoneError && (
                <p className="text-xs text-red-500 flex items-center gap-1 bg-red-50 p-2 rounded">
                  <AlertCircle className="h-3 w-3" />
                  {phoneError}
                </p>
              )}
              {!phoneError &&
                phone &&
                isValidRwandanPhone(formatRwandanPhone(phone)) && (
                  <div className="flex items-center gap-2 text-xs bg-green-50 p-2 rounded">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span className="text-green-700">
                      {displayRwandanPhone(phone)}
                    </span>
                    {getOperatorBadge()}
                  </div>
                )}
            </div>

            {/* Compact Instructions */}
            <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg p-3">
              <h4 className="text-xs font-bold text-blue-900 mb-2 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {t("invoices.howItWorks")}
              </h4>
              <ol className="text-xs text-blue-800 space-y-0.5 list-decimal list-inside leading-relaxed">
                <li>{t("invoices.step1")}</li>
                <li>{t("invoices.step2")}</li>
                <li>{t("invoices.step3")}</li>
                <li>{t("invoices.step4")}</li>
              </ol>
            </div>
          </div>
        )}

        {/* Status Message */}
        {status !== "idle" && (
          <div className="space-y-3">
            <div
              className={`text-center p-5 rounded-xl border-2 ${
                status === "completed"
                  ? "bg-gradient-to-br from-green-50 to-green-100 border-green-300"
                  : status === "failed"
                  ? "bg-gradient-to-br from-red-50 to-red-100 border-red-300"
                  : "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300"
              }`}
            >
              <p
                className={`text-base font-semibold ${
                  status === "completed"
                    ? "text-green-900"
                    : status === "failed"
                    ? "text-red-900"
                    : "text-blue-900"
                }`}
              >
                {getStatusMessage()}
              </p>
              {transactionRef && (
                <p className="text-xs text-muted-foreground mt-2 font-mono bg-white/50 px-2 py-1 rounded inline-block">
                  {t("invoices.referenceLabel")}: {transactionRef}
                </p>
              )}
            </div>

            {/* Polling Progress Indicator */}
            {isPolling && (
              <div className="space-y-3">
                <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-center gap-2 text-sm text-blue-800">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="font-medium">
                      {t("invoices.checkingPaymentStatus")}
                    </span>
                  </div>
                  <p className="text-xs text-center text-blue-700">
                    {t("invoices.dontCloseWindow")}
                  </p>
                </div>

                {/* USSD Instructions based on operator */}
                {phone && isValidRwandanPhone(formatRwandanPhone(phone)) && (
                  <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-amber-900 mb-2">
                          {t("invoices.noPromptInstructions")}
                        </h4>
                        <div className="space-y-2">
                          {getRwandanOperator(formatRwandanPhone(phone)) === "MTN" && (
                            <div className="bg-white rounded-lg p-3 border border-amber-200">
                              <div className="flex items-center gap-2 mb-1">
                                <img
                                  src="/image/momo.png"
                                  alt="MTN Mobile Money"
                                  className="h-5 w-auto object-contain"
                                />
                                <span className="text-xs font-medium text-gray-700">
                                  MTN Mobile Money
                                </span>
                              </div>
                              <p className="text-xs text-gray-800 mb-2">
                                {t("invoices.mtnUssdCode")}
                              </p>
                              <div className="bg-gray-50 p-2 rounded border border-gray-200">
                                <code className="text-sm font-mono font-bold text-gray-900">
                                  *182*7*1#
                                </code>
                              </div>
                            </div>
                          )}
                          {getRwandanOperator(formatRwandanPhone(phone)) === "Airtel" && (
                            <div className="bg-white rounded-lg p-3 border border-amber-200">
                              <div className="flex items-center gap-2 mb-1">
                                <img
                                  src="/image/aiter_mtn_momo.png"
                                  alt="Airtel Money"
                                  className="h-5 w-auto object-contain opacity-90"
                                />
                                <span className="text-xs font-medium text-gray-700">
                                  Airtel Money
                                </span>
                              </div>
                              <p className="text-xs text-gray-800 mb-2">
                                {t("invoices.airtelUssdCode")}
                              </p>
                              <div className="bg-gray-50 p-2 rounded border border-gray-200">
                                <code className="text-sm font-mono font-bold text-gray-900">
                                  *185*1#
                                </code>
                              </div>
                            </div>
                          )}
                          {/* Fallback for unknown operator - show both options */}
                          {getRwandanOperator(formatRwandanPhone(phone)) !== "MTN" && 
                           getRwandanOperator(formatRwandanPhone(phone)) !== "Airtel" && (
                            <div className="space-y-2">
                              <div className="bg-white rounded-lg p-3 border border-amber-200">
                                <div className="flex items-center gap-2 mb-1">
                                  <img
                                    src="/image/momo.png"
                                    alt="MTN Mobile Money"
                                    className="h-5 w-auto object-contain"
                                  />
                                  <span className="text-xs font-medium text-gray-700">
                                    MTN Mobile Money
                                  </span>
                                </div>
                                <p className="text-xs text-gray-800 mb-2">
                                  {t("invoices.mtnUssdCode")}
                                </p>
                                <div className="bg-gray-50 p-2 rounded border border-gray-200">
                                  <code className="text-sm font-mono font-bold text-gray-900">
                                    *182*7*1#
                                  </code>
                                </div>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-amber-200">
                                <div className="flex items-center gap-2 mb-1">
                                  <img
                                    src="/image/aiter_mtn_momo.png"
                                    alt="Airtel Money"
                                    className="h-5 w-auto object-contain opacity-90"
                                  />
                                  <span className="text-xs font-medium text-gray-700">
                                    Airtel Money
                                  </span>
                                </div>
                                <p className="text-xs text-gray-800 mb-2">
                                  {t("invoices.airtelUssdCode")}
                                </p>
                                <div className="bg-gray-50 p-2 rounded border border-gray-200">
                                  <code className="text-sm font-mono font-bold text-gray-900">
                                    *185*1#
                                  </code>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-amber-800 mt-2">
                          {t("invoices.followInstructions")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={status === "failed" ? reset : onCancel}
            className="flex-1 h-11 border-2"
            disabled={isPolling}
          >
            {status === "failed" ? t("invoices.tryAgain") : t("common.cancel")}
          </Button>

          {status === "idle" && (
            <Button
              onClick={handleInitiatePayment}
              disabled={!phone}
              className="flex-1 h-11 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold shadow-lg"
            >
              <Smartphone className="mr-2 h-4 w-4" />
              {t("invoices.sendPaymentRequest")}
            </Button>
          )}

          {status === "completed" && (
            <Button
              onClick={() =>
                onSuccess({ transaction_reference: transactionRef })
              }
              className="flex-1 h-11 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {t("invoices.done")}
            </Button>
          )}
        </div>

        {/* Payment Provider Info */}
        <div className="text-xs text-center text-muted-foreground pt-3 border-t flex items-center justify-center gap-1.5">
          <span>{t("invoices.poweredByPaypack")}</span>
          <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground"></span>
          <span>{t("invoices.secureMobilePayment")}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaypackPayment;
