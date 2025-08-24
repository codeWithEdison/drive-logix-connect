
import { CargoTable } from "@/components/ui/CargoTable";
import { CargoDetail } from "@/components/ui/CargoDetailModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

// Rwanda locations data
const rwandaLocations = {
  kigali: {
    name: "Kigali",
    districts: ["Nyarugenge", "Gasabo", "Kicukiro", "Remera", "Gikondo", "Kimihurura", "Kacyiru", "Kibagabaga"]
  },
  butare: {
    name: "Butare",
    districts: ["Huye", "Ngoma", "Tumba", "Mukura"]
  },
  gisenyi: {
    name: "Gisenyi",
    districts: ["Rubavu", "Gisenyi", "Nyamyumba", "Kanzenze"]
  },
  ruhengeri: {
    name: "Ruhengeri",
    districts: ["Musanze", "Kinigi", "Muhoza", "Nyange"]
  },
  kibuye: {
    name: "Kibuye",
    districts: ["Karongi", "Bwishyura", "Gishyita", "Mubuga"]
  },
  byumba: {
    name: "Byumba",
    districts: ["Gicumbi", "Byumba", "Rukomo", "Kageyo"]
  }
};

// Extended mock data with Rwanda locations and FRW currency
const mockClientCargos: CargoDetail[] = [
  {
    id: "#3565432",
    status: "transit",
    from: "Remera, Kigali, Rwanda",
    to: "Huye, Butare, Rwanda",
    driver: "Albert Flores",
    phone: "+250 788 123 456",
    estimatedTime: "2.5 hours",
    weight: "25 kg",
    type: "Electronics",
    createdDate: "2024-01-15",
    cost: 280000, // FRW
    pickupDate: "2024-01-15",
    deliveryDate: "2024-01-15",
    description: "Laptop and accessories for business delivery",
    specialInstructions: "Handle with care, fragile items",
    vehicleType: "Small Truck",
    distance: "120 km",
    pickupContact: "Marie Uwimana",
    pickupContactPhone: "+250 789 111 222",
    deliveryContact: "Pierre Ndayisaba",
    deliveryContactPhone: "+250 788 333 444"
  },
  {
    id: "#4832920",
    status: "delivered",
    from: "Nyarugenge, Kigali, Rwanda",
    to: "Rubavu, Gisenyi, Rwanda",
    driver: "Guy Hawkins",
    phone: "+250 789 234 567",
    estimatedTime: "Delivered",
    weight: "15 kg",
    type: "Documents",
    createdDate: "2024-01-14",
    cost: 150000, // FRW
    pickupDate: "2024-01-14",
    deliveryDate: "2024-01-14",
    description: "Legal documents and contracts",
    specialInstructions: "Confidential documents",
    vehicleType: "Motorcycle",
    distance: "180 km",
    pickupContact: "John Mukamana",
    pickupContactPhone: "+250 787 555 666",
    deliveryContact: "Grace Ingabire",
    deliveryContactPhone: "+250 786 777 888"
  },
  {
    id: "#1442654",
    status: "pending",
    from: "Gasabo, Kigali, Rwanda",
    to: "Musanze, Ruhengeri, Rwanda",
    driver: "Kathryn Murphy",
    phone: "+250 787 345 678",
    estimatedTime: "Pending pickup",
    weight: "40 kg",
    type: "Furniture",
    createdDate: "2024-01-13",
    cost: 320000, // FRW
    pickupDate: "2024-01-16",
    deliveryDate: "2024-01-17",
    description: "Office furniture and equipment",
    specialInstructions: "Requires special handling for large items",
    vehicleType: "Large Truck",
    distance: "110 km",
    pickupContact: "David Niyonsaba",
    pickupContactPhone: "+250 785 999 000",
    deliveryContact: "Alice Uwineza",
    deliveryContactPhone: "+250 784 111 222"
  },
  {
    id: "#9437291",
    status: "delivered",
    from: "Kicukiro, Kigali, Rwanda",
    to: "Karongi, Kibuye, Rwanda",
    driver: "Leslie Alexander",
    phone: "+250 786 456 789",
    estimatedTime: "Delivered",
    weight: "8 kg",
    type: "Medical Supplies",
    createdDate: "2024-01-12",
    cost: 95000, // FRW
    pickupDate: "2024-01-12",
    deliveryDate: "2024-01-12",
    description: "Pharmaceutical supplies and medical equipment",
    specialInstructions: "Temperature controlled delivery required",
    vehicleType: "Small Truck",
    distance: "150 km",
    pickupContact: "Rose Ndayisaba",
    pickupContactPhone: "+250 783 333 444",
    deliveryContact: "Paul Habimana",
    deliveryContactPhone: "+250 782 555 666"
  },
  {
    id: "#5648392",
    status: "cancelled",
    from: "Kimihurura, Kigali, Rwanda",
    to: "Gicumbi, Byumba, Rwanda",
    driver: "Wade Warren",
    phone: "+250 785 567 890",
    estimatedTime: "Cancelled",
    weight: "32 kg",
    type: "Books",
    createdDate: "2024-01-11",
    cost: 200000, // FRW
    pickupDate: "2024-01-11",
    deliveryDate: "Cancelled",
    description: "Educational books and learning materials",
    specialInstructions: "Keep dry and handle carefully",
    vehicleType: "Small Truck",
    distance: "80 km",
    pickupContact: "James Uwineza",
    pickupContactPhone: "+250 781 777 888",
    deliveryContact: "Sarah Mukamana",
    deliveryContactPhone: "+250 780 999 000"
  },
  {
    id: "#7891234",
    status: "transit",
    from: "Kacyiru, Kigali, Rwanda",
    to: "Nyamyumba, Gisenyi, Rwanda",
    driver: "Sarah Johnson",
    phone: "+250 784 678 901",
    estimatedTime: "1.5 hours",
    weight: "12 kg",
    type: "Clothing",
    createdDate: "2024-01-16",
    cost: 180000, // FRW
    pickupDate: "2024-01-16",
    deliveryDate: "2024-01-16",
    description: "Fashion items and accessories",
    specialInstructions: "Handle with care, avoid wrinkles",
    vehicleType: "Motorcycle",
    distance: "160 km",
    pickupContact: "Emma Habimana",
    pickupContactPhone: "+250 779 111 222",
    deliveryContact: "Charles Niyonsaba",
    deliveryContactPhone: "+250 778 333 444"
  },
  {
    id: "#4567890",
    status: "pending",
    from: "Kibagabaga, Kigali, Rwanda",
    to: "Rukomo, Byumba, Rwanda",
    driver: "Michael Chen",
    phone: "+250 783 789 012",
    estimatedTime: "Pending pickup",
    weight: "60 kg",
    type: "Machinery",
    createdDate: "2024-01-17",
    cost: 450000, // FRW
    pickupDate: "2024-01-18",
    deliveryDate: "2024-01-19",
    description: "Industrial machinery parts",
    specialInstructions: "Heavy equipment, requires special handling",
    vehicleType: "Large Truck",
    distance: "90 km",
    pickupContact: "Peter Ingabire",
    pickupContactPhone: "+250 777 555 666",
    deliveryContact: "Maria Ndayisaba",
    deliveryContactPhone: "+250 776 777 888"
  },
  {
    id: "#2345678",
    status: "delivered",
    from: "Gikondo, Kigali, Rwanda",
    to: "Kinigi, Ruhengeri, Rwanda",
    driver: "Emma Wilson",
    phone: "+250 782 890 123",
    estimatedTime: "Delivered",
    weight: "5 kg",
    type: "Food",
    createdDate: "2024-01-10",
    cost: 75000, // FRW
    pickupDate: "2024-01-10",
    deliveryDate: "2024-01-10",
    description: "Fresh produce and groceries",
    specialInstructions: "Keep refrigerated, deliver quickly",
    vehicleType: "Motorcycle",
    distance: "130 km",
    pickupContact: "David Habimana",
    pickupContactPhone: "+250 775 111 222",
    deliveryContact: "Grace Ingabire",
    deliveryContactPhone: "+250 774 333 444"
  }
];

