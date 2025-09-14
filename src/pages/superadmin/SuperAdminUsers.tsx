import React, { useState } from 'react';
import { CustomTabs } from '@/components/ui/CustomTabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DriverTable } from '@/components/ui/DriverTable';
import { ClientTable } from '@/components/ui/ClientTable';
import { DriverDetailModal } from '@/components/ui/DriverDetailModal';
import { ClientDetailModal } from '@/components/ui/ClientDetailModal';
import { UserDetailModal } from '@/components/ui/UserDetailModal';
import Modal, { ModalSize } from '@/components/modal/Modal';
import ModernModel from '@/components/modal/ModernModel';
import { 
    useUserManagement, 
    useUpdateUserStatus,
    useCreateAdmin,
    useCreateDriver,
    useCreateClient
} from '@/lib/api/hooks/utilityHooks';
import { useAdminClients } from '@/lib/api/hooks/clientHooks';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { User, Driver, Client, UserRole } from '@/types/shared';
import {
    Users,
    Shield,
    UserCheck,
    UserX,
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Loader2
} from 'lucide-react';

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('rw-RW', {
    style: 'currency',
    currency: 'RWF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function SuperAdminUsers() {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('admins');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [selectedAdmin, setSelectedAdmin] = useState<User | null>(null);
    const [showDriverModal, setShowDriverModal] = useState(false);
    const [showClientModal, setShowClientModal] = useState(false);
    const [showAdminDetailModal, setShowAdminDetailModal] = useState(false);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<User | null>(null);
    
    // New modern modals
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [selectedUserType, setSelectedUserType] = useState<'admin' | 'driver' | 'client'>('admin');
    const [editingUser, setEditingUser] = useState<any>(null);
    
    // Form state
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        preferred_language: 'en' as 'en' | 'rw' | 'fr',
        // Client fields
        company_name: '',
        business_type: 'individual' as 'individual' | 'corporate' | 'government',
        tax_id: '',
        address: '',
        city: '',
        country: '',
        postal_code: '',
        contact_person: '',
        credit_limit: 0,
        payment_terms: 30,
        // Driver fields
        license_number: '',
        license_expiry: '',
        license_type: 'B' as 'A' | 'B' | 'C' | 'D' | 'E',
        date_of_birth: '',
        emergency_contact: '',
        emergency_phone: '',
        blood_type: '',
        medical_certificate_expiry: '',
        // General fields
        is_active: true
    });

    // Fetch data from backend
    const { 
        data: adminsData, 
        isLoading: isAdminsLoading, 
        error: adminsError 
    } = useUserManagement({ 
        role: UserRole.ADMIN,
        limit: 50 
    });

    const { 
        data: driversData, 
        isLoading: isDriversLoading, 
        error: driversError 
    } = useUserManagement({ 
        role: UserRole.DRIVER,
        limit: 50 
    });

    const { 
        data: clientsData, 
        isLoading: isClientsLoading, 
        error: clientsError 
    } = useAdminClients({ 
        limit: 50 
    });

    const updateUserStatusMutation = useUpdateUserStatus();
    
    // Create user mutations
    const createAdminMutation = useCreateAdmin();
    const createDriverMutation = useCreateDriver();
    const createClientMutation = useCreateClient();

    // Process data from API responses
    const admins = adminsData || [];
    // Transform drivers data to include nested driver properties
    const drivers = driversData ? driversData.map((driver: any) => ({
        ...driver,
        // Include nested driver properties if they exist
        rating: driver.driver?.rating || 0,
        total_deliveries: driver.driver?.total_deliveries || 0,
        total_distance_km: driver.driver?.total_distance_km || 0,
        license_number: driver.driver?.license_number || '',
        license_expiry: driver.driver?.license_expiry || '',
        license_type: driver.driver?.license_type || '',
        date_of_birth: driver.driver?.date_of_birth || '',
        emergency_contact: driver.driver?.emergency_contact || '',
        emergency_phone: driver.driver?.emergency_phone || '',
        blood_type: driver.driver?.blood_type || '',
        medical_certificate_expiry: driver.driver?.medical_certificate_expiry || '',
        status: driver.driver?.status || 'unavailable',
        location: driver.driver?.location || '',
        registeredDate: driver.created_at,
        lastActive: driver.last_login || driver.updated_at,
        avatar_url: driver.avatar_url,
        is_verified: driver.is_verified
    })) : [];
    // Transform clients data to match expected structure
    const clients = clientsData ? clientsData.map((item: any) => ({
        id: item.user.id,
        full_name: item.user.full_name,
        email: item.user.email,
        phone: item.user.phone,
        preferred_language: item.user.preferred_language,
        is_active: item.user.is_active,
        is_verified: item.user.is_verified,
        created_at: item.user.created_at,
        updated_at: item.user.updated_at,
        last_login: item.user.last_login,
        // Client-specific data
        company_name: item.client.company_name,
        business_type: item.client.business_type,
        tax_id: item.client.tax_id,
        address: item.client.address,
        city: item.client.city,
        country: item.client.country,
        postal_code: item.client.postal_code,
        contact_person: item.client.contact_person,
        credit_limit: item.client.credit_limit,
        payment_terms: item.client.payment_terms,
        totalCargos: item.client.total_cargo || 0,
        location: item.client.address || '',
        registeredDate: item.user.created_at,
        lastActive: item.user.last_login || item.user.updated_at,
        avatar_url: item.user.avatar_url,
        status: (item.user.is_active ? 'active' : 'inactive') as 'active' | 'pending' | 'inactive' | 'suspended'
    })) : [];

    const handleViewDriver = (driver: any) => {
        setSelectedDriver(driver);
        setShowDriverModal(true);
    };

    const handleViewClient = (client: any) => {
        setSelectedClient(client);
        setShowClientModal(true);
    };

    const handleViewAdmin = (admin: User) => {
        setSelectedAdmin(admin);
        setShowAdminDetailModal(true);
    };

    const handleEditAdmin = (admin: User) => {
        setEditingAdmin(admin);
        setShowAdminModal(true);
    };

    // New modern modal handlers
    const handleAddUser = (userType: 'admin' | 'driver' | 'client') => {
        setSelectedUserType(userType);
        setEditingUser(null);
        setShowAddUserModal(true);
    };

    const handleEditUser = (user: any, userType: 'admin' | 'driver' | 'client') => {
        setSelectedUserType(userType);
        setEditingUser(user);
        setFormData({
            full_name: user.full_name || '',
            email: user.email || '',
            phone: user.phone || '',
            password: '',
            preferred_language: user.preferred_language || 'en',
            // Client fields
            company_name: user.company_name || '',
            business_type: user.business_type || 'individual',
            tax_id: user.tax_id || '',
            address: user.address || '',
            city: user.city || '',
            country: user.country || '',
            postal_code: user.postal_code || '',
            contact_person: user.contact_person || '',
            credit_limit: user.credit_limit || 0,
            payment_terms: user.payment_terms || 30,
            // Driver fields
            license_number: user.license_number || '',
            license_expiry: user.license_expiry || '',
            license_type: user.license_type || 'B',
            date_of_birth: user.date_of_birth || '',
            emergency_contact: user.emergency_contact || '',
            emergency_phone: user.emergency_phone || '',
            blood_type: user.blood_type || '',
            medical_certificate_expiry: user.medical_certificate_expiry || '',
            // General fields
            is_active: user.is_active || true
        });
        setShowEditUserModal(true);
    };

    const handleFormChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const resetForm = () => {
        setFormData({
            full_name: '',
            email: '',
            phone: '',
            password: '',
            preferred_language: 'en',
            // Client fields
            company_name: '',
            business_type: 'individual',
            tax_id: '',
            address: '',
            city: '',
            country: '',
            postal_code: '',
            contact_person: '',
            credit_limit: 0,
            payment_terms: 30,
            // Driver fields
            license_number: '',
            license_expiry: '',
            license_type: 'B',
            date_of_birth: '',
            emergency_contact: '',
            emergency_phone: '',
            blood_type: '',
            medical_certificate_expiry: '',
            // General fields
            is_active: true
        });
    };

    const handleCreateUser = async () => {
        try {
            const baseData = {
                full_name: formData.full_name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                preferred_language: formData.preferred_language
            };

            let result;
            if (selectedUserType === 'admin') {
                result = await createAdminMutation.mutateAsync(baseData);
            } else if (selectedUserType === 'driver') {
                result = await createDriverMutation.mutateAsync({
                    ...baseData,
                    license_number: formData.license_number,
                    license_expiry: formData.license_expiry,
                    license_type: formData.license_type,
                    date_of_birth: formData.date_of_birth,
                    emergency_contact: formData.emergency_contact,
                    emergency_phone: formData.emergency_phone,
                    blood_type: formData.blood_type,
                    medical_certificate_expiry: formData.medical_certificate_expiry
                });
            } else if (selectedUserType === 'client') {
                result = await createClientMutation.mutateAsync({
                    ...baseData,
                    company_name: formData.company_name,
                    business_type: formData.business_type,
                    tax_id: formData.tax_id,
                    address: formData.address,
                    city: formData.city,
                    country: formData.country,
                    postal_code: formData.postal_code,
                    contact_person: formData.contact_person,
                    credit_limit: formData.credit_limit,
                    payment_terms: formData.payment_terms
                });
            }

            // Show success toast
            toast({
                title: t('userManagement.userCreated'),
                description: t('userManagement.userCreatedSuccess', { 
                    type: t(`userManagement.${selectedUserType}s`),
                    name: formData.full_name 
                }),
            });

            setShowAddUserModal(false);
            resetForm();
        } catch (error: any) {
            console.error('Error creating user:', error);
            
            // Show error toast
            toast({
                title: t('userManagement.createUserError'),
                description: error?.response?.data?.message || t('userManagement.createUserErrorDesc'),
                variant: "destructive",
            });
        }
    };

    const handleUpdateUser = async () => {
        if (!editingUser) return;

        try {
            await updateUserStatusMutation.mutateAsync({
                id: editingUser.id,
                data: {
                    is_active: formData.is_active,
                    reason: formData.is_active ? 'Account activated' : 'Account deactivated'
                }
            });

            // Show success toast
            toast({
                title: t('userManagement.userStatusUpdated'),
                description: t('userManagement.userStatusUpdatedSuccess', { 
                    name: editingUser.full_name,
                    status: formData.is_active ? t('common.active') : t('common.inactive')
                }),
            });

            setShowEditUserModal(false);
            resetForm();
        } catch (error: any) {
            console.error('Error updating user status:', error);
            
            // Show error toast
            toast({
                title: t('userManagement.updateUserError'),
                description: error?.response?.data?.message || t('userManagement.updateUserErrorDesc'),
                variant: "destructive",
            });
        }
    };

    const handleDeleteAdmin = (id: string) => {
        console.log('Delete admin:', id);
        // TODO: Implement delete functionality
    };

    const handleUpdateUserStatus = async (userId: string, isActive: boolean) => {
        try {
            await updateUserStatusMutation.mutateAsync({
                id: userId,
                data: { 
                    is_active: isActive,
                    reason: isActive ? 'User activated by super admin' : 'User deactivated by super admin'
                }
            });

            // Show success toast
            toast({
                title: t('userManagement.userStatusUpdated'),
                description: t('userManagement.userStatusUpdatedSuccess', { 
                    name: 'User',
                    status: isActive ? t('common.active') : t('common.inactive')
                }),
            });
        } catch (error: any) {
            console.error('Error updating user status:', error);
            
            // Show error toast
            toast({
                title: t('userManagement.updateUserError'),
                description: error?.response?.data?.message || t('userManagement.updateUserErrorDesc'),
                variant: "destructive",
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-600';
            case 'inactive': return 'bg-red-100 text-red-600';
            case 'pending': return 'bg-yellow-100 text-yellow-600';
            default: return 'bg-gray-100 text-gray-600';
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
            value: 'admins',
            label: t('userManagement.admins'),
            count: admins.length
        },
        {
            value: 'drivers',
            label: t('userManagement.drivers'),
            count: drivers.length
        },
        {
            value: 'clients',
            label: t('userManagement.clients'),
            count: clients.length
        }
    ];

    // Filter data based on search term
    const filteredAdmins = admins.filter((admin: User) =>
        (admin.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (admin.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const filteredDrivers = drivers.filter((driver: User) =>
        (driver.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (driver.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const filteredClients = clients.filter((client: any) =>
        (client.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (client.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (client.company_name && client.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground font-heading">
                        {t('userManagement.title')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('userManagement.subtitle')}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Filter className="w-4 h-4 mr-2" />
                        {t('common.filters')}
                    </Button>
                    <Button onClick={() => handleAddUser('admin')}>
                        <Plus className="w-4 h-4 mr-2" />
                        {t('userManagement.addUser')}
                    </Button>
                </div>
            </div>

            {/* Search */}
            <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                <CardContent className="p-6">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder={t('userManagement.searchPlaceholder')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
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
            {activeTab === 'admins' && (
                <div className="mt-6">
                    <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                {t('userManagement.adminUsers')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isAdminsLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <span className="ml-2 text-muted-foreground">
                                        {t('common.loading')}...
                                    </span>
                                </div>
                            ) : adminsError ? (
                                <div className="text-center py-8">
                                    <p className="text-red-600">
                                        {t('common.error')}: {adminsError.message || t('common.loadError')}
                                    </p>
                                </div>
                            ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-xs font-medium text-gray-600">#</TableHead>
                                                <TableHead className="text-xs font-medium text-gray-600">
                                                    {t('common.name')}
                                                </TableHead>
                                                <TableHead className="text-xs font-medium text-gray-600">
                                                    {t('common.email')}
                                                </TableHead>
                                                <TableHead className="text-xs font-medium text-gray-600">
                                                    {t('common.phone')}
                                                </TableHead>
                                                <TableHead className="text-xs font-medium text-gray-600">
                                                    {t('common.status')}
                                                </TableHead>
                                                <TableHead className="text-xs font-medium text-gray-600">
                                                    {t('common.lastLogin')}
                                                </TableHead>
                                                <TableHead className="text-xs font-medium text-gray-600">
                                                    {t('common.actions')}
                                                </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                            {filteredAdmins.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                        {t('userManagement.noAdminsFound')}
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredAdmins.map((admin: User, index: number) => (
                                            <TableRow
                                                key={admin.id}
                                                className="cursor-pointer hover:bg-gray-50 transition-colors"
                                                onClick={() => handleViewAdmin(admin)}
                                            >
                                                <TableCell className="text-xs text-gray-500">{index + 1}</TableCell>
                                                        <TableCell className="font-medium text-sm">{admin.full_name || '-'}</TableCell>
                                                <TableCell className="text-sm">{admin.email || '-'}</TableCell>
                                                        <TableCell className="text-sm">{admin.phone || '-'}</TableCell>
                                                <TableCell>
                                                            <Badge className={getStatusColor(admin.is_active ? 'active' : 'inactive')}>
                                                                {admin.is_active ? t('common.active') : t('common.inactive')}
                                                    </Badge>
                                                </TableCell>
                                                        <TableCell className="text-sm">
                                                            {admin.last_login ? new Date(admin.last_login).toLocaleDateString() : '-'}
                                                        </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleEditUser(admin, 'admin')}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                                    onClick={() => handleUpdateUserStatus(admin.id, !admin.is_active)}
                                                                    disabled={updateUserStatusMutation.isPending}
                                                        >
                                                                    {admin.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                                ))
                                            )}
                                    </TableBody>
                                </Table>
                            </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === 'drivers' && (
                <div className="mt-6">
                    {isDriversLoading ? (
                        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                            <CardContent className="p-8">
                                <div className="flex items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <span className="ml-2 text-muted-foreground">
                                        {t('common.loading')}...
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ) : driversError ? (
                        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                            <CardContent className="p-8">
                                <div className="text-center">
                                    <p className="text-red-600">
                                        {t('common.error')}: {driversError.message || t('common.loadError')}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    {t('userManagement.drivers')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-xs font-medium text-gray-600">#</TableHead>
                                                <TableHead className="text-xs font-medium text-gray-600">
                                                    {t('common.name')}
                                                </TableHead>
                                                <TableHead className="text-xs font-medium text-gray-600">
                                                    {t('common.email')}
                                                </TableHead>
                                                <TableHead className="text-xs font-medium text-gray-600">
                                                    {t('common.phone')}
                                                </TableHead>
                                                <TableHead className="text-xs font-medium text-gray-600">
                                                    {t('common.status')}
                                                </TableHead>
                                                <TableHead className="text-xs font-medium text-gray-600">
                                                    {t('common.lastLogin')}
                                                </TableHead>
                                                <TableHead className="text-xs font-medium text-gray-600">
                                                    {t('common.actions')}
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredDrivers.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                        {t('userManagement.noDriversFound')}
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredDrivers.map((driver: User, index: number) => (
                                                    <TableRow
                                                        key={driver.id}
                                                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                                                        onClick={() => handleViewDriver(driver)}
                                                    >
                                                        <TableCell className="text-xs text-gray-500">{index + 1}</TableCell>
                                                        <TableCell className="font-medium text-sm">{driver.full_name || '-'}</TableCell>
                                                        <TableCell className="text-sm">{driver.email || '-'}</TableCell>
                                                        <TableCell className="text-sm">{driver.phone || '-'}</TableCell>
                                                        <TableCell>
                                                            <Badge className={getStatusColor(driver.is_active ? 'active' : 'inactive')}>
                                                                {driver.is_active ? t('common.active') : t('common.inactive')}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-sm">
                                                            {driver.last_login ? new Date(driver.last_login).toLocaleDateString() : '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleViewDriver(driver)}
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleUpdateUserStatus(driver.id, !driver.is_active)}
                                                                    disabled={updateUserStatusMutation.isPending}
                                                                >
                                                                    {driver.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {activeTab === 'clients' && (
                <div className="mt-6">
                    {isClientsLoading ? (
                        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                            <CardContent className="p-8">
                                <div className="flex items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <span className="ml-2 text-muted-foreground">
                                        {t('common.loading')}...
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ) : clientsError ? (
                        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                            <CardContent className="p-8">
                                <div className="text-center">
                                    <p className="text-red-600">
                                        {t('common.error')}: {clientsError.message || t('common.loadError')}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                    <ClientTable
                            clients={filteredClients as any}
                        onViewDetails={handleViewClient}
                        onEditClient={(client) => handleEditUser(client, 'client')}
                    />
                    )}
                </div>
            )}

            {/* Driver Detail Modal */}
            {selectedDriver && (
                <DriverDetailModal
                    driver={selectedDriver as any}
                    isOpen={showDriverModal}
                    onClose={() => setShowDriverModal(false)}
                />
            )}

            {/* Client Detail Modal */}
            {selectedClient && (
                <ClientDetailModal
                    client={selectedClient as any}
                    isOpen={showClientModal}
                    onClose={() => setShowClientModal(false)}
                />
            )}

            {/* Admin Detail Modal */}
            {selectedAdmin && (
                <UserDetailModal
                    isOpen={showAdminDetailModal}
                    onClose={() => setShowAdminDetailModal(false)}
                    user={selectedAdmin}
                />
            )}

            {/* Admin Edit Modal */}
            <Modal
                isOpen={showAdminModal}
                onClose={() => setShowAdminModal(false)}
                title={editingAdmin ? t('userManagement.editAdmin') : t('userManagement.addNewAdmin')}
                widthSizeClass={ModalSize.medium}
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('common.name')}</label>
                            <Input
                                placeholder={t('userManagement.fullNamePlaceholder')}
                                defaultValue={editingAdmin?.full_name || ''}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('common.email')}</label>
                            <Input
                                type="email"
                                placeholder="email@lovelycargo.rw"
                                defaultValue={editingAdmin?.email || ''}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('common.phone')}</label>
                            <Input
                                placeholder="+250 788 123 456"
                                defaultValue={editingAdmin?.phone || ''}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('common.language')}</label>
                            <select className="w-full p-2 border rounded-md">
                                <option value="en">{t('common.english')}</option>
                                <option value="rw">{t('common.kinyarwanda')}</option>
                                <option value="fr">{t('common.french')}</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('userManagement.permissions')}</label>
                        <div className="space-y-2">
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" defaultChecked />
                                <span className="text-sm">{t('userManagement.manageUsers')}</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" defaultChecked />
                                <span className="text-sm">{t('userManagement.manageCargos')}</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" defaultChecked />
                                <span className="text-sm">{t('userManagement.viewReports')}</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button className="flex-1">
                            {editingAdmin ? t('userManagement.updateAdmin') : t('userManagement.createAdmin')}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setShowAdminModal(false)}
                            className="flex-1"
                        >
                            {t('common.cancel')}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Modern Add User Modal */}
            <ModernModel
                isOpen={showAddUserModal}
                onClose={() => setShowAddUserModal(false)}
                title={t('userManagement.addUser')}
            >
                <div className="space-y-6">
                    {/* User Type Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700">
                            {t('userManagement.userType')}
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => setSelectedUserType('admin')}
                                className={`p-3 rounded-lg border-2 transition-all ${
                                    selectedUserType === 'admin'
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <Shield className="h-6 w-6 mx-auto mb-2" />
                                <span className="text-sm font-medium">{t('userManagement.admins')}</span>
                            </button>
                            <button
                                onClick={() => setSelectedUserType('driver')}
                                className={`p-3 rounded-lg border-2 transition-all ${
                                    selectedUserType === 'driver'
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <Users className="h-6 w-6 mx-auto mb-2" />
                                <span className="text-sm font-medium">{t('userManagement.drivers')}</span>
                            </button>
                            <button
                                onClick={() => setSelectedUserType('client')}
                                className={`p-3 rounded-lg border-2 transition-all ${
                                    selectedUserType === 'client'
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <Users className="h-6 w-6 mx-auto mb-2" />
                                <span className="text-sm font-medium">{t('userManagement.clients')}</span>
                            </button>
                        </div>
                    </div>

                    {/* User Form */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    {t('common.fullName')} *
                                </label>
                                <Input
                                    placeholder={t('userManagement.fullNamePlaceholder')}
                                    value={formData.full_name}
                                    onChange={(e) => handleFormChange('full_name', e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    {t('common.email')} *
                                </label>
                                <Input
                                    type="email"
                                    placeholder="email@lovelycargo.rw"
                                    value={formData.email}
                                    onChange={(e) => handleFormChange('email', e.target.value)}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    {t('common.phone')} *
                                </label>
                                <Input
                                    placeholder="+250 788 123 456"
                                    value={formData.phone}
                                    onChange={(e) => handleFormChange('phone', e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    {t('common.password')} *
                                </label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => handleFormChange('password', e.target.value)}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    {t('common.preferredLanguage')}
                                </label>
                                <select 
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    value={formData.preferred_language}
                                    onChange={(e) => handleFormChange('preferred_language', e.target.value)}
                                >
                                    <option value="en">{t('common.english')}</option>
                                    <option value="rw">{t('common.kinyarwanda')}</option>
                                    <option value="fr">{t('common.french')}</option>
                                </select>
                            </div>
                        </div>

                        {/* Additional fields based on user type */}
                        {selectedUserType === 'client' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            {t('client.companyName')}
                                        </label>
                                        <Input
                                            placeholder={t('client.enterCompanyName')}
                                            value={formData.company_name}
                                            onChange={(e) => handleFormChange('company_name', e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            {t('client.businessType')}
                                        </label>
                                        <select 
                                            className="w-full p-2 border border-gray-300 rounded-lg"
                                            value={formData.business_type}
                                            onChange={(e) => handleFormChange('business_type', e.target.value)}
                                        >
                                            <option value="individual">{t('client.individual')}</option>
                                            <option value="corporate">{t('client.corporate')}</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            {t('client.taxId')}
                                        </label>
                                        <Input
                                            placeholder="TAX001"
                                            value={formData.tax_id}
                                            onChange={(e) => handleFormChange('tax_id', e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            {t('client.contactPerson')}
                                        </label>
                                        <Input
                                            placeholder={t('client.contactPerson')}
                                            value={formData.contact_person}
                                            onChange={(e) => handleFormChange('contact_person', e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        {t('client.address')}
                                    </label>
                                    <Input
                                        placeholder="KN 4 Ave, Kigali"
                                        value={formData.address}
                                        onChange={(e) => handleFormChange('address', e.target.value)}
                                        className="w-full"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            {t('client.city')}
                                        </label>
                                        <Input
                                            placeholder="Kigali"
                                            value={formData.city}
                                            onChange={(e) => handleFormChange('city', e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            {t('client.country')}
                                        </label>
                                        <Input
                                            placeholder="Rwanda"
                                            value={formData.country}
                                            onChange={(e) => handleFormChange('country', e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            {t('client.postalCode')}
                                        </label>
                                        <Input
                                            placeholder="250"
                                            value={formData.postal_code}
                                            onChange={(e) => handleFormChange('postal_code', e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            {t('client.creditLimit')}
                                        </label>
                                        <Input
                                            type="number"
                                            placeholder="50000"
                                            value={formData.credit_limit}
                                            onChange={(e) => handleFormChange('credit_limit', parseInt(e.target.value) || 0)}
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            {t('client.paymentTerms')} (days)
                                        </label>
                                        <Input
                                            type="number"
                                            placeholder="30"
                                            value={formData.payment_terms}
                                            onChange={(e) => handleFormChange('payment_terms', parseInt(e.target.value) || 30)}
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedUserType === 'driver' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            {t('driver.licenseNumber')}
                                        </label>
                                        <Input
                                            placeholder={t('driver.enterLicenseNumber')}
                                            value={formData.license_number}
                                            onChange={(e) => handleFormChange('license_number', e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            {t('driver.licenseType')}
                                        </label>
                                        <select 
                                            className="w-full p-2 border border-gray-300 rounded-lg"
                                            value={formData.license_type}
                                            onChange={(e) => handleFormChange('license_type', e.target.value)}
                                        >
                                            <option value="A">A</option>
                                            <option value="B">B</option>
                                            <option value="C">C</option>
                                            <option value="D">D</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            {t('driver.licenseExpiry')}
                                        </label>
                                        <Input
                                            type="date"
                                            value={formData.license_expiry}
                                            onChange={(e) => handleFormChange('license_expiry', e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            {t('driver.dateOfBirth')}
                                        </label>
                                        <Input
                                            type="date"
                                            value={formData.date_of_birth}
                                            onChange={(e) => handleFormChange('date_of_birth', e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            {t('driver.emergencyContact')}
                                        </label>
                                        <Input
                                            placeholder={t('driver.emergencyContact')}
                                            value={formData.emergency_contact}
                                            onChange={(e) => handleFormChange('emergency_contact', e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            {t('driver.emergencyPhone')}
                                        </label>
                                        <Input
                                            placeholder="+250 788 123 456"
                                            value={formData.emergency_phone}
                                            onChange={(e) => handleFormChange('emergency_phone', e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            {t('driver.bloodType')}
                                        </label>
                                        <select 
                                            className="w-full p-2 border border-gray-300 rounded-lg"
                                            value={formData.blood_type}
                                            onChange={(e) => handleFormChange('blood_type', e.target.value)}
                                        >
                                            <option value="">Select Blood Type</option>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            {t('driver.medicalCertificateExpiry')}
                                        </label>
                                        <Input
                                            type="date"
                                            value={formData.medical_certificate_expiry}
                                            onChange={(e) => handleFormChange('medical_certificate_expiry', e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button 
                            className="flex-1"
                            onClick={handleCreateUser}
                            disabled={createAdminMutation.isPending || createDriverMutation.isPending || createClientMutation.isPending}
                        >
                            {createAdminMutation.isPending || createDriverMutation.isPending || createClientMutation.isPending 
                                ? t('common.loading') 
                                : t('userManagement.createUser')
                            }
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setShowAddUserModal(false)}
                            className="flex-1"
                        >
                            {t('common.cancel')}
                        </Button>
                    </div>
                </div>
            </ModernModel>

            {/* Modern Edit User Modal */}
            <ModernModel
                isOpen={showEditUserModal}
                onClose={() => setShowEditUserModal(false)}
                title={t('userManagement.editUser')}
            >
                <div className="space-y-6">
                    {/* User Info Display */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {editingUser?.full_name}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                                <span className="font-medium">{t('common.email')}:</span> {editingUser?.email}
                            </div>
                            <div>
                                <span className="font-medium">{t('common.phone')}:</span> {editingUser?.phone}
                            </div>
                            <div>
                                <span className="font-medium">{t('userManagement.userType')}:</span> {t(`userManagement.${selectedUserType}s`)}
                            </div>
                            <div>
                                <span className="font-medium">{t('common.status')}:</span> 
                                <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                                    editingUser?.is_active 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {editingUser?.is_active ? t('common.active') : t('common.inactive')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Status Update Form */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                {t('common.status')} *
                            </label>
                            <select 
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                value={formData.is_active ? 'active' : 'inactive'}
                                onChange={(e) => handleFormChange('is_active', e.target.value === 'active')}
                            >
                                <option value="active">{t('common.active')}</option>
                                <option value="inactive">{t('common.inactive')}</option>
                            </select>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button 
                            className="flex-1"
                            onClick={handleUpdateUser}
                            disabled={updateUserStatusMutation.isPending}
                        >
                            {updateUserStatusMutation.isPending 
                                ? t('common.loading') 
                                : t('userManagement.updateUser')
                            }
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setShowEditUserModal(false)}
                            className="flex-1"
                        >
                            {t('common.cancel')}
                        </Button>
                    </div>
                </div>
            </ModernModel>
        </div>
    );
}
