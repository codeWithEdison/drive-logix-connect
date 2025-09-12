import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LiveTrackingMap } from "@/components/dashboard/LiveTrackingMap";
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
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCargoTracking, useCargoById } from "@/lib/api/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

// Mock tracking data for multiple cargos
const mockTrackingData = [
  {
    id: "#3565432",
    status: "in_transit",
    driver: {
      name: "Albert Flores",
      phone: "+1 (555) 123-4567",
      rating: 4.8,
      truck: "TRK-001",
    },
    route: {
      from: "4140 Parker Rd, Allentown, NM",
      to: "3517 W. Gray St. Utica, PA",
      currentLocation: "Highway 45, 15 km from destination",
      progress: 68,
    },
    timeline: [
      {
        status: "pickup_completed",
        time: "08:30 AM",
        date: "Jan 15, 2024",
        completed: true,
      },
      {
        status: "in_transit",
        time: "09:15 AM",
        date: "Jan 15, 2024",
        completed: true,
      },
      {
        status: "out_for_delivery",
        time: "Est. 2:00 PM",
        date: "Jan 15, 2024",
        completed: false,
      },
      {
        status: "delivered",
        time: "Est. 2:30 PM",
        date: "Jan 15, 2024",
        completed: false,
      },
    ],
    estimatedDelivery: "2:30 PM today",
  },
];

const TrackingPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { cargoId } = useParams<{ cargoId: string }>();
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState(cargoId || "");

  // API hooks
  const {
    data: trackingData,
    isLoading: trackingLoading,
    error: trackingError,
    refetch,
  } = useCargoTracking(cargoId || "");
  const {
    data: cargoData,
    isLoading: cargoLoading,
    error: cargoError,
  } = useCargoById(cargoId || "");

  const isLoading = trackingLoading || cargoLoading;
  const error = trackingError || cargoError;

  const handleSearch = () => {
    if (searchId.trim()) {
      navigate(`/tracking/${searchId}`);
    } else {
      toast.error(t("tracking.enterCargoId"));
    }
  };

  const handleCallDriver = (phone: string) => {
    if (phone) {
      window.open(`tel:${phone}`, "_self");
    } else {
      toast.error(t("tracking.noDriverPhone"));
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-80" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-heading">
              {t("tracking.title")}
            </h1>
            <p className="text-muted-foreground">{t("tracking.subtitle")}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t("tracking.enterCargoIdPlaceholder")}
                className="pl-10"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
            </div>
            <Button
              className="bg-gradient-primary hover:bg-primary-hover"
              onClick={handleSearch}
            >
              {t("tracking.track")}
            </Button>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <h3 className="font-semibold text-red-800">
                {t("common.error")}
              </h3>
              <p className="text-red-600 text-sm mt-1">
                {error.message || t("tracking.loadError")}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="mt-2"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {t("common.retry")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No cargo ID provided
  if (!cargoId) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-heading">
              {t("tracking.title")}
            </h1>
            <p className="text-muted-foreground">{t("tracking.subtitle")}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t("tracking.enterCargoIdPlaceholder")}
                className="pl-10"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
            </div>
            <Button
              className="bg-gradient-primary hover:bg-primary-hover"
              onClick={handleSearch}
            >
              {t("tracking.track")}
            </Button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 text-blue-500" />
            <div>
              <h3 className="font-semibold text-blue-800">
                {t("tracking.noCargoId")}
              </h3>
              <p className="text-blue-600 text-sm mt-1">
                {t("tracking.noCargoIdDescription")}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Transform API data to tracking format
  const activeTracking = trackingData
    ? {
        id: cargoData?.id || cargoId,
        status: trackingData.current_status.toLowerCase(),
        driver: {
          name:
            trackingData.driver?.full_name || t("tracking.noDriverAssigned"),
          phone: trackingData.driver?.phone || "",
          rating: trackingData.driver?.rating || 0,
          truck:
            trackingData.vehicle?.license_plate || t("tracking.noVehicleInfo"),
        },
        route: {
          from: cargoData?.pickup_address || "",
          to: cargoData?.destination_address || "",
          currentLocation:
            trackingData.current_location || t("tracking.locationUnknown"),
          progress: trackingData.progress_percentage || 0,
        },
        timeline:
          trackingData.status_updates?.map((update: any) => ({
            status: update.status.toLowerCase(),
            time: new Date(update.timestamp).toLocaleTimeString(),
            date: new Date(update.timestamp).toLocaleDateString(),
            completed: update.status === "delivered",
          })) || [],
        estimatedDelivery:
          trackingData.estimated_delivery_time || t("tracking.etaUnknown"),
      }
    : null;

  if (!activeTracking) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-heading">
              {t("tracking.title")}
            </h1>
            <p className="text-muted-foreground">{t("tracking.subtitle")}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t("tracking.enterCargoIdPlaceholder")}
                className="pl-10"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
            </div>
            <Button
              className="bg-gradient-primary hover:bg-primary-hover"
              onClick={handleSearch}
            >
              {t("tracking.track")}
            </Button>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            <div>
              <h3 className="font-semibold text-yellow-800">
                {t("tracking.noTrackingData")}
              </h3>
              <p className="text-yellow-600 text-sm mt-1">
                {t("tracking.noTrackingDataDescription")}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusIcons = {
    pickup_completed: CheckCircle,
    in_transit: Truck,
    out_for_delivery: MapPin,
    delivered: CheckCircle,
    pending: Clock,
    assigned: Truck,
    active: Truck,
  };

  const statusColors = {
    pickup_completed: "text-success",
    in_transit: "text-logistics-blue",
    out_for_delivery: "text-logistics-orange",
    delivered: "text-success",
    pending: "text-muted-foreground",
    assigned: "text-logistics-blue",
    active: "text-logistics-blue",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-heading">
            {t("tracking.title")}
          </h1>
          <p className="text-muted-foreground">{t("tracking.subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 lg:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={t("tracking.enterCargoIdPlaceholder")}
              className="pl-10"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />
          </div>
          <Button
            className="bg-gradient-primary hover:bg-primary-hover"
            onClick={handleSearch}
          >
            {t("tracking.track")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            {t("common.refresh")}
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
                  {t("tracking.liveGpsTracking")}
                </CardTitle>
                <Badge className="bg-logistics-blue text-logistics-blue-foreground">
                  {t(`tracking.status.${activeTracking.status}`)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[600px]">
                <LiveTrackingMap />
              </div>
            </CardContent>
          </Card>

          {/* Route Progress */}
          <Card className="card-elevated mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-accent" />
                {t("tracking.routeProgress")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">
                  {t("tracking.progress")}
                </span>
                <span className="font-semibold">
                  {activeTracking.route.progress}%
                </span>
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
                    <span className="text-xs text-muted-foreground font-medium">
                      {t("tracking.from")}
                    </span>
                  </div>
                  <p className="text-sm font-medium pl-5">
                    {activeTracking.route.from}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-accent rounded-full"></div>
                    <span className="text-xs text-muted-foreground font-medium">
                      {t("tracking.to")}
                    </span>
                  </div>
                  <p className="text-sm font-medium pl-5">
                    {activeTracking.route.to}
                  </p>
                </div>
              </div>

              <div className="bg-muted rounded-lg p-4 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-logistics-blue" />
                  <span className="text-sm font-medium">
                    {t("tracking.currentLocation")}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {activeTracking.route.currentLocation}
                </p>
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
                {t("tracking.cargoDetails")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-bold text-foreground">
                  {activeTracking.id}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("tracking.cargoId")}
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-logistics-orange" />
                  <span className="text-sm font-medium">
                    {t("tracking.eta")}
                  </span>
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
                {t("tracking.driverInformation")}
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
                    <span className="text-xs text-muted-foreground">
                      {t("tracking.rating")}:
                    </span>
                    <span className="text-xs font-semibold text-logistics-orange">
                      ★ {activeTracking.driver.rating}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("tracking.truckId")}:
                  </span>
                  <span className="font-medium">
                    {activeTracking.driver.truck}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("tracking.phone")}:
                  </span>
                  <span className="font-medium">
                    {activeTracking.driver.phone || t("tracking.noPhone")}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleCallDriver(activeTracking.driver.phone)}
                  disabled={!activeTracking.driver.phone}
                >
                  <Phone className="h-3 w-3 mr-1" />
                  {t("tracking.call")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Timeline */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-logistics-blue" />
                {t("tracking.deliveryTimeline")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeTracking.timeline.map((item, index) => {
                const Icon =
                  statusIcons[item.status as keyof typeof statusIcons] || Clock;
                const iconColor =
                  statusColors[item.status as keyof typeof statusColors] ||
                  "text-muted-foreground";

                return (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        item.completed ? "bg-success/10" : "bg-muted"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 ${
                          item.completed ? "text-success" : iconColor
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
                          item.completed
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {t(`tracking.status.${item.status}`)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.time} • {item.date}
                      </p>
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
