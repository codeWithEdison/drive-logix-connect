import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Users, 
  Database, 
  Activity,
  TrendingUp,
  Server,
  AlertTriangle,
  Settings,
  Lock,
  Globe,
  BarChart3,
  UserCog,
  HardDrive,
  Wifi,
  Zap,
  Eye
} from "lucide-react";

// Mock data for super admin
const mockSuperAdminData = {
  systemStats: {
    totalUsers: 2847,
    activeUsers: 156,
    systemUptime: "99.9%",
    serverLoad: 68,
    databaseSize: "2.4 GB",
    apiCalls: "1.2M",
    revenue: "$847,250",
    growth: "+18.7%"
  },
  systemHealth: {
    webServer: { status: "healthy", load: 45 },
    database: { status: "healthy", load: 32 },
    apiGateway: { status: "warning", load: 78 },
    fileStorage: { status: "healthy", load: 23 }
  },
  userStats: {
    clients: 1245,
    drivers: 234,
    admins: 15,
    superAdmins: 3
  },
  recentActivities: [
    {
      type: "user",
      action: "New admin account created",
      user: "System Admin",
      time: "2 minutes ago"
    },
    {
      type: "system",
      action: "Database backup completed",
      user: "System",
      time: "15 minutes ago"
    },
    {
      type: "security",
      action: "Failed login attempts detected",
      user: "Security Monitor",
      time: "1 hour ago"
    },
    {
      type: "performance",
      action: "Server performance optimized",
      user: "Auto-Monitor",
      time: "2 hours ago"
    }
  ]
};

export function SuperAdminDashboard() {
  const [selectedTab, setSelectedTab] = useState("overview");

  const systemHealthConfig = {
    healthy: { color: "bg-success", text: "Healthy" },
    warning: { color: "bg-logistics-orange", text: "Warning" },
    critical: { color: "bg-destructive", text: "Critical" }
  };

  const activityIcons = {
    user: UserCog,
    system: Settings,
    security: Shield,
    performance: Zap
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-heading">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">Complete system oversight and management</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-logistics-purple text-logistics-purple-foreground">
            <Shield className="h-3 w-3 mr-1" />
            Super Admin
          </Badge>
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            System Logs
          </Button>
        </div>
      </div>

      {/* Critical Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-elevated border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{mockSuperAdminData.systemStats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-logistics-blue">{mockSuperAdminData.systemStats.activeUsers} active now</p>
          </CardContent>
        </Card>

        <Card className="card-elevated border-l-4 border-l-success">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              System Uptime
            </CardTitle>
            <Activity className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{mockSuperAdminData.systemStats.systemUptime}</div>
            <p className="text-xs text-success">Excellent performance</p>
          </CardContent>
        </Card>

        <Card className="card-elevated border-l-4 border-l-logistics-orange">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Server Load
            </CardTitle>
            <Server className="h-4 w-4 text-logistics-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{mockSuperAdminData.systemStats.serverLoad}%</div>
            <Progress value={mockSuperAdminData.systemStats.serverLoad} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="card-elevated border-l-4 border-l-logistics-green">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-logistics-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{mockSuperAdminData.systemStats.revenue}</div>
            <p className="text-xs text-success flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {mockSuperAdminData.systemStats.growth}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* System Health */}
            <div className="lg:col-span-2">
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-success" />
                    System Health Monitor
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(mockSuperAdminData.systemHealth).map(([service, data]) => (
                    <div key={service} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${systemHealthConfig[data.status as keyof typeof systemHealthConfig].color}`}></div>
                        <div>
                          <p className="font-semibold capitalize">{service.replace(/([A-Z])/g, ' $1')}</p>
                          <p className="text-sm text-muted-foreground">
                            {systemHealthConfig[data.status as keyof typeof systemHealthConfig].text}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{data.load}%</p>
                        <Progress value={data.load} className="w-24 mt-1" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* User Distribution */}
              <Card className="card-elevated mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    User Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">{mockSuperAdminData.userStats.clients}</div>
                      <p className="text-sm text-muted-foreground">Clients</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-accent">{mockSuperAdminData.userStats.drivers}</div>
                      <p className="text-sm text-muted-foreground">Drivers</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-logistics-orange">{mockSuperAdminData.userStats.admins}</div>
                      <p className="text-sm text-muted-foreground">Admins</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-logistics-purple">{mockSuperAdminData.userStats.superAdmins}</div>
                      <p className="text-sm text-muted-foreground">Super Admins</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities */}
            <div>
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-logistics-blue" />
                    System Activities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockSuperAdminData.recentActivities.map((activity, index) => {
                    const Icon = activityIcons[activity.type as keyof typeof activityIcons];
                    return (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">by {activity.user}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    );
                  })}
                  <Button variant="outline" size="sm" className="w-full">
                    View All Activities
                  </Button>
                </CardContent>
              </Card>

              {/* Quick System Actions */}
              <Card className="card-elevated mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-accent" />
                    System Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Database className="h-4 w-4 mr-2" />
                    Database Backup
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Lock className="h-4 w-4 mr-2" />
                    Security Audit
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <HardDrive className="h-4 w-4 mr-2" />
                    System Maintenance
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Emergency Mode
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <UserCog className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-semibold text-muted-foreground">User Management Interface</p>
                <p className="text-sm text-muted-foreground">Complete user administration tools will be here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>System Administration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-semibold text-muted-foreground">System Administration</p>
                <p className="text-sm text-muted-foreground">Server management and configuration tools</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>Security Center</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-semibold text-muted-foreground">Security Management</p>
                <p className="text-sm text-muted-foreground">Security monitoring and access control</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>System Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-semibold text-muted-foreground">Advanced Analytics</p>
                <p className="text-sm text-muted-foreground">Comprehensive system performance metrics</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}