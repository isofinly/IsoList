// src/components/MediaForm.tsx
"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMediaStore } from "@/lib/store";
import type { MediaItem, MediaStatus, MediaType } from "@/lib/types";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";

interface MediaFormProps {
  item?: MediaItem;
  onFormSubmit?: () => void;
}

// Define a type for form data, storing numbers as strings for input compatibility
interface MediaFormData {
  id?: string;
  title: string;
  type: MediaType;
  status: MediaStatus;
  imageUrl: string;
  rating: string; // Stored as string for input
  notes: string;
  premiereDate: string; // YYYY-MM-DD
  startDate: string; // YYYY-MM-DD
  completionDate: string; // YYYY-MM-DD
  episodesWatched: string; // Stored as string for input
  totalEpisodes: string; // Stored as string for input
  releaseDateTBD: boolean;
  genres: string[];
  director: string;
  platform: string;
}

const initialFormState: MediaFormData = {
  title: "",
  type: "movie",
  status: "planned",
  imageUrl: "",
  rating: "", // Initialize as empty string
  notes: "",
  premiereDate: "",
  startDate: "",
  completionDate: "",
  episodesWatched: "", // Initialize as empty string
  totalEpisodes: "", // Initialize as empty string
  releaseDateTBD: false,
  genres: [],
  director: "",
  platform: "",
};

const mediaTypes: MediaType[] = ["movie", "series", "anime"];
const mediaStatuses: MediaStatus[] = ["completed", "watching", "planned", "on-hold", "dropped"];

