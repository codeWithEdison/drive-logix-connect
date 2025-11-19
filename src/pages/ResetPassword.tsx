import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
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
  Lock,
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  KeyRound,
  Sparkles,
} from "lucide-react";
import { customToast } from "@/lib/utils/toast";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageSwitcher } from "@/lib/i18n/LanguageSwitcher";
import { useResetPassword } from "@/lib/api/hooks";
import { motion } from "framer-motion";

export default function ResetPassword() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Get token from URL parameters
  const token = searchParams.get("token");

  // API hook for password reset
  const resetPasswordMutation = useResetPassword();

  // Check if token exists
  useEffect(() => {
    if (!token) {
      customToast.error(t("auth.invalidResetToken"));
      navigate("/forgot-password");
    }
  }, [token, navigate, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      customToast.error(t("auth.invalidResetToken"));
      return;
    }

    if (newPassword !== confirmPassword) {
      customToast.validation.passwordsNotMatch();
      return;
    }

    if (newPassword.length < 6) {
      customToast.error(t("auth.passwordTooShort"));
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetPasswordMutation.mutateAsync({
        token,
        newPassword,
      });

      if (result.success) {
        customToast.success(t("auth.passwordResetSuccess"));
        setIsSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        customToast.error(result.message || t("auth.passwordResetFailed"));
      }
    } catch (error: any) {
      console.error("Password reset error:", error);
      customToast.error(
        error?.error?.message || error?.message || t("auth.passwordResetFailed")
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
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
                <span className="text-sm font-medium">{t("auth.backToHome")}</span>
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
              Professional Logistics Management Platform
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
                        {t("auth.passwordResetSuccess")}
                      </h2>
                      <p className="text-gray-600 mt-2">
                        {t("auth.passwordResetComplete")}
                      </p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <p className="text-sm text-gray-600">
                        {t("auth.redirectingToLogin")}
                      </p>
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
                          <ArrowLeft className="h-4 w-4 mr-2" />
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

  if (!token) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 relative overflow-hidden flex items-center justify-center p-4">
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

      {/* Top Navigation - Back to Home & Language Selector */}
      <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-center">
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
            <span className="text-sm font-medium">Back to Home</span>
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

      <div className="w-full max-w-5xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <motion.div
            className="hidden lg:block text-white space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-16 h-16"
              >
                <img
                  src="/lovewaylogistic.png"
                  alt="Loveway Logistics"
                  className="w-full h-full object-cover rounded-full"
                />
              </motion.div>
              <div>
                <motion.h1
                  className="text-4xl font-bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  Loveway Logistics
                </motion.h1>
                <motion.p
                  className="text-blue-200 text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  Professional Logistics Management Platform
                </motion.p>
              </div>
            </div>

            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Lock className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{t("auth.securePassword")}</h3>
                  <p className="text-blue-200 text-sm">
                    {t("auth.securePasswordDescription")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{t("auth.accountSecurity")}</h3>
                  <p className="text-blue-200 text-sm">
                    {t("auth.accountSecurityDescription")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <KeyRound className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{t("auth.quickAccess")}</h3>
                  <p className="text-blue-200 text-sm">
                    {t("auth.quickAccessDescription")}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Reset Password Form */}
          <motion.div
            className="w-full max-w-md mx-auto lg:mx-0"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* Mobile Logo */}
            <motion.div
              className="lg:hidden text-center mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12">
                  <img
                    src="/lovewaylogistic.png"
                    alt="Loveway Logistics"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <h1 className="text-2xl font-bold text-white">
                  Loveway Logistics
                </h1>
              </div>
              <p className="text-blue-200 text-sm">
                Professional Logistics Management Platform
              </p>
            </motion.div>

            {/* Reset Password Card */}
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
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900">
                        {t("auth.setNewPassword")}
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        {t("auth.enterNewPassword")}
                      </CardDescription>
                    </div>
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <Label
                        htmlFor="newPassword"
                        className="text-sm font-semibold text-gray-700"
                      >
                        {t("auth.newPassword")} *
                      </Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder={t("auth.newPassword")}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          autoComplete="new-password"
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
                      <p className="text-xs text-gray-500 pl-1">
                        {t("auth.minimumPasswordLength")}
                      </p>
                    </motion.div>

                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
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
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          autoComplete="new-password"
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
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            {t("auth.resetting")}
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            {t("auth.resetPassword")}
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
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <p className="text-sm text-gray-600 mb-2">
                      {t("auth.rememberPassword")}
                    </p>
                    <Link
                      to="/login"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors inline-flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      {t("auth.signIn")}
                    </Link>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Footer */}
            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <p className="text-sm text-white/80 mb-3">
                © 2024 Loveway Logistics. Professional logistics management made
                simple.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
