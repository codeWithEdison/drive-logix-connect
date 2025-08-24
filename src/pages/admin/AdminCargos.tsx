import React, { useState } from 'react';
import { TruckAssignmentModal } from '@/components/admin/TruckAssignmentModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Eye, Edit, Trash2, Truck, MapPin, Package, Clock, CheckCircle } from 'lucide-react';

const allCargos = [
  {
    id: 'CRG-001',
    client: 'John Doe',
    from: 'Kigali',
    to: 'Butare',
    type: 'Electronics',
    weight: '45kg',
    status: 'in_transit',
    driver: 'Jean Baptiste',
    created: '2024-01-15',
    priority: 'normal'
  },
  {
    id: 'CRG-002',
    client: 'Sarah Johnson',
    from: 'Kigali',
    to: 'Musanze',
    type: 'Furniture',
    weight: '120kg',
    status: 'pending',
    driver: 'Unassigned',
    created: '2024-01-16',
    priority: 'urgent'
  },
  {
    id: 'CRG-003',
    client: 'Marie Claire',
    from: 'Kigali',
    to: 'Rubavu',
    type: 'Documents',
    weight: '2kg',
    status: 'delivered',
    driver: 'Alice Uwimana',
    created: '2024-01-14',
    priority: 'normal'
  }
];

export default function AdminCargos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCargo, setSelectedCargo] = useState<any>(null);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);

  const handleAssignTruck = (cargoId: string, truckId: string, driverId: string) => {
    console.log(`Assigning truck ${truckId} and driver ${driverId} to cargo ${cargoId}`);
    // TODO: Implement truck assignment logic
  };

  const handleViewAssignment = (cargo: any) => {
    setSelectedCargo(cargo);
    setIsAssignmentModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning text-warning-foreground';
      case 'in_transit': return 'bg-info text-info-foreground';
      case 'delivered': return 'bg-success text-success-foreground';
      case 'cancelled': return 'bg-destructive text-destructive-foreground';
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

  const filteredCargos = allCargos.filter(cargo => {
    const matchesSearch = cargo.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cargo.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || cargo.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cargo Management</h1>
          <p className="text-muted-foreground">Monitor and manage all cargo shipments</p>
        </div>
        <Button onClick={() => handleViewAssignment(allCargos[0])}>
          <Truck className="h-4 w-4 mr-2" />
          Assign Truck
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Cargos</p>
                <p className="text-2xl font-bold">127</p>
              </div>
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Package className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Transit</p>
                <p className="text-2xl font-bold">23</p>
              </div>
              <div className="h-8 w-8 bg-info/10 rounded-lg flex items-center justify-center">
                <Truck className="h-4 w-4 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <div className="h-8 w-8 bg-warning/10 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Delivered Today</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <div className="h-8 w-8 bg-success/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Cargos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by cargo ID or client name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cargo Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Cargos</CardTitle>
          <CardDescription>Complete list of cargo shipments</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cargo ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCargos.map((cargo) => (
                <TableRow key={cargo.id}>
                  <TableCell className="font-medium">{cargo.id}</TableCell>
                  <TableCell>{cargo.client}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span>{cargo.from}</span>
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span>{cargo.to}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{cargo.type}</div>
                      <div className="text-sm text-muted-foreground">{cargo.weight}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(cargo.status)}>
                      {cargo.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{cargo.driver}</TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(cargo.priority)}>
                      {cargo.priority.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {cargo.driver === 'Unassigned' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewAssignment(cargo)}
                        >
                          <Truck className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Truck Assignment Modal */}
      <TruckAssignmentModal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        cargo={selectedCargo}
        onAssign={handleAssignTruck}
      />
    </div>
  );
}