export function PrivacyInfoDialog() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Shield className="text-success" size={20} />
        Your Data Privacy
      </h3>

      <div className="space-y-3 text-sm">
        <div className="bg-success-soft/20 border border-success-soft rounded-lg p-4">
          <h4 className="font-medium text-success mb-2">✅ What IsoList CAN access:</h4>
          <ul className="space-y-1 text-text-secondary">
            <li>• Only files created by IsoList (your media tracking data)</li>
            <li>• Your basic profile info (name, email, profile picture)</li>
            <li>• Create new files in your Google Drive for backups</li>
          </ul>
        </div>

        <div className="bg-error-soft/20 border border-error-soft rounded-lg p-4">
          <h4 className="font-medium text-error mb-2">❌ What IsoList CANNOT access:</h4>
          <ul className="space-y-1 text-text-secondary">
            <li>• Your existing Google Drive files, photos, or documents</li>
            <li>• Files created by other apps</li>
            <li>• Your Gmail, Calendar, or other Google services</li>
            <li>• Files on your computer's hard drive</li>
            <li>• Your browsing history or other personal data</li>
          </ul>
        </div>

        <div className="bg-info-soft/20 border border-info-soft rounded-lg p-4">
          <h4 className="font-medium text-info mb-2">📊 Storage Impact:</h4>
          <ul className="space-y-1 text-text-secondary">
            <li>• IsoList creates small JSON files (typically &lt; 1MB)</li>
            <li>• Files count toward your Google Drive storage quota</li>
            <li>• You can delete IsoList files anytime from your Drive</li>
            <li>• Average user impact: negligible (few KB per backup)</li>
          </ul>
        </div>

        <div className="bg-warning-soft/20 border border-warning-soft rounded-lg p-4">
          <h4 className="font-medium text-warning mb-2">🔒 Your Control:</h4>
          <ul className="space-y-1 text-text-secondary">
            <li>
              • Revoke access anytime at{" "}
              <a
                href="https://myaccount.google.com/permissions"
                className="text-accent-primary hover:underline"
                target="_blank"
              >
                myaccount.google.com/permissions
              </a>
            </li>
            <li>• Delete IsoList files from your Google Drive manually</li>
            <li>• Export your data before disconnecting</li>
            <li>• No vendor lock-in - your data remains yours</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
