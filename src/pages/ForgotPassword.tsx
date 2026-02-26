import React, { useState, useEffect } from "react";
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
  Mail,
  ArrowLeft,
  CheckCircle,
  Clock,
  ArrowRight,
  KeyRound,
  Shield,
  Zap,
} from "lucide-react";
import { customToast } from "@/lib/utils/toast";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageSwitcher } from "@/lib/i18n/LanguageSwitcher";
import { useRequestPasswordReset } from "@/lib/api/hooks";
import { motion } from "framer-motion";

export default function ForgotPassword() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  // API hook for password reset request
  const requestPasswordResetMutation = useRequestPasswordReset();

  // Timer effect for resend functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await requestPasswordResetMutation.mutateAsync(email);

      if (result.success) {
        customToast.success(t("auth.passwordResetSent"));
        setIsSubmitted(true);
        setResendTimer(60); // 60 seconds timer
        setCanResend(false);
      } else {
        customToast.error(result.message || t("auth.passwordResetFailed"));
      }
    } catch (error: any) {
      console.error("Password reset request error:", error);
      customToast.error(
        error?.error?.message || error?.message || t("auth.passwordResetFailed")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);

    try {
      const result = await requestPasswordResetMutation.mutateAsync(email);

      if (result.success) {
        customToast.success(t("auth.emailSentAgain"));
        setResendTimer(60); // Reset timer to 60 seconds
        setCanResend(false);
      } else {
        customToast.error(result.message || t("auth.passwordResetFailed"));
      }
    } catch (error: any) {
      console.error("Resend password reset error:", error);
      customToast.error(
        error?.error?.message || error?.message || t("auth.passwordResetFailed")
      );
    } finally {
      setIsLoading(false);
    }
  };

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
                        {t("auth.checkYourEmail")}
                      </h2>
                      <p className="text-gray-600 mt-2">
                        {t("auth.passwordResetEmailSent", { email })}
                      </p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="space-y-3"
                    >
                      <p className="text-sm text-gray-600">
                        {t("auth.passwordResetInstructions")}
                      </p>
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="text-sm text-blue-800 font-medium">
                          💡 {t("auth.checkSpamFolder")}
                        </p>
                      </div>
                    </motion.div>

                    {/* Resend Email Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="pt-4 space-y-3"
                    >
                      <p className="text-sm text-gray-600">
                        {t("auth.didntReceiveEmail")}
                      </p>

                      {canResend ? (
                        <Button
                          onClick={handleResendEmail}
                          disabled={isLoading}
                          variant="outline"
                          className="w-full rounded-full py-6 text-base font-semibold border-2 hover:bg-gray-50 transition-all duration-300"
                        >
                          {isLoading ? (
                            <span className="flex items-center gap-2">
                              <Clock className="h-4 w-4 animate-spin" />
                              {t("auth.sending")}
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              <Mail className="h-4 w-4" />
                              {t("auth.sendAnotherEmail")}
                            </span>
                          )}
                        </Button>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-full px-4 py-3">
                          <Clock className="h-4 w-4" />
                          <span>
                            {t("auth.resendIn")} {resendTimer}{" "}
                            {t("auth.seconds")}
                          </span>
                        </div>
                      )}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
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
                  <KeyRound className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{t("auth.securePasswordReset")}</h3>
                  <p className="text-blue-200 text-sm">
                    {t("auth.securePasswordResetDescription")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{t("auth.safeAndProtected")}</h3>
                  <p className="text-blue-200 text-sm">
                    {t("auth.safeAndProtectedDescription")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{t("auth.quickRecovery")}</h3>
                  <p className="text-blue-200 text-sm">
                    {t("auth.quickRecoveryDescription")}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Forgot Password Form */}
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

            {/* Forgot Password Card */}
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
                      <KeyRound className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900">
                        {t("auth.forgotPassword")}
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        {t("auth.passwordResetDescription")}
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
                        htmlFor="email"
                        className="text-sm font-semibold text-gray-700"
                      >
                        {t("auth.email")}
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder={t("auth.email")}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="rounded-full px-4 py-3 pl-10 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-semibold"
                        />
                      </div>
                      <p className="text-xs text-gray-500 pl-1">
                        {t("auth.enterEmailToReset")}
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            {t("auth.sending")}
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            {t("auth.sendResetLink")}
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
                    transition={{ duration: 0.5, delay: 0.5 }}
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
              transition={{ duration: 0.5, delay: 0.6 }}
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
