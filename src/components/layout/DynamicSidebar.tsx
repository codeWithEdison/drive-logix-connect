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
  Home
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
    { title: 'Schedule', url: '/driver/schedule', icon: Clock },
    { title: 'Route Planning', url: '/driver/routes', icon: Route },
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
    { title: 'System Overview', url: '/super-admin/system', icon: Activity },
    { title: 'User Management', url: '/super-admin/users', icon: Users },
    { title: 'Admin Management', url: '/super-admin/admins', icon: Shield },
    { title: 'Analytics', url: '/super-admin/analytics', icon: BarChart3 },
    { title: 'Database', url: '/super-admin/database', icon: Database },
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
    <Sidebar className={`${collapsed ? "w-14" : "w-64"} collapsible="icon bg-background border-r border-border`}>
      <SidebarHeader className="border-b border-border/40 p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <img
              src="/lovewaylogistic.png"
              alt="Loveway Logistics"
              className="w-8 h-8 object-contain"
            />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-semibold text-foreground">Loveway Logistics</h2>
              <p className="text-xs text-muted-foreground capitalize">
                {user.role.replace('_', ' ')} Portal
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">Navigation</SidebarGroupLabel>
          <SidebarGroupContent className="space-y-1">
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
                          `flex items-center gap-3 px-3 py-2 rounded-md transition-colors font-medium ${isActive
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-gray-50 text-gray-800 hover:bg-gray-100 border border-gray-200 shadow-sm'
                          }`
                        }
                      >
                        <Icon className="h-4 w-4 flex-shrink-0 text-current" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 p-4">
        {!collapsed ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback style={{ backgroundColor: getRoleColor(user.role) }}>
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <Button
              onClick={logout}
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        ) : (
          <Button
            onClick={logout}
            variant="ghost"
            size="sm"
            className="w-full p-2"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}