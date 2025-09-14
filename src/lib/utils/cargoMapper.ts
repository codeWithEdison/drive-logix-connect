import { DeliveryAssignment } from "../../types/shared";
import { CargoDetail } from "../../components/ui/CargoDetailModal";

/**
 * Maps dashboard assigned cargo data to CargoDetail for UI components
 */
export const mapDashboardCargoToCargoDetail = (cargo: any): CargoDetail => {
  return {
    id: cargo.cargo_id?.toString() || "",
    cargo_number: cargo.cargo_number || "", // Add cargo_number field
    status: cargo.status as any,
    from: cargo.pickup_address || "",
    to: cargo.delivery_address || "",
    client: cargo.client_name,
    phone: cargo.client_phone || "",
    weight: `${cargo.weight || 0} kg`,
    type: cargo.cargo_type || "",
    pickupTime: cargo.pickup_time,
    estimatedDelivery: cargo.estimated_delivery_time,
    priority: cargo.priority as any,
    assignedDate: new Date().toLocaleDateString(), // Dashboard doesn't have assigned_at
    distance: `${cargo.route_distance_km || 0} km`,
    earnings: undefined, // Dashboard doesn't have earnings
    description: cargo.special_instructions,
    specialInstructions: cargo.special_instructions,
    pickupContact: cargo.pickup_contact,
    pickupContactPhone: cargo.pickup_phone,
    deliveryContact: cargo.delivery_contact,
    deliveryContactPhone: cargo.delivery_phone,
  };
};

/**
 * Maps array of dashboard cargos to CargoDetails
 */
export const mapDashboardCargosToCargoDetails = (
  cargos: any[]
): CargoDetail[] => {
  return cargos.map(mapDashboardCargoToCargoDetail);
};

/**
 * Maps DeliveryAssignment from API to CargoDetail for UI components
 * Updated to handle the actual API response structure with nested cargo and vehicle objects
 */
export const mapDeliveryAssignmentToCargoDetail = (
  assignment: any // Use 'any' to handle the actual API response structure
): CargoDetail => {
  const cargo = assignment.cargo || {};
  const client = cargo.client || {};
  const user = client.user || {};
  const vehicle = assignment.vehicle || {};

  return {
    id: cargo.id || assignment.cargo_id || assignment.id,
    cargo_number: cargo.cargo_number || "",
    status: "assigned" as any, // Default status since these are assignments
    from: cargo.pickup_address || "Pickup Location",
    to: cargo.destination_address || "Delivery Location",
    client: user.full_name || "Client Name",
    clientCompany: client.company_name || "",
    phone: client.phone || "",
    weight: `${cargo.weight_kg || 0} kg`, // Updated to use weight_kg
    type: cargo.type || "General",
    pickupTime: cargo.pickup_time || "TBD",
    estimatedDelivery: cargo.estimated_delivery_time || "TBD",
    priority: cargo.priority || ("normal" as any),
    assignedDate: assignment.assigned_at
      ? new Date(assignment.assigned_at).toLocaleDateString()
      : new Date().toLocaleDateString(),
    distance: `${cargo.distance_km || 0} km`,
    earnings: cargo.earnings,
    description: cargo.description || "Delivery assignment",
    specialInstructions: cargo.special_instructions || "",
    pickupContact: cargo.pickup_contact || "",
    pickupContactPhone: cargo.pickup_phone || "",
    deliveryContact: cargo.delivery_contact || "",
    deliveryContactPhone: cargo.delivery_phone || "",
    driver: assignment.driver_name,
    driverPhone: assignment.driver_phone,
    cost: cargo.cost,
    estimatedTime: cargo.estimated_time,
    // Add new fields for enhanced display
    pickupLocation: cargo.pickup_location || {},
    destinationLocation: cargo.destination_location || {},
    vehicleInfo: {
      plate_number: vehicle.plate_number || "",
      make: vehicle.make || "",
      model: vehicle.model || "",
    },
    // Assignment system fields
    assignmentStatus: "assigned" as any, // Default to assigned since these are assignments
    assignmentId: assignment.id,
    assignmentExpiresAt: assignment.expires_at,
    driverRespondedAt: assignment.driver_responded_at,
    rejectionReason: assignment.rejection_reason,
    assignmentCreatedBy: assignment.created_by,
    assignmentNotes: assignment.notes,
    driverStatus: "on_duty" as any, // Default to on_duty for assigned cargos
  };
};

