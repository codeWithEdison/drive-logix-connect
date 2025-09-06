import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ApiProvider } from "@/lib/api/ApiProvider";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

// Pages
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import Index from "@/pages/Index";
import CreateCargo from "@/pages/CreateCargo";
import MyCargos from "@/pages/MyCargos";
import TrackingPage from "@/pages/TrackingPage";
import History from "@/pages/History";
import PaymentPage from "@/pages/PaymentPage";
import PaymentSuccess from "@/pages/PaymentSuccess";
import Invoices from "@/pages/Invoices";
import DriverDashboard from "@/pages/DriverDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import DriverDeliveries from "@/pages/driver/DriverDeliveries";
import DriverHistory from "@/pages/driver/DriverHistory";
import { AssignedCargosPage } from "@/pages/AssignedCargosPage";
import AdminCargos from "@/pages/admin/AdminCargos";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminTrucks from "@/pages/admin/AdminTrucks";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminReports from "@/pages/admin/AdminReports";
import SuperAdminUsers from "@/pages/superadmin/SuperAdminUsers";
import SuperAdminSettings from "@/pages/superadmin/SuperAdminSettings";
import SuperAdminLogs from "@/pages/superadmin/SuperAdminLogs";
import NotFound from "@/pages/NotFound";
import SuperAdminDashboard from "@/pages/superadmin/SuperAdminDashboard";

function AppContent() {
  const { isAuthenticated, user, getDefaultRoute } = useAuth();

  // Show loading state while auth is being determined
  if (user === null && localStorage.getItem("logistics_user")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // If user is authenticated but on login page, redirect to their default route
  if (user && window.location.pathname === "/login") {
    const defaultRoute = getDefaultRoute(user.role);
    return <Navigate to={defaultRoute} replace />;
  }

  return (
    <AppLayout>
      <Routes>
        {/* Client Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={["client"]}>
              <Index />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-cargo"
          element={
            <ProtectedRoute allowedRoles={["client"]}>
              <CreateCargo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-cargos"
          element={
            <ProtectedRoute allowedRoles={["client"]}>
              <MyCargos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tracking"
          element={
            <ProtectedRoute allowedRoles={["client"]}>
              <TrackingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute allowedRoles={["client"]}>
              <History />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/:invoiceId?"
          element={
            <ProtectedRoute allowedRoles={["client"]}>
              <PaymentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices"
          element={
            <ProtectedRoute allowedRoles={["client"]}>
              <Invoices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment-success"
          element={
            <ProtectedRoute allowedRoles={["client"]}>
              <PaymentSuccess />
            </ProtectedRoute>
          }
        />

        {/* Driver Routes */}
        <Route
          path="/driver"
          element={
            <ProtectedRoute allowedRoles={["driver"]}>
              <DriverDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver/cargos"
          element={
            <ProtectedRoute allowedRoles={["driver"]}>
              <AssignedCargosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver/deliveries"
          element={
            <ProtectedRoute allowedRoles={["driver"]}>
              <DriverDeliveries />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver/history"
          element={
            <ProtectedRoute allowedRoles={["driver"]}>
              <DriverHistory />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/cargos"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminCargos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/trucks"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminTrucks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminReports />
            </ProtectedRoute>
          }
        />

        {/* Super Admin Routes */}
        <Route
          path="/super-admin"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin/users"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <SuperAdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin/settings"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <SuperAdminSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin/logs"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <SuperAdminLogs />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

function App() {
  return (
    <ApiProvider>
      <LanguageProvider>
        <TooltipProvider>
          <AuthProvider>
            <Router>
              <AppContent />
              <Toaster />
              <Sonner />
            </Router>
          </AuthProvider>
        </TooltipProvider>
      </LanguageProvider>
    </ApiProvider>
  );
}

export default App;
