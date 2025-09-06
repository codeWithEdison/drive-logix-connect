import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
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
  Star,
  Eye,
  ArrowUp,
  ArrowDown,
  ChevronDown
} from "lucide-react";
import { TrackingComponent } from "./TrackingComponent";
import { StatsCard, StatItem } from "@/components/ui/StatsCard";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { 
  useDriverProfile, 
  useDriverAssignments, 
  useDriverPerformance,
  useUpdateDriverStatus 
} from "@/lib/api/hooks";
import { DriverStatus } from "@/types/shared";
import { customToast } from "@/lib/utils/toast";

export function DriverDashboard() {
  const [showLiveTracking, setShowLiveTracking] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Backend API calls
  const { data: driverProfile, isLoading: profileLoading } = useDriverProfile();
  const { data: assignments, isLoading: assignmentsLoading } = useDriverAssignments({ 
    status: 'assigned',
    limit: 10 
  });
  const { data: performance } = useDriverPerformance();
  const updateStatusMutation = useUpdateDriverStatus();

  const activeDelivery = assignments?.data?.[0];

  const statusConfig = {
    [DriverStatus.AVAILABLE]: { label: t("status.available"), color: "bg-green-100 text-green-600" },
    [DriverStatus.ON_DUTY]: { label: t("status.onDuty"), color: "bg-blue-100 text-blue-600" },
    [DriverStatus.UNAVAILABLE]: { label: t("status.unavailable"), color: "bg-gray-100 text-gray-600" }
  };

  // Stats data from backend
  const driverStatsData: StatItem[] = [
    {
      title: t("navigation.assignedCargos"),
      value: assignments?.pagination?.total?.toString() || "0",
      change: `+${assignments?.data?.length || 0}`,
      changeType: "increase",
      icon: Package,
      color: "orange"
    },
    {
      title: t("navigation.activeDeliveries"), 
      value: assignments?.data?.filter(a => a.cargo?.status === 'in_transit')?.length?.toString() || "0",
      change: t("status.inTransit"),
      changeType: "active",
      icon: Clock,
      color: "green"
    },
    {
      title: t("status.completed"),
      value: performance?.total_deliveries?.toString() || "0",
      change: t("driver.totalDeliveries"),
      changeType: "success",
      icon: CheckCircle,
      color: "blue"
    },
    {
      title: t("delivery.rating"),
      value: performance?.average_rating?.toFixed(1) || "0.0",
      change: "★★★★☆",
      changeType: "rating",
      icon: Star,
      color: "pink"
    }
  ];

  const handleViewAllCargos = () => {
    navigate('/driver/cargos');
  };

  const handleViewAllDeliveries = () => {
    navigate('/driver/deliveries');
  };

  const handleViewAllCompleted = () => {
    navigate('/driver/history');
  };

  const handleStartDelivery = () => {
    setShowLiveTracking(true);
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync(newStatus as DriverStatus);
      customToast.success(t("driver.statusUpdated"));
    } catch (error) {
      customToast.error(t("errors.unknownError"));
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("navigation.dashboard")}</h1>
          <p className="text-muted-foreground">{t("dashboard.welcome")}, {driverProfile?.full_name}</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className={statusConfig[driverProfile?.status || DriverStatus.UNAVAILABLE].color}>
            {statusConfig[driverProfile?.status || DriverStatus.UNAVAILABLE].label}
          </Badge>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{t("cargo.status")}:</span>
            <Select 
              onValueChange={handleStatusChange} 
              defaultValue={driverProfile?.status}
              disabled={updateStatusMutation.isPending}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("driver.driverStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DriverStatus.AVAILABLE}>{t("status.available")}</SelectItem>
                <SelectItem value={DriverStatus.ON_DUTY}>{t("status.onDuty")}</SelectItem>
                <SelectItem value={DriverStatus.UNAVAILABLE}>{t("status.unavailable")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCard stats={driverStatsData} />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Delivery */}
        <div className="lg:col-span-2">
          <Card className="bg-card shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Navigation className="h-5 w-5 text-primary" />
                {t("navigation.activeDeliveries")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {activeDelivery ? (
                <>
                  {showLiveTracking ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{activeDelivery.cargo?.id}</h3>
                          <p className="text-sm text-muted-foreground">
                            {t("client.clientDetails")}: {activeDelivery.cargo?.client?.full_name}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowLiveTracking(false)}
                        >
                          {t("tracking.tracking")}
                        </Button>
                      </div>
                      <TrackingComponent height="h-80" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{activeDelivery.cargo?.id}</h3>
                          <p className="text-sm text-muted-foreground">
                            {t("client.clientDetails")}: {activeDelivery.cargo?.client?.full_name}
                          </p>
                        </div>
                        <Badge className={activeDelivery.cargo?.priority === 'urgent' ?
                          "bg-orange-100 text-orange-600" :
                          "bg-blue-100 text-blue-600"
                        }>
                          {t(`priority.${activeDelivery.cargo?.priority || 'normal'}`)}
                        </Badge>
                      </div>

                      {/* Route */}
                      <div className="space-y-4 p-4 bg-muted rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full mt-1"></div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium">{t("cargo.pickupAddress").toUpperCase()}</p>
                            <p className="text-sm font-semibold">{activeDelivery.cargo?.pickup_address}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pl-6">
                          <div className="w-px h-8 bg-border"></div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full mt-1"></div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium">{t("cargo.destinationAddress").toUpperCase()}</p>
                            <p className="text-sm font-semibold">{activeDelivery.cargo?.destination_address}</p>
                          </div>
                        </div>
                      </div>

                      {/* Cargo Details */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">{t("cargo.cargoType")}</p>
                          <p className="font-semibold">{activeDelivery.cargo?.type || t("common.loading")}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{t("cargo.weight")}</p>
                          <p className="font-semibold">{activeDelivery.cargo?.weight_kg} kg</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          className="bg-gradient-primary hover:bg-primary/90"
                          onClick={handleStartDelivery}
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          {t("delivery.startDelivery")}
                        </Button>
                        <Button variant="outline">
                          <Phone className="h-4 w-4 mr-2" />
                          {t("client.clientDetails")}
                        </Button>
                        <Button variant="outline">
                          <Camera className="h-4 w-4 mr-2" />
                          {t("delivery.uploadProof")}
                        </Button>
                        <Button variant="outline" className="text-orange-600 border-orange-600 hover:bg-orange-600 hover:text-white">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          {t("common.loading")}
                        </Button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-semibold text-muted-foreground">{t("common.loading")}</p>
                  <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Assigned Cargos */}
        <div>
          <Card className="bg-card shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Route className="h-5 w-5 text-primary" />
                  {t("navigation.assignedCargos")}
                </CardTitle>
                <Button variant="outline" size="sm" onClick={handleViewAllCargos}>
                  {t("common.loading")}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="h-96 overflow-y-auto">
              {assignmentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4 pr-2">
                  {assignments?.data?.map((assignment) => (
                    <div key={assignment.id} className="p-4 bg-muted rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">{assignment.cargo?.id}</span>
                        <Badge className={assignment.cargo?.status === 'in_transit' ?
                          "bg-green-100 text-green-600" :
                          "bg-yellow-100 text-yellow-600"
                        }>
                          {t(`status.${assignment.cargo?.status || 'pending'}`)}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground">{t("client.clientDetails")}</p>
                          <p className="text-sm font-medium">{assignment.cargo?.client?.full_name}</p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">{t("cargo.destinationAddress")}</p>
                          <p className="text-sm font-medium text-primary">{assignment.cargo?.destination_address}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">{t("cargo.cargoType")}</p>
                          <p className="font-medium">{assignment.cargo?.type || t("common.loading")}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{t("cargo.weight")}</p>
                          <p className="font-medium">{assignment.cargo?.weight_kg} kg</p>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant={assignment.cargo?.status === 'in_transit' ? 'default' : 'outline'}
                        className="w-full"
                      >
                        {assignment.cargo?.status === 'in_transit' ? t("common.loading") : t("common.loading")}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Deliveries */}
        <Card className="bg-card shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground">{t("dashboard.recentActivity")}</CardTitle>
              <Button variant="outline" size="sm" onClick={handleViewAllDeliveries}>
                {t("common.loading")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-medium text-muted-foreground">{t("cargo.cargoDetails")}</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">{t("client.clientDetails")}</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">{t("cargo.status")}</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">{t("common.loading")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments?.data?.slice(0, 3).map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="text-sm font-medium text-foreground">{assignment.cargo?.id}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{assignment.cargo?.client?.full_name}</TableCell>
                    <TableCell>
                      <Badge className={assignment.cargo?.status === 'in_transit' ?
                        "bg-green-100 text-green-600" :
                        "bg-yellow-100 text-yellow-600"
                      }>
                        {t(`status.${assignment.cargo?.status || 'pending'}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(assignment.assigned_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Driver Performance */}
        <Card className="bg-card shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground">{t("common.loading")}</CardTitle>
              <Button variant="outline" size="sm" onClick={handleViewAllCompleted}>
                {t("common.loading")}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("delivery.rating")}</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{performance?.average_rating?.toFixed(1) || "0.0"}</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(performance?.average_rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("driver.totalDeliveries")}</span>
              <span className="font-semibold">{performance?.total_deliveries || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("driver.totalDistance")}</span>
              <span className="font-semibold">{performance?.total_distance_km || 0} km</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("driver.onTimeDeliveries")}</span>
              <span className="font-semibold">{performance?.on_time_deliveries || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("driver.completionRate")}</span>
              <span className="font-semibold">{performance?.completion_rate?.toFixed(1) || "0.0"}%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}