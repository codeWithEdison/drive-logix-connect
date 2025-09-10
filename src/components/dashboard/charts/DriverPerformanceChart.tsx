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
import { Users, AlertCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";

interface DriverPerformanceData {
  top_performers: Array<{
    driver_id: string;
    driver_name: string;
    deliveries_completed: number;
    average_rating: number;
    on_time_percentage: number;
  }>;
  performance_trends: Array<{
    date: string;
    average_rating: number;
    deliveries_completed: number;
  }>;
}

interface DriverPerformanceChartProps {
  data?: DriverPerformanceData;
  isLoading?: boolean;
  error?: any;
  className?: string;
}

export function DriverPerformanceChart({
  data,
  isLoading = false,
  error = null,
  className,
}: DriverPerformanceChartProps) {
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
          <p className="text-yellow-600 text-sm">
            {t("dashboard.rating")}: {data.rating}/5
          </p>
          <p className="text-green-600 text-sm">
            {t("dashboard.earnings")}: RWF {data.earnings?.toLocaleString()}
          </p>
          <p className="text-gray-600 text-sm">
            {t("common.status")}: {t(`status.${data.status}`)}
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
        className={`bg-white/80 backdrop-blur-sm border-pink-200 shadow-lg rounded-2xl overflow-hidden ${className}`}
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
    data?.top_performers?.map((driver: any) => ({
      driver: driver.driver_name,
      deliveries: driver.deliveries_completed,
      rating: driver.average_rating,
      earnings: Math.floor(Math.random() * 50000) + 20000, // Mock earnings
      status: "active",
    })) || [];

  return (
    <Card
      className={`bg-white/80 backdrop-blur-sm border-pink-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden ${className}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pt-6 px-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
          <CardTitle className="text-lg font-semibold text-gray-900">
            {t("dashboard.driverPerformance")}
          </CardTitle>
        </div>
        <Users className="h-5 w-5 text-pink-500" />
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
                dataKey="driver"
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
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="deliveries"
                fill="#EC4899"
                radius={[4, 4, 0, 0]}
                name={t("dashboard.deliveries")}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="text-center p-3 bg-pink-50 rounded-lg">
            <p className="text-pink-600 font-semibold">
              {chartData.reduce((sum, driver) => sum + driver.deliveries, 0)}
            </p>
            <p className="text-pink-600">{t("dashboard.totalDeliveries")}</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <p className="text-yellow-600 font-semibold">
              {chartData.length > 0
                ? (
                    chartData.reduce((sum, driver) => sum + driver.rating, 0) /
                    chartData.length
                  ).toFixed(1)
                : 0}
            </p>
            <p className="text-yellow-600">{t("dashboard.avgRating")}</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-green-600 font-semibold">
              RWF{" "}
              {chartData
                .reduce((sum, driver) => sum + driver.earnings, 0)
                .toLocaleString()}
            </p>
            <p className="text-green-600">{t("dashboard.totalEarnings")}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
