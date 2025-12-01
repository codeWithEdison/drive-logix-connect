import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ApiProvider } from "@/lib/api/ApiProvider";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { UpdatePrompt } from "@/components/mobile/UpdatePrompt";
import { OfflineIndicator } from "@/components/mobile/OfflineIndicator";
import { Capacitor } from "@capacitor/core";

// Lazy load pages for better performance
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const VerifyEmail = lazy(() => import("@/pages/VerifyEmail"));
const Index = lazy(() => import("@/pages/Index"));
const CreateCargo = lazy(() => import("@/pages/CreateCargo"));
const MyCargos = lazy(() => import("@/pages/MyCargos"));
const TrackingPage = lazy(() => import("@/pages/TrackingPage"));
const History = lazy(() => import("@/pages/History"));
const PaymentPage = lazy(() => import("@/pages/PaymentPage"));
const PaymentSuccess = lazy(() => import("@/pages/PaymentSuccess"));
const PaymentCallback = lazy(() => import("@/pages/PaymentCallback"));
const Invoices = lazy(() => import("@/pages/Invoices"));
const DriverDashboard = lazy(() => import("@/pages/DriverDashboard"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const DriverDeliveries = lazy(() => import("@/pages/driver/DriverDeliveries"));
const DriverHistory = lazy(() => import("@/pages/driver/DriverHistory"));
const AssignedCargosPage = lazy(() => import("@/pages/AssignedCargosPage").then(m => ({ default: m.AssignedCargosPage })));
const AdminCargos = lazy(() => import("@/pages/admin/AdminCargos"));
const AdminDrivers = lazy(() => import("@/pages/admin/AdminDrivers"));
const AdminTrucks = lazy(() => import("@/pages/admin/AdminTrucks"));
const VehicleLiveTracking = lazy(() => import("@/pages/admin/VehicleLiveTracking"));
const FleetMonitor = lazy(() => import("@/pages/admin/FleetMonitor"));
const AdminReports = lazy(() => import("@/pages/admin/AdminReports"));
const AdminAssignments = lazy(() => import("@/pages/admin/AdminAssignments"));
const AdminPaymentVerifications = lazy(() => import("@/pages/admin/AdminPaymentVerifications"));
const AdminInvoices = lazy(() => import("@/pages/admin/AdminInvoices"));
const SuperAdminUsers = lazy(() => import("@/pages/superadmin/SuperAdminUsers"));
const SuperAdminSettings = lazy(() => import("@/pages/superadmin/SuperAdminSettings"));
const SuperAdminLogs = lazy(() => import("@/pages/superadmin/SuperAdminLogs"));
const BranchManagement = lazy(() => import("@/pages/superadmin/BranchManagement"));
const BranchDetails = lazy(() => import("@/pages/superadmin/BranchDetails"));
const DistrictManagement = lazy(() => import("@/pages/superadmin/DistrictManagement"));
const CargoCategoriesPage = lazy(() => import("@/pages/superadmin/CargoCategories"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const SuperAdminDashboard = lazy(() => import("@/pages/superadmin/SuperAdminDashboard"));
const ProfilePage = lazy(() => import("@/pages/Profile").then(m => ({ default: m.ProfilePage })));
const LandingPage = lazy(() => import("@/pages/LandingPage"));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

function AppContent() {
  const { isAuthenticated, user, getDefaultRoute, isInitialized } = useAuth();

  // Debug: Log current state (remove in production)
  // console.log("AppContent - isAuthenticated:", isAuthenticated, "user:", user, "isInitialized:", isInitialized, "pathname:", window.location.pathname);

  // Show loading state while auth is being initialized
  if (!isInitialized) {
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
      <>
        <Suspense fallback={<PageLoader />}>
          <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>

        {/* Mobile-specific components */}
        {Capacitor.isNativePlatform() && (
          <>
            <UpdatePrompt />
            <div className="fixed top-4 right-4 z-40">
              <OfflineIndicator />
            </div>
          </>
        )}
      </>
    );
  }

  // If user is authenticated but on login page, redirect to their default route
  if (user && window.location.pathname === "/login") {
    const defaultRoute = getDefaultRoute(user.role);
    return <Navigate to={defaultRoute} replace />;
  }

  return (
    <>
      <AppLayout>
        <Suspense fallback={<PageLoader />}>
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
          <Route path="/payment/callback" element={<PaymentCallback />} />

          {/* Profile Route - Available to all authenticated users */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
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
            path="/admin/cargos/new"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                <CreateCargo />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/drivers"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDrivers />
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
            path="/admin/vehicles/:vehicleId/live"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <VehicleLiveTracking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/fleet-monitor"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                <FleetMonitor />
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
          <Route
            path="/admin/assignments"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminAssignments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/payment-verifications"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                <AdminPaymentVerifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/invoices"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                <AdminInvoices />
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
          {/* Redirect any old admin settings route to super-admin settings */}
          <Route
            path="/admin/settings"
            element={<Navigate to="/super-admin/settings" replace />}
          />
          <Route
            path="/super-admin/logs"
            element={
              <ProtectedRoute allowedRoles={["super_admin"]}>
                <SuperAdminLogs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin/invoices"
            element={
              <ProtectedRoute allowedRoles={["super_admin"]}>
                <AdminInvoices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/branches"
            element={
              <ProtectedRoute allowedRoles={["super_admin"]}>
                <BranchManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/branches/:id"
            element={
              <ProtectedRoute allowedRoles={["super_admin"]}>
                <BranchDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/districts"
            element={
              <ProtectedRoute allowedRoles={["super_admin"]}>
                <DistrictManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/cargo-categories"
            element={
              <ProtectedRoute allowedRoles={["super_admin"]}>
                <CargoCategoriesPage />
              </ProtectedRoute>
            }
          />

          {/* Super Admin access to Admin pages */}
          <Route
            path="/super-admin/cargos"
            element={
              <ProtectedRoute allowedRoles={["super_admin"]}>
                <AdminCargos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin/assignments"
            element={
              <ProtectedRoute allowedRoles={["super_admin"]}>
                <AdminAssignments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin/trucks"
            element={
              <ProtectedRoute allowedRoles={["super_admin"]}>
                <AdminTrucks />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </AppLayout>

      {/* Mobile-specific components */}
      {Capacitor.isNativePlatform() && (
        <>
          <UpdatePrompt />
          <div className="fixed top-4 right-4 z-40">
            <OfflineIndicator />
          </div>
        </>
      )}
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <ApiProvider>
          <TooltipProvider>
            <AuthProvider>
              <LanguageProvider>
                <NotificationProvider>
                  <AppContent />
                  <Toaster />
                  <Sonner />
                </NotificationProvider>
              </LanguageProvider>
            </AuthProvider>
          </TooltipProvider>
        </ApiProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
