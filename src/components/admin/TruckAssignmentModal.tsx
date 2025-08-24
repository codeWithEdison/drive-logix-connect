import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    AiOutlineCar,
    AiOutlineEnvironment,
    AiOutlineDashboard,
    AiOutlineCheck,
    AiOutlineClose
} from 'react-icons/ai';

interface Cargo {
    id: string;
    client: string;
    from: string;
    to: string;
    weight: string;
    type: string;
    priority: string;
    estimatedDistance: number;
}

interface Truck {
    id: string;
    model: string;
    licensePlate: string;
    capacity: string;
    driver: string;
    status: string;
    location: string;
    fuelLevel: number;
    lastMaintenance: string;
}

interface Driver {
    id: string;
    name: string;
    phone: string;
    rating: number;
    status: string;
    currentLocation: string;
    totalDeliveries: number;
}

interface TruckAssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    cargo: Cargo | null;
    onAssign: (cargoId: string, truckId: string, driverId: string) => void;
}

// Mock data
const mockAvailableTrucks: Truck[] = [
    {
        id: 'TRK-001',
        model: 'Ford F-650',
        licensePlate: 'ABC-123',
        capacity: '5 tons',
        driver: 'Unassigned',
        status: 'available',
        location: 'Kigali Depot',
        fuelLevel: 85,
        lastMaintenance: '2024-01-10'
    },
    {
        id: 'TRK-002',
        model: 'Chevrolet Silverado 3500',
        licensePlate: 'XYZ-789',
        capacity: '3 tons',
        driver: 'Unassigned',
        status: 'available',
        location: 'Kigali Depot',
        fuelLevel: 90,
        lastMaintenance: '2024-01-12'
    },
    {
        id: 'TRK-003',
        model: 'Dodge Ram 3500',
        licensePlate: 'DEF-456',
        capacity: '4 tons',
        driver: 'Unassigned',
        status: 'available',
        location: 'Butare Depot',
        fuelLevel: 75,
        lastMaintenance: '2024-01-08'
    }
];

const mockAvailableDrivers: Driver[] = [
    {
        id: 'DRV-001',
        name: 'Albert Flores',
        phone: '+250 123 456 789',
        rating: 4.8,
        status: 'available',
        currentLocation: 'Kigali',
        totalDeliveries: 156
    },
    {
        id: 'DRV-002',
        name: 'Mike Johnson',
        phone: '+250 234 567 890',
        rating: 4.6,
        status: 'available',
        currentLocation: 'Butare',
        totalDeliveries: 89
    },
    {
        id: 'DRV-003',
        name: 'Sarah Wilson',
        phone: '+250 345 678 901',
        rating: 4.9,
        status: 'available',
        currentLocation: 'Kigali',
        totalDeliveries: 234
    }
];

