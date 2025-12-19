import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DynamicSidebar } from "./DynamicSidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { ProfileDropdown } from "./ProfileDropdown";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { DriverNotifications } from "@/components/ui/DriverNotifications";
import { NotificationCenter } from "@/components/ui/NotificationCenter";
import { LanguageSwitcher } from "@/lib/i18n/LanguageSwitcher";
import { useToast } from "@/hooks/use-toast";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const handleNotificationAction = (action: string, data?: any) => {
    switch (action) {
      case "accept":
        toast({
          title: "Assignment Accepted",
          description: "Cargo assignment has been accepted.",
        });
        break;
      case "navigate":
        // Handle navigation action
        break;
      case "view":
        // Handle view action
        break;
      default:
        break;
    }
  };

  if (!user) {
    return <>{children}</>;
  }

  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen w-full bg-[#F9FAFE]" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 w-full bg-[#F9FAFE]/80 backdrop-blur-md border-b border-white/20 group" style={{ marginTop: 'calc(-1 * env(safe-area-inset-top, 0px))' }}>
          <div className="flex h-16 items-center justify-between px-4" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
            <div className="flex items-center gap-3">
              <img
                src="/lovewaylogistic.png"
                alt="Loveway Logistics"
                className="w-8 h-8 object-contain"
              />
              <div>
                <h1 className="font-bold text-base text-gray-900">
                  Loveway Logistics
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile Language Selector - Hide for admin and superadmin */}
              {user.role !== "admin" && user.role !== "super_admin" && (
                <LanguageSwitcher />
              )}

              {/* Mobile Notifications - Show for all users */}
              <NotificationCenter className="ml-2" />

              <ProfileDropdown />
            </div>
          </div>
          <div className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        </header>

        {/* Mobile Content */}
        <main className="flex-1 overflow-auto pb-24 bg-[#F9FAFE] min-h-screen">
          <div className="p-4">{children}</div>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-[#F9FAFE]  ">
        <DynamicSidebar />

        <div className="flex-1 flex flex-col  min-w-0">
          {/* Desktop Header */}
          <header className="sticky top-0 z-40 w-full bg-[#F9FAFE]/80 backdrop-blur-md border-b border-white/20 group">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="h-9 w-9 text-gray-600 hover:text-blue-600" />

              <div className="flex-1 flex items-center gap-4"></div>

              <div className="flex items-center gap-3">
                {/* Language Selector - Hide for admin and superadmin */}
                {user.role !== "admin" && user.role !== "super_admin" && (
                  <LanguageSwitcher />
                )}

                {/* Desktop Notifications - Show for all users */}
                <NotificationCenter />

                <ProfileDropdown />
              </div>
            </div>
            <div className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
          </header>

          {/* Desktop Content */}
          <main className="flex-1 bg-[#F9FAFE] min-h-screen overflow-y-auto overflow-x-hidden min-w-0">
            <div className="w-full max-w-full px-6 min-w-0">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
