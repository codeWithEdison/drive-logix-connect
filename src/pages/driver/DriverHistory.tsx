import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatsCard } from "@/components/ui/StatsCard";
import { DeliveryDetailModal } from "@/components/ui/DeliveryDetailModal";
import { useDriverAssignments } from "@/lib/api/hooks";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { customToast } from "@/lib/utils/toast";
import { mapDeliveryAssignmentsToCargoDetails } from "@/lib/utils/cargoMapper";
import {
  Package,
  Search,
  Filter,
  Eye,
  Star,
  MapPin,
  Clock,
  CheckCircle,
  TrendingUp,
  Calendar,
  Award,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

const DriverHistory = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // API hooks
  const {
    data: assignmentsData,
    isLoading,
    error,
    refetch,
  } = useDriverAssignments({ status: "delivered", limit: 100 });

  // Transform API data to match the expected format
  const driverHistory = mapDeliveryAssignmentsToCargoDetails(
    assignmentsData?.data || []
  );

  const handleViewDetails = (delivery: any) => {
    setSelectedDelivery(delivery);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDelivery(null);
  };

  const handleRefresh = () => {
    refetch();
  };

  // Filter and sort data
  const filteredData = driverHistory
    .filter((delivery) => {
      const matchesSearch =
        delivery.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.to.toLowerCase().includes(searchTerm.toLowerCase());

      // Since we don't have rating in CargoDetail, we'll show all items for rating filter
      const matchesRating = ratingFilter === "all";

      return matchesSearch && matchesRating;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.assignedDate || "").getTime() -
            new Date(a.assignedDate || "").getTime()
          );
        case "oldest":
          return (
            new Date(a.assignedDate || "").getTime() -
            new Date(b.assignedDate || "").getTime()
          );
        case "rating-high":
          return 0; // No rating data available
        case "rating-low":
          return 0; // No rating data available
        default:
          return 0;
      }
    });

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>

        {/* Stats Card Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card
              key={i}
              className="bg-white shadow-lg rounded-2xl overflow-hidden"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content Skeleton */}
        <Card className="card-elevated">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-heading">
              {t("navigation.deliveryHistory")}
            </h1>
            <p className="text-muted-foreground">
              {t("navigation.deliveryHistory")} {t("dashboard.subtitle")}
            </p>
          </div>
        </div>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <h3 className="font-semibold text-red-800">
                  {t("common.error")}
                </h3>
                <p className="text-red-600 text-sm mt-1">
                  {error.message || t("dashboard.loadError")}
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
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-heading">
            {t("navigation.deliveryHistory")}
          </h1>
          <p className="text-muted-foreground">
            {t("navigation.deliveryHistory")} {t("dashboard.subtitle")}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          {t("common.refresh")}
        </Button>
      </div>

      {/* Stats Cards - Individual components */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title={t("driver.totalDeliveries")}
          value={driverHistory.length.toString()}
          description={t("common.fromLastMonth")}
          icon={Package}
          iconColor="text-blue-600"
        />
        <StatsCard
          title={t("driver.averageRating")}
          value="4.5"
          description={t("common.outOf") + " 5"}
          icon={Star}
          iconColor="text-yellow-600"
        />
        <StatsCard
          title={t("driver.completionRate")}
          value="100%"
          description={t("status.allDelivered")}
          icon={CheckCircle}
          iconColor="text-green-600"
        />
        <StatsCard
          title={t("driver.onTimeDeliveries")}
          value={driverHistory.length.toString()}
          description={t("common.fromLastMonth")}
          icon={Clock}
          iconColor="text-purple-600"
        />
      </div>

      {/* Filters and Search */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>
            {t("common.filter")} & {t("common.search")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={
                    t("common.search") +
                    " " +
                    t("navigation.deliveryHistory") +
                    "..."
                  }
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue
                  placeholder={
                    t("common.filter") +
                    " " +
                    t("common.by") +
                    " " +
                    t("common.rating")
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("common.all")} {t("common.ratings")}
                </SelectItem>
                <SelectItem value="5">5 {t("common.stars")}</SelectItem>
                <SelectItem value="4">4+ {t("common.stars")}</SelectItem>
                <SelectItem value="3">3+ {t("common.stars")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue
                  placeholder={t("common.sort") + " " + t("common.by")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">
                  {t("common.newest")} {t("common.first")}
                </SelectItem>
                <SelectItem value="oldest">
                  {t("common.oldest")} {t("common.first")}
                </SelectItem>
                <SelectItem value="rating-high">
                  {t("common.rating")}: {t("common.high")} {t("common.to")}{" "}
                  {t("common.low")}
                </SelectItem>
                <SelectItem value="rating-low">
                  {t("common.rating")}: {t("common.low")} {t("common.to")}{" "}
                  {t("common.high")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Delivery History - Table for large screens, Cards for small screens */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-foreground font-heading">
          {t("status.completed")} {t("navigation.deliveries")}
        </h2>

        {/* Table View - Large Screens */}
        <div className="hidden lg:block">
          <Card className="card-elevated">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>{t("navigation.deliveryHistory")} ID</TableHead>
                  <TableHead>{t("common.client")}</TableHead>
                  <TableHead>{t("common.route")}</TableHead>
                  <TableHead>{t("common.type")}</TableHead>
                  <TableHead>{t("common.weight")}</TableHead>
                  <TableHead>{t("common.rating")}</TableHead>
                  <TableHead>
                    {t("common.date")} & {t("common.time")}
                  </TableHead>
                  <TableHead className="w-24">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((delivery, index) => (
                  <TableRow
                    key={delivery.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleViewDetails(delivery)}
                  >
                    <TableCell className="font-medium text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium">{delivery.id}</TableCell>
                    <TableCell>{delivery.client}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="text-muted-foreground">
                            {t("tracking.from")}:
                          </span>{" "}
                          {delivery.from}
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">
                            {t("tracking.to")}:
                          </span>{" "}
                          {delivery.to}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{delivery.type}</TableCell>
                    <TableCell>{delivery.weight}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span>4.5/5</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{delivery.assignedDate}</div>
                        <div className="text-muted-foreground">
                          {delivery.pickupTime || "N/A"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(delivery);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {t("common.view")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Card View - Small Screens */}
        <div className="lg:hidden space-y-4">
          {filteredData.map((delivery, index) => (
            <Card
              key={delivery.id}
              className="card-elevated group hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => handleViewDetails(delivery)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-primary/10 text-primary text-sm font-medium rounded-full">
                      {index + 1}
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      <span className="font-semibold">{delivery.id}</span>
                    </div>
                  </div>
                  <Badge className="bg-success/10 text-success border-success/20">
                    {t("status.delivered")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {t("tracking.from")}:
                    </span>
                    <span className="font-medium truncate">
                      {delivery.from}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {t("tracking.to")}:
                    </span>
                    <span className="font-medium truncate">{delivery.to}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      {t("common.client")}:
                    </span>
                    <p className="font-medium">{delivery.client}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t("common.type")}:
                    </span>
                    <p className="font-medium">{delivery.type}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t("common.weight")}:
                    </span>
                    <p className="font-medium">{delivery.weight}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t("common.rating")}:
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-medium">4.5/5</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {delivery.assignedDate} • {delivery.pickupTime || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-12 sm:h-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(delivery);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {t("common.view")} {t("common.details")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center space-x-2 pt-4">
        <Button variant="outline" size="sm" disabled>
          {t("common.previous")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-primary text-primary-foreground"
        >
          1
        </Button>
        <Button variant="outline" size="sm">
          2
        </Button>
        <Button variant="outline" size="sm">
          3
        </Button>
        <Button variant="outline" size="sm">
          {t("common.next")}
        </Button>
      </div>

      {/* Detail Modal */}
      <DeliveryDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        delivery={selectedDelivery}
      />
    </div>
  );
};

export default DriverHistory;
