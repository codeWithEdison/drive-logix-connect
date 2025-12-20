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
import { storage } from "@/lib/services/secureStorage";

// Re-export UserRole for components that need it
export { UserRole };

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: CreateUserRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  getDefaultRoute: (role: UserRole) => string;
  isLoading: boolean;
  isInitialized: boolean;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for stored user on mount
    const checkStoredUser = async () => {
      try {
        const storedUser = await storage.getItem("logistics_user");
        const storedToken = await storage.getItem("access_token");

        if (storedUser && storedToken) {
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
          } catch (error) {
            console.error("Error parsing stored user:", error);
            await storage.removeItem("logistics_user");
            await storage.removeItem("access_token");
            await storage.removeItem("refresh_token");
          }
        }
      } catch (error) {
        console.error("Error checking stored user:", error);
      } finally {
        // Mark as initialized after checking storage
        setIsInitialized(true);
      }
    };

    checkStoredUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const loginData: LoginRequest = { email, password };
      const result = await AuthService.login(loginData);

      if (result.success && result.data) {
        const { user, tokens } = result.data;
        const { accessToken, refreshToken } = tokens;

        // Check if user's email is verified
        if (!user.is_verified) {
          customToast.error(
            "Email not verified. Please check your email and verify your account."
          );
          setIsLoading(false);
          return false;
        }

        // Store user data and tokens
        await storage.setItem("logistics_user", JSON.stringify(user));
        await storage.setItem("access_token", accessToken);
        if (refreshToken) {
          await storage.setItem("refresh_token", refreshToken);
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

      if (result.success) {
        // Don't store tokens during registration - user needs to verify email first
        customToast.auth.registerSuccess(data.full_name);
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

  const logout = async (): Promise<void> => {
    // Clear tokens FIRST to prevent axios interceptor from trying to refresh
    setUser(null);
    await storage.removeItem("logistics_user");
    await storage.removeItem("access_token");
    await storage.removeItem("refresh_token");
    
    try {
      // Try to call logout API, but don't wait for it or retry if it fails
      // The tokens are already cleared, so this is just a best-effort cleanup
      if (user) {
        // Use a timeout to prevent hanging
        await Promise.race([
          AuthService.logout(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Logout timeout")), 2000)
          )
        ]).catch(() => {
          // Ignore errors - tokens are already cleared
        });
      }
    } catch (error) {
      // Ignore errors - tokens are already cleared
      console.error("Logout API error (ignored):", error);
    }
    
    customToast.auth.logoutSuccess();
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
        isInitialized,
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
