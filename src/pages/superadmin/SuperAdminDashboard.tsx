import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatsCard } from '@/components/ui/StatsCard';
import { RevenueChart } from '@/components/dashboard/charts/RevenueChart';
import { DeliveryStatusChart } from '@/components/dashboard/charts/DeliveryStatusChart';
import { FleetPerformanceChart } from '@/components/dashboard/charts/FleetPerformanceChart';
import { GeographicChart } from '@/components/dashboard/charts/GeographicChart';
import { DriverPerformanceChart } from '@/components/dashboard/charts/DriverPerformanceChart';
import { RecentDeliveriesTable } from '@/components/dashboard/tables/RecentDeliveriesTable';
import { PendingApprovalsTable } from '@/components/dashboard/tables/PendingApprovalsTable';
import { SystemAlertsTable } from '@/components/dashboard/tables/SystemAlertsTable';
import { FinancialTransactionsTable } from '@/components/dashboard/tables/FinancialTransactionsTable';
import {
    TrendingUp,
    Users,
    Shield,
    Activity,
    Filter,
    Download,
    Plus,
    Settings,
    BarChart3,
    DollarSign,
    Package,
    MapPin,
    Calendar,
    Bell,
    Database,
    Eye
} from 'lucide-react';

// SuperAdmin-specific mock data - Rwanda-based
const superAdminStats = [
    {
        title: "Total Revenue",
        value: "RWF 45.2M",
        change: "+12.5%",
        changeType: "increase" as const,
        icon: DollarSign,
        color: "green"
    },
    {
        title: "Active Admins",
        value: "8",
        change: "+2",
        changeType: "active" as const,
        icon: Shield,
        color: "blue"
    },
    {
        title: "System Users",
        value: "1,247",
        change: "+89",
        changeType: "increase" as const,
        icon: Users,
        color: "purple"
    },
    {
        title: "System Health",
        value: "98.5%",
        change: "+2.1%",
        changeType: "success" as const,
        icon: Activity,
        color: "green"
    }
];

// Mock data for charts - Rwanda-based
const revenueData = [
    { month: 'Jan', revenue: 3200000 },
    { month: 'Feb', revenue: 3800000 },
    { month: 'Mar', revenue: 4200000 },
    { month: 'Apr', revenue: 3900000 },
    { month: 'May', revenue: 4500000 },
    { month: 'Jun', revenue: 4800000 }
];

const deliveryStatusData = [
    { name: 'Delivered', value: 65, color: '#10B981' },
    { name: 'In Transit', value: 20, color: '#3B82F6' },
    { name: 'Pending', value: 10, color: '#F59E0B' },
    { name: 'Cancelled', value: 5, color: '#EF4444' }
];

const fleetPerformanceData = [
    { name: 'Toyota Dyna', deliveries: 45, efficiency: 92 },
    { name: 'Isuzu NPR', deliveries: 38, efficiency: 88 },
    { name: 'Mitsubishi Fuso', deliveries: 52, efficiency: 95 },
    { name: 'Hino 300', deliveries: 28, efficiency: 85 },
    { name: 'Nissan Atlas', deliveries: 33, efficiency: 90 }
];

const geographicData = [
    { route: 'Kigali → Butare', revenue: 420000 },
    { route: 'Kigali → Musanze', revenue: 380000 },
    { route: 'Kigali → Rubavu', revenue: 410000 },
    { route: 'Kigali → Karongi', revenue: 350000 },
    { route: 'Kigali → Gicumbi', revenue: 320000 }
];

const driverPerformanceData = [
    { name: 'Albert Flores', deliveries: 45, rating: 4.8 },
    { name: 'Mike Johnson', deliveries: 38, rating: 4.6 },
    { name: 'Alice Uwimana', deliveries: 52, rating: 4.9 },
    { name: 'David Gasana', deliveries: 28, rating: 4.4 },
    { name: 'Grace Uwase', deliveries: 33, rating: 4.7 }
];

