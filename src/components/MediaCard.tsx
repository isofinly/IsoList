"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { MediaItem } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import {
  Calendar as CalendarIcon,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Edit3,
  ExternalLink,
  FilmIcon,
  Info,
  MoreHorizontal,
  Play,
  Star,
  TvIcon,
  ZapIcon,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface MediaCardProps {
  item: MediaItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  readOnly?: boolean;
}

const getTypeColor = (type: MediaItem["type"]): string => {
  switch (type) {
    case "movie":
      return "bg-accent-primary";
    case "series":
      return "bg-success";
    case "anime":
      return "bg-warning";
    default:
      return "bg-bg-layer-2";
  }
};

const getTypeIcon = (type: MediaItem["type"], size = 16) => {
  const iconProps = {
    size,
    className: "transition-all duration-short ease-fluent-standard",
  };

  switch (type) {
    case "movie":
      return <FilmIcon {...iconProps} />;
    case "series":
      return <TvIcon {...iconProps} />;
    case "anime":
      return <ZapIcon {...iconProps} />;
    default:
      return null;
  }
};

const getStatusColor = (status: MediaItem["status"]) => {
  switch (status) {
    case "completed":
      return "text-success bg-success-soft border-success/30";
    case "watching":
      return "text-accent-primary bg-accent-primary-soft border-accent-primary/30";
    case "planned":
      return "text-info bg-info-soft border-info/30";
    case "on-hold":
      return "text-warning bg-warning-soft border-warning/30";
    case "dropped":
      return "text-destructive bg-destructive-soft border-destructive/30";
    default:
      return "text-text-muted bg-bg-layer-2 border-border-subtle";
  }
};

