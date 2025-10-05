import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Modal, { ModalSize } from "@/components/modal/Modal";
import {
  Settings,
  DollarSign,
  Shield,
  Bell,
  Database,
  Save,
  Plus,
  Edit,
  Trash2,
  Users,
  Lock,
  Globe,
  Activity,
} from "lucide-react";
import axiosInstance from "@/lib/api/axios";

// Mock data for superadmin settings - Rwanda-based
const mockGlobalPricing = {
  baseRatePerKm: 2500, // RWF per km
  baseRatePerKg: 1200, // RWF per kg
  minimumCharge: 25000, // RWF
  fuelSurcharge: 0.15, // 15%
  insuranceRate: 0.05, // 5%
  platformFee: 0.1, // 10%
  taxRate: 0.18, // 18% VAT
};

const mockRBACRoles = [
  {
    id: "1",
    name: "Super Admin",
    description: "Full system access and control",
    permissions: ["all"],
    userCount: 1,
    isActive: true,
  },
  {
    id: "2",
    name: "Admin",
    description: "Regional operations management",
    permissions: [
      "manage_users",
      "manage_cargos",
      "view_reports",
      "manage_settings",
    ],
    userCount: 8,
    isActive: true,
  },
  {
    id: "3",
    name: "Manager",
    description: "Local operations oversight",
    permissions: ["view_reports", "manage_cargos"],
    userCount: 15,
    isActive: true,
  },
  {
    id: "4",
    name: "Viewer",
    description: "Read-only access to reports",
    permissions: ["view_reports"],
    userCount: 25,
    isActive: false,
  },
];

const mockNotifications = [
  {
    id: "1",
    type: "email",
    name: "Delivery Status Updates",
    description: "Send email notifications for delivery status changes",
    isActive: true,
    recipients: ["clients", "drivers"],
  },
  {
    id: "2",
    type: "sms",
    name: "Urgent Alerts",
    description: "Send SMS for urgent delivery updates",
    isActive: true,
    recipients: ["drivers", "admins"],
  },
  {
    id: "3",
    type: "email",
    name: "System Reports",
    description: "Daily system performance reports",
    isActive: false,
    recipients: ["admins"],
  },
  {
    id: "4",
    type: "sms",
    name: "Payment Confirmations",
    description: "SMS confirmation for successful payments",
    isActive: true,
    recipients: ["clients"],
  },
];

const mockSystemConfig = {
  maintenanceMode: false,
  autoBackup: true,
  backupFrequency: "daily",
  retentionDays: 30,
  maxFileSize: 10, // MB
  sessionTimeout: 30, // minutes
  maxLoginAttempts: 5,
  enableAuditLog: true,
  enableLocationTracking: true,
  enableRealTimeUpdates: true,
};

