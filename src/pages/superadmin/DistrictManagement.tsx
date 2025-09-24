import React, { useState, useEffect } from "react";
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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(
    null
  );
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
    limit: 50,
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDistricts.map((district) => (
                  <TableRow key={district.id}>
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
                      <Badge
                        variant={district.is_active ? "default" : "secondary"}
                      >
                        {district.is_active ? "Active" : "Inactive"}
                      </Badge>
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
                              navigate(`/superadmin/districts/${district.id}`)
                            }
                          >
                            <MapPin className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openEditDialog(district)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(district)}
                          >
                            {district.is_active ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteDistrict(district)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

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
    </div>
  );
}
