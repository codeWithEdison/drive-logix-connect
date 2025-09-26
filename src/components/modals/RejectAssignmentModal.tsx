import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ModernModel from "@/components/modal/ModernModel";
import { X, AlertTriangle } from "lucide-react";

interface RejectAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
}

export function RejectAssignmentModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: RejectAssignmentModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }

    if (reason.trim().length < 10) {
      setError("Reason must be at least 10 characters long");
      return;
    }

    onConfirm(reason.trim());
  };

  const handleClose = () => {
    setReason("");
    setError("");
    onClose();
  };

  return (
    <ModernModel
      isOpen={isOpen}
      onClose={handleClose}
      title="Reject Assignment"
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Warning Icon */}
        <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">
              Reject Assignment
            </p>
            <p className="text-xs text-red-600">
              This action cannot be undone. Please provide a reason for
              rejection.
            </p>
          </div>
        </div>

        {/* Reason Input */}
        <div className="space-y-2">
          <Label htmlFor="rejection-reason" className="text-sm font-medium">
            Reason for Rejection <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="rejection-reason"
            placeholder="Please explain why you are rejecting this assignment..."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError("");
            }}
            className="min-h-[100px] resize-none"
            disabled={isLoading}
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <p className="text-xs text-gray-500">
            Minimum 10 characters required ({reason.length}/10)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1"
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            variant="destructive"
            className="flex-1"
            disabled={isLoading || !reason.trim() || reason.trim().length < 10}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Rejecting...
              </>
            ) : (
              <>
                <X className="h-4 w-4 mr-2" />
                Reject Assignment
              </>
            )}
          </Button>
        </div>
      </form>
    </ModernModel>
  );
}
