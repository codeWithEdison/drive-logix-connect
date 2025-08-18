import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Pages
import Login from '@/pages/Login';
import Index from '@/pages/Index';
import CreateCargo from '@/pages/CreateCargo';
import MyCargos from '@/pages/MyCargos';
import TrackingPage from '@/pages/TrackingPage';
import History from '@/pages/History';
import DriverDashboard from '@/pages/DriverDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import SuperAdminDashboard from '@/pages/SuperAdminDashboard';
import DriverDeliveries from '@/pages/driver/DriverDeliveries';
import AdminCargos from '@/pages/admin/AdminCargos';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

function AppContent() {
  const { isAuthenticated, user, getDefaultRoute } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // If user is authenticated but on login page, redirect to their default route
  if (user && window.location.pathname === '/login') {
    const defaultRoute = getDefaultRoute(user.role);
    return <Navigate to={defaultRoute} replace />;
  }

  return (
    <AppLayout>
      <Routes>
        {/* Client Routes */}
        <Route path="/" element={
          <ProtectedRoute allowedRoles={['client']}>
            <Index />
          </ProtectedRoute>
        } />
        <Route path="/create-cargo" element={
          <ProtectedRoute allowedRoles={['client']}>
            <CreateCargo />
          </ProtectedRoute>
        } />
        <Route path="/my-cargos" element={
          <ProtectedRoute allowedRoles={['client']}>
            <MyCargos />
          </ProtectedRoute>
        } />
        <Route path="/tracking" element={
          <ProtectedRoute allowedRoles={['client']}>
            <TrackingPage />
          </ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute allowedRoles={['client']}>
            <History />
          </ProtectedRoute>
        } />

        {/* Driver Routes */}
        <Route path="/driver" element={
          <ProtectedRoute allowedRoles={['driver']}>
            <DriverDashboard />
          </ProtectedRoute>
        } />
        <Route path="/driver/deliveries" element={
          <ProtectedRoute allowedRoles={['driver']}>
            <DriverDeliveries />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/cargos" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminCargos />
          </ProtectedRoute>
        } />

        {/* Super Admin Routes */}
        <Route path="/super-admin" element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Router>
            <AppContent />
            <Toaster />
            <Sonner />
          </Router>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
