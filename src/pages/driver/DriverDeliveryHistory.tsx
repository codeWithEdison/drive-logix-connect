import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  Search,
  Filter,
  Calendar,
  Star,
  CheckCircle,
  XCircle,
  Download,
  Eye,
  MapPin,
  Clock,
  User,
  AlertCircle
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useDriverAssignments } from "@/lib/api/hooks";
import { CargoStatus } from "@/types/shared";

export default function DriverDeliveryHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const { t } = useLanguage();

  const { data: assignments, isLoading, error } = useDriverAssignments({
    status: statusFilter === "all" ? undefined : statusFilter,
    page,
    limit: 10
  });

  // Filter completed deliveries
  const completedDeliveries = assignments?.data?.filter(
    assignment => assignment.cargo?.status === CargoStatus.DELIVERED || 
                 assignment.cargo?.status === CargoStatus.CANCELLED
  ) || [];

  const getStatusBadge = (status: CargoStatus | undefined) => {
    const statusConfig = {
      [CargoStatus.DELIVERED]: { 
        label: t("status.delivered"), 
        color: "bg-green-100 text-green-600",
        icon: CheckCircle
      },
      [CargoStatus.CANCELLED]: { 
        label: t("status.cancelled"), 
        color: "bg-red-100 text-red-600",
        icon: XCircle
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    const IconComponent = config.icon;
    return (
      <Badge className={config.color}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getRatingStars = (rating: number = 0) => (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      ))}
      <span className="text-sm text-muted-foreground ml-2">({rating}/5)</span>
    </div>
  );

  const filteredDeliveries = completedDeliveries.filter(assignment => {
    const searchMatch = 
      assignment.cargo?.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.cargo?.client?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.cargo?.destination_address?.toLowerCase().includes(searchTerm.toLowerCase());

    const statusMatch = statusFilter === "all" || assignment.cargo?.status === statusFilter;

    return searchMatch && statusMatch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-semibold text-red-600">{t("common.error")}</p>
          <p className="text-sm text-muted-foreground">{t("errors.networkError")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("navigation.deliveryHistory")}</h1>
          <p className="text-muted-foreground">
            {filteredDeliveries.length} {t("status.completed").toLowerCase()} {t("navigation.deliveries").toLowerCase()}
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          {t("common.export")}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t("common.filter")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t("common.search")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t("cargo.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                <SelectItem value={CargoStatus.DELIVERED}>{t("status.delivered")}</SelectItem>
                <SelectItem value={CargoStatus.CANCELLED}>{t("status.cancelled")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t("common.date")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                <SelectItem value="today">{t("common.today")}</SelectItem>
                <SelectItem value="week">{t("common.thisWeek")}</SelectItem>
                <SelectItem value="month">{t("common.thisMonth")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Delivery History List */}
      <div className="grid gap-4">
        {filteredDeliveries.length > 0 ? (
          filteredDeliveries.map((assignment) => (
            <Card key={assignment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
                  {/* Cargo Info */}
                  <div className="lg:col-span-2 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          <Package className="h-4 w-4 text-primary" />
                          {assignment.cargo?.id}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {assignment.cargo?.client?.full_name}
                        </p>
                      </div>
                      {getStatusBadge(assignment.cargo?.status)}
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <p className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {assignment.cargo?.destination_address}
                      </p>
                      <p className="flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(assignment.assigned_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Delivery Details */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">{t("delivery.deliveryDetails")}</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>{t("cargo.weight")}: {assignment.cargo?.weight_kg} kg</p>
                      <p>{t("cargo.cargoType")}: {assignment.cargo?.type || t("common.notSpecified")}</p>
                      <p className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(assignment.assigned_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">{t("delivery.rating")}</h4>
                    {assignment.cargo?.status === CargoStatus.DELIVERED ? (
                      getRatingStars(4) // Mock rating, replace with actual rating from API
                    ) : (
                      <p className="text-sm text-muted-foreground">—</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Eye className="h-4 w-4 mr-2" />
                        {t("common.viewDetails")}
                      </Button>
                      {assignment.cargo?.status === CargoStatus.DELIVERED && (
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Download className="h-4 w-4 mr-2" />
                          {t("common.downloadProof")}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  {t("delivery.noDeliveryHistory")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || statusFilter !== "all" 
                    ? t("cargo.adjustFilters")
                    : t("delivery.startCompleting")
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {assignments?.pagination && assignments.pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            {t("common.previous")}
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            {t("common.page")} {page} {t("common.of")} {assignments.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(Math.min(assignments.pagination.totalPages, page + 1))}
            disabled={page === assignments.pagination.totalPages}
          >
            {t("common.next")}
          </Button>
        </div>
      )}
    </div>
  );
}