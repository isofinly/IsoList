import { create } from "zustand";
import type { MediaItem } from "./types";
import { PersistenceService } from "./persistence";
import { AuthService } from "./auth";

interface MediaState {
  mediaItems: MediaItem[];
  isLoading: boolean;
  syncStatus: { isSync: boolean; lastSync: Date | null; hasLocalChanges: boolean };

  // Actions
  addMediaItem: (item: Omit<MediaItem, "id">) => void;
  updateMediaItem: (item: MediaItem) => void;
  deleteMediaItem: (id: string) => void;

  // Sync actions
  initializeStore: () => Promise<void>;
  manualSync: () => Promise<void>;
  updateSyncStatus: () => void;
  forceRefresh: () => Promise<void>;
}

const persistenceService = PersistenceService.getInstance();
const authService = AuthService.getInstance();

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

  initializeStore: async () => {
    set({ isLoading: true });

    try {
      // Load from localStorage first
      const localData = persistenceService.loadFromLocal();
      let items = localData.items;

      // If no local data, use initial items
      if (items.length === 0) {
        items = initialMediaItems;
        persistenceService.saveToLocal({ items, timestamp: new Date().toISOString() });
      }

      set({ mediaItems: items });

      // If authenticated, perform smart sync
      if (authService.isAuthenticated()) {
        const user = authService.getUser();
        if (user?.accessToken) {
          await authService.getDriveService().initialize(user.accessToken);

          // Smart sync determines what to do
          const syncResult = await persistenceService.smartSync(items);

          if (syncResult.success && syncResult.action === 'downloaded') {
            // Update with downloaded data
            const newLocalData = persistenceService.loadFromLocal();
            set({ mediaItems: newLocalData.items });
          } else if (syncResult.success && syncResult.action === 'merged') {
            // Update with merged data
            const newLocalData = persistenceService.loadFromLocal();
            set({ mediaItems: newLocalData.items });
          }

          console.log('🔄 Smart sync result:', syncResult);

          // Start auto-sync
          persistenceService.startAutoSync(() => get().mediaItems);
        }
      }

      get().updateSyncStatus();
    } catch (error) {
      console.error('Failed to initialize store:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addMediaItem: (item) => {
    const newItem = { ...item, id: crypto.randomUUID() };
    const updatedItems = [...get().mediaItems, newItem];

    set({ mediaItems: updatedItems });
    persistenceService.saveToLocal({ items: updatedItems, timestamp: new Date().toISOString() });
    get().updateSyncStatus();
  },

  updateMediaItem: (updatedItem) => {
    const updatedItems = get().mediaItems.map((item) =>
      item.id === updatedItem.id ? updatedItem : item,
    );

    set({ mediaItems: updatedItems });
    persistenceService.saveToLocal({ items: updatedItems, timestamp: new Date().toISOString() });
    get().updateSyncStatus();
  },

  deleteMediaItem: (id) => {
    const updatedItems = get().mediaItems.filter((item) => item.id !== id);

    set({ mediaItems: updatedItems });
    persistenceService.saveToLocal({ items: updatedItems, timestamp: new Date().toISOString() });
    get().updateSyncStatus();
  },

  manualSync: async () => {
    if (!authService.isAuthenticated()) return;

    set({ isLoading: true });
    try {
      const currentItems = get().mediaItems;
      const syncResult = await persistenceService.smartSync(currentItems);

      if (syncResult.success && (syncResult.action === 'downloaded' || syncResult.action === 'merged')) {
        const newLocalData = persistenceService.loadFromLocal();
        set({ mediaItems: newLocalData.items });
      }

      get().updateSyncStatus();
      console.log('📱 Manual sync result:', syncResult);
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Force refresh from cloud
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

  updateSyncStatus: () => {
    const status = persistenceService.getSyncStatus();
    set({ syncStatus: status });
  },
}));
