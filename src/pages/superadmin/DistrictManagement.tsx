import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  useDistricts,
  useDistrictsWithBranches,
  useCreateDistrict,
  useUpdateDistrict,
  useDeleteDistrict,
  useToggleDistrictStatus,
  useBranches,
} from "@/lib/api/hooks";
import {
  District,
  CreateDistrictRequest,
  UpdateDistrictRequest,
} from "@/types/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  MapPin,
  Building2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function DistrictManagementPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(
    null
  );
  const [viewDistrict, setViewDistrict] = useState<District | null>(null);
  const [formData, setFormData] = useState<CreateDistrictRequest>({
    name: "",
    code: "",
    branch_id: "",
    is_active: true,
  });

  const {
    data: districtsData,
    isLoading,
    refetch,
  } = useDistricts({
    ...(searchQuery.trim() && { search: searchQuery.trim() }),
    branch_id:
      selectedBranchId === "all" ? undefined : selectedBranchId || undefined,
    page: currentPage,
    limit: pageSize,
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: districtsWithBranches } = useDistrictsWithBranches();
  const { data: branchesData } = useBranches({ limit: 100 });

  const createDistrictMutation = useCreateDistrict();
  const updateDistrictMutation = useUpdateDistrict();
  const deleteDistrictMutation = useDeleteDistrict();
  const toggleStatusMutation = useToggleDistrictStatus();

  // Extract pagination info from API response
  const pagination = useMemo(() => {
    if (districtsData) {
      return {
        page: districtsData.page || currentPage,
        limit: districtsData.limit || pageSize,
        total: districtsData.total || 0,
        totalPages: districtsData.totalPages || 0,
      };
    }
    return {
      page: currentPage,
      limit: pageSize,
      total: 0,
      totalPages: 0,
    };
  }, [districtsData, currentPage, pageSize]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedBranchId]);

  const handleCreateDistrict = async () => {
    try {
      await createDistrictMutation.mutateAsync(formData);
      toast({
        title: "Success",
        description: "District created successfully",
      });
      setIsCreateDialogOpen(false);
      resetForm();
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create district",
        variant: "destructive",
      });
    }
  };

  const handleUpdateDistrict = async () => {
    if (!selectedDistrict) return;

    try {
      await updateDistrictMutation.mutateAsync({
        id: selectedDistrict.id,
        data: formData as UpdateDistrictRequest,
      });
      toast({
        title: "Success",
        description: "District updated successfully",
      });
      setIsEditDialogOpen(false);
      resetForm();
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update district",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDistrict = async (district: District) => {
    if (window.confirm(`Are you sure you want to delete ${district.name}?`)) {
      try {
        await deleteDistrictMutation.mutateAsync(district.id);
        toast({
          title: "Success",
          description: "District deleted successfully",
        });
        refetch();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete district",
          variant: "destructive",
        });
      }
    }
  };

  const handleToggleStatus = async (district: District) => {
    try {
      await toggleStatusMutation.mutateAsync({
        id: district.id,
        isActive: !district.is_active,
      });
      toast({
        title: "Success",
        description: `District ${
          district.is_active ? "deactivated" : "activated"
        }`,
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update district status",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      branch_id: "",
      is_active: true,
    });
    setSelectedDistrict(null);
  };

  const openEditDialog = (district: District) => {
    setSelectedDistrict(district);
    setFormData({
      name: district.name,
      code: district.code,
      branch_id: district.branch_id,
      is_active: district.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const filteredDistricts = districtsData?.districts || [];

  // Debug logging
  console.log("🔍 DistrictManagement Debug:");
  console.log("districtsData:", districtsData);
  console.log("filteredDistricts:", filteredDistricts);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">District Management</h1>
          <p className="text-muted-foreground">
            Manage districts and their assignments to branches
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add District
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Districts</CardTitle>
          <CardDescription>
            View and manage all districts in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Input
              placeholder="Search districts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select
              value={selectedBranchId}
              onValueChange={setSelectedBranchId}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branchesData?.branches?.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name} ({branch.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDistricts.map((district, idx) => (
                    <TableRow
                      key={district.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        setViewDistrict(district);
                        setIsViewDialogOpen(true);
                      }}
                    >
                      <TableCell className="text-sm text-gray-600">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {district.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{district.code}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <span>{district.branch.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {district.branch.code}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <label
                          className="flex items-center cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={!!district.is_active}
                            onChange={() => handleToggleStatus(district)}
                            disabled={toggleStatusMutation.isPending}
                          />
                          <div
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              district.is_active
                                ? "bg-green-500"
                                : "bg-gray-300"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                district.is_active
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              }`}
                            />
                          </div>
                          <span className="ml-2 text-sm text-gray-700">
                            {district.is_active ? "Active" : "Inactive"}
                          </span>
                        </label>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => openEditDialog(district)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Show per page:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-gray-600">
          Showing {(currentPage - 1) * pageSize + 1} to{" "}
          {Math.min(currentPage * pageSize, pagination.total || 0)} of{" "}
          {pagination.total || 0} districts
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {pagination.totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((p) => Math.min(pagination.totalPages || 1, p + 1))
            }
            disabled={currentPage === (pagination.totalPages || 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Create District Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New District</DialogTitle>
            <DialogDescription>
              Add a new district to the system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">District Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter district name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">District Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="Enter district code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Select
                value={formData.branch_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, branch_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a branch" />
                </SelectTrigger>
                <SelectContent>
                  {branchesData?.branches?.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name} ({branch.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateDistrict}
              disabled={createDistrictMutation.isPending}
            >
              {createDistrictMutation.isPending
                ? "Creating..."
                : "Create District"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit District Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit District</DialogTitle>
            <DialogDescription>Update district information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">District Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter district name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-code">District Code</Label>
              <Input
                id="edit-code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="Enter district code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-branch">Branch</Label>
              <Select
                value={formData.branch_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, branch_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a branch" />
                </SelectTrigger>
                <SelectContent>
                  {branchesData?.branches?.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name} ({branch.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateDistrict}
              disabled={updateDistrictMutation.isPending}
            >
              {updateDistrictMutation.isPending
                ? "Updating..."
                : "Update District"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View District Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>District Details</DialogTitle>
            <DialogDescription>
              Overview of the selected district
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <p className="mt-1 text-sm font-medium">
                  {viewDistrict?.name || "-"}
                </p>
              </div>
              <div>
                <Label>Code</Label>
                <p className="mt-1 text-sm">
                  <Badge variant="outline">{viewDistrict?.code || "-"}</Badge>
                </p>
              </div>
              <div className="col-span-2">
                <Label>Branch</Label>
                <div className="mt-1 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {(viewDistrict as any)?.branch?.name || "-"}
                  </span>
                  {(viewDistrict as any)?.branch?.code && (
                    <Badge variant="secondary" className="text-xs">
                      {(viewDistrict as any).branch.code}
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <p className="mt-1 text-sm">
                  <Badge
                    variant={viewDistrict?.is_active ? "default" : "secondary"}
                  >
                    {viewDistrict?.is_active ? "Active" : "Inactive"}
                  </Badge>
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
