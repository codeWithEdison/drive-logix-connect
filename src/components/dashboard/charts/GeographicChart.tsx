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
import { MapPin, AlertCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";

interface GeographicData {
  top_pickup_locations: Array<{
    location: string;
    count: number;
    revenue: number;
  }>;
  top_delivery_locations: Array<{
    location: string;
    count: number;
    revenue: number;
  }>;
  route_efficiency: Array<{
    route: string;
    average_time: number;
    distance_km: number;
    efficiency_score: number;
  }>;
}

interface GeographicChartProps {
  data?: GeographicData;
  isLoading?: boolean;
  error?: any;
  className?: string;
}

export function GeographicChart({
  data,
  isLoading = false,
  error = null,
  className,
}: GeographicChartProps) {
  const { t } = useLanguage();

  // Data comes from props now

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-green-600 font-medium">
            {t("common.revenue")}: RWF {data.revenue?.toLocaleString()}
          </p>
          <p className="text-blue-600 text-sm">
            {t("dashboard.deliveries")}: {data.deliveries}
          </p>
          <p className="text-gray-600 text-sm">
            {t("dashboard.distance")}: {data.distance} km
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
        className={`bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg rounded-2xl overflow-hidden ${className}`}
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
    data?.top_pickup_locations?.map((location: any) => ({
      route: location.location,
      revenue: location.revenue,
      deliveries: location.count,
      distance: 0, // Not available in pickup data
    })) || [];

  return (
    <Card
      className={`bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden ${className}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pt-6 px-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          <CardTitle className="text-lg font-semibold text-gray-900">
            {t("dashboard.topRoutes")}
          </CardTitle>
        </div>
        <MapPin className="h-5 w-5 text-purple-500" />
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="route"
                stroke="#6B7280"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `RWF ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="revenue"
                fill="#8B5CF6"
                radius={[4, 4, 0, 0]}
                name={t("common.revenue")}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
