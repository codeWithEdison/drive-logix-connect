import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DynamicSidebar } from './DynamicSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { Button } from '@/components/ui/button';
import { Bell, Search, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();

  if (!user) {
    return <>{children}</>;
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'client': return 'hsl(var(--primary))';
      case 'driver': return 'hsl(var(--success))';
      case 'admin': return 'hsl(var(--info))';
      case 'super_admin': return 'hsl(var(--accent))';
      default: return 'hsl(var(--primary))';
    }
  };

  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen w-full bg-background">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-sm">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <img
                  src="/lovewaylogistic.png"
                  alt="Loveway Logistics"
                  className="w-5 h-5 object-contain"
                />
              </div>
              <div>
                <h1 className="font-bold text-base text-foreground">Loveway</h1>
                <p className="text-xs text-primary capitalize">
                  {user.role.replace('_', ' ')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <Bell className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 w-9 p-0"
                onClick={logout}
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback 
                    style={{ backgroundColor: getRoleColor(user.role) }}
                    className="text-white font-bold text-xs"
                  >
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </div>
          </div>
        </header>

        {/* Mobile Content */}
        <main className="flex-1 overflow-auto pb-20">
          <div className="p-4">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <DynamicSidebar />

        <div className="flex-1 flex flex-col">
          {/* Desktop Header */}
          <header className="sticky top-0 z-40 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-sm">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="h-9 w-9" />

              <div className="flex-1 flex items-center gap-4">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search anything..."
                    className="pl-9 h-10 bg-background"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full text-xs"></span>
                </Button>
                
                <div className="flex items-center gap-3 pl-3 border-l border-border">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback 
                      style={{ backgroundColor: getRoleColor(user.role) }}
                      className="text-white font-bold"
                    >
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden xl:block">
                    <p className="text-sm font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {user.role.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Desktop Content */}
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}