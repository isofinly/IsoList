export type MediaType = "movie" | "series" | "anime";
export type MediaStatus = "completed" | "watching" | "planned" | "on-hold" | "dropped";

export interface MediaItem {
  id: string;
  title: string;
  type: MediaType;
  status: MediaStatus;
  imageUrl?: string;
  rating?: number; // 1-10
  notes?: string;
  premiereDate?: string; // YYYY-MM-DD
  startDate?: string; // YYYY-MM-DD (when user started watching)
  completionDate?: string; // YYYY-MM-DD (when user finished)
  episodesWatched?: number;
  totalEpisodes?: number;
  releaseDateTBD?: boolean;
  genres?: string[]; // Optional: e.g., ["Sci-Fi", "Adventure"]
  director?: string; // Optional
  platform?: string; // Optional: e.g., "Netflix", "Cinema"
}