export function TruckAssignmentModal({ isOpen, onClose, cargo, onAssign }: TruckAssignmentModalProps) {
    const [selectedTruck, setSelectedTruck] = useState<string>('');
    const [selectedDriver, setSelectedDriver] = useState<string>('');

    const handleAssign = () => {
        if (cargo && selectedTruck && selectedDriver) {
            onAssign(cargo.id, selectedTruck, selectedDriver);
            setSelectedTruck('');
            setSelectedDriver('');
            onClose();
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return 'bg-destructive text-destructive-foreground';
            case 'high':
                return 'bg-warning text-warning-foreground';
            default:
                return 'bg-secondary text-secondary-foreground';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available':
                return 'bg-success text-success-foreground';
            case 'in_use':
                return 'bg-warning text-warning-foreground';
            case 'maintenance':
                return 'bg-destructive text-destructive-foreground';
            default:
                return 'bg-secondary text-secondary-foreground';
        }
    };

    if (!cargo) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AiOutlineCar className="h-5 w-5" />
                        Assign Truck to Cargo
                    </DialogTitle>
                    <DialogDescription>
                        Select a truck and driver to assign to this cargo delivery.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Cargo Details */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Cargo Details</h3>
                                <Badge className={getPriorityColor(cargo.priority)}>
                                    {cargo.priority.toUpperCase()}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium">Cargo ID</Label>
                                    <p className="text-lg font-semibold">{cargo.id}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Client</Label>
                                    <p className="text-lg">{cargo.client}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Route</Label>
                                    <div className="flex items-center gap-2">
                                        <AiOutlineEnvironment className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-lg">{cargo.from} → {cargo.to}</p>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Weight & Type</Label>
                                    <p className="text-lg">{cargo.weight} • {cargo.type}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Estimated Distance</Label>
                                    <div className="flex items-center gap-2">
                                        <AiOutlineDashboard className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-lg">{cargo.estimatedDistance} km</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Truck Selection */}
                    <div className="space-y-4">
                        <div>
                            <Label className="text-sm font-medium">Select Truck</Label>
                            <Select value={selectedTruck} onValueChange={setSelectedTruck}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a truck..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {mockAvailableTrucks.map((truck) => (
                                        <SelectItem key={truck.id} value={truck.id}>
                                            <div className="flex items-center gap-2">
                                                <span>{truck.model}</span>
                                                <span className="text-muted-foreground">({truck.licensePlate})</span>
                                                <Badge className={getStatusColor(truck.status)}>
                                                    {truck.status}
                                                </Badge>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedTruck && (
                            <Card>
                                <CardContent className="p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {mockAvailableTrucks
                                            .filter(truck => truck.id === selectedTruck)
                                            .map(truck => (
                                                <React.Fragment key={truck.id}>
                                                    <div>
                                                        <Label className="text-sm font-medium">Model</Label>
                                                        <p className="text-lg font-semibold">{truck.model}</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm font-medium">License Plate</Label>
                                                        <p className="text-lg">{truck.licensePlate}</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm font-medium">Capacity</Label>
                                                        <p className="text-lg">{truck.capacity}</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm font-medium">Fuel Level</Label>
                                                        <p className="text-lg">{truck.fuelLevel}%</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm font-medium">Location</Label>
                                                        <p className="text-lg">{truck.location}</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm font-medium">Last Maintenance</Label>
                                                        <p className="text-lg">{truck.lastMaintenance}</p>
                                                    </div>
                                                </React.Fragment>
                                            ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Driver Selection */}
                    <div className="space-y-4">
                        <div>
                            <Label className="text-sm font-medium">Select Driver</Label>
                            <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a driver..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {mockAvailableDrivers.map((driver) => (
                                        <SelectItem key={driver.id} value={driver.id}>
                                            <div className="flex items-center gap-2">
                                                <span>{driver.name}</span>
                                                <span className="text-muted-foreground">({driver.rating}★)</span>
                                                <Badge className={getStatusColor(driver.status)}>
                                                    {driver.status}
                                                </Badge>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedDriver && (
                            <Card>
                                <CardContent className="p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {mockAvailableDrivers
                                            .filter(driver => driver.id === selectedDriver)
                                            .map(driver => (
                                                <React.Fragment key={driver.id}>
                                                    <div>
                                                        <Label className="text-sm font-medium">Name</Label>
                                                        <p className="text-lg font-semibold">{driver.name}</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm font-medium">Phone</Label>
                                                        <p className="text-lg">{driver.phone}</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm font-medium">Rating</Label>
                                                        <p className="text-lg">{driver.rating}/5 ★</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm font-medium">Total Deliveries</Label>
                                                        <p className="text-lg">{driver.totalDeliveries}</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm font-medium">Current Location</Label>
                                                        <p className="text-lg">{driver.currentLocation}</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm font-medium">Status</Label>
                                                        <Badge className={getStatusColor(driver.status)}>
                                                            {driver.status}
                                                        </Badge>
                                                    </div>
                                                </React.Fragment>
                                            ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        <AiOutlineClose className="h-4 w-4 mr-2" />
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAssign}
                        disabled={!selectedTruck || !selectedDriver}
                    >
                        <AiOutlineCheck className="h-4 w-4 mr-2" />
                        Assign Truck & Driver
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
