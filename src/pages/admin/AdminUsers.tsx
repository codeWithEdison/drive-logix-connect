import React, { useState } from 'react';
import { CustomTabs } from '@/components/ui/CustomTabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, UserPlus } from 'lucide-react';
import { DriverTable, Driver } from '@/components/ui/DriverTable';
import { ClientTable, Client } from '@/components/ui/ClientTable';
import { DriverDetailModal } from '@/components/ui/DriverDetailModal';
import { ClientDetailModal } from '@/components/ui/ClientDetailModal';
import ModernModel from '@/components/modal/ModernModel';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock data for drivers - Rwanda-based
const mockDrivers: Driver[] = [
    {
        id: "1",
        full_name: "Albert Flores",
        email: "albert.flores@example.com",
        phone: "+250 123 456 789",
        license_number: "RW123456789",
        license_expiry: "2025-12-31",
        license_type: "B",
        date_of_birth: "1985-03-15",
        emergency_contact: "Marie Flores",
        emergency_phone: "+250 234 567 890",
        blood_type: "O+",
        medical_certificate_expiry: "2024-12-31",
        status: "available",
        rating: 4.8,
        total_deliveries: 156,
        total_distance_km: 12500.5,
        location: "Kigali",
        registeredDate: "2024-01-08",
        lastActive: "2024-01-15",
        is_active: true,
        is_verified: true
    },
    {
        id: "2",
        full_name: "Mike Johnson",
        email: "mike.johnson@example.com",
        phone: "+250 234 567 890",
        license_number: "RW987654321",
        license_expiry: "2025-06-30",
        license_type: "C",
        date_of_birth: "1990-07-22",
        emergency_contact: "Sarah Johnson",
        emergency_phone: "+250 345 678 901",
        blood_type: "A+",
        medical_certificate_expiry: "2024-06-30",
        status: "on_duty",
        rating: 4.6,
        total_deliveries: 89,
        total_distance_km: 7800.2,
        location: "Butare",
        registeredDate: "2024-01-05",
        lastActive: "2024-01-15",
        is_active: true,
        is_verified: true
    },
    {
        id: "3",
        full_name: "Sarah Wilson",
        email: "sarah.wilson@example.com",
        phone: "+250 345 678 901",
        license_number: "RW456789123",
        license_expiry: "2025-09-15",
        license_type: "B",
        date_of_birth: "1988-11-10",
        emergency_contact: "John Wilson",
        emergency_phone: "+250 456 789 012",
        blood_type: "B+",
        medical_certificate_expiry: "2024-09-15",
        status: "available",
        rating: 4.9,
        total_deliveries: 234,
        total_distance_km: 18900.8,
        location: "Kigali",
        registeredDate: "2024-01-10",
        lastActive: "2024-01-14",
        is_active: true,
        is_verified: true
    }
];

// Mock data for clients - Rwanda-based
const mockClients: Client[] = [
    {
        id: "1",
        full_name: "John Doe",
        email: "john.doe@example.com",
        phone: "+250 123 456 789",
        company_name: "Kigali Tech Solutions",
        business_type: "corporate",
        tax_id: "RW123456789",
        address: "123 Kimihurura, Kigali",
        city: "Kigali",
        country: "Rwanda",
        postal_code: "00001",
        contact_person: "John Doe",
        credit_limit: 5000000,
        payment_terms: 30,
        status: "active",
        location: "Kigali",
        registeredDate: "2024-01-10",
        lastActive: "2024-01-15",
        totalCargos: 12,
        is_active: true,
        is_verified: true
    },
    {
        id: "2",
        full_name: "Marie Claire",
        email: "marie.claire@example.com",
        phone: "+250 234 567 890",
        business_type: "individual",
        address: "456 Butare Street, Butare",
        city: "Butare",
        country: "Rwanda",
        postal_code: "00002",
        credit_limit: 1000000,
        payment_terms: 15,
        status: "active",
        location: "Butare",
        registeredDate: "2024-01-09",
        lastActive: "2024-01-15",
        totalCargos: 8,
        is_active: true,
        is_verified: true
    },
    {
        id: "3",
        full_name: "Emmanuel Ndayisaba",
        email: "emmanuel.ndayisaba@example.com",
        phone: "+250 345 678 901",
        company_name: "Rwanda Agricultural Co.",
        business_type: "corporate",
        tax_id: "RW987654321",
        address: "789 Musanze Road, Musanze",
        city: "Musanze",
        country: "Rwanda",
        postal_code: "00003",
        contact_person: "Emmanuel Ndayisaba",
        credit_limit: 3000000,
        payment_terms: 45,
        status: "pending",
        location: "Musanze",
        registeredDate: "2024-01-12",
        lastActive: "2024-01-14",
        totalCargos: 3,
        is_active: false,
        is_verified: false
    }
];

