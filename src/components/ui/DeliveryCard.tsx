import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    MapPin,
    Clock,
    Phone,
    Package,
    Navigation,
    CheckCircle,
    Star
} from 'lucide-react';

interface DeliveryCardProps {
    delivery: {
        id: string;
        cargo: string;
        from: string;
        to: string;
        client: string;
        phone: string;
        status: string;
        priority: string;
        estimatedTime?: string;
        distance?: string;
        completedAt?: string;
        rating?: number;
        earnings?: string;
    };
    onViewDetails: (delivery: any) => void;
    onNavigate?: () => void;
    onCallClient?: () => void;
    onMarkDelivered?: () => void;
    onStartPickup?: () => void;
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'in_transit': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'pickup_scheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
        case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

export function DeliveryCard({
    delivery,
    onViewDetails,
    onNavigate,
    onCallClient,
    onMarkDelivered,
    onStartPickup
}: DeliveryCardProps) {
    const isCompleted = delivery.status === 'delivered';

    const handleCardClick = (e: React.MouseEvent) => {
        // Don't trigger card click if clicking on action buttons
        if ((e.target as HTMLElement).closest('button')) {
            return;
        }
        onViewDetails(delivery);
    };

    return (
        <Card
            className="card-elevated hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            onClick={handleCardClick}
        >
            <CardContent className="p-6">
                <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="font-semibold text-lg">{delivery.id}</span>
                                <Badge className={`border ${getStatusColor(delivery.status)}`}>
                                    {delivery.status.replace('_', ' ').toUpperCase()}
                                </Badge>
                                {!isCompleted && (
                                    <Badge className={`border ${getPriorityColor(delivery.priority)}`}>
                                        {delivery.priority.toUpperCase()}
                                    </Badge>
                                )}
                            </div>
                            <h3 className="font-medium text-foreground text-lg">{delivery.cargo}</h3>
                        </div>
                    </div>

                    {/* Route Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-primary" />
                                <span className="text-sm">
                                    <span className="font-medium">{delivery.from}</span> → <span className="font-medium">{delivery.to}</span>
                                </span>
                            </div>
                            {delivery.distance && (
                                <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{delivery.distance}</span>
                                </div>
                            )}
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm">
                                    <span className="text-muted-foreground">Client:</span> {delivery.client}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{delivery.phone}</span>
                            </div>
                            {delivery.estimatedTime && (
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{delivery.estimatedTime}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Completion Details for completed deliveries */}
                    {isCompleted && (
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-800">Completed at {delivery.completedAt}</span>
                                </div>
                                {delivery.rating && (
                                    <div className="flex items-center gap-1">
                                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                        <span className="text-sm text-green-700">{delivery.rating}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons for active deliveries */}
                    {!isCompleted && (
                        <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t">
                            {delivery.status === 'in_transit' && (
                                <>
                                    <Button
                                        size="lg"
                                        className="flex-1 h-12 sm:h-10"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onNavigate?.();
                                        }}
                                    >
                                        <Navigation className="h-4 w-4 mr-2" />
                                        Navigate
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="flex-1 h-12 sm:h-10"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onCallClient?.();
                                        }}
                                    >
                                        <Phone className="h-4 w-4 mr-2" />
                                        Call Client
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="flex-1 h-12 sm:h-10"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onMarkDelivered?.();
                                        }}
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Mark Delivered
                                    </Button>
                                </>
                            )}
                            {delivery.status === 'pickup_scheduled' && (
                                <>
                                    <Button
                                        size="lg"
                                        className="flex-1 h-12 sm:h-10"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onStartPickup?.();
                                        }}
                                    >
                                        <Navigation className="h-4 w-4 mr-2" />
                                        Start Pickup
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="flex-1 h-12 sm:h-10"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onCallClient?.();
                                        }}
                                    >
                                        <Phone className="h-4 w-4 mr-2" />
                                        Call Client
                                    </Button>
                                </>
                            )}
                        </div>
                    )}

                    {/* Urgent Warning */}
                    {delivery.priority === 'urgent' && !isCompleted && (
                        <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <span>Urgent delivery - requires immediate attention</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
