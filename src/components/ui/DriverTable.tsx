import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreVertical, Eye, Edit, Trash2, Phone, Navigation, Download, Star, Truck } from "lucide-react";

export interface Driver {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    license_number: string;
    license_expiry: string;
    license_type: 'A' | 'B' | 'C' | 'D' | 'E';
    date_of_birth: string;
    emergency_contact: string;
    emergency_phone: string;
    blood_type: string;
    medical_certificate_expiry: string;
    status: 'available' | 'on_duty' | 'unavailable' | 'suspended';
    rating: number;
    total_deliveries: number;
    total_distance_km: number;
    location: string;
    registeredDate: string;
    lastActive: string;
    avatar_url?: string;
    is_active: boolean;
    is_verified: boolean;
}

export interface DriverTableProps {
    drivers: Driver[];
    title?: string;
    showSearch?: boolean;
    showFilters?: boolean;
    showPagination?: boolean;
    itemsPerPage?: number;
    onViewDetails?: (driver: Driver) => void;
    onEditDriver?: (driver: Driver) => void;
    onDeleteDriver?: (driverId: string) => void;
    onCallDriver?: (phone: string) => void;
    onTrackDriver?: (driverId: string) => void;
    onDownloadDocuments?: (driverId: string) => void;
    onSuspendDriver?: (driverId: string) => void;
    onActivateDriver?: (driverId: string) => void;
    customActions?: React.ReactNode;
}

export function DriverTable({
    drivers,
    title = "Drivers",
    showSearch = true,
    showFilters = true,
    showPagination = true,
    itemsPerPage = 10,
    onViewDetails,
    onEditDriver,
    onDeleteDriver,
    onCallDriver,
    onTrackDriver,
    onDownloadDocuments,
    onSuspendDriver,
    onActivateDriver,
    customActions
}: DriverTableProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "available" | "on_duty" | "unavailable" | "suspended">("all");
    const [currentPage, setCurrentPage] = useState(1);

    const filteredDrivers = drivers.filter((driver) => {
        const matchesSearch =
            driver.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            driver.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
            driver.license_number.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "all" || driver.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentDrivers = filteredDrivers.slice(startIndex, endIndex);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "available":
                return <Badge className="bg-green-100 text-green-600">Available</Badge>;
            case "on_duty":
                return <Badge className="bg-blue-100 text-blue-600">On Duty</Badge>;
            case "unavailable":
                return <Badge className="bg-yellow-100 text-yellow-600">Unavailable</Badge>;
            case "suspended":
                return <Badge className="bg-red-100 text-red-600">Suspended</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-600">{status}</Badge>;
        }
    };

    const getLicenseTypeBadge = (licenseType: string) => {
        return <Badge className="bg-purple-100 text-purple-600">{licenseType}</Badge>;
    };

    const getRatingStars = (rating: number) => {
        return (
            <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{rating.toFixed(1)}</span>
            </div>
        );
    };

    const handleRowClick = (driver: Driver) => {
        if (onViewDetails) {
            onViewDetails(driver);
        }
    };

    const getActions = (driver: Driver) => {
        const actions = [];

        if (onViewDetails) {
            actions.push({
                key: "view",
                label: "View Details",
                icon: <Eye className="h-3 w-3 mr-1" />,
                onClick: () => onViewDetails(driver),
                variant: "outline" as const
            });
        }

        if (onEditDriver) {
            actions.push({
                key: "edit",
                label: "Edit Driver",
                icon: <Edit className="h-3 w-3 mr-1" />,
                onClick: () => onEditDriver(driver),
                variant: "outline" as const
            });
        }

        if (onCallDriver) {
            actions.push({
                key: "call",
                label: "Call Driver",
                icon: <Phone className="h-3 w-3 mr-1" />,
                onClick: () => onCallDriver(driver.phone),
                variant: "outline" as const
            });
        }

        if (onTrackDriver) {
            actions.push({
                key: "track",
                label: "Track Location",
                icon: <Navigation className="h-3 w-3 mr-1" />,
                onClick: () => onTrackDriver(driver.id),
                variant: "outline" as const
            });
        }

        if (onDownloadDocuments) {
            actions.push({
                key: "documents",
                label: "Download Docs",
                icon: <Download className="h-3 w-3 mr-1" />,
                onClick: () => onDownloadDocuments(driver.id),
                variant: "outline" as const
            });
        }

        if (driver.status === 'suspended' && onActivateDriver) {
            actions.push({
                key: "activate",
                label: "Activate",
                icon: <Star className="h-3 w-3 mr-1" />,
                onClick: () => onActivateDriver(driver.id),
                variant: "default" as const,
                className: "text-green-600"
            });
        } else if (driver.status !== 'suspended' && onSuspendDriver) {
            actions.push({
                key: "suspend",
                label: "Suspend",
                icon: <Truck className="h-3 w-3 mr-1" />,
                onClick: () => onSuspendDriver(driver.id),
                variant: "outline" as const,
                className: "text-red-600"
            });
        }

        if (onDeleteDriver) {
            actions.push({
                key: "delete",
                label: "Delete",
                icon: <Trash2 className="h-3 w-3 mr-1" />,
                onClick: () => onDeleteDriver(driver.id),
                variant: "outline" as const,
                className: "text-red-600"
            });
        }

        return actions;
    };

    const renderActions = (driver: Driver) => {
        const actions = getActions(driver);

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
                    <p className="text-muted-foreground">Manage and track all registered drivers</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-600">
                        {filteredDrivers.length} Drivers
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
                                            placeholder="Search by name, email, phone, or license..."
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
                                            <SelectItem value="on_duty">On Duty</SelectItem>
                                            <SelectItem value="unavailable">Unavailable</SelectItem>
                                            <SelectItem value="suspended">Suspended</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Drivers Table */}
            <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
                <CardHeader className="pb-4">
                    <CardTitle className="text-gray-900">{title}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-xs font-medium text-gray-600">Driver</TableHead>
                                    <TableHead className="text-xs font-medium text-gray-600">License</TableHead>
                                    <TableHead className="text-xs font-medium text-gray-600">Status</TableHead>
                                    <TableHead className="text-xs font-medium text-gray-600">Rating</TableHead>
                                    <TableHead className="text-xs font-medium text-gray-600">Deliveries</TableHead>
                                    <TableHead className="text-xs font-medium text-gray-600">Location</TableHead>
                                    <TableHead className="text-xs font-medium text-gray-600">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentDrivers.map((driver) => (
                                    <TableRow
                                        key={driver.id}
                                        className="hover:bg-gray-50 cursor-pointer"
                                        onClick={() => handleRowClick(driver)}
                                    >
                                        <TableCell>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{driver.full_name}</p>
                                                <p className="text-xs text-gray-500">{driver.email}</p>
                                                <p className="text-xs text-gray-500">{driver.phone}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{driver.license_number}</p>
                                                {getLicenseTypeBadge(driver.license_type)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(driver.status)}
                                        </TableCell>
                                        <TableCell>
                                            {getRatingStars(driver.rating)}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{driver.total_deliveries}</p>
                                                <p className="text-xs text-gray-500">{driver.total_distance_km.toFixed(0)} km</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <span className="text-sm text-gray-700">{driver.location}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {renderActions(driver)}
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