export default function MediaCard({
  item,
  isExpanded,
  onToggleExpand,
  onEdit,
  readOnly = false,
}: MediaCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const placeholderColor = getTypeColor(item.type);
  const statusColorClass = getStatusColor(item.status);

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-medium ease-fluent-standard",
        "hover:shadow-fluent-dialog hover:scale-[1.01] hover:border-border-interactive",
        "reveal-hover fluent-surface-hover",
        isExpanded && [
          "shadow-fluent-dialog scale-[1.01] border-border-interactive",
          "bg-gradient-to-br from-bg-layer-1 to-bg-layer-2",
        ],
        "bg-gradient-to-br from-bg-layer-1 via-bg-layer-1 to-bg-layer-2/50"
      )}
    >
      <div className="flex flex-col lg:flex-row h-full">
        <div
          className={cn(
            "relative flex-shrink-0 aspect-[3/4] lg:aspect-auto lg:w-48",
            "overflow-hidden rounded-t-lg lg:rounded-l-lg lg:rounded-tr-none",
            placeholderColor,
            !item.imageUrl && "flex items-center justify-center p-6"
          )}
        >
          {item.imageUrl && !imageError ? (
            <>
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                sizes="(max-width: 1024px) 100vw, 192px"
                className={cn(
                  "object-cover transition-all duration-medium ease-fluent-standard",
                  "group-hover:scale-105",
                  imageLoaded ? "opacity-100" : "opacity-0"
                )}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                priority={item.id < "3"}
              />
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-r from-bg-layer-2 via-bg-layer-1 to-bg-layer-2 animate-pulse" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-text-on-accent/10 flex items-center justify-center">
                {getTypeIcon(item.type, 24)}
              </div>
              <h3 className="text-lg font-semibold text-text-on-accent line-clamp-3 leading-tight">
                {item.title.length > 30 ? item.title.split(":")[0] : item.title}
              </h3>
            </div>
          )}

          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-base/80 backdrop-blur-sm border border-border-subtle/50 text-xs font-medium text-text-primary">
            {getTypeIcon(item.type, 12)}
            <span className="capitalize">{item.type}</span>
          </div>

          {item.rating && item.status === "completed" && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-warning/90 backdrop-blur-sm text-xs font-medium text-black">
              <Star size={12} className="fill-current" />
              {item.rating}/10
            </div>
          )}
        </div>

        <div className="flex flex-col flex-grow p-5 lg:p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-grow pr-4">
              <h2 className="text-lg font-semibold text-text-primary mb-2 line-clamp-2 leading-tight group-hover:text-accent-primary transition-colors duration-short">
                {item.title}
              </h2>

              <div
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all duration-short",
                  statusColorClass
                )}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                <span className="capitalize font-medium">
                  {item.status.replace("-", " ")}
                </span>
              </div>
            </div>

            {/* Action menu */}
            {!readOnly && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onEdit}
                  className="opacity-60 hover:opacity-100 h-8 w-8"
                >
                  <Edit3 size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-60 hover:opacity-100 h-8 w-8"
                >
                  <MoreHorizontal size={14} />
                </Button>
              </div>
            )}
          </div>

          {/* Quick info */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary mb-4">
            {item.platform && (
              <div className="flex items-center gap-1">
                <ExternalLink size={12} />
                <span className="truncate max-w-[120px]">{item.platform}</span>
              </div>
            )}
            {item.premiereDate && (
              <div className="flex items-center gap-1">
                <CalendarIcon size={12} />
                <span>{new Date(item.premiereDate).getFullYear()}</span>
              </div>
            )}
            {(item.episodesWatched !== undefined || item.totalEpisodes) && (
              <div className="flex items-center gap-1">
                <Play size={12} />
                <span>
                  {item.episodesWatched ?? "?"} / {item.totalEpisodes ?? "?"}
                </span>
              </div>
            )}
          </div>

          {isExpanded && (
            <div className="space-y-4 animate-fade-in-up">
              {/* Notes */}
              {item.notes && (
                <div className="p-4 rounded-lg bg-bg-layer-2/50 border border-border-subtle/50">
                  <p className="text-sm text-text-secondary leading-relaxed">
                    <span className="font-medium text-text-primary">
                      Notes:{" "}
                    </span>
                    {item.notes}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {item.premiereDate && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-bg-layer-2/30">
                    <CalendarIcon size={16} className="text-text-muted" />
                    <div>
                      <div className="text-xs text-text-muted">Premiere</div>
                      <div className="font-medium text-text-primary">
                        {formatDate(item.premiereDate)}
                      </div>
                    </div>
                  </div>
                )}

                {item.startDate && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-bg-layer-2/30">
                    <Play size={16} className="text-text-muted" />
                    <div>
                      <div className="text-xs text-text-muted">Started</div>
                      <div className="font-medium text-text-primary">
                        {formatDate(item.startDate)}
                      </div>
                    </div>
                  </div>
                )}

                {item.completionDate && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-bg-layer-2/30">
                    <CheckCircle size={16} className="text-success" />
                    <div>
                      <div className="text-xs text-text-muted">Completed</div>
                      <div className="font-medium text-text-primary">
                        {formatDate(item.completionDate)}
                      </div>
                    </div>
                  </div>
                )}

                {item.director && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-bg-layer-2/30">
                    <Info size={16} className="text-text-muted" />
                    <div>
                      <div className="text-xs text-text-muted">Director</div>
                      <div className="font-medium text-text-primary">
                        {item.director}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Genres */}
              {item.genres && item.genres.length > 0 && (
                <div>
                  <div className="text-xs text-text-muted mb-2">Genres</div>
                  <div className="flex flex-wrap gap-2">
                    {item.genres.map((genre) => (
                      <span
                        key={genre}
                        className="px-2.5 py-1 text-xs font-medium bg-accent-primary-soft text-accent-primary rounded-full border border-accent-primary/20"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer actions */}
          <div className="mt-auto pt-4 flex justify-between items-center">
            <Button
              variant="subtle"
              size="sm"
              onClick={onToggleExpand}
              className="group"
              aria-expanded={isExpanded}
            >
              {isExpanded ? (
                <>
                  <ChevronUp
                    size={16}
                    className="mr-1.5 group-hover:scale-110 transition-transform duration-short"
                  />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown
                    size={16}
                    className="mr-1.5 group-hover:scale-110 transition-transform duration-short"
                  />
                  Show More
                </>
              )}
            </Button>

            {!readOnly && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="group"
              >
                <Edit3
                  size={14}
                  className="mr-1.5 group-hover:scale-110 transition-transform duration-short"
                />
                Edit
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
