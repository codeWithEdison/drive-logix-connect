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
  MapPin,
  Phone,
  Clock,
  Weight,
  Truck,
  Calendar,
  User,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useDriverAssignments } from "@/lib/api/hooks";
import { CargoStatus } from "@/types/shared";

export default function DriverAssignedCargos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const { t } = useLanguage();

  const { data: assignments, isLoading, error } = useDriverAssignments({
    status: statusFilter === "all" ? undefined : statusFilter,
    page,
    limit: 10
  });

  const getStatusBadge = (status: CargoStatus | undefined) => {
    const statusConfig = {
      [CargoStatus.PENDING]: { label: t("status.pending"), color: "bg-yellow-100 text-yellow-600" },
      [CargoStatus.ACCEPTED]: { label: t("status.accepted"), color: "bg-blue-100 text-blue-600" },
      [CargoStatus.ASSIGNED]: { label: t("status.assigned"), color: "bg-purple-100 text-purple-600" },
      [CargoStatus.PICKED_UP]: { label: t("status.pickedUp"), color: "bg-orange-100 text-orange-600" },
      [CargoStatus.IN_TRANSIT]: { label: t("status.inTransit"), color: "bg-green-100 text-green-600" },
      [CargoStatus.DELIVERED]: { label: t("status.delivered"), color: "bg-green-200 text-green-700" },
      [CargoStatus.CANCELLED]: { label: t("status.cancelled"), color: "bg-red-100 text-red-600" },
    };

    const config = statusConfig[status || CargoStatus.PENDING];
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const filteredAssignments = assignments?.data?.filter(assignment =>
    assignment.cargo?.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.cargo?.client?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.cargo?.destination_address?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
          <h1 className="text-3xl font-bold text-foreground">{t("navigation.assignedCargos")}</h1>
          <p className="text-muted-foreground">
            {t("dashboard.totalCargos")}: {assignments?.pagination?.total || 0}
          </p>
        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <SelectItem value={CargoStatus.ASSIGNED}>{t("status.assigned")}</SelectItem>
                <SelectItem value={CargoStatus.PICKED_UP}>{t("status.pickedUp")}</SelectItem>
                <SelectItem value={CargoStatus.IN_TRANSIT}>{t("status.inTransit")}</SelectItem>
                <SelectItem value={CargoStatus.DELIVERED}>{t("status.delivered")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cargo List */}
      <div className="grid gap-6">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map((assignment) => (
            <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Cargo Info */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Package className="h-5 w-5 text-primary" />
                          {assignment.cargo?.id}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <User className="h-4 w-4" />
                          {assignment.cargo?.client?.full_name}
                        </p>
                      </div>
                      {getStatusBadge(assignment.cargo?.status)}
                    </div>

                    <div className="space-y-3">
                      {/* Route */}
                      <div className="space-y-2">
                        <div className="flex items-start gap-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground font-medium">
                              {t("cargo.pickupAddress").toUpperCase()}
                            </p>
                            <p className="text-sm font-medium">{assignment.cargo?.pickup_address}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 pl-6">
                          <div className="w-px h-4 bg-border"></div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full mt-1.5"></div>
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground font-medium">
                              {t("cargo.destinationAddress").toUpperCase()}
                            </p>
                            <p className="text-sm font-medium">{assignment.cargo?.destination_address}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cargo Details */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase">
                      {t("cargo.cargoDetails")}
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Weight className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          <span className="font-medium">{assignment.cargo?.weight_kg}</span> kg
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{assignment.cargo?.type || t("common.notSpecified")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(assignment.assigned_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase">
                      {t("dashboard.quickActions")}
                    </h4>
                    <div className="space-y-2">
                      <Button 
                        size="sm" 
                        className="w-full justify-start"
                        disabled={assignment.cargo?.status === CargoStatus.DELIVERED}
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        {assignment.cargo?.status === CargoStatus.ASSIGNED ? 
                          t("delivery.startDelivery") : 
                          t("tracking.currentLocation")
                        }
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Phone className="h-4 w-4 mr-2" />
                        {t("client.contactPerson")}
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Eye className="h-4 w-4 mr-2" />
                        {t("cargo.cargoDetails")}
                      </Button>
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
                  {t("cargo.noCargosFound")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || statusFilter !== "all" 
                    ? t("cargo.adjustFilters")
                    : t("cargo.noAssignedCargos")
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