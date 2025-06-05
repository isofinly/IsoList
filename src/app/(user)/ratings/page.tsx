"use client";
import MediaCard from "@/components/MediaCard";
import MediaForm from "@/components/MediaForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardGlass, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogForm } from "@/components/ui/dialog";
import { InputSearch } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useMediaStore } from "@/lib/store";
import type { MediaItem } from "@/lib/types";
import { 
  ListFilter, 
  SortAsc, 
  SortDesc, 
  Star, 
  Search,
  Filter,
  Grid3X3,
  List,
  TrendingUp,
  Award,
  BarChart3
} from "lucide-react";
import React, { useMemo, useState } from "react";

type SortKey = "title" | "rating" | "completionDate";
type SortOrder = "asc" | "desc";
type ViewMode = "grid" | "list";

export default function RatingsPage() {
  const { mediaItems } = useMediaStore();
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const [sortKey, setSortKey] = useState<SortKey>("completionDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const completedItems = useMemo(() => {
    let items = mediaItems.filter((item) => item.status === "completed");

    // Filter by search query
    if (searchQuery) {
      items = items.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.director?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.genres?.some(genre => genre.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort items
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
  }, [mediaItems, sortKey, sortOrder, searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalItems = completedItems.length;
    const averageRating = totalItems > 0 
      ? completedItems.reduce((sum, item) => sum + (item.rating || 0), 0) / totalItems 
      : 0;
    const topRated = completedItems.filter(item => (item.rating || 0) >= 8).length;
    
    return { totalItems, averageRating, topRated };
  }, [completedItems]);

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

  if (!completedItems.length && !searchQuery) {
    return (
      <div className="min-h-[calc(100vh-var(--navbar-height)-8rem)] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto animate-fade-in-up">
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-accent-primary-soft flex items-center justify-center">
            <Star size={48} className="text-accent-primary opacity-60" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-text-primary">No Rated Items Yet</h2>
          <p className="text-text-secondary mb-6 leading-relaxed">
            You haven't marked any movies, series, or anime as 'completed' with a rating.
            Start building your personal collection!
          </p>
          <Button asChild variant="accent" size="lg" className="group">
            <a href="/add" className="flex items-center">
              <Star className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-short" />
              Add Your First Rating
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header Section */}
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-primary flex items-center mb-2">
              <Award size={32} className="mr-3 text-accent-primary" />
              My Ratings
            </h1>
            <p className="text-text-secondary">
              Your personal collection of rated entertainment
            </p>
          </div>
          
          {/* Stats Cards */}
          <div className="flex gap-4">
            <CardGlass className="px-4 py-3 text-center min-w-[80px]">
              <div className="text-xl font-bold text-accent-primary">{stats.totalItems}</div>
              <div className="text-xs text-text-muted">Total</div>
            </CardGlass>
            <CardGlass className="px-4 py-3 text-center min-w-[80px]">
              <div className="text-xl font-bold text-warning">{stats.averageRating.toFixed(1)}</div>
              <div className="text-xs text-text-muted">Average</div>
            </CardGlass>
            <CardGlass className="px-4 py-3 text-center min-w-[80px]">
              <div className="text-xl font-bold text-success">{stats.topRated}</div>
              <div className="text-xs text-text-muted">Top Rated</div>
            </CardGlass>
          </div>
        </div>

        {/* Controls */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Search */}
            <div className="flex-grow max-w-md">
              <InputSearch
                placeholder="Search by title, director, or genre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 p-1 bg-bg-layer-2 rounded-lg">
              <Button
                variant={viewMode === "grid" ? "subtle" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 w-8 p-0"
              >
                <Grid3X3 size={16} />
              </Button>
              <Button
                variant={viewMode === "list" ? "subtle" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 w-8 p-0"
              >
                <List size={16} />
              </Button>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2">
              <Label htmlFor="sortKey" className="text-sm text-text-secondary whitespace-nowrap">
                Sort by:
              </Label>
              <select
                id="sortKey"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="h-9 px-3 rounded-md border border-border-subtle bg-bg-layer-1 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition-all duration-short"
              >
                <option value="completionDate">Completion Date</option>
                <option value="rating">Rating</option>
                <option value="title">Title</option>
              </select>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSortOrder}
                className="h-9 w-9"
                aria-label={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
              >
                {sortOrder === "asc" ? <SortAsc size={16} /> : <SortDesc size={16} />}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Results */}
      {completedItems.length === 0 && searchQuery ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-bg-layer-2 flex items-center justify-center">
            <Search size={24} className="text-text-muted" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">No Results Found</h3>
          <p className="text-text-secondary">
            Try adjusting your search terms or clearing the search to see all items.
          </p>
          <Button
            variant="outline"
            onClick={() => setSearchQuery("")}
            className="mt-4"
          >
            Clear Search
          </Button>
        </div>
      ) : (
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 xl:grid-cols-2 gap-6" 
          : "space-y-4"
        }>
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
      )}

      {/* Edit Modal */}
      {editingItem && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogForm
            title={`Edit: ${editingItem.title}`}
            description="Update the details of this media item"
          >
            <MediaForm item={editingItem} onFormSubmit={handleModalClose} />
          </DialogForm>
        </Dialog>
      )}
    </div>
  );
}