"use client";
import Image from "next/image";
import { MediaItem } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"; // Card is now just a container
import { Button } from "@/components/ui/button";
import {
  Star,
  Edit3,
  ChevronDown,
  ChevronUp,
  Info,
  Calendar as CalendarIcon,
  Play,
  CheckCircle,
  Clock,
  FilmIcon,
  TvIcon,
  ZapIcon,
} from "lucide-react"; // More specific icons

interface MediaCardProps {
  item: MediaItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
}

// Function to get a color based on item type or title for the placeholder
const getTypeColor = (type: MediaItem["type"]): string => {
  switch (type) {
    case "movie":
      return "bg-accent-primary"; // Blue for movies
    case "series":
      return "bg-success"; // Green for series (example)
    case "anime":
      return "bg-warning"; // Yellow for anime (example)
    default:
      return "bg-bg-layer-2";
  }
};
const getTypeIcon = (type: MediaItem["type"]) => {
  switch (type) {
    case "movie":
      return <FilmIcon size={14} className="mr-1.5 opacity-80" />;
    case "series":
      return <TvIcon size={14} className="mr-1.5 opacity-80" />;
    case "anime":
      return <ZapIcon size={14} className="mr-1.5 opacity-80" />; // Zap for anime
    default:
      return null;
  }
};

export default function MediaCard({ item, isExpanded, onToggleExpand, onEdit }: MediaCardProps) {
  const statusColorClass = () => {
    switch (item.status) {
      case "completed":
        return "text-success";
      case "watching":
        return "text-accent-primary";
      case "planned":
        return "text-info"; // Use info (blue) for planned
      case "on-hold":
        return "text-warning";
      case "dropped":
        return "text-destructive";
      default:
        return "text-text-muted";
    }
  };

  const placeholderColor = getTypeColor(item.type);

  return (
    <div
      className={cn(
        // Changed from Card to div for custom structure
        "flex flex-col sm:flex-row rounded-lg border border-border-subtle bg-bg-layer-1 text-text-primary shadow-fluent-card overflow-hidden transition-all duration-medium ease-in-out",
        isExpanded ? "shadow-fluent-dialog" : "", // More prominent shadow when expanded
      )}
    >
      {/* Left side: Image or Colored Placeholder Block */}
      <div
        className={cn(
          "relative w-full sm:w-2/5 md:w-1/3 lg:w-1/4 flex-shrink-0 aspect-[3/4] sm:aspect-auto", // Adjust aspect ratio and width
          placeholderColor,
          !item.imageUrl && "flex items-center justify-center p-4 text-center", // Center text if no image
        )}
      >
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 40vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
            priority={item.id < "3"} // Prioritize first few images
          />
        ) : (
          <h3 className="text-xl font-semibold text-text-on-accent break-words line-clamp-3">
            {item.title.length > 30 ? item.title.split(":")[0] : item.title}{" "}
            {/* Show shorter title or first part */}
          </h3>
        )}
      </div>

      {/* Right side: Content */}
      <div className="flex flex-col flex-grow p-4 sm:p-5">
        <div className="flex justify-between items-start mb-1">
          <h2 className="text-lg font-semibold text-text-primary mr-2 line-clamp-2">{item.title}</h2>
          {item.rating && item.status === "completed" && (
            <div className="flex items-center text-sm text-warning flex-shrink-0 ml-2">
              <Star size={16} className="mr-1 fill-current" />
              {item.rating}/10
            </div>
          )}
        </div>

        <div className="flex items-center text-xs text-text-secondary space-x-2 mb-3">
          {getTypeIcon(item.type)}
          <span className="capitalize">{item.type}</span>
          <span>•</span>
          <span className={cn("capitalize font-medium", statusColorClass())}>
            {item.status.replace("-", " ")}
          </span>
          {item.platform && (
            <>
              <span>•</span>
              <span className="truncate max-w-[100px]">{item.platform}</span>
            </>
          )}
        </div>

        {isExpanded && (
          <div className="space-y-2.5 text-sm mb-4 animate-fadeIn">
            {item.notes && (
              <div className="text-text-secondary leading-relaxed">
                <span className="font-medium text-text-primary block mb-0.5">Notes:</span> {item.notes}
              </div>
            )}
            <div className="grid grid-cols-1 gap-x-4 gap-y-1.5 text-xs text-text-secondary">
              {item.premiereDate && (
                <div className="flex items-center">
                  <CalendarIcon size={13} className="mr-1.5 text-text-muted" /> Premiere:{" "}
                  {formatDate(item.premiereDate)}
                </div>
              )}
              {item.startDate && (
                <div className="flex items-center">
                  <Play size={13} className="mr-1.5 text-text-muted" /> Started:{" "}
                  {formatDate(item.startDate)}
                </div>
              )}
              {item.completionDate && (
                <div className="flex items-center">
                  <CheckCircle size={13} className="mr-1.5 text-text-muted" /> Completed:{" "}
                  {formatDate(item.completionDate)}
                </div>
              )}
              {item.releaseDateTBD && (
                <div className="flex items-center">
                  <Clock size={13} className="mr-1.5 text-warning" /> Release: TBD
                </div>
              )}
              {(item.episodesWatched !== undefined || item.totalEpisodes) && (
                <div className="flex items-center">
                  <Info size={13} className="mr-1.5 text-text-muted" /> Episodes:{" "}
                  {item.episodesWatched ?? "?"} / {item.totalEpisodes ?? "?"}
                </div>
              )}
              {item.director && (
                <div className="flex items-center">
                  <Info size={13} className="mr-1.5 text-text-muted" /> Director: {item.director}
                </div>
              )}
              {item.genres && item.genres.length > 0 && (
                <div className="flex items-start">
                  <Info size={13} className="mr-1.5 text-text-muted mt-0.5 flex-shrink-0" /> Genres:{" "}
                  <span className="line-clamp-2">{item.genres.join(", ")}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-auto flex justify-end space-x-2 pt-2">
          <Button variant="subtle" size="sm" onClick={onToggleExpand} aria-expanded={isExpanded}>
            {isExpanded ? (
              <ChevronUp size={16} className="mr-1" />
            ) : (
              <ChevronDown size={16} className="mr-1" />
            )}
            {isExpanded ? "Less" : "More"}
          </Button>
          <Button variant="standard" size="sm" onClick={onEdit}>
            <Edit3 size={14} className="mr-1.5" /> Edit
          </Button>
        </div>
      </div>
    </div>
  );
}
