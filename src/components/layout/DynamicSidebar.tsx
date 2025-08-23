import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  Package,
  MapPin,
  Plus,
  History,
  Truck,
  Users,
  Settings,
  BarChart3,
  Shield,
  LogOut,
  Home,
  Receipt,
} from 'lucide-react';

const navigationConfig = {
  client: [
    { title: 'Dashboard', url: '/', icon: Home },
    { title: 'Create Cargo', url: '/create-cargo', icon: Plus },
    { title: 'My Cargos', url: '/my-cargos', icon: Package },
    { title: 'Live Tracking', url: '/tracking', icon: MapPin },
    { title: 'History', url: '/history', icon: History },
    { title: 'Invoices', url: '/invoices', icon: Receipt },
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



  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-64"} transition-all duration-300 bg-white border-r border-gray-100`}>
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <img
            src="/logo-text.png"
            alt="Loveway Logistics"
            className={`${collapsed ? 'w-8' : 'w-32'} h-auto object-contain`}
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-2">
        <SidebarGroup>
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
                          `flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-200 font-medium ${isActive
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-600 hover:text-gray-900'
                          } ${collapsed ? 'justify-center' : ''}`
                        }
                      >
                        <Icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-white' : 'text-gray-600'}`} />
                        {!collapsed && <span className="text-sm">{item.title}</span>}
                        {collapsed && (
                          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
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

      <SidebarFooter className="p-4 mt-auto">
        {!collapsed ? (
          <Button
            onClick={logout}
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 text-gray-600 hover:text-gray-900 p-3"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </Button>
        ) : (
          <Button
            onClick={logout}
            variant="ghost"
            size="sm"
            className="w-full p-2 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}