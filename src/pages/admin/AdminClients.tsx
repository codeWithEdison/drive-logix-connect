import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, AlertCircle } from "lucide-react";
import { ClientTable, Client } from "@/components/ui/ClientTable";
import { ClientDetailModal } from "@/components/ui/ClientDetailModal";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminClients } from "@/lib/api/hooks/clientHooks";
import { useCreateClient, useUpdateClient } from "@/lib/api/hooks/utilityHooks";
import { useUpdateUserStatus } from "@/lib/api/hooks";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { customToast } from "@/lib/utils/toast";
import Modal, { ModalSize } from "@/components/modal/Modal";
import { Label } from "@/components/ui/label";
import { getErrorMessage } from "@/lib/utils/frontend";

export default function AdminClients() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientDetailModalOpen, setIsClientDetailModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showCreateClientModal, setShowCreateClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Client form state
  const [clientFormData, setClientFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    preferred_language: "en" as "en" | "rw" | "fr",
    company_name: "",
    business_type: "individual" as "individual" | "corporate" | "government",
    tax_id: "",
    address: "",
    city: "",
    country: "",
    postal_code: "",
    contact_person: "",
    credit_limit: 0,
    payment_terms: 30,
  });

  // API hooks
  const {
    data: clientsData,
    isLoading,
    error,
    refetch,
  } = useAdminClients({
    limit: 100,
  });

  const updateUserStatusMutation = useUpdateUserStatus();
  const createClientMutation = useCreateClient();
  const updateClientMutation = useUpdateClient();

  // Transform clients data to match Client interface
  const clients: Client[] =
    clientsData?.map((item: any) => ({
      id: item.user.id,
      full_name: item.user.full_name,
      email: item.user.email,
      phone: item.user.phone,
      preferred_language: item.user.preferred_language,
      is_active: item.user.is_active,
      is_verified: item.user.is_verified,
      created_at: item.user.created_at,
      updated_at: item.user.updated_at,
      last_login: item.user.last_login,
      // Client-specific data
      company_name: item.client.company_name,
      business_type: item.client.business_type,
      tax_id: item.client.tax_id,
      address: item.client.address,
      city: item.client.city,
      country: item.client.country,
      postal_code: item.client.postal_code,
      contact_person: item.client.contact_person,
      credit_limit: item.client.credit_limit,
      payment_terms: item.client.payment_terms,
      totalCargos: item.client.total_cargo || 0,
      location: item.client.address || "",
      registeredDate: item.user.created_at,
      lastActive: item.user.last_login || item.user.updated_at,
      avatar_url: item.user.avatar_url,
      status: (item.user.is_active ? "active" : "inactive") as
        | "active"
        | "pending"
        | "inactive"
        | "suspended",
    })) || [];

  // Filter clients based on search and status
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      searchTerm === "" ||
      client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      (client.company_name &&
        client.company_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || client.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Client handlers
  const handleViewClientDetails = (client: Client) => {
    setSelectedClient(client);
    setIsClientDetailModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setClientFormData({
      full_name: client.full_name,
      email: client.email,
      phone: client.phone,
      password: "", // Don't pre-fill password
      preferred_language: "en" as "en" | "rw" | "fr",
      company_name: client.company_name || "",
      business_type: client.business_type || "individual",
      tax_id: client.tax_id || "",
      address: client.address || "",
      city: client.city || "",
      country: client.country || "",
      postal_code: client.postal_code || "",
      contact_person: client.contact_person || "",
      credit_limit: client.credit_limit || 0,
      payment_terms: client.payment_terms || 30,
    });
    setShowCreateClientModal(true);
  };

  // Helper function to extract error messages
  const extractErrorMessage = (error: any): string => {
    if (error?.response?.data) {
      const errorData = error.response.data;

      // Handle direct error string
      if (typeof errorData.error === "string") {
        return errorData.error;
      }
      // Handle error object with message
      if (errorData.error?.message) {
        return errorData.error.message;
      }
      // Handle direct message field
      if (errorData.message) {
        return errorData.message;
      }
      // Handle nested error message
      if (errorData.error?.code) {
        return `${errorData.error.code}: ${
          errorData.error.message || "An error occurred"
        }`;
      }
    }
    // Handle network or other errors
    if (error?.message) {
      return error.message;
    }
    return "An unexpected error occurred";
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      await updateUserStatusMutation.mutateAsync({
        id: clientId,
        data: { is_active: false, reason: "Deactivated by admin" },
      });
      customToast.success(
        "Client Deactivated",
        "Client has been deactivated successfully"
      );
      refetch();
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      customToast.error("Failed to Deactivate Client", errorMessage);
    }
  };

  const handleActivateClient = async (clientId: string) => {
    try {
      await updateUserStatusMutation.mutateAsync({
        id: clientId,
        data: { is_active: true, reason: "Activated by admin" },
      });
      customToast.success(
        "Client Activated",
        "Client has been activated successfully"
      );
      refetch();
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      customToast.error("Failed to Activate Client", errorMessage);
    }
  };

  const handleSuspendClient = async (clientId: string) => {
    try {
      await updateUserStatusMutation.mutateAsync({
        id: clientId,
        data: { is_active: false, reason: "Suspended by admin" },
      });
      customToast.success(
        "Client Suspended",
        "Client has been suspended successfully"
      );
      refetch();
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      customToast.error("Failed to Suspend Client", errorMessage);
    }
  };

  // General handlers
  const handleCreateNew = () => {
    setEditingClient(null);
    setClientFormData({
      full_name: "",
      email: "",
      phone: "",
      password: "",
      preferred_language: "en",
      company_name: "",
      business_type: "individual",
      tax_id: "",
      address: "",
      city: "",
      country: "",
      postal_code: "",
      contact_person: "",
      credit_limit: 0,
      payment_terms: 30,
    });
    setShowCreateClientModal(true);
  };

  const handleRefresh = () => {
    refetch();
    customToast.success("Data refreshed successfully");
  };

  const handleCallClient = (phone: string) => {
    window.open(`tel:${phone}`, "_self");
  };

  const handleCreateClientSuccess = async () => {
    try {
      if (editingClient) {
        // Update existing client
        await updateClientMutation.mutateAsync({
          clientId: editingClient.id,
          data: {
            full_name: clientFormData.full_name,
            email: clientFormData.email,
            phone: clientFormData.phone,
            company_name: clientFormData.company_name,
            business_type: clientFormData.business_type,
            tax_id: clientFormData.tax_id,
            address: clientFormData.address,
            city: clientFormData.city,
            country: clientFormData.country,
            postal_code: clientFormData.postal_code,
            contact_person: clientFormData.contact_person,
            credit_limit: clientFormData.credit_limit,
            payment_terms: clientFormData.payment_terms,
            preferred_language: clientFormData.preferred_language,
            is_active: editingClient.is_active,
            // Only update password if provided
            ...(clientFormData.password && {
              password: clientFormData.password,
            }),
          },
        });
        customToast.success("Client updated successfully!");
      } else {
        // Create new client
        await createClientMutation.mutateAsync(clientFormData);
        customToast.success("Client created successfully!");
      }

      setShowCreateClientModal(false);
      setEditingClient(null);
      refetch();
    } catch (error: any) {
      const errorMessage = getErrorMessage(
        error,
        editingClient ? "Failed to update client" : "Failed to create client"
      );

      const errorTitle = editingClient
        ? "Failed to Update Client"
        : "Failed to Create Client";

      customToast.error(errorTitle, errorMessage);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Client Management
            </h1>
            <p className="text-muted-foreground">
              Manage and monitor all clients in the system
            </p>
          </div>
        </div>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <h3 className="font-semibold text-red-800">Error</h3>
                <p className="text-red-600 text-sm mt-1">
                  {error.message || "Failed to load clients"}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="mt-2"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Client Management
          </h1>
          <p className="text-muted-foreground">
            Manage and monitor all clients in the system
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Client
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Status:</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search clients..."
            className="w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Client Table */}
      <ClientTable
        clients={filteredClients}
        title=""
        showSearch={false}
        showFilters={false}
        showPagination={false}
        onViewDetails={handleViewClientDetails}
        onEditClient={handleEditClient}
        onDeleteClient={handleDeleteClient}
        onCallClient={handleCallClient}
        onSuspendClient={handleSuspendClient}
        onActivateClient={handleActivateClient}
      />

      {/* Client Detail Modal */}
      {selectedClient && (
        <ClientDetailModal
          client={selectedClient}
          isOpen={isClientDetailModalOpen}
          onClose={() => {
            setIsClientDetailModalOpen(false);
            setSelectedClient(null);
          }}
        />
      )}

      {/* Create/Edit Client Modal */}
      <Modal
        isOpen={showCreateClientModal}
        onClose={() => {
          setShowCreateClientModal(false);
          setEditingClient(null);
        }}
        title={editingClient ? "Edit Client" : "Create New Client"}
        widthSizeClass={ModalSize.large}
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={clientFormData.full_name}
                onChange={(e) =>
                  setClientFormData({
                    ...clientFormData,
                    full_name: e.target.value,
                  })
                }
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={clientFormData.email}
                onChange={(e) =>
                  setClientFormData({
                    ...clientFormData,
                    email: e.target.value,
                  })
                }
                placeholder="Enter email"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={clientFormData.phone}
                onChange={(e) =>
                  setClientFormData({
                    ...clientFormData,
                    phone: e.target.value,
                  })
                }
                placeholder="Enter phone number"
              />
            </div>
            {!editingClient && (
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={clientFormData.password}
                  onChange={(e) =>
                    setClientFormData({
                      ...clientFormData,
                      password: e.target.value,
                    })
                  }
                  placeholder="Enter password"
                />
              </div>
            )}
            {editingClient && (
              <div>
                <Label htmlFor="password">
                  New Password (leave blank to keep current)
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={clientFormData.password}
                  onChange={(e) =>
                    setClientFormData({
                      ...clientFormData,
                      password: e.target.value,
                    })
                  }
                  placeholder="Enter new password"
                />
              </div>
            )}
            <div>
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={clientFormData.company_name}
                onChange={(e) =>
                  setClientFormData({
                    ...clientFormData,
                    company_name: e.target.value,
                  })
                }
                placeholder="Enter company name"
              />
            </div>
            <div>
              <Label htmlFor="business_type">Business Type *</Label>
              <Select
                value={clientFormData.business_type}
                onValueChange={(value: any) =>
                  setClientFormData({
                    ...clientFormData,
                    business_type: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tax_id">Tax ID</Label>
              <Input
                id="tax_id"
                value={clientFormData.tax_id}
                onChange={(e) =>
                  setClientFormData({
                    ...clientFormData,
                    tax_id: e.target.value,
                  })
                }
                placeholder="Enter tax ID"
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={clientFormData.address}
                onChange={(e) =>
                  setClientFormData({
                    ...clientFormData,
                    address: e.target.value,
                  })
                }
                placeholder="Enter address"
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={clientFormData.city}
                onChange={(e) =>
                  setClientFormData({
                    ...clientFormData,
                    city: e.target.value,
                  })
                }
                placeholder="Enter city"
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={clientFormData.country}
                onChange={(e) =>
                  setClientFormData({
                    ...clientFormData,
                    country: e.target.value,
                  })
                }
                placeholder="Enter country"
              />
            </div>
            <div>
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input
                id="postal_code"
                value={clientFormData.postal_code}
                onChange={(e) =>
                  setClientFormData({
                    ...clientFormData,
                    postal_code: e.target.value,
                  })
                }
                placeholder="Enter postal code"
              />
            </div>
            <div>
              <Label htmlFor="contact_person">Contact Person</Label>
              <Input
                id="contact_person"
                value={clientFormData.contact_person}
                onChange={(e) =>
                  setClientFormData({
                    ...clientFormData,
                    contact_person: e.target.value,
                  })
                }
                placeholder="Enter contact person"
              />
            </div>
            <div>
              <Label htmlFor="credit_limit">Credit Limit</Label>
              <Input
                id="credit_limit"
                type="number"
                value={clientFormData.credit_limit}
                onChange={(e) =>
                  setClientFormData({
                    ...clientFormData,
                    credit_limit: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="Enter credit limit"
              />
            </div>
            <div>
              <Label htmlFor="payment_terms">Payment Terms (days)</Label>
              <Input
                id="payment_terms"
                type="number"
                value={clientFormData.payment_terms}
                onChange={(e) =>
                  setClientFormData({
                    ...clientFormData,
                    payment_terms: parseInt(e.target.value) || 30,
                  })
                }
                placeholder="Enter payment terms"
              />
            </div>
            <div>
              <Label htmlFor="preferred_language">Preferred Language</Label>
              <Select
                value={clientFormData.preferred_language}
                onValueChange={(value: any) =>
                  setClientFormData({
                    ...clientFormData,
                    preferred_language: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="rw">Kinyarwanda</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateClientModal(false);
                setEditingClient(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateClientSuccess}
              disabled={
                createClientMutation.isPending || updateClientMutation.isPending
              }
            >
              {createClientMutation.isPending || updateClientMutation.isPending
                ? "Saving..."
                : editingClient
                ? "Update Client"
                : "Create Client"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
