# 📊 Dashboard Services & Hooks Integration Guide

This guide provides comprehensive documentation for integrating dashboard services and hooks into your Lovely Cargo Platform frontend.

## 🚀 Quick Start

### 1. Import Dashboard Hooks

```typescript
import {
  useDriverDashboard,
  useClientDashboard,
  useAdminDashboard,
  useSuperAdminDashboard,
  useRevenueChart,
  useDeliveryStatusChart,
  useFleetPerformanceChart,
  useGeographicChart,
  useDriverPerformanceChart,
  useUsageTrendsChart,
  useAdminPerformanceChart,
  useUsersDistributionChart,
  useRecentDeliveriesTable,
  usePendingApprovalsTable,
  useSystemAlertsTable,
  useFinancialTransactionsTable,
  useDashboardSystemHealth,
  useDashboardUpdateDriverStatus,
  useApplyDashboardFilters,
  useRefreshDashboard,
  usePreloadDashboard,
} from "@/lib/api/hooks";
```

### 2. Basic Usage

```typescript
// Driver Dashboard
const { data: driverData, isLoading, error } = useDriverDashboard();

// Admin Dashboard
const { data: adminData, isLoading, error } = useAdminDashboard();

// Charts
const { data: revenueData } = useRevenueChart({ period: "month" });
const { data: deliveryData } = useDeliveryStatusChart({ period: "week" });

// Tables
const { data: deliveriesData } = useRecentDeliveriesTable({ limit: 10 });
const { data: approvalsData } = usePendingApprovalsTable({ status: "pending" });
```

## 📋 Available Services

### Role-Specific Dashboard Services

| Service                    | Endpoint                     | Description                         |
| -------------------------- | ---------------------------- | ----------------------------------- |
| `getDriverDashboard()`     | `GET /dashboard/driver`      | Complete driver dashboard data      |
| `getClientDashboard()`     | `GET /dashboard/client`      | Complete client dashboard data      |
| `getAdminDashboard()`      | `GET /dashboard/admin`       | Complete admin dashboard data       |
| `getSuperAdminDashboard()` | `GET /dashboard/super-admin` | Complete super admin dashboard data |

### Chart Data Services

| Service                       | Endpoint                                   | Description                         |
| ----------------------------- | ------------------------------------------ | ----------------------------------- |
| `getRevenueChartData()`       | `GET /dashboard/charts/revenue`            | Revenue trends and analytics        |
| `getDeliveryStatusChart()`    | `GET /dashboard/charts/delivery-status`    | Delivery status distribution        |
| `getFleetPerformanceChart()`  | `GET /dashboard/charts/fleet-performance`  | Vehicle utilization and performance |
| `getGeographicChart()`        | `GET /dashboard/charts/geographic`         | Geographic distribution analytics   |
| `getDriverPerformanceChart()` | `GET /dashboard/charts/driver-performance` | Driver performance metrics          |
| `getUsageTrendsChart()`       | `GET /dashboard/charts/usage-trends`       | System usage trends                 |
| `getAdminPerformanceChart()`  | `GET /dashboard/charts/admin-performance`  | Admin activity metrics              |
| `getUsersDistributionChart()` | `GET /dashboard/charts/users-distribution` | User distribution analytics         |

### Table Data Services

| Service                           | Endpoint                                       | Description                     |
| --------------------------------- | ---------------------------------------------- | ------------------------------- |
| `getRecentDeliveriesTable()`      | `GET /dashboard/tables/recent-deliveries`      | Recent delivery records         |
| `getPendingApprovalsTable()`      | `GET /dashboard/tables/pending-approvals`      | Pending approval requests       |
| `getSystemAlertsTable()`          | `GET /dashboard/tables/system-alerts`          | System alerts and notifications |
| `getFinancialTransactionsTable()` | `GET /dashboard/tables/financial-transactions` | Financial transaction records   |

### System Services

| Service                   | Endpoint                         | Description                       |
| ------------------------- | -------------------------------- | --------------------------------- |
| `getSystemHealth()`       | `GET /dashboard/system-health`   | System health metrics             |
| `updateDriverStatus()`    | `PATCH /dashboard/driver/status` | Update driver availability status |
| `applyDashboardFilters()` | `POST /dashboard/filters`        | Apply dashboard filters           |

## 🎣 Available Hooks

### Dashboard Hooks

```typescript
// Role-specific dashboard hooks
const driverDashboard = useDriverDashboard();
const clientDashboard = useClientDashboard();
const adminDashboard = useAdminDashboard();
const superAdminDashboard = useSuperAdminDashboard();
```

### Chart Hooks

