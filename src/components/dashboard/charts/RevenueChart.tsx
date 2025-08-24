import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

// Rwanda-based revenue data for different periods
const dailyData = [
  { date: 'Jan 1', revenue: 1250000, deliveries: 45 },
  { date: 'Jan 2', revenue: 1380000, deliveries: 52 },
  { date: 'Jan 3', revenue: 1420000, deliveries: 48 },
  { date: 'Jan 4', revenue: 1560000, deliveries: 61 },
  { date: 'Jan 5', revenue: 1480000, deliveries: 55 },
  { date: 'Jan 6', revenue: 1620000, deliveries: 58 },
  { date: 'Jan 7', revenue: 1750000, deliveries: 67 },
  { date: 'Jan 8', revenue: 1680000, deliveries: 63 },
  { date: 'Jan 9', revenue: 1820000, deliveries: 69 },
  { date: 'Jan 10', revenue: 1950000, deliveries: 72 },
  { date: 'Jan 11', revenue: 1880000, deliveries: 68 },
  { date: 'Jan 12', revenue: 2010000, deliveries: 75 },
  { date: 'Jan 13', revenue: 2150000, deliveries: 78 },
  { date: 'Jan 14', revenue: 2080000, deliveries: 74 },
  { date: 'Jan 15', revenue: 2220000, deliveries: 81 }
];

const weeklyData = [
  { week: 'Week 1', revenue: 8500000, deliveries: 320 },
  { week: 'Week 2', revenue: 9200000, deliveries: 345 },
  { week: 'Week 3', revenue: 8800000, deliveries: 310 },
  { week: 'Week 4', revenue: 9500000, deliveries: 365 }
];

const monthlyData = [
  { month: 'Oct', revenue: 35000000, deliveries: 1200 },
  { month: 'Nov', revenue: 38000000, deliveries: 1350 },
  { month: 'Dec', revenue: 42000000, deliveries: 1450 },
  { month: 'Jan', revenue: 45000000, deliveries: 1550 }
];

const periods = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' }
];

export function RevenueChart() {
  const [selectedPeriod, setSelectedPeriod] = useState('daily');

  const getData = () => {
    switch (selectedPeriod) {
      case 'weekly':
        return weeklyData;
      case 'monthly':
        return monthlyData;
      default:
        return dailyData;
    }
  };

  const getXAxisKey = () => {
    switch (selectedPeriod) {
      case 'weekly':
        return 'week';
      case 'monthly':
        return 'month';
      default:
        return 'date';
    }
  };

  const getYAxisFormatter = (value: number) => {
    switch (selectedPeriod) {
      case 'weekly':
        return `${(value / 1000000).toFixed(1)}M`;
      case 'monthly':
        return `${(value / 1000000).toFixed(0)}M`;
      default:
        return `${(value / 1000000).toFixed(1)}M`;
    }
  };

  const getTooltipFormatter = (value: number) => {
    switch (selectedPeriod) {
      case 'weekly':
        return [`RWF ${(value / 1000000).toFixed(1)}M`, 'Revenue'];
      case 'monthly':
        return [`RWF ${(value / 1000000).toFixed(0)}M`, 'Revenue'];
      default:
        return [`RWF ${(value / 1000).toFixed(0)}K`, 'Revenue'];
    }
  };

  const currentData = getData();
  const currentRevenue = currentData[currentData.length - 1]?.revenue || 0;
  const previousRevenue = currentData[currentData.length - 2]?.revenue || 0;
  const revenueChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
  const isPositive = revenueChange >= 0;

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pt-6 px-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <CardTitle className="text-lg font-semibold text-gray-900">Revenue Trends</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          {periods.map((period) => (
            <Button
              key={period.value}
              variant={selectedPeriod === period.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period.value)}
              className="text-xs"
            >
              {period.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={currentData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={getTooltipFormatter}
                labelStyle={{ color: '#374151', fontWeight: '600' }}
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
