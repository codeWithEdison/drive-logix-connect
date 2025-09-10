import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Clock,
  Phone,
  Package,
  Navigation,
  CheckCircle,
  Star,
  Camera,
  Upload,
  AlertCircle,
  PenTool,
} from "lucide-react";

interface DeliveryCardProps {
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
  };
  onViewDetails: (delivery: any) => void;
  onNavigate?: () => void;
  onCallClient?: () => void;
  onMarkDelivered?: () => void;
  onUploadLoadingPhotos?: () => void;
  onUploadDeliveryPhotos?: () => void;
  onUploadReceiptPhotos?: () => void;
  onCaptureSignature?: () => void;
  onReportIssue?: () => void;
  showActions?: boolean;
}

export function DeliveryCard({
  delivery,
  onViewDetails,
  onNavigate,
  onCallClient,
  onMarkDelivered,
  onUploadLoadingPhotos,
  onUploadDeliveryPhotos,
  onUploadReceiptPhotos,
  onCaptureSignature,
  onReportIssue,
  showActions = true,
}: DeliveryCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "active":
        return "bg-blue-100 text-blue-800";
      case "in_transit":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    return priority === "urgent"
      ? "bg-red-100 text-red-800"
      : "bg-gray-100 text-gray-800";
  };

  const isCompleted =
    delivery.status === "delivered" || delivery.status === "completed";
  const isActive =
    delivery.status === "active" || delivery.status === "in_transit";

  return (
    <Card
      className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={() => onViewDetails(delivery)}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-4 w-4 text-gray-500" />
              <span className="font-semibold text-sm">{delivery.id}</span>
              <Badge className={`text-xs ${getStatusColor(delivery.status)}`}>
                {delivery.status?.replace("_", " ") || "Unknown"}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">{delivery.cargo}</p>
          </div>
          <div className="text-right">
            <Badge className={`text-xs ${getPriorityColor(delivery.priority)}`}>
              {delivery.priority}
            </Badge>
            {delivery.rating && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <span className="text-xs text-gray-600">{delivery.rating}</span>
              </div>
            )}
          </div>
        </div>

        {/* Route Information */}
        <div className="space-y-2 mb-3">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-gray-900 truncate">
                {delivery.from}
              </p>
              <p className="text-gray-500 text-xs">to</p>
              <p className="font-medium text-blue-600 truncate">
                {delivery.to}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Navigation className="h-3 w-3" />
            <span>{delivery.distance}</span>
            {delivery.estimatedTime && (
              <>
                <span>•</span>
                <Clock className="h-3 w-3" />
                <span>{delivery.estimatedTime}</span>
              </>
            )}
          </div>
        </div>

        {/* Client Information */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Client:</span>
            <span className="text-sm font-medium">{delivery.client}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-2"
            onClick={(e) => {
              e.stopPropagation();
              onCallClient?.();
            }}
          >
            <Phone className="h-3 w-3 mr-1" />
            Call
          </Button>
        </div>

        {/* Action Buttons - Only show for active deliveries */}
        {showActions && isActive && (
          <div className="space-y-2">
            {/* Primary Actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                className="h-10"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate?.();
                }}
              >
                <Navigation className="h-3 w-3 mr-1" />
                Navigate
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-10"
                onClick={(e) => {
                  e.stopPropagation();
                  onUploadLoadingPhotos?.();
                }}
              >
                <Camera className="h-3 w-3 mr-1" />
                Loading Photos
              </Button>
            </div>

            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-10"
                onClick={(e) => {
                  e.stopPropagation();
                  onUploadDeliveryPhotos?.();
                }}
              >
                <Upload className="h-3 w-3 mr-1" />
                Delivery Photos
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-10"
                onClick={(e) => {
                  e.stopPropagation();
                  onUploadReceiptPhotos?.();
                }}
              >
                <Package className="h-3 w-3 mr-1" />
                Receipt Photos
              </Button>
            </div>

            {/* Signature and Delivery Confirmation */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-10"
                onClick={(e) => {
                  e.stopPropagation();
                  onCaptureSignature?.();
                }}
              >
                <PenTool className="h-3 w-3 mr-1" />
                Capture Signature
              </Button>
              <Button
                size="sm"
                className="h-10 bg-green-600 hover:bg-green-700"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkDelivered?.();
                }}
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Mark Delivered
              </Button>
            </div>

            {/* Issue Reporting */}
            <Button
              size="sm"
              variant="outline"
              className="w-full h-10 text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                onReportIssue?.();
              }}
            >
              <AlertCircle className="h-3 w-3 mr-1" />
              Report Issue
            </Button>
          </div>
        )}

        {/* Completed Delivery Info */}
        {isCompleted && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Completed:</span>
              <span className="font-medium">{delivery.completedAt}</span>
            </div>
            {delivery.rating && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Rating:</span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < Math.floor(delivery.rating!)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-xs text-gray-600 ml-1">
                    {delivery.rating}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* View Details Button */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <Button
            size="sm"
            variant="outline"
            className="w-full h-10"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(delivery);
            }}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