```typescript
// Chart data hooks with parameters
const revenueChart = useRevenueChart({ period: "month", role: "admin" });
const deliveryChart = useDeliveryStatusChart({ period: "week" });
const fleetChart = useFleetPerformanceChart({ vehicle_type: "truck" });
const geographicChart = useGeographicChart({ region: "rwanda" });
const driverChart = useDriverPerformanceChart({ driver_id: "uuid" });
const usageChart = useUsageTrendsChart({ period: "month" });
const adminChart = useAdminPerformanceChart({ admin_id: "uuid" });
const usersChart = useUsersDistributionChart({ role: "all" });
```

### Table Hooks

```typescript
// Table data hooks with parameters
const deliveriesTable = useRecentDeliveriesTable({ limit: 10, role: "admin" });
const approvalsTable = usePendingApprovalsTable({
  status: "pending",
  limit: 10,
});
const alertsTable = useSystemAlertsTable({
  severity: "high",
  is_resolved: false,
});
const transactionsTable = useFinancialTransactionsTable({
  period: "month",
  status: "completed",
});
```

### System Hooks

```typescript
// System health and status hooks
const systemHealth = useDashboardSystemHealth();
const updateDriverStatus = useDashboardUpdateDriverStatus();
const applyFilters = useApplyDashboardFilters();
```

### Utility Hooks

```typescript
// Utility hooks for dashboard management
const refreshDashboard = useRefreshDashboard();
const preloadDashboard = usePreloadDashboard();
const refreshSpecificDashboard = useRefreshSpecificDashboard();
```

## 📊 Data Structures

### Driver Dashboard Data

```typescript
interface DriverDashboardData {
  driver_info: {
    id: string;
    name: string;
    email: string;
    phone: string;
    rating: number;
    status: DriverStatus;
    license_number: string;
    license_expiry: string;
    total_deliveries: number;
    avatar_url?: string;
  };
  stats: {
    assigned_cargos: number;
    active_deliveries: number;
    completed_deliveries: number;
    rating: number;
    today_deliveries: number;
    weekly_deliveries: number;
    monthly_deliveries: number;
  };
  active_delivery?: {
    cargo_id: string;
    client_name: string;
    client_phone: string;
    pickup_address: string;
    delivery_address: string;
    pickup_time: string;
    estimated_delivery_time: string;
    cargo_type: string;
    weight: number;
    priority: CargoPriority;
    status: CargoStatus;
    route_distance_km: number;
    current_location?: {
      latitude: number;
      longitude: number;
    };
    progress_percentage: number;
  };
  assigned_cargos: Array<AssignedCargo>;
  recent_deliveries: Array<RecentDelivery>;
  performance: DriverPerformance;
  vehicle_info: VehicleInfo;
}
```

### Admin Dashboard Data

```typescript
interface AdminDashboardData {
  stats: {
    monthly_revenue: number;
    active_deliveries: number;
    available_drivers: number;
    total_drivers: number;
    success_rate: number;
    total_cargos: number;
    pending_approvals: number;
    system_alerts: number;
  };
  charts: {
    revenue_trends: RevenueChartData;
    delivery_status: DeliveryStatusChart;
    fleet_performance: FleetPerformanceChart;
    geographic_distribution: GeographicChart;
    driver_performance: DriverPerformanceChart;
  };
  tables: {
    recent_deliveries: RecentDeliveryTable[];
    pending_approvals: PendingApproval[];
    system_alerts: SystemAlert[];
    financial_transactions: FinancialTransaction[];
  };
  recent_activities: AdminActivity[];
}
```

## 🔧 Configuration Options

### Query Configuration

All dashboard hooks support React Query configuration:

```typescript
const dashboardData = useDriverDashboard({
  staleTime: 5 * 60 * 1000, // 5 minutes
  refetchInterval: 30 * 1000, // 30 seconds
  refetchOnWindowFocus: false,
  retry: 3,
});
```

### Chart Parameters

```typescript
// Revenue chart with filters
const revenueData = useRevenueChart({
  period: "month", // 'today' | 'week' | 'month' | 'quarter' | 'year'
  role: "admin", // 'driver' | 'client' | 'admin' | 'super-admin'
  start_date: "2024-01-01", // ISO date string
  end_date: "2024-01-31", // ISO date string
});

// Delivery status chart
const deliveryData = useDeliveryStatusChart({
  period: "week",
  start_date: "2024-01-01",
  end_date: "2024-01-31",
});

// Fleet performance chart
const fleetData = useFleetPerformanceChart({
  vehicle_type: "truck", // 'truck' | 'moto' | 'van' | 'pickup'
  period: "month",
});
```

### Table Parameters

