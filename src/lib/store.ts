import { create } from "zustand";
import { AuthService } from "./auth";
import { PersistenceService } from "./persistence";
import { SyncManager, type SyncConflict } from "./sync-manager";
import type { MediaItem, PlaceItem } from "./types";

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
  placeItems: PlaceItem[];
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
  addPlaceItem: (item: Omit<PlaceItem, "id">) => void;
  updatePlaceItem: (item: PlaceItem) => void;
  deletePlaceItem: (id: string) => void;
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
  getCurrentUserPlaceItems: () => PlaceItem[];
  isViewingOwnData: () => boolean;
  startAutoRefresh: () => void;
  stopAutoRefresh: () => void;
  addSharedFileId: (fileId: string) => void;
  removeSharedFileId: (fileId: string) => void;
  getSharedFileIds: () => string[];
  updateSharedFiles: () => Promise<void>;
  // places sharing
  addPlacesSharedFileId: (fileId: string) => void;
  removePlacesSharedFileId: (fileId: string) => void;
  getPlacesSharedFileIds: () => string[];
  updatePlacesSharedFiles: () => Promise<void>;
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
];

const initialPlaceItems: PlaceItem[] = [
  {
    id: "p-1",
    name: "Tokyo",
    category: "city",
    country: "Japan",
    firstVisited: "2019-04-12",
    lastVisited: "2019-04-20",
    visitsCount: 1,
    rating: 5,
    favorite: true,
    notes: "Akihabara, Shibuya crossing, sushi everywhere.",
    tags: ["travel", "asia"],
    imageUrl: "https://placehold.co/600x400/00A9E0/FFFFFF.png?text=Tokyo",
  }
];

