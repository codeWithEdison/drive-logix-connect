import React, { useState } from 'react';
import { CustomTabs } from '@/components/ui/CustomTabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Download,
    FileText,
    Printer,
    Mail,
    Filter,
    BarChart3,
    DollarSign,
    Users,
    TrendingUp,
    Package,
    MapPin,
    Calendar
} from 'lucide-react';

// Mock data for reports - Rwanda-based
const mockDeliveryReport = [
    {
        id: 'DEL-001',
        cargoId: '#3565432',
        client: 'Jean Baptiste',
        driver: 'Albert Flores',
        from: 'Kigali',
        to: 'Butare',
        distance: 135,
        weight: 45,
        status: 'delivered',
        income: 280000, // FRW
        deliveredAt: '2024-01-15 14:30'
    },
    {
        id: 'DEL-002',
        cargoId: '#4832920',
        client: 'Marie Claire',
        driver: 'Mike Johnson',
        from: 'Kigali',
        to: 'Musanze',
        distance: 85,
        weight: 120,
        status: 'delivered',
        income: 320000, // FRW
        deliveredAt: '2024-01-16 09:15'
    },
    {
        id: 'DEL-003',
        cargoId: '#5678901',
        client: 'Pierre Ndayisaba',
        driver: 'Alice Uwimana',
        from: 'Kigali',
        to: 'Rubavu',
        distance: 95,
        weight: 80,
        status: 'delivered',
        income: 250000, // FRW
        deliveredAt: '2024-01-17 11:45'
    },
    {
        id: 'DEL-004',
        cargoId: '#6789012',
        client: 'Sarah Mukamana',
        driver: 'David Gasana',
        from: 'Kigali',
        to: 'Karongi',
        distance: 150,
        weight: 200,
        status: 'delivered',
        income: 450000, // FRW
        deliveredAt: '2024-01-18 16:20'
    },
    {
        id: 'DEL-005',
        cargoId: '#7890123',
        client: 'Emmanuel Niyonsaba',
        driver: 'Grace Uwase',
        from: 'Kigali',
        to: 'Gicumbi',
        distance: 70,
        weight: 60,
        status: 'delivered',
        income: 180000, // FRW
        deliveredAt: '2024-01-19 13:10'
    }
];

const mockIncomeReport = [
    {
        month: 'January 2024',
        totalIncome: 1480000, // FRW
        deliveryCount: 234,
        avgIncomePerDelivery: 6325, // FRW
        topRoute: 'Kigali → Butare',
        topRouteIncome: 420000, // FRW
        topDriver: 'Albert Flores',
        topDriverIncome: 180000 // FRW
    },
    {
        month: 'December 2023',
        totalIncome: 1350000, // FRW
        deliveryCount: 218,
        avgIncomePerDelivery: 6193, // FRW
        topRoute: 'Kigali → Musanze',
        topRouteIncome: 380000, // FRW
        topDriver: 'Mike Johnson',
        topDriverIncome: 165000 // FRW
    },
    {
        month: 'November 2023',
        totalIncome: 1420000, // FRW
        deliveryCount: 245,
        avgIncomePerDelivery: 5796, // FRW
        topRoute: 'Kigali → Rubavu',
        topRouteIncome: 410000, // FRW
        topDriver: 'Alice Uwimana',
        topDriverIncome: 175000 // FRW
    }
];

