import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreVertical, Eye, Edit, Trash2, Phone, Download, Building, User } from "lucide-react";

export interface Client {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    company_name?: string;
    business_type: 'individual' | 'corporate' | 'government';
    tax_id?: string;
    address: string;
    city: string;
    country: string;
    postal_code?: string;
    contact_person?: string;
    credit_limit: number;
    payment_terms: number;
    status: 'active' | 'pending' | 'inactive' | 'suspended';
    location: string;
    registeredDate: string;
    lastActive: string;
    totalCargos: number;
    avatar_url?: string;
    is_active: boolean;
    is_verified: boolean;
}

export interface ClientTableProps {
    clients: Client[];
    title?: string;
    showSearch?: boolean;
    showFilters?: boolean;
    showPagination?: boolean;
    itemsPerPage?: number;
    onViewDetails?: (client: Client) => void;
    onEditClient?: (client: Client) => void;
    onDeleteClient?: (clientId: string) => void;
    onCallClient?: (phone: string) => void;
    onDownloadDocuments?: (clientId: string) => void;
    onSuspendClient?: (clientId: string) => void;
    onActivateClient?: (clientId: string) => void;
    customActions?: React.ReactNode;
}

export function ClientTable({
    clients,
    title = "Clients",
    showSearch = true,
    showFilters = true,
    showPagination = true,
    itemsPerPage = 10,
    onViewDetails,
    onEditClient,
    onDeleteClient,
    onCallClient,
    onDownloadDocuments,
    onSuspendClient,
    onActivateClient,
    customActions
}: ClientTableProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending" | "inactive" | "suspended">("all");
    const [currentPage, setCurrentPage] = useState(1);

    const filteredClients = clients.filter((client) => {
        const matchesSearch =
            client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (client.company_name && client.company_name.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === "all" || client.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentClients = filteredClients.slice(startIndex, endIndex);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return <Badge className="bg-green-100 text-green-600">Active</Badge>;
            case "pending":
                return <Badge className="bg-yellow-100 text-yellow-600">Pending</Badge>;
            case "inactive":
                return <Badge className="bg-gray-100 text-gray-600">Inactive</Badge>;
            case "suspended":
                return <Badge className="bg-red-100 text-red-600">Suspended</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-600">{status}</Badge>;
        }
    };

    const getBusinessTypeBadge = (businessType: string) => {
        switch (businessType) {
            case "corporate":
                return <Badge className="bg-blue-100 text-blue-600">Corporate</Badge>;
            case "government":
                return <Badge className="bg-purple-100 text-purple-600">Government</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-600">Individual</Badge>;
        }
    };

    const handleRowClick = (client: Client) => {
        if (onViewDetails) {
            onViewDetails(client);
        }
    };

    const getActions = (client: Client) => {
        const actions = [];

        if (onViewDetails) {
            actions.push({
                key: "view",
                label: "View Details",
                icon: <Eye className="h-3 w-3 mr-1" />,
                onClick: () => onViewDetails(client),
                variant: "outline" as const
            });
        }

        if (onEditClient) {
            actions.push({
                key: "edit",
                label: "Edit Client",
                icon: <Edit className="h-3 w-3 mr-1" />,
                onClick: () => onEditClient(client),
                variant: "outline" as const
            });
        }

        if (onCallClient) {
            actions.push({
                key: "call",
                label: "Call Client",
                icon: <Phone className="h-3 w-3 mr-1" />,
                onClick: () => onCallClient(client.phone),
                variant: "outline" as const
            });
        }

        if (onDownloadDocuments) {
            actions.push({
                key: "documents",
                label: "Download Docs",
                icon: <Download className="h-3 w-3 mr-1" />,
                onClick: () => onDownloadDocuments(client.id),
                variant: "outline" as const
            });
        }

        if (client.status === 'suspended' && onActivateClient) {
            actions.push({
                key: "activate",
                label: "Activate",
                icon: <User className="h-3 w-3 mr-1" />,
                onClick: () => onActivateClient(client.id),
                variant: "default" as const,
                className: "text-green-600"
            });
        } else if (client.status !== 'suspended' && onSuspendClient) {
            actions.push({
                key: "suspend",
                label: "Suspend",
                icon: <Building className="h-3 w-3 mr-1" />,
                onClick: () => onSuspendClient(client.id),
                variant: "outline" as const,
                className: "text-red-600"
            });
        }

        if (onDeleteClient) {
            actions.push({
                key: "delete",
                label: "Delete",
                icon: <Trash2 className="h-3 w-3 mr-1" />,
                onClick: () => onDeleteClient(client.id),
                variant: "outline" as const,
                className: "text-red-600"
            });
        }

        return actions;
    };

    const renderActions = (client: Client) => {
        const actions = getActions(client);

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
                    <p className="text-muted-foreground">Manage all registered clients</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-600">
                        {filteredClients.length} Clients
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
                                            placeholder="Search by name, email, phone, or company..."
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
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="suspended">Suspended</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Clients Table */}
            <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
                <CardHeader className="pb-4">
                    <CardTitle className="text-gray-900">{title}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-xs font-medium text-gray-600">Client</TableHead>
                                    <TableHead className="text-xs font-medium text-gray-600">Business</TableHead>
                                    <TableHead className="text-xs font-medium text-gray-600">Status</TableHead>
                                    <TableHead className="text-xs font-medium text-gray-600">Cargos</TableHead>
                                    <TableHead className="text-xs font-medium text-gray-600">Location</TableHead>
                                    <TableHead className="text-xs font-medium text-gray-600">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentClients.map((client) => (
                                    <TableRow
                                        key={client.id}
                                        className="hover:bg-gray-50 cursor-pointer"
                                        onClick={() => handleRowClick(client)}
                                    >
                                        <TableCell>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{client.full_name}</p>
                                                <p className="text-xs text-gray-500">{client.email}</p>
                                                <p className="text-xs text-gray-500">{client.phone}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                {client.company_name && (
                                                    <p className="text-sm font-medium text-gray-900">{client.company_name}</p>
                                                )}
                                                {getBusinessTypeBadge(client.business_type)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(client.status)}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{client.totalCargos}</p>
                                                <p className="text-xs text-gray-500">total cargos</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <span className="text-sm text-gray-700">{client.city}, {client.country}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {renderActions(client)}
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
