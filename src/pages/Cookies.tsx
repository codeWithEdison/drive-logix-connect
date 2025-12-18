import React from "react";
import { SEO } from "@/components/seo/SEO";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Cookies Policy"
        description="Cookies Policy for Loveway Logistics website."
        url="https://lovewaylogistics.com/cookies"
        type="website"
      />

      <PublicHeader />

      <div className="max-w-4xl mx-auto px-4 py-10 mt-20">
        <h1 className="text-3xl font-bold text-foreground">Cookies Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Effective date: {new Date().getFullYear()}-01-01
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none mt-8">
          <p>
            This Cookies Policy explains how Loveway Logistics uses cookies and
            similar technologies on our website.
          </p>

          <h2>What are cookies?</h2>
          <p>
            Cookies are small text files stored on your device that help
            websites function and provide analytics and preferences.
          </p>

          <h2>How we use cookies</h2>
          <ul>
            <li>
              <strong>Essential</strong>: required for authentication and basic
              functionality.
            </li>
            <li>
              <strong>Preferences</strong>: language and UI preferences.
            </li>
            <li>
              <strong>Performance</strong>: to understand usage and improve the
              experience.
            </li>
          </ul>

          <h2>Managing cookies</h2>
          <p>
            You can control cookies through your browser settings. Disabling
            some cookies may impact parts of the Service.
          </p>

          <h2>Contact</h2>
          <p>
            If you have questions, contact:{" "}
            <a href="mailto:support@lovewaylogistics.com">
              support@lovewaylogistics.com
            </a>
          </p>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
