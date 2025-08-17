import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Truck, 
  Package, 
  MapPin, 
  Users, 
  Settings, 
  BarChart3, 
  Menu,
  Bell,
  User,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LogisticsLayoutProps {
  children: React.ReactNode;
  userRole?: 'client' | 'driver' | 'admin' | 'super_admin';
  userName?: string;
}

const menuItems = {
  client: [
    { label: "Dashboard", icon: BarChart3, path: "/" },
    { label: "My Cargos", icon: Package, path: "/cargos" },
    { label: "Create Cargo", icon: MapPin, path: "/create-cargo" },
    { label: "Tracking", icon: Truck, path: "/tracking" },
  ],
  driver: [
    { label: "Dashboard", icon: BarChart3, path: "/" },
    { label: "Assigned Cargos", icon: Package, path: "/assigned" },
    { label: "Live Tracking", icon: MapPin, path: "/live-tracking" },
    { label: "History", icon: Truck, path: "/history" },
  ],
  admin: [
    { label: "Dashboard", icon: BarChart3, path: "/" },
    { label: "All Cargos", icon: Package, path: "/all-cargos" },
    { label: "Users", icon: Users, path: "/users" },
    { label: "Trucks", icon: Truck, path: "/trucks" },
    { label: "Reports", icon: BarChart3, path: "/reports" },
  ],
  super_admin: [
    { label: "Overview", icon: BarChart3, path: "/" },
    { label: "System Management", icon: Settings, path: "/system" },
    { label: "Users & Roles", icon: Users, path: "/user-management" },
    { label: "Analytics", icon: BarChart3, path: "/analytics" },
  ]
};

export function LogisticsLayout({
  children,
  userRole = 'client',
  userName = 'John Doe'
}: LogisticsLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState(0);
  
  const currentMenuItems = menuItems[userRole];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Truck className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">LogiTrack</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            <Bell className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium hidden md:block">{userName}</span>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "bg-card border-r border-border transition-all duration-300 flex-shrink-0",
          sidebarOpen ? "w-64" : "w-0 lg:w-16",
          "hidden lg:block"
        )}>
          <nav className="p-4 space-y-2">
            {currentMenuItems.map((item, index) => (
              <button
                key={item.label}
                onClick={() => setActiveItem(index)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  activeItem === index
                    ? "bg-primary text-primary-foreground shadow-custom-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            ))}
          </nav>
          
          <div className="absolute bottom-4 left-4 right-4">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-3">
              <LogOut className="h-5 w-5" />
              {sidebarOpen && <span>Logout</span>}
            </Button>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setSidebarOpen(false)}>
            <aside className="w-64 bg-card h-full border-r border-border">
              <nav className="p-4 space-y-2 pt-20">
                {currentMenuItems.map((item, index) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setActiveItem(index);
                      setSidebarOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      activeItem === index
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}