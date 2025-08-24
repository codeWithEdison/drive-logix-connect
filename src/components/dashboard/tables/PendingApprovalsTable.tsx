import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, X, Eye, User, Truck } from 'lucide-react';

// Mock data for pending approvals - Rwanda-based (only 3 rows)
const pendingApprovalsData = [
  {
    id: '1',
    type: 'driver',
    name: 'Michael Johnson',
    submitted: '2 hours ago',
    documents: ['License', 'Insurance'],
    status: 'pending'
  },
  {
    id: '2',
    type: 'client',
    name: 'Emily Davis',
    submitted: '4 hours ago',
    documents: ['Business License', 'Tax ID'],
    status: 'pending'
  },
  {
    id: '3',
    type: 'truck',
    name: 'Ford F-650',
    submitted: '1 day ago',
    documents: ['Registration', 'Insurance'],
    status: 'pending'
  }
];

interface PendingApprovalsTableProps {
  className?: string;
  onViewAll?: () => void;
}

export function PendingApprovalsTable({ className, onViewAll }: PendingApprovalsTableProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'driver':
        return <User className="h-4 w-4" />;
      case 'client':
        return <User className="h-4 w-4" />;
      case 'truck':
        return <Truck className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'driver':
        return 'bg-blue-100 text-blue-800';
      case 'client':
        return 'bg-green-100 text-green-800';
      case 'truck':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApprove = (id: string) => {
    console.log(`Approving: ${id}`);
    // API call to approve
    alert(`Approved item ${id}`);
  };

  const handleReject = (id: string) => {
    console.log(`Rejecting: ${id}`);
    // API call to reject
    alert(`Rejected item ${id}`);
  };

  const handleReview = (id: string) => {
    console.log(`Reviewing: ${id}`);
    // Navigate to review page
    window.location.href = `/admin/approvals/${id}`;
  };

  return (
    <Card className={`bg-white/80 backdrop-blur-sm border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pt-6 px-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <CardTitle className="text-lg font-semibold text-gray-900">Pending Approvals</CardTitle>
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
                <TableHead className="font-semibold text-gray-900 text-xs">Name</TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs">Submitted</TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingApprovalsData.map((approval) => (
                <TableRow key={approval.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(approval.type)}
                      <Badge className={`${getTypeColor(approval.type)} text-xs px-2 py-1`}>
                        {approval.type}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-gray-900 text-xs">{approval.name}</TableCell>
                  <TableCell className="text-gray-600 text-xs">{approval.submitted}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReview(approval.id)}
                        className="h-6 w-6 p-0"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleApprove(approval.id)}
                        className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReject(approval.id)}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
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
