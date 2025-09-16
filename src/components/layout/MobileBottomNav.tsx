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
} from "react-icons/ai";
import { Home, Package, Truck } from "lucide-react";

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
    { title: t("navigation.users"), url: "/admin/users", icon: AiOutlineTeam },
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
      title: t("navigation.users"),
      url: "/super-admin/users",
      icon: AiOutlineTeam,
    },
    {
      title: t("navigation.admins"),
      url: "/super-admin/admins",
      icon: AiOutlineSafety,
    },
    {
      title: t("navigation.analytics"),
      url: "/super-admin/analytics",
      icon: AiOutlineBarChart,
    },
    {
      title: t("navigation.settings"),
      url: "/super-admin/settings",
      icon: AiOutlineSetting,
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

  // Show only first 4 items on mobile for better UX
  const mobileNavigation = navigation.slice(0, 4);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden">
      <div className="flex items-center justify-around px-1 py-1">
        {mobileNavigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.url);

          return (
            <NavLink
              key={item.title}
              to={item.url}
              className={`flex flex-col items-center justify-center gap-1 py-2 px-1 min-w-0 flex-1 transition-colors duration-200 ${
                active ? "text-green-600" : "text-gray-500"
              }`}
            >
              <Icon
                className={`h-6 w-6 ${
                  active ? "text-green-600" : "text-gray-500"
                }`}
              />
              <span
                className={`text-xs font-medium truncate max-w-full ${
                  active ? "text-green-600" : "text-gray-500"
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
