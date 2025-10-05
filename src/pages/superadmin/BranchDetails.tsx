import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useBranch,
  useBranches,
  useAdminDrivers,
  useVehicles,
  useUsers,
} from "@/lib/api/hooks";
import {
  Branch,
  Driver,
  Vehicle,
  User,
  UserRole,
  VehicleStatus,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  MoreHorizontal,
  Users,
  Truck,
  UserCheck,
  Building2,
  ArrowRightLeft,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function BranchDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isReassignDialogOpen, setIsReassignDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    type: "driver" | "admin" | "vehicle";
    id: string;
    name: string;
    currentBranchId: string;
  } | null>(null);
  const [newBranchId, setNewBranchId] = useState("");

  const { data: branch, isLoading: branchLoading } = useBranch(id || "");
  const { data: driversData } = useAdminDrivers({ branch_id: id, limit: 100 });
  const { data: vehiclesData } = useVehicles({
    branch_id: id,
    status: VehicleStatus.ACTIVE,
    limit: 100,
  });
  const { data: usersData } = useUsers({
    role: UserRole.ADMIN,
    branch_id: id,
    limit: 100,
  });
  const { data: branchesData } = useBranches({ limit: 100 });

  // Normalize drivers: support responses that are either an array or { data: [] }
  const rawDrivers: any[] = Array.isArray((driversData as any)?.data)
    ? (driversData as any).data
    : Array.isArray(driversData)
    ? (driversData as any)
    : [];
  const drivers = rawDrivers.map((d: any) => {
    const hasNested = !!d.user && !!d.driver;
    const user = hasNested ? d.user : d;
    const driver = hasNested ? d.driver : d.driver || {};
    return {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      license_type: driver.license_type || "-",
      license_number: driver.license_number || "-",
      status: driver.status || (user.is_active ? "available" : "unavailable"),
      avatar_url: user.avatar_url,
    };
  });
  const vehicles = Array.isArray(vehiclesData?.data?.vehicles)
    ? vehiclesData.data.vehicles
    : [];
  // Normalize admins from either top-level array or { data: [] }
  const admins: any[] = Array.isArray((usersData as any)?.data)
    ? (usersData as any).data
    : Array.isArray(usersData)
    ? (usersData as any)
    : [];

  // Debug logging
  console.log("🔍 BranchDetails Debug:");
  console.log("Branch ID:", id);
  console.log("Drivers data:", driversData);
  console.log("Vehicles data:", vehiclesData);
  console.log("Admins data:", usersData);

  const handleReassign = async () => {
    if (!selectedItem || !newBranchId) return;

    try {
      // Note: Branch reassignment functionality needs proper API endpoints
      // For now, we'll show a placeholder implementation
      toast({
        title: "Info",
        description: `Branch reassignment for ${selectedItem.type} is not yet implemented`,
      });
      setIsReassignDialogOpen(false);
      setSelectedItem(null);
      setNewBranchId("");
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to reassign ${selectedItem.type}`,
        variant: "destructive",
      });
    }
  };

  const openReassignDialog = (
    type: "driver" | "admin" | "vehicle",
    id: string,
    name: string,
    currentBranchId: string
  ) => {
    setSelectedItem({ type, id, name, currentBranchId });
    setIsReassignDialogOpen(true);
  };

  if (branchLoading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  if (!branch) {
    return <div className="container mx-auto p-6">Branch not found</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/superadmin/branches")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Branches
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="w-8 h-8" />
            {branch.name}
          </h1>
          <p className="text-muted-foreground">
            {branch.address}, {branch.city}, {branch.country}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drivers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Vehicles
            </CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{admins.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Badge variant={branch.is_active ? "default" : "secondary"}>
              {branch.is_active ? "Active" : "Inactive"}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Manager: {branch.manager_name}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="drivers" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="drivers">Drivers ({drivers.length})</TabsTrigger>
          <TabsTrigger value="vehicles">
            Vehicles ({vehicles.length})
          </TabsTrigger>
          <TabsTrigger value="admins">Admins ({admins.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="drivers">
          <Card>
            <CardHeader>
              <CardTitle>Drivers</CardTitle>
              <CardDescription>
                Manage drivers assigned to this branch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Avatar</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>License</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drivers.map((driver, idx) => (
                    <TableRow key={driver.id}>
                      <TableCell className="text-sm text-gray-600">
                        {idx + 1}
                      </TableCell>
                      <TableCell>
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                          {driver.avatar_url ? (
                            <img
                              src={driver.avatar_url}
                              alt={driver.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            driver.full_name?.charAt(0) || "?"
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {driver.full_name}
                      </TableCell>
                      <TableCell>{driver.email}</TableCell>
                      <TableCell>{driver.phone}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {driver.license_type} - {driver.license_number}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            driver.status === "available"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {driver.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicles">
          <Card>
            <CardHeader>
              <CardTitle>Vehicles</CardTitle>
              <CardDescription>
                Manage vehicles assigned to this branch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plate Number</TableHead>
                    <TableHead>Make & Model</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">
                        {vehicle.plate_number}
                      </TableCell>
                      <TableCell>
                        {vehicle.make} {vehicle.model}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{vehicle.type}</Badge>
                      </TableCell>
                      <TableCell>
                        {vehicle.capacity_kg}kg / {vehicle.capacity_volume}m³
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            vehicle.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {vehicle.status}
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
                                openReassignDialog(
                                  "vehicle",
                                  vehicle.id,
                                  vehicle.plate_number,
                                  vehicle.branch_id || ""
                                )
                              }
                            >
                              <ArrowRightLeft className="mr-2 h-4 w-4" />
                              Reassign Branch
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admins">
          <Card>
            <CardHeader>
              <CardTitle>Admins</CardTitle>
              <CardDescription>
                Manage admins assigned to this branch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Avatar</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin, idx) => (
                    <TableRow key={admin.id}>
                      <TableCell className="text-sm text-gray-600">
                        {idx + 1}
                      </TableCell>
                      <TableCell>
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                          {admin.avatar_url ? (
                            <img
                              src={admin.avatar_url}
                              alt={admin.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            admin.full_name?.charAt(0) || "?"
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {admin.full_name}
                      </TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>{admin.phone}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{admin.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={admin.is_active ? "default" : "secondary"}
                        >
                          {admin.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reassign Dialog */}
      <Dialog
        open={isReassignDialogOpen}
        onOpenChange={setIsReassignDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign {selectedItem?.type}</DialogTitle>
            <DialogDescription>
              Move {selectedItem?.name} to a different branch
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-branch">Select New Branch</Label>
              <Select value={newBranchId} onValueChange={setNewBranchId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a branch" />
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
              onClick={() => setIsReassignDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleReassign} disabled={!newBranchId}>
              Reassign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
