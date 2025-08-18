import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Clock, Phone, Package, Navigation, CheckCircle } from 'lucide-react';

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
    completedAt: '11:30 AM',
    rating: 5.0,
    earnings: '$45'
  }
];

export default function DriverDeliveries() {
  const [selectedTab, setSelectedTab] = useState('active');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_transit': return 'bg-info text-info-foreground';
      case 'pickup_scheduled': return 'bg-warning text-warning-foreground';
      case 'delivered': return 'bg-success text-success-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-warning text-warning-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Deliveries</h1>
        <p className="text-muted-foreground">Manage your active and completed deliveries</p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active Deliveries</TabsTrigger>
          <TabsTrigger value="completed">Completed Today</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeDeliveries.map((delivery) => (
            <Card key={delivery.id} className="card-elevated">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-lg">{delivery.id}</span>
                        <Badge className={getStatusColor(delivery.status)}>
                          {delivery.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge className={getPriorityColor(delivery.priority)}>
                          {delivery.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <h3 className="font-medium text-foreground">{delivery.cargo}</h3>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {delivery.estimatedTime}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="text-sm">
                          <span className="font-medium">{delivery.from}</span> → <span className="font-medium">{delivery.to}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{delivery.distance}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm"><span className="text-muted-foreground">Client:</span> {delivery.client}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{delivery.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    {delivery.status === 'in_transit' && (
                      <>
                        <Button size="sm" className="flex-1">
                          <Navigation className="h-4 w-4 mr-2" />
                          Navigate
                        </Button>
                        <Button size="sm" variant="outline">
                          <Phone className="h-4 w-4 mr-2" />
                          Call Client
                        </Button>
                        <Button size="sm" variant="outline">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Delivered
                        </Button>
                      </>
                    )}
                    {delivery.status === 'pickup_scheduled' && (
                      <>
                        <Button size="sm" className="flex-1">
                          <Navigation className="h-4 w-4 mr-2" />
                          Start Pickup
                        </Button>
                        <Button size="sm" variant="outline">
                          <Phone className="h-4 w-4 mr-2" />
                          Call Client
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedDeliveries.map((delivery) => (
            <Card key={delivery.id} className="card-elevated">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{delivery.id}</span>
                      <Badge className="bg-success text-success-foreground">DELIVERED</Badge>
                    </div>
                    <h3 className="font-medium">{delivery.cargo}</h3>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <span>{delivery.from}</span> → <span>{delivery.to}</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-sm text-muted-foreground">Completed at {delivery.completedAt}</div>
                    <div className="font-semibold text-success">{delivery.earnings}</div>
                    <div className="text-sm">⭐ {delivery.rating}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}