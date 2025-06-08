"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMediaStore } from "@/lib/store";
import type { MediaItem } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import {
  AlertTriangle,
  CalendarClock,
  CalendarDays,
  ChevronsLeft,
  ChevronsRight,
  CircleHelp,
} from "lucide-react";
import Link from "next/link";
import React, { useMemo } from "react";

const CalendarItemDisplay: React.FC<{ item: MediaItem; simple?: boolean }> = ({ item, simple }) => (
  <Link
    href={"#"}
    className="block p-3 hover:bg-theme-surface-alt rounded-md transition-all duration-200 reveal-hover fluent-surface-hover border border-transparent hover:border-theme-border"
  >
    <div className="flex justify-between items-center">
      <div className="flex-1 min-w-0">
        <h4 className="font-mono text-sm text-theme-foreground truncate">{item.title}</h4>
        <p className="text-xs text-theme-muted-foreground">
          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          {simple ? ` - ${formatDate(item.premiereDate)}` : ""}
        </p>
      </div>
      {!simple && (
        <span className="text-xs text-theme-accent font-medium ml-2 flex-shrink-0">
          {formatDate(item.premiereDate)}
        </span>
      )}
    </div>
  </Link>
);

export default function CalendarPage() {
  const { mediaItems } = useMediaStore();
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today for date comparisons

  const [currentMonthDate, setCurrentMonthDate] = React.useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const upcomingReleases = useMemo(() => {
    return mediaItems
      .filter(
        (item) =>
          item.premiereDate &&
          new Date(item.premiereDate + "T00:00:00") >= today &&
          !item.releaseDateTBD,
      )
      .sort((a, b) => new Date(a.premiereDate!).getTime() - new Date(b.premiereDate!).getTime());
  }, [mediaItems, today]);

  const tbdReleases = useMemo(() => {
    return mediaItems.filter((item) => item.releaseDateTBD);
  }, [mediaItems]);

  const releasesInCurrentMonth = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    return mediaItems
      .filter((item) => {
        if (!item.premiereDate || item.releaseDateTBD) return false;
        const premiere = new Date(item.premiereDate + "T00:00:00");
        return premiere.getFullYear() === year && premiere.getMonth() === month;
      })
      .sort((a, b) => new Date(a.premiereDate!).getDate() - new Date(b.premiereDate!).getDate());
  }, [mediaItems, currentMonthDate]);

  const daysInMonth = new Date(
    currentMonthDate.getFullYear(),
    currentMonthDate.getMonth() + 1,
    0,
  ).getDate();
  const firstDayOfMonth = new Date(
    currentMonthDate.getFullYear(),
    currentMonthDate.getMonth(),
    1,
  ).getDay(); // 0 (Sun) - 6 (Sat)

  // Adjust for Monday start: convert Sunday (0) to 6, others subtract 1
  const firstDayOfMonthAdjusted = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const calendarGrid = useMemo(() => {
    const grid = [];
    // Add empty cells for days before the first of the month
    for (let i = 0; i < firstDayOfMonthAdjusted; i++) {
      grid.push({ key: `empty-${i}`, isEmpty: true });
    }
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), day);
      const dayReleases = releasesInCurrentMonth.filter(
        (item) => new Date(item.premiereDate! + "T00:00:00").getDate() === day,
      );
      grid.push({
        key: `day-${day}`,
        day,
        date,
        releases: dayReleases,
        isEmpty: false,
      });
    }
    return grid;
  }, [daysInMonth, firstDayOfMonthAdjusted, currentMonthDate, releasesInCurrentMonth]);

  const changeMonth = (offset: number) => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-mono text-theme-accent flex items-center">
          <CalendarDays size={28} className="mr-3" /> Release Calendar
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column */}
        <aside className="lg:w-1/3 space-y-6">
          <Card className="fluent-surface reveal-hover elevation-fluent-card border-theme-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center text-theme-foreground">
                <CalendarClock size={18} className="mr-2 text-theme-accent" />
                Next Arriving Releases
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {upcomingReleases.length > 0 ? (
                <div className="space-y-1 max-h-60 overflow-y-auto fluent-scroll">
                  {upcomingReleases.slice(0, 5).map((item) => (
                    <CalendarItemDisplay key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CalendarClock size={32} className="text-theme-muted-foreground/50 mb-2" />
                  <p className="text-sm text-theme-muted-foreground">No upcoming releases scheduled.</p>
                </div>
              )}
              {upcomingReleases.length > 5 && (
                <div className="mt-4 pt-4 border-t border-theme-border">
                  <p className="text-xs text-theme-muted-foreground text-center">
                    And {upcomingReleases.length - 5} more releases...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="fluent-surface reveal-hover elevation-fluent-card border-theme-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center text-theme-foreground">
                <CircleHelp size={18} className="mr-2 text-color-highlight-yellow" />
                TBD Releases
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {tbdReleases.length > 0 ? (
                <div className="space-y-1 max-h-48 overflow-y-auto fluent-scroll">
                  {tbdReleases.map((item) => (
                    <CalendarItemDisplay key={item.id} item={item} simple />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <AlertTriangle size={32} className="text-theme-muted-foreground/50 mb-2" />
                  <p className="text-sm text-theme-muted-foreground">No items with TBD release dates.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="fluent-surface reveal-hover elevation-fluent-card border-theme-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center text-theme-foreground">
                <CalendarDays size={18} className="mr-2 text-theme-accent" />
                Calendar Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 px-3 bg-theme-surface-alt/50 rounded-lg border border-theme-border/30">
                  <span className="text-sm text-theme-muted-foreground">This Month</span>
                  <span className="text-lg font-mono font-bold text-theme-accent">
                    {releasesInCurrentMonth.length}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 px-3 bg-theme-surface-alt/50 rounded-lg border border-theme-border/30">
                  <span className="text-sm text-theme-muted-foreground">Upcoming Total</span>
                  <span className="text-lg font-mono font-bold text-theme-secondary">
                    {upcomingReleases.length}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 px-3 bg-theme-surface-alt/50 rounded-lg border border-theme-border/30">
                  <span className="text-sm text-theme-muted-foreground">TBD Releases</span>
                  <span className="text-lg font-mono font-bold text-color-highlight-yellow">
                    {tbdReleases.length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Main Calendar View (Right Column) */}
        <main className="lg:w-2/3">
          <Card className="fluent-surface reveal-hover elevation-fluent-card border-theme-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg text-theme-foreground font-mono">
                {currentMonthDate.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => changeMonth(-1)}
                  aria-label="Previous month"
                  className="reveal-hover fluent-surface-hover border-theme-border hover:border-theme-accent/50 transition-all duration-200"
                >
                  <ChevronsLeft size={18} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => changeMonth(1)}
                  aria-label="Next month"
                  className="reveal-hover fluent-surface-hover border-theme-border hover:border-theme-accent/50 transition-all duration-200"
                >
                  <ChevronsRight size={18} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-3 mb-4">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
                  (day, index) => (
                    <div
                      key={day}
                      className="text-center text-xs font-medium text-theme-muted-foreground uppercase tracking-wider py-2"
                    >
                      <span className="hidden sm:inline">{day}</span>
                      <span className="sm:hidden">{["M", "T", "W", "T", "F", "S", "S"][index]}</span>
                    </div>
                  ),
                )}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-3">
                {calendarGrid.map((cell) => (
                  <div
                    key={cell.key}
                    className={`
                      min-h-20 sm:min-h-28 rounded-xl transition-all duration-200 relative group cursor-pointer
                      ${
                        cell.isEmpty
                          ? "opacity-0 pointer-events-none"
                          : "bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 shadow-sm hover:shadow-md backdrop-blur-sm hover:scale-[1.02]"
                      }
                      ${
                        cell.date && cell.date.getTime() === today.getTime()
                          ? "ring-2 ring-theme-accent/50 bg-theme-accent/8 border-theme-accent/30"
                          : ""
                      }
                    `}
                  >
                    {!cell.isEmpty && (
                      <div className="p-3 h-full flex flex-col">
                        {/* Day Number */}
                        <div className="flex justify-between items-start mb-2">
                          <span
                            className={`text-sm font-semibold leading-none ${
                              cell.date && cell.date.getTime() === today.getTime()
                                ? "text-theme-accent"
                                : "text-theme-foreground"
                            }`}
                          >
                            {cell.day}
                          </span>

                          {/* Release Count Indicator */}
                          {cell.releases && cell.releases.length > 0 && (
                            <div className="flex items-center justify-center w-5 h-5 bg-theme-accent/20 text-theme-accent text-xs font-bold rounded-full">
                              {cell.releases.length}
                            </div>
                          )}
                        </div>

                        {/* Releases */}
                        {cell.releases && cell.releases.length > 0 && (
                          <div className="flex-1 space-y-1 overflow-hidden">
                            {cell.releases.slice(0, 2).map((item, index) => (
                              <div
                                key={item.id}
                                className={`
                                  text-[10px] leading-snug px-2 py-1 rounded-md cursor-pointer transition-all duration-150 group/item
                                  ${
                                    index === 0
                                      ? "bg-theme-accent/15 text-theme-accent hover:bg-theme-accent/25 border border-theme-accent/20"
                                      : "bg-theme-secondary/15 text-theme-secondary hover:bg-theme-secondary/25 border border-theme-secondary/20"
                                  }
                                `}
                                title={`${item.title} (${item.type})`}
                              >
                                <div className="font-medium truncate">{item.title}</div>
                                <div className="text-[8px] opacity-75 truncate capitalize">
                                  {item.type}
                                </div>
                              </div>
                            ))}
                            {cell.releases.length > 2 && (
                              <div className="text-[9px] text-theme-muted-foreground text-center font-medium px-2 py-1 bg-theme-muted-foreground/10 rounded-md">
                                +{cell.releases.length - 2} more
                              </div>
                            )}
                          </div>
                        )}

                        {/* Today's subtle glow */}
                        {cell.date && cell.date.getTime() === today.getTime() && (
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-theme-accent/5 to-transparent pointer-events-none" />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
