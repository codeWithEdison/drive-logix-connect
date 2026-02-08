import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useLogout } from "@/lib/api/hooks/authHooks";
import { useUserProfile } from "@/lib/api/hooks/userHooks";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Settings,
  LogOut,
  Shield,
  Truck,
  Building2,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Driver, Client } from "@/types/shared";

interface ProfileDropdownProps {
  className?: string;
}

export function ProfileDropdown({ className }: ProfileDropdownProps) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const logoutMutation = useLogout();
  const { data: userProfile } = useUserProfile();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      await logout();
      toast({
        title: t("auth.logoutSuccess"),
        description: t("auth.logoutSuccessMessage"),
      });
      // Use hard navigation to ensure logout works
      window.location.href = "/login";
    } catch (error) {
      // Even if API call fails, logout locally
      await logout();
      // Use hard navigation to ensure logout works
      window.location.href = "/login";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "client":
        return "hsl(var(--primary))";
      case "driver":
        return "hsl(var(--success))";
      case "admin":
        return "hsl(var(--info))";
      case "super_admin":
        return "hsl(var(--accent))";
      default:
        return "hsl(var(--primary))";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "client":
        return <Building2 className="h-4 w-4" />;
      case "driver":
        return <Truck className="h-4 w-4" />;
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "super_admin":
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getInitials = (name: string) => {
    if (!name || !name.trim()) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDriverStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "on_duty":
        return "bg-blue-100 text-blue-800";
      case "unavailable":
        return "bg-red-100 text-red-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!user) return null;

  const avatarUrl = userProfile?.avatar_url || user.avatar_url;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-gray-200 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-0"
          aria-label={t("profile.profileAndSettings")}
        >
          <Avatar className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 ring-2 ring-white shadow-sm">
            {avatarUrl ? (
              <AvatarImage
                src={avatarUrl}
                alt={user.full_name}
                className="object-cover"
              />
            ) : null}
            <AvatarFallback
              style={{ backgroundColor: getRoleColor(user.role) }}
              className="text-white font-bold text-sm sm:text-base"
            >
              {getInitials(user.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden xl:block text-left min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.full_name}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user.role?.replace("_", " ") || "Unknown"}
            </p>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {/* User Info Header */}
        <div className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-14 w-14 shrink-0 ring-2 ring-gray-100">
              {avatarUrl ? (
                <AvatarImage
                  src={avatarUrl}
                  alt={user.full_name}
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback
                style={{ backgroundColor: getRoleColor(user.role) }}
                className="text-white font-bold text-xl"
              >
                {getInitials(user.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{user.full_name}</h3>
              <div className="flex items-center gap-2 mt-1">
                {getRoleIcon(user.role)}
                <span className="text-sm text-gray-600 capitalize">
                  {user.role?.replace("_", " ")}
                </span>
                <Badge
                  variant="secondary"
                  className={`text-xs ${getStatusColor(
                    user.is_active ? "active" : "pending"
                  )}`}
                >
                  {user.is_active ? t("common.active") : t("common.pending")}
                </Badge>
              </div>
              {/* Branch Information for Admin and Driver users */}
              {(user.role === "admin" || user.role === "driver") &&
                user.branch && (
                  <div className="flex items-center gap-2 mt-2">
                    <MapPin className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-500">
                      {user.branch.name} ({user.branch.code})
                    </span>
                  </div>
                )}
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Quick Info */}
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="h-4 w-4" />
            <span>{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              <span>{user.phone}</span>
            </div>
          )}
          {/* Branch Information for Admin and Driver users */}
          {(user.role === "admin" || user.role === "driver") && user.branch && (
            <>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{user.branch.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 ml-6">
                <span>
                  {user.branch.address}, {user.branch.city}
                </span>
              </div>
              {user.branch.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-500 ml-6">
                  <Phone className="h-3 w-3" />
                  <span>{user.branch.phone}</span>
                </div>
              )}
            </>
          )}
        </div>

        <DropdownMenuSeparator />

        {/* Actions */}
        <DropdownMenuItem onClick={() => navigate("/profile")}>
          <User className="mr-2 h-4 w-4" />
          {t("profile.profileAndSettings")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          {t("auth.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
