import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
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
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
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
  Activity,
  Database,
} from "lucide-react";

const getNavigationConfig = (t: (key: string) => string) => ({
  client: [
    { title: t("navigation.dashboard"), url: "/", icon: Home },
    { title: t("navigation.createCargo"), url: "/create-cargo", icon: Plus },
    { title: t("navigation.myCargos"), url: "/my-cargos", icon: Package },
    { title: t("navigation.liveTracking"), url: "/tracking", icon: MapPin },
    { title: t("navigation.history"), url: "/history", icon: History },
    { title: t("navigation.invoices"), url: "/invoices", icon: Receipt },
  ],
  driver: [
    { title: t("navigation.dashboard"), url: "/driver", icon: Home },
    {
      title: t("navigation.assignedCargos"),
      url: "/driver/cargos",
      icon: Package,
    },
    {
      title: t("navigation.myDeliveries"), 
      url: "/driver/deliveries",
      icon: Truck,
    },
    // {
    //   title: t("navigation.deliveryHistory"),
    //   url: "/driver/history",
    //   icon: History,
    // },
  ],
  admin: [
    { title: t("navigation.dashboard"), url: "/admin", icon: Home },
    { title: t("navigation.allCargos"), url: "/admin/cargos", icon: Package },
    { title: t("navigation.users"), url: "/admin/users", icon: Users },
    { title: t("navigation.trucks"), url: "/admin/trucks", icon: Truck },
    { title: t("navigation.reports"), url: "/admin/reports", icon: BarChart3 },
    { title: t("navigation.settings"), url: "/admin/settings", icon: Settings },
  ],
  super_admin: [
    { title: t("navigation.dashboard"), url: "/super-admin", icon: Home },
    {
      title: t("navigation.userManagement"),
      url: "/super-admin/users",
      icon: Users,
    },
    {
      title: t("navigation.systemSettings"),
      url: "/super-admin/settings",
      icon: Settings,
    },
    {
      title: t("navigation.systemLogs"),
      url: "/super-admin/logs",
      icon: Activity,
    },
  ],
});

export function DynamicSidebar() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === "collapsed";

  if (!user) return null;

  const navigationConfig = getNavigationConfig(t);
  const navigation = navigationConfig[user.role] || [];
  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar
      className={`${
        collapsed ? "w-16" : "w-64"
      } transition-all duration-300 bg-[#EBF3FD]`}
    >
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <img
            src="/logo-text.png"
            alt="Loveway Logistics"
            className={`${collapsed ? "w-8" : "w-36"} h-auto object-contain`}
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
                          `flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-200 font-medium    ${
                            isActive
                              ? "bg-blue-500 text-white"
                              : "text-gray-600 hover:text-gray-900"
                          } ${collapsed ? "justify-center" : ""} `
                        }
                      >
                        <Icon
                          className={`flex-shrink-0 ${
                            active
                              ? "text-primary h-8 w-8"
                              : "text-gray-600 h-5 w-5"
                          }`}
                        />
                        {!collapsed && (
                          <span
                            className={`text-sm ${
                              active
                                ? "font-bold text-primary"
                                : "text-gray-600"
                            }`}
                          >
                            {item.title}
                          </span>
                        )}
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
            {t("auth.logout")}
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
