import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
  AiOutlineSafety
} from 'react-icons/ai';

const navigationConfig = {
  client: [
    { title: 'Dashboard', url: '/', icon: AiOutlineHome },
    { title: 'Create', url: '/create-cargo', icon: AiOutlinePlus },
    { title: 'My Cargos', url: '/my-cargos', icon: AiOutlineInbox },
    { title: 'Tracking', url: '/tracking', icon: AiOutlineEnvironment },
    { title: 'History', url: '/history', icon: AiOutlineHistory },
  ],
  driver: [
    { title: 'Dashboard', url: '/driver', icon: AiOutlineHome },
    { title: 'Deliveries', url: '/driver/deliveries', icon: AiOutlineCar },
    { title: 'History', url: '/driver/history', icon: AiOutlineHistory },
  ],
  admin: [
    { title: 'Dashboard', url: '/admin', icon: AiOutlineHome },
    { title: 'Cargos', url: '/admin/cargos', icon: AiOutlineInbox },
    { title: 'Users', url: '/admin/users', icon: AiOutlineTeam },
    { title: 'Trucks', url: '/admin/trucks', icon: AiOutlineCar },
    { title: 'Settings', url: '/admin/settings', icon: AiOutlineSetting },
  ],
  super_admin: [
    { title: 'Dashboard', url: '/super-admin', icon: AiOutlineHome },
    { title: 'Users', url: '/super-admin/users', icon: AiOutlineTeam },
    { title: 'Admins', url: '/super-admin/admins', icon: AiOutlineSafety },
    { title: 'Analytics', url: '/super-admin/analytics', icon: AiOutlineBarChart },
    { title: 'Settings', url: '/super-admin/settings', icon: AiOutlineSetting },
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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden">
      <div className="flex items-center justify-around px-1 py-1">
        {mobileNavigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.url);

          return (
            <NavLink
              key={item.title}
              to={item.url}
              className={`flex flex-col items-center justify-center gap-1 py-2 px-1 min-w-0 flex-1 transition-colors duration-200 ${active
                ? 'text-green-600'
                : 'text-gray-500'
                }`}
            >
              <Icon className={`h-6 w-6 ${active ? 'text-green-600' : 'text-gray-500'}`} />
              <span className={`text-xs font-medium truncate max-w-full ${active ? 'text-green-600' : 'text-gray-500'}`}>
                {item.title}
              </span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}