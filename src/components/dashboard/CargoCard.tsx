import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  User, 
  Clock, 
  Package,
  MoreVertical,
  Eye,
  Phone
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CargoCardProps {
  cargo: {
    id: string;
    status: 'pending' | 'transit' | 'delivered' | 'cancelled';
    from: string;
    to: string;
    driver: string;
    estimatedTime: string;
    weight: string;
    type: string;
  };
}

const statusConfig = {
  pending: {
    label: "Pending",
    className: "bg-orange-100 text-orange-800 border-orange-200",
    dotColor: "bg-logistics-orange"
  },
  transit: {
    label: "In Transit",
    className: "bg-blue-100 text-blue-800 border-blue-200",
    dotColor: "bg-logistics-blue"
  },
  delivered: {
    label: "Delivered",
    className: "bg-green-100 text-green-800 border-green-200",
    dotColor: "bg-success"
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-800 border-red-200",
    dotColor: "bg-destructive"
  }
};

export function CargoCard({ cargo }: CargoCardProps) {
  const status = statusConfig[cargo.status];

  return (
    <Card className="card-interactive group">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", status.dotColor)}></div>
            <span className="font-semibold text-foreground">{cargo.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={status.className}>
              {status.label}
            </Badge>
            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Route Information */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-3 h-3 bg-primary rounded-full mt-1 flex-shrink-0"></div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground font-medium">FROM</p>
              <p className="text-sm font-medium text-foreground line-clamp-2">{cargo.from}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 pl-6">
            <div className="w-px h-6 bg-border"></div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-3 h-3 bg-accent rounded-full mt-1 flex-shrink-0"></div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground font-medium">TO</p>
              <p className="text-sm font-medium text-foreground line-clamp-2">{cargo.to}</p>
            </div>
          </div>
        </div>

        {/* Cargo Details */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="text-sm font-medium">{cargo.type}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Weight</p>
              <p className="text-sm font-medium">{cargo.weight}</p>
            </div>
          </div>
        </div>

        {/* Driver & Time */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
              <User className="h-3 w-3" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Driver</p>
              <p className="text-sm font-medium">{cargo.driver}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">ETA</p>
            <p className="text-sm font-semibold text-primary">{cargo.estimatedTime}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" className="flex-1">
            <Eye className="h-4 w-4 mr-1" />
            Track
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <Phone className="h-4 w-4 mr-1" />
            Contact
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}