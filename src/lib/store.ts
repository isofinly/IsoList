import { create } from "zustand";
import { AuthService } from "./auth";
import { PersistenceService } from "./persistence";
import { SyncManager, type SyncConflict } from "./sync-manager";
import type { MediaItem } from "./types";

export interface JoinedUser {
  id: string;
  email: string;
  shareId: string;
  lastSync?: Date;
  status: 'active' | 'error' | 'unauthorized';
  mediaItems?: MediaItem[];
  hasRecentUpdate?: boolean;
}

interface MediaState {
  mediaItems: MediaItem[];
  isLoading: boolean;
  syncStatus: {
    isSync: boolean;
    lastSync: Date | null;
    hasLocalChanges: boolean;
  };
  conflict: SyncConflict | null;
  showConflictDialog: boolean;
  joinedUsers: JoinedUser[];
  currentViewUserId: string | null; // null means viewing own data
  addMediaItem: (item: Omit<MediaItem, "id">) => void;
  updateMediaItem: (item: MediaItem) => void;
  deleteMediaItem: (id: string) => void;
  initializeStore: () => Promise<void>;
  resolveConflict: (choice: "local" | "cloud" | "merge" | "cancel") => Promise<void>;
  setConflictDialog: (show: boolean) => void;
  manualSync: () => Promise<void>;
  updateSyncStatus: () => void;
  forceRefresh: () => Promise<void>;
  addJoinedUser: (user: JoinedUser) => void;
  removeJoinedUser: (userId: string) => void;
  setCurrentViewUser: (userId: string | null) => void;
  syncJoinedUserData: (userId: string, isManual?: boolean) => Promise<void>;
  getCurrentUserMediaItems: () => MediaItem[];
  isViewingOwnData: () => boolean;
  startAutoRefresh: () => void;
  stopAutoRefresh: () => void;
  addSharedFileId: (fileId: string) => void;
  removeSharedFileId: (fileId: string) => void;
  getSharedFileIds: () => string[];
  updateSharedFiles: () => Promise<void>;
  refreshAllJoinedUsers: () => Promise<void>;
}

const syncManager = SyncManager.getInstance();
const authService = AuthService.getInstance();
const persistenceService = PersistenceService.getInstance();

const initialMediaItems: MediaItem[] = [
  {
    id: "1",
    title: "Cyberpunk: Edgerunners",
    type: "anime",
    status: "completed",
    imageUrl: "https://placehold.co/300x450/FF0055/FFFFFF.png?text=Edgerunners&font=mono",
    rating: 9,
    notes: "Visually stunning with a heartbreaking story. Peak cyberpunk.",
    premiereDate: "2022-09-13",
    startDate: "2022-09-15",
    completionDate: "2022-09-20",
    totalEpisodes: 10,
    episodesWatched: 10,
    genres: ["Sci-Fi", "Cyberpunk", "Action"],
    platform: "Netflix",
  },
  {
    id: "2",
    title: "Blade Runner 2049",
    type: "movie",
    status: "completed",
    imageUrl: "https://placehold.co/300x450/00A9E0/FFFFFF.png?text=Blade+Runner+2049&font=mono",
    rating: 10,
    notes: "A masterpiece of sci-fi cinema. Incredible visuals and atmosphere.",
    premiereDate: "2017-10-06",
    startDate: "2017-10-10",
    completionDate: "2017-10-10",
    genres: ["Sci-Fi", "Neo-noir", "Thriller"],
    director: "Denis Villeneuve",
  },
  {
    id: "3",
    title: "Arcane",
    type: "series",
    status: "watching",
    imageUrl: "https://placehold.co/300x450/D4AF37/000000.png?text=Arcane&font=mono",
    rating: undefined,
    notes: "Season 2 hype!",
    premiereDate: "2021-11-06",
    startDate: "2024-06-01",
    episodesWatched: 3,
    totalEpisodes: 9,
    releaseDateTBD: false,
    genres: ["Animation", "Action", "Fantasy"],
    platform: "Netflix",
  },
  {
    id: "4",
    title: "Ghost in the Shell (1995)",
    type: "anime",
    status: "planned",
    imageUrl: "https://placehold.co/300x450/32CD32/FFFFFF.png?text=GitS+1995&font=mono",
    premiereDate: "1995-11-18",
    genres: ["Sci-Fi", "Cyberpunk", "Philosophical"],
    releaseDateTBD: false,
  },
  {
    id: "5",
    title: "Project Hail Mary (Adaptation)",
    type: "movie",
    status: "planned",
    imageUrl: "https://placehold.co/300x450/708090/FFFFFF.png?text=Project+Hail+Mary&font=mono",
    premiereDate: "2026-03-20",
    releaseDateTBD: false,
    genres: ["Sci-Fi", "Adventure"],
  },
  {
    id: "6",
    title: "Unknown Cyber Series X",
    type: "series",
    status: "planned",
    imageUrl: "https://placehold.co/300x450/404040/FFFFFF.png?text=Series+X+TBD&font=mono",
    releaseDateTBD: true,
    genres: ["Cyberpunk", "Mystery"],
  },
];

