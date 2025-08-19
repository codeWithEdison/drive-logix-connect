import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Package,
  MapPin,
  Plus,
  History,
  Truck,
  Clock,
  Route,
  Users,
  Settings,
  BarChart3,
  Shield,
  Database,
  Activity,
  LogOut,
  Home,
  DollarSign,
  FileText,
  Star,
  Bell,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  Wrench,
  TrendingUp,
  ShieldCheck,
  Archive,
  Globe
} from 'lucide-react';

const navigationConfig = {
  client: [
    { title: 'Dashboard', url: '/', icon: Home },
    { title: 'Create Cargo', url: '/create-cargo', icon: Plus },
    { title: 'My Cargos', url: '/my-cargos', icon: Package },
    { title: 'Live Tracking', url: '/tracking', icon: MapPin },
    { title: 'History', url: '/history', icon: History },
  ],
  driver: [
    { title: 'Dashboard', url: '/driver', icon: Home },
    { title: 'Active Deliveries', url: '/driver/deliveries', icon: Truck },
    { title: 'Delivery History', url: '/driver/history', icon: History },
  ],
  admin: [
    { title: 'Dashboard', url: '/admin', icon: Home },
    { title: 'All Cargos', url: '/admin/cargos', icon: Package },
    { title: 'Users', url: '/admin/users', icon: Users },
    { title: 'Trucks', url: '/admin/trucks', icon: Truck },
    { title: 'Reports', url: '/admin/reports', icon: BarChart3 },
    { title: 'Settings', url: '/admin/settings', icon: Settings },
  ],
  super_admin: [
    { title: 'Dashboard', url: '/super-admin', icon: Home },
    { title: 'User Management', url: '/super-admin/users', icon: Users },
    { title: 'Admin Management', url: '/super-admin/admins', icon: Shield },
    { title: 'Analytics', url: '/super-admin/analytics', icon: BarChart3 },
    { title: 'System Settings', url: '/super-admin/settings', icon: Settings },
  ]
};

export function DynamicSidebar() {
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === 'collapsed';

  if (!user) return null;

  const navigation = navigationConfig[user.role] || [];
  const isActive = (path: string) => location.pathname === path;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'client': return 'hsl(var(--primary))';
      case 'driver': return 'hsl(var(--logistics-green))';
      case 'admin': return 'hsl(var(--logistics-blue))';
      case 'super_admin': return 'hsl(var(--logistics-purple))';
      default: return 'hsl(var(--primary))';
    }
  };

  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-64"} transition-all duration-300 bg-card border-r border-border shadow-lg`}>
      <SidebarHeader className="border-b border-border/50 p-4 bg-primary/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <img
              src="/lovewaylogistic.png"
              alt="Loveway Logistics"
              className="w-6 h-6 object-contain"
            />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-bold text-lg text-foreground">Loveway Logistics</h2>
              <p className="text-sm text-primary font-medium capitalize">
                {user.role.replace('_', ' ')} Portal
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-2">
            <SidebarMenu>
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium group relative ${isActive
                            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                          } ${collapsed ? 'justify-center' : ''}`
                        }
                      >
                        <Icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-primary-foreground' : 'text-current'}`} />
                        {!collapsed && <span className="text-sm">{item.title}</span>}
                        {collapsed && (
                          <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                            {item.title}
                          </div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-4 bg-muted/30">
        {!collapsed ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border">
              <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                <AvatarFallback 
                  style={{ backgroundColor: getRoleColor(user.role) }}
                  className="text-white font-bold"
                >
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {user.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <Button
              onClick={logout}
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:border-destructive"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-center">
              <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                <AvatarFallback 
                  style={{ backgroundColor: getRoleColor(user.role) }}
                  className="text-white font-bold text-xs"
                >
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <Button
              onClick={logout}
              variant="ghost"
              size="sm"
              className="w-full p-2 hover:text-destructive group"
            >
              <LogOut className="h-4 w-4" />
              <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                Sign Out
              </div>
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}