// Mock data for tables - Rwanda-based
const recentDeliveries = [
    {
        id: 'DEL-001',
        client: 'Jean Baptiste',
        driver: 'Albert Flores',
        from: 'Kigali',
        to: 'Butare',
        status: 'delivered',
        income: 280000,
        date: '2024-01-15'
    },
    {
        id: 'DEL-002',
        client: 'Marie Claire',
        driver: 'Mike Johnson',
        from: 'Kigali',
        to: 'Musanze',
        status: 'in_transit',
        income: 320000,
        date: '2024-01-16'
    },
    {
        id: 'DEL-003',
        client: 'Pierre Ndayisaba',
        driver: 'Alice Uwimana',
        from: 'Kigali',
        to: 'Rubavu',
        status: 'pending',
        income: 250000,
        date: '2024-01-17'
    }
];

const pendingApprovals = [
    {
        id: 'APP-001',
        type: 'admin_registration',
        name: 'John Doe',
        email: 'john.doe@lovelycargo.rw',
        status: 'pending',
        date: '2024-01-15'
    },
    {
        id: 'APP-002',
        type: 'driver_registration',
        name: 'Sarah Mukamana',
        email: 'sarah.m@lovelycargo.rw',
        status: 'pending',
        date: '2024-01-16'
    },
    {
        id: 'APP-003',
        type: 'client_registration',
        name: 'Emmanuel Niyonsaba',
        email: 'emmanuel.n@lovelycargo.rw',
        status: 'pending',
        date: '2024-01-17'
    }
];

const systemAlerts = [
    {
        id: 'ALT-001',
        type: 'system_maintenance',
        message: 'Database backup scheduled for tonight',
        severity: 'info',
        date: '2024-01-15'
    },
    {
        id: 'ALT-002',
        type: 'security_alert',
        message: 'Multiple failed login attempts detected',
        severity: 'warning',
        date: '2024-01-16'
    },
    {
        id: 'ALT-003',
        type: 'performance_alert',
        message: 'High server load detected',
        severity: 'error',
        date: '2024-01-17'
    }
];

const financialTransactions = [
    {
        id: 'TXN-001',
        type: 'delivery_payment',
        amount: 280000,
        status: 'completed',
        date: '2024-01-15'
    },
    {
        id: 'TXN-002',
        type: 'subscription_payment',
        amount: 500000,
        status: 'pending',
        date: '2024-01-16'
    },
    {
        id: 'TXN-003',
        type: 'refund',
        amount: 150000,
        status: 'completed',
        date: '2024-01-17'
    }
];

export default function SuperAdminDashboard() {
    const handleViewAll = (type: string) => {
        console.log(`View all ${type}`);
        // TODO: Navigate to respective pages
    };

    const handleFilter = () => {
        console.log('Filter dashboard data');
    };

    const handleExportReport = () => {
        console.log('Export dashboard report');
    };

    const handleAddNew = () => {
        console.log('Add new item');
    };

    const handleSettings = () => {
        console.log('Open settings');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground font-heading">Super Admin Dashboard</h1>
                    <p className="text-muted-foreground">Monitor and manage all system operations across Rwanda</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleFilter}>
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                    </Button>
                    <Button variant="outline" onClick={handleExportReport}>
                        <Download className="w-4 h-4 mr-2" />
                        Export Report
                    </Button>
                    <Button variant="outline" onClick={handleAddNew}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add New
                    </Button>
                    <Button variant="outline" onClick={handleSettings}>
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <StatsCard stats={superAdminStats} />

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            System Revenue Trends
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RevenueChart />
                    </CardContent>
                </Card>

                {/* Delivery Status Chart */}
                <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Delivery Status Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DeliveryStatusChart />
                    </CardContent>
                </Card>

                {/* Fleet Performance Chart */}
                <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Fleet Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FleetPerformanceChart />
                    </CardContent>
                </Card>

                {/* Geographic Chart */}
                <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Top Routes by Revenue
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <GeographicChart />
                    </CardContent>
                </Card>
            </div>

            {/* Tables Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Deliveries */}
                <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Recent Deliveries
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RecentDeliveriesTable
                            onViewAll={() => handleViewAll('deliveries')}
                        />
                    </CardContent>
                </Card>

                {/* Pending Approvals */}
                <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Pending Approvals
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <PendingApprovalsTable
                            onViewAll={() => handleViewAll('approvals')}
                        />
                    </CardContent>
                </Card>

                {/* System Alerts */}
                <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            System Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SystemAlertsTable
                            onViewAll={() => handleViewAll('alerts')}
                        />
                    </CardContent>
                </Card>

                {/* Financial Transactions */}
                <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Financial Transactions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FinancialTransactionsTable
                            onViewAll={() => handleViewAll('transactions')}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
