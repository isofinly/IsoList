"use client";
import MediaCard from "@/components/MediaCard";
import MediaForm from "@/components/MediaForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useMediaStore } from "@/lib/store";
import type { MediaItem } from "@/lib/types";
import { ListFilter, SortAsc, SortDesc, Star } from "lucide-react";
import React, { useMemo, useState } from "react";

type SortKey = "title" | "rating" | "completionDate";
type SortOrder = "asc" | "desc";

export default function RatingsPage() {
  const { mediaItems } = useMediaStore();
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [sortKey, setSortKey] = useState<SortKey>("completionDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const completedItems = useMemo(() => {
    let items = mediaItems.filter((item) => item.status === "completed");

    items = items.sort((a, b) => {
      let valA, valB;
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
      return 0;
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
    setEditingItem(null); // Important to clear editing item
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  if (!completedItems.length) {
    return (
      <div className="text-center py-10 text-theme-muted-foreground">
        <Star size={48} className="mx-auto mb-4 text-color-highlight-yellow opacity-50" />
        <h2 className="text-2xl font-mono mb-2 text-theme-foreground">No Rated Items Yet</h2>
        <p>You haven't marked any movies, series, or anime as 'completed' with a rating.</p>
        <p>Go ahead and add some!</p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-mono text-theme-primary flex items-center">
          <ListFilter size={28} className="mr-3" /> My Ratings
        </h1>
        <div className="flex items-center gap-2">
          <Label
            htmlFor="sortKey"
            className="text-sm text-theme-muted-foreground sr-only sm:not-sr-only"
          >
            Sort by:
          </Label>
          <Select
            id="sortKey"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="w-auto bg-theme-surface-alt border-theme-border"
          >
            <option value="completionDate">Completion Date</option>
            <option value="rating">Rating</option>
            <option value="title">Title</option>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSortOrder}
            aria-label={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
          >
            {sortOrder === "asc" ? <SortAsc size={20} /> : <SortDesc size={20} />}
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
          />
        ))}
      </div>

      {editingItem && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-mono text-xl text-theme-primary">
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
