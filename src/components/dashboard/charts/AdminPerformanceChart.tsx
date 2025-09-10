import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";
import { Users, Star, TrendingUp, MapPin } from "lucide-react";
import { useAdminPerformanceChart } from "@/lib/api/hooks";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

const metrics = [
  { label: "Tasks", value: "tasks", icon: Users },
  { label: "Efficiency", value: "efficiency", icon: TrendingUp },
  { label: "Rating", value: "rating", icon: Star },
  { label: "Deliveries", value: "deliveries", icon: MapPin },
];

export function AdminPerformanceChart() {
  const { t } = useLanguage();
  const [selectedMetric, setSelectedMetric] = useState("tasks");

  // API hook
  const { data: adminData, isLoading, error } = useAdminPerformanceChart();

  const getTooltipFormatter = (value: number, name: string) => {
    const metric = metrics.find((m) => m.value === selectedMetric);
    const label = metric ? t(`dashboard.${metric.value}`) : name;

    if (selectedMetric === "efficiency") {
      return [`${value}%`, label];
    } else if (selectedMetric === "rating") {
      return [`${value}/5`, label];
    } else if (selectedMetric === "revenue") {
      return [`RWF ${value.toLocaleString()}`, label];
    }
    return [value.toString(), label];
  };

  const getYAxisFormatter = (value: number) => {
    if (selectedMetric === "efficiency") {
      return `${value}%`;
    } else if (selectedMetric === "rating") {
      return `${value}/5`;
    } else if (selectedMetric === "revenue") {
      return `RWF ${(value / 1000000).toFixed(0)}M`;
    }
    return value.toString();
  };

  const getBarColor = (value: number) => {
    switch (selectedMetric) {
      case "tasks":
        return value >= 40 ? "#10B981" : value >= 30 ? "#F59E0B" : "#EF4444";
      case "efficiency":
        return value >= 90 ? "#10B981" : value >= 80 ? "#F59E0B" : "#EF4444";
      case "rating":
        return value >= 4.5 ? "#10B981" : value >= 4.0 ? "#F59E0B" : "#EF4444";
      case "deliveries":
        return value >= 150 ? "#10B981" : value >= 100 ? "#F59E0B" : "#EF4444";
      default:
        return "#3B82F6";
    }
  };

  const sortedData = [...(adminData?.data?.admin_activities || [])].sort(
    (a, b) => {
      const aValue = a.activities_count;
      const bValue = b.activities_count;
      return bValue - aValue;
    }
  );

  // Loading state
  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-teal-200 shadow-lg rounded-2xl overflow-hidden">
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
      <Card className="bg-white/80 backdrop-blur-sm border-red-200 shadow-lg rounded-2xl overflow-hidden">
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

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-teal-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pt-6 px-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
          <CardTitle className="text-lg font-semibold text-gray-900">
            {t("dashboard.adminPerformance")}
          </CardTitle>
        </div>
        <div className="flex items-center gap-2">
          {metrics.map((metric) => {
            const IconComponent = metric.icon;
            return (
              <Button
                key={metric.value}
                variant={
                  selectedMetric === metric.value ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSelectedMetric(metric.value)}
                className="text-xs flex items-center gap-1"
              >
                <IconComponent className="h-3 w-3" />
                {t(`dashboard.${metric.value}`)}
              </Button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="admin_name"
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
                tickFormatter={getYAxisFormatter}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                formatter={getTooltipFormatter}
                labelStyle={{ color: "#374151", fontWeight: "600" }}
              />
              <Bar
                dataKey="activities_count"
                radius={[4, 4, 0, 0]}
                name={t("dashboard.activities")}
              >
                {sortedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getBarColor(entry.activities_count)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="text-center p-3 bg-teal-50 rounded-lg">
            <p className="text-teal-600 font-semibold">
              {adminData?.data?.admin_activities?.length || 0}
            </p>
            <p className="text-teal-600">{t("dashboard.totalAdmins")}</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-blue-600 font-semibold">
              {adminData?.data?.admin_activities?.reduce(
                (sum, admin) => sum + admin.activities_count,
                0
              ) || 0}
            </p>
            <p className="text-blue-600">{t("dashboard.totalActivities")}</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-green-600 font-semibold">
              {adminData?.data?.performance_metrics?.length || 0}
            </p>
            <p className="text-green-600">
              {t("dashboard.performanceMetrics")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
