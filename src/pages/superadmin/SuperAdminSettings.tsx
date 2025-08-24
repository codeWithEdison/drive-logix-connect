import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Modal, { ModalSize } from '@/components/modal/Modal';
import {
    Settings,
    DollarSign,
    Shield,
    Bell,
    Database,
    Save,
    Plus,
    Edit,
    Trash2,
    Users,
    Lock,
    Globe,
    Activity
} from 'lucide-react';

// Mock data for superadmin settings - Rwanda-based
const mockGlobalPricing = {
    baseRatePerKm: 2500, // RWF per km
    baseRatePerKg: 1200, // RWF per kg
    minimumCharge: 25000, // RWF
    fuelSurcharge: 0.15, // 15%
    insuranceRate: 0.05, // 5%
    platformFee: 0.10, // 10%
    taxRate: 0.18, // 18% VAT
};

const mockRBACRoles = [
    {
        id: '1',
        name: 'Super Admin',
        description: 'Full system access and control',
        permissions: ['all'],
        userCount: 1,
        isActive: true
    },
    {
        id: '2',
        name: 'Admin',
        description: 'Regional operations management',
        permissions: ['manage_users', 'manage_cargos', 'view_reports', 'manage_settings'],
        userCount: 8,
        isActive: true
    },
    {
        id: '3',
        name: 'Manager',
        description: 'Local operations oversight',
        permissions: ['view_reports', 'manage_cargos'],
        userCount: 15,
        isActive: true
    },
    {
        id: '4',
        name: 'Viewer',
        description: 'Read-only access to reports',
        permissions: ['view_reports'],
        userCount: 25,
        isActive: false
    }
];

const mockNotifications = [
    {
        id: '1',
        type: 'email',
        name: 'Delivery Status Updates',
        description: 'Send email notifications for delivery status changes',
        isActive: true,
        recipients: ['clients', 'drivers']
    },
    {
        id: '2',
        type: 'sms',
        name: 'Urgent Alerts',
        description: 'Send SMS for urgent delivery updates',
        isActive: true,
        recipients: ['drivers', 'admins']
    },
    {
        id: '3',
        type: 'email',
        name: 'System Reports',
        description: 'Daily system performance reports',
        isActive: false,
        recipients: ['admins']
    },
    {
        id: '4',
        type: 'sms',
        name: 'Payment Confirmations',
        description: 'SMS confirmation for successful payments',
        isActive: true,
        recipients: ['clients']
    }
];

const mockSystemConfig = {
    maintenanceMode: false,
    autoBackup: true,
    backupFrequency: 'daily',
    retentionDays: 30,
    maxFileSize: 10, // MB
    sessionTimeout: 30, // minutes
    maxLoginAttempts: 5,
    enableAuditLog: true,
    enableLocationTracking: true,
    enableRealTimeUpdates: true
};

