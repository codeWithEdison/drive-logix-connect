import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  RefreshCw,
  Wifi,
  WifiOff,
  Map,
  Package,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FallbackProps {
  error?: Error;
  isOffline?: boolean;
  isConnecting?: boolean;
  onRetry?: () => void;
  type: "map" | "data" | "connection";
}

export const LiveTrackingMapFallback: React.FC<FallbackProps> = ({
  error,
  isOffline = false,
  isConnecting = false,
  onRetry,
  type,
}) => {
  const getFallbackContent = () => {
    switch (type) {
      case "map":
        return (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center p-8">
              <Map className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Map Unavailable</h3>
              <p className="text-gray-600 mb-4">
                {error?.message ||
                  "Unable to load the map. Please check your internet connection."}
              </p>
              {onRetry && (
                <Button onClick={onRetry} disabled={isConnecting}>
                  <RefreshCw
                    className={cn(
                      "h-4 w-4 mr-2",
                      isConnecting && "animate-spin"
                    )}
                  />
                  Retry
                </Button>
              )}
            </div>
          </div>
        );

      case "data":
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No Tracking Data</h3>
              <p className="text-gray-600 mb-4">
                {error?.message || "Unable to load cargo tracking data."}
              </p>
              {onRetry && (
                <Button onClick={onRetry} disabled={isConnecting}>
                  <RefreshCw
                    className={cn(
                      "h-4 w-4 mr-2",
                      isConnecting && "animate-spin"
                    )}
                  />
                  Retry
                </Button>
              )}
            </div>
          </div>
        );

      case "connection":
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              {isOffline ? (
                <WifiOff className="h-16 w-16 mx-auto mb-4 text-red-400" />
              ) : (
                <Wifi className="h-16 w-16 mx-auto mb-4 text-yellow-400" />
              )}
              <h3 className="text-lg font-semibold mb-2">
                {isOffline ? "Connection Lost" : "Connecting..."}
              </h3>
              <p className="text-gray-600 mb-4">
                {isOffline
                  ? "Live tracking is temporarily unavailable. Data will sync when connection is restored."
                  : "Establishing connection for live tracking updates..."}
              </p>
              {onRetry && (
                <Button onClick={onRetry} disabled={isConnecting}>
                  <RefreshCw
                    className={cn(
                      "h-4 w-4 mr-2",
                      isConnecting && "animate-spin"
                    )}
                  />
                  Retry Connection
                </Button>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="h-full">
      <CardContent className="p-0 h-full">{getFallbackContent()}</CardContent>
    </Card>
  );
};

interface ErrorBoundaryFallbackProps {
  error: Error;
  resetError: () => void;
}

export const ErrorBoundaryFallback: React.FC<ErrorBoundaryFallbackProps> = ({
  error,
  resetError,
}) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          Tracking Error
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            An unexpected error occurred while loading the tracking system.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Error Details:</h4>
            <p className="text-sm text-gray-600 font-mono bg-gray-100 p-2 rounded">
              {error.message}
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={resetError}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface ConnectionStatusProps {
  isConnected: boolean;
  isConnecting: boolean;
  lastUpdate?: string;
  onRetry?: () => void;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  isConnecting,
  lastUpdate,
  onRetry,
}) => {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
      <div
        className={cn(
          "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0",
          isConnected
            ? "bg-green-500"
            : isConnecting
            ? "bg-yellow-500"
            : "bg-red-500"
        )}
      />
      <span
        className={cn(
          "font-medium truncate",
          isConnected
            ? "text-green-700"
            : isConnecting
            ? "text-yellow-700"
            : "text-red-700"
        )}
      >
        {isConnected ? "Live" : isConnecting ? "Connecting..." : "Offline"}
      </span>
      {lastUpdate && (
        <span className="text-muted-foreground hidden sm:inline text-xs">
          • {new Date(lastUpdate).toLocaleTimeString()}
        </span>
      )}
      {!isConnected && onRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          disabled={isConnecting}
          className="h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0"
        >
          <RefreshCw
            className={cn("h-3 w-3 sm:h-3.5 sm:w-3.5", isConnecting && "animate-spin")}
          />
        </Button>
      )}
    </div>
  );
};
