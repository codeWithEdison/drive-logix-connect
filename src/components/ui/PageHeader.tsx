import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LayoutDashboard, Package, MapPin, Clock, Receipt } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  icon?: LucideIcon;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?:
      | "default"
      | "outline"
      | "secondary"
      | "ghost"
      | "link"
      | "destructive";
    icon?: LucideIcon;
    disabled?: boolean;
  }>;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  badge,
  icon: Icon,
  actions = [],
  className = "",
}: PageHeaderProps) {
  return (
    <div
      className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${className}`}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-6 w-6 text-primary" />}
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          {badge && (
            <Badge variant={badge.variant || "secondary"}>{badge.text}</Badge>
          )}
        </div>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </div>

      {actions.length > 0 && (
        <div className="flex gap-2">
          {actions.map((action, index) => {
            const ActionIcon = action.icon;
            return (
              <Button
                key={index}
                variant={action.variant || "default"}
                onClick={action.onClick}
                disabled={action.disabled}
                className="flex items-center gap-2"
              >
                {ActionIcon && <ActionIcon className="h-4 w-4" />}
                {action.label}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Specific page header components for common use cases
interface ClientPageHeaderProps {
  titleKey: string;
  subtitleKey?: string;
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  icon?: LucideIcon;
  actions?: Array<{
    labelKey: string;
    onClick: () => void;
    variant?:
      | "default"
      | "outline"
      | "secondary"
      | "ghost"
      | "link"
      | "destructive";
    icon?: LucideIcon;
    disabled?: boolean;
  }>;
  className?: string;
}

export function ClientPageHeader({
  titleKey,
  subtitleKey,
  badge,
  icon,
  actions = [],
  className,
}: ClientPageHeaderProps) {
  const { t } = useLanguage();

  const translatedActions = actions.map((action) => ({
    ...action,
    label: t(action.labelKey),
  }));

  return (
    <PageHeader
      title={t(titleKey)}
      subtitle={subtitleKey ? t(subtitleKey) : undefined}
      badge={badge}
      icon={icon}
      actions={translatedActions}
      className={className}
    />
  );
}

// Pre-configured page headers for specific pages
export function DashboardPageHeader({
  actions = [],
}: {
  actions?: Array<{
    labelKey: string;
    onClick: () => void;
    variant?:
      | "default"
      | "outline"
      | "secondary"
      | "ghost"
      | "link"
      | "destructive";
    icon?: LucideIcon;
    disabled?: boolean;
  }>;
}) {
  return (
    <ClientPageHeader
      titleKey="clientDashboard.title"
      subtitleKey="clientDashboard.subtitle"
      icon={LayoutDashboard}
      actions={actions}
    />
  );
}

export function CargoPageHeader({
  actions = [],
}: {
  actions?: Array<{
    labelKey: string;
    onClick: () => void;
    variant?:
      | "default"
      | "outline"
      | "secondary"
      | "ghost"
      | "link"
      | "destructive";
    icon?: LucideIcon;
    disabled?: boolean;
  }>;
}) {
  return (
    <ClientPageHeader
      titleKey="myCargos.title"
      subtitleKey="myCargos.subtitle"
      icon={Package}
      actions={actions}
    />
  );
}

export function TrackingPageHeader({
  actions = [],
}: {
  actions?: Array<{
    labelKey: string;
    onClick: () => void;
    variant?:
      | "default"
      | "outline"
      | "secondary"
      | "ghost"
      | "link"
      | "destructive";
    icon?: LucideIcon;
    disabled?: boolean;
  }>;
}) {
  return (
    <ClientPageHeader
      titleKey="tracking.title"
      subtitleKey="tracking.subtitle"
      icon={MapPin}
      actions={actions}
    />
  );
}

export function HistoryPageHeader({
  actions = [],
}: {
  actions?: Array<{
    labelKey: string;
    onClick: () => void;
    variant?:
      | "default"
      | "outline"
      | "secondary"
      | "ghost"
      | "link"
      | "destructive";
    icon?: LucideIcon;
    disabled?: boolean;
  }>;
}) {
  return (
    <ClientPageHeader
      titleKey="history.title"
      subtitleKey="history.subtitle"
      icon={Clock}
      actions={actions}
    />
  );
}

export function InvoicePageHeader({
  actions = [],
}: {
  actions?: Array<{
    labelKey: string;
    onClick: () => void;
    variant?:
      | "default"
      | "outline"
      | "secondary"
      | "ghost"
      | "link"
      | "destructive";
    icon?: LucideIcon;
    disabled?: boolean;
  }>;
}) {
  return (
    <ClientPageHeader
      titleKey="invoices.title"
      subtitleKey="invoices.subtitle"
      icon={Receipt}
      actions={actions}
    />
  );
}
