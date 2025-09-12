import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PaymentComponent } from "./PaymentComponent";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  useCreateCargo,
  useAvailableVehiclesForDate,
  useEstimateCargoCost,
  useCargoCategories,
} from "@/lib/api/hooks";
import { CreateCargoRequest, CargoPriority } from "@/types/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw } from "lucide-react";
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
  Save,
} from "lucide-react";
import { toast } from "sonner";
import {
  googleMapsService,
  GooglePlace,
} from "@/lib/services/googleMapsService";

// Mock vehicle data for form display - in real app, this would come from API
const mockVehicleData = [
  {
    id: "moto-001",
    type: "moto",
    name: "Motorcycle Delivery",
    capacity: 50,
    base_rate: 1500,
    estimated_time: "2-4 hours",
    description: "Fast delivery for small packages",
  },
  {
    id: "truck-001",
    type: "truck",
    name: "Small Truck",
    capacity: 500,
    base_rate: 2000,
    estimated_time: "4-6 hours",
    description: "Medium capacity for larger shipments",
  },
  {
    id: "truck-002",
    type: "truck",
    name: "Large Truck",
    capacity: 2000,
    base_rate: 2500,
    estimated_time: "6-8 hours",
    description: "High capacity for heavy cargo",
  },
];

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
    description: "Fast delivery for small packages",
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
    description: "Medium capacity for larger shipments",
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
    description: "High capacity for heavy cargo",
  },
];

