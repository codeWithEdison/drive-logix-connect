import React, { useState } from 'react';
import { CustomTabs } from '@/components/ui/CustomTabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { TruckTable, Truck } from '@/components/ui/TruckTable';
import { TruckDetailModal } from '@/components/ui/TruckDetailModal';
import ModernModel from '@/components/modal/ModernModel';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock data for trucks - Rwanda-based
const mockTrucks: Truck[] = [
    {
        id: "TRK-001",
        model: "Toyota Dyna",
        licensePlate: "RAB-123-A",
        capacity: "3 tons",
        status: "available",
        driver: "Albert Flores",
        location: "Kigali",
        lastMaintenance: "2024-01-10",
        totalDeliveries: 156,
        fuelLevel: 85,
        year: "2020",
        manufacturer: "Toyota",
        engineType: "Diesel",
        mileage: 45000,
        insuranceExpiry: "2024-12-31",
        registrationExpiry: "2024-12-31",
        is_active: true
    },
    {
        id: "TRK-002",
        model: "Isuzu NPR",
        licensePlate: "RAB-456-B",
        capacity: "5 tons",
        status: "in_use",
        driver: "Mike Johnson",
        location: "Butare",
        lastMaintenance: "2024-01-08",
        totalDeliveries: 89,
        fuelLevel: 45,
        year: "2019",
        manufacturer: "Isuzu",
        engineType: "Diesel",
        mileage: 67000,
        insuranceExpiry: "2024-11-30",
        registrationExpiry: "2024-11-30",
        is_active: true
    },
    {
        id: "TRK-003",
        model: "Mitsubishi Fuso",
        licensePlate: "RAB-789-C",
        capacity: "4 tons",
        status: "maintenance",
        driver: "Unassigned",
        location: "Musanze",
        lastMaintenance: "2024-01-15",
        totalDeliveries: 234,
        fuelLevel: 20,
        year: "2021",
        manufacturer: "Mitsubishi",
        engineType: "Diesel",
        mileage: 32000,
        insuranceExpiry: "2025-01-31",
        registrationExpiry: "2025-01-31",
        is_active: true
    },
    {
        id: "TRK-004",
        model: "Hino 300",
        licensePlate: "RAB-012-D",
        capacity: "6 tons",
        status: "available",
        driver: "Unassigned",
        location: "Kigali",
        lastMaintenance: "2024-01-12",
        totalDeliveries: 67,
        fuelLevel: 90,
        year: "2022",
        manufacturer: "Hino",
        engineType: "Diesel",
        mileage: 18000,
        insuranceExpiry: "2025-03-31",
        registrationExpiry: "2025-03-31",
        is_active: true
    }
];

