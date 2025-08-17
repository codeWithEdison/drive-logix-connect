import { LogisticsLayout } from "@/components/layout/LogisticsLayout";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";

const AdminDashboardPage = () => {
  return (
    <LogisticsLayout userRole="admin" userName="Sarah Wilson">
      <AdminDashboard />
    </LogisticsLayout>
  );
};

export default AdminDashboardPage;