export default function MediaForm({ item, onFormSubmit }: MediaFormProps) {
  const router = useRouter();
  const { addMediaItem, updateMediaItem } = useMediaStore();
  const [formData, setFormData] = useState<MediaFormData>(initialFormState);
  const [currentGenre, setCurrentGenre] = useState("");

  useEffect(() => {
    if (item) {
      setFormData({
        id: item.id,
        title: item.title || "",
        type: item.type || "movie",
        status: item.status || "planned",
        imageUrl: item.imageUrl || "",
        rating: item.rating !== undefined ? String(item.rating) : "",
        notes: item.notes || "",
        premiereDate: item.premiereDate ? item.premiereDate.split("T")[0] : "",
        startDate: item.startDate ? item.startDate.split("T")[0] : "",
        completionDate: item.completionDate ? item.completionDate.split("T")[0] : "",
        episodesWatched: item.episodesWatched !== undefined ? String(item.episodesWatched) : "",
        totalEpisodes: item.totalEpisodes !== undefined ? String(item.totalEpisodes) : "",
        releaseDateTBD: !!item.releaseDateTBD,
        genres: item.genres || [],
        director: item.director || "",
        platform: item.platform || "",
      });
    } else {
      setFormData(initialFormState); // Reset to initial empty strings for new form
    }
  }, [item]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      // Value from input event is always a string.
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentGenre(e.target.value);
  };

  const addGenre = () => {
    if (currentGenre && !formData.genres?.includes(currentGenre)) {
      setFormData((prev) => ({
        ...prev,
        genres: [...(prev.genres || []), currentGenre],
      }));
      setCurrentGenre("");
    }
  };

  const removeGenre = (genreToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres?.filter((g) => g !== genreToRemove),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      alert("Title is required.");
      return;
    }

    // Convert string numbers back to number | undefined for MediaItem structure
    const itemToStore: Omit<MediaItem, "id"> & { id?: string } = {
      ...formData,
      // Ensure correct parsing for numbers, or undefined if empty
      rating: formData.rating.trim() === "" ? undefined : Number.parseFloat(formData.rating),
      episodesWatched:
        formData.episodesWatched.trim() === ""
          ? undefined
          : Number.parseInt(formData.episodesWatched, 10),
      totalEpisodes:
        formData.totalEpisodes.trim() === "" ? undefined : Number.parseInt(formData.totalEpisodes, 10),
      // Dates are already YYYY-MM-DD strings, which is fine for MediaItem type
      // Ensure booleans are correct
      releaseDateTBD: !!formData.releaseDateTBD,
    };

    // Validate parsed numbers if necessary (e.g., check for NaN)
    if (formData.rating.trim() !== "" && isNaN(itemToStore.rating!)) itemToStore.rating = undefined;
    if (formData.episodesWatched.trim() !== "" && isNaN(itemToStore.episodesWatched!))
      itemToStore.episodesWatched = undefined;
    if (formData.totalEpisodes.trim() !== "" && isNaN(itemToStore.totalEpisodes!))
      itemToStore.totalEpisodes = undefined;

    if (itemToStore.id) {
      updateMediaItem(itemToStore as MediaItem);
    } else {
      const { id, ...newItemData } = itemToStore;
      addMediaItem(newItemData as Omit<MediaItem, "id">);
      router.push(formData.status === "completed" ? "/ratings" : "/watchlist");
    }
    if (onFormSubmit) onFormSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">
            Title <span className="text-theme-destructive">*</span>
          </Label>
          <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="type">Type</Label>
          <Select id="type" name="type" value={formData.type} onChange={handleChange}>
            {mediaTypes.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select id="status" name="status" value={formData.status} onChange={handleChange}>
          {mediaStatuses.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1).replace("-", " ")}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          placeholder="https://..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="rating">Rating (1-10)</Label>
          {/* value is now always a string (formData.rating) */}
          <Input
            id="rating"
            name="rating"
            type="number"
            min="0.5"
            max="10"
            step="0.5"
            value={formData.rating}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="platform">Platform/Service</Label>
          <Input
            id="platform"
            name="platform"
            value={formData.platform}
            onChange={handleChange}
            placeholder="e.g. Netflix, Cinema"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="premiereDate">Premiere Date</Label>
          <Input
            id="premiereDate"
            name="premiereDate"
            type="date"
            value={formData.premiereDate}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="startDate">Start Watching Date</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="completionDate">Completion Date</Label>
          <Input
            id="completionDate"
            name="completionDate"
            type="date"
            value={formData.completionDate}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="episodesWatched">Episodes Watched</Label>
          {/* value is now always a string (formData.episodesWatched) */}
          <Input
            id="episodesWatched"
            name="episodesWatched"
            type="number"
            min="0"
            value={formData.episodesWatched}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="totalEpisodes">Total Episodes</Label>
          {/* value is now always a string (formData.totalEpisodes) */}
          <Input
            id="totalEpisodes"
            name="totalEpisodes"
            type="number"
            min="0"
            value={formData.totalEpisodes}
            onChange={handleChange}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="director">Director/Creator</Label>
        <Input id="director" name="director" value={formData.director} onChange={handleChange} />
      </div>

      <div>
        <Label htmlFor="genres">Genres</Label>
        <div className="flex items-center gap-2 mb-2">
          <Input
            id="currentGenre"
            name="currentGenre"
            value={currentGenre}
            onChange={handleGenreChange}
            placeholder="Add genre"
          />
          <Button type="button" variant="secondary" size="sm" onClick={addGenre}>
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.genres?.map((g) => (
            <span
              key={g}
              className="flex items-center bg-theme-surface-alt text-theme-foreground text-xs px-2 py-1 rounded-md"
            >
              {g}
              <button
                type="button"
                onClick={() => removeGenre(g)}
                className="ml-2 text-theme-accent hover:text-theme-destructive"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="releaseDateTBD"
          name="releaseDateTBD"
          checked={formData.releaseDateTBD}
          onChange={handleChange}
        />
        <Label htmlFor="releaseDateTBD" className="cursor-pointer">
          Release Date is TBD
        </Label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        {onFormSubmit && (
          <Button type="button" variant="outline" onClick={onFormSubmit}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary">
          {item ? "Save Changes" : "Add Media"}
        </Button>
      </div>
    </form>
  );
}
