"use client";

import { useEffect, useState } from "react";
import {
  Cloud,
  CloudOff,
  RotateCcw,
  Check,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useMediaStore } from "@/lib/store";
import { AuthService } from "@/lib/auth";
import { StorageUsageInfo } from "./StorageUsageInfo";

export function SyncStatusIndicator() {
  const { syncStatus, manualSync, forceRefresh, isLoading } = useMediaStore();
  const [showDetails, setShowDetails] = useState(false);
  const authService = AuthService.getInstance();

  if (!authService.isAuthenticated()) {
    return null; // Don't show sync status if not authenticated
  }

  const handleManualSync = async () => {
    await manualSync();
  };

  const handleForceRefresh = async () => {
    if (
      confirm("This will replace your local data with cloud data. Continue?")
    ) {
      await forceRefresh();
    }
  };

  const getStatusIcon = () => {
    if (isLoading) {
      return (
        <RotateCcw size={16} className="animate-spin text-accent-primary" />
      );
    }

    if (!syncStatus.isSync) {
      return <CloudOff size={16} className="text-text-muted" />;
    }

    if (syncStatus.hasLocalChanges) {
      return <AlertCircle size={16} className="text-warning" />;
    }

    return <Check size={16} className="text-success" />;
  };

  const getStatusText = () => {
    if (isLoading) return "Syncing...";
    if (!syncStatus.isSync) return "Offline";
    if (syncStatus.hasLocalChanges) return "Changes pending";
    return "Synced";
  };

  return (
    <div
      className="fixed bottom-4 right-4 z-50"
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      <div className="fluent-glass px-3 py-2 rounded-lg shadow-fluent-popup flex items-center gap-2">
        {getStatusIcon()}
        <span className="text-sm text-text-secondary">{getStatusText()}</span>

        {/* Action buttons */}
        <div className="flex gap-1 ml-2">
          {syncStatus.hasLocalChanges && !isLoading && (
            <button
              onClick={handleManualSync}
              className="p-1 hover:bg-accent-primary-soft/20 rounded transition-colors duration-short"
              title="Sync now"
            >
              <Cloud size={14} className="text-accent-primary" />
            </button>
          )}

          <button
            onClick={handleForceRefresh}
            className="p-1 hover:bg-info-soft/20 rounded transition-colors duration-short"
            title="Force refresh from cloud"
          >
            <RefreshCw size={14} className="text-info" />
          </button>
        </div>
      </div>

      {/* Detailed status tooltip */}
      {showDetails && (
        <div className="absolute bottom-full right-0 mb-2 p-3 fluent-glass rounded-lg shadow-fluent-popup min-w-[200px] text-xs">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-text-muted">Status:</span>
              <span className="text-text-primary">{getStatusText()}</span>
            </div>
            {syncStatus.lastSync && (
              <div className="flex justify-between">
                <span className="text-text-muted">Last sync:</span>
                <span className="text-text-primary">
                  {syncStatus.lastSync.toLocaleTimeString()}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-text-muted">Account:</span>
              <span className="text-text-primary">
                {authService.getUser()?.email?.split("@")[0] || "Unknown"}
              </span>
            </div>
            <div className="border-t border-border-divider pt-2">
              <StorageUsageInfo />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
