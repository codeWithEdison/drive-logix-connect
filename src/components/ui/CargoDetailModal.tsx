import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ModernModel from "@/components/modal/ModernModel";
import {
  MapPin,
  Phone,
  Clock,
  Package,
  Truck,
  User,
  Calendar,
  Navigation,
  Camera,
  AlertCircle,
  CheckCircle,
  Star,
  Building,
  X,
  Download,
} from "lucide-react";

export interface CargoDetail {
  id: string;
  cargo_number?: string; // LC prefix reference number
  status:
    | "active"
    | "pending"
    | "completed"
    | "transit"
    | "delivered"
    | "cancelled"
    | "assigned"
    | "picked_up"
    | "in_transit";
  from: string;
  to: string;
  client?: string;
  driver?: string;
  phone: string;
  weight: string;
  type: string;
  pickupTime?: string;
  estimatedDelivery?: string;
  priority?: "urgent" | "standard" | "high" | "normal" | "low";
  assignedDate?: string;
  distance: string;
  earnings?: string;
  cost?: number;
  description?: string;
  specialInstructions?: string;
  vehicleType?: string;
  createdDate?: string;
  pickupDate?: string;
  deliveryDate?: string;
  estimatedTime?: string;
  pickupContact?: string;
  pickupContactPhone?: string;
  deliveryContact?: string;
  deliveryContactPhone?: string;
  // Enhanced fields for better data display
  clientCompany?: string;
  clientContactPerson?: string;
  clientPhone?: string;
  driverName?: string;
  driverPhone?: string;
  driverRating?: string;
  driverLicense?: string;
  vehiclePlate?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  // New fields for enhanced table display
  pickupLocation?: any;
  destinationLocation?: any;
  vehicleInfo?: {
    plate_number: string;
    make: string;
    model: string;
  };
  // Assignment system fields
  assignmentStatus?: "pending" | "accepted" | "rejected" | "cancelled";
  driverRespondedAt?: string;
  rejectionReason?: string;
  assignmentExpiresAt?: string;
  assignmentCreatedBy?: string;
  assignmentNotes?: string;
  assignmentId?: string;
  driverStatus?:
    | "available"
    | "pending_assignment"
    | "on_duty"
    | "unavailable"
    | "suspended";
}

interface CargoDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  cargo: CargoDetail | null;
  onAccept?: (cargoId: string) => void;
  onStartDelivery?: (cargoId: string) => void;
  onCallClient?: (phone: string) => void;
  onCallDriver?: (phone: string) => void;
  onUploadPhoto?: (cargoId: string) => void;
  onReportIssue?: (cargoId: string) => void;
  onCancelCargo?: (cargoId: string) => void;
  onDownloadReceipt?: (cargoId: string) => void;
  // Assignment system actions
  onAcceptAssignment?: (assignmentId: string, notes?: string) => void;
  onRejectAssignment?: (
    assignmentId: string,
    reason: string,
    notes?: string
  ) => void;
  onCancelAssignment?: (assignmentId: string) => void;
  onChangeVehicle?: (assignmentId: string, vehicleId: string) => void;
  onChangeDriver?: (assignmentId: string, driverId: string) => void;
  onCreateAssignment?: (
    cargoId: string,
    driverId: string,
    vehicleId: string,
    notes?: string
  ) => void;
}

