import React, { useState } from 'react';
import { CustomTabs } from '@/components/ui/CustomTabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Activity,
    Shield,
    Eye,
    Download,
    Filter,
    Search,
    Clock,
    MapPin,
    User,
    AlertTriangle,
    Info,
    CheckCircle,
    XCircle,
    Database,
    Server
} from 'lucide-react';

// Mock data for superadmin logs - Rwanda-based
const mockActivityLogs = [
    {
        id: '1',
        timestamp: '2024-01-15 14:30:25',
        user: 'John Doe',
        action: 'user_login',
        description: 'User logged in successfully',
        ipAddress: '192.168.1.100',
        location: 'Kigali, Rwanda',
        severity: 'info',
        status: 'success'
    },
    {
        id: '2',
        timestamp: '2024-01-15 14:25:10',
        user: 'Sarah Mukamana',
        action: 'cargo_created',
        description: 'Created new cargo delivery #CRG-2024-001',
        ipAddress: '192.168.1.101',
        location: 'Butare, Rwanda',
        severity: 'info',
        status: 'success'
    },
    {
        id: '3',
        timestamp: '2024-01-15 14:20:45',
        user: 'Pierre Ndayisaba',
        action: 'user_permission_changed',
        description: 'Updated user permissions for driver Albert Flores',
        ipAddress: '192.168.1.102',
        location: 'Musanze, Rwanda',
        severity: 'warning',
        status: 'success'
    },
    {
        id: '4',
        timestamp: '2024-01-15 14:15:30',
        user: 'Unknown',
        action: 'failed_login',
        description: 'Failed login attempt for admin account',
        ipAddress: '203.0.113.45',
        location: 'Unknown',
        severity: 'error',
        status: 'failed'
    },
    {
        id: '5',
        timestamp: '2024-01-15 14:10:15',
        user: 'System',
        action: 'backup_completed',
        description: 'Daily database backup completed successfully',
        ipAddress: '127.0.0.1',
        location: 'Server',
        severity: 'info',
        status: 'success'
    }
];

const mockLoginLogs = [
    {
        id: '1',
        timestamp: '2024-01-15 14:30:25',
        user: 'john.doe@lovelycargo.rw',
        ipAddress: '192.168.1.100',
        location: 'Kigali, Rwanda',
        device: 'Chrome 120.0.0.0',
        status: 'success',
        sessionDuration: '2h 15m'
    },
    {
        id: '2',
        timestamp: '2024-01-15 14:25:10',
        user: 'sarah.m@lovelycargo.rw',
        ipAddress: '192.168.1.101',
        location: 'Butare, Rwanda',
        device: 'Firefox 121.0.0.0',
        status: 'success',
        sessionDuration: '1h 45m'
    },
    {
        id: '3',
        timestamp: '2024-01-15 14:20:45',
        user: 'pierre.n@lovelycargo.rw',
        ipAddress: '192.168.1.102',
        location: 'Musanze, Rwanda',
        device: 'Safari 17.2.0',
        status: 'success',
        sessionDuration: '3h 20m'
    },
    {
        id: '4',
        timestamp: '2024-01-15 14:15:30',
        user: 'admin@lovelycargo.rw',
        ipAddress: '203.0.113.45',
        location: 'Unknown',
        device: 'Unknown',
        status: 'failed',
        sessionDuration: '0m'
    },
    {
        id: '5',
        timestamp: '2024-01-15 14:10:15',
        user: 'albert.flores@lovelycargo.rw',
        ipAddress: '192.168.1.103',
        location: 'Kigali, Rwanda',
        device: 'Mobile Safari',
        status: 'success',
        sessionDuration: '45m'
    }
];

const mockSystemLogs = [
    {
        id: '1',
        timestamp: '2024-01-15 14:30:25',
        component: 'Database',
        event: 'backup_completed',
        description: 'Daily backup completed successfully',
        severity: 'info',
        details: 'Backup size: 2.5GB, Duration: 15 minutes'
    },
    {
        id: '2',
        timestamp: '2024-01-15 14:25:10',
        component: 'API Gateway',
        event: 'high_traffic',
        description: 'High traffic detected on delivery endpoints',
        severity: 'warning',
        details: 'Requests per minute: 150 (normal: 50)'
    },
    {
        id: '3',
        timestamp: '2024-01-15 14:20:45',
        component: 'Email Service',
        event: 'service_restart',
        description: 'Email service restarted due to memory issues',
        severity: 'warning',
        details: 'Memory usage: 85% before restart'
    },
    {
        id: '4',
        timestamp: '2024-01-15 14:15:30',
        component: 'Payment Gateway',
        event: 'transaction_failed',
        description: 'Payment processing failed for transaction #TXN-001',
        severity: 'error',
        details: 'Error: Insufficient funds'
    },
    {
        id: '5',
        timestamp: '2024-01-15 14:10:15',
        component: 'Load Balancer',
        event: 'server_health_check',
        description: 'All servers responding normally',
        severity: 'info',
        details: 'Response time: 45ms average'
    }
];

