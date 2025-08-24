import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp } from "lucide-react";

export interface StatItem {
    title: string;
    value: string;
    change: string;
    changeType: 'increase' | 'decrease' | 'active' | 'waiting' | 'success' | 'rating' | 'ready';
    icon: React.ComponentType<{ className?: string }>;
    color: string;
}

interface StatsCardProps {
    stats: StatItem[];
    className?: string;
}

export function StatsCard({ stats, className = "" }: StatsCardProps) {
    const getChangeTypeStyles = (changeType: StatItem['changeType']) => {
        switch (changeType) {
            case 'increase':
                return 'bg-green-100 text-green-600';
            case 'decrease':
                return 'bg-red-100 text-red-600';
            case 'active':
                return 'bg-blue-100 text-blue-600';
            case 'waiting':
                return 'bg-yellow-100 text-yellow-600';
            case 'success':
                return 'bg-green-100 text-green-600';
            case 'rating':
                return 'bg-yellow-100 text-yellow-600';
            case 'ready':
                return 'bg-purple-100 text-purple-600';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <Card className={`bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden ${className}`}>
            <CardContent className="p-0">
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-0">
                    {stats.map((stat, index) => (
                        <div key={stat.title} className="relative">
                            <div className="p-3 md:p-4 lg:p-6">
                                <div className="flex items-center justify-between mb-2 md:mb-3">
                                    <div className="flex items-center gap-1 md:gap-2">
                                        <div className={`w-2 h-2 md:w-3 md:h-3 bg-${stat.color}-500 rounded-full`}></div>
                                        <p className="text-xs md:text-sm font-medium text-gray-600 truncate">{stat.title}</p>
                                    </div>
                                    <stat.icon className={`w-4 h-4 md:w-5 md:h-5 text-${stat.color}-500 flex-shrink-0`} />
                                </div>
                                <div className="flex items-center gap-1 md:gap-2">
                                    <span className="text-lg md:text-2xl lg:text-3xl font-bold text-gray-900 truncate">{stat.value}</span>
                                    <div className={`flex items-center gap-1 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs font-medium flex-shrink-0 ${getChangeTypeStyles(stat.changeType)}`}>
                                        {stat.changeType === 'increase' && <ArrowUp className="w-2 h-2 md:w-3 md:h-3" />}
                                        <span className="truncate">{stat.change}</span>
                                    </div>
                                </div>
                            </div>
                            {/* Vertical divider - only show on larger screens */}
                            {index < stats.length - 1 && (
                                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-px h-8 md:h-12 lg:h-16 bg-gray-200 hidden md:block"></div>
                            )}
                            {/* Horizontal divider - only show on mobile */}
                            {index < stats.length - 1 && index % 2 === 1 && (
                                <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200 md:hidden"></div>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
