import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useRevenueChart } from "@/lib/api/hooks";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCompactRevenue } from "@/lib/utils/frontend";

interface RevenueTrendsData {
  daily_revenue: Array<{
    date: string;
    revenue: number;
    deliveries: number;
  }>;
  monthly_revenue: Array<{
    month: string;
    revenue: number;
    growth_percentage: number;
  }>;
  revenue_by_payment_method: Record<string, number>;
}

interface RevenueChartProps {
  data?: RevenueTrendsData;
  isLoading?: boolean;
  error?: any;
}
import { AlertCircle } from "lucide-react";

export function RevenueChart({
  data,
  isLoading = false,
  error = null,
}: RevenueChartProps) {
  const { t } = useLanguage();

  const periods = [
    { label: t("dashboard.day"), value: "day" },
    { label: t("dashboard.month"), value: "month" },
  ];
  const [selectedPeriod, setSelectedPeriod] = useState("day");

  // Data comes from props now

  const getData = () => {
    if (!data) return [];

    switch (selectedPeriod) {
      case "day":
        return data.daily_revenue || [];
      case "month":
        return data.monthly_revenue || [];
      default:
        return data.daily_revenue || [];
    }
  };

  const getXAxisKey = () => {
    switch (selectedPeriod) {
      case "month":
        return "month";
      default:
        return "date";
    }
  };

  const getYAxisFormatter = (value: number) => formatCompactRevenue(value);

  const getTooltipFormatter = (value: number) => [
    `RWF ${formatCompactRevenue(value)}`,
    t("common.revenue"),
  ];

  const currentData = getData();
  const currentRevenue = currentData[currentData.length - 1]?.revenue || 0;
  const previousRevenue = currentData[currentData.length - 2]?.revenue || 0;
  const revenueChange =
    previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : 0;
  const isPositive = revenueChange >= 0;

  // Loading state
  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg rounded-2xl overflow-hidden">
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
    <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pt-6 px-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <CardTitle className="text-lg font-semibold text-gray-900">
            {t("dashboard.revenueTrends")}
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
            <AreaChart
              data={currentData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
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
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
