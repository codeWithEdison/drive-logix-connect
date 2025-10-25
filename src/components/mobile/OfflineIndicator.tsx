import React from "react";
import { AlertCircle, Wifi, WifiOff } from "lucide-react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

interface OfflineIndicatorProps {
  className?: string;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  className = "",
}) => {
  const { isOnline, connectionQuality, connectionType } = useNetworkStatus();

  if (isOnline) {
    return (
      <div className={`flex items-center gap-2 text-green-600 ${className}`}>
        <Wifi className="h-4 w-4" />
        <span className="text-sm font-medium">
          {connectionQuality === "excellent"
            ? "Excellent"
            : connectionQuality === "good"
            ? "Good"
            : connectionQuality === "fair"
            ? "Fair"
            : "Poor"}{" "}
          Connection
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 text-red-600 ${className}`}>
      <WifiOff className="h-4 w-4" />
      <span className="text-sm font-medium">Offline</span>
    </div>
  );
};

export default OfflineIndicator;
