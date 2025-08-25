import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatsCard } from '@/components/ui/StatsCard';
import { RevenueChart } from '@/components/dashboard/charts/RevenueChart';
import { UsageTrendsChart } from '@/components/dashboard/charts/UsageTrendsChart';
import { AdminPerformanceChart } from '@/components/dashboard/charts/AdminPerformanceChart';
import { UsersDistributionChart } from '@/components/dashboard/charts/UsersDistributionChart';
import { PendingApprovalsTable } from '@/components/dashboard/tables/PendingApprovalsTable';
import { SystemAlertsTable } from '@/components/dashboard/tables/SystemAlertsTable';
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

// Mock data for tables - Rwanda-based
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

const recentLogs = [
    {
        id: 'LOG-001',
        type: 'user_login',
        user: 'john.doe@lovelycargo.rw',
        action: 'User logged in',
        ip: '192.168.1.100',
        timestamp: '2024-01-15 14:30:25'
    },
    {
        id: 'LOG-002',
        type: 'system_config',
        user: 'admin@lovelycargo.rw',
        action: 'Updated system settings',
        ip: '192.168.1.101',
        timestamp: '2024-01-15 15:45:12'
    },
    {
        id: 'LOG-003',
        type: 'data_export',
        user: 'superadmin@lovelycargo.rw',
        action: 'Exported financial report',
        ip: '192.168.1.102',
        timestamp: '2024-01-15 16:20:33'
    },
    {
        id: 'LOG-004',
        type: 'user_creation',
        user: 'admin@lovelycargo.rw',
        action: 'Created new driver account',
        ip: '192.168.1.101',
        timestamp: '2024-01-15 17:10:45'
    },
    {
        id: 'LOG-005',
        type: 'security_alert',
        user: 'system',
        action: 'Failed login attempt detected',
        ip: '192.168.1.105',
        timestamp: '2024-01-15 18:05:18'
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
                            Revenue Trends
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RevenueChart />
                    </CardContent>
                </Card>

                {/* Usage Trends Chart */}
                <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Usage Trends
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <UsageTrendsChart />
                    </CardContent>
                </Card>

                {/* Admin Performance Chart */}
                <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Admin Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AdminPerformanceChart />
                    </CardContent>
                </Card>

                {/* Users Distribution Chart */}
                <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Users Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <UsersDistributionChart />
                    </CardContent>
                </Card>
            </div>

            {/* Tables Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

                {/* Recent Logs */}
                <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            Recent Logs
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentLogs.map((log) => (
                                <div key={log.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-medium text-gray-900">{log.user}</span>
                                            <Badge variant="outline" className="text-xs">
                                                {log.type.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600">{log.action}</p>
                                        <p className="text-xs text-gray-500 mt-1">IP: {log.ip}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">{log.timestamp}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <Button variant="outline" size="sm" className="w-full" onClick={() => handleViewAll('logs')}>
                                View All Logs
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
