import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    AiOutlineBarChart,
    AiOutlineDollar,
    AiOutlineTeam,
    AiOutlineDownload,
    AiOutlineFileText,
    AiOutlineFilter,
    AiOutlinePrinter,
    AiOutlineMail
} from 'react-icons/ai';

// Mock data for reports
const mockDeliveryReport = [
    {
        id: 'DEL-001',
        cargoId: '#3565432',
        client: 'John Smith',
        driver: 'Albert Flores',
        from: 'Kigali',
        to: 'Butare',
        distance: 120,
        weight: 45,
        status: 'delivered',
        revenue: 280,
        cost: 180,
        profit: 100,
        deliveredAt: '2024-01-15 14:30'
    },
    {
        id: 'DEL-002',
        cargoId: '#4832920',
        client: 'Sarah Johnson',
        driver: 'Mike Wilson',
        from: 'Kigali',
        to: 'Musanze',
        distance: 80,
        weight: 120,
        status: 'delivered',
        revenue: 320,
        cost: 200,
        profit: 120,
        deliveredAt: '2024-01-16 09:15'
    }
];

const mockFinancialReport = [
    {
        month: 'January 2024',
        totalRevenue: 125400,
        totalCost: 89400,
        totalProfit: 36000,
        deliveryCount: 234,
        avgRevenuePerDelivery: 536,
        fuelCost: 15600,
        maintenanceCost: 8900,
        driverPayroll: 45600
    },
    {
        month: 'December 2023',
        totalRevenue: 118200,
        totalCost: 85600,
        totalProfit: 32600,
        deliveryCount: 218,
        avgRevenuePerDelivery: 542,
        fuelCost: 14200,
        maintenanceCost: 8200,
        driverPayroll: 43200
    }
];

const mockUserReport = [
    {
        id: '1',
        name: 'John Smith',
        type: 'client',
        totalCargos: 12,
        totalSpent: 3240,
        avgOrderValue: 270,
        lastOrder: '2024-01-15',
        status: 'active'
    },
    {
        id: '2',
        name: 'Albert Flores',
        type: 'driver',
        totalDeliveries: 45,
        totalEarnings: 5670,
        avgRating: 4.8,
        lastDelivery: '2024-01-16',
        status: 'active'
    }
];

