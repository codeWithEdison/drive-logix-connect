import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Truck,
    Search,
    Plus,
    Eye,
    Edit,
    Trash2,
    MapPin,
    Gauge,
    Package,
    User
} from 'lucide-react';

// Mock data for trucks
const mockTrucks = [
    {
        id: "TRK-001",
        model: "Ford F-650",
        licensePlate: "ABC-123",
        capacity: "5 tons",
        status: "available" as const,
        driver: "Albert Flores",
        location: "Los Angeles, CA",
        lastMaintenance: "2024-01-10",
        totalDeliveries: 156,
        fuelLevel: 85
    },
    {
        id: "TRK-002",
        model: "Chevrolet Silverado 3500",
        licensePlate: "XYZ-789",
        capacity: "3 tons",
        status: "in_use" as const,
        driver: "Mike Johnson",
        location: "Houston, TX",
        lastMaintenance: "2024-01-08",
        totalDeliveries: 89,
        fuelLevel: 45
    },
    {
        id: "TRK-003",
        model: "Dodge Ram 3500",
        licensePlate: "DEF-456",
        capacity: "4 tons",
        status: "maintenance" as const,
        driver: "Unassigned",
        location: "Chicago, IL",
        lastMaintenance: "2024-01-15",
        totalDeliveries: 234,
        fuelLevel: 20
    },
    {
        id: "TRK-004",
        model: "GMC Sierra 3500",
        licensePlate: "GHI-789",
        capacity: "6 tons",
        status: "available" as const,
        driver: "Unassigned",
        location: "Phoenix, AZ",
        lastMaintenance: "2024-01-12",
        totalDeliveries: 67,
        fuelLevel: 90
    }
];

const AdminTrucks = () => {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground font-heading">Truck Management</h1>
                    <p className="text-muted-foreground">Manage your fleet of delivery trucks</p>
                </div>
                <Button className="bg-gradient-primary hover:bg-primary-hover">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Truck
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="card-elevated">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Trucks
                        </CardTitle>
                        <Truck className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{mockTrucks.length}</div>
                        <p className="text-xs text-muted-foreground">In fleet</p>
                    </CardContent>
                </Card>

                <Card className="card-elevated">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Available
                        </CardTitle>
                        <Truck className="h-4 w-4 text-success" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {mockTrucks.filter(t => t.status === 'available').length}
                        </div>
                        <p className="text-xs text-success">Ready for delivery</p>
                    </CardContent>
                </Card>

                <Card className="card-elevated">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            In Use
                        </CardTitle>
                        <Truck className="h-4 w-4 text-logistics-blue" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {mockTrucks.filter(t => t.status === 'in_use').length}
                        </div>
                        <p className="text-xs text-logistics-blue">Currently delivering</p>
                    </CardContent>
                </Card>

                <Card className="card-elevated">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Maintenance
                        </CardTitle>
                        <Truck className="h-4 w-4 text-warning" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {mockTrucks.filter(t => t.status === 'maintenance').length}
                        </div>
                        <p className="text-xs text-warning">Under maintenance</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Search */}
            <Card className="card-elevated">
                <CardHeader>
                    <CardTitle>Filter & Search</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    placeholder="Search by truck ID, model, or license plate..."
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select defaultValue="all">
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="available">Available</SelectItem>
                                <SelectItem value="in_use">In Use</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select defaultValue="all">
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="id">Truck ID</SelectItem>
                                <SelectItem value="deliveries">Total Deliveries</SelectItem>
                                <SelectItem value="maintenance">Last Maintenance</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Trucks List */}
            <div className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground font-heading">Fleet Overview</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {mockTrucks.map((truck) => (
                        <Card key={truck.id} className="card-elevated group hover:shadow-lg transition-all duration-300">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Truck className="h-5 w-5 text-primary" />
                                        <span className="font-semibold">{truck.id}</span>
                                    </div>
                                    <Badge className={
                                        truck.status === 'available' ? 'bg-success/10 text-success border-success/20' :
                                            truck.status === 'in_use' ? 'bg-logistics-blue/10 text-logistics-blue border-logistics-blue/20' :
                                                'bg-warning/10 text-warning border-warning/20'
                                    }>
                                        {truck.status.replace('_', ' ').charAt(0).toUpperCase() + truck.status.replace('_', ' ').slice(1)}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Model:</span>
                                        <span className="font-medium">{truck.model}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">License:</span>
                                        <span className="font-medium">{truck.licensePlate}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Capacity:</span>
                                        <span className="font-medium">{truck.capacity}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Driver:</span>
                                        <span className="font-medium">{truck.driver}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Location:</span>
                                        <span className="font-medium">{truck.location}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Deliveries:</span>
                                        <p className="font-medium">{truck.totalDeliveries}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Fuel:</span>
                                        <p className="font-medium">{truck.fuelLevel}%</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t">
                                    <div className="text-sm text-muted-foreground">
                                        Last maintenance: {truck.lastMaintenance}
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Button variant="outline" size="sm" className="flex-1">
                                        <Eye className="h-4 w-4 mr-1" />
                                        View
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1">
                                        <Edit className="h-4 w-4 mr-1" />
                                        Edit
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1">
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Remove
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center space-x-2 pt-4">
                <Button variant="outline" size="sm" disabled>
                    Previous
                </Button>
                <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
                    1
                </Button>
                <Button variant="outline" size="sm">
                    2
                </Button>
                <Button variant="outline" size="sm">
                    3
                </Button>
                <Button variant="outline" size="sm">
                    Next
                </Button>
            </div>
        </div>
    );
};

export default AdminTrucks;