const MyCargos = () => {
  const handleCallDriver = (phone: string) => {
    console.log("Calling driver:", phone);
    // Add logic to call driver
  };

  const handleTrackCargo = (cargoId: string) => {
    console.log("Tracking cargo:", cargoId);
    // Add logic to track cargo
  };

  const handleCancelCargo = (cargoId: string) => {
    console.log("Cancelling cargo:", cargoId);
    // Add logic to cancel cargo
  };

  const handleDownloadReceipt = (cargoId: string) => {
    console.log("Downloading receipt for cargo:", cargoId);
    // Add logic to download receipt
  };

  const handleUploadPhoto = (cargoId: string) => {
    console.log("Uploading photo for cargo:", cargoId);
    // Add logic to upload photo
  };

  const handleReportIssue = (cargoId: string) => {
    console.log("Reporting issue for cargo:", cargoId);
    // Add logic to report issue
  };

  return (
    <CargoTable
      cargos={mockClientCargos}
      title="My Cargos"
      customActions={
        <Button className="bg-gradient-primary hover:bg-primary-hover">
          <Plus className="w-4 h-4 mr-2" />
          Create New Cargo
        </Button>
      }
      onCallDriver={handleCallDriver}
      onTrackCargo={handleTrackCargo}
      onCancelCargo={handleCancelCargo}
      onDownloadReceipt={handleDownloadReceipt}
      onUploadPhoto={handleUploadPhoto}
      onReportIssue={handleReportIssue}
    />
  );
};

export default MyCargos;