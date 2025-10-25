import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, X, AlertCircle, CheckCircle } from "lucide-react";
import { deviceService } from "@/lib/services/deviceService";
import axiosInstance from "@/lib/api/axios";

interface UpdatePromptProps {
  className?: string;
}

interface AppUpdate {
  version: string;
  isRequired: boolean;
  releaseNotes: string[];
  downloadUrl: string;
  size: string;
}

export const UpdatePrompt: React.FC<UpdatePromptProps> = ({
  className = "",
}) => {
  const [update, setUpdate] = useState<AppUpdate | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    setIsChecking(true);

    try {
      // Check for app updates using axios
      const response = await axiosInstance.get("/mobile/check-update");

      if (response.data.success) {
        const updateData = response.data.data;
        if (updateData.hasUpdate) {
          setUpdate(updateData.update);
          setIsVisible(true);
        }
      }
    } catch (error) {
      console.error("Failed to check for updates:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleUpdate = async () => {
    if (!update) return;

    try {
      if (deviceService.getPlatform() === "android") {
        // Open Play Store
        window.open(update.downloadUrl, "_blank");
      } else if (deviceService.getPlatform() === "ios") {
        // Open App Store
        window.open(update.downloadUrl, "_blank");
      } else {
        // Web - reload page
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to update app:", error);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);

    // Don't show again for this version
    localStorage.setItem("update_dismissed", update?.version || "");
  };

  const handleLater = () => {
    setIsVisible(false);

    // Show again in 24 hours
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    localStorage.setItem("update_remind_later", tomorrow.toISOString());
  };

  // Don't show if dismissed for this version
  useEffect(() => {
    if (update) {
      const dismissedVersion = localStorage.getItem("update_dismissed");
      if (dismissedVersion === update.version) {
        setIsVisible(false);
      }
    }
  }, [update]);

  // Don't show if "remind later" is still active
  useEffect(() => {
    const remindLater = localStorage.getItem("update_remind_later");
    if (remindLater) {
      const remindDate = new Date(remindLater);
      if (remindDate > new Date()) {
        setIsVisible(false);
      }
    }
  }, []);

  if (!isVisible || !update) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 ${className}`}
    >
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {update.isRequired ? (
              <AlertCircle className="h-6 w-6 text-red-500" />
            ) : (
              <CheckCircle className="h-6 w-6 text-green-500" />
            )}
            <CardTitle className="text-lg">
              {update.isRequired ? "Update Required" : "Update Available"}
            </CardTitle>
          </div>

          <Badge variant={update.isRequired ? "destructive" : "default"}>
            Version {update.version}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">What's New:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {update.releaseNotes.map((note, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Download size: {update.size}</p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleUpdate} className="flex-1" size="lg">
              <Download className="h-4 w-4 mr-2" />
              Update Now
            </Button>

            {!update.isRequired && (
              <Button variant="outline" onClick={handleLater} size="lg">
                Later
              </Button>
            )}
          </div>

          {!update.isRequired && (
            <Button
              variant="ghost"
              onClick={handleDismiss}
              className="w-full"
              size="sm"
            >
              <X className="h-4 w-4 mr-2" />
              Don't show again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdatePrompt;
