import { LogisticsLayout } from "@/components/layout/LogisticsLayout";
import { CreateCargoForm } from "@/components/forms/CreateCargoForm";

const CreateCargo = () => {
  return (
    <LogisticsLayout userRole="client" userName="John Doe">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create New Cargo</h1>
          <p className="text-muted-foreground">Fill in the details to request a new cargo shipment</p>
        </div>
        <CreateCargoForm />
      </div>
    </LogisticsLayout>
  );
};

export default CreateCargo;