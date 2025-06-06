import { Shield, Eye, Database, Cloud, Lock, UserCheck, Download, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StorageUsageInfo } from "@/components/StorageUsageInfo";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Shield className="text-accent-primary" size={32} />
          <h1 className="text-3xl font-bold text-text-primary">Privacy Policy</h1>
        </div>
        <p className="text-text-secondary max-w-2xl mx-auto">
          Your privacy is fundamental to how IsoList works. This policy explains what data we collect,
          how we use it, and your rights regarding your information.
        </p>
        <div className="text-sm text-text-muted">
          Last updated: June 6, 2025 • <StorageUsageInfo />
        </div>
      </div>

      {/* Data Collection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="text-info" size={20} />
            What Data We Collect
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-accent-primary-soft/10 border border-accent-primary-soft rounded-lg p-4">
              <h3 className="font-medium text-text-primary mb-2">Media Tracking Data</h3>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>• Movie, series, and anime titles you track</li>
                <li>• Your ratings, notes, and viewing progress</li>
                <li>• Watch dates and completion status</li>
                <li>• Personal lists and categories</li>
              </ul>
            </div>

            <div className="bg-info-soft/10 border border-info-soft rounded-lg p-4">
              <h3 className="font-medium text-text-primary mb-2">Account Information</h3>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>• Google account email address</li>
                <li>• Display name and profile picture</li>
                <li>• Authentication tokens (temporary)</li>
                <li>• Sync preferences and settings</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How We Use Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="text-success" size={20} />
            How We Use Your Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-success-soft rounded-lg flex items-center justify-center mx-auto">
                <Cloud size={20} className="text-success" />
              </div>
              <h3 className="font-medium text-text-primary">Cloud Sync</h3>
              <p className="text-sm text-text-secondary">
                Sync your media lists across devices using your Google Drive
              </p>
            </div>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-info-soft rounded-lg flex items-center justify-center mx-auto">
                <Database size={20} className="text-info" />
              </div>
              <h3 className="font-medium text-text-primary">Local Storage</h3>
              <p className="text-sm text-text-secondary">
                Store your data locally for offline access and faster loading
              </p>
            </div>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-warning-soft rounded-lg flex items-center justify-center mx-auto">
                <UserCheck size={20} className="text-warning" />
              </div>
              <h3 className="font-medium text-text-primary">Authentication</h3>
              <p className="text-sm text-text-secondary">
                Verify your identity to access your personal media data
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="text-warning" size={20} />
            Data Security & Storage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-success-soft/20 border border-success-soft rounded-lg p-4">
            <h3 className="font-medium text-success mb-2">Your Data is Secure</h3>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• Stored in your personal Google Drive (not our servers)</li>
              <li>• Encrypted in transit using HTTPS/TLS</li>
              <li>• OAuth 2.0 authentication with limited scopes</li>
              <li>• No third-party data sharing</li>
            </ul>
          </div>

          <div className="bg-info-soft/20 border border-info-soft rounded-lg p-4">
            <h3 className="font-medium text-info mb-2">Where Your Data Lives</h3>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>
                • <strong>Primary:</strong> Your Google Drive account
              </li>
              <li>
                • <strong>Local:</strong> Your browser's local storage (for offline access)
              </li>
              <li>
                • <strong>Our servers:</strong> No personal data stored
              </li>
              <li>
                • <strong>Backups:</strong> Automatic backups in your Google Drive
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Your Rights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="text-accent-primary" size={20} />
            Your Rights & Control
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-medium text-text-primary">Data Access & Control</h3>
              <ul className="text-sm text-text-secondary space-y-2">
                <li className="flex items-start gap-2">
                  <Lock size={16} className="text-warning mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Revoke Access:</strong> Disconnect IsoList from your Google account anytime
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Trash2 size={16} className="text-error mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Delete Data:</strong> Remove the IsoList folder from your Google Drive
                    manually
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Download size={16} className="text-accent-primary mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Download:</strong> Access your data files directly from Google Drive
                  </span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-text-primary">How to Delete Your Data</h3>
              <div className="space-y-3 text-sm">
                <div className="bg-info-soft/20 border border-info-soft rounded-lg p-3">
                  <h4 className="font-medium text-info mb-2">Step-by-step deletion:</h4>
                  <ol className="text-text-secondary space-y-1 list-decimal list-inside">
                    <li>
                      Go to{" "}
                      <a
                        href="https://drive.google.com"
                        target="_blank"
                        className="text-accent-primary hover:underline"
                      >
                        drive.google.com
                      </a>
                    </li>
                    <li>Look for the "IsoList" folder in your Drive</li>
                    <li>Right-click the folder and select "Move to trash"</li>
                    <li>Empty your Google Drive trash to permanently delete</li>
                  </ol>
                </div>

                <div className="bg-warning-soft/20 border border-warning-soft rounded-lg p-3">
                  <h4 className="font-medium text-warning mb-2">Revoke App Access:</h4>
                  <p className="text-text-secondary text-sm mb-2">
                    To prevent IsoList from accessing your Google Drive in the future:
                  </p>
                  <ol className="text-text-secondary space-y-1 list-decimal list-inside text-sm">
                    <li>
                      Visit{" "}
                      <a
                        href="https://myaccount.google.com/permissions"
                        target="_blank"
                        className="text-accent-primary hover:underline"
                      >
                        myaccount.google.com/permissions
                      </a>
                    </li>
                    <li>Find "IsoList" in your connected apps</li>
                    <li>Click "Remove access"</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-success-soft/20 border border-success-soft rounded-lg p-4">
            <h3 className="font-medium text-success mb-2">What Happens When You Delete</h3>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• Deleting the IsoList folder removes all your tracking data from Google Drive</li>
              <li>• Your local browser data will remain until you clear it or use a different device</li>
              <li>• You can continue using IsoList offline with your local data</li>
              <li>• Revoking access prevents IsoList from creating new files or syncing</li>
              <li>
                • You can always reconnect later - your locally stored data will sync to a new folder
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Google Drive Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="text-info" size={20} />
            Google Drive Permissions Explained
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-success-soft/20 border border-success-soft rounded-lg p-4">
              <h3 className="font-medium text-success mb-2">IsoList CAN </h3>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>• Access files created by IsoList only</li>
                <li>• Access your basic profile public information</li>
                <li>• Create backup files in your Drive</li>
                <li>• Update your media tracking data</li>
              </ul>
            </div>

            <div className="bg-error-soft/20 border border-error-soft rounded-lg p-4">
              <h3 className="font-medium text-error mb-2">IsoList CANNOT Access</h3>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>• Your existing Google Drive files</li>
                <li>• Photos, documents, or spreadsheets</li>
                <li>• Files created by other apps</li>
                <li>• Gmail, Calendar, or other services</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Questions or Concerns?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-text-secondary mb-4">
            If you have questions about this privacy policy or how we handle your data, feel free to
            reach out.
          </p>
          <div className="flex flex-wrap gap-4 mt-4">
            <a
              href="mailto:privacy@isolist.app"
              className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary-hover transition-colors"
            >
              Contact Privacy Team
            </a>
            <a
              href="/about"
              className="px-4 py-2 border border-border-interactive rounded-lg hover:bg-bg-layer-1 transition-colors"
            >
              Learn More About IsoList
            </a>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
