import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Package,
    MapPin,
    Clock,
    CheckCircle,
    Search,
    Filter,
    Eye,
    Phone,
    Navigation,
    Calendar,
    Truck,
    User,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    MoreVertical,
    Camera,
    Upload,
    PenTool,
    AlertCircle,
    Star
} from "lucide-react";
import { DeliveryDetailModal } from "@/components/ui/DeliveryDetailModal";

// Delivery status configuration
const statusConfig = {
    active: {
        label: "Active",
        className: "bg-green-100 text-green-600",
    },
    in_transit: {
        label: "In Transit",
        className: "bg-blue-100 text-blue-600",
    },
    delivered: {
        label: "Delivered",
        className: "bg-gray-100 text-gray-600",
    },
    completed: {
        label: "Completed",
        className: "bg-blue-100 text-blue-600",
    }
};

// Priority configuration
const priorityConfig = {
    urgent: {
        label: "Urgent",
        className: "bg-red-100 text-red-600",
    },
    normal: {
        label: "Normal",
        className: "bg-gray-100 text-gray-600",
    },
    standard: {
        label: "Standard",
        className: "bg-gray-100 text-gray-600",
    }
};

export interface Delivery {
    id: string;
    cargo: string;
    from: string;
    to: string;
    client: string;
    phone: string;
    status: 'active' | 'in_transit' | 'delivered' | 'completed';
    priority: 'urgent' | 'normal' | 'standard';
    estimatedTime?: string;
    distance?: string;
    completedAt?: string;
    rating?: number;
    pickupContact?: string;
    pickupContactPhone?: string;
    deliveryContact?: string;
    deliveryContactPhone?: string;
}

export interface DeliveryTableProps {
    deliveries: Delivery[];
    title?: string;
    showStats?: boolean;
    showSearch?: boolean;
    showFilters?: boolean;
    showPagination?: boolean;
    itemsPerPage?: number;
    onViewDetails?: (delivery: Delivery) => void;
    onNavigate?: (delivery: Delivery) => void;
    onCallClient?: (phone: string) => void;
    onUploadLoadingPhotos?: (delivery: Delivery) => void;
    onUploadDeliveryPhotos?: (delivery: Delivery) => void;
    onUploadReceiptPhotos?: (delivery: Delivery) => void;
    onCaptureSignature?: (delivery: Delivery) => void;
    onReportIssue?: (delivery: Delivery) => void;
    onMarkDelivered?: (delivery: Delivery) => void;
    customActions?: React.ReactNode;
}

