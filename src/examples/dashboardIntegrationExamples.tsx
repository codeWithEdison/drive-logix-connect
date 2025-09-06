// ===========================================
// DASHBOARD INTEGRATION EXAMPLES
// ===========================================

// Example 1: Driver Dashboard Component Integration
import React from "react";
import {
  useDriverDashboard,
  useDashboardUpdateDriverStatus,
} from "@/lib/api/hooks";
import { StatsCard } from "@/components/ui/StatsCard";

export function DriverDashboardExample() {
  const { data: dashboardData, isLoading, error } = useDriverDashboard();
  const updateDriverStatus = useDashboardUpdateDriverStatus();

  if (isLoading) return <div>Loading driver dashboard...</div>;
  if (error) return <div>Error loading dashboard: {error.message}</div>;

  const handleStatusChange = (
    status: "available" | "on_duty" | "unavailable"
  ) => {
    updateDriverStatus.mutate(status);
  };

  return (
    <div className="space-y-8">
      {/* Driver Stats */}
      <StatsCard
        stats={[
          {
            title: "Assigned Cargo",
            value: dashboardData?.data.stats.assigned_cargos.toString() || "0",
            change: "+2",
            changeType: "increase",
            icon: Package,
            color: "orange",
          },
          {
            title: "Active Deliveries",
            value:
              dashboardData?.data.stats.active_deliveries.toString() || "0",
            change: "In Progress",
            changeType: "active",
            icon: Clock,
            color: "green",
          },
          {
            title: "Completed",
            value:
              dashboardData?.data.stats.completed_deliveries.toString() || "0",
            change: "Total",
            changeType: "success",
            icon: CheckCircle,
            color: "blue",
          },
          {
            title: "Rating",
            value: dashboardData?.data.stats.rating.toString() || "0",
            change: "★★★★☆",
            changeType: "rating",
            icon: Star,
            color: "pink",
          },
        ]}
      />

      {/* Active Delivery */}
      {dashboardData?.data.active_delivery && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Active Delivery</h3>
          <p>
            <strong>Client:</strong>{" "}
            {dashboardData.data.active_delivery.client_name}
          </p>
          <p>
            <strong>From:</strong>{" "}
            {dashboardData.data.active_delivery.pickup_address}
          </p>
          <p>
            <strong>To:</strong>{" "}
            {dashboardData.data.active_delivery.delivery_address}
          </p>
          <p>
            <strong>Progress:</strong>{" "}
            {dashboardData.data.active_delivery.progress_percentage}%
          </p>
        </div>
      )}

      {/* Assigned Cargos */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Assigned Cargos</h3>
        {dashboardData?.data.assigned_cargos.map((cargo) => (
          <div key={cargo.cargo_id} className="border-b pb-2 mb-2">
            <p>
              <strong>Cargo ID:</strong> {cargo.cargo_id}
            </p>
            <p>
              <strong>Client:</strong> {cargo.client_name}
            </p>
            <p>
              <strong>Status:</strong> {cargo.status}
            </p>
            <p>
              <strong>Priority:</strong> {cargo.priority}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Example 2: Admin Dashboard Component Integration
import {
  useAdminDashboard,
  useRevenueChart,
  useDeliveryStatusChart,
} from "@/lib/api/hooks";

export function AdminDashboardExample() {
  const { data: adminData, isLoading } = useAdminDashboard();
  const { data: revenueData } = useRevenueChart({
    period: "month",
    role: "admin",
  });
  const { data: deliveryData } = useDeliveryStatusChart({ period: "week" });

  if (isLoading) return <div>Loading admin dashboard...</div>;

  return (
    <div className="space-y-8">
      {/* Admin Stats */}
      <StatsCard
        stats={[
          {
            title: "Monthly Revenue",
            value: `RWF ${(
              adminData?.data.stats.monthly_revenue / 1000000
            ).toFixed(1)}M`,
            change: "+12.5%",
            changeType: "increase",
            icon: DollarSign,
            color: "green",
          },
          {
            title: "Active Deliveries",
            value: adminData?.data.stats.active_deliveries.toString() || "0",
            change: "+5",
            changeType: "active",
            icon: Package,
            color: "blue",
          },
          {
            title: "Available Drivers",
            value: `${adminData?.data.stats.available_drivers}/${adminData?.data.stats.total_drivers}`,
            change: "+3",
            changeType: "ready",
            icon: Users,
            color: "purple",
          },
          {
            title: "Success Rate",
            value: `${adminData?.data.stats.success_rate}%`,
            change: "+2.1%",
            changeType: "success",
            icon: CheckCircle,
            color: "green",
          },
        ]}
      />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Revenue Trends</h3>
          {revenueData?.data.daily_revenue.map((item) => (
            <div key={item.date} className="flex justify-between">
              <span>{item.date}</span>
              <span>RWF {item.revenue.toLocaleString()}</span>
            </div>
          ))}
        </div>

        {/* Delivery Status Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Delivery Status</h3>
          {Object.entries(deliveryData?.data.status_distribution || {}).map(
            ([status, count]) => (
              <div key={status} className="flex justify-between">
                <span>{status}</span>
                <span>{count}</span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Deliveries */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Recent Deliveries</h3>
          {adminData?.data.tables.recent_deliveries.map((delivery) => (
            <div key={delivery.cargo_id} className="border-b pb-2 mb-2">
              <p>
                <strong>Cargo:</strong> {delivery.cargo_id}
              </p>
              <p>
                <strong>Client:</strong> {delivery.client_name}
              </p>
              <p>
                <strong>Driver:</strong> {delivery.driver_name}
              </p>
              <p>
                <strong>Status:</strong> {delivery.status}
              </p>
            </div>
          ))}
        </div>

        {/* Pending Approvals */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Pending Approvals</h3>
          {adminData?.data.tables.pending_approvals.map((approval) => (
            <div key={approval.id} className="border-b pb-2 mb-2">
              <p>
                <strong>Name:</strong> {approval.name}
              </p>
              <p>
                <strong>Email:</strong> {approval.email}
              </p>
              <p>
                <strong>Type:</strong> {approval.type}
              </p>
              <p>
                <strong>Status:</strong> {approval.status}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Example 3: Client Dashboard Component Integration
import { useClientDashboard, useTrackingData } from "@/lib/api/hooks";

export function ClientDashboardExample() {
  const { data: clientData, isLoading } = useClientDashboard();

  if (isLoading) return <div>Loading client dashboard...</div>;

  return (
    <div className="space-y-8">
      {/* Client Stats */}
      <StatsCard
        stats={[
          {
            title: "Total Cargos",
            value: clientData?.data.stats.total_cargos.toString() || "0",
            change: "+2",
            changeType: "increase",
            icon: Package,
            color: "orange",
          },
          {
            title: "In Transit",
            value: clientData?.data.stats.in_transit_cargos.toString() || "0",
            change: "Active",
            changeType: "active",
            icon: Clock,
            color: "green",
          },
          {
            title: "Pending",
            value: clientData?.data.stats.pending_cargos.toString() || "0",
            change: "Waiting",
            changeType: "waiting",
            icon: Inbox,
            color: "blue",
          },
          {
            title: "Delivered",
            value: clientData?.data.stats.delivered_cargos.toString() || "0",
            change: "Success",
            changeType: "success",
            icon: CheckCircle,
            color: "pink",
          },
        ]}
      />

      {/* Recent Cargos */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Recent Cargos</h3>
        {clientData?.data.recent_cargos.map((cargo) => (
          <div key={cargo.cargo_id} className="border-b pb-2 mb-2">
            <p>
              <strong>Cargo ID:</strong> {cargo.cargo_id}
            </p>
            <p>
              <strong>Status:</strong> {cargo.status}
            </p>
            <p>
              <strong>From:</strong> {cargo.pickup_address}
            </p>
            <p>
              <strong>To:</strong> {cargo.delivery_address}
            </p>
            <p>
              <strong>Driver:</strong> {cargo.driver_name || "Not assigned"}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Invoices */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Recent Invoices</h3>
        {clientData?.data.recent_invoices.map((invoice) => (
          <div key={invoice.invoice_id} className="border-b pb-2 mb-2">
            <p>
              <strong>Invoice:</strong> {invoice.invoice_number}
            </p>
            <p>
              <strong>Cargo:</strong> {invoice.cargo_id}
            </p>
            <p>
              <strong>Amount:</strong> RWF {invoice.amount.toLocaleString()}
            </p>
            <p>
              <strong>Status:</strong> {invoice.status}
            </p>
          </div>
        ))}
      </div>

      {/* Tracking Data */}
      {clientData?.data.tracking_data && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Live Tracking</h3>
          <p>
            <strong>Cargo:</strong> {clientData.data.tracking_data.cargo_id}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            {clientData.data.tracking_data.current_status}
          </p>
          <p>
            <strong>Progress:</strong>{" "}
            {clientData.data.tracking_data.progress_percentage}%
          </p>
          {clientData.data.tracking_data.current_location && (
            <p>
              <strong>Location:</strong>
              {clientData.data.tracking_data.current_location.latitude},
              {clientData.data.tracking_data.current_location.longitude}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Example 4: Super Admin Dashboard Component Integration
import { useSuperAdminDashboard, useSystemHealth } from "@/lib/api/hooks";

export function SuperAdminDashboardExample() {
  const { data: superAdminData, isLoading } = useSuperAdminDashboard();
  const { data: systemHealth } = useSystemHealth();

  if (isLoading) return <div>Loading super admin dashboard...</div>;

  return (
    <div className="space-y-8">
      {/* Super Admin Stats */}
      <StatsCard
        stats={[
          {
            title: "Total Revenue",
            value: `RWF ${(
              superAdminData?.data.stats.total_revenue / 1000000
            ).toFixed(1)}M`,
            change: "+12.5%",
            changeType: "increase",
            icon: DollarSign,
            color: "green",
          },
          {
            title: "Active Admins",
            value: superAdminData?.data.stats.active_admins.toString() || "0",
            change: "+2",
            changeType: "active",
            icon: Shield,
            color: "blue",
          },
          {
            title: "System Users",
            value: superAdminData?.data.stats.total_users.toString() || "0",
            change: "+89",
            changeType: "increase",
            icon: Users,
            color: "purple",
          },
          {
            title: "System Health",
            value: `${superAdminData?.data.stats.system_health_percentage}%`,
            change: "+2.1%",
            changeType: "success",
            icon: Activity,
            color: "green",
          },
        ]}
      />

      {/* System Health */}
      {systemHealth?.data && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">System Health</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium">API Performance</h4>
              <p>
                Response Time:{" "}
                {systemHealth.data.api_performance.average_response_time_ms}ms
              </p>
              <p>
                Error Rate:{" "}
                {systemHealth.data.api_performance.error_rate_percentage}%
              </p>
              <p>
                Uptime: {systemHealth.data.api_performance.uptime_percentage}%
              </p>
            </div>
            <div>
              <h4 className="font-medium">Database</h4>
              <p>
                Connections:{" "}
                {systemHealth.data.database_metrics.connection_count}
              </p>
              <p>
                Query Time:{" "}
                {systemHealth.data.database_metrics.query_performance_ms}ms
              </p>
              <p>
                Storage:{" "}
                {systemHealth.data.database_metrics.storage_usage_percentage}%
              </p>
            </div>
            <div>
              <h4 className="font-medium">Server Resources</h4>
              <p>
                CPU: {systemHealth.data.server_resources.cpu_usage_percentage}%
              </p>
              <p>
                Memory:{" "}
                {systemHealth.data.server_resources.memory_usage_percentage}%
              </p>
              <p>
                Disk: {systemHealth.data.server_resources.disk_usage_percentage}
                %
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Logs */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Recent System Logs</h3>
        {superAdminData?.data.recent_logs.map((log) => (
          <div key={log.id} className="border-b pb-2 mb-2">
            <p>
              <strong>User:</strong> {log.user}
            </p>
            <p>
              <strong>Action:</strong> {log.action}
            </p>
            <p>
              <strong>IP:</strong> {log.ip_address}
            </p>
            <p>
              <strong>Time:</strong> {log.timestamp}
            </p>
            <p>
              <strong>Success:</strong> {log.success ? "Yes" : "No"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Example 5: Chart Components Integration
import {
  useRevenueChart,
  useDeliveryStatusChart,
  useFleetPerformanceChart,
} from "@/lib/api/hooks";

export function ChartsExample() {
  const { data: revenueData } = useRevenueChart({ period: "month" });
  const { data: deliveryData } = useDeliveryStatusChart({ period: "week" });
  const { data: fleetData } = useFleetPerformanceChart({
    vehicle_type: "truck",
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Revenue Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Revenue Trends</h3>
        {revenueData?.data.daily_revenue.map((item) => (
          <div
            key={item.date}
            className="flex justify-between items-center mb-2"
          >
            <span className="text-sm">{item.date}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                RWF {item.revenue.toLocaleString()}
              </span>
              <span className="text-xs text-gray-500">
                ({item.deliveries} deliveries)
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Delivery Status Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">
          Delivery Status Distribution
        </h3>
        {Object.entries(deliveryData?.data.status_distribution || {}).map(
          ([status, count]) => (
            <div
              key={status}
              className="flex justify-between items-center mb-2"
            >
              <span className="text-sm capitalize">
                {status.replace("_", " ")}
              </span>
              <span className="text-sm font-medium">{count}</span>
            </div>
          )
        )}
      </div>

      {/* Fleet Performance Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Fleet Performance</h3>
        {fleetData?.data.vehicle_utilization.map((vehicle) => (
          <div key={vehicle.vehicle_id} className="border-b pb-2 mb-2">
            <p>
              <strong>Vehicle:</strong> {vehicle.plate_number}
            </p>
            <p>
              <strong>Utilization:</strong> {vehicle.utilization_percentage}%
            </p>
            <p>
              <strong>Distance:</strong> {vehicle.total_distance_km} km
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Example 6: Table Components Integration
import {
  useRecentDeliveriesTable,
  usePendingApprovalsTable,
  useSystemAlertsTable,
} from "@/lib/api/hooks";

export function TablesExample() {
  const { data: deliveriesData } = useRecentDeliveriesTable({
    limit: 10,
    role: "admin",
  });
  const { data: approvalsData } = usePendingApprovalsTable({
    status: "pending",
    limit: 10,
  });
  const { data: alertsData } = useSystemAlertsTable({
    severity: "high",
    is_resolved: false,
  });

  return (
    <div className="space-y-8">
      {/* Recent Deliveries Table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Recent Deliveries</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Cargo ID</th>
                <th className="text-left p-2">Client</th>
                <th className="text-left p-2">Driver</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {deliveriesData?.data.map((delivery) => (
                <tr key={delivery.cargo_id} className="border-b">
                  <td className="p-2">{delivery.cargo_id}</td>
                  <td className="p-2">{delivery.client_name}</td>
                  <td className="p-2">{delivery.driver_name}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        delivery.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : delivery.status === "in_transit"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {delivery.status}
                    </span>
                  </td>
                  <td className="p-2">{delivery.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Approvals Table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Pending Approvals</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">Type</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {approvalsData?.data.map((approval) => (
                <tr key={approval.id} className="border-b">
                  <td className="p-2">{approval.name}</td>
                  <td className="p-2">{approval.email}</td>
                  <td className="p-2">{approval.type}</td>
                  <td className="p-2">
                    <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">
                      {approval.status}
                    </span>
                  </td>
                  <td className="p-2">{approval.submitted_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Alerts Table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">System Alerts</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Type</th>
                <th className="text-left p-2">Message</th>
                <th className="text-left p-2">Severity</th>
                <th className="text-left p-2">Created</th>
                <th className="text-left p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {alertsData?.data.map((alert) => (
                <tr key={alert.id} className="border-b">
                  <td className="p-2">{alert.type}</td>
                  <td className="p-2">{alert.message}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        alert.severity === "critical"
                          ? "bg-red-100 text-red-800"
                          : alert.severity === "high"
                          ? "bg-orange-100 text-orange-800"
                          : alert.severity === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </td>
                  <td className="p-2">{alert.created_at}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        alert.is_resolved
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {alert.is_resolved ? "Resolved" : "Active"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Example 7: Utility Hooks Usage
import {
  useRefreshDashboard,
  usePreloadDashboard,
  useApplyDashboardFilters,
} from "@/lib/api/hooks";

export function DashboardUtilitiesExample() {
  const refreshDashboard = useRefreshDashboard();
  const preloadDashboard = usePreloadDashboard();
  const applyFilters = useApplyDashboardFilters();

  const handleRefresh = () => {
    refreshDashboard();
  };

  const handlePreload = (
    role: "driver" | "client" | "admin" | "super-admin"
  ) => {
    preloadDashboard(role);
  };

  const handleApplyFilters = () => {
    applyFilters.mutate({
      period: "month",
      date_range: {
        start_date: "2024-01-01",
        end_date: "2024-01-31",
      },
      cargo_status: "in_transit",
    });
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleRefresh}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Refresh All Dashboards
      </button>

      <div className="flex gap-2">
        <button
          onClick={() => handlePreload("driver")}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Preload Driver Dashboard
        </button>
        <button
          onClick={() => handlePreload("admin")}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Preload Admin Dashboard
        </button>
      </div>

      <button
        onClick={handleApplyFilters}
        disabled={applyFilters.isPending}
        className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
      >
        {applyFilters.isPending ? "Applying..." : "Apply Filters"}
      </button>
    </div>
  );
}
