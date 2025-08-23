import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Receipt,
    Download,
    Eye,
    Search,
    Filter,
    Calendar,
    DollarSign,
    FileText,
    CheckCircle,
    Clock,
    AlertCircle,
    MoreHorizontal
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock invoice data based on database schema
const mockInvoices = [
    {
        id: "INV-2024-001",
        invoiceNumber: "INV-2024-001",
        cargoId: "#3565432",
        subtotal: 280.00,
        taxAmount: 28.00,
        discountAmount: 0.00,
        totalAmount: 308.00,
        currency: "USD",
        status: "paid",
        dueDate: "2024-02-15",
        paidAt: "2024-02-10",
        paymentMethod: "mobile_money",
        paymentReference: "MM123456",
        createdDate: "2024-01-15",
        cargoDetails: {
            type: "Electronics",
            from: "4140 Parker Rd, Allentown, NM",
            to: "3517 W. Gray St. Utica, PA"
        }
    },
    {
        id: "INV-2024-002",
        invoiceNumber: "INV-2024-002",
        cargoId: "#4832920",
        subtotal: 150.00,
        taxAmount: 15.00,
        discountAmount: 10.00,
        totalAmount: 155.00,
        currency: "USD",
        status: "sent",
        dueDate: "2024-02-20",
        createdDate: "2024-01-20",
        cargoDetails: {
            type: "Documents",
            from: "1050 Elden St. Colma, DE",
            to: "6502 Preston Rd. Inglewood, ME"
        }
    },
    {
        id: "INV-2024-003",
        invoiceNumber: "INV-2024-003",
        cargoId: "#1442654",
        subtotal: 320.00,
        taxAmount: 32.00,
        discountAmount: 0.00,
        totalAmount: 352.00,
        currency: "USD",
        status: "overdue",
        dueDate: "2024-02-01",
        createdDate: "2024-01-25",
        cargoDetails: {
            type: "Furniture",
            from: "2972 Westheimer Rd. Santa Ana, IL",
            to: "6391 Elgin St. Celina, DE"
        }
    }
];

const statusConfig = {
    draft: {
        label: "Draft",
        className: "bg-gray-100 text-gray-800 border-gray-200",
        icon: FileText
    },
    sent: {
        label: "Sent",
        className: "bg-blue-100 text-blue-800 border-blue-200",
        icon: Clock
    },
    paid: {
        label: "Paid",
        className: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle
    },
    overdue: {
        label: "Overdue",
        className: "bg-red-100 text-red-800 border-red-200",
        icon: AlertCircle
    },
    cancelled: {
        label: "Cancelled",
        className: "bg-gray-100 text-gray-800 border-gray-200",
        icon: FileText
    }
};

export default function Invoices() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    const filteredInvoices = mockInvoices.filter(invoice => {
        const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.cargoId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const sortedInvoices = [...filteredInvoices].sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
            case 'oldest':
                return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
            case 'amount-high':
                return b.totalAmount - a.totalAmount;
            case 'amount-low':
                return a.totalAmount - b.totalAmount;
            default:
                return 0;
        }
    });

    const handleDownloadInvoice = (invoiceId: string) => {
        // Mock download functionality
        console.log(`Downloading invoice ${invoiceId}`);
        // In real app, this would trigger a PDF download
    };

    const handleViewInvoice = (invoiceId: string) => {
        // Mock view functionality
        console.log(`Viewing invoice ${invoiceId}`);
        // In real app, this would open a modal or navigate to invoice detail
    };

    const totalPaid = mockInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalOutstanding = mockInvoices.filter(inv => inv.status === 'sent' || inv.status === 'overdue').reduce((sum, inv) => sum + inv.totalAmount, 0);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Invoices</h1>
                    <p className="text-muted-foreground">Manage and track your payment invoices</p>
                </div>
                <Button className="bg-gradient-primary hover:bg-primary-hover">
                    <Receipt className="w-4 h-4 mr-2" />
                    Download All
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="card-elevated">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Invoices
                        </CardTitle>
                        <Receipt className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{mockInvoices.length}</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                </Card>

                <Card className="card-elevated">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Paid
                        </CardTitle>
                        <CheckCircle className="h-4 w-4 text-success" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">${totalPaid.toFixed(2)}</div>
                        <p className="text-xs text-success">Successfully paid</p>
                    </CardContent>
                </Card>

                <Card className="card-elevated">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Outstanding
                        </CardTitle>
                        <AlertCircle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">${totalOutstanding.toFixed(2)}</div>
                        <p className="text-xs text-destructive">Pending payment</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Search */}
            <Card className="card-elevated">
                <CardHeader>
                    <CardTitle>Filter & Search</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    placeholder="Search by invoice number or cargo ID..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="sent">Sent</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="overdue">Overdue</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Newest First</SelectItem>
                                <SelectItem value="oldest">Oldest First</SelectItem>
                                <SelectItem value="amount-high">Amount: High to Low</SelectItem>
                                <SelectItem value="amount-low">Amount: Low to High</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Invoice Table */}
            <Card className="card-elevated">
                <CardHeader>
                    <CardTitle>All Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice #</TableHead>
                                    <TableHead>Cargo ID</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedInvoices.map((invoice) => {
                                    const status = statusConfig[invoice.status as keyof typeof statusConfig];
                                    return (
                                        <TableRow key={invoice.id}>
                                            <TableCell className="font-medium">
                                                {invoice.invoiceNumber}
                                            </TableCell>
                                            <TableCell>{invoice.cargoId}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{invoice.cargoDetails.type}</div>
                                                    <div className="text-xs text-muted-foreground truncate max-w-32">
                                                        {invoice.cargoDetails.from} → {invoice.cargoDetails.to}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-semibold">${invoice.totalAmount.toFixed(2)}</div>
                                                {invoice.discountAmount > 0 && (
                                                    <div className="text-xs text-green-600">
                                                        -${invoice.discountAmount.toFixed(2)} discount
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className={status.className}>
                                                    {status.label}
                                                </Badge>
                                                {invoice.status === 'paid' && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {invoice.paymentMethod}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{invoice.dueDate}</div>
                                                {invoice.status === 'paid' && (
                                                    <div className="text-xs text-muted-foreground">
                                                        Paid: {invoice.paidAt}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>{invoice.createdDate}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleViewInvoice(invoice.id)}>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDownloadInvoice(invoice.id)}>
                                                            <Download className="h-4 w-4 mr-2" />
                                                            Download PDF
                                                        </DropdownMenuItem>
                                                        {invoice.status === 'sent' && (
                                                            <DropdownMenuItem>
                                                                <DollarSign className="h-4 w-4 mr-2" />
                                                                Pay Now
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    {sortedInvoices.length === 0 && (
                        <div className="text-center py-12">
                            <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold text-muted-foreground">No invoices found</h3>
                            <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