const AdminUsers = () => {
    const [activeTab, setActiveTab] = useState('drivers');
    const [drivers, setDrivers] = useState<Driver[]>(mockDrivers);
    const [clients, setClients] = useState<Client[]>(mockClients);
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isDriverDetailModalOpen, setIsDriverDetailModalOpen] = useState(false);
    const [isClientDetailModalOpen, setIsClientDetailModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Driver | Client | null>(null);
    const [editingType, setEditingType] = useState<'driver' | 'client'>('driver');

    // Driver handlers
    const handleViewDriverDetails = (driver: Driver) => {
        setSelectedDriver(driver);
        setIsDriverDetailModalOpen(true);
    };

    const handleEditDriver = (driver: Driver) => {
        setEditingItem(driver);
        setEditingType('driver');
        setIsEditModalOpen(true);
    };

    const handleDeleteDriver = (driverId: string) => {
        console.log(`Deleting driver: ${driverId}`);
        setDrivers(prev => prev.filter(driver => driver.id !== driverId));
    };

    const handleCallDriver = (phone: string) => {
        console.log(`Calling driver: ${phone}`);
    };

    const handleTrackDriver = (driverId: string) => {
        console.log(`Tracking driver: ${driverId}`);
        window.location.href = `/admin/tracking/driver/${driverId}`;
    };

    const handleDownloadDriverDocuments = (driverId: string) => {
        console.log(`Downloading documents for driver: ${driverId}`);
        const driver = drivers.find(d => d.id === driverId);
        if (driver) {
            const documents = {
                license: driver.license_number,
                medical_cert: driver.medical_certificate_expiry,
                driver_id: driver.id,
                name: driver.full_name
            };

            const blob = new Blob([JSON.stringify(documents, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `driver-documents-${driverId}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    const handleSuspendDriver = (driverId: string) => {
        console.log(`Suspending driver: ${driverId}`);
        setDrivers(prev => prev.map(driver =>
            driver.id === driverId ? { ...driver, status: 'suspended' as const } : driver
        ));
    };

    const handleActivateDriver = (driverId: string) => {
        console.log(`Activating driver: ${driverId}`);
        setDrivers(prev => prev.map(driver =>
            driver.id === driverId ? { ...driver, status: 'available' as const } : driver
        ));
    };

    // Client handlers
    const handleViewClientDetails = (client: Client) => {
        setSelectedClient(client);
        setIsClientDetailModalOpen(true);
    };

    const handleEditClient = (client: Client) => {
        setEditingItem(client);
        setEditingType('client');
        setIsEditModalOpen(true);
    };

    const handleDeleteClient = (clientId: string) => {
        console.log(`Deleting client: ${clientId}`);
        setClients(prev => prev.filter(client => client.id !== clientId));
    };

    const handleCallClient = (phone: string) => {
        console.log(`Calling client: ${phone}`);
    };

    const handleDownloadClientDocuments = (clientId: string) => {
        console.log(`Downloading documents for client: ${clientId}`);
        const client = clients.find(c => c.id === clientId);
        if (client) {
            const documents = {
                client_id: client.id,
                name: client.full_name,
                company: client.company_name,
                tax_id: client.tax_id,
                business_type: client.business_type
            };

            const blob = new Blob([JSON.stringify(documents, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `client-documents-${clientId}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    const handleSuspendClient = (clientId: string) => {
        console.log(`Suspending client: ${clientId}`);
        setClients(prev => prev.map(client =>
            client.id === clientId ? { ...client, status: 'suspended' as const } : client
        ));
    };

    const handleActivateClient = (clientId: string) => {
        console.log(`Activating client: ${clientId}`);
        setClients(prev => prev.map(client =>
            client.id === clientId ? { ...client, status: 'active' as const } : client
        ));
    };

    // Create/Edit handlers
    const handleCreateNew = () => {
        setIsCreateModalOpen(true);
    };

    const handleSaveCreate = (formData: any) => {
        console.log('Creating new item:', formData);
        setIsCreateModalOpen(false);
    };

    const handleSaveEdit = (formData: any) => {
        console.log('Saving edited item:', formData);
        setIsEditModalOpen(false);
        setEditingItem(null);
    };

    // Custom actions for tables
    const driverCustomActions = (
        <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add Driver
        </Button>
    );

    const clientCustomActions = (
        <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add Client
        </Button>
    );

    const tabs = [
        {
            value: 'drivers',
            label: 'Drivers',
            count: drivers.length
        },
        {
            value: 'clients',
            label: 'Clients',
            count: clients.length
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground font-heading">Users & Drivers</h1>
                    <p className="text-muted-foreground">Manage all registered users and drivers</p>
                </div>
            </div>

            {/* Custom Tabs */}
            <CustomTabs
                value={activeTab}
                onValueChange={setActiveTab}
                tabs={tabs}
            />

            {/* Tab Content */}
            {activeTab === 'drivers' && (
                <div className="mt-6">
                    <DriverTable
                        drivers={drivers}
                        title="Drivers"
                        showSearch={true}
                        showFilters={true}
                        showPagination={true}
                        itemsPerPage={10}
                        onViewDetails={handleViewDriverDetails}
                        onEditDriver={handleEditDriver}
                        onDeleteDriver={handleDeleteDriver}
                        onCallDriver={handleCallDriver}
                        onTrackDriver={handleTrackDriver}
                        onDownloadDocuments={handleDownloadDriverDocuments}
                        onSuspendDriver={handleSuspendDriver}
                        onActivateDriver={handleActivateDriver}
                        customActions={driverCustomActions}
                    />
                </div>
            )}

            {activeTab === 'clients' && (
                <div className="mt-6">
                    <ClientTable
                        clients={clients}
                        title="Clients"
                        showSearch={true}
                        showFilters={true}
                        showPagination={true}
                        itemsPerPage={10}
                        onViewDetails={handleViewClientDetails}
                        onEditClient={handleEditClient}
                        onDeleteClient={handleDeleteClient}
                        onCallClient={handleCallClient}
                        onDownloadDocuments={handleDownloadClientDocuments}
                        onSuspendClient={handleSuspendClient}
                        onActivateClient={handleActivateClient}
                        customActions={clientCustomActions}
                    />
                </div>
            )}

            {/* Driver Detail Modal */}
            <DriverDetailModal
                isOpen={isDriverDetailModalOpen}
                onClose={() => {
                    setIsDriverDetailModalOpen(false);
                    setSelectedDriver(null);
                }}
                driver={selectedDriver}
                onCallDriver={handleCallDriver}
                onTrackDriver={handleTrackDriver}
                onEditDriver={handleEditDriver}
                onDownloadDocuments={handleDownloadDriverDocuments}
            />

            {/* Client Detail Modal */}
            <ClientDetailModal
                isOpen={isClientDetailModalOpen}
                onClose={() => {
                    setIsClientDetailModalOpen(false);
                    setSelectedClient(null);
                }}
                client={selectedClient}
                onCallClient={handleCallClient}
                onEditClient={handleEditClient}
                onDownloadDocuments={handleDownloadClientDocuments}
            />

            {/* Create Modal */}
            <ModernModel
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New User"
            >
                <div className="space-y-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="space-y-4">
                                <div>
                                    <Label>User Type *</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select user type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="driver">Driver</SelectItem>
                                            <SelectItem value="client">Client</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Full Name *</Label>
                                        <Input placeholder="Enter full name" />
                                    </div>
                                    <div>
                                        <Label>Email *</Label>
                                        <Input type="email" placeholder="Enter email" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Phone *</Label>
                                        <Input placeholder="Enter phone number" />
                                    </div>
                                    <div>
                                        <Label>Date of Birth</Label>
                                        <Input type="date" />
                                    </div>
                                </div>
                                <div>
                                    <Label>Address</Label>
                                    <Input placeholder="Enter address" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label>City</Label>
                                        <Input placeholder="Enter city" />
                                    </div>
                                    <div>
                                        <Label>Country</Label>
                                        <Input placeholder="Enter country" defaultValue="Rwanda" />
                                    </div>
                                    <div>
                                        <Label>Postal Code</Label>
                                        <Input placeholder="Enter postal code" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Driver-specific fields */}
                    <Card>
                        <CardContent className="p-4">
                            <h4 className="font-semibold text-gray-900 mb-4">Driver Information</h4>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>License Number *</Label>
                                        <Input placeholder="Enter license number" />
                                    </div>
                                    <div>
                                        <Label>License Type *</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select license type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="A">A - Motorcycle</SelectItem>
                                                <SelectItem value="B">B - Light Vehicle</SelectItem>
                                                <SelectItem value="C">C - Heavy Vehicle</SelectItem>
                                                <SelectItem value="D">D - Passenger Vehicle</SelectItem>
                                                <SelectItem value="E">E - Trailer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>License Expiry Date *</Label>
                                        <Input type="date" />
                                    </div>
                                    <div>
                                        <Label>Medical Certificate Expiry</Label>
                                        <Input type="date" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Emergency Contact</Label>
                                        <Input placeholder="Enter emergency contact name" />
                                    </div>
                                    <div>
                                        <Label>Emergency Phone</Label>
                                        <Input placeholder="Enter emergency phone" />
                                    </div>
                                </div>
                                <div>
                                    <Label>Blood Type</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select blood type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="A+">A+</SelectItem>
                                            <SelectItem value="A-">A-</SelectItem>
                                            <SelectItem value="B+">B+</SelectItem>
                                            <SelectItem value="B-">B-</SelectItem>
                                            <SelectItem value="AB+">AB+</SelectItem>
                                            <SelectItem value="AB-">AB-</SelectItem>
                                            <SelectItem value="O+">O+</SelectItem>
                                            <SelectItem value="O-">O-</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Client-specific fields */}
                    <Card>
                        <CardContent className="p-4">
                            <h4 className="font-semibold text-gray-900 mb-4">Client Information</h4>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Business Type</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select business type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="individual">Individual</SelectItem>
                                                <SelectItem value="corporate">Corporate</SelectItem>
                                                <SelectItem value="government">Government</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Company Name</Label>
                                        <Input placeholder="Enter company name" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Tax ID</Label>
                                        <Input placeholder="Enter tax ID" />
                                    </div>
                                    <div>
                                        <Label>Contact Person</Label>
                                        <Input placeholder="Enter contact person" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Credit Limit (RWF)</Label>
                                        <Input type="number" placeholder="Enter credit limit" />
                                    </div>
                                    <div>
                                        <Label>Payment Terms (days)</Label>
                                        <Input type="number" placeholder="Enter payment terms" defaultValue="30" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setIsCreateModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1"
                            onClick={() => handleSaveCreate({})}
                        >
                            Create User
                        </Button>
                    </div>
                </div>
            </ModernModel>

            {/* Edit Modal */}
            <ModernModel
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingItem(null);
                }}
                title={`Edit ${editingType === 'driver' ? 'Driver' : 'Client'}`}
            >
                {editingItem && (
                    <div className="space-y-6">
                        <Card>
                            <CardContent className="p-4">
                                <h4 className="font-semibold text-gray-900 mb-4">Basic Information</h4>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Full Name *</Label>
                                            <Input
                                                placeholder="Enter full name"
                                                defaultValue={editingItem.full_name}
                                            />
                                        </div>
                                        <div>
                                            <Label>Email *</Label>
                                            <Input
                                                type="email"
                                                placeholder="Enter email"
                                                defaultValue={editingItem.email}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Phone *</Label>
                                            <Input
                                                placeholder="Enter phone number"
                                                defaultValue={editingItem.phone}
                                            />
                                        </div>
                                        <div>
                                            <Label>Status</Label>
                                            <Select defaultValue={editingItem.status}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="pending">Pending</SelectItem>
                                                    <SelectItem value="inactive">Inactive</SelectItem>
                                                    <SelectItem value="suspended">Suspended</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Address</Label>
                                        <Input
                                            placeholder="Enter address"
                                            defaultValue={editingType === 'client' ? (editingItem as Client).address : ''}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <Label>City</Label>
                                            <Input
                                                placeholder="Enter city"
                                                defaultValue={editingType === 'client' ? (editingItem as Client).city : ''}
                                            />
                                        </div>
                                        <div>
                                            <Label>Country</Label>
                                            <Input
                                                placeholder="Enter country"
                                                defaultValue={editingType === 'client' ? (editingItem as Client).country : 'Rwanda'}
                                            />
                                        </div>
                                        <div>
                                            <Label>Postal Code</Label>
                                            <Input
                                                placeholder="Enter postal code"
                                                defaultValue={editingType === 'client' ? (editingItem as Client).postal_code : ''}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Driver-specific fields */}
                        {editingType === 'driver' && (
                            <Card>
                                <CardContent className="p-4">
                                    <h4 className="font-semibold text-gray-900 mb-4">Driver Information</h4>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label>License Number *</Label>
                                                <Input
                                                    placeholder="Enter license number"
                                                    defaultValue={(editingItem as Driver).license_number}
                                                />
                                            </div>
                                            <div>
                                                <Label>License Type *</Label>
                                                <Select defaultValue={(editingItem as Driver).license_type}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select license type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="A">A - Motorcycle</SelectItem>
                                                        <SelectItem value="B">B - Light Vehicle</SelectItem>
                                                        <SelectItem value="C">C - Heavy Vehicle</SelectItem>
                                                        <SelectItem value="D">D - Passenger Vehicle</SelectItem>
                                                        <SelectItem value="E">E - Trailer</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label>License Expiry Date *</Label>
                                                <Input
                                                    type="date"
                                                    defaultValue={(editingItem as Driver).license_expiry}
                                                />
                                            </div>
                                            <div>
                                                <Label>Medical Certificate Expiry</Label>
                                                <Input
                                                    type="date"
                                                    defaultValue={(editingItem as Driver).medical_certificate_expiry}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Emergency Contact</Label>
                                                <Input
                                                    placeholder="Enter emergency contact name"
                                                    defaultValue={(editingItem as Driver).emergency_contact}
                                                />
                                            </div>
                                            <div>
                                                <Label>Emergency Phone</Label>
                                                <Input
                                                    placeholder="Enter emergency phone"
                                                    defaultValue={(editingItem as Driver).emergency_phone}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Blood Type</Label>
                                            <Select defaultValue={(editingItem as Driver).blood_type}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select blood type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="A+">A+</SelectItem>
                                                    <SelectItem value="A-">A-</SelectItem>
                                                    <SelectItem value="B+">B+</SelectItem>
                                                    <SelectItem value="B-">B-</SelectItem>
                                                    <SelectItem value="AB+">AB+</SelectItem>
                                                    <SelectItem value="AB-">AB-</SelectItem>
                                                    <SelectItem value="O+">O+</SelectItem>
                                                    <SelectItem value="O-">O-</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Rating</Label>
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    min="0"
                                                    max="5"
                                                    placeholder="Enter rating (0-5)"
                                                    defaultValue={(editingItem as Driver).rating.toString()}
                                                />
                                            </div>
                                            <div>
                                                <Label>Total Deliveries</Label>
                                                <Input
                                                    type="number"
                                                    placeholder="Enter total deliveries"
                                                    defaultValue={(editingItem as Driver).total_deliveries.toString()}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Client-specific fields */}
                        {editingType === 'client' && (
                            <Card>
                                <CardContent className="p-4">
                                    <h4 className="font-semibold text-gray-900 mb-4">Client Information</h4>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Business Type</Label>
                                                <Select defaultValue={(editingItem as Client).business_type}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select business type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="individual">Individual</SelectItem>
                                                        <SelectItem value="corporate">Corporate</SelectItem>
                                                        <SelectItem value="government">Government</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label>Company Name</Label>
                                                <Input
                                                    placeholder="Enter company name"
                                                    defaultValue={(editingItem as Client).company_name}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Tax ID</Label>
                                                <Input
                                                    placeholder="Enter tax ID"
                                                    defaultValue={(editingItem as Client).tax_id}
                                                />
                                            </div>
                                            <div>
                                                <Label>Contact Person</Label>
                                                <Input
                                                    placeholder="Enter contact person"
                                                    defaultValue={(editingItem as Client).contact_person}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Credit Limit (RWF)</Label>
                                                <Input
                                                    type="number"
                                                    placeholder="Enter credit limit"
                                                    defaultValue={(editingItem as Client).credit_limit.toString()}
                                                />
                                            </div>
                                            <div>
                                                <Label>Payment Terms (days)</Label>
                                                <Input
                                                    type="number"
                                                    placeholder="Enter payment terms"
                                                    defaultValue={(editingItem as Client).payment_terms.toString()}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Total Cargos</Label>
                                                <Input
                                                    type="number"
                                                    placeholder="Enter total cargos"
                                                    defaultValue={(editingItem as Client).totalCargos.toString()}
                                                />
                                            </div>
                                            <div>
                                                <Label>Account Status</Label>
                                                <Select defaultValue={editingItem.is_active ? 'active' : 'inactive'}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select account status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="active">Active</SelectItem>
                                                        <SelectItem value="inactive">Inactive</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                    setIsEditModalOpen(false);
                                    setEditingItem(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={() => handleSaveEdit({})}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </div>
                )}
            </ModernModel>
        </div>
    );
};

export default AdminUsers;
