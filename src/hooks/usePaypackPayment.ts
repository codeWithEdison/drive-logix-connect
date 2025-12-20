import { useState, useCallback, useRef } from "react";
import {
  useInitializePaypackPayment,
  usePaypackPaymentStatus,
  InitializePaypackPaymentRequest,
} from "@/lib/api/hooks/paymentHooks";
import { toast } from "sonner";

export type PaymentStatus = "idle" | "pending" | "completed" | "failed";

interface UsePaypackPaymentReturn {
  status: PaymentStatus;
  transactionRef: string | null;
  error: string | null;
  isPolling: boolean;
  initialize: (
    invoiceId: string,
    amount: number,
    phone: string
  ) => Promise<void>;
  reset: () => void;
}

/**
 * Custom hook for managing Paypack mobile money payments
 * Handles payment initialization and automatic status polling
 *
 * Usage:
 * ```tsx
 * const { status, error, initialize } = usePaypackPayment();
 *
 * const handlePay = async () => {
 *   await initialize(invoiceId, amount, phone);
 * };
 * ```
 */
export function usePaypackPayment(): UsePaypackPaymentReturn {
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [transactionRef, setTransactionRef] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  // Track polling attempts to prevent infinite loops
  const pollingAttemptsRef = useRef(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Mutations
  const initializePaymentMutation = useInitializePaypackPayment();
  const checkStatusMutation = usePaypackPaymentStatus();

  // Max polling attempts (60 attempts * 5 seconds = 5 minutes)
  const MAX_POLLING_ATTEMPTS = 60;
  const POLLING_INTERVAL = 5000; // 5 seconds

  /**
   * Stop polling and cleanup
   */
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearTimeout(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsPolling(false);
    pollingAttemptsRef.current = 0;
  }, []);

  /**
   * Check payment status once
   */
  const checkStatus = useCallback(
    async (
      ref: string
    ): Promise<"pending" | "completed" | "failed" | "timeout"> => {
      try {
        const result = await checkStatusMutation.mutateAsync(ref);

        if (result.success) {
          return result.data.status;
        } else {
          console.error("Status check failed:", result.message);
          return "pending";
        }
      } catch (err: any) {
        console.error("Error checking payment status:", err);
        // Continue polling on network errors
        return "pending";
      }
    },
    [checkStatusMutation]
  );

  /**
   * Start polling for payment status
   */
  const startPolling = useCallback(
    (ref: string) => {
      setIsPolling(true);
      pollingAttemptsRef.current = 0;

      const poll = async () => {
        pollingAttemptsRef.current++;

        // Check if max attempts reached
        if (pollingAttemptsRef.current > MAX_POLLING_ATTEMPTS) {
          stopPolling();
          setStatus("failed");
          setError(
            "Payment verification timeout. Please contact support if money was deducted."
          );
          toast.error("Payment verification timeout");
          return;
        }

        const paymentStatus = await checkStatus(ref);

        if (paymentStatus === "completed") {
          stopPolling();
          setStatus("completed");
          toast.success("Payment completed successfully!");
        } else if (paymentStatus === "failed") {
          stopPolling();
          setStatus("failed");
          setError("Payment failed. Please try again.");
          toast.error("Payment failed");
        } else {
          // Continue polling
          pollingIntervalRef.current = setTimeout(poll, POLLING_INTERVAL);
        }
      };

      // Start first poll after 5 seconds
      pollingIntervalRef.current = setTimeout(poll, POLLING_INTERVAL);
    },
    [checkStatus, stopPolling]
  );

  /**
   * Initialize payment with Paypack
   */
  const initialize = useCallback(
    async (invoiceId: string, amount: number, phone: string) => {
      // Reset state
      setStatus("pending");
      setError(null);
      setTransactionRef(null);
      stopPolling();

      try {
        const result = await initializePaymentMutation.mutateAsync({
          invoice_id: invoiceId,
          amount,
          customer_phone: phone,
        });

        if (result.success) {
          const ref = result.data.transaction_reference;
          setTransactionRef(ref);

          // Show info toast
          toast.info(
            "Payment request sent! Please check your phone to approve the payment.",
            { duration: 8000 }
          );

          // Start polling for status
          startPolling(ref);
        } else {
          setStatus("failed");
          setError(result.message || "Failed to initialize payment");
          toast.error(result.message || "Failed to initialize payment");
        }
      } catch (err: any) {
        console.error("Payment initialization error:", err);
        setStatus("failed");

        // Extract error message
        const errorMessage =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to initialize payment";

        setError(errorMessage);
        toast.error(errorMessage);
      }
    },
    [initializePaymentMutation, startPolling, stopPolling]
  );

  /**
   * Reset payment state
   */
  const reset = useCallback(() => {
    stopPolling();
    setStatus("idle");
    setTransactionRef(null);
    setError(null);
  }, [stopPolling]);

  return {
    status,
    transactionRef,
    error,
    isPolling,
    initialize,
    reset,
  };
}
