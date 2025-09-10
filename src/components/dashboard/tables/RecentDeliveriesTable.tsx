import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Phone, Truck, AlertCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { customToast } from "@/lib/utils/toast";

interface RecentDelivery {
  cargo_id: string;
  client_name: string;
  client_email?: string;
  pickup_location: string;
  delivery_location: string;
  status: string;
  priority?: string;
  estimated_cost?: number;
  final_cost?: number;
  driver_name: string;
  vehicle_plate?: string;
  created_at: string;
  pickup_date?: string;
  estimated_delivery: string;
}

interface RecentDeliveriesTableProps {
  className?: string;
  onViewAll?: () => void;
  data?: RecentDelivery[];
  isLoading?: boolean;
  error?: any;
  limit?: number;
}

export function RecentDeliveriesTable({
  className,
  onViewAll,
  data = [],
  isLoading = false,
  error = null,
  limit,
}: RecentDeliveriesTableProps) {
  const { t } = useLanguage();

  const deliveries = limit ? (data || []).slice(0, limit) : data || [];
  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "in_transit":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "express":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleTrack = (id: string) => {
    console.log(`Tracking delivery: ${id}`);
    // Navigate to tracking page
    window.location.href = `/admin/tracking/${id}`;
  };

  const handleViewDetails = (id: string) => {
    console.log(`Viewing details for: ${id}`);
    // Navigate to details page
    window.location.href = `/admin/cargos/${id}`;
  };

  const handleContactDriver = (driver: string) => {
    console.log(`Contacting driver: ${driver}`);
    // Open contact modal or navigate to driver page
    window.location.href = `/admin/drivers/${driver}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <Card
        className={`bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden ${className}`}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pt-6 px-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              {t("tables.recentDeliveries")}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card
        className={`bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden ${className}`}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pt-6 px-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              {t("tables.recentDeliveries")}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-600">{t("tables.loadError")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden ${className}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pt-6 px-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
          <CardTitle className="text-lg font-semibold text-gray-900">
            {t("tables.recentDeliveries")}
          </CardTitle>
        </div>
        <Button variant="outline" size="sm" onClick={onViewAll}>
          {t("common.viewAll")}
        </Button>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-900 text-xs whitespace-nowrap">
                  #
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs whitespace-nowrap">
                  {t("tables.client")}
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs whitespace-nowrap">
                  {t("tables.route")}
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs whitespace-nowrap">
                  {t("tables.driver")}
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs whitespace-nowrap">
                  {t("tables.vehicle")}
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs whitespace-nowrap">
                  {t("tables.status")}
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs whitespace-nowrap">
                  {t("tables.estimatedCost")}
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs whitespace-nowrap">
                  {t("tables.pickupDate")}
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs whitespace-nowrap">
                  {t("tables.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center py-8 text-gray-500"
                  >
                    {t("tables.noDeliveries")}
                  </TableCell>
                </TableRow>
              ) : (
                deliveries.map((delivery: any, index: number) => (
                  <TableRow
                    key={delivery.cargo_id || delivery.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="font-medium text-gray-900 text-xs whitespace-nowrap">
                      {index + 1}
                    </TableCell>
                    <TableCell className="text-gray-700 text-xs whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {delivery.client_name}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {delivery.client_email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700 text-xs whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-xs">
                          {delivery.pickup_location}
                        </span>
                        <span className="text-xs text-gray-500">→</span>
                        <span className="text-xs">
                          {delivery.delivery_location}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700 text-xs whitespace-nowrap">
                      {delivery.driver_name}
                    </TableCell>
                    <TableCell className="text-gray-700 text-xs whitespace-nowrap">
                      <Badge variant="outline" className="text-xs">
                        {delivery.vehicle_plate}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge
                          className={`${getStatusColor(
                            delivery.status || delivery.delivery_status
                          )} text-xs px-2 py-1`}
                        >
                          {(
                            delivery.status || delivery.delivery_status
                          )?.replace("_", " ") || "Unknown"}
                        </Badge>
                        {delivery.priority &&
                          delivery.priority !== "standard" && (
                            <Badge
                              className={`${getPriorityColor(
                                delivery.priority
                              )} text-xs px-2 py-1`}
                            >
                              {delivery.priority}
                            </Badge>
                          )}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-green-600 text-xs whitespace-nowrap">
                      RWF {delivery.estimated_cost?.toLocaleString() || "0"}
                    </TableCell>
                    <TableCell className="text-gray-700 text-xs whitespace-nowrap">
                      {delivery.pickup_date
                        ? new Date(delivery.pickup_date).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleTrack(delivery.cargo_id || delivery.id)
                          }
                          className="h-6 w-6 p-0"
                        >
                          <Truck className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleViewDetails(delivery.cargo_id || delivery.id)
                          }
                          className="h-6 w-6 p-0"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleContactDriver(
                              delivery.driver_name || delivery.driver
                            )
                          }
                          className="h-6 w-6 p-0"
                        >
                          <Phone className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
