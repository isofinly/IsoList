"use client";

import { SyncManager } from "@/lib/sync-manager";
import { AuthService } from "@/lib/auth";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MediaItem } from "@/lib/types";
import MediaCard from "@/components/MediaCard";
import { Share2, UserPlus, ExternalLink } from "lucide-react";
import Link from "next/link";

interface SharedData {
  mediaItems: MediaItem[];
  sharedBy: string;
  sharedAt: string;
}

export default function SharedPage() {
  const params = useParams();
  const id = params.id as string;

  const [sharedData, setSharedData] = useState<SharedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authService = AuthService.getInstance();
  const syncManager = SyncManager.getInstance();

  useEffect(() => {
    const loadSharedData = async () => {
      try {
        const data = await syncManager.accessSharedFile(id);
        setSharedData(data);
      } catch (err: any) {
        console.error("Failed to load shared data:", err);
        if (err.status === 403 || err.status === 401) {
          setError(
            "Access denied. This share may be private or the link is invalid."
          );
        } else if (err.status === 404) {
          setError("Share not found. Please check the link.");
        } else {
          setError("Failed to load shared data. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadSharedData();
  }, [id, syncManager]);

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-accent mx-auto mb-4"></div>
          <p className="text-theme-muted-foreground">Loading shared data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-theme-surface flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-theme-muted-foreground mb-4">{error}</p>
            <Link href="/">
              <Button className="w-full">Go to IsoList</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!sharedData) {
    return null;
  }

  const completedItems = sharedData.mediaItems.filter(
    (item) => item.status === "completed"
  );
  const watchlistItems = sharedData.mediaItems.filter(
    (item) =>
      item.status === "watching" ||
      item.status === "planned" ||
      item.status === "on-hold"
  );
  const upcomingItems = sharedData.mediaItems.filter(
    (item) => item.premiereDate && new Date(item.premiereDate) > new Date()
  );

  return (
    <div className="min-h-screen bg-theme-surface">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Share2 size={32} className="text-theme-accent" />
            <h1 className="text-3xl font-mono text-theme-foreground">
              {sharedData.sharedBy}'s Lists
            </h1>
          </div>
          <p className="text-theme-muted-foreground">
            Shared on {new Date(sharedData.sharedAt).toLocaleDateString()}
          </p>

          {authService.isAuthenticated() ? (
            <div className="mt-4">
              <Link href="/">
                <Button variant="outline" className="mr-2">
                  <ExternalLink size={16} className="mr-2" />
                  Open IsoList
                </Button>
              </Link>
              <Button
                onClick={() => {
                  // You could add logic to join this share directly
                  window.location.href = `/?joinShare=${id}`;
                }}
              >
                <UserPlus size={16} className="mr-2" />
                Follow This User
              </Button>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-sm text-theme-muted-foreground mb-2">
                Sign in to follow this user and sync their updates
              </p>
              <Link href="/">
                <Button>Sign in to IsoList</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-theme-muted-foreground">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono text-theme-accent">
                {completedItems.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-theme-muted-foreground">
                Watchlist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono text-theme-accent">
                {watchlistItems.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-theme-muted-foreground">
                Upcoming
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono text-theme-accent">
                {upcomingItems.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {completedItems.length > 0 && (
            <section>
              <h2 className="text-2xl font-mono text-theme-foreground mb-4">
                Completed & Rated
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {completedItems.slice(0, 12).map((item) => (
                  <MediaCard
                    key={item.id}
                    item={item}
                    isExpanded={false}
                    onToggleExpand={() => {}}
                    onEdit={() => {}}
                    readOnly={true}
                  />
                ))}
              </div>
              {completedItems.length > 12 && (
                <p className="text-center text-theme-muted-foreground mt-4">
                  Showing 12 of {completedItems.length} completed items
                </p>
              )}
            </section>
          )}

          {watchlistItems.length > 0 && (
            <section>
              <h2 className="text-2xl font-mono text-theme-foreground mb-4">
                Watchlist
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {watchlistItems.slice(0, 12).map((item) => (
                  <MediaCard
                    key={item.id}
                    item={item}
                    isExpanded={false}
                    onToggleExpand={() => {}}
                    onEdit={() => {}}
                    readOnly={true}
                  />
                ))}
              </div>
              {watchlistItems.length > 12 && (
                <p className="text-center text-theme-muted-foreground mt-4">
                  Showing 12 of {watchlistItems.length} watchlist items
                </p>
              )}
            </section>
          )}

          {upcomingItems.length > 0 && (
            <section>
              <h2 className="text-2xl font-mono text-theme-foreground mb-4">
                Upcoming Releases
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {upcomingItems.slice(0, 8).map((item) => (
                  <MediaCard
                    key={item.id}
                    item={item}
                    isExpanded={false}
                    onToggleExpand={() => {}}
                    onEdit={() => {}}
                    readOnly={true}
                  />
                ))}
              </div>
              {upcomingItems.length > 8 && (
                <p className="text-center text-theme-muted-foreground mt-4">
                  Showing 8 of {upcomingItems.length} upcoming items
                </p>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
