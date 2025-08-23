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
  Car,
  Search,
  User,
  Phone,
  Save
} from "lucide-react";
import { toast } from "sonner";

// Mock vehicle data based on availability and capacity
const availableVehicles = [
  {
    id: "moto-001",
    type: "moto",
    name: "Motorcycle Delivery",
    capacity: 50, // kg
    baseRate: 1500, // RWF per km
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
    baseRate: 2000, // RWF per km
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
    baseRate: 2500, // RWF per km
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
    otherCargoType: "",
    weight: "",
    length: "",
    width: "",
    height: "",
    description: "",
    pickupAddress: "",
    pickupContactName: "",
    pickupContactPhone: "",
    pickupOpeningHours: "",
    pickupLat: "",
    pickupLng: "",
    destinationAddress: "",
    destinationContactName: "",
    destinationContactPhone: "",
    destinationOpeningHours: "",
    destinationLat: "",
    destinationLng: "",
    pickupDate: "",
    specialInstructions: "",
    urgency: "standard",
    selectedVehicle: "",
    distance: 0,
    savePickupData: false,
    saveDestinationData: false
  });

  const [estimatedCost, setEstimatedCost] = useState(0);
  const [cargoId, setCargoId] = useState("");
  const [pickupSearchQuery, setPickupSearchQuery] = useState("");
  const [destinationSearchQuery, setDestinationSearchQuery] = useState("");
  const [pickupSearchResults, setPickupSearchResults] = useState<any[]>([]);
  const [destinationSearchResults, setDestinationSearchResults] = useState<any[]>([]);
  const [isSearchingPickup, setIsSearchingPickup] = useState(false);
  const [isSearchingDestination, setIsSearchingDestination] = useState(false);

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
        const weightRate = 500; // RWF per kg
        const urgencyMultiplier = formData.urgency === "urgent" ? 1.5 : 1;

        // Use actual distance from form data or fallback to mock distance
        const distance = formData.distance || 25; // km
        const cost = (selectedVehicle.baseRate * distance + weightRate * parseFloat(formData.weight || "0")) * urgencyMultiplier;
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

  // Google Maps search functions
  const searchLocation = async (query: string, isPickup: boolean) => {
    if (!query.trim()) return;

    const isSearching = isPickup ? setIsSearchingPickup : setIsSearchingDestination;
    const setResults = isPickup ? setPickupSearchResults : setDestinationSearchResults;

    isSearching(true);

    try {
      // Mock Google Places API response - in real app, use actual Google Places API
      const mockResults = [
        {
          place_id: "1",
          description: `${query} - Kigali, Rwanda`,
          structured_formatting: {
            main_text: query,
            secondary_text: "Kigali, Rwanda"
          }
        },
        {
          place_id: "2",
          description: `${query} - Remera, Kigali, Rwanda`,
          structured_formatting: {
            main_text: query,
            secondary_text: "Remera, Kigali, Rwanda"
          }
        },
        {
          place_id: "3",
          description: `${query} - Nyarugenge, Kigali, Rwanda`,
          structured_formatting: {
            main_text: query,
            secondary_text: "Nyarugenge, Kigali, Rwanda"
          }
        }
      ];

      setResults(mockResults);
    } catch (error) {
      console.error('Error searching location:', error);
      toast.error('Failed to search location');
    } finally {
      isSearching(false);
    }
  };

  const selectLocation = (result: any, isPickup: boolean) => {
    const address = result.description;
    const lat = isPickup ? -1.9441 : -1.9501; // Mock coordinates
    const lng = isPickup ? 30.0619 : 30.0596;

    const updatedFormData = {
      ...formData,
      ...(isPickup ? {
        pickupAddress: address,
        pickupLat: lat.toString(),
        pickupLng: lng.toString()
      } : {
        destinationAddress: address,
        destinationLat: lat.toString(),
        destinationLng: lng.toString()
      }),
      distance: 0 // Reset distance to show loading state
    };

    setFormData(updatedFormData);

    if (isPickup) {
      setPickupSearchQuery(address);
      setPickupSearchResults([]);
    } else {
      setDestinationSearchQuery(address);
      setDestinationSearchResults([]);
    }

    // Calculate distance if both locations are set
    if (updatedFormData.pickupLat && updatedFormData.destinationLat) {
      setTimeout(() => {
        // Mock distance calculation - in real app, use Google Maps Distance Matrix API
        const distance = Math.random() * 50 + 10; // 10-60 km
        setFormData(prev => ({ ...prev, distance: Math.round(distance) }));
      }, 500); // Small delay to show loading state
    }
  };

  const calculateDistance = () => {
    if (formData.pickupLat && formData.pickupLng && formData.destinationLat && formData.destinationLng) {
      // Mock distance calculation - in real app, use Google Maps Distance Matrix API
      const distance = Math.random() * 50 + 10; // 10-60 km
      setFormData({ ...formData, distance: Math.round(distance) });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Enhanced Progress Bar - Mobile Responsive */}
      <div className="flex items-center justify-between mb-8 overflow-x-auto">
        {[1, 2, 3, 4, 5, 6].map((number) => (
          <div key={number} className="flex items-center flex-shrink-0">
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-medium transition-all duration-300 shadow-sm ${step === number
              ? "bg-blue-500 text-white ring-2 md:ring-4 ring-blue-100" // Current step - blue
              : step > number
                ? "bg-green-500 text-white" // Completed step - green
                : "bg-gray-200 text-gray-500" // Future step - gray
              }`}>
              {number === 6 ? <CheckCircle className="h-4 w-4 md:h-5 md:w-5" /> : number}
            </div>
            {number < 6 && (
              <div className={`w-8 md:w-16 h-1 mx-1 md:mx-3 transition-all duration-300 rounded-full ${step > number
                ? "bg-green-500" // Completed line - green
                : "bg-gray-200" // Future line - gray
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

              {formData.cargoType === "other" && (
                <div className="space-y-2">
                  <Label htmlFor="otherCargoType">Specify Cargo Type</Label>
                  <Input
                    id="otherCargoType"
                    placeholder="Enter cargo type..."
                    value={formData.otherCargoType}
                    onChange={(e) => setFormData({ ...formData, otherCargoType: e.target.value })}
                  />
                </div>
              )}

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
              <Label htmlFor="description">Cargo Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your cargo in detail..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Dimensions (cm)</Label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Input
                    id="length"
                    placeholder="Length"
                    value={formData.length}
                    onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                  />
                </div>
                <div>
                  <Input
                    id="width"
                    placeholder="Width"
                    value={formData.width}
                    onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                  />
                </div>
                <div>
                  <Input
                    id="height"
                    placeholder="Height"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  />
                </div>
              </div>
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

      {/* Step 2: Enhanced Locations */}
      {step === 2 && (
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Pickup & Delivery Locations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">

            {/* Pickup Location Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-600" />
                Pickup Location
              </h3>

              {/* Address Search */}
              <div className="space-y-2">
                <Label>Pickup Address</Label>
                <div className="relative">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search pickup location..."
                        value={pickupSearchQuery}
                        onChange={(e) => {
                          setPickupSearchQuery(e.target.value);
                          if (e.target.value.length > 2) {
                            searchLocation(e.target.value, true);
                          } else {
                            setPickupSearchResults([]);
                          }
                        }}
                        className="pl-10"
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => searchLocation(pickupSearchQuery, true)}
                      disabled={isSearchingPickup}
                    >
                      {isSearchingPickup ? "Searching..." : "Search"}
                    </Button>
                  </div>

                  {/* Search Results */}
                  {pickupSearchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      {pickupSearchResults.map((result) => (
                        <div
                          key={result.place_id}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onClick={() => selectLocation(result, true)}
                        >
                          <div className="font-medium">{result.structured_formatting.main_text}</div>
                          <div className="text-sm text-gray-600">{result.structured_formatting.secondary_text}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Textarea
                  placeholder="Enter complete pickup address..."
                  value={formData.pickupAddress}
                  onChange={(e) => {
                    const newFormData = { ...formData, pickupAddress: e.target.value };
                    setFormData(newFormData);

                    // Calculate distance if both addresses are set
                    if (newFormData.pickupAddress && newFormData.destinationAddress) {
                      setTimeout(() => {
                        const distance = Math.random() * 50 + 10; // 10-60 km
                        setFormData(prev => ({ ...prev, distance: Math.round(distance) }));
                      }, 500); // Small delay to show loading state
                    }
                  }}
                  rows={2}
                />
              </div>

              {/* Pickup Contact Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pickupContactName">Contact Person</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="pickupContactName"
                      placeholder="Contact name"
                      value={formData.pickupContactName}
                      onChange={(e) => setFormData({ ...formData, pickupContactName: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pickupContactPhone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="pickupContactPhone"
                      placeholder="+250 123 456 789"
                      value={formData.pickupContactPhone}
                      onChange={(e) => setFormData({ ...formData, pickupContactPhone: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickupOpeningHours">Opening Hours</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="pickupOpeningHours"
                    placeholder="e.g., Mon-Fri 8AM-6PM, Sat 9AM-3PM"
                    value={formData.pickupOpeningHours}
                    onChange={(e) => setFormData({ ...formData, pickupOpeningHours: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="savePickupData"
                  checked={formData.savePickupData}
                  onChange={(e) => setFormData({ ...formData, savePickupData: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="savePickupData" className="text-sm flex items-center gap-1">
                  <Save className="h-4 w-4" />
                  Save pickup details for future use
                </Label>
              </div>
            </div>

            {/* Destination Location Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <MapPin className="h-5 w-5 text-red-600" />
                Delivery Location
              </h3>

              {/* Address Search */}
              <div className="space-y-2">
                <Label>Delivery Address</Label>
                <div className="relative">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search delivery location..."
                        value={destinationSearchQuery}
                        onChange={(e) => {
                          setDestinationSearchQuery(e.target.value);
                          if (e.target.value.length > 2) {
                            searchLocation(e.target.value, false);
                          } else {
                            setDestinationSearchResults([]);
                          }
                        }}
                        className="pl-10"
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => searchLocation(destinationSearchQuery, false)}
                      disabled={isSearchingDestination}
                    >
                      {isSearchingDestination ? "Searching..." : "Search"}
                    </Button>
                  </div>

                  {/* Search Results */}
                  {destinationSearchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      {destinationSearchResults.map((result) => (
                        <div
                          key={result.place_id}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onClick={() => selectLocation(result, false)}
                        >
                          <div className="font-medium">{result.structured_formatting.main_text}</div>
                          <div className="text-sm text-gray-600">{result.structured_formatting.secondary_text}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Textarea
                  placeholder="Enter complete delivery address..."
                  value={formData.destinationAddress}
                  onChange={(e) => {
                    const newFormData = { ...formData, destinationAddress: e.target.value };
                    setFormData(newFormData);

                    // Calculate distance if both addresses are set
                    if (newFormData.pickupAddress && newFormData.destinationAddress) {
                      setTimeout(() => {
                        const distance = Math.random() * 50 + 10; // 10-60 km
                        setFormData(prev => ({ ...prev, distance: Math.round(distance) }));
                      }, 500); // Small delay to show loading state
                    }
                  }}
                  rows={2}
                />
              </div>

              {/* Destination Contact Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="destinationContactName">Contact Person</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="destinationContactName"
                      placeholder="Contact name"
                      value={formData.destinationContactName}
                      onChange={(e) => setFormData({ ...formData, destinationContactName: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destinationContactPhone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="destinationContactPhone"
                      placeholder="+250 123 456 789"
                      value={formData.destinationContactPhone}
                      onChange={(e) => setFormData({ ...formData, destinationContactPhone: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="destinationOpeningHours">Opening Hours</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="destinationOpeningHours"
                    placeholder="e.g., Mon-Fri 8AM-6PM, Sat 9AM-3PM"
                    value={formData.destinationOpeningHours}
                    onChange={(e) => setFormData({ ...formData, destinationOpeningHours: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="saveDestinationData"
                  checked={formData.saveDestinationData}
                  onChange={(e) => setFormData({ ...formData, saveDestinationData: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="saveDestinationData" className="text-sm flex items-center gap-1">
                  <Save className="h-4 w-4" />
                  Save delivery details for future use
                </Label>
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-4">
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
                  placeholder="Any special handling requirements, delivery instructions, or additional notes..."
                  value={formData.specialInstructions}
                  onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            {/* Distance Display - Bottom */}
            {formData.pickupAddress && formData.destinationAddress && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-900">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">
                      {formData.distance > 0
                        ? `Estimated Distance: ${formData.distance} km`
                        : "Calculating distance..."
                      }
                    </span>
                  </div>
                  {formData.distance === 0 && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1 bg-gradient-primary hover:bg-primary-hover"
              >
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
                              <span>Rate: RWF {vehicle.baseRate.toLocaleString()}/km</span>
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
                  <span className="text-muted-foreground">Base delivery fee ({formData.distance || 25} km)</span>
                  <span>RWF {selectedVehicle ? (selectedVehicle.baseRate * (formData.distance || 25)).toLocaleString() : '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Weight charge ({formData.weight} kg)</span>
                  <span>RWF {(parseFloat(formData.weight || "0") * 500).toLocaleString()}</span>
                </div>
                {formData.urgency === "urgent" && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Urgent delivery surcharge (50%)</span>
                    <span>RWF {selectedVehicle ? (selectedVehicle.baseRate * (formData.distance || 25) * 0.5).toLocaleString() : '0'}</span>
                  </div>
                )}
                <div className="border-t border-border pt-2 flex justify-between font-semibold text-lg">
                  <span>Total Estimated Cost</span>
                  <span className="text-primary">RWF {estimatedCost.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Shipment Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Cargo Type</p>
                  <p className="font-medium capitalize">
                    {formData.cargoType === "other" ? formData.otherCargoType : formData.cargoType}
                  </p>
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
                  <p className="text-muted-foreground">Distance</p>
                  <p className="font-medium">{formData.distance} km</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Dimensions</p>
                  <p className="font-medium">
                    {formData.length && formData.width && formData.height
                      ? `${formData.length} × ${formData.width} × ${formData.height} cm`
                      : 'Not specified'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Urgency</p>
                  <p className="font-medium capitalize">{formData.urgency}</p>
                </div>
              </div>

              {/* Location Details */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">Location Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-600">Pickup</span>
                    </div>
                    <p className="text-muted-foreground">{formData.pickupAddress}</p>
                    {formData.pickupContactName && (
                      <p className="text-xs text-muted-foreground">
                        Contact: {formData.pickupContactName} • {formData.pickupContactPhone}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-red-600" />
                      <span className="font-medium text-red-600">Delivery</span>
                    </div>
                    <p className="text-muted-foreground">{formData.destinationAddress}</p>
                    {formData.destinationContactName && (
                      <p className="text-xs text-muted-foreground">
                        Contact: {formData.destinationContactName} • {formData.destinationContactPhone}
                      </p>
                    )}
                  </div>
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
                  <span className="font-bold">RWF {estimatedCost.toLocaleString()}</span>
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