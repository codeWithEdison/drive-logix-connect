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
import { Mail, ArrowLeft, CheckCircle, Clock, RefreshCw } from "lucide-react";
import { customToast } from "@/lib/utils/toast";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageSwitcher } from "@/lib/i18n/LanguageSwitcher";
import { useVerifyEmail, useResendVerification } from "@/lib/api/hooks";

export default function VerifyEmail() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verificationToken, setVerificationToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  // Get email from URL parameters
  const email = searchParams.get("email");

  // API hooks
  const verifyEmailMutation = useVerifyEmail();
  const resendVerificationMutation = useResendVerification();

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

  // Check if email exists
  useEffect(() => {
    if (!email) {
      customToast.error(t("auth.emailRequired"));
      navigate("/register");
    }
  }, [email, navigate, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationToken.trim()) {
      customToast.error(t("auth.verificationTokenRequired"));
      return;
    }

    setIsLoading(true);

    try {
      const result = await verifyEmailMutation.mutateAsync(verificationToken);

      if (result.success) {
        customToast.success(t("auth.emailVerified"));
        setIsSuccess(true);
        // Redirect to login immediately after successful verification
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        customToast.error(result.message || t("auth.verificationFailed"));
      }
    } catch (error: any) {
      console.error("Email verification error:", error);
      customToast.error(
        error?.error?.message || error?.message || t("auth.verificationFailed")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) return;

    setIsLoading(true);

    try {
      const result = await resendVerificationMutation.mutateAsync(email);

      if (result.success) {
        customToast.success(t("auth.verificationEmailSentAgain"));
        setResendTimer(60); // Reset timer to 60 seconds
        setCanResend(false);
      } else {
        customToast.error(result.message || t("auth.resendVerificationFailed"));
      }
    } catch (error: any) {
      console.error("Resend verification error:", error);
      customToast.error(
        error?.error?.message ||
          error?.message ||
          t("auth.resendVerificationFailed")
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
                  {t("auth.emailVerified")}
                </h2>
                <p className="text-muted-foreground">
                  {t("auth.verificationSuccess")}
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

  if (!email) {
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
                {t("auth.emailVerification")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("auth.verifyEmailTitle")}
              </p>
            </div>
          </div>
        </div>

        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {t("auth.verifyEmailTitle")}
            </CardTitle>
            <CardDescription>
              {t("auth.verifyEmailDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Email Info */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>{t("auth.verificationEmailSent", { email })}</strong>
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                  {t("auth.verificationInstructions")}
                </p>
              </div>

              {/* Verification Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verificationToken">
                    {t("auth.verificationToken")}
                  </Label>
                  <Input
                    id="verificationToken"
                    placeholder={t("auth.enterVerificationToken")}
                    value={verificationToken}
                    onChange={(e) => setVerificationToken(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      {t("auth.verifying")}
                    </>
                  ) : (
                    t("auth.verifyEmail")
                  )}
                </Button>
              </form>

              {/* Resend Section */}
              <div className="pt-4 space-y-3">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    {t("auth.didntReceiveEmail")}
                  </p>

                  {canResend ? (
                    <Button
                      onClick={handleResendVerification}
                      disabled={isLoading}
                      variant="outline"
                      className="w-full"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          {t("auth.sending")}
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          {t("auth.resendVerification")}
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
