import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Eye, Mail, DollarSign, AlertCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { customToast } from "@/lib/utils/toast";

interface FinancialTransaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  severity?: string;
  invoice_number?: string;
  client_name: string;
  client_email?: string;
  subtotal?: number;
  tax_amount?: number;
  discount_amount?: number;
  total_amount?: number;
  currency?: string;
  status: string;
  paid?: boolean;
  due_date?: string;
  paid_at?: string;
  payment_method?: string;
  created_at: string;
}

interface FinancialTransactionsTableProps {
  className?: string;
  onViewAll?: () => void;
  data?: FinancialTransaction[];
  isLoading?: boolean;
  error?: any;
  limit?: number;
}

export function FinancialTransactionsTable({
  className,
  onViewAll,
  data = [],
  isLoading = false,
  error = null,
  limit,
}: FinancialTransactionsTableProps) {
  const { t } = useLanguage();

  const transactions = limit ? (data || []).slice(0, limit) : data || [];
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewInvoice = (id: string) => {
    console.log(`Viewing invoice for: ${id}`);
    // Navigate to invoice page
    window.location.href = `/admin/invoices/${id}`;
  };

  const handleDownloadReceipt = (id: string) => {
    console.log(`Downloading receipt for: ${id}`);
    // Generate and download receipt
    const transaction = transactions.find((t) => t.id === id);
    const receiptData = {
      id: id,
      amount: transaction?.amount,
      date: new Date().toISOString(),
      type: "receipt",
    };

    const blob = new Blob([JSON.stringify(receiptData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    customToast.success(t("tables.receiptDownloaded"));
  };

  const handleEmailReceipt = (id: string) => {
    console.log(`Emailing receipt for: ${id}`);
    // Open email modal or navigate to email page
    window.location.href = `/admin/email-receipt/${id}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <Card
        className={`bg-white/80 backdrop-blur-sm border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden ${className}`}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pt-6 px-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              {t("tables.financialTransactions")}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card
        className={`bg-white/80 backdrop-blur-sm border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden ${className}`}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pt-6 px-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              {t("tables.financialTransactions")}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-600">{t("tables.loadError")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`bg-white/80 backdrop-blur-sm border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden ${className}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pt-6 px-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <CardTitle className="text-lg font-semibold text-gray-900">
            {t("tables.financialTransactions")}
          </CardTitle>
        </div>
        <Button variant="outline" size="sm" onClick={onViewAll}>
          {t("common.viewAll")}
        </Button>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-900 text-xs whitespace-nowrap">
                  #
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs whitespace-nowrap">
                  {t("tables.invoiceNumber")}
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs whitespace-nowrap">
                  {t("tables.client")}
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs whitespace-nowrap">
                  {t("tables.amount")}
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs whitespace-nowrap">
                  {t("tables.status")}
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs whitespace-nowrap">
                  {t("tables.paymentMethod")}
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs whitespace-nowrap">
                  {t("tables.dueDate")}
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs whitespace-nowrap">
                  {t("tables.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-gray-500"
                  >
                    {t("tables.noTransactions")}
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction: any, index: number) => (
                  <TableRow
                    key={transaction.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="font-medium text-gray-900 text-xs whitespace-nowrap">
                      {index + 1}
                    </TableCell>
                    <TableCell className="text-gray-700 text-xs whitespace-nowrap">
                      <Badge variant="outline" className="text-xs">
                        {transaction.invoice_number}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-700 text-xs whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {transaction.client_name}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {transaction.client_email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-green-600 text-xs whitespace-nowrap">
                      RWF{" "}
                      {transaction.total_amount?.toLocaleString() ||
                        transaction.amount?.toLocaleString() ||
                        "0"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge
                          className={`${getPaymentStatusColor(
                            transaction.paid ? "paid" : "pending"
                          )} text-xs px-2 py-1`}
                        >
                          {transaction.paid ? "Paid" : "Pending"}
                        </Badge>
                        <Badge
                          className={`${getPriorityColor(
                            transaction.severity
                          )} text-xs px-2 py-1`}
                        >
                          {transaction.severity}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700 text-xs whitespace-nowrap">
                      {transaction.payment_method ? (
                        <Badge variant="outline" className="text-xs">
                          {transaction.payment_method?.replace("_", " ") ||
                            "Unknown"}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-gray-700 text-xs whitespace-nowrap">
                      {transaction.due_date
                        ? new Date(transaction.due_date).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewInvoice(transaction.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadReceipt(transaction.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEmailReceipt(transaction.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Mail className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {/* <div className="mt-4 grid grid-cols-3 gap-4 text-xs">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-green-600 font-semibold">RWF 850K</p>
            <p className="text-green-600">Total Revenue</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-blue-600 font-semibold">3</p>
            <p className="text-blue-600">Paid Transactions</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <p className="text-yellow-600 font-semibold">0</p>
            <p className="text-yellow-600">Pending Payments</p>
          </div>
        </div> */}
      </CardContent>
    </Card>
  );
}
