import React from "react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/seo/SEO";

export default function DeleteAccountPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Delete Account"
        description="How to delete your Loveway Logistics account and data."
        url="https://lovewaylogistics.com/delete-account"
        type="website"
      />

      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-foreground">Delete Account</h1>
        <p className="mt-4 text-muted-foreground">
          You can delete your Loveway Logistics account at any time.
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none mt-8">
          <h2>Option 1: Delete inside the app (recommended)</h2>
          <ol>
            <li>Log in to the app.</li>
            <li>
              Go to <strong>Profile</strong> → <strong>Settings</strong>.
            </li>
            <li>
              Under <strong>Danger Zone</strong>, choose{" "}
              <strong>Delete account</strong>.
            </li>
            <li>
              Confirm by typing <strong>DELETE</strong> and complete the
              process.
            </li>
          </ol>

          <p>
            Go to: <Link to="/profile">Profile</Link>
          </p>

          <h2>Option 2: Request deletion via support</h2>
          <p>
            If you cannot access your account, email us from the email address
            associated with your account and request deletion.
          </p>
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
