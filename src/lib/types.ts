export type MediaType = "movie" | "series" | "anime";
export type MediaStatus = "completed" | "watching" | "planned" | "on-hold" | "dropped";

export interface MediaItem {
  id: string;
  title: string;
  type: MediaType;
  status: MediaStatus;
  updatedAt?: string; // ISO timestamp
  imageUrl?: string;
  rating?: number; // 1-10
  notes?: string;
  premiereDate?: string; // YYYY-MM-DD
  startDate?: string; // YYYY-MM-DD (when user started watching)
  completionDate?: string; // YYYY-MM-DD (when user finished)
  episodesWatched?: number;
  totalEpisodes?: number;
  releaseDateTBD?: boolean;
  genres?: string[]; // Optional
  director?: string; // Optional
  platform?: string; // Optional
}

// Places tracking
export type PlaceCategory =
  | "city"
  | "country"
  | "restaurant"
  | "cafe"
  | "bar"
  | "museum"
  | "park"
  | "landmark"
  | "nature"
  | "other";

export interface PlaceItem {
  id: string;
  name: string;
  category: PlaceCategory;
  updatedAt?: string; // ISO timestamp
  // Simple location fields; coordinates optional
  city?: string;
  country?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  firstVisited?: string; // YYYY-MM-DD
  lastVisited?: string; // YYYY-MM-DD
  visitsCount?: number;
  rating?: number; // 1-5
  favorite?: boolean;
  notes?: string;
  tags?: string[];
  imageUrl?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: () => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
      };
    };
  }
}

export { };
