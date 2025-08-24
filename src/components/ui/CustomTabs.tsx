import React from 'react';
import { cn } from '@/lib/utils';

interface CustomTabsProps {
    value: string;
    onValueChange: (value: string) => void;
    tabs: {
        value: string;
        label: string;
        count?: number;
    }[];
    className?: string;
}

export function CustomTabs({ value, onValueChange, tabs, className }: CustomTabsProps) {
    return (
        <div className={cn("border-b border-border", className)}>
            <div className="flex space-x-8">
                {tabs.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => onValueChange(tab.value)}
                        className={cn(
                            "relative flex items-center gap-2 py-4 px-1 text-sm font-medium transition-colors hover:text-foreground",
                            value === tab.value
                                ? "text-foreground"
                                : "text-muted-foreground"
                        )}
                    >
                        <span>{tab.label}</span>
                        {tab.count !== undefined && tab.count > 0 && (
                            <span className={cn(
                                "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium rounded-full transition-colors",
                                value === tab.value
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                            )}>
                                {tab.count > 99 ? '99+' : tab.count}
                            </span>
                        )}
                        {value === tab.value && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-sm" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
