"use client";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
// import ColorThief from "colorthief";
import { CardGlass } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X, Copy, Check, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { hexToHsl, hslToHex } from "@/lib/colors";

type Mood = "colorful" | "bright" | "muted" | "deep" | "dark" | "none";

export function ThemeExtractor({ onColorsChange }: { onColorsChange?: (colors: string[]) => void }) {
  const [image, setImage] = useState<string | null>(null);
  const [colors, setColors] = useState<string[]>([]);
  const [mood, setMood] = useState<Mood>("none");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [markers, setMarkers] = useState<{ x: number, y: number }[]>([
    { x: 20, y: 20 }, { x: 40, y: 40 }, { x: 60, y: 60 }, { x: 80, y: 80 }, { x: 50, y: 50 }, { x: 30, y: 70 }
  ]);
  const [draggingMarkerIdx, setDraggingMarkerIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setColors([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const extractColors = useCallback((currentMarkers = markers) => {
    if (!imgRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = imgRef.current.naturalWidth;
    canvas.height = imgRef.current.naturalHeight;
    ctx.drawImage(imgRef.current, 0, 0);

    const newColors = currentMarkers.map(marker => {
      const x = Math.max(0, Math.min(canvas.width - 1, Math.floor((marker.x / 100) * canvas.width)));
      const y = Math.max(0, Math.min(canvas.height - 1, Math.floor((marker.y / 100) * canvas.height)));
      try {
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        return "#" + Array.from(pixel.slice(0, 3)).map(x => x.toString(16).padStart(2, "0")).join("");
      } catch {
        return "#ffffff";
      }
    });

    setColors(newColors);
  }, [markers]);

  const handleMarkerDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (draggingMarkerIdx === null || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100));

    const newMarkers = [...markers];
    newMarkers[draggingMarkerIdx] = { x, y };
    setMarkers(newMarkers);
    extractColors(newMarkers);
  };

  const applyMood = useCallback((hex: string, currentMood: Mood): string => {
    if (currentMood === "none") return hex;
    const hsl = hexToHsl(hex);
    switch (currentMood) {
      case "colorful": return hslToHex({ ...hsl, s: Math.min(100, hsl.s + 30) });
      case "bright": return hslToHex({ ...hsl, l: Math.min(100, hsl.l + 30) });
      case "muted": return hslToHex({ ...hsl, s: Math.max(0, hsl.s - 40) });
      case "deep": return hslToHex({ ...hsl, s: Math.max(0, hsl.s - 10), l: Math.max(0, hsl.l - 20) });
      case "dark": return hslToHex({ ...hsl, l: Math.max(0, hsl.l - 40) });
      default: return hex;
    }
  }, []);

  const moods: { id: Mood; label: string }[] = [
    { id: "colorful", label: "Colorful" },
    { id: "bright", label: "Bright" },
    { id: "muted", label: "Muted" },
    { id: "deep", label: "Deep" },
    { id: "dark", label: "Dark" },
    { id: "none", label: "None" },
  ];

  const processedColors = useMemo(() =>
    colors.slice(0, 6).map(c => applyMood(c, mood)),
    [colors, mood, applyMood]
  );

  useEffect(() => {
    if (processedColors.length > 0 && onColorsChange) {
      // Small delay to avoid batching issues or infinite loops during rapid marker movement
      const timeout = setTimeout(() => {
        onColorsChange(processedColors);
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [processedColors, onColorsChange]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
      <div className="lg:col-span-1">
        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">Color Mood</h3>
        <div className="space-y-1">
          {moods.map((m) => (
            <button
              key={m.id}
              onClick={() => setMood(m.id)}
              className={cn(
                "w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-short",
                mood === m.id
                  ? "bg-accent-primary-soft text-accent-primary border border-accent-primary/20"
                  : "text-text-secondary hover:text-text-primary hover:bg-white/5 border border-transparent"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-3 space-y-8">
        {!image ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="aspect-video w-full rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 hover:border-accent-primary/50 transition-all group"
          >
            <Upload size={48} className="text-text-muted mb-4 group-hover:scale-110 transition-transform" />
            <p className="text-text-secondary font-medium">Click to upload an image</p>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
          </div>
        ) : (
          <div className="space-y-8 flex flex-col items-center">
            <div
              ref={containerRef}
              className="relative group overflow-hidden rounded-2xl border border-white/10 shadow-2xl cursor-crosshair w-fit mx-auto"
              onMouseMove={handleMarkerDrag}
              onMouseUp={() => setDraggingMarkerIdx(null)}
              onMouseLeave={() => setDraggingMarkerIdx(null)}
              onTouchMove={handleMarkerDrag}
              onTouchEnd={() => setDraggingMarkerIdx(null)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={image}
                alt="Selected"
                onLoad={() => extractColors()}
                crossOrigin="anonymous"
                className="max-h-[600px] w-auto block pointer-events-none"
              />

              {markers.map((marker, idx) => (
                <div
                  key={idx}
                  onMouseDown={(e) => { e.stopPropagation(); setDraggingMarkerIdx(idx); }}
                  onTouchStart={(e) => { e.stopPropagation(); setDraggingMarkerIdx(idx); }}
                  className={cn(
                    "absolute w-8 h-8 -ml-4 -mt-4 border-4 border-white rounded-full shadow-2xl transition-transform hover:scale-110 cursor-grab active:cursor-grabbing z-20",
                    draggingMarkerIdx === idx && "scale-125 ring-4 ring-accent-primary/50"
                  )}
                  style={{
                    left: `${marker.x}%`,
                    top: `${marker.y}%`,
                    backgroundColor: colors[idx] || '#fff'
                  }}
                />
              ))}

              <Button
                variant="destructive"
                size="icon"
                onClick={() => setImage(null)}
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-30"
              >
                <X size={20} />
              </Button>
            </div>

            <div className="w-full space-y-8">

            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Extracted Palette</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const tabs = document.querySelectorAll('button');
                  const wheelTab = Array.from(tabs).find(b => b.textContent?.includes('Color Wheel'));
                  if (wheelTab) (wheelTab as HTMLButtonElement).click();
                }}
                className="gap-2 bg-white/5 border-white/10 hover:bg-accent-primary hover:border-accent-primary transition-all text-xs"
              >
                <PieChart size={14} />
                Edit in Color Wheel
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {processedColors.length > 0 ? (
                processedColors.map((hex, idx) => (
                  <CardGlass key={idx} className="p-4 flex flex-col gap-4 group hover:scale-105 transition-all duration-medium">
                    <div
                      className="aspect-square w-full rounded-2xl shadow-inner border border-white/5"
                      style={{ backgroundColor: hex }}
                    />
                    <div className="flex items-center justify-between px-1">
                      <span className="font-mono text-sm font-semibold">{hex.toUpperCase()}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(hex);
                          setCopiedIndex(idx);
                          setTimeout(() => setCopiedIndex(null), 2000);
                        }}
                        className="text-text-muted hover:text-accent-primary transition-colors"
                      >
                        {copiedIndex === idx ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </CardGlass>
                ))
              ) : (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-square w-full rounded-2xl bg-white/5 animate-pulse" />
                ))
              )}
            </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
