import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { motion } from "framer-motion";
import {
  HiOutlineHome,
  HiOutlinePlusCircle,
  HiOutlineCube,
  HiOutlineMapPin,
  HiOutlineDocumentText,
  HiOutlineTruck,
  HiOutlineClock,
  HiOutlineUsers,
  HiOutlineClipboardDocumentList,
  HiOutlineCog6Tooth,
  HiOutlineChartBarSquare,
  HiOutlineMap,
  HiOutlineCreditCard,
  HiOutlineDocumentChartBar,
  HiOutlineBuildingOffice2,
  HiOutlineEllipsisHorizontal,
} from "react-icons/hi2";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

// Use the same navigation config as DynamicSidebar
// Priority is based on order - first 4 are most important
// For mobile, client role excludes history only
const getNavigationConfig = (t: (key: string) => string) => ({
  client: [
    { title: t("navigation.dashboard"), url: "/", icon: HiOutlineHome },
    {
      title: t("navigation.createCargo"),
      url: "/create-cargo",
      icon: HiOutlinePlusCircle,
    },
    { title: t("navigation.myCargos"), url: "/my-cargos", icon: HiOutlineCube },
    {
      title: t("navigation.liveTracking"),
      url: "/tracking",
      icon: HiOutlineMapPin,
    },
    { title: t("navigation.invoices"), url: "/invoices", icon: HiOutlineDocumentText },
  ],
  driver: [
    { title: t("navigation.dashboard"), url: "/driver", icon: HiOutlineHome },
    {
      title: t("navigation.assignedCargos"),
      url: "/driver/cargos",
      icon: HiOutlineCube,
    },
    {
      title: t("navigation.myDeliveries"),
      url: "/driver/deliveries",
      icon: HiOutlineTruck,
    },
    {
      title: t("navigation.deliveryHistory"),
      url: "/driver/history",
      icon: HiOutlineClock,
    },
  ],
  admin: [
    { title: t("navigation.dashboard"), url: "/admin", icon: HiOutlineHome },
    { title: t("navigation.allCargos"), url: "/admin/cargos", icon: HiOutlineCube },
    {
      title: t("navigation.assignments"),
      url: "/admin/assignments",
      icon: HiOutlineClipboardDocumentList,
    },
    { title: t("navigation.drivers"), url: "/admin/drivers", icon: HiOutlineUsers },
    { title: "Clients", url: "/admin/clients", icon: HiOutlineUsers },
    { title: t("navigation.vehicles"), url: "/admin/trucks", icon: HiOutlineTruck },
    {
      title: "Fleet Monitor",
      url: "/admin/fleet-monitor",
      icon: HiOutlineMap,
    },
    { title: t("navigation.invoices"), url: "/admin/invoices", icon: HiOutlineDocumentText },
    {
      title: "Payment Verifications",
      url: "/admin/payment-verifications",
      icon: HiOutlineCreditCard,
    },
    {
      title: t("navigation.reports"),
      url: "/admin/reports",
      icon: HiOutlineChartBarSquare,
    },
    {
      title: "Transportation Reports",
      url: "/admin/transportation-reports",
      icon: HiOutlineDocumentChartBar,
    },
  ],
  super_admin: [
    {
      title: t("navigation.dashboard"),
      url: "/super-admin",
      icon: HiOutlineHome,
    },
    {
      title: t("navigation.allCargos"),
      url: "/super-admin/cargos",
      icon: HiOutlineCube,
    },
    {
      title: t("navigation.assignments"),
      url: "/super-admin/assignments",
      icon: HiOutlineClipboardDocumentList,
    },
    {
      title: t("navigation.vehicles"),
      url: "/super-admin/trucks",
      icon: HiOutlineTruck,
    },
    {
      title: "Fleet Monitor",
      url: "/admin/fleet-monitor",
      icon: HiOutlineMap,
    },
    {
      title: t("navigation.userManagement"),
      url: "/super-admin/users",
      icon: HiOutlineUsers,
    },
    {
      title: "Branchs",
      url: "/superadmin/branches",
      icon: HiOutlineBuildingOffice2,
    },
    {
      title: "Districts",
      url: "/superadmin/districts",
      icon: HiOutlineMap,
    },
    {
      title: "Cargo Categories",
      url: "/superadmin/cargo-categories",
      icon: HiOutlineCube,
    },
    {
      title: t("navigation.invoices"),
      url: "/super-admin/invoices",
      icon: HiOutlineDocumentText,
    },
    {
      title: "Payment Verifications",
      url: "/admin/payment-verifications",
      icon: HiOutlineCreditCard,
    },
    {
      title: t("navigation.systemSettings"),
      url: "/super-admin/settings",
      icon: HiOutlineCog6Tooth,
    },
    {
      title: "Transportation Reports",
      url: "/super-admin/transportation-reports",
      icon: HiOutlineDocumentChartBar,
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

  // Show all items if 5 or fewer; otherwise show first 4 + "More" for the rest
  const maxVisible = 5;
  const primaryItems =
    allNavigation.length <= maxVisible
      ? allNavigation
      : allNavigation.slice(0, 4);
  const moreItems =
    allNavigation.length <= maxVisible ? [] : allNavigation.slice(4);

  const handleMoreItemClick = (url: string) => {
    navigate(url);
    setIsMoreOpen(false);
  };

  const NavItem = ({
    item,
    active,
  }: {
    item: { title: string; url: string; icon: React.ComponentType<{ className?: string }> };
    active: boolean;
  }) => {
    const Icon = item.icon;
    return (
      <NavLink
        to={item.url}
        className="relative flex flex-col items-center justify-center gap-1 py-2 px-1 min-w-0 flex-1 transition-all duration-300 ease-out rounded-xl"
      >
        <motion.div
          className="relative flex items-center justify-center"
          animate={{ scale: active ? 1.1 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {active && (
            <motion.div
              layoutId="navActiveBg"
              className="absolute inset-0 flex items-center justify-center -m-2"
              initial={false}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
            >
              <div className="w-12 h-12 rounded-full bg-primary shadow-[0_0_20px_hsl(217_91%_60%_/_0.5),_0_0_40px_hsl(217_91%_60%_/_0.25)]" />
            </motion.div>
          )}
          <div className="relative z-10 p-2">
            <Icon
              className={`h-5 w-5 sm:h-6 sm:w-6 transition-colors duration-300 ${
                active ? "text-primary-foreground" : "text-slate-400"
              }`}
            />
          </div>
        </motion.div>
        <span
          className={`text-[10px] sm:text-xs font-medium truncate max-w-full transition-colors duration-300 ${
            active ? "text-white" : "text-slate-400"
          }`}
        >
          {item.title}
        </span>
        {active && (
          <motion.div
            layoutId="navUnderline"
            className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-logistics-green"
            initial={false}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            style={{ width: "24px" }}
          />
        )}
      </NavLink>
    );
  };

  return (
    <>
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-2 md:hidden"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 8px)",
        }}
      >
        <div
          className="flex items-center justify-around w-full max-w-lg rounded-full bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 shadow-xl"
          style={{
            boxShadow:
              "0 -4px 24px rgba(0,0,0,0.15), 0 0 1px rgba(255,255,255,0.1) inset",
          }}
        >
          <div className="flex items-center justify-around w-full px-2 py-1">
            {primaryItems.map((item) => (
              <NavItem
                key={item.title}
                item={item}
                active={!isMoreOpen && isActive(item.url)}
              />
            ))}

            {moreItems.length > 0 && (
              <Sheet open={isMoreOpen} onOpenChange={setIsMoreOpen}>
                <SheetTrigger asChild>
                  <button
                    className={`relative flex flex-col items-center justify-center gap-1 py-2 px-1 min-w-0 flex-1 transition-all duration-300 ease-out rounded-xl ${
                      isMoreOpen ? "text-white" : "text-slate-400"
                    }`}
                  >
                    <motion.div
                      animate={{ scale: isMoreOpen ? 1.1 : 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="relative"
                    >
                      {isMoreOpen && (
                        <motion.div
                          layoutId="navActiveBg"
                          className="absolute inset-0 flex items-center justify-center -m-2"
                          initial={false}
                          transition={{ type: "spring", stiffness: 400, damping: 35 }}
                        >
                          <div className="w-12 h-12 rounded-full bg-primary shadow-[0_0_20px_hsl(217_91%_60%_/_0.5),_0_0_40px_hsl(217_91%_60%_/_0.25)]" />
                        </motion.div>
                      )}
                      <div className="relative z-10 p-2">
                        <HiOutlineEllipsisHorizontal
                          className={`h-5 w-5 sm:h-6 sm:w-6 ${
                            isMoreOpen ? "text-primary-foreground" : "text-slate-400"
                          }`}
                        />
                      </div>
                    </motion.div>
                    <span
                      className={`text-[10px] sm:text-xs font-medium truncate max-w-full ${
                        isMoreOpen ? "text-white" : "text-slate-400"
                      }`}
                    >
                      More
                    </span>
                    {isMoreOpen && (
                      <motion.div
                        layoutId="navUnderline"
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-logistics-green"
                        initial={false}
                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                        style={{ width: "24px" }}
                      />
                    )}
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
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:shadow-sm"
                            }`}
                          >
                            <Icon
                              className={`h-6 w-6 sm:h-7 sm:w-7 ${
                                active ? "text-primary-foreground" : "text-slate-600"
                              }`}
                            />
                            <span
                              className={`text-xs sm:text-sm font-medium text-center ${
                                active ? "text-primary-foreground" : "text-slate-700"
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
      </div>
    </>
  );
}
