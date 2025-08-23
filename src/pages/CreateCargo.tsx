import { CreateCargoForm } from "@/components/forms/CreateCargoForm";

const CreateCargo = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Create New Cargo</h1>
        <p className="text-muted-foreground">Fill in the details to request a new cargo shipment</p>
      </div>
      <CreateCargoForm />
    </div>
  );
};

export default CreateCargo;