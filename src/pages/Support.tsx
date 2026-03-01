import React from "react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/seo/SEO";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Mail, MessageCircle, ArrowLeft, HelpCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Support() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={t("support.pageTitle")}
        description={t("support.pageDescription")}
        url="https://lovewaylogistics.com/support"
        type="website"
      />

      <PublicHeader />

      <div className="max-w-4xl mx-auto px-4 py-10 mt-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("support.backToHome")}
        </Link>

        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <HelpCircle className="w-8 h-8 text-primary" />
          {t("support.title")}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {t("support.subtitle")}
        </p>

        <div className="mt-10 space-y-8">
          <section className="rounded-xl border bg-card p-6 md:p-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              {t("support.contactUs")}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t("support.contactIntro")}
            </p>
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6">
              <a
                href="mailto:support@lovewaylogistics.com"
                className="flex items-start gap-4 p-4 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{t("support.email")}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    support@lovewaylogistics.com
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {t("support.emailNote")}
                  </p>
                </div>
              </a>
              <a
                href="mailto:info@lovewaylogistics.com"
                className="flex items-start gap-4 p-4 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{t("support.generalInquiry")}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    info@lovewaylogistics.com
                  </p>
                </div>
              </a>
            </div>
          </section>

          <section className="rounded-xl border bg-card p-6 md:p-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              {t("support.whatWeHelpWith")}
            </h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                {t("support.helpItems.tracking")}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                {t("support.helpItems.shipment")}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                {t("support.helpItems.payment")}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                {t("support.helpItems.account")}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                {t("support.helpItems.other")}
              </li>
            </ul>
          </section>

          <section className="rounded-xl border bg-card p-6 md:p-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              {t("support.otherLinks")}
            </h2>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/privacy"
                className="text-primary hover:underline font-medium"
              >
                {t("support.links.privacy")}
              </Link>
              <Link
                to="/terms"
                className="text-primary hover:underline font-medium"
              >
                {t("support.links.terms")}
              </Link>
              <Link
                to="/"
                className="text-primary hover:underline font-medium"
              >
                {t("support.links.home")}
              </Link>
            </div>
          </section>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
