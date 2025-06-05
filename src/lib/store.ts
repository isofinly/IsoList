import { create } from "zustand";
import type { MediaItem } from "./types";
import { SyncManager, SyncConflict } from "./sync-manager";
import { AuthService } from "./auth";
import { PersistenceService } from "./persistence";

interface MediaState {
  mediaItems: MediaItem[];
  isLoading: boolean;
  syncStatus: { isSync: boolean; lastSync: Date | null; hasLocalChanges: boolean };
  conflict: SyncConflict | null;
  showConflictDialog: boolean;

  // Actions
  addMediaItem: (item: Omit<MediaItem, "id">) => void;
  updateMediaItem: (item: MediaItem) => void;
  deleteMediaItem: (id: string) => void;

  // Safe sync actions
  initializeStore: () => Promise<void>;
  resolveConflict: (choice: 'local' | 'cloud' | 'merge' | 'cancel') => Promise<void>;
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
    premiereDate: "2021-11-06", // S1
    startDate: "2024-06-01", // Rewatching or S2 prep
    episodesWatched: 3,
    totalEpisodes: 9, // S1
    releaseDateTBD: false, // S2 might be TBD but this is S1 for now
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
    premiereDate: "2026-03-20", // Example future date
    releaseDateTBD: false,
    genres: ["Sci-Fi", "Adventure"],
  },
  {
    id: "6",
    title: "Unknown Cyber Series X",
    type: "series",
    status: "planned",
    imageUrl: "https://placehold.co/300x450/404040/FFFFFF.png?text=Series+X+TBD&font=mono",
    releaseDateTBD: true, // This one is TBD
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
      // Always load from localStorage first
      const stored = localStorage.getItem('mediaItems');
      let localItems: MediaItem[] = [];

      if (stored) {
        try {
          localItems = JSON.parse(stored);
        } catch (error) {
          console.error('Failed to parse stored items:', error);
          localItems = [];
        }
      }

      // If no local data, use initial items but don't save yet
      if (localItems.length === 0) {
        localItems = initialMediaItems;
        // Don't save to localStorage yet - wait for conflict resolution
      }

      set({ mediaItems: localItems });

      // If authenticated, check for conflicts
      if (authService.isAuthenticated()) {
        const user = authService.getUser();
        if (user?.accessToken) {
          await authService.getDriveService().initialize(user.accessToken);

          // Detect conflicts before any sync operation
          const conflict = await syncManager.detectConflict(localItems);

          if (conflict) {
            console.log('⚠️ Conflict detected:', conflict.type);
            set({ conflict, showConflictDialog: true });
            // Don't auto-sync when there's a conflict
          } else {
            // No conflict, safe to sync normally
            const hasLocalChanges = localStorage.getItem('hasLocalChanges') === 'true';
            if (hasLocalChanges) {
              await syncManager.safeSyncWithUserChoice(localItems, 'local');
              set({ showConflictDialog: false }); // Ensure dialog is closed if it was open from a previous state
            }
          }
        }
      }

      get().updateSyncStatus();
    } catch (error) {
      console.error('Failed to initialize store:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  resolveConflict: async (choice: 'local' | 'cloud' | 'merge' | 'cancel') => {
    console.log('📱 Store: Starting conflict resolution with choice:', choice);

    const { conflict } = get();
    if (!conflict) {
      console.error('❌ No conflict to resolve');
      return;
    }

    if (choice === 'cancel') {
      set({ conflict: null, showConflictDialog: false });
      return;
    }

    set({ isLoading: true });

    try {
      console.log('🔄 Executing safeSyncWithUserChoice...');

      const resolvedItems = await syncManager.safeSyncWithUserChoice(
        conflict.local.items,
        choice
      );

      console.log('✅ Sync completed, resolved items count:', resolvedItems.length);

      set({
        mediaItems: resolvedItems,
        conflict: null,
        showConflictDialog: false,
      });

      // Save resolved data to localStorage with proper timestamp
      localStorage.setItem('mediaItems', JSON.stringify(resolvedItems));
      localStorage.setItem('localTimestamp', new Date().toISOString());
      localStorage.setItem('lastSync', new Date().toISOString());
      localStorage.removeItem('hasLocalChanges');

      get().updateSyncStatus();
      console.log('🎉 Conflict resolved successfully with choice:', choice);
    } catch (error) {
      console.error('💥 Failed to resolve conflict:', error);
      // Don't close dialog on error, let user try again
      alert('Failed to resolve conflict: ' + (error as Error).message);
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

    // Save safely
    localStorage.setItem('mediaItems', JSON.stringify(updatedItems));
    localStorage.setItem('hasLocalChanges', 'true');
    localStorage.setItem('localTimestamp', new Date().toISOString());

    get().updateSyncStatus();
  },

  updateMediaItem: (updatedItem) => {
    const updatedItems = get().mediaItems.map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    );

    set({ mediaItems: updatedItems });

    localStorage.setItem('mediaItems', JSON.stringify(updatedItems));
    localStorage.setItem('hasLocalChanges', 'true');
    localStorage.setItem('localTimestamp', new Date().toISOString());

    get().updateSyncStatus();
  },

  deleteMediaItem: (id) => {
    const updatedItems = get().mediaItems.filter((item) => item.id !== id);

    set({ mediaItems: updatedItems });

    localStorage.setItem('mediaItems', JSON.stringify(updatedItems));
    localStorage.setItem('hasLocalChanges', 'true');
    localStorage.setItem('localTimestamp', new Date().toISOString());

    get().updateSyncStatus();
  },

  manualSync: async () => {
    if (!authService.isAuthenticated()) return;

    set({ isLoading: true });
    try {
      const currentItems = get().mediaItems;
      const conflict = await syncManager.detectConflict(currentItems);

      if (conflict) {
        set({ conflict, showConflictDialog: true });
      } else {
        const resolvedItems = await syncManager.safeSyncWithUserChoice(currentItems, 'local');
        set({ mediaItems: resolvedItems });
      }

      get().updateSyncStatus();
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateSyncStatus: () => {
    const lastSyncStr = localStorage.getItem('lastSync');
    const hasLocalChanges = localStorage.getItem('hasLocalChanges') === 'true';

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
        console.log('🔄 Force refreshed from cloud');
      }
    } catch (error) {
      console.error('Force refresh failed:', error);
    } finally {
      set({ isLoading: false });
    }
  },

}));
