
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CargoCard } from "@/components/dashboard/CargoCard";
import {
  Package,
  Search,
  Filter,
  Plus,
  Eye,
  MoreVertical
} from "lucide-react";

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

const MyCargos = () => {
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
                />
              </div>
            </div>
            <Select defaultValue="all">
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
            <Select defaultValue="newest">
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

      {/* Cargo List */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-foreground font-heading">All Cargos</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {mockClientCargos.map((cargo) => (
            <div key={cargo.id} className="relative">
              <CargoCard cargo={cargo} />
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
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

export default MyCargos;