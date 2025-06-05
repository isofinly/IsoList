"use client";
import MediaCard from "@/components/MediaCard";
import MediaForm from "@/components/MediaForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMediaStore } from "@/lib/store";
import type { MediaItem } from "@/lib/types";
import { ListFilter, SortAsc, SortDesc, Tv } from "lucide-react";
import React, { useMemo, useState } from "react";

type WatchlistStatus = "watching" | "planned" | "on-hold";
type SortKey = "title" | "premiereDate" | "status"; // 'startDate' could also be an option
type SortOrder = "asc" | "desc";

export default function WatchlistPage() {
  const { mediaItems } = useMediaStore();
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [sortKey, setSortKey] = useState<SortKey>("premiereDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [filterStatus, setFilterStatus] = useState<WatchlistStatus | "all">("all");

  const watchlistItems = useMemo(() => {
    let items = mediaItems.filter(
      (item) => item.status === "watching" || item.status === "planned" || item.status === "on-hold",
    );

    if (filterStatus !== "all") {
      items = items.filter((item) => item.status === filterStatus);
    }

    items = items.sort((a, b) => {
      let valA: any, valB: any;
      switch (sortKey) {
        case "title":
          valA = a.title.toLowerCase();
          valB = b.title.toLowerCase();
          break;
        case "premiereDate": // For planned, premiereDate is key. For watching, startDate might be better.
          valA = a.premiereDate
            ? new Date(a.premiereDate).getTime()
            : a.startDate
              ? new Date(a.startDate).getTime()
              : Infinity;
          valB = b.premiereDate
            ? new Date(b.premiereDate).getTime()
            : b.startDate
              ? new Date(b.startDate).getTime()
              : Infinity;
          break;
        case "status": // Order by watching, then planned, then on-hold
          const statusOrder = { watching: 1, planned: 2, "on-hold": 3, completed: 4, dropped: 5 };
          valA = statusOrder[a.status];
          valB = statusOrder[b.status];
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
  }, [mediaItems, sortKey, sortOrder, filterStatus]);

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

  if (!watchlistItems.length && filterStatus === "all") {
    return (
      <div className="text-center py-10 text-theme-muted-foreground">
        <Tv size={48} className="mx-auto mb-4 text-theme-primary opacity-50" />
        <h2 className="text-2xl font-mono mb-2 text-theme-foreground">Your Watchlist is Empty</h2>
        <p>Add some movies, series, or anime you plan to watch or are currently watching!</p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-mono text-theme-secondary flex items-center">
          <Tv size={28} className="mr-3" /> My Watchlist
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <Label
            htmlFor="filterStatus"
            className="text-sm text-theme-muted-foreground sr-only sm:not-sr-only"
          >
            Filter:
          </Label>
          <Select
            value={filterStatus}
            onValueChange={(value) => setFilterStatus(value as WatchlistStatus | "all")}
          >
            <SelectTrigger className="w-auto bg-theme-surface-alt border-theme-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Watchlist</SelectItem>
              <SelectItem value="watching">Watching</SelectItem>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
          <Label
            htmlFor="sortKey"
            className="text-sm text-theme-muted-foreground sr-only sm:not-sr-only"
          >
            Sort by:
          </Label>
          <Select value={sortKey} onValueChange={(value) => setSortKey(value as SortKey)}>
            <SelectTrigger className="w-auto bg-theme-surface-alt border-theme-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="premiereDate">Date (Premiere/Start)</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
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

      {watchlistItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-start">
          {watchlistItems.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              isExpanded={expandedCardId === item.id}
              onToggleExpand={() => handleToggleExpand(item.id)}
              onEdit={() => handleEdit(item)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-theme-muted-foreground">
          <p>No items match the current filter.</p>
        </div>
      )}

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
