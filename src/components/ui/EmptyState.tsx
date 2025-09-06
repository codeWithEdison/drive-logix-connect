import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LucideIcon } from "lucide-react";
import { Package, Receipt, Search, Clock } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?:
      | "default"
      | "outline"
      | "secondary"
      | "ghost"
      | "link"
      | "destructive";
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?:
      | "default"
      | "outline"
      | "secondary"
      | "ghost"
      | "link"
      | "destructive";
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className = "",
}: EmptyStateProps) {
  return (
    <Card className={`border-dashed ${className}`}>
      <CardContent className="flex flex-col items-center justify-center p-12 text-center">
        {Icon && (
          <div className="mb-4 rounded-full bg-muted p-3">
            <Icon className="h-8 w-8 text-muted-foreground" />
          </div>
        )}

        <div className="space-y-2 mb-6">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {description}
          </p>
        </div>

        <div className="flex gap-2">
          {action && (
            <Button
              variant={action.variant || "default"}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}

          {secondaryAction && (
            <Button
              variant={secondaryAction.variant || "outline"}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Specific empty state components for common use cases
interface CargoEmptyStateProps {
  onCreateCargo?: () => void;
  onRefresh?: () => void;
}

export function CargoEmptyState({
  onCreateCargo,
  onRefresh,
}: CargoEmptyStateProps) {
  const { t } = useLanguage();

  return (
    <EmptyState
      icon={Package}
      title={t("myCargos.noCargos")}
      description={t("myCargos.noCargosDescription")}
      action={
        onCreateCargo
          ? {
              label: t("myCargos.createNewCargo"),
              onClick: onCreateCargo,
            }
          : undefined
      }
      secondaryAction={
        onRefresh
          ? {
              label: t("common.refresh"),
              onClick: onRefresh,
              variant: "outline",
            }
          : undefined
      }
    />
  );
}

interface InvoiceEmptyStateProps {
  onRefresh?: () => void;
}

export function InvoiceEmptyState({ onRefresh }: InvoiceEmptyStateProps) {
  const { t } = useLanguage();

  return (
    <EmptyState
      icon={Receipt}
      title={t("invoices.noInvoicesFound")}
      description={t("invoices.noInvoicesDescription")}
      secondaryAction={
        onRefresh
          ? {
              label: t("common.refresh"),
              onClick: onRefresh,
              variant: "outline",
            }
          : undefined
      }
    />
  );
}

interface TrackingEmptyStateProps {
  onSearch?: () => void;
}

export function TrackingEmptyState({ onSearch }: TrackingEmptyStateProps) {
  const { t } = useLanguage();

  return (
    <EmptyState
      icon={Search}
      title={t("tracking.noCargoId")}
      description={t("tracking.noCargoIdDescription")}
      action={
        onSearch
          ? {
              label: t("tracking.track"),
              onClick: onSearch,
            }
          : undefined
      }
    />
  );
}

interface HistoryEmptyStateProps {
  onCreateCargo?: () => void;
  onRefresh?: () => void;
}

export function HistoryEmptyState({
  onCreateCargo,
  onRefresh,
}: HistoryEmptyStateProps) {
  const { t } = useLanguage();

  return (
    <EmptyState
      icon={Clock}
      title={t("history.noCargos")}
      description={t("history.noCargosDescription")}
      action={
        onCreateCargo
          ? {
              label: t("createCargo.title"),
              onClick: onCreateCargo,
            }
          : undefined
      }
      secondaryAction={
        onRefresh
          ? {
              label: t("common.refresh"),
              onClick: onRefresh,
              variant: "outline",
            }
          : undefined
      }
    />
  );
}
