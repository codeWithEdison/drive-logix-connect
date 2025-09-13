import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Building,
  Lock,
  CheckCircle,
} from "lucide-react";
import { customToast } from "@/lib/utils/toast";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageSwitcher } from "@/lib/i18n/LanguageSwitcher";
import { useAuth } from "@/contexts/AuthContext";
import {
  CreateUserRequest,
  BusinessType,
  Language,
  UserRole,
} from "@/types/shared";

export default function Register() {
  const { register, isLoading } = useAuth();
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    businessType: "individual" as BusinessType,
    companyName: "",
    preferredLanguage: "en" as Language,
    agreeToTerms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      customToast.validation.passwordsNotMatch();
      return;
    }

    if (!formData.agreeToTerms) {
      customToast.validation.requiredField("Terms and Conditions");
      return;
    }

    const registrationData: CreateUserRequest = {
      full_name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: "client" as UserRole, // Default role for registration
      preferred_language: formData.preferredLanguage,
    };

    const success = await register(registrationData);
    if (success) {
      customToast.success(t("auth.registerSuccess"));
      // Show success message instead of redirecting
      setUserEmail(formData.email);
      setIsSubmitted(true);
    }
  };

  // Show success message after registration
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
        {/* Language Selector - Top Right */}
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>

        <div className="w-full max-w-md">
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold">
                  {t("auth.registrationSuccessful")}
                </h2>
                <p className="text-muted-foreground">
                  {t("auth.verificationEmailSent", { email: userEmail })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("auth.verificationInstructions")}
                </p>
                <p className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <strong>💡 {t("auth.checkSpamFolder")}</strong>
                </p>
                <div className="pt-4 space-y-2">
                  <Link
                    to={`/verify-email?email=${encodeURIComponent(userEmail)}`}
                  >
                    <Button className="w-full">
                      {t("auth.goToVerification")}
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" className="w-full">
                      {t("auth.backToLogin")}
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      {/* Language Selector - Top Right */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-2xl">
        {/* Header - Logo and Title on same row */}
        <div className="text-center space-y-4 mb-6">
          <div className="flex items-center justify-center gap-4">
            <img
              src="/lovewaylogistic.png"
              alt="Loveway Logistics"
              className="w-12 h-12 object-contain"
            />
            <div className="text-left">
              <h1 className="text-2xl font-bold text-foreground">
                {t("auth.createAccount")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("auth.joinLogistics")}
              </p>
            </div>
          </div>
        </div>

        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>{t("auth.registerAsClient")}</CardTitle>
            <CardDescription>{t("auth.fillDetails")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {t("auth.personalInformation")}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">{t("auth.fullName")} *</Label>
                    <Input
                      id="fullName"
                      placeholder={t("auth.fullName")}
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t("auth.email")} *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t("auth.email")}
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("auth.phone")} *</Label>
                    <Input
                      id="phone"
                      placeholder={t("auth.phone")}
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferredLanguage">
                      {t("auth.preferredLanguage")}
                    </Label>
                    <Select
                      value={formData.preferredLanguage}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          preferredLanguage: value as Language,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="rw">Kinyarwanda</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  {t("auth.businessInformation")}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessType">
                      {t("client.businessType")}
                    </Label>
                    <Select
                      value={formData.businessType}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          businessType: value as BusinessType,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">
                          {t("businessType.individual")}
                        </SelectItem>
                        <SelectItem value="corporate">
                          {t("businessType.corporate")}
                        </SelectItem>
                        <SelectItem value="government">
                          {t("businessType.government")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyName">
                      {t("client.companyName")} ({t("auth.optional")})
                    </Label>
                    <Input
                      id="companyName"
                      placeholder={t("client.companyName")}
                      value={formData.companyName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          companyName: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Security */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  {t("auth.security")}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">{t("auth.password")} *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={t("auth.password")}
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      {t("auth.confirmPassword")} *
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder={t("auth.confirmPassword")}
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confirmPassword: e.target.value,
                          })
                        }
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      agreeToTerms: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="agreeToTerms" className="text-sm">
                  {t("auth.agreeToTerms")}
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading
                  ? t("auth.creatingAccount")
                  : t("auth.createAccount")}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              {t("auth.alreadyHaveAccount")}{" "}
              <Link
                to="/login"
                className="text-primary hover:underline font-medium"
              >
                {t("auth.signIn")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
