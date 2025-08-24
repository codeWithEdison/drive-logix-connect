import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, CheckCircle, Info, X, Eye } from 'lucide-react';

// Mock data for system alerts - Rwanda-based (only 3 rows)
const systemAlertsData = [
  {
    id: '1',
    type: 'warning',
    message: 'Truck TRK-045 requires maintenance',
    time: '30 minutes ago',
    priority: 'medium',
    status: 'active'
  },
  {
    id: '2',
    type: 'info',
    message: 'New driver registration pending',
    time: '1 hour ago',
    priority: 'low',
    status: 'active'
  },
  {
    id: '3',
    type: 'urgent',
    message: 'Cargo #3565432 experiencing delays',
    time: '45 minutes ago',
    priority: 'high',
    status: 'active'
  }
];

interface SystemAlertsTableProps {
  className?: string;
  onViewAll?: () => void;
}

export function SystemAlertsTable({ className, onViewAll }: SystemAlertsTableProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-orange-100 text-orange-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleResolve = (id: string) => {
    console.log(`Resolving alert: ${id}`);
    // API call to resolve alert
    alert(`Resolved alert ${id}`);
  };

  const handleDismiss = (id: string) => {
    console.log(`Dismissing alert: ${id}`);
    // API call to dismiss alert
    alert(`Dismissed alert ${id}`);
  };

  const handleView = (id: string) => {
    console.log(`Viewing alert: ${id}`);
    // Navigate to alert details page
    window.location.href = `/admin/alerts/${id}`;
  };

  return (
    <Card className={`bg-white/80 backdrop-blur-sm border-red-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pt-6 px-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <CardTitle className="text-lg font-semibold text-gray-900">System Alerts</CardTitle>
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
                <TableHead className="font-semibold text-gray-900 text-xs">Type</TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs">Message</TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs">Priority</TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs">Time</TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {systemAlertsData.map((alert) => (
                <TableRow key={alert.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getAlertIcon(alert.type)}
                      <span className="capitalize text-xs font-medium">{alert.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-700 text-xs max-w-xs truncate">{alert.message}</TableCell>
                  <TableCell>
                    <Badge className={`${getPriorityColor(alert.priority)} text-xs px-2 py-1`}>
                      {alert.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600 text-xs">{alert.time}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(alert.id)}
                        className="h-6 w-6 p-0"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      {alert.status === 'active' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResolve(alert.id)}
                            className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDismiss(alert.id)}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </>
                      )}
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
