import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  AiOutlineHome,
  AiOutlinePlus,
  AiOutlineInbox,
  AiOutlineEnvironment,
  AiOutlineHistory,
  AiOutlineCar,
  AiOutlineTeam,
  AiOutlineSetting,
  AiOutlineBarChart,
  AiOutlineSafety,
  AiOutlineAppstore,
  AiOutlineSchedule,
} from "react-icons/ai";
import { Home, Package, Truck, Receipt } from "lucide-react";

const getNavigationConfig = (t: (key: string) => string) => ({
  client: [
    { title: t("navigation.dashboard"), url: "/", icon: AiOutlineHome },
    {
      title: t("navigation.create"),
      url: "/create-cargo",
      icon: AiOutlinePlus,
    },
    {
      title: t("navigation.myCargos"),
      url: "/my-cargos",
      icon: AiOutlineInbox,
    },
    {
      title: t("navigation.tracking"),
      url: "/tracking",
      icon: AiOutlineEnvironment,
    },
    { title: t("navigation.invoices"), url: "/invoices", icon: Receipt },
    { title: t("navigation.history"), url: "/history", icon: AiOutlineHistory },
  ],
  driver: [
    { title: t("navigation.dashboard"), url: "/driver", icon: Home },
    { title: t("navigation.cargos"), url: "/driver/cargos", icon: Package },
    {
      title: t("navigation.deliveries"),
      url: "/driver/deliveries",
      icon: Truck,
    },
  ],
  admin: [
    { title: t("navigation.dashboard"), url: "/admin", icon: AiOutlineHome },
    {
      title: t("navigation.cargos"),
      url: "/admin/cargos",
      icon: AiOutlineInbox,
    },
    {
      title: t("navigation.assignments"),
      url: "/admin/assignments",
      icon: AiOutlineAppstore,
    },
    {
      title: t("navigation.drivers"),
      url: "/admin/drivers",
      icon: AiOutlineTeam,
    },
    {
      title: "Clients",
      url: "/admin/clients",
      icon: AiOutlineTeam,
    },
    { title: t("navigation.trucks"), url: "/admin/trucks", icon: AiOutlineCar },
    {
      title: t("navigation.settings"),
      url: "/admin/settings",
      icon: AiOutlineSetting,
    },
  ],
  super_admin: [
    {
      title: t("navigation.dashboard"),
      url: "/super-admin",
      icon: AiOutlineHome,
    },
    {
      title: t("navigation.allCargos"),
      url: "/super-admin/cargos",
      icon: AiOutlineInbox,
    },
    {
      title: t("navigation.assignments"),
      url: "/super-admin/assignments",
      icon: AiOutlineSchedule,
    },
    {
      title: t("navigation.vehicles"),
      url: "/super-admin/trucks",
      icon: AiOutlineCar,
    },
    {
      title: t("navigation.users"),
      url: "/super-admin/users",
      icon: AiOutlineTeam,
    },
  ],
});

export function MobileBottomNav() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  if (!user) return null;

  const navigationConfig = getNavigationConfig(t);
  const navigation = navigationConfig[user.role] || [];
  const isActive = (path: string) => location.pathname === path;

  // Show only first 5 items on mobile for better UX (including invoices)
  const mobileNavigation = navigation.slice(0, 5);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-white via-white/95 to-white/90 backdrop-blur-md border-t border-gray-200/50 shadow-lg md:hidden">
      <div className="flex items-center justify-around px-1 py-1.5 sm:py-2">
        {mobileNavigation.map((item) => {
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
      </div>
    </div>
  );
}
