import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Package } from 'lucide-react';

// Mock data for delivery status distribution
const deliveryStatusData = [
  { status: 'Delivered', value: 60, color: '#10B981', count: 748 },
  { status: 'In Transit', value: 23, color: '#3B82F6', count: 287 },
  { status: 'Pending', value: 15, color: '#F59E0B', count: 187 },
  { status: 'Cancelled', value: 2, color: '#EF4444', count: 25 },
];

interface DeliveryStatusChartProps {
  className?: string;
}

export function DeliveryStatusChart({ className }: DeliveryStatusChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.status}</p>
          <p className="text-gray-600">
            Percentage: <span className="font-medium">{data.value}%</span>
          </p>
          <p className="text-gray-600">
            Count: <span className="font-medium">{data.count}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => (
    <div className="flex flex-wrap gap-4 justify-center mt-4">
      {payload?.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-600">
            {entry.value} ({deliveryStatusData[index].value}%)
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <Card className={`bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pt-6 px-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <CardTitle className="text-lg font-semibold text-gray-900">Delivery Status</CardTitle>
        </div>
        <Package className="h-5 w-5 text-blue-500" />
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={deliveryStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ status, value }) => `${status}: ${value}%`}
                labelLine={false}
              >
                {deliveryStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-green-600 font-semibold">748</p>
            <p className="text-green-600">Delivered</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-blue-600 font-semibold">287</p>
            <p className="text-blue-600">In Transit</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <p className="text-yellow-600 font-semibold">187</p>
            <p className="text-yellow-600">Pending</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className="text-red-600 font-semibold">25</p>
            <p className="text-red-600">Cancelled</p>
          </div>
        </div> */}
      </CardContent>
    </Card>
  );
}
