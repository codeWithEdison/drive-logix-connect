import React from "react";
import ModernModel from "@/components/modal/ModernModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ContactDropdown } from "@/components/ui/ContactDropdown";
import {
  MapPin,
  Clock,
  Phone,
  Package,
  Navigation,
  CheckCircle,
  User,
  Calendar,
  Truck,
  AlertCircle,
} from "lucide-react";

interface DeliveryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  delivery: {
    id: string;
    cargo: string;
    from: string;
    to: string;
    client: string;
    phone: string;
    status: string;
    priority: string;
    estimatedTime?: string;
    distance?: string;
    completedAt?: string;
    rating?: number;
    earnings?: string;
  } | null;
  onCallClient?: () => void;
  onNavigate?: () => void;
  onUploadPhoto?: () => void;
  onReportIssue?: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "in_transit":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "pickup_scheduled":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "delivered":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "urgent":
      return "bg-red-100 text-red-800 border-red-200";
    case "high":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export function DeliveryDetailModal({
  isOpen,
  onClose,
  delivery,
  onCallClient,
  onNavigate,
  onUploadPhoto,
  onReportIssue,
}: DeliveryDetailModalProps) {
  if (!delivery) return null;

  const isCompleted = delivery.status === "delivered";

  // Mock contact data - in real app this would come from the delivery data
  const contacts = [
    {
      id: "1",
      name: delivery.client,
      phone: delivery.phone,
      type: "pickup" as const,
      company: "Pickup Company",
    },
    {
      id: "2",
      name: delivery.client,
      phone: delivery.phone,
      type: "delivery" as const,
      company: "Delivery Company",
    },
  ];

  const handleCallContact = (contact: any) => {
    console.log("Calling contact:", contact);
    // Handle call logic here
  };

  const handleNavigate = () => {
    console.log("Navigate clicked");
  };

  const handleMarkDelivered = () => {
    console.log("Mark delivered clicked");
  };

  const handleStartPickup = () => {
    console.log("Start pickup clicked");
  };

  return (
    <ModernModel isOpen={isOpen} onClose={onClose} title="Delivery Details">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                {delivery.id}
              </h2>
              <h3 className="text-lg font-medium text-foreground">
                {delivery.cargo}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className={`border ${getStatusColor(delivery.status)}`}>
                {delivery.status?.replace("_", " ").toUpperCase() || "UNKNOWN"}
              </Badge>
              {!isCompleted && (
                <Badge
                  className={`border ${getPriorityColor(delivery.priority)}`}
                >
                  {delivery.priority.toUpperCase()}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Route Information */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Route Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Pickup Location
                      </p>
                      <p className="font-medium">{delivery.from}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Delivery Location
                      </p>
                      <p className="font-medium">{delivery.to}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {delivery.distance && (
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{delivery.distance}</span>
                    </div>
                  )}
                  {delivery.estimatedTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        ETA: {delivery.estimatedTime}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Information */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Client Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Client Name</p>
                  <p className="font-medium">{delivery.client}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone Number</p>
                  <p className="font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {delivery.phone}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completion Details (if completed) */}
        {isCompleted && delivery.completedAt && (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Completion Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Completed At
                    </p>
                    <p className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {delivery.completedAt}
                    </p>
                  </div>
                  {delivery.rating && (
                    <div>
                      <p className="text-sm text-muted-foreground">Rating</p>
                      <p className="font-medium">⭐ {delivery.rating}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        {!isCompleted && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="flex-1 h-12 sm:h-10" onClick={onNavigate}>
                <Navigation className="h-4 w-4 mr-2" />
                Navigate
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-12 sm:h-10"
                onClick={onCallClient}
              >
                <Phone className="h-4 w-4 mr-2" />
                Call Client
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1 h-12 sm:h-10"
                onClick={onUploadPhoto}
              >
                <Package className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-12 sm:h-10 text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                onClick={onReportIssue}
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Report Issue
              </Button>
            </div>
          </div>
        )}

        {/* Warning for Urgent Deliveries */}
        {delivery.priority === "urgent" && !isCompleted && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-medium text-red-800">Urgent Delivery</p>
              <p className="text-sm text-red-600">
                This delivery requires immediate attention
              </p>
            </div>
          </div>
        )}
      </div>
    </ModernModel>
  );
}
