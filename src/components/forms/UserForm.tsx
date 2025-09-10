import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { UserRole, BusinessType, LicenseType, Language } from "@/types/shared";
import { User, Building, Truck } from "lucide-react";

interface UserFormData {
  // Basic user info
  full_name: string;
  email: string;
  phone: string;
  password: string;
  preferred_language: Language;
  role: UserRole;

  // Client-specific fields
  company_name?: string;
  business_type?: BusinessType;
  tax_id?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  contact_person?: string;
  credit_limit?: number;
  payment_terms?: number;

  // Driver-specific fields
  license_number?: string;
  license_expiry?: string;
  license_type?: LicenseType;
  date_of_birth?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  blood_type?: string;
  medical_certificate_expiry?: string;
}

interface UserFormProps {
  initialData?: Partial<UserFormData>;
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode: "create" | "edit";
}

export function UserForm({
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false,
  mode,
}: UserFormProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState<UserFormData>({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    preferred_language: Language.EN,
    role: UserRole.CLIENT,
    company_name: "",
    business_type: BusinessType.INDIVIDUAL,
    tax_id: "",
    address: "",
    city: "",
    country: "Rwanda",
    postal_code: "",
    contact_person: "",
    credit_limit: 0,
    payment_terms: 30,
    license_number: "",
    license_expiry: "",
    license_type: LicenseType.B,
    date_of_birth: "",
    emergency_contact: "",
    emergency_phone: "",
    blood_type: "",
    medical_certificate_expiry: "",
    ...initialData,
  });

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleInputChange = (
    field: keyof UserFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Filter out empty optional fields for cleaner payload
    const submitData = { ...formData };

    // Remove empty optional fields but keep required fields
    Object.keys(submitData).forEach((key) => {
      const value = submitData[key as keyof UserFormData];
      if (value === "" || value === undefined) {
        // Keep required fields even if empty
        const requiredFields = ["full_name", "email", "password", "role"];
        if (!requiredFields.includes(key)) {
          delete submitData[key as keyof UserFormData];
        }
      }
    });

    // Ensure required fields are present
    if (formData.role === "client" && !submitData.company_name) {
      submitData.company_name = "";
    }
    if (formData.role === "driver" && !submitData.license_number) {
      submitData.license_number = "";
    }

    onSubmit(submitData);
  };

  const renderBasicInfo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="full_name">{t("common.fullName")} *</Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => handleInputChange("full_name", e.target.value)}
            placeholder={t("common.enterFullName")}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">{t("common.email")} *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder={t("common.enterEmail")}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">{t("common.phone")} *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder={t("common.enterPhone")}
            required
          />
        </div>
        <div>
          <Label htmlFor="role">{t("common.role")} *</Label>
          <Select
            value={formData.role}
            onValueChange={(value) =>
              handleInputChange("role", value as UserRole)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="client">{t("common.client")}</SelectItem>
              <SelectItem value="driver">{t("common.driver")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="password">
            {mode === "create" ? t("common.password") : t("common.newPassword")}{" "}
            {mode === "create" ? "*" : ""}
          </Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            placeholder={
              mode === "create"
                ? t("common.enterPassword")
                : t("common.enterNewPassword")
            }
            required={mode === "create"}
          />
        </div>
        <div>
          <Label htmlFor="preferred_language">{t("common.language")}</Label>
          <Select
            value={formData.preferred_language}
            onValueChange={(value) =>
              handleInputChange("preferred_language", value as Language)
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
    </div>
  );

  const renderClientInfo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="company_name">
            {t("client.business")} {t("common.name")} *
          </Label>
          <Input
            id="company_name"
            value={formData.company_name || ""}
            onChange={(e) => handleInputChange("company_name", e.target.value)}
            placeholder={t("client.enterCompanyName")}
            required
          />
        </div>
        <div>
          <Label htmlFor="business_type">
            {t("client.business")} {t("common.type")}
          </Label>
          <Select
            value={formData.business_type || "individual"}
            onValueChange={(value) =>
              handleInputChange("business_type", value as BusinessType)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">
                {t("client.individual")}
              </SelectItem>
              <SelectItem value="corporate">{t("client.corporate")}</SelectItem>
              <SelectItem value="government">
                {t("client.government")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tax_id">{t("client.taxId")}</Label>
          <Input
            id="tax_id"
            value={formData.tax_id || ""}
            onChange={(e) => handleInputChange("tax_id", e.target.value)}
            placeholder={t("client.enterTaxId")}
          />
        </div>
        <div>
          <Label htmlFor="contact_person">{t("client.contactPerson")}</Label>
          <Input
            id="contact_person"
            value={formData.contact_person || ""}
            onChange={(e) =>
              handleInputChange("contact_person", e.target.value)
            }
            placeholder={t("client.enterContactPerson")}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">{t("common.address")}</Label>
        <Input
          id="address"
          value={formData.address || ""}
          onChange={(e) => handleInputChange("address", e.target.value)}
          placeholder={t("common.enterAddress")}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city">{t("common.city")}</Label>
          <Input
            id="city"
            value={formData.city || ""}
            onChange={(e) => handleInputChange("city", e.target.value)}
            placeholder={t("common.enterCity")}
          />
        </div>
        <div>
          <Label htmlFor="country">{t("common.country")}</Label>
          <Input
            id="country"
            value={formData.country || ""}
            onChange={(e) => handleInputChange("country", e.target.value)}
            placeholder={t("common.enterCountry")}
          />
        </div>
        <div>
          <Label htmlFor="postal_code">{t("client.postalCode")}</Label>
          <Input
            id="postal_code"
            value={formData.postal_code || ""}
            onChange={(e) => handleInputChange("postal_code", e.target.value)}
            placeholder={t("client.enterPostalCode")}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="credit_limit">{t("client.creditLimit")}</Label>
          <Input
            id="credit_limit"
            type="number"
            value={formData.credit_limit || ""}
            onChange={(e) =>
              handleInputChange("credit_limit", Number(e.target.value))
            }
            placeholder={t("client.enterCreditLimit")}
          />
        </div>
        <div>
          <Label htmlFor="payment_terms">{t("client.paymentTerms")}</Label>
          <Input
            id="payment_terms"
            type="number"
            value={formData.payment_terms || ""}
            onChange={(e) =>
              handleInputChange("payment_terms", Number(e.target.value))
            }
            placeholder={t("client.enterPaymentTerms")}
          />
        </div>
      </div>
    </div>
  );

  const renderDriverInfo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="license_number">
            {t("driver.license")} {t("common.number")} *
          </Label>
          <Input
            id="license_number"
            value={formData.license_number || ""}
            onChange={(e) =>
              handleInputChange("license_number", e.target.value)
            }
            placeholder={t("driver.enterLicenseNumber")}
            required
          />
        </div>
        <div>
          <Label htmlFor="license_type">
            {t("driver.license")} {t("common.type")}
          </Label>
          <Select
            value={formData.license_type || "B"}
            onValueChange={(value) =>
              handleInputChange("license_type", value as LicenseType)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A">A</SelectItem>
              <SelectItem value="B">B</SelectItem>
              <SelectItem value="C">C</SelectItem>
              <SelectItem value="D">D</SelectItem>
              <SelectItem value="E">E</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="license_expiry">
            {t("driver.license")} {t("common.expiry")}
          </Label>
          <Input
            id="license_expiry"
            type="date"
            value={formData.license_expiry || ""}
            onChange={(e) =>
              handleInputChange("license_expiry", e.target.value)
            }
          />
        </div>
        <div>
          <Label htmlFor="date_of_birth">{t("driver.dateOfBirth")}</Label>
          <Input
            id="date_of_birth"
            type="date"
            value={formData.date_of_birth || ""}
            onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="emergency_contact">
            {t("driver.emergencyContact")}
          </Label>
          <Input
            id="emergency_contact"
            value={formData.emergency_contact || ""}
            onChange={(e) =>
              handleInputChange("emergency_contact", e.target.value)
            }
            placeholder={t("driver.enterEmergencyContact")}
          />
        </div>
        <div>
          <Label htmlFor="emergency_phone">{t("driver.emergencyPhone")}</Label>
          <Input
            id="emergency_phone"
            value={formData.emergency_phone || ""}
            onChange={(e) =>
              handleInputChange("emergency_phone", e.target.value)
            }
            placeholder={t("driver.enterEmergencyPhone")}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="blood_type">{t("driver.bloodType")}</Label>
          <Select
            value={formData.blood_type || ""}
            onValueChange={(value) => handleInputChange("blood_type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("driver.selectBloodType")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A+">A+</SelectItem>
              <SelectItem value="A-">A-</SelectItem>
              <SelectItem value="B+">B+</SelectItem>
              <SelectItem value="B-">B-</SelectItem>
              <SelectItem value="AB+">AB+</SelectItem>
              <SelectItem value="AB-">AB-</SelectItem>
              <SelectItem value="O+">O+</SelectItem>
              <SelectItem value="O-">O-</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="medical_certificate_expiry">
            {t("driver.medicalCertExpiry")}
          </Label>
          <Input
            id="medical_certificate_expiry"
            type="date"
            value={formData.medical_certificate_expiry || ""}
            onChange={(e) =>
              handleInputChange("medical_certificate_expiry", e.target.value)
            }
          />
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {t("common.basic")} {t("common.info")}
          </TabsTrigger>
          {formData.role === "client" && (
            <TabsTrigger value="client" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              {t("common.client")} {t("common.info")}
            </TabsTrigger>
          )}
          {formData.role === "driver" && (
            <TabsTrigger value="driver" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              {t("common.driver")} {t("common.info")}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {t("common.basic")} {t("common.information")}
              </CardTitle>
            </CardHeader>
            <CardContent>{renderBasicInfo()}</CardContent>
          </Card>
        </TabsContent>

        {formData.role === "client" && (
          <TabsContent value="client" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {t("common.client")} {t("common.information")}
                </CardTitle>
              </CardHeader>
              <CardContent>{renderClientInfo()}</CardContent>
            </Card>
          </TabsContent>
        )}

        {formData.role === "driver" && (
          <TabsContent value="driver" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {t("common.driver")} {t("common.information")}
                </CardTitle>
              </CardHeader>
              <CardContent>{renderDriverInfo()}</CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={isLoading}
        >
          {t("common.cancel")}
        </Button>
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading
            ? t("common.loading")
            : mode === "create"
            ? t("adminUsers.createUser")
            : t("common.save")}
        </Button>
      </div>
    </form>
  );
}
