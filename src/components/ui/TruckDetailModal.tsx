import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ModernModel from '@/components/modal/ModernModel';
import {
    Truck,
    MapPin,
    Gauge,
    Package,
    User,
    Calendar,
    Star,
    CheckCircle,
    AlertCircle,
    Building,
    Navigation,
    Edit,
    Download
} from 'lucide-react';
import { Truck as TruckType } from './TruckTable';

interface TruckDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    truck: TruckType | null;
    onTrackTruck?: (truckId: string) => void;
    onEditTruck?: (truck: TruckType) => void;
    onAssignDriver?: (truckId: string) => void;
    onScheduleMaintenance?: (truckId: string) => void;
    onDownloadDocuments?: (truckId: string) => void;
}

export function TruckDetailModal({
    isOpen,
    onClose,
    truck,
    onTrackTruck,
    onEditTruck,
    onAssignDriver,
    onScheduleMaintenance,
    onDownloadDocuments
}: TruckDetailModalProps) {
    if (!truck) return null;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "available":
                return <Badge className="bg-green-100 text-green-600">Available</Badge>;
            case "in_use":
                return <Badge className="bg-blue-100 text-blue-600">In Use</Badge>;
            case "maintenance":
                return <Badge className="bg-yellow-100 text-yellow-600">Maintenance</Badge>;
            case "out_of_service":
                return <Badge className="bg-red-100 text-red-600">Out of Service</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-600">{status}</Badge>;
        }
    };

    const getFuelLevelBadge = (fuelLevel: number) => {
        if (fuelLevel > 70) {
            return <Badge className="bg-green-100 text-green-600">{fuelLevel}%</Badge>;
        } else if (fuelLevel > 30) {
            return <Badge className="bg-yellow-100 text-yellow-600">{fuelLevel}%</Badge>;
        } else {
            return <Badge className="bg-red-100 text-red-600">{fuelLevel}%</Badge>;
        }
    };

    return (
        <ModernModel
            isOpen={isOpen}
            onClose={onClose}
            title={`Truck: ${truck.model}`}
        >
            <div className="space-y-6">
                {/* Header Info */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{truck.model}</h3>
                        <p className="text-sm text-gray-600">Truck ID: {truck.id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {getStatusBadge(truck.status)}
                        {getFuelLevelBadge(truck.fuelLevel)}
                    </div>
                </div>

                {/* Basic Information */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-4">
                            <Truck className="h-5 w-5 text-blue-600" />
                            <h4 className="font-semibold text-gray-900">Basic Information</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">License Plate</p>
                                <p className="text-sm font-semibold text-gray-900">{truck.licensePlate}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Capacity</p>
                                <p className="text-sm text-gray-900">{truck.capacity}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Manufacturer</p>
                                <p className="text-sm text-gray-900">{truck.manufacturer}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Year</p>
                                <p className="text-sm text-gray-900">{truck.year}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Driver Information */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-4">
                            <User className="h-5 w-5 text-green-600" />
                            <h4 className="font-semibold text-gray-900">Driver Information</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Assigned Driver</p>
                                <p className="text-sm font-semibold text-gray-900">{truck.driver}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Current Location</p>
                                <p className="text-sm text-gray-900">{truck.location}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Performance Statistics */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-4">
                            <Star className="h-5 w-5 text-yellow-600" />
                            <h4 className="font-semibold text-gray-900">Performance Statistics</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <p className="text-2xl font-bold text-blue-600">{truck.totalDeliveries}</p>
                                <p className="text-sm text-blue-600">Total Deliveries</p>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                <p className="text-2xl font-bold text-green-600">{truck.mileage.toLocaleString()}</p>
                                <p className="text-sm text-green-600">Total Mileage (km)</p>
                            </div>
                            <div className="text-center p-3 bg-yellow-50 rounded-lg">
                                <p className="text-2xl font-bold text-yellow-600">{truck.fuelLevel}%</p>
                                <p className="text-sm text-yellow-600">Fuel Level</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Technical Information */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-4">
                            <Gauge className="h-5 w-5 text-purple-600" />
                            <h4 className="font-semibold text-gray-900">Technical Information</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Engine Type</p>
                                <p className="text-sm text-gray-900">{truck.engineType}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Last Maintenance</p>
                                <p className="text-sm text-gray-900">{truck.lastMaintenance}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Documentation */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-4">
                            <Building className="h-5 w-5 text-indigo-600" />
                            <h4 className="font-semibold text-gray-900">Documentation</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Insurance Expiry</p>
                                <p className="text-sm text-gray-900">{truck.insuranceExpiry}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Registration Expiry</p>
                                <p className="text-sm text-gray-900">{truck.registrationExpiry}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => onTrackTruck?.(truck.id)}
                        >
                            <Navigation className="h-4 w-4 mr-2" />
                            Track Location
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => onEditTruck?.(truck)}
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Truck
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => onAssignDriver?.(truck.id)}
                        >
                            <User className="h-4 w-4 mr-2" />
                            Assign Driver
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => onScheduleMaintenance?.(truck.id)}
                        >
                            <Gauge className="h-4 w-4 mr-2" />
                            Schedule Maintenance
                        </Button>
                    </div>

                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => onDownloadDocuments?.(truck.id)}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Download Documents
                    </Button>
                </div>
            </div>
        </ModernModel>
    );
}
