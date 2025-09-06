import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Truck,
  Clock,
  CheckCircle,
  Navigation,
  MapPin,
  Phone,
  Camera,
  User,
  AlertCircle,
  Route,
  Star,
  Eye,
  ArrowUp,
  ArrowDown,
  ChevronDown
} from "lucide-react";
import { TrackingComponent } from "./TrackingComponent";
import { StatsCard, StatItem } from "@/components/ui/StatsCard";

// Mock data for driver
const mockDriverData = {
  name: "Albert Flores",
  truckId: "TRK-001",
  rating: 4.8,
  completedDeliveries: 156,
  status: "available" as const,
  assignedCargos: 5,
  activeDeliveries: 2,
  truckStatus: "Active & Ready",
  assignedCargosList: [
    {
      id: "#3565432",
      status: "active" as const,
      from: "4140 Parker Rd, Allentown, NM",
      to: "3517 W. Gray St. Utica, PA",
      client: "John Smith",
      phone: "+1 (555) 123-4567",
      weight: "25 kg",
      type: "Electronics",
      pickupTime: "10:00 AM",
      estimatedDelivery: "2:30 PM",
      priority: "urgent"
    },
    {
      id: "#4832920",
      status: "pending" as const,
      from: "1050 Elden St. Colma, DE",
      to: "6502 Preston Rd. Inglewood, ME",
      client: "Sarah Johnson",
      phone: "+1 (555) 987-6543",
      weight: "15 kg",
      type: "Documents",
      pickupTime: "3:00 PM",
      estimatedDelivery: "5:30 PM",
      priority: "standard"
    },
    {
      id: "#1442654",
      status: "pending" as const,
      from: "2972 Westheimer Rd. Santa Ana, IL",
      to: "6391 Elgin St. Celina, DE",
      client: "Kathryn Murphy",
      phone: "+1 (555) 456-7890",
      weight: "40 kg",
      type: "Furniture",
      pickupTime: "1:00 PM",
      estimatedDelivery: "4:00 PM",
      priority: "standard"
    }
  ]
};

// Stats data for driver dashboard
const driverStatsData: StatItem[] = [
  {
    title: "Assigned Cargo",
    value: "5",
    change: "+2",
    changeType: "increase",
    icon: Package,
    color: "orange"
  },
  {
    title: "Active Deliveries",
    value: "2",
    change: "In Progress",
    changeType: "active",
    icon: Clock,
    color: "green"
  },
  {
    title: "Completed",
    value: "156",
    change: "Total",
    changeType: "success",
    icon: CheckCircle,
    color: "blue"
  },
  {
    title: "Rating",
    value: "4.8",
    change: "★★★★☆",
    changeType: "rating",
    icon: Star,
    color: "pink"
  }
];

