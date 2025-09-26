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
    clientCompany: cargo.client_name,
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

  // Map assignment status to cargo status for proper UI display
  let status = "assigned" as any; // Default fallback
  if (assignment.assignment_status) {
    switch (assignment.assignment_status) {
      case "pending":
        status = "pending";
        break;
      case "accepted":
        status = "assigned";
        break;
      case "rejected":
        status = "cancelled";
        break;
      case "cancelled":
        status = "cancelled";
        break;
      default:
        status = "assigned";
    }
  }

  return {
    id: cargo.id || assignment.cargo_id || assignment.id,
    cargo_number: cargo.cargo_number || "",
    status: status,
    from: cargo.pickup_address || "Pickup Location",
    to: cargo.destination_address || "Delivery Location",
    clientCompany: user.full_name || "Client Name",
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
    // Vehicle information from assignment
    vehicleType: vehicle.plate_number
      ? `${vehicle.make || "Unknown"} ${vehicle.model || "Model"} (${
          vehicle.plate_number
        })`
      : "N/A",
    vehiclePlate: vehicle.plate_number || "N/A",
    vehicleMake: vehicle.make || "N/A",
    vehicleModel: vehicle.model || "N/A",
    // Vehicle info object for CargoTable compatibility
    vehicleInfo: {
      plate_number: vehicle.plate_number || "N/A",
      make: vehicle.make || "N/A",
      model: vehicle.model || "N/A",
    } as any,
    // Assignment-specific fields for driver actions
    assignmentId: assignment.id,
    assignmentStatus: assignment.assignment_status,
    assignmentExpiresAt: assignment.expires_at,
    assignmentNotes: assignment.notes,
    // Add new fields for enhanced display
  };
};

/**
 * Maps cargo with multiple assignments to CargoDetail for UI components
 */
export const mapCargoWithAssignmentsToCargoDetail = (
  cargo: any,
  assignments: any[] = []
): CargoDetail => {
  const client = cargo.client || {};
  const user = client.user || {};

  // Calculate assignment totals
  const totalAssignedWeight = assignments.reduce((sum, assignment) => {
    return sum + (assignment.assigned_weight_kg || 0);
  }, 0);

  const totalAssignedVolume = assignments.reduce((sum, assignment) => {
    return sum + (assignment.assigned_volume || 0);
  }, 0);

  const remainingWeight = (cargo.weight_kg || 0) - totalAssignedWeight;
  const remainingVolume = (cargo.volume || 0) - totalAssignedVolume;

  // Determine status based on assignments
  let status = cargo.status;
  if (assignments.length > 0) {
    if (remainingWeight <= 0) {
      status = "fully_assigned";
    } else {
      status = "partially_assigned";
    }
  }

  return {
    id: cargo.id,
    cargo_number: cargo.cargo_number || "",
    status: status as any,
    from: cargo.pickup_address || "Pickup Location",
    to: cargo.destination_address || "Delivery Location",
    clientCompany: user.full_name || "Client Name",
    phone: client.phone || "",
    weight: `${cargo.weight_kg || 0} kg`,
    type: cargo.type || "General",
    pickupTime: cargo.pickup_time || "TBD",
    estimatedDelivery: cargo.estimated_delivery_time || "TBD",
    priority: cargo.priority || ("normal" as any),
    assignedDate:
      assignments.length > 0
        ? new Date(assignments[0].created_at).toLocaleDateString()
        : new Date().toLocaleDateString(),
    distance: `${cargo.distance_km || 0} km`,
    earnings: cargo.earnings,
    description: cargo.description || "Cargo with assignments",
    specialInstructions: cargo.special_instructions || "",
    pickupContact: cargo.pickup_contact || "",
    pickupContactPhone: cargo.pickup_phone || "",
    deliveryContact: cargo.delivery_contact || "",
    deliveryContactPhone: cargo.delivery_phone || "",
    driver: assignments.length > 0 ? assignments[0].driver?.name : undefined,
    driverPhone:
      assignments.length > 0 ? assignments[0].driver?.phone : undefined,
    cost: cargo.cost,
    estimatedTime: cargo.estimated_time,
    // Multi-assignment support
    assignments: assignments.map((assignment) => ({
      id: assignment.id,
      driver_id: assignment.driver_id,
      vehicle_id: assignment.vehicle_id,
      assignment_status: assignment.assignment_status,
      assigned_weight_kg: assignment.assigned_weight_kg,
      assigned_volume: assignment.assigned_volume,
      assignment_type: assignment.assignment_type,
      expires_at: assignment.expires_at,
      driver_responded_at: assignment.driver_responded_at,
      rejection_reason: assignment.rejection_reason,
      notes: assignment.notes,
      created_at: assignment.created_at,
      updated_at: assignment.updated_at,
      driver: assignment.driver,
      vehicle: assignment.vehicle,
    })),
    totalAssignedWeight,
    totalAssignedVolume,
    remainingWeight,
    remainingVolume,
    // Add new fields for enhanced display
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

  // Extract client name with proper fallback - prioritize user full name
  const clientName =
    cargo.client?.user?.full_name ||
    cargo.client?.company_name ||
    cargo.client?.contact_person ||
    "N/A";

  console.log("🔍 Client name resolution:", {
    userFullName: cargo.client?.user?.full_name,
    companyName: cargo.client?.company_name,
    contactPerson: cargo.client?.contact_person,
    finalName: clientName,
  });

  // Extract phone number with proper fallback
  const clientPhone =
    cargo.client?.user?.phone ||
    cargo.pickup_phone ||
    cargo.destination_phone ||
    "";

  return {
    id: cargo.id,
    cargo_number: cargo.cargo_number, // Add cargo number to the mapped data
    status: cargo.status as any,
    from: cargo.pickup_address || "",
    to: cargo.destination_address || "",
    clientCompany: clientName,
    phone: clientPhone,
    weight: `${cargo.weight_kg || 0} kg`,
    type: cargo.type || "",
    pickupTime: cargo.pickup_date || "TBD",
    estimatedDelivery: cargo.delivery_date || "TBD",
    priority: cargo.priority as any,
    assignedDate: new Date(cargo.created_at || new Date()).toLocaleDateString(),
    createdDate: cargo.created_at
      ? new Date(cargo.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A",
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
