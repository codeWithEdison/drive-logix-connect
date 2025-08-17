import { LogisticsLayout } from "@/components/layout/LogisticsLayout";
import { ClientDashboard } from "@/components/dashboard/ClientDashboard";

const Index = () => {
  return (
    <LogisticsLayout userRole="client" userName="John Doe">
      <ClientDashboard />
    </LogisticsLayout>
  );
};

export default Index;