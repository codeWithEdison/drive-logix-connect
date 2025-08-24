import React, { useState, useEffect } from 'react';
import { CustomTabs } from '@/components/ui/CustomTabs';
import { DeliveryCard } from '@/components/ui/DeliveryCard';
import { DeliveryDetailModal } from '@/components/ui/DeliveryDetailModal';
import { DeliveryTable, Delivery } from '@/components/ui/DeliveryTable';
import { ContactDropdown } from '@/components/ui/ContactDropdown';
import { PhotoUploadModal } from '@/components/ui/PhotoUploadModal';
import { SignatureCapture } from '@/components/ui/SignatureCapture';
import ModernModel from '@/components/modal/ModernModel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import gpsTrackingService, { LocationData } from '@/services/GpsTrackingService';
import {
  MapPin,
  Navigation,
  Camera,
  Upload,
  PenTool,
  AlertCircle,
  CheckCircle,
  Phone,
  Truck,
  Clock
} from 'lucide-react';

// Enhanced mock data with more realistic Rwanda-based deliveries
const activeDeliveries: Delivery[] = [
  {
    id: 'DEL-001',
    cargo: 'Electronics Package',
    from: 'Kigali, Gasabo District, Kimihurura',
    to: 'Butare, Huye District, University of Rwanda',
    client: 'Jean Pierre Uwimana',
    phone: '+250 781 234567',
    status: 'in_transit',
    priority: 'urgent',
    estimatedTime: '2:30 PM',
    distance: '45km remaining',
    pickupContact: 'Marie Uwimana',
    pickupContactPhone: '+250 789 111 222',
    deliveryContact: 'Pierre Ndayisaba',
    deliveryContactPhone: '+250 788 333 444'
  },
  {
    id: 'DEL-002',
    cargo: 'Furniture Set',
    from: 'Kigali, Nyarugenge District, Nyamirambo',
    to: 'Musanze, Musanze District, Volcanoes National Park',
    client: 'Sarah Mukamana',
    phone: '+250 781 234568',
    status: 'active',
    priority: 'normal',
    estimatedTime: '4:00 PM',
    distance: '78km remaining',
    pickupContact: 'John Mukamana',
    pickupContactPhone: '+250 787 555 666',
    deliveryContact: 'Grace Ingabire',
    deliveryContactPhone: '+250 786 777 888'
  },
  {
    id: 'DEL-003',
    cargo: 'Medical Supplies',
    from: 'Kigali, Kicukiro District, Gikondo',
    to: 'Kibuye, Karongi District, Lake Kivu',
    client: 'Dr. Kathryn Niyonsaba',
    phone: '+250 781 234569',
    status: 'active',
    priority: 'urgent',
    estimatedTime: '3:15 PM',
    distance: '120km remaining',
    pickupContact: 'David Niyonsaba',
    pickupContactPhone: '+250 785 999 000',
    deliveryContact: 'Alice Uwineza',
    deliveryContactPhone: '+250 784 111 222'
  }
];

const completedDeliveries: Delivery[] = [
  {
    id: 'DEL-004',
    cargo: 'Food Supplies',
    from: 'Kigali, Gasabo District, Remera',
    to: 'Gitarama, Muhanga District, City Center',
    client: 'Michael Ndayisaba',
    phone: '+250 781 234570',
    status: 'delivered',
    priority: 'normal',
    completedAt: '2024-01-15 11:30 AM',
    rating: 4.8,
    distance: '32km',
    pickupContact: 'Rose Ndayisaba',
    pickupContactPhone: '+250 783 333 444',
    deliveryContact: 'Paul Habimana',
    deliveryContactPhone: '+250 782 555 666'
  },
  {
    id: 'DEL-005',
    cargo: 'Documents',
    from: 'Kigali, Nyarugenge District, City Center',
    to: 'Ruhengeri, Musanze District, Business District',
    client: 'Lisa Uwineza',
    phone: '+250 781 234571',
    status: 'delivered',
    priority: 'normal',
    completedAt: '2024-01-15 09:45 AM',
    rating: 5.0,
    distance: '85km',
    pickupContact: 'James Uwineza',
    pickupContactPhone: '+250 781 777 888',
    deliveryContact: 'Sarah Mukamana',
    deliveryContactPhone: '+250 780 999 000'
  }
];

