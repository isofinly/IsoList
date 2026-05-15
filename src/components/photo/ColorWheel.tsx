"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { CardGlass } from "@/components/ui/card";
import {
  HarmonyRule,
  ColorHSL,
  getHarmoniousColors,
  hslToHex,
  hexToHsl,
} from "@/lib/colors";
import { cn } from "@/lib/utils";
import { Copy, Check } from "lucide-react";

// Styles for fluid animations
const dotStyles = `
  .color-dot {
    will-change: transform, box-shadow, opacity;
    transition:
      box-shadow 0.15s cubic-bezier(0.34, 1.56, 0.64, 1),
      width 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
      height 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
      opacity 0.15s ease-out;
    backface-visibility: hidden;
    -webkit-font-smoothing: subpixel-antialiased;
  }

  .color-dot.dragging {
    transition: none !important;
    z-index: 100 !important;
  }

  .color-dot:not(.dragging) {
    transition:
      left 0.08s cubic-bezier(0.25, 0.46, 0.45, 0.94),
      top 0.08s cubic-bezier(0.25, 0.46, 0.45, 0.94),
      box-shadow 0.15s cubic-bezier(0.34, 1.56, 0.64, 1),
      width 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
      height 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
      transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .color-dot:hover:not(.dragging) {
    transform: translate(-50%, -50%) scale(1.15) !important;
  }

  .color-dot.pulse {
    animation: pulse-glow 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes pulse-glow {
    0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
    70% { box-shadow: 0 0 0 12px rgba(255, 255, 255, 0); }
    100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
  }

  .harmony-line {
    transition: opacity 0.3s ease, stroke-dashoffset 0.5s ease;
    stroke-dashoffset: 0;
  }

  .guide-line {
    transition: opacity 0.2s ease;
  }

  .wheel-container {
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .wheel-container:active {
    transform: scale(0.98);
  }

  .wheel-container.dragging-active {
    transform: scale(1.02);
  }
`;

