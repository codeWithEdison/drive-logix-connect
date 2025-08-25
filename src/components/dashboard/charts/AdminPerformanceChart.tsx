import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import { Users, Star, TrendingUp, MapPin } from 'lucide-react';

// Rwanda-based admin performance data
const adminData = [
    {
        name: 'Jean Pierre Ndayisaba',
        tasks: 45,
        efficiency: 92,
        rating: 4.8,
        region: 'Kigali',
        deliveries: 156,
        revenue: 8500000
    },
    {
        name: 'Sarah Mukamana',
        tasks: 38,
        efficiency: 88,
        rating: 4.6,
        region: 'Butare',
        deliveries: 142,
        revenue: 7200000
    },
    {
        name: 'Emmanuel Gasana',
        tasks: 52,
        efficiency: 95,
        rating: 4.9,
        region: 'Musanze',
        deliveries: 189,
        revenue: 9800000
    },
    {
        name: 'Alice Uwimana',
        tasks: 28,
        efficiency: 85,
        rating: 4.4,
        region: 'Rubavu',
        deliveries: 98,
        revenue: 5200000
    },
    {
        name: 'David Niyonsaba',
        tasks: 33,
        efficiency: 90,
        rating: 4.7,
        region: 'Karongi',
        deliveries: 125,
        revenue: 6800000
    }
];

const metrics = [
    { label: 'Tasks', value: 'tasks', color: '#3B82F6' },
    { label: 'Efficiency', value: 'efficiency', color: '#10B981' },
    { label: 'Rating', value: 'rating', color: '#F59E0B' },
    { label: 'Deliveries', value: 'deliveries', color: '#8B5CF6' }
];

export function AdminPerformanceChart() {
    const [selectedMetric, setSelectedMetric] = useState('efficiency');

    const getTooltipFormatter = (value: number, name: string) => {
        if (name === 'efficiency') {
            return [`${value}%`, 'Efficiency'];
        } else if (name === 'rating') {
            return [value.toFixed(1), 'Rating'];
        } else if (name === 'deliveries') {
            return [value.toLocaleString(), 'Deliveries'];
        } else if (name === 'revenue') {
            return [`RWF ${(value / 1000000).toFixed(1)}M`, 'Revenue'];
        }
        return [value, name];
    };

    const getYAxisFormatter = (value: number) => {
        if (selectedMetric === 'efficiency') {
            return `${value}%`;
        } else if (selectedMetric === 'rating') {
            return value.toFixed(1);
        } else if (selectedMetric === 'deliveries') {
            return value.toLocaleString();
        }
        return value.toString();
    };

    const currentMetric = metrics.find(m => m.value === selectedMetric);
    const sortedData = [...adminData].sort((a, b) => {
        const aValue = a[selectedMetric as keyof typeof a] as number;
        const bValue = b[selectedMetric as keyof typeof a] as number;
        return bValue - aValue;
    });

    return (
        <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardHeader className="pb-4">
                <div className="space-y-4">
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                        <Users className="h-5 w-5 text-purple-600" />
                        Admin Performance
                    </CardTitle>
                    <div className="flex flex-wrap gap-2">
                        {metrics.map((metric) => (
                            <Button
                                key={metric.value}
                                variant={selectedMetric === metric.value ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedMetric(metric.value)}
                                className="text-xs px-3 py-2 h-8"
                                style={{
                                    backgroundColor: selectedMetric === metric.value ? metric.color : undefined,
                                    borderColor: metric.color
                                }}
                            >
                                {metric.label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Top Performer */}
                <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <Star className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Top Performer</p>
                                <p className="font-bold text-gray-900">{sortedData[0]?.name}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <MapPin className="h-3 w-3" />
                                    {sortedData[0]?.region}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-purple-600">
                                {selectedMetric === 'efficiency' && `${sortedData[0]?.[selectedMetric]}%`}
                                {selectedMetric === 'rating' && sortedData[0]?.[selectedMetric].toFixed(1)}
                                {selectedMetric === 'deliveries' && sortedData[0]?.[selectedMetric].toLocaleString()}
                                {selectedMetric === 'tasks' && sortedData[0]?.[selectedMetric]}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">{currentMetric?.label}</p>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={sortedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="name"
                            stroke="#888888"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={getYAxisFormatter}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                            formatter={getTooltipFormatter}
                            labelFormatter={(label) => `${label} (${adminData.find(a => a.name === label)?.region})`}
                        />
                        <Bar
                            dataKey={selectedMetric}
                            fill={currentMetric?.color}
                            radius={[4, 4, 0, 0]}
                        >
                            {sortedData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={currentMetric?.color}
                                    opacity={0.8}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>

                {/* Performance Summary */}
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                    <div className="text-center">
                        <p className="text-xs text-gray-500">Avg Efficiency</p>
                        <p className="text-lg font-bold text-green-600">
                            {(adminData.reduce((sum, admin) => sum + admin.efficiency, 0) / adminData.length).toFixed(1)}%
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500">Avg Rating</p>
                        <p className="text-lg font-bold text-yellow-600">
                            {(adminData.reduce((sum, admin) => sum + admin.rating, 0) / adminData.length).toFixed(1)}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500">Total Revenue</p>
                        <p className="text-lg font-bold text-blue-600">
                            RWF {(adminData.reduce((sum, admin) => sum + admin.revenue, 0) / 1000000).toFixed(1)}M
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
