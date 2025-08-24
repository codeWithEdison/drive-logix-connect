import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Users,
    Search,
    Filter,
    Eye,
    Edit,
    Trash2,
    UserPlus,
    UserCheck,
    UserX,
    Mail,
    Phone,
    MapPin
} from 'lucide-react';
import { ApprovalModal } from '@/components/admin/ApprovalModal';

// Mock data for users and drivers
const mockUsers = [
    {
        id: "1",
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1 (555) 123-4567",
        role: "client" as const,
        status: "active" as const,
        location: "New York, NY",
        registeredDate: "2024-01-10",
        lastActive: "2024-01-15",
        totalCargos: 12
    },
    {
        id: "2",
        name: "Albert Flores",
        email: "albert.flores@example.com",
        phone: "+1 (555) 234-5678",
        role: "driver" as const,
        status: "active" as const,
        location: "Los Angeles, CA",
        registeredDate: "2024-01-08",
        lastActive: "2024-01-15",
        totalDeliveries: 45,
        rating: 4.8
    },
    {
        id: "3",
        name: "Sarah Wilson",
        email: "sarah.wilson@example.com",
        phone: "+1 (555) 345-6789",
        role: "client" as const,
        status: "pending" as const,
        location: "Chicago, IL",
        registeredDate: "2024-01-12",
        lastActive: "2024-01-14",
        totalCargos: 3
    },
    {
        id: "4",
        name: "Mike Johnson",
        email: "mike.johnson@example.com",
        phone: "+1 (555) 456-7890",
        role: "driver" as const,
        status: "inactive" as const,
        location: "Houston, TX",
        registeredDate: "2024-01-05",
        lastActive: "2024-01-10",
        totalDeliveries: 23,
        rating: 4.2
    },
    {
        id: "5",
        name: "Emily Davis",
        email: "emily.davis@example.com",
        phone: "+1 (555) 567-8901",
        role: "client" as const,
        status: "active" as const,
        location: "Phoenix, AZ",
        registeredDate: "2024-01-09",
        lastActive: "2024-01-15",
        totalCargos: 8
    }
];

const AdminUsers = () => {
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);

    const handleApprove = (id: string, type: string, reason?: string) => {
        console.log(`Approving ${type} with ID: ${id}`, reason);
        // TODO: Implement approval logic
    };

    const handleReject = (id: string, type: string, reason: string) => {
        console.log(`Rejecting ${type} with ID: ${id}`, reason);
        // TODO: Implement rejection logic
    };

    const handleViewApproval = (user: any) => {
        setSelectedUser(user);
        setIsApprovalModalOpen(true);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground font-heading">Users & Drivers</h1>
                    <p className="text-muted-foreground">Manage all registered users and drivers</p>
                </div>
                <Button className="bg-gradient-primary hover:bg-primary-hover">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add New User
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="card-elevated">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Users
                        </CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{mockUsers.length}</div>
                        <p className="text-xs text-muted-foreground">All registered users</p>
                    </CardContent>
                </Card>

                <Card className="card-elevated">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Active Users
                        </CardTitle>
                        <UserCheck className="h-4 w-4 text-success" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {mockUsers.filter(u => u.status === 'active').length}
                        </div>
                        <p className="text-xs text-success">Currently active</p>
                    </CardContent>
                </Card>

                <Card className="card-elevated">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Pending Approval
                        </CardTitle>
                        <UserX className="h-4 w-4 text-warning" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {mockUsers.filter(u => u.status === 'pending').length}
                        </div>
                        <p className="text-xs text-warning">Awaiting approval</p>
                    </CardContent>
                </Card>

                <Card className="card-elevated">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Drivers
                        </CardTitle>
                        <Users className="h-4 w-4 text-logistics-green" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {mockUsers.filter(u => u.role === 'driver').length}
                        </div>
                        <p className="text-xs text-logistics-green">Active drivers</p>
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
                                    placeholder="Search by name, email, or phone..."
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select defaultValue="all">
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="Filter by role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="client">Clients</SelectItem>
                                <SelectItem value="driver">Drivers</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select defaultValue="all">
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Users List */}
            <div className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground font-heading">All Users</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {mockUsers.map((user) => (
                        <Card key={user.id} className="card-elevated group hover:shadow-lg transition-all duration-300">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-primary" />
                                        <span className="font-semibold">{user.name}</span>
                                    </div>
                                    <Badge className={
                                        user.status === 'active' ? 'bg-success/10 text-success border-success/20' :
                                            user.status === 'pending' ? 'bg-warning/10 text-warning border-warning/20' :
                                                'bg-destructive/10 text-destructive border-destructive/20'
                                    }>
                                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Email:</span>
                                        <span className="font-medium truncate">{user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Phone:</span>
                                        <span className="font-medium">{user.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Location:</span>
                                        <span className="font-medium">{user.location}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Role:</span>
                                        <p className="font-medium capitalize">{user.role}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Registered:</span>
                                        <p className="font-medium">{user.registeredDate}</p>
                                    </div>
                                    {user.role === 'driver' ? (
                                        <>
                                            <div>
                                                <span className="text-muted-foreground">Deliveries:</span>
                                                <p className="font-medium">{user.totalDeliveries}</p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Rating:</span>
                                                <p className="font-medium">{user.rating}/5</p>
                                            </div>
                                        </>
                                    ) : (
                                        <div>
                                            <span className="text-muted-foreground">Cargos:</span>
                                            <p className="font-medium">{user.totalCargos}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t">
                                    <div className="text-sm text-muted-foreground">
                                        Last active: {user.lastActive}
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Button variant="outline" size="sm" className="flex-1">
                                        <Eye className="h-4 w-4 mr-1" />
                                        View
                                    </Button>
                                    {user.status === 'pending' && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleViewApproval(user)}
                                        >
                                            <UserCheck className="h-4 w-4 mr-1" />
                                            Review
                                        </Button>
                                    )}
                                    <Button variant="outline" size="sm" className="flex-1">
                                        <Edit className="h-4 w-4 mr-1" />
                                        Edit
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1">
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Delete
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

            {/* Approval Modal */}
            <ApprovalModal
                isOpen={isApprovalModalOpen}
                onClose={() => setIsApprovalModalOpen(false)}
                item={selectedUser}
                onApprove={handleApprove}
                onReject={handleReject}
            />
        </div>
    );
};

export default AdminUsers;
