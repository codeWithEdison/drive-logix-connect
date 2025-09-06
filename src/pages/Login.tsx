import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff } from "lucide-react";
import { customToast } from "@/lib/utils/toast";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageSwitcher } from "@/lib/i18n/LanguageSwitcher";

export default function Login() {
  const { login, isLoading } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await login(email, password);
    if (success) {
      customToast.success(t("auth.loginSuccess"));
      // Navigation will be handled by AuthContext after successful login
      // The user data is already stored in AuthContext
    } else {
      customToast.error(t("auth.invalidCredentials"));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      {/* Language Selector - Top Right */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-4xl space-y-6">
        {/* Header - Logo and Title on same row */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-4">
            <img
              src="/lovewaylogistic.png"
              alt="Loveway Logistics"
              className="w-12 h-12 object-contain"
            />
            <div className="text-left">
              <h1 className="text-3xl font-bold text-foreground">
                Loveway Logistics
              </h1>
              <p className="text-sm text-muted-foreground">
                Professional Logistics Management Platform
              </p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto">
          {/* Regular Login */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>{t("auth.signIn")}</CardTitle>
              <CardDescription>{t("auth.enterCredentials")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
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
                <div className="space-y-2">
                  <Label htmlFor="password">{t("auth.password")}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t("auth.password")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
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
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t("auth.signingIn") : t("auth.signIn")}
                </Button>
              </form>

              <div className="mt-4 text-center text-sm text-muted-foreground">
                <div className="mt-2">
                  <Link
                    to="/forgot-password"
                    className="text-primary hover:underline"
                  >
                    {t("auth.forgotPassword")}
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            © 2024 Loveway Logistics. Professional logistics management made
            simple.
          </p>
          <div className="mt-2">
            <Link to="/register" className="text-primary hover:underline">
              {t("auth.dontHaveAccount")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
