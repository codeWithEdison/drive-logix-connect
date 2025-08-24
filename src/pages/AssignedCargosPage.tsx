import { CargoTable } from "@/components/ui/CargoTable";
import { CargoDetail } from "@/components/ui/CargoDetailModal";

// Rwanda-based mock data for assigned cargos
const mockAssignedCargos: CargoDetail[] = [
    {
        id: "#RW3565432",
        status: "active",
        from: "Kigali, Gasabo District, Kimihurura",
        to: "Kigali, Kicukiro District, Gikondo",
        client: "Jean Pierre Uwimana",
        phone: "+250 788 123 456",
        weight: "25 kg",
        type: "Electronics",
        pickupTime: "10:00 AM",
        estimatedDelivery: "2:30 PM",
        priority: "urgent",
        assignedDate: "2024-01-15",
        distance: "8.5 km",
        earnings: "RWF 45,000",
        description: "Laptop and accessories for business client",
        specialInstructions: "Handle with care, fragile items",
        pickupContact: "Marie Uwimana",
        pickupContactPhone: "+250 789 111 222",
        deliveryContact: "Pierre Ndayisaba",
        deliveryContactPhone: "+250 788 333 444"
    },
    {
        id: "#RW4832920",
        status: "pending",
        from: "Kigali, Nyarugenge District, Nyamirambo",
        to: "Kigali, Gasabo District, Remera",
        client: "Sarah Mukamana",
        phone: "+250 789 987 654",
        weight: "15 kg",
        type: "Documents",
        pickupTime: "3:00 PM",
        estimatedDelivery: "5:30 PM",
        priority: "standard",
        assignedDate: "2024-01-15",
        distance: "6.2 km",
        earnings: "RWF 32,000",
        description: "Legal documents and contracts",
        pickupContact: "John Mukamana",
        pickupContactPhone: "+250 787 555 666",
        deliveryContact: "Grace Ingabire",
        deliveryContactPhone: "+250 786 777 888"
    },
    {
        id: "#RW1442654",
        status: "pending",
        from: "Kigali, Gasabo District, Kacyiru",
        to: "Kigali, Kicukiro District, Kanombe",
        client: "Kathryn Niyonsaba",
        phone: "+250 787 456 789",
        weight: "40 kg",
        type: "Furniture",
        pickupTime: "1:00 PM",
        estimatedDelivery: "4:00 PM",
        priority: "standard",
        assignedDate: "2024-01-15",
        distance: "12.8 km",
        earnings: "RWF 38,000",
        description: "Office furniture and equipment",
        pickupContact: "David Niyonsaba",
        pickupContactPhone: "+250 785 999 000",
        deliveryContact: "Alice Uwineza",
        deliveryContactPhone: "+250 784 111 222"
    },
    {
        id: "#RW7890123",
        status: "active",
        from: "Kigali, Nyarugenge District, Gitega",
        to: "Kigali, Gasabo District, Kimironko",
        client: "Michael Ndayisaba",
        phone: "+250 788 321 098",
        weight: "30 kg",
        type: "Clothing",
        pickupTime: "9:00 AM",
        estimatedDelivery: "11:30 AM",
        priority: "urgent",
        assignedDate: "2024-01-15",
        distance: "7.3 km",
        earnings: "RWF 42,000",
        description: "Fashion items for boutique",
        pickupContact: "Rose Ndayisaba",
        pickupContactPhone: "+250 783 333 444",
        deliveryContact: "Paul Habimana",
        deliveryContactPhone: "+250 782 555 666"
    },
    {
        id: "#RW4567890",
        status: "completed",
        from: "Kigali, Kicukiro District, Kagarama",
        to: "Kigali, Gasabo District, Kacyiru",
        client: "Lisa Uwineza",
        phone: "+250 789 654 321",
        weight: "20 kg",
        type: "Food",
        pickupTime: "8:00 AM",
        estimatedDelivery: "10:00 AM",
        priority: "standard",
        assignedDate: "2024-01-14",
        distance: "5.1 km",
        earnings: "RWF 28,000",
        description: "Fresh produce and groceries",
        pickupContact: "James Uwineza",
        pickupContactPhone: "+250 781 777 888",
        deliveryContact: "Sarah Mukamana",
        deliveryContactPhone: "+250 780 999 000"
    },
    {
        id: "#RW2345678",
        status: "active",
        from: "Kigali, Gasabo District, Kigali Heights",
        to: "Kigali, Nyarugenge District, City Center",
        client: "David Habimana",
        phone: "+250 788 555 123",
        weight: "35 kg",
        type: "Electronics",
        pickupTime: "2:00 PM",
        estimatedDelivery: "4:00 PM",
        priority: "urgent",
        assignedDate: "2024-01-15",
        distance: "4.2 km",
        earnings: "RWF 48,000",
        description: "Computer parts and accessories",
        pickupContact: "Emma Habimana",
        pickupContactPhone: "+250 779 111 222",
        deliveryContact: "Charles Niyonsaba",
        deliveryContactPhone: "+250 778 333 444"
    },
    {
        id: "#RW3456789",
        status: "pending",
        from: "Kigali, Kicukiro District, Gikondo",
        to: "Kigali, Gasabo District, Remera",
        client: "Grace Ingabire",
        phone: "+250 789 777 888",
        weight: "18 kg",
        type: "Documents",
        pickupTime: "11:00 AM",
        estimatedDelivery: "1:30 PM",
        priority: "standard",
        assignedDate: "2024-01-15",
        distance: "9.7 km",
        earnings: "RWF 35,000",
        description: "Academic papers and research documents",
        pickupContact: "Peter Ingabire",
        pickupContactPhone: "+250 777 555 666",
        deliveryContact: "Maria Ndayisaba",
        deliveryContactPhone: "+250 776 777 888"
    }
];

export function AssignedCargosPage() {
    const handleAcceptCargo = (cargoId: string) => {
        console.log("Accepting cargo:", cargoId);
        // Add logic to accept cargo
    };

    const handleStartDelivery = (cargoId: string) => {
        console.log("Starting delivery for cargo:", cargoId);
        // Add logic to start delivery
    };

    const handleCallClient = (phone: string) => {
        console.log("Calling client:", phone);
        // Add logic to call client
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
            cargos={mockAssignedCargos}
            title="Assigned Cargos"
            onAcceptCargo={handleAcceptCargo}
            onStartDelivery={handleStartDelivery}
            onCallClient={handleCallClient}
            onUploadPhoto={handleUploadPhoto}
            onReportIssue={handleReportIssue}
        />
    );
}