export const useMediaStore = create<MediaState>((set, get) => ({
  mediaItems: [],
  isLoading: false,
  syncStatus: { isSync: false, lastSync: null, hasLocalChanges: false },
  conflict: null,
  showConflictDialog: false,
  joinedUsers: [],
  currentViewUserId: null,

  initializeStore: async () => {
    set({ isLoading: true });

    try {
      const stored = localStorage.getItem("mediaItems");
      let localItems: MediaItem[] = [];

      if (stored) {
        try {
          localItems = JSON.parse(stored);
        } catch (error) {
          console.error("Failed to parse stored items:", error);
          localItems = [];
        }
      } else {
        // Only use initial items if no data has ever been stored
        // (stored === null means never been set, vs stored === "[]" which means user had data but deleted everything)
        localItems = initialMediaItems;
        localStorage.setItem("mediaItems", JSON.stringify(localItems));
        localStorage.setItem("localTimestamp", new Date().toISOString());
      }

      // Load joined users from localStorage
      const storedJoinedUsers = localStorage.getItem("joinedUsers");
      let joinedUsers: JoinedUser[] = [];
      if (storedJoinedUsers) {
        try {
          const parsedUsers = JSON.parse(storedJoinedUsers);
          // Convert lastSync back to Date objects
          joinedUsers = parsedUsers.map((user: any) => ({
            ...user,
            lastSync: user.lastSync ? new Date(user.lastSync) : undefined
          }));
        } catch (error) {
          console.error("Failed to parse joined users:", error);
        }
      }

      // Load current view user
      const storedCurrentViewUserId = localStorage.getItem("currentViewUserId");
      const currentViewUserId = storedCurrentViewUserId || null;

      set({
        mediaItems: localItems,
        joinedUsers,
        currentViewUserId
      });

      // Start auto-refresh for joined users
      if (joinedUsers.length > 0) {
        get().startAutoRefresh();
      }

      if (authService.isAuthenticated()) {
        const hasValidToken = await authService.ensureValidToken();

        if (hasValidToken) {
          const syncResult = await syncManager.intelligentSync(localItems);

          if (syncResult.success) {
            set({ mediaItems: syncResult.items });
            localStorage.removeItem("hasLocalChanges");
            localStorage.setItem("lastSync", new Date().toISOString());
          } else if (syncResult.action === "requires-user-resolution") {
            const conflict = await syncManager.detectConflict(localItems);
            if (conflict) {
              set({ conflict, showConflictDialog: true });
            }
          }
        } else {
          console.error("Token validation failed, switching to offline mode");
          // Don't clear the user data immediately - they might want to re-auth
          // Just show that sync is unavailable
        }
      }

      get().updateSyncStatus();
    } catch (error) {
      console.error("Failed to initialize store:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  resolveConflict: async (choice: "local" | "cloud" | "merge" | "cancel") => {
    const { conflict } = get();
    if (!conflict) {
      console.error("No conflict to resolve");
      return;
    }

    if (choice === "cancel") {
      set({ conflict: null, showConflictDialog: false });
      return;
    }

    set({ isLoading: true });

    try {
      const resolvedItems = await syncManager.safeSyncWithUserChoice(conflict.local.items, choice);

      set({
        mediaItems: resolvedItems,
        conflict: null,
        showConflictDialog: false,
      });

      localStorage.setItem("mediaItems", JSON.stringify(resolvedItems));
      localStorage.setItem("localTimestamp", new Date().toISOString());
      localStorage.setItem("lastSync", new Date().toISOString());
      localStorage.removeItem("hasLocalChanges");

      get().updateSyncStatus();
    } catch (error) {
      console.error("Failed to resolve conflict:", error);
      // Note: Cannot use toast here directly as this is outside React context
      // This error should be handled by the component that calls resolveConflict
    } finally {
      set({ isLoading: false });
    }
  },

  setConflictDialog: (show: boolean) => {
    set({ showConflictDialog: show });
    if (!show) {
      set({ conflict: null });
    }
  },
  addMediaItem: (item) => {
    const newItem = { ...item, id: crypto.randomUUID() };
    const updatedItems = [...get().mediaItems, newItem];

    set({ mediaItems: updatedItems });

    localStorage.setItem("mediaItems", JSON.stringify(updatedItems));
    localStorage.setItem("localTimestamp", new Date().toISOString());

    if (authService.isAuthenticated()) {
      localStorage.setItem("hasLocalChanges", "true");

      // Trigger shared file update in background (don't wait for it)
      get().updateSharedFiles().catch(console.error);
    }

    get().updateSyncStatus();
  },

  updateMediaItem: (updatedItem) => {
    const updatedItems = get().mediaItems.map((item) =>
      item.id === updatedItem.id ? updatedItem : item,
    );

    set({ mediaItems: updatedItems });

    localStorage.setItem("mediaItems", JSON.stringify(updatedItems));
    localStorage.setItem("localTimestamp", new Date().toISOString());

    if (authService.isAuthenticated()) {
      localStorage.setItem("hasLocalChanges", "true");

      // Trigger shared file update in background (don't wait for it)
      get().updateSharedFiles().catch(console.error);
    }

    get().updateSyncStatus();
  },

  deleteMediaItem: (id) => {
    const updatedItems = get().mediaItems.filter((item) => item.id !== id);

    set({ mediaItems: updatedItems });

    localStorage.setItem("mediaItems", JSON.stringify(updatedItems));
    localStorage.setItem("localTimestamp", new Date().toISOString());

    if (authService.isAuthenticated()) {
      localStorage.setItem("hasLocalChanges", "true");

      // Trigger shared file update in background (don't wait for it)
      get().updateSharedFiles().catch(console.error);
    }

    get().updateSyncStatus();
  },

  manualSync: async () => {
    if (!authService.isAuthenticated()) return;

    set({ isLoading: true });
    try {
      const currentItems = get().mediaItems;

      const syncResult = await syncManager.intelligentSync(currentItems);

      if (syncResult.success) {
        set({ mediaItems: syncResult.items });

        localStorage.removeItem("hasLocalChanges");
        localStorage.setItem("lastSync", new Date().toISOString());

        // Update shared files after successful sync
        await get().updateSharedFiles();
      } else if (syncResult.action === "requires-user-resolution") {
        const conflict = await syncManager.detectConflict(currentItems);
        if (conflict) {
          set({ conflict, showConflictDialog: true });
        }
      }

      get().updateSyncStatus();
    } catch (error) {
      console.error("Manual sync failed:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateSyncStatus: () => {
    const lastSyncStr = localStorage.getItem("lastSync");
    const hasLocalChanges = localStorage.getItem("hasLocalChanges") === "true";

    set({
      syncStatus: {
        isSync: authService.isAuthenticated(),
        lastSync: lastSyncStr ? new Date(lastSyncStr) : null,
        hasLocalChanges,
      },
    });
  },

  forceRefresh: async () => {
    if (!authService.isAuthenticated()) return;

    set({ isLoading: true });
    try {
      const cloudItems = await persistenceService.forceDownload();
      if (cloudItems) {
        set({ mediaItems: cloudItems });
        get().updateSyncStatus();
      }
    } catch (error) {
      console.error("Force refresh failed:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  addJoinedUser: (user: JoinedUser) => {
    const { joinedUsers } = get();
    const wasEmpty = joinedUsers.length === 0;
    const updatedUsers = joinedUsers.filter(u => u.id !== user.id);
    updatedUsers.push(user);
    set({ joinedUsers: updatedUsers });
    localStorage.setItem("joinedUsers", JSON.stringify(updatedUsers));

    // Start auto-refresh if this is the first joined user
    if (wasEmpty && updatedUsers.length > 0) {
      get().startAutoRefresh();
    }
  },

  removeJoinedUser: (userId: string) => {
    const updatedUsers = get().joinedUsers.filter(u => u.id !== userId);
    set({ joinedUsers: updatedUsers });
    localStorage.setItem("joinedUsers", JSON.stringify(updatedUsers));

    // If we're currently viewing this user, switch back to own data
    if (get().currentViewUserId === userId) {
      set({ currentViewUserId: null });
      localStorage.setItem("currentViewUserId", "");
    }

    // Stop auto-refresh if no joined users left
    if (updatedUsers.length === 0) {
      get().stopAutoRefresh();
    }
  },

  setCurrentViewUser: (userId: string | null) => {
    set({ currentViewUserId: userId });
    localStorage.setItem("currentViewUserId", userId || "");
  },

  syncJoinedUserData: async (userId: string, isManual: boolean = false) => {
    const user = get().joinedUsers.find(u => u.id === userId);
    if (!user) return;

    if (isManual) {
      console.log(`Manual sync requested for ${user.email}`);
    }

    try {
      const shareData = await syncManager.accessSharedFile(user.shareId);
      const newMediaItems = shareData.mediaItems || [];

      // Check if data actually changed
      const currentItems = user.mediaItems || [];
      const hasChanges = JSON.stringify(currentItems) !== JSON.stringify(newMediaItems);

      if (hasChanges) {
        console.log(`New data found for ${user.email}, updating... (${isManual ? 'manual' : 'auto'} sync)`);
      }

      // Update the user's data and status
      const updatedUsers = get().joinedUsers.map(u =>
        u.id === userId
          ? {
            ...u,
            mediaItems: newMediaItems,
            lastSync: new Date(),
            status: 'active' as const,
            hasRecentUpdate: hasChanges && isManual // Flag for UI feedback
          }
          : u
      );

      set({ joinedUsers: updatedUsers });
      localStorage.setItem("joinedUsers", JSON.stringify(updatedUsers));

      // If viewing this user and data changed, notify
      if (hasChanges && get().currentViewUserId === userId) {
        console.log(`Updated data for currently viewed user ${user.email}`);
      }

    } catch (error: any) {
      console.error("Failed to sync joined user data:", error);

      // If file is deleted (404), remove the user entirely
      if (error.status === 404) {
        console.log(`Shared file for ${user.email} was deleted, removing user from joined list`);
        get().removeJoinedUser(userId);
        return;
      }

      // Update status based on error type
      const status: 'unauthorized' | 'error' = error.status === 401 || error.status === 403 ? 'unauthorized' : 'error';
      const updatedUsers = get().joinedUsers.map(u =>
        u.id === userId ? { ...u, status } : u
      );

      set({ joinedUsers: updatedUsers });
      localStorage.setItem("joinedUsers", JSON.stringify(updatedUsers));
    }
  },

  getCurrentUserMediaItems: () => {
    const { currentViewUserId, joinedUsers, mediaItems } = get();

    if (!currentViewUserId) {
      return mediaItems; // Return own data
    }

    const joinedUser = joinedUsers.find(u => u.id === currentViewUserId);
    return joinedUser?.mediaItems || [];
  },

  isViewingOwnData: () => {
    return get().currentViewUserId === null;
  },

  startAutoRefresh: () => {
    // Auto-refresh joined users every 2 minutes
    const interval = setInterval(async () => {
      const { joinedUsers } = get();
      if (joinedUsers.length > 0) {
        console.log(`Auto-refreshing ${joinedUsers.length} joined users...`);
      }
      for (const user of joinedUsers) {
        if (user.status === 'active') {
          try {
            await get().syncJoinedUserData(user.id, false); // false = auto-sync
          } catch (error: any) {
            console.error(`Failed to auto-sync user ${user.email}:`, error);
            // Auto-sync errors are expected for deleted files and shouldn't propagate
          }
        }
      }
    }, 2 * 60 * 1000); // 2 minutes

    // Store interval ID to clear later
    (window as any).isolistAutoRefreshInterval = interval;
  },

  stopAutoRefresh: () => {
    if ((window as any).isolistAutoRefreshInterval) {
      clearInterval((window as any).isolistAutoRefreshInterval);
      delete (window as any).isolistAutoRefreshInterval;
    }
  },

  addSharedFileId: (fileId: string) => {
    const currentIds = JSON.parse(localStorage.getItem("sharedFileIds") || "[]");
    if (!currentIds.includes(fileId)) {
      currentIds.push(fileId);
      localStorage.setItem("sharedFileIds", JSON.stringify(currentIds));
    }
  },

  removeSharedFileId: (fileId: string) => {
    const currentIds = JSON.parse(localStorage.getItem("sharedFileIds") || "[]");
    const filteredIds = currentIds.filter((id: string) => id !== fileId);
    localStorage.setItem("sharedFileIds", JSON.stringify(filteredIds));
  },

  getSharedFileIds: () => {
    return JSON.parse(localStorage.getItem("sharedFileIds") || "[]");
  },

  updateSharedFiles: async () => {
    const { mediaItems } = get();
    const authService = AuthService.getInstance();
    const currentUser = authService.getUser();

    if (!currentUser) return;

    const sharedFileIds = get().getSharedFileIds();
    if (sharedFileIds.length === 0) return;

    console.log(`Updating ${sharedFileIds.length} shared files...`);

    for (const fileId of sharedFileIds) {
      try {
        // Create updated share data
        const sharedData = {
          mediaItems,
          sharedBy: currentUser.email,
          sharedAt: new Date().toISOString(),
          version: 1,
          type: "isolist-share",
        };

        // Update the shared file using SyncManager
        await syncManager.updateSharedFile(fileId, sharedData);
        console.log(`Successfully updated shared file ${fileId}`);
      } catch (error: any) {
        console.error(`Error updating shared file ${fileId}:`, error);

        // If file not found (404), remove it from tracking
        if (error.message?.includes('404') || error.status === 404) {
          console.log(`Shared file ${fileId} was deleted, removing from tracking`);
          get().removeSharedFileId(fileId);
        }
      }
    }
  },

  refreshAllJoinedUsers: async () => {
    const { joinedUsers } = get();
    console.log(`Refreshing ${joinedUsers.length} joined users...`);

    for (const user of joinedUsers) {
      if (user.status === 'active') {
        try {
          await get().syncJoinedUserData(user.id, true); // true = manual sync
        } catch (error: any) {
          console.error(`Failed to refresh user ${user.email}:`, error);
          // Manual sync errors are logged but don't break the refresh flow
        }
      }
    }
  },
}));
