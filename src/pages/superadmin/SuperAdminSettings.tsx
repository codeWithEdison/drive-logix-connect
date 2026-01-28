import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Modal, { ModalSize } from "@/components/modal/Modal";
import { DollarSign, Edit, Plus, Save, MapPin, Loader2 } from "lucide-react";
import axiosInstance from "@/lib/api/axios";
import {
  useServiceAreas,
  useCreateServiceArea,
  useUpdateServiceArea,
  useToggleServiceArea,
} from "@/lib/api/hooks";
import { OperationalService } from "@/lib/api/services";
import type {
  CreateServiceAreaRequest,
  UpdateServiceAreaRequest,
  ServiceArea,
  ServiceAreaQueryParams,
} from "@/lib/api/services/serviceAreaService";
import { useToast } from "@/hooks/use-toast";

export default function SuperAdminSettings() {
  const { toast } = useToast();
  // Pricing policies state and CRUD
  interface CreatePricingPolicyRequest {
    name: string;
    rate_per_kg: number;
    discount_percent?: number | null;
    is_active?: boolean;
  }

  type UpdatePricingPolicyRequest = Partial<CreatePricingPolicyRequest>;

  const [pricingPolicies, setPricingPolicies] = useState<any[]>([]);
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<any>(null);
  const [isSavingPolicy, setIsSavingPolicy] = useState(false);
  const [policyForm, setPolicyForm] = useState<CreatePricingPolicyRequest>({
    name: "",
    rate_per_kg: 0,
    discount_percent: 0,
    is_active: true,
  });

  const validatePricingPolicy = (data: CreatePricingPolicyRequest) => {
    const errors: string[] = [];

    const trimmedName = (data.name || "").trim();
    if (!trimmedName) {
      errors.push("Name is required.");
    } else if (trimmedName.length > 100) {
      errors.push("Name must be at most 100 characters.");
    }

    if (data.rate_per_kg === null || data.rate_per_kg === undefined) {
      errors.push("Rate per kg is required.");
    } else if (
      typeof data.rate_per_kg !== "number" ||
      isNaN(data.rate_per_kg) ||
      data.rate_per_kg < 0
    ) {
      errors.push("Rate per kg must be a number greater than or equal to 0.");
    }

    if (data.discount_percent !== null && data.discount_percent !== undefined) {
      if (
        typeof data.discount_percent !== "number" ||
        isNaN(data.discount_percent) ||
        !Number.isInteger(data.discount_percent) ||
        data.discount_percent < 0 ||
        data.discount_percent > 100
      ) {
        errors.push("Discount percent must be an integer between 0 and 100.");
      }
    }

    return errors;
  };

  const fetchPricingPolicies = async () => {
    try {
      setIsLoadingPolicies(true);
      // Use standardized endpoint: GET /operational/pricing-policies
      // Returns ApiResponse<PricingPolicy[]>
      const res = await OperationalService.getPricingPolicies();
      const items = Array.isArray(res?.data) ? res.data : [];
      setPricingPolicies(items);
    } catch (e) {
      console.error("Failed to load pricing policies", e);
    } finally {
      setIsLoadingPolicies(false);
    }
  };

  const openCreatePolicy = () => {
    setEditingPolicy(null);
    setPolicyForm({
      name: "",
      rate_per_kg: 0,
      discount_percent: 0,
      is_active: true,
    });
    setShowPricingModal(true);
  };

  const openEditPolicy = (policy: any) => {
    setEditingPolicy(policy);
    setPolicyForm({
      name: policy.name || "",
      rate_per_kg: Number(policy.rate_per_kg) || 0,
      discount_percent: policy.discount_percent ?? null,
      is_active: !!policy.is_active,
    });
    setShowPricingModal(true);
  };

  const savePolicy = async () => {
    const validationErrors = validatePricingPolicy(policyForm);
    if (validationErrors.length > 0) {
      toast({
        title: "Validation error",
        description: validationErrors.join(" "),
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSavingPolicy(true);
      const payload: any = { ...policyForm } as CreatePricingPolicyRequest;
      if (!payload.discount_percent && payload.discount_percent !== 0)
        payload.discount_percent = null;

      if (editingPolicy) {
        await axiosInstance.put(
          `/operational/pricing-policies/${editingPolicy.id}`,
          payload as UpdatePricingPolicyRequest
        );
      } else {
        await axiosInstance.post(
          "/operational/pricing-policies",
          payload as CreatePricingPolicyRequest
        );
      }
      setShowPricingModal(false);
      await fetchPricingPolicies();
      toast({
        title: "Pricing policy saved",
        description: "Your changes have been saved.",
      });
    } catch (e: any) {
      console.error("Failed to save pricing policy", e);
      const description = Array.isArray(e?.error?.details)
        ? e.error.details.map((d: any) => `${d.field}: ${d.message}`).join("; ")
        : e?.error?.message || "Failed to save pricing policy";
      toast({
        title: "Pricing policy error",
        description,
        variant: "destructive",
      });
    } finally {
      setIsSavingPolicy(false);
    }
  };

  React.useEffect(() => {
    fetchPricingPolicies();
  }, []);

  // Service Areas state & hooks
  const [serviceAreaModalOpen, setServiceAreaModalOpen] = useState(false);
  const [editingServiceArea, setEditingServiceArea] =
    useState<ServiceArea | null>(null);
  const [serviceAreaForm, setServiceAreaForm] =
    useState<CreateServiceAreaRequest>({
      name: "",
      city: "",
      country: "",
      coverage_radius_km: undefined,
      is_active: true,
    });
  const [filters, setFilters] = useState<ServiceAreaQueryParams>({});

  const { data: serviceAreas = [], isLoading: isLoadingServiceAreas } =
    useServiceAreas(filters);
  const createServiceArea = useCreateServiceArea();
  const updateServiceArea = useUpdateServiceArea();
  const toggleServiceArea = useToggleServiceArea();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const openCreateServiceArea = () => {
    setEditingServiceArea(null);
    setServiceAreaForm({
      name: "",
      city: "",
      country: "",
      coverage_radius_km: undefined,
      is_active: true,
    });
    setServiceAreaModalOpen(true);
  };

  const openEditServiceArea = (area: ServiceArea) => {
    setEditingServiceArea(area);
    setServiceAreaForm({
      name: area.name || "",
      city: area.city || "",
      country: area.country || "",
      coverage_radius_km: area.coverage_radius_km ?? undefined,
      is_active: !!area.is_active,
    });
    setServiceAreaModalOpen(true);
  };

  const saveServiceArea = async () => {
    const payload: CreateServiceAreaRequest | UpdateServiceAreaRequest = {
      ...serviceAreaForm,
      city: serviceAreaForm.city === "" ? undefined : serviceAreaForm.city,
      country:
        serviceAreaForm.country === "" ? undefined : serviceAreaForm.country,
      coverage_radius_km:
        serviceAreaForm.coverage_radius_km === undefined ||
        serviceAreaForm.coverage_radius_km === null
          ? undefined
          : Number(serviceAreaForm.coverage_radius_km),
    };

    try {
      if (editingServiceArea) {
        await updateServiceArea.mutateAsync({
          id: editingServiceArea.id,
          data: payload as UpdateServiceAreaRequest,
        });
      } else {
        await createServiceArea.mutateAsync(
          payload as CreateServiceAreaRequest
        );
      }
      setServiceAreaModalOpen(false);
      toast({
        title: editingServiceArea
          ? "Service area updated"
          : "Service area created",
        description: "Your changes have been saved.",
      });
    } catch (e: any) {
      console.error("Failed to save service area", e);
      const description = Array.isArray(e?.error?.details)
        ? e.error.details.map((d: any) => `${d.field}: ${d.message}`).join("; ")
        : e?.error?.message || "Failed to save service area";
      toast({ title: "Service area error", description });
    }
  };

  const toggleArea = async (id: string) => {
    try {
      setTogglingId(id);
      await toggleServiceArea.mutateAsync(id);
      toast({
        title: "Service area status updated",
        description: "Status toggled successfully.",
      });
    } catch (e: any) {
      console.error("Failed to toggle service area", e);
      const description = Array.isArray(e?.error?.details)
        ? e.error.details.map((d: any) => `${d.field}: ${d.message}`).join("; ")
        : e?.error?.message || "Failed to toggle service area";
      toast({ title: "Toggle error", description });
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            System Configuration
          </h1>
          <p className="text-muted-foreground">
            Manage pricing and service areas
          </p>
        </div>
      </div>

      <Tabs defaultValue="pricing" className="flex flex-col gap-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="service-areas">Service Areas</TabsTrigger>
        </TabsList>

        {/* Global Pricing Tab - pricing policies CRUD */}
        <TabsContent value="pricing" className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pricing Policies
                </CardTitle>
                <Button onClick={openCreatePolicy}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Policy
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="min-w-[900px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Rate/kg</TableHead>
                      <TableHead>Discount %</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingPolicies ? (
                      <TableRow>
                        <TableCell colSpan={7}>Loading...</TableCell>
                      </TableRow>
                    ) : pricingPolicies.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7}>No policies found</TableCell>
                      </TableRow>
                    ) : (
                      pricingPolicies.map((p, idx) => (
                        <TableRow key={p.id} className="hover:bg-gray-50">
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell className="font-medium">
                            {p.name}
                          </TableCell>
                          <TableCell>{p.rate_per_kg}</TableCell>
                          <TableCell>{p.discount_percent ?? 0}</TableCell>
                          <TableCell>
                            <Badge
                              variant={p.is_active ? "default" : "secondary"}
                            >
                              {p.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditPolicy(p)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Create/Edit Pricing Policy Modal */}
          <Modal
            isOpen={showPricingModal}
            onClose={() => setShowPricingModal(false)}
            title={
              editingPolicy ? "Edit Pricing Policy" : "Create Pricing Policy"
            }
            widthSizeClass={ModalSize.medium}
          >
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Name</Label>
                  <Input
                    value={policyForm.name}
                    onChange={(e) =>
                      setPolicyForm({ ...policyForm, name: e.target.value })
                    }
                    placeholder="Policy name"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Rate per kg</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={policyForm.rate_per_kg}
                    onChange={(e) =>
                      setPolicyForm({
                        ...policyForm,
                        rate_per_kg: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Discount Percent</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={policyForm.discount_percent ?? 0}
                    onChange={(e) =>
                      setPolicyForm({
                        ...policyForm,
                        discount_percent:
                          e.target.value === ""
                            ? null
                            : parseFloat(e.target.value),
                      })
                    }
                    placeholder="Optional"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Status</Label>
                  <select
                    className="border rounded h-10 px-3"
                    value={policyForm.is_active ? "active" : "inactive"}
                    onChange={(e) =>
                      setPolicyForm({
                        ...policyForm,
                        is_active: e.target.value === "active",
                      })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={savePolicy} disabled={isSavingPolicy}>
                  {isSavingPolicy ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingPolicy ? "Update Policy" : "Create Policy"}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowPricingModal(false)}
                  disabled={isSavingPolicy}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>
        </TabsContent>

        {/* Service Areas Tab */}
        <TabsContent value="service-areas" className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Service Areas
                </CardTitle>
                <div className="flex gap-2">
                  <Input
                    placeholder="Filter by city"
                    value={filters.city || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        city: e.target.value || undefined,
                      }))
                    }
                    className="w-[200px]"
                  />
                  <select
                    className="border rounded h-10 px-3"
                    value={String(filters.is_active ?? "")}
                    onChange={(e) => {
                      const v = e.target.value;
                      setFilters((prev) => ({
                        ...prev,
                        is_active: v === "" ? undefined : v === "true",
                      }));
                    }}
                  >
                    <option value="">All</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                  <Button onClick={openCreateServiceArea}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Service Area
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="min-w-[900px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Radius (km)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingServiceAreas ? (
                      <TableRow>
                        <TableCell colSpan={8}>Loading...</TableCell>
                      </TableRow>
                    ) : serviceAreas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8}>
                          No service areas found
                        </TableCell>
                      </TableRow>
                    ) : (
                      serviceAreas.map((sa: ServiceArea, idx: number) => (
                        <TableRow key={sa.id} className="hover:bg-gray-50">
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell className="font-medium">
                            {sa.name}
                          </TableCell>
                          <TableCell>{sa.city || "-"}</TableCell>
                          <TableCell>{sa.country || "-"}</TableCell>
                          <TableCell>{sa.coverage_radius_km ?? "-"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={sa.is_active ? "default" : "secondary"}
                            >
                              {sa.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {(sa.created_at || "").toString().slice(0, 10)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditServiceArea(sa)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleArea(sa.id)}
                                disabled={togglingId === sa.id}
                              >
                                {togglingId === sa.id ? (
                                  <span className="flex items-center">
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Working...
                                  </span>
                                ) : sa.is_active ? (
                                  "Disable"
                                ) : (
                                  "Enable"
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Create/Edit Service Area Modal */}
          <Modal
            isOpen={serviceAreaModalOpen}
            onClose={() => setServiceAreaModalOpen(false)}
            title={
              editingServiceArea ? "Edit Service Area" : "Create Service Area"
            }
            widthSizeClass={ModalSize.medium}
          >
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Name</Label>
                  <Input
                    value={serviceAreaForm.name}
                    onChange={(e) =>
                      setServiceAreaForm({
                        ...serviceAreaForm,
                        name: e.target.value,
                      })
                    }
                    placeholder="Area name"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>City</Label>
                  <Input
                    value={serviceAreaForm.city || ""}
                    onChange={(e) =>
                      setServiceAreaForm({
                        ...serviceAreaForm,
                        city: e.target.value,
                      })
                    }
                    placeholder="Optional"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Country</Label>
                  <Input
                    value={serviceAreaForm.country || ""}
                    onChange={(e) =>
                      setServiceAreaForm({
                        ...serviceAreaForm,
                        country: e.target.value,
                      })
                    }
                    placeholder="Optional"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Coverage Radius (km)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={serviceAreaForm.coverage_radius_km ?? ""}
                    onChange={(e) =>
                      setServiceAreaForm({
                        ...serviceAreaForm,
                        coverage_radius_km:
                          e.target.value === ""
                            ? undefined
                            : parseFloat(e.target.value),
                      })
                    }
                    placeholder="Optional"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Status</Label>
                  <select
                    className="border rounded h-10 px-3"
                    value={serviceAreaForm.is_active ? "active" : "inactive"}
                    onChange={(e) =>
                      setServiceAreaForm({
                        ...serviceAreaForm,
                        is_active: e.target.value === "active",
                      })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={saveServiceArea}
                  disabled={
                    createServiceArea.isPending || updateServiceArea.isPending
                  }
                >
                  {createServiceArea.isPending ||
                  updateServiceArea.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingServiceArea
                        ? "Update Service Area"
                        : "Create Service Area"}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setServiceAreaModalOpen(false)}
                  disabled={
                    createServiceArea.isPending || updateServiceArea.isPending
                  }
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>
        </TabsContent>
      </Tabs>
    </div>
  );
}