/**
 * Maps array of DeliveryAssignments to CargoDetails
 */
export const mapDeliveryAssignmentsToCargoDetails = (
  assignments: any[] // Use 'any' to handle the actual API response structure
): CargoDetail[] => {
  return assignments.map(mapDeliveryAssignmentToCargoDetail);
};

/**
 * Maps Cargo from API to CargoDetail for UI components
 * Updated to handle the actual API response structure
 */
export const mapCargoToCargoDetail = (cargo: any): CargoDetail => {
  // Debug logging to see the actual structure
  console.log("🔍 mapCargoToCargoDetail - cargo:", cargo);
  console.log("🔍 mapCargoToCargoDetail - cargo.client:", cargo.client);
  console.log(
    "🔍 mapCargoToCargoDetail - cargo.client?.company_name:",
    cargo.client?.company_name
  );
  console.log(
    "🔍 mapCargoToCargoDetail - cargo.client?.user?.full_name:",
    cargo.client?.user?.full_name
  );

  // Extract client name with proper fallback
  const clientName =
    cargo.client?.company_name ||
    cargo.client?.user?.full_name ||
    cargo.client?.contact_person ||
    "N/A";

  // Extract phone number with proper fallback
  const clientPhone =
    cargo.client?.user?.phone ||
    cargo.pickup_phone ||
    cargo.destination_phone ||
    "";

  return {
    id: cargo.id,
    status: cargo.status as any,
    from: cargo.pickup_address || "",
    to: cargo.destination_address || "",
    client: clientName,
    phone: clientPhone,
    weight: `${cargo.weight_kg || 0} kg`,
    type: cargo.type || "",
    pickupTime: cargo.pickup_date || "TBD",
    estimatedDelivery: cargo.delivery_date || "TBD",
    priority: cargo.priority as any,
    assignedDate: new Date(cargo.created_at || new Date()).toLocaleDateString(),
    distance: `${cargo.distance_km || 0} km`,
    cost: cargo.estimated_cost ? parseFloat(cargo.estimated_cost) : undefined,
    earnings: cargo.final_cost
      ? `RWF ${parseFloat(cargo.final_cost).toLocaleString()}`
      : undefined,
    description: cargo.special_requirements,
    specialInstructions: cargo.delivery_instructions,
    pickupContact: cargo.pickup_contact,
    pickupContactPhone: cargo.pickup_phone,
    deliveryContact: cargo.destination_contact,
    deliveryContactPhone: cargo.destination_phone,
    driver: cargo.delivery_assignment?.driver?.user?.full_name || "",
    vehicleType: cargo.delivery_assignment?.vehicle?.plate_number || "",

    // Enhanced fields for better data display
    clientCompany: cargo.client?.company_name || "",
    clientContactPerson: cargo.client?.contact_person || "",
    clientPhone: cargo.client?.user?.phone || "",
    driverName: cargo.delivery_assignment?.driver?.user?.full_name || "",
    driverPhone: cargo.delivery_assignment?.driver?.user?.phone || "",
    driverRating: cargo.delivery_assignment?.driver?.rating || "",
    driverLicense: cargo.delivery_assignment?.driver?.license_number || "",
    vehiclePlate: cargo.delivery_assignment?.vehicle?.plate_number || "",
    vehicleMake: cargo.delivery_assignment?.vehicle?.make || "",
    vehicleModel: cargo.delivery_assignment?.vehicle?.model || "",
  };
};

/**
 * Maps array of Cargos to CargoDetails
 */
export const mapCargosToCargoDetails = (cargos: any[]): CargoDetail[] => {
  return cargos.map(mapCargoToCargoDetail);
};
