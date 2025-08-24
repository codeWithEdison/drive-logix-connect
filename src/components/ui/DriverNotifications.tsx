import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Bell,
    Package,
    Truck,
    AlertCircle,
    CheckCircle,
    Clock,
    X,
    MapPin,
    Phone,
    MessageCircle,
    Settings
} from 'lucide-react';

interface Notification {
    id: string;
    type: 'assignment' | 'status_change' | 'reminder' | 'alert' | 'system';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    action?: {
        type: 'navigate' | 'call' | 'accept' | 'reject' | 'view';
        label: string;
        data?: any;
    };
    metadata?: {
        cargoId?: string;
        clientName?: string;
        location?: string;
        phone?: string;
    };
}

interface DriverNotificationsProps {
    notifications?: Notification[];
    onMarkAsRead?: (notificationId: string) => void;
    onMarkAllAsRead?: () => void;
    onAction?: (action: string, data?: any) => void;
    onClearAll?: () => void;
    className?: string;
}

// Mock notifications for demonstration
const mockNotifications: Notification[] = [
    {
        id: '1',
        type: 'assignment',
        title: 'New Cargo Assignment',
        message: 'You have been assigned cargo #DEL-001 from Kigali to Butare',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        read: false,
        priority: 'high',
        action: {
            type: 'accept',
            label: 'Accept Assignment'
        },
        metadata: {
            cargoId: 'DEL-001',
            clientName: 'John Doe',
            location: 'Kigali → Butare',
            phone: '+250 781 234567'
        }
    },
    {
        id: '2',
        type: 'reminder',
        title: 'Pickup Reminder',
        message: 'Cargo #DEL-002 pickup is scheduled in 30 minutes',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        read: false,
        priority: 'medium',
        action: {
            type: 'navigate',
            label: 'Navigate to Pickup'
        },
        metadata: {
            cargoId: 'DEL-002',
            location: 'Kigali, Gasabo District'
        }
    },
    {
        id: '3',
        type: 'status_change',
        title: 'Cargo Status Updated',
        message: 'Cargo #DEL-003 has been marked as "In Transit"',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        read: true,
        priority: 'low',
        action: {
            type: 'view',
            label: 'View Details'
        },
        metadata: {
            cargoId: 'DEL-003'
        }
    },
    {
        id: '4',
        type: 'alert',
        title: 'Traffic Alert',
        message: 'Heavy traffic reported on route to Butare. Consider alternative route.',
        timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
        read: false,
        priority: 'urgent',
        action: {
            type: 'navigate',
            label: 'View Route'
        }
    },
    {
        id: '5',
        type: 'system',
        title: 'System Maintenance',
        message: 'Scheduled maintenance tonight from 2:00 AM to 4:00 AM',
        timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        read: true,
        priority: 'low'
    }
];

export function DriverNotifications({
    notifications = mockNotifications,
    onMarkAsRead,
    onMarkAllAsRead,
    onAction,
    onClearAll,
    className = ''
}: DriverNotificationsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [localNotifications, setLocalNotifications] = useState<Notification[]>(notifications);

    const unreadCount = localNotifications.filter(n => !n.read).length;

    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'assignment':
                return <Package className="h-5 w-5 text-blue-600" />;
            case 'status_change':
                return <Truck className="h-5 w-5 text-green-600" />;
            case 'reminder':
                return <Clock className="h-5 w-5 text-yellow-600" />;
            case 'alert':
                return <AlertCircle className="h-5 w-5 text-red-600" />;
            case 'system':
                return <Settings className="h-5 w-5 text-gray-600" />;
            default:
                return <Bell className="h-5 w-5 text-gray-600" />;
        }
    };

    const getPriorityColor = (priority: Notification['priority']) => {
        switch (priority) {
            case 'urgent':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'high':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatTimeAgo = (timestamp: Date) => {
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
    };

    const handleMarkAsRead = (notificationId: string) => {
        setLocalNotifications(prev =>
            prev.map(n =>
                n.id === notificationId ? { ...n, read: true } : n
            )
        );
        onMarkAsRead?.(notificationId);
    };

    const handleMarkAllAsRead = () => {
        setLocalNotifications(prev =>
            prev.map(n => ({ ...n, read: true }))
        );
        onMarkAllAsRead?.();
    };

    const handleAction = (notification: Notification) => {
        if (notification.action) {
            onAction?.(notification.action.type, notification.action.data);
        }
        handleMarkAsRead(notification.id);
    };

    const handleClearAll = () => {
        setLocalNotifications([]);
        onClearAll?.();
    };

    return (
        <div className={`relative ${className}`}>
            {/* Notification Bell */}
            <Button
                variant="ghost"
                size="sm"
                className="relative p-2"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                )}
            </Button>

            {/* Notifications Panel */}
            {isOpen && (
                <Card className="absolute right-0 top-12 w-80 z-50 shadow-xl border">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Notifications</CardTitle>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleMarkAllAsRead}
                                    >
                                        Mark all read
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {localNotifications.length === 0 ? (
                            <div className="p-6 text-center">
                                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No notifications</p>
                            </div>
                        ) : (
                            <ScrollArea className="h-96">
                                <div className="space-y-1 p-2">
                                    {localNotifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`p-3 rounded-lg border transition-colors cursor-pointer ${notification.read
                                                ? 'bg-gray-50 border-gray-200'
                                                : 'bg-white border-blue-200 shadow-sm'
                                                } hover:bg-gray-50`}
                                            onClick={() => handleMarkAsRead(notification.id)}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 mt-1">
                                                    {getNotificationIcon(notification.type)}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1">
                                                            <h4 className={`text-sm font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'
                                                                }`}>
                                                                {notification.title}
                                                            </h4>
                                                            <p className="text-xs text-gray-600 mt-1">
                                                                {notification.message}
                                                            </p>

                                                            {/* Metadata */}
                                                            {notification.metadata && (
                                                                <div className="mt-2 space-y-1">
                                                                    {notification.metadata.cargoId && (
                                                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                                                            <Package className="h-3 w-3" />
                                                                            <span>{notification.metadata.cargoId}</span>
                                                                        </div>
                                                                    )}
                                                                    {notification.metadata.location && (
                                                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                                                            <MapPin className="h-3 w-3" />
                                                                            <span>{notification.metadata.location}</span>
                                                                        </div>
                                                                    )}
                                                                    {notification.metadata.phone && (
                                                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                                                            <Phone className="h-3 w-3" />
                                                                            <span>{notification.metadata.phone}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex flex-col items-end gap-2">
                                                            <Badge className={`text-xs border ${getPriorityColor(notification.priority)}`}>
                                                                {notification.priority}
                                                            </Badge>
                                                            <span className="text-xs text-gray-400">
                                                                {formatTimeAgo(notification.timestamp)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Action Button */}
                                                    {notification.action && (
                                                        <div className="mt-3">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="w-full"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleAction(notification);
                                                                }}
                                                            >
                                                                {notification.action.label}
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}

                        {/* Footer */}
                        {localNotifications.length > 0 && (
                            <div className="p-3 border-t bg-gray-50">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full"
                                    onClick={handleClearAll}
                                >
                                    Clear All Notifications
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
