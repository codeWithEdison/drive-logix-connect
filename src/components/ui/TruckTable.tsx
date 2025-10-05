import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Gauge,
  Package,
  User,
  Truck,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export interface Truck {
  id: string;
  model: string;
  licensePlate: string;
  capacity: string;
  status:
    | "active"
    | "maintenance"
    | "inactive"
    | "available"
    | "in_use"
    | "out_of_service";
  driver: string;
  location: string;
  lastMaintenance: string;
  totalDeliveries: number;
  fuelLevel: number;
  year: string;
  manufacturer: string;
  engineType: string;
  mileage: number;
  insuranceExpiry: string;
  registrationExpiry: string;
  is_active: boolean;
  color?: string;
  fuelEfficiency?: string | number;
  capacityVolume?: number;
  nextMaintenance?: string;
  vehicleType?: string;
  branchId?: string;
  branchName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TruckTableProps {
  trucks: Truck[];
  title?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  showPagination?: boolean;
  itemsPerPage?: number;
  onViewDetails?: (truck: Truck) => void;
  onEditTruck?: (truck: Truck) => void;
  onDeleteTruck?: (truckId: string) => void;
  onTrackTruck?: (truckId: string) => void;
  onAssignDriver?: (truckId: string) => void;
  onScheduleMaintenance?: (truckId: string) => void;
  customActions?: React.ReactNode;
}

export function TruckTable({
  trucks,
  title = "",
  showSearch = true,
  showFilters = true,
  showPagination = true,
  itemsPerPage = 10,
  onViewDetails,
  onEditTruck,
  onDeleteTruck,
  onTrackTruck,
  onAssignDriver,
  onScheduleMaintenance,
  customActions,
}: TruckTableProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "maintenance" | "inactive"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredTrucks = trucks.filter((truck) => {
    const matchesSearch =
      truck.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      truck.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      truck.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      truck.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (truck.vehicleType &&
        truck.vehicleType.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (truck.color &&
        truck.color.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (truck.branchName &&
        truck.branchName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || truck.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredTrucks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTrucks = filteredTrucks.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-600">
            {t("status.active")}
          </Badge>
        );
      case "maintenance":
        return (
          <Badge className="bg-yellow-100 text-yellow-600">
            {t("status.maintenance")}
          </Badge>
        );
      case "inactive":
        return <Badge className="bg-red-100 text-red-600">Inactive</Badge>;
      default:
        return (
          <Badge className="bg-gray-100 text-gray-600 capitalize">
            {status}
          </Badge>
        );
    }
  };

  const getFuelLevelBadge = (fuelLevel: number) => {
    if (fuelLevel > 70) {
      return (
        <Badge className="bg-green-100 text-green-600">{fuelLevel}%</Badge>
      );
    } else if (fuelLevel > 30) {
      return (
        <Badge className="bg-yellow-100 text-yellow-600">{fuelLevel}%</Badge>
      );
    } else {
      return <Badge className="bg-red-100 text-red-600">{fuelLevel}%</Badge>;
    }
  };

  const handleRowClick = (truck: Truck) => {
    if (onViewDetails) {
      onViewDetails(truck);
    }
  };

  const getActions = (truck: Truck) => {
    const actions = [];

    if (onViewDetails) {
      actions.push({
        key: "view",
        label: t("actions.viewDetails"),
        icon: <Eye className="h-3 w-3 mr-1" />,
        onClick: () => onViewDetails(truck),
        variant: "outline" as const,
      });
    }

    if (onEditTruck) {
      actions.push({
        key: "edit",
        label: t("actions.edit"),
        icon: <Edit className="h-3 w-3 mr-1" />,
        onClick: () => onEditTruck(truck),
        variant: "outline" as const,
      });
    }

    if (onTrackTruck) {
      actions.push({
        key: "track",
        label: t("actions.track"),
        icon: <MapPin className="h-3 w-3 mr-1" />,
        onClick: () => onTrackTruck(truck.id),
        variant: "outline" as const,
      });
    }

    if (onAssignDriver) {
      actions.push({
        key: "assign",
        label: t("actions.assignDriver"),
        icon: <User className="h-3 w-3 mr-1" />,
        onClick: () => onAssignDriver(truck.id),
        variant: "outline" as const,
      });
    }

    if (onScheduleMaintenance) {
      actions.push({
        key: "maintenance",
        label: t("actions.scheduleMaintenance"),
        icon: <Gauge className="h-3 w-3 mr-1" />,
        onClick: () => onScheduleMaintenance(truck.id),
        variant: "outline" as const,
      });
    }

    if (onDeleteTruck) {
      actions.push({
        key: "delete",
        label: t("actions.delete"),
        icon: <Trash2 className="h-3 w-3 mr-1" />,
        onClick: () => onDeleteTruck(truck.id),
        variant: "outline" as const,
        className: "text-red-600",
      });
    }

    return actions;
  };

  const renderActions = (truck: Truck) => {
    const actions = getActions(truck);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {actions.map((action) => (
            <DropdownMenuItem
              key={action.key}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
              }}
              className={action.className}
            >
              {action.icon}
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground">
            {t("adminTrucks.manageDescription")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-100 text-blue-600">
            {filteredTrucks.length} {t("adminTrucks.trucks")}
          </Badge>
          {customActions}
        </div>
      </div>

      {/* Filters and Search */}
      {(showSearch || showFilters) && (
        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {showSearch && (
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder={t("adminTrucks.searchPlaceholder")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              )}
              {showFilters && (
                <div className="flex gap-2">
                  <Select
                    value={statusFilter}
                    onValueChange={(value: any) => setStatusFilter(value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue
                        placeholder={t("adminTrucks.filterByStatus")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("common.all")}</SelectItem>
                      <SelectItem value="active">
                        {t("status.active")}
                      </SelectItem>
                      <SelectItem value="maintenance">
                        {t("status.maintenance")}
                      </SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trucks Table */}
      <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-gray-900">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-medium text-gray-600">
                    #
                  </TableHead>
                  <TableHead className="text-xs font-medium text-gray-600">
                    Vehicle
                  </TableHead>
                  <TableHead className="text-xs font-medium text-gray-600">
                    Type
                  </TableHead>
                  <TableHead className="text-xs font-medium text-gray-600">
                    Year
                  </TableHead>
                  <TableHead className="text-xs font-medium text-gray-600">
                    Capacity
                  </TableHead>
                  <TableHead className="text-xs font-medium text-gray-600">
                    Fuel Type
                  </TableHead>
                  <TableHead className="text-xs font-medium text-gray-600">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-medium text-gray-600">
                    Insurance
                  </TableHead>
                  <TableHead className="text-xs font-medium text-gray-600">
                    Registration
                  </TableHead>
                  <TableHead className="text-xs font-medium text-gray-600">
                    Branch
                  </TableHead>
                  <TableHead className="text-xs font-medium text-gray-600">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTrucks.map((truck, index) => (
                  <TableRow
                    key={truck.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleRowClick(truck)}
                  >
                    <TableCell>
                      <span className="text-sm font-medium text-gray-900">
                        {startIndex + index + 1}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {truck.manufacturer} {truck.model}
                        </p>
                        <p className="text-xs text-gray-500">
                          {truck.licensePlate}
                        </p>
                        <p className="text-xs text-gray-500">{truck.color}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {truck.vehicleType || "truck"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-900">
                        {truck.year}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {truck.capacity}
                        </p>
                        <p className="text-xs text-gray-500">
                          {truck.capacityVolume
                            ? `${truck.capacityVolume} m³`
                            : "N/A"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {truck.engineType}
                        </p>
                        <p className="text-xs text-gray-500">
                          {truck.fuelEfficiency
                            ? `${truck.fuelEfficiency} L/100km`
                            : "N/A"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(truck.status)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm text-gray-900">
                          {truck.insuranceExpiry}
                        </p>
                        <p className="text-xs text-gray-500">
                          {truck.insuranceExpiry &&
                          new Date(truck.insuranceExpiry) < new Date()
                            ? "Expired"
                            : "Valid"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm text-gray-900">
                          {truck.registrationExpiry}
                        </p>
                        <p className="text-xs text-gray-500">
                          {truck.registrationExpiry &&
                          new Date(truck.registrationExpiry) < new Date()
                            ? "Expired"
                            : "Valid"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {truck.branchName || "Unknown Branch"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{renderActions(truck)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
