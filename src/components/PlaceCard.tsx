"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { PlaceItem } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
  Edit3,
  MapPin,
  Star,
} from "lucide-react";
import Image from "next/image";

interface PlaceCardProps {
  item: PlaceItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit?: () => void;
  readOnly?: boolean;
}

export default function PlaceCard({
  item,
  isExpanded,
  onToggleExpand,
  onEdit,
  readOnly = false,
}: PlaceCardProps) {
  const hasImage = !!item.imageUrl;

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
            hasImage ? "bg-bg-layer-2" : "bg-bg-layer-2",
            !hasImage && "flex items-center justify-center p-6"
          )}
        >
          {hasImage ? (
            <>
              <Image
                src={item.imageUrl!}
                alt={item.name}
                fill
                sizes="(max-width: 1024px) 100vw, 192px"
                className={cn(
                  "object-cover transition-all duration-medium ease-fluent-standard",
                  "group-hover:scale-105"
                )}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-text-on-accent/10 flex items-center justify-center">
                <MapPin size={24} />
              </div>
              <h3 className="text-lg font-semibold text-text-on-accent line-clamp-3 leading-tight">
                {item.name.length > 30 ? item.name.split(":")[0] : item.name}
              </h3>
            </div>
          )}

          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-base/80 backdrop-blur-sm border border-border-subtle/50 text-xs font-medium text-text-primary">
            <MapPin size={12} />
            <span className="capitalize">{item.category}</span>
          </div>

          {item.rating && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-warning/90 backdrop-blur-sm text-xs font-medium text-black">
              <Star size={12} className="fill-current" />
              {item.rating}/5
            </div>
          )}
        </div>

        <div className="flex flex-col flex-grow p-5 lg:p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-grow pr-4">
              <h2 className="text-lg font-semibold text-text-primary mb-2 line-clamp-2 leading-tight group-hover:text-accent-primary transition-colors duration-short">
                {item.name}
              </h2>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all duration-short text-text-secondary bg-bg-layer-2 border-border-subtle">
                <span className="capitalize">{item.category}</span>
                {(item.city || item.country) && (
                  <span>
                    • {[item.city, item.country].filter(Boolean).join(", ")}
                  </span>
                )}
              </div>
            </div>

            {!readOnly && onEdit && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onEdit}
                  className="opacity-60 hover:opacity-100 h-8 w-8"
                >
                  <Edit3 size={14} />
                </Button>
              </div>
            )}
          </div>

          {/* Quick info */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary mb-4">
            {item.firstVisited && (
              <div className="flex items-center gap-1">
                <CalendarIcon size={12} />
                <span>{formatDate(item.firstVisited)}</span>
              </div>
            )}
            {item.visitsCount !== undefined && (
              <div className="flex items-center gap-1">
                <span>{item.visitsCount} visits</span>
              </div>
            )}
          </div>

          {isExpanded && (
            <div className="space-y-4 animate-fade-in-up">
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
                {item.lastVisited && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-bg-layer-2/30">
                    <CalendarIcon size={16} className="text-text-muted" />
                    <div>
                      <div className="text-xs text-text-muted">
                        Last Visited
                      </div>
                      <div className="font-medium text-text-primary">
                        {formatDate(item.lastVisited)}
                      </div>
                    </div>
                  </div>
                )}
                {(item.latitude !== undefined ||
                  item.longitude !== undefined) && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-bg-layer-2/30">
                    <MapPin size={16} className="text-text-muted" />
                    <div>
                      <div className="text-xs text-text-muted">Coordinates</div>
                      <div className="font-medium text-text-primary">
                        {item.latitude ?? "?"}, {item.longitude ?? "?"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
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

            {!readOnly && onEdit && (
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