const mockDriverReport = [
    {
        id: '1',
        name: 'Albert Flores',
        totalDeliveries: 45,
        avgRating: 4.8,
        lastDelivery: '2024-01-16',
        status: 'active',
        completedDeliveries: 42,
        cancelledDeliveries: 3,
        avgDeliveryTime: '2.5 hours'
    },
    {
        id: '2',
        name: 'Mike Johnson',
        totalDeliveries: 38,
        avgRating: 4.6,
        lastDelivery: '2024-01-15',
        status: 'active',
        completedDeliveries: 35,
        cancelledDeliveries: 3,
        avgDeliveryTime: '2.8 hours'
    },
    {
        id: '3',
        name: 'Alice Uwimana',
        totalDeliveries: 52,
        avgRating: 4.9,
        lastDelivery: '2024-01-17',
        status: 'active',
        completedDeliveries: 50,
        cancelledDeliveries: 2,
        avgDeliveryTime: '2.2 hours'
    },
    {
        id: '4',
        name: 'David Gasana',
        totalDeliveries: 28,
        avgRating: 4.4,
        lastDelivery: '2024-01-18',
        status: 'active',
        completedDeliveries: 26,
        cancelledDeliveries: 2,
        avgDeliveryTime: '3.1 hours'
    },
    {
        id: '5',
        name: 'Grace Uwase',
        totalDeliveries: 33,
        avgRating: 4.7,
        lastDelivery: '2024-01-19',
        status: 'active',
        completedDeliveries: 31,
        cancelledDeliveries: 2,
        avgDeliveryTime: '2.6 hours'
    }
];

