import React, { useState } from 'react';
import ModernModel from '@/components/modal/ModernModel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    User,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Truck,
    Package,
    Star,
    Activity,
    Shield,
    Crown,
    UserCheck,
    Clock,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    XCircle,
    Navigation,
    DollarSign,
    Car,
    FileText,
    Settings
} from 'lucide-react';

// User interface with role-specific data
interface UserDetail {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'client' | 'driver' | 'admin' | 'super_admin';
    status: 'active' | 'inactive' | 'pending' | 'suspended';
    avatar?: string;
    region: string;
    joinDate: string;
    lastActive: string;

    // Role-specific data
    clientData?: {
        totalOrders: number;
        totalSpent: number;
        preferredRoutes: string[];
        paymentMethod: string;
        address: string;
    };

    driverData?: {
        assignedTruck: {
            id: string;
            model: string;
            plateNumber: string;
            capacity: string;
            status: string;
        };
        licenseNumber: string;
        experience: string;
        totalDeliveries: number;
        rating: number;
        earnings: number;
        currentLocation: string;
        availability: 'available' | 'busy' | 'offline';
    };

    adminData?: {
        permissions: string[];
        managedRegions: string[];
        totalUsersManaged: number;
        systemActions: number;
        lastLogin: string;
        accessLevel: 'full' | 'limited' | 'readonly';
    };

    superAdminData?: {
        systemAccess: string[];
        totalAdminsManaged: number;
        systemHealth: number;
        lastBackup: string;
        securityLevel: 'high' | 'medium' | 'low';
    };
}

interface UserDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserDetail;
}

