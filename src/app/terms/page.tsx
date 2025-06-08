import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, FileText, Scale, Shield, Users, Zap } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Scale className="text-accent-primary" size={32} />
          <h1 className="text-3xl font-bold text-text-primary">Terms of Service</h1>
        </div>
        <p className="text-text-secondary max-w-2xl mx-auto">
          These terms govern your use of IsoList. We've written them in plain English to make them as
          clear as possible.
        </p>
        <div className="text-sm text-text-muted">
          Last updated: June 6, 2025 • Effective: June 6, 2025
        </div>
      </div>

      <Card className="bg-accent-primary-soft/10 border-accent-primary-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="text-accent-primary" size={20} />
            The Quick Version
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-success">✓</span>
                <span>IsoList is free to use for personal purposes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success">✓</span>
                <span>Your data stays in your Google Drive</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success">✓</span>
                <span>We don't sell your data or show ads or track you in any way</span>
              </li>
            </ul>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-warning">!</span>
                <span>Don't use IsoList for anything illegal</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-warning">!</span>
                <span>We provide the service "as is"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-warning">!</span>
                <span>You're responsible for your Google account security</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="text-info" size={20} />
            Acceptance of Terms
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-text-secondary">
            By using IsoList, you agree to these terms. If you don't agree with any part of these terms,
            please don't use our service.
          </p>
          <p className="text-text-secondary">
            We may update these terms from time to time. When we do, we'll update the "Last updated" date
            at the top of this page. Continued use of IsoList after changes means you accept the new
            terms.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="text-success" size={20} />
            What IsoList Provides
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-success-soft/20 border border-success-soft rounded-lg p-4">
            <h3 className="font-medium text-success mb-2">Our Service Includes:</h3>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• A web application for tracking movies, TV series, and anime</li>
              <li>• Synchronization with your Google Drive account</li>
              <li>• Offline functionality using browser local storage</li>
            </ul>
          </div>

          <p className="text-text-secondary">
            IsoList is provided free of charge for personal, non-commercial use. We don't charge fees,
            show advertisements, or monetize your data in any way.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="text-warning" size={20} />
            Your Responsibilities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-text-primary mb-2">Account Security</h3>
              <p className="text-sm text-text-secondary">
                You're responsible for maintaining the security of your Google account. This includes
                using strong passwords, enabling two-factor authentication, and keeping your account
                information current.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-text-primary mb-2">Acceptable Use</h3>
              <p className="text-sm text-text-secondary mb-2">
                You agree to use IsoList only for lawful purposes. You will not:
              </p>
              <ul className="text-sm text-text-secondary space-y-1 ml-4">
                <li>• Use the service to track illegal content</li>
                <li>• Attempt to hack, disrupt, or damage the service</li>
                <li>• Share your account access with others</li>
                <li>• Use the service for commercial purposes without permission</li>
                <li>• Violate any applicable laws or regulations</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-text-primary mb-2">Data Backup</h3>
              <p className="text-sm text-text-secondary">
                While IsoList automatically backs up your data to Google Drive, you're responsible for
                maintaining additional backups if desired. We recommend periodically exporting your data
                as an extra precaution.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="text-info" size={20} />
            Privacy & Your Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-text-secondary">
            Your privacy is paramount to us. Please review our{" "}
            <a href="/privacy" className="text-accent-primary hover:underline">
              Privacy Policy
            </a>{" "}
            for detailed information about how we handle your data.
          </p>

          <div className="bg-info-soft/20 border border-info-soft rounded-lg p-4">
            <h3 className="font-medium text-info mb-2">Key Points:</h3>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• Your data is stored in your personal Google Drive, not on our servers</li>
              <li>• We cannot access your personal media tracking information</li>
              <li>• You can export or delete your data at any time</li>
              <li>• We use minimal Google account information for authentication only</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="text-warning" size={20} />
            Service Availability
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-text-secondary">
            We strive to keep IsoList available 24/7, but we can't guarantee uninterrupted service. The
            service may be temporarily unavailable due to:
          </p>

          <ul className="text-sm text-text-secondary space-y-1 ml-4">
            <li>• Scheduled maintenance and updates</li>
            <li>• Technical issues or server problems</li>
            <li>• Third-party service outages (Google Drive, etc.)</li>
            <li>• Force majeure events beyond our control</li>
          </ul>

          <p className="text-text-secondary">
            Since your data is stored locally and in your Google Drive, you can continue using the core
            tracking features even when our servers are unavailable.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="text-error" size={20} />
            Disclaimers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-error-soft/20 border border-error-soft rounded-lg p-4">
            <h3 className="font-medium text-error mb-2">Service "As Is"</h3>
            <p className="text-sm text-text-secondary">
              IsoList is provided "as is" without warranties of any kind. While we work hard to provide a
              reliable service, we cannot guarantee it will meet all your needs or be completely
              error-free.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-text-primary">Limitation of Liability</h3>
            <p className="text-sm text-text-secondary">
              We are not liable for any indirect, incidental, or consequential damages arising from your
              use of IsoList. This includes but is not limited to data loss, business interruption, or
              lost profits.
            </p>

            <p className="text-sm text-text-secondary">
              Our total liability to you for any claims related to IsoList will not exceed the amount you
              paid us for the service (which is currently $0, as the service is free).
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Termination</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-1 gap-4">
            <div>
              <h3 className="font-medium text-text-primary mb-2">Your Right to Terminate</h3>
              <p className="text-sm text-text-secondary">
                You can stop using IsoList at any time. To completely remove your data, revoke access to
                your Google account and delete any IsoList files from your Google Drive.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Governing Law */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Governing Law & Disputes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-text-secondary">
            These terms are governed by the laws of [Your Jurisdiction]. Any disputes will be resolved
            through binding arbitration or in the courts of [Your Jurisdiction].
          </p>

          <p className="text-text-secondary">
            Before pursuing formal dispute resolution, please contact us directly. We're committed to
            resolving issues fairly and quickly.
          </p>
        </CardContent>
      </Card> */}
    </div>
  );
}
