import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Activity, Users, Package } from 'lucide-react';

// Rwanda-based usage trends data
const dailyData = [
    { date: 'Jan 1', deliveries: 125, users: 890, revenue: 3200000 },
    { date: 'Jan 2', deliveries: 138, users: 895, revenue: 3800000 },
    { date: 'Jan 3', deliveries: 152, users: 905, revenue: 4200000 },
    { date: 'Jan 4', deliveries: 148, users: 910, revenue: 3900000 },
    { date: 'Jan 5', deliveries: 165, users: 920, revenue: 4500000 },
    { date: 'Jan 6', deliveries: 178, users: 930, revenue: 4800000 },
    { date: 'Jan 7', deliveries: 185, users: 940, revenue: 5200000 },
    { date: 'Jan 8', deliveries: 192, users: 950, revenue: 5500000 },
    { date: 'Jan 9', deliveries: 198, users: 960, revenue: 5800000 },
    { date: 'Jan 10', deliveries: 205, users: 970, revenue: 6100000 },
    { date: 'Jan 11', deliveries: 212, users: 980, revenue: 6400000 },
    { date: 'Jan 12', deliveries: 218, users: 990, revenue: 6700000 },
    { date: 'Jan 13', deliveries: 225, users: 1000, revenue: 7000000 },
    { date: 'Jan 14', deliveries: 232, users: 1010, revenue: 7300000 },
    { date: 'Jan 15', deliveries: 240, users: 1020, revenue: 7600000 }
];

const weeklyData = [
    { week: 'Week 1', deliveries: 850, users: 890, revenue: 25000000 },
    { week: 'Week 2', deliveries: 920, users: 920, revenue: 28000000 },
    { week: 'Week 3', deliveries: 980, users: 950, revenue: 31000000 },
    { week: 'Week 4', deliveries: 1050, users: 980, revenue: 34000000 },
    { week: 'Week 5', deliveries: 1120, users: 1010, revenue: 37000000 },
    { week: 'Week 6', deliveries: 1180, users: 1040, revenue: 40000000 }
];

const monthlyData = [
    { month: 'Oct', deliveries: 3200, users: 800, revenue: 95000000 },
    { month: 'Nov', deliveries: 3800, users: 900, revenue: 110000000 },
    { month: 'Dec', deliveries: 4200, users: 1000, revenue: 125000000 },
    { month: 'Jan', deliveries: 4800, users: 1100, revenue: 140000000 }
];

const periods = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' }
];

export function UsageTrendsChart() {
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

    const getTooltipFormatter = (value: number, name: string) => {
        if (name === 'deliveries') {
            return [value, 'Deliveries'];
        } else if (name === 'users') {
            return [value, 'Users'];
        }
        return [value, name];
    };

    const currentData = getData();
    const currentDeliveries = currentData[currentData.length - 1]?.deliveries || 0;
    const currentUsers = currentData[currentData.length - 1]?.users || 0;
    const previousDeliveries = currentData[currentData.length - 2]?.deliveries || 0;
    const previousUsers = currentData[currentData.length - 2]?.users || 0;

    const deliveriesChange = previousDeliveries > 0 ? ((currentDeliveries - previousDeliveries) / previousDeliveries) * 100 : 0;
    const usersChange = previousUsers > 0 ? ((currentUsers - previousUsers) / previousUsers) * 100 : 0;

    return (
        <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                        <Activity className="h-5 w-5 text-green-600" />
                        Usage Trends
                    </CardTitle>
                    <div className="flex gap-1">
                        {periods.map((period) => (
                            <Button
                                key={period.value}
                                variant={selectedPeriod === period.value ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedPeriod(period.value)}
                                className="text-xs px-2 py-1 h-7"
                            >
                                {period.label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <Package className="h-8 w-8 text-green-600" />
                        <div>
                            <p className="text-sm text-gray-600">Deliveries</p>
                            <p className="text-lg font-bold text-gray-900">{currentDeliveries.toLocaleString()}</p>
                            <div className="flex items-center gap-1 text-xs">
                                {deliveriesChange >= 0 ? (
                                    <span className="text-green-600">+{deliveriesChange.toFixed(1)}%</span>
                                ) : (
                                    <span className="text-red-600">{deliveriesChange.toFixed(1)}%</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <Users className="h-8 w-8 text-blue-600" />
                        <div>
                            <p className="text-sm text-gray-600">Active Users</p>
                            <p className="text-lg font-bold text-gray-900">{currentUsers.toLocaleString()}</p>
                            <div className="flex items-center gap-1 text-xs">
                                {usersChange >= 0 ? (
                                    <span className="text-green-600">+{usersChange.toFixed(1)}%</span>
                                ) : (
                                    <span className="text-red-600">{usersChange.toFixed(1)}%</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={currentData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey={getXAxisKey()}
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => value.toLocaleString()}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                            formatter={getTooltipFormatter}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="deliveries"
                            stroke="#10B981"
                            strokeWidth={3}
                            dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="users"
                            stroke="#3B82F6"
                            strokeWidth={3}
                            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
