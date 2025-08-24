import React from 'react';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/ui/StatsCard';
import { RevenueChart } from './charts/RevenueChart';
import { DeliveryStatusChart } from './charts/DeliveryStatusChart';
import { FleetPerformanceChart } from './charts/FleetPerformanceChart';
import { GeographicChart } from './charts/GeographicChart';
import { DriverPerformanceChart } from './charts/DriverPerformanceChart';
import { RecentDeliveriesTable } from './tables/RecentDeliveriesTable';
import { PendingApprovalsTable } from './tables/PendingApprovalsTable';
import { SystemAlertsTable } from './tables/SystemAlertsTable';
import { FinancialTransactionsTable } from './tables/FinancialTransactionsTable';
import {
  TrendingUp,
  Package,
  Truck,
  Users,
  Clock,
  CheckCircle,
  DollarSign,
  AlertTriangle,
  Download,
  Settings,
  Filter,
  Plus,
  Eye
} from 'lucide-react';

// Admin statistics data for StatsCard - Only 4 most important Rwanda-based stats
const adminStats = [
  {
    title: "Monthly Revenue",
    value: "RWF 15.2M",
    change: "+12.5%",
    changeType: "increase" as const,
    icon: DollarSign,
    color: "green"
  },
  {
    title: "Active Deliveries",
    value: "23",
    change: "+5",
    changeType: "active" as const,
    icon: Package,
    color: "blue"
  },
  {
    title: "Available Drivers",
    value: "45/89",
    change: "+3",
    changeType: "ready" as const,
    icon: Users,
    color: "purple"
  },
  {
    title: "Success Rate",
    value: "94.2%",
    change: "+2.1%",
    changeType: "success" as const,
    icon: CheckCircle,
    color: "green"
  }
];

export function AdminDashboard() {
  const handleExportReport = () => {
    // Generate and download report
    const reportData = {
      timestamp: new Date().toISOString(),
      stats: adminStats,
      generatedBy: 'Admin Dashboard'
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSettings = () => {
    // Navigate to settings page
    window.location.href = '/admin/settings';
  };

  const handleFilter = () => {
    // Open filter modal or sidebar
    console.log('Opening filter panel');
    // You can implement a filter modal here
  };

  const handleAddNew = () => {
    // Navigate to add new item page
    window.location.href = '/admin/cargos/new';
  };

  const handleViewAll = (type: string) => {
    // Navigate to respective pages
    switch (type) {
      case 'deliveries':
        window.location.href = '/admin/cargos';
        break;
      case 'approvals':
        window.location.href = '/admin/users';
        break;
      case 'alerts':
        window.location.href = '/admin/alerts';
        break;
      case 'transactions':
        window.location.href = '/admin/reports';
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-heading">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage all logistics operations in Rwanda</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleFilter}>
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
          <Button onClick={handleSettings}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Statistics Cards - Only 4 most important */}
      <StatsCard stats={adminStats} />

      {/* Charts Section */}
      <div className="space-y-8">
        {/* Revenue Trends Chart - Full Width */}
        <RevenueChart />

        {/* Charts Grid - 2x2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DeliveryStatusChart />
          <FleetPerformanceChart />
          <GeographicChart />
          <DriverPerformanceChart />
        </div>
      </div>

      {/* Tables Section - 2 tables per row */}
      <div className="space-y-8">
        {/* Recent Deliveries and Pending Approvals - 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RecentDeliveriesTable onViewAll={() => handleViewAll('deliveries')} />
          <PendingApprovalsTable onViewAll={() => handleViewAll('approvals')} />
        </div>

        {/* System Alerts and Financial Transactions - 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SystemAlertsTable onViewAll={() => handleViewAll('alerts')} />
          <FinancialTransactionsTable onViewAll={() => handleViewAll('transactions')} />
        </div>
      </div>

      {/* Recent Activities Messages - Simplified */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-900">Deliveries</span>
            </div>
            <p className="text-sm text-gray-600">Cargo #3565432 delivered to Butare</p>
            <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-900">Approvals</span>
            </div>
            <p className="text-sm text-gray-600">New driver: Michael Johnson</p>
            <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-gray-900">Alerts</span>
            </div>
            <p className="text-sm text-gray-600">Truck TRK-023 fuel level low</p>
            <p className="text-xs text-gray-500 mt-1">30 minutes ago</p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-900">Financial</span>
            </div>
            <p className="text-sm text-gray-600">Payment: RWF 280,000 received</p>
            <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
          </div>
        </div>
      </div>
    </div>
  );
}