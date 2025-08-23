import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AiOutlineInbox,
  AiOutlineCar,
  AiOutlineTeam,
  AiOutlineDollar,
  AiOutlineRise,
  AiOutlineExclamationCircle,
  AiOutlineClockCircle,
  AiOutlineCheckCircle,
  AiOutlineBarChart,
  AiOutlineEnvironment,
  AiOutlineSetting,
  AiOutlineCheck,
  AiOutlineFilter,
  AiOutlinePlus
} from "react-icons/ai";

// Mock data for admin
const mockAdminData = {
  stats: {
    totalCargos: 1247,
    activeCargos: 23,
    totalDrivers: 89,
    availableDrivers: 45,
    totalTrucks: 67,
    activeTrucks: 34,
    monthlyRevenue: "$125,400",
    revenueGrowth: "+12.5%"
  },
  recentCargos: [
    {
      id: "#3565432",
      status: "active" as const,
      client: "John Smith",
      driver: "Albert Flores",
      route: "Allentown, NM → Utica, PA",
      value: "$280",
      priority: "urgent",
      created: "2 hours ago"
    },
    {
      id: "#4832920",
      status: "pending" as const,
      client: "Sarah Johnson",
      driver: "Unassigned",
      route: "Colma, DE → Inglewood, ME",
      value: "$150",
      priority: "standard",
      created: "4 hours ago"
    },
    {
      id: "#1442654",
      status: "delivered" as const,
      client: "Mike Wilson",
      driver: "Guy Hawkins",
      route: "Santa Ana, IL → Celina, DE",
      value: "$320",
      priority: "express",
      created: "1 day ago"
    }
  ],
  alerts: [
    {
      type: "warning",
      message: "Truck TRK-045 requires maintenance",
      time: "30 minutes ago"
    },
    {
      type: "info",
      message: "New driver registration pending approval",
      time: "1 hour ago"
    },
    {
      type: "urgent",
      message: "Cargo #3565432 experiencing delays",
      time: "45 minutes ago"
    }
  ]
};

export function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState("overview");

  const statusConfig = {
    active: { label: "Active", color: "bg-logistics-blue text-logistics-blue-foreground" },
    pending: { label: "Pending", color: "bg-logistics-orange text-logistics-orange-foreground" },
    delivered: { label: "Delivered", color: "bg-success text-success-foreground" },
    cancelled: { label: "Cancelled", color: "bg-destructive text-destructive-foreground" }
  };

  const alertConfig = {
    warning: { icon: AiOutlineExclamationCircle, color: "text-logistics-orange" },
    info: { icon: AiOutlineClockCircle, color: "text-logistics-blue" },
    urgent: { icon: AiOutlineExclamationCircle, color: "text-destructive" }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-heading">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage all logistics operations</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <AiOutlineFilter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button className="bg-gradient-primary hover:bg-primary-hover">
            <AiOutlinePlus className="h-4 w-4 mr-2" />
            Quick Actions
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6 px-6">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Cargos
            </CardTitle>
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-bold text-gray-900 mb-1">{mockAdminData.stats.totalCargos.toLocaleString()}</div>
            <div className="flex items-center gap-1">
              <span className="text-sm text-blue-600 font-medium">{mockAdminData.stats.activeCargos}</span>
              <span className="text-xs text-gray-500">active</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6 px-6">
            <CardTitle className="text-sm font-medium text-gray-600">
              Drivers
            </CardTitle>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-bold text-gray-900 mb-1">{mockAdminData.stats.totalDrivers}</div>
            <div className="flex items-center gap-1">
              <span className="text-sm text-green-600 font-medium">{mockAdminData.stats.availableDrivers}</span>
              <span className="text-xs text-gray-500">available</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6 px-6">
            <CardTitle className="text-sm font-medium text-gray-600">
              Fleet Status
            </CardTitle>
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-bold text-gray-900 mb-1">{mockAdminData.stats.totalTrucks}</div>
            <div className="flex items-center gap-1">
              <span className="text-sm text-purple-600 font-medium">{mockAdminData.stats.activeTrucks}</span>
              <span className="text-xs text-gray-500">on road</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-pink-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6 px-6">
            <CardTitle className="text-sm font-medium text-gray-600">
              Monthly Revenue
            </CardTitle>
            <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-bold text-gray-900 mb-1">{mockAdminData.stats.monthlyRevenue}</div>
            <div className="flex items-center gap-1">
              <AiOutlineRise className="h-3 w-3 text-green-600" />
              <span className="text-sm text-green-600 font-medium">{mockAdminData.stats.revenueGrowth}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cargos">Cargos</TabsTrigger>
          <TabsTrigger value="fleet">Fleet</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Cargos */}
            <div className="lg:col-span-2">
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AiOutlineInbox className="h-5 w-5 text-primary" />
                    Recent Cargo Requests
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockAdminData.recentCargos.map((cargo) => (
                    <div key={cargo.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">{cargo.id}</span>
                          <Badge className={statusConfig[cargo.status].color}>
                            {statusConfig[cargo.status].label}
                          </Badge>
                          {cargo.priority === 'urgent' && (
                            <Badge variant="outline" className="text-destructive border-destructive">
                              Urgent
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Client</p>
                            <p className="font-medium">{cargo.client}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Driver</p>
                            <p className="font-medium">{cargo.driver}</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{cargo.route}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-bold text-logistics-green">{cargo.value}</p>
                        <p className="text-xs text-muted-foreground">{cargo.created}</p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    View All Cargos
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* System Alerts */}
            <div>
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AiOutlineExclamationCircle className="h-5 w-5 text-logistics-orange" />
                    System Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockAdminData.alerts.map((alert, index) => {
                    const AlertIcon = alertConfig[alert.type as keyof typeof alertConfig].icon;
                    const iconColor = alertConfig[alert.type as keyof typeof alertConfig].color;

                    return (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                        <AlertIcon className={`h-4 w-4 mt-0.5 ${iconColor}`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{alert.message}</p>
                          <p className="text-xs text-muted-foreground">{alert.time}</p>
                        </div>
                      </div>
                    );
                  })}
                  <Button variant="outline" size="sm" className="w-full">
                    View All Alerts
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="card-elevated mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AiOutlineSetting className="h-5 w-5 text-accent" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <AiOutlineCheck className="h-4 w-4 mr-2" />
                    Approve Drivers
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <AiOutlineCar className="h-4 w-4 mr-2" />
                    Add New Truck
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <AiOutlineBarChart className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <AiOutlineSetting className="h-4 w-4 mr-2" />
                    System Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cargos">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>Cargo Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AiOutlineInbox className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-semibold text-muted-foreground">Cargo Management Interface</p>
                <p className="text-sm text-muted-foreground">Detailed cargo list and management tools will be here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fleet">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>Fleet Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AiOutlineCar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-semibold text-muted-foreground">Fleet Management Interface</p>
                <p className="text-sm text-muted-foreground">Truck and driver management tools will be here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>Analytics & Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AiOutlineBarChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-semibold text-muted-foreground">Analytics Dashboard</p>
                <p className="text-sm text-muted-foreground">Charts and detailed analytics will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}