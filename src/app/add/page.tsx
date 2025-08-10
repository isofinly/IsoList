"use client";

import { useState } from "react";
import MediaForm from "@/components/MediaForm";
import PlaceForm from "@/components/PlaceForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarPlus, Film, MapPin } from "lucide-react";

export default function AddPage() {
  const [activeTab, setActiveTab] = useState<"media" | "place">("media");
  const noop = () => {};

  return (
    <div className="animate-fadeIn max-w-4xl mx-auto px-4">
      <h1 className="text-3xl font-mono text-theme-secondary mb-8 flex items-center">
        <CalendarPlus size={28} className="mr-3" /> New Item
      </h1>

      <div className="mb-6">
        <div
          className="flex border-b border-theme-border/50"
          role="tablist"
          aria-label="Item types"
        >
          <button
            onClick={() => setActiveTab("media")}
            role="tab"
            aria-selected={activeTab === "media"}
            aria-controls="panel-media"
            id="tab-media"
            className={`flex items-center px-6 py-3 border-b-2 transition-all duration-150 ease-out font-medium rounded-t-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)] focus-visible:shadow-[var(--shadow-fluent-popup)] ${
              activeTab === "media"
                ? "border-theme-accent text-theme-accent bg-theme-accent/8"
                : "border-transparent text-theme-muted hover:text-theme-text hover:bg-theme-surface-alt/50"
            }`}
          >
            <Film size={18} className="mr-2" /> Media
          </button>
          <button
            onClick={() => setActiveTab("place")}
            role="tab"
            aria-selected={activeTab === "place"}
            aria-controls="panel-place"
            id="tab-place"
            className={`flex items-center px-6 py-3 border-b-2 transition-all duration-150 ease-out font-medium rounded-t-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)] focus-visible:shadow-[var(--shadow-fluent-popup)] ${
              activeTab === "place"
                ? "border-theme-accent text-theme-accent bg-theme-accent/8"
                : "border-transparent text-theme-muted hover:text-theme-text hover:bg-theme-surface-alt/50"
            }`}
          >
            <MapPin size={18} className="mr-2" /> Place
          </button>
        </div>
      </div>

      <Card className="fluent-surface">
        <CardHeader>
          <CardTitle className="flex items-center">
            {activeTab === "media" ? (
              <>
                <Film size={18} className="mr-2" /> Media Details
              </>
            ) : (
              <>
                <MapPin size={18} className="mr-2" /> Place Details
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="max-h-[70vh] overflow-y-auto pr-2"
            role="tabpanel"
            id={activeTab === "media" ? "panel-media" : "panel-place"}
            aria-labelledby={activeTab === "media" ? "tab-media" : "tab-place"}
          >
            {activeTab === "media" ? (
              <MediaForm onFormSubmit={noop} />
            ) : (
              <PlaceForm onFormSubmit={noop} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
