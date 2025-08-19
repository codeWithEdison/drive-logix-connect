import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
  Home,
} from 'lucide-react';

const navigationConfig = {
  client: [
    { title: 'Dashboard', url: '/', icon: Home },
    { title: 'Create', url: '/create-cargo', icon: Plus },
    { title: 'My Cargos', url: '/my-cargos', icon: Package },
    { title: 'Tracking', url: '/tracking', icon: MapPin },
    { title: 'History', url: '/history', icon: History },
  ],
  driver: [
    { title: 'Dashboard', url: '/driver', icon: Home },
    { title: 'Deliveries', url: '/driver/deliveries', icon: Truck },
    { title: 'History', url: '/driver/history', icon: History },
  ],
  admin: [
    { title: 'Dashboard', url: '/admin', icon: Home },
    { title: 'Cargos', url: '/admin/cargos', icon: Package },
    { title: 'Users', url: '/admin/users', icon: Users },
    { title: 'Trucks', url: '/admin/trucks', icon: Truck },
    { title: 'Settings', url: '/admin/settings', icon: Settings },
  ],
  super_admin: [
    { title: 'Dashboard', url: '/super-admin', icon: Home },
    { title: 'Users', url: '/super-admin/users', icon: Users },
    { title: 'Admins', url: '/super-admin/admins', icon: Shield },
    { title: 'Analytics', url: '/super-admin/analytics', icon: BarChart3 },
    { title: 'Settings', url: '/super-admin/settings', icon: Settings },
  ]
};

export function MobileBottomNav() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const navigation = navigationConfig[user.role] || [];
  const isActive = (path: string) => location.pathname === path;

  // Show only first 4 items on mobile for better UX
  const mobileNavigation = navigation.slice(0, 4);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-2xl md:hidden">
      <div className="flex items-center justify-around px-2 py-1">
        {mobileNavigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.url);

          return (
            <NavLink
              key={item.title}
              to={item.url}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                active
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? 'text-primary' : 'text-current'}`} />
              <span className="text-xs font-medium truncate max-w-full">
                {item.title}
              </span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}