import React, { useState } from "react";
import ModernModel from "@/components/modal/ModernModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Truck,
  Package,
  Star,
  Activity,
  Shield,
  Crown,
  UserCheck,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Navigation,
  DollarSign,
  Car,
  FileText,
  Settings,
  Building,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { UserRole, BusinessType, DriverStatus } from "@/types/shared";

// User interface based on shared.ts
interface UserDetail {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  preferred_language: string;
  avatar_url?: string;
  is_active: boolean;
  is_verified: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;

  // Client-specific data
  client?: {
    company_name?: string;
    business_type: BusinessType;
    tax_id?: string;
    address?: string;
    city?: string;
    country?: string;
    postal_code?: string;
    contact_person?: string;
    credit_limit: number;
    payment_terms: number;
  };

  // Driver-specific data
  driver?: {
    license_number?: string;
    license_expiry?: string;
    license_type: string;
    date_of_birth?: string;
    emergency_contact?: string;
    emergency_phone?: string;
    blood_type?: string;
    medical_certificate_expiry?: string;
    status: DriverStatus;
    rating: number;
    total_deliveries: number;
    total_distance_km: number;
  };
}

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserDetail;
}

export function UserDetailModal({
  isOpen,
  onClose,
  user,
}: UserDetailModalProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");

  const getRoleColor = (role: string) => {
    switch (role) {
      case "client":
        return "hsl(var(--primary))";
      case "driver":
        return "hsl(var(--success))";
      case "admin":
        return "hsl(var(--info))";
      case "super_admin":
        return "hsl(var(--accent))";
      default:
        return "hsl(var(--primary))";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "client":
        return User;
      case "driver":
        return UserCheck;
      case "admin":
        return Shield;
      case "super_admin":
        return Crown;
      default:
        return User;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: {
        label: t("status.active"),
        className: "bg-green-100 text-green-600",
      },
      inactive: {
        label: t("status.inactive"),
        className: "bg-gray-100 text-gray-600",
      },
      pending: {
        label: t("status.pending"),
        className: "bg-yellow-100 text-yellow-600",
      },
      suspended: {
        label: t("status.suspended"),
        className: "bg-red-100 text-red-600",
      },
      available: {
        label: t("status.available"),
        className: "bg-green-100 text-green-600",
      },
      on_duty: {
        label: t("status.onDuty"),
        className: "bg-blue-100 text-blue-600",
      },
      unavailable: {
        label: t("status.unavailable"),
        className: "bg-gray-100 text-gray-600",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return config ? (
      <Badge className={config.className}>{config.label}</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-600">{status}</Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("rw-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderClientData = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {t("client.business")} {t("common.details")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">
                {t("client.business")} {t("common.type")}
              </p>
              <Badge variant="outline" className="mt-1">
                {user.client?.business_type === "corporate"
                  ? t("client.corporate")
                  : user.client?.business_type === "government"
                  ? t("client.government")
                  : t("client.individual")}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t("common.status")}</p>
              {getStatusBadge(user.is_active ? "active" : "inactive")}
            </div>
          </div>

          {user.client?.company_name && (
            <div>
              <p className="text-sm text-gray-600">
                {t("client.business")} {t("common.name")}
              </p>
              <p className="font-medium">{user.client.company_name}</p>
            </div>
          )}

          {user.client?.contact_person && (
            <div>
              <p className="text-sm text-gray-600">
                {t("client.contactPerson")}
              </p>
              <p className="font-medium">{user.client.contact_person}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">{t("client.creditLimit")}</p>
              <p className="font-medium">
                {formatCurrency(user.client?.credit_limit || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                {t("client.paymentTerms")}
              </p>
              <p className="font-medium">
                {user.client?.payment_terms || 30} {t("common.days")}
              </p>
            </div>
          </div>

          {user.client?.address && (
            <div>
              <p className="text-sm text-gray-600">{t("common.address")}</p>
              <p className="font-medium">{user.client.address}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">{t("common.city")}</p>
              <p className="font-medium">{user.client?.city || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t("common.country")}</p>
              <p className="font-medium">{user.client?.country || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDriverData = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            {t("driver.license")} {t("common.details")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">
                {t("driver.license")} {t("common.number")}
              </p>
              <p className="font-medium">
                {user.driver?.license_number || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                {t("driver.license")} {t("common.type")}
              </p>
              <p className="font-medium">
                {user.driver?.license_type || "N/A"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">
                {t("driver.license")} {t("common.expiry")}
              </p>
              <p className="font-medium">
                {user.driver?.license_expiry
                  ? formatDate(user.driver.license_expiry)
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t("common.status")}</p>
              {getStatusBadge(user.driver?.status || "unavailable")}
            </div>
          </div>

          {user.driver?.date_of_birth && (
            <div>
              <p className="text-sm text-gray-600">{t("driver.dateOfBirth")}</p>
              <p className="font-medium">
                {formatDate(user.driver.date_of_birth)}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">
                {t("driver.emergencyContact")}
              </p>
              <p className="font-medium">
                {user.driver?.emergency_contact || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                {t("driver.emergencyPhone")}
              </p>
              <p className="font-medium">
                {user.driver?.emergency_phone || "N/A"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">{t("driver.bloodType")}</p>
              <p className="font-medium">{user.driver?.blood_type || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                {t("driver.medicalCertExpiry")}
              </p>
              <p className="font-medium">
                {user.driver?.medical_certificate_expiry
                  ? formatDate(user.driver.medical_certificate_expiry)
                  : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {t("driver.performance")} {t("common.metrics")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {user.driver?.total_deliveries || 0}
              </p>
              <p className="text-sm text-gray-600">{t("driver.deliveries")}</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center justify-center gap-1">
                <Star className="h-4 w-4 text-yellow-600 fill-current" />
                <p className="text-2xl font-bold text-yellow-600">
                  {user.driver?.rating || 0}
                </p>
              </div>
              <p className="text-sm text-gray-600">{t("driver.rating")}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {(user.driver?.total_distance_km || 0).toLocaleString()} km
              </p>
              <p className="text-sm text-gray-600">{t("common.distance")}</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {user.is_verified
                  ? t("driver.isVerified")
                  : t("driver.notVerified")}
              </p>
              <p className="text-sm text-gray-600">
                {t("driver.verification")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderRoleSpecificData = () => {
    switch (user.role) {
      case "client":
        return renderClientData();
      case "driver":
        return renderDriverData();
      default:
        return null;
    }
  };

  const RoleIcon = getRoleIcon(user.role);

  return (
    <ModernModel
      isOpen={isOpen}
      onClose={onClose}
      title={`${t("common.user")} ${t("common.details")}`}
    >
      <div className="space-y-6">
        {/* User Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback
                  style={{ backgroundColor: getRoleColor(user.role) }}
                  className="text-white font-bold text-lg"
                >
                  {user.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {user.full_name}
                  </h2>
                  {getStatusBadge(user.is_active ? "active" : "inactive")}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <RoleIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600 capitalize">
                    {user.role?.replace("_", " ") || "Unknown"}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {user.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">{t("common.overview")}</TabsTrigger>
            <TabsTrigger value="details">{t("common.details")}</TabsTrigger>
            <TabsTrigger value="activity">{t("common.activity")}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {t("common.basic")} {t("common.information")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {t("common.user")} ID
                  </span>
                  <span className="font-medium">{user.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {t("common.language")}
                  </span>
                  <span className="font-medium">{user.preferred_language}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {t("common.registered")} {t("common.date")}
                  </span>
                  <span className="font-medium">
                    {formatDate(user.created_at)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {t("common.lastActive")}
                  </span>
                  <span className="font-medium">
                    {user.last_login
                      ? formatDate(user.last_login)
                      : t("common.never")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {t("common.verified")}
                  </span>
                  <Badge
                    className={
                      user.is_verified
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }
                  >
                    {user.is_verified ? t("common.yes") : t("common.no")}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            {renderRoleSpecificData()}
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  {t("common.recent")} {t("common.activity")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {t("common.user")} {t("common.loggedIn")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t("common.twoMinutesAgo")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {t("common.profile")} {t("common.updated")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t("common.oneHourAgo")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {t("common.password")} {t("common.changed")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t("common.oneDayAgo")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" className="flex-1">
            <Settings className="h-4 w-4 mr-2" />
            {t("actions.editUser")}
          </Button>
          <Button variant="outline" className="flex-1">
            <FileText className="h-4 w-4 mr-2" />
            {t("actions.viewReports")}
          </Button>
        </div>
      </div>
    </ModernModel>
  );
}