export function UserDetailModal({ isOpen, onClose, user }: UserDetailModalProps) {
    const [activeTab, setActiveTab] = useState('overview');

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'client': return 'hsl(var(--primary))';
            case 'driver': return 'hsl(var(--success))';
            case 'admin': return 'hsl(var(--info))';
            case 'super_admin': return 'hsl(var(--accent))';
            default: return 'hsl(var(--primary))';
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'client': return User;
            case 'driver': return UserCheck;
            case 'admin': return Shield;
            case 'super_admin': return Crown;
            default: return User;
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            active: { label: 'Active', className: 'bg-green-100 text-green-600' },
            inactive: { label: 'Inactive', className: 'bg-gray-100 text-gray-600' },
            pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-600' },
            suspended: { label: 'Suspended', className: 'bg-red-100 text-red-600' }
        };

        const config = statusConfig[status as keyof typeof statusConfig];
        return config ? (
            <Badge className={config.className}>{config.label}</Badge>
        ) : (
            <Badge className="bg-gray-100 text-gray-600">{status}</Badge>
        );
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('rw-RW', {
            style: 'currency',
            currency: 'RWF',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const renderClientData = () => (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Order Statistics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">{user.clientData?.totalOrders}</p>
                            <p className="text-sm text-gray-600">Total Orders</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(user.clientData?.totalSpent || 0)}</p>
                            <p className="text-sm text-gray-600">Total Spent</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Address & Preferences
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-medium">{user.clientData?.address}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Payment Method</p>
                        <p className="font-medium">{user.clientData?.paymentMethod}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Preferred Routes</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {user.clientData?.preferredRoutes.map((route, index) => (
                                <Badge key={index} variant="outline">{route}</Badge>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderDriverData = () => (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        Assigned Vehicle
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Car className="h-8 w-8 text-blue-600" />
                            <div className="flex-1">
                                <p className="font-bold">{user.driverData?.assignedTruck.model}</p>
                                <p className="text-sm text-gray-600">Plate: {user.driverData?.assignedTruck.plateNumber}</p>
                                <p className="text-sm text-gray-600">Capacity: {user.driverData?.assignedTruck.capacity}</p>
                            </div>
                            <Badge className={user.driverData?.assignedTruck.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}>
                                {user.driverData?.assignedTruck.status}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Performance Metrics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">{user.driverData?.totalDeliveries}</p>
                            <p className="text-sm text-gray-600">Total Deliveries</p>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                            <div className="flex items-center justify-center gap-1">
                                <Star className="h-4 w-4 text-yellow-600 fill-current" />
                                <p className="text-2xl font-bold text-yellow-600">{user.driverData?.rating}</p>
                            </div>
                            <p className="text-sm text-gray-600">Rating</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(user.driverData?.earnings || 0)}</p>
                            <p className="text-sm text-gray-600">Total Earnings</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <p className="text-2xl font-bold text-purple-600">{user.driverData?.experience}</p>
                            <p className="text-sm text-gray-600">Experience</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Navigation className="h-5 w-5" />
                        Current Status
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">License Number</span>
                        <span className="font-medium">{user.driverData?.licenseNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Current Location</span>
                        <span className="font-medium">{user.driverData?.currentLocation}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Availability</span>
                        <Badge className={
                            user.driverData?.availability === 'available' ? 'bg-green-100 text-green-600' :
                                user.driverData?.availability === 'busy' ? 'bg-yellow-100 text-yellow-600' :
                                    'bg-gray-100 text-gray-600'
                        }>
                            {user.driverData?.availability}
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderAdminData = () => (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Administrative Access
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">{user.adminData?.totalUsersManaged}</p>
                            <p className="text-sm text-gray-600">Users Managed</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">{user.adminData?.systemActions}</p>
                            <p className="text-sm text-gray-600">System Actions</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Permissions & Access
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div>
                        <p className="text-sm text-gray-600">Access Level</p>
                        <Badge className={
                            user.adminData?.accessLevel === 'full' ? 'bg-green-100 text-green-600' :
                                user.adminData?.accessLevel === 'limited' ? 'bg-yellow-100 text-yellow-600' :
                                    'bg-gray-100 text-gray-600'
                        }>
                            {user.adminData?.accessLevel}
                        </Badge>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Managed Regions</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {user.adminData?.managedRegions.map((region, index) => (
                                <Badge key={index} variant="outline">{region}</Badge>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Permissions</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {user.adminData?.permissions.map((permission, index) => (
                                <Badge key={index} variant="outline">{permission}</Badge>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderSuperAdminData = () => (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Crown className="h-5 w-5" />
                        System Overview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <p className="text-2xl font-bold text-purple-600">{user.superAdminData?.totalAdminsManaged}</p>
                            <p className="text-sm text-gray-600">Admins Managed</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">{user.superAdminData?.systemHealth}%</p>
                            <p className="text-sm text-gray-600">System Health</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        System Access & Security
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div>
                        <p className="text-sm text-gray-600">Security Level</p>
                        <Badge className={
                            user.superAdminData?.securityLevel === 'high' ? 'bg-green-100 text-green-600' :
                                user.superAdminData?.securityLevel === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                    'bg-red-100 text-red-600'
                        }>
                            {user.superAdminData?.securityLevel}
                        </Badge>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">System Access</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {user.superAdminData?.systemAccess.map((access, index) => (
                                <Badge key={index} variant="outline">{access}</Badge>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Last Backup</p>
                        <p className="font-medium">{user.superAdminData?.lastBackup}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderRoleSpecificData = () => {
        switch (user.role) {
            case 'client':
                return renderClientData();
            case 'driver':
                return renderDriverData();
            case 'admin':
                return renderAdminData();
            case 'super_admin':
                return renderSuperAdminData();
            default:
                return null;
        }
    };

    const RoleIcon = getRoleIcon(user.role);

    return (
        <ModernModel
            isOpen={isOpen}
            onClose={onClose}
            title="User Details"
        >
            <div className="space-y-6">
                {/* User Header */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarFallback
                                    style={{ backgroundColor: getRoleColor(user.role) }}
                                    className="text-white font-bold text-lg"
                                >
                                    {user.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                                    {getStatusBadge(user.status)}
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <RoleIcon className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-600 capitalize">
                                        {user.role.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <Mail className="h-4 w-4" />
                                        {user.email}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Phone className="h-4 w-4" />
                                        {user.phone}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="activity">Activity</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Basic Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">User ID</span>
                                    <span className="font-medium">{user.id}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Region</span>
                                    <span className="font-medium">{user.region}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Join Date</span>
                                    <span className="font-medium">{user.joinDate}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Last Active</span>
                                    <span className="font-medium">{user.lastActive}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="details" className="space-y-4">
                        {renderRoleSpecificData()}
                    </TabsContent>

                    <TabsContent value="activity" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Recent Activity
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">User logged in</p>
                                            <p className="text-xs text-gray-500">2 minutes ago</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                        <FileText className="h-5 w-5 text-blue-600" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Profile updated</p>
                                            <p className="text-xs text-gray-500">1 hour ago</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Password changed</p>
                                            <p className="text-xs text-gray-500">1 day ago</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <Button variant="outline" className="flex-1">
                        <Settings className="h-4 w-4 mr-2" />
                        Edit User
                    </Button>
                    <Button variant="outline" className="flex-1">
                        <FileText className="h-4 w-4 mr-2" />
                        View Reports
                    </Button>
                </div>
            </div>
        </ModernModel>
    );
}
