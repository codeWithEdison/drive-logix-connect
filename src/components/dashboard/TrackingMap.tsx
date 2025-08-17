import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Navigation, 
  Truck,
  Clock,
  Phone,
  MessageCircle
} from "lucide-react";

// Mock tracking data
const mockTrackingData = {
  cargoId: "#3565432",
  driver: {
    name: "Albert Flores",
    phone: "+1 (555) 123-4567",
    rating: 4.8
  },
  currentLocation: "Highway 45, 15 km from destination",
  estimatedArrival: "2:30 PM",
  status: "In Transit",
  route: {
    pickup: "4140 Parker Rd, Allentown, New Mexico 31134",
    destination: "3517 W. Gray St. Utica, Pennsylvania 57867",
    progress: 68
  }
};

export function TrackingMap() {
  const [selectedCargo, setSelectedCargo] = useState(mockTrackingData.cargoId);

  return (
    <div className="h-96 bg-muted rounded-lg relative overflow-hidden">
      {/* Map Placeholder - In real app, integrate with Google Maps or similar */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center p-8">
          <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
          <p className="text-lg font-semibold text-foreground mb-2">Live GPS Tracking</p>
          <p className="text-sm text-muted-foreground">Map integration will show real-time vehicle locations</p>
        </div>
      </div>

      {/* Simulated Map Elements */}
      <div className="absolute top-4 left-4 bg-card rounded-lg shadow-lg p-3 max-w-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
            <Truck className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">{mockTrackingData.cargoId}</p>
            <p className="text-xs text-muted-foreground">{mockTrackingData.currentLocation}</p>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {mockTrackingData.status}
          </Badge>
        </div>
        
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Est. Arrival</span>
            <span className="font-semibold text-primary">{mockTrackingData.estimatedArrival}</span>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold">{mockTrackingData.route.progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${mockTrackingData.route.progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Driver Info Card */}
      <div className="absolute bottom-4 right-4 bg-card rounded-lg shadow-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
            <Navigation className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">{mockTrackingData.driver.name}</p>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">Rating:</span>
              <span className="text-xs font-semibold text-logistics-orange">
                ★ {mockTrackingData.driver.rating}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1">
            <Phone className="h-3 w-3 mr-1" />
            Call
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <MessageCircle className="h-3 w-3 mr-1" />
            Chat
          </Button>
        </div>
      </div>

      {/* Route Markers (Simulated) */}
      <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-primary rounded-full shadow-lg"></div>
      <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-accent rounded-full shadow-lg animate-pulse"></div>
    </div>
  );
}