"use client";

import { useGlobalToast } from "@/contexts/ToastContext";
import type { SyncConflict } from "@/lib/sync-manager";
import { AlertTriangle, Cloud, GitMerge, HardDrive, X } from "lucide-react";
import { useState } from "react";

interface ConflictDialogProps {
  isOpen: boolean;
  conflict: SyncConflict | null;
  onResolve: (choice: "local" | "cloud" | "merge" | "cancel") => void;
  onClose: () => void;
}

export function ConflictDialog({
  isOpen,
  conflict,
  onResolve,
  onClose,
}: ConflictDialogProps) {
  const [selectedChoice, setSelectedChoice] = useState<
    "local" | "cloud" | "merge" | null
  >(null);
  const [isResolving, setIsResolving] = useState(false);
  const { toast } = useGlobalToast();

  if (!isOpen || !conflict) return null;

  const handleResolve = async () => {
    if (!selectedChoice) return;

    setIsResolving(true);

    try {
      onResolve(selectedChoice);
      setSelectedChoice(null);
      onClose();
    } catch (error) {
      console.error("Conflict resolution failed:", error);
      toast.error(
        "Conflict Resolution Failed",
        `Failed to resolve conflict: ${error}`
      );
    } finally {
      setIsResolving(false);
    }
  };

  const handleCancel = () => {
    onResolve("cancel");
    setSelectedChoice(null);
    onClose();
  };

  const getConflictDescription = () => {
    if (!conflict) return "";

    if (conflict.type === "real-conflict") {
      const conflictCount = conflict.conflictedItems.length;
      return `Found ${conflictCount} item(s) that have been modified differently in local storage and cloud. These need manual resolution.`;
    }
    return "Some items have been deleted in one location but modified in another. Please choose how to handle these conflicts.";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-bg-base border border-border-interactive rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border-divider">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-warning" size={24} />
            <h2 className="text-xl font-semibold text-text-primary">
              Data Sync Conflict
            </h2>
            <button
              type="button"
              onClick={handleCancel}
              className="ml-auto p-1 hover:bg-bg-layer-1 rounded transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="bg-warning-soft/20 border border-warning-soft rounded-lg p-4 mb-6">
            <p className="text-sm text-text-secondary">
              {getConflictDescription()}
            </p>
          </div>

          {conflict.conflictedItems.length > 0 && (
            <div className="mt-4 p-4 bg-error-soft/20 border border-error-soft rounded-lg">
              <h4 className="font-medium text-text-primary mb-2">
                Conflicted Items ({conflict.conflictedItems.length})
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {conflict.conflictedItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="font-medium">{item.title}</span>
                    <span className="text-xs px-2 py-1 bg-error-soft rounded">
                      {item.conflictType}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="border border-border-interactive rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <HardDrive size={16} className="text-text-secondary" />
                <span className="font-medium">Local Data</span>
                <span className="ml-auto text-sm text-text-muted">
                  {conflict.local.count} items
                </span>
              </div>

              {conflict.local.items.length > 0 ? (
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {conflict.local.items.slice(0, 3).map((item, index) => (
                    <div
                      key={index}
                      className="text-sm text-text-secondary truncate"
                    >
                      • {item.title}
                    </div>
                  ))}
                  {conflict.local.items.length > 3 && (
                    <div className="text-xs text-text-muted">
                      +{conflict.local.items.length - 3} more...
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-text-muted italic">
                  No local data
                </div>
              )}
            </div>

            {/* Cloud Data */}
            <div className="border border-border-interactive rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Cloud size={16} className="text-info" />
                <span className="font-medium">Cloud Data</span>
                <span className="ml-auto text-sm text-text-muted">
                  {conflict.cloud.count} items
                </span>
              </div>

              {conflict.cloud.items.length > 0 ? (
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {conflict.cloud.items.slice(0, 3).map((item, index) => (
                    <div
                      key={index}
                      className="text-sm text-text-secondary truncate"
                    >
                      • {item.title}
                    </div>
                  ))}
                  {conflict.cloud.items.length > 3 && (
                    <div className="text-xs text-text-muted">
                      +{conflict.cloud.items.length - 3} more...
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-text-muted italic">
                  No cloud data
                </div>
              )}
            </div>
          </div>

          {/* Resolution Options */}
          <div className="space-y-3">
            <h3 className="font-medium text-text-primary">
              Choose resolution:
            </h3>
            {/* Use Local */}
            {conflict.local.count > 0 && (
              <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-bg-layer-1 transition-colors">
                <input
                  type="radio"
                  name="resolution"
                  value="local"
                  checked={selectedChoice === "local"}
                  onChange={() => setSelectedChoice("local")}
                  className="mt-1"
                />
                <div>
                  <div className="flex items-center gap-2 font-medium text-text-primary">
                    <HardDrive size={16} />
                    Use Local Data
                  </div>
                  <p className="text-sm text-text-secondary mt-1">
                    Keep local data (from your browser) and upload to Google
                    Drive
                  </p>
                </div>
              </label>
            )}

            {/* Use Cloud */}
            {conflict.cloud.count > 0 && (
              <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-bg-layer-1 transition-colors">
                <input
                  type="radio"
                  name="resolution"
                  value="cloud"
                  checked={selectedChoice === "cloud"}
                  onChange={() => setSelectedChoice("cloud")}
                  className="mt-1"
                />
                <div>
                  <div className="flex items-center gap-2 font-medium text-text-primary">
                    <Cloud size={16} />
                    Use Cloud Data
                  </div>
                  <p className="text-sm text-text-secondary mt-1">
                    Download cloud data and replace local
                  </p>
                </div>
              </label>
            )}

            {/* TODO: Verify algorithm for merging */}
            {/* {conflict.local.count > 0 && conflict.cloud.count > 0 && (
              <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-bg-layer-1 transition-colors">
                <input
                  type="radio"
                  name="resolution"
                  value="merge"
                  checked={selectedChoice === "merge"}
                  onChange={() => setSelectedChoice("merge")}
                  className="mt-1"
                />
                <div>
                  <div className="flex items-center gap-2 font-medium text-text-primary">
                    <GitMerge size={16} />
                    Merge Both
                  </div>
                  <p className="text-sm text-text-secondary mt-1">
                    Combine local and cloud data
                  </p>
                </div>
              </label>
            )} */}
          </div>
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="p-6 border-t border-border-divider bg-bg-layer-1">
          <div className="flex justify-between gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isResolving}
              className="px-4 py-2 border border-border-interactive rounded-lg hover:bg-bg-layer-2 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleResolve}
              disabled={!selectedChoice || isResolving}
              className="px-6 py-2 bg-accent-primary hover:bg-accent-primary-hover text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isResolving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Resolving...
                </>
              ) : (
                "Resolve Conflict"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
