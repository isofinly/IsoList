"use client";

import { useEffect, useState } from "react";
import { HardDrive, Cloud } from "lucide-react";
import { useMediaStore } from "@/lib/store";

export function StorageUsageInfo() {
  const [localSize, setLocalSize] = useState<number>(0);
  const [estimatedCloudSize, setEstimatedCloudSize] = useState<number>(0);
  const { mediaItems } = useMediaStore();

  useEffect(() => {
    // Calculate local storage usage
    const mediaItemsStr = localStorage.getItem("mediaItems") || "[]";
    const allLocalData = {
      mediaItems: JSON.parse(mediaItemsStr),
      userPrefs: localStorage.getItem("userPreferences"),
      backups: localStorage.getItem("isolist-backups"),
    };

    const localSizeInBytes = new Blob([JSON.stringify(allLocalData)]).size;
    setLocalSize(localSizeInBytes);

    // Estimate cloud size (slightly larger due to metadata)
    setEstimatedCloudSize(localSizeInBytes * 1.2);
  }, [mediaItems]);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex items-center gap-4 text-xs text-text-muted">
      <div className="flex items-center gap-1">
        <HardDrive size={12} />
        <span>Local: {formatBytes(localSize)}</span>
      </div>
      <div className="flex items-center gap-1">
        <Cloud size={12} />
        <span>Cloud: ~{formatBytes(estimatedCloudSize)}</span>
      </div>
    </div>
  );
}
