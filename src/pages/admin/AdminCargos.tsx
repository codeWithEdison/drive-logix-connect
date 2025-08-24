import React, { useState } from 'react';
import { CargoTable } from '@/components/ui/CargoTable';
import { CargoDetailModal, CargoDetail } from '@/components/ui/CargoDetailModal';
import { Button } from '@/components/ui/button';
import { Plus, Truck } from 'lucide-react';
import ModernModel from '@/components/modal/ModernModel';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock data for admin cargos - Rwanda-based
const adminCargos: CargoDetail[] = [
  {
    id: 'CRG-001',
    client: 'John Doe',
    driver: 'Jean Baptiste',
    phone: '+250 123 456 789',
    from: 'Kigali',
    to: 'Butare',
    type: 'Electronics',
    weight: '45kg',
    status: 'transit',
    cost: 280000,
    distance: '135 km',
    createdDate: '2024-01-15',
    estimatedTime: '2 hours',
    priority: 'standard'
  },
  {
    id: 'CRG-002',
    client: 'Sarah Johnson',
    driver: 'Unassigned',
    phone: '+250 234 567 890',
    from: 'Kigali',
    to: 'Musanze',
    type: 'Furniture',
    weight: '120kg',
    status: 'pending',
    cost: 320000,
    distance: '85 km',
    createdDate: '2024-01-16',
    estimatedTime: '1.5 hours',
    priority: 'urgent'
  },
  {
    id: 'CRG-003',
    client: 'Marie Claire',
    driver: 'Alice Uwimana',
    phone: '+250 345 678 901',
    from: 'Kigali',
    to: 'Rubavu',
    type: 'Documents',
    weight: '2kg',
    status: 'delivered',
    cost: 180000,
    distance: '120 km',
    createdDate: '2024-01-14',
    estimatedTime: '2.5 hours',
    priority: 'standard'
  },
  {
    id: 'CRG-004',
    client: 'Emmanuel Ndayisaba',
    driver: 'Unassigned',
    phone: '+250 456 789 012',
    from: 'Butare',
    to: 'Kigali',
    type: 'Agricultural',
    weight: '200kg',
    status: 'pending',
    cost: 450000,
    distance: '135 km',
    createdDate: '2024-01-17',
    estimatedTime: '2 hours',
    priority: 'urgent'
  },
  {
    id: 'CRG-005',
    client: 'Grace Uwase',
    driver: 'Pierre Nkurunziza',
    phone: '+250 567 890 123',
    from: 'Musanze',
    to: 'Kigali',
    type: 'Textiles',
    weight: '80kg',
    status: 'transit',
    cost: 250000,
    distance: '85 km',
    createdDate: '2024-01-15',
    estimatedTime: '1.5 hours',
    priority: 'standard'
  }
];

