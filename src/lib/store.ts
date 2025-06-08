import { create } from "zustand";
import { AuthService } from "./auth";
import { PersistenceService } from "./persistence";
import { SyncManager, type SyncConflict } from "./sync-manager";
import type { MediaItem } from "./types";

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
  addMediaItem: (item: Omit<MediaItem, "id">) => void;
  updateMediaItem: (item: MediaItem) => void;
  deleteMediaItem: (id: string) => void;
  initializeStore: () => Promise<void>;
  resolveConflict: (choice: "local" | "cloud" | "merge" | "cancel") => Promise<void>;
  setConflictDialog: (show: boolean) => void;
  manualSync: () => Promise<void>;
  updateSyncStatus: () => void;
  forceRefresh: () => Promise<void>;
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
      }

      if (localItems.length === 0) {
        localItems = initialMediaItems;
        localStorage.setItem("mediaItems", JSON.stringify(localItems));
        localStorage.setItem("localTimestamp", new Date().toISOString());
      }

      set({ mediaItems: localItems });

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
      alert(`Failed to resolve conflict: ${error}`);
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
}));
