import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { Activity, Users, Package } from "lucide-react";
import { useUsageTrendsChart } from "@/lib/api/hooks";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

const periods = [
  { label: "Daily", value: "day" },
  { label: "Weekly", value: "week" },
  { label: "Monthly", value: "month" },
];

export function UsageTrendsChart() {
  const { t } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = useState("day");

  // API hook
  const {
    data: usageData,
    isLoading,
    error,
  } = useUsageTrendsChart({
    period: selectedPeriod,
  });

  const getData = () => {
    if (!usageData?.data) return [];

    // Map API response to chart format
    const userRegistrations = usageData.data.user_registrations || [];
    const systemUsage = usageData.data.system_usage || [];

    // Combine data for chart display
    return userRegistrations.map((userData: any, index: number) => ({
      date: userData.date,
      users: userData.new_users || userData.active_users || 0,
      deliveries: systemUsage[index]?.api_calls || 0,
    }));
  };

  const getXAxisKey = () => {
    switch (selectedPeriod) {
      case "week":
        return "week";
      case "month":
        return "month";
      default:
        return "date";
    }
  };

  const getTooltipFormatter = (value: number, name: string) => {
    const label =
      name === "deliveries"
        ? t("dashboard.deliveries")
        : name === "users"
        ? t("common.users")
        : name === "revenue"
        ? t("common.revenue")
        : name;

    if (name === "revenue") {
      return [`RWF ${value.toLocaleString()}`, label];
    }
    return [value.toString(), label];
  };

  const getYAxisFormatter = (value: number) => {
    if (selectedPeriod === "month") {
      return value >= 1000000
        ? `${(value / 1000000).toFixed(0)}M`
        : value.toString();
    }
    return value.toString();
  };

  const currentData = getData();
  const currentDeliveries =
    currentData[currentData.length - 1]?.deliveries || 0;
  const currentUsers = currentData[currentData.length - 1]?.users || 0;
  const previousDeliveries =
    currentData[currentData.length - 2]?.deliveries || 0;
  const previousUsers = currentData[currentData.length - 2]?.users || 0;

  const deliveriesChange =
    previousDeliveries > 0
      ? ((currentDeliveries - previousDeliveries) / previousDeliveries) * 100
      : 0;
  const usersChange =
    previousUsers > 0
      ? ((currentUsers - previousUsers) / previousUsers) * 100
      : 0;

  // Loading state
  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow-lg rounded-2xl overflow-hidden">
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
    <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pt-6 px-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <CardTitle className="text-lg font-semibold text-gray-900">
            {t("dashboard.usageTrends")}
          </CardTitle>
        </div>
        <div className="flex items-center gap-2">
          {periods.map((period) => (
            <Button
              key={period.value}
              variant={selectedPeriod === period.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period.value)}
              className="text-xs"
            >
              {t(`dashboard.${period.value}`)}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={currentData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="colorDeliveries"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey={getXAxisKey()}
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
              <Legend />
              <Line
                type="monotone"
                dataKey="deliveries"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                name={t("dashboard.deliveries")}
              />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                name={t("common.users")}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Package className="h-4 w-4 text-green-600" />
              <span className="text-green-600 font-semibold">
                {currentDeliveries}
              </span>
            </div>
            <p className="text-green-600">{t("dashboard.deliveries")}</p>
            <p
              className={`text-xs ${
                deliveriesChange >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {deliveriesChange >= 0 ? "+" : ""}
              {deliveriesChange.toFixed(1)}%
            </p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-blue-600 font-semibold">
                {currentUsers}
              </span>
            </div>
            <p className="text-blue-600">{t("common.users")}</p>
            <p
              className={`text-xs ${
                usersChange >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {usersChange >= 0 ? "+" : ""}
              {usersChange.toFixed(1)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
