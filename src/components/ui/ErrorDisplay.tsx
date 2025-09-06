import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface ErrorDisplayProps {
  error?: Error | string | null;
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryText?: string;
  variant?: "default" | "network" | "permission" | "notFound";
  className?: string;
}

export function ErrorDisplay({
  error,
  title,
  description,
  onRetry,
  retryText,
  variant = "default",
  className = "",
}: ErrorDisplayProps) {
  const { t } = useLanguage();

  const getErrorConfig = () => {
    switch (variant) {
      case "network":
        return {
          icon: WifiOff,
          title: title || t("errors.networkError"),
          description: description || t("errors.networkErrorDescription"),
          retryText: retryText || t("common.retry"),
        };
      case "permission":
        return {
          icon: AlertCircle,
          title: title || t("errors.unauthorized"),
          description: description || t("errors.unauthorizedDescription"),
          retryText: retryText || t("common.login"),
        };
      case "notFound":
        return {
          icon: AlertCircle,
          title: title || t("errors.notFound"),
          description: description || t("errors.notFoundDescription"),
          retryText: retryText || t("common.back"),
        };
      default:
        return {
          icon: AlertCircle,
          title: title || t("common.error"),
          description:
            description ||
            (typeof error === "string" ? error : error?.message) ||
            t("errors.unknownError"),
          retryText: retryText || t("common.retry"),
        };
    }
  };

  const config = getErrorConfig();
  const Icon = config.icon;

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
    >
      <Alert className="max-w-md">
        <Icon className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-foreground">{config.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {config.description}
              </p>
            </div>

            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="mt-3"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {config.retryText}
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}

// Specific error components for common use cases
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return <ErrorDisplay variant="network" onRetry={onRetry} />;
}

export function PermissionError({ onRetry }: { onRetry?: () => void }) {
  return <ErrorDisplay variant="permission" onRetry={onRetry} />;
}

export function NotFoundError({ onRetry }: { onRetry?: () => void }) {
  return <ErrorDisplay variant="notFound" onRetry={onRetry} />;
}

export function GenericError({
  error,
  onRetry,
}: {
  error?: Error | string | null;
  onRetry?: () => void;
}) {
  return <ErrorDisplay error={error} onRetry={onRetry} />;
}
