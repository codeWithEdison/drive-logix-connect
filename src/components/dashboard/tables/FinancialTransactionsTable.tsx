import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Eye, Mail, DollarSign } from 'lucide-react';

// Mock data for financial transactions - Rwanda-based (only 3 rows)
const financialTransactionsData = [
  {
    id: '#3565432',
    client: 'John Smith',
    amount: 'RWF 280,000',
    date: '2024-01-15',
    paymentStatus: 'paid',
    deliveryStatus: 'delivered'
  },
  {
    id: '#4832920',
    client: 'Sarah Johnson',
    amount: 'RWF 320,000',
    date: '2024-01-15',
    paymentStatus: 'paid',
    deliveryStatus: 'in_transit'
  },
  {
    id: '#1442654',
    client: 'Emma Davis',
    amount: 'RWF 250,000',
    date: '2024-01-14',
    paymentStatus: 'paid',
    deliveryStatus: 'delivered'
  }
];

interface FinancialTransactionsTableProps {
  className?: string;
  onViewAll?: () => void;
}

export function FinancialTransactionsTable({ className, onViewAll }: FinancialTransactionsTableProps) {
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    const receiptData = {
      id: id,
      amount: financialTransactionsData.find(t => t.id === id)?.amount,
      date: new Date().toISOString(),
      type: 'receipt'
    };

    const blob = new Blob([JSON.stringify(receiptData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleEmailReceipt = (id: string) => {
    console.log(`Emailing receipt for: ${id}`);
    // Open email modal or navigate to email page
    window.location.href = `/admin/email-receipt/${id}`;
  };

  return (
    <Card className={`bg-white/80 backdrop-blur-sm border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pt-6 px-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <CardTitle className="text-lg font-semibold text-gray-900">Financial Transactions</CardTitle>
        </div>
        <Button variant="outline" size="sm" onClick={onViewAll}>
          View All
        </Button>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-900 text-xs">ID</TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs">Client</TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs">Amount</TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs">Status</TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {financialTransactionsData.map((transaction) => (
                <TableRow key={transaction.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="font-medium text-gray-900 text-xs">{transaction.id}</TableCell>
                  <TableCell className="text-gray-700 text-xs">{transaction.client}</TableCell>
                  <TableCell className="font-semibold text-green-600 text-xs">{transaction.amount}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge className={`${getPaymentStatusColor(transaction.paymentStatus)} text-xs px-2 py-1`}>
                        {transaction.paymentStatus}
                      </Badge>
                      <Badge className={`${getDeliveryStatusColor(transaction.deliveryStatus)} text-xs px-2 py-1`}>
                        {transaction.deliveryStatus.replace('_', ' ')}
                      </Badge>
                    </div>
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
              ))}
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