export default function AdminReports() {
    const [selectedReport, setSelectedReport] = useState('deliveries');
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [filters, setFilters] = useState({
        status: 'all',
        driver: 'all',
        client: 'all'
    });

    const handleExportReport = (type: string, format: 'excel' | 'pdf') => {
        console.log(`Exporting ${type} report as ${format}`);
        // TODO: Implement export functionality
    };

    const handlePrintReport = (type: string) => {
        console.log(`Printing ${type} report`);
        // TODO: Implement print functionality
    };

    const handleEmailReport = (type: string) => {
        console.log(`Emailing ${type} report`);
        // TODO: Implement email functionality
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered': return 'bg-success text-success-foreground';
            case 'in_transit': return 'bg-info text-info-foreground';
            case 'pending': return 'bg-warning text-warning-foreground';
            case 'cancelled': return 'bg-destructive text-destructive-foreground';
            default: return 'bg-secondary text-secondary-foreground';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
                    <p className="text-muted-foreground">Generate and export comprehensive reports</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <AiOutlineFilter className="w-4 h-4 mr-2" />
                        Filters
                    </Button>
                    <Button>
                        <AiOutlineDownload className="w-4 h-4 mr-2" />
                        Export All
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label>Date Range</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="date"
                                    value={dateRange.from}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                                />
                                <Input
                                    type="date"
                                    value={dateRange.to}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="delivered">Delivered</SelectItem>
                                    <SelectItem value="in_transit">In Transit</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Driver</Label>
                            <Select value={filters.driver} onValueChange={(value) => setFilters(prev => ({ ...prev, driver: value }))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Drivers</SelectItem>
                                    <SelectItem value="albert">Albert Flores</SelectItem>
                                    <SelectItem value="mike">Mike Wilson</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Client</Label>
                            <Select value={filters.client} onValueChange={(value) => setFilters(prev => ({ ...prev, client: value }))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Clients</SelectItem>
                                    <SelectItem value="john">John Smith</SelectItem>
                                    <SelectItem value="sarah">Sarah Johnson</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs value={selectedReport} onValueChange={setSelectedReport} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="deliveries">Delivery Reports</TabsTrigger>
                    <TabsTrigger value="financial">Financial Reports</TabsTrigger>
                    <TabsTrigger value="users">User Reports</TabsTrigger>
                </TabsList>

                {/* Delivery Reports Tab */}
                <TabsContent value="deliveries" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <AiOutlineBarChart className="h-5 w-5" />
                                    Delivery Performance Report
                                </CardTitle>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => handleExportReport('deliveries', 'excel')}>
                                        <AiOutlineDownload className="w-4 h-4 mr-2" />
                                        Excel
                                    </Button>
                                    <Button variant="outline" onClick={() => handleExportReport('deliveries', 'pdf')}>
                                        <AiOutlineFileText className="w-4 h-4 mr-2" />
                                        PDF
                                    </Button>
                                    <Button variant="outline" onClick={() => handlePrintReport('deliveries')}>
                                        <AiOutlinePrinter className="w-4 h-4 mr-2" />
                                        Print
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Delivery ID</TableHead>
                                        <TableHead>Cargo ID</TableHead>
                                        <TableHead>Client</TableHead>
                                        <TableHead>Driver</TableHead>
                                        <TableHead>Route</TableHead>
                                        <TableHead>Distance (km)</TableHead>
                                        <TableHead>Weight (kg)</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Revenue</TableHead>
                                        <TableHead>Cost</TableHead>
                                        <TableHead>Profit</TableHead>
                                        <TableHead>Delivered At</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockDeliveryReport.map((delivery) => (
                                        <TableRow key={delivery.id}>
                                            <TableCell className="font-medium">{delivery.id}</TableCell>
                                            <TableCell>{delivery.cargoId}</TableCell>
                                            <TableCell>{delivery.client}</TableCell>
                                            <TableCell>{delivery.driver}</TableCell>
                                            <TableCell>{delivery.from} → {delivery.to}</TableCell>
                                            <TableCell>{delivery.distance}</TableCell>
                                            <TableCell>{delivery.weight}</TableCell>
                                            <TableCell>
                                                <Badge className={getStatusColor(delivery.status)}>
                                                    {delivery.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>${delivery.revenue}</TableCell>
                                            <TableCell>${delivery.cost}</TableCell>
                                            <TableCell className="font-medium text-success">${delivery.profit}</TableCell>
                                            <TableCell>{delivery.deliveredAt}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Financial Reports Tab */}
                <TabsContent value="financial" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <AiOutlineDollar className="h-5 w-5" />
                                    Financial Performance Report
                                </CardTitle>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => handleExportReport('financial', 'excel')}>
                                        <AiOutlineDownload className="w-4 h-4 mr-2" />
                                        Excel
                                    </Button>
                                    <Button variant="outline" onClick={() => handleExportReport('financial', 'pdf')}>
                                        <AiOutlineFileText className="w-4 h-4 mr-2" />
                                        PDF
                                    </Button>
                                    <Button variant="outline" onClick={() => handleEmailReport('financial')}>
                                        <AiOutlineMail className="w-4 h-4 mr-2" />
                                        Email
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Month</TableHead>
                                        <TableHead>Total Revenue</TableHead>
                                        <TableHead>Total Cost</TableHead>
                                        <TableHead>Total Profit</TableHead>
                                        <TableHead>Delivery Count</TableHead>
                                        <TableHead>Avg Revenue/Delivery</TableHead>
                                        <TableHead>Fuel Cost</TableHead>
                                        <TableHead>Maintenance</TableHead>
                                        <TableHead>Driver Payroll</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockFinancialReport.map((report) => (
                                        <TableRow key={report.month}>
                                            <TableCell className="font-medium">{report.month}</TableCell>
                                            <TableCell>${report.totalRevenue.toLocaleString()}</TableCell>
                                            <TableCell>${report.totalCost.toLocaleString()}</TableCell>
                                            <TableCell className="font-medium text-success">${report.totalProfit.toLocaleString()}</TableCell>
                                            <TableCell>{report.deliveryCount}</TableCell>
                                            <TableCell>${report.avgRevenuePerDelivery}</TableCell>
                                            <TableCell>${report.fuelCost.toLocaleString()}</TableCell>
                                            <TableCell>${report.maintenanceCost.toLocaleString()}</TableCell>
                                            <TableCell>${report.driverPayroll.toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* User Reports Tab */}
                <TabsContent value="users" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <AiOutlineTeam className="h-5 w-5" />
                                    User Performance Report
                                </CardTitle>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => handleExportReport('users', 'excel')}>
                                        <AiOutlineDownload className="w-4 h-4 mr-2" />
                                        Excel
                                    </Button>
                                    <Button variant="outline" onClick={() => handleExportReport('users', 'pdf')}>
                                        <AiOutlineFileText className="w-4 h-4 mr-2" />
                                        PDF
                                    </Button>
                                    <Button variant="outline" onClick={() => handlePrintReport('users')}>
                                        <AiOutlinePrinter className="w-4 h-4 mr-2" />
                                        Print
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User ID</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Total Activity</TableHead>
                                        <TableHead>Total Value</TableHead>
                                        <TableHead>Average Value</TableHead>
                                        <TableHead>Rating</TableHead>
                                        <TableHead>Last Activity</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockUserReport.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.id}</TableCell>
                                            <TableCell>{user.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {user.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {user.type === 'client' ? user.totalCargos : user.totalDeliveries}
                                            </TableCell>
                                            <TableCell>
                                                ${user.type === 'client' ? user.totalSpent : user.totalEarnings}
                                            </TableCell>
                                            <TableCell>
                                                ${user.type === 'client' ? user.avgOrderValue : user.avgRating}
                                            </TableCell>
                                            <TableCell>
                                                {user.type === 'driver' ? `${user.avgRating}/5` : '-'}
                                            </TableCell>
                                            <TableCell>
                                                {user.type === 'client' ? user.lastOrder : user.lastDelivery}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getStatusColor(user.status)}>
                                                    {user.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
