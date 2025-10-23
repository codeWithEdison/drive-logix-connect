import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Calendar,
  DollarSign,
  Building,
  FileText,
  RefreshCw,
  Download,
} from "lucide-react";
import { usePaymentVerifications } from "@/lib/api/hooks/paymentVerificationHooks";
import PaymentVerificationActions from "@/components/admin/PaymentVerificationActions";
import { PaymentVerificationStatus } from "@/types/shared";

export default function AdminPaymentVerifications() {
  const [selectedVerification, setSelectedVerification] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const {
    data: verificationsData,
    isLoading,
    error,
    refetch,
  } = usePaymentVerifications({
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const verifications = Array.isArray(
    (verificationsData as any)?.data?.verifications
  )
    ? (verificationsData as any).data.verifications
    : [];

  // Debug logging
  console.log("🔍 AdminPaymentVerifications Debug:");
  console.log("verificationsData:", verificationsData);
  console.log("verificationsData.data:", (verificationsData as any)?.data);
  console.log(
    "verificationsData.data.verifications:",
    (verificationsData as any)?.data?.verifications
  );
  console.log("verifications:", verifications);
  console.log(
    "isArray check:",
    Array.isArray((verificationsData as any)?.data?.verifications)
  );

  const handleAction = (status: string) => {
    toast.success(`Verification ${status}`);
    setIsDetailModalOpen(false);
    setSelectedVerification(null);
    refetch();
  };

  const getStatusBadge = (status: PaymentVerificationStatus) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      approved: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      more_info: "bg-blue-100 text-blue-800 border-blue-200",
    };

    return (
      <Badge className={variants[status]}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("rw-RW", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Payment Verifications</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Payment Verifications</h1>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <h3 className="font-semibold text-red-800">
                Error Loading Payment Verifications
              </h3>
              <p className="text-red-600 text-sm mt-1">
                {error.message || "Failed to load payment verifications"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Verifications</h1>
          <p className="text-muted-foreground">
            Review and manage offline payment submissions
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status Filter</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="more_info">More Info Required</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verifications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Verifications ({verifications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {verifications.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No payment verifications found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Bank</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {verifications.map((verification: any) => (
                  <TableRow key={verification.id}>
                    <TableCell className="font-mono text-sm">
                      {verification.invoice?.invoice_number ||
                        verification.invoice_id}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">
                          {verification.client?.user?.full_name ||
                            verification.submitter?.full_name ||
                            "Unknown"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {verification.client?.user?.email ||
                            verification.submitter?.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(
                        parseFloat(verification.amount),
                        verification.currency
                      )}
                    </TableCell>
                    <TableCell className="uppercase font-medium">
                      {verification.bank_name}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {verification.reference}
                    </TableCell>
                    <TableCell>
                      {formatDate(verification.payment_date)}
                    </TableCell>
                    <TableCell>{getStatusBadge(verification.status)}</TableCell>
                    <TableCell>{formatDate(verification.created_at)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedVerification(verification);
                          setIsDetailModalOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payment Verification Details</DialogTitle>
          </DialogHeader>

          {selectedVerification && (
            <div className="space-y-6">
              {/* Invoice & Client Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Invoice & Client Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Invoice Number
                      </Label>
                      <p className="font-mono text-sm bg-gray-50 p-2 rounded">
                        {selectedVerification.invoice?.invoice_number ||
                          selectedVerification.invoice_id}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Invoice Amount
                      </Label>
                      <p className="text-lg font-bold">
                        {formatCurrency(
                          parseFloat(
                            selectedVerification.invoice?.total_amount ||
                              selectedVerification.amount
                          ),
                          selectedVerification.currency
                        )}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Client Name
                      </Label>
                      <p className="bg-gray-50 p-2 rounded">
                        {selectedVerification.client?.user?.full_name ||
                          selectedVerification.submitter?.full_name ||
                          "Unknown"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Client Email
                      </Label>
                      <p className="bg-gray-50 p-2 rounded">
                        {selectedVerification.client?.user?.email ||
                          selectedVerification.submitter?.email ||
                          "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Client Phone
                      </Label>
                      <p className="bg-gray-50 p-2 rounded">
                        {selectedVerification.client?.user?.phone || "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Invoice Status
                      </Label>
                      <div className="pt-2">
                        <Badge variant="outline">
                          {selectedVerification.invoice?.status || "Unknown"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {selectedVerification.cargo && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Cargo Information
                      </Label>
                      <div className="bg-gray-50 p-3 rounded mt-1">
                        <p className="text-sm">
                          <strong>Description:</strong>{" "}
                          {selectedVerification.cargo.description}
                        </p>
                        <p className="text-sm">
                          <strong>Weight:</strong>{" "}
                          {selectedVerification.cargo.weight_kg} kg
                        </p>
                        <p className="text-sm">
                          <strong>Pickup:</strong>{" "}
                          {selectedVerification.cargo.pickup_address}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Payment Amount
                      </Label>
                      <p className="text-lg font-bold">
                        {formatCurrency(
                          parseFloat(selectedVerification.amount),
                          selectedVerification.currency
                        )}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Bank Name
                      </Label>
                      <p className="bg-gray-50 p-2 rounded uppercase font-medium">
                        {selectedVerification.bank_name}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Reference Number
                      </Label>
                      <p className="font-mono text-sm bg-gray-50 p-2 rounded">
                        {selectedVerification.reference}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Payment Date
                      </Label>
                      <p className="bg-gray-50 p-2 rounded">
                        {formatDate(selectedVerification.payment_date)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Verification Status
                      </Label>
                      <div className="pt-2">
                        {getStatusBadge(selectedVerification.status)}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Submitted Date
                      </Label>
                      <p className="bg-gray-50 p-2 rounded">
                        {formatDate(selectedVerification.created_at)}
                      </p>
                    </div>
                  </div>

                  {selectedVerification.notes && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Notes
                      </Label>
                      <p className="bg-gray-50 p-3 rounded mt-1">
                        {selectedVerification.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Proof Files */}
              {selectedVerification.payment_proofs &&
                selectedVerification.payment_proofs.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Payment Proof Files
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedVerification.payment_proofs.map(
                          (proof: any, index: number) => (
                            <div
                              key={proof.id}
                              className="border rounded-lg p-4 bg-gray-50"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <FileText className="h-8 w-8 text-blue-600" />
                                  <div>
                                    <p className="font-medium text-sm">
                                      {proof.file?.original_name ||
                                        `Proof ${index + 1}`}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {(proof.file?.size / 1024).toFixed(1)} KB
                                      • {proof.file?.mime_type}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      window.open(
                                        proof.file?.file_url,
                                        "_blank"
                                      )
                                    }
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const link = document.createElement("a");
                                      link.href = proof.file?.file_url;
                                      link.download =
                                        proof.file?.original_name ||
                                        "payment-proof.pdf";
                                      link.click();
                                    }}
                                  >
                                    <Download className="h-4 w-4 mr-1" />
                                    Download
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Admin Actions */}
              {selectedVerification.status === "pending" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Admin Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PaymentVerificationActions
                      verificationId={selectedVerification.id}
                      onAction={handleAction}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