export function ColorWheel({ initialPalette }: { initialPalette?: string[] }) {
  const [baseColor, setBaseColor] = useState<ColorHSL>(() => {
    if (initialPalette && initialPalette.length > 0)
      return hexToHsl(initialPalette[0]);
    return { h: 210, s: 70, l: 50 };
  });
  const [rule, setRule] = useState<HarmonyRule>(
    initialPalette && initialPalette.length > 0 ? "custom" : "analogous",
  );
  const [palette, setPalette] = useState<ColorHSL[]>(() => {
    if (initialPalette && initialPalette.length > 0)
      return initialPalette.map(hexToHsl);
    return [];
  });
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  // Track which color is currently selected for the sliders
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [spread, setSpread] = useState(15);
  const [shadesSpacing, setShadesSpacing] = useState(20);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  // Track individual saturation offsets for each palette color
  const [saturationOffsets, setSaturationOffsets] = useState<number[]>([]);
  // Pulse animation state for dot feedback
  const [pulsingIdx, setPulsingIdx] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Animation and performance refs
  const animationFrameRef = useRef<number | null>(null);
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);
  const velocityRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastUpdateTimeRef = useRef<number>(0);
  const pendingUpdateRef = useRef<{
    mouseH: number;
    mouseS: number;
    dx: number;
    dy: number;
    radius: number;
  } | null>(null);

  const getBaseIndex = (r: HarmonyRule) => {
    switch (r) {
      case "analogous":
        return 2;
      case "shades":
        return 2;
      case "monochromatic":
        return 2;
      case "split":
        return 0;
      default:
        return 0;
    }
  };

  // Get the hue offsets for each harmony type relative to base
  const getHueOffsets = useCallback((r: HarmonyRule, s: number): number[] => {
    switch (r) {
      case "analogous":
        return [-s * 2, -s, 0, s, s * 2, 0];
      case "monochromatic":
        return [0, 0, 0, 0, 0, 0];
      case "triad":
        return [0, 120, 240, 120, 240, 0];
      case "complementary":
        return [0, 180, 0, 180, 0, 180];
      case "split":
        return [0, 180 - s, 180 + s, 180 - s, 180 + s, 0];
      case "square":
        return [0, 90, 180, 270, 0, 180];
      case "compound":
        return [0, 30, 150, 180, 330, 0];
      case "shades":
        return [0, 0, 0, 0, 0, 0];
      default:
        return [0];
    }
  }, []);

  const updatePalette = useCallback(
    (
      newBase: ColorHSL,
      r: HarmonyRule,
      s: number,
      ss: number,
      satOffsets?: number[],
    ) => {
      if (r === "shades") {
        const { h, s, l } = newBase;
        return [
          { h, s, l: Math.max(10, l - ss * 2.5) },
          { h, s, l: Math.max(10, l - ss * 1.5) },
          newBase,
          { h, s, l: Math.min(90, l + ss * 0.75) },
          { h, s, l: Math.min(90, l + ss * 1.5) },
          { h, s, l: Math.min(90, l + ss * 2.25) },
        ];
      }

      // Get base harmony colors
      const baseColors = getHarmoniousColors(newBase, r, s);

      // Apply individual saturation offsets if available
      if (satOffsets && satOffsets.length === baseColors.length) {
        return baseColors.map((color, idx) => ({
          ...color,
          s: Math.max(0, Math.min(100, color.s + satOffsets[idx])),
        }));
      }

      return baseColors;
    },
    [],
  );

  // Initialize saturation offsets when rule changes (NOT when baseColor changes)
  useEffect(() => {
    let newSpread = 30;
    if (rule === "analogous") newSpread = 15;
    if (rule === "split") newSpread = 30;
    setSpread(newSpread);

    const baseIdx = getBaseIndex(rule);
    setSelectedIdx(baseIdx);

    // Reset saturation offsets only when rule changes
    const colorCount = 6; // All harmonies now have 6 colors
    setSaturationOffsets(new Array(colorCount).fill(0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rule]);

  // Sync with initialPalette updates
  useEffect(() => {
    if (initialPalette && initialPalette.length > 0) {
      const hslPalette = initialPalette.map(hexToHsl);
      setPalette(hslPalette);
      setRule("custom");
      const baseIdx = getBaseIndex("custom");
      if (hslPalette[baseIdx]) {
        setBaseColor(hslPalette[baseIdx]);
      }
      setSaturationOffsets(new Array(hslPalette.length).fill(0));
    }
  }, [initialPalette]);

  // Update palette on state changes
  useEffect(() => {
    if (rule === "custom") return;
    setPalette(
      updatePalette(baseColor, rule, spread, shadesSpacing, saturationOffsets),
    );
  }, [
    baseColor,
    rule,
    spread,
    shadesSpacing,
    saturationOffsets,
    updatePalette,
  ]);

  // Update canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const radius = width / 2;

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const dx = x - radius;
        const dy = y - radius;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= radius) {
          const angle = Math.atan2(dy, dx) + Math.PI;
          const hue = (angle * 180) / Math.PI;
          const sat = (dist / radius) * 100;
          ctx.fillStyle = `hsl(${hue}, ${sat}%, 50%)`;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  }, []);

  const getPointerPos = (hsl: ColorHSL) => {
    const angle = ((hsl.h - 180) * Math.PI) / 180;
    const dist = (hsl.s / 100) * 175;
    return {
      x: 175 + Math.cos(angle) * dist,
      y: 175 + Math.sin(angle) * dist,
    };
  };

  // Get the radial guide line endpoints for a given hue
  const getGuideLineEndpoints = (hue: number) => {
    const angle = ((hue - 180) * Math.PI) / 180;
    const radius = 175;
    return {
      x1: 175,
      y1: 175,
      x2: 175 + Math.cos(angle) * radius,
      y2: 175 + Math.sin(angle) * radius,
    };
  };

  // Process the pending update - extracted for RAF callback
  const processDragUpdate = useCallback(
    (
      mouseH: number,
      mouseS: number,
      dx: number,
      dy: number,
      radius: number,
      currentDraggingIdx: number,
    ) => {
      const baseIdx = getBaseIndex(rule);
      const isBase = currentDraggingIdx === baseIdx;

      // 1. CUSTOM: Full Freedom
      if (rule === "custom") {
        setPalette((prev) => {
          const newPalette = [...prev];
          newPalette[currentDraggingIdx] = {
            ...newPalette[currentDraggingIdx],
            h: mouseH,
            s: mouseS,
          };
          if (currentDraggingIdx === 0) setBaseColor(newPalette[0]);
          return newPalette;
        });
        return;
      }

      // 2. MONOCHROMATIC: All colors share the same hue
      if (rule === "monochromatic") {
        if (isBase) {
          setBaseColor((prev) => {
            const satChanged = Math.abs(mouseS - prev.s) > 1;
            if (satChanged) {
              setSaturationOffsets(new Array(palette.length).fill(0));
            }
            return { ...prev, h: mouseH, s: mouseS };
          });
        } else {
          setSaturationOffsets((prev) => {
            const newOffset = mouseS - baseColor.s;
            const newOffsets = [...prev];
            newOffsets[currentDraggingIdx] = newOffset;
            return newOffsets;
          });
        }
        return;
      }

      // 3. SHADES: Fixed hue, varying lightness
      if (rule === "shades") {
        if (isBase) {
          setBaseColor((prev) => ({ ...prev, h: mouseH, s: mouseS }));
        }
        return;
      }

      // 4. ANALOGOUS / SPLIT: Constrained movement
      if (rule === "analogous" || rule === "split") {
        if (isBase) {
          setBaseColor((prev) => ({ ...prev, h: mouseH, s: mouseS }));
        } else {
          const hueOffsets = getHueOffsets(rule, spread);
          const targetHue =
            (baseColor.h + hueOffsets[currentDraggingIdx] + 360) % 360;
          const targetAngle = ((targetHue - 180) * Math.PI) / 180;
          const projectedDist =
            dx * Math.cos(targetAngle) + dy * Math.sin(targetAngle);
          const newS = Math.min(
            100,
            Math.max(0, (Math.max(0, projectedDist) / radius) * 100),
          );

          const baseHarmonyColors = getHarmoniousColors(
            baseColor,
            rule,
            spread,
          );
          const baseSatForThisIdx =
            baseHarmonyColors[currentDraggingIdx]?.s || baseColor.s;
          const newOffset = newS - baseSatForThisIdx;

          setSaturationOffsets((prev) => {
            const newOffsets = [...prev];
            newOffsets[currentDraggingIdx] = newOffset;
            return newOffsets;
          });
        }
        return;
      }

      // 5. RIGID SHAPES (Triad, Square, Complementary, Compound)
      if (isBase) {
        setBaseColor((prev) => ({ ...prev, h: mouseH, s: mouseS }));
      } else {
        const hueOffsets = getHueOffsets(rule, spread);
        const targetHue =
          (baseColor.h + hueOffsets[currentDraggingIdx] + 360) % 360;
        const targetAngle = ((targetHue - 180) * Math.PI) / 180;
        const projectedDist =
          dx * Math.cos(targetAngle) + dy * Math.sin(targetAngle);
        const newS = Math.min(
          100,
          Math.max(0, (Math.max(0, projectedDist) / radius) * 100),
        );

        const currentColorHue = palette[currentDraggingIdx]?.h || targetHue;
        let hueDiff = mouseH - currentColorHue;
        if (hueDiff > 180) hueDiff -= 360;
        if (hueDiff < -180) hueDiff += 360;

        const tangentialMovement = Math.abs(hueDiff);
        if (tangentialMovement > 1.5) {
          // Reduced threshold for snappier rotation
          setBaseColor((prev) => ({
            ...prev,
            h: (prev.h + hueDiff + 360) % 360,
          }));
        }

        const baseHarmonyColors = getHarmoniousColors(baseColor, rule, spread);
        const baseSatForThisIdx =
          baseHarmonyColors[currentDraggingIdx]?.s || baseColor.s;
        const newOffset = newS - baseSatForThisIdx;

        setSaturationOffsets((prev) => {
          const newOffsets = [...prev];
          newOffsets[currentDraggingIdx] = newOffset;
          return newOffsets;
        });
      }
    },
    [rule, spread, baseColor, palette, getHueOffsets],
  );

  const handlePointerDown = useCallback((idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    // Cancel any pending animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Initialize tracking
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    velocityRef.current = { x: 0, y: 0 };
    lastUpdateTimeRef.current = performance.now();

    setDraggingIdx(idx);
    setSelectedIdx(idx);

    // Trigger pulse animation for feedback
    setPulsingIdx(idx);
    setTimeout(() => setPulsingIdx(null), 400);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.MouseEvent) => {
      if (draggingIdx === null) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const now = performance.now();
      const deltaTime = now - lastUpdateTimeRef.current;

      // Calculate velocity for potential momentum effects
      if (lastMousePosRef.current) {
        const vx =
          (e.clientX - lastMousePosRef.current.x) / Math.max(deltaTime, 1);
        const vy =
          (e.clientY - lastMousePosRef.current.y) / Math.max(deltaTime, 1);
        velocityRef.current = {
          x: vx * 0.3 + velocityRef.current.x * 0.7, // Smooth velocity
          y: vy * 0.3 + velocityRef.current.y * 0.7,
        };
      }

      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      lastUpdateTimeRef.current = now;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - 16;
      const y = e.clientY - rect.top - 16;
      const radius = canvas.width / 2;
      const dx = x - radius;
      const dy = y - radius;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Allow dragging a bit outside
      if (dist <= radius + 50) {
        const angle = Math.atan2(dy, dx) + Math.PI;
        const mouseH = (angle * 180) / Math.PI;
        const mouseS = Math.min(100, Math.max(0, (dist / radius) * 100));

        // Store pending update
        pendingUpdateRef.current = { mouseH, mouseS, dx, dy, radius };

        // Use RAF for smooth updates - only schedule if not already pending
        if (!animationFrameRef.current) {
          animationFrameRef.current = requestAnimationFrame(() => {
            animationFrameRef.current = null;
            const pending = pendingUpdateRef.current;
            if (pending && draggingIdx !== null) {
              processDragUpdate(
                pending.mouseH,
                pending.mouseS,
                pending.dx,
                pending.dy,
                pending.radius,
                draggingIdx,
              );
            }
            pendingUpdateRef.current = null;
          });
        }
      }
    },
    [draggingIdx, processDragUpdate],
  );

  const handlePointerUp = useCallback(() => {
    // Cancel pending animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Reset tracking refs
    lastMousePosRef.current = null;
    pendingUpdateRef.current = null;
    velocityRef.current = { x: 0, y: 0 };

    setDraggingIdx(null);
  }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggingIdx !== null) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const radius = canvas.width / 2;
    const dx = x - radius;
    const dy = y - radius;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= radius) {
      const angle = Math.atan2(dy, dx) + Math.PI;
      const h = (angle * 180) / Math.PI;
      const s = (dist / radius) * 100;

      // Clicking on canvas sets the base color to this position
      setBaseColor({ ...baseColor, h, s });
      setSaturationOffsets(new Array(palette.length).fill(0));
    }
  };

  const copyToClipboard = (hex: string, index: number) => {
    navigator.clipboard.writeText(hex);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  useEffect(() => {
    if (draggingIdx !== null) {
      window.addEventListener("mouseup", handlePointerUp);
      return () => window.removeEventListener("mouseup", handlePointerUp);
    }
  }, [draggingIdx]);

  const rules: { id: HarmonyRule; label: string }[] = [
    { id: "analogous", label: "Analogous" },
    { id: "monochromatic", label: "Monochromatic" },
    { id: "triad", label: "Triad" },
    { id: "complementary", label: "Complementary" },
    { id: "split", label: "Split Complementary" },
    { id: "square", label: "Square" },
    { id: "compound", label: "Compound" },
    { id: "shades", label: "Shades" },
    { id: "custom", label: "Custom" },
  ];

  // Render radial guide lines for each color in the palette
  const renderGuideLines = () => {
    if (rule === "shades" || rule === "custom") return null;

    // Get unique hues from palette to avoid duplicate lines
    const renderedHues = new Set<number>();

    return palette.map((color, idx) => {
      const roundedHue = Math.round(color.h);
      if (renderedHues.has(roundedHue)) return null;
      renderedHues.add(roundedHue);

      const { x1, y1, x2, y2 } = getGuideLineEndpoints(color.h);
      return (
        <line
          key={`guide-${idx}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="white"
          strokeWidth="1"
          strokeDasharray="4 4"
          opacity="0.3"
        />
      );
    });
  };

  // Render the harmony shape connections
  const renderHarmonyShape = () => {
    if (palette.length < 2) return null;

    switch (rule) {
      case "complementary":
        return (
          palette.length >= 2 && (
            <line
              x1={getPointerPos(palette[0]).x}
              y1={getPointerPos(palette[0]).y}
              x2={getPointerPos(palette[1]).x}
              y2={getPointerPos(palette[1]).y}
              stroke="white"
              strokeWidth="2"
              strokeDasharray="6 3"
            />
          )
        );
      case "triad":
        return (
          palette.length >= 3 && (
            <path
              d={`M ${getPointerPos(palette[0]).x} ${getPointerPos(palette[0]).y} L ${getPointerPos(palette[1]).x} ${getPointerPos(palette[1]).y} L ${getPointerPos(palette[2]).x} ${getPointerPos(palette[2]).y} Z`}
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeDasharray="6 3"
            />
          )
        );
      case "square":
        return (
          palette.length >= 4 && (
            <path
              d={`M ${getPointerPos(palette[0]).x} ${getPointerPos(palette[0]).y} L ${getPointerPos(palette[1]).x} ${getPointerPos(palette[1]).y} L ${getPointerPos(palette[2]).x} ${getPointerPos(palette[2]).y} L ${getPointerPos(palette[3]).x} ${getPointerPos(palette[3]).y} Z`}
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeDasharray="6 3"
            />
          )
        );
      case "analogous":
        return (
          palette.length >= 5 && (
            <path
              d={`M ${getPointerPos(palette[0]).x} ${getPointerPos(palette[0]).y} L ${getPointerPos(palette[1]).x} ${getPointerPos(palette[1]).y} L ${getPointerPos(palette[2]).x} ${getPointerPos(palette[2]).y} L ${getPointerPos(palette[3]).x} ${getPointerPos(palette[3]).y} L ${getPointerPos(palette[4]).x} ${getPointerPos(palette[4]).y}`}
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeDasharray="6 3"
            />
          )
        );
      case "split":
        return (
          palette.length >= 3 && (
            <path
              d={`M ${getPointerPos(palette[1]).x} ${getPointerPos(palette[1]).y} L ${getPointerPos(palette[0]).x} ${getPointerPos(palette[0]).y} L ${getPointerPos(palette[2]).x} ${getPointerPos(palette[2]).y}`}
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeDasharray="6 3"
            />
          )
        );
      case "compound":
        return (
          palette.length >= 5 && (
            <path
              d={`M ${getPointerPos(palette[0]).x} ${getPointerPos(palette[0]).y} L ${getPointerPos(palette[1]).x} ${getPointerPos(palette[1]).y} M ${getPointerPos(palette[0]).x} ${getPointerPos(palette[0]).y} L ${getPointerPos(palette[4]).x} ${getPointerPos(palette[4]).y} M ${getPointerPos(palette[2]).x} ${getPointerPos(palette[2]).y} L ${getPointerPos(palette[3]).x} ${getPointerPos(palette[3]).y}`}
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeDasharray="6 3"
            />
          )
        );
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
      <style>{dotStyles}</style>
      <div className="lg:col-span-1">
        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">
          Harmony Rules
        </h3>
        <div className="space-y-1">
          {rules.map((r) => (
            <button
              key={r.id}
              onClick={() => setRule(r.id)}
              className={cn(
                "w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-short",
                rule === r.id
                  ? "bg-accent-primary-soft text-accent-primary border border-accent-primary/20"
                  : "text-text-secondary hover:text-text-primary hover:bg-white/5 border border-transparent",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-3 space-y-12">
        <div className="flex flex-col md:flex-row gap-12 items-center justify-center">
          <div
            ref={containerRef}
            className={cn(
              "relative group p-4 rounded-full bg-white/5 border border-white/10 shadow-2xl overflow-visible wheel-container",
              draggingIdx !== null && "dragging-active",
            )}
            onMouseMove={handlePointerMove}
          >
            <canvas
              ref={canvasRef}
              width={350}
              height={350}
              onClick={handleCanvasClick}
              className="rounded-full cursor-crosshair transition-transform duration-medium"
            />

            <svg className="absolute inset-4 w-[350px] h-[350px] pointer-events-none overflow-visible">
              {/* Radial guide lines from center through each dot */}
              <g className="opacity-60 guide-line">{renderGuideLines()}</g>
              {/* Harmony shape connections */}
              <g className="opacity-40 harmony-line">{renderHarmonyShape()}</g>
            </svg>

            {palette.map((color, idx) => {
              const pos = getPointerPos(color);
              const isSelected = idx === selectedIdx;
              const isDragging = idx === draggingIdx;
              const isBaseColor = idx === getBaseIndex(rule);
              const isPulsing = idx === pulsingIdx;

              return (
                <div
                  key={idx}
                  onMouseDown={(e) => handlePointerDown(idx, e)}
                  onClick={() => !draggingIdx && setSelectedIdx(idx)}
                  className={cn(
                    "absolute rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing z-10 color-dot",
                    isSelected
                      ? "w-9 h-9 border-4 border-white z-20 shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                      : "w-7 h-7 border-2 border-white/90 opacity-90",
                    isBaseColor && "ring-4 ring-white/30 z-20",
                    isDragging &&
                      "scale-110 shadow-xl dragging cursor-grabbing",
                    isPulsing && "pulse",
                  )}
                  style={{
                    left: `${pos.x + 16}px`,
                    top: `${pos.y + 16}px`,
                    backgroundColor: hslToHex(color),
                    transform: "translate(-50%, -50%)", // Ensure transform is applied here for base position
                  }}
                  title={
                    isBaseColor
                      ? "Base color (drag freely)"
                      : "Drag along guide line"
                  }
                >
                  {isBaseColor && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full pointer-events-none" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-6 w-full max-w-xs">
            <h4 className="text-lg font-bold">Selected Color</h4>
            {palette[selectedIdx] && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-text-muted block mb-1 uppercase tracking-widest">
                    Hue
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={Math.round(palette[selectedIdx].h)}
                    onChange={(e) => {
                      const newH = parseInt(e.target.value);
                      const oldH = palette[selectedIdx].h;
                      let hDiff = newH - oldH;
                      // Normalize
                      if (hDiff > 180) hDiff -= 360;
                      if (hDiff < -180) hDiff += 360;

                      // Rotate entire palette
                      const newBaseH = (baseColor.h + hDiff + 360) % 360;
                      setBaseColor({ ...baseColor, h: newBaseH });
                    }}
                    className="w-full accent-accent-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1 uppercase tracking-widest">
                    Saturation
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round(palette[selectedIdx].s)}
                    onChange={(e) => {
                      const newS = parseInt(e.target.value);
                      const baseIdx = getBaseIndex(rule);

                      if (selectedIdx === baseIdx) {
                        // Changing base saturation
                        setBaseColor({ ...baseColor, s: newS });
                      } else {
                        // Calculate offset from what harmony would give
                        const baseHarmonyColors = getHarmoniousColors(
                          baseColor,
                          rule,
                          spread,
                        );
                        const baseSatForThisIdx =
                          baseHarmonyColors[selectedIdx]?.s || baseColor.s;
                        const newOffset = newS - baseSatForThisIdx;

                        const newOffsets = [...saturationOffsets];
                        newOffsets[selectedIdx] = newOffset;
                        setSaturationOffsets(newOffsets);
                      }
                    }}
                    className="w-full accent-accent-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1 uppercase tracking-widest">
                    Lightness
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round(palette[selectedIdx].l)}
                    onChange={(e) => {
                      const newL = parseInt(e.target.value);
                      const newPalette = [...palette];
                      newPalette[selectedIdx] = {
                        ...newPalette[selectedIdx],
                        l: newL,
                      };
                      setPalette(newPalette);

                      // Update base color if this is the base
                      if (selectedIdx === getBaseIndex(rule)) {
                        setBaseColor({ ...baseColor, l: newL });
                      }
                    }}
                    className="w-full accent-accent-primary"
                  />
                </div>
                {rule === "shades" && (
                  <div>
                    <label className="text-xs text-text-muted block mb-1 uppercase tracking-widest">
                      Spacing
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="40"
                      value={shadesSpacing}
                      onChange={(e) =>
                        setShadesSpacing(parseInt(e.target.value))
                      }
                      className="w-full accent-accent-primary"
                    />
                  </div>
                )}
                <div className="pt-4 flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 mt-4">
                  <span className="font-mono text-lg font-bold">
                    {hslToHex(palette[selectedIdx]).toUpperCase()}
                  </span>
                  <div
                    className="w-12 h-12 rounded-xl shadow-inner border border-white/10"
                    style={{ backgroundColor: hslToHex(palette[selectedIdx]) }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {palette.map((color, idx) => {
            const hex = hslToHex(color).toUpperCase();
            const isBaseColor = idx === getBaseIndex(rule);
            return (
              <CardGlass
                key={idx}
                className={cn(
                  "p-4 flex flex-col gap-4 group hover:scale-105 transition-all duration-medium",
                  isBaseColor && "ring-2 ring-yellow-400/30",
                )}
              >
                <div
                  className="aspect-square w-full rounded-2xl shadow-inner border border-white/5"
                  style={{ backgroundColor: hex }}
                />
                <div className="flex items-center justify-between px-1">
                  <span className="font-mono text-sm font-semibold">{hex}</span>
                  <button
                    onClick={() => copyToClipboard(hex, idx)}
                    className="text-text-muted hover:text-accent-primary transition-colors"
                  >
                    {copiedIndex === idx ? (
                      <Check size={16} />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>
                {isBaseColor && (
                  <span className="text-xs text-yellow-400/70 text-center">
                    Base
                  </span>
                )}
              </CardGlass>
            );
          })}
        </div>
      </div>
    </div>
  );
}
