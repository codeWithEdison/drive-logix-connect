import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MapPin, 
  Package, 
  Truck, 
  Calculator,
  ArrowRight,
  Clock
} from "lucide-react";

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
    urgency: "standard"
  });

  const [estimatedCost, setEstimatedCost] = useState(0);

  const handleNext = () => {
    if (step === 2) {
      // Calculate estimated cost based on form data
      const baseRate = 2.5; // per km
      const weightRate = 0.5; // per kg
      const urgencyMultiplier = formData.urgency === "urgent" ? 1.5 : 1;
      
      // Mock calculation - in real app would use actual distance
      const mockDistance = 150; // km
      const cost = (baseRate * mockDistance + weightRate * parseFloat(formData.weight || "0")) * urgencyMultiplier;
      setEstimatedCost(cost);
    }
    setStep(step + 1);
  };

  const handleSubmit = () => {
    // In real app, submit to API
    console.log("Cargo request submitted:", formData);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((number) => (
          <div key={number} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
              step >= number 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-muted-foreground"
            }`}>
              {number}
            </div>
            {number < 3 && (
              <div className={`w-16 h-1 mx-2 transition-all duration-200 ${
                step > number ? "bg-primary" : "bg-muted"
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
                <Select value={formData.cargoType} onValueChange={(value) => setFormData({...formData, cargoType: value})}>
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
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dimensions">Dimensions (L x W x H in cm)</Label>
              <Input
                id="dimensions"
                placeholder="50 x 30 x 20"
                value={formData.dimensions}
                onChange={(e) => setFormData({...formData, dimensions: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency">Delivery Urgency</Label>
              <Select value={formData.urgency} onValueChange={(value) => setFormData({...formData, urgency: value})}>
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
                onChange={(e) => setFormData({...formData, pickupAddress: e.target.value})}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destinationAddress">Delivery Address</Label>
              <Textarea
                id="destinationAddress"
                placeholder="Enter complete delivery address..."
                value={formData.destinationAddress}
                onChange={(e) => setFormData({...formData, destinationAddress: e.target.value})}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pickupDate">Preferred Pickup Date</Label>
              <Input
                id="pickupDate"
                type="date"
                value={formData.pickupDate}
                onChange={(e) => setFormData({...formData, pickupDate: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
              <Textarea
                id="specialInstructions"
                placeholder="Any special handling requirements..."
                value={formData.specialInstructions}
                onChange={(e) => setFormData({...formData, specialInstructions: e.target.value})}
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleNext} className="flex-1 bg-gradient-primary hover:bg-primary-hover">
                Get Cost Estimate
                <Calculator className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Cost Estimate & Confirmation */}
      {step === 3 && (
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Cost Estimate & Confirmation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Cost Breakdown */}
            <div className="bg-muted rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-foreground">Cost Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base delivery fee</span>
                  <span>$375.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Weight charge ({formData.weight} kg)</span>
                  <span>${(parseFloat(formData.weight || "0") * 0.5).toFixed(2)}</span>
                </div>
                {formData.urgency === "urgent" && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Urgent delivery surcharge</span>
                    <span>$187.50</span>
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
                  <p className="text-muted-foreground">Pickup Date</p>
                  <p className="font-medium">{formData.pickupDate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Urgency</p>
                  <p className="font-medium capitalize">{formData.urgency}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleSubmit} className="flex-1 bg-gradient-primary hover:bg-primary-hover">
                Confirm & Create Cargo
                <Clock className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}