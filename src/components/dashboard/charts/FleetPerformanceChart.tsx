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
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";

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
  const { t } = useLanguage();

  // Data comes from props now

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-blue-600 font-medium">
            {t("dashboard.deliveries")}: {data.deliveries}
          </p>
          <p className="text-green-600 text-sm">
            {t("dashboard.utilization")}: {data.utilization}%
          </p>
          <p className="text-orange-600 text-sm">
            {t("dashboard.fuelLevel")}: {data.fuelLevel}%
          </p>
          <p className="text-purple-600 text-sm">
            {t("dashboard.rating")}: {data.rating}/5
          </p>
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
    data?.vehicle_utilization?.map((vehicle: any) => ({
      truck: vehicle.plate_number,
      deliveries: Math.floor(Math.random() * 50) + 20, // Mock deliveries count
      utilization: vehicle.utilization_percentage,
      fuelLevel: Math.floor(Math.random() * 40) + 60, // Mock fuel level
      rating: (Math.random() * 1.5 + 3.5).toFixed(1), // Mock rating
    })) || [];

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
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <p className="text-orange-600 font-semibold">
              {chartData.reduce((sum, vehicle) => sum + vehicle.deliveries, 0)}
            </p>
            <p className="text-orange-600">{t("dashboard.totalDeliveries")}</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-green-600 font-semibold">
              {chartData.length > 0
                ? Math.round(
                    chartData.reduce(
                      (sum, vehicle) => sum + vehicle.utilization,
                      0
                    ) / chartData.length
                  )
                : 0}
              %
            </p>
            <p className="text-green-600">{t("dashboard.avgUtilization")}</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-blue-600 font-semibold">
              {chartData.length > 0
                ? (
                    chartData.reduce(
                      (sum, vehicle) => sum + parseFloat(vehicle.rating),
                      0
                    ) / chartData.length
                  ).toFixed(1)
                : 0}
            </p>
            <p className="text-blue-600">{t("dashboard.avgRating")}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
