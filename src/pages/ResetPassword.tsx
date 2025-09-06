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
import { Lock, ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react";
import { customToast } from "@/lib/utils/toast";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageSwitcher } from "@/lib/i18n/LanguageSwitcher";
import { useResetPassword } from "@/lib/api/hooks";

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
                  {t("auth.passwordResetSuccess")}
                </h2>
                <p className="text-muted-foreground">
                  {t("auth.passwordResetComplete")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("auth.redirectingToLogin")}
                </p>
                <div className="pt-4">
                  <Link to="/login">
                    <Button className="w-full">{t("auth.backToLogin")}</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!token) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      {/* Language Selector - Top Right */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md">
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
                {t("auth.resetPassword")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("auth.enterNewPassword")}
              </p>
            </div>
          </div>
        </div>

        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              {t("auth.setNewPassword")}
            </CardTitle>
            <CardDescription>
              {t("auth.passwordResetDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">{t("auth.newPassword")}</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("auth.newPassword")}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {t("auth.confirmPassword")}
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
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t("auth.resetting") : t("auth.resetPassword")}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              {t("auth.rememberPassword")}{" "}
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
