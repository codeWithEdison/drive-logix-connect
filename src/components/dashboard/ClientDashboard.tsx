import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AiOutlineInbox,
  AiOutlineCar,
  AiOutlineClockCircle,
  AiOutlineCheckCircle,
  AiOutlinePlus,
  AiOutlineEnvironment,
  AiOutlineDollar,
  AiOutlineNotification
} from "react-icons/ai";
import { CargoCard } from "./CargoCard";
import { TrackingMap } from "./TrackingMap";

// Mock data - in real app this would come from API
const mockCargos = [
  {
    id: "#3565432",
    status: "transit" as const,
    from: "4140 Parker Rd, Allentown, New Mexico 31134",
    to: "3517 W. Gray St. Utica, Pennsylvania 57867",
    driver: "Albert Flores",
    estimatedTime: "2.5 hours",
    weight: "25 kg",
    type: "Electronics"
  },
  {
    id: "#4832920",
    status: "delivered" as const,
    from: "1050 Elden St. Colma, Delaware 10299",
    to: "6502 Preston Rd. Inglewood, Maine 98380",
    driver: "Guy Hawkins",
    estimatedTime: "Delivered",
    weight: "15 kg",
    type: "Documents"
  },
  {
    id: "#1442654",
    status: "pending" as const,
    from: "2972 Westheimer Rd. Santa Ana, Illinois 85486",
    to: "6391 Elgin St. Celina, Delaware 10299",
    driver: "Kathryn Murphy",
    estimatedTime: "Pending pickup",
    weight: "40 kg",
    type: "Furniture"
  }
];

export function ClientDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Track and manage your cargo shipments</p>
        </div>
        <Button className="bg-gradient-primary hover:bg-primary-hover">
          <AiOutlinePlus className="w-4 h-4 mr-2" />
          Create New Cargo
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6 px-6">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Cargos
            </CardTitle>
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-bold text-gray-900 mb-1">12</div>
            <div className="flex items-center gap-1">
              <span className="text-sm text-green-600 font-medium">+2</span>
              <span className="text-xs text-gray-500">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6 px-6">
            <CardTitle className="text-sm font-medium text-gray-600">
              In Transit
            </CardTitle>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-bold text-gray-900 mb-1">3</div>
            <div className="flex items-center gap-1">
              <span className="text-sm text-blue-600 font-medium">Active</span>
              <span className="text-xs text-gray-500">Currently shipping</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6 px-6">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending
            </CardTitle>
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-bold text-gray-900 mb-1">2</div>
            <div className="flex items-center gap-1">
              <span className="text-sm text-amber-600 font-medium">Waiting</span>
              <span className="text-xs text-gray-500">Awaiting pickup</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-pink-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6 px-6">
            <CardTitle className="text-sm font-medium text-gray-600">
              Delivered
            </CardTitle>
            <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-bold text-gray-900 mb-1">7</div>
            <div className="flex items-center gap-1">
              <span className="text-sm text-green-600 font-medium">Success</span>
              <span className="text-xs text-gray-500">This month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Live Tracking */}
        <div className="lg:col-span-2">
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <AiOutlineEnvironment className="h-5 w-5 text-blue-600" />
                Live Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TrackingMap />
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Notifications */}
        <div className="space-y-6">
          {/* Featured Notification Card - Similar to the blue card in the image */}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden border-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge className="bg-white/20 text-white border-white/30 text-xs font-medium px-2 py-1 rounded-full">
                  NEW
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold leading-tight">
                    We have added new tracking features!
                  </h3>
                  <p className="text-blue-100 text-sm mt-2 leading-relaxed">
                    New features focused on helping you monitor your cargo in real-time
                  </p>
                </div>
                <Button
                  size="sm"
                  className="bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-medium shadow-none border-0"
                >
                  Explore Now
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <AiOutlineNotification className="h-5 w-5 text-blue-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Cargo #4832920 delivered</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Cargo #3565432 in transit</p>
                  <p className="text-xs text-gray-500">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">New cargo request created</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Cargos */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-foreground">Recent Cargos</h2>
          <Button variant="outline">View All</Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {mockCargos.map((cargo) => (
            <CargoCard key={cargo.id} cargo={cargo} />
          ))}
        </div>
      </div>
    </div>
  );
}