const mockSecurityLogs = [
    {
        id: '1',
        timestamp: '2024-01-15 14:30:25',
        event: 'failed_login_attempt',
        user: 'admin@lovelycargo.rw',
        ipAddress: '203.0.113.45',
        location: 'Unknown',
        severity: 'high',
        description: 'Multiple failed login attempts detected',
        action: 'account_locked'
    },
    {
        id: '2',
        timestamp: '2024-01-15 14:25:10',
        event: 'permission_violation',
        user: 'john.doe@lovelycargo.rw',
        ipAddress: '192.168.1.100',
        location: 'Kigali, Rwanda',
        severity: 'medium',
        description: 'Attempted to access unauthorized resource',
        action: 'access_denied'
    },
    {
        id: '3',
        timestamp: '2024-01-15 14:20:45',
        event: 'suspicious_activity',
        user: 'unknown@external.com',
        ipAddress: '198.51.100.123',
        location: 'Unknown',
        severity: 'high',
        description: 'Suspicious API requests detected',
        action: 'ip_blocked'
    },
    {
        id: '4',
        timestamp: '2024-01-15 14:15:30',
        event: 'password_change',
        user: 'sarah.m@lovelycargo.rw',
        ipAddress: '192.168.1.101',
        location: 'Butare, Rwanda',
        severity: 'low',
        description: 'Password changed successfully',
        action: 'logged'
    },
    {
        id: '5',
        timestamp: '2024-01-15 14:10:15',
        event: 'session_timeout',
        user: 'pierre.n@lovelycargo.rw',
        ipAddress: '192.168.1.102',
        location: 'Musanze, Rwanda',
        severity: 'low',
        description: 'Session expired due to inactivity',
        action: 'logged'
    }
];

