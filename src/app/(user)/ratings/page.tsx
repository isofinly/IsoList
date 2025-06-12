"use client";
import MediaCard from "@/components/MediaCard";
import MediaForm from "@/components/MediaForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMediaStore } from "@/lib/store";
import type { MediaItem } from "@/lib/types";
import { SortAsc, SortDesc, Star } from "lucide-react";
import React, { useMemo, useState } from "react";
import { UserSelector } from "@/components/UserSelector";

type SortKey = "title" | "rating" | "completionDate";
type SortOrder = "asc" | "desc";

export default function RatingsPage() {
  const { getCurrentUserMediaItems, isViewingOwnData } = useMediaStore();
  const mediaItems = getCurrentUserMediaItems();
  const isOwnData = isViewingOwnData();
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [sortKey, setSortKey] = useState<SortKey>("completionDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const completedItems = useMemo(() => {
    let items = mediaItems.filter((item) => item.status === "completed");

    items = items.sort((a, b) => {
      let valA: string | number | Date;
      let valB: string | number | Date;
      switch (sortKey) {
        case "title":
          valA = a.title.toLowerCase();
          valB = b.title.toLowerCase();
          break;
        case "rating":
          valA = a.rating ?? 0;
          valB = b.rating ?? 0;
          break;
        case "completionDate":
          valA = a.completionDate ? new Date(a.completionDate).getTime() : 0;
          valB = b.completionDate ? new Date(b.completionDate).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;

      // Secondary sort by title if primary values are equal
      return a.title.toLowerCase() < b.title.toLowerCase() ? -1 : 1;
    });

    return items;
  }, [mediaItems, sortKey, sortOrder]);

  const handleToggleExpand = (id: string) => {
    setExpandedCardId((prevId) => (prevId === id ? null : id));
  };

  const handleEdit = (item: MediaItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  if (!completedItems.length) {
    return (
      <div className="text-center py-10 text-theme-muted-foreground">
        <Star
          size={48}
          className="mx-auto mb-4 text-theme-primary opacity-50"
        />
        <h2 className="text-2xl font-mono mb-2 text-theme-foreground">
          No Rated Items Yet
        </h2>
        <p>
          You haven't marked any movies, series, or anime as 'completed' with a
          rating!
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-mono text-theme-secondary flex items-center">
          <Star size={28} className="mr-3" /> My Ratings
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <UserSelector
            page="ratings"
            className="bg-theme-surface-alt border-theme-border"
          />
          <div className="h-4 w-px bg-theme-border mx-1" />
          <Label
            htmlFor="sortKey"
            className="text-sm text-theme-muted-foreground sr-only sm:not-sr-only"
          >
            Sort by:
          </Label>
          <Select
            value={sortKey}
            onValueChange={(value) => setSortKey(value as SortKey)}
          >
            <SelectTrigger className="w-auto bg-theme-surface-alt border-theme-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="completionDate">Completion Date</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSortOrder}
            aria-label={`Sort ${
              sortOrder === "asc" ? "descending" : "ascending"
            }`}
          >
            {sortOrder === "asc" ? (
              <SortAsc size={20} />
            ) : (
              <SortDesc size={20} />
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-start">
        {completedItems.map((item) => (
          <MediaCard
            key={item.id}
            item={item}
            isExpanded={expandedCardId === item.id}
            onToggleExpand={() => handleToggleExpand(item.id)}
            onEdit={() => handleEdit(item)}
            readOnly={!isOwnData}
          />
        ))}
      </div>

      {editingItem && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-mono text-xl text-theme-secondary">
                Edit: {editingItem.title}
              </DialogTitle>
            </DialogHeader>
            <div className="max-h-[70vh] overflow-y-auto pr-2">
              <MediaForm item={editingItem} onFormSubmit={handleModalClose} />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
