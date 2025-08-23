import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import {
  AiOutlineInbox,
  AiOutlineCar,
  AiOutlineClockCircle,
  AiOutlineCheckCircle,
  AiOutlinePlus,
  AiOutlineEnvironment,
  AiOutlineDollar,
  AiOutlineNotification,
  AiOutlineUser,
  AiOutlineHeart,
  AiOutlineArrowUp,
  AiOutlineArrowDown
} from "react-icons/ai";
import { TrackingComponent } from "./TrackingComponent";

// Mock data for cargo stats
const cargoStatsData = [
  {
    title: "Total Cargos",
    value: "12",
    change: "+2",
    changeType: "increase",
    icon: AiOutlineCar,
    color: "orange"
  },
  {
    title: "In Transit",
    value: "3",
    change: "Active",
    changeType: "active",
    icon: AiOutlineClockCircle,
    color: "green"
  },
  {
    title: "Pending",
    value: "2",
    change: "Waiting",
    changeType: "waiting",
    icon: AiOutlineInbox,
    color: "blue"
  },
  {
    title: "Delivered",
    value: "7",
    change: "Success",
    changeType: "success",
    icon: AiOutlineCheckCircle,
    color: "pink"
  }
];

// Mock data for recent activities
const recentActivities = [
  {
    id: 1,
    type: "delivery",
    icon: "check",
    title: "Cargo Delivered",
    description: "Cargo #4832920 delivered successfully",
    time: "2 hours ago",
    avatar: null
  },
  {
    id: 2,
    type: "transit",
    icon: "truck",
    title: "Cargo In Transit",
    description: "Cargo #3565432 is now in transit",
    time: "4 hours ago",
    avatar: null
  },
  {
    id: 3,
    type: "created",
    icon: "plus",
    title: "New Cargo Created",
    description: "New cargo request #1442654 created",
    time: "1 day ago",
    avatar: null
  }
];

// Mock data for recent cargos
const recentCargos = [
  {
    id: "#3565432",
    status: "In Transit",
    from: "4140 Parker Rd, Allentown, NM",
    to: "3517 W. Gray St. Utica, PA",
    driver: "Albert Flores",
    estimatedTime: "2.5 hours",
    weight: "25 kg",
    type: "Electronics"
  },
  {
    id: "#4832920",
    status: "Delivered",
    from: "1050 Elden St. Colma, DE",
    to: "6502 Preston Rd. Inglewood, ME",
    driver: "Guy Hawkins",
    estimatedTime: "Delivered",
    weight: "15 kg",
    type: "Documents"
  },
  {
    id: "#1442654",
    status: "Pending",
    from: "2972 Westheimer Rd. Santa Ana, IL",
    to: "6391 Elgin St. Celina, DE",
    driver: "Kathryn Murphy",
    estimatedTime: "Pending pickup",
    weight: "40 kg",
    type: "Furniture"
  }
];

export function ClientDashboard() {
  const navigate = useNavigate();

  const handleCreateCargo = () => {
    navigate('/create-cargo');
  };

  const handleViewAllActivities = () => {
    navigate('/history');
  };

  const handleViewAllInvoices = () => {
    navigate('/invoices');
  };

  const handleViewAllCargos = () => {
    navigate('/my-cargos');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Track and manage your cargo shipments</p>
        </div>
        <Button className="bg-gradient-primary hover:bg-primary-hover" onClick={handleCreateCargo}>
          <AiOutlinePlus className="w-4 h-4 mr-2" />
          Create New Cargo
        </Button>
      </div>

      {/* Stats Card - Single card with dividers */}
      <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {cargoStatsData.map((stat, index) => (
              <div key={stat.title} className="relative">
                <div className="p-4 md:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 bg-${stat.color}-500 rounded-full`}></div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    </div>
                    <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</span>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${stat.changeType === 'increase'
                      ? 'bg-green-100 text-green-600'
                      : stat.changeType === 'active'
                        ? 'bg-blue-100 text-blue-600'
                        : stat.changeType === 'waiting'
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-green-100 text-green-600'
                      }`}>
                      {stat.changeType === 'increase' && <AiOutlineArrowUp className="w-3 h-3" />}
                      {stat.change}
                    </div>
                  </div>
                </div>
                {/* Vertical divider */}
                {index < cargoStatsData.length - 1 && (
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-px h-12 md:h-16 bg-gray-200"></div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Tracking - Full Width */}
      <div>
        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <AiOutlineEnvironment className="h-5 w-5 text-blue-600" />
              Live Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TrackingComponent />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Invoices Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Recent Activity */}
        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900">Recent Activity</CardTitle>
              <Button variant="outline" size="sm" onClick={handleViewAllActivities}>View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={activity.id} className="relative">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      {activity.type === 'delivery' && (
                        <AiOutlineCheckCircle className="w-4 h-4 text-green-600" />
                      )}
                      {activity.type === 'transit' && (
                        <AiOutlineCar className="w-4 h-4 text-blue-600" />
                      )}
                      {activity.type === 'created' && (
                        <AiOutlinePlus className="w-4 h-4 text-orange-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {activity.type === 'delivery' && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                        {activity.type === 'transit' && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                        {activity.type === 'created' && (
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        )}
                        <span className="text-sm font-medium text-gray-900">{activity.title}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                  {index < recentActivities.length - 1 && (
                    <div className="absolute left-4 top-8 w-px h-8 bg-gray-200"></div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Cargo Invoices */}
        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900">Recent Cargo Invoices</CardTitle>
              <Button variant="outline" size="sm" onClick={handleViewAllInvoices}>View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-medium text-gray-600">Invoice No</TableHead>
                  <TableHead className="text-xs font-medium text-gray-600">Cargo ID</TableHead>
                  <TableHead className="text-xs font-medium text-gray-600">Client</TableHead>
                  <TableHead className="text-xs font-medium text-gray-600">Amount</TableHead>
                  <TableHead className="text-xs font-medium text-gray-600">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentCargos.map((cargo) => (
                  <TableRow key={cargo.id}>
                    <TableCell className="text-sm font-medium text-gray-900">INV-{cargo.id.slice(1)}</TableCell>
                    <TableCell className="text-sm text-gray-600">{cargo.id}</TableCell>
                    <TableCell className="text-sm font-medium text-gray-900">{cargo.driver}</TableCell>
                    <TableCell className="text-sm font-medium text-gray-900">
                      ${Math.floor(Math.random() * 2000) + 500}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-xs font-medium ${cargo.status === 'Delivered'
                          ? 'bg-green-100 text-green-600'
                          : cargo.status === 'In Transit'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-yellow-100 text-yellow-600'
                          }`}
                      >
                        {cargo.status === 'Delivered' ? 'PAID' : cargo.status === 'In Transit' ? 'PENDING' : 'DRAFT'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}