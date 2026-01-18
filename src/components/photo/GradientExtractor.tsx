"use client";
import { useState, useRef } from "react";
import ColorThief from "colorthief";
import { CardGlass } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X, Copy, Check, Sliders } from "lucide-react";

export function GradientExtractor() {
  const [image, setImage] = useState<string | null>(null);
  const [stops, setStops] = useState(5);
  const [colors, setColors] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

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

  const extractColors = () => {
    if (!imgRef.current) return;
    const colorThief = new ColorThief();
    const palette = colorThief.getPalette(imgRef.current, stops);
    const hexColors = palette.map((rgb: number[]) =>
      "#" + rgb.map(x => x.toString(16).padStart(2, "0")).join("")
    );
    setColors(hexColors);
  };

  const gradientString = `linear-gradient(to right, ${colors.join(", ")})`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
      <div className="lg:col-span-1">
        <div className="flex items-center gap-2 mb-4 text-text-muted">
          <Sliders size={18} />
          <h3 className="text-sm font-semibold uppercase tracking-wider">Settings</h3>
        </div>
        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
          <label className="text-xs text-text-muted block mb-1 uppercase tracking-widest font-bold">Gradient Stops</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="2"
              max="15"
              value={stops}
              onChange={(e) => {
                setStops(parseInt(e.target.value));
                if (image) setTimeout(extractColors, 0);
              }}
              className="flex-grow accent-accent-primary"
            />
            <span className="font-mono font-bold text-accent-primary w-6">{stops}</span>
          </div>
        </div>
      </div>

      <div className="lg:col-span-3 space-y-8">
        {!image ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="aspect-video w-full rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 hover:border-accent-primary/50 transition-all group"
          >
            <Upload size={48} className="text-text-muted mb-4 group-hover:scale-110 transition-transform" />
            <p className="text-text-secondary font-medium">Upload image to extract gradient</p>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="relative group max-h-[400px] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={image}
                alt="Selected"
                onLoad={extractColors}
                crossOrigin="anonymous"
                className="w-full h-auto object-contain"
              />
              <Button
                variant="destructive"
                size="icon"
                onClick={() => setImage(null)}
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={20} />
              </Button>
            </div>

            {/* Gradient Preview */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-widest text-text-muted px-1">Resulting Gradient</h4>
              <div
                className="h-32 w-full rounded-2xl shadow-inner border border-white/10 reveal-hover"
                style={{ background: gradientString }}
              />
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                <code className="text-xs text-text-secondary font-mono break-all">{gradientString}</code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(gradientString);
                    setCopiedIndex(999);
                    setTimeout(() => setCopiedIndex(null), 2000);
                  }}
                  className="ml-4 text-text-muted hover:text-accent-primary transition-colors flex-shrink-0"
                >
                  {copiedIndex === 999 ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* Individual Colors */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
              {colors.map((hex, idx) => (
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
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