export default function AdminCargos() {
  const [cargos, setCargos] = useState<CargoDetail[]>(adminCargos);
  const [selectedCargo, setSelectedCargo] = useState<CargoDetail | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isTruckAssignmentModalOpen, setIsTruckAssignmentModalOpen] = useState(false);
  const [cargoForAssignment, setCargoForAssignment] = useState<CargoDetail | null>(null);

  const handleViewDetails = (cargo: CargoDetail) => {
    setSelectedCargo(cargo);
    setIsDetailModalOpen(true);
  };

  const handleAssignTruck = (cargo: CargoDetail) => {
    setCargoForAssignment(cargo);
    setIsTruckAssignmentModalOpen(true);
  };

  const handleCreateNewCargo = () => {
    // Navigate to create new cargo page
    window.location.href = '/admin/cargos/new';
  };

  const handleCallClient = (phone: string) => {
    console.log(`Calling client: ${phone}`);
    // Implement call functionality
  };

  const handleCallDriver = (phone: string) => {
    console.log(`Calling driver: ${phone}`);
    // Implement call functionality
  };

  const handleTrackCargo = (cargoId: string) => {
    console.log(`Tracking cargo: ${cargoId}`);
    // Navigate to tracking page
    window.location.href = `/admin/tracking/${cargoId}`;
  };

  const handleCancelCargo = (cargoId: string) => {
    console.log(`Cancelling cargo: ${cargoId}`);
    // Update cargo status to cancelled
    setCargos(prev => prev.map(cargo =>
      cargo.id === cargoId ? { ...cargo, status: 'cancelled' as const } : cargo
    ));
  };

  const handleDownloadReceipt = (cargoId: string) => {
    console.log(`Downloading receipt for: ${cargoId}`);
    // Generate and download receipt
    const cargo = cargos.find(c => c.id === cargoId);
    if (cargo) {
      const receiptData = {
        id: cargo.id,
        client: cargo.client,
        cost: cargo.cost,
        date: new Date().toISOString(),
        type: 'receipt'
      };

      const blob = new Blob([JSON.stringify(receiptData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${cargoId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleUploadPhoto = (cargoId: string) => {
    console.log(`Uploading photo for: ${cargoId}`);
    // Implement photo upload functionality
  };

  const handleReportIssue = (cargoId: string) => {
    console.log(`Reporting issue for: ${cargoId}`);
    // Navigate to issue reporting page
    window.location.href = `/admin/issues/${cargoId}`;
  };

  const handleTruckAssignment = (cargoId: string, truckId: string, driverId: string) => {
    console.log(`Assigning truck ${truckId} and driver ${driverId} to cargo ${cargoId}`);
    // Update cargo with assigned driver
    setCargos(prev => prev.map(cargo =>
      cargo.id === cargoId ? { ...cargo, driver: 'Assigned Driver', status: 'transit' as const } : cargo
    ));
    setIsTruckAssignmentModalOpen(false);
    setCargoForAssignment(null);
  };

  // Custom actions for admin
  const customActions = (
    <Button onClick={handleCreateNewCargo}>
      <Plus className="h-4 w-4 mr-2" />
      Create New Cargo
    </Button>
  );

  return (
    <div className="space-y-6">
      <CargoTable
        cargos={cargos}
        title="Cargo Management"
        showStats={true}
        showSearch={true}
        showFilters={true}
        showPagination={true}
        itemsPerPage={10}
        onCallClient={handleCallClient}
        onCallDriver={handleCallDriver}
        onTrackCargo={handleTrackCargo}
        onCancelCargo={handleCancelCargo}
        onDownloadReceipt={handleDownloadReceipt}
        onUploadPhoto={handleUploadPhoto}
        onReportIssue={handleReportIssue}
        onViewDetails={handleViewDetails}
        customActions={customActions}
      />

      {/* Cargo Detail Modal */}
      <CargoDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedCargo(null);
        }}
        cargo={selectedCargo}
        onCallClient={handleCallClient}
        onCallDriver={handleCallDriver}
        onUploadPhoto={handleUploadPhoto}
        onReportIssue={handleReportIssue}
      />

      {/* Truck Assignment Modal using ModernModel */}
      <ModernModel
        isOpen={isTruckAssignmentModalOpen}
        onClose={() => {
          setIsTruckAssignmentModalOpen(false);
          setCargoForAssignment(null);
        }}
        title="Assign Truck & Driver"
      >
        {cargoForAssignment && (
          <div className="space-y-6">
            {/* Cargo Details */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Cargo Details</h3>
                  <Badge className={cargoForAssignment.priority === 'urgent' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}>
                    {cargoForAssignment.priority?.toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Cargo ID</p>
                    <p className="text-lg font-semibold">{cargoForAssignment.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Client</p>
                    <p className="text-lg">{cargoForAssignment.client}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Route</p>
                    <p className="text-lg">{cargoForAssignment.from} → {cargoForAssignment.to}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Weight & Type</p>
                    <p className="text-lg">{cargoForAssignment.weight} • {cargoForAssignment.type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Distance</p>
                    <p className="text-lg">{cargoForAssignment.distance}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Cost</p>
                    <p className="text-lg font-semibold text-green-600">
                      {new Intl.NumberFormat('rw-RW', {
                        style: 'currency',
                        currency: 'RWF',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(cargoForAssignment.cost || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assignment Form */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-900 mb-4">Assignment Details</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Select Truck</label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Choose a truck..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="truck-1">Ford F-650 (ABC-123)</SelectItem>
                        <SelectItem value="truck-2">Chevrolet Silverado (XYZ-789)</SelectItem>
                        <SelectItem value="truck-3">Dodge Ram (DEF-456)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Select Driver</label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Choose a driver..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="driver-1">Albert Flores (4.8★)</SelectItem>
                        <SelectItem value="driver-2">Mike Johnson (4.6★)</SelectItem>
                        <SelectItem value="driver-3">Sarah Wilson (4.9★)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsTruckAssignmentModalOpen(false);
                  setCargoForAssignment(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => handleTruckAssignment(cargoForAssignment.id, 'truck-1', 'driver-1')}
              >
                <Truck className="h-4 w-4 mr-2" />
                Assign Truck & Driver
              </Button>
            </div>
          </div>
        )}
      </ModernModel>
    </div>
  );
}