```typescript
// Recent deliveries table
const deliveriesData = useRecentDeliveriesTable({
  limit: 10, // Number of records
  role: "admin", // User role filter
  status: "in_transit", // Cargo status filter
});

// Pending approvals table
const approvalsData = usePendingApprovalsTable({
  status: "pending", // 'pending' | 'approved' | 'rejected'
  role: "super-admin", // Admin role filter
  limit: 20,
});

// System alerts table
const alertsData = useSystemAlertsTable({
  severity: "high", // 'low' | 'medium' | 'high' | 'critical'
  is_resolved: false, // Boolean filter
  limit: 15,
});
```

## 🎨 UI Integration Examples

### StatsCard Integration

```typescript
import { StatsCard } from "@/components/ui/StatsCard";

function DriverDashboard() {
  const { data: driverData } = useDriverDashboard();

  const stats = [
    {
      title: "Assigned Cargo",
      value: driverData?.data.stats.assigned_cargos.toString() || "0",
      change: "+2",
      changeType: "increase",
      icon: Package,
      color: "orange",
    },
    {
      title: "Active Deliveries",
      value: driverData?.data.stats.active_deliveries.toString() || "0",
      change: "In Progress",
      changeType: "active",
      icon: Clock,
      color: "green",
    },
    // ... more stats
  ];

  return <StatsCard stats={stats} />;
}
```

### Chart Integration

```typescript
import { LineChart, BarChart, PieChart } from "recharts";

function RevenueChart() {
  const { data: revenueData } = useRevenueChart({ period: "month" });

  const chartData =
    revenueData?.data.daily_revenue.map((item) => ({
      date: item.date,
      revenue: item.revenue,
      deliveries: item.deliveries,
    })) || [];

  return (
    <LineChart width={400} height={300} data={chartData}>
      <XAxis dataKey="date" />
      <YAxis />
      <CartesianGrid strokeDasharray="3 3" />
      <Tooltip />
      <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
      <Line type="monotone" dataKey="deliveries" stroke="#82ca9d" />
    </LineChart>
  );
}
```

### Table Integration

```typescript
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function RecentDeliveriesTable() {
  const { data: deliveriesData } = useRecentDeliveriesTable({ limit: 10 });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cargo ID</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Driver</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deliveriesData?.data.map((delivery) => (
          <TableRow key={delivery.cargo_id}>
            <TableCell>{delivery.cargo_id}</TableCell>
            <TableCell>{delivery.client_name}</TableCell>
            <TableCell>{delivery.driver_name}</TableCell>
            <TableCell>
              <Badge
                variant={
                  delivery.status === "delivered" ? "success" : "warning"
                }
              >
                {delivery.status}
              </Badge>
            </TableCell>
            <TableCell>{delivery.created_at}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

## 🔄 Real-time Updates

### Automatic Refetching

```typescript
// Driver dashboard with real-time updates
const driverDashboard = useDriverDashboard(); // Refetches every 30 seconds

// System health with frequent updates
const systemHealth = useDashboardSystemHealth(); // Refetches every 30 seconds

