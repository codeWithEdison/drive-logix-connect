import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ModernModel from "@/components/modal/ModernModel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useSubmitPaymentVerification } from "@/lib/api/hooks/paymentVerificationHooks";
import { useUploadFile } from "@/lib/api/hooks/utilityHooks";
import { Upload, X, FileText, Building2, Smartphone } from "lucide-react";

interface OfflinePaymentVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
  defaultAmount?: number;
  defaultCurrency?: string;
}

export default function OfflinePaymentVerificationModal({
  isOpen,
  onClose,
  invoiceId,
  defaultAmount,
  defaultCurrency,
}: OfflinePaymentVerificationModalProps) {
  const submitMutation = useSubmitPaymentVerification();
  const uploadFileMutation = useUploadFile();
  const [form, setForm] = React.useState({
    amount: defaultAmount || 0,
    currency: defaultCurrency || "RWF",
    payment_date: "",
    bank_name: "",
    reference: "",
    notes: "",
    payment_method: "bank_transfer",
  });
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);
  const [fileIds, setFileIds] = React.useState<string[]>([]);

  React.useEffect(() => {
    setForm((prev) => ({
      ...prev,
      amount: defaultAmount || prev.amount,
      currency: defaultCurrency || prev.currency,
    }));
  }, [defaultAmount, defaultCurrency]);

  const handleChange = (field: string, value: any) => {
    setForm((p) => ({ ...p, [field]: value }));
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);

    // Validate file types
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
    ];

    for (const file of fileArray) {
      if (!allowedTypes.includes(file.type)) {
        toast.error(
          `Invalid file type: ${file.name}. Please upload images or PDF files.`
        );
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File too large: ${file.name}. Maximum size is 10MB.`);
        return;
      }
    }

    setUploadedFiles((prev) => [...prev, ...fileArray]);
  };

  const getUploadTypeForFile = (file: File): "image" | "document" => {
    if (file.type.startsWith("image/")) return "image";
    return "document";
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    setFileIds((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceId) {
      toast.error("Missing invoice ID");
      return;
    }
    if (!form.amount || form.amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (!form.currency) {
      toast.error("Currency is required");
      return;
    }
    if (!form.payment_date) {
      toast.error("Payment date is required");
      return;
    }
    if (form.payment_method === "bank_transfer" && !form.bank_name) {
      toast.error("Bank name is required for bank transfers");
      return;
    }
    if (!form.reference) {
      toast.error("Reference is required");
      return;
    }

    try {
      // Upload files first if any
      const uploadedFileIds: string[] = [];
      if (uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          const uploadResult = await uploadFileMutation.mutateAsync({
            file,
            type: getUploadTypeForFile(file),
            category: form.payment_method,
          });
          uploadedFileIds.push(uploadResult.data!.id);
        }
      }

      // Submit verification with file IDs
      const submitData: any = {
        invoice_id: invoiceId,
        amount: Number(form.amount),
        currency: form.currency,
        payment_date: form.payment_date,
        reference: form.reference,
        notes: form.notes || undefined,
        attachment_file_ids:
          uploadedFileIds.length > 0 ? uploadedFileIds : undefined,
      };

      // Only include bank_name if payment method is bank_transfer and it's not empty
      if (form.payment_method === "bank_transfer" && form.bank_name.trim()) {
        submitData.bank_name = form.bank_name;
      }

      const res = await submitMutation.mutateAsync(submitData);

      if (res?.success) {
        toast.success("Verification submitted. We'll review and notify you.");
        onClose();
      } else {
        toast.error(res?.message || "Failed to submit verification");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit verification");
    }
  };

  if (!isOpen) return null;

  return (
    <ModernModel
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Offline Payment Proof"
    >
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) =>
                    handleChange("amount", Number(e.target.value))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  placeholder="RWF"
                  value={form.currency}
                  onChange={(e) => handleChange("currency", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method</Label>
              <Select
                value={form.payment_method}
                onValueChange={(value) => handleChange("payment_method", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Bank Transfer
                    </div>
                  </SelectItem>
                  <SelectItem value="mobile_money">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      Mobile Money (MoMo)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment_date">Payment Date</Label>
                <Input
                  id="payment_date"
                  type="date"
                  value={form.payment_date}
                  onChange={(e) => handleChange("payment_date", e.target.value)}
                />
              </div>
              {form.payment_method === "bank_transfer" && (
                <div className="space-y-2">
                  <Label htmlFor="bank_name">Bank Name</Label>
                  <Input
                    id="bank_name"
                    placeholder="BK"
                    value={form.bank_name}
                    onChange={(e) => handleChange("bank_name", e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Reference</Label>
              <Input
                id="reference"
                placeholder="UTR / Reference"
                value={form.reference}
                onChange={(e) => handleChange("reference", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional details"
                value={form.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
              />
            </div>

            {/* File Upload Section */}
            <div className="space-y-2">
              <Label>Payment Proof (Screenshots/Receipts)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Upload payment proof
                      </span>
                      <span className="mt-1 block text-sm text-gray-500">
                        PNG, JPG, PDF up to 10MB each
                      </span>
                    </label>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      className="sr-only"
                      onChange={(e) => handleFileUpload(e.target.files)}
                    />
                  </div>
                </div>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Files:</Label>
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024 / 1024).toFixed(1)}MB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={submitMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  submitMutation.isPending || uploadFileMutation.isPending
                }
              >
                {submitMutation.isPending || uploadFileMutation.isPending
                  ? "Submitting..."
                  : "Submit Verification"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </ModernModel>
  );
}
