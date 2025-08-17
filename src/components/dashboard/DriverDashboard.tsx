import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  Star
} from "lucide-react";

// Mock data for driver
const mockDriverData = {
  name: "Albert Flores",
  truckId: "TRK-001",
  rating: 4.8,
  completedDeliveries: 156,
  status: "available" as const,
  earnings: "$3,450",
  assignedCargos: [
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
    }
  ]
};

export function DriverDashboard() {
  const [driverStatus, setDriverStatus] = useState<'available' | 'on_duty' | 'unavailable'>('available');
  const [activeDelivery, setActiveDelivery] = useState(mockDriverData.assignedCargos[0]);

  const statusConfig = {
    available: { label: "Available", color: "bg-success text-success-foreground" },
    on_duty: { label: "On Duty", color: "bg-logistics-blue text-logistics-blue-foreground" },
    unavailable: { label: "Unavailable", color: "bg-muted text-muted-foreground" }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-heading">Driver Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {mockDriverData.name}</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className={statusConfig[driverStatus].color}>
            {statusConfig[driverStatus].label}
          </Badge>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            <Switch 
              checked={driverStatus === 'available'} 
              onCheckedChange={(checked) => setDriverStatus(checked ? 'available' : 'unavailable')}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Earnings
            </CardTitle>
            <Package className="h-4 w-4 text-logistics-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{mockDriverData.earnings}</div>
            <p className="text-xs text-success">+15% from yesterday</p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{mockDriverData.completedDeliveries}</div>
            <p className="text-xs text-success">Total deliveries</p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rating
            </CardTitle>
            <Star className="h-4 w-4 text-logistics-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{mockDriverData.rating}</div>
            <p className="text-xs text-logistics-orange">★★★★☆ Average</p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Truck Status
            </CardTitle>
            <Truck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{mockDriverData.truckId}</div>
            <p className="text-xs text-primary">Active & Ready</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Delivery */}
        <div className="lg:col-span-2">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-primary" />
                Active Delivery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {activeDelivery.status === 'active' ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{activeDelivery.id}</h3>
                      <p className="text-sm text-muted-foreground">Client: {activeDelivery.client}</p>
                    </div>
                    <Badge className={activeDelivery.priority === 'urgent' ? 
                      "bg-logistics-orange text-logistics-orange-foreground" : 
                      "bg-logistics-blue text-logistics-blue-foreground"
                    }>
                      {activeDelivery.priority}
                    </Badge>
                  </div>

                  {/* Route */}
                  <div className="space-y-4 p-4 bg-muted rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-primary rounded-full mt-1"></div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">PICKUP</p>
                        <p className="text-sm font-semibold">{activeDelivery.from}</p>
                        <p className="text-xs text-primary">{activeDelivery.pickupTime}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 pl-6">
                      <div className="w-px h-8 bg-border"></div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-accent rounded-full mt-1"></div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">DELIVERY</p>
                        <p className="text-sm font-semibold">{activeDelivery.to}</p>
                        <p className="text-xs text-accent">{activeDelivery.estimatedDelivery}</p>
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
                    <Button className="bg-gradient-primary hover:bg-primary-hover">
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
                    <Button variant="outline" className="text-logistics-orange border-logistics-orange hover:bg-logistics-orange hover:text-logistics-orange-foreground">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Report Issue
                    </Button>
                  </div>
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

        {/* Assigned Cargos */}
        <div>
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5 text-accent" />
                Assigned Cargos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockDriverData.assignedCargos.map((cargo) => (
                <div key={cargo.id} className="p-4 bg-muted rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{cargo.id}</span>
                    <Badge variant={cargo.status === 'active' ? 'default' : 'secondary'}>
                      {cargo.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Client</p>
                    <p className="text-sm font-medium">{cargo.client}</p>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}