export default function AdminReports() {
    const [activeTab, setActiveTab] = useState('deliveries');
    const [dateRange, setDateRange] = useState({ from: '', to: '' });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('rw-RW', {
            style: 'currency',
            currency: 'RWF',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const generateExcelData = (type: string) => {
        let headers: string[] = [];
        let data: any[] = [];

        switch (type) {
            case 'deliveries':
                headers = ['#', 'Delivery ID', 'Client', 'Driver', 'Route', 'Distance (km)', 'Weight (kg)', 'Status', 'Income (RWF)', 'Date'];
                data = mockDeliveryReport.map((delivery, index) => [
                    index + 1,
                    delivery.id,
                    delivery.client,
                    delivery.driver,
                    `${delivery.from} → ${delivery.to}`,
                    delivery.distance,
                    delivery.weight,
                    delivery.status,
                    formatCurrency(delivery.income),
                    delivery.deliveredAt.split(' ')[0]
                ]);
                break;
            case 'income':
                headers = ['#', 'Month', 'Total Income (RWF)', 'Deliveries', 'Avg Income (RWF)', 'Top Route', 'Top Driver'];
                data = mockIncomeReport.map((report, index) => [
                    index + 1,
                    report.month,
                    formatCurrency(report.totalIncome),
                    report.deliveryCount,
                    formatCurrency(report.avgIncomePerDelivery),
                    report.topRoute,
                    report.topDriver
                ]);
                break;
            case 'drivers':
                headers = ['#', 'Driver ID', 'Name', 'Total Deliveries', 'Completed', 'Cancelled', 'Rating', 'Avg Time', 'Last Delivery', 'Status'];
                data = mockDriverReport.map((driver, index) => [
                    index + 1,
                    driver.id,
                    driver.name,
                    driver.totalDeliveries,
                    driver.completedDeliveries,
                    driver.cancelledDeliveries,
                    `${driver.avgRating}/5`,
                    driver.avgDeliveryTime,
                    driver.lastDelivery,
                    driver.status
                ]);
                break;
        }

        return { headers, data };
    };

    const generateCSVContent = (type: string) => {
        const { headers, data } = generateExcelData(type);
        const csvContent = [
            headers.join(','),
            ...data.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        return csvContent;
    };

    const generatePDFContent = (type: string) => {
        const { headers, data } = generateExcelData(type);
        let content = `Lovely Cargo Platform - ${type.charAt(0).toUpperCase() + type.slice(1)} Report\n`;
        content += `Generated on: ${new Date().toLocaleDateString('rw-RW')}\n\n`;

        // Add headers
        content += headers.join(' | ') + '\n';
        content += '-'.repeat(headers.join(' | ').length) + '\n';

        // Add data
        data.forEach(row => {
            content += row.join(' | ') + '\n';
        });

        return content;
    };

    const downloadFile = (content: string, filename: string, mimeType: string) => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleExportReport = (type: string, format: 'excel' | 'pdf') => {
        console.log(`Exporting ${type} report as ${format}`);

        const timestamp = new Date().toISOString().split('T')[0];
        const dateRangeText = dateRange.from && dateRange.to ? `_${dateRange.from}_to_${dateRange.to}` : '';

        if (format === 'excel') {
            const csvContent = generateCSVContent(type);
            const filename = `${type}_report${dateRangeText}_${timestamp}.csv`;
            downloadFile(csvContent, filename, 'text/csv');
        } else if (format === 'pdf') {
            const pdfContent = generatePDFContent(type);
            const filename = `${type}_report${dateRangeText}_${timestamp}.txt`;
            downloadFile(pdfContent, filename, 'text/plain');
        }
    };

    const handleExportAll = async () => {
        console.log('Exporting all reports as ZIP');

        try {
            // Generate all three reports
            const reports = [
                { type: 'deliveries', content: generateCSVContent('deliveries'), filename: 'deliveries_report.csv' },
                { type: 'income', content: generateCSVContent('income'), filename: 'income_report.csv' },
                { type: 'drivers', content: generateCSVContent('drivers'), filename: 'drivers_report.csv' }
            ];

            // Create ZIP file using JSZip
            const JSZip = (await import('jszip')).default;
            const zip = new JSZip();

            // Add each report to the ZIP
            reports.forEach(report => {
                zip.file(report.filename, report.content);
            });

            // Generate and download ZIP
            const timestamp = new Date().toISOString().split('T')[0];
            const dateRangeText = dateRange.from && dateRange.to ? `_${dateRange.from}_to_${dateRange.to}` : '';
            const zipFilename = `lovely_cargo_reports${dateRangeText}_${timestamp}.zip`;

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = zipFilename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log('All reports exported successfully as ZIP');
        } catch (error) {
            console.error('Error creating ZIP file:', error);
            alert('Error creating ZIP file. Please try again.');
        }
    };

    const handlePrintReport = (type: string) => {
        console.log(`Printing ${type} report`);
        window.print();
    };

    const handleEmailReport = (type: string) => {
        console.log(`Emailing ${type} report`);
        // Mock email functionality
        alert(`Email report for ${type} would be sent to admin@lovelycargo.rw`);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered': return 'bg-green-100 text-green-600';
            case 'in_transit': return 'bg-blue-100 text-blue-600';
            case 'pending': return 'bg-yellow-100 text-yellow-600';
            case 'cancelled': return 'bg-red-100 text-red-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const tabs = [
        {
            value: 'deliveries',
            label: 'Delivery Reports',
            count: mockDeliveryReport.length
        },
        {
            value: 'income',
            label: 'Income Reports',
            count: mockIncomeReport.length
        },
        {
            value: 'drivers',
            label: 'Driver Reports',
            count: mockDriverReport.length
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground font-heading">Reports & Analytics</h1>
                    <p className="text-muted-foreground">Generate and export comprehensive reports</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                    </Button>
                    <Button onClick={handleExportAll}>
                        <Download className="w-4 h-4 mr-2" />
                        Export All
                    </Button>
                </div>
            </div>

            {/* Filters - Only Date Range */}
            <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
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
                    </div>
                </CardContent>
            </Card>

            {/* Custom Tabs */}
            <CustomTabs
                value={activeTab}
                onValueChange={setActiveTab}
                tabs={tabs}
            />

            {/* Tab Content */}
            {activeTab === 'deliveries' && (
                <div className="mt-6">
                    <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    Delivery Performance Report
                                </CardTitle>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => handleExportReport('deliveries', 'excel')}>
                                        <Download className="w-4 h-4 mr-2" />
                                        Excel
                                    </Button>
                                    <Button variant="outline" onClick={() => handleExportReport('deliveries', 'pdf')}>
                                        <FileText className="w-4 h-4 mr-2" />
                                        PDF
                                    </Button>
                                    <Button variant="outline" onClick={() => handlePrintReport('deliveries')}>
                                        <Printer className="w-4 h-4 mr-2" />
                                        Print
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-xs font-medium text-gray-600">#</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Delivery ID</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Client</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Driver</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Route</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Distance</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Weight</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Status</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Income</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mockDeliveryReport.map((delivery, index) => (
                                            <TableRow key={delivery.id}>
                                                <TableCell className="text-xs text-gray-500">{index + 1}</TableCell>
                                                <TableCell className="font-medium text-sm">{delivery.id}</TableCell>
                                                <TableCell className="text-sm">{delivery.client}</TableCell>
                                                <TableCell className="text-sm">{delivery.driver}</TableCell>
                                                <TableCell className="text-sm">{delivery.from} → {delivery.to}</TableCell>
                                                <TableCell className="text-sm">{delivery.distance} km</TableCell>
                                                <TableCell className="text-sm">{delivery.weight} kg</TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(delivery.status)}>
                                                        {delivery.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-medium text-sm text-green-600">
                                                    {formatCurrency(delivery.income)}
                                                </TableCell>
                                                <TableCell className="text-sm">{delivery.deliveredAt.split(' ')[0]}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === 'income' && (
                <div className="mt-6">
                    <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Income Performance Report
                                </CardTitle>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => handleExportReport('income', 'excel')}>
                                        <Download className="w-4 h-4 mr-2" />
                                        Excel
                                    </Button>
                                    <Button variant="outline" onClick={() => handleExportReport('income', 'pdf')}>
                                        <FileText className="w-4 h-4 mr-2" />
                                        PDF
                                    </Button>
                                    <Button variant="outline" onClick={() => handleEmailReport('income')}>
                                        <Mail className="w-4 h-4 mr-2" />
                                        Email
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-xs font-medium text-gray-600">#</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Month</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Total Income</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Deliveries</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Avg Income</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Top Route</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Top Driver</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mockIncomeReport.map((report, index) => (
                                            <TableRow key={report.month}>
                                                <TableCell className="text-xs text-gray-500">{index + 1}</TableCell>
                                                <TableCell className="font-medium text-sm">{report.month}</TableCell>
                                                <TableCell className="font-medium text-sm text-green-600">
                                                    {formatCurrency(report.totalIncome)}
                                                </TableCell>
                                                <TableCell className="text-sm">{report.deliveryCount}</TableCell>
                                                <TableCell className="text-sm">
                                                    {formatCurrency(report.avgIncomePerDelivery)}
                                                </TableCell>
                                                <TableCell className="text-sm">{report.topRoute}</TableCell>
                                                <TableCell className="text-sm">{report.topDriver}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === 'drivers' && (
                <div className="mt-6">
                    <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Driver Performance Report
                                </CardTitle>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => handleExportReport('drivers', 'excel')}>
                                        <Download className="w-4 h-4 mr-2" />
                                        Excel
                                    </Button>
                                    <Button variant="outline" onClick={() => handleExportReport('drivers', 'pdf')}>
                                        <FileText className="w-4 h-4 mr-2" />
                                        PDF
                                    </Button>
                                    <Button variant="outline" onClick={() => handlePrintReport('drivers')}>
                                        <Printer className="w-4 h-4 mr-2" />
                                        Print
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-xs font-medium text-gray-600">#</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Driver ID</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Name</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Total</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Completed</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Cancelled</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Rating</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Avg Time</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Last Delivery</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mockDriverReport.map((driver, index) => (
                                            <TableRow key={driver.id}>
                                                <TableCell className="text-xs text-gray-500">{index + 1}</TableCell>
                                                <TableCell className="font-medium text-sm">{driver.id}</TableCell>
                                                <TableCell className="text-sm">{driver.name}</TableCell>
                                                <TableCell className="text-sm">{driver.totalDeliveries}</TableCell>
                                                <TableCell className="text-sm text-green-600">{driver.completedDeliveries}</TableCell>
                                                <TableCell className="text-sm text-red-600">{driver.cancelledDeliveries}</TableCell>
                                                <TableCell className="text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <span>{driver.avgRating}</span>
                                                        <span className="text-yellow-500">★</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm">{driver.avgDeliveryTime}</TableCell>
                                                <TableCell className="text-sm">{driver.lastDelivery}</TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(driver.status)}>
                                                        {driver.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
