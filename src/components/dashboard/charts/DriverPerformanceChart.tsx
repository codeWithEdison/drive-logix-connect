import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users } from 'lucide-react';

// Mock data for driver performance
const driverPerformanceData = [
  { driver: 'Albert Flores', deliveries: 156, rating: 4.8, earnings: 18720, status: 'active' },
  { driver: 'Sarah Wilson', deliveries: 134, rating: 4.9, earnings: 16080, status: 'active' },
  { driver: 'Mike Johnson', deliveries: 128, rating: 4.7, earnings: 15360, status: 'active' },
  { driver: 'Guy Hawkins', deliveries: 112, rating: 4.6, earnings: 13440, status: 'active' },
  { driver: 'Emma Davis', deliveries: 98, rating: 4.5, earnings: 11760, status: 'active' },
  { driver: 'John Smith', deliveries: 89, rating: 4.4, earnings: 10680, status: 'active' },
  { driver: 'Lisa Brown', deliveries: 76, rating: 4.3, earnings: 9120, status: 'active' },
  { driver: 'Tom Wilson', deliveries: 65, rating: 4.2, earnings: 7800, status: 'active' },
];

interface DriverPerformanceChartProps {
  className?: string;
}

export function DriverPerformanceChart({ className }: DriverPerformanceChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-blue-600 font-medium">
            Deliveries: {data.deliveries}
          </p>
          <p className="text-yellow-600 text-sm">
            Rating: {data.rating}/5
          </p>
          <p className="text-green-600 text-sm">
            Earnings: ${data.earnings.toLocaleString()}
          </p>
          <p className="text-gray-600 text-sm">
            Status: {data.status}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={`bg-white/80 backdrop-blur-sm border-pink-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pt-6 px-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
          <CardTitle className="text-lg font-semibold text-gray-900">Driver Performance</CardTitle>
        </div>
        <Users className="h-5 w-5 text-pink-500" />
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={driverPerformanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                name="Deliveries"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="text-center p-3 bg-pink-50 rounded-lg">
            <p className="text-pink-600 font-semibold">858</p>
            <p className="text-pink-600">Total Deliveries</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <p className="text-yellow-600 font-semibold">4.6</p>
            <p className="text-yellow-600">Avg Rating</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-green-600 font-semibold">$111k</p>
            <p className="text-green-600">Total Earnings</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
