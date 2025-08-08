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
import type { PlaceCategory, PlaceItem } from "@/lib/types";
import { Calendar, Flag, Landmark, MapPin, Star, Tag, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useEffect, useState } from "react";

interface PlaceFormProps {
  item?: PlaceItem;
  onFormSubmit?: () => void;
}

interface PlaceFormData {
  id?: string;
  name: string;
  category: PlaceCategory;
  city: string;
  country: string;
  address: string;
  latitude: string;
  longitude: string;
  firstVisited: string;
  lastVisited: string;
  visitsCount: string;
  rating: string;
  favorite: boolean;
  notes: string;
  tags: string[];
  imageUrl: string;
}

const initialFormState: PlaceFormData = {
  name: "",
  category: "city",
  city: "",
  country: "",
  address: "",
  latitude: "",
  longitude: "",
  firstVisited: "",
  lastVisited: "",
  visitsCount: "",
  rating: "",
  favorite: false,
  notes: "",
  tags: [],
  imageUrl: "",
};

const categories: PlaceCategory[] = [
  "city",
  "country",
  "restaurant",
  "cafe",
  "bar",
  "museum",
  "park",
  "landmark",
  "nature",
  "other",
];

export default function PlaceForm({ item, onFormSubmit }: PlaceFormProps) {
  const router = useRouter();
  const { addPlaceItem, updatePlaceItem, deletePlaceItem } = useMediaStore();
  const [formData, setFormData] = useState<PlaceFormData>(initialFormState);
  const [currentTag, setCurrentTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useGlobalToast();

  useEffect(() => {
    if (item) {
      setFormData({
        id: item.id,
        name: item.name || "",
        category: item.category || "other",
        city: item.city || "",
        country: item.country || "",
        address: item.address || "",
        latitude: item.latitude !== undefined ? String(item.latitude) : "",
        longitude: item.longitude !== undefined ? String(item.longitude) : "",
        firstVisited: item.firstVisited ? item.firstVisited.split("T")[0] : "",
        lastVisited: item.lastVisited ? item.lastVisited.split("T")[0] : "",
        visitsCount:
          item.visitsCount !== undefined ? String(item.visitsCount) : "",
        rating: item.rating !== undefined ? String(item.rating) : "",
        favorite: !!item.favorite,
        notes: item.notes || "",
        tags: item.tags || [],
        imageUrl: item.imageUrl || "",
      });
    } else {
      setFormData(initialFormState);
    }
  }, [item]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target as {
      name: keyof PlaceFormData;
      value: string;
    };
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: PlaceItem = {
        id: formData.id || "",
        name: formData.name.trim(),
        category: formData.category,
        city: formData.city.trim() || undefined,
        country: formData.country.trim() || undefined,
        address: formData.address.trim() || undefined,
        latitude: formData.latitude ? Number(formData.latitude) : undefined,
        longitude: formData.longitude ? Number(formData.longitude) : undefined,
        firstVisited: formData.firstVisited || undefined,
        lastVisited: formData.lastVisited || undefined,
        visitsCount: formData.visitsCount
          ? Number(formData.visitsCount)
          : undefined,
        rating: formData.rating ? Number(formData.rating) : undefined,
        favorite: !!formData.favorite,
        notes: formData.notes.trim() || undefined,
        tags: formData.tags,
        imageUrl: formData.imageUrl.trim() || undefined,
      };

      if (!payload.name) {
        toast.error("Validation", "Name is required");
        return;
      }

      if (item) {
        updatePlaceItem(payload);
        toast.success("Updated", `"${payload.name}" updated successfully.`);
      } else {
        const { id, ...withoutId } = payload;
        // add will create ID
        addPlaceItem(withoutId);
        toast.success("Added", `"${payload.name}" added to Places.`);
      }

      if (onFormSubmit) onFormSubmit();
      else router.push("/places");
    } catch (err) {
      toast.error("Save Failed", "Could not save place. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeTag = (t: string) => {
    setFormData((p) => ({ ...p, tags: p.tags.filter((x) => x !== t) }));
  };

  const addTag = () => {
    const t = currentTag.trim();
    if (!t) return;
    setFormData((p) => {
      const existingTags = p.tags || [];
      return {
        ...p,
        tags: existingTags.includes(t) ? existingTags : [...existingTags, t],
      };
    });
    setCurrentTag("");
  };

  const handleDelete = async () => {
    if (!item?.id) return;
    setIsSubmitting(true);
    try {
      deletePlaceItem(item.id);
      toast.success("Deleted", `"${item.name}" removed from Places.`);
      if (onFormSubmit) onFormSubmit();
      else router.push("/places");
    } catch (err) {
      toast.error("Delete Failed", "Could not delete place.");
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <Card className="w-full max-w-4xl mx-auto reveal-hover">
        <CardHeader className="text-center sm:text-left">
          <CardTitle className="flex items-center justify-center sm:justify-start gap-3 text-2xl">
            <Landmark size={18} className="text-accent-primary" />
            {item ? "Edit Place" : "Add Place"}
          </CardTitle>
          <CardDescription className="text-base">
            {item
              ? "Update details for this place"
              : "Track a place you've visited or want to visit"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Tokyo, Louvre, etc"
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) =>
                    setFormData((p) => ({ ...p, category: v as PlaceCategory }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <div className="flex items-center gap-2">
                  <Flag size={16} className="text-text-muted" />
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-text-muted" />
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="e.g. 35.6762"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="e.g. 139.6503"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstVisited">First Visited</Label>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-text-muted" />
                  <Input
                    id="firstVisited"
                    name="firstVisited"
                    type="date"
                    value={formData.firstVisited}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastVisited">Last Visited</Label>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-text-muted" />
                  <Input
                    id="lastVisited"
                    name="lastVisited"
                    type="date"
                    value={formData.lastVisited}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="visitsCount">Visits</Label>
                <Input
                  id="visitsCount"
                  name="visitsCount"
                  value={formData.visitsCount}
                  onChange={handleChange}
                  placeholder="e.g. 1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating">Rating (1-5)</Label>
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-accent-primary" />
                  <Input
                    id="rating"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    placeholder="e.g. 5"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="favorite"
                    checked={formData.favorite}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, favorite: e.target.checked }))
                    }
                  />
                  <Label htmlFor="favorite" className="cursor-pointer">
                    Favorite
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="What stood out?"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  <Tag size={16} className="mr-2" />
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-bg-layer-2 border border-border-subtle text-sm"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => removeTag(t)}
                        className="hover:text-error"
                        aria-label={`Remove ${t}`}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t border-border-divider/30">
              {item && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isSubmitting}
                  className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50 focus:ring-destructive/50"
                >
                  Delete
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {item ? "Save Changes" : "Add Place"}
              </Button>
            </div>
          </form>

          <ConfirmationDialog
            isOpen={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={handleDelete}
            title="Delete item?"
            description={`This will permanently remove "${
              item?.name ?? "this item"
            }" from your collection. This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
            variant="destructive"
          />
        </CardContent>
      </Card>
    </div>
  );
}
