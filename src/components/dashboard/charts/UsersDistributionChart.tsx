import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { BarChart3, Users, Shield, UserCheck, Crown } from 'lucide-react';

// Rwanda-based users distribution data
const usersData = [
    {
        name: 'Clients',
        value: 810,
        color: '#3B82F6',
        percentage: 65,
        icon: Users,
        description: 'Business and individual customers'
    },
    {
        name: 'Drivers',
        value: 249,
        color: '#10B981',
        percentage: 20,
        icon: UserCheck,
        description: 'Delivery personnel'
    },
    {
        name: 'Admins',
        value: 125,
        color: '#F59E0B',
        percentage: 10,
        icon: Shield,
        description: 'System administrators'
    },
    {
        name: 'Super Admins',
        value: 63,
        color: '#8B5CF6',
        percentage: 5,
        icon: Crown,
        description: 'System super administrators'
    }
];

const totalUsers = usersData.reduce((sum, user) => sum + user.value, 0);

export function UsersDistributionChart() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const onPieEnter = (data: any, index: number) => {
        setActiveIndex(index);
    };

    const onPieLeave = () => {
        setActiveIndex(null);
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const IconComponent = data.icon;

            return (
                <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                        <IconComponent className="h-4 w-4" style={{ color: data.color }} />
                        <span className="font-semibold text-gray-900">{data.name}</span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">{data.value.toLocaleString()}</span> users
                        </p>
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">{data.percentage}%</span> of total
                        </p>
                        <p className="text-xs text-gray-500">{data.description}</p>
                    </div>
                </div>
            );
        }
        return null;
    };

    const CustomLegend = ({ payload }: any) => {
        return (
            <div className="flex flex-wrap gap-4 justify-center mt-4">
                {payload?.map((entry: any, index: number) => {
                    const data = usersData[index];
                    const IconComponent = data.icon;

                    return (
                        <div
                            key={entry.value}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                            onMouseEnter={() => onPieEnter(null, index)}
                            onMouseLeave={onPieLeave}
                        >
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <IconComponent className="h-4 w-4" style={{ color: entry.color }} />
                            <span className="text-sm font-medium text-gray-700">{entry.value}</span>
                            <span className="text-xs text-gray-500">({data.percentage}%)</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Users Distribution
                </CardTitle>

                {/* Total Users Summary */}
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total System Users</p>
                                <p className="text-2xl font-bold text-gray-900">{totalUsers.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">Active across Rwanda</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <p className="text-xs text-gray-500">Growth</p>
                                    <p className="text-lg font-bold text-green-600">+12.5%</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">This Month</p>
                                    <p className="text-lg font-bold text-blue-600">+89</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <div className="relative">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={usersData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                                onMouseEnter={onPieEnter}
                                onMouseLeave={onPieLeave}
                            >
                                {usersData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                        opacity={activeIndex === index ? 1 : 0.8}
                                        strokeWidth={activeIndex === index ? 2 : 0}
                                        stroke="#ffffff"
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <p className="text-2xl font-bold text-gray-900">{totalUsers.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Total Users</p>
                    </div>
                </div>

                {/* Legend */}
                <CustomLegend payload={usersData.map((user, index) => ({ value: user.name, color: user.color }))} />

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-100">
                    <div className="text-center">
                        <p className="text-xs text-gray-500">Most Active</p>
                        <p className="text-sm font-bold text-blue-600">Clients</p>
                        <p className="text-xs text-gray-500">810 users</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500">Fastest Growing</p>
                        <p className="text-sm font-bold text-green-600">Drivers</p>
                        <p className="text-xs text-gray-500">+15.2% this month</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