export const useMediaStore = create<MediaState>((set, get) => ({
  mediaItems: [],
  placeItems: [],
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
      const storedPlaces = localStorage.getItem("placeItems");
      let localItems: MediaItem[] = [];
      let localPlaces: PlaceItem[] = [];

      if (stored) {
        try {
          localItems = JSON.parse(stored);
        } catch (error) {
          console.error("Failed to parse stored items:", error);
          localItems = [];
        }
      } else {
        // Only use initial items if no data has ever been stored
        localItems = initialMediaItems;
        localStorage.setItem("mediaItems", JSON.stringify(localItems));
        localStorage.setItem("localTimestamp", new Date().toISOString());
      }

      if (storedPlaces) {
        try {
          localPlaces = JSON.parse(storedPlaces);
        } catch (error) {
          console.error("Failed to parse stored places:", error);
          localPlaces = [];
        }
      } else {
        localPlaces = initialPlaceItems;
        localStorage.setItem("placeItems", JSON.stringify(localPlaces));
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
        placeItems: localPlaces,
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
          const syncResult = await syncManager.intelligentSync(localItems, localPlaces);

          if (syncResult.success) {
            set({ mediaItems: syncResult.items.media, placeItems: syncResult.items.places });
            localStorage.removeItem("hasLocalChanges");
            localStorage.setItem("lastSync", new Date().toISOString());
          } else if (syncResult.action === "requires-user-resolution") {
            const conflict = await syncManager.detectConflict(localItems, localPlaces);
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
      const resolvedItems = await syncManager.safeSyncWithUserChoice(
        conflict.local.items,
        get().placeItems,
        choice,
      );

      set({
        mediaItems: resolvedItems,
        conflict: null,
        showConflictDialog: false,
      });

      localStorage.setItem("mediaItems", JSON.stringify(resolvedItems));
      // keep placeItems as-is (already in state)
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
    const newItem = { ...item, id: crypto.randomUUID(), updatedAt: new Date().toISOString() };
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

  addPlaceItem: (item) => {
    const newItem = { ...item, id: crypto.randomUUID(), updatedAt: new Date().toISOString() };
    const updatedItems = [...get().placeItems, newItem];

    set({ placeItems: updatedItems });

    localStorage.setItem("placeItems", JSON.stringify(updatedItems));
    localStorage.setItem("localTimestamp", new Date().toISOString());

    if (authService.isAuthenticated()) {
      localStorage.setItem("hasLocalChanges", "true");
      get().updateSharedFiles().catch(console.error);
    }

    get().updateSyncStatus();
  },

  updateMediaItem: (updatedItem) => {
    const updatedWithTs = { ...updatedItem, updatedAt: new Date().toISOString() };
    const updatedItems = get().mediaItems.map((item) =>
      item.id === updatedWithTs.id ? updatedWithTs : item,
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

  updatePlaceItem: (updatedItem) => {
    const updatedWithTs = { ...updatedItem, updatedAt: new Date().toISOString() };
    const updatedItems = get().placeItems.map((item) =>
      item.id === updatedWithTs.id ? updatedWithTs : item,
    );

    set({ placeItems: updatedItems });

    localStorage.setItem("placeItems", JSON.stringify(updatedItems));
    localStorage.setItem("localTimestamp", new Date().toISOString());

    if (authService.isAuthenticated()) {
      localStorage.setItem("hasLocalChanges", "true");
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

  deletePlaceItem: (id) => {
    const updatedItems = get().placeItems.filter((item) => item.id !== id);

    set({ placeItems: updatedItems });

    localStorage.setItem("placeItems", JSON.stringify(updatedItems));
    localStorage.setItem("localTimestamp", new Date().toISOString());

    if (authService.isAuthenticated()) {
      localStorage.setItem("hasLocalChanges", "true");
      get().updateSharedFiles().catch(console.error);
    }

    get().updateSyncStatus();
  },

  manualSync: async () => {
    if (!authService.isAuthenticated()) return;

    set({ isLoading: true });
    try {
      const currentMedia = get().mediaItems;
      const currentPlaces = get().placeItems;

      const syncResult = await syncManager.intelligentSync(currentMedia, currentPlaces);

      if (syncResult.success) {
        set({ mediaItems: syncResult.items.media, placeItems: syncResult.items.places });

        localStorage.removeItem("hasLocalChanges");
        localStorage.setItem("lastSync", new Date().toISOString());

        // Update shared files after successful sync
        await get().updateSharedFiles();
      } else if (syncResult.action === "requires-user-resolution") {
        const conflict = await syncManager.detectConflict(currentMedia, currentPlaces);
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
      const cloud = await persistenceService.forceDownload();
      if (cloud) {
        // persistence currently only pulls media; places handled via sync-manager path
        set({ mediaItems: cloud });
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

  getCurrentUserPlaceItems: () => {
    const { currentViewUserId, joinedUsers, placeItems } = get();

    if (!currentViewUserId) {
      return placeItems; // Return own data
    }

    const joinedUser = joinedUsers.find(u => u.id === currentViewUserId);
    // joined user shares currently only contain media; return empty until share includes places
    return [];
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

  // Places share management (separate from media shares)
  addPlacesSharedFileId: (fileId: string) => {
    const currentIds = JSON.parse(localStorage.getItem("placesSharedFileIds") || "[]");
    if (!currentIds.includes(fileId)) {
      currentIds.push(fileId);
      localStorage.setItem("placesSharedFileIds", JSON.stringify(currentIds));
    }
  },

  removePlacesSharedFileId: (fileId: string) => {
    const currentIds = JSON.parse(localStorage.getItem("placesSharedFileIds") || "[]");
    const filteredIds = currentIds.filter((id: string) => id !== fileId);
    localStorage.setItem("placesSharedFileIds", JSON.stringify(filteredIds));
  },

  getPlacesSharedFileIds: () => {
    return JSON.parse(localStorage.getItem("placesSharedFileIds") || "[]");
  },

  updatePlacesSharedFiles: async () => {
    const { placeItems } = get();
    const authService = AuthService.getInstance();
    const currentUser = authService.getUser();
    if (!currentUser) return;

    const sharedFileIds = get().getPlacesSharedFileIds();
    if (sharedFileIds.length === 0) return;

    console.log(`Updating ${sharedFileIds.length} places shared files...`);
    for (const fileId of sharedFileIds) {
      try {
        const payload = {
          placeItems,
          sharedBy: currentUser.email,
          sharedAt: new Date().toISOString(),
          version: 1,
          type: "isolist-share-places",
        };
        await syncManager.updateSharedFile(fileId, payload);
        console.log(`Successfully updated places shared file ${fileId}`);
      } catch (error: any) {
        console.error(`Error updating places shared file ${fileId}:`, error);
        if (error.message?.includes('404') || error.status === 404) {
          console.log(`Places shared file ${fileId} was deleted, removing from tracking`);
          get().removePlacesSharedFileId(fileId);
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
