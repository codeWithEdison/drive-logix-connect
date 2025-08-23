
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ModernModel from "@/components/modal/ModernModel";
import {
  Package,
  Search,
  Filter,
  Plus,
  Eye,
  MoreVertical,
  MapPin,
  User,
  Clock,
  Phone,
  Calendar,
  Truck,
  Weight,
  DollarSign,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

// Rwanda locations data
const rwandaLocations = {
  kigali: {
    name: "Kigali",
    districts: ["Nyarugenge", "Gasabo", "Kicukiro", "Remera", "Gikondo", "Kimihurura", "Kacyiru", "Kibagabaga"]
  },
  butare: {
    name: "Butare",
    districts: ["Huye", "Ngoma", "Tumba", "Mukura"]
  },
  gisenyi: {
    name: "Gisenyi",
    districts: ["Rubavu", "Gisenyi", "Nyamyumba", "Kanzenze"]
  },
  ruhengeri: {
    name: "Ruhengeri",
    districts: ["Musanze", "Kinigi", "Muhoza", "Nyange"]
  },
  kibuye: {
    name: "Kibuye",
    districts: ["Karongi", "Bwishyura", "Gishyita", "Mubuga"]
  },
  byumba: {
    name: "Byumba",
    districts: ["Gicumbi", "Byumba", "Rukomo", "Kageyo"]
  }
};

// Extended mock data with Rwanda locations and FRW currency
const mockClientCargos = [
  {
    id: "#3565432",
    status: "transit" as const,
    from: "Remera, Kigali, Rwanda",
    to: "Huye, Butare, Rwanda",
    driver: "Albert Flores",
    driverPhone: "+250 788 123 456",
    estimatedTime: "2.5 hours",
    weight: "25 kg",
    type: "Electronics",
    createdDate: "2024-01-15",
    cost: 280000, // FRW
    pickupDate: "2024-01-15",
    deliveryDate: "2024-01-15",
    description: "Laptop and accessories for business delivery",
    specialInstructions: "Handle with care, fragile items",
    vehicleType: "Small Truck",
    distance: "120 km"
  },
  {
    id: "#4832920",
    status: "delivered" as const,
    from: "Nyarugenge, Kigali, Rwanda",
    to: "Rubavu, Gisenyi, Rwanda",
    driver: "Guy Hawkins",
    driverPhone: "+250 789 234 567",
    estimatedTime: "Delivered",
    weight: "15 kg",
    type: "Documents",
    createdDate: "2024-01-14",
    cost: 150000, // FRW
    pickupDate: "2024-01-14",
    deliveryDate: "2024-01-14",
    description: "Legal documents and contracts",
    specialInstructions: "Confidential documents",
    vehicleType: "Motorcycle",
    distance: "180 km"
  },
  {
    id: "#1442654",
    status: "pending" as const,
    from: "Gasabo, Kigali, Rwanda",
    to: "Musanze, Ruhengeri, Rwanda",
    driver: "Kathryn Murphy",
    driverPhone: "+250 787 345 678",
    estimatedTime: "Pending pickup",
    weight: "40 kg",
    type: "Furniture",
    createdDate: "2024-01-13",
    cost: 320000, // FRW
    pickupDate: "2024-01-16",
    deliveryDate: "2024-01-17",
    description: "Office furniture and equipment",
    specialInstructions: "Requires special handling for large items",
    vehicleType: "Large Truck",
    distance: "110 km"
  },
  {
    id: "#9437291",
    status: "delivered" as const,
    from: "Kicukiro, Kigali, Rwanda",
    to: "Karongi, Kibuye, Rwanda",
    driver: "Leslie Alexander",
    driverPhone: "+250 786 456 789",
    estimatedTime: "Delivered",
    weight: "8 kg",
    type: "Medical Supplies",
    createdDate: "2024-01-12",
    cost: 95000, // FRW
    pickupDate: "2024-01-12",
    deliveryDate: "2024-01-12",
    description: "Pharmaceutical supplies and medical equipment",
    specialInstructions: "Temperature controlled delivery required",
    vehicleType: "Small Truck",
    distance: "150 km"
  },
  {
    id: "#5648392",
    status: "cancelled" as const,
    from: "Kimihurura, Kigali, Rwanda",
    to: "Gicumbi, Byumba, Rwanda",
    driver: "Wade Warren",
    driverPhone: "+250 785 567 890",
    estimatedTime: "Cancelled",
    weight: "32 kg",
    type: "Books",
    createdDate: "2024-01-11",
    cost: 200000, // FRW
    pickupDate: "2024-01-11",
    deliveryDate: "Cancelled",
    description: "Educational books and learning materials",
    specialInstructions: "Keep dry and handle carefully",
    vehicleType: "Small Truck",
    distance: "80 km"
  },
  {
    id: "#7891234",
    status: "transit" as const,
    from: "Kacyiru, Kigali, Rwanda",
    to: "Nyamyumba, Gisenyi, Rwanda",
    driver: "Sarah Johnson",
    driverPhone: "+250 784 678 901",
    estimatedTime: "1.5 hours",
    weight: "12 kg",
    type: "Clothing",
    createdDate: "2024-01-16",
    cost: 180000, // FRW
    pickupDate: "2024-01-16",
    deliveryDate: "2024-01-16",
    description: "Fashion items and accessories",
    specialInstructions: "Handle with care, avoid wrinkles",
    vehicleType: "Motorcycle",
    distance: "160 km"
  },
  {
    id: "#4567890",
    status: "pending" as const,
    from: "Kibagabaga, Kigali, Rwanda",
    to: "Rukomo, Byumba, Rwanda",
    driver: "Michael Chen",
    driverPhone: "+250 783 789 012",
    estimatedTime: "Pending pickup",
    weight: "60 kg",
    type: "Machinery",
    createdDate: "2024-01-17",
    cost: 450000, // FRW
    pickupDate: "2024-01-18",
    deliveryDate: "2024-01-19",
    description: "Industrial machinery parts",
    specialInstructions: "Heavy equipment, requires special handling",
    vehicleType: "Large Truck",
    distance: "90 km"
  },
  {
    id: "#2345678",
    status: "delivered" as const,
    from: "Gikondo, Kigali, Rwanda",
    to: "Kinigi, Ruhengeri, Rwanda",
    driver: "Emma Wilson",
    driverPhone: "+250 782 890 123",
    estimatedTime: "Delivered",
    weight: "5 kg",
    type: "Food",
    createdDate: "2024-01-10",
    cost: 75000, // FRW
    pickupDate: "2024-01-10",
    deliveryDate: "2024-01-10",
    description: "Fresh produce and groceries",
    specialInstructions: "Keep refrigerated, deliver quickly",
    vehicleType: "Motorcycle",
    distance: "130 km"
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

// Format FRW currency
const formatFRW = (amount: number) => {
  return new Intl.NumberFormat('rw-RW', {
    style: 'currency',
    currency: 'RWF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const MyCargos = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCargo, setSelectedCargo] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const itemsPerPage = 5;

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
        return b.cost - a.cost;
      case 'cost-low':
        return a.cost - b.cost;
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedCargos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCargos = sortedCargos.slice(startIndex, endIndex);

  const handleRowClick = (cargo: any) => {
    setSelectedCargo(cargo);
    setIsDetailModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalSpent = mockClientCargos.reduce((sum, cargo) => sum + cargo.cost, 0);

  return (
    <div className="space-y-6">
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

      {/* Stats Overview - Mobile Optimized */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
              Total Cargos
            </CardTitle>
            <Package className="h-3 w-3 md:h-4 md:w-4 text-primary" />
          </CardHeader>
          <CardContent className="pb-2 md:pb-4">
            <div className="text-lg md:text-2xl font-bold text-foreground">{mockClientCargos.length}</div>
            <p className="text-xs text-muted-foreground hidden md:block">All time</p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
              In Transit
            </CardTitle>
            <Package className="h-3 w-3 md:h-4 md:w-4 text-logistics-blue" />
          </CardHeader>
          <CardContent className="pb-2 md:pb-4">
            <div className="text-lg md:text-2xl font-bold text-foreground">
              {mockClientCargos.filter(c => c.status === 'transit').length}
            </div>
            <p className="text-xs text-logistics-blue hidden md:block">Currently shipping</p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
              Delivered
            </CardTitle>
            <Package className="h-3 w-3 md:h-4 md:w-4 text-success" />
          </CardHeader>
          <CardContent className="pb-2 md:pb-4">
            <div className="text-lg md:text-2xl font-bold text-foreground">
              {mockClientCargos.filter(c => c.status === 'delivered').length}
            </div>
            <p className="text-xs text-success hidden md:block">Successfully completed</p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
              Total Spent
            </CardTitle>
            <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-logistics-green" />
          </CardHeader>
          <CardContent className="pb-2 md:pb-4">
            <div className="text-lg md:text-2xl font-bold text-foreground">
              {formatFRW(totalSpent)}
            </div>
            <p className="text-xs text-logistics-green hidden md:block">This year</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Filter & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 min-w-0">
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
              <SelectTrigger className="w-full md:w-40">
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
              <SelectTrigger className="w-full md:w-40">
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
          {/* Mobile Card View */}
          <div className="block lg:hidden space-y-3">
            {currentCargos.map((cargo, index) => {
              const status = statusConfig[cargo.status];
              const rowNumber = startIndex + index + 1;
              return (
                <div
                  key={cargo.id}
                  className="border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleRowClick(cargo)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">#{rowNumber}</span>
                      <span className="text-xs font-mono font-medium">{cargo.id}</span>
                    </div>
                    <Badge variant="secondary" className={`${status.className} text-xs px-1.5 py-0.5`}>
                      {status.label}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="font-medium text-sm">{cargo.type}</div>
                      <div className="text-xs text-muted-foreground">{cargo.weight}</div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span className="truncate">{cargo.from}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                      <span className="truncate">{cargo.to}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold">{formatFRW(cargo.cost)}</span>
                      <span>{cargo.createdDate}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block rounded-md border overflow-x-auto">
            <Table className="w-full table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">#</TableHead>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead className="w-20">Type</TableHead>
                  <TableHead className="w-32">Route</TableHead>
                  <TableHead className="w-20 hidden md:table-cell">Driver</TableHead>
                  <TableHead className="w-20">Status</TableHead>
                  <TableHead className="w-16 hidden lg:table-cell">Cost</TableHead>
                  <TableHead className="w-16 hidden xl:table-cell">Date</TableHead>
                  <TableHead className="w-8 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentCargos.map((cargo, index) => {
                  const status = statusConfig[cargo.status];
                  const rowNumber = startIndex + index + 1;
                  return (
                    <TableRow
                      key={cargo.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleRowClick(cargo)}
                    >
                      <TableCell className="font-medium text-muted-foreground text-xs">
                        {rowNumber}
                      </TableCell>
                      <TableCell className="font-medium">
                        <span className="text-xs font-mono">{cargo.id}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-xs">{cargo.type}</div>
                          <div className="text-xs text-muted-foreground">{cargo.weight}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                            <span className="truncate text-xs">{cargo.from}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <div className="w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0"></div>
                            <span className="truncate text-xs">{cargo.to}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="h-2.5 w-2.5" />
                          </div>
                          <span className="text-xs truncate">{cargo.driver}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`${status.className} text-xs px-1.5 py-0.5`}>
                          {status.label}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {cargo.estimatedTime}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="font-semibold text-xs">{formatFRW(cargo.cost)}</div>
                      </TableCell>
                      <TableCell className="text-xs hidden xl:table-cell">{cargo.createdDate}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleRowClick(cargo)}>
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

          {currentCargos.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground">No cargos found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground text-center sm:text-left">
            Showing {startIndex + 1} to {Math.min(endIndex, sortedCargos.length)} of {sortedCargos.length} results
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                className="w-8 h-8 p-0"
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Cargo Detail Modal */}
      <ModernModel
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Cargo Details - ${selectedCargo?.id || ''}`}
        modalType="cargo-details"
      >
        {selectedCargo && (
          <div className="space-y-6">
            {/* Status and Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary" className={statusConfig[selectedCargo.status].className}>
                    {statusConfig[selectedCargo.status].label}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">{selectedCargo.estimatedTime}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Cost</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{formatFRW(selectedCargo.cost)}</div>
                  <p className="text-sm text-muted-foreground">Total shipping cost</p>
                </CardContent>
              </Card>
            </div>

            {/* Route Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Route Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Pickup Location</h4>
                    <p className="text-sm break-words">{selectedCargo.from}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {selectedCargo.pickupDate}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2">Delivery Location</h4>
                    <p className="text-sm break-words">{selectedCargo.to}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {selectedCargo.deliveryDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Truck className="h-4 w-4" />
                  Distance: {selectedCargo.distance} • Vehicle: {selectedCargo.vehicleType}
                </div>
              </CardContent>
            </Card>

            {/* Cargo Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Cargo Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <h4 className="font-medium text-sm mb-1">Type</h4>
                    <p className="text-sm">{selectedCargo.type}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-1">Weight</h4>
                    <p className="text-sm">{selectedCargo.weight}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-1">Description</h4>
                    <p className="text-sm break-words">{selectedCargo.description}</p>
                  </div>
                </div>
                {selectedCargo.specialInstructions && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">Special Instructions</h4>
                    <p className="text-sm text-muted-foreground">{selectedCargo.specialInstructions}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Driver Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Driver Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">{selectedCargo.driver}</h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {selectedCargo.driverPhone}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <Button>
                <MapPin className="h-4 w-4 mr-2" />
                Track Cargo
              </Button>
            </div>
          </div>
        )}
      </ModernModel>
    </div>
  );
};

export default MyCargos;