export function DeliveryTable({
    deliveries,
    title = "Deliveries",
    showStats = true,
    showSearch = true,
    showFilters = true,
    showPagination = true,
    itemsPerPage = 5,
    onViewDetails,
    onNavigate,
    onCallClient,
    onUploadLoadingPhotos,
    onUploadDeliveryPhotos,
    onUploadReceiptPhotos,
    onCaptureSignature,
    onReportIssue,
    onMarkDelivered,
    customActions
}: DeliveryTableProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "in_transit" | "delivered" | "completed">("all");
    const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const filteredDeliveries = deliveries.filter((delivery) => {
        const matchesSearch =
            delivery.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            delivery.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
            delivery.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            delivery.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
            delivery.to.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "all" || delivery.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Pagination
    const totalPages = Math.ceil(filteredDeliveries.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentDeliveries = filteredDeliveries.slice(startIndex, endIndex);

    const getStatusBadge = (status: string) => {
        const config = statusConfig[status as keyof typeof statusConfig];
        return config ? (
            <Badge className={config.className}>{config.label}</Badge>
        ) : (
            <Badge className="bg-gray-100 text-gray-600">{status}</Badge>
        );
    };

    const getPriorityBadge = (priority: string) => {
        const config = priorityConfig[priority as keyof typeof priorityConfig];
        return config ? (
            <Badge className={config.className}>{config.label}</Badge>
        ) : (
            <Badge className="bg-gray-100 text-gray-600">Standard</Badge>
        );
    };

    const handleRowClick = (delivery: Delivery) => {
        if (onViewDetails) {
            onViewDetails(delivery);
        } else {
            setSelectedDelivery(delivery);
            setIsModalOpen(true);
        }
    };

    const getStatusBasedActions = (delivery: Delivery) => {
        const actions = [];

        // Actions for active deliveries
        if (delivery.status === "active") {
            actions.push({
                key: "navigate",
                label: "Navigate",
                icon: <Navigation className="h-3 w-3 mr-1" />,
                onClick: () => onNavigate?.(delivery),
                variant: "default" as const
            });

            actions.push({
                key: "loading-photos",
                label: "Loading Photos",
                icon: <Camera className="h-3 w-3 mr-1" />,
                onClick: () => onUploadLoadingPhotos?.(delivery),
                variant: "outline" as const
            });
        }

        // Actions for in-transit deliveries
        if (delivery.status === "in_transit") {
            actions.push({
                key: "navigate",
                label: "Navigate",
                icon: <Navigation className="h-3 w-3 mr-1" />,
                onClick: () => onNavigate?.(delivery),
                variant: "default" as const
            });

            actions.push({
                key: "delivery-photos",
                label: "Delivery Photos",
                icon: <Camera className="h-3 w-3 mr-1" />,
                onClick: () => onUploadDeliveryPhotos?.(delivery),
                variant: "outline" as const
            });

            actions.push({
                key: "receipt-photos",
                label: "Receipt Photos",
                icon: <Upload className="h-3 w-3 mr-1" />,
                onClick: () => onUploadReceiptPhotos?.(delivery),
                variant: "outline" as const
            });

            actions.push({
                key: "signature",
                label: "Capture Signature",
                icon: <PenTool className="h-3 w-3 mr-1" />,
                onClick: () => onCaptureSignature?.(delivery),
                variant: "outline" as const
            });

            actions.push({
                key: "mark-delivered",
                label: "Mark Delivered",
                icon: <CheckCircle className="h-3 w-3 mr-1" />,
                onClick: () => onMarkDelivered?.(delivery),
                variant: "default" as const
            });
        }

        // Actions for all active/in-transit deliveries
        if (delivery.status === "active" || delivery.status === "in_transit") {
            actions.push({
                key: "call",
                label: "Call Client",
                icon: <Phone className="h-3 w-3 mr-1" />,
                onClick: () => onCallClient?.(delivery.phone),
                variant: "outline" as const
            });

            actions.push({
                key: "issue",
                label: "Report Issue",
                icon: <AlertCircle className="h-3 w-3 mr-1" />,
                onClick: () => onReportIssue?.(delivery),
                variant: "outline" as const,
                className: "text-red-600"
            });
        }

        return actions;
    };

    const renderActions = (delivery: Delivery) => {
        const actions = getStatusBasedActions(delivery);

        if (actions.length === 0) {
            return (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled
                >
                    <MoreVertical className="h-4 w-4" />
                </Button>
            );
        }

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

    const renderMobileCard = (delivery: Delivery, index: number) => {
        const isActive = delivery.status === "active" || delivery.status === "in_transit";
        const actions = getStatusBasedActions(delivery);

        return (
            <Card
                key={delivery.id}
                className="mb-4 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => handleRowClick(delivery)}
            >
                <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Package className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-900">{delivery.id}</span>
                                {getStatusBadge(delivery.status)}
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <User className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-700">{delivery.client}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            {delivery.status === "delivered" || delivery.status === "completed" ? (
                                <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 text-yellow-500" />
                                    <span className="text-sm font-bold text-gray-900">
                                        {delivery.rating || 0}
                                    </span>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{delivery.estimatedTime}</p>
                                    <p className="text-xs text-gray-500">{delivery.distance}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2 mb-3">
                        <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                                <p className="font-medium text-gray-900 truncate">{delivery.from}</p>
                                <p className="text-gray-500 text-xs">to</p>
                                <p className="font-medium text-blue-600 truncate">{delivery.to}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Navigation className="h-3 w-3" />
                            <span>{delivery.distance}</span>
                        </div>
                    </div>

                    <div className="mb-3">
                        {getPriorityBadge(delivery.priority)}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRowClick(delivery);
                            }}
                            className="flex items-center gap-1"
                        >
                            <Eye className="h-3 w-3" />
                            View Details
                        </Button>
                        {isActive && actions.length > 0 && (
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
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">{title}</h1>
                    <p className="text-muted-foreground">
                        Manage and track your delivery assignments
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-600">
                        {filteredDeliveries.length} Deliveries
                    </Badge>
                    {customActions}
                </div>
            </div>

            {/* Stats Cards */}
            {showStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total</p>
                                    <p className="text-2xl font-bold text-gray-900">{deliveries.length}</p>
                                </div>
                                <Truck className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {deliveries.filter(d => d.status === "active").length}
                                    </p>
                                </div>
                                <Navigation className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">In Transit</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {deliveries.filter(d => d.status === "in_transit").length}
                                    </p>
                                </div>
                                <Clock className="h-8 w-8 text-yellow-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Completed</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {deliveries.filter(d => d.status === "delivered" || d.status === "completed").length}
                                    </p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

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
                                            placeholder="Search by delivery ID, client, or location..."
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
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="in_transit">In Transit</SelectItem>
                                            <SelectItem value="delivered">Delivered</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Deliveries Table */}
            <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden hidden lg:block">
                <CardHeader className="pb-4">
                    <CardTitle className="text-gray-900">{title}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <div className="min-w-[800px]">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-xs font-medium text-gray-600 w-16">#</TableHead>
                                        <TableHead className="text-xs font-medium text-gray-600 w-24">Delivery ID</TableHead>
                                        <TableHead className="text-xs font-medium text-gray-600 w-32">Client</TableHead>
                                        <TableHead className="text-xs font-medium text-gray-600 w-48">Route</TableHead>
                                        <TableHead className="text-xs font-medium text-gray-600 w-24">Status</TableHead>
                                        <TableHead className="text-xs font-medium text-gray-600 w-24">Priority</TableHead>
                                        <TableHead className="text-xs font-medium text-gray-600 w-24">Time/Distance</TableHead>
                                        <TableHead className="text-xs font-medium text-gray-600 w-auto">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentDeliveries.map((delivery, index) => (
                                        <TableRow
                                            key={delivery.id}
                                            className="hover:bg-gray-50 cursor-pointer"
                                            onClick={() => handleRowClick(delivery)}
                                        >
                                            <TableCell className="text-sm text-gray-500">
                                                {startIndex + index + 1}
                                            </TableCell>
                                            <TableCell className="text-sm font-medium text-gray-900">
                                                {delivery.id}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{delivery.client}</p>
                                                    <p className="text-xs text-gray-500">{delivery.phone}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-xs">
                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                                        <div className="text-xs">
                                                            <p className="font-medium text-gray-900 truncate">{delivery.from}</p>
                                                            <p className="text-gray-500">to</p>
                                                            <p className="font-medium text-blue-600 truncate">{delivery.to}</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">{delivery.distance}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(delivery.status)}
                                            </TableCell>
                                            <TableCell>
                                                {getPriorityBadge(delivery.priority)}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    {delivery.status === "delivered" || delivery.status === "completed" ? (
                                                        <div className="flex items-center gap-1">
                                                            <Star className="h-3 w-3 text-yellow-500" />
                                                            <span className="text-sm font-bold text-gray-900">
                                                                {delivery.rating || 0}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <p className="text-sm font-bold text-gray-900">{delivery.estimatedTime}</p>
                                                            <p className="text-xs text-gray-500">{delivery.distance}</p>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {renderActions(delivery)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {showPagination && totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                            <div className="text-sm text-gray-500">
                                Showing {startIndex + 1} to {Math.min(endIndex, filteredDeliveries.length)} of {filteredDeliveries.length} results
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronsLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <Button
                                            key={page}
                                            variant={currentPage === page ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setCurrentPage(page)}
                                            className="w-8 h-8 p-0"
                                        >
                                            {page}
                                        </Button>
                                    ))}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronsRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Mobile Cards View */}
            <div className="lg:hidden">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
                </div>
                {currentDeliveries.map((delivery, index) => renderMobileCard(delivery, index))}

                {/* Mobile Pagination */}
                {showPagination && totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-gray-500">
                            {startIndex + 1}-{Math.min(endIndex, filteredDeliveries.length)} of {filteredDeliveries.length}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm text-gray-600">
                                {currentPage} / {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delivery Detail Modal */}
            <DeliveryDetailModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedDelivery(null);
                }}
                delivery={selectedDelivery}
                onCallClient={() => selectedDelivery && onCallClient?.(selectedDelivery.phone)}
                onNavigate={() => selectedDelivery && onNavigate?.(selectedDelivery)}
                onUploadPhoto={() => selectedDelivery && onUploadDeliveryPhotos?.(selectedDelivery)}
                onReportIssue={() => selectedDelivery && onReportIssue?.(selectedDelivery)}
            />
        </div>
    );
}
