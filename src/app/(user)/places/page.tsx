"use client";

import PlaceCard from "@/components/PlaceCard";
import PlaceForm from "@/components/PlaceForm";
import { UserSelector } from "@/components/UserSelector";
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
import type { PlaceItem } from "@/lib/types";
import { Landmark, SortAsc, SortDesc, Star } from "lucide-react";
import { useMemo, useState } from "react";

type SortKey = "name" | "rating" | "visitsCount" | "lastVisited";
type SortOrder = "asc" | "desc";

export default function PlacesPage() {
  const { getCurrentUserPlaceItems, isViewingOwnData } = useMediaStore();
  const placeItems = getCurrentUserPlaceItems();
  const isOwnData = isViewingOwnData();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<PlaceItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [sortKey, setSortKey] = useState<SortKey>("lastVisited");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const sortedItems = useMemo(() => {
    const items = [...placeItems];
    items.sort((a, b) => {
      let valA: string | number = 0;
      let valB: string | number = 0;
      switch (sortKey) {
        case "name":
          valA = (a.name || "").toLowerCase();
          valB = (b.name || "").toLowerCase();
          break;
        case "rating":
          valA = a.rating ?? 0;
          valB = b.rating ?? 0;
          break;
        case "visitsCount":
          valA = a.visitsCount ?? 0;
          valB = b.visitsCount ?? 0;
          break;
        case "lastVisited":
          valA = a.lastVisited ? new Date(a.lastVisited).getTime() : 0;
          valB = b.lastVisited ? new Date(b.lastVisited).getTime() : 0;
          break;
      }
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return items;
  }, [placeItems, sortKey, sortOrder]);

  const toggleSortOrder = () =>
    setSortOrder((o) => (o === "asc" ? "desc" : "asc"));

  const handleEdit = (item: PlaceItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-mono text-theme-secondary flex items-center">
          <Landmark size={28} className="mr-3" /> Places
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <UserSelector
            page="places"
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
              <SelectItem value="lastVisited">Last Visited</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="visitsCount">Visits</SelectItem>
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
          {isOwnData && (
            <Button
              onClick={() => {
                setEditingItem(null);
                setIsModalOpen(true);
              }}
            >
              Add Place
            </Button>
          )}
        </div>
      </div>

      {sortedItems.length === 0 ? (
        <div className="text-center py-10 text-theme-muted-foreground">
          <Landmark
            size={48}
            className="mx-auto mb-4 text-theme-primary opacity-50"
          />
          <h2 className="text-2xl font-mono mb-2 text-theme-foreground">
            No Places Yet
          </h2>
          <p>Track places you have visited or plan to visit.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-start">
          {sortedItems.map((item) => (
            <div key={item.id} className="w-full">
              <PlaceCard
                item={item}
                // make it visually consistent with MediaCard by enabling expand/edit affordances
                isExpanded={expandedId === item.id}
                onToggleExpand={() =>
                  setExpandedId((prev) => (prev === item.id ? null : item.id))
                }
                onEdit={() => handleEdit(item)}
                readOnly={!isOwnData}
              />
            </div>
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-mono text-xl text-theme-secondary">
              {editingItem ? `Edit: ${editingItem.name}` : "Add Place"}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto pr-2">
            <PlaceForm
              item={editingItem || undefined}
              onFormSubmit={handleModalClose}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