export function CargoDetailModal({
  isOpen,
  onClose,
  cargo,
  onAccept,
  onStartDelivery,
  onCallClient,
  onCallDriver,
  onUploadPhoto,
  onReportIssue,
  onCancelCargo,
  onDownloadReceipt,
  onAcceptAssignment,
  onRejectAssignment,
  onCancelAssignment,
  onChangeVehicle,
  onChangeDriver,
  onCreateAssignment,
}: CargoDetailModalProps) {
  if (!cargo) return null;

  // Helper functions for assignment system
  const isAssignmentExpired = () => {
    if (!cargo.assignmentExpiresAt) return false;
    return new Date() > new Date(cargo.assignmentExpiresAt);
  };

  const getTimeUntilExpiry = () => {
    if (!cargo.assignmentExpiresAt) return null;
    const now = new Date();
    const expiry = new Date(cargo.assignmentExpiresAt);
    const diffMs = expiry.getTime() - now.getTime();

    if (diffMs <= 0) return "Expired";

    const minutes = Math.floor(diffMs / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    return `${minutes}m ${seconds}s`;
  };

  const canDriverRespond = () => {
    return cargo.assignmentStatus === "pending" && !isAssignmentExpired();
  };

  const canAdminManage = () => {
    return ["pending", "accepted"].includes(cargo.assignmentStatus || "");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-600">
            Awaiting Quote
          </Badge>
        );
      case "quoted":
        return <Badge className="bg-blue-100 text-blue-600">Quote Sent</Badge>;
      case "accepted":
        return (
          <Badge className="bg-indigo-100 text-indigo-600">
            Quote Accepted
          </Badge>
        );
      case "assigned":
        return (
          <Badge className="bg-purple-100 text-purple-600">
            Driver Assigned
          </Badge>
        );
      case "picked_up":
        return (
          <Badge className="bg-orange-100 text-orange-600">
            Cargo Collected
          </Badge>
        );
      case "in_transit":
        return <Badge className="bg-blue-100 text-blue-600">In Transit</Badge>;
      case "delivered":
        return <Badge className="bg-green-100 text-green-600">Delivered</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-600">Cancelled</Badge>;
      case "disputed":
        return <Badge className="bg-red-100 text-red-600">Disputed</Badge>;
      // Legacy status mappings for backward compatibility
      case "active":
        return <Badge className="bg-green-100 text-green-600">Active</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-600">Completed</Badge>;
      case "transit":
        return <Badge className="bg-blue-100 text-blue-600">In Transit</Badge>;
      default:
        return (
          <Badge className="bg-gray-100 text-gray-600 capitalize">
            {status}
          </Badge>
        );
    }
  };

  const getAssignmentStatusBadge = (assignmentStatus: string) => {
    switch (assignmentStatus) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-600">
            Assignment Pending
          </Badge>
        );
      case "accepted":
        return (
          <Badge className="bg-green-100 text-green-600">
            Assignment Accepted
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-600">Assignment Rejected</Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-gray-100 text-gray-600">
            Assignment Cancelled
          </Badge>
        );
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge className="bg-red-100 text-red-600">Urgent</Badge>;
      case "high":
        return <Badge className="bg-orange-100 text-orange-600">High</Badge>;
      case "normal":
        return <Badge className="bg-blue-100 text-blue-600">Normal</Badge>;
      case "low":
        return <Badge className="bg-gray-100 text-gray-600">Low</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-600">Standard</Badge>;
    }
  };

  const getPriorityDescription = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "Critical shipment requiring immediate attention (e.g., medical supplies, emergency deliveries)";
      case "high":
        return "Important shipment requiring faster processing (e.g., business documents, important packages)";
      case "normal":
        return "Standard priority, default processing for most regular shipments";
      case "low":
        return "Non-urgent, can be processed during normal operations (e.g., regular deliveries, non-time-sensitive items)";
      default:
        return "Standard priority processing";
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "pending":
        return "Request submitted, waiting for pricing";
      case "quoted":
        return "Price quote provided, awaiting acceptance";
      case "accepted":
        return "Client confirmed, ready for assignment";
      case "assigned":
        return "Driver and vehicle assigned for pickup";
      case "picked_up":
        return "Successfully picked up, now in transit";
      case "in_transit":
        return "Being transported to destination";
      case "delivered":
        return "Successfully delivered to destination";
      case "cancelled":
        return "Shipment was cancelled";
      case "disputed":
        return "Issue reported, under investigation";
      case "active":
        return "Cargo is active and being processed";
      case "completed":
        return "Cargo delivery completed";
      case "transit":
        return "Being transported to destination";
      default:
        return `Status: ${status}`;
    }
  };

  const isDriverCargo = cargo.client && !cargo.driver;
  const isClientCargo = cargo.driver && !cargo.client;

  return (
    <ModernModel
      isOpen={isOpen}
      onClose={onClose}
      title={`Cargo ${cargo.cargo_number || cargo.id}`}
    >
      <div className="space-y-6">
        {/* Header Info */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {cargo.cargo_number || cargo.id}
            </h3>
            <p className="text-sm text-gray-600">
              {isDriverCargo
                ? `Assigned on ${cargo.assignedDate}`
                : `Created on ${cargo.createdDate}`}
            </p>
            {/* Assignment expiry timer */}
            {cargo.assignmentStatus === "pending" &&
              cargo.assignmentExpiresAt && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500">
                    Response required within:{" "}
                    <span
                      className={`font-semibold ${
                        isAssignmentExpired()
                          ? "text-red-600"
                          : "text-orange-600"
                      }`}
                    >
                      {getTimeUntilExpiry()}
                    </span>
                  </p>
                </div>
              )}
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(cargo.status)}
            {cargo.assignmentStatus &&
              getAssignmentStatusBadge(cargo.assignmentStatus)}
            {cargo.priority && getPriorityBadge(cargo.priority)}
          </div>
        </div>

        {/* Assignment Information */}
        {cargo.assignmentStatus && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="h-5 w-5 text-purple-600" />
                <h4 className="font-semibold text-gray-900">
                  Assignment Information
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 font-medium">
                    Assignment Status
                  </p>
                  <div className="mt-1">
                    {getAssignmentStatusBadge(cargo.assignmentStatus)}
                  </div>
                </div>
                {cargo.assignmentExpiresAt && (
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      Expires At
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(cargo.assignmentExpiresAt).toLocaleString()}
                    </p>
                  </div>
                )}
                {cargo.driverRespondedAt && (
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      Driver Responded
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(cargo.driverRespondedAt).toLocaleString()}
                    </p>
                  </div>
                )}
                {cargo.rejectionReason && (
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      Rejection Reason
                    </p>
                    <p className="text-sm text-red-600">
                      {cargo.rejectionReason}
                    </p>
                  </div>
                )}
                {cargo.assignmentNotes && (
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-500 font-medium">
                      Assignment Notes
                    </p>
                    <p className="text-sm text-gray-900">
                      {cargo.assignmentNotes}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status and Priority Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-blue-800 mb-1">
                  Current Status
                </h4>
                <p className="text-sm text-blue-700">
                  {getStatusDescription(cargo.status)}
                </p>
              </div>
            </div>
          </div>

          {cargo.priority && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-orange-800 mb-1">
                    Priority Level
                  </h4>
                  <p className="text-sm text-orange-700">
                    {getPriorityDescription(cargo.priority)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Client Information */}
        {cargo.client && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <User className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-gray-900">
                  Client Information
                </h4>
              </div>
              <div className="space-y-3">
                {/* Company Name (if available) */}
                {cargo.clientCompany && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Building className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-600">
                        COMPANY
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {cargo.clientCompany}
                    </p>
                  </div>
                )}

                {/* Client Name */}
                <div>
                  <p className="text-xs text-gray-500 font-medium">
                    Client Name
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {cargo.client}
                  </p>
                </div>

                {/* Contact Person (if different from client name) */}
                {cargo.clientContactPerson &&
                  cargo.clientContactPerson !== cargo.client && (
                    <div>
                      <p className="text-xs text-gray-500 font-medium">
                        Contact Person
                      </p>
                      <p className="text-sm text-gray-900">
                        {cargo.clientContactPerson}
                      </p>
                    </div>
                  )}

                {/* Phone Number */}
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-900">
                    {cargo.clientPhone || cargo.phone}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Driver Information */}
        {cargo.driver && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Truck className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-gray-900">
                  Driver Information
                </h4>
              </div>
              <div className="space-y-3">
                {/* Driver Name */}
                <div>
                  <p className="text-xs text-gray-500 font-medium">
                    Driver Name
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {cargo.driverName || cargo.driver}
                  </p>
                </div>

                {/* Driver Rating */}
                {cargo.driverRating && (
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-900">
                      {cargo.driverRating}★
                    </span>
                  </div>
                )}

                {/* Driver License */}
                {cargo.driverLicense && (
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      License Number
                    </p>
                    <p className="text-sm text-gray-900">
                      {cargo.driverLicense}
                    </p>
                  </div>
                )}

                {/* Driver Phone */}
                {cargo.driverPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-900">
                      {cargo.driverPhone}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vehicle Information */}
        {(cargo.vehiclePlate || cargo.vehicleMake || cargo.vehicleModel) && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Truck className="h-5 w-5 text-purple-600" />
                <h4 className="font-semibold text-gray-900">
                  Vehicle Information
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {cargo.vehiclePlate && (
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      Plate Number
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {cargo.vehiclePlate}
                    </p>
                  </div>
                )}
                {(cargo.vehicleMake || cargo.vehicleModel) && (
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Vehicle</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {cargo.vehicleMake} {cargo.vehicleModel}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Route Information */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Navigation className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold text-gray-900">Route Details</h4>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium">
                    PICKUP LOCATION
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {cargo.from}
                  </p>
                  <p className="text-xs text-green-600">
                    {cargo.pickupTime || cargo.pickupDate}
                  </p>
                  {(cargo.pickupContact || cargo.pickupContactPhone) && (
                    <div className="mt-2 p-2 bg-green-50 rounded-lg">
                      <p className="text-xs text-gray-600 font-medium">
                        Contact Person:
                      </p>
                      {cargo.pickupContact && (
                        <p className="text-xs text-gray-900">
                          {cargo.pickupContact}
                        </p>
                      )}
                      {cargo.pickupContactPhone && (
                        <div className="flex items-center gap-1 mt-1">
                          <Phone className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-900">
                            {cargo.pickupContactPhone}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pl-6">
                <div className="w-px h-8 bg-gray-300"></div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full mt-1.5"></div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium">
                    DELIVERY LOCATION
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {cargo.to}
                  </p>
                  <p className="text-xs text-red-600">
                    {cargo.estimatedDelivery || cargo.deliveryDate}
                  </p>
                  {(cargo.deliveryContact || cargo.deliveryContactPhone) && (
                    <div className="mt-2 p-2 bg-red-50 rounded-lg">
                      <p className="text-xs text-gray-600 font-medium">
                        Contact Person:
                      </p>
                      {cargo.deliveryContact && (
                        <p className="text-xs text-gray-900">
                          {cargo.deliveryContact}
                        </p>
                      )}
                      {cargo.deliveryContactPhone && (
                        <div className="flex items-center gap-1 mt-1">
                          <Phone className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-900">
                            {cargo.deliveryContactPhone}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Distance: {cargo.distance}
                </span>
                {cargo.vehicleType && (
                  <span className="text-sm text-gray-600">
                    • Vehicle: {cargo.vehicleType}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cargo Details and Additional Info - 2 cards per row on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Cargo Details */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <Package className="h-5 w-5 text-orange-600" />
                <h4 className="font-semibold text-gray-900">
                  Cargo Information
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {cargo.type}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Weight</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {cargo.weight}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">
                    {isDriverCargo ? "Earnings" : "Cost"}
                  </p>
                  <p className="text-sm font-bold text-green-600">
                    {isDriverCargo
                      ? cargo.earnings
                      : cargo.cost
                      ? new Intl.NumberFormat("rw-RW", {
                          style: "currency",
                          currency: "RWF",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(cargo.cost)
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">
                    {cargo.status}
                  </p>
                </div>
              </div>
              {cargo.description && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Description</p>
                  <p className="text-sm text-gray-900">{cargo.description}</p>
                </div>
              )}
              {cargo.specialInstructions && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Special Instructions</p>
                  <p className="text-sm text-gray-900">
                    {cargo.specialInstructions}
                  </p>
                </div>
              )}
              {cargo.estimatedTime && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Estimated Time</p>
                  <p className="text-sm text-gray-900">{cargo.estimatedTime}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="h-5 w-5 text-purple-600" />
                <h4 className="font-semibold text-gray-900">
                  Additional Information
                </h4>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Cargo Number</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {cargo.cargo_number || cargo.id}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Distance</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {cargo.distance}
                  </p>
                </div>
                {cargo.vehicleType && (
                  <div>
                    <p className="text-xs text-gray-500">Vehicle Type</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {cargo.vehicleType}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500">
                    {isDriverCargo ? "Assigned Date" : "Created Date"}
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {isDriverCargo ? cargo.assignedDate : cargo.createdDate}
                  </p>
                </div>
                {cargo.pickupDate && (
                  <div>
                    <p className="text-xs text-gray-500">Pickup Date</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {cargo.pickupDate}
                    </p>
                  </div>
                )}
                {cargo.deliveryDate && (
                  <div>
                    <p className="text-xs text-gray-500">Delivery Date</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {cargo.deliveryDate}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Assignment System Actions */}
          {cargo.assignmentStatus === "pending" && canDriverRespond() && (
            <div className="space-y-2">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800 font-medium mb-2">
                  Assignment Response Required
                </p>
                <p className="text-xs text-yellow-700">
                  You have {getTimeUntilExpiry()} to respond to this assignment.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() =>
                    onAcceptAssignment?.(cargo.assignmentId || cargo.id)
                  }
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept Assignment
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                  onClick={() => {
                    const reason = prompt(
                      "Please provide a reason for rejection:"
                    );
                    if (reason) {
                      onRejectAssignment?.(
                        cargo.assignmentId || cargo.id,
                        reason
                      );
                    }
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject Assignment
                </Button>
              </div>
            </div>
          )}

          {/* Assignment Expired */}
          {cargo.assignmentStatus === "pending" && isAssignmentExpired() && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800 font-medium">
                Assignment Expired
              </p>
              <p className="text-xs text-red-700">
                This assignment has expired and will be automatically rejected.
              </p>
            </div>
          )}

          {/* Admin Assignment Management */}
          {canAdminManage() && (
            <div className="space-y-2">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800 font-medium mb-2">
                  Assignment Management
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const vehicleId = prompt("Enter new vehicle ID:");
                    if (vehicleId) {
                      onChangeVehicle?.(
                        cargo.assignmentId || cargo.id,
                        vehicleId
                      );
                    }
                  }}
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Change Vehicle
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                  onClick={() =>
                    onCancelAssignment?.(cargo.assignmentId || cargo.id)
                  }
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel Assignment
                </Button>
              </div>
            </div>
          )}

          {/* Standard Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                if (isDriverCargo) {
                  onCallClient?.(cargo.clientPhone || cargo.phone);
                } else if (isClientCargo) {
                  onCallDriver?.(cargo.driverPhone || cargo.phone);
                }
              }}
            >
              <Phone className="h-4 w-4 mr-2" />
              {isDriverCargo ? "Call Client" : "Call Driver"}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onUploadPhoto?.(cargo.id)}
            >
              <Camera className="h-4 w-4 mr-2" />
              Upload Photo
            </Button>
          </div>

          {/* Driver Actions */}
          {isDriverCargo && cargo.assignmentStatus === "accepted" && (
            <>
              {cargo.status === "assigned" && (
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => onStartDelivery?.(cargo.id)}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Mark Picked Up
                </Button>
              )}

              {cargo.status === "picked_up" && (
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => onStartDelivery?.(cargo.id)}
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Start Transit
                </Button>
              )}

              {cargo.status === "in_transit" && (
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => onStartDelivery?.(cargo.id)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Delivered
                </Button>
              )}
            </>
          )}

          {/* Client Actions */}
          {isClientCargo && (
            <>
              {/* Cancellation is only allowed before picked_up status */}
              {["pending", "quoted", "accepted", "assigned"].includes(
                cargo.status
              ) && (
                <Button
                  variant="outline"
                  className="w-full text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                  onClick={() => onCancelCargo?.(cargo.id)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel Cargo
                </Button>
              )}

              {cargo.status === "delivered" && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => onDownloadReceipt?.(cargo.id)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Receipt
                </Button>
              )}
            </>
          )}

          <Button
            variant="outline"
            className="w-full text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
            onClick={() => onReportIssue?.(cargo.id)}
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Report Issue
          </Button>
        </div>
      </div>
    </ModernModel>
  );
}
