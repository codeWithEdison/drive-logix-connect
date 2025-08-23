
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Package,
  Search,
  Filter,
  Plus,
  Eye,
  MoreVertical,
  MapPin,
  User,
  Clock
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

// Extended mock data for client cargos
const mockClientCargos = [
  {
    id: "#3565432",
    status: "transit" as const,
    from: "4140 Parker Rd, Allentown, New Mexico 31134",
    to: "3517 W. Gray St. Utica, Pennsylvania 57867",
    driver: "Albert Flores",
    estimatedTime: "2.5 hours",
    weight: "25 kg",
    type: "Electronics",
    createdDate: "2024-01-15",
    cost: "$280"
  },
  {
    id: "#4832920",
    status: "delivered" as const,
    from: "1050 Elden St. Colma, Delaware 10299",
    to: "6502 Preston Rd. Inglewood, Maine 98380",
    driver: "Guy Hawkins",
    estimatedTime: "Delivered",
    weight: "15 kg",
    type: "Documents",
    createdDate: "2024-01-14",
    cost: "$150"
  },
  {
    id: "#1442654",
    status: "pending" as const,
    from: "2972 Westheimer Rd. Santa Ana, Illinois 85486",
    to: "6391 Elgin St. Celina, Delaware 10299",
    driver: "Kathryn Murphy",
    estimatedTime: "Pending pickup",
    weight: "40 kg",
    type: "Furniture",
    createdDate: "2024-01-13",
    cost: "$320"
  },
  {
    id: "#9437291",
    status: "delivered" as const,
    from: "1901 Thornridge Cir. Shiloh, Hawaii 81063",
    to: "7715 Ash Dr. San Jose, South Dakota 83475",
    driver: "Leslie Alexander",
    estimatedTime: "Delivered",
    weight: "8 kg",
    type: "Medical Supplies",
    createdDate: "2024-01-12",
    cost: "$95"
  },
  {
    id: "#5648392",
    status: "cancelled" as const,
    from: "8502 Preston Rd. Inglewood, Maine 98380",
    to: "2464 Royal Ln. Mesa, New Jersey 45463",
    driver: "Wade Warren",
    estimatedTime: "Cancelled",
    weight: "32 kg",
    type: "Books",
    createdDate: "2024-01-11",
    cost: "$200"
  }
];

const statusConfig = {
  pending: {
    label: "Pending",
    className: "bg-orange-100 text-orange-800 border-orange-200",
  },
  transit: {
    label: "In Transit",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  delivered: {
    label: "Delivered",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-800 border-red-200",
  }
};

const MyCargos = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const filteredCargos = mockClientCargos.filter(cargo => {
    const matchesSearch = cargo.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cargo.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cargo.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || cargo.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedCargos = [...filteredCargos].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
      case 'oldest':
        return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
      case 'cost-high':
        return parseInt(b.cost.replace('$', '')) - parseInt(a.cost.replace('$', ''));
      case 'cost-low':
        return parseInt(a.cost.replace('$', '')) - parseInt(b.cost.replace('$', ''));
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-heading">My Cargos</h1>
          <p className="text-muted-foreground">Track and manage all your cargo shipments</p>
        </div>
        <Button className="bg-gradient-primary hover:bg-primary-hover">
          <Plus className="w-4 h-4 mr-2" />
          Create New Cargo
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Cargos
            </CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{mockClientCargos.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Transit
            </CardTitle>
            <Package className="h-4 w-4 text-logistics-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {mockClientCargos.filter(c => c.status === 'transit').length}
            </div>
            <p className="text-xs text-logistics-blue">Currently shipping</p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Delivered
            </CardTitle>
            <Package className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {mockClientCargos.filter(c => c.status === 'delivered').length}
            </div>
            <p className="text-xs text-success">Successfully completed</p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Spent
            </CardTitle>
            <Package className="h-4 w-4 text-logistics-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${mockClientCargos.reduce((sum, cargo) => sum + parseInt(cargo.cost.replace('$', '')), 0)}
            </div>
            <p className="text-xs text-logistics-green">This year</p>
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
                  placeholder="Search by cargo ID, destination, or type..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="transit">In Transit</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="cost-high">Cost: High to Low</SelectItem>
                <SelectItem value="cost-low">Cost: Low to High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cargo Table */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>All Cargos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cargo ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCargos.map((cargo) => {
                  const status = statusConfig[cargo.status];
                  return (
                    <TableRow key={cargo.id}>
                      <TableCell className="font-medium">
                        {cargo.id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{cargo.type}</div>
                          <div className="text-xs text-muted-foreground">{cargo.weight}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <span className="truncate max-w-32">{cargo.from}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <div className="w-2 h-2 bg-accent rounded-full"></div>
                            <span className="truncate max-w-32">{cargo.to}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                            <User className="h-3 w-3" />
                          </div>
                          <span className="text-sm">{cargo.driver}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={status.className}>
                          {status.label}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {cargo.estimatedTime}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">{cargo.cost}</div>
                      </TableCell>
                      <TableCell>{cargo.createdDate}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MapPin className="h-4 w-4 mr-2" />
                              Track Cargo
                            </DropdownMenuItem>
                            {cargo.status === 'pending' && (
                              <DropdownMenuItem className="text-destructive">
                                Cancel Cargo
                              </DropdownMenuItem>
                            )}
                            {cargo.status === 'delivered' && (
                              <DropdownMenuItem>
                                Download Receipt
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {sortedCargos.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground">No cargos found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

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

export default MyCargos;