import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useBranches,
  useCreateBranch,
  useUpdateBranch,
  useDeleteBranch,
  useToggleBranchStatus,
} from "@/lib/api/hooks";
import {
  Branch,
  CreateBranchRequest,
  UpdateBranchRequest,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Eye,
  Building2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function BranchManagementPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState<CreateBranchRequest>({
    name: "",
    code: "",
    address: "",
    city: "",
    country: "",
    postal_code: "",
    phone: "",
    email: "",
    manager_name: "",
    is_active: true,
  });

  const {
    data: branchesData,
    isLoading,
    refetch,
  } = useBranches({
    ...(searchQuery.trim() && { search: searchQuery.trim() }),
    limit: 50,
  });

  // Pagination state (client-side)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const createBranchMutation = useCreateBranch();
  const updateBranchMutation = useUpdateBranch();
  const deleteBranchMutation = useDeleteBranch();
  const toggleStatusMutation = useToggleBranchStatus();

  const handleCreateBranch = async () => {
    try {
      await createBranchMutation.mutateAsync(formData);
      toast({
        title: "Success",
        description: "Branch created successfully",
      });
      setIsCreateDialogOpen(false);
      resetForm();
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create branch",
        variant: "destructive",
      });
    }
  };

  const handleUpdateBranch = async () => {
    if (!selectedBranch) return;

    try {
      await updateBranchMutation.mutateAsync({
        id: selectedBranch.id,
        data: formData as UpdateBranchRequest,
      });
      toast({
        title: "Success",
        description: "Branch updated successfully",
      });
      setIsEditDialogOpen(false);
      resetForm();
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update branch",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBranch = async (branch: Branch) => {
    if (window.confirm(`Are you sure you want to delete ${branch.name}?`)) {
      try {
        await deleteBranchMutation.mutateAsync(branch.id);
        toast({
          title: "Success",
          description: "Branch deleted successfully",
        });
        refetch();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete branch",
          variant: "destructive",
        });
      }
    }
  };

  const handleToggleStatus = async (branch: Branch) => {
    try {
      await toggleStatusMutation.mutateAsync({
        id: branch.id,
        isActive: !branch.is_active,
      });
      toast({
        title: "Success",
        description: `Branch ${branch.is_active ? "deactivated" : "activated"}`,
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update branch status",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      address: "",
      city: "",
      country: "",
      postal_code: "",
      phone: "",
      email: "",
      manager_name: "",
      is_active: true,
    });
    setSelectedBranch(null);
  };

  const openEditDialog = (branch: Branch) => {
    setSelectedBranch(branch);
    setFormData({
      name: branch.name,
      code: branch.code,
      address: branch.address,
      city: branch.city,
      country: branch.country,
      postal_code: branch.postal_code,
      phone: branch.phone,
      email: branch.email,
      manager_name: branch.manager_name,
      is_active: branch.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const filteredBranches = branchesData?.branches || [];

  // Client-side pagination helpers
  const totalBranches = filteredBranches.length;
  const totalPages = Math.max(1, Math.ceil(totalBranches / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBranches = filteredBranches.slice(startIndex, endIndex);

  // Reset to page 1 when data/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, totalBranches]);

  // Debug logging
  console.log("🔍 BranchManagement Debug:");
  console.log("branchesData:", branchesData);
  console.log("filteredBranches:", filteredBranches);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Branch Management</h1>
          <p className="text-muted-foreground">
            Manage branches and their resources
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add Branch
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Branches</CardTitle>
          <CardDescription>
            View and manage all branches in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search branches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
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
                    <TableHead>Address</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Postal</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Districts</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Drivers</TableHead>
                    <TableHead>Vehicles</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedBranches.map((branch, idx) => (
                    <TableRow
                      key={branch.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() =>
                        navigate(`/superadmin/branches/${branch.id}`)
                      }
                    >
                      <TableCell className="text-sm text-gray-600">
                        {startIndex + idx + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {branch.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{branch.code}</Badge>
                      </TableCell>
                      <TableCell>{branch.address}</TableCell>
                      <TableCell>{branch.city}</TableCell>
                      <TableCell>{branch.country}</TableCell>
                      <TableCell>{branch.postal_code}</TableCell>
                      <TableCell>{branch.phone}</TableCell>
                      <TableCell>{branch.email}</TableCell>
                      <TableCell>{branch.manager_name}</TableCell>
                      <TableCell>
                        {(branch as any)?.districts_count ?? 0}
                      </TableCell>
                      <TableCell>{(branch as any)?.users_count ?? 0}</TableCell>
                      <TableCell>
                        {(branch as any)?.drivers_count ?? 0}
                      </TableCell>
                      <TableCell>
                        {(branch as any)?.vehicles_count ?? 0}
                      </TableCell>
                      <TableCell>
                        {branch.created_at
                          ? new Date(branch.created_at).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {branch.updated_at
                          ? new Date(branch.updated_at).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <label
                          className="flex items-center cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={!!branch.is_active}
                            onChange={() => handleToggleStatus(branch)}
                            disabled={toggleStatusMutation.isPending}
                          />
                          <div
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              branch.is_active ? "bg-green-500" : "bg-gray-300"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                branch.is_active
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              }`}
                            />
                          </div>
                          <span className="ml-2 text-sm text-gray-700">
                            {branch.is_active ? "Active" : "Inactive"}
                          </span>
                        </label>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(`/superadmin/branches/${branch.id}`)
                              }
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openEditDialog(branch)}
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
        <div className="text-sm text-gray-600">
          Showing {totalBranches === 0 ? 0 : startIndex + 1} to{" "}
          {Math.min(endIndex, totalBranches)} of {totalBranches} branches
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
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Create Branch Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Branch</DialogTitle>
            <DialogDescription>
              Add a new branch to the system
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Branch Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter branch name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Branch Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="Enter branch code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Enter address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                placeholder="Enter city"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                placeholder="Enter country"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input
                id="postal_code"
                value={formData.postal_code}
                onChange={(e) =>
                  setFormData({ ...formData, postal_code: e.target.value })
                }
                placeholder="Enter postal code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter email"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="manager_name">Manager Name</Label>
              <Input
                id="manager_name"
                value={formData.manager_name}
                onChange={(e) =>
                  setFormData({ ...formData, manager_name: e.target.value })
                }
                placeholder="Enter manager name"
              />
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
              onClick={handleCreateBranch}
              disabled={createBranchMutation.isPending}
            >
              {createBranchMutation.isPending ? "Creating..." : "Create Branch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Branch Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Branch</DialogTitle>
            <DialogDescription>Update branch information</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Branch Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter branch name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-code">Branch Code</Label>
              <Input
                id="edit-code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="Enter branch code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Enter address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-city">City</Label>
              <Input
                id="edit-city"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                placeholder="Enter city"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-country">Country</Label>
              <Input
                id="edit-country"
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                placeholder="Enter country"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-postal_code">Postal Code</Label>
              <Input
                id="edit-postal_code"
                value={formData.postal_code}
                onChange={(e) =>
                  setFormData({ ...formData, postal_code: e.target.value })
                }
                placeholder="Enter postal code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter email"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-manager_name">Manager Name</Label>
              <Input
                id="edit-manager_name"
                value={formData.manager_name}
                onChange={(e) =>
                  setFormData({ ...formData, manager_name: e.target.value })
                }
                placeholder="Enter manager name"
              />
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
              onClick={handleUpdateBranch}
              disabled={updateBranchMutation.isPending}
            >
              {updateBranchMutation.isPending ? "Updating..." : "Update Branch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