export default function SuperAdminSettings() {
  // General (company) settings state
  const [generalSettings, setGeneralSettings] = useState({
    companyName: "Loveway Logistics",
    companyEmail: "admin@lovelycargo.rw",
    companyPhone: "+250 123 456 789",
    companyAddress: "KG 123 Street, Kigali, Rwanda",
    timezone: "Africa/Kigali",
    currency: "RWF",
    language: "en",
  });
  const [globalPricing, setGlobalPricing] = useState(mockGlobalPricing);
  const [rbacRoles, setRbacRoles] = useState(mockRBACRoles);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [systemConfig, setSystemConfig] = useState(mockSystemConfig);

  // Modal states
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [editingNotification, setEditingNotification] = useState<any>(null);

  // Pricing policies state and CRUD
  interface CreatePricingPolicyRequest {
    name: string;
    base_rate_per_km: number;
    rate_per_kg: number;
    minimum_fare?: number | null;
    surcharge_type?: "fixed" | "percent" | null;
    surcharge_amount?: number | null;
    surcharge_description?: string | null;
    discount_percent?: number | null;
    is_active?: boolean;
    valid_from?: string | Date | null;
    valid_until?: string | Date | null;
  }

  type UpdatePricingPolicyRequest = Partial<CreatePricingPolicyRequest>;

  const [pricingPolicies, setPricingPolicies] = useState<any[]>([]);
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<any>(null);
  const [policyForm, setPolicyForm] = useState<CreatePricingPolicyRequest>({
    name: "",
    base_rate_per_km: 0,
    rate_per_kg: 0,
    minimum_fare: null,
    surcharge_type: null,
    surcharge_amount: null,
    surcharge_description: "",
    discount_percent: null,
    is_active: true,
    valid_from: null,
    valid_until: null,
  });

  const fetchPricingPolicies = async () => {
    try {
      setIsLoadingPolicies(true);
      const res = await axiosInstance.get("/operational/pricing-policies");
      const payload = res?.data;
      // Accept shapes: { data: [...] } or [...] directly
      const items = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.data?.data)
        ? payload.data.data
        : [];
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
      base_rate_per_km: 0,
      rate_per_kg: 0,
      minimum_fare: null,
      surcharge_type: null,
      surcharge_amount: null,
      surcharge_description: "",
      discount_percent: null,
      is_active: true,
      valid_from: null,
      valid_until: null,
    });
    setShowPricingModal(true);
  };

  const openEditPolicy = (policy: any) => {
    setEditingPolicy(policy);
    setPolicyForm({
      name: policy.name || "",
      base_rate_per_km: Number(policy.base_rate_per_km) || 0,
      rate_per_kg: Number(policy.rate_per_kg) || 0,
      minimum_fare: policy.minimum_fare ?? null,
      surcharge_type: policy.surcharge_type ?? null,
      surcharge_amount: policy.surcharge_amount ?? null,
      surcharge_description: policy.surcharge_description ?? "",
      discount_percent: policy.discount_percent ?? null,
      is_active: !!policy.is_active,
      valid_from: policy.valid_from || null,
      valid_until: policy.valid_until || null,
    });
    setShowPricingModal(true);
  };

  const savePolicy = async () => {
    try {
      const payload: any = { ...policyForm } as CreatePricingPolicyRequest;
      // Normalize empty strings/nullables
      // vehicle_type removed from interface
      if (!payload.minimum_fare && payload.minimum_fare !== 0)
        payload.minimum_fare = null;
      if (!payload.surcharge_description) payload.surcharge_description = null;
      if (!payload.surcharge_type) payload.surcharge_type = null;
      if (!payload.surcharge_amount && payload.surcharge_amount !== 0)
        payload.surcharge_amount = null;
      if (!payload.discount_percent && payload.discount_percent !== 0)
        payload.discount_percent = null;
      if (!payload.valid_from) payload.valid_from = null;
      if (!payload.valid_until) payload.valid_until = null;

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
    } catch (e) {
      console.error("Failed to save pricing policy", e);
    }
  };

  React.useEffect(() => {
    fetchPricingPolicies();
  }, []);

  const handlePricingChange = (field: string, value: number) => {
    setGlobalPricing((prev) => ({ ...prev, [field]: value }));
  };

  const handleSystemConfigChange = (field: string, value: any) => {
    setSystemConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleRoleToggle = (id: string) => {
    setRbacRoles((prev) =>
      prev.map((role) =>
        role.id === id ? { ...role, isActive: !role.isActive } : role
      )
    );
  };

  const handleNotificationToggle = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, isActive: !notification.isActive }
          : notification
      )
    );
  };

  const handleSaveSettings = () => {
    console.log("Saving all settings:", {
      globalPricing,
      rbacRoles,
      notifications,
      systemConfig,
    });
    // TODO: Implement API call to save settings
  };

  const openRoleModal = (role?: any) => {
    if (role) {
      setEditingRole(role);
    } else {
      setEditingRole(null);
    }
    setShowRoleModal(true);
  };

  const openNotificationModal = (notification?: any) => {
    if (notification) {
      setEditingNotification(notification);
    } else {
      setEditingNotification(null);
    }
    setShowNotificationModal(true);
  };

  const handleDeleteRole = (id: string) => {
    setRbacRoles((prev) => prev.filter((role) => role.id !== id));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const getStatusColor = (status: boolean) => {
    return status ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600";
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            System Configuration
          </h1>
          <p className="text-muted-foreground">
            Manage global settings and system policies
          </p>
        </div>
        <Button
          onClick={handleSaveSettings}
          className="bg-gradient-primary hover:bg-primary-hover"
        >
          <Save className="w-4 h-4 mr-2" />
          Save All Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="flex flex-col gap-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="pricing">Global Pricing</TabsTrigger>
          <TabsTrigger value="rbac">Role Management</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="system">System Config</TabsTrigger>
        </TabsList>

        {/* General Settings (from Admin Settings) */}
        <TabsContent value="general" className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={generalSettings.companyName}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        companyName: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="companyEmail">Company Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={generalSettings.companyEmail}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        companyEmail: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="companyPhone">Company Phone</Label>
                  <Input
                    id="companyPhone"
                    value={generalSettings.companyPhone}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        companyPhone: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={generalSettings.timezone}
                    onValueChange={(value) =>
                      setGeneralSettings({
                        ...generalSettings,
                        timezone: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Kigali">
                        Africa/Kigali
                      </SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={generalSettings.currency}
                    onValueChange={(value) =>
                      setGeneralSettings({
                        ...generalSettings,
                        currency: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RWF">RWF (Rwandan Franc)</SelectItem>
                      <SelectItem value="USD">USD (US Dollar)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={generalSettings.language}
                    onValueChange={(value) =>
                      setGeneralSettings({
                        ...generalSettings,
                        language: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="rw">Kinyarwanda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="companyAddress">Company Address</Label>
                <Textarea
                  id="companyAddress"
                  value={generalSettings.companyAddress}
                  onChange={(e) =>
                    setGeneralSettings({
                      ...generalSettings,
                      companyAddress: e.target.value,
                    })
                  }
                />
              </div>
              <Button
                onClick={() => {
                  /* TODO: Save general settings API */
                }}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

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
                      <TableHead>Base/km</TableHead>
                      <TableHead>Rate/kg</TableHead>
                      <TableHead>Min Fare</TableHead>
                      <TableHead>Surcharge</TableHead>
                      <TableHead>Discount %</TableHead>
                      <TableHead>Valid</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingPolicies ? (
                      <TableRow>
                        <TableCell colSpan={11}>Loading...</TableCell>
                      </TableRow>
                    ) : pricingPolicies.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={11}>No policies found</TableCell>
                      </TableRow>
                    ) : (
                      pricingPolicies.map((p, idx) => (
                        <TableRow key={p.id} className="hover:bg-gray-50">
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell className="font-medium">
                            {p.name}
                          </TableCell>
                          <TableCell>{p.base_rate_per_km}</TableCell>
                          <TableCell>{p.rate_per_kg}</TableCell>
                          <TableCell>{p.minimum_fare ?? "-"}</TableCell>
                          <TableCell>
                            {p.surcharge_type
                              ? `${p.surcharge_type} ${p.surcharge_amount}`
                              : "-"}
                          </TableCell>
                          <TableCell>{p.discount_percent ?? 0}</TableCell>
                          <TableCell>
                            {(p.valid_from || "").toString().slice(0, 10)}
                            {p.valid_until &&
                              ` → ${p.valid_until.toString().slice(0, 10)}`}
                          </TableCell>
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
                  <Label>Base Rate per km</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={policyForm.base_rate_per_km}
                    onChange={(e) =>
                      setPolicyForm({
                        ...policyForm,
                        base_rate_per_km: parseFloat(e.target.value) || 0,
                      })
                    }
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
                  <Label>Minimum Fare</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={policyForm.minimum_fare ?? 0}
                    onChange={(e) =>
                      setPolicyForm({
                        ...policyForm,
                        minimum_fare:
                          e.target.value === ""
                            ? null
                            : parseFloat(e.target.value),
                      })
                    }
                    placeholder="Optional"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Surcharge Type</Label>
                  <Select
                    value={policyForm.surcharge_type ?? "none"}
                    onValueChange={(value) =>
                      setPolicyForm({
                        ...policyForm,
                        surcharge_type:
                          (value as any) === "none" ? null : (value as any),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="percent">Percent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Surcharge Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={policyForm.surcharge_amount ?? 0}
                    onChange={(e) =>
                      setPolicyForm({
                        ...policyForm,
                        surcharge_amount:
                          e.target.value === ""
                            ? null
                            : parseFloat(e.target.value),
                      })
                    }
                    placeholder="Optional"
                  />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <Label>Surcharge Description</Label>
                  <Input
                    value={policyForm.surcharge_description || ""}
                    onChange={(e) =>
                      setPolicyForm({
                        ...policyForm,
                        surcharge_description: e.target.value,
                      })
                    }
                    placeholder="Optional description"
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
                  <Label>Valid From</Label>
                  <Input
                    type="date"
                    value={
                      policyForm.valid_from
                        ? String(policyForm.valid_from).slice(0, 10)
                        : ""
                    }
                    onChange={(e) =>
                      setPolicyForm({
                        ...policyForm,
                        valid_from: e.target.value || null,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Valid Until</Label>
                  <Input
                    type="date"
                    value={
                      policyForm.valid_until
                        ? String(policyForm.valid_until).slice(0, 10)
                        : ""
                    }
                    onChange={(e) =>
                      setPolicyForm({
                        ...policyForm,
                        valid_until: e.target.value || null,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Status</Label>
                  <Select
                    value={policyForm.is_active ? "active" : "inactive"}
                    onValueChange={(v) =>
                      setPolicyForm({
                        ...policyForm,
                        is_active: v === "active",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={savePolicy}>
                  <Save className="h-4 w-4 mr-2" />
                  {editingPolicy ? "Update Policy" : "Create Policy"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowPricingModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>
        </TabsContent>

        {/* RBAC Management Tab */}
        <TabsContent value="rbac" className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Role-Based Access Control
                </CardTitle>
                <Button onClick={() => openRoleModal()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Role
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="min-w-[900px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rbacRoles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">
                          {role.name}
                        </TableCell>
                        <TableCell>{role.description}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.map((permission, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {permission}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{role.userCount}</TableCell>
                        <TableCell>
                          <Switch
                            checked={role.isActive}
                            onCheckedChange={() => handleRoleToggle(role.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openRoleModal(role)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteRole(role.id)}
                            >
                              <Trash2 className="h-4 w-4" />
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
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <Button onClick={() => openNotificationModal()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Notification
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="min-w-[900px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notifications.map((notification) => (
                      <TableRow key={notification.id}>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {notification.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {notification.name}
                        </TableCell>
                        <TableCell>{notification.description}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {notification.recipients.map((recipient, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {recipient}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={notification.isActive}
                            onCheckedChange={() =>
                              handleNotificationToggle(notification.id)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                openNotificationModal(notification)
                              }
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDeleteNotification(notification.id)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
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
        </TabsContent>

        {/* System Configuration Tab */}
        <TabsContent value="system" className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  <Switch
                    id="maintenanceMode"
                    checked={systemConfig.maintenanceMode}
                    onCheckedChange={(checked) =>
                      handleSystemConfigChange("maintenanceMode", checked)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="autoBackup">Auto Backup</Label>
                  <Switch
                    id="autoBackup"
                    checked={systemConfig.autoBackup}
                    onCheckedChange={(checked) =>
                      handleSystemConfigChange("autoBackup", checked)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">Backup Frequency</Label>
                  <Select
                    value={systemConfig.backupFrequency}
                    onValueChange={(value) =>
                      handleSystemConfigChange("backupFrequency", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retentionDays">Retention Days</Label>
                  <Input
                    id="retentionDays"
                    type="number"
                    value={systemConfig.retentionDays}
                    onChange={(e) =>
                      handleSystemConfigChange(
                        "retentionDays",
                        parseInt(e.target.value)
                      )
                    }
                    placeholder="30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">
                    Session Timeout (minutes)
                  </Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={systemConfig.sessionTimeout}
                    onChange={(e) =>
                      handleSystemConfigChange(
                        "sessionTimeout",
                        parseInt(e.target.value)
                      )
                    }
                    placeholder="30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={systemConfig.maxLoginAttempts}
                    onChange={(e) =>
                      handleSystemConfigChange(
                        "maxLoginAttempts",
                        parseInt(e.target.value)
                      )
                    }
                    placeholder="5"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableAuditLog"
                    checked={systemConfig.enableAuditLog}
                    onCheckedChange={(checked) =>
                      handleSystemConfigChange("enableAuditLog", checked)
                    }
                  />
                  <Label htmlFor="enableAuditLog">Enable Audit Logging</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableLocationTracking"
                    checked={systemConfig.enableLocationTracking}
                    onCheckedChange={(checked) =>
                      handleSystemConfigChange(
                        "enableLocationTracking",
                        checked
                      )
                    }
                  />
                  <Label htmlFor="enableLocationTracking">
                    Enable Location Tracking
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableRealTimeUpdates"
                    checked={systemConfig.enableRealTimeUpdates}
                    onCheckedChange={(checked) =>
                      handleSystemConfigChange("enableRealTimeUpdates", checked)
                    }
                  />
                  <Label htmlFor="enableRealTimeUpdates">
                    Enable Real-time Updates
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Role Modal */}
      <Modal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title={editingRole ? "Edit Role" : "Add New Role"}
        widthSizeClass={ModalSize.medium}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Role Name</Label>
            <Input
              placeholder="e.g., Manager"
              defaultValue={editingRole?.name || ""}
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Describe the role's responsibilities..."
              defaultValue={editingRole?.description || ""}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Permissions</Label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked />
                <span className="text-sm">Manage Users</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked />
                <span className="text-sm">Manage Cargos</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked />
                <span className="text-sm">View Reports</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" />
                <span className="text-sm">Manage Settings</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button className="flex-1">
              {editingRole ? "Update Role" : "Create Role"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowRoleModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Notification Modal */}
      <Modal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        title={
          editingNotification ? "Edit Notification" : "Add New Notification"
        }
        widthSizeClass={ModalSize.medium}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Notification Type</Label>
            <Select defaultValue={editingNotification?.type || "email"}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="push">Push Notification</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              placeholder="e.g., Delivery Updates"
              defaultValue={editingNotification?.name || ""}
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Describe when this notification is sent..."
              defaultValue={editingNotification?.description || ""}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Recipients</Label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked />
                <span className="text-sm">Clients</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked />
                <span className="text-sm">Drivers</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" />
                <span className="text-sm">Admins</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button className="flex-1">
              {editingNotification
                ? "Update Notification"
                : "Create Notification"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowNotificationModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
