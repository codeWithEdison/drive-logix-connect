import React, { useState } from "react";
import { Link } from "react-router-dom";
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
  ArrowLeft,
  ArrowRight,
  UserPlus,
  Sparkles,
  Truck,
  Shield,
} from "lucide-react";
import { customToast } from "@/lib/utils/toast";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageSwitcher } from "@/lib/i18n/LanguageSwitcher";
import { useAuth } from "@/contexts/AuthContext";
import { validatePhone } from "@/lib/utils/frontend";
import {
  CreateUserRequest,
  BusinessType,
  Language,
  UserRole,
} from "@/types/shared";
import { motion } from "framer-motion";
import { SEO } from "@/components/seo/SEO";
import { PAGE_SEO, generateWebPageSchema } from "@/lib/seo/seoData";

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

    // Validate phone number format
    if (formData.phone && !validatePhone(formData.phone)) {
      customToast.error(
        t("auth.invalidPhoneNumber"),
        t("auth.invalidPhoneNumberDescription")
      );
      return;
    }

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
      phone: formData.phone.replace(/\s/g, ""), // Remove all spaces from phone number
      password: formData.password,
      role: "client" as UserRole, // Default role for registration
      preferred_language: formData.preferredLanguage,
    };

    try {
      const success = await register(registrationData);
      if (success) {
        customToast.success(t("auth.registerSuccess"));
        // Show success message instead of redirecting
        setUserEmail(formData.email);
        setIsSubmitted(true);
      }
    } catch (error: any) {
      // Handle specific validation errors from backend
      if (error?.error?.details && Array.isArray(error.error.details)) {
        // Show specific field validation errors
        error.error.details.forEach((detail: any) => {
          customToast.error(
            `${detail.field}: ${detail.message}`,
            `Invalid value: ${detail.value}`
          );
        });
      } else if (error?.error?.message) {
        // Show general error message
        customToast.error("Registration Failed", error.error.message);
      } else {
        // Fallback error message
        customToast.error(
          "Registration Failed",
          "Please check your information and try again"
        );
      }
    }
  };

  // Show success message after registration
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 relative overflow-hidden flex items-center justify-center p-4">
        {/* Animated Background Orbs */}
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-green-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="w-full max-w-6xl mx-auto relative z-10">
          {/* Top Row - Navigation */}
          <div className="flex justify-between items-center mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link
                to="/"
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-4 py-2 rounded-full transition-all duration-300 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">
                  {t("auth.backToHome")}
                </span>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <LanguageSwitcher />
            </motion.div>
          </div>

          {/* Second Row - Logo and Title */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center justify-center gap-2 sm:gap-4 mb-2 flex-wrap">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
                className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16"
              >
                <img
                  src="/lovewaylogistic.png"
                  alt="Loveway Logistics"
                  className="w-full h-full object-cover rounded-full"
                />
              </motion.div>
              <motion.h1
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white whitespace-nowrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                Loveway Logistics
              </motion.h1>
            </div>
            <motion.p
              className="text-blue-200 text-sm sm:text-base md:text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              {t("auth.professionalLogisticsPlatform")}
            </motion.p>
          </motion.div>

          <div className="w-full max-w-md mx-auto">
            <motion.div
              className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-0 shadow-none bg-transparent">
                <CardContent className="pt-8 pb-8">
                  <div className="text-center space-y-6">
                    <motion.div
                      className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, type: "spring" }}
                    >
                      <CheckCircle className="h-10 w-10 text-white" />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <h2 className="text-2xl font-bold text-gray-900">
                        {t("auth.registrationSuccessful")}
                      </h2>
                      <p className="text-gray-600 mt-2">
                        {t("auth.verificationEmailSent", { email: userEmail })}
                      </p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="space-y-3"
                    >
                      <p className="text-sm text-gray-600">
                        {t("auth.verificationInstructions")}
                      </p>
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="text-sm text-blue-800 font-medium">
                          💡 {t("auth.checkSpamFolder")}
                        </p>
                      </div>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="pt-4"
                    >
                      <Link to="/login">
                        <Button
                          variant="outline"
                          className="w-full rounded-full py-6 text-base font-semibold border-2 hover:bg-gray-50 transition-all duration-300"
                        >
                          {t("auth.backToLogin")}
                        </Button>
                      </Link>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  const webPageSchema = generateWebPageSchema(
    PAGE_SEO.register.title,
    PAGE_SEO.register.description,
    PAGE_SEO.register.path
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 relative overflow-hidden flex items-center justify-center p-4">
      <SEO
        title={PAGE_SEO.register.title}
        description={PAGE_SEO.register.description}
        keywords={PAGE_SEO.register.keywords}
        url={PAGE_SEO.register.path}
        structuredData={webPageSchema}
      />
      {/* Animated Background Orbs */}
      <motion.div
        className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          x: [0, -100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="w-full max-w-6xl mx-auto relative z-10">
        {/* Top Row - Navigation */}
        <div className="flex justify-between items-center mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              to="/"
              className="flex items-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-4 py-2 rounded-full transition-all duration-300 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">
                {t("auth.backToHome")}
              </span>
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LanguageSwitcher />
          </motion.div>
        </div>

        {/* Second Row - Logo and Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-2 flex-wrap">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
              className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16"
            >
              <img
                src="/lovewaylogistic.png"
                alt="Loveway Logistics"
                className="w-full h-full object-cover rounded-full"
              />
            </motion.div>
            <motion.h1
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white whitespace-nowrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Loveway Logistics
            </motion.h1>
          </div>
          <motion.p
            className="text-blue-200 text-sm sm:text-base md:text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {t("auth.professionalLogisticsPlatform")}
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Side - Branding Features */}
          <motion.div
            className="hidden lg:block text-white space-y-4"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {t("auth.joinOurPlatform")}
                  </h3>
                  <p className="text-blue-200 text-sm">
                    {t("auth.startManagingCargoToday")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Truck className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {t("auth.fastAndReliable")}
                  </h3>
                  <p className="text-blue-200 text-sm">
                    {t("auth.quickDeliveryServices")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {t("auth.realTimeTracking")}
                  </h3>
                  <p className="text-blue-200 text-sm">
                    {t("auth.monitorCargo24/7")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {t("auth.secureAndSafe")}
                  </h3>
                  <p className="text-blue-200 text-sm">
                    {t("auth.yourDataIsProtected")}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Registration Form */}
          <motion.div
            className="w-full max-w-2xl mx-auto lg:mx-0"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            {/* Registration Card */}
            <motion.div
              className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-0 shadow-none bg-transparent">
                <CardHeader className="space-y-2 pb-6">
                  <motion.div
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                      <UserPlus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900">
                        {t("auth.createAccount")}
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        {t("auth.joinLogistics")}
                      </CardDescription>
                    </div>
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information */}
                    <motion.div
                      className="space-y-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                        <User className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {t("auth.personalInformation")}
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="fullName"
                            className="text-sm font-semibold text-gray-700"
                          >
                            {t("auth.fullName")} *
                          </Label>
                          <Input
                            id="fullName"
                            placeholder={t("auth.fullName")}
                            value={formData.fullName}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                fullName: e.target.value,
                              })
                            }
                            required
                            className="rounded-full px-4 py-3 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-semibold"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="email"
                            className="text-sm font-semibold text-gray-700"
                          >
                            {t("auth.email")} *
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="email"
                              type="email"
                              placeholder={t("auth.email")}
                              value={formData.email}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  email: e.target.value,
                                })
                              }
                              required
                              className="rounded-full px-4 py-3 pl-10 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-semibold"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="phone"
                            className="text-sm font-semibold text-gray-700"
                          >
                            {t("auth.phone")} *
                          </Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="phone"
                              placeholder="e.g., +250788240301"
                              value={formData.phone}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  phone: e.target.value,
                                })
                              }
                              required
                              className="rounded-full px-4 py-3 pl-10 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-semibold"
                            />
                          </div>
                          <p className="text-xs text-gray-500 pl-1">
                            {t("auth.phoneFormat")}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="preferredLanguage"
                            className="text-sm font-semibold text-gray-700"
                          >
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
                            <SelectTrigger className="rounded-full px-4 py-3 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-semibold">
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
                    </motion.div>

                    {/* Business Information */}
                    <motion.div
                      className="space-y-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                        <Building className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {t("auth.businessInformation")}
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="businessType"
                            className="text-sm font-semibold text-gray-700"
                          >
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
                            <SelectTrigger className="rounded-full px-4 py-3 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-semibold">
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
                          <Label
                            htmlFor="companyName"
                            className="text-sm font-semibold text-gray-700"
                          >
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
                            className="rounded-full px-4 py-3 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-semibold"
                          />
                        </div>
                      </div>
                    </motion.div>

                    {/* Security */}
                    <motion.div
                      className="space-y-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                        <Lock className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {t("auth.security")}
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="password"
                            className="text-sm font-semibold text-gray-700"
                          >
                            {t("auth.password")} *
                          </Label>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder={t("auth.password")}
                              value={formData.password}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  password: e.target.value,
                                })
                              }
                              required
                              className="rounded-full px-4 py-3 pr-12 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-semibold"
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-500" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-500" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="confirmPassword"
                            className="text-sm font-semibold text-gray-700"
                          >
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
                              className="rounded-full px-4 py-3 pr-12 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-semibold"
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-500" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-500" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Terms and Conditions */}
                    <motion.div
                      className="flex items-start space-x-3 pt-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                    >
                      <Checkbox
                        id="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            agreeToTerms: checked as boolean,
                          })
                        }
                        className="mt-1"
                      />
                      <Label
                        htmlFor="agreeToTerms"
                        className="text-sm text-gray-700 leading-relaxed cursor-pointer"
                      >
                        {t("auth.agreeToTerms")}
                      </Label>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.7 }}
                    >
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            {t("auth.creatingAccount")}
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            {t("auth.createAccount")}
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        )}
                      </Button>
                    </motion.div>
                  </form>

                  <motion.div
                    className="mt-6 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                  >
                    <p className="text-sm text-gray-600 mb-2">
                      {t("auth.alreadyHaveAccount")}
                    </p>
                    <Link
                      to="/login"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors inline-flex items-center gap-1"
                    >
                      {t("auth.signIn")}
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
