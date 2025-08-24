import React, { useState } from 'react';
import { CustomTabs } from '@/components/ui/CustomTabs';
import { DeliveryCard } from '@/components/ui/DeliveryCard';
import { DeliveryDetailModal } from '@/components/ui/DeliveryDetailModal';
import { ContactDropdown } from '@/components/ui/ContactDropdown';

const activeDeliveries = [
  {
    id: 'DEL-001',
    cargo: 'Electronics Package',
    from: 'Kigali',
    to: 'Butare',
    client: 'John Doe',
    phone: '+250 781 234567',
    status: 'in_transit',
    priority: 'urgent',
    estimatedTime: '2:30 PM',
    distance: '45km remaining'
  },
  {
    id: 'DEL-002',
    cargo: 'Furniture Set',
    from: 'Kigali',
    to: 'Musanze',
    client: 'Sarah Johnson',
    phone: '+250 781 234568',
    status: 'pickup_scheduled',
    priority: 'normal',
    estimatedTime: '4:00 PM',
    distance: 'Pickup at 3:00 PM'
  }
];

const completedDeliveries = [
  {
    id: 'DEL-003',
    cargo: 'Documents',
    from: 'Kigali',
    to: 'Muhanga',
    client: 'Marie Claire',
    phone: '+250 781 234569',
    status: 'delivered',
    priority: 'normal',
    completedAt: '11:30 AM',
    rating: 5.0
  }
];

export default function DriverDeliveries() {
  const [selectedTab, setSelectedTab] = useState('active');
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tabs = [
    {
      value: 'active',
      label: 'Active Deliveries',
      count: activeDeliveries.length
    },
    {
      value: 'completed',
      label: 'Completed Today',
      count: completedDeliveries.length
    }
  ];

  const handleViewDetails = (delivery: any) => {
    setSelectedDelivery(delivery);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDelivery(null);
  };

  const handleNavigate = () => {
    // Handle navigation logic
    console.log('Navigate clicked');
  };

  const handleCallClient = () => {
    // Handle call client logic
    console.log('Call client clicked');
  };

  const handleMarkDelivered = () => {
    // Handle mark delivered logic
    console.log('Mark delivered clicked');
  };

  const handleStartPickup = () => {
    // Handle start pickup logic
    console.log('Start pickup clicked');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Deliveries</h1>
        <p className="text-muted-foreground">Manage your active and completed deliveries</p>
      </div>

      {/* Custom Tabs */}
      <CustomTabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        tabs={tabs}
      />

      {/* Content */}
      <div className="space-y-4">
        {selectedTab === 'active' && (
          <div className="space-y-4">
            {activeDeliveries.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground">
                  <p className="text-lg font-medium">No active deliveries</p>
                  <p className="text-sm">You're all caught up!</p>
                </div>
              </div>
            ) : (
              activeDeliveries.map((delivery) => (
                <DeliveryCard
                  key={delivery.id}
                  delivery={delivery}
                  onViewDetails={handleViewDetails}
                  onNavigate={handleNavigate}
                  onCallClient={handleCallClient}
                  onMarkDelivered={handleMarkDelivered}
                  onStartPickup={handleStartPickup}
                />
              ))
            )}
          </div>
        )}

        {selectedTab === 'completed' && (
          <div className="space-y-4">
            {completedDeliveries.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground">
                  <p className="text-lg font-medium">No completed deliveries today</p>
                  <p className="text-sm">Keep up the great work!</p>
                </div>
              </div>
            ) : (
              completedDeliveries.map((delivery) => (
                <DeliveryCard
                  key={delivery.id}
                  delivery={delivery}
                  onViewDetails={handleViewDetails}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <DeliveryDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        delivery={selectedDelivery}
      />
    </div>
  );
}