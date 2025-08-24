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
import Modal, { ModalSize } from '@/components/modal/Modal';
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
    Calendar
} from 'lucide-react';

// Mock data for superadmin users - Rwanda-based
const mockAdmins = [
    {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@lovelycargo.rw',
        phone: '+250 788 123 456',
        role: 'admin',
        status: 'active',
        location: 'Kigali',
        lastLogin: '2024-01-15 14:30',
        permissions: ['manage_users', 'manage_cargos', 'view_reports'],
        createdAt: '2023-06-15'
    },
    {
        id: '2',
        name: 'Sarah Mukamana',
        email: 'sarah.m@lovelycargo.rw',
        phone: '+250 789 234 567',
        role: 'admin',
        status: 'active',
        location: 'Butare',
        lastLogin: '2024-01-16 09:15',
        permissions: ['manage_cargos', 'view_reports'],
        createdAt: '2023-08-20'
    },
    {
        id: '3',
        name: 'Pierre Ndayisaba',
        email: 'pierre.n@lovelycargo.rw',
        phone: '+250 787 345 678',
        role: 'admin',
        status: 'inactive',
        location: 'Musanze',
        lastLogin: '2024-01-10 11:45',
        permissions: ['view_reports'],
        createdAt: '2023-09-10'
    }
];

const mockDrivers = [
    {
        id: '1',
        full_name: 'Albert Flores',
        email: 'albert.flores@lovelycargo.rw',
        phone: '+250 788 456 789',
        license_number: 'RWA-2024-001',
        license_expiry: '2025-12-31',
        license_type: 'C' as const,
        date_of_birth: '1985-03-15',
        emergency_contact: 'Marie Flores',
        emergency_phone: '+250 788 456 790',
        blood_type: 'O+',
        medical_certificate_expiry: '2025-06-30',
        status: 'available' as const,
        rating: 4.8,
        total_deliveries: 45,
        total_distance_km: 12500,
        location: 'Kigali',
        registeredDate: '2023-03-15',
        lastActive: '2024-01-16 14:30',
        is_active: true,
        is_verified: true
    },
    {
        id: '2',
        full_name: 'Mike Johnson',
        email: 'mike.j@lovelycargo.rw',
        phone: '+250 789 567 890',
        license_number: 'RWA-2024-002',
        license_expiry: '2025-11-30',
        license_type: 'B' as const,
        date_of_birth: '1990-07-22',
        emergency_contact: 'Sarah Johnson',
        emergency_phone: '+250 789 567 891',
        blood_type: 'A+',
        medical_certificate_expiry: '2025-05-15',
        status: 'on_duty' as const,
        rating: 4.6,
        total_deliveries: 38,
        total_distance_km: 9800,
        location: 'Butare',
        registeredDate: '2023-04-20',
        lastActive: '2024-01-15 16:45',
        is_active: true,
        is_verified: true
    },
    {
        id: '3',
        full_name: 'Alice Uwimana',
        email: 'alice.u@lovelycargo.rw',
        phone: '+250 787 678 901',
        license_number: 'RWA-2024-003',
        license_expiry: '2025-10-15',
        license_type: 'C' as const,
        date_of_birth: '1988-12-08',
        emergency_contact: 'Jean Uwimana',
        emergency_phone: '+250 787 678 902',
        blood_type: 'B+',
        medical_certificate_expiry: '2025-08-20',
        status: 'available' as const,
        rating: 4.9,
        total_deliveries: 52,
        total_distance_km: 15800,
        location: 'Musanze',
        registeredDate: '2023-02-10',
        lastActive: '2024-01-17 12:15',
        is_active: true,
        is_verified: true
    }
];

const mockClients = [
    {
        id: '1',
        full_name: 'Jean Baptiste',
        email: 'jean.b@lovelycargo.rw',
        phone: '+250 788 789 012',
        company_name: 'Baptiste Logistics',
        business_type: 'corporate' as const,
        tax_id: 'TIN-123456789',
        address: '123 Main Street, Kigali',
        city: 'Kigali',
        country: 'Rwanda',
        postal_code: '00100',
        contact_person: 'Jean Baptiste',
        credit_limit: 5000000,
        payment_terms: 30,
        status: 'active' as const,
        location: 'Kigali',
        registeredDate: '2023-01-15',
        lastActive: '2024-01-15 10:30',
        totalCargos: 23,
        is_active: true,
        is_verified: true
    },
    {
        id: '2',
        full_name: 'Marie Claire',
        email: 'marie.c@lovelycargo.rw',
        phone: '+250 789 890 123',
        company_name: 'Claire Enterprises',
        business_type: 'corporate' as const,
        tax_id: 'TIN-987654321',
        address: '456 Business Ave, Butare',
        city: 'Butare',
        country: 'Rwanda',
        postal_code: '00200',
        contact_person: 'Marie Claire',
        credit_limit: 3000000,
        payment_terms: 15,
        status: 'active' as const,
        location: 'Butare',
        registeredDate: '2023-02-20',
        lastActive: '2024-01-16 14:15',
        totalCargos: 18,
        is_active: true,
        is_verified: true
    },
    {
        id: '3',
        full_name: 'Emmanuel Niyonsaba',
        email: 'emmanuel.n@lovelycargo.rw',
        phone: '+250 787 901 234',
        company_name: 'Niyonsaba Trading',
        business_type: 'individual' as const,
        tax_id: 'TIN-456789123',
        address: '789 Trade Street, Musanze',
        city: 'Musanze',
        country: 'Rwanda',
        postal_code: '00300',
        contact_person: 'Emmanuel Niyonsaba',
        credit_limit: 2000000,
        payment_terms: 7,
        status: 'inactive' as const,
        location: 'Musanze',
        registeredDate: '2023-03-10',
        lastActive: '2024-01-10 09:45',
        totalCargos: 12,
        is_active: false,
        is_verified: true
    }
];

