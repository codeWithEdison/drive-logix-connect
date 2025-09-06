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
import { Mail, ArrowLeft, CheckCircle, Clock } from "lucide-react";
import { customToast } from "@/lib/utils/toast";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageSwitcher } from "@/lib/i18n/LanguageSwitcher";
import { useRequestPasswordReset } from "@/lib/api/hooks";

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
                  {t("auth.checkYourEmail")}
                </h2>
                <p className="text-muted-foreground">
                  {t("auth.passwordResetEmailSent", { email })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("auth.passwordResetInstructions")}
                </p>
                <p className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <strong>💡 {t("auth.checkSpamFolder")}</strong>
                </p>

                {/* Resend Email Section */}
                <div className="pt-4 space-y-3">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      {t("auth.didntReceiveEmail")}
                    </p>

                    {canResend ? (
                      <Button
                        onClick={handleResendEmail}
                        disabled={isLoading}
                        variant="outline"
                        className="w-full"
                      >
                        {isLoading ? (
                          <>
                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                            {t("auth.sending")}
                          </>
                        ) : (
                          <>
                            <Mail className="h-4 w-4 mr-2" />
                            {t("auth.sendAnotherEmail")}
                          </>
                        )}
                      </Button>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          {t("auth.resendIn")} {resendTimer} {t("auth.seconds")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-4">
                  <Link to="/login">
                    <Button variant="outline" className="w-full">
                      <ArrowLeft className="h-4 w-4 mr-2" />
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
                {t("auth.forgotPassword")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("auth.enterEmailToReset")}
              </p>
            </div>
          </div>
        </div>

        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {t("auth.resetPassword")}
            </CardTitle>
            <CardDescription>
              {t("auth.passwordResetDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("auth.email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t("auth.sending") : t("auth.sendResetLink")}
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
