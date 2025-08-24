import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Phone, Truck } from 'lucide-react';

// Mock data for recent deliveries - Rwanda-based (only 3 rows)
const recentDeliveriesData = [
  {
    id: '#3565432',
    client: 'John Smith',
    driver: 'Albert Flores',
    route: 'Kigali → Butare',
    status: 'delivered',
    revenue: 'RWF 280,000',
    eta: '2 hours ago',
    priority: 'urgent'
  },
  {
    id: '#4832920',
    client: 'Sarah Johnson',
    driver: 'Mike Wilson',
    route: 'Kigali → Musanze',
    status: 'in_transit',
    revenue: 'RWF 320,000',
    eta: '4 hours',
    priority: 'standard'
  },
  {
    id: '#1442654',
    client: 'Emma Davis',
    driver: 'Guy Hawkins',
    route: 'Butare → Kigali',
    status: 'delivered',
    revenue: 'RWF 250,000',
    eta: '1 day ago',
    priority: 'express'
  }
];

interface RecentDeliveriesTableProps {
  className?: string;
  onViewAll?: () => void;
}

export function RecentDeliveriesTable({ className, onViewAll }: RecentDeliveriesTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'express':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleTrack = (id: string) => {
    console.log(`Tracking delivery: ${id}`);
    // Navigate to tracking page
    window.location.href = `/admin/tracking/${id}`;
  };

  const handleViewDetails = (id: string) => {
    console.log(`Viewing details for: ${id}`);
    // Navigate to details page
    window.location.href = `/admin/cargos/${id}`;
  };

  const handleContactDriver = (driver: string) => {
    console.log(`Contacting driver: ${driver}`);
    // Open contact modal or navigate to driver page
    window.location.href = `/admin/drivers/${driver}`;
  };

  return (
    <Card className={`bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pt-6 px-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
          <CardTitle className="text-lg font-semibold text-gray-900">Recent Deliveries</CardTitle>
        </div>
        <Button variant="outline" size="sm" onClick={onViewAll}>
          View All
        </Button>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-900 text-xs">ID</TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs">Route</TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs">Status</TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs">Revenue</TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentDeliveriesData.map((delivery) => (
                <TableRow key={delivery.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="font-medium text-gray-900 text-xs">{delivery.id}</TableCell>
                  <TableCell className="text-gray-700 text-xs">{delivery.route}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge className={`${getStatusColor(delivery.status)} text-xs px-2 py-1`}>
                        {delivery.status.replace('_', ' ')}
                      </Badge>
                      {delivery.priority !== 'standard' && (
                        <Badge className={`${getPriorityColor(delivery.priority)} text-xs px-2 py-1`}>
                          {delivery.priority}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-green-600 text-xs">{delivery.revenue}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTrack(delivery.id)}
                        className="h-6 w-6 p-0"
                      >
                        <Truck className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(delivery.id)}
                        className="h-6 w-6 p-0"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleContactDriver(delivery.driver)}
                        className="h-6 w-6 p-0"
                      >
                        <Phone className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
