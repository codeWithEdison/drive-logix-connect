
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TrackingMap } from "@/components/dashboard/TrackingMap";
import {
  MapPin,
  Search,
  Clock,
  Phone,
  MessageCircle,
  Navigation,
  Package,
  Truck,
  CheckCircle,
  AlertCircle
} from "lucide-react";

// Mock tracking data for multiple cargos
const mockTrackingData = [
  {
    id: "#3565432",
    status: "in_transit",
    driver: {
      name: "Albert Flores",
      phone: "+1 (555) 123-4567",
      rating: 4.8,
      truck: "TRK-001"
    },
    route: {
      from: "4140 Parker Rd, Allentown, NM",
      to: "3517 W. Gray St. Utica, PA",
      currentLocation: "Highway 45, 15 km from destination",
      progress: 68
    },
    timeline: [
      { status: "pickup_completed", time: "08:30 AM", date: "Jan 15, 2024", completed: true },
      { status: "in_transit", time: "09:15 AM", date: "Jan 15, 2024", completed: true },
      { status: "out_for_delivery", time: "Est. 2:00 PM", date: "Jan 15, 2024", completed: false },
      { status: "delivered", time: "Est. 2:30 PM", date: "Jan 15, 2024", completed: false }
    ],
    estimatedDelivery: "2:30 PM today"
  }
];

const TrackingPage = () => {
  const activeTracking = mockTrackingData[0];

  const statusIcons = {
    pickup_completed: CheckCircle,
    in_transit: Truck,
    out_for_delivery: MapPin,
    delivered: CheckCircle
  };

  const statusColors = {
    pickup_completed: "text-success",
    in_transit: "text-logistics-blue",
    out_for_delivery: "text-logistics-orange",
    delivered: "text-success"
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-heading">Live Tracking</h1>
          <p className="text-muted-foreground">Track your cargo in real-time</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 lg:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Enter cargo ID to track..."
              className="pl-10"
              defaultValue="#3565432"
            />
          </div>
          <Button className="bg-gradient-primary hover:bg-primary-hover">
            Track
          </Button>
        </div>
      </div>

      {/* Main Tracking Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Map View */}
        <div className="lg:col-span-2">
          <Card className="card-elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Live GPS Tracking
                </CardTitle>
                <Badge className="bg-logistics-blue text-logistics-blue-foreground">
                  {activeTracking.status.split('_').map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <TrackingMap />
            </CardContent>
          </Card>

          {/* Route Progress */}
          <Card className="card-elevated mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-accent" />
                Route Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold">{activeTracking.route.progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="bg-gradient-primary h-3 rounded-full transition-all duration-500"
                  style={{ width: `${activeTracking.route.progress}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span className="text-xs text-muted-foreground font-medium">FROM</span>
                  </div>
                  <p className="text-sm font-medium pl-5">{activeTracking.route.from}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-accent rounded-full"></div>
                    <span className="text-xs text-muted-foreground font-medium">TO</span>
                  </div>
                  <p className="text-sm font-medium pl-5">{activeTracking.route.to}</p>
                </div>
              </div>

              <div className="bg-muted rounded-lg p-4 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-logistics-blue" />
                  <span className="text-sm font-medium">Current Location</span>
                </div>
                <p className="text-sm text-muted-foreground">{activeTracking.route.currentLocation}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tracking Details */}
        <div className="space-y-6">
          {/* Cargo Info */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Cargo Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-bold text-foreground">{activeTracking.id}</h3>
                <p className="text-sm text-muted-foreground">Cargo ID</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-logistics-orange" />
                  <span className="text-sm font-medium">ETA</span>
                </div>
                <span className="text-sm font-bold text-logistics-orange">
                  {activeTracking.estimatedDelivery}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Driver Info */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-accent" />
                Driver Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <Navigation className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{activeTracking.driver.name}</p>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">Rating:</span>
                    <span className="text-xs font-semibold text-logistics-orange">
                      ★ {activeTracking.driver.rating}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Truck ID:</span>
                  <span className="font-medium">{activeTracking.driver.truck}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">{activeTracking.driver.phone}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button size="sm" variant="outline" className="w-full">
                  <Phone className="h-3 w-3 mr-1" />
                  Call
                </Button>
                <Button size="sm" variant="outline" className="w-full">
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Chat
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Timeline */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-logistics-blue" />
                Delivery Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeTracking.timeline.map((item, index) => {
                const Icon = statusIcons[item.status as keyof typeof statusIcons];
                const iconColor = statusColors[item.status as keyof typeof statusColors];

                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.completed ? 'bg-success/10' : 'bg-muted'
                      }`}>
                      <Icon className={`h-4 w-4 ${item.completed ? 'text-success' : iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${item.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {item.status.split('_').map(word =>
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.time} • {item.date}</p>
                    </div>
                    {item.completed && (
                      <CheckCircle className="h-4 w-4 text-success" />
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;