export default function SuperAdminLogs() {
    const [activeTab, setActiveTab] = useState('activity');
    const [searchTerm, setSearchTerm] = useState('');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'error': return 'bg-red-100 text-red-600';
            case 'warning': return 'bg-yellow-100 text-yellow-600';
            case 'info': return 'bg-blue-100 text-blue-600';
            case 'success': return 'bg-green-100 text-green-600';
            case 'high': return 'bg-red-100 text-red-600';
            case 'medium': return 'bg-orange-100 text-orange-600';
            case 'low': return 'bg-gray-100 text-gray-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success': return 'bg-green-100 text-green-600';
            case 'failed': return 'bg-red-100 text-red-600';
            case 'pending': return 'bg-yellow-100 text-yellow-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'error':
            case 'high':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'warning':
            case 'medium':
                return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case 'info':
            case 'low':
                return <Info className="h-4 w-4 text-blue-500" />;
            case 'success':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            default:
                return <Info className="h-4 w-4 text-gray-500" />;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('rw-RW', {
            style: 'currency',
            currency: 'RWF',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const tabs = [
        {
            value: 'activity',
            label: 'Activity Logs',
            count: mockActivityLogs.length
        },
        {
            value: 'login',
            label: 'Login Logs',
            count: mockLoginLogs.length
        },
        {
            value: 'system',
            label: 'System Logs',
            count: mockSystemLogs.length
        },
        {
            value: 'security',
            label: 'Security Logs',
            count: mockSecurityLogs.length
        }
    ];

    const handleExportLogs = (type: string) => {
        console.log(`Exporting ${type} logs`);
        // TODO: Implement export functionality
    };

    const handleFilterLogs = () => {
        console.log('Filtering logs with:', { searchTerm, severityFilter, statusFilter });
        // TODO: Implement filtering
    };

    const filteredActivityLogs = mockActivityLogs.filter(log =>
        (severityFilter === 'all' || log.severity === severityFilter) &&
        (statusFilter === 'all' || log.status === statusFilter) &&
        (log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const filteredLoginLogs = mockLoginLogs.filter(log =>
        (statusFilter === 'all' || log.status === statusFilter) &&
        (log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const filteredSystemLogs = mockSystemLogs.filter(log =>
        (severityFilter === 'all' || log.severity === severityFilter) &&
        (log.component.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const filteredSecurityLogs = mockSecurityLogs.filter(log =>
        (severityFilter === 'all' || log.severity === severityFilter) &&
        (log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground font-heading">System Logs</h1>
                    <p className="text-muted-foreground">Monitor system activity and security events</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleFilterLogs}>
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                    </Button>
                    <Button variant="outline" onClick={() => handleExportLogs(activeTab)}>
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Search and Filters */}
            <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Search logs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={severityFilter} onValueChange={setSeverityFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Severity" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Severities</SelectItem>
                                <SelectItem value="error">Error</SelectItem>
                                <SelectItem value="warning">Warning</SelectItem>
                                <SelectItem value="info">Info</SelectItem>
                                <SelectItem value="success">Success</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="success">Success</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={handleFilterLogs} className="w-full">
                            Apply Filters
                        </Button>
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
            {activeTab === 'activity' && (
                <div className="mt-6">
                    <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Activity Logs
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-xs font-medium text-gray-600">#</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Timestamp</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">User</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Action</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Description</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">IP Address</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Location</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Severity</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredActivityLogs.map((log, index) => (
                                            <TableRow key={log.id}>
                                                <TableCell className="text-xs text-gray-500">{index + 1}</TableCell>
                                                <TableCell className="text-sm">{log.timestamp}</TableCell>
                                                <TableCell className="font-medium text-sm">{log.user}</TableCell>
                                                <TableCell className="text-sm">{log.action}</TableCell>
                                                <TableCell className="text-sm">{log.description}</TableCell>
                                                <TableCell className="text-sm">{log.ipAddress}</TableCell>
                                                <TableCell className="text-sm">{log.location}</TableCell>
                                                <TableCell>
                                                    <Badge className={getSeverityColor(log.severity)}>
                                                        {getSeverityIcon(log.severity)}
                                                        <span className="ml-1">{log.severity}</span>
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(log.status)}>
                                                        {log.status}
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

            {activeTab === 'login' && (
                <div className="mt-6">
                    <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Login Logs
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-xs font-medium text-gray-600">#</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Timestamp</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">User</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">IP Address</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Location</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Device</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Status</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Session Duration</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredLoginLogs.map((log, index) => (
                                            <TableRow key={log.id}>
                                                <TableCell className="text-xs text-gray-500">{index + 1}</TableCell>
                                                <TableCell className="text-sm">{log.timestamp}</TableCell>
                                                <TableCell className="font-medium text-sm">{log.user}</TableCell>
                                                <TableCell className="text-sm">{log.ipAddress}</TableCell>
                                                <TableCell className="text-sm">{log.location}</TableCell>
                                                <TableCell className="text-sm">{log.device}</TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(log.status)}>
                                                        {log.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm">{log.sessionDuration}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === 'system' && (
                <div className="mt-6">
                    <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Server className="h-5 w-5" />
                                System Logs
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-xs font-medium text-gray-600">#</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Timestamp</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Component</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Event</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Description</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Severity</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Details</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredSystemLogs.map((log, index) => (
                                            <TableRow key={log.id}>
                                                <TableCell className="text-xs text-gray-500">{index + 1}</TableCell>
                                                <TableCell className="text-sm">{log.timestamp}</TableCell>
                                                <TableCell className="font-medium text-sm">{log.component}</TableCell>
                                                <TableCell className="text-sm">{log.event}</TableCell>
                                                <TableCell className="text-sm">{log.description}</TableCell>
                                                <TableCell>
                                                    <Badge className={getSeverityColor(log.severity)}>
                                                        {getSeverityIcon(log.severity)}
                                                        <span className="ml-1">{log.severity}</span>
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm">{log.details}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === 'security' && (
                <div className="mt-6">
                    <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Security Logs
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-xs font-medium text-gray-600">#</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Timestamp</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Event</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">User</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">IP Address</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Location</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Severity</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Description</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredSecurityLogs.map((log, index) => (
                                            <TableRow key={log.id}>
                                                <TableCell className="text-xs text-gray-500">{index + 1}</TableCell>
                                                <TableCell className="text-sm">{log.timestamp}</TableCell>
                                                <TableCell className="font-medium text-sm">{log.event}</TableCell>
                                                <TableCell className="text-sm">{log.user}</TableCell>
                                                <TableCell className="text-sm">{log.ipAddress}</TableCell>
                                                <TableCell className="text-sm">{log.location}</TableCell>
                                                <TableCell>
                                                    <Badge className={getSeverityColor(log.severity)}>
                                                        {getSeverityIcon(log.severity)}
                                                        <span className="ml-1">{log.severity}</span>
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm">{log.description}</TableCell>
                                                <TableCell className="text-sm">{log.action}</TableCell>
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
