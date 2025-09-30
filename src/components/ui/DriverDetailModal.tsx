import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ModernModel from "@/components/modal/ModernModel";
import {
  Truck,
  Phone,
  Clock,
  User,
  Calendar,
  MapPin,
  Star,
  CheckCircle,
  AlertCircle,
  Building,
  Mail,
  Navigation,
} from "lucide-react";
import { Driver } from "./DriverTable";
import { useDriverDocumentsById } from "@/lib/api/hooks";
import {
  formatDate,
  formatDateTime,
  isExpired,
  getDaysUntilExpiry,
} from "@/lib/utils/dateUtils";
import {
  FileText,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

interface DriverDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver: Driver | null;
  onCallDriver?: (phone: string) => void;
  onTrackDriver?: (driverId: string) => void;
  onEditDriver?: (driver: Driver) => void;
  onDownloadDocuments?: (driverId: string) => void;
  onPreviewDocument?: (documentUrl: string, documentName: string) => void;
}

export function DriverDetailModal({
  isOpen,
  onClose,
  driver,
  onCallDriver,
  onTrackDriver,
  onEditDriver,
  onDownloadDocuments,
  onPreviewDocument,
}: DriverDetailModalProps) {
  if (!driver) return null;

  // Fetch driver documents
  const { data: documents, isLoading: documentsLoading } =
    useDriverDocumentsById(driver.id);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-100 text-green-600">Available</Badge>;
      case "on_duty":
        return <Badge className="bg-blue-100 text-blue-600">On Duty</Badge>;
      case "unavailable":
        return (
          <Badge className="bg-yellow-100 text-yellow-600">Unavailable</Badge>
        );
      case "suspended":
        return <Badge className="bg-red-100 text-red-600">Suspended</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-600">{status}</Badge>;
    }
  };

  const getLicenseTypeBadge = (licenseType: string) => {
    return (
      <Badge className="bg-purple-100 text-purple-600">{licenseType}</Badge>
    );
  };

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case "license":
        return "Driver's License";
      case "medical_cert":
        return "Medical Certificate";
      case "insurance":
        return "Insurance Document";
      case "vehicle_registration":
        return "Vehicle Registration";
      case "other":
        return "Other Document";
      default:
        return type;
    }
  };

  const getDocumentStatusBadge = (document: any) => {
    const isDocExpired = isExpired(document.expiry_date);
    const daysUntilExpiry = getDaysUntilExpiry(document.expiry_date);

    if (isDocExpired) {
      return <Badge className="bg-red-100 text-red-600">Expired</Badge>;
    } else if (daysUntilExpiry <= 30) {
      return (
        <Badge className="bg-yellow-100 text-yellow-600">Expires Soon</Badge>
      );
    } else if (document.is_verified) {
      return <Badge className="bg-green-100 text-green-600">Verified</Badge>;
    } else {
      return (
        <Badge className="bg-gray-100 text-gray-600">
          Pending Verification
        </Badge>
      );
    }
  };

  return (
    <ModernModel
      isOpen={isOpen}
      onClose={onClose}
      title={`Driver: ${driver.full_name}`}
    >
      <div className="space-y-6">
        {/* Header Info */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {driver.full_name}
            </h3>
            <p className="text-sm text-gray-600">Driver ID: {driver.id}</p>
            {driver.driver_number && (
              <p className="text-sm text-gray-600">
                Driver Number: {driver.driver_number}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(driver.status)}
            {getRatingStars(driver.rating)}
          </div>
        </div>

        {/* Contact Information */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <User className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold text-gray-900">
                Contact Information
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-sm text-gray-900">{driver.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="text-sm text-gray-900">{driver.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Date of Birth
                </p>
                <p className="text-sm text-gray-900">
                  {formatDate(driver.date_of_birth)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Last Active</p>
                <p className="text-sm text-gray-900">
                  {formatDateTime(driver.lastActive)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* License Information */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Truck className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold text-gray-900">
                License Information
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  License Number
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {driver.license_number}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  License Type
                </p>
                {getLicenseTypeBadge(driver.license_type)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  License Expiry
                </p>
                <p className="text-sm text-gray-900">
                  {formatDate(driver.license_expiry)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Medical Certificate Expiry
                </p>
                <p className="text-sm text-gray-900">
                  {formatDate(driver.medical_certificate_expiry)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Statistics */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Star className="h-5 w-5 text-yellow-600" />
              <h4 className="font-semibold text-gray-900">
                Performance Statistics
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {driver.total_deliveries}
                </p>
                <p className="text-sm text-blue-600">Total Deliveries</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {driver.total_distance_km.toFixed(0)}
                </p>
                <p className="text-sm text-green-600">Total Distance (km)</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">
                  {driver.rating.toFixed(1)}
                </p>
                <p className="text-sm text-yellow-600">Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <h4 className="font-semibold text-gray-900">Emergency Contact</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Emergency Contact
                </p>
                <p className="text-sm text-gray-900">
                  {driver.emergency_contact}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Emergency Phone
                </p>
                <p className="text-sm text-gray-900">
                  {driver.emergency_phone}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Blood Type</p>
                <p className="text-sm text-gray-900">{driver.blood_type}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents Section */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold text-gray-900">Documents</h4>
            </div>

            {documentsLoading ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Loading documents...</p>
              </div>
            ) : documents && documents.length > 0 ? (
              <div className="space-y-3">
                {documents.map((document) => (
                  <div
                    key={document.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {getDocumentTypeLabel(document.document_type)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {document.document_number} • Expires:{" "}
                          {formatDate(document.expiry_date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getDocumentStatusBadge(document)}

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            onPreviewDocument?.(
                              document.file_url,
                              getDocumentTypeLabel(document.document_type)
                            )
                          }
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            window.open(document.file_url, "_blank")
                          }
                          className="h-8 w-8 p-0"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No documents found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onCallDriver?.(driver.phone)}
            >
              <Phone className="h-4 w-4 mr-2" />
              Call Driver
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onTrackDriver?.(driver.id)}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Track Location
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onEditDriver?.(driver)}
            >
              <User className="h-4 w-4 mr-2" />
              Edit Driver
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onDownloadDocuments?.(driver.id)}
            >
              <Building className="h-4 w-4 mr-2" />
              Download Documents
            </Button>
          </div>
        </div>
      </div>
    </ModernModel>
  );
}
