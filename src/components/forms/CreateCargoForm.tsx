import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PaymentComponent } from "./PaymentComponent";
import {
  MapPin,
  Package,
  Truck,
  Calculator,
  ArrowRight,
  Clock,
  CheckCircle,
  Bike,
  Car
} from "lucide-react";
import { toast } from "sonner";

// Mock vehicle data based on availability and capacity
const availableVehicles = [
  {
    id: "moto-001",
    type: "moto",
    name: "Motorcycle Delivery",
    capacity: 50, // kg
    baseRate: 1.5, // per km
    availability: true,
    estimatedTime: "2-4 hours",
    icon: Bike,
    description: "Fast delivery for small packages"
  },
  {
    id: "truck-001",
    type: "truck",
    name: "Small Truck",
    capacity: 500, // kg
    baseRate: 2.0, // per km
    availability: true,
    estimatedTime: "4-6 hours",
    icon: Truck,
    description: "Medium capacity for larger shipments"
  },
  {
    id: "truck-002",
    type: "truck",
    name: "Large Truck",
    capacity: 2000, // kg
    baseRate: 2.5, // per km
    availability: true,
    estimatedTime: "6-8 hours",
    icon: Truck,
    description: "High capacity for heavy cargo"
  }
];

export function CreateCargoForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    cargoType: "",
    weight: "",
    dimensions: "",
    pickupAddress: "",
    destinationAddress: "",
    pickupDate: "",
    specialInstructions: "",
    urgency: "standard",
    selectedVehicle: ""
  });

  const [estimatedCost, setEstimatedCost] = useState(0);
  const [cargoId, setCargoId] = useState("");

  // Filter vehicles based on cargo weight
  const getAvailableVehicles = () => {
    const cargoWeight = parseFloat(formData.weight || "0");
    return availableVehicles.filter(vehicle =>
      vehicle.availability && vehicle.capacity >= cargoWeight
    );
  };

  const handleNext = () => {
    if (step === 2) {
      // Calculate estimated cost based on form data and selected vehicle
      const selectedVehicle = availableVehicles.find(v => v.id === formData.selectedVehicle);
      if (selectedVehicle) {
        const weightRate = 0.5; // per kg
        const urgencyMultiplier = formData.urgency === "urgent" ? 1.5 : 1;

        // Mock calculation - in real app would use actual distance
        const mockDistance = 150; // km
        const cost = (selectedVehicle.baseRate * mockDistance + weightRate * parseFloat(formData.weight || "0")) * urgencyMultiplier;
        setEstimatedCost(cost);
      }
    }
    if (step === 4) {
      // Generate cargo ID and proceed to payment
      setCargoId(`#${Math.random().toString(36).substr(2, 8).toUpperCase()}`);
    }
    setStep(step + 1);
  };

  const handlePaymentComplete = (paymentData: any) => {
    // Handle payment completion
    console.log("Payment completed:", paymentData);
    setStep(6); // Move to success step
  };

  const handlePaymentCancel = () => {
    setStep(4); // Go back to confirmation step
  };

  const handleSubmit = () => {
    // In real app, submit to API
    console.log("Cargo request submitted:", formData);
    handleNext();
  };

  const availableVehiclesList = getAvailableVehicles();
  const selectedVehicle = availableVehicles.find(v => v.id === formData.selectedVehicle);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4, 5, 6].map((number) => (
          <div key={number} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${step >= number
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
              }`}>
              {number === 6 ? <CheckCircle className="h-4 w-4" /> : number}
            </div>
            {number < 6 && (
              <div className={`w-12 h-1 mx-2 transition-all duration-200 ${step > number ? "bg-primary" : "bg-muted"
                }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Cargo Details */}
      {step === 1 && (
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Cargo Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cargoType">Cargo Type</Label>
                <Select value={formData.cargoType} onValueChange={(value) => setFormData({ ...formData, cargoType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cargo type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="furniture">Furniture</SelectItem>
                    <SelectItem value="documents">Documents</SelectItem>
                    <SelectItem value="food">Food Items</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="25"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dimensions">Dimensions (L x W x H in cm)</Label>
              <Input
                id="dimensions"
                placeholder="50 x 30 x 20"
                value={formData.dimensions}
                onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency">Delivery Urgency</Label>
              <Select value={formData.urgency} onValueChange={(value) => setFormData({ ...formData, urgency: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard (2-3 days)</SelectItem>
                  <SelectItem value="express">Express (1-2 days)</SelectItem>
                  <SelectItem value="urgent">Urgent (Same day)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleNext} className="w-full bg-gradient-primary hover:bg-primary-hover">
              Next: Pickup & Delivery
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Locations */}
      {step === 2 && (
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Pickup & Delivery Locations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="pickupAddress">Pickup Address</Label>
              <Textarea
                id="pickupAddress"
                placeholder="Enter complete pickup address..."
                value={formData.pickupAddress}
                onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destinationAddress">Delivery Address</Label>
              <Textarea
                id="destinationAddress"
                placeholder="Enter complete delivery address..."
                value={formData.destinationAddress}
                onChange={(e) => setFormData({ ...formData, destinationAddress: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pickupDate">Preferred Pickup Date</Label>
              <Input
                id="pickupDate"
                type="date"
                value={formData.pickupDate}
                onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
              <Textarea
                id="specialInstructions"
                placeholder="Any special handling requirements..."
                value={formData.specialInstructions}
                onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleNext} className="flex-1 bg-gradient-primary hover:bg-primary-hover">
                Select Vehicle
                <Truck className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Vehicle Selection */}
      {step === 3 && (
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Select Vehicle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Available Vehicles</h3>
                <p className="text-sm text-blue-700">
                  Based on your cargo weight of <strong>{formData.weight} kg</strong>,
                  here are the available vehicles that can handle your shipment:
                </p>
              </div>

              {availableVehiclesList.length === 0 ? (
                <div className="text-center py-8">
                  <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground">No vehicles available</h3>
                  <p className="text-muted-foreground">
                    No vehicles can handle your cargo weight. Please reduce the weight or contact support.
                  </p>
                </div>
              ) : (
                <RadioGroup
                  value={formData.selectedVehicle}
                  onValueChange={(value) => setFormData({ ...formData, selectedVehicle: value })}
                  className="space-y-4"
                >
                  {availableVehiclesList.map((vehicle) => {
                    const Icon = vehicle.icon;
                    return (
                      <div key={vehicle.id} className="border rounded-lg p-4 hover:border-primary transition-colors">
                        <RadioGroupItem
                          value={vehicle.id}
                          id={vehicle.id}
                          className="sr-only"
                        />
                        <label
                          htmlFor={vehicle.id}
                          className="flex items-start gap-4 cursor-pointer"
                        >
                          <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-foreground">{vehicle.name}</h3>
                              <div className="text-sm text-muted-foreground">
                                Capacity: {vehicle.capacity} kg
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {vehicle.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Est. Time: {vehicle.estimatedTime}</span>
                              <span>Rate: ${vehicle.baseRate}/km</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-center w-5 h-5 border-2 border-gray-300 rounded-full">
                            {formData.selectedVehicle === vehicle.id && (
                              <div className="w-3 h-3 bg-primary rounded-full"></div>
                            )}
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </RadioGroup>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={!formData.selectedVehicle}
                className="flex-1 bg-gradient-primary hover:bg-primary-hover disabled:opacity-50"
              >
                Get Cost Estimate
                <Calculator className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Cost Estimate & Confirmation */}
      {step === 4 && (
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Cost Estimate & Confirmation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Vehicle Summary */}
            {selectedVehicle && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  {(() => {
                    const Icon = selectedVehicle.icon;
                    return <Icon className="h-5 w-5 text-blue-600" />;
                  })()}
                  <h3 className="font-semibold text-blue-900">Selected Vehicle: {selectedVehicle.name}</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Capacity:</span>
                    <span className="ml-2 font-medium">{selectedVehicle.capacity} kg</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Est. Time:</span>
                    <span className="ml-2 font-medium">{selectedVehicle.estimatedTime}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Cost Breakdown */}
            <div className="bg-muted rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-foreground">Cost Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base delivery fee</span>
                  <span>${selectedVehicle ? (selectedVehicle.baseRate * 150).toFixed(2) : '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Weight charge ({formData.weight} kg)</span>
                  <span>${(parseFloat(formData.weight || "0") * 0.5).toFixed(2)}</span>
                </div>
                {formData.urgency === "urgent" && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Urgent delivery surcharge</span>
                    <span>${selectedVehicle ? (selectedVehicle.baseRate * 150 * 0.5).toFixed(2) : '0.00'}</span>
                  </div>
                )}
                <div className="border-t border-border pt-2 flex justify-between font-semibold text-lg">
                  <span>Total Estimated Cost</span>
                  <span className="text-primary">${estimatedCost.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Shipment Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Cargo Type</p>
                  <p className="font-medium capitalize">{formData.cargoType}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Weight</p>
                  <p className="font-medium">{formData.weight} kg</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Vehicle</p>
                  <p className="font-medium">{selectedVehicle?.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Urgency</p>
                  <p className="font-medium capitalize">{formData.urgency}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleSubmit} className="flex-1 bg-gradient-primary hover:bg-primary-hover">
                Proceed to Payment
                <Clock className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Payment */}
      {step === 5 && (
        <PaymentComponent
          amount={estimatedCost}
          cargoId={cargoId}
          onPaymentComplete={handlePaymentComplete}
          onCancel={handlePaymentCancel}
        />
      )}

      {/* Step 6: Success */}
      {step === 6 && (
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Cargo Created Successfully!</h2>
                <p className="text-muted-foreground">
                  Your cargo has been created and payment processed. You'll receive tracking information shortly.
                </p>
              </div>

              <div className="bg-muted rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Cargo ID</span>
                  <span className="font-medium">{cargoId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Vehicle</span>
                  <span className="font-medium">{selectedVehicle?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Amount</span>
                  <span className="font-bold">${estimatedCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="text-green-600 font-medium">Payment Confirmed</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button className="w-full" onClick={() => window.location.href = '/my-cargos'}>
                  View My Cargos
                </Button>
                <Button variant="outline" className="w-full" onClick={() => window.location.href = '/create-cargo'}>
                  Create Another Cargo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}