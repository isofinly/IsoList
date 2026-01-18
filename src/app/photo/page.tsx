"use client";
import { useState } from "react";
import { CardGlass } from "@/components/ui/card";
import { ColorWheel } from "@/components/photo/ColorWheel";
import { ThemeExtractor } from "@/components/photo/ThemeExtractor";
import { GradientExtractor } from "@/components/photo/GradientExtractor";
import { PieChart, Image as ImageIcon, Paintbrush } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PhotoToolPage() {
  const [activeTab, setActiveTab] = useState<"wheel" | "theme" | "gradient">("wheel");
  const [sharedColors, setSharedColors] = useState<string[]>([]);

  return (
    <div className="min-h-screen bg-bg-base pt-24 pb-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4 tracking-tight">Photo Tool</h1>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <CardGlass className="p-1 flex gap-1 bg-white/5 border-white/10 rounded-xl">
            <button
              onClick={() => setActiveTab("wheel")}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-medium",
                activeTab === "wheel"
                  ? "bg-accent-primary text-white shadow-lg"
                  : "text-text-secondary hover:text-text-primary hover:bg-white/5"
              )}
            >
              <PieChart size={18} />
              Color Wheel
            </button>
            <button
              onClick={() => setActiveTab("theme")}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-medium",
                activeTab === "theme"
                  ? "bg-accent-primary text-white shadow-lg"
                  : "text-text-secondary hover:text-text-primary hover:bg-white/5"
              )}
            >
              <ImageIcon size={18} />
              Extract Theme
            </button>
            <button
              onClick={() => setActiveTab("gradient")}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-medium",
                activeTab === "gradient"
                  ? "bg-accent-primary text-white shadow-lg"
                  : "text-text-secondary hover:text-text-primary hover:bg-white/5"
              )}
            >
              <Paintbrush size={18} />
              Extract Gradient
            </button>
          </CardGlass>
        </div>

        {/* Content */}
        <div className="animate-fade-in-up">
          {activeTab === "wheel" && <ColorWheel initialPalette={sharedColors} />}
          {activeTab === "theme" && <ThemeExtractor onColorsChange={setSharedColors} />}
          {activeTab === "gradient" && <GradientExtractor />}
        </div>
      </div>
    </div>
  );
}
