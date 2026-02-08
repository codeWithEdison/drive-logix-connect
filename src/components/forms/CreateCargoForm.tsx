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
import { AlertCircle, RefreshCw, Check, ChevronsUpDown, X } from "lucide-react";
import {
  MapPin,
  Package,
  Calculator,
  ArrowRight,
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
    pickupLat: "",
    pickupLng: "",
    pickupDistrictId: "", // Add district selection
    destinationAddress: "",
    destinationContactName: "",
    destinationContactPhone: "",
    destinationLat: "",
    destinationLng: "",
    destinationDistrictId: "", // Add district selection
    pickupDate: "",
    specialInstructions: "",
    distance: 0,
    savePickupData: false,
    saveDestinationData: false,
    // Location selection toggles
    useExistingPickupLocation: false,
    useExistingDestinationLocation: false,
    selectedPickupLocationId: "",
    selectedDestinationLocationId: "",
  });

  const [estimatedCost, setEstimatedCost] = useState(0);
  const [pickupBranchId, setPickupBranchId] = useState<string | null>(null);
  const [costBreakdown, setCostBreakdown] = useState<{
    weight_cost: number;
    distance_cost: number;
    category_multiplier: number;
    total_distance_km?: number;
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

  // Search states for comboboxes
  const [cargoTypeSearch, setCargoTypeSearch] = useState("");
  const [showCargoTypeDropdown, setShowCargoTypeDropdown] = useState(false);

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
  const { data: cargoCategories, isLoading: loadingCategories } =
    useCargoCategories({ is_active: true });
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
        (district.branch && district.branch.name.toLowerCase().includes(query))
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
          }
        : {
            selectedDestinationLocationId: locationId,
            destinationAddress: location.address,
            destinationContactName: location.contact_person || "",
            destinationContactPhone: location.contact_phone || "",
            destinationLat: location.latitude?.toString() || "",
            destinationLng: location.longitude?.toString() || "",
            destinationDistrictId: location.district_id || "",
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
        name: address,
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
        const distance = formData.distance || 25; // km
        const baseRate = 2000; // RWF per km
        const cost =
          baseRate * distance +
          weightRate * parseFloat(formData.weight || "0");
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

      // Get cargo category name
      const selectedCategory = cargoCategories?.find(
        (c) => c.id === formData.cargoCategoryId
      );
      const categoryName = selectedCategory?.name || "";

      const cargoRequest: CreateCargoRequest & { distance_km?: number } = {
        category_id: formData.cargoCategoryId || undefined,
        type: categoryName, // Send category name instead of cargo type
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
        pickup_instructions: "",
        destination_location_id: destinationLocationId || undefined,
        destination_address: formData.destinationAddress,
        destination_contact: formData.destinationContactName,
        destination_phone: formData.destinationContactPhone,
        delivery_instructions: "",
        special_requirements: formData.specialInstructions,
        description: formData.description || undefined,
        insurance_required: false, // Default values
        insurance_amount: 0,
        fragile: false,
        temperature_controlled: false,
        priority: CargoPriority.NORMAL,
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
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 backdrop-blur-sm">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl md:text-2xl">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                </div>
                {t("createCargo.steps.cargoDetails.title")}
              </CardTitle>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mt-2 sm:mt-3">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-[10px] sm:text-xs font-semibold text-blue-700">
                    {t("createCargo.requiredFieldsNote")}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label
                    htmlFor="cargoCategoryId"
                    className="text-xs sm:text-sm font-semibold text-gray-700"
                  >
                    {t("cargo.cargoCategory")}{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <input
                      type="text"
                      value={
                        cargoCategorySearch ||
                        (formData.cargoCategoryId
                          ? cargoCategories?.find(
                              (c) => c.id === formData.cargoCategoryId
                            )?.name || ""
                          : "")
                      }
                      onChange={(e) => {
                        setCargoCategorySearch(e.target.value);
                        setCargoCategoryOpen(true);
                      }}
                      onFocus={() => setCargoCategoryOpen(true)}
                      placeholder={t(
                        "createCargo.steps.cargoDetails.selectCargoCategory"
                      )}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 rounded-full text-sm sm:text-base font-semibold border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/80 backdrop-blur-sm placeholder:text-gray-400 placeholder:opacity-70 placeholder:text-sm placeholder:font-normal"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {cargoCategorySearch && (
                        <button
                          onClick={() => {
                            setCargoCategorySearch("");
                            setCargoCategoryOpen(true);
                          }}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                        </button>
                      )}
                      <Search className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                    </div>

                    {/* Dropdown */}
                    {cargoCategoryOpen && (
                      <motion.div
                        className="absolute z-50 w-full mt-1 bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-60 overflow-y-auto custom-scrollbar"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {loadingCategories ? (
                          <div className="p-3 sm:p-4 text-center text-gray-500 text-xs sm:text-sm">
                            {t(
                              "createCargo.steps.cargoDetails.loadingCategories"
                            ) || "Loading..."}
                          </div>
                        ) : cargoCategories &&
                          cargoCategories.filter(
                            (category) =>
                              !cargoCategorySearch ||
                              category.name
                                .toLowerCase()
                                .includes(cargoCategorySearch.toLowerCase()) ||
                              (category.description &&
                                category.description
                                  .toLowerCase()
                                  .includes(cargoCategorySearch.toLowerCase()))
                          ).length > 0 ? (
                          cargoCategories
                            .filter(
                              (category) =>
                                !cargoCategorySearch ||
                                category.name
                                  .toLowerCase()
                                  .includes(
                                    cargoCategorySearch.toLowerCase()
                                  ) ||
                                (category.description &&
                                  category.description
                                    .toLowerCase()
                                    .includes(
                                      cargoCategorySearch.toLowerCase()
                                    ))
                            )
                            .map((category) => (
                              <button
                                key={category.id}
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    cargoCategoryId: category.id,
                                  });
                                  setCargoCategorySearch("");
                                  setCargoCategoryOpen(false);
                                }}
                                className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                                  formData.cargoCategoryId === category.id
                                    ? "bg-blue-50"
                                    : ""
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <Check
                                    className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ${
                                      formData.cargoCategoryId === category.id
                                        ? "opacity-100 text-blue-600"
                                        : "opacity-0"
                                    }`}
                                  />
                                  <div className="flex flex-col flex-1">
                                    <span className="text-xs sm:text-sm font-semibold text-gray-900">
                                      {category.name}
                                    </span>
                                    {category.description && (
                                      <span className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                                        {category.description}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </button>
                            ))
                        ) : (
                          <div className="p-3 sm:p-4 text-center text-gray-500 text-xs sm:text-sm">
                            {t(
                              "createCargo.steps.cargoDetails.noCategoriesFound"
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Click outside to close */}
                    {cargoCategoryOpen && (
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setCargoCategoryOpen(false)}
                      />
                    )}
                  </div>
                </div>

                {/* Cargo type "other" field removed - using category name instead */}

                <div className="space-y-1.5 sm:space-y-2">
                  <Label
                    htmlFor="weight"
                    className="text-xs sm:text-sm font-semibold text-gray-700"
                  >
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
                    className="rounded-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-semibold border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/80 backdrop-blur-sm placeholder:text-gray-400 placeholder:opacity-70 placeholder:text-sm placeholder:font-normal"
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm font-semibold text-gray-700">
                  {t("createCargo.steps.cargoDetails.dimensions")}
                </Label>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 md:gap-3">
                  <div>
                    <Input
                      id="length"
                      placeholder={t("createCargo.steps.cargoDetails.length")}
                      value={formData.length}
                      onChange={(e) =>
                        setFormData({ ...formData, length: e.target.value })
                      }
                      className="rounded-full px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-semibold border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/80 backdrop-blur-sm placeholder:text-gray-400 placeholder:opacity-70 placeholder:text-xs placeholder:font-normal"
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
                      className="rounded-full px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-semibold border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/80 backdrop-blur-sm placeholder:text-gray-400 placeholder:opacity-70 placeholder:text-xs placeholder:font-normal"
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
                      className="rounded-full px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-semibold border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/80 backdrop-blur-sm placeholder:text-gray-400 placeholder:opacity-70 placeholder:text-xs placeholder:font-normal"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label
                  htmlFor="description"
                  className="text-xs sm:text-sm font-semibold text-gray-700"
                >
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
                  className="rounded-2xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm md:text-base font-semibold border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none bg-white/80 backdrop-blur-sm placeholder:text-gray-400 placeholder:opacity-70 placeholder:text-sm placeholder:font-normal"
                />
                <p className="text-[10px] sm:text-xs text-gray-500 font-medium">
                  {formData.description.length}/1000 characters
                </p>
              </div>

              <Button
                onClick={handleNext}
                disabled={!validateStep(1)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full py-3 sm:py-4 md:py-5 text-sm sm:text-base md:text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
              >
                <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                  {t("createCargo.steps.cargoDetails.nextButton")}
                  <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                </span>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Step 2: Enhanced Locations */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20 backdrop-blur-sm">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl md:text-2xl">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                </div>
                {t("createCargo.steps.pickupDelivery.title")}
              </CardTitle>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mt-2 sm:mt-3">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
                  <span className="text-[10px] sm:text-xs font-semibold text-green-700">
                    {t("createCargo.requiredFieldsNote")}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 md:space-y-8">
              {/* Pickup Location Section */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-1.5 sm:gap-2">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    {t("createCargo.steps.pickupDelivery.pickupLocation")}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="useExistingPickupLocation"
                      className="text-sm"
                    >
                      {t(
                        "createCargo.steps.pickupDelivery.useExistingLocation"
                      )}
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
                          className={`w-full justify-between ${
                            formData.selectedPickupLocationId
                              ? "text-gray-900"
                              : "text-gray-400 text-sm font-normal"
                          }`}
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
                      <PopoverContent
                        className="w-full p-0 bg-white border-2 border-gray-200 shadow-xl"
                        align="start"
                      >
                        <Command className="bg-white">
                          <CommandInput
                            placeholder={t(
                              "createCargo.steps.pickupDelivery.searchLocation"
                            )}
                            className="border-b border-gray-200 placeholder:text-gray-400 placeholder:text-sm placeholder:opacity-75"
                          />
                          <CommandList className="max-h-[300px] bg-white p-2">
                            <CommandEmpty className="py-6 text-center text-gray-500 bg-white">
                              {t(
                                "createCargo.steps.pickupDelivery.noLocationsFound"
                              )}
                            </CommandEmpty>
                            <CommandGroup className="bg-white p-2">
                              {filterLocations(
                                myLocations || [],
                                "",
                                LocationType.PICKUP_POINT
                              ).map((location, index) => (
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
                                  className={`!bg-white px-4 py-4 cursor-pointer transition-all duration-200 rounded-lg mb-2 border data-[selected='true']:!bg-white data-[selected=true]:!bg-white ${
                                    formData.selectedPickupLocationId ===
                                    location.id
                                      ? "!bg-white border-blue-400 border-l-4 border-l-blue-600 shadow-md"
                                      : "!bg-white border-gray-200 hover:!bg-blue-50 hover:border-blue-300 hover:shadow-sm border-l-4 border-l-transparent data-[selected='true']:!bg-blue-50"
                                  }`}
                                >
                                  <Check
                                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                                      formData.selectedPickupLocationId ===
                                      location.id
                                        ? "opacity-100 text-blue-600"
                                        : "opacity-0"
                                    }`}
                                  />
                                  <div className="flex flex-col flex-1 min-w-0">
                                    <span
                                      className={`font-semibold text-base ${
                                        formData.selectedPickupLocationId ===
                                        location.id
                                          ? "text-blue-900"
                                          : "text-gray-900"
                                      }`}
                                    >
                                      {location.name}
                                    </span>
                                    <span
                                      className={`text-sm mt-1.5 ${
                                        formData.selectedPickupLocationId ===
                                        location.id
                                          ? "text-blue-700"
                                          : "text-gray-600"
                                      }`}
                                    >
                                      {location.address}
                                    </span>
                                    {location.contact_person && (
                                      <span
                                        className={`text-xs mt-1 ${
                                          formData.selectedPickupLocationId ===
                                          location.id
                                            ? "text-blue-600 font-medium"
                                            : "text-gray-500"
                                        }`}
                                      >
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
                    {/* District Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="pickupDistrictId">
                        {t("createCargo.steps.pickupDelivery.district")}{" "}
                        <span className="text-red-500">*</span>
                      </Label>

                      <div className="relative">
                        <input
                          type="text"
                          value={
                            pickupDistrictSearch ||
                            (formData.pickupDistrictId
                              ? districts?.find(
                                  (d) => d.id === formData.pickupDistrictId
                                )?.name || ""
                              : "")
                          }
                          onChange={(e) => {
                            setPickupDistrictSearch(e.target.value);
                            setPickupDistrictOpen(true);
                          }}
                          onFocus={() => setPickupDistrictOpen(true)}
                          placeholder={t(
                            "createCargo.steps.pickupDelivery.selectPickupDistrict"
                          )}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 rounded-full text-sm sm:text-base font-semibold border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/80 backdrop-blur-sm placeholder:text-gray-400 placeholder:opacity-70 placeholder:text-sm placeholder:font-normal"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          {pickupDistrictSearch && (
                            <button
                              onClick={() => {
                                setPickupDistrictSearch("");
                                setPickupDistrictOpen(true);
                              }}
                              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                            >
                              <X className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                            </button>
                          )}
                          <Search className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                        </div>

                        {/* Dropdown */}
                        {pickupDistrictOpen && (
                          <motion.div
                            className="absolute z-50 w-full mt-1 bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-60 overflow-y-auto custom-scrollbar"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                          >
                            {districts &&
                            districts.filter(
                              (district) =>
                                !pickupDistrictSearch ||
                                district.name
                                  .toLowerCase()
                                  .includes(
                                    pickupDistrictSearch.toLowerCase()
                                  ) ||
                                (district.branch &&
                                  district.branch.name
                                    .toLowerCase()
                                    .includes(
                                      pickupDistrictSearch.toLowerCase()
                                    ))
                            ).length > 0 ? (
                              districts
                                .filter(
                                  (district) =>
                                    !pickupDistrictSearch ||
                                    district.name
                                      .toLowerCase()
                                      .includes(
                                        pickupDistrictSearch.toLowerCase()
                                      ) ||
                                    (district.branch &&
                                      district.branch.name
                                        .toLowerCase()
                                        .includes(
                                          pickupDistrictSearch.toLowerCase()
                                        ))
                                )
                                .map((district) => (
                                  <button
                                    key={district.id}
                                    onClick={() => {
                                      setFormData({
                                        ...formData,
                                        pickupDistrictId: district.id,
                                      });
                                      setPickupDistrictSearch("");
                                      setPickupDistrictOpen(false);
                                    }}
                                    className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                                      formData.pickupDistrictId === district.id
                                        ? "bg-blue-50"
                                        : ""
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Check
                                        className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ${
                                          formData.pickupDistrictId ===
                                          district.id
                                            ? "opacity-100 text-blue-600"
                                            : "opacity-0"
                                        }`}
                                      />
                                      <div className="flex flex-col flex-1">
                                        <span className="text-xs sm:text-sm font-semibold text-gray-900">
                                          {district.name}
                                        </span>
                                        {district.branch && (
                                          <span className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                                            {district.branch.name}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </button>
                                ))
                            ) : (
                              <div className="p-3 sm:p-4 text-center text-gray-500 text-xs sm:text-sm">
                                {t(
                                  "createCargo.steps.pickupDelivery.noDistrictsFound"
                                )}
                              </div>
                            )}
                          </motion.div>
                        )}

                        {/* Click outside to close */}
                        {pickupDistrictOpen && (
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setPickupDistrictOpen(false)}
                          />
                        )}
                      </div>
                    </div>

                    {/* Address Search */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-xs sm:text-sm font-semibold text-gray-700">
                        {t("createCargo.steps.pickupDelivery.pickupAddress")}{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <div className="flex gap-1.5 sm:gap-2">
                          <div className="flex-1 relative">
                            <Search className="absolute left-2.5 sm:left-3 md:left-4 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 z-10" />
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
                              className="pl-8 sm:pl-10 md:pl-12 rounded-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-semibold border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/80 backdrop-blur-sm placeholder:text-gray-400 placeholder:opacity-70 placeholder:text-xs placeholder:font-normal"
                            />
                            {isSearchingPickup && (
                              <div className="absolute right-2.5 sm:right-3 md:right-4 top-1/2 transform -translate-y-1/2">
                                <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin text-blue-600" />
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
                            className="rounded-full px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm font-semibold border-gray-200 hover:border-blue-500 bg-white/80 backdrop-blur-sm"
                          >
                            {isSearchingPickup ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                                <span className="hidden sm:inline">
                                  {t("common.searching")}
                                </span>
                              </>
                            ) : (
                              <>
                                <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1" />
                                <span className="hidden sm:inline">
                                  {t("common.search")}
                                </span>
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
                        className="rounded-2xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm md:text-base font-semibold border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none bg-white/80 backdrop-blur-sm placeholder:text-gray-400 placeholder:opacity-70 placeholder:text-sm placeholder:font-normal"
                      />
                    </div>

                    {/* Pickup Contact Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label
                          htmlFor="pickupContactName"
                          className="text-xs sm:text-sm font-semibold text-gray-700"
                        >
                          {t("createCargo.steps.pickupDelivery.contactName")}
                        </Label>
                        <div className="relative">
                          <User className="absolute left-2.5 sm:left-3 md:left-4 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 z-10" />
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
                            className="pl-8 sm:pl-10 md:pl-12 rounded-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-semibold border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/80 backdrop-blur-sm placeholder:text-gray-400 placeholder:opacity-70 placeholder:text-xs placeholder:font-normal"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 sm:space-y-2">
                        <Label
                          htmlFor="pickupContactPhone"
                          className="text-xs sm:text-sm font-semibold text-gray-700"
                        >
                          {t("createCargo.steps.pickupDelivery.contactPhone")}
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-2.5 sm:left-3 md:left-4 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 z-10" />
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
                            className="pl-8 sm:pl-10 md:pl-12 rounded-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-semibold border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/80 backdrop-blur-sm placeholder:text-gray-400 placeholder:opacity-70 placeholder:text-xs placeholder:font-normal"
                          />
                        </div>
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
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-1.5 sm:gap-2">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                    {t("createCargo.steps.pickupDelivery.deliveryLocation")}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="useExistingDestinationLocation"
                      className="text-sm"
                    >
                      {t(
                        "createCargo.steps.pickupDelivery.useExistingLocation"
                      )}
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
                          className={`w-full justify-between ${
                            formData.selectedDestinationLocationId
                              ? "text-gray-900"
                              : "text-gray-400 text-sm font-normal"
                          }`}
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
                      <PopoverContent
                        className="w-full p-0 bg-white border-2 border-gray-200 shadow-xl"
                        align="start"
                      >
                        <Command className="bg-white">
                          <CommandInput
                            placeholder={t(
                              "createCargo.steps.pickupDelivery.searchLocation"
                            )}
                            className="border-b border-gray-200 placeholder:text-gray-400 placeholder:text-sm placeholder:opacity-75"
                          />
                          <CommandList className="max-h-[300px] bg-white p-2">
                            <CommandEmpty className="py-6 text-center text-gray-500 bg-white">
                              {t(
                                "createCargo.steps.pickupDelivery.noLocationsFound"
                              )}
                            </CommandEmpty>
                            <CommandGroup className="bg-white p-2">
                              {filterLocations(
                                myLocations || [],
                                "",
                                LocationType.DELIVERY_POINT
                              ).map((location, index) => (
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
                                  className={`!bg-white px-4 py-4 cursor-pointer transition-all duration-200 rounded-lg mb-2 border data-[selected='true']:!bg-white data-[selected=true]:!bg-white ${
                                    formData.selectedDestinationLocationId ===
                                    location.id
                                      ? "!bg-white border-green-400 border-l-4 border-l-green-600 shadow-md"
                                      : "!bg-white border-gray-200 hover:!bg-green-50 hover:border-green-300 hover:shadow-sm border-l-4 border-l-transparent data-[selected='true']:!bg-green-50"
                                  }`}
                                >
                                  <Check
                                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                                      formData.selectedDestinationLocationId ===
                                      location.id
                                        ? "opacity-100 text-green-600"
                                        : "opacity-0"
                                    }`}
                                  />
                                  <div className="flex flex-col flex-1 min-w-0">
                                    <span
                                      className={`font-semibold text-base ${
                                        formData.selectedDestinationLocationId ===
                                        location.id
                                          ? "text-green-900"
                                          : "text-gray-900"
                                      }`}
                                    >
                                      {location.name}
                                    </span>
                                    <span
                                      className={`text-sm mt-1.5 ${
                                        formData.selectedDestinationLocationId ===
                                        location.id
                                          ? "text-green-700"
                                          : "text-gray-600"
                                      }`}
                                    >
                                      {location.address}
                                    </span>
                                    {location.contact_person && (
                                      <span
                                        className={`text-xs mt-1 ${
                                          formData.selectedDestinationLocationId ===
                                          location.id
                                            ? "text-green-600 font-medium"
                                            : "text-gray-500"
                                        }`}
                                      >
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
                    {/* District Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="destinationDistrictId">
                        {t("createCargo.steps.pickupDelivery.district")}{" "}
                        <span className="text-red-500">*</span>
                      </Label>

                      <div className="relative">
                        <input
                          type="text"
                          value={
                            destinationDistrictSearch ||
                            (formData.destinationDistrictId
                              ? districts?.find(
                                  (d) => d.id === formData.destinationDistrictId
                                )?.name || ""
                              : "")
                          }
                          onChange={(e) => {
                            setDestinationDistrictSearch(e.target.value);
                            setDestinationDistrictOpen(true);
                          }}
                          onFocus={() => setDestinationDistrictOpen(true)}
                          placeholder={t(
                            "createCargo.steps.pickupDelivery.selectDeliveryDistrict"
                          )}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 rounded-full text-sm sm:text-base font-semibold border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/80 backdrop-blur-sm placeholder:text-gray-400 placeholder:opacity-70 placeholder:text-sm placeholder:font-normal"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          {destinationDistrictSearch && (
                            <button
                              onClick={() => {
                                setDestinationDistrictSearch("");
                                setDestinationDistrictOpen(true);
                              }}
                              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                            >
                              <X className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                            </button>
                          )}
                          <Search className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                        </div>

                        {/* Dropdown */}
                        {destinationDistrictOpen && (
                          <motion.div
                            className="absolute z-50 w-full mt-1 bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-60 overflow-y-auto custom-scrollbar"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                          >
                            {districts &&
                            districts.filter(
                              (district) =>
                                !destinationDistrictSearch ||
                                district.name
                                  .toLowerCase()
                                  .includes(
                                    destinationDistrictSearch.toLowerCase()
                                  ) ||
                                (district.branch &&
                                  district.branch.name
                                    .toLowerCase()
                                    .includes(
                                      destinationDistrictSearch.toLowerCase()
                                    ))
                            ).length > 0 ? (
                              districts
                                .filter(
                                  (district) =>
                                    !destinationDistrictSearch ||
                                    district.name
                                      .toLowerCase()
                                      .includes(
                                        destinationDistrictSearch.toLowerCase()
                                      ) ||
                                    (district.branch &&
                                      district.branch.name
                                        .toLowerCase()
                                        .includes(
                                          destinationDistrictSearch.toLowerCase()
                                        ))
                                )
                                .map((district) => (
                                  <button
                                    key={district.id}
                                    onClick={() => {
                                      setFormData({
                                        ...formData,
                                        destinationDistrictId: district.id,
                                      });
                                      setDestinationDistrictSearch("");
                                      setDestinationDistrictOpen(false);
                                    }}
                                    className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                                      formData.destinationDistrictId ===
                                      district.id
                                        ? "bg-blue-50"
                                        : ""
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Check
                                        className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ${
                                          formData.destinationDistrictId ===
                                          district.id
                                            ? "opacity-100 text-blue-600"
                                            : "opacity-0"
                                        }`}
                                      />
                                      <div className="flex flex-col flex-1">
                                        <span className="text-xs sm:text-sm font-semibold text-gray-900">
                                          {district.name}
                                        </span>
                                        {district.branch && (
                                          <span className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                                            {district.branch.name}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </button>
                                ))
                            ) : (
                              <div className="p-3 sm:p-4 text-center text-gray-500 text-xs sm:text-sm">
                                {t(
                                  "createCargo.steps.pickupDelivery.noDistrictsFound"
                                )}
                              </div>
                            )}
                          </motion.div>
                        )}

                        {/* Click outside to close */}
                        {destinationDistrictOpen && (
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setDestinationDistrictOpen(false)}
                          />
                        )}
                      </div>
                    </div>

                    {/* Address Search */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-xs sm:text-sm font-semibold text-gray-700">
                        {t("createCargo.steps.pickupDelivery.deliveryAddress")}{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <div className="flex gap-1.5 sm:gap-2">
                          <div className="flex-1 relative">
                            <Search className="absolute left-2.5 sm:left-3 md:left-4 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 z-10" />
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
                              className="pl-8 sm:pl-10 md:pl-12 rounded-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-semibold border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/80 backdrop-blur-sm placeholder:text-gray-400 placeholder:opacity-70 placeholder:text-xs placeholder:font-normal"
                            />
                            {isSearchingDestination && (
                              <div className="absolute right-2.5 sm:right-3 md:right-4 top-1/2 transform -translate-y-1/2">
                                <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin text-blue-600" />
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
                            className="rounded-full px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm font-semibold border-gray-200 hover:border-blue-500 bg-white/80 backdrop-blur-sm"
                          >
                            {isSearchingDestination ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                                <span className="hidden sm:inline">
                                  {t("common.searching")}
                                </span>
                              </>
                            ) : (
                              <>
                                <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1" />
                                <span className="hidden sm:inline">
                                  {t("common.search")}
                                </span>
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
                        className="rounded-2xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm md:text-base font-semibold border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none bg-white/80 backdrop-blur-sm placeholder:text-gray-400 placeholder:opacity-70 placeholder:text-sm placeholder:font-normal"
                      />
                    </div>

                    {/* Destination Contact Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label
                          htmlFor="destinationContactName"
                          className="text-xs sm:text-sm font-semibold text-gray-700"
                        >
                          {t("createCargo.steps.pickupDelivery.contactName")}
                        </Label>
                        <div className="relative">
                          <User className="absolute left-2.5 sm:left-3 md:left-4 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 z-10" />
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
                            className="pl-8 sm:pl-10 md:pl-12 rounded-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-semibold border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/80 backdrop-blur-sm placeholder:text-gray-400 placeholder:opacity-70 placeholder:text-xs placeholder:font-normal"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 sm:space-y-2">
                        <Label
                          htmlFor="destinationContactPhone"
                          className="text-xs sm:text-sm font-semibold text-gray-700"
                        >
                          {t("createCargo.steps.pickupDelivery.contactPhone")}
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-2.5 sm:left-3 md:left-4 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 z-10" />
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
                            className="pl-8 sm:pl-10 md:pl-12 rounded-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-semibold border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/80 backdrop-blur-sm placeholder:text-gray-400 placeholder:opacity-70 placeholder:text-xs placeholder:font-normal"
                          />
                        </div>
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

                          setFormData({
                            ...formData,
                            pickupDate: selectedDate,
                          });
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
                      ✓{" "}
                      {t("createCargo.steps.pickupDelivery.pickupDateSelected")}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialInstructions">
                    {t("createCargo.steps.pickupDelivery.specialInstructions")}{" "}
                    ({t("auth.optional")})
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
                    className="placeholder:text-gray-400 placeholder:opacity-70 placeholder:text-sm placeholder:font-normal"
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
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full py-4 sm:py-5 text-base sm:text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                >
                  <span className="flex items-center justify-center gap-2">
                    {t("createCargo.steps.pickupDelivery.reviewCreateCargo")}
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Step 3: Cost Estimate & Confirmation */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-purple-50/30 to-pink-50/20 backdrop-blur-sm">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl md:text-2xl">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Calculator className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                </div>
                {t("createCargo.steps.confirmation.title")}
              </CardTitle>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mt-2 sm:mt-3">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-[10px] sm:text-xs font-semibold text-purple-700">
                    {t("createCargo.requiredFieldsNote")}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              {/* Pricing info note (no live estimate on create) */}
              <div className="bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/80 backdrop-blur-sm rounded-2xl p-3 sm:p-4 md:p-6 border border-blue-100/50">
                <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-2">
                  {t("createCargo.steps.confirmation.costBreakdown")}
                </h3>
                <p className="text-xs sm:text-sm text-gray-700">
                  Price will be available after our team reviews your cargo details
                  and generates an invoice.
                </p>
              </div>

              {/* Summary */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900">
                  {t("createCargo.steps.confirmation.shipmentSummary")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm">
                  <div>
                    <p className="text-muted-foreground">
                      {t("createCargo.steps.confirmation.cargoType")}
                    </p>
                    <p className="font-medium capitalize">
                      {cargoCategories?.find(
                        (c) => c.id === formData.cargoCategoryId
                      )?.name || "-"}
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

              <div className="flex gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1 rounded-full px-3 sm:px-4 py-2.5 sm:py-3 md:py-4 text-xs sm:text-sm md:text-base font-semibold border-gray-200 hover:border-blue-500 bg-white/80 backdrop-blur-sm"
                >
                  {t("common.back")}
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createCargoMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full py-3 sm:py-4 md:py-5 text-sm sm:text-base md:text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                >
                  <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                    {createCargoMutation.isPending
                      ? t("common.loading")
                      : t("createCargo.steps.confirmation.createCargo")}
                    <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Step 4: Success */}
      {step === 4 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20 backdrop-blur-sm">
            <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
              <div className="text-center space-y-4 sm:space-y-6">
                <motion.div
                  className="mx-auto w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                >
                  <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-white" />
                </motion.div>

                <div className="space-y-1.5 sm:space-y-2">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                    {t("createCargo.steps.success.title")}
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600">
                    {t("createCargo.steps.success.description")}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50/80 via-emerald-50/60 to-blue-50/80 backdrop-blur-sm rounded-2xl p-3 sm:p-4 md:p-6 space-y-2 sm:space-y-3 border border-green-100/50">
                  <div className="flex justify-between items-center p-2 sm:p-3 bg-white/60 rounded-xl">
                    <span className="text-xs sm:text-sm text-gray-700 font-medium">
                      Cargo Number:
                    </span>
                    <span className="text-xs sm:text-sm md:text-base font-bold text-gray-900">
                      {cargoData?.cargo_number || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 sm:p-3 bg-white/60 rounded-xl">
                    <span className="text-xs sm:text-sm text-gray-700 font-medium">
                      {t("createCargo.steps.success.status")}
                    </span>
                    <span className="text-green-600 font-medium">
                      {t("createCargo.steps.success.cargoCreated")}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full py-3 sm:py-4 md:py-5 text-sm sm:text-base md:text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => (window.location.href = "/my-cargos")}
                  >
                    {t("createCargo.steps.success.viewMyCargos")}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full rounded-full px-3 sm:px-4 py-2.5 sm:py-3 md:py-4 text-xs sm:text-sm md:text-base font-semibold border-gray-200 hover:border-blue-500 bg-white/80 backdrop-blur-sm"
                    onClick={() => (window.location.href = "/create-cargo")}
                  >
                    {t("createCargo.steps.success.createAnotherCargo")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
