import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Package, MapPin, Clock, Star, Eye } from 'lucide-react';

// Mock historical cargo data
const historicalCargos = [
  {
    id: 'CRG-001',
    date: '2024-01-15',
    from: 'Kigali',
    to: 'Butare',
    type: 'Electronics',
    weight: '45kg',
    status: 'delivered',
    driver: 'Jean Baptiste',
    rating: 4.8,
    cost: '$120'
  },
  {
    id: 'CRG-002',
    date: '2024-01-10',
    from: 'Kigali',
    to: 'Musanze',
    type: 'Furniture',
    weight: '120kg',
    status: 'delivered',
    driver: 'Marie Claire',
    rating: 5.0,
    cost: '$250'
  },
  {
    id: 'CRG-003',
    date: '2024-01-05',
    from: 'Kigali',
    to: 'Rubavu',
    type: 'Documents',
    weight: '2kg',
    status: 'cancelled',
    driver: '-',
    rating: 0,
    cost: '$25'
  }
];

export default function History() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-success text-success-foreground';
      case 'cancelled': return 'bg-destructive text-destructive-foreground';
      case 'in_transit': return 'bg-info text-info-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Cargo History</h1>
        <p className="text-muted-foreground">View your past cargo shipments and deliveries</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input placeholder="Search by cargo ID..." />
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                <SelectItem value="last_year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Custom Date
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      <div className="space-y-4">
        {historicalCargos.map((cargo) => (
          <Card key={cargo.id} className="card-elevated">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary" />
                      <span className="font-semibold">{cargo.id}</span>
                    </div>
                    <Badge className={getStatusColor(cargo.status)}>
                      {cargo.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {cargo.date}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="font-medium">{cargo.from}</span> → <span className="font-medium">{cargo.to}</span>
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Type:</span> {cargo.type}
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Weight:</span> {cargo.weight}
                    </div>
                  </div>

                  {cargo.status === 'delivered' && (
                    <div className="flex items-center gap-4 pt-2 border-t">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Driver:</span> {cargo.driver}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{cargo.rating}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Cost:</span> <span className="font-semibold">{cargo.cost}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                  {cargo.status === 'delivered' && (
                    <Button variant="outline" size="sm">
                      Reorder
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}