export function DriverDashboard() {
  const [driverStatus, setDriverStatus] = useState<'available' | 'on_duty' | 'unavailable'>('available');
  const [activeDelivery, setActiveDelivery] = useState(mockDriverData.assignedCargosList[0]);
  const [showLiveTracking, setShowLiveTracking] = useState(false);
  const navigate = useNavigate();

  const statusConfig = {
    available: { label: "Available", color: "bg-green-100 text-green-600" },
    on_duty: { label: "On Duty", color: "bg-blue-100 text-blue-600" },
    unavailable: { label: "Unavailable", color: "bg-gray-100 text-gray-600" }
  };

  const handleViewAllCargos = () => {
    navigate('/driver/cargos');
  };

  const handleViewAllDeliveries = () => {
    navigate('/driver/deliveries');
  };

  const handleViewAllCompleted = () => {
    navigate('/driver/completed');
  };

  const handleViewAllRatings = () => {
    navigate('/driver/ratings');
  };

  const handleViewAllTrucks = () => {
    navigate('/driver/trucks');
  };

  const handleStartDelivery = () => {
    setShowLiveTracking(true);
  };

  const handleStatusChange = (newStatus: 'available' | 'on_duty' | 'unavailable') => {
    setDriverStatus(newStatus);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Driver Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {mockDriverData.name}</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className={statusConfig[driverStatus].color}>
            {statusConfig[driverStatus].label}
          </Badge>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            <Select onValueChange={handleStatusChange} defaultValue={driverStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="on_duty">On Duty</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Stats Cards - Reusable component */}
      <StatsCard stats={driverStatsData} />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Delivery with Live Tracking */}
        <div className="lg:col-span-2">
          <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Navigation className="h-5 w-5 text-blue-600" />
                Active Delivery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {activeDelivery.status === 'active' ? (
                <>
                  {showLiveTracking ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{activeDelivery.id}</h3>
                          <p className="text-sm text-muted-foreground">Client: {activeDelivery.client}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowLiveTracking(false)}
                        >
                          Hide Tracking
                        </Button>
                      </div>
                      <TrackingComponent height="h-80" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{activeDelivery.id}</h3>
                          <p className="text-sm text-muted-foreground">Client: {activeDelivery.client}</p>
                        </div>
                        <Badge className={activeDelivery.priority === 'urgent' ?
                          "bg-orange-100 text-orange-600" :
                          "bg-blue-100 text-blue-600"
                        }>
                          {activeDelivery.priority}
                        </Badge>
                      </div>

                      {/* Route */}
                      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full mt-1"></div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium">PICKUP</p>
                            <p className="text-sm font-semibold">{activeDelivery.from}</p>
                            <p className="text-xs text-green-600">{activeDelivery.pickupTime}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pl-6">
                          <div className="w-px h-8 bg-gray-300"></div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full mt-1"></div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium">DELIVERY</p>
                            <p className="text-sm font-semibold">{activeDelivery.to}</p>
                            <p className="text-xs text-red-600">{activeDelivery.estimatedDelivery}</p>
                          </div>
                        </div>
                      </div>

                      {/* Cargo Details */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Type</p>
                          <p className="font-semibold">{activeDelivery.type}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Weight</p>
                          <p className="font-semibold">{activeDelivery.weight}</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          className="bg-gradient-primary hover:bg-primary-hover"
                          onClick={handleStartDelivery}
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          Start Delivery
                        </Button>
                        <Button variant="outline">
                          <Phone className="h-4 w-4 mr-2" />
                          Call Client
                        </Button>
                        <Button variant="outline">
                          <Camera className="h-4 w-4 mr-2" />
                          Upload Photo
                        </Button>
                        <Button variant="outline" className="text-orange-600 border-orange-600 hover:bg-orange-600 hover:text-white">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Report Issue
                        </Button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-semibold text-muted-foreground">No Active Delivery</p>
                  <p className="text-sm text-muted-foreground">Accept a cargo request to start</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Assigned Cargos with Destination Locations */}
        <div>
          <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Route className="h-5 w-5 text-blue-600" />
                  Assigned Cargos
                </CardTitle>
                <Button variant="outline" size="sm" onClick={handleViewAllCargos}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="h-96 overflow-y-auto">
              <div className="space-y-4 pr-2">
                {mockDriverData.assignedCargosList.map((cargo) => (
                  <div key={cargo.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{cargo.id}</span>
                      <Badge className={cargo.status === 'active' ?
                        "bg-green-100 text-green-600" :
                        "bg-yellow-100 text-yellow-600"
                      }>
                        {cargo.status}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Client</p>
                        <p className="text-sm font-medium">{cargo.client}</p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">Destination</p>
                        <p className="text-sm font-medium text-blue-600">{cargo.to}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Type</p>
                        <p className="font-medium">{cargo.type}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Weight</p>
                        <p className="font-medium">{cargo.weight}</p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant={cargo.status === 'active' ? 'default' : 'outline'}
                      className="w-full"
                      onClick={() => setActiveDelivery(cargo)}
                    >
                      {cargo.status === 'active' ? 'Continue' : 'Accept'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Cards with View All Buttons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Deliveries */}
        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900">Recent Deliveries</CardTitle>
              <Button variant="outline" size="sm" onClick={handleViewAllDeliveries}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-medium text-gray-600">Cargo ID</TableHead>
                  <TableHead className="text-xs font-medium text-gray-600">Client</TableHead>
                  <TableHead className="text-xs font-medium text-gray-600">Status</TableHead>
                  <TableHead className="text-xs font-medium text-gray-600">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockDriverData.assignedCargosList.slice(0, 3).map((cargo) => (
                  <TableRow key={cargo.id}>
                    <TableCell className="text-sm font-medium text-gray-900">{cargo.id}</TableCell>
                    <TableCell className="text-sm text-gray-600">{cargo.client}</TableCell>
                    <TableCell>
                      <Badge className={cargo.status === 'active' ?
                        "bg-green-100 text-green-600" :
                        "bg-yellow-100 text-yellow-600"
                      }>
                        {cargo.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">Today</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Driver Performance */}
        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900">Performance</CardTitle>
              <Button variant="outline" size="sm" onClick={handleViewAllRatings}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Rating</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{mockDriverData.rating}</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(mockDriverData.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completed Deliveries</span>
              <span className="font-semibold">{mockDriverData.completedDeliveries}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Truck Status</span>
              <Badge className="bg-green-100 text-green-600">
                {mockDriverData.truckStatus}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}