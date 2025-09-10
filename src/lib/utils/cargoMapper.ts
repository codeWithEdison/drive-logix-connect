import { DeliveryAssignment } from "../../types/shared";
import { CargoDetail } from "../../components/ui/CargoDetailModal";

/**
 * Maps dashboard assigned cargo data to CargoDetail for UI components
 */
export const mapDashboardCargoToCargoDetail = (cargo: any): CargoDetail => {
  return {
    id: cargo.cargo_id?.toString() || "",
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
  return {
    id: assignment.cargo_id || assignment.id,
    status: "assigned" as any, // Default status since not in assignment
    from: assignment.cargo?.pickup_address || "Pickup Location",
    to: assignment.cargo?.destination_address || "Delivery Location",
    client: "Client Name", // Default since not in assignment
    phone: "", // Default since not in assignment
    weight: "0 kg", // Default since not in assignment
    type: assignment.cargo?.type || "General",
    pickupTime: "TBD", // Default since not in assignment
    estimatedDelivery: "TBD", // Default since not in assignment
    priority: "normal" as any, // Default since not in assignment
    assignedDate: new Date(assignment.assigned_at).toLocaleDateString(),
    distance: "0 km", // Default since not in assignment
    earnings: undefined, // Default since not in assignment
    description: "Delivery assignment", // Default since not in assignment
    specialInstructions: "", // Default since not in assignment
    pickupContact: "", // Default since not in assignment
    pickupContactPhone: "", // Default since not in assignment
    deliveryContact: "", // Default since not in assignment
    deliveryContactPhone: "", // Default since not in assignment
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
 */
export const mapCargoToCargoDetail = (cargo: any): CargoDetail => {
  return {
    id: cargo.id,
    status: cargo.status as any,
    from: cargo.pickup_address || "",
    to: cargo.destination_address || "",
    client: cargo.client_name || "",
    phone: cargo.client_phone || "",
    weight: `${cargo.weight_kg || 0} kg`,
    type: cargo.type || "",
    pickupTime: cargo.pickup_date || "TBD",
    estimatedDelivery: cargo.delivery_date || "TBD",
    priority: cargo.priority as any,
    assignedDate: new Date(cargo.created_at || new Date()).toLocaleDateString(),
    distance: `${cargo.distance_km || 0} km`,
    earnings: cargo.final_cost
      ? `RWF ${cargo.final_cost.toLocaleString()}`
      : undefined,
    description: cargo.special_requirements,
    specialInstructions: cargo.delivery_instructions,
    pickupContact: cargo.pickup_contact,
    pickupContactPhone: cargo.pickup_phone,
    deliveryContact: cargo.destination_contact,
    deliveryContactPhone: cargo.destination_phone,
  };
};

/**
 * Maps array of Cargos to CargoDetails
 */
export const mapCargosToCargoDetails = (cargos: any[]): CargoDetail[] => {
  return cargos.map(mapCargoToCargoDetail);
};