export default function DriverDeliveries() {
  const [activeTab, setActiveTab] = useState('active');
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [photoUploadType, setPhotoUploadType] = useState<'loading' | 'delivery' | 'receipt' | 'signature'>('loading');
  const [isGpsTracking, setIsGpsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const { toast } = useToast();

  // GPS Tracking setup
  useEffect(() => {
    const initializeGps = async () => {
      try {
        const hasPermission = await gpsTrackingService.requestPermission();
        if (hasPermission) {
          const location = await gpsTrackingService.getCurrentPosition();
          setCurrentLocation(location);
        }
      } catch (error) {
        console.error('GPS initialization failed:', error);
      }
    };

    initializeGps();
  }, []);

  const handleViewDetails = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setIsDetailModalOpen(true);
  };

  const handleCallClient = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleNavigate = async (delivery: Delivery) => {
    try {
      // Start GPS tracking
      await gpsTrackingService.startTracking({
        onLocationUpdate: (location) => {
          setCurrentLocation(location);
          // Share location with admin system
          gpsTrackingService.shareLocationWithAdmin(
            location,
            'driver-123', // Replace with actual driver ID
            delivery.id
          );
        },
        onError: (error) => {
          console.error('GPS tracking error:', error);
          toast({
            title: "GPS Error",
            description: "Unable to track location. Please check GPS permissions.",
            variant: "destructive"
          });
        }
      });

      setIsGpsTracking(true);
      toast({
        title: "Navigation Started",
        description: "GPS tracking is now active. Your location is being shared with the admin.",
      });

      // Open navigation in maps app
      const destination = encodeURIComponent(delivery.to);
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
    } catch (error) {
      console.error('Navigation failed:', error);
      toast({
        title: "Navigation Failed",
        description: "Unable to start navigation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePhotoUpload = (type: 'loading' | 'delivery' | 'receipt' | 'signature') => {
    setPhotoUploadType(type);
    setIsPhotoModalOpen(true);
  };

  const handleSignatureCapture = () => {
    setIsSignatureModalOpen(true);
  };

  const handlePhotoUploadSubmit = async (data: {
    photos: File[];
    notes: string;
    type: string;
    cargoId: string;
  }) => {
    try {
      // Simulate upload
      console.log('Uploading photos:', data);

      // Here you would typically upload to your backend
      // const formData = new FormData();
      // data.photos.forEach(photo => formData.append('photos', photo));
      // formData.append('notes', data.notes);
      // formData.append('type', data.type);
      // formData.append('cargoId', data.cargoId);

      toast({
        title: "Photos Uploaded",
        description: `${data.photos.length} photos uploaded successfully for ${data.type}.`,
      });

      setIsPhotoModalOpen(false);
    } catch (error) {
      console.error('Photo upload failed:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload photos. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSignatureSave = async (signature: string, customerName: string, notes: string) => {
    try {
      // Simulate signature save
      console.log('Saving signature:', { signature, customerName, notes });

      toast({
        title: "Signature Captured",
        description: `Signature captured for ${customerName}.`,
      });

      setIsSignatureModalOpen(false);
    } catch (error) {
      console.error('Signature save failed:', error);
      toast({
        title: "Signature Failed",
        description: "Failed to save signature. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleMarkDelivered = async (delivery: Delivery) => {
    try {
      // Simulate delivery completion
      console.log('Marking delivery as completed:', delivery.id);

      toast({
        title: "Delivery Completed",
        description: `Delivery ${delivery.id} has been marked as completed.`,
      });
    } catch (error) {
      console.error('Delivery completion failed:', error);
      toast({
        title: "Completion Failed",
        description: "Failed to mark delivery as completed. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleReportIssue = (delivery: Delivery) => {
    toast({
      title: "Report Issue",
      description: `Issue reported for delivery ${delivery.id}. Support team will contact you shortly.`,
    });
  };

  const tabs = [
    {
      value: 'active',
      label: 'Active Deliveries',
      count: activeDeliveries.length
    },
    {
      value: 'completed',
      label: 'Completed',
      count: completedDeliveries.length
    }
  ];

  const currentDeliveries = activeTab === 'active' ? activeDeliveries : completedDeliveries;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Deliveries</h1>
          <p className="text-muted-foreground">Manage your active and completed deliveries</p>
        </div>
        <div className="flex items-center gap-4">
          {isGpsTracking && (
            <Badge className="bg-green-100 text-green-800 animate-pulse">
              <Navigation className="h-3 w-3 mr-1" />
              GPS Active
            </Badge>
          )}
        </div>
      </div>

      {/* Custom Tabs */}
      <CustomTabs
        value={activeTab}
        onValueChange={setActiveTab}
        tabs={tabs}
      />

      {/* Delivery Table for Large Screens */}
      <div className="hidden lg:block">
        <DeliveryTable
          deliveries={currentDeliveries}
          title={activeTab === 'active' ? 'Active Deliveries' : 'Completed Deliveries'}
          showStats={false}
          showSearch={true}
          showFilters={true}
          showPagination={true}
          itemsPerPage={5}
          onViewDetails={handleViewDetails}
          onNavigate={handleNavigate}
          onCallClient={handleCallClient}
          onUploadLoadingPhotos={(delivery) => handlePhotoUpload('loading')}
          onUploadDeliveryPhotos={(delivery) => handlePhotoUpload('delivery')}
          onUploadReceiptPhotos={(delivery) => handlePhotoUpload('receipt')}
          onCaptureSignature={handleSignatureCapture}
          onReportIssue={handleReportIssue}
          onMarkDelivered={handleMarkDelivered}
        />
      </div>

      {/* Mobile Cards View */}
      <div className="lg:hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentDeliveries.map((delivery) => (
            <DeliveryCard
              key={delivery.id}
              delivery={delivery}
              onViewDetails={handleViewDetails}
              onNavigate={() => handleNavigate(delivery)}
              onCallClient={() => handleCallClient(delivery.phone)}
              onMarkDelivered={() => handleMarkDelivered(delivery)}
              onUploadLoadingPhotos={() => handlePhotoUpload('loading')}
              onUploadDeliveryPhotos={() => handlePhotoUpload('delivery')}
              onUploadReceiptPhotos={() => handlePhotoUpload('receipt')}
              onCaptureSignature={handleSignatureCapture}
              onReportIssue={() => handleReportIssue(delivery)}
              showActions={activeTab === 'active'}
            />
          ))}
        </div>
      </div>

      {/* Empty State */}
      {currentDeliveries.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No {activeTab === 'active' ? 'Active' : 'Completed'} Deliveries
            </h3>
            <p className="text-gray-600">
              {activeTab === 'active'
                ? 'You don\'t have any active deliveries at the moment.'
                : 'No completed deliveries to show.'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Delivery Detail Modal */}
      <DeliveryDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedDelivery(null);
        }}
        delivery={selectedDelivery}
        onCallClient={() => selectedDelivery && handleCallClient(selectedDelivery.phone)}
        onNavigate={() => selectedDelivery && handleNavigate(selectedDelivery)}
        onUploadPhoto={() => handlePhotoUpload('delivery')}
        onReportIssue={() => selectedDelivery && handleReportIssue(selectedDelivery)}
      />

      {/* Photo Upload Modal */}
      <PhotoUploadModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        cargoId={selectedDelivery?.id || ''}
        uploadType={photoUploadType}
        onUpload={handlePhotoUploadSubmit}
      />

      {/* Signature Capture Modal */}
      <ModernModel
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        title="Capture Customer Signature"
      >
        <SignatureCapture
          cargoId={selectedDelivery?.id || ''}
          customerName={selectedDelivery?.client || ''}
          onSave={handleSignatureSave}
          onCancel={() => setIsSignatureModalOpen(false)}
        />
      </ModernModel>

      {/* Contact Dropdown */}
      {showContactDropdown && selectedDelivery && (
        <ContactDropdown
          contacts={[
            {
              id: '1',
              name: selectedDelivery.pickupContact || '',
              phone: selectedDelivery.pickupContactPhone || '',
              type: 'pickup',
              company: 'Pickup Location'
            },
            {
              id: '2',
              name: selectedDelivery.deliveryContact || '',
              phone: selectedDelivery.deliveryContactPhone || '',
              type: 'delivery',
              company: 'Delivery Location'
            }
          ]}
          onCall={(contact) => handleCallClient(contact.phone)}
        />
      )}
    </div>
  );
}