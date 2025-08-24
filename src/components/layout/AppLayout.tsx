import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DynamicSidebar } from './DynamicSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { Button } from '@/components/ui/button';
import { Bell, Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FaLanguage } from "react-icons/fa6";
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();
  const [currentLanguage, setCurrentLanguage] = useState('English');

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ];

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
      <div className="flex flex-col min-h-screen w-full bg-[#F9FAFE]">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 w-full bg-[#F9FAFE]/80 backdrop-blur-md border-b border-white/20">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <img
                src="/lovewaylogistic.png"
                alt="Loveway Logistics"
                className="w-8 h-8 object-contain"
              />
              <div>
                <h1 className="font-bold text-base text-gray-900">Loveway Logistic</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-gray-600 hover:text-gray-900">
                    <FaLanguage className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {languages.map((language) => (
                    <DropdownMenuItem
                      key={language.code}
                      onClick={() => setCurrentLanguage(language.name)}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <span className="text-lg">{language.flag}</span>
                      <span className="font-medium">{language.name}</span>
                      {currentLanguage === language.name && (
                        <span className="ml-auto text-blue-600">✓</span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-gray-600 hover:text-gray-900">
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
        <main className="flex-1 overflow-auto pb-24 bg-[#F9FAFE] min-h-screen">
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
      <div className="flex min-h-screen w-full bg-[#F9FAFE] ">
        <DynamicSidebar />

        <div className="flex-1 flex flex-col">
          {/* Desktop Header */}
          <header className="sticky top-0 z-40 w-full bg-[#F9FAFE]/80 backdrop-blur-md border-b border-white/20">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="h-9 w-9 text-gray-600 hover:text-blue-600" />

              <div className="flex-1 flex items-center gap-4">
              </div>

              <div className="flex items-center gap-3">
                {/* Language Selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-9 px-3 text-gray-600 hover:text-gray-900 flex items-center gap-2">
                      <FaLanguage className="h-4 w-4" />
                      <span className="hidden sm:block text-sm font-medium">{currentLanguage}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {languages.map((language) => (
                      <DropdownMenuItem
                        key={language.code}
                        onClick={() => setCurrentLanguage(language.name)}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <span className="text-lg">{language.flag}</span>
                        <span className="font-medium">{language.name}</span>
                        {currentLanguage === language.name && (
                          <span className="ml-auto text-blue-600">✓</span>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 relative text-gray-600 hover:text-gray-900">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full text-xs"></span>
                </Button>

                <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback
                      style={{ backgroundColor: getRoleColor(user.role) }}
                      className="text-white font-bold"
                    >
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden xl:block">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user.role.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Desktop Content */}
          <main className="flex-1 overflow-auto bg-[#F9FAFE] min-h-screen">
            <div className="container mx-auto p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}