export default function SuperAdminUsers() {
    const [activeTab, setActiveTab] = useState('admins');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDriver, setSelectedDriver] = useState<any>(null);
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [showDriverModal, setShowDriverModal] = useState(false);
    const [showClientModal, setShowClientModal] = useState(false);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<any>(null);

    const handleViewDriver = (driver: any) => {
        setSelectedDriver(driver);
        setShowDriverModal(true);
    };

    const handleViewClient = (client: any) => {
        setSelectedClient(client);
        setShowClientModal(true);
    };

    const handleEditAdmin = (admin: any) => {
        setEditingAdmin(admin);
        setShowAdminModal(true);
    };

    const handleDeleteAdmin = (id: string) => {
        console.log('Delete admin:', id);
        // TODO: Implement delete functionality
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
            label: 'Admins',
            count: mockAdmins.length
        },
        {
            value: 'drivers',
            label: 'Drivers',
            count: mockDrivers.length
        },
        {
            value: 'clients',
            label: 'Clients',
            count: mockClients.length
        }
    ];

    const filteredAdmins = mockAdmins.filter(admin =>
        admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground font-heading">User Management</h1>
                    <p className="text-muted-foreground">Manage all system users across Rwanda</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                    </Button>
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add User
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
                                    placeholder="Search users..."
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
                                Admin Users
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-xs font-medium text-gray-600">#</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Name</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Email</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Phone</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Location</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Status</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Last Login</TableHead>
                                            <TableHead className="text-xs font-medium text-gray-600">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredAdmins.map((admin, index) => (
                                            <TableRow key={admin.id}>
                                                <TableCell className="text-xs text-gray-500">{index + 1}</TableCell>
                                                <TableCell className="font-medium text-sm">{admin.name}</TableCell>
                                                <TableCell className="text-sm">{admin.email}</TableCell>
                                                <TableCell className="text-sm">{admin.phone}</TableCell>
                                                <TableCell className="text-sm">{admin.location}</TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(admin.status)}>
                                                        {admin.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm">{admin.lastLogin}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleEditAdmin(admin)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDeleteAdmin(admin.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
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

            {activeTab === 'drivers' && (
                <div className="mt-6">
                    <DriverTable
                        drivers={mockDrivers}
                        onViewDetails={handleViewDriver}
                    />
                </div>
            )}

            {activeTab === 'clients' && (
                <div className="mt-6">
                    <ClientTable
                        clients={mockClients}
                        onViewDetails={handleViewClient}
                    />
                </div>
            )}

            {/* Driver Detail Modal */}
            {selectedDriver && (
                <DriverDetailModal
                    driver={selectedDriver}
                    isOpen={showDriverModal}
                    onClose={() => setShowDriverModal(false)}
                />
            )}

            {/* Client Detail Modal */}
            {selectedClient && (
                <ClientDetailModal
                    client={selectedClient}
                    isOpen={showClientModal}
                    onClose={() => setShowClientModal(false)}
                />
            )}

            {/* Admin Edit Modal */}
            <Modal
                isOpen={showAdminModal}
                onClose={() => setShowAdminModal(false)}
                title={editingAdmin ? "Edit Admin User" : "Add New Admin"}
                widthSizeClass={ModalSize.medium}
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Name</label>
                            <Input
                                placeholder="Full name"
                                defaultValue={editingAdmin?.name || ''}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                type="email"
                                placeholder="email@lovelycargo.rw"
                                defaultValue={editingAdmin?.email || ''}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Phone</label>
                            <Input
                                placeholder="+250 788 123 456"
                                defaultValue={editingAdmin?.phone || ''}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Location</label>
                            <Input
                                placeholder="Kigali"
                                defaultValue={editingAdmin?.location || ''}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Permissions</label>
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
                        </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button className="flex-1">
                            {editingAdmin ? 'Update Admin' : 'Create Admin'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setShowAdminModal(false)}
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
