import React from "react";
import { SEO } from "@/components/seo/SEO";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Privacy Policy"
        description="Privacy Policy for Loveway Logistics cargo tracking and logistics platform."
        url="https://lovewaylogistics.com/privacy"
        type="website"
      />

      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Effective date: {new Date().getFullYear()}-01-01
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none mt-8">
          <p>
            This Privacy Policy explains how <strong>Loveway Logistics</strong>
            ("we", "us") collects, uses, shares, and protects information when
            you use our website and mobile app (the "Service").
          </p>

          <h2>Information we collect</h2>
          <ul>
            <li>
              <strong>Account and profile information</strong>: name, email,
              phone number, and profile details you provide.
            </li>
            <li>
              <strong>Shipment and delivery data</strong>: cargo details,
              pickup/delivery addresses, tracking identifiers, delivery status,
              and related notes.
            </li>
            <li>
              <strong>Location data (drivers and tracking)</strong>: when
              enabled, we may collect GPS location to support live tracking,
              route monitoring, and delivery confirmation.
            </li>
            <li>
              <strong>Photos and files</strong>: images you upload (e.g.,
              loading photos, delivery confirmation, receipts, signatures).
            </li>
            <li>
              <strong>Payments</strong>: payment references and status for
              invoices. Payments may be processed by third-party payment
              providers (e.g., Flutterwave). We do not store full card details.
            </li>
            <li>
              <strong>Device and usage data</strong>: device model, OS version,
              app version, IP address, language/timezone, and diagnostic logs to
              maintain security and reliability.
            </li>
          </ul>

          <h2>How we use information</h2>
          <ul>
            <li>
              Provide and operate the Service (orders, tracking, support).
            </li>
            <li>Verify users, prevent fraud, and secure accounts.</li>
            <li>Process payments and confirm transactions.</li>
            <li>
              Enable live tracking and operational monitoring (where used).
            </li>
            <li>Improve performance, reliability, and user experience.</li>
            <li>
              Send service notifications (e.g., status updates) where enabled.
            </li>
          </ul>

          <h2>Sharing of information</h2>
          <p>We may share information with:</p>
          <ul>
            <li>
              <strong>Service providers</strong> that help us run the Service
              (hosting, maps/geocoding, messaging, payments, analytics).
            </li>
            <li>
              <strong>Logistics partners</strong> involved in fulfilling your
              shipment.
            </li>
            <li>
              <strong>Legal and safety</strong>: when required by law, or to
              protect users and the Service.
            </li>
          </ul>

          <h2>Data retention</h2>
          <p>
            We retain information for as long as necessary to provide the
            Service, comply with legal obligations, resolve disputes, and
            enforce our agreements.
          </p>

          <h2>Security</h2>
          <p>
            We use reasonable technical and organizational measures to protect
            information, including encryption in transit (HTTPS) where
            supported. No method of transmission or storage is 100% secure.
          </p>

          <h2>Your choices</h2>
          <ul>
            <li>
              <strong>Permissions</strong>: you can manage location and camera
              permissions in your device settings.
            </li>
            <li>
              <strong>Account</strong>: you can update profile information in
              the app.
            </li>
            <li>
              <strong>Deletion</strong>: to request account deletion, contact us
              using the details below.
            </li>
          </ul>

          <h2>Contact</h2>
          <p>If you have questions about this Privacy Policy, contact us at:</p>
          <ul>
            <li>
              Email:{" "}
              <a href="mailto:support@lovewaylogistics.com">
                support@lovewaylogistics.com
              </a>
            </li>
            <li>
              Email:{" "}
              <a href="mailto:info@lovewaylogistics.com">
                info@lovewaylogistics.com
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
