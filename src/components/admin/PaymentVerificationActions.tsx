import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useApprovePaymentVerification,
  useRejectPaymentVerification,
  useRequestMoreInfoPaymentVerification,
} from "@/lib/api/hooks/paymentVerificationHooks";
import { toast } from "sonner";

interface Props {
  verificationId: string;
  onAction?: (status: string) => void;
}

export default function PaymentVerificationActions({
  verificationId,
  onAction,
}: Props) {
  const approveMutation = useApprovePaymentVerification();
  const rejectMutation = useRejectPaymentVerification();
  const moreInfoMutation = useRequestMoreInfoPaymentVerification();
  const [notes, setNotes] = React.useState("");

  const disabled =
    approveMutation.isPending ||
    rejectMutation.isPending ||
    moreInfoMutation.isPending;

  const handleApprove = async () => {
    try {
      const res = await approveMutation.mutateAsync({
        verificationId,
        data: notes ? { notes } : undefined,
      });
      toast.success("Verification approved");
      onAction?.(res.data?.status || "approved");
    } catch (e: any) {
      toast.error(e?.message || "Failed to approve");
    }
  };

  const handleReject = async () => {
    if (!notes) {
      toast.error("Please provide notes for rejection");
      return;
    }
    try {
      const res = await rejectMutation.mutateAsync({
        verificationId,
        data: { notes },
      });
      toast.success("Verification rejected");
      onAction?.(res.data?.status || "rejected");
    } catch (e: any) {
      toast.error(e?.message || "Failed to reject");
    }
  };

  const handleMoreInfo = async () => {
    if (!notes) {
      toast.error("Please provide notes for requesting more info");
      return;
    }
    try {
      const res = await moreInfoMutation.mutateAsync({
        verificationId,
        data: { notes },
      });
      toast.success("Requested more information");
      onAction?.(res.data?.status || "more_info");
    } catch (e: any) {
      toast.error(e?.message || "Failed to request more info");
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input
          id="notes"
          placeholder="Add notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={handleApprove} disabled={disabled}>
          Approve
        </Button>
        <Button
          variant="destructive"
          onClick={handleReject}
          disabled={disabled}
        >
          Reject
        </Button>
        <Button variant="outline" onClick={handleMoreInfo} disabled={disabled}>
          Request More Info
        </Button>
      </div>
    </div>
  );
}

