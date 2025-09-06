import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  DollarSign,
  Star,
} from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  className?: string;
  iconColor?: string;
  valueColor?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  iconColor = "text-primary",
  valueColor = "text-foreground",
}: StatsCardProps) {
  return (
    <Card className={cn("card-elevated", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className={cn("h-4 w-4", iconColor)} />}
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", valueColor)}>{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <span
              className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Specific stats card components for common use cases
interface CargoStatsCardProps {
  titleKey: string;
  value: string | number;
  descriptionKey?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    labelKey: string;
    isPositive?: boolean;
  };
  className?: string;
  iconColor?: string;
  valueColor?: string;
}

export function CargoStatsCard({
  titleKey,
  value,
  descriptionKey,
  icon,
  trend,
  className,
  iconColor,
  valueColor,
}: CargoStatsCardProps) {
  const { t } = useLanguage();

  return (
    <StatsCard
      title={t(titleKey)}
      value={value}
      description={descriptionKey ? t(descriptionKey) : undefined}
      icon={icon}
      trend={
        trend
          ? {
              ...trend,
              label: t(trend.labelKey),
            }
          : undefined
      }
      className={className}
      iconColor={iconColor}
      valueColor={valueColor}
    />
  );
}

// Pre-configured stats cards for specific metrics
export function TotalCargosCard({
  value,
  trend,
}: {
  value: number;
  trend?: { value: number; isPositive?: boolean };
}) {
  return (
    <CargoStatsCard
      titleKey="clientDashboard.totalCargos"
      value={value}
      icon={Package}
      trend={
        trend
          ? {
              ...trend,
              labelKey: "common.fromLastMonth",
            }
          : undefined
      }
    />
  );
}

export function ActiveDeliveriesCard({
  value,
  trend,
}: {
  value: number;
  trend?: { value: number; isPositive?: boolean };
}) {
  return (
    <CargoStatsCard
      titleKey="clientDashboard.activeDeliveries"
      value={value}
      icon={Truck}
      trend={
        trend
          ? {
              ...trend,
              labelKey: "common.fromLastWeek",
            }
          : undefined
      }
    />
  );
}

export function CompletedDeliveriesCard({
  value,
  trend,
}: {
  value: number;
  trend?: { value: number; isPositive?: boolean };
}) {
  return (
    <CargoStatsCard
      titleKey="clientDashboard.completedDeliveries"
      value={value}
      icon={CheckCircle}
      trend={
        trend
          ? {
              ...trend,
              labelKey: "common.fromLastMonth",
            }
          : undefined
      }
    />
  );
}

export function PendingPaymentsCard({
  value,
  trend,
}: {
  value: string;
  trend?: { value: number; isPositive?: boolean };
}) {
  return (
    <CargoStatsCard
      titleKey="clientDashboard.pendingPayments"
      value={value}
      icon={Clock}
      trend={
        trend
          ? {
              ...trend,
              labelKey: "common.fromLastWeek",
            }
          : undefined
      }
    />
  );
}

export function TotalSpentCard({
  value,
  trend,
}: {
  value: string;
  trend?: { value: number; isPositive?: boolean };
}) {
  return (
    <CargoStatsCard
      titleKey="clientDashboard.totalSpent"
      value={value}
      icon={DollarSign}
      trend={
        trend
          ? {
              ...trend,
              labelKey: "common.fromLastMonth",
            }
          : undefined
      }
    />
  );
}

export function AverageRatingCard({
  value,
  trend,
}: {
  value: number;
  trend?: { value: number; isPositive?: boolean };
}) {
  return (
    <CargoStatsCard
      titleKey="clientDashboard.averageRating"
      value={`${value}/5`}
      icon={Star}
      trend={
        trend
          ? {
              ...trend,
              labelKey: "common.fromLastMonth",
            }
          : undefined
      }
    />
  );
}
