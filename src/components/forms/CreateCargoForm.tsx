import { useState, useCallback, useRef, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  useCreateCargo,
  useEstimateCargoCost,
  useCargoCategories,
  useMyLocations,
  useCreateLocation,
} from "@/lib/api/hooks";
import { useActiveDistricts, useDistrict } from "@/lib/api/hooks/districtHooks";
import {
  CreateCargoRequest,
  CargoPriority,
  Location,
  LocationType,
} from "@/types/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw, Check, ChevronsUpDown } from "lucide-react";
import {
  MapPin,
  Package,
  Calculator,
  ArrowRight,
  Clock,
  CheckCircle,
  Search,
  User,
  Phone,
  Save,
  Calendar,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import {
  googleMapsService,
  GooglePlace,
} from "@/lib/services/googleMapsService";
import { motion } from "framer-motion";

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
    pickupDistrictId: "", // Add district selection
    destinationAddress: "",
    destinationContactName: "",
    destinationContactPhone: "",
    destinationOpeningHours: "",
    destinationLat: "",
    destinationLng: "",
    destinationDistrictId: "", // Add district selection
    pickupDate: "",
    specialInstructions: "",
    urgency: "standard",
    distance: 0,
    savePickupData: false,
    saveDestinationData: false,
    // Location selection toggles
    useExistingPickupLocation: false,
    useExistingDestinationLocation: false,
    selectedPickupLocationId: "",
    selectedDestinationLocationId: "",
    // New location creation data
    newPickupLocationName: "",
    newDestinationLocationName: "",
  });

  const [estimatedCost, setEstimatedCost] = useState(0);
  const [pickupBranchId, setPickupBranchId] = useState<string | null>(null);
  const [costBreakdown, setCostBreakdown] = useState<{
    base_cost: number;
    weight_cost: number;
    distance_cost: number;
    category_multiplier: number;
    total_distance_km: number;
    currency: string;
  } | null>(null);
  const [cargoData, setCargoData] = useState<{
    id: string;
    cargo_number: string;
  } | null>(null);
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
  // Location search states
  const [pickupLocationSearch, setPickupLocationSearch] = useState("");
  const [destinationLocationSearch, setDestinationLocationSearch] =
    useState("");

  // Search states for dropdowns
  const [cargoCategorySearch, setCargoCategorySearch] = useState("");
  const [pickupDistrictSearch, setPickupDistrictSearch] = useState("");
  const [destinationDistrictSearch, setDestinationDistrictSearch] =
    useState("");

  // Combobox open states
  const [cargoCategoryOpen, setCargoCategoryOpen] = useState(false);
  const [pickupDistrictOpen, setPickupDistrictOpen] = useState(false);
  const [destinationDistrictOpen, setDestinationDistrictOpen] = useState(false);
  const [pickupLocationOpen, setPickupLocationOpen] = useState(false);
  const [destinationLocationOpen, setDestinationLocationOpen] = useState(false);

  // Performance optimization refs and state
  const searchCache = useRef<Map<string, GooglePlace[]>>(new Map());
  const searchTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const abortControllers = useRef<Map<string, AbortController>>(new Map());
  const lastSearchQueries = useRef<{ pickup: string; destination: string }>({
    pickup: "",
    destination: "",
  });

  // API hooks
  const createCargoMutation = useCreateCargo();
  const { data: cargoCategories } = useCargoCategories({ is_active: true });
  const { data: myLocations } = useMyLocations();
  const { data: districts } = useActiveDistricts();
  const createLocationMutation = useCreateLocation();
  const estimateCostMutation = useEstimateCargoCost();

  // Get district details for branch_id resolution
  const { data: pickupDistrict } = useDistrict(formData.pickupDistrictId);

  // Update branch_id when pickup district changes
  useEffect(() => {
    if (pickupDistrict?.branch_id) {
      setPickupBranchId(pickupDistrict.branch_id);
    } else {
      setPickupBranchId(null);
    }
  }, [pickupDistrict]);

  // Cleanup effect for timeouts and abort controllers
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

  // Actual search function with cancellation support
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

  // Debounced search function with caching and cancellation
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
        console.log(`📦 Using cached results for: ${query}`);
        const setResults = isPickup
          ? setPickupSearchResults
          : setDestinationSearchResults;
        setResults(cachedResults);
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

  // Form validation function
  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1: // Cargo Details
        return !!(
          (
            formData.cargoType &&
            formData.cargoCategoryId &&
            formData.weight &&
            parseFloat(formData.weight) > 0 &&
            (!formData.description || formData.description.length <= 1000)
          ) // Optional but max 1000 chars
        );
      case 2: {
        // Locations
        const hasPickupLocation = formData.useExistingPickupLocation
          ? !!formData.selectedPickupLocationId
          : !!(
              formData.pickupAddress &&
              formData.pickupAddress.length >= 5 &&
              formData.pickupDistrictId
            );
        const hasDestinationLocation = formData.useExistingDestinationLocation
          ? !!formData.selectedDestinationLocationId
          : !!(
              formData.destinationAddress &&
              formData.destinationAddress.length >= 5 &&
              formData.destinationDistrictId
            );
        return (
          hasPickupLocation && hasDestinationLocation && !!formData.pickupDate
        );
      }
      case 3: // Confirmation
        return true; // No validation needed for confirmation
      default:
        return false;
    }
  };

  // Validation functions for individual fields
  const validatePhoneNumber = (phone: string): boolean => {
    if (!phone) return true; // Optional field
    const phoneRegex = /^[+]?[0-9\s\-()]{7,20}$/;
    return phoneRegex.test(phone);
  };

  const validateLocationName = (name: string): boolean => {
    return name.length >= 2 && name.length <= 100;
  };

  const validateAddress = (address: string): boolean => {
    return address.length >= 5 && address.length <= 500;
  };

  // Filter locations based on search query
  const filterLocations = (
    locations: Location[],
    searchQuery: string,
    locationType: LocationType
  ) => {
    if (!searchQuery.trim()) {
      return locations.filter(
        (loc) =>
          loc.type === locationType ||
          (locationType === LocationType.PICKUP_POINT &&
            loc.type === LocationType.WAREHOUSE) ||
          (locationType === LocationType.DELIVERY_POINT &&
            loc.type === LocationType.WAREHOUSE)
      );
    }

    const query = searchQuery.toLowerCase();
    return locations.filter((loc) => {
      const matchesType =
        loc.type === locationType ||
        (locationType === LocationType.PICKUP_POINT &&
          loc.type === LocationType.WAREHOUSE) ||
        (locationType === LocationType.DELIVERY_POINT &&
          loc.type === LocationType.WAREHOUSE);

      const matchesSearch =
        loc.name.toLowerCase().includes(query) ||
        loc.address.toLowerCase().includes(query) ||
        (loc.city && loc.city.toLowerCase().includes(query)) ||
        (loc.contact_person &&
          loc.contact_person.toLowerCase().includes(query));

      return matchesType && matchesSearch;
    });
  };

  // Filter cargo categories based on search query
  const filterCargoCategories = (categories: any[], searchQuery: string) => {
    if (!searchQuery.trim()) {
      return categories;
    }

    const query = searchQuery.toLowerCase();
    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(query) ||
        (category.description &&
          category.description.toLowerCase().includes(query))
    );
  };

  // Filter districts based on search query
  const filterDistricts = (districts: any[], searchQuery: string) => {
    if (!searchQuery.trim()) {
      return districts;
    }

    const query = searchQuery.toLowerCase();
    return districts.filter(
      (district) =>
        district.name.toLowerCase().includes(query) ||
        (district.province && district.province.toLowerCase().includes(query))
    );
  };

  // Handle existing location selection
  const handleExistingLocationSelect = (
    locationId: string,
    isPickup: boolean
  ) => {
    const location = myLocations?.find((loc) => loc.id === locationId);
    if (!location) return;

    const updateData = {
      ...formData,
      ...(isPickup
        ? {
            selectedPickupLocationId: locationId,
            pickupAddress: location.address,
            pickupContactName: location.contact_person || "",
            pickupContactPhone: location.contact_phone || "",
            pickupLat: location.latitude?.toString() || "",
            pickupLng: location.longitude?.toString() || "",
            pickupDistrictId: location.district_id || "",
            newPickupLocationName: location.name,
          }
        : {
            selectedDestinationLocationId: locationId,
            destinationAddress: location.address,
            destinationContactName: location.contact_person || "",
            destinationContactPhone: location.contact_phone || "",
            destinationLat: location.latitude?.toString() || "",
            destinationLng: location.longitude?.toString() || "",
            destinationDistrictId: location.district_id || "",
            newDestinationLocationName: location.name,
          }),
    };

    setFormData(updateData);

    // Calculate distance if both locations are set
    if (updateData.pickupLat && updateData.destinationLat) {
      calculateDistanceBetweenLocations(
        parseFloat(updateData.pickupLat),
        parseFloat(updateData.pickupLng),
        parseFloat(updateData.destinationLat),
        parseFloat(updateData.destinationLng)
      );
    }
  };

  // Create new location
  const createNewLocation = async (
    isPickup: boolean
  ): Promise<string | null> => {
    try {
      const locationName = isPickup
        ? formData.newPickupLocationName
        : formData.newDestinationLocationName;
      const address = isPickup
        ? formData.pickupAddress
        : formData.destinationAddress;
      const lat = isPickup
        ? parseFloat(formData.pickupLat)
        : parseFloat(formData.destinationLat);
      const lng = isPickup
        ? parseFloat(formData.pickupLng)
        : parseFloat(formData.destinationLng);
      const districtId = isPickup
        ? formData.pickupDistrictId
        : formData.destinationDistrictId;

      // Validate required fields
      if (!address || address.length < 5) {
        toast.error(`${isPickup ? "Pickup" : "Delivery"} address is required`);
        return null;
      }

      if (!districtId) {
        toast.error(`${isPickup ? "Pickup" : "Delivery"} district is required`);
        return null;
      }

      if (!lat || !lng) {
        toast.error(
          `${isPickup ? "Pickup" : "Delivery"} coordinates are required`
        );
        return null;
      }

      const locationData = {
        name: locationName || `${isPickup ? "Pickup" : "Delivery"} Location`, // Default name if not provided
        type: isPickup
          ? LocationType.PICKUP_POINT
          : LocationType.DELIVERY_POINT,
        address: address,
        city: "", // Could be extracted from address if needed
        country: "Rwanda", // Default country
        latitude: lat,
        longitude: lng,
        district_id: districtId, // Add district ID
        contact_person: isPickup
          ? formData.pickupContactName
          : formData.destinationContactName,
        contact_phone: isPickup
          ? formData.pickupContactPhone
          : formData.destinationContactPhone,
        is_active: true,
      };

      console.log(
        `Creating ${isPickup ? "pickup" : "delivery"} location:`,
        locationData
      );
      console.log(`District ID being sent:`, districtId);
      console.log(`Full location data:`, JSON.stringify(locationData, null, 2));

      const result = await createLocationMutation.mutateAsync(locationData);
      console.log(`Location created successfully:`, result.data);
      return result.data?.id || null;
    } catch (error) {
      console.error("Error creating location:", error);
      toast.error("Failed to create location. Please try again.");
      return null;
    }
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
        const weightRate = 500; // RWF per kg
        const urgencyMultiplier = formData.urgency === "urgent" ? 1.5 : 1;
        const distance = formData.distance || 25; // km
        const baseRate = 2000; // RWF per km
        const cost =
          (baseRate * distance +
            weightRate * parseFloat(formData.weight || "0")) *
          urgencyMultiplier;
        setEstimatedCost(cost);
      }
    }
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    try {
      // Create locations if needed
      let pickupLocationId = formData.selectedPickupLocationId;
      let destinationLocationId = formData.selectedDestinationLocationId;

      // Create pickup location if using new location (not existing)
      if (!formData.useExistingPickupLocation) {
        pickupLocationId = await createNewLocation(true);
        if (!pickupLocationId) {
          toast.error("Failed to create pickup location");
          return;
        }
      }

      // Create destination location if using new location (not existing)
      if (!formData.useExistingDestinationLocation) {
        destinationLocationId = await createNewLocation(false);
        if (!destinationLocationId) {
          toast.error("Failed to create destination location");
          return;
        }
      }

      const cargoRequest: CreateCargoRequest & { distance_km?: number } = {
        category_id: formData.cargoCategoryId || undefined,
        type:
          formData.cargoType === "other"
            ? formData.otherCargoType
            : formData.cargoType,
        weight_kg: parseFloat(formData.weight),
        volume:
          (parseFloat(formData.length || "0") *
            parseFloat(formData.width || "0") *
            parseFloat(formData.height || "0")) /
          1000000, // Convert cm³ to m³
        dimensions: {
          length: parseFloat(formData.length || "0"),
          width: parseFloat(formData.width || "0"),
          height: parseFloat(formData.height || "0"),
        },
        pickup_location_id: pickupLocationId || undefined,
        pickup_address: formData.pickupAddress,
        pickup_contact: formData.pickupContactName,
        pickup_phone: formData.pickupContactPhone,
        pickup_instructions: formData.pickupOpeningHours,
        destination_location_id: destinationLocationId || undefined,
        destination_address: formData.destinationAddress,
        destination_contact: formData.destinationContactName,
        destination_phone: formData.destinationContactPhone,
        delivery_instructions: formData.destinationOpeningHours,
        special_requirements: formData.specialInstructions,
        description: formData.description || undefined,
        insurance_required: false, // Default values
        insurance_amount: 0,
        fragile: false,
        temperature_controlled: false,
        priority:
          formData.urgency === "standard"
            ? CargoPriority.NORMAL
            : formData.urgency === "express"
            ? CargoPriority.HIGH
            : CargoPriority.URGENT,
        pickup_date: formData.pickupDate,
        estimated_cost: estimatedCost,
        distance_km: formData.distance || 0, // Include calculated distance
        branch_id: pickupBranchId || undefined, // Include branch_id from pickup location district
      };

      console.log("🚚 Creating cargo with distance:", formData.distance, "km");
      console.log("🏢 Creating cargo with branch_id:", pickupBranchId);

      const result = await createCargoMutation.mutateAsync(cargoRequest);

      // Handle cargo creation response
      if (result.success && result.data) {
        // Store cargo data
        setCargoData({
          id: result.data.id,
          cargo_number: result.data.cargo_number,
        });

        toast.success(t("createCargo.success"));
        setStep(4); // Go directly to success step
      } else {
        throw new Error(result.message || "Failed to create cargo");
      }
    } catch (error) {
      console.error("Error creating cargo:", error);
      toast.error(t("createCargo.error"));
    }
  };

  // Optimized search function that uses debouncing and caching
  const searchLocation = useCallback(
    (query: string, isPickup: boolean) => {
      debouncedSearch(query, isPickup, 300);
    },
    [debouncedSearch]
  );

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

  // Optimized distance calculation with caching and debouncing
  const distanceCache = useRef<Map<string, number>>(new Map());
  const distanceTimeout = useRef<NodeJS.Timeout | null>(null);

  const calculateDistanceBetweenLocations = useCallback(
    async (
      pickupLat: number,
      pickupLng: number,
      destinationLat: number,
      destinationLng: number
    ) => {
      // Create cache key for this distance calculation
      const cacheKey = `${pickupLat.toFixed(4)},${pickupLng.toFixed(
        4
      )}-${destinationLat.toFixed(4)},${destinationLng.toFixed(4)}`;

      // Check cache first
      const cachedDistance = distanceCache.current.get(cacheKey);
      if (cachedDistance) {
        console.log(`📦 Using cached distance: ${cachedDistance} km`);
        setFormData((prev) => ({ ...prev, distance: cachedDistance }));
        return;
      }

      // Clear previous timeout
      if (distanceTimeout.current) {
        clearTimeout(distanceTimeout.current);
      }

      // Debounce distance calculation
      distanceTimeout.current = setTimeout(async () => {
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

            // Cache the result
            distanceCache.current.set(cacheKey, distanceKm);

            // Limit cache size
            if (distanceCache.current.size > 20) {
              const firstKey = distanceCache.current.keys().next().value;
              distanceCache.current.delete(firstKey);
            }

            setFormData((prev) => ({ ...prev, distance: distanceKm }));
            console.log(`📏 Distance calculated: ${distanceKm} km`);
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
      }, 500); // 500ms debounce for distance calculation
    },
    []
  );

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
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
      {/* Enhanced Progress Bar - Mobile Responsive */}
      <motion.div
        className="flex items-center justify-between mb-6 sm:mb-8 overflow-x-auto p-2 sm:p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {[1, 2, 3, 4].map((number) => (
          <div key={number} className="flex items-center flex-shrink-0">
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 shadow-md ${
                step === number
                  ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white ring-2 sm:ring-4 ring-blue-200 scale-110" // Current step
                  : step > number
                  ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white" // Completed step
                  : "bg-gray-100 text-gray-400" // Future step
              }`}
            >
              {number === 4 ? (
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
              ) : (
                number
              )}
            </div>
            {number < 4 && (
              <div
                className={`w-6 sm:w-12 md:w-16 h-1.5 sm:h-2 mx-1 sm:mx-2 md:mx-3 transition-all duration-300 rounded-full ${
                  step > number
                    ? "bg-gradient-to-r from-green-500 to-emerald-600" // Completed line
                    : "bg-gray-200" // Future line
                }`}
              />
            )}
          </div>
        ))}
      </motion.div>

      {/* Step 1: Cargo Details */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="card-elevated border-0 shadow-xl bg-white/95 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Package className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                {t("createCargo.steps.cargoDetails.title")}
              </CardTitle>
              <div className="bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-xs sm:text-sm font-semibold text-blue-700">
                    {t("createCargo.requiredFieldsNote")}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="cargoType" className="text-sm font-semibold text-gray-700">
                  {t("createCargo.steps.cargoDetails.cargoType")}{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between rounded-full px-4 py-3 h-auto font-semibold border-gray-200 hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    >
                      <span className="truncate">
                        {formData.cargoType
                          ? t(`createCargo.steps.cargoDetails.types.${formData.cargoType}`)
                          : t("createCargo.steps.cargoDetails.selectCargoType")}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder={t("createCargo.steps.cargoDetails.selectCargoType")}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {t("createCargo.steps.cargoDetails.noCategoriesFound")}
                        </CommandEmpty>
                        <CommandGroup>
                          {["electronics", "furniture", "documents", "food", "clothing", "other"].map((type) => (
                            <CommandItem
                              key={type}
                              value={type}
                              onSelect={() => {
                                setFormData({ ...formData, cargoType: type });
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  formData.cargoType === type ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              {t(`createCargo.steps.cargoDetails.types.${type}`)}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cargoCategoryId">
                  {t("cargo.cargoCategory")}{" "}
                  <span className="text-red-500">*</span>
                </Label>

                <Popover
                  open={cargoCategoryOpen}
                  onOpenChange={setCargoCategoryOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={cargoCategoryOpen}
                      className="w-full justify-between rounded-full px-4 py-3 h-auto font-semibold border-gray-200 hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    >
                      <span className="truncate">
                        {formData.cargoCategoryId
                          ? cargoCategories?.find(
                              (category) =>
                                category.id === formData.cargoCategoryId
                            )?.name
                          : t("createCargo.steps.cargoDetails.selectCargoCategory")}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder={t("createCargo.steps.cargoDetails.searchCategory")}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {t("createCargo.steps.cargoDetails.noCategoriesFound")}
                        </CommandEmpty>
                        <CommandGroup>
                          {cargoCategories?.map((category) => (
                            <CommandItem
                              key={category.id}
                              value={category.name}
                              onSelect={() => {
                                setFormData({
                                  ...formData,
                                  cargoCategoryId: category.id,
                                });
                                setCargoCategoryOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  formData.cargoCategoryId === category.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                }`}
                              />
                              <div className="flex flex-col">
                                <span className="font-semibold">
                                  {category.name}
                                </span>
                                {category.description && (
                                  <span className="text-sm text-muted-foreground">
                                    {category.description}
                                  </span>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {formData.cargoType === "other" && (
                <div className="space-y-2">
                  <Label htmlFor="otherCargoType">
                    {t("createCargo.steps.cargoDetails.specifyType")}{" "}
                    <span className="text-red-500">*</span>
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
                  {t("createCargo.steps.cargoDetails.weight")}{" "}
                  <span className="text-red-500">*</span>
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
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/1000 characters
              </p>
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
              {t("createCargo.steps.pickupDelivery.title")}
            </CardTitle>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm font-semibold text-red-700">
                  {t("createCargo.requiredFieldsNote")}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Pickup Location Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  {t("createCargo.steps.pickupDelivery.pickupLocation")}
                </h3>
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="useExistingPickupLocation"
                    className="text-sm"
                  >
                    {t("createCargo.steps.pickupDelivery.useExistingLocation")}
                  </Label>
                  <Switch
                    id="useExistingPickupLocation"
                    checked={formData.useExistingPickupLocation}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        useExistingPickupLocation: checked,
                        selectedPickupLocationId: checked
                          ? formData.selectedPickupLocationId
                          : "",
                      })
                    }
                  />
                </div>
              </div>

              {/* Existing Location Selection */}
              {formData.useExistingPickupLocation && (
                <div className="space-y-2">
                  <Label>
                    {t(
                      "createCargo.steps.pickupDelivery.selectExistingPickupLocation"
                    )}
                  </Label>

                  <Popover
                    open={pickupLocationOpen}
                    onOpenChange={setPickupLocationOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={pickupLocationOpen}
                        className="w-full justify-between"
                      >
                        {formData.selectedPickupLocationId
                          ? myLocations?.find(
                              (location) =>
                                location.id ===
                                formData.selectedPickupLocationId
                            )?.name
                          : t(
                              "createCargo.steps.pickupDelivery.choosePickupLocation"
                            )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput
                      placeholder={t(
                        "createCargo.steps.pickupDelivery.searchLocation"
                      )}
                        />
                        <CommandList>
                          <CommandEmpty>
                            {t(
                              "createCargo.steps.pickupDelivery.noLocationsFound"
                            )}
                          </CommandEmpty>
                          <CommandGroup>
                      {filterLocations(
                        myLocations || [],
                              "",
                          LocationType.PICKUP_POINT
                        ).map((location) => (
                              <CommandItem
                                key={location.id}
                                value={location.name}
                                onSelect={() => {
                                  handleExistingLocationSelect(
                                    location.id,
                                    true
                                  );
                                  setPickupLocationOpen(false);
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    formData.selectedPickupLocationId ===
                                    location.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  }`}
                                />
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {location.name}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {location.address}
                              </span>
                                  {location.contact_person && (
                                <span className="text-xs text-muted-foreground">
                                  Contact: {location.contact_person}
                                </span>
                          )}
                        </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {/* Show selected location info */}
                  {formData.selectedPickupLocationId && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-900">
                          {t(
                            "createCargo.steps.pickupDelivery.selectedLocation"
                          )}
                        </span>
                      </div>
                      <div className="text-sm space-y-1">
                        <p>
                          <span className="font-medium">
                            {t("common.name")}:
                          </span>{" "}
                          {formData.newPickupLocationName}
                        </p>
                        <p>
                          <span className="font-medium">
                            {t("common.address")}:
                          </span>{" "}
                          {formData.pickupAddress}
                        </p>
                        {formData.pickupContactName && (
                          <p>
                            <span className="font-medium">
                              {t(
                                "createCargo.steps.pickupDelivery.contactName"
                              )}
                              :
                            </span>{" "}
                            {formData.pickupContactName}
                          </p>
                        )}
                        {formData.pickupContactPhone && (
                          <p>
                            <span className="font-medium">
                              {t(
                                "createCargo.steps.pickupDelivery.contactPhone"
                              )}
                              :
                            </span>{" "}
                            {formData.pickupContactPhone}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-blue-700 mt-2">
                        💡{" "}
                        {t(
                          "createCargo.steps.pickupDelivery.editContactDetails"
                        )}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* New Location Creation */}
              {!formData.useExistingPickupLocation && (
                <>
                  {/* Location Name */}
                  <div className="space-y-2">
                    <Label htmlFor="newPickupLocationName">
                      {t("createCargo.steps.pickupDelivery.locationName")}
                    </Label>
                    <Input
                      id="newPickupLocationName"
                      placeholder={t(
                        "createCargo.steps.pickupDelivery.locationNamePlaceholder"
                      )}
                      value={formData.newPickupLocationName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          newPickupLocationName: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* District Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="pickupDistrictId">
                      {t("createCargo.steps.pickupDelivery.district")}{" "}
                      <span className="text-red-500">*</span>
                    </Label>

                    <Popover
                      open={pickupDistrictOpen}
                      onOpenChange={setPickupDistrictOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={pickupDistrictOpen}
                          className="w-full justify-between"
                        >
                          {formData.pickupDistrictId
                            ? districts?.find(
                                (district) =>
                                  district.id === formData.pickupDistrictId
                              )?.name
                            : t(
                                "createCargo.steps.pickupDelivery.selectPickupDistrict"
                              )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput
                            placeholder={t(
                              "createCargo.steps.pickupDelivery.searchDistrict"
                            )}
                          />
                          <CommandList>
                            <CommandEmpty>
                              {t(
                                "createCargo.steps.pickupDelivery.noDistrictsFound"
                              )}
                            </CommandEmpty>
                            <CommandGroup>
                              {districts?.map((district) => (
                                <CommandItem
                                  key={district.id}
                                  value={district.name}
                                  onSelect={() => {
                                    console.log(
                                      "Pickup district selected:",
                                      district.id
                                    );
                        setFormData({
                          ...formData,
                                      pickupDistrictId: district.id,
                                    });
                                    setPickupDistrictOpen(false);
                                  }}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      formData.pickupDistrictId === district.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    }`}
                                  />
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                            {district.name}
                                    </span>
                                    {district.province && (
                                      <span className="text-sm text-muted-foreground">
                                        {district.province}
                                      </span>
                                    )}
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Address Search */}
                  <div className="space-y-2">
                    <Label>
                      {t("createCargo.steps.pickupDelivery.pickupAddress")}{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder={t(
                              "createCargo.steps.pickupDelivery.searchPickupLocation"
                            )}
                            value={pickupSearchQuery}
                            onChange={(e) => {
                              const value = e.target.value;
                              setPickupSearchQuery(value);
                              if (value.length > 2) {
                                searchLocation(value, true);
                              } else {
                                setPickupSearchResults([]);
                              }
                            }}
                            className="pl-10"
                          />
                          {isSearchingPickup && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                            </div>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          onClick={() =>
                            searchLocation(pickupSearchQuery, true)
                          }
                          disabled={
                            isSearchingPickup || pickupSearchQuery.length < 3
                          }
                        >
                          {isSearchingPickup ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              {t("common.searching")}
                            </>
                          ) : (
                            <>
                              <Search className="h-4 w-4 mr-2" />
                              {t("common.search")}
                            </>
                          )}
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
                      placeholder={t(
                        "createCargo.steps.pickupDelivery.enterPickupAddress"
                      )}
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
                      <Label htmlFor="pickupContactName">
                        {t("createCargo.steps.pickupDelivery.contactName")}
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="pickupContactName"
                          placeholder={t(
                            "createCargo.steps.pickupDelivery.contactNamePlaceholder"
                          )}
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
                      <Label htmlFor="pickupContactPhone">
                        {t("createCargo.steps.pickupDelivery.contactPhone")}
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="pickupContactPhone"
                          placeholder={t(
                            "createCargo.steps.pickupDelivery.contactPhonePlaceholder"
                          )}
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
                    <Label htmlFor="pickupOpeningHours">
                      {t("createCargo.steps.pickupDelivery.openingHours")}
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="pickupOpeningHours"
                        placeholder={t(
                          "createCargo.steps.pickupDelivery.openingHoursPlaceholder"
                        )}
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
                      {t("createCargo.steps.pickupDelivery.savePickupData")}
                    </Label>
                  </div>
                </>
              )}
            </div>

            {/* Destination Location Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-red-600" />
                  {t("createCargo.steps.pickupDelivery.deliveryLocation")}
                </h3>
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="useExistingDestinationLocation"
                    className="text-sm"
                  >
                    {t("createCargo.steps.pickupDelivery.useExistingLocation")}
                  </Label>
                  <Switch
                    id="useExistingDestinationLocation"
                    checked={formData.useExistingDestinationLocation}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        useExistingDestinationLocation: checked,
                        selectedDestinationLocationId: checked
                          ? formData.selectedDestinationLocationId
                          : "",
                      })
                    }
                  />
                </div>
              </div>

              {/* Existing Location Selection */}
              {formData.useExistingDestinationLocation && (
                <div className="space-y-2">
                  <Label>
                    {t(
                      "createCargo.steps.pickupDelivery.selectExistingDeliveryLocation"
                    )}
                  </Label>

                  <Popover
                    open={destinationLocationOpen}
                    onOpenChange={setDestinationLocationOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={destinationLocationOpen}
                        className="w-full justify-between"
                      >
                        {formData.selectedDestinationLocationId
                          ? myLocations?.find(
                              (location) =>
                                location.id ===
                                formData.selectedDestinationLocationId
                            )?.name
                          : t(
                              "createCargo.steps.pickupDelivery.chooseDeliveryLocation"
                            )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput
                      placeholder={t(
                        "createCargo.steps.pickupDelivery.searchLocation"
                      )}
                        />
                        <CommandList>
                          <CommandEmpty>
                            {t(
                              "createCargo.steps.pickupDelivery.noLocationsFound"
                            )}
                          </CommandEmpty>
                          <CommandGroup>
                      {filterLocations(
                        myLocations || [],
                              "",
                          LocationType.DELIVERY_POINT
                        ).map((location) => (
                              <CommandItem
                                key={location.id}
                                value={location.name}
                                onSelect={() => {
                                  handleExistingLocationSelect(
                                    location.id,
                                    false
                                  );
                                  setDestinationLocationOpen(false);
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    formData.selectedDestinationLocationId ===
                                    location.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  }`}
                                />
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {location.name}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {location.address}
                              </span>
                              {location.contact_person && (
                                <span className="text-xs text-muted-foreground">
                                  Contact: {location.contact_person}
                                </span>
                              )}
                            </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {/* Show selected location info */}
                  {formData.selectedDestinationLocationId && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-red-600" />
                        <span className="font-medium text-red-900">
                          {t(
                            "createCargo.steps.pickupDelivery.selectedLocation"
                          )}
                        </span>
                      </div>
                      <div className="text-sm space-y-1">
                        <p>
                          <span className="font-medium">
                            {t("common.name")}:
                          </span>{" "}
                          {formData.newDestinationLocationName}
                        </p>
                        <p>
                          <span className="font-medium">
                            {t("common.address")}:
                          </span>{" "}
                          {formData.destinationAddress}
                        </p>
                        {formData.destinationContactName && (
                          <p>
                            <span className="font-medium">
                              {t(
                                "createCargo.steps.pickupDelivery.contactName"
                              )}
                              :
                            </span>{" "}
                            {formData.destinationContactName}
                          </p>
                        )}
                        {formData.destinationContactPhone && (
                          <p>
                            <span className="font-medium">
                              {t(
                                "createCargo.steps.pickupDelivery.contactPhone"
                              )}
                              :
                            </span>{" "}
                            {formData.destinationContactPhone}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-red-700 mt-2">
                        💡{" "}
                        {t(
                          "createCargo.steps.pickupDelivery.editContactDetails"
                        )}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* New Location Creation */}
              {!formData.useExistingDestinationLocation && (
                <>
                  {/* Location Name */}
                  <div className="space-y-2">
                    <Label htmlFor="newDestinationLocationName">
                      {t("createCargo.steps.pickupDelivery.locationName")}
                    </Label>
                    <Input
                      id="newDestinationLocationName"
                      placeholder={t(
                        "createCargo.steps.pickupDelivery.locationNamePlaceholder"
                      )}
                      value={formData.newDestinationLocationName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          newDestinationLocationName: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* District Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="destinationDistrictId">
                      {t("createCargo.steps.pickupDelivery.district")}{" "}
                      <span className="text-red-500">*</span>
                    </Label>

                    <Popover
                      open={destinationDistrictOpen}
                      onOpenChange={setDestinationDistrictOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={destinationDistrictOpen}
                          className="w-full justify-between"
                        >
                          {formData.destinationDistrictId
                            ? districts?.find(
                                (district) =>
                                  district.id === formData.destinationDistrictId
                              )?.name
                            : t(
                                "createCargo.steps.pickupDelivery.selectDeliveryDistrict"
                              )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput
                            placeholder={t(
                              "createCargo.steps.pickupDelivery.searchDistrict"
                            )}
                          />
                          <CommandList>
                            <CommandEmpty>
                              {t(
                                "createCargo.steps.pickupDelivery.noDistrictsFound"
                              )}
                            </CommandEmpty>
                            <CommandGroup>
                              {districts?.map((district) => (
                                <CommandItem
                                  key={district.id}
                                  value={district.name}
                                  onSelect={() => {
                                    console.log(
                                      "Destination district selected:",
                                      district.id
                                    );
                        setFormData({
                          ...formData,
                                      destinationDistrictId: district.id,
                                    });
                                    setDestinationDistrictOpen(false);
                                  }}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      formData.destinationDistrictId ===
                                      district.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    }`}
                                  />
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                            {district.name}
                                    </span>
                                    {district.province && (
                                      <span className="text-sm text-muted-foreground">
                                        {district.province}
                                      </span>
                                    )}
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Address Search */}
                  <div className="space-y-2">
                    <Label>
                      {t("createCargo.steps.pickupDelivery.deliveryAddress")}{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder={t(
                              "createCargo.steps.pickupDelivery.searchDeliveryLocation"
                            )}
                            value={destinationSearchQuery}
                            onChange={(e) => {
                              const value = e.target.value;
                              setDestinationSearchQuery(value);
                              if (value.length > 2) {
                                searchLocation(value, false);
                              } else {
                                setDestinationSearchResults([]);
                              }
                            }}
                            className="pl-10"
                          />
                          {isSearchingDestination && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                            </div>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          onClick={() =>
                            searchLocation(destinationSearchQuery, false)
                          }
                          disabled={
                            isSearchingDestination ||
                            destinationSearchQuery.length < 3
                          }
                        >
                          {isSearchingDestination ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              {t("common.searching")}
                            </>
                          ) : (
                            <>
                              <Search className="h-4 w-4 mr-2" />
                              {t("common.search")}
                            </>
                          )}
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
                      placeholder={t(
                        "createCargo.steps.pickupDelivery.enterDeliveryAddress"
                      )}
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
                      <Label htmlFor="destinationContactName">
                        {t("createCargo.steps.pickupDelivery.contactName")}
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="destinationContactName"
                          placeholder={t(
                            "createCargo.steps.pickupDelivery.contactNamePlaceholder"
                          )}
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
                      <Label htmlFor="destinationContactPhone">
                        {t("createCargo.steps.pickupDelivery.contactPhone")}
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="destinationContactPhone"
                          placeholder={t(
                            "createCargo.steps.pickupDelivery.contactPhonePlaceholder"
                          )}
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
                    <Label htmlFor="destinationOpeningHours">
                      {t("createCargo.steps.pickupDelivery.openingHours")}
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="destinationOpeningHours"
                        placeholder={t(
                          "createCargo.steps.pickupDelivery.openingHoursPlaceholder"
                        )}
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
                      {t("createCargo.steps.pickupDelivery.saveDeliveryData")}
                    </Label>
                  </div>
                </>
              )}
            </div>

            {/* Additional Details */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pickupDate">
                  {t("createCargo.steps.pickupDelivery.preferredPickupDate")}{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="pickupDate"
                      type="date"
                      value={formData.pickupDate}
                      onChange={(e) => {
                        const selectedDate = e.target.value;
                        const today = new Date().toISOString().split("T")[0];

                        if (selectedDate < today) {
                          toast.error(
                            t(
                              "createCargo.steps.pickupDelivery.selectDateFromToday"
                            )
                          );
                          return;
                        }

                        setFormData({ ...formData, pickupDate: selectedDate });
                      }}
                      min={new Date().toISOString().split("T")[0]} // Disable past dates
                      className="pl-10 bg-white border-gray-300 focus:border-primary focus:ring-primary"
                      placeholder="Select pickup date"
                    />
                    {formData.pickupDate ? (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    ) : null}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">
                      📅{" "}
                      {t(
                        "createCargo.steps.pickupDelivery.selectDateFromToday"
                      )}
                    </p>
                    {formData.pickupDate && (
                      <p className="text-xs text-green-600 font-medium">
                        Selected:{" "}
                        {new Date(formData.pickupDate).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </p>
                    )}
                  </div>
                </div>
                {formData.pickupDate && (
                  <p className="text-sm text-green-600">
                    ✓ {t("createCargo.steps.pickupDelivery.pickupDateSelected")}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialInstructions">
                  {t("createCargo.steps.pickupDelivery.specialInstructions")} (
                  {t("auth.optional")})
                </Label>
                <Textarea
                  id="specialInstructions"
                  placeholder={t(
                    "createCargo.steps.pickupDelivery.specialInstructionsPlaceholder"
                  )}
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
                        ? `${t(
                            "createCargo.steps.pickupDelivery.estimatedDistance"
                          )}: ${formData.distance} km`
                        : isCalculatingDistance
                        ? t(
                            "createCargo.steps.pickupDelivery.calculatingDistance"
                          )
                        : t(
                            "createCargo.steps.pickupDelivery.distanceWillBeCalculated"
                          )}
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
                      {t(
                        "createCargo.steps.pickupDelivery.recalculateDistance"
                      )}
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
                {t("common.back")}
              </Button>
              <Button
                onClick={handleNext}
                disabled={!validateStep(2)}
                className="flex-1 bg-gradient-primary hover:bg-primary-hover disabled:opacity-50"
              >
                {t("createCargo.steps.pickupDelivery.reviewCreateCargo")}
                <ArrowRight className="ml-2 h-4 w-4" />
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
              {t("createCargo.steps.confirmation.title")}
            </CardTitle>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm font-semibold text-red-700">
                  {t("createCargo.requiredFieldsNote")}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
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
                        Cost breakdown will be calculated after location
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
                onClick={() => setStep(2)}
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
                  : t("createCargo.steps.confirmation.createCargo")}
                <Package className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Success */}
      {step === 4 && (
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
                    Cargo Number:
                  </span>
                  <span className="font-medium">
                    {cargoData?.cargo_number || "N/A"}
                  </span>
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
                    {t("createCargo.steps.success.cargoCreated")}
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
