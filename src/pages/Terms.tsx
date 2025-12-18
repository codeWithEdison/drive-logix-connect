import React from "react";
import { SEO } from "@/components/seo/SEO";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Terms and Conditions"
        description="Terms and Conditions for Loveway Logistics cargo tracking and logistics platform."
        url="https://lovewaylogistics.com/terms"
        type="website"
      />

      <PublicHeader />

      <div className="max-w-4xl mx-auto px-4 py-10 mt-20">
        <h1 className="text-3xl font-bold text-foreground">
          Terms and Conditions
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Effective date: {new Date().getFullYear()}-01-01
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none mt-8">
          <p>
            These Terms and Conditions ("Terms") govern your use of the Loveway
            Logistics website and mobile application (the "Service"). By using
            the Service, you agree to these Terms.
          </p>

          <h2>Eligibility and accounts</h2>
          <ul>
            <li>You must provide accurate information and keep it updated.</li>
            <li>
              You are responsible for maintaining account confidentiality.
            </li>
          </ul>

          <h2>Shipments and tracking</h2>
          <ul>
            <li>Shipment details you submit must be accurate and lawful.</li>
            <li>
              Tracking information is provided for convenience and may be
              affected by network/device availability.
            </li>
          </ul>

          <h2>Payments</h2>
          <ul>
            <li>
              Some services may require payment. Payment processing may be
              handled by third-party providers.
            </li>
            <li>
              You agree to pay applicable fees and taxes associated with your
              transactions.
            </li>
          </ul>

          <h2>Acceptable use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>
              Use the Service for unlawful, harmful, or fraudulent activity.
            </li>
            <li>
              Attempt to access accounts or data you are not authorized to
              access.
            </li>
            <li>Interfere with the Service or attempt to bypass security.</li>
          </ul>

          <h2>Intellectual property</h2>
          <p>
            The Service and its content are owned by Loveway Logistics or its
            licensors and are protected by applicable laws.
          </p>

          <h2>Disclaimer and limitation of liability</h2>
          <p>
            The Service is provided "as is" and "as available". To the maximum
            extent permitted by law, Loveway Logistics is not liable for
            indirect, incidental, special, or consequential damages.
          </p>

          <h2>Termination</h2>
          <p>
            We may suspend or terminate access to the Service if you violate
            these Terms or if needed to protect the Service or users.
          </p>

          <h2>Changes</h2>
          <p>
            We may update these Terms from time to time. Continued use of the
            Service after updates means you accept the updated Terms.
          </p>

          <h2>Contact</h2>
          <p>For questions about these Terms, contact us at:</p>
          <ul>
            <li>
              Email:{" "}
              <a href="mailto:support@lovewaylogistics.com">
                support@lovewaylogistics.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
