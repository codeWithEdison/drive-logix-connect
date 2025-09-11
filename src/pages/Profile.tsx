import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  useUserProfile,
  useUpdateProfile,
  useChangePassword,
} from "@/lib/api/hooks/userHooks";
import {
  useClientProfile,
  useUpdateClientProfile,
} from "@/lib/api/hooks/clientHooks";
import {
  useDriverProfile,
  useUpdateDriverProfile,
} from "@/lib/api/hooks/driverHooks";
import { useUploadFile } from "@/lib/api/hooks/utilityHooks";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Settings,
  Edit3,
  Shield,
  Truck,
  Building2,
  Mail,
  Phone,
  Calendar,
  FileText,
  Clock,
  CreditCard,
  MapPin,
  Briefcase,
} from "lucide-react";
import { Driver, Client, BusinessType } from "@/types/shared";

export function ProfilePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "profile"
  );
  const [isEditing, setIsEditing] = useState(false);

  // API hooks - use role-specific hooks
  const { data: userProfile, isLoading: userProfileLoading } = useUserProfile();
  const { data: clientProfile, isLoading: clientProfileLoading } =
    useClientProfile();
  const { data: driverProfile, isLoading: driverProfileLoading } =
    useDriverProfile();

  const updateProfileMutation = useUpdateProfile();
  const updateClientProfileMutation = useUpdateClientProfile();
  const updateDriverProfileMutation = useUpdateDriverProfile();
  const changePasswordMutation = useChangePassword();
  const uploadFileMutation = useUploadFile();

  // Get the appropriate profile based on role
  // For clients, we need to combine userProfile (basic info) with clientProfile.client (client-specific info)
  const profile = useMemo(() => {
    if (user?.role === "client") {
      return {
        ...userProfile,
        ...((clientProfile as any)?.client || {}), // Extract client-specific data from nested client object
      };
    } else if (user?.role === "driver") {
      return {
        ...userProfile,
        ...((driverProfile as any)?.driver || {}), // Extract driver-specific data from nested driver object
      };
    }
    return userProfile;
  }, [user?.role, userProfile, clientProfile, driverProfile]);

  const isLoading = useMemo(() => {
    if (user?.role === "client") {
      return userProfileLoading || clientProfileLoading;
    } else if (user?.role === "driver") {
      return userProfileLoading || driverProfileLoading;
    }
    return userProfileLoading;
  }, [
    user?.role,
    userProfileLoading,
    clientProfileLoading,
    driverProfileLoading,
  ]);

  // Form states
  const [profileForm, setProfileForm] = useState({
    full_name: profile?.full_name || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    preferred_language: profile?.preferred_language || "en",
    avatar_url: profile?.avatar_url || "",
    // Client specific fields
    address: (profile as Client)?.address || "",
    business_type: (profile as Client)?.business_type || "",
    company_name: (profile as Client)?.company_name || "",
    // Driver specific fields
    license_number: (profile as Driver)?.license_number || "",
    license_type: (profile as Driver)?.license_type || "",
    date_of_birth: (profile as Driver)?.date_of_birth || "",
    emergency_contact: (profile as Driver)?.emergency_contact || "",
    emergency_phone: (profile as Driver)?.emergency_phone || "",
    blood_type: (profile as Driver)?.blood_type || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Update form when profile data changes
  useEffect(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        preferred_language: profile.preferred_language || "en",
        avatar_url: profile.avatar_url || "",
        // Client specific fields - from clientProfile
        address: (profile as Client)?.address || "",
        business_type: (profile as Client)?.business_type || "",
        company_name: (profile as Client)?.company_name || "",
        // Driver specific fields - from driverProfile
        license_number: (profile as Driver)?.license_number || "",
        license_type: (profile as Driver)?.license_type || "",
        date_of_birth: (profile as Driver)?.date_of_birth || "",
        emergency_contact: (profile as Driver)?.emergency_contact || "",
        emergency_phone: (profile as Driver)?.emergency_phone || "",
        blood_type: (profile as Driver)?.blood_type || "",
      });
    }
  }, [profile, user?.role, userProfile, clientProfile, driverProfile]);

  // Update URL when tab changes
  useEffect(() => {
    setSearchParams({ tab: activeTab });
  }, [activeTab, setSearchParams]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (selectedFile) {
        URL.revokeObjectURL(URL.createObjectURL(selectedFile));
      }
    };
  }, [selectedFile]);

  // Handle file upload for avatar
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadResult = await uploadFileMutation.mutateAsync({
        file,
        type: "image",
        category: "profile",
      });

      // Update profile with new avatar URL
      await updateProfileMutation.mutateAsync({
        avatar_url: uploadResult.data.file_url,
      });

      toast({
        title: t("profile.updateSuccess"),
        description: t("profile.updateSuccessMessage"),
      });
    } catch (error) {
      toast({
        title: t("profile.updateError"),
        description: "Failed to upload avatar",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Clean up previous object URL if exists
      if (selectedFile) {
        URL.revokeObjectURL(URL.createObjectURL(selectedFile));
      }
      setSelectedFile(file);
      handleFileUpload(file);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      // For the first tab (basic profile), always use the users/profile endpoint
      if (activeTab === "profile") {
        const userData: any = {
          full_name: profileForm.full_name,
          phone: profileForm.phone,
          preferred_language: profileForm.preferred_language as any,
        };

        // Only include avatar_url if it's not empty
        if (profileForm.avatar_url && profileForm.avatar_url.trim() !== "") {
          userData.avatar_url = profileForm.avatar_url;
        }

        await updateProfileMutation.mutateAsync(userData);
      } else if (activeTab === "details") {
        // For details tab, use role-specific endpoints
        if (user?.role === "client") {
          const clientData = {
            company_name: profileForm.company_name,
            business_type: profileForm.business_type as any,
            address: profileForm.address,
          };
          await updateClientProfileMutation.mutateAsync(clientData);
        } else if (user?.role === "driver") {
          const driverData = {
            license_number: profileForm.license_number,
            license_type: profileForm.license_type as any,
            date_of_birth: profileForm.date_of_birth,
            emergency_contact: profileForm.emergency_contact,
            emergency_phone: profileForm.emergency_phone,
            blood_type: profileForm.blood_type,
          };
          await updateDriverProfileMutation.mutateAsync(driverData);
        }
      }

      toast({
        title: t("profile.updateSuccess"),
        description: t("profile.updateSuccessMessage"),
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("profile.updateError"),
        variant: "destructive",
      });
    }
  };

  const getIsLoading = () => {
    if (activeTab === "profile")
      return updateProfileMutation.isPending || isUploading;
    if (activeTab === "details" && user?.role === "client")
      return updateClientProfileMutation.isPending;
    if (activeTab === "details" && user?.role === "driver")
      return updateDriverProfileMutation.isPending;
    return false;
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: t("common.error"),
        description: t("profile.passwordMismatch"),
        variant: "destructive",
      });
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast({
        title: t("profile.passwordChangeSuccess"),
        description: t("profile.passwordChangeSuccessMessage"),
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("profile.passwordChangeError"),
        variant: "destructive",
      });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "client":
        return "hsl(var(--primary))";
      case "driver":
        return "hsl(var(--success))";
      case "admin":
        return "hsl(var(--info))";
      case "super_admin":
        return "hsl(var(--accent))";
      default:
        return "hsl(var(--primary))";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "client":
        return <Building2 className="h-5 w-5" />;
      case "driver":
        return <Truck className="h-5 w-5" />;
      case "admin":
        return <Shield className="h-5 w-5" />;
      case "super_admin":
        return <Shield className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDriverStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "on_duty":
        return "bg-blue-100 text-blue-800";
      case "unavailable":
        return "bg-red-100 text-red-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!user) return null;

  const tabs = [
    { id: "profile", label: t("profile.profile"), icon: User },
    { id: "details", label: t("profile.details"), icon: FileText },
    { id: "settings", label: t("profile.settings"), icon: Settings },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="h-16 w-16">
            {selectedFile ? (
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Profile preview"
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : profileForm.avatar_url ? (
              <img
                src={profileForm.avatar_url}
                alt="Profile"
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <AvatarFallback
                style={{ backgroundColor: getRoleColor(user.role) }}
                className="text-white font-bold text-2xl"
              >
                {user.full_name.charAt(0)}
              </AvatarFallback>
            )}
          </Avatar>
          {isEditing && (
            <div className="absolute -bottom-1 -right-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="avatar-upload"
                disabled={isUploading}
              />
              <label
                htmlFor="avatar-upload"
                className={`bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 cursor-pointer transition-colors shadow-lg border-2 border-white ${
                  isUploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                title={isUploading ? "Uploading..." : "Upload avatar"}
              >
                {isUploading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Edit3 className="h-4 w-4" />
                )}
              </label>
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user.full_name}</h1>
          <div className="flex items-center gap-2 mt-1">
            {getRoleIcon(user.role)}
            <span className="text-gray-600 capitalize">
              {user.role?.replace("_", " ")}
            </span>
            <Badge
              variant="secondary"
              className={getStatusColor(user.is_active ? "active" : "pending")}
            >
              {user.is_active ? t("common.active") : t("common.pending")}
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs with underline styling */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {t("profile.basicInfo")}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  {isEditing ? t("common.cancel") : t("common.edit")}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">{t("profile.fullName")}</Label>
                  <Input
                    id="full_name"
                    value={profileForm.full_name}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        full_name: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("profile.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    disabled={true}
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("profile.phone")}</Label>
                  <Input
                    id="phone"
                    value={profileForm.phone}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferred_language">
                    {t("profile.preferredLanguage")}
                  </Label>
                  <select
                    id="preferred_language"
                    value={profileForm.preferred_language}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        preferred_language: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="rw">Kinyarwanda</option>
                  </select>
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleProfileUpdate}
                    disabled={getIsLoading()}
                  >
                    {getIsLoading() ? t("common.loading") : t("common.save")}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    {t("common.cancel")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Details Tab */}
        {activeTab === "details" && (
          <div className="space-y-4">
            {/* Client Details */}
            {user.role === "client" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {t("profile.clientInfo")}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      {isEditing ? (
                        <>{t("common.cancel")}</>
                      ) : (
                        <>
                          <Edit3 className="h-4 w-4 mr-1" />
                          {t("common.edit")}
                        </>
                      )}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="business_type">
                        {t("profile.businessType")}
                      </Label>
                      {isEditing ? (
                        <Select
                          value={profileForm.business_type}
                          onValueChange={(value) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              business_type: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select business type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={BusinessType.INDIVIDUAL}>
                              {t("businessType.individual")}
                            </SelectItem>
                            <SelectItem value={BusinessType.CORPORATE}>
                              {t("businessType.corporate")}
                            </SelectItem>
                            <SelectItem value={BusinessType.GOVERNMENT}>
                              {t("businessType.government")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="px-3 py-2 border rounded-md bg-gray-50">
                          {profileForm.business_type ===
                            BusinessType.INDIVIDUAL &&
                            t("businessType.individual")}
                          {profileForm.business_type ===
                            BusinessType.CORPORATE &&
                            t("businessType.corporate")}
                          {profileForm.business_type ===
                            BusinessType.GOVERNMENT &&
                            t("businessType.government")}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_name">
                        {t("profile.companyName")}
                      </Label>
                      <Input
                        id="company_name"
                        value={profileForm.company_name}
                        onChange={(e) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            company_name: e.target.value,
                          }))
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">{t("profile.address")}</Label>
                      <Input
                        id="address"
                        value={profileForm.address}
                        onChange={(e) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            address: e.target.value,
                          }))
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Driver Details */}
            {user.role === "driver" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      {t("profile.driverInfo")}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      {isEditing ? (
                        <>{t("common.cancel")}</>
                      ) : (
                        <>
                          <Edit3 className="h-4 w-4 mr-1" />
                          {t("common.edit")}
                        </>
                      )}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="license_number">
                        {t("profile.licenseNumber")}
                      </Label>
                      <Input
                        id="license_number"
                        value={profileForm.license_number}
                        onChange={(e) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            license_number: e.target.value,
                          }))
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="license_type">
                        {t("profile.licenseType")}
                      </Label>
                      <Input
                        id="license_type"
                        value={profileForm.license_type}
                        onChange={(e) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            license_type: e.target.value,
                          }))
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth">
                        {t("profile.dateOfBirth")}
                      </Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={profileForm.date_of_birth}
                        onChange={(e) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            date_of_birth: e.target.value,
                          }))
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="blood_type">
                        {t("profile.bloodType")}
                      </Label>
                      <Input
                        id="blood_type"
                        value={profileForm.blood_type}
                        onChange={(e) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            blood_type: e.target.value,
                          }))
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact">
                        {t("profile.emergencyContact")}
                      </Label>
                      <Input
                        id="emergency_contact"
                        value={profileForm.emergency_contact}
                        onChange={(e) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            emergency_contact: e.target.value,
                          }))
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergency_phone">
                        {t("profile.emergencyPhone")}
                      </Label>
                      <Input
                        id="emergency_phone"
                        value={profileForm.emergency_phone}
                        onChange={(e) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            emergency_phone: e.target.value,
                          }))
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  {/* Driver Status */}
                  <div className="space-y-2">
                    <Label>{t("driver.status")}</Label>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={getDriverStatusColor(
                          (profile as Driver)?.status || "unavailable"
                        )}
                      >
                        {t(
                          `driver.status.${
                            (profile as Driver)?.status || "unavailable"
                          }`
                        )}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {(profile as Driver)?.status === "available" &&
                          t("driver.statusDescription.available")}
                        {(profile as Driver)?.status === "on_duty" &&
                          t("driver.statusDescription.on_duty")}
                        {(profile as Driver)?.status === "unavailable" &&
                          t("driver.statusDescription.unavailable")}
                      </span>
                    </div>
                  </div>

                  {/* Driver Rating */}
                  <div className="space-y-2">
                    <Label>{t("profile.rating")}</Label>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-yellow-500">★</span>
                      <span>{(profile as Driver)?.rating || 0}/5.0</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {t("profile.accountInfo")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("profile.memberSince")}</Label>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("profile.lastLogin")}</Label>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>
                        {user.last_login
                          ? new Date(user.last_login).toLocaleDateString()
                          : t("profile.never")}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {t("profile.changePassword")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">
                  {t("profile.currentPassword")}
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">{t("profile.newPassword")}</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {t("profile.confirmPassword")}
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                />
              </div>
              <Button
                onClick={handlePasswordChange}
                disabled={
                  changePasswordMutation.isPending ||
                  !passwordForm.currentPassword ||
                  !passwordForm.newPassword ||
                  !passwordForm.confirmPassword
                }
              >
                {changePasswordMutation.isPending
                  ? t("common.loading")
                  : t("profile.changePassword")}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
