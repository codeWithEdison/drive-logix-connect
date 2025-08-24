import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreVertical, Eye, Edit, Trash2, MapPin, Gauge, Package, User, Truck } from "lucide-react";

export interface Truck {
    id: string;
    model: string;
    licensePlate: string;
    capacity: string;
    status: 'available' | 'in_use' | 'maintenance' | 'out_of_service';
    driver: string;
    location: string;
    lastMaintenance: string;
    totalDeliveries: number;
    fuelLevel: number;
    year: string;
    manufacturer: string;
    engineType: string;
    mileage: number;
    insuranceExpiry: string;
    registrationExpiry: string;
    is_active: boolean;
}

export interface TruckTableProps {
    trucks: Truck[];
    title?: string;
    showSearch?: boolean;
    showFilters?: boolean;
    showPagination?: boolean;
    itemsPerPage?: number;
    onViewDetails?: (truck: Truck) => void;
    onEditTruck?: (truck: Truck) => void;
    onDeleteTruck?: (truckId: string) => void;
    onTrackTruck?: (truckId: string) => void;
    onAssignDriver?: (truckId: string) => void;
    onScheduleMaintenance?: (truckId: string) => void;
    customActions?: React.ReactNode;
}

export function TruckTable({
    trucks,
    title = "Trucks",
    showSearch = true,
    showFilters = true,
    showPagination = true,
    itemsPerPage = 10,
    onViewDetails,
    onEditTruck,
    onDeleteTruck,
    onTrackTruck,
    onAssignDriver,
    onScheduleMaintenance,
    customActions
}: TruckTableProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "available" | "in_use" | "maintenance" | "out_of_service">("all");
    const [currentPage, setCurrentPage] = useState(1);

    const filteredTrucks = trucks.filter((truck) => {
        const matchesSearch =
            truck.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
            truck.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
            truck.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            truck.driver.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "all" || truck.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredTrucks.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentTrucks = filteredTrucks.slice(startIndex, endIndex);

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

    const handleRowClick = (truck: Truck) => {
        if (onViewDetails) {
            onViewDetails(truck);
        }
    };

    const getActions = (truck: Truck) => {
        const actions = [];

        if (onViewDetails) {
            actions.push({
                key: "view",
                label: "View Details",
                icon: <Eye className="h-3 w-3 mr-1" />,
                onClick: () => onViewDetails(truck),
                variant: "outline" as const
            });
        }

        if (onEditTruck) {
            actions.push({
                key: "edit",
                label: "Edit Truck",
                icon: <Edit className="h-3 w-3 mr-1" />,
                onClick: () => onEditTruck(truck),
                variant: "outline" as const
            });
        }

        if (onTrackTruck) {
            actions.push({
                key: "track",
                label: "Track Location",
                icon: <MapPin className="h-3 w-3 mr-1" />,
                onClick: () => onTrackTruck(truck.id),
                variant: "outline" as const
            });
        }

        if (onAssignDriver) {
            actions.push({
                key: "assign",
                label: "Assign Driver",
                icon: <User className="h-3 w-3 mr-1" />,
                onClick: () => onAssignDriver(truck.id),
                variant: "outline" as const
            });
        }

        if (onScheduleMaintenance) {
            actions.push({
                key: "maintenance",
                label: "Schedule Maintenance",
                icon: <Gauge className="h-3 w-3 mr-1" />,
                onClick: () => onScheduleMaintenance(truck.id),
                variant: "outline" as const
            });
        }

        if (onDeleteTruck) {
            actions.push({
                key: "delete",
                label: "Delete",
                icon: <Trash2 className="h-3 w-3 mr-1" />,
                onClick: () => onDeleteTruck(truck.id),
                variant: "outline" as const,
                className: "text-red-600"
            });
        }

        return actions;
    };

    const renderActions = (truck: Truck) => {
        const actions = getActions(truck);

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {actions.map((action) => (
                        <DropdownMenuItem
                            key={action.key}
                            onClick={(e) => {
                                e.stopPropagation();
                                action.onClick();
                            }}
                            className={action.className}
                        >
                            {action.icon}
                            {action.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">{title}</h1>
                    <p className="text-muted-foreground">Manage and track all fleet trucks</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-600">
                        {filteredTrucks.length} Trucks
                    </Badge>
                    {customActions}
                </div>
            </div>

            {/* Filters and Search */}
            {(showSearch || showFilters) && (
                <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            {showSearch && (
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search by model, license plate, or driver..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            )}
                            {showFilters && (
                                <div className="flex gap-2">
                                    <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Filter by status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="available">Available</SelectItem>
                                            <SelectItem value="in_use">In Use</SelectItem>
                                            <SelectItem value="maintenance">Maintenance</SelectItem>
                                            <SelectItem value="out_of_service">Out of Service</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Trucks Table */}
            <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
                <CardHeader className="pb-4">
                    <CardTitle className="text-gray-900">{title}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-xs font-medium text-gray-600">Truck</TableHead>
                                    <TableHead className="text-xs font-medium text-gray-600">Driver</TableHead>
                                    <TableHead className="text-xs font-medium text-gray-600">Status</TableHead>
                                    <TableHead className="text-xs font-medium text-gray-600">Fuel</TableHead>
                                    <TableHead className="text-xs font-medium text-gray-600">Deliveries</TableHead>
                                    <TableHead className="text-xs font-medium text-gray-600">Location</TableHead>
                                    <TableHead className="text-xs font-medium text-gray-600">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentTrucks.map((truck) => (
                                    <TableRow
                                        key={truck.id}
                                        className="hover:bg-gray-50 cursor-pointer"
                                        onClick={() => handleRowClick(truck)}
                                    >
                                        <TableCell>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{truck.model}</p>
                                                <p className="text-xs text-gray-500">{truck.licensePlate}</p>
                                                <p className="text-xs text-gray-500">{truck.capacity}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{truck.driver}</p>
                                                <p className="text-xs text-gray-500">Assigned</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(truck.status)}
                                        </TableCell>
                                        <TableCell>
                                            {getFuelLevelBadge(truck.fuelLevel)}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{truck.totalDeliveries}</p>
                                                <p className="text-xs text-gray-500">total</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <span className="text-sm text-gray-700">{truck.location}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {renderActions(truck)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
