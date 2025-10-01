import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  DollarSign,
  Tag,
  Save,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
} from "@/lib/api/hooks/notificationHooks";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { customToast } from "@/lib/utils/toast";

const AdminSettings = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(false);

  // Settings state
  const [generalSettings, setGeneralSettings] = useState({
    companyName: "Loveway Logistics",
    companyEmail: "admin@lovelycargo.rw",
    companyPhone: "+250 123 456 789",
    companyAddress: "KG 123 Street, Kigali, Rwanda",
    timezone: "Africa/Kigali",
    currency: "RWF",
    language: "en",
  });

  const [pricingSettings, setPricingSettings] = useState({
    baseRatePerKm: 2500,
    baseRatePerKg: 1200,
    minimumCharge: 25000,
    fuelSurcharge: 15,
    insuranceRate: 5,
    urgentDeliveryFee: 25,
    nightDeliveryFee: 15000,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    deliveryUpdates: true,
    paymentNotifications: true,
    systemAlerts: true,
    marketingEmails: false,
  });

  // API hooks
  const {
    data: notificationSettingsData,
    isLoading: notificationLoading,
    error: notificationError,
    refetch: refetchNotifications,
  } = useNotificationSettings();

  const updateNotificationSettingsMutation = useUpdateNotificationSettings();

  // Event handlers
  const handleSaveGeneralSettings = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement general settings API call
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      customToast.success(t("adminSettings.generalSettingsSaved"));
    } catch (error) {
      customToast.error(t("errors.saveFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePricingSettings = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement pricing settings API call
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      customToast.success(t("adminSettings.pricingSettingsSaved"));
    } catch (error) {
      customToast.error(t("errors.saveFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotificationSettings = async () => {
    try {
      await updateNotificationSettingsMutation.mutateAsync(
        notificationSettings
      );
      customToast.success(t("adminSettings.notificationSettingsSaved"));
    } catch (error) {
      customToast.error(t("errors.saveFailed"));
    }
  };

  const handleRefresh = () => {
    refetchNotifications();
    customToast.success(t("common.refreshed"));
  };

  // Loading state
  if (notificationLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Tabs Skeleton */}
        <Skeleton className="h-12 w-full" />

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
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
  if (notificationError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("adminSettings.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("adminSettings.subtitle")}
            </p>
          </div>
        </div>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <h3 className="font-semibold text-red-800">
                  {t("common.error")}
                </h3>
                <p className="text-red-600 text-sm mt-1">
                  {notificationError.message || t("adminSettings.loadError")}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="mt-2"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t("common.retry")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t("adminSettings.title")}
          </h1>
          <p className="text-muted-foreground">{t("adminSettings.subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={notificationLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${
                notificationLoading ? "animate-spin" : ""
              }`}
            />
            {t("common.refresh")}
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">
            {t("adminSettings.general")}
          </TabsTrigger>
          <TabsTrigger value="pricing">
            {t("adminSettings.pricing")}
          </TabsTrigger>
          <TabsTrigger value="notifications">
            {t("adminSettings.notifications")}
          </TabsTrigger>
          <TabsTrigger value="system">{t("adminSettings.system")}</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {t("adminSettings.generalSettings")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">
                    {t("adminSettings.companyName")}
                  </Label>
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
                  <Label htmlFor="companyEmail">
                    {t("adminSettings.companyEmail")}
                  </Label>
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
                  <Label htmlFor="companyPhone">
                    {t("adminSettings.companyPhone")}
                  </Label>
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
                  <Label htmlFor="timezone">
                    {t("adminSettings.timezone")}
                  </Label>
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
                  <Label htmlFor="currency">
                    {t("adminSettings.currency")}
                  </Label>
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
                  <Label htmlFor="language">
                    {t("adminSettings.language")}
                  </Label>
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
                <Label htmlFor="companyAddress">
                  {t("adminSettings.companyAddress")}
                </Label>
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
              <Button onClick={handleSaveGeneralSettings} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {t("adminSettings.saveSettings")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Settings */}
        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                {t("adminSettings.pricingSettings")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="baseRatePerKm">
                    {t("adminSettings.baseRatePerKm")}
                  </Label>
                  <Input
                    id="baseRatePerKm"
                    type="number"
                    value={pricingSettings.baseRatePerKm}
                    onChange={(e) =>
                      setPricingSettings({
                        ...pricingSettings,
                        baseRatePerKm: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="baseRatePerKg">
                    {t("adminSettings.baseRatePerKg")}
                  </Label>
                  <Input
                    id="baseRatePerKg"
                    type="number"
                    value={pricingSettings.baseRatePerKg}
                    onChange={(e) =>
                      setPricingSettings({
                        ...pricingSettings,
                        baseRatePerKg: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="minimumCharge">
                    {t("adminSettings.minimumCharge")}
                  </Label>
                  <Input
                    id="minimumCharge"
                    type="number"
                    value={pricingSettings.minimumCharge}
                    onChange={(e) =>
                      setPricingSettings({
                        ...pricingSettings,
                        minimumCharge: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="fuelSurcharge">
                    {t("adminSettings.fuelSurcharge")}
                  </Label>
                  <Input
                    id="fuelSurcharge"
                    type="number"
                    value={pricingSettings.fuelSurcharge}
                    onChange={(e) =>
                      setPricingSettings({
                        ...pricingSettings,
                        fuelSurcharge: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="insuranceRate">
                    {t("adminSettings.insuranceRate")}
                  </Label>
                  <Input
                    id="insuranceRate"
                    type="number"
                    value={pricingSettings.insuranceRate}
                    onChange={(e) =>
                      setPricingSettings({
                        ...pricingSettings,
                        insuranceRate: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="urgentDeliveryFee">
                    {t("adminSettings.urgentDeliveryFee")}
                  </Label>
                  <Input
                    id="urgentDeliveryFee"
                    type="number"
                    value={pricingSettings.urgentDeliveryFee}
                    onChange={(e) =>
                      setPricingSettings({
                        ...pricingSettings,
                        urgentDeliveryFee: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <Button onClick={handleSavePricingSettings} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {t("adminSettings.saveSettings")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                {t("adminSettings.notificationSettings")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">
                      {t("adminSettings.emailNotifications")}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t("adminSettings.emailNotificationsDesc")}
                    </p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        emailNotifications: checked,
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="smsNotifications">
                      {t("adminSettings.smsNotifications")}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t("adminSettings.smsNotificationsDesc")}
                    </p>
                  </div>
                  <Switch
                    id="smsNotifications"
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        smsNotifications: checked,
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="pushNotifications">
                      {t("adminSettings.pushNotifications")}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t("adminSettings.pushNotificationsDesc")}
                    </p>
                  </div>
                  <Switch
                    id="pushNotifications"
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        pushNotifications: checked,
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="deliveryUpdates">
                      {t("adminSettings.deliveryUpdates")}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t("adminSettings.deliveryUpdatesDesc")}
                    </p>
                  </div>
                  <Switch
                    id="deliveryUpdates"
                    checked={notificationSettings.deliveryUpdates}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        deliveryUpdates: checked,
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="paymentNotifications">
                      {t("adminSettings.paymentNotifications")}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t("adminSettings.paymentNotificationsDesc")}
                    </p>
                  </div>
                  <Switch
                    id="paymentNotifications"
                    checked={notificationSettings.paymentNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        paymentNotifications: checked,
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="systemAlerts">
                      {t("adminSettings.systemAlerts")}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t("adminSettings.systemAlertsDesc")}
                    </p>
                  </div>
                  <Switch
                    id="systemAlerts"
                    checked={notificationSettings.systemAlerts}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        systemAlerts: checked,
                      })
                    }
                  />
                </div>
              </div>
              <Button
                onClick={handleSaveNotificationSettings}
                disabled={updateNotificationSettingsMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {t("adminSettings.saveSettings")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {t("adminSettings.systemSettings")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t("adminSettings.maintenanceMode")}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t("adminSettings.maintenanceModeDesc")}
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t("adminSettings.debugMode")}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t("adminSettings.debugModeDesc")}
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t("adminSettings.autoBackup")}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t("adminSettings.autoBackupDesc")}
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t("adminSettings.clearCache")}
                </Button>
                <Button variant="outline">
                  <Save className="h-4 w-4 mr-2" />
                  {t("adminSettings.backupData")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
