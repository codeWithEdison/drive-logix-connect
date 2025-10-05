import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Truck, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { t } from "i18next";

interface FleetPerformanceData {
  vehicle_utilization: Array<{
    vehicle_id: string;
    plate_number: string;
    utilization_percentage: number;
    total_distance_km: number;
  }>;
  fuel_efficiency: Array<{
    vehicle_id: string;
    plate_number: string;
    fuel_efficiency_km_per_liter: number;
  }>;
  maintenance_schedule: Array<{
    vehicle_id: string;
    plate_number: string;
    next_maintenance_date: string;
    maintenance_type: string;
  }>;
  vehicle_deliveries?: Array<{
    vehicle_id: string;
    plate_number: string;
    total_deliveries: number;
    completed_deliveries: number;
    success_rate: number;
    total_revenue: number;
  }>;
}

interface FleetPerformanceChartProps {
  data?: FleetPerformanceData;
  isLoading?: boolean;
  error?: any;
  className?: string;
}

export function FleetPerformanceChart({
  data,
  isLoading = false,
  error = null,
  className,
}: FleetPerformanceChartProps) {
  // Data comes from props now

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const chartData = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-blue-600 font-medium">
            Total Deliveries: {chartData.deliveries}
          </p>
          <p className="text-green-600 text-sm">
            Completed Deliveries: {chartData.completedDeliveries}
          </p>
          <p className="text-purple-600 text-sm">
            Success Rate: {chartData.successRate}%
          </p>
          <p className="text-orange-600 text-sm">
            Utilization: {chartData.utilization}%
          </p>
          <p className="text-cyan-600 text-sm">
            Fuel Efficiency: {chartData.fuelLevel} km/L
          </p>
          <p className="text-gray-600 text-sm">
            Total Revenue: RWF {chartData.totalRevenue?.toLocaleString()}
          </p>
          {chartData.totalDistance > 0 && (
            <p className="text-gray-600 text-sm">
              Total Distance: {chartData.totalDistance} km
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Loading state
  if (isLoading) {
    return (
      <Card
        className={`bg-white/80 backdrop-blur-sm border-orange-200 shadow-lg rounded-2xl overflow-hidden ${className}`}
      >
        <CardHeader className="pb-4 pt-6 px-6">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card
        className={`bg-white/80 backdrop-blur-sm border-red-200 shadow-lg rounded-2xl overflow-hidden ${className}`}
      >
        <CardHeader className="pb-4 pt-6 px-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <CardTitle className="text-lg font-semibold text-red-800">
              {t("common.error")}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="h-80 flex items-center justify-center">
            <p className="text-red-600 text-sm">
              {error.message || t("common.loadError")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData =
    data?.vehicle_deliveries?.map((vehicle: any) => {
      const utilizationData = data?.vehicle_utilization?.find(
        (v: any) => v.vehicle_id === vehicle.vehicle_id
      );
      const fuelData = data?.fuel_efficiency?.find(
        (f: any) => f.vehicle_id === vehicle.vehicle_id
      );

      return {
        truck: vehicle.plate_number,
        deliveries: vehicle.total_deliveries,
        utilization: utilizationData?.utilization_percentage || 0,
        fuelLevel: fuelData?.fuel_efficiency_km_per_liter || 0,
        rating: (vehicle.success_rate / 20).toFixed(1), // Convert success rate to 5-star rating
        completedDeliveries: vehicle.completed_deliveries,
        successRate: vehicle.success_rate,
        totalRevenue: vehicle.total_revenue,
        totalDistance: utilizationData?.total_distance_km || 0,
      };
    }) || [];

  return (
    <Card
      className={`bg-white/80 backdrop-blur-sm border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden ${className}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pt-6 px-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <CardTitle className="text-lg font-semibold text-gray-900">
            {t("dashboard.fleetPerformance")}
          </CardTitle>
        </div>
        <Truck className="h-5 w-5 text-orange-500" />
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="truck"
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="deliveries"
                fill="#F59E0B"
                radius={[4, 4, 0, 0]}
                name={t("dashboard.deliveries")}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <p className="text-orange-600 font-semibold">
              {data?.vehicle_deliveries?.reduce(
                (sum, vehicle) => sum + vehicle.total_deliveries,
                0
              ) || 0}
            </p>
            <p className="text-orange-600">{t("dashboard.totalDeliveries")}</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-green-600 font-semibold">
              {data?.vehicle_deliveries?.length > 0
                ? Math.round(
                    data.vehicle_deliveries.reduce(
                      (sum: number, vehicle: any) => sum + vehicle.success_rate,
                      0
                    ) / data.vehicle_deliveries.length
                  )
                : 0}
              %
            </p>
            <p className="text-green-600">{t("dashboard.avgSuccessRate")}</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-blue-600 font-semibold">
              RWF{" "}
              {data?.vehicle_deliveries
                ?.reduce((sum, vehicle) => sum + vehicle.total_revenue, 0)
                ?.toLocaleString() || 0}
            </p>
            <p className="text-blue-600">{t("dashboard.totalRevenue")}</p>
          </div>
        </div> */}
      </CardContent>
    </Card>
  );
}
