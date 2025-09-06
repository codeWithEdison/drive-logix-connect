import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Navigation,
  MapPin,
  Phone,
  Camera,
  CheckCircle,
  Clock,
  Package,
  AlertCircle,
  Route,
  PlayCircle,
  PauseCircle,
  Users,
  Calendar
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useDriverAssignments } from "@/lib/api/hooks";
import { CargoStatus } from "@/types/shared";
import { TrackingComponent } from "@/components/dashboard/TrackingComponent";

export default function DriverActiveDeliveries() {
  const [activeTracking, setActiveTracking] = useState<string | null>(null);
  const { t } = useLanguage();

  const { data: assignments, isLoading, error } = useDriverAssignments({
    status: 'in_transit'
  });

  const activeDeliveries = assignments?.data?.filter(
    assignment => assignment.cargo?.status === CargoStatus.IN_TRANSIT || 
                 assignment.cargo?.status === CargoStatus.PICKED_UP
  ) || [];

  const getDeliveryProgress = (status: CargoStatus | undefined) => {
    switch (status) {
      case CargoStatus.ASSIGNED:
        return { progress: 25, stage: t("status.assigned") };
      case CargoStatus.PICKED_UP:
        return { progress: 50, stage: t("status.pickedUp") };
      case CargoStatus.IN_TRANSIT:
        return { progress: 75, stage: t("status.inTransit") };
      case CargoStatus.DELIVERED:
        return { progress: 100, stage: t("status.delivered") };
      default:
        return { progress: 0, stage: t("status.pending") };
    }
  };

  const getStatusColor = (status: CargoStatus | undefined) => {
    switch (status) {
      case CargoStatus.PICKED_UP:
        return "bg-orange-100 text-orange-600";
      case CargoStatus.IN_TRANSIT:
        return "bg-green-100 text-green-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-semibold text-red-600">{t("common.error")}</p>
          <p className="text-sm text-muted-foreground">{t("errors.networkError")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("navigation.activeDeliveries")}</h1>
          <p className="text-muted-foreground">
            {activeDeliveries.length} {t("navigation.activeDeliveries").toLowerCase()}
          </p>
        </div>
      </div>

      {/* Active Deliveries */}
      <div className="grid gap-6">
        {activeDeliveries.length > 0 ? (
          activeDeliveries.map((assignment) => {
            const { progress, stage } = getDeliveryProgress(assignment.cargo?.status);
            const isTracking = activeTracking === assignment.id;
            
            return (
              <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Navigation className="h-5 w-5 text-primary" />
                      {assignment.cargo?.id}
                    </CardTitle>
                    <Badge className={getStatusColor(assignment.cargo?.status)}>
                      {t(`status.${assignment.cargo?.status || 'pending'}`)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("delivery.deliveryProgress")}</span>
                      <span className="font-medium">{stage}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {/* Client Info */}
                  <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{assignment.cargo?.client?.full_name}</p>
                      <p className="text-sm text-muted-foreground">{assignment.cargo?.client?.phone}</p>
                    </div>
                  </div>

                  {/* Route and Tracking */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Route Information */}
                    <div className="space-y-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Route className="h-4 w-4" />
                        {t("delivery.route")}
                      </h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium">
                              {t("cargo.pickupAddress").toUpperCase()}
                            </p>
                            <p className="text-sm font-medium">{assignment.cargo?.pickup_address}</p>
                            <p className="text-xs text-muted-foreground">{assignment.cargo?.pickup_contact}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 pl-6">
                          <div className="w-px h-6 bg-border"></div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full mt-1.5"></div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium">
                              {t("cargo.destinationAddress").toUpperCase()}
                            </p>
                            <p className="text-sm font-medium">{assignment.cargo?.destination_address}</p>
                            <p className="text-xs text-muted-foreground">{assignment.cargo?.destination_contact}</p>
                          </div>
                        </div>
                      </div>

                      {/* Cargo Details */}
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                          <p className="text-xs text-muted-foreground">{t("cargo.weight")}</p>
                          <p className="font-medium">{assignment.cargo?.weight_kg} kg</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{t("cargo.cargoType")}</p>
                          <p className="font-medium">{assignment.cargo?.type || t("common.notSpecified")}</p>
                        </div>
                      </div>
                    </div>

                    {/* Live Tracking */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {t("tracking.liveTracking")}
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTracking(isTracking ? null : assignment.id)}
                        >
                          {isTracking ? (
                            <>
                              <PauseCircle className="h-4 w-4 mr-2" />
                              {t("common.hide")}
                            </>
                          ) : (
                            <>
                              <PlayCircle className="h-4 w-4 mr-2" />
                              {t("common.show")}
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {isTracking && (
                        <div className="border rounded-lg overflow-hidden">
                          <TrackingComponent height="h-64" />
                        </div>
                      )}
                      
                      {!isTracking && (
                        <div className="bg-muted rounded-lg p-4 text-center">
                          <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            {t("tracking.clickToShowMap")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t">
                    <Button size="sm" className="w-full">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {assignment.cargo?.status === CargoStatus.PICKED_UP 
                        ? t("delivery.startDelivery")
                        : t("delivery.confirmDelivery")
                      }
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <Phone className="h-4 w-4 mr-2" />
                      {t("client.contactPerson")}
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <Camera className="h-4 w-4 mr-2" />
                      {t("delivery.uploadProof")}
                    </Button>
                    <Button variant="outline" size="sm" className="w-full text-orange-600 border-orange-600 hover:bg-orange-600 hover:text-white">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {t("common.reportIssue")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  {t("delivery.noActiveDeliveries")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("delivery.checkAssignedCargos")}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}