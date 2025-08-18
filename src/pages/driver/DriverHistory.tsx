import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Package,
    Search,
    Filter,
    Eye,
    Star,
    MapPin,
    Clock,
    CheckCircle
} from 'lucide-react';

// Mock data for driver delivery history
const mockDriverHistory = [
    {
        id: "#3565432",
        status: "delivered" as const,
        from: "4140 Parker Rd, Allentown, New Mexico 31134",
        to: "3517 W. Gray St. Utica, Pennsylvania 57867",
        client: "John Doe",
        deliveredDate: "2024-01-15",
        deliveryTime: "2:30 PM",
        weight: "25 kg",
        type: "Electronics",
        rating: 5,
        earnings: "$45"
    },
    {
        id: "#4832920",
        status: "delivered" as const,
        from: "1050 Elden St. Colma, Delaware 10299",
        to: "6502 Preston Rd. Inglewood, Maine 98380",
        client: "Sarah Wilson",
        deliveredDate: "2024-01-14",
        deliveryTime: "1:45 PM",
        weight: "15 kg",
        type: "Documents",
        rating: 4,
        earnings: "$35"
    },
    {
        id: "#1442654",
        status: "delivered" as const,
        from: "2972 Westheimer Rd. Santa Ana, Illinois 85486",
        to: "6391 Elgin St. Celina, Delaware 10299",
        client: "Mike Johnson",
        deliveredDate: "2024-01-13",
        deliveryTime: "3:15 PM",
        weight: "40 kg",
        type: "Furniture",
        rating: 5,
        earnings: "$60"
    },
    {
        id: "#9437291",
        status: "delivered" as const,
        from: "1901 Thornridge Cir. Shiloh, Hawaii 81063",
        to: "7715 Ash Dr. San Jose, South Dakota 83475",
        client: "Emily Davis",
        deliveredDate: "2024-01-12",
        deliveryTime: "11:30 AM",
        weight: "8 kg",
        type: "Medical Supplies",
        rating: 4,
        earnings: "$30"
    }
];

const DriverHistory = () => {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground font-heading">Delivery History</h1>
                    <p className="text-muted-foreground">Track all your completed deliveries and earnings</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="card-elevated">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Deliveries
                        </CardTitle>
                        <Package className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{mockDriverHistory.length}</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                </Card>

                <Card className="card-elevated">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Average Rating
                        </CardTitle>
                        <Star className="h-4 w-4 text-logistics-orange" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {(mockDriverHistory.reduce((sum, delivery) => sum + delivery.rating, 0) / mockDriverHistory.length).toFixed(1)}
                        </div>
                        <p className="text-xs text-logistics-orange">Out of 5 stars</p>
                    </CardContent>
                </Card>

                <Card className="card-elevated">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Earnings
                        </CardTitle>
                        <Package className="h-4 w-4 text-logistics-green" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            ${mockDriverHistory.reduce((sum, delivery) => sum + parseInt(delivery.earnings.replace('$', '')), 0)}
                        </div>
                        <p className="text-xs text-logistics-green">This month</p>
                    </CardContent>
                </Card>

                <Card className="card-elevated">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Success Rate
                        </CardTitle>
                        <CheckCircle className="h-4 w-4 text-success" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">100%</div>
                        <p className="text-xs text-success">All delivered successfully</p>
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
                                    placeholder="Search by cargo ID, client, or destination..."
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select defaultValue="all">
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
                        <Select defaultValue="newest">
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Newest First</SelectItem>
                                <SelectItem value="oldest">Oldest First</SelectItem>
                                <SelectItem value="earnings-high">Earnings: High to Low</SelectItem>
                                <SelectItem value="earnings-low">Earnings: Low to High</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Delivery History List */}
            <div className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground font-heading">Completed Deliveries</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {mockDriverHistory.map((delivery) => (
                        <Card key={delivery.id} className="card-elevated group hover:shadow-lg transition-all duration-300">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Package className="h-5 w-5 text-primary" />
                                        <span className="font-semibold">{delivery.id}</span>
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
                                        <span className="text-muted-foreground">Earnings:</span>
                                        <p className="font-medium text-logistics-green">{delivery.earnings}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t">
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 text-logistics-orange fill-current" />
                                        <span className="text-sm font-medium">{delivery.rating}/5</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        <span>{delivery.deliveredDate} • {delivery.deliveryTime}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Button variant="outline" size="sm" className="flex-1">
                                        <Eye className="h-4 w-4 mr-1" />
                                        View Details
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1">
                                        <MapPin className="h-4 w-4 mr-1" />
                                        Route
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

export default DriverHistory;
