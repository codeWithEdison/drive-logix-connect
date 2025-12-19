import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  Package,
  MapPin,
  Plus,
  History,
  Truck,
  Users,
  Settings,
  BarChart3,
  Home,
  Receipt,
  Activity,
  Building2,
  Map,
  CreditCard,
  Navigation,
  FileSpreadsheet,
  MoreHorizontal,
  X,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// Use the same navigation config as DynamicSidebar
// Priority is based on order - first 4 are most important
const getNavigationConfig = (t: (key: string) => string) => ({
  client: [
    { title: t("navigation.dashboard"), url: "/", icon: Home },
    { title: t("navigation.createCargo"), url: "/create-cargo", icon: Plus },
    { title: t("navigation.myCargos"), url: "/my-cargos", icon: Package },
    { title: t("navigation.liveTracking"), url: "/tracking", icon: MapPin },
    { title: t("navigation.invoices"), url: "/invoices", icon: Receipt },
    { title: t("navigation.history"), url: "/history", icon: History },
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
    {
      title: t("navigation.deliveryHistory"),
      url: "/driver/history",
      icon: History,
    },
  ],
  admin: [
    { title: t("navigation.dashboard"), url: "/admin", icon: Home },
    { title: t("navigation.allCargos"), url: "/admin/cargos", icon: Package },
    {
      title: t("navigation.assignments"),
      url: "/admin/assignments",
      icon: Activity,
    },
    { title: t("navigation.drivers"), url: "/admin/drivers", icon: Users },
    { title: "Clients", url: "/admin/clients", icon: Users },
    { title: t("navigation.vehicles"), url: "/admin/trucks", icon: Truck },
    { title: "Fleet Monitor", url: "/admin/fleet-monitor", icon: Navigation },
    { title: t("navigation.invoices"), url: "/admin/invoices", icon: Receipt },
    {
      title: "Payment Verifications",
      url: "/admin/payment-verifications",
      icon: CreditCard,
    },
    { title: t("navigation.reports"), url: "/admin/reports", icon: BarChart3 },
    {
      title: "Transportation Reports",
      url: "/admin/transportation-reports",
      icon: FileSpreadsheet,
    },
  ],
  super_admin: [
    { title: t("navigation.dashboard"), url: "/super-admin", icon: Home },
    {
      title: t("navigation.allCargos"),
      url: "/super-admin/cargos",
      icon: Package,
    },
    {
      title: t("navigation.assignments"),
      url: "/super-admin/assignments",
      icon: Activity,
    },
    {
      title: t("navigation.vehicles"),
      url: "/super-admin/trucks",
      icon: Truck,
    },
    { title: "Fleet Monitor", url: "/admin/fleet-monitor", icon: Navigation },
    {
      title: t("navigation.userManagement"),
      url: "/super-admin/users",
      icon: Users,
    },
    {
      title: "Branchs",
      url: "/superadmin/branches",
      icon: Building2,
    },
    {
      title: "Districts",
      url: "/superadmin/districts",
      icon: Map,
    },
    {
      title: "Cargo Categories",
      url: "/superadmin/cargo-categories",
      icon: Package,
    },
    {
      title: t("navigation.invoices"),
      url: "/super-admin/invoices",
      icon: Receipt,
    },
    {
      title: "Payment Verifications",
      url: "/admin/payment-verifications",
      icon: CreditCard,
    },
    {
      title: t("navigation.systemSettings"),
      url: "/super-admin/settings",
      icon: Settings,
    },
    {
      title: "Transportation Reports",
      url: "/super-admin/transportation-reports",
      icon: FileSpreadsheet,
    },
  ],
});

export function MobileBottomNav() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  if (!user) return null;

  const navigationConfig = getNavigationConfig(t);
  const allNavigation = navigationConfig[user.role] || [];
  const isActive = (path: string) => location.pathname === path;

  // First 4 items are primary (most important), rest go in "More" menu
  const primaryItems = allNavigation.slice(0, 4);
  const moreItems = allNavigation.slice(4);

  const handleMoreItemClick = (url: string) => {
    navigate(url);
    setIsMoreOpen(false);
  };

  return (
    <>
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-white via-white/95 to-white/90 backdrop-blur-md border-t border-gray-200/50 shadow-lg md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-center justify-around px-1 py-1.5 sm:py-2">
          {/* Primary 4 navigation items */}
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.url);

            return (
              <NavLink
                key={item.title}
                to={item.url}
                className={`flex flex-col items-center justify-center gap-0.5 sm:gap-1 py-1.5 sm:py-2 px-1 min-w-0 flex-1 transition-all duration-300 rounded-lg ${
                  active
                    ? "text-blue-600 bg-blue-50/50"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon
                  className={`h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 ${
                    active ? "text-blue-600 scale-110" : "text-gray-500"
                  }`}
                />
                <span
                  className={`text-[10px] sm:text-xs font-semibold truncate max-w-full ${
                    active ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {item.title}
                </span>
              </NavLink>
            );
          })}

          {/* More button - only show if there are more items */}
          {moreItems.length > 0 && (
            <Sheet open={isMoreOpen} onOpenChange={setIsMoreOpen}>
              <SheetTrigger asChild>
                <button
                  className={`flex flex-col items-center justify-center gap-0.5 sm:gap-1 py-1.5 sm:py-2 px-1 min-w-0 flex-1 transition-all duration-300 rounded-lg ${
                    isMoreOpen
                      ? "text-blue-600 bg-blue-50/50"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <MoreHorizontal
                    className={`h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 ${
                      isMoreOpen ? "text-blue-600 scale-110" : "text-gray-500"
                    }`}
                  />
                  <span className="text-[10px] sm:text-xs font-semibold truncate max-w-full text-gray-500">
                    More
                  </span>
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl">
                <SheetHeader className="pb-4">
                  <SheetTitle className="text-left">More Options</SheetTitle>
                  <SheetDescription className="text-left">
                    Select an option to navigate
                  </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(70vh-120px)] pr-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {moreItems.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.url);

                      return (
                        <button
                          key={item.title}
                          onClick={() => handleMoreItemClick(item.url)}
                          className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all duration-200 ${
                            active
                              ? "bg-blue-500 text-white shadow-md"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-sm"
                          }`}
                        >
                          <Icon
                            className={`h-6 w-6 sm:h-7 sm:w-7 ${
                              active ? "text-white" : "text-gray-600"
                            }`}
                          />
                          <span
                            className={`text-xs sm:text-sm font-medium text-center ${
                              active ? "text-white" : "text-gray-700"
                            }`}
                          >
                            {item.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </>
  );
}
