import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { BarChart3, Users, Shield, UserCheck, Crown } from "lucide-react";
import { useUsersDistributionChart } from "@/lib/api/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

export function UsersDistributionChart() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // API hook
  const { data: usersData, isLoading, error } = useUsersDistributionChart();

  const onPieEnter = (data: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      if (!data || !data.name) return null;

      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-gray-600">
            Count: <span className="font-medium">{data.value}</span>
          </p>
          <p className="text-gray-600">
            Percentage: <span className="font-medium">{data.percentage}%</span>
          </p>
          <p className="text-gray-600 text-sm">{data.description}</p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    if (!payload || !Array.isArray(payload)) return null;

    return (
      <div className="flex flex-wrap gap-4 justify-center mt-4">
        {payload.map((entry: any, index: number) => {
          if (!entry || !entry.name) return null;

          const data = chartData[index];
          const IconComponent =
            entry.name === "Clients"
              ? Users
              : entry.name === "Drivers"
              ? UserCheck
              : entry.name === "Admins"
              ? Shield
              : Crown;

          return (
            <div key={index} className="flex items-center gap-2">
              <IconComponent
                className="h-4 w-4"
                style={{ color: entry.color }}
              />
              <span className="text-sm text-gray-600">
                {entry.name} ({data?.percentage || 0}%)
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-indigo-200 shadow-lg rounded-2xl overflow-hidden">
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
              Error
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="h-80 flex items-center justify-center">
            <p className="text-red-600 text-sm">
              {error.message || "Failed to load data"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = usersData?.data?.users_by_role
    ? Object.entries(usersData.data.users_by_role).map(([role, count]) => ({
        name: role.charAt(0).toUpperCase() + role.slice(1),
        value: count as number,
        color:
          role === "client"
            ? "#3B82F6"
            : role === "driver"
            ? "#10B981"
            : role === "admin"
            ? "#F59E0B"
            : "#8B5CF6",
        percentage: 0, // Will be calculated below
        description: `${role} users`,
      }))
    : [];

  // Calculate percentages
  const totalUsers = chartData.reduce((sum, user) => sum + user.value, 0);
  chartData.forEach((user) => {
    user.percentage =
      totalUsers > 0 ? Math.round((user.value / totalUsers) * 100) : 0;
  });

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-indigo-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pt-6 px-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Users Distribution
          </CardTitle>
        </div>
        <BarChart3 className="h-5 w-5 text-indigo-500" />
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
                activeIndex={activeIndex}
                activeShape={(props: any) => (
                  <g>
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={110}
                      fill={props.fill}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  </g>
                )}
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
        <div className="mt-4 text-center">
          <div className="text-2xl font-bold text-indigo-600">
            {totalUsers.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Users</div>
        </div>
      </CardContent>
    </Card>
  );
}
