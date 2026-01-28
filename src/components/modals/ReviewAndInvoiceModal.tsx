import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  Package,
  Edit3,
  FileText,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  useUpdateCargo,
  useCargoById,
  useEstimateCargoCost,
} from "@/lib/api/hooks/cargoHooks";
import { useCargoCategories } from "@/lib/api/hooks/cargoHooks";
import { useMyLocations } from "@/lib/api/hooks";
import { toast } from "sonner";
import NewInvoiceModal from "./NewInvoiceModal";
import ModernModel from "@/components/modal/ModernModel";
import {
  googleMapsService,
  GooglePlace,
} from "@/lib/services/googleMapsService";

interface ReviewAndInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (invoice: any) => void;
  preselectedCargoId?: string;
}

export default function ReviewAndInvoiceModal({
  isOpen,
  onClose,
  onSuccess,
  preselectedCargoId,
}: ReviewAndInvoiceModalProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [cargoData, setCargoData] = useState<any>(null);

  // Google Maps integration states
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
  const [calculatedDistance, setCalculatedDistance] = useState<number | null>(
    null
  );

  const [formData, setFormData] = useState({
    category_id: "",
    type: "",
    description: "",
    weight_kg: 0,
    volume: 0,
    dimensions: {
      length: 0,
      width: 0,
      height: 0,
    },
    pickup_location_id: "",
    pickup_address: "",
    pickup_contact: "",
    pickup_phone: "",
    pickup_instructions: "",
    pickupLat: "",
    pickupLng: "",
    destination_location_id: "",
    destination_address: "",
    destination_contact: "",
    destination_phone: "",
    delivery_instructions: "",
    destinationLat: "",
    destinationLng: "",
    special_requirements: "",
    insurance_required: false,
    insurance_amount: 0,
    fragile: false,
    temperature_controlled: false,
    priority: "normal" as "low" | "normal" | "high" | "urgent",
    pickup_date: "",
    estimated_cost: 0,
    distance_km: 1, // Default minimum distance
  });

  // API hooks
  const updateCargoMutation = useUpdateCargo();
  const estimateCostMutation = useEstimateCargoCost();
  const { data: cargoResponse } = useCargoById(preselectedCargoId || "");
  const { data: categoriesData } = useCargoCategories();
  const { data: myLocations } = useMyLocations();

  // Extract data
  const cargo = useMemo(() => cargoResponse as any, [cargoResponse]);
  const categories = useMemo(() => {
    console.log("🔍 Categories data:", categoriesData);
    return categoriesData || [];
  }, [categoriesData]);
  const locations = useMemo(
    () => (myLocations as any)?.data || [],
    [myLocations]
  );

  // Load cargo data when modal opens
  useEffect(() => {
    if (isOpen && cargo) {
      setCargoData(cargo);
      const initialFormData = {
        category_id: cargo.category_id || "",
        type: cargo.type || "",
        description: cargo.description || cargo.special_requirements || "",
        weight_kg: cargo.weight_kg || 0,
        volume: cargo.volume || 0,
        dimensions: cargo.dimensions || { length: 0, width: 0, height: 0 },
        pickup_location_id: cargo.pickup_location_id || "",
        pickup_address: cargo.pickup_address || "",
        pickup_contact: cargo.pickup_contact || "",
        pickup_phone: cargo.pickup_phone || "",
        pickup_instructions: cargo.pickup_instructions || "",
        pickupLat: cargo.pickupLat || "",
        pickupLng: cargo.pickupLng || "",
        destination_location_id: cargo.destination_location_id || "",
        destination_address: cargo.destination_address || "",
        destination_contact: cargo.destination_contact || "",
        destination_phone: cargo.destination_phone || "",
        delivery_instructions: cargo.delivery_instructions || "",
        destinationLat: cargo.destinationLat || "",
        destinationLng: cargo.destinationLng || "",
        special_requirements: cargo.special_requirements || "",
        insurance_required: cargo.insurance_required || false,
        insurance_amount: cargo.insurance_amount || 0,
        fragile: cargo.fragile || false,
        temperature_controlled: cargo.temperature_controlled || false,
        priority: cargo.priority || "normal",
        pickup_date: cargo.pickup_date ? cargo.pickup_date.split("T")[0] : "",
        estimated_cost: cargo.estimated_cost || 0,
        distance_km: Math.max(cargo.distance_km || 1, 1), // Ensure minimum 1km
      };

      setFormData(initialFormData);

      // Initialize the last calculated values to prevent unnecessary recalculation on load
      lastCalculatedValues.current = {
        weight_kg: initialFormData.weight_kg,
        distance_km: initialFormData.distance_km,
        category_id: initialFormData.category_id,
      };
    }
  }, [isOpen, cargo]);

  // Ref to track last calculated values to prevent unnecessary recalculations
  const lastCalculatedValues = useRef({
    weight_kg: 0,
    distance_km: 0,
    category_id: "",
  });

  // Stable cost calculation function
  const calculateCost = useCallback(
    (weight: number, distance: number, categoryId: string) => {
      estimateCostMutation.mutate(
        {
          weight_kg: weight,
          distance_km: distance,
          category_id: categoryId,
        },
        {
          onSuccess: (response) => {
            const estimatedCost = response.data?.estimated_cost || 0;
            setFormData((prev) => ({
              ...prev,
              estimated_cost: estimatedCost,
            }));
            console.log("✅ Auto-cost calculation successful:", estimatedCost);
          },
          onError: (error) => {
            console.error("❌ Auto-cost calculation failed:", error);
            // Don't show error toast for auto-calculation to avoid spam
          },
        }
      );
    },
    [estimateCostMutation]
  );

  // Auto-recalculate cost when cost-affecting fields change
  useEffect(() => {
    // Only auto-calculate if we have the minimum required data and cargo is loaded
    if (
      !cargo ||
      !formData.category_id ||
      !formData.weight_kg ||
      !formData.distance_km ||
      formData.weight_kg <= 0 ||
      formData.distance_km <= 0
    ) {
      return;
    }

    const currentDistance = Math.max(
      calculatedDistance || formData.distance_km || 1,
      1
    );

    // Check if values have actually changed
    const hasChanged =
      lastCalculatedValues.current.weight_kg !== formData.weight_kg ||
      lastCalculatedValues.current.distance_km !== currentDistance ||
      lastCalculatedValues.current.category_id !== formData.category_id;

    if (!hasChanged) {
      return;
    }

    // Update the last calculated values
    lastCalculatedValues.current = {
      weight_kg: formData.weight_kg,
      distance_km: currentDistance,
      category_id: formData.category_id,
    };

    // Debounce the cost calculation to avoid excessive API calls
    const timeoutId = setTimeout(() => {
      console.log("🔄 Auto-recalculating cost due to field changes", {
        weight: formData.weight_kg,
        distance: currentDistance,
        category: formData.category_id,
      });

      calculateCost(formData.weight_kg, currentDistance, formData.category_id);
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [
    formData.weight_kg,
    formData.distance_km,
    formData.category_id,
    calculatedDistance,
    cargo,
    calculateCost,
  ]);

  // Cleanup effect for timeouts and abort controllers (same as CreateCargoForm)
  useEffect(() => {
    const timeouts = searchTimeouts.current;
    const controllers = abortControllers.current;

    return () => {
      // Clear all timeouts
      timeouts.forEach((timeout) => clearTimeout(timeout));
      timeouts.clear();

      // Abort all pending requests
      controllers.forEach((controller) => controller.abort());
      controllers.clear();
    };
  }, []);

  // Handlers
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDimensionsChange = (dimension: string, value: number) => {
    setFormData((prev) => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [dimension]: value,
      },
    }));
  };

  // Performance optimization refs and state (same as CreateCargoForm)
  const searchCache = useRef<Map<string, GooglePlace[]>>(new Map());
  const searchTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const abortControllers = useRef<Map<string, AbortController>>(new Map());
  const lastSearchQueries = useRef<{ pickup: string; destination: string }>({
    pickup: "",
    destination: "",
  });

  // Actual search function with cancellation support (same as CreateCargoForm)
  const performSearch = useCallback(
    async (query: string, isPickup: boolean) => {
      if (!query.trim() || query.length < 2) {
        const setResults = isPickup
          ? setPickupSearchResults
          : setDestinationSearchResults;
        setResults([]);
        return;
      }

      // Skip if this is the same query as last search
      const lastQuery = isPickup
        ? lastSearchQueries.current.pickup
        : lastSearchQueries.current.destination;
      if (lastQuery === query) {
        return;
      }

      // Update last search query
      if (isPickup) {
        lastSearchQueries.current.pickup = query;
      } else {
        lastSearchQueries.current.destination = query;
      }

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

      // Create abort controller for this search
      const abortController = new AbortController();
      abortControllers.current.set(
        isPickup ? "pickup" : "destination",
        abortController
      );

      isSearching(true);

      try {
        const results = await googleMapsService.searchPlaces(query, "RW");

        // Check if request was aborted
        if (abortController.signal.aborted) {
          console.log(`🚫 Search aborted for: ${query}`);
          return;
        }

        console.log(
          `📥 Search results for ${isPickup ? "pickup" : "delivery"}:`,
          results
        );

        // Cache results
        searchCache.current.set(query.toLowerCase(), results);

        // Limit cache size to prevent memory issues
        if (searchCache.current.size > 50) {
          const firstKey = searchCache.current.keys().next().value;
          searchCache.current.delete(firstKey);
        }

        setResults(results);
        console.log(
          `✅ Search results set for ${isPickup ? "pickup" : "delivery"}:`,
          results.length,
          "results"
        );
      } catch (error) {
        if (abortController.signal.aborted) {
          console.log(`🚫 Search cancelled for: ${query}`);
          return;
        }

        console.error("Error searching location:", error);
        toast.error(
          "Failed to search location. Please check your Google Maps API key."
        );
        setResults([]);
      } finally {
        isSearching(false);
        // Clean up abort controller
        abortControllers.current.delete(isPickup ? "pickup" : "destination");
      }
    },
    []
  );

  // Debounced search function with caching and cancellation (same as CreateCargoForm)
  const debouncedSearch = useCallback(
    (query: string, isPickup: boolean, delay: number = 300) => {
      const searchKey = `${isPickup ? "pickup" : "destination"}-${query}`;

      // Clear previous timeout for this search type
      const existingTimeout = searchTimeouts.current.get(
        isPickup ? "pickup" : "destination"
      );
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Abort previous request for this search type
      const existingController = abortControllers.current.get(
        isPickup ? "pickup" : "destination"
      );
      if (existingController) {
        existingController.abort();
      }

      // Check cache first
      const cachedResults = searchCache.current.get(query.toLowerCase());
      if (cachedResults && cachedResults.length > 0) {
        console.log(
          `📦 Using cached results for: ${query}`,
          cachedResults.length,
          "results"
        );
        const setResults = isPickup
          ? setPickupSearchResults
          : setDestinationSearchResults;
        setResults(cachedResults);
        console.log(
          `✅ Cached results set for ${isPickup ? "pickup" : "delivery"}:`,
          cachedResults.length,
          "results"
        );
        return;
      }

      // Set up new timeout
      const timeout = setTimeout(async () => {
        await performSearch(query, isPickup);
      }, delay);

      searchTimeouts.current.set(isPickup ? "pickup" : "destination", timeout);
    },
    [performSearch]
  );

  // Optimized search function that uses debouncing and caching (same as CreateCargoForm)
  const searchLocation = useCallback(
    (query: string, isPickup: boolean) => {
      debouncedSearch(query, isPickup, 300);
    },
    [debouncedSearch]
  );

  // Select place from search results
  const selectPlace = async (place: GooglePlace, isPickup: boolean) => {
    try {
      const placeDetails = await googleMapsService.getPlaceDetails(
        place.place_id
      );

      if (!placeDetails) {
        toast.error("Failed to get location details");
        return;
      }

      const address = place.description;
      const lat = placeDetails.lat;
      const lng = placeDetails.lng;

      if (isPickup) {
        setFormData((prev) => ({
          ...prev,
          pickup_address: address,
          pickupLat: lat.toString(),
          pickupLng: lng.toString(),
        }));
        setPickupSearchQuery(address);
        setPickupSearchResults([]);
      } else {
        setFormData((prev) => ({
          ...prev,
          destination_address: address,
          destinationLat: lat.toString(),
          destinationLng: lng.toString(),
        }));
        setDestinationSearchQuery(address);
        setDestinationSearchResults([]);
      }

      // Calculate distance if both locations are set
      const currentFormData = isPickup
        ? {
            ...formData,
            pickup_address: address,
            pickupLat: lat.toString(),
            pickupLng: lng.toString(),
          }
        : {
            ...formData,
            destination_address: address,
            destinationLat: lat.toString(),
            destinationLng: lng.toString(),
          };

      if (currentFormData.pickupLat && currentFormData.destinationLat) {
        await calculateDistance(
          parseFloat(currentFormData.pickupLat),
          parseFloat(currentFormData.pickupLng),
          parseFloat(currentFormData.destinationLat),
          parseFloat(currentFormData.destinationLng)
        );
      }
    } catch (error) {
      console.error("Error selecting place:", error);
      toast.error("Failed to select location");
    }
  };

  // Calculate distance between two coordinates using same method as CreateCargoForm
  const calculateDistance = async (
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
        const distanceKm = Math.max(
          googleMapsService.metersToKilometers(result.distance),
          1
        ); // Use same method as CreateCargoForm, minimum 1km
        setCalculatedDistance(distanceKm);
        setFormData((prev) => ({
          ...prev,
          distance_km: distanceKm,
        }));
        toast.success(`Distance calculated: ${distanceKm.toFixed(2)} km`);
      }
    } catch (error) {
      console.error("Error calculating distance:", error);
      toast.error("Failed to calculate distance");
    } finally {
      setIsCalculatingDistance(false);
    }
  };

  const handleStep1Submit = async () => {
    if (!preselectedCargoId) return;

    try {
      // Prepare update data - only include changed fields
      const updateData: any = {};

      // Check each field and include only if changed
      if (formData.category_id !== cargo?.category_id)
        updateData.category_id = formData.category_id;
      if (formData.type !== cargo?.type) updateData.type = formData.type;
      if (
        formData.description !==
        (cargo?.description || cargo?.special_requirements)
      )
        updateData.description = formData.description;
      if (formData.weight_kg !== cargo?.weight_kg)
        updateData.weight_kg = formData.weight_kg;
      if (formData.volume !== cargo?.volume)
        updateData.volume = formData.volume;
      if (
        JSON.stringify(formData.dimensions) !==
        JSON.stringify(cargo?.dimensions)
      ) {
        updateData.dimensions = formData.dimensions;
      }
      if (formData.pickup_address !== cargo?.pickup_address)
        updateData.pickup_address = formData.pickup_address;
      if (formData.pickup_contact !== cargo?.pickup_contact)
        updateData.pickup_contact = formData.pickup_contact;
      if (formData.pickup_phone !== cargo?.pickup_phone)
        updateData.pickup_phone = formData.pickup_phone;
      if (formData.pickup_instructions !== cargo?.pickup_instructions)
        updateData.pickup_instructions = formData.pickup_instructions;
      if (formData.destination_address !== cargo?.destination_address)
        updateData.destination_address = formData.destination_address;
      if (formData.destination_contact !== cargo?.destination_contact)
        updateData.destination_contact = formData.destination_contact;
      if (formData.destination_phone !== cargo?.destination_phone)
        updateData.destination_phone = formData.destination_phone;
      if (formData.delivery_instructions !== cargo?.delivery_instructions)
        updateData.delivery_instructions = formData.delivery_instructions;
      if (formData.special_requirements !== cargo?.special_requirements)
        updateData.special_requirements = formData.special_requirements;
      if (formData.insurance_required !== cargo?.insurance_required)
        updateData.insurance_required = formData.insurance_required;
      if (formData.insurance_amount !== cargo?.insurance_amount)
        updateData.insurance_amount = formData.insurance_amount;
      if (formData.fragile !== cargo?.fragile)
        updateData.fragile = formData.fragile;
      if (formData.temperature_controlled !== cargo?.temperature_controlled)
        updateData.temperature_controlled = formData.temperature_controlled;
      if (formData.priority !== cargo?.priority)
        updateData.priority = formData.priority;
      if (
        formData.pickup_date !==
        (cargo?.pickup_date ? cargo.pickup_date.split("T")[0] : "")
      ) {
        updateData.pickup_date = formData.pickup_date
          ? `${formData.pickup_date}T10:00:00Z`
          : undefined;
      }
      if (formData.estimated_cost !== cargo?.estimated_cost)
        updateData.estimated_cost = formData.estimated_cost;
      if (formData.distance_km !== cargo?.distance_km)
        updateData.distance_km = formData.distance_km;

      // Only make API call if there are changes
      if (Object.keys(updateData).length > 0) {
        await updateCargoMutation.mutateAsync({
          id: preselectedCargoId,
          data: updateData,
        });
        toast.success("Cargo details updated successfully");
      }

      // Move to step 2
      setCurrentStep(2);
    } catch (error: any) {
      toast.error(error.message || "Failed to update cargo details");
    }
  };

  const handleInvoiceCreated = (invoice: any) => {
    onSuccess?.(invoice);
    onClose();
  };

  const handleClose = () => {
    setCurrentStep(1);
    setCargoData(null);
    onClose();
  };

  // Debug logging
  console.log("🔍 ReviewAndInvoiceModal Debug:");
  console.log("isOpen:", isOpen);
  console.log("preselectedCargoId:", preselectedCargoId);
  console.log("cargo:", cargo);

  if (!isOpen) {
    return null;
  }

  // Show loading state while cargo is being fetched
  if (!cargo) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cargo details...</p>
        </div>
      </div>
    );
  }

  return (
    <ModernModel isOpen={isOpen} onClose={onClose} title="Review and Invoicing">
      <div className="space-y-8">
        {/* Enhanced Step Indicator */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-center justify-center space-x-6">
            <div
              className={`flex items-center space-x-3 transition-all duration-300 ${
                currentStep >= 1 ? "text-blue-700" : "text-gray-400"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                  currentStep >= 1
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-200"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {currentStep > 1 ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <Edit3 className="w-6 h-6" />
                )}
              </div>
              <div className="text-center">
                <span className="font-semibold text-sm">Review & Edit</span>
                <p className="text-xs text-gray-500 mt-1">
                  Update cargo details
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <div
                className={`w-12 h-1 rounded-full transition-all duration-500 ${
                  currentStep >= 2
                    ? "bg-gradient-to-r from-blue-600 to-blue-700"
                    : "bg-gray-200"
                }`}
              />
            </div>

            <div
              className={`flex items-center space-x-3 transition-all duration-300 ${
                currentStep >= 2 ? "text-blue-700" : "text-gray-400"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                  currentStep >= 2
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-200"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                <FileText className="w-6 h-6" />
              </div>
              <div className="text-center">
                <span className="font-semibold text-sm">Create Invoice</span>
                <p className="text-xs text-gray-500 mt-1">Generate billing</p>
              </div>
            </div>
          </div>
        </div>

        {currentStep === 1 ? (
          <div className="space-y-8">
            {/* Cargo Overview – single section, clear data */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
                <Package className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Cargo Overview
                </h3>
              </div>
              <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-sm">
                <div>
                  <dt className="text-gray-500 font-medium mb-0.5">Cargo number</dt>
                  <dd className="text-gray-900 font-mono font-semibold">{cargo.cargo_number}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 font-medium mb-0.5">Client</dt>
                  <dd className="text-gray-900 font-medium">
                    {(cargo as any)?.client?.user?.full_name || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 font-medium mb-0.5">Status</dt>
                  <dd>
                    <Badge variant="outline" className="text-xs font-medium">
                      {cargo.status}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 font-medium mb-0.5">Priority</dt>
                  <dd>
                    <Badge
                      className={`text-xs font-medium ${
                        cargo.priority === "urgent"
                          ? "bg-red-100 text-red-700 border-red-200"
                          : cargo.priority === "high"
                          ? "bg-orange-100 text-orange-700 border-orange-200"
                          : cargo.priority === "normal"
                          ? "bg-blue-100 text-blue-700 border-blue-200"
                          : "bg-gray-100 text-gray-700 border-gray-200"
                      }`}
                    >
                      {cargo.priority?.toUpperCase()}
                    </Badge>
                  </dd>
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <dt className="text-gray-500 font-medium mb-0.5">Route</dt>
                  <dd className="text-gray-900 mt-1 space-y-1">
                    <p className="font-medium">Pickup: {cargo.pickup_address || "—"}</p>
                    <p className="font-medium">Delivery: {cargo.destination_address || "—"}</p>
                  </dd>
                </div>
              </dl>
            </div>

            {/* Enhanced Editable Cargo Details */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Edit3 className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Edit Cargo Details
                    </h3>
                    <p className="text-gray-600 text-sm font-normal">
                      Update shipment information
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {/* Basic Information */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <h4 className="font-semibold text-gray-800 text-lg">
                      Basic Information
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label
                        htmlFor="category"
                        className="text-sm font-medium text-gray-700"
                      >
                        Category *
                      </Label>
                      <Select
                        value={formData.category_id}
                        onValueChange={(value) =>
                          handleInputChange("category_id", value)
                        }
                      >
                        <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select category..." />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category: any) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="type"
                        className="text-sm font-medium text-gray-700"
                      >
                        Type
                      </Label>
                      <Input
                        id="type"
                        value={formData.type}
                        onChange={(e) =>
                          handleInputChange("type", e.target.value)
                        }
                        placeholder="e.g., Electronics, Furniture"
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-3 md:col-span-2">
                      <Label
                        htmlFor="description"
                        className="text-sm font-medium text-gray-700"
                      >
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        placeholder="Detailed description of the cargo"
                        rows={3}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Physical Properties */}
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <h4 className="font-semibold text-gray-800 text-lg">
                      Physical Properties
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="space-y-3">
                      <Label
                        htmlFor="weight"
                        className="text-sm font-medium text-gray-700"
                      >
                        Weight (kg) *
                      </Label>
                      <Input
                        id="weight"
                        type="number"
                        min="0"
                        step="0.1"
                        value={formData.weight_kg}
                        onChange={(e) =>
                          handleInputChange(
                            "weight_kg",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="0.0"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="volume"
                        className="text-sm font-medium text-gray-700"
                      >
                        Volume (m³)
                      </Label>
                      <Input
                        id="volume"
                        type="number"
                        min="0"
                        step="0.1"
                        value={formData.volume}
                        onChange={(e) =>
                          handleInputChange(
                            "volume",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="0.0"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="distance"
                        className="text-sm font-medium text-gray-700"
                      >
                        Distance (km) *
                      </Label>
                      <Input
                        id="distance"
                        type="number"
                        min="0"
                        step="0.1"
                        value={formData.distance_km}
                        onChange={(e) =>
                          handleInputChange(
                            "distance_km",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="0.0"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">
                      Dimensions (cm)
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Input
                          placeholder="Length"
                          type="number"
                          min="0"
                          value={formData.dimensions.length}
                          onChange={(e) =>
                            handleDimensionsChange(
                              "length",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Input
                          placeholder="Width"
                          type="number"
                          min="0"
                          value={formData.dimensions.width}
                          onChange={(e) =>
                            handleDimensionsChange(
                              "width",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Input
                          placeholder="Height"
                          type="number"
                          min="0"
                          value={formData.dimensions.height}
                          onChange={(e) =>
                            handleDimensionsChange(
                              "height",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <h4 className="font-semibold text-gray-800 text-lg">
                      Location Information
                    </h4>
                  </div>

                  {/* Pickup Location */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <h5 className="font-medium text-gray-800">
                        📍 Pickup Location
                      </h5>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-3">
                        <Label
                          htmlFor="pickup_address"
                          className="text-sm font-medium text-gray-700"
                        >
                          Pickup Address *
                        </Label>
                        <div className="relative">
                          <Input
                            id="pickup_address"
                            value={pickupSearchQuery || formData.pickup_address}
                            onChange={(e) => {
                              const value = e.target.value;
                              setPickupSearchQuery(value);
                              if (value.length > 2) {
                                searchLocation(value, true);
                              } else {
                                setPickupSearchResults([]);
                              }
                            }}
                            placeholder="Search pickup location..."
                            className="h-11 pr-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          />
                          {isSearchingPickup && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            </div>
                          )}
                        </div>

                        {pickupSearchResults.length > 0 && (
                          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] max-h-48 overflow-y-auto">
                            {pickupSearchResults.map((place) => (
                              <div
                                key={place.place_id}
                                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                onClick={() => selectPlace(place, true)}
                              >
                                <div className="font-medium">
                                  {place.structured_formatting.main_text}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {place.structured_formatting.secondary_text}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <Label
                            htmlFor="pickup_contact"
                            className="text-sm font-medium text-gray-700"
                          >
                            Pickup Contact (Read-only)
                          </Label>
                          <Input
                            id="pickup_contact"
                            value={formData.pickup_contact}
                            readOnly
                            className="h-11 bg-gray-50 border-gray-200"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label
                            htmlFor="pickup_phone"
                            className="text-sm font-medium text-gray-700"
                          >
                            Pickup Phone (Read-only)
                          </Label>
                          <Input
                            id="pickup_phone"
                            value={formData.pickup_phone}
                            readOnly
                            className="h-11 bg-gray-50 border-gray-200"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Destination Location */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <h5 className="font-medium text-gray-800">
                        🎯 Destination Location
                      </h5>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-3">
                        <Label
                          htmlFor="destination_address"
                          className="text-sm font-medium text-gray-700"
                        >
                          Destination Address *
                        </Label>
                        <div className="relative">
                          <Input
                            id="destination_address"
                            value={
                              destinationSearchQuery ||
                              formData.destination_address
                            }
                            onChange={(e) => {
                              const value = e.target.value;
                              setDestinationSearchQuery(value);
                              if (value.length > 2) {
                                searchLocation(value, false);
                              } else {
                                setDestinationSearchResults([]);
                              }
                            }}
                            placeholder="Search destination location..."
                            className="h-11 pr-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          />
                          {isSearchingDestination && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            </div>
                          )}
                        </div>

                        {destinationSearchResults.length > 0 && (
                          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] max-h-48 overflow-y-auto">
                            {destinationSearchResults.map((place) => (
                              <div
                                key={place.place_id}
                                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                onClick={() => selectPlace(place, false)}
                              >
                                <div className="font-medium">
                                  {place.structured_formatting.main_text}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {place.structured_formatting.secondary_text}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <Label
                            htmlFor="destination_contact"
                            className="text-sm font-medium text-gray-700"
                          >
                            Destination Contact (Read-only)
                          </Label>
                          <Input
                            id="destination_contact"
                            value={formData.destination_contact}
                            readOnly
                            className="h-11 bg-gray-50 border-gray-200"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label
                            htmlFor="destination_phone"
                            className="text-sm font-medium text-gray-700"
                          >
                            Destination Phone (Read-only)
                          </Label>
                          <Input
                            id="destination_phone"
                            value={formData.destination_phone}
                            readOnly
                            className="h-11 bg-gray-50 border-gray-200"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Distance Calculation */}
                  {formData.pickupLat && formData.destinationLat && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <h5 className="font-medium text-gray-800">
                          📏 Distance Calculation
                        </h5>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (formData.pickupLat && formData.destinationLat) {
                              calculateDistance(
                                parseFloat(formData.pickupLat),
                                parseFloat(formData.pickupLng),
                                parseFloat(formData.destinationLat),
                                parseFloat(formData.destinationLng)
                              );
                            }
                          }}
                          disabled={isCalculatingDistance}
                          className="h-9 border-blue-300 text-blue-700 hover:bg-blue-50"
                        >
                          {isCalculatingDistance
                            ? "Calculating..."
                            : "Recalculate Distance"}
                        </Button>
                        {calculatedDistance && (
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-blue-600">
                              📏 {calculatedDistance.toFixed(2)} km
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Special Requirements */}
                <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <h4 className="font-semibold text-gray-800 text-lg">
                      Special Requirements
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <Switch
                          id="fragile"
                          checked={formData.fragile}
                          onCheckedChange={(checked) =>
                            handleInputChange("fragile", checked)
                          }
                        />
                        <div>
                          <Label
                            htmlFor="fragile"
                            className="text-sm font-medium text-gray-700"
                          >
                            Fragile Items
                          </Label>
                          <p className="text-xs text-gray-500">
                            Handle with extra care
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <Switch
                          id="temperature_controlled"
                          checked={formData.temperature_controlled}
                          onCheckedChange={(checked) =>
                            handleInputChange("temperature_controlled", checked)
                          }
                        />
                        <div>
                          <Label
                            htmlFor="temperature_controlled"
                            className="text-sm font-medium text-gray-700"
                          >
                            Temperature Controlled
                          </Label>
                          <p className="text-xs text-gray-500">
                            Requires climate control
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200 md:col-span-2">
                      <div className="flex items-center space-x-3">
                        <Switch
                          id="insurance_required"
                          checked={formData.insurance_required}
                          onCheckedChange={(checked) =>
                            handleInputChange("insurance_required", checked)
                          }
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor="insurance_required"
                            className="text-sm font-medium text-gray-700"
                          >
                            Insurance Required
                          </Label>
                          <p className="text-xs text-gray-500">
                            Additional protection coverage
                          </p>
                        </div>
                      </div>

                      {formData.insurance_required && (
                        <div className="mt-4 space-y-3">
                          <Label
                            htmlFor="insurance_amount"
                            className="text-sm font-medium text-gray-700"
                          >
                            Insurance Amount (RWF)
                          </Label>
                          <Input
                            id="insurance_amount"
                            type="number"
                            min="0"
                            value={formData.insurance_amount}
                            onChange={(e) =>
                              handleInputChange(
                                "insurance_amount",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="0"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="special_requirements"
                      className="text-sm font-medium text-gray-700"
                    >
                      Special Requirements
                    </Label>
                    <Textarea
                      id="special_requirements"
                      value={formData.special_requirements}
                      onChange={(e) =>
                        handleInputChange(
                          "special_requirements",
                          e.target.value
                        )
                      }
                      placeholder="Any special handling requirements..."
                      rows={3}
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                    />
                  </div>
                </div>

                {/* Priority and Dates */}
                <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <h4 className="font-semibold text-gray-800 text-lg">
                      Priority & Scheduling
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label
                        htmlFor="priority"
                        className="text-sm font-medium text-gray-700"
                      >
                        Priority Level *
                      </Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) =>
                          handleInputChange("priority", value)
                        }
                      >
                        <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                              Low Priority
                            </div>
                          </SelectItem>
                          <SelectItem value="normal">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                              Normal Priority
                            </div>
                          </SelectItem>
                          <SelectItem value="high">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                              High Priority
                            </div>
                          </SelectItem>
                          <SelectItem value="urgent">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                              Urgent Priority
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="pickup_date"
                        className="text-sm font-medium text-gray-700"
                      >
                        Pickup Date *
                      </Label>
                      <Input
                        id="pickup_date"
                        type="date"
                        value={formData.pickup_date}
                        onChange={(e) =>
                          handleInputChange("pickup_date", e.target.value)
                        }
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Enhanced Step 1 Actions */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="h-11 px-6 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleStep1Submit}
                  disabled={updateCargoMutation.isPending}
                  className="h-11 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
                >
                  {updateCargoMutation.isPending
                    ? "Updating..."
                    : "Continue to Invoice"}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Enhanced Step 2: Invoice Creation */}
            <div className="hidden  bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-8 border border-green-100 text-center">
              {/* <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    Create Invoice
                  </h3>
                  <p className="text-green-600 font-medium">Step 2 of 2</p>
                </div>
              </div> */}
              {/* <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                ✅ Cargo details have been successfully updated. Now you can
                create the invoice for this shipment.
              </p> */}
            </div>

            {!cargo ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">
                    Loading cargo details for invoice...
                  </p>
                </div>
              </div>
            ) : (
              <NewInvoiceModal
                isOpen={true}
                onClose={() => setCurrentStep(1)}
                onSuccess={handleInvoiceCreated}
                preselectedCargoId={preselectedCargoId}
              />
            )}

            {/* Enhanced Step 2 Actions */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="h-11 px-6 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to Review
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="h-11 px-6 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModernModel>
  );
}