const AdminTrucks = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [trucks, setTrucks] = useState<Truck[]>(mockTrucks);
    const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);
    const [isTruckDetailModalOpen, setIsTruckDetailModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTruck, setEditingTruck] = useState<Truck | null>(null);

    // Filter trucks based on active tab
    const getFilteredTrucks = () => {
        if (activeTab === 'all') return trucks;
        return trucks.filter(truck => truck.status === activeTab);
    };

    // Truck handlers
    const handleViewTruckDetails = (truck: Truck) => {
        setSelectedTruck(truck);
        setIsTruckDetailModalOpen(true);
    };

    const handleEditTruck = (truck: Truck) => {
        setEditingTruck(truck);
        setIsEditModalOpen(true);
    };

    const handleDeleteTruck = (truckId: string) => {
        console.log(`Deleting truck: ${truckId}`);
        setTrucks(prev => prev.filter(truck => truck.id !== truckId));
    };

    const handleTrackTruck = (truckId: string) => {
        console.log(`Tracking truck: ${truckId}`);
        window.location.href = `/admin/tracking/truck/${truckId}`;
    };

    const handleAssignDriver = (truckId: string) => {
        console.log(`Assigning driver to truck: ${truckId}`);
    };

    const handleScheduleMaintenance = (truckId: string) => {
        console.log(`Scheduling maintenance for truck: ${truckId}`);
    };

    const handleDownloadTruckDocuments = (truckId: string) => {
        console.log(`Downloading documents for truck: ${truckId}`);
        const truck = trucks.find(t => t.id === truckId);
        if (truck) {
            const documents = {
                truck_id: truck.id,
                model: truck.model,
                license_plate: truck.licensePlate,
                insurance_expiry: truck.insuranceExpiry,
                registration_expiry: truck.registrationExpiry
            };

            const blob = new Blob([JSON.stringify(documents, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `truck-documents-${truckId}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    // Create/Edit handlers
    const handleCreateNew = () => {
        setIsCreateModalOpen(true);
    };

    const handleSaveCreate = (formData: any) => {
        console.log('Creating new truck:', formData);
        setIsCreateModalOpen(false);
    };

    const handleSaveEdit = (formData: any) => {
        console.log('Saving edited truck:', formData);
        setIsEditModalOpen(false);
        setEditingTruck(null);
    };

    // Custom actions for table
    const truckCustomActions = (
        <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add Truck
        </Button>
    );

    const tabs = [
        {
            value: 'all',
            label: 'All Trucks',
            count: trucks.length
        },
        {
            value: 'available',
            label: 'Available',
            count: trucks.filter(t => t.status === 'available').length
        },
        {
            value: 'in_use',
            label: 'In Use',
            count: trucks.filter(t => t.status === 'in_use').length
        },
        {
            value: 'maintenance',
            label: 'Maintenance',
            count: trucks.filter(t => t.status === 'maintenance').length
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground font-heading">Truck Management</h1>
                    <p className="text-muted-foreground">Manage your fleet of delivery trucks</p>
                </div>
            </div>

            {/* Custom Tabs */}
            <CustomTabs
                value={activeTab}
                onValueChange={setActiveTab}
                tabs={tabs}
            />

            {/* Truck Table */}
            <div className="mt-6">
                <TruckTable
                    trucks={getFilteredTrucks()}
                    title={activeTab === 'all' ? 'All Trucks' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Trucks`}
                    showSearch={true}
                    showFilters={true}
                    showPagination={true}
                    itemsPerPage={10}
                    onViewDetails={handleViewTruckDetails}
                    onEditTruck={handleEditTruck}
                    onDeleteTruck={handleDeleteTruck}
                    onTrackTruck={handleTrackTruck}
                    onAssignDriver={handleAssignDriver}
                    onScheduleMaintenance={handleScheduleMaintenance}
                    customActions={truckCustomActions}
                />
            </div>

            {/* Truck Detail Modal */}
            <TruckDetailModal
                isOpen={isTruckDetailModalOpen}
                onClose={() => {
                    setIsTruckDetailModalOpen(false);
                    setSelectedTruck(null);
                }}
                truck={selectedTruck}
                onTrackTruck={handleTrackTruck}
                onEditTruck={handleEditTruck}
                onAssignDriver={handleAssignDriver}
                onScheduleMaintenance={handleScheduleMaintenance}
                onDownloadDocuments={handleDownloadTruckDocuments}
            />

            {/* Create Modal */}
            <ModernModel
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Add New Truck"
            >
                <div className="space-y-6">
                    <Card>
                        <CardContent className="p-4">
                            <h4 className="font-semibold text-gray-900 mb-4">Basic Information</h4>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Model *</Label>
                                        <Input placeholder="Enter truck model" />
                                    </div>
                                    <div>
                                        <Label>License Plate *</Label>
                                        <Input placeholder="Enter license plate" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Manufacturer *</Label>
                                        <Input placeholder="Enter manufacturer" />
                                    </div>
                                    <div>
                                        <Label>Year *</Label>
                                        <Input type="number" placeholder="Enter year" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Capacity *</Label>
                                        <Input placeholder="Enter capacity (e.g., 3 tons)" />
                                    </div>
                                    <div>
                                        <Label>Engine Type</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select engine type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="diesel">Diesel</SelectItem>
                                                <SelectItem value="petrol">Petrol</SelectItem>
                                                <SelectItem value="electric">Electric</SelectItem>
                                                <SelectItem value="hybrid">Hybrid</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <h4 className="font-semibold text-gray-900 mb-4">Status & Location</h4>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Status *</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="available">Available</SelectItem>
                                                <SelectItem value="in_use">In Use</SelectItem>
                                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                                <SelectItem value="out_of_service">Out of Service</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Current Location</Label>
                                        <Input placeholder="Enter current location" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Assigned Driver</Label>
                                        <Input placeholder="Enter assigned driver" />
                                    </div>
                                    <div>
                                        <Label>Fuel Level (%)</Label>
                                        <Input type="number" min="0" max="100" placeholder="Enter fuel level" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <h4 className="font-semibold text-gray-900 mb-4">Documentation</h4>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Insurance Expiry Date</Label>
                                        <Input type="date" />
                                    </div>
                                    <div>
                                        <Label>Registration Expiry Date</Label>
                                        <Input type="date" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Last Maintenance Date</Label>
                                        <Input type="date" />
                                    </div>
                                    <div>
                                        <Label>Initial Mileage (km)</Label>
                                        <Input type="number" placeholder="Enter initial mileage" />
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
                            Add Truck
                        </Button>
                    </div>
                </div>
            </ModernModel>

            {/* Edit Modal */}
            <ModernModel
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingTruck(null);
                }}
                title="Edit Truck"
            >
                {editingTruck && (
                    <div className="space-y-6">
                        <Card>
                            <CardContent className="p-4">
                                <h4 className="font-semibold text-gray-900 mb-4">Basic Information</h4>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Model *</Label>
                                            <Input
                                                placeholder="Enter truck model"
                                                defaultValue={editingTruck.model}
                                            />
                                        </div>
                                        <div>
                                            <Label>License Plate *</Label>
                                            <Input
                                                placeholder="Enter license plate"
                                                defaultValue={editingTruck.licensePlate}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Manufacturer *</Label>
                                            <Input
                                                placeholder="Enter manufacturer"
                                                defaultValue={editingTruck.manufacturer}
                                            />
                                        </div>
                                        <div>
                                            <Label>Year *</Label>
                                            <Input
                                                type="number"
                                                placeholder="Enter year"
                                                defaultValue={editingTruck.year}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Capacity *</Label>
                                            <Input
                                                placeholder="Enter capacity (e.g., 3 tons)"
                                                defaultValue={editingTruck.capacity}
                                            />
                                        </div>
                                        <div>
                                            <Label>Engine Type</Label>
                                            <Select defaultValue={editingTruck.engineType}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select engine type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="diesel">Diesel</SelectItem>
                                                    <SelectItem value="petrol">Petrol</SelectItem>
                                                    <SelectItem value="electric">Electric</SelectItem>
                                                    <SelectItem value="hybrid">Hybrid</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <h4 className="font-semibold text-gray-900 mb-4">Status & Location</h4>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Status *</Label>
                                            <Select defaultValue={editingTruck.status}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="available">Available</SelectItem>
                                                    <SelectItem value="in_use">In Use</SelectItem>
                                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                                    <SelectItem value="out_of_service">Out of Service</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>Current Location</Label>
                                            <Input
                                                placeholder="Enter current location"
                                                defaultValue={editingTruck.location}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Assigned Driver</Label>
                                            <Input
                                                placeholder="Enter assigned driver"
                                                defaultValue={editingTruck.driver}
                                            />
                                        </div>
                                        <div>
                                            <Label>Fuel Level (%)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                placeholder="Enter fuel level"
                                                defaultValue={editingTruck.fuelLevel.toString()}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <h4 className="font-semibold text-gray-900 mb-4">Performance & Documentation</h4>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Total Deliveries</Label>
                                            <Input
                                                type="number"
                                                placeholder="Enter total deliveries"
                                                defaultValue={editingTruck.totalDeliveries.toString()}
                                            />
                                        </div>
                                        <div>
                                            <Label>Current Mileage (km)</Label>
                                            <Input
                                                type="number"
                                                placeholder="Enter current mileage"
                                                defaultValue={editingTruck.mileage.toString()}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Insurance Expiry Date</Label>
                                            <Input
                                                type="date"
                                                defaultValue={editingTruck.insuranceExpiry}
                                            />
                                        </div>
                                        <div>
                                            <Label>Registration Expiry Date</Label>
                                            <Input
                                                type="date"
                                                defaultValue={editingTruck.registrationExpiry}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Last Maintenance Date</Label>
                                        <Input
                                            type="date"
                                            defaultValue={editingTruck.lastMaintenance}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                    setIsEditModalOpen(false);
                                    setEditingTruck(null);
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

export default AdminTrucks;
