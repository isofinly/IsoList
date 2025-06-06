/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background colors
        "bg-base": "var(--color-bg-base)",
        "bg-layer-1": "var(--color-bg-layer-1)",
        "bg-layer-2": "var(--color-bg-layer-2)",
        "bg-layer-3": "var(--color-bg-layer-3)",
        "bg-acrylic-base": "var(--color-bg-acrylic-base)",
        "bg-acrylic-navbar": "var(--color-bg-acrylic-navbar)",
        "bg-acrylic-light": "var(--color-bg-acrylic-light)",

        // Text colors
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-muted": "var(--color-text-muted)",
        "text-disabled": "var(--color-text-disabled)",
        "text-on-accent": "var(--color-text-on-accent)",
        "text-on-destructive": "var(--color-text-on-destructive)",

        // Accent colors
        "accent-primary": "var(--color-accent-primary)",
        "accent-primary-hover": "var(--color-accent-primary-hover)",
        "accent-primary-active": "var(--color-accent-primary-active)",
        "accent-primary-soft": "var(--color-accent-primary-soft)",
        "accent-primary-soft-hover": "var(--color-accent-primary-soft-hover)",

        // Border colors
        "border-subtle": "var(--color-border-subtle)",
        "border-interactive": "var(--color-border-interactive)",
        "border-focus": "var(--color-border-focus)",
        "border-divider": "var(--color-border-divider)",

        // Status colors
        destructive: "var(--color-destructive)",
        "destructive-hover": "var(--color-destructive-hover)",
        "destructive-active": "var(--color-destructive-active)",
        "destructive-soft": "var(--color-destructive-soft)",
        success: "var(--color-success)",
        "success-soft": "var(--color-success-soft)",
        warning: "var(--color-warning)",
        "warning-soft": "var(--color-warning-soft)",
        info: "var(--color-info)",
        "info-soft": "var(--color-info-soft)",

        // Tailwind default mappings
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        card: "var(--color-card)",
        "card-foreground": "var(--color-card-foreground)",
        popover: "var(--color-popover)",
        "popover-foreground": "var(--color-popover-foreground)",
        primary: "var(--color-primary)",
        "primary-foreground": "var(--color-primary-foreground)",
        secondary: "var(--color-secondary)",
        "secondary-foreground": "var(--color-secondary-foreground)",
        muted: "var(--color-muted)",
        "muted-foreground": "var(--color-muted-foreground)",
        accent: "var(--color-accent)",
        "accent-foreground": "var(--color-accent-foreground)",
        border: "var(--color-border)",
        input: "var(--color-input)",
        ring: "var(--color-ring)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
      },
      spacing: {
        navbar: "var(--navbar-height)",
        18: "4.5rem",
        22: "5.5rem",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        inner: "var(--shadow-inner)",
        "fluent-card": "var(--shadow-fluent-card)",
        "fluent-dialog": "var(--shadow-fluent-dialog)",
        "fluent-popup": "var(--shadow-fluent-popup)",
        "fluent-flyout": "var(--shadow-fluent-flyout)",
      },
      transitionDuration: {
        short: "var(--transition-short)",
        medium: "var(--transition-medium)",
        long: "var(--transition-long)",
      },
      transitionTimingFunction: {
        DEFAULT: "var(--transition-easing)",
        "fluent-accelerate": "var(--transition-fluent-accelerate)",
        "fluent-decelerate": "var(--transition-fluent-decelerate)",
        "fluent-entrance": "var(--transition-fluent-entrance)",
        "fluent-exit": "var(--transition-fluent-exit)",
      },
      animation: {
        "fade-in-up":
          "fadeInUp var(--transition-medium) var(--transition-fluent-entrance) forwards",
        "fade-in-down":
          "fadeInDown var(--transition-medium) var(--transition-fluent-entrance) forwards",
        "scale-in":
          "scaleIn var(--transition-medium) var(--transition-fluent-entrance) forwards",
        "terminal-caret": "blink 1s infinite",
        fadeIn: "fadeIn 150ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        fadeOut: "fadeOut 150ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        blink: {
          "0%, 50%": { opacity: "1" },
          "51%, 100%": { opacity: "0" },
        },
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
        "3xl": "32px",
      },
      backdropSaturate: {
        120: "1.2",
        150: "1.5",
        180: "1.8",
      },
      zIndex: {
        dropdown: "50",
        sticky: "60",
        fixed: "70",
        "modal-backdrop": "80",
        "modal-content": "90",
        popover: "100",
        tooltip: "110",
        notification: "120",
      },
    },
  },
  plugins: [],
};
