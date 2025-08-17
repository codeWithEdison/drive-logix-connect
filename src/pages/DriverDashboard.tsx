import { LogisticsLayout } from "@/components/layout/LogisticsLayout";
import { DriverDashboard } from "@/components/dashboard/DriverDashboard";

const DriverDashboardPage = () => {
  return (
    <LogisticsLayout userRole="driver" userName="Albert Flores">
      <DriverDashboard />
    </LogisticsLayout>
  );
};

export default DriverDashboardPage;