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
  CalendarPlus,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import Link from "next/link";
import React, { useMemo } from "react";

const CalendarItemDisplay: React.FC<{ item: MediaItem; simple?: boolean }> = ({ item, simple }) => (
  <Link href={`#`} className="block p-3 hover:bg-theme-surface-alt rounded-md transition-colors">
    {" "}
    {/* Link to item page if exists */}
    <div className="flex justify-between items-center">
      <div>
        <h4 className="font-mono text-sm text-theme-foreground truncate">{item.title}</h4>
        <p className="text-xs text-theme-muted-foreground">
          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          {simple ? ` - ${formatDate(item.premiereDate)}` : ""}
        </p>
      </div>
      {!simple && <span className="text-xs text-theme-primary">{formatDate(item.premiereDate)}</span>}
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

  const calendarGrid = useMemo(() => {
    const grid = [];
    // Add empty cells for days before the first of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
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
  }, [daysInMonth, firstDayOfMonth, currentMonthDate, releasesInCurrentMonth]);

  const changeMonth = (offset: number) => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl font-mono text-theme-accent mb-8 flex items-center">
        <CalendarDays size={28} className="mr-3" /> Release Calendar
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column */}
        <aside className="lg:w-1/3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <CalendarClock size={18} className="mr-2 text-theme-primary" />
                Next Arriving Releases
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingReleases.length > 0 ? (
                <ul className="space-y-1 max-h-60 overflow-y-auto">
                  {upcomingReleases.slice(0, 5).map((item) => (
                    <li key={item.id}>
                      <CalendarItemDisplay item={item} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-theme-muted-foreground">No upcoming releases scheduled.</p>
              )}
              {upcomingReleases.length > 5 && (
                <p className="text-xs text-theme-muted-foreground mt-2">
                  And {upcomingReleases.length - 5} more...
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <AlertTriangle size={18} className="mr-2 text-color-highlight-yellow" />
                TBD Releases
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tbdReleases.length > 0 ? (
                <ul className="space-y-1 max-h-48 overflow-y-auto">
                  {tbdReleases.map((item) => (
                    <li key={item.id}>
                      <CalendarItemDisplay item={item} simple />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-theme-muted-foreground">No items with TBD release dates.</p>
              )}
            </CardContent>
          </Card>
        </aside>

        {/* Main Calendar View (Right Column) */}
        <main className="lg:w-2/3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
                {currentMonthDate.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => changeMonth(-1)}
                  aria-label="Previous month"
                >
                  <ChevronsLeft size={18} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => changeMonth(1)}
                  aria-label="Next month"
                >
                  <ChevronsRight size={18} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-px border-l border-t border-theme-border bg-theme-border">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div
                    key={day}
                    className="py-2 text-center text-xs font-mono text-theme-muted-foreground bg-theme-surface"
                  >
                    {day}
                  </div>
                ))}
                {calendarGrid.map((cell) => (
                  <div
                    key={cell.key}
                    className={`p-2 h-24 sm:h-32 overflow-y-auto bg-theme-surface border-r border-b border-theme-border
                                ${cell.isEmpty ? "opacity-50" : ""}
                                ${cell.date && cell.date.getTime() === today.getTime() ? "bg-theme-primary/10" : ""}`}
                  >
                    {!cell.isEmpty && (
                      <>
                        <div
                          className={`font-mono text-xs ${cell.date && cell.date.getTime() === today.getTime() ? "text-theme-primary font-bold" : "text-theme-foreground"}`}
                        >
                          {cell.day}
                        </div>
                        <ul className="mt-1 space-y-0.5">
                          {cell.releases?.map((item) => (
                            <li
                              key={item.id}
                              className="text-[10px] leading-tight text-theme-secondary hover:text-theme-secondary-hover truncate cursor-pointer"
                              title={`${item.title} (${item.type})`}
                            >
                              {item.title}
                            </li>
                          ))}
                        </ul>
                      </>
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
