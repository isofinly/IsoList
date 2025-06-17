import { AuthService } from "./auth";
import type { MediaItem } from "./types";

export interface SyncConflict {
  type: "real-conflict" | "deletion-conflict";
  conflictedItems: {
    id: string;
    title: string;
    local: MediaItem;
    cloud: MediaItem;
    conflictType: "modified" | "deleted-locally" | "deleted-in-cloud";
  }[];
  local: {
    items: MediaItem[];
    count: number;
    timestamp: string;
  };
  cloud: {
    items: MediaItem[];
    count: number;
    timestamp: string;
  };
  additionsOnly: {
    localOnly: MediaItem[];
    cloudOnly: MediaItem[];
  };
}

export interface BackupInfo {
  id: string;
  timestamp: string;
  items: MediaItem[];
  reason: string;
}

export class SyncManager {
  private static instance: SyncManager;
  private authService = AuthService.getInstance();

  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  // Create backup before any destructive operation
  async createBackup(items: MediaItem[], reason: string): Promise<string> {
    const backupId = `backup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const backup: BackupInfo = {
      id: backupId,
      timestamp: new Date().toISOString(),
      items: [...items], // Deep copy
      reason,
    };

    try {
      const existingBackups = this.getLocalBackups();
      existingBackups.push(backup);
      const recentBackups = existingBackups.slice(-5);
      localStorage.setItem("isolist-backups", JSON.stringify(recentBackups));
      await this.saveBackupToCloud(backup);

      return backupId;
    } catch (error) {
      console.error("Failed to create backup:", error);
      throw error;
    }
  }

  private async saveBackupToCloud(backup: BackupInfo): Promise<void> {
    if (!this.authService.isAuthenticated()) return;

    try {
      const driveService = this.authService.getDriveService();
      await driveService.saveData(
        {
          type: "backup",
          backup,
          version: 1,
        },
        `isolist-backup-${backup.id}.json`,
      );
    } catch (error) {
      console.warn("Failed to save backup to cloud:", error);
    }
  }

  getLocalBackups(): BackupInfo[] {
    try {
      const backups = localStorage.getItem("isolist-backups");
      return backups ? JSON.parse(backups) : [];
    } catch (error) {
      console.error("Failed to load backups:", error);
      return [];
    }
  }

  // TODO: Implement backup restoration logic
  async restoreFromBackup(backupId: string): Promise<MediaItem[] | null> {
    const backups = this.getLocalBackups();
    const backup = backups.find((b) => b.id === backupId);

    if (!backup) {
      console.error("Backup not found:", backupId);
      return null;
    }

    return backup.items;
  }

  async detectConflict(localItems: MediaItem[]): Promise<SyncConflict | null> {
    if (!this.authService.isAuthenticated()) return null;

    try {
      const driveService = this.authService.getDriveService();
      const cloudData = await driveService.loadData();

      const localTimestamp = localStorage.getItem("localTimestamp") || "";
      const cloudItems = cloudData?.mediaItems || [];
      const cloudTimestamp = cloudData?.lastModified || "";

      const analysis = this.analyzeDataDifferences(localItems, cloudItems);

      if (analysis.conflicts.length === 0) {
        return null;
      }

      const conflict: SyncConflict = {
        type: analysis.conflicts.some((c) => c.conflictType === "modified")
          ? "real-conflict"
          : "deletion-conflict",
        conflictedItems: analysis.conflicts,
        local: {
          items: localItems,
          count: localItems.length,
          timestamp: localTimestamp,
        },
        cloud: {
          items: cloudItems,
          count: cloudItems.length,
          timestamp: cloudTimestamp,
        },
        additionsOnly: {
          localOnly: analysis.localOnly,
          cloudOnly: analysis.cloudOnly,
        },
      };

      return conflict;
    } catch (error) {
      console.error("Failed to detect conflict:", error);
      return null;
    }
  }

  async safeSyncWithUserChoice(
    localItems: MediaItem[],
    userChoice: "local" | "cloud" | "merge" | "cancel",
  ): Promise<MediaItem[]> {
    const conflict = await this.detectConflict(localItems);
    if (!conflict) return localItems;

    await this.createBackup(conflict.cloud.items, `Before sync - user chose ${userChoice}`);

    switch (userChoice) {
      case "local": {
        await this.authService.getDriveService().saveData({
          mediaItems: localItems,
          lastModified: new Date().toISOString(),
          version: 1,
        });
        this.updateLocalTimestamp();
        return localItems;
      }

      case "cloud": {
        this.saveToLocalSafely(conflict.cloud.items);
        return conflict.cloud.items;
      }

      case "merge": {
        const merged = this.autoMergeAdditions(conflict.local.items, conflict.cloud.items);
        await this.authService.getDriveService().saveData({
          mediaItems: merged,
          lastModified: new Date().toISOString(),
          version: 1,
        });
        this.saveToLocalSafely(merged);
        return merged;
      }

      case "cancel":
        // Don't sync, keep local as-is
        return localItems;

      default:
        throw new Error("Invalid user choice");
    }
  }

  private analyzeDataDifferences(localItems: MediaItem[], cloudItems: MediaItem[]) {
    const localMap = new Map(localItems.map((item) => [item.id, item]));
    const cloudMap = new Map(cloudItems.map((item) => [item.id, item]));

    const conflicts: SyncConflict["conflictedItems"] = [];
    const localOnly: MediaItem[] = [];
    const cloudOnly: MediaItem[] = [];
    const identical: MediaItem[] = [];

    for (const localItem of localItems) {
      const cloudItem = cloudMap.get(localItem.id);

      if (!cloudItem) {
        localOnly.push(localItem);
      } else {
        // Item exists in both
        if (this.areItemsIdentical([localItem], [cloudItem])) {
          identical.push(localItem);
        } else {
          // Same item, different content
          conflicts.push({
            id: localItem.id,
            title: localItem.title,
            local: localItem,
            cloud: cloudItem,
            conflictType: "modified",
          });
        }
      }
    }

    // Check cloud items that don't exist locally
    for (const cloudItem of cloudItems) {
      if (!localMap.has(cloudItem.id)) {
        // Item only exists in cloud (new addition)
        cloudOnly.push(cloudItem);
      }
    }

    return {
      conflicts,
      localOnly,
      cloudOnly,
      identical,
    };
  }

  async intelligentSync(
    localItems: MediaItem[],
  ): Promise<{ success: boolean; items: MediaItem[]; action: string }> {
    if (!this.authService.isAuthenticated()) {
      return { success: false, items: localItems, action: "not-authenticated" };
    }

    try {
      const driveService = this.authService.getDriveService();
      const conflict = await this.detectConflict(localItems);

      if (!conflict) {
        const cloudData = await driveService.loadData();
        const cloudItems = cloudData?.mediaItems || [];

        if (cloudItems.length === 0) {
          await this.uploadToCloud(localItems);
          return {
            success: true,
            items: localItems,
            action: "uploaded-to-cloud",
          };
        }

        if (localItems.length === 0) {
          this.saveToLocalSafely(cloudItems);
          return {
            success: true,
            items: cloudItems,
            action: "downloaded-from-cloud",
          };
        }

        const hasLocalChanges = localStorage.getItem("hasLocalChanges") === "true";
        if (hasLocalChanges && localItems.length < cloudItems.length) {
          await this.uploadToCloud(localItems);
          this.saveToLocalSafely(localItems);
          return {
            success: true,
            items: localItems,
            action: "local-deletions-synced",
          };
        }

        const merged = this.autoMergeAdditions(localItems, cloudItems);
        await this.uploadToCloud(merged);
        this.saveToLocalSafely(merged);

        return { success: true, items: merged, action: "auto-merged" };
      }
      return {
        success: false,
        items: localItems,
        action: "requires-user-resolution",
      };
    } catch (error) {
      console.error("Intelligent sync failed:", error);
      return { success: false, items: localItems, action: "error" };
    }
  }

  private autoMergeAdditions(localItems: MediaItem[], cloudItems: MediaItem[]): MediaItem[] {
    const localMap = new Map(localItems.map(item => [item.id, item]));

    const hasLocalChanges = localStorage.getItem("hasLocalChanges") === "true";
    if (hasLocalChanges && localItems.length < cloudItems.length) {
      const merged = new Map(localItems.map(item => [item.id, item]));

      cloudItems.forEach(cloudItem => {
        if (!localMap.has(cloudItem.id)) {
          merged.set(cloudItem.id, cloudItem);
        }
      });

      return Array.from(merged.values());
    }

    const merged = new Map<string, MediaItem>();

    [...cloudItems, ...localItems].forEach((item) => {
      const existing = merged.get(item.id);
      if (!existing) {
        merged.set(item.id, item);
      } else {
        // Item exists, prefer the one with more recent data or more complete data
        const existingScore = this.getItemCompleteness(existing);
        const newScore = this.getItemCompleteness(item);

        if (newScore > existingScore) {
          merged.set(item.id, item);
        }
        // If scores are equal, keep existing (first one wins)
      }
    });

    return Array.from(merged.values());
  }

  private getItemCompleteness(item: MediaItem): number {
    let score = 0;

    if (item.rating) score += 2;
    if (item.notes && item.notes.trim()) score += 2;
    if (item.completionDate) score += 1;
    if (item.startDate) score += 1;
    if (item.genres && item.genres.length > 0) score += 1;
    if (item.director && item.director.trim()) score += 1;
    if (item.platform && item.platform.trim()) score += 1;
    if (item.episodesWatched && item.totalEpisodes) score += 1;

    return score;
  }

  private async uploadToCloud(items: MediaItem[]): Promise<void> {
    const driveService = this.authService.getDriveService();
    const success = await driveService.saveData({
      mediaItems: items,
      lastModified: new Date().toISOString(),
      version: 1,
    });

    if (!success) {
      throw new Error("Failed to upload to cloud");
    }

    this.updateLocalTimestamp();
  }

  private updateLocalTimestamp(): void {
    const timestamp = new Date().toISOString();
    localStorage.setItem("localTimestamp", timestamp);
    localStorage.setItem("lastSync", timestamp);
    localStorage.removeItem("hasLocalChanges");
  }

  private saveToLocalSafely(items: MediaItem[]): void {
    const timestamp = new Date().toISOString();
    localStorage.setItem("mediaItems", JSON.stringify(items));
    localStorage.setItem("localTimestamp", timestamp);
    localStorage.setItem("lastSync", timestamp);
    localStorage.removeItem("hasLocalChanges");
  }

  private areItemsIdentical(items1: MediaItem[], items2: MediaItem[]): boolean {
    if (items1.length !== items2.length) return false;

    const sorted1 = [...items1].sort((a, b) => a.id.localeCompare(b.id));
    const sorted2 = [...items2].sort((a, b) => a.id.localeCompare(b.id));

    return JSON.stringify(sorted1) === JSON.stringify(sorted2);
  }

  // Sharing functionality
  async createShareableFile(shareData: any): Promise<string> {
    if (!this.authService.isAuthenticated()) {
      throw new Error("Must be authenticated to create shareable files");
    }

    try {
      const driveService = this.authService.getDriveService();

      // Create the share file
      const fileName = `isolist-share-${Date.now()}.json`;
      const fileId = await driveService.saveDataWithFileId(shareData, fileName);

      // Make it shareable with anyone who has the link
      await driveService.makeFilePublic(fileId);

      return fileId;
    } catch (error) {
      console.error("Failed to create shareable file:", error);
      throw error;
    }
  }

  async accessSharedFile(fileId: string): Promise<any> {
    if (!this.authService.isAuthenticated()) {
      throw new Error("Must be authenticated to access shared files");
    }

    try {
      const driveService = this.authService.getDriveService();

      // Try to access the shared file
      const shareData = await driveService.loadSharedData(fileId);

      return shareData;
    } catch (error: any) {
      console.error("Failed to access shared file:", error);

      // Handle specific error types
      if (error.status === 404) {
        const err = new Error(`Shared file not found (deleted by owner): ${fileId}`);
        (err as any).status = 404;
        throw err;
      }

      // Re-throw with status for proper error handling
      const err = new Error(`Failed to access shared file: ${error.message}`);
      (err as any).status = error.status || 500;
      throw err;
    }
  }

  async deleteSharedFile(fileId: string): Promise<boolean> {
    if (!this.authService.isAuthenticated()) {
      throw new Error("Must be authenticated to delete shared files");
    }

    try {
      const driveService = this.authService.getDriveService();
      return await driveService.deleteFile(fileId);
    } catch (error) {
      console.error("Failed to delete shared file:", error);
      throw error;
    }
  }

  async listUserSharedFiles(): Promise<Array<{ id: string, name: string, createdTime: string }>> {
    if (!this.authService.isAuthenticated()) {
      throw new Error("Must be authenticated to list shared files");
    }

    try {
      const driveService = this.authService.getDriveService();
      return await driveService.listUserFiles();
    } catch (error) {
      console.error("Failed to list user shared files:", error);
      throw error;
    }
  }

  async updateSharedFile(fileId: string, shareData: any): Promise<boolean> {
    if (!this.authService.isAuthenticated()) {
      throw new Error("Must be authenticated to update shared files");
    }

    try {
      const driveService = this.authService.getDriveService();
      return await driveService.updateFileById(fileId, shareData);
    } catch (error) {
      console.error("Failed to update shared file:", error);
      throw error;
    }
  }
}
