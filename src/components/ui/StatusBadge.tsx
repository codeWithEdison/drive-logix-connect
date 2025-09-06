import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  variant,
  size = "md",
  showIcon = false,
  className,
}: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    const normalizedStatus = status.toLowerCase();

    switch (normalizedStatus) {
      // Cargo statuses
      case "pending":
      case "en_attente":
        return {
          label: "Pending",
          variant: "secondary" as const,
          className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        };
      case "assigned":
      case "assigné":
        return {
          label: "Assigned",
          variant: "default" as const,
          className: "bg-blue-100 text-blue-800 border-blue-200",
        };
      case "active":
      case "actif":
        return {
          label: "Active",
          variant: "default" as const,
          className: "bg-green-100 text-green-800 border-green-200",
        };
      case "in_transit":
      case "en_transit":
        return {
          label: "In Transit",
          variant: "default" as const,
          className: "bg-blue-100 text-blue-800 border-blue-200",
        };
      case "delivered":
      case "livré":
        return {
          label: "Delivered",
          variant: "default" as const,
          className: "bg-green-100 text-green-800 border-green-200",
        };
      case "cancelled":
      case "annulé":
        return {
          label: "Cancelled",
          variant: "destructive" as const,
          className: "bg-red-100 text-red-800 border-red-200",
        };

      // Invoice statuses
      case "draft":
      case "brouillon":
        return {
          label: "Draft",
          variant: "secondary" as const,
          className: "bg-gray-100 text-gray-800 border-gray-200",
        };
      case "sent":
      case "envoyé":
        return {
          label: "Sent",
          variant: "default" as const,
          className: "bg-blue-100 text-blue-800 border-blue-200",
        };
      case "paid":
      case "payé":
        return {
          label: "Paid",
          variant: "default" as const,
          className: "bg-green-100 text-green-800 border-green-200",
        };
      case "overdue":
      case "en_retard":
        return {
          label: "Overdue",
          variant: "destructive" as const,
          className: "bg-red-100 text-red-800 border-red-200",
        };

      // Driver statuses
      case "available":
      case "disponible":
        return {
          label: "Available",
          variant: "default" as const,
          className: "bg-green-100 text-green-800 border-green-200",
        };
      case "busy":
      case "occupé":
        return {
          label: "Busy",
          variant: "secondary" as const,
          className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        };
      case "offline":
      case "hors_ligne":
        return {
          label: "Offline",
          variant: "destructive" as const,
          className: "bg-red-100 text-red-800 border-red-200",
        };

      // Vehicle statuses
      case "maintenance":
      case "maintenance":
        return {
          label: "Maintenance",
          variant: "secondary" as const,
          className: "bg-orange-100 text-orange-800 border-orange-200",
        };
      case "retired":
      case "retraité":
        return {
          label: "Retired",
          variant: "destructive" as const,
          className: "bg-gray-100 text-gray-800 border-gray-200",
        };

      default:
        return {
          label: status,
          variant: "secondary" as const,
          className: "bg-gray-100 text-gray-800 border-gray-200",
        };
    }
  };

  const config = getStatusConfig(status);
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-2.5 py-1.5",
    lg: "text-base px-3 py-2",
  };

  return (
    <Badge
      variant={variant || config.variant}
      className={cn(sizeClasses[size], config.className, className)}
    >
      {config.label}
    </Badge>
  );
}

// Specific status badge components for common use cases
export function CargoStatusBadge({
  status,
  ...props
}: Omit<StatusBadgeProps, "status"> & { status: string }) {
  return <StatusBadge status={status} {...props} />;
}

export function InvoiceStatusBadge({
  status,
  ...props
}: Omit<StatusBadgeProps, "status"> & { status: string }) {
  return <StatusBadge status={status} {...props} />;
}

export function DriverStatusBadge({
  status,
  ...props
}: Omit<StatusBadgeProps, "status"> & { status: string }) {
  return <StatusBadge status={status} {...props} />;
}

export function VehicleStatusBadge({
  status,
  ...props
}: Omit<StatusBadgeProps, "status"> & { status: string }) {
  return <StatusBadge status={status} {...props} />;
}
