import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Package, AlertCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";

interface DeliveryStatusData {
  status_distribution: Record<string, number>;
  priority_distribution: Record<string, number>;
  delivery_times: Array<{
    date: string;
    average_time_hours: number;
    on_time_percentage: number;
  }>;
}

interface DeliveryStatusChartProps {
  data?: DeliveryStatusData;
  isLoading?: boolean;
  error?: any;
  className?: string;
}

export function DeliveryStatusChart({
  data,
  isLoading = false,
  error = null,
  className,
}: DeliveryStatusChartProps) {
  const { t } = useLanguage();

  // Data comes from props now

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">
            {t(`status.${data.status.toLowerCase()}`)}
          </p>
          <p className="text-gray-600">
            {t("common.percentage")}:{" "}
            <span className="font-medium">{data.percentage}%</span>
          </p>
          <p className="text-gray-600">
            {t("common.count")}:{" "}
            <span className="font-medium">{data.count}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => (
    <div className="mt-6">
      <div className="overflow-x-auto">
        <div className="flex gap-3 pb-2 min-w-max">
          {payload?.map((entry: any, index: number) => {
            const statusData = data?.status_distribution;
            const statusKey = String(
              entry.payload?.status || entry.value || ""
            ).toLowerCase();
            const count = statusData?.[statusKey] || 0;
            const total = Object.values(statusData || {}).reduce(
              (sum: number, val: any) => sum + val,
              0
            );
            const percentage =
              total > 0 ? (((count as number) / total) * 100).toFixed(1) : "0";

            return (
              <div
                key={index}
                className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg whitespace-nowrap min-w-fit flex-shrink-0"
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    {t(`status.${statusKey}`)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {percentage}% ({count})
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <Card
        className={`bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg rounded-2xl overflow-hidden ${className}`}
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

  const chartData = data?.status_distribution
    ? Object.entries(data.status_distribution).map(([status, count]) => {
        const total = Object.values(data.status_distribution).reduce(
          (sum: number, val: any) => sum + val,
          0
        );
        const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : "0";

        return {
          status,
          value: parseFloat(percentage),
          count,
          percentage,
          color:
            status === "delivered"
              ? "#10B981"
              : status === "in_transit"
              ? "#3B82F6"
              : status === "pending"
              ? "#F59E0B"
              : status === "assigned"
              ? "#8B5CF6"
              : status === "picked_up"
              ? "#F97316"
              : status === "accepted"
              ? "#06B6D4"
              : status === "cancelled"
              ? "#EF4444"
              : status === "disputed"
              ? "#DC2626"
              : "#6B7280",
        };
      })
    : [];

  return (
    <Card
      className={`bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden ${className}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pt-6 px-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <CardTitle className="text-lg font-semibold text-gray-900">
            {t("dashboard.deliveryStatus")}
          </CardTitle>
        </div>
        <Package className="h-5 w-5 text-blue-500" />
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
                nameKey="status"
                label={false}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
