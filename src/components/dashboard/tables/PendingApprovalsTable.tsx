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
import { Check, X, Eye, User, Truck, AlertCircle } from "lucide-react";
import { useApproveEntity } from "@/lib/api/hooks";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { customToast } from "@/lib/utils/toast";

interface PendingApproval {
  id: string;
  type: string;
  name: string;
  email: string;
  status: string;
  submitted_at: string;
  documents_count: number;
}

interface PendingApprovalsTableProps {
  className?: string;
  onViewAll?: () => void;
  data?: PendingApproval[];
  isLoading?: boolean;
  error?: any;
  limit?: number;
}

export function PendingApprovalsTable({
  className,
  onViewAll,
  data = [],
  isLoading = false,
  error = null,
  limit,
}: PendingApprovalsTableProps) {
  const { t } = useLanguage();

  const approveEntityMutation = useApproveEntity();
  const approvals = limit ? (data || []).slice(0, limit) : data || [];
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "driver":
        return <User className="h-4 w-4" />;
      case "client":
        return <User className="h-4 w-4" />;
      case "truck":
        return <Truck className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "driver":
        return "bg-blue-100 text-blue-800";
      case "client":
        return "bg-green-100 text-green-800";
      case "truck":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleApprove = async (id: string, type: string) => {
    try {
      await approveEntityMutation.mutateAsync({
        entity_type: type as "user" | "vehicle" | "driver",
        entity_id: id,
        approved: true,
        reason: "Approved by admin",
      });
      customToast.success(t("tables.approvedSuccessfully"));
    } catch (error) {
      customToast.error(t("tables.approvalFailed"));
    }
  };

  const handleReject = async (id: string, type: string) => {
    try {
      await approveEntityMutation.mutateAsync({
        entity_type: type as "user" | "vehicle" | "driver",
        entity_id: id,
        approved: false,
        reason: "Rejected by admin",
      });
      customToast.success(t("tables.rejectedSuccessfully"));
    } catch (error) {
      customToast.error(t("tables.rejectionFailed"));
    }
  };

  const handleReview = (id: string) => {
    console.log(`Reviewing: ${id}`);
    // Navigate to review page
    window.location.href = `/admin/approvals/${id}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <Card
        className={`bg-white/80 backdrop-blur-sm border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden ${className}`}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pt-6 px-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              {t("tables.pendingApprovals")}
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
        className={`bg-white/80 backdrop-blur-sm border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden ${className}`}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pt-6 px-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              {t("tables.pendingApprovals")}
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
      className={`bg-white/80 backdrop-blur-sm border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden ${className}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pt-6 px-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <CardTitle className="text-lg font-semibold text-gray-900">
            {t("tables.pendingApprovals")}
          </CardTitle>
        </div>
        <Button variant="outline" size="sm" onClick={onViewAll}>
          {t("common.viewAll")}
        </Button>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-900 text-xs">
                  {t("tables.type")}
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs">
                  {t("tables.name")}
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs">
                  {t("tables.submitted")}
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs">
                  {t("tables.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvals.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-gray-500"
                  >
                    {t("tables.noPendingApprovals")}
                  </TableCell>
                </TableRow>
              ) : (
                approvals.map((approval: any) => (
                  <TableRow
                    key={approval.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(approval.entity_type || approval.type)}
                        <Badge
                          className={`${getTypeColor(
                            approval.entity_type || approval.type
                          )} text-xs px-2 py-1`}
                        >
                          {approval.entity_type || approval.type}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-gray-900 text-xs">
                      {approval.name || approval.entity_name}
                    </TableCell>
                    <TableCell className="text-gray-600 text-xs">
                      {approval.submitted_at || approval.submitted}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReview(approval.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleApprove(
                              approval.id,
                              approval.entity_type || approval.type
                            )
                          }
                          className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                          disabled={approveEntityMutation.isPending}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleReject(
                              approval.id,
                              approval.entity_type || approval.type
                            )
                          }
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          disabled={approveEntityMutation.isPending}
                        >
                          <X className="h-3 w-3" />
                        </Button>
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
