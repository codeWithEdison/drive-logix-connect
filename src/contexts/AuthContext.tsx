import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "@/lib/api/services";
import {
  User,
  UserRole,
  LoginRequest,
  CreateUserRequest,
} from "@/types/shared";
import { customToast } from "@/lib/utils/toast";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: CreateUserRequest) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  getDefaultRoute: (role: UserRole) => string;
  isLoading: boolean;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem("logistics_user");
    const storedToken = localStorage.getItem("access_token");

    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("logistics_user");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const loginData: LoginRequest = { email, password };
      const result = await AuthService.login(loginData);

      if (result.success && result.data) {
        const { user, token, refresh_token } = result.data;

        // Store user data and tokens
        localStorage.setItem("logistics_user", JSON.stringify(user));
        localStorage.setItem("access_token", token);
        if (refresh_token) {
          localStorage.setItem("refresh_token", refresh_token);
        }

        setUser(user);
        customToast.auth.loginSuccess(user.full_name);

        // Navigate to appropriate route based on user role
        const defaultRoute = getDefaultRoute(user.role);
        navigate(defaultRoute);

        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Login error:", error);
      customToast.auth.loginError(
        error?.error?.message || "Login failed. Please try again."
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: CreateUserRequest): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await AuthService.register(data);

      if (result.success && result.data) {
        const { user, token, refresh_token } = result.data;

        // Store user data and tokens
        localStorage.setItem("logistics_user", JSON.stringify(user));
        localStorage.setItem("access_token", token);
        if (refresh_token) {
          localStorage.setItem("refresh_token", refresh_token);
        }

        setUser(user);
        customToast.auth.registerSuccess(user.full_name);

        // Navigate to appropriate route based on user role
        const defaultRoute = getDefaultRoute(user.role);
        navigate(defaultRoute);

        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Registration error:", error);
      customToast.auth.registerError(
        error?.error?.message || "Registration failed. Please try again."
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout API if user is authenticated
      if (user) {
        await AuthService.logout();
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local storage and state regardless of API call result
      setUser(null);
      localStorage.removeItem("logistics_user");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      customToast.auth.logoutSuccess();
    }
  };

  const getDefaultRoute = (role: UserRole): string => {
    switch (role) {
      case "client":
        return "/";
      case "driver":
        return "/driver";
      case "admin":
        return "/admin";
      case "super_admin":
        return "/super-admin";
      default:
        return "/";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        getDefaultRoute,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
