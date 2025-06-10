"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useMediaStore } from "@/lib/store";
import type { MediaItem, MediaStatus, MediaType } from "@/lib/types";
import {
  Calendar,
  FileText,
  Film,
  Monitor,
  Plus,
  Star,
  Tag,
  Tv,
  User,
  X,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";

interface MediaFormProps {
  item?: MediaItem;
  onFormSubmit?: () => void;
}

interface MediaFormData {
  id?: string;
  title: string;
  type: MediaType;
  status: MediaStatus;
  imageUrl: string;
  rating: string;
  notes: string;
  premiereDate: string; // YYYY-MM-DD
  startDate: string; // YYYY-MM-DD
  completionDate: string; // YYYY-MM-DD
  episodesWatched: string;
  totalEpisodes: string;
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
  rating: "",
  notes: "",
  premiereDate: "",
  startDate: "",
  completionDate: "",
  episodesWatched: "",
  totalEpisodes: "",
  releaseDateTBD: false,
  genres: [],
  director: "",
  platform: "",
};

const mediaTypes: MediaType[] = ["movie", "series", "anime"];
const mediaStatuses: MediaStatus[] = [
  "completed",
  "watching",
  "planned",
  "on-hold",
  "dropped",
];

const getTypeIcon = (type: MediaType) => {
  switch (type) {
    case "movie":
      return <Film size={16} className="text-accent-primary" />;
    case "series":
      return <Tv size={16} className="text-accent-primary" />;
    case "anime":
      return <Zap size={16} className="text-accent-primary" />;
    default:
      return <Film size={16} className="text-accent-primary" />;
  }
};

const getStatusColor = (status: MediaStatus) => {
  switch (status) {
    case "completed":
      return "text-success";
    case "watching":
      return "text-accent-primary";
    case "planned":
      return "text-info";
    case "on-hold":
      return "text-warning";
    case "dropped":
      return "text-destructive";
    default:
      return "text-text-muted";
  }
};

export default function MediaForm({ item, onFormSubmit }: MediaFormProps) {
  const router = useRouter();
  const { addMediaItem, updateMediaItem } = useMediaStore();
  const [formData, setFormData] = useState<MediaFormData>(initialFormState);
  const [currentGenre, setCurrentGenre] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useGlobalToast();

  // TODO: Improve this section
  useEffect(() => {
    if (item) {
      const validStatus =
        item.status &&
        ["completed", "watching", "planned", "on-hold", "dropped"].includes(
          item.status
        )
          ? item.status
          : "planned";

      const validType =
        item.type && ["movie", "series", "anime"].includes(item.type)
          ? item.type
          : "movie";

      setFormData({
        id: item.id,
        title: item.title || "",
        type: validType,
        status: validStatus,
        imageUrl: item.imageUrl || "",
        rating: item.rating !== undefined ? String(item.rating) : "",
        notes: item.notes || "",
        premiereDate: item.premiereDate ? item.premiereDate.split("T")[0] : "",
        startDate: item.startDate ? item.startDate.split("T")[0] : "",
        completionDate: item.completionDate
          ? item.completionDate.split("T")[0]
          : "",
        episodesWatched:
          item.episodesWatched !== undefined
            ? String(item.episodesWatched)
            : "",
        totalEpisodes:
          item.totalEpisodes !== undefined ? String(item.totalEpisodes) : "",
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error("Validation Error", "Title is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const itemToStore: Omit<MediaItem, "id"> & { id?: string } = {
        ...formData,
        rating:
          formData.rating.trim() === ""
            ? undefined
            : Number.parseFloat(formData.rating),
        episodesWatched:
          formData.episodesWatched.trim() === ""
            ? undefined
            : Number.parseInt(formData.episodesWatched, 10),
        totalEpisodes:
          formData.totalEpisodes.trim() === ""
            ? undefined
            : Number.parseInt(formData.totalEpisodes, 10),
        // Dates are already YYYY-MM-DD strings, which is fine for MediaItem type
        // Ensure booleans are correct
        releaseDateTBD: !!formData.releaseDateTBD,
      };

      if (formData.rating.trim() !== "" && Number.isNaN(itemToStore.rating!))
        itemToStore.rating = undefined;
      if (
        formData.episodesWatched.trim() !== "" &&
        Number.isNaN(itemToStore.episodesWatched!)
      )
        itemToStore.episodesWatched = undefined;
      if (
        formData.totalEpisodes.trim() !== "" &&
        Number.isNaN(itemToStore.totalEpisodes!)
      )
        itemToStore.totalEpisodes = undefined;

      if (itemToStore.id) {
        updateMediaItem(itemToStore as MediaItem);
      } else {
        const { id, ...newItemData } = itemToStore;
        addMediaItem(newItemData as Omit<MediaItem, "id">);
        router.push(
          formData.status === "completed" ? "/ratings" : "/watchlist"
        );
      }
      if (onFormSubmit) onFormSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <Card className="w-full max-w-4xl mx-auto reveal-hover">
        <CardHeader className="text-center sm:text-left">
          <CardTitle className="flex items-center justify-center sm:justify-start gap-3 text-2xl">
            {getTypeIcon(formData.type)}
            {item ? "Edit Media Item" : "Add New Media"}
          </CardTitle>
          <CardDescription className="text-base">
            {item
              ? "Update the details of your media item"
              : "Add a new movie, series, or anime to your collection"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-border-divider/30">
                <Film size={20} className="text-accent-primary" />
                <h3 className="text-lg font-semibold text-text-primary">
                  Basic Information
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-start">
                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <FileText size={16} className="text-text-muted" />
                    Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Enter the title..."
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="type"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    {getTypeIcon(formData.type)}
                    Type
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => {
                      if (
                        value &&
                        ["movie", "series", "anime"].includes(value)
                      ) {
                        setFormData((prev) => ({
                          ...prev,
                          type: value as MediaType,
                        }));
                      }
                    }}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mediaTypes.map((t) => (
                        <SelectItem
                          key={t}
                          value={t}
                          className="flex items-center gap-2"
                        >
                          <div className="flex items-center gap-2">
                            {getTypeIcon(t)}
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="status"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${getStatusColor(
                        formData.status
                      ).replace("text-", "bg-")}`}
                    />
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => {
                      if (
                        value &&
                        [
                          "completed",
                          "watching",
                          "planned",
                          "on-hold",
                          "dropped",
                        ].includes(value)
                      ) {
                        setFormData((prev) => ({
                          ...prev,
                          status: value as MediaStatus,
                        }));
                      }
                    }}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mediaStatuses.map((s) => (
                        <SelectItem key={s} value={s}>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${getStatusColor(
                                s
                              ).replace("text-", "bg-")}`}
                            />
                            {s.charAt(0).toUpperCase() +
                              s.slice(1).replace("-", " ")}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="imageUrl"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Monitor size={16} className="text-text-muted" />
                    Image URL
                  </Label>
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className="h-11"
                  />
                </div>
              </div>
            </div>

            {/* Rating & Platform Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-border-divider/30">
                <Star size={20} className="text-accent-primary" />
                <h3 className="text-lg font-semibold text-text-primary">
                  Rating & Details
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-start">
                <div className="space-y-2">
                  <Label
                    htmlFor="rating"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Star size={16} className="text-warning" />
                    Rating (0.5 - 10.0)
                  </Label>
                  <Input
                    id="rating"
                    name="rating"
                    type="number"
                    min="0.5"
                    max="10"
                    step="0.5"
                    value={formData.rating}
                    onChange={handleChange}
                    placeholder="8.5"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="platform"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Monitor size={16} className="text-text-muted" />
                    Platform/Service
                  </Label>
                  <Input
                    id="platform"
                    name="platform"
                    value={formData.platform}
                    onChange={handleChange}
                    placeholder="Netflix, Disney+, Cinema..."
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="director"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <User size={16} className="text-text-muted" />
                    Director/Creator
                  </Label>
                  <Input
                    id="director"
                    name="director"
                    value={formData.director}
                    onChange={handleChange}
                    placeholder="Christopher Nolan"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="releaseDateTBD"
                      name="releaseDateTBD"
                      checked={formData.releaseDateTBD}
                      onChange={handleChange}
                    />
                    <Label
                      htmlFor="releaseDateTBD"
                      className="cursor-pointer text-sm font-medium flex items-center gap-2"
                    >
                      <Calendar size={16} className="text-text-muted" />
                      Release Date is TBD
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Episodes Section (for series/anime) */}
            {(formData.type === "series" || formData.type === "anime") && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-border-divider/30">
                  <Tv size={20} className="text-accent-primary" />
                  <h3 className="text-lg font-semibold text-text-primary">
                    Episode Progress
                  </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-start">
                  <div className="space-y-2">
                    <Label
                      htmlFor="episodesWatched"
                      className="text-sm font-medium"
                    >
                      Episodes Watched
                    </Label>
                    <Input
                      id="episodesWatched"
                      name="episodesWatched"
                      type="number"
                      min="0"
                      value={formData.episodesWatched}
                      onChange={handleChange}
                      placeholder="12"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="totalEpisodes"
                      className="text-sm font-medium"
                    >
                      Total Episodes
                    </Label>
                    <Input
                      id="totalEpisodes"
                      name="totalEpisodes"
                      type="number"
                      min="0"
                      value={formData.totalEpisodes}
                      onChange={handleChange}
                      placeholder="24"
                      className="h-11"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Dates Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-border-divider/30">
                <Calendar size={20} className="text-accent-primary" />
                <h3 className="text-lg font-semibold text-text-primary">
                  Important Dates
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="premiereDate" className="text-sm font-medium">
                    Premiere Date
                  </Label>
                  <Input
                    id="premiereDate"
                    name="premiereDate"
                    type="date"
                    value={formData.premiereDate}
                    onChange={handleChange}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm font-medium">
                    Start Watching Date
                  </Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="completionDate"
                    className="text-sm font-medium"
                  >
                    Completion Date
                  </Label>
                  <Input
                    id="completionDate"
                    name="completionDate"
                    type="date"
                    value={formData.completionDate}
                    onChange={handleChange}
                    className="h-11"
                  />
                </div>
              </div>
            </div>

            {/* Genres Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-border-divider/30">
                <Tag size={20} className="text-accent-primary" />
                <h3 className="text-lg font-semibold text-text-primary">
                  Genres
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Input
                    id="currentGenre"
                    name="currentGenre"
                    value={currentGenre}
                    onChange={handleGenreChange}
                    placeholder="Add a genre (Action, Drama, Comedy...)"
                    className="flex-1 h-11"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={addGenre}
                    disabled={!currentGenre.trim()}
                    className="shrink-0"
                  >
                    <Plus size={16} className="mr-2" />
                    Add
                  </Button>
                </div>

                {formData.genres && formData.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.genres.map((genre) => (
                      <span
                        key={genre}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-accent-primary-soft text-accent-primary text-sm rounded-lg border border-border-subtle"
                      >
                        <Tag size={14} />
                        {genre}
                        <button
                          type="button"
                          onClick={() => removeGenre(genre)}
                          className="ml-1 p-0.5 hover:bg-accent-primary-soft-hover rounded-sm transition-colors duration-short"
                        >
                          <X size={14} className="hover:text-destructive" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-border-divider/30">
                <FileText size={20} className="text-accent-primary" />
                <h3 className="text-lg font-semibold text-text-primary">
                  Notes
                </h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">
                  Personal Notes
                </Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Add your thoughts, memorable quotes, or any other notes..."
                  className="resize-none"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-border-divider/30">
              {onFormSubmit && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onFormSubmit}
                  className="order-2 sm:order-1"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                variant="accent"
                disabled={isSubmitting}
                className="order-1 sm:order-2"
                size="lg"
              >
                {isSubmitting
                  ? item
                    ? "Saving Changes..."
                    : "Adding Media..."
                  : item
                  ? "Save Changes"
                  : "Add Media"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
