export type HarmonyRule =
    | "analogous"
    | "monochromatic"
    | "triad"
    | "complementary"
    | "split"
    | "square"
    | "compound"
    | "shades"
    | "custom";

export interface ColorHSL {
    h: number; // 0-360
    s: number; // 0-100
    l: number; // 0-100
}

export function hexToHsl(hex: string): ColorHSL {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    }

    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = 0, s = 0;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
}

export function hslToHex({ h, s, l }: ColorHSL): string {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color)
            .toString(16)
            .padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

export function getHarmoniousColors(baseHsl: ColorHSL, rule: HarmonyRule, spread?: number): ColorHSL[] {
    const { h, s, l } = baseHsl;
    // Default spreads if not provided
    const s1 = spread || 15; // Analogous default
    const s2 = spread || 30; // Split default (offset from 180)

    switch (rule) {
        case "analogous":
            return [
                { h: (h - s1 * 2 + 360) % 360, s, l },
                { h: (h - s1 + 360) % 360, s, l },
                baseHsl,
                { h: (h + s1) % 360, s, l },
                { h: (h + s1 * 2) % 360, s, l },
                { h, s: Math.max(10, s - 25), l: Math.max(20, l - 15) },
            ];
        case "monochromatic":
            return [
                { h, s: Math.max(10, s - 40), l: Math.max(10, l - 35) },
                { h, s: Math.max(10, s - 25), l: Math.max(10, l - 20) },
                baseHsl,
                { h, s: Math.min(100, s + 10), l: Math.min(100, l + 15) },
                { h, s: Math.min(100, s + 20), l: Math.min(100, l + 25) },
                { h, s: Math.max(10, s - 15), l: Math.max(20, l - 10) },
            ];
        case "triad":
            return [
                baseHsl,
                { h: (h + 120) % 360, s, l },
                { h: (h + 240) % 360, s, l },
                { h: (h + 120) % 360, s: Math.max(10, s - 20), l },
                { h: (h + 240) % 360, s: Math.max(10, s - 20), l },
                { h, s: Math.max(10, s - 25), l: Math.max(20, l - 15) },
            ];
        case "complementary":
            return [
                baseHsl,
                { h: (h + 180) % 360, s, l },
                { h, s: Math.max(10, s - 20), l },
                { h: (h + 180) % 360, s: Math.max(10, s - 20), l },
                { h, s, l: Math.min(90, l + 20) },
                { h: (h + 180) % 360, s: Math.max(10, s - 25), l: Math.max(20, l - 15) },
            ];
        case "split":
            return [
                baseHsl,
                { h: (h + 180 - s2 + 360) % 360, s, l },
                { h: (h + 180 + s2) % 360, s, l },
                { h: (h + 180 - s2 + 360) % 360, s: Math.max(10, s - 20), l },
                { h: (h + 180 + s2) % 360, s: Math.max(10, s - 20), l },
                { h, s: Math.max(10, s - 25), l: Math.max(20, l - 15) },
            ];
        case "square":
            return [
                baseHsl,
                { h: (h + 90) % 360, s, l },
                { h: (h + 180) % 360, s, l },
                { h: (h + 270) % 360, s, l },
                { h, s: Math.max(10, s - 20), l },
                { h: (h + 180) % 360, s: Math.max(10, s - 25), l: Math.max(20, l - 15) },
            ];
        case "compound":
            return [
                baseHsl,
                { h: (h + 30) % 360, s, l },
                { h: (h + 150) % 360, s, l },
                { h: (h + 180) % 360, s, l },
                { h: (h + 330) % 360, s, l },
                { h, s: Math.max(10, s - 25), l: Math.max(20, l - 15) },
            ];
        case "shades":
            return [
                { h, s, l: Math.max(10, l - 50) },
                { h, s, l: Math.max(10, l - 30) },
                baseHsl,
                { h, s, l: Math.min(90, l + 15) },
                { h, s, l: Math.min(90, l + 30) },
                { h, s, l: Math.min(90, l + 45) },
            ];
        case "custom":
        default:
            return [baseHsl];
    }
}
