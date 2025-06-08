import { AuthService } from "./auth";
import type { MediaItem } from "./types";

const STORAGE_KEY = "mediaItems";
const LAST_SYNC_KEY = "lastSync";
const LOCAL_TIMESTAMP_KEY = "localTimestamp";

export interface SyncResult {
  success: boolean;
  action: "no-change" | "downloaded" | "uploaded" | "merged" | "conflict";
  itemCount?: number;
  conflicts?: number;
}

export class PersistenceService {
  private static instance: PersistenceService;
  private authService = AuthService.getInstance();
  private autoSyncInterval: NodeJS.Timeout | null = null;

  static getInstance(): PersistenceService {
    if (!PersistenceService.instance) {
      PersistenceService.instance = new PersistenceService();
    }
    return PersistenceService.instance;
  }

  saveToLocal(data: { items: MediaItem[]; timestamp: string }): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.items));
      localStorage.setItem(LOCAL_TIMESTAMP_KEY, data.timestamp);
      localStorage.setItem("hasLocalChanges", "true");
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }

  loadFromLocal(): { items: MediaItem[]; timestamp: string } {
    if (typeof window === "undefined") return { items: [], timestamp: "" };

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const timestamp = localStorage.getItem(LOCAL_TIMESTAMP_KEY) || "";
      return {
        items: stored ? JSON.parse(stored) : [],
        timestamp,
      };
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
      return { items: [], timestamp: "" };
    }
  }

  async smartSync(currentItems: MediaItem[]): Promise<SyncResult> {
    if (!this.authService.isAuthenticated()) {
      return { success: false, action: "no-change" };
    }

    try {
      const driveService = this.authService.getDriveService();
      const localData = this.loadFromLocal();
      const hasLocalChanges = localStorage.getItem("hasLocalChanges") === "true";

      const fileInfo = await driveService.getFileInfo();

      if (!fileInfo) {
        const success = await this.syncToCloud(currentItems);
        return {
          success,
          action: success ? "uploaded" : "no-change",
          itemCount: currentItems.length,
        };
      }
      const localTime = localData.timestamp ? new Date(localData.timestamp).getTime() : 0;
      const cloudTime = fileInfo.lastModified.getTime();

      if (!hasLocalChanges && cloudTime > localTime) {
        const cloudData = await driveService.loadData();
        if (cloudData?.mediaItems) {
          this.saveToLocalWithoutChangesFlag(cloudData.mediaItems);
          return {
            success: true,
            action: "downloaded",
            itemCount: cloudData.mediaItems.length,
          };
        }
      } else if (hasLocalChanges && cloudTime <= localTime) {
        const success = await this.syncToCloud(currentItems);
        return {
          success,
          action: success ? "uploaded" : "no-change",
          itemCount: currentItems.length,
        };
      } else if (hasLocalChanges && cloudTime > localTime) {
        const cloudData = await driveService.loadData();

        if (cloudData?.mediaItems) {
          const merged = await this.mergeData(currentItems, cloudData.mediaItems);
          this.saveToLocalWithoutChangesFlag(merged);
          await this.syncToCloud(merged);

          return {
            success: true,
            action: "merged",
            itemCount: merged.length,
            conflicts: this.countConflicts(currentItems, cloudData.mediaItems),
          };
        }
      }

      return { success: true, action: "no-change" };
    } catch (error) {
      console.error("Smart sync failed:", error);
      return { success: false, action: "no-change" };
    }
  }

  async forceDownload(): Promise<MediaItem[] | null> {
    if (!this.authService.isAuthenticated()) return null;

    try {
      const driveService = this.authService.getDriveService();
      const cloudData = await driveService.loadData();

      if (cloudData?.mediaItems) {
        this.saveToLocalWithoutChangesFlag(cloudData.mediaItems);
        return cloudData.mediaItems;
      }

      return null;
    } catch (error) {
      console.error("Force download failed:", error);
      return null;
    }
  }

  async syncToCloud(items: MediaItem[]): Promise<boolean> {
    if (!this.authService.isAuthenticated()) return false;

    try {
      const driveService = this.authService.getDriveService();
      const success = await driveService.saveData({
        mediaItems: items,
        lastModified: new Date().toISOString(),
        version: 1,
      });

      if (success) {
        localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
        localStorage.removeItem("hasLocalChanges");
      }

      return success;
    } catch (error) {
      console.error("Cloud sync failed:", error);
      return false;
    }
  }

  // Merge local and cloud data (simple strategy)
  private async mergeData(localItems: MediaItem[], cloudItems: MediaItem[]): Promise<MediaItem[]> {
    const merged = new Map<string, MediaItem>();

    // Add all cloud items first
    cloudItems.forEach((item) => merged.set(item.id, item));

    // Add local items, preferring local changes for existing items
    localItems.forEach((item) => {
      const existing = merged.get(item.id);
      if (existing) {
        // Use local version if it has more recent changes
        merged.set(item.id, item);
      } else {
        // New local item
        merged.set(item.id, item);
      }
    });

    return Array.from(merged.values());
  }

  private countConflicts(localItems: MediaItem[], cloudItems: MediaItem[]): number {
    const localIds = new Set(localItems.map((item) => item.id));
    const cloudIds = new Set(cloudItems.map((item) => item.id));

    const conflicts = localItems.filter((localItem) => {
      const cloudItem = cloudItems.find((c) => c.id === localItem.id);
      return cloudItem && JSON.stringify(localItem) !== JSON.stringify(cloudItem);
    });

    return conflicts.length;
  }

  private saveToLocalWithoutChangesFlag(items: MediaItem[]): void {
    if (typeof window === "undefined") return;

    try {
      const timestamp = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      localStorage.setItem(LOCAL_TIMESTAMP_KEY, timestamp);
      localStorage.setItem(LAST_SYNC_KEY, timestamp);
      localStorage.removeItem("hasLocalChanges");
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }

  getSyncStatus() {
    const lastSyncStr = localStorage.getItem(LAST_SYNC_KEY);
    const hasLocalChanges = localStorage.getItem("hasLocalChanges") === "true";

    return {
      isSync: this.authService.isAuthenticated(),
      lastSync: lastSyncStr ? new Date(lastSyncStr) : null,
      hasLocalChanges,
    };
  }

  startAutoSync(getMediaItems: () => MediaItem[]) {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
    }

    this.autoSyncInterval = setInterval(async () => {
      await this.smartSync(getMediaItems());
    }, 300000);
  }

  stopAutoSync() {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
      this.autoSyncInterval = null;
      console.log("Auto-sync stopped.");
    }
  }
}
