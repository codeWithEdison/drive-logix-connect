import React, { useState } from "react";
import { CustomTabs } from "@/components/ui/CustomTabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DriverTable, Driver } from "@/components/ui/DriverTable";
import { ClientTable } from "@/components/ui/ClientTable";
import { DriverDetailModal } from "@/components/ui/DriverDetailModal";
import { ClientDetailModal } from "@/components/ui/ClientDetailModal";
import { UserDetailModal } from "@/components/ui/UserDetailModal";
import { CreateDriverModal } from "@/components/ui/CreateDriverModal";
import Modal, { ModalSize } from "@/components/modal/Modal";
import ModernModel from "@/components/modal/ModernModel";
import {
  useUserManagement,
  useUpdateUserStatus,
  useCreateAdmin,
  useUpdateAdmin,
  useCreateDriver,
  useCreateClient,
  useUpdateClient,
} from "@/lib/api/hooks/utilityHooks";
import { useAdminClients } from "@/lib/api/hooks/clientHooks";
import { useBranches } from "@/lib/api/hooks/branchHooks";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { customToast } from "@/lib/utils/toast";
import { useAuth } from "@/contexts/AuthContext";
import { User, Client, UserRole } from "@/types/shared";

interface FormData {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  preferred_language: "en" | "rw" | "fr";
  // Client fields
  company_name: string;
  business_type: "individual" | "corporate" | "government";
  tax_id: string;
  address: string;
  city: string;
  country: string;
  postal_code: string;
  contact_person: string;
  credit_limit: number;
  payment_terms: number;
  // Driver fields
  license_number: string;
  license_expiry: string;
  license_type: "A" | "B" | "C" | "D" | "E";
  code_number: string;
  date_of_birth: string;
  emergency_contact: string;
  emergency_phone: string;
  blood_type: string;
  medical_certificate_expiry: string;
  // General fields
  is_active: boolean;
}
import {
  Users,
  Shield,
  UserCheck,
  UserX,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Loader2,
  RefreshCw,
  X,
  RefreshCcw,
} from "lucide-react";

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("rw-RW", {
    style: "currency",
    currency: "RWF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function SuperAdminUsers() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("admins");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<User | null>(null);

  // Filter states
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showAdminDetailModal, setShowAdminDetailModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<User | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [currentDriverPage, setCurrentDriverPage] = useState(1);
  const [currentClientPage, setCurrentClientPage] = useState(1);

  // Driver modal states
  const [showCreateDriverModal, setShowCreateDriverModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  // Admin modal states
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [editingAdminUser, setEditingAdminUser] = useState<User | null>(null);

  // Client modal states
  const [showCreateClientModal, setShowCreateClientModal] = useState(false);
  const [editingClientUser, setEditingClientUser] = useState<any>(null);

  // New modern modals
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<
    "admin" | "driver" | "client"
  >("admin");
  const [editingUser, setEditingUser] = useState<any>(null);

  // Form state for modern modals
  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    preferred_language: "en" as "en" | "rw" | "fr",
    // Client fields
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
    // Driver fields
    license_number: "",
    license_expiry: "",
    license_type: "B" as "A" | "B" | "C" | "D" | "E",
    code_number: "",
    date_of_birth: "",
    emergency_contact: "",
    emergency_phone: "",
    blood_type: "",
    medical_certificate_expiry: "",
    // General fields
    is_active: true,
  });

  // Admin form state
  const [adminFormData, setAdminFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    preferred_language: "en" as "en" | "rw" | "fr",
    branch_id: "",
  });

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);

  // Generate random password function
  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Helper function to extract error messages from API response
  const extractErrorMessage = (error: any) => {
    if (
      error?.response?.data?.error?.details &&
      Array.isArray(error.response.data.error.details)
    ) {
      // Handle validation errors with details
      const details = error.response.data.error.details;
      const fieldErrors = details
        .map((detail: any) => `${detail.field}: ${detail.message}`)
        .join(", ");
      return (
        fieldErrors || error.response.data.error.message || "Validation failed"
      );
    }

    if (error?.response?.data?.error?.message) {
      return error.response.data.error.message;
    }

    if (error?.response?.data?.message) {
      return error.response.data.message;
    }

    if (error?.message) {
      return error.message;
    }

    return "An unexpected error occurred";
  };

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

  // Fetch data from backend
  const {
    data: adminsData,
    isLoading: isAdminsLoading,
    error: adminsError,
  } = useUserManagement({
    role: UserRole.ADMIN,
    limit: 50,
  });

  const {
    data: driversData,
    isLoading: isDriversLoading,
    error: driversError,
    refetch: refetchDrivers,
  } = useUserManagement({
    role: UserRole.DRIVER,
    limit: 50,
  });

  const {
    data: clientsData,
    isLoading: isClientsLoading,
    error: clientsError,
  } = useAdminClients({
    limit: 50,
  });

  // Fetch branches for filter
  const { data: branchesData } = useBranches({ limit: 100 });

  const updateUserStatusMutation = useUpdateUserStatus();

  // Create user mutations
  const createAdminMutation = useCreateAdmin();
  const updateAdminMutation = useUpdateAdmin();
  const createDriverMutation = useCreateDriver();
  const createClientMutation = useCreateClient();
  const updateClientMutation = useUpdateClient();

  // Process data from API responses
  const admins = adminsData || [];
  // Transform drivers data to match Driver interface
  const drivers: Driver[] = driversData
    ? driversData.map((user: any) => ({
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        license_number: user.driver?.license_number || "N/A",
        license_expiry: user.driver?.license_expiry || "N/A",
        license_type: user.driver?.license_type || "B",
        date_of_birth: user.driver?.date_of_birth || "N/A",
        emergency_contact: user.driver?.emergency_contact || "N/A",
        emergency_phone: user.driver?.emergency_phone || "N/A",
        blood_type: user.driver?.blood_type || "N/A",
        medical_certificate_expiry:
          user.driver?.medical_certificate_expiry || "N/A",
        status: user.driver?.status || "available",
        rating: user.driver?.rating || 0,
        total_deliveries: user.driver?.total_deliveries || 0,
        total_distance_km: user.driver?.total_distance_km || 0,
        driver_number: user.driver?.code_number || "N/A",
        registeredDate: user.created_at,
        lastActive: user.last_login || "Never",
        avatar_url: user.avatar_url,
        is_active: user.is_active,
        is_verified: user.is_verified,
        branch_name: user.driver?.branch?.name || user.branch?.name || "-",
      }))
    : [];
  // Transform clients data to match expected structure
  const clients = clientsData
    ? clientsData.map((item: any) => ({
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
      }))
    : [];

  const handleViewDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setShowDriverModal(true);
  };

  const handleEditDriver = (driver: Driver) => {
    setEditingDriver(driver);
    setShowCreateDriverModal(true);
  };

  const handleCreateDriver = () => {
    setEditingDriver(null);
    setShowCreateDriverModal(true);
  };

  const handleDriverSuccess = () => {
    setShowCreateDriverModal(false);
    setEditingDriver(null);
    refetchDrivers();
    customToast.success("Driver operation completed successfully");
  };

  // Admin handlers
  const handleCreateAdmin = () => {
    setEditingAdminUser(null);
    const generatedPassword = generatePassword();
    setAdminFormData({
      full_name: "",
      email: "",
      phone: "",
      password: generatedPassword,
      preferred_language: "en",
      branch_id: "",
    });
    setShowPassword(false); // Hide password initially
    setShowCreateAdminModal(true);
  };

  const handleEditAdmin = (admin: User) => {
    setEditingAdminUser(admin);
    setAdminFormData({
      full_name: admin.full_name || "",
      email: admin.email || "",
      phone: admin.phone || "",
      password: "", // Empty password for editing - admin will need to set new password
      preferred_language: admin.preferred_language || "en",
      branch_id: admin.branch_id || "",
    });
    setShowPassword(false); // Hide password initially
    setShowCreateAdminModal(true);
  };

  const handleAdminSuccess = () => {
    setShowCreateAdminModal(false);
    setEditingAdminUser(null);
    // Refresh admin data
    window.location.reload();
    customToast.success("Admin operation completed successfully");
  };

  // Client handlers
  const handleCreateClient = () => {
    setEditingClientUser(null);
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

  const handleEditClient = (client: any) => {
    setEditingClientUser(client);
    setClientFormData({
      full_name: client.full_name || "",
      email: client.email || "",
      phone: client.phone || "",
      password: "",
      preferred_language: client.preferred_language || "en",
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

  const handleClientSuccess = () => {
    setShowCreateClientModal(false);
    setEditingClientUser(null);
    // Refresh client data
    window.location.reload();
    customToast.success("Client operation completed successfully");
  };

  const handleDeleteDriver = async (driverId: string) => {
    try {
      await updateUserStatusMutation.mutateAsync({
        id: driverId,
        data: { is_active: false, reason: "Deleted by super admin" },
      });
      customToast.success("Driver deactivated successfully");
      refetchDrivers();
    } catch (error) {
      customToast.error("Failed to deactivate driver");
    }
  };

  const handleApproveDriver = async (driverId: string) => {
    try {
      await updateUserStatusMutation.mutateAsync({
        id: driverId,
        data: { is_active: true, reason: "Approved by super admin" },
      });
      customToast.success("Driver approved successfully");
      refetchDrivers();
    } catch (error) {
      customToast.error("Failed to approve driver");
    }
  };

  const handleCallDriver = (phone: string) => {
    window.open(`tel:${phone}`, "_self");
  };

  const handleViewClient = (client: any) => {
    setSelectedClient(client);
    setShowClientModal(true);
  };

  const handleViewAdmin = (admin: User) => {
    setSelectedAdmin(admin);
    setShowAdminDetailModal(true);
  };

  const handleEditAdminOld = (admin: User) => {
    setEditingAdmin(admin);
    setShowAdminModal(true);
  };

  // New modern modal handlers
  const handleAddUser = (userType: "admin" | "driver" | "client") => {
    setSelectedUserType(userType);
    setEditingUser(null);
    setShowAddUserModal(true);
  };

  const handleEditUser = (
    user: any,
    userType: "admin" | "driver" | "client"
  ) => {
    setSelectedUserType(userType);
    setEditingUser(user);
    setFormData({
      full_name: user.full_name || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "",
      preferred_language: user.preferred_language || "en",
      // Client fields
      company_name: user.company_name || "",
      business_type: user.business_type || "individual",
      tax_id: user.tax_id || "",
      address: user.address || "",
      city: user.city || "",
      country: user.country || "",
      postal_code: user.postal_code || "",
      contact_person: user.contact_person || "",
      credit_limit: user.credit_limit || 0,
      payment_terms: user.payment_terms || 30,
      // Driver fields
      license_number: user.license_number || "",
      license_expiry: user.license_expiry || "",
      license_type: user.license_type || "B",
      code_number: user.code_number || "",
      date_of_birth: user.date_of_birth || "",
      emergency_contact: user.emergency_contact || "",
      emergency_phone: user.emergency_phone || "",
      blood_type: user.blood_type || "",
      medical_certificate_expiry: user.medical_certificate_expiry || "",
      // General fields
      is_active: user.is_active || true,
    });
    setShowEditUserModal(true);
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAdminFormChange = (field: string, value: any) => {
    setAdminFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClientFormChange = (field: string, value: any) => {
    setClientFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      password: "",
      preferred_language: "en",
      // Client fields
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
      // Driver fields
      license_number: "",
      license_expiry: "",
      license_type: "B",
      code_number: "",
      date_of_birth: "",
      emergency_contact: "",
      emergency_phone: "",
      blood_type: "",
      medical_certificate_expiry: "",
      // General fields
      is_active: true,
    });
  };

  const handleCreateUser = async () => {
    try {
      const baseData = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        preferred_language: formData.preferred_language,
      };

      let result;
      if (selectedUserType === "admin") {
        result = await createAdminMutation.mutateAsync({
          ...baseData,
          branch_id: user?.branch_id || "",
        });
      } else if (selectedUserType === "driver") {
        result = await createDriverMutation.mutateAsync({
          ...baseData,
          license_number: formData.license_number,
          license_expiry: formData.license_expiry,
          license_type: formData.license_type,
          code_number: formData.code_number || "",
          date_of_birth: formData.date_of_birth,
          emergency_contact: formData.emergency_contact,
          emergency_phone: formData.emergency_phone,
          blood_type: formData.blood_type,
          medical_certificate_expiry: formData.medical_certificate_expiry,
        });
      } else if (selectedUserType === "client") {
        result = await createClientMutation.mutateAsync({
          ...baseData,
          company_name: formData.company_name,
          business_type: formData.business_type,
          tax_id: formData.tax_id,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          postal_code: formData.postal_code,
          contact_person: formData.contact_person,
          credit_limit: formData.credit_limit,
          payment_terms: formData.payment_terms,
        });
      }

      // Show success toast
      toast({
        title: t("userCreated"),
        description: t("userCreatedSuccess", {
          type: t(`.${selectedUserType}s`),
          name: formData.full_name,
        }),
      });

      setShowAddUserModal(false);
      resetForm();
    } catch (error: any) {
      console.error("Error creating user:", error);

      // Show error toast
      toast({
        title: t("userManagement.createUserError"),
        description:
          error?.response?.data?.error?.message ||
          error?.response?.data?.error?.message ||
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          t("userManagement.createUserErrorDesc"),
        variant: "destructive",
      });
    }
  };

  const handleCreateAdminUser = async () => {
    try {
      // Validate password length for create mode
      if (!editingAdminUser && adminFormData.password.length < 8) {
        customToast.error("Password must be at least 8 characters long");
        return;
      }

      // Validate password length for edit mode if provided
      if (
        editingAdminUser &&
        adminFormData.password &&
        adminFormData.password.length < 8
      ) {
        customToast.error("Password must be at least 8 characters long");
        return;
      }

      if (editingAdminUser) {
        // Update existing admin
        const updateData: any = {
          full_name: adminFormData.full_name,
          email: adminFormData.email,
          phone: adminFormData.phone,
          role: "admin",
          branch_id: adminFormData.branch_id,
          is_active: editingAdminUser.is_active,
          preferred_language: adminFormData.preferred_language,
        };

        // Only include password if it's provided
        if (adminFormData.password && adminFormData.password.trim() !== "") {
          updateData.password = adminFormData.password;
        }

        await updateAdminMutation.mutateAsync({
          adminId: editingAdminUser.id,
          data: updateData,
        });

        customToast.success("Admin updated successfully!");
      } else {
        // Create new admin
        await createAdminMutation.mutateAsync(adminFormData);

        customToast.success("Admin created successfully!");
      }

      handleAdminSuccess();
    } catch (error: any) {
      console.error("Admin operation error:", error);

      // Extract detailed error message
      const errorMessage = extractErrorMessage(error);

      customToast.error(
        `Failed to ${
          editingAdminUser ? "update" : "create"
        } admin: ${errorMessage}`
      );
    }
  };

  const handleCreateClientUser = async () => {
    try {
      if (editingClientUser) {
        // Update existing client
        await updateClientMutation.mutateAsync({
          clientId: editingClientUser.id,
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
            is_active: editingClientUser.is_active,
            preferred_language: clientFormData.preferred_language,
          },
        });

        customToast.success("Client updated successfully!");
      } else {
        // Create new client
        await createClientMutation.mutateAsync(clientFormData);

        customToast.success("Client created successfully!");
      }

      handleClientSuccess();
    } catch (error: any) {
      console.error("Client operation error:", error);

      // Extract detailed error message
      const errorMessage = extractErrorMessage(error);

      customToast.error(
        `Failed to ${
          editingClientUser ? "update" : "create"
        } client: ${errorMessage}`
      );
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      await updateUserStatusMutation.mutateAsync({
        id: editingUser.id,
        data: {
          is_active: formData.is_active,
          reason: formData.is_active
            ? "Account activated"
            : "Account deactivated",
        },
      });

      // Show success toast
      customToast.success(
        `User ${editingUser.full_name} status updated to ${
          formData.is_active ? "active" : "inactive"
        }`
      );

      setShowEditUserModal(false);
      resetForm();
    } catch (error: any) {
      console.error("Error updating user status:", error);

      // Extract detailed error message
      const errorMessage = extractErrorMessage(error);

      customToast.error(`Failed to update user status: ${errorMessage}`);
    }
  };

  const handleUpdateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await updateUserStatusMutation.mutateAsync({
        id: userId,
        data: {
          is_active: isActive,
          reason: isActive
            ? "User activated by super admin"
            : "User deactivated by super admin",
        },
      });

      // Show success toast
      customToast.success(
        `User status updated to ${isActive ? "active" : "inactive"}`
      );
    } catch (error: any) {
      console.error("Error updating user status:", error);

      // Extract detailed error message
      const errorMessage = extractErrorMessage(error);

      customToast.error(`Failed to update user status: ${errorMessage}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-600";
      case "inactive":
        return "bg-red-100 text-red-600";
      case "pending":
        return "bg-yellow-100 text-yellow-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("rw-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const tabs = [
    {
      value: "admins",
      label: t("userManagement.admins"),
      count: admins.length,
    },
    {
      value: "drivers",
      label: t("userManagement.drivers"),
      count: drivers.length,
    },
    {
      value: "clients",
      label: t("userManagement.clients"),
      count: clients.length,
    },
  ];

  // Filter data based on search term
  const filteredAdmins = admins.filter(
    (admin: User) =>
      (admin.full_name?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) || (admin.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const filteredDrivers = drivers.filter(
    (driver: Driver) =>
      (driver.full_name?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (driver.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const filteredClients = clients.filter(
    (client: any) =>
      (client.full_name?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (client.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (client.company_name &&
        client.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination logic
  const getPaginatedData = (
    data: any[],
    currentPage: number,
    itemsPerPage: number
  ) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (data: any[], itemsPerPage: number) => {
    return Math.ceil(data.length / itemsPerPage);
  };

  // Paginated data
  const paginatedAdmins = getPaginatedData(
    filteredAdmins,
    currentPage,
    itemsPerPage
  );
  const paginatedDrivers = getPaginatedData(
    filteredDrivers,
    currentDriverPage,
    itemsPerPage
  );
  const paginatedClients = getPaginatedData(
    filteredClients,
    currentClientPage,
    itemsPerPage
  );

  // Total pages
  const totalAdminPages = getTotalPages(filteredAdmins, itemsPerPage);
  const totalDriverPages = getTotalPages(filteredDrivers, itemsPerPage);
  const totalClientPages = getTotalPages(filteredClients, itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-heading">
            {t("userManagement.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("userManagement.subtitle")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {t("common.filters")}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              // Refresh all data
              window.location.reload();
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t("common.refresh")}
          </Button>
          {activeTab === "drivers" && (
            <Button onClick={handleCreateDriver}>
              <Plus className="w-4 h-4 mr-2" />
              {t("addDriver")}
            </Button>
          )}
          {activeTab === "admins" && (
            <Button onClick={handleCreateAdmin}>
              <Plus className="w-4 h-4 mr-2" />
              {t("addAdmin")}
            </Button>
          )}
          {activeTab === "clients" && (
            <Button onClick={handleCreateClient}>
              <Plus className="w-4 h-4 mr-2" />
              {t("addClient")}
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={t("userManagement.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {t("common.filters")}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  {t("common.branch")}
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                >
                  <option value="">{t("common.allBranches")}</option>
                  {branchesData?.branches?.map((branch: any) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  {t("common.status")}
                </label>
                <select className="w-full p-2 border border-gray-300 rounded-lg">
                  <option value="">{t("common.allStatuses")}</option>
                  <option value="active">{t("common.active")}</option>
                  <option value="inactive">{t("common.inactive")}</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  {t("common.verified")}
                </label>
                <select className="w-full p-2 border border-gray-300 rounded-lg">
                  <option value="">{t("common.all")}</option>
                  <option value="verified">{t("common.verified")}</option>
                  <option value="pending">{t("common.pending")}</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => {
                  setSelectedBranchId("");
                  setShowFilters(false);
                }}
                variant="outline"
              >
                {t("common.clearFilters")}
              </Button>
              <Button onClick={() => setShowFilters(false)}>
                {t("common.applyFilters")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom Tabs */}
      <CustomTabs value={activeTab} onValueChange={setActiveTab} tabs={tabs} />

      {/* Tab Content */}
      {activeTab === "admins" && (
        <div className="mt-6">
          <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t("userManagement.adminUsers")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isAdminsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">
                    {t("common.loading")}...
                  </span>
                </div>
              ) : adminsError ? (
                <div className="text-center py-8">
                  <p className="text-red-600">
                    {t("common.error")}:{" "}
                    {adminsError.message || t("common.loadError")}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs font-medium text-gray-600">
                          #
                        </TableHead>
                        <TableHead className="text-xs font-medium text-gray-600">
                          {t("common.avatar")}
                        </TableHead>
                        <TableHead className="text-xs font-medium text-gray-600">
                          {t("common.name")}
                        </TableHead>
                        <TableHead className="text-xs font-medium text-gray-600">
                          {t("common.email")}
                        </TableHead>
                        <TableHead className="text-xs font-medium text-gray-600">
                          {t("common.phone")}
                        </TableHead>
                        <TableHead className="text-xs font-medium text-gray-600">
                          {t("common.verified")}
                        </TableHead>
                        <TableHead className="text-xs font-medium text-gray-600">
                          {t("common.branch")}
                        </TableHead>
                        <TableHead className="text-xs font-medium text-gray-600">
                          {t("common.status")}
                        </TableHead>
                        <TableHead className="text-xs font-medium text-gray-600">
                          {t("common.lastLogin")}
                        </TableHead>
                        <TableHead className="text-xs font-medium text-gray-600">
                          {t("common.actions")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAdmins.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={10}
                            className="text-center py-8 text-muted-foreground"
                          >
                            {t("userManagement.noAdminsFound")}
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedAdmins.map((admin: User, index: number) => (
                          <TableRow
                            key={admin.id}
                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => handleViewAdmin(admin)}
                          >
                            <TableCell className="text-xs text-gray-500">
                              {index + 1}
                            </TableCell>
                            <TableCell>
                              <div className="w-8 h-8 rounded-full overflow-hidden">
                                {admin.avatar_url ? (
                                  <img
                                    src={admin.avatar_url}
                                    alt={admin.full_name || "User"}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                                    {admin.full_name?.charAt(0) || "?"}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium text-sm">
                              {admin.full_name || "-"}
                            </TableCell>
                            <TableCell className="text-sm">
                              {admin.email || "-"}
                            </TableCell>
                            <TableCell className="text-sm">
                              {admin.phone || "-"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  admin.is_verified
                                    ? "bg-green-100 text-green-600"
                                    : "bg-yellow-100 text-yellow-600"
                                }
                              >
                                {admin.is_verified
                                  ? t("common.verified")
                                  : t("common.pending")}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {admin.branch?.name || "-"}
                            </TableCell>
                            <TableCell>
                              <label
                                className="flex items-center cursor-pointer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="checkbox"
                                  className="sr-only"
                                  checked={admin.is_active}
                                  onChange={() =>
                                    handleUpdateUserStatus(
                                      admin.id,
                                      !admin.is_active
                                    )
                                  }
                                  disabled={updateUserStatusMutation.isPending}
                                />
                                <div
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    admin.is_active
                                      ? "bg-green-500"
                                      : "bg-gray-300"
                                  }`}
                                >
                                  <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                      admin.is_active
                                        ? "translate-x-6"
                                        : "translate-x-1"
                                    }`}
                                  />
                                </div>
                                <span className="ml-2 text-sm text-gray-700">
                                  {admin.is_active
                                    ? t("common.active")
                                    : t("common.inactive")}
                                </span>
                              </label>
                            </TableCell>
                            <TableCell className="text-sm">
                              {admin.last_login
                                ? new Date(
                                    admin.last_login
                                  ).toLocaleDateString()
                                : "-"}
                            </TableCell>
                            <TableCell>
                              <div
                                className="flex gap-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditAdmin(admin)}
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
              )}
            </CardContent>
          </Card>

          {/* Admin Pagination */}
          <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredAdmins.length)}{" "}
                  of {filteredAdmins.length} admins
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalAdminPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(prev + 1, totalAdminPages)
                      )
                    }
                    disabled={currentPage === totalAdminPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "drivers" && (
        <div className="mt-6">
          {isDriversLoading ? (
            <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
              <CardContent className="p-8">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">
                    {t("common.loading")}...
                  </span>
                </div>
              </CardContent>
            </Card>
          ) : driversError ? (
            <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
              <CardContent className="p-8">
                <div className="text-center">
                  <p className="text-red-600">
                    {t("common.error")}:{" "}
                    {driversError.message || t("common.loadError")}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <DriverTable
                drivers={paginatedDrivers}
                title="Drivers"
                showSearch={false}
                showFilters={false}
                showPagination={false}
                onViewDetails={handleViewDriver}
                onEditDriver={handleEditDriver}
                onDeleteDriver={handleDeleteDriver}
                onActivateDriver={handleApproveDriver}
                onCallDriver={handleCallDriver}
              />

              {/* Driver Pagination */}
              <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing {(currentDriverPage - 1) * itemsPerPage + 1} to{" "}
                      {Math.min(
                        currentDriverPage * itemsPerPage,
                        filteredDrivers.length
                      )}{" "}
                      of {filteredDrivers.length} drivers
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentDriverPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentDriverPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-gray-600">
                        Page {currentDriverPage} of {totalDriverPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentDriverPage((prev) =>
                            Math.min(prev + 1, totalDriverPages)
                          )
                        }
                        disabled={currentDriverPage === totalDriverPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {activeTab === "clients" && (
        <div className="mt-6">
          {isClientsLoading ? (
            <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
              <CardContent className="p-8">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">
                    {t("common.loading")}...
                  </span>
                </div>
              </CardContent>
            </Card>
          ) : clientsError ? (
            <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
              <CardContent className="p-8">
                <div className="text-center">
                  <p className="text-red-600">
                    {t("common.error")}:{" "}
                    {clientsError.message || t("common.loadError")}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <ClientTable
                clients={paginatedClients as any}
                onViewDetails={handleViewClient}
                onEditClient={handleEditClient}
              />

              {/* Client Pagination */}
              <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing {(currentClientPage - 1) * itemsPerPage + 1} to{" "}
                      {Math.min(
                        currentClientPage * itemsPerPage,
                        filteredClients.length
                      )}{" "}
                      of {filteredClients.length} clients
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentClientPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentClientPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-gray-600">
                        Page {currentClientPage} of {totalClientPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentClientPage((prev) =>
                            Math.min(prev + 1, totalClientPages)
                          )
                        }
                        disabled={currentClientPage === totalClientPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Driver Detail Modal */}
      {selectedDriver && (
        <DriverDetailModal
          driver={selectedDriver}
          isOpen={showDriverModal}
          onClose={() => {
            setShowDriverModal(false);
            setSelectedDriver(null);
          }}
          onCallDriver={handleCallDriver}
          onEditDriver={handleEditDriver}
        />
      )}

      {/* Create/Edit Driver Modal */}
      <CreateDriverModal
        isOpen={showCreateDriverModal}
        onClose={() => {
          setShowCreateDriverModal(false);
          setEditingDriver(null);
        }}
        onSuccess={handleDriverSuccess}
        editingDriver={editingDriver}
      />

      {/* Create/Edit Admin Modal */}
      <ModernModel
        isOpen={showCreateAdminModal}
        onClose={() => {
          setShowCreateAdminModal(false);
          setEditingAdminUser(null);
        }}
        title={editingAdminUser ? "Edit Admin" : "Create New Admin"}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="admin_full_name">Full Name *</Label>
              <Input
                id="admin_full_name"
                value={adminFormData.full_name}
                onChange={(e) =>
                  handleAdminFormChange("full_name", e.target.value)
                }
                placeholder="Enter full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin_email">Email *</Label>
              <Input
                id="admin_email"
                type="email"
                value={adminFormData.email}
                onChange={(e) => handleAdminFormChange("email", e.target.value)}
                placeholder="admin@lovelycargo.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="admin_phone">Phone *</Label>
              <Input
                id="admin_phone"
                value={adminFormData.phone}
                onChange={(e) => handleAdminFormChange("phone", e.target.value)}
                placeholder="+250 788 123 456"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin_password">
                Password {!editingAdminUser ? "*" : ""}
              </Label>
              {!editingAdminUser ? (
                // Create mode - auto-generated password
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="admin_password"
                      type={showPassword ? "text" : "password"}
                      value={adminFormData.password}
                      disabled
                      placeholder="Auto-generated password"
                      className="pr-20"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newPassword = generatePassword();
                      setAdminFormData((prev) => ({
                        ...prev,
                        password: newPassword,
                      }));
                      setShowPassword(true);
                    }}
                    className="px-3"
                  >
                    <RefreshCcw className="h-4 w-4 mr-1" />
                    Regenerate
                  </Button>
                </div>
              ) : (
                // Edit mode - manual password input
                <div className="relative">
                  <Input
                    id="admin_password"
                    type={showPassword ? "text" : "password"}
                    value={adminFormData.password}
                    onChange={(e) =>
                      handleAdminFormChange("password", e.target.value)
                    }
                    placeholder="Enter new password (min 8 chars)"
                    className="pr-20"
                    required={!editingAdminUser}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
              <p className="text-xs text-gray-500">
                {!editingAdminUser
                  ? "Password is auto-generated (8 characters). Click 'Regenerate' to create a new one."
                  : "Leave empty to keep current password, or enter a new password (minimum 8 characters)."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="admin_language">Preferred Language</Label>
              <Select
                value={adminFormData.preferred_language}
                onValueChange={(value: "en" | "rw" | "fr") =>
                  handleAdminFormChange("preferred_language", value)
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
            <div className="space-y-2">
              <Label htmlFor="admin_branch">Branch *</Label>
              <Select
                value={adminFormData.branch_id}
                onValueChange={(value) =>
                  handleAdminFormChange("branch_id", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branchesData?.branches?.map((branch: any) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleCreateAdminUser}
              className="flex-1"
              disabled={
                createAdminMutation.isPending || updateAdminMutation.isPending
              }
            >
              {createAdminMutation.isPending || updateAdminMutation.isPending
                ? "Processing..."
                : editingAdminUser
                ? "Update Admin"
                : "Create Admin"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateAdminModal(false);
                setEditingAdminUser(null);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </ModernModel>

      {/* Create/Edit Client Modal */}
      <ModernModel
        isOpen={showCreateClientModal}
        onClose={() => {
          setShowCreateClientModal(false);
          setEditingClientUser(null);
        }}
        title={editingClientUser ? "Edit Client" : "Create New Client"}
      >
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client_full_name">Full Name *</Label>
                <Input
                  id="client_full_name"
                  value={clientFormData.full_name}
                  onChange={(e) =>
                    handleClientFormChange("full_name", e.target.value)
                  }
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client_email">Email *</Label>
                <Input
                  id="client_email"
                  type="email"
                  value={clientFormData.email}
                  onChange={(e) =>
                    handleClientFormChange("email", e.target.value)
                  }
                  placeholder="client@example.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client_phone">Phone *</Label>
                <Input
                  id="client_phone"
                  value={clientFormData.phone}
                  onChange={(e) =>
                    handleClientFormChange("phone", e.target.value)
                  }
                  placeholder="+250 788 123 456"
                  required
                />
              </div>
              {!editingClientUser && (
                <div className="space-y-2">
                  <Label htmlFor="client_password">Password *</Label>
                  <Input
                    id="client_password"
                    type="password"
                    value={clientFormData.password}
                    onChange={(e) =>
                      handleClientFormChange("password", e.target.value)
                    }
                    placeholder="Enter password (min 6 chars)"
                    required
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_language">Preferred Language</Label>
              <Select
                value={clientFormData.preferred_language}
                onValueChange={(value: "en" | "rw" | "fr") =>
                  handleClientFormChange("preferred_language", value)
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

          {/* Business Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Business Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client_company">Company Name</Label>
                <Input
                  id="client_company"
                  value={clientFormData.company_name}
                  onChange={(e) =>
                    handleClientFormChange("company_name", e.target.value)
                  }
                  placeholder="Enter company name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client_business_type">Business Type</Label>
                <Select
                  value={clientFormData.business_type}
                  onValueChange={(
                    value: "individual" | "corporate" | "government"
                  ) => handleClientFormChange("business_type", value)}
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client_tax_id">Tax ID</Label>
                <Input
                  id="client_tax_id"
                  value={clientFormData.tax_id}
                  onChange={(e) =>
                    handleClientFormChange("tax_id", e.target.value)
                  }
                  placeholder="TAX001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client_contact">Contact Person</Label>
                <Input
                  id="client_contact"
                  value={clientFormData.contact_person}
                  onChange={(e) =>
                    handleClientFormChange("contact_person", e.target.value)
                  }
                  placeholder="Enter contact person name"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Address Information
            </h3>
            <div className="space-y-2">
              <Label htmlFor="client_address">Address</Label>
              <Input
                id="client_address"
                value={clientFormData.address}
                onChange={(e) =>
                  handleClientFormChange("address", e.target.value)
                }
                placeholder="KN 4 Ave, Kigali"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client_city">City</Label>
                <Input
                  id="client_city"
                  value={clientFormData.city}
                  onChange={(e) =>
                    handleClientFormChange("city", e.target.value)
                  }
                  placeholder="Kigali"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client_country">Country</Label>
                <Input
                  id="client_country"
                  value={clientFormData.country}
                  onChange={(e) =>
                    handleClientFormChange("country", e.target.value)
                  }
                  placeholder="Rwanda"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client_postal">Postal Code</Label>
                <Input
                  id="client_postal"
                  value={clientFormData.postal_code}
                  onChange={(e) =>
                    handleClientFormChange("postal_code", e.target.value)
                  }
                  placeholder="250"
                />
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Financial Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client_credit">Credit Limit (RWF)</Label>
                <Input
                  id="client_credit"
                  type="number"
                  value={clientFormData.credit_limit}
                  onChange={(e) =>
                    handleClientFormChange(
                      "credit_limit",
                      parseInt(e.target.value) || 0
                    )
                  }
                  placeholder="50000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client_payment">Payment Terms (days)</Label>
                <Input
                  id="client_payment"
                  type="number"
                  value={clientFormData.payment_terms}
                  onChange={(e) =>
                    handleClientFormChange(
                      "payment_terms",
                      parseInt(e.target.value) || 30
                    )
                  }
                  placeholder="30"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleCreateClientUser}
              className="flex-1"
              disabled={
                createClientMutation.isPending || updateClientMutation.isPending
              }
            >
              {createClientMutation.isPending || updateClientMutation.isPending
                ? "Processing..."
                : editingClientUser
                ? "Update Client"
                : "Create Client"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateClientModal(false);
                setEditingClientUser(null);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </ModernModel>

      {/* Client Detail Modal */}
      {selectedClient && (
        <ClientDetailModal
          client={selectedClient as any}
          isOpen={showClientModal}
          onClose={() => setShowClientModal(false)}
        />
      )}

      {/* Admin Detail Modal */}
      {selectedAdmin && (
        <UserDetailModal
          isOpen={showAdminDetailModal}
          onClose={() => setShowAdminDetailModal(false)}
          user={selectedAdmin}
        />
      )}

      {/* Admin Edit Modal */}
      <Modal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        title={
          editingAdmin
            ? t("userManagement.editAdmin")
            : t("userManagement.addNewAdmin")
        }
        widthSizeClass={ModalSize.medium}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("common.name")}</label>
              <Input
                placeholder={t("userManagement.fullNamePlaceholder")}
                defaultValue={editingAdmin?.full_name || ""}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("common.email")}</label>
              <Input
                type="email"
                placeholder="email@lovelycargo.rw"
                defaultValue={editingAdmin?.email || ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("common.phone")}</label>
              <Input
                placeholder="+250 788 123 456"
                defaultValue={editingAdmin?.phone || ""}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("common.language")}
              </label>
              <select className="w-full p-2 border rounded-md">
                <option value="en">{t("common.english")}</option>
                <option value="rw">{t("common.kinyarwanda")}</option>
                <option value="fr">{t("common.french")}</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("userManagement.permissions")}
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked />
                <span className="text-sm">
                  {t("userManagement.manageUsers")}
                </span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked />
                <span className="text-sm">
                  {t("userManagement.manageCargos")}
                </span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked />
                <span className="text-sm">
                  {t("userManagement.viewReports")}
                </span>
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button className="flex-1">
              {editingAdmin
                ? t("userManagement.updateAdmin")
                : t("userManagement.createAdmin")}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAdminModal(false)}
              className="flex-1"
            >
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modern Add User Modal */}
      <ModernModel
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        title={t("userManagement.addUser")}
      >
        <div className="space-y-6">
          {/* User Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              {t("userManagement.userType")}
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setSelectedUserType("admin")}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedUserType === "admin"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Shield className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm font-medium">
                  {t("userManagement.admins")}
                </span>
              </button>
              <button
                onClick={() => setSelectedUserType("driver")}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedUserType === "driver"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Users className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm font-medium">
                  {t("userManagement.drivers")}
                </span>
              </button>
              <button
                onClick={() => setSelectedUserType("client")}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedUserType === "client"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Users className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm font-medium">
                  {t("userManagement.clients")}
                </span>
              </button>
            </div>
          </div>

          {/* User Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {t("common.fullName")} *
                </label>
                <Input
                  placeholder={t("userManagement.fullNamePlaceholder")}
                  value={formData.full_name}
                  onChange={(e) =>
                    handleFormChange("full_name", e.target.value)
                  }
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {t("common.email")} *
                </label>
                <Input
                  type="email"
                  placeholder="email@lovelycargo.rw"
                  value={formData.email}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {t("common.phone")} *
                </label>
                <Input
                  placeholder="+250 788 123 456"
                  value={formData.phone}
                  onChange={(e) => handleFormChange("phone", e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {t("common.password")} *
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleFormChange("password", e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {t("common.preferredLanguage")}
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  value={formData.preferred_language}
                  onChange={(e) =>
                    handleFormChange("preferred_language", e.target.value)
                  }
                >
                  <option value="en">{t("common.english")}</option>
                  <option value="rw">{t("common.kinyarwanda")}</option>
                  <option value="fr">{t("common.french")}</option>
                </select>
              </div>
            </div>

            {/* Additional fields based on user type */}
            {selectedUserType === "client" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {t("client.companyName")}
                    </label>
                    <Input
                      placeholder={t("client.enterCompanyName")}
                      value={formData.company_name}
                      onChange={(e) =>
                        handleFormChange("company_name", e.target.value)
                      }
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {t("client.businessType")}
                    </label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      value={formData.business_type}
                      onChange={(e) =>
                        handleFormChange("business_type", e.target.value)
                      }
                    >
                      <option value="individual">
                        {t("client.individual")}
                      </option>
                      <option value="corporate">{t("client.corporate")}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {t("client.taxId")}
                    </label>
                    <Input
                      placeholder="TAX001"
                      value={formData.tax_id}
                      onChange={(e) =>
                        handleFormChange("tax_id", e.target.value)
                      }
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {t("client.contactPerson")}
                    </label>
                    <Input
                      placeholder={t("client.contactPerson")}
                      value={formData.contact_person}
                      onChange={(e) =>
                        handleFormChange("contact_person", e.target.value)
                      }
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t("client.address")}
                  </label>
                  <Input
                    placeholder="KN 4 Ave, Kigali"
                    value={formData.address}
                    onChange={(e) =>
                      handleFormChange("address", e.target.value)
                    }
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {t("client.city")}
                    </label>
                    <Input
                      placeholder="Kigali"
                      value={formData.city}
                      onChange={(e) => handleFormChange("city", e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {t("client.country")}
                    </label>
                    <Input
                      placeholder="Rwanda"
                      value={formData.country}
                      onChange={(e) =>
                        handleFormChange("country", e.target.value)
                      }
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {t("client.postalCode")}
                    </label>
                    <Input
                      placeholder="250"
                      value={formData.postal_code}
                      onChange={(e) =>
                        handleFormChange("postal_code", e.target.value)
                      }
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {t("client.creditLimit")}
                    </label>
                    <Input
                      type="number"
                      placeholder="50000"
                      value={formData.credit_limit}
                      onChange={(e) =>
                        handleFormChange(
                          "credit_limit",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {t("client.paymentTerms")} (days)
                    </label>
                    <Input
                      type="number"
                      placeholder="30"
                      value={formData.payment_terms}
                      onChange={(e) =>
                        handleFormChange(
                          "payment_terms",
                          parseInt(e.target.value) || 30
                        )
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedUserType === "driver" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {t("driver.licenseNumber")}
                    </label>
                    <Input
                      placeholder={t("driver.enterLicenseNumber")}
                      value={formData.license_number}
                      onChange={(e) =>
                        handleFormChange("license_number", e.target.value)
                      }
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {t("driver.licenseType")}
                    </label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      value={formData.license_type}
                      onChange={(e) =>
                        handleFormChange("license_type", e.target.value)
                      }
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {t("driver.licenseExpiry")}
                    </label>
                    <Input
                      type="date"
                      value={formData.license_expiry}
                      onChange={(e) =>
                        handleFormChange("license_expiry", e.target.value)
                      }
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {t("driver.dateOfBirth")}
                    </label>
                    <Input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) =>
                        handleFormChange("date_of_birth", e.target.value)
                      }
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {t("driver.emergencyContact")}
                    </label>
                    <Input
                      placeholder={t("driver.emergencyContact")}
                      value={formData.emergency_contact}
                      onChange={(e) =>
                        handleFormChange("emergency_contact", e.target.value)
                      }
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {t("driver.emergencyPhone")}
                    </label>
                    <Input
                      placeholder="+250 788 123 456"
                      value={formData.emergency_phone}
                      onChange={(e) =>
                        handleFormChange("emergency_phone", e.target.value)
                      }
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {t("driver.bloodType")}
                    </label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      value={formData.blood_type}
                      onChange={(e) =>
                        handleFormChange("blood_type", e.target.value)
                      }
                    >
                      <option value="">Select Blood Type</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {t("driver.medicalCertificateExpiry")}
                    </label>
                    <Input
                      type="date"
                      value={formData.medical_certificate_expiry}
                      onChange={(e) =>
                        handleFormChange(
                          "medical_certificate_expiry",
                          e.target.value
                        )
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              className="flex-1"
              onClick={handleCreateUser}
              disabled={
                createAdminMutation.isPending ||
                createDriverMutation.isPending ||
                createClientMutation.isPending
              }
            >
              {createAdminMutation.isPending ||
              createDriverMutation.isPending ||
              createClientMutation.isPending
                ? t("common.loading")
                : t("userManagement.createUser")}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAddUserModal(false)}
              className="flex-1"
            >
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      </ModernModel>

      {/* Modern Edit User Modal */}
      <ModernModel
        isOpen={showEditUserModal}
        onClose={() => setShowEditUserModal(false)}
        title={t("userManagement.editUser")}
      >
        <div className="space-y-6">
          {/* User Info Display */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {editingUser?.full_name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">{t("common.email")}:</span>{" "}
                {editingUser?.email}
              </div>
              <div>
                <span className="font-medium">{t("common.phone")}:</span>{" "}
                {editingUser?.phone}
              </div>
              <div>
                <span className="font-medium">
                  {t("userManagement.userType")}:
                </span>{" "}
                {t(`userManagement.${selectedUserType}s`)}
              </div>
              <div>
                <span className="font-medium">{t("common.status")}:</span>
                <span
                  className={`ml-1 px-2 py-1 rounded-full text-xs ${
                    editingUser?.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {editingUser?.is_active
                    ? t("common.active")
                    : t("common.inactive")}
                </span>
              </div>
            </div>
          </div>

          {/* Status Update Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {t("common.status")} *
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={formData.is_active ? "active" : "inactive"}
                onChange={(e) =>
                  handleFormChange("is_active", e.target.value === "active")
                }
              >
                <option value="active">{t("common.active")}</option>
                <option value="inactive">{t("common.inactive")}</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              className="flex-1"
              onClick={handleUpdateUser}
              disabled={updateUserStatusMutation.isPending}
            >
              {updateUserStatusMutation.isPending
                ? t("common.loading")
                : t("userManagement.updateUser")}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowEditUserModal(false)}
              className="flex-1"
            >
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      </ModernModel>
    </div>
  );
}
