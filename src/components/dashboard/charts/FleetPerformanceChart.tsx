import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Truck } from 'lucide-react';

// Mock data for fleet performance
const fleetPerformanceData = [
  { truck: 'TRK-001', deliveries: 45, utilization: 85, fuelLevel: 90, rating: 4.8 },
  { truck: 'TRK-002', deliveries: 38, utilization: 72, fuelLevel: 75, rating: 4.6 },
  { truck: 'TRK-003', deliveries: 52, utilization: 88, fuelLevel: 85, rating: 4.9 },
  { truck: 'TRK-004', deliveries: 41, utilization: 78, fuelLevel: 60, rating: 4.5 },
  { truck: 'TRK-005', deliveries: 35, utilization: 65, fuelLevel: 95, rating: 4.7 },
  { truck: 'TRK-006', deliveries: 48, utilization: 82, fuelLevel: 80, rating: 4.8 },
  { truck: 'TRK-007', deliveries: 33, utilization: 68, fuelLevel: 70, rating: 4.4 },
  { truck: 'TRK-008', deliveries: 56, utilization: 92, fuelLevel: 88, rating: 4.9 },
];

interface FleetPerformanceChartProps {
  className?: string;
}

export function FleetPerformanceChart({ className }: FleetPerformanceChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-blue-600 font-medium">
            Deliveries: {data.deliveries}
          </p>
          <p className="text-green-600 text-sm">
            Utilization: {data.utilization}%
          </p>
          <p className="text-orange-600 text-sm">
            Fuel Level: {data.fuelLevel}%
          </p>
          <p className="text-purple-600 text-sm">
            Rating: {data.rating}/5
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={`bg-white/80 backdrop-blur-sm border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pt-6 px-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <CardTitle className="text-lg font-semibold text-gray-900">Fleet Performance</CardTitle>
        </div>
        <Truck className="h-5 w-5 text-orange-500" />
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fleetPerformanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="truck" 
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
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="deliveries" 
                fill="#F59E0B" 
                radius={[4, 4, 0, 0]}
                name="Deliveries"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <p className="text-orange-600 font-semibold">348</p>
            <p className="text-orange-600">Total Deliveries</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-green-600 font-semibold">78%</p>
            <p className="text-green-600">Avg Utilization</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-blue-600 font-semibold">4.7</p>
            <p className="text-blue-600">Avg Rating</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
