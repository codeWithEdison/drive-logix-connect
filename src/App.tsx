import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CreateCargo from "./pages/CreateCargo";
import MyCargos from "./pages/MyCargos";
import TrackingPage from "./pages/TrackingPage";
import DriverDashboardPage from "./pages/DriverDashboard";
import AdminDashboardPage from "./pages/AdminDashboard";
import SuperAdminDashboardPage from "./pages/SuperAdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/create-cargo" element={<CreateCargo />} />
          <Route path="/cargos" element={<MyCargos />} />
          <Route path="/tracking" element={<TrackingPage />} />
          <Route path="/driver" element={<DriverDashboardPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/super-admin" element={<SuperAdminDashboardPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