// System alerts with real-time monitoring
const alerts = useSystemAlertsTable({
  severity: "high",
  is_resolved: false,
}); // Refetches every 30 seconds
```

### Manual Refresh

```typescript
function DashboardControls() {
  const refreshDashboard = useRefreshDashboard();
  const preloadDashboard = usePreloadDashboard();

  const handleRefresh = () => {
    refreshDashboard(); // Refreshes all dashboard data
  };

  const handlePreloadDriver = () => {
    preloadDashboard("driver"); // Preloads driver dashboard
  };

  return (
    <div className="flex gap-2">
      <Button onClick={handleRefresh}>Refresh All</Button>
      <Button onClick={handlePreloadDriver}>Preload Driver</Button>
    </div>
  );
}
```

## 🎯 Error Handling

### Error States

```typescript
function DashboardWithErrorHandling() {
  const { data, isLoading, error, refetch } = useDriverDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="w-8 h-8" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">Failed to load dashboard</span>
        </div>
        <p className="text-red-600 text-sm mt-1">{error.message}</p>
        <Button onClick={() => refetch()} className="mt-2" variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return <div>{/* Dashboard content */}</div>;
}
```

### Retry Configuration

```typescript
const dashboardData = useDriverDashboard({
  retry: 3, // Retry failed requests 3 times
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
  gcTime: 10 * 60 * 1000, // Keep data in cache for 10 minutes
});
```

## 🚀 Performance Optimization

### Preloading

```typescript
// Preload dashboard data when user navigates
function NavigationWithPreload() {
  const preloadDashboard = usePreloadDashboard();

  const handleNavigateToDriver = () => {
    preloadDashboard("driver");
    navigate("/driver/dashboard");
  };

  const handleNavigateToAdmin = () => {
    preloadDashboard("admin");
    navigate("/admin/dashboard");
  };

  return (
    <nav>
      <button onClick={handleNavigateToDriver}>Driver Dashboard</button>
      <button onClick={handleNavigateToAdmin}>Admin Dashboard</button>
    </nav>
  );
}
```

### Selective Refetching

```typescript
function SelectiveRefresh() {
  const refreshSpecificDashboard = useRefreshSpecificDashboard();

  const handleRefreshDriver = () => {
    refreshSpecificDashboard("driver"); // Only refreshes driver dashboard
  };

  const handleRefreshAdmin = () => {
    refreshSpecificDashboard("admin"); // Only refreshes admin dashboard
  };

  return (
    <div className="flex gap-2">
      <Button onClick={handleRefreshDriver}>Refresh Driver</Button>
      <Button onClick={handleRefreshAdmin}>Refresh Admin</Button>
    </div>
  );
}
```

## 📱 Mobile Responsiveness

### Responsive Charts

```typescript
function ResponsiveChart() {
  const { data: chartData } = useRevenueChart({ period: "month" });
  const [chartWidth, setChartWidth] = useState(400);

  useEffect(() => {
    const updateWidth = () => {
      setChartWidth(window.innerWidth < 768 ? 300 : 400);
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  return (
    <LineChart
      width={chartWidth}
      height={300}
      data={chartData?.data.daily_revenue}
    >
      {/* Chart configuration */}
    </LineChart>
  );
}
```

### Responsive Tables

```typescript
function ResponsiveTable() {
  const { data: tableData } = useRecentDeliveriesTable({ limit: 10 });

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="hidden md:table-cell">Cargo ID</TableHead>
            <TableHead>Client</TableHead>
            <TableHead className="hidden lg:table-cell">Driver</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableData?.data.map((delivery) => (
            <TableRow key={delivery.cargo_id}>
              <TableCell className="hidden md:table-cell">
                {delivery.cargo_id}
              </TableCell>
              <TableCell>{delivery.client_name}</TableCell>
              <TableCell className="hidden lg:table-cell">
                {delivery.driver_name}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{delivery.status}</Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {delivery.created_at}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

## 🔐 Security Considerations

### Role-based Access

```typescript
function ProtectedDashboard() {
  const { user } = useAuth();
  const { data: driverData } = useDriverDashboard();
  const { data: adminData } = useAdminDashboard();

  if (!user) {
    return <Navigate to="/login" />;
  }

  switch (user.role) {
    case "driver":
      return <DriverDashboard data={driverData} />;
    case "admin":
      return <AdminDashboard data={adminData} />;
    case "super_admin":
      return <SuperAdminDashboard data={adminData} />;
    default:
      return <ClientDashboard data={driverData} />;
  }
}
```

### Data Filtering

```typescript
function FilteredDashboard() {
  const { user } = useAuth();
  const { data: deliveriesData } = useRecentDeliveriesTable({
    role: user?.role, // Only show data relevant to user's role
    limit: 10,
  });

  return <div>{/* Filtered dashboard content */}</div>;
}
```

## 🧪 Testing

### Mock Data for Testing

```typescript
// Mock dashboard data for testing
const mockDriverDashboard = {
  data: {
    driver_info: {
      id: "driver-1",
      name: "John Doe",
      email: "john@example.com",
      rating: 4.8,
      status: "available",
    },
    stats: {
      assigned_cargos: 5,
      active_deliveries: 2,
      completed_deliveries: 156,
    },
    assigned_cargos: [
      {
        cargo_id: "cargo-1",
        client_name: "Client A",
        status: "active",
        priority: "urgent",
      },
    ],
  },
};

// Test component
function TestDriverDashboard() {
  const { data } = useDriverDashboard();

  // Use mock data in tests
  const dashboardData = data || mockDriverDashboard;

  return <DriverDashboard data={dashboardData} />;
}
```

## 📚 Additional Resources

- [React Query Documentation](https://tanstack.com/query/latest)
- [Chart.js Documentation](https://www.chartjs.org/docs/)
- [Recharts Documentation](https://recharts.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

When adding new dashboard features:

1. Add new service methods to `DashboardService`
2. Create corresponding hooks in `dashboardHooks.ts`
3. Update query keys in `queryClient.ts`
4. Add TypeScript interfaces to `shared.ts`
5. Update this documentation
6. Add tests for new functionality

## 📞 Support

For questions or issues with dashboard integration:

- Check the examples in `src/examples/dashboardIntegrationExamples.tsx`
- Review the service implementations in `src/lib/api/services/dashboardService.ts`
- Check the hook implementations in `src/lib/api/hooks/dashboardHooks.ts`
- Refer to the TypeScript interfaces in `src/types/shared.ts`
