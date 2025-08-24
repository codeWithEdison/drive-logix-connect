import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ModernModel from '@/components/modal/ModernModel';
import {
    User,
    Phone,
    Mail,
    MapPin,
    Building,
    Calendar,
    CheckCircle,
    AlertCircle,
    Download,
    Edit,
    Navigation
} from 'lucide-react';
import { Client } from './ClientTable';

interface ClientDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client | null;
    onCallClient?: (phone: string) => void;
    onEditClient?: (client: Client) => void;
    onDownloadDocuments?: (clientId: string) => void;
}

export function ClientDetailModal({
    isOpen,
    onClose,
    client,
    onCallClient,
    onEditClient,
    onDownloadDocuments
}: ClientDetailModalProps) {
    if (!client) return null;

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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('rw-RW', {
            style: 'currency',
            currency: 'RWF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <ModernModel
            isOpen={isOpen}
            onClose={onClose}
            title={`Client: ${client.full_name}`}
        >
            <div className="space-y-6">
                {/* Header Info */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{client.full_name}</h3>
                        <p className="text-sm text-gray-600">Client ID: {client.id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {getStatusBadge(client.status)}
                        {getBusinessTypeBadge(client.business_type)}
                    </div>
                </div>

                {/* Contact Information */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-4">
                            <User className="h-5 w-5 text-blue-600" />
                            <h4 className="font-semibold text-gray-900">Contact Information</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Email</p>
                                <p className="text-sm text-gray-900">{client.email}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Phone</p>
                                <p className="text-sm text-gray-900">{client.phone}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Location</p>
                                <p className="text-sm text-gray-900">{client.city}, {client.country}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Address</p>
                                <p className="text-sm text-gray-900">{client.address}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Business Information */}
                {client.company_name && (
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-4">
                                <Building className="h-5 w-5 text-green-600" />
                                <h4 className="font-semibold text-gray-900">Business Information</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Company Name</p>
                                    <p className="text-sm font-semibold text-gray-900">{client.company_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Business Type</p>
                                    {getBusinessTypeBadge(client.business_type)}
                                </div>
                                {client.tax_id && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Tax ID</p>
                                        <p className="text-sm text-gray-900">{client.tax_id}</p>
                                    </div>
                                )}
                                {client.contact_person && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Contact Person</p>
                                        <p className="text-sm text-gray-900">{client.contact_person}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Financial Information */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-4">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <h4 className="font-semibold text-gray-900">Financial Information</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <p className="text-2xl font-bold text-blue-600">{client.totalCargos}</p>
                                <p className="text-sm text-blue-600">Total Cargos</p>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                <p className="text-lg font-bold text-green-600">{formatCurrency(client.credit_limit)}</p>
                                <p className="text-sm text-green-600">Credit Limit</p>
                            </div>
                            <div className="text-center p-3 bg-yellow-50 rounded-lg">
                                <p className="text-2xl font-bold text-yellow-600">{client.payment_terms}</p>
                                <p className="text-sm text-yellow-600">Payment Terms (days)</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Account Information */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-4">
                            <Calendar className="h-5 w-5 text-purple-600" />
                            <h4 className="font-semibold text-gray-900">Account Information</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Registration Date</p>
                                <p className="text-sm text-gray-900">{client.registeredDate}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Last Active</p>
                                <p className="text-sm text-gray-900">{client.lastActive}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Account Status</p>
                                <p className="text-sm text-gray-900">
                                    {client.is_active ? 'Active' : 'Inactive'} • {client.is_verified ? 'Verified' : 'Unverified'}
                                </p>
                            </div>
                            {client.postal_code && (
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Postal Code</p>
                                    <p className="text-sm text-gray-900">{client.postal_code}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => onCallClient?.(client.phone)}
                        >
                            <Phone className="h-4 w-4 mr-2" />
                            Call Client
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => onEditClient?.(client)}
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Client
                        </Button>
                    </div>

                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => onDownloadDocuments?.(client.id)}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Download Documents
                    </Button>
                </div>
            </div>
        </ModernModel>
    );
}
