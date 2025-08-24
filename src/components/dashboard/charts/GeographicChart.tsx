import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MapPin } from 'lucide-react';

// Mock data for geographic distribution
const geographicData = [
  { route: 'Kigali → Butare', revenue: 28500, deliveries: 95, distance: 120 },
  { route: 'Kigali → Musanze', revenue: 22400, deliveries: 80, distance: 80 },
  { route: 'Kigali → Gisenyi', revenue: 19800, deliveries: 66, distance: 150 },
  { route: 'Butare → Kigali', revenue: 17600, deliveries: 55, distance: 120 },
  { route: 'Kigali → Kibuye', revenue: 15200, deliveries: 48, distance: 180 },
  { route: 'Musanze → Kigali', revenue: 13400, deliveries: 42, distance: 80 },
];

interface GeographicChartProps {
  className?: string;
}

export function GeographicChart({ className }: GeographicChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-green-600 font-medium">
            Revenue: ${data.revenue.toLocaleString()}
          </p>
          <p className="text-blue-600 text-sm">
            Deliveries: {data.deliveries}
          </p>
          <p className="text-gray-600 text-sm">
            Distance: {data.distance} km
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={`bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pt-6 px-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          <CardTitle className="text-lg font-semibold text-gray-900">Top Routes</CardTitle>
        </div>
        <MapPin className="h-5 w-5 text-purple-500" />
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={geographicData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="revenue" 
                fill="#8B5CF6" 
                radius={[4, 4, 0, 0]}
                name="Revenue"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-purple-600 font-semibold">$116.9k</p>
            <p className="text-purple-600">Total Revenue</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-blue-600 font-semibold">386</p>
            <p className="text-blue-600">Total Deliveries</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-green-600 font-semibold">730km</p>
            <p className="text-green-600">Total Distance</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
