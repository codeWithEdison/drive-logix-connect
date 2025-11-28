import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Package,
  MapPin,
  Clock,
  Star,
  Eye,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useClientCargos } from "@/lib/api/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  CargoDetailModal,
  CargoDetail,
} from "@/components/ui/CargoDetailModal";

// Mock historical cargo data
const historicalCargos = [
  {
    id: "CRG-001",
    date: "2024-01-15",
    from: "Kigali",
    to: "Butare",
    type: "Electronics",
    weight: "45kg",
    status: "delivered",
    driver: "Jean Baptiste",
    rating: 4.8,
    cost: "$120",
  },
  {
    id: "CRG-002",
    date: "2024-01-10",
    from: "Kigali",
    to: "Musanze",
    type: "Furniture",
    weight: "120kg",
    status: "delivered",
    driver: "Marie Claire",
    rating: 5.0,
    cost: "$250",
  },
  {
    id: "CRG-003",
    date: "2024-01-05",
    from: "Kigali",
    to: "Rubavu",
    type: "Documents",
    weight: "2kg",
    status: "cancelled",
    driver: "-",
    rating: 0,
    cost: "$25",
  },
];

export default function History() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  // State for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");

  // State for modal
  const [selectedCargo, setSelectedCargo] = useState<CargoDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // API hooks
  const { data: cargosData, isLoading, error, refetch } = useClientCargos();

  const handleRefresh = () => {
    refetch();
  };

  const handleViewDetails = (cargo: any) => {
    // Transform API cargo to CargoDetail format
    const cargoDetail: CargoDetail = {
      id: cargo.id,
      status:
        cargo.status === "delivered"
          ? "delivered"
          : cargo.status === "cancelled"
          ? "cancelled"
          : cargo.status === "in_transit"
          ? "transit"
          : cargo.status === "pending"
          ? "pending"
          : "active",
      from: cargo.pickup_address || "Unknown Location",
      to: cargo.destination_address || "Unknown Location",
      driver: (cargo as any).delivery_assignment?.driver?.user?.full_name || "",
      phone: (cargo as any).delivery_assignment?.driver?.emergency_phone || "",
      weight: `${cargo.weight_kg || 0} kg`,
      type: cargo.type || "Unknown Type",
      cost: parseFloat(String(cargo.estimated_cost || cargo.final_cost || "0")),
      pickupDate: cargo.pickup_date ? cargo.pickup_date.split("T")[0] : "",
      deliveryDate: cargo.delivery_date
        ? cargo.delivery_date.split("T")[0]
        : "",
      description: cargo.special_requirements || "",
      specialInstructions: cargo.special_requirements || "",
      vehicleType: (cargo as any).delivery_assignment?.vehicle
        ? `${(cargo as any).delivery_assignment.vehicle.make} ${
            (cargo as any).delivery_assignment.vehicle.model
          }`
        : "Unknown Vehicle",
      distance: cargo.distance_km ? `${cargo.distance_km} km` : "Unknown",
      pickupContact: cargo.pickup_contact || "",
      pickupContactPhone: cargo.pickup_phone || "",
      deliveryContact: cargo.destination_contact || "",
      deliveryContactPhone: cargo.destination_phone || "",
      createdDate: cargo.created_at?.split("T")[0] || "",
    };

    setSelectedCargo(cargoDetail);
    setIsModalOpen(true);
  };

  const handleReorder = (cargoId: string) => {
    // Navigate to create cargo with pre-filled data
    navigate("/create-cargo");
    toast.info(t("history.reorderInfo"));
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-success text-success-foreground";
      case "cancelled":
        return "bg-destructive text-destructive-foreground";
      case "in_transit":
        return "bg-info text-info-foreground";
      case "pending":
        return "bg-warning text-warning-foreground";
      case "active":
        return "bg-primary text-primary-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  // Filter cargos based on search and filters
  const filteredCargos =
    (cargosData?.cargos || [])?.filter((cargo: any) => {
      const matchesSearch =
        searchQuery === "" ||
        cargo.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cargo.pickup_address
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        cargo.destination_address
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || cargo.status.toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    }) || [];

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t("history.title")}
          </h1>
          <p className="text-muted-foreground">{t("history.subtitle")}</p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <h3 className="font-semibold text-red-800">
                {t("common.error")}
              </h3>
              <p className="text-red-600 text-sm mt-1">
                {error.message || t("history.loadError")}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="mt-2"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {t("common.retry")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t("history.title")}
          </h1>
          <p className="text-muted-foreground">{t("history.subtitle")}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          {t("common.refresh")}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t("history.filterHistory")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder={t("history.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t("history.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("history.allStatus")}</SelectItem>
                <SelectItem value="delivered">
                  {t("history.delivered")}
                </SelectItem>
                <SelectItem value="cancelled">
                  {t("history.cancelled")}
                </SelectItem>
                <SelectItem value="pending">{t("history.pending")}</SelectItem>
                <SelectItem value="active">{t("history.active")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder={t("history.dateRange")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("history.allTime")}</SelectItem>
                <SelectItem value="last_month">
                  {t("history.lastMonth")}
                </SelectItem>
                <SelectItem value="last_3_months">
                  {t("history.last3Months")}
                </SelectItem>
                <SelectItem value="last_year">
                  {t("history.lastYear")}
                </SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              {t("history.customDate")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      <div className="space-y-4">
        {filteredCargos.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                {t("history.noCargos")}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all"
                  ? t("history.noCargosFiltered")
                  : t("history.noCargosDescription")}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredCargos.map((cargo: any) => (
            <Card key={cargo.id} className="card-elevated">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary" />
                        <span className="font-semibold">{cargo.id}</span>
                      </div>
                      <Badge className={getStatusColor(cargo.status)}>
                        {t(`history.status.${cargo.status.toLowerCase()}`)}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(cargo.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          <span className="font-medium">
                            {cargo.pickup_address ||
                              t("history.unknownLocation")}
                          </span>{" "}
                          →{" "}
                          <span className="font-medium">
                            {cargo.destination_address ||
                              t("history.unknownLocation")}
                          </span>
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">
                          {t("history.type")}:
                        </span>{" "}
                        {cargo.type || t("history.unknownType")}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">
                          {t("history.weight")}:
                        </span>{" "}
                        {cargo.weight_kg}kg
                      </div>
                    </div>

                    {cargo.status.toLowerCase() === "delivered" && (
                      <div className="flex items-center gap-4 pt-2 border-t">
                        <div className="text-sm">
                          <span className="text-muted-foreground">
                            {t("history.driver")}:
                          </span>{" "}
                          {cargo.driver_id
                            ? t("history.driverAssigned")
                            : t("history.noDriverAssigned")}
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">
                            {t("history.cost")}:
                          </span>{" "}
                          <span className="font-semibold">
                            RWF{" "}
                            {(
                              cargo.final_cost ||
                              cargo.estimated_cost ||
                              0
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(cargo)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {t("history.details")}
                    </Button>
                    {cargo.status.toLowerCase() === "delivered" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReorder(cargo.id)}
                      >
                        {t("history.reorder")}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Cargo Detail Modal */}
      <CargoDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        cargo={selectedCargo}
        onCallDriver={(phone) => {
          console.log("Calling driver:", phone);
          window.open(`tel:${phone}`, "_self");
        }}
        onUploadPhoto={(cargoId) => {
          console.log("Uploading photo for cargo:", cargoId);
          toast.info(t("history.uploadPhoto"));
        }}
        onReportIssue={(cargoId) => {
          console.log("Reporting issue for cargo:", cargoId);
          toast.info(t("history.reportIssue"));
        }}
      />
    </div>
  );
}
