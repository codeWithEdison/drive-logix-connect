import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatsCard, StatItem } from '@/components/ui/StatsCard';
import { DeliveryDetailModal } from '@/components/ui/DeliveryDetailModal';
import {
    Package,
    Search,
    Filter,
    Eye,
    Star,
    MapPin,
    Clock,
    CheckCircle,
    TrendingUp,
    Calendar,
    Award
} from 'lucide-react';

// Mock data for driver delivery history with Rwanda-based data
const mockDriverHistory = [
    {
        id: "DEL-001",
        status: "delivered" as const,
        from: "Kigali, Gasabo District",
        to: "Butare, Huye District",
        client: "John Doe",
        deliveredDate: "2024-01-15",
        deliveryTime: "2:30 PM",
        weight: "25 kg",
        type: "Electronics",
        rating: 5,
        phone: "+250 781 234567"
    },
    {
        id: "DEL-002",
        status: "delivered" as const,
        from: "Kigali, Kicukiro District",
        to: "Musanze, Musanze District",
        client: "Sarah Wilson",
        deliveredDate: "2024-01-14",
        deliveryTime: "1:45 PM",
        weight: "15 kg",
        type: "Documents",
        rating: 4,
        phone: "+250 781 234568"
    },
    {
        id: "DEL-003",
        status: "delivered" as const,
        from: "Kigali, Nyarugenge District",
        to: "Muhanga, Muhanga District",
        client: "Mike Johnson",
        deliveredDate: "2024-01-13",
        deliveryTime: "3:15 PM",
        weight: "40 kg",
        type: "Furniture",
        rating: 5,
        phone: "+250 781 234569"
    },
    {
        id: "DEL-004",
        status: "delivered" as const,
        from: "Kigali, Gasabo District",
        to: "Rubavu, Rubavu District",
        client: "Emily Davis",
        deliveredDate: "2024-01-12",
        deliveryTime: "11:30 AM",
        weight: "8 kg",
        type: "Medical Supplies",
        rating: 4,
        phone: "+250 781 234570"
    },
    {
        id: "DEL-005",
        status: "delivered" as const,
        from: "Kigali, Kicukiro District",
        to: "Karongi, Karongi District",
        client: "David Kimenyi",
        deliveredDate: "2024-01-11",
        deliveryTime: "4:20 PM",
        weight: "30 kg",
        type: "Agricultural Products",
        rating: 5,
        phone: "+250 781 234571"
    },
    {
        id: "DEL-006",
        status: "delivered" as const,
        from: "Kigali, Nyarugenge District",
        to: "Nyagatare, Nyagatare District",
        client: "Grace Uwimana",
        deliveredDate: "2024-01-10",
        deliveryTime: "9:15 AM",
        weight: "12 kg",
        type: "Textiles",
        rating: 4,
        phone: "+250 781 234572"
    }
];

const DriverHistory = () => {
    const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [ratingFilter, setRatingFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    // Stats data for StatsCard component
    const statsData: StatItem[] = [
        {
            title: "Total Deliveries",
            value: mockDriverHistory.length.toString(),
            change: "This month",
            changeType: "success",
            icon: Package,
            color: "blue"
        },
        {
            title: "Average Rating",
            value: (mockDriverHistory.reduce((sum, delivery) => sum + delivery.rating, 0) / mockDriverHistory.length).toFixed(1),
            change: "Out of 5",
            changeType: "rating",
            icon: Star,
            color: "yellow"
        },
        {
            title: "Success Rate",
            value: "100%",
            change: "All delivered",
            changeType: "success",
            icon: CheckCircle,
            color: "green"
        },
        {
            title: "Active Days",
            value: "6",
            change: "This month",
            changeType: "active",
            icon: Calendar,
            color: "purple"
        }
    ];

    const handleViewDetails = (delivery: any) => {
        setSelectedDelivery(delivery);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedDelivery(null);
    };

    // Filter and sort data
    const filteredData = mockDriverHistory
        .filter(delivery => {
            const matchesSearch = delivery.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                delivery.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                delivery.to.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesRating = ratingFilter === 'all' ||
                (ratingFilter === '5' && delivery.rating === 5) ||
                (ratingFilter === '4' && delivery.rating >= 4) ||
                (ratingFilter === '3' && delivery.rating >= 3);

            return matchesSearch && matchesRating;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.deliveredDate).getTime() - new Date(a.deliveredDate).getTime();
                case 'oldest':
                    return new Date(a.deliveredDate).getTime() - new Date(b.deliveredDate).getTime();
                case 'rating-high':
                    return b.rating - a.rating;
                case 'rating-low':
                    return a.rating - b.rating;
                default:
                    return 0;
            }
        });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground font-heading">Delivery History</h1>
                    <p className="text-muted-foreground">Track all your completed deliveries and performance</p>
                </div>
            </div>

            {/* Stats Overview using StatsCard */}
            <StatsCard stats={statsData} />

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
                                    placeholder="Search by delivery ID, client, or destination..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <Select value={ratingFilter} onValueChange={setRatingFilter}>
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="Filter by rating" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Ratings</SelectItem>
                                <SelectItem value="5">5 Stars</SelectItem>
                                <SelectItem value="4">4+ Stars</SelectItem>
                                <SelectItem value="3">3+ Stars</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Newest First</SelectItem>
                                <SelectItem value="oldest">Oldest First</SelectItem>
                                <SelectItem value="rating-high">Rating: High to Low</SelectItem>
                                <SelectItem value="rating-low">Rating: Low to High</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Delivery History - Table for large screens, Cards for small screens */}
            <div className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground font-heading">Completed Deliveries</h2>

                {/* Table View - Large Screens */}
                <div className="hidden lg:block">
                    <Card className="card-elevated">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-16">#</TableHead>
                                    <TableHead>Delivery ID</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Route</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Weight</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead className="w-24">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredData.map((delivery, index) => (
                                    <TableRow
                                        key={delivery.id}
                                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                                        onClick={() => handleViewDetails(delivery)}
                                    >
                                        <TableCell className="font-medium text-muted-foreground">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell className="font-medium">{delivery.id}</TableCell>
                                        <TableCell>{delivery.client}</TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="text-sm">
                                                    <span className="text-muted-foreground">From:</span> {delivery.from}
                                                </div>
                                                <div className="text-sm">
                                                    <span className="text-muted-foreground">To:</span> {delivery.to}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{delivery.type}</TableCell>
                                        <TableCell>{delivery.weight}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                                <span>{delivery.rating}/5</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <div>{delivery.deliveredDate}</div>
                                                <div className="text-muted-foreground">{delivery.deliveryTime}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewDetails(delivery);
                                                }}
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </div>

                {/* Card View - Small Screens */}
                <div className="lg:hidden space-y-4">
                    {filteredData.map((delivery, index) => (
                        <Card
                            key={delivery.id}
                            className="card-elevated group hover:shadow-lg transition-all duration-300 cursor-pointer"
                            onClick={() => handleViewDetails(delivery)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-6 h-6 bg-primary/10 text-primary text-sm font-medium rounded-full">
                                            {index + 1}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Package className="h-5 w-5 text-primary" />
                                            <span className="font-semibold">{delivery.id}</span>
                                        </div>
                                    </div>
                                    <Badge className="bg-success/10 text-success border-success/20">
                                        Delivered
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">From:</span>
                                        <span className="font-medium truncate">{delivery.from}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">To:</span>
                                        <span className="font-medium truncate">{delivery.to}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Client:</span>
                                        <p className="font-medium">{delivery.client}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Type:</span>
                                        <p className="font-medium">{delivery.type}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Weight:</span>
                                        <p className="font-medium">{delivery.weight}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Rating:</span>
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                            <span className="font-medium">{delivery.rating}/5</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        <span>{delivery.deliveredDate} • {delivery.deliveryTime}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 h-12 sm:h-10"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleViewDetails(delivery);
                                        }}
                                    >
                                        <Eye className="h-4 w-4 mr-1" />
                                        View Details
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

            {/* Detail Modal */}
            <DeliveryDetailModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                delivery={selectedDelivery}
            />
        </div>
    );
};

export default DriverHistory;