export function CreateCargoForm() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    cargoType: "",
    cargoCategoryId: "", // Add category ID
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
    saveDestinationData: false,
  });

  const [estimatedCost, setEstimatedCost] = useState(0);
  const [costBreakdown, setCostBreakdown] = useState<{
    base_cost: number;
    weight_cost: number;
    distance_cost: number;
    category_multiplier: number;
    total_distance_km: number;
    currency: string;
  } | null>(null);
  const [cargoId, setCargoId] = useState("");
  const [pickupSearchQuery, setPickupSearchQuery] = useState("");
  const [destinationSearchQuery, setDestinationSearchQuery] = useState("");
  const [pickupSearchResults, setPickupSearchResults] = useState<GooglePlace[]>(
    []
  );
  const [destinationSearchResults, setDestinationSearchResults] = useState<
    GooglePlace[]
  >([]);
  const [isSearchingPickup, setIsSearchingPickup] = useState(false);
  const [isSearchingDestination, setIsSearchingDestination] = useState(false);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);

  // API hooks
  const createCargoMutation = useCreateCargo();
  const { data: cargoCategories } = useCargoCategories({ is_active: true });
  // Get available vehicles for the selected pickup date
  const { data: availableVehiclesData, isLoading: vehiclesLoading } =
    useAvailableVehiclesForDate({
      date: formData.pickupDate,
      type: undefined, // Remove selectedVehicleType as it doesn't exist
      capacity_min: parseFloat(formData.weight) || undefined,
      duration_hours: 8, // Default 8 hours
    });
  const estimateCostMutation = useEstimateCargoCost();

  // Form validation function
  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1: // Cargo Details
        return !!(
          formData.cargoType &&
          formData.cargoCategoryId &&
          formData.weight &&
          formData.description
        );
      case 2: // Locations
        return !!(
          formData.pickupAddress &&
          formData.destinationAddress &&
          formData.pickupDate
        );
      case 3: // Vehicle Selection
        return !!formData.selectedVehicle;
      case 4: // Confirmation
        return true; // No validation needed for confirmation
      default:
        return false;
    }
  };

  // Filter vehicles based on cargo weight and availability
  const getAvailableVehicles = () => {
    if (!availableVehiclesData) {
      return mockVehicleData; // Fallback to mock data
    }

    const cargoWeight = parseFloat(formData.weight || "0");
    return availableVehiclesData.filter(
      (vehicle) => vehicle.capacity_kg >= cargoWeight
    );
  };

  const handleNext = async () => {
    // Validate current step before proceeding
    if (!validateStep(step)) {
      toast.error(t("createCargo.validation.requiredFields"));
      return;
    }

    if (step === 2) {
      // Use API cost calculation
      try {
        const costEstimate = await estimateCostMutation.mutateAsync({
          weight_kg: parseFloat(formData.weight),
          distance_km: formData.distance || 25, // Use calculated distance or default
          category_id: formData.cargoCategoryId,
        });
        setEstimatedCost(costEstimate.data?.estimated_cost || 0);
        setCostBreakdown(costEstimate.data?.breakdown || null);
      } catch (error) {
        console.error("Error estimating cost:", error);
        // Fallback to manual calculation
        // Fallback to manual calculation using mock data
        const selectedVehicle = mockVehicleData.find(
          (v) => v.id === formData.selectedVehicle
        );
        if (selectedVehicle) {
          const weightRate = 500; // RWF per kg
          const urgencyMultiplier = formData.urgency === "urgent" ? 1.5 : 1;
          const distance = formData.distance || 25; // km
          const cost =
            (selectedVehicle.base_rate * distance +
              weightRate * parseFloat(formData.weight || "0")) *
            urgencyMultiplier;
          setEstimatedCost(cost);
        }
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

  const handleSubmit = async () => {
    try {
      const cargoRequest: CreateCargoRequest = {
        type:
          formData.cargoType === "other"
            ? formData.otherCargoType
            : formData.cargoType,
        weight_kg: parseFloat(formData.weight),
        dimensions: {
          length: parseFloat(formData.length || "0"),
          width: parseFloat(formData.width || "0"),
          height: parseFloat(formData.height || "0"),
        },
        pickup_address: formData.pickupAddress,
        pickup_contact: formData.pickupContactName,
        pickup_phone: formData.pickupContactPhone,
        pickup_instructions: formData.pickupOpeningHours,
        destination_address: formData.destinationAddress,
        destination_contact: formData.destinationContactName,
        destination_phone: formData.destinationContactPhone,
        delivery_instructions: formData.destinationOpeningHours,
        special_requirements: formData.specialInstructions,
        pickup_date: formData.pickupDate,
        priority:
          formData.urgency === "standard"
            ? CargoPriority.NORMAL
            : CargoPriority.HIGH,
      };

      await createCargoMutation.mutateAsync(cargoRequest);
      toast.success(t("createCargo.success"));
      handleNext();
    } catch (error) {
      console.error("Error creating cargo:", error);
      toast.error(t("createCargo.error"));
    }
  };

  const availableVehiclesList = getAvailableVehicles();
  const selectedVehicle = mockVehicleData.find(
    (v) => v.id === formData.selectedVehicle
  );

  // Google Maps search functions
  const searchLocation = async (query: string, isPickup: boolean) => {
    if (!query.trim()) return;

    console.log(
      `🔍 Searching ${isPickup ? "pickup" : "delivery"} location:`,
      query
    );

    const isSearching = isPickup
      ? setIsSearchingPickup
      : setIsSearchingDestination;
    const setResults = isPickup
      ? setPickupSearchResults
      : setDestinationSearchResults;

    isSearching(true);

    try {
      const results = await googleMapsService.searchPlaces(query, "RW");
      console.log(
        `📥 Search results for ${isPickup ? "pickup" : "delivery"}:`,
        results
      );
      setResults(results);
    } catch (error) {
      console.error("Error searching location:", error);
      toast.error(
        "Failed to search location. Please check your Google Maps API key."
      );
      setResults([]);
    } finally {
      isSearching(false);
    }
  };

  const selectLocation = async (result: GooglePlace, isPickup: boolean) => {
    const address = result.description;

    // Get place details to get coordinates
    const placeDetails = await googleMapsService.getPlaceDetails(
      result.place_id
    );

    if (!placeDetails) {
      toast.error("Failed to get location details");
      return;
    }

    const updatedFormData = {
      ...formData,
      ...(isPickup
        ? {
            pickupAddress: address,
            pickupLat: placeDetails.lat.toString(),
            pickupLng: placeDetails.lng.toString(),
          }
        : {
            destinationAddress: address,
            destinationLat: placeDetails.lat.toString(),
            destinationLng: placeDetails.lng.toString(),
          }),
      distance: 0, // Reset distance to show loading state
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
      await calculateDistanceBetweenLocations(
        parseFloat(updatedFormData.pickupLat),
        parseFloat(updatedFormData.pickupLng),
        parseFloat(updatedFormData.destinationLat),
        parseFloat(updatedFormData.destinationLng)
      );
    }
  };

  const calculateDistanceBetweenLocations = async (
    pickupLat: number,
    pickupLng: number,
    destinationLat: number,
    destinationLng: number
  ) => {
    setIsCalculatingDistance(true);

    try {
      const result = await googleMapsService.calculateDistance(
        { lat: pickupLat, lng: pickupLng },
        { lat: destinationLat, lng: destinationLng }
      );

      if (result) {
        const distanceKm = googleMapsService.metersToKilometers(
          result.distance
        );
        setFormData((prev) => ({ ...prev, distance: distanceKm }));
        toast.success(`Distance calculated: ${distanceKm} km`);
      } else {
        toast.error("Failed to calculate distance");
      }
    } catch (error) {
      console.error("Error calculating distance:", error);
      toast.error("Failed to calculate distance. Please try again.");
    } finally {
      setIsCalculatingDistance(false);
    }
  };

  const calculateDistance = async () => {
    if (
      formData.pickupLat &&
      formData.pickupLng &&
      formData.destinationLat &&
      formData.destinationLng
    ) {
      await calculateDistanceBetweenLocations(
        parseFloat(formData.pickupLat),
        parseFloat(formData.pickupLng),
        parseFloat(formData.destinationLat),
        parseFloat(formData.destinationLng)
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Enhanced Progress Bar - Mobile Responsive */}
      <div className="flex items-center justify-between mb-8 overflow-x-auto  p-2">
        {[1, 2, 3, 4, 5, 6].map((number) => (
          <div key={number} className="flex items-center flex-shrink-0">
            <div
              className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-medium transition-all duration-300 shadow-sm ${
                step === number
                  ? "bg-blue-500 text-white ring-2 md:ring-4 ring-blue-100" // Current step - blue
                  : step > number
                  ? "bg-green-500 text-white" // Completed step - green
                  : "bg-gray-200 text-gray-500" // Future step - gray
              }`}
            >
              {number === 6 ? (
                <CheckCircle className="h-4 w-4 md:h-5 md:w-5" />
              ) : (
                number
              )}
            </div>
            {number < 6 && (
              <div
                className={`w-8 md:w-16 h-1 mx-1 md:mx-3 transition-all duration-300 rounded-full ${
                  step > number
                    ? "bg-green-500" // Completed line - green
                    : "bg-gray-200" // Future line - gray
                }`}
              />
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
              {t("createCargo.steps.cargoDetails.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cargoType">
                  {t("createCargo.steps.cargoDetails.cargoType")}
                </Label>
                <Select
                  value={formData.cargoType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, cargoType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        "createCargo.steps.cargoDetails.selectCargoType"
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">
                      {t("createCargo.steps.cargoDetails.types.electronics")}
                    </SelectItem>
                    <SelectItem value="furniture">
                      {t("createCargo.steps.cargoDetails.types.furniture")}
                    </SelectItem>
                    <SelectItem value="documents">
                      {t("createCargo.steps.cargoDetails.types.documents")}
                    </SelectItem>
                    <SelectItem value="food">
                      {t("createCargo.steps.cargoDetails.types.food")}
                    </SelectItem>
                    <SelectItem value="clothing">
                      {t("createCargo.steps.cargoDetails.types.clothing")}
                    </SelectItem>
                    <SelectItem value="other">
                      {t("createCargo.steps.cargoDetails.types.other")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cargoCategoryId">Cargo Category</Label>
                <Select
                  value={formData.cargoCategoryId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, cargoCategoryId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select cargo category" />
                  </SelectTrigger>
                  <SelectContent>
                    {cargoCategories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.cargoType === "other" && (
                <div className="space-y-2">
                  <Label htmlFor="otherCargoType">
                    {t("createCargo.steps.cargoDetails.specifyType")}
                  </Label>
                  <Input
                    id="otherCargoType"
                    placeholder={t(
                      "createCargo.steps.cargoDetails.enterCargoType"
                    )}
                    value={formData.otherCargoType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        otherCargoType: e.target.value,
                      })
                    }
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="weight">
                  {t("createCargo.steps.cargoDetails.weight")}
                </Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="25"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData({ ...formData, weight: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                {t("createCargo.steps.cargoDetails.description")}
              </Label>
              <Textarea
                id="description"
                placeholder={t(
                  "createCargo.steps.cargoDetails.descriptionPlaceholder"
                )}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("createCargo.steps.cargoDetails.dimensions")}</Label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Input
                    id="length"
                    placeholder={t("createCargo.steps.cargoDetails.length")}
                    value={formData.length}
                    onChange={(e) =>
                      setFormData({ ...formData, length: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Input
                    id="width"
                    placeholder={t("createCargo.steps.cargoDetails.width")}
                    value={formData.width}
                    onChange={(e) =>
                      setFormData({ ...formData, width: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Input
                    id="height"
                    placeholder={t("createCargo.steps.cargoDetails.height")}
                    value={formData.height}
                    onChange={(e) =>
                      setFormData({ ...formData, height: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency">
                {t("createCargo.steps.cargoDetails.urgency")}
              </Label>
              <Select
                value={formData.urgency}
                onValueChange={(value) =>
                  setFormData({ ...formData, urgency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">
                    {t(
                      "createCargo.steps.cargoDetails.urgencyOptions.standard"
                    )}
                  </SelectItem>
                  <SelectItem value="express">
                    {t("createCargo.steps.cargoDetails.urgencyOptions.express")}
                  </SelectItem>
                  <SelectItem value="urgent">
                    {t("createCargo.steps.cargoDetails.urgencyOptions.urgent")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleNext}
              disabled={!validateStep(1)}
              className="w-full bg-gradient-primary hover:bg-primary-hover disabled:opacity-50"
            >
              {t("createCargo.steps.cargoDetails.nextButton")}
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
                          <div className="font-medium">
                            {result.structured_formatting.main_text}
                          </div>
                          <div className="text-sm text-gray-600">
                            {result.structured_formatting.secondary_text}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Textarea
                  placeholder="Enter complete pickup address..."
                  value={formData.pickupAddress}
                  onChange={(e) => {
                    const newFormData = {
                      ...formData,
                      pickupAddress: e.target.value,
                    };
                    setFormData(newFormData);

                    // Calculate distance if both addresses are set
                    if (
                      newFormData.pickupAddress &&
                      newFormData.destinationAddress &&
                      newFormData.pickupLat &&
                      newFormData.destinationLat
                    ) {
                      calculateDistanceBetweenLocations(
                        parseFloat(newFormData.pickupLat),
                        parseFloat(newFormData.pickupLng),
                        parseFloat(newFormData.destinationLat),
                        parseFloat(newFormData.destinationLng)
                      );
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
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pickupContactName: e.target.value,
                        })
                      }
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
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pickupContactPhone: e.target.value,
                        })
                      }
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
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pickupOpeningHours: e.target.value,
                      })
                    }
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="savePickupData"
                  checked={formData.savePickupData}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      savePickupData: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                <Label
                  htmlFor="savePickupData"
                  className="text-sm flex items-center gap-1"
                >
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
                      onClick={() =>
                        searchLocation(destinationSearchQuery, false)
                      }
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
                          <div className="font-medium">
                            {result.structured_formatting.main_text}
                          </div>
                          <div className="text-sm text-gray-600">
                            {result.structured_formatting.secondary_text}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Textarea
                  placeholder="Enter complete delivery address..."
                  value={formData.destinationAddress}
                  onChange={(e) => {
                    const newFormData = {
                      ...formData,
                      destinationAddress: e.target.value,
                    };
                    setFormData(newFormData);

                    // Calculate distance if both addresses are set
                    if (
                      newFormData.pickupAddress &&
                      newFormData.destinationAddress &&
                      newFormData.pickupLat &&
                      newFormData.destinationLat
                    ) {
                      calculateDistanceBetweenLocations(
                        parseFloat(newFormData.pickupLat),
                        parseFloat(newFormData.pickupLng),
                        parseFloat(newFormData.destinationLat),
                        parseFloat(newFormData.destinationLng)
                      );
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
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          destinationContactName: e.target.value,
                        })
                      }
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
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          destinationContactPhone: e.target.value,
                        })
                      }
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
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        destinationOpeningHours: e.target.value,
                      })
                    }
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="saveDestinationData"
                  checked={formData.saveDestinationData}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      saveDestinationData: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                <Label
                  htmlFor="saveDestinationData"
                  className="text-sm flex items-center gap-1"
                >
                  <Save className="h-4 w-4" />
                  Save delivery details for future use
                </Label>
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pickupDate">Preferred Pickup Date</Label>
                <div className="relative">
                  <Input
                    id="pickupDate"
                    type="date"
                    value={formData.pickupDate}
                    onChange={(e) =>
                      setFormData({ ...formData, pickupDate: e.target.value })
                    }
                  />
                  {vehiclesLoading && formData.pickupDate && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                {formData.pickupDate &&
                  !vehiclesLoading &&
                  availableVehiclesData && (
                    <p className="text-sm text-green-600">
                      ✓ {availableVehiclesData.length} vehicles available for
                      this date
                    </p>
                  )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialInstructions">
                  Special Instructions (Optional)
                </Label>
                <Textarea
                  id="specialInstructions"
                  placeholder="Any special handling requirements, delivery instructions, or additional notes..."
                  value={formData.specialInstructions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specialInstructions: e.target.value,
                    })
                  }
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
                        : isCalculatingDistance
                        ? "Calculating distance..."
                        : "Distance will be calculated automatically"}
                    </span>
                  </div>
                  {(formData.distance === 0 || isCalculatingDistance) && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  )}
                </div>
                {formData.distance > 0 && (
                  <div className="mt-2 text-sm text-blue-700">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={calculateDistance}
                      disabled={isCalculatingDistance}
                      className="text-blue-600 border-blue-300 hover:bg-blue-100"
                    >
                      <RefreshCw
                        className={`h-3 w-3 mr-1 ${
                          isCalculatingDistance ? "animate-spin" : ""
                        }`}
                      />
                      Recalculate Distance
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={!validateStep(2)}
                className="flex-1 bg-gradient-primary hover:bg-primary-hover disabled:opacity-50"
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
              {t("createCargo.steps.vehicleSelection.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Vehicles Suitable for Your Cargo
                </h3>
                <p className="text-sm text-blue-700">
                  Showing {availableVehiclesList.length} vehicles with capacity
                  ≥ {formData.weight}kg available on {formData.pickupDate}
                </p>
              </div>

              {vehiclesLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        <Skeleton className="w-12 h-12 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="w-5 h-5 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !availableVehiclesData ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
                  <h3 className="text-lg font-semibold text-red-600">
                    {t("createCargo.steps.vehicleSelection.loadError")}
                  </h3>
                  <p className="text-red-500 mb-4">
                    No vehicles available for the selected date
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {t("common.retry")}
                  </Button>
                </div>
              ) : availableVehiclesList.length === 0 ? (
                <div className="text-center py-8">
                  <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground">
                    {t("createCargo.steps.vehicleSelection.noVehicles")}
                  </h3>
                  <p className="text-muted-foreground">
                    {t(
                      "createCargo.steps.vehicleSelection.noVehiclesDescription"
                    )}
                  </p>
                </div>
              ) : (
                <RadioGroup
                  value={formData.selectedVehicle}
                  onValueChange={(value) =>
                    setFormData({ ...formData, selectedVehicle: value })
                  }
                  className="space-y-4"
                >
                  {availableVehiclesList.map((vehicle) => {
                    // Get vehicle icon based on type
                    const getVehicleIcon = (type: string) => {
                      switch (type) {
                        case "moto":
                          return Bike;
                        case "truck":
                          return Truck;
                        case "van":
                          return Car;
                        case "pickup":
                          return Truck;
                        default:
                          return Truck;
                      }
                    };

                    const Icon = getVehicleIcon(vehicle.type);
                    return (
                      <div
                        key={vehicle.id}
                        className="border rounded-lg p-4 hover:border-primary transition-colors"
                      >
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
                              <h3 className="font-semibold text-foreground">
                                {vehicle.make} {vehicle.model}
                              </h3>
                              <div className="text-sm font-medium text-primary">
                                {vehicle.capacity_kg}kg
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <span className="font-medium">
                                  {vehicle.plate_number}
                                </span>
                              </span>
                              <span className="flex items-center gap-1">
                                <span>{vehicle.year}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="capitalize">
                                  {vehicle.type}
                                </span>
                              </span>
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
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="flex-1"
              >
                {t("common.back")}
              </Button>
              <Button
                onClick={handleNext}
                disabled={!validateStep(3) || vehiclesLoading}
                className="flex-1 bg-gradient-primary hover:bg-primary-hover disabled:opacity-50"
              >
                {t("createCargo.steps.vehicleSelection.getCostEstimate")}
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
              {t("createCargo.steps.confirmation.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Vehicle Summary */}
            {selectedVehicle && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  {(() => {
                    const Icon = selectedVehicle.type === "moto" ? Bike : Truck;
                    return <Icon className="h-5 w-5 text-blue-600" />;
                  })()}
                  <h3 className="font-semibold text-blue-900">
                    {t("createCargo.steps.confirmation.selectedVehicle", {
                      name: selectedVehicle.name,
                    })}
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">
                      {t("createCargo.steps.confirmation.capacity")}:
                    </span>
                    <span className="ml-2 font-medium">
                      {selectedVehicle.capacity} kg
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">
                      {t("createCargo.steps.confirmation.estimatedTime")}:
                    </span>
                    <span className="ml-2 font-medium">
                      {selectedVehicle.estimated_time}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Cost Breakdown */}
            <div className="bg-muted rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-foreground">
                {t("createCargo.steps.confirmation.costBreakdown")}
              </h3>
              {estimateCostMutation.isPending ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : estimateCostMutation.error ? (
                <div className="text-center py-4">
                  <AlertCircle className="h-8 w-8 mx-auto text-red-500 mb-2" />
                  <p className="text-red-600 text-sm">
                    {t("createCargo.steps.confirmation.costError")}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  {costBreakdown ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Base Cost</span>
                        <span>
                          RWF {costBreakdown.base_cost.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Weight Cost ({formData.weight}kg)
                        </span>
                        <span>
                          RWF {costBreakdown.weight_cost.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Distance Cost ({costBreakdown.total_distance_km}km)
                        </span>
                        <span>
                          RWF {costBreakdown.distance_cost.toLocaleString()}
                        </span>
                      </div>
                      {costBreakdown.category_multiplier > 1 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Category Multiplier (
                            {costBreakdown.category_multiplier}x)
                          </span>
                          <span>Applied</span>
                        </div>
                      )}
                      <div className="border-t border-border pt-2 flex justify-between font-semibold text-lg">
                        <span>
                          {t("createCargo.steps.confirmation.totalCost")}
                        </span>
                        <span className="text-primary">
                          RWF {estimatedCost.toLocaleString()}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">
                        Cost breakdown will be calculated after vehicle
                        selection
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">
                {t("createCargo.steps.confirmation.shipmentSummary")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">
                    {t("createCargo.steps.confirmation.cargoType")}
                  </p>
                  <p className="font-medium capitalize">
                    {formData.cargoType === "other"
                      ? formData.otherCargoType
                      : formData.cargoType}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    {t("createCargo.steps.confirmation.weight")}
                  </p>
                  <p className="font-medium">{formData.weight} kg</p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    {t("createCargo.steps.confirmation.vehicle")}
                  </p>
                  <p className="font-medium">{selectedVehicle?.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    {t("createCargo.steps.confirmation.distance")}
                  </p>
                  <p className="font-medium">{formData.distance} km</p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    {t("createCargo.steps.confirmation.dimensions")}
                  </p>
                  <p className="font-medium">
                    {formData.length && formData.width && formData.height
                      ? `${formData.length} × ${formData.width} × ${formData.height} cm`
                      : t("createCargo.steps.confirmation.notSpecified")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    {t("createCargo.steps.confirmation.urgency")}
                  </p>
                  <p className="font-medium capitalize">{formData.urgency}</p>
                </div>
              </div>

              {/* Location Details */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">
                  {t("createCargo.steps.confirmation.locationDetails")}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-600">
                        {t("createCargo.steps.confirmation.pickup")}
                      </span>
                    </div>
                    <p className="text-muted-foreground">
                      {formData.pickupAddress}
                    </p>
                    {formData.pickupContactName && (
                      <p className="text-xs text-muted-foreground">
                        {t("createCargo.steps.confirmation.contact")}:{" "}
                        {formData.pickupContactName} •{" "}
                        {formData.pickupContactPhone}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-red-600" />
                      <span className="font-medium text-red-600">
                        {t("createCargo.steps.confirmation.delivery")}
                      </span>
                    </div>
                    <p className="text-muted-foreground">
                      {formData.destinationAddress}
                    </p>
                    {formData.destinationContactName && (
                      <p className="text-xs text-muted-foreground">
                        {t("createCargo.steps.confirmation.contact")}:{" "}
                        {formData.destinationContactName} •{" "}
                        {formData.destinationContactPhone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(3)}
                className="flex-1"
              >
                {t("common.back")}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createCargoMutation.isPending}
                className="flex-1 bg-gradient-primary hover:bg-primary-hover disabled:opacity-50"
              >
                {createCargoMutation.isPending
                  ? t("common.loading")
                  : t("createCargo.steps.confirmation.proceedToPayment")}
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
                <h2 className="text-2xl font-bold text-foreground">
                  {t("createCargo.steps.success.title")}
                </h2>
                <p className="text-muted-foreground">
                  {t("createCargo.steps.success.description")}
                </p>
              </div>

              <div className="bg-muted rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t("createCargo.steps.success.cargoId")}
                  </span>
                  <span className="font-medium">{cargoId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t("createCargo.steps.success.vehicle")}
                  </span>
                  <span className="font-medium">{selectedVehicle?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t("createCargo.steps.success.totalAmount")}
                  </span>
                  <span className="font-bold">
                    RWF {estimatedCost.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t("createCargo.steps.success.status")}
                  </span>
                  <span className="text-green-600 font-medium">
                    {t("createCargo.steps.success.paymentConfirmed")}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full"
                  onClick={() => (window.location.href = "/my-cargos")}
                >
                  {t("createCargo.steps.success.viewMyCargos")}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => (window.location.href = "/create-cargo")}
                >
                  {t("createCargo.steps.success.createAnotherCargo")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
