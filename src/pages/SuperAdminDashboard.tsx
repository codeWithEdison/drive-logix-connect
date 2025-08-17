import { LogisticsLayout } from "@/components/layout/LogisticsLayout";
import { SuperAdminDashboard } from "@/components/dashboard/SuperAdminDashboard";

const SuperAdminDashboardPage = () => {
  return (
    <LogisticsLayout userRole="super_admin" userName="Michael Chen">
      <SuperAdminDashboard />
    </LogisticsLayout>
  );
};

export default SuperAdminDashboardPage;