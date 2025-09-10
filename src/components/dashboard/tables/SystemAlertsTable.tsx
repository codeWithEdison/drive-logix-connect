import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  Eye,
  AlertCircle,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { customToast } from "@/lib/utils/toast";

interface SystemAlert {
  id: string;
  type: string;
  message: string;
  severity: string;
  created_at: string;
  is_resolved: boolean;
  resolved_at?: string;
}

interface SystemAlertsTableProps {
  className?: string;
  onViewAll?: () => void;
  data?: SystemAlert[];
  isLoading?: boolean;
  error?: any;
  limit?: number;
}

export function SystemAlertsTable({
  className,
  onViewAll,
  data = [],
  isLoading = false,
  error = null,
  limit,
}: SystemAlertsTableProps) {
  const { t } = useLanguage();

  const alerts = limit ? (data || []).slice(0, limit) : data || [];
  const getAlertIcon = (type: string) => {
    switch (type) {
      case "urgent":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-orange-100 text-orange-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleResolve = (id: string) => {
    console.log(`Resolving alert: ${id}`);
    // API call to resolve alert
    customToast.success(t("tables.alertResolved"));
  };

  const handleDismiss = (id: string) => {
    console.log(`Dismissing alert: ${id}`);
    // API call to dismiss alert
    customToast.success(t("tables.alertDismissed"));
  };

  const handleView = (id: string) => {
    console.log(`Viewing alert: ${id}`);
    // Navigate to alert details page
    window.location.href = `/admin/alerts/${id}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <Card
        className={`bg-white/80 backdrop-blur-sm border-red-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden ${className}`}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pt-6 px-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              {t("tables.systemAlerts")}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card
        className={`bg-white/80 backdrop-blur-sm border-red-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden ${className}`}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pt-6 px-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              {t("tables.systemAlerts")}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-600">{t("tables.loadError")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`bg-white/80 backdrop-blur-sm border-red-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden ${className}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pt-6 px-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <CardTitle className="text-lg font-semibold text-gray-900">
            {t("tables.systemAlerts")}
          </CardTitle>
        </div>
        <Button variant="outline" size="sm" onClick={onViewAll}>
          {t("common.viewAll")}
        </Button>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-900 text-xs whitespace-nowrap">
                  #
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs whitespace-nowrap">
                  {t("tables.type")}
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs whitespace-nowrap">
                  {t("tables.message")}
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs whitespace-nowrap">
                  {t("tables.severity")}
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs whitespace-nowrap">
                  {t("tables.status")}
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs whitespace-nowrap">
                  {t("tables.createdAt")}
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs whitespace-nowrap">
                  {t("tables.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-gray-500"
                  >
                    {t("tables.noAlerts")}
                  </TableCell>
                </TableRow>
              ) : (
                alerts.map((alert: any, index: number) => (
                  <TableRow
                    key={alert.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="font-medium text-gray-900 text-xs whitespace-nowrap">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getAlertIcon(alert.alert_type || alert.type)}
                        <span className="capitalize text-xs font-medium">
                          {alert.alert_type || alert.type}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700 text-xs max-w-xs truncate">
                      {alert.message || alert.description}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${getPriorityColor(
                          alert.priority || alert.severity
                        )} text-xs px-2 py-1`}
                      >
                        {alert.priority || alert.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${getStatusColor(
                          alert.is_resolved ? "resolved" : "active"
                        )} text-xs px-2 py-1`}
                      >
                        {alert.is_resolved ? "Resolved" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600 text-xs whitespace-nowrap">
                      {alert.created_at
                        ? new Date(alert.created_at).toLocaleDateString()
                        : alert.time || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(alert.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        {!alert.is_resolved && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResolve(alert.id)}
                              className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDismiss(alert.id)}
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