export default function SuperAdminSettings() {
    const [globalPricing, setGlobalPricing] = useState(mockGlobalPricing);
    const [rbacRoles, setRbacRoles] = useState(mockRBACRoles);
    const [notifications, setNotifications] = useState(mockNotifications);
    const [systemConfig, setSystemConfig] = useState(mockSystemConfig);

    // Modal states
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [editingRole, setEditingRole] = useState<any>(null);
    const [editingNotification, setEditingNotification] = useState<any>(null);

    const handlePricingChange = (field: string, value: number) => {
        setGlobalPricing(prev => ({ ...prev, [field]: value }));
    };

    const handleSystemConfigChange = (field: string, value: any) => {
        setSystemConfig(prev => ({ ...prev, [field]: value }));
    };

    const handleRoleToggle = (id: string) => {
        setRbacRoles(prev =>
            prev.map(role =>
                role.id === id
                    ? { ...role, isActive: !role.isActive }
                    : role
            )
        );
    };

    const handleNotificationToggle = (id: string) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === id
                    ? { ...notification, isActive: !notification.isActive }
                    : notification
            )
        );
    };

    const handleSaveSettings = () => {
        console.log('Saving all settings:', {
            globalPricing,
            rbacRoles,
            notifications,
            systemConfig
        });
        // TODO: Implement API call to save settings
    };

    const openRoleModal = (role?: any) => {
        if (role) {
            setEditingRole(role);
        } else {
            setEditingRole(null);
        }
        setShowRoleModal(true);
    };

    const openNotificationModal = (notification?: any) => {
        if (notification) {
            setEditingNotification(notification);
        } else {
            setEditingNotification(null);
        }
        setShowNotificationModal(true);
    };

    const handleDeleteRole = (id: string) => {
        setRbacRoles(prev => prev.filter(role => role.id !== id));
    };

    const handleDeleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    };

    const getStatusColor = (status: boolean) => {
        return status ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">System Configuration</h1>
                    <p className="text-muted-foreground">Manage global settings and system policies</p>
                </div>
                <Button onClick={handleSaveSettings} className="bg-gradient-primary hover:bg-primary-hover">
                    <Save className="w-4 h-4 mr-2" />
                    Save All Changes
                </Button>
            </div>

            <Tabs defaultValue="pricing" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="pricing">Global Pricing</TabsTrigger>
                    <TabsTrigger value="rbac">Role Management</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="system">System Config</TabsTrigger>
                </TabsList>

                {/* Global Pricing Tab */}
                <TabsContent value="pricing" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Global Pricing Policies
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="ratePerKm">Base Rate per Kilometer (RWF)</Label>
                                    <Input
                                        id="ratePerKm"
                                        type="number"
                                        step="100"
                                        value={globalPricing.baseRatePerKm}
                                        onChange={(e) => handlePricingChange('baseRatePerKm', parseFloat(e.target.value))}
                                        placeholder="2500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ratePerKg">Base Rate per Kilogram (RWF)</Label>
                                    <Input
                                        id="ratePerKg"
                                        type="number"
                                        step="100"
                                        value={globalPricing.baseRatePerKg}
                                        onChange={(e) => handlePricingChange('baseRatePerKg', parseFloat(e.target.value))}
                                        placeholder="1200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="minimumCharge">Minimum Charge (RWF)</Label>
                                    <Input
                                        id="minimumCharge"
                                        type="number"
                                        step="1000"
                                        value={globalPricing.minimumCharge}
                                        onChange={(e) => handlePricingChange('minimumCharge', parseFloat(e.target.value))}
                                        placeholder="25000"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="platformFee">Platform Fee (%)</Label>
                                    <Input
                                        id="platformFee"
                                        type="number"
                                        step="0.01"
                                        value={globalPricing.platformFee * 100}
                                        onChange={(e) => handlePricingChange('platformFee', parseFloat(e.target.value) / 100)}
                                        placeholder="10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="taxRate">Tax Rate (VAT %)</Label>
                                    <Input
                                        id="taxRate"
                                        type="number"
                                        step="0.01"
                                        value={globalPricing.taxRate * 100}
                                        onChange={(e) => handlePricingChange('taxRate', parseFloat(e.target.value) / 100)}
                                        placeholder="18"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* RBAC Management Tab */}
                <TabsContent value="rbac" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Role-Based Access Control
                                </CardTitle>
                                <Button onClick={() => openRoleModal()}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Role
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Role Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Permissions</TableHead>
                                        <TableHead>Users</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rbacRoles.map((role) => (
                                        <TableRow key={role.id}>
                                            <TableCell className="font-medium">{role.name}</TableCell>
                                            <TableCell>{role.description}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {role.permissions.map((permission, index) => (
                                                        <Badge key={index} variant="outline" className="text-xs">
                                                            {permission}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>{role.userCount}</TableCell>
                                            <TableCell>
                                                <Switch
                                                    checked={role.isActive}
                                                    onCheckedChange={() => handleRoleToggle(role.id)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openRoleModal(role)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteRole(role.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="h-5 w-5" />
                                    Notification Settings
                                </CardTitle>
                                <Button onClick={() => openNotificationModal()}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Notification
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Recipients</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {notifications.map((notification) => (
                                        <TableRow key={notification.id}>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {notification.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-medium">{notification.name}</TableCell>
                                            <TableCell>{notification.description}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {notification.recipients.map((recipient, index) => (
                                                        <Badge key={index} variant="outline" className="text-xs">
                                                            {recipient}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Switch
                                                    checked={notification.isActive}
                                                    onCheckedChange={() => handleNotificationToggle(notification.id)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openNotificationModal(notification)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteNotification(notification.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* System Configuration Tab */}
                <TabsContent value="system" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                System Configuration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                                    <Switch
                                        id="maintenanceMode"
                                        checked={systemConfig.maintenanceMode}
                                        onCheckedChange={(checked) => handleSystemConfigChange('maintenanceMode', checked)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="autoBackup">Auto Backup</Label>
                                    <Switch
                                        id="autoBackup"
                                        checked={systemConfig.autoBackup}
                                        onCheckedChange={(checked) => handleSystemConfigChange('autoBackup', checked)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="backupFrequency">Backup Frequency</Label>
                                    <Select
                                        value={systemConfig.backupFrequency}
                                        onValueChange={(value) => handleSystemConfigChange('backupFrequency', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="hourly">Hourly</SelectItem>
                                            <SelectItem value="daily">Daily</SelectItem>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="retentionDays">Retention Days</Label>
                                    <Input
                                        id="retentionDays"
                                        type="number"
                                        value={systemConfig.retentionDays}
                                        onChange={(e) => handleSystemConfigChange('retentionDays', parseInt(e.target.value))}
                                        placeholder="30"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                                    <Input
                                        id="sessionTimeout"
                                        type="number"
                                        value={systemConfig.sessionTimeout}
                                        onChange={(e) => handleSystemConfigChange('sessionTimeout', parseInt(e.target.value))}
                                        placeholder="30"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                                    <Input
                                        id="maxLoginAttempts"
                                        type="number"
                                        value={systemConfig.maxLoginAttempts}
                                        onChange={(e) => handleSystemConfigChange('maxLoginAttempts', parseInt(e.target.value))}
                                        placeholder="5"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="enableAuditLog"
                                        checked={systemConfig.enableAuditLog}
                                        onCheckedChange={(checked) => handleSystemConfigChange('enableAuditLog', checked)}
                                    />
                                    <Label htmlFor="enableAuditLog">Enable Audit Logging</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="enableLocationTracking"
                                        checked={systemConfig.enableLocationTracking}
                                        onCheckedChange={(checked) => handleSystemConfigChange('enableLocationTracking', checked)}
                                    />
                                    <Label htmlFor="enableLocationTracking">Enable Location Tracking</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="enableRealTimeUpdates"
                                        checked={systemConfig.enableRealTimeUpdates}
                                        onCheckedChange={(checked) => handleSystemConfigChange('enableRealTimeUpdates', checked)}
                                    />
                                    <Label htmlFor="enableRealTimeUpdates">Enable Real-time Updates</Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Role Modal */}
            <Modal
                isOpen={showRoleModal}
                onClose={() => setShowRoleModal(false)}
                title={editingRole ? "Edit Role" : "Add New Role"}
                widthSizeClass={ModalSize.medium}
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Role Name</Label>
                        <Input
                            placeholder="e.g., Manager"
                            defaultValue={editingRole?.name || ''}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            placeholder="Describe the role's responsibilities..."
                            defaultValue={editingRole?.description || ''}
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Permissions</Label>
                        <div className="space-y-2">
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" defaultChecked />
                                <span className="text-sm">Manage Users</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" defaultChecked />
                                <span className="text-sm">Manage Cargos</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" defaultChecked />
                                <span className="text-sm">View Reports</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" />
                                <span className="text-sm">Manage Settings</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button className="flex-1">
                            {editingRole ? 'Update Role' : 'Create Role'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setShowRoleModal(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Notification Modal */}
            <Modal
                isOpen={showNotificationModal}
                onClose={() => setShowNotificationModal(false)}
                title={editingNotification ? "Edit Notification" : "Add New Notification"}
                widthSizeClass={ModalSize.medium}
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Notification Type</Label>
                        <Select defaultValue={editingNotification?.type || 'email'}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="sms">SMS</SelectItem>
                                <SelectItem value="push">Push Notification</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                            placeholder="e.g., Delivery Updates"
                            defaultValue={editingNotification?.name || ''}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            placeholder="Describe when this notification is sent..."
                            defaultValue={editingNotification?.description || ''}
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Recipients</Label>
                        <div className="space-y-2">
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" defaultChecked />
                                <span className="text-sm">Clients</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" defaultChecked />
                                <span className="text-sm">Drivers</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" />
                                <span className="text-sm">Admins</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button className="flex-1">
                            {editingNotification ? 'Update Notification' : 'Create Notification'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setShowNotificationModal(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
