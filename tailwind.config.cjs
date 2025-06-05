/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/app/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "bg-base": "var(--color-bg-base)",
        "bg-layer-1": "var(--color-bg-layer-1)",
        "bg-layer-2": "var(--color-bg-layer-2)",
        "bg-acrylic-base": "var(--color-bg-acrylic-base)",
        "bg-acrylic-navbar": "var(--color-bg-acrylic-navbar)",
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-muted": "var(--color-text-muted)",
        "text-disabled": "var(--color-text-disabled)",
        "text-on-accent": "var(--color-text-on-accent)",
        "text-on-destructive": "var(--color-text-on-destructive)",
        "accent-primary": "var(--color-accent-primary)",
        "accent-primary-hover": "var(--color-accent-primary-hover)",
        "accent-primary-active": "var(--color-accent-primary-active)",
        "accent-primary-soft": "var(--color-accent-primary-soft)",
        "accent-primary-soft-hover": "var(--color-accent-primary-soft-hover)",
        "border-subtle": "var(--color-border-subtle)",
        "border-interactive": "var(--color-border-interactive)",
        "border-focus": "var(--color-border-focus)",
        destructive: "var(--color-destructive)",
        "destructive-hover": "var(--color-destructive-hover)",
        "destructive-soft": "var(--color-destructive-soft)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        info: "var(--color-info)",
      },
      fontFamily: {
        sans: ["var(--theme-font-sans)", "sans-serif"],
        mono: ["var(--theme-font-mono)", "monospace"],
      },
      borderRadius: {
        sm: "var(--theme-radius-sm)",
        md: "var(--theme-radius-md)",
        lg: "var(--theme-radius-lg)",
        xl: "calc(var(--theme-radius-lg) + 4px)",
        "2xl": "calc(var(--theme-radius-lg) + 8px)",
        "3xl": "calc(var(--theme-radius-lg) + 12px)",
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
        "fluent-card":
          "0 1.6px 3.6px 0 oklch(from black l c h / 0.11), 0 0.3px 0.9px 0 oklch(from black l c h / 0.09)",
        "fluent-dialog":
          "0 6.4px 14.4px 0 oklch(from black l c h / 0.13), 0 1.2px 3.6px 0 oklch(from black l c h / 0.
11)",
        "fluent-popup":
          "0 3.2px 7.2px 0 oklch(from black l c h / 0.12), 0 0.6px 1.8px 0 oklch(from black l c h / 0.10)",
        "fluent-flyout":
          "0 8px 16px 0 oklch(from black l c h / 0.14), 0 2px 4px 0 oklch(from black l c h / 0.12)",
      },
      transitionDuration: {
        short: "var(--transition-short)",
        medium: "var(--transition-medium)",
        long: "var(--transition-long)",
      },
      transitionTimingFunction: {
        DEFAULT: "var(--transition-easing)",
        "fluent-accelerate": "cubic-bezier(0.7, 0, 1, 0.5)",
        "fluent-decelerate": "cubic-bezier(0, 0.5, 0.3, 1)",
        "fluent-standard": "cubic-bezier(0.4, 0, 0.2, 1)",
        "fluent-entrance": "cubic-bezier(0.1, 0.9, 0.2, 1)",
        "fluent-exit": "cubic-bezier(0.7, 0, 0.84, 0)",
      },
      animation: {
        fadeIn: "fadeIn var(--transition-medium) var(--transition-easing) forwards",
        fadeOut: "fadeOut var(--transition-medium) var(--transition-easing) forwards",
        slideInUp: "slideInUp var(--transition-medium) cubic-bezier(0.1, 0.9, 0.2, 1) forwards",
        slideInDown: "slideInDown var(--transition-medium) cubic-bezier(0.1, 0.9, 0.2, 1) forwards",
        scaleIn: "scaleIn var(--transition-medium) cubic-bezier(0.1, 0.9, 0.2, 1) forwards",
        "reveal-highlight": "revealHighlight 0.6s ease-out forwards",
        "dialog-content-show": "dialogContentShow var(--transition-medium) cubic-bezier(0.1, 0.9, 0.2, 1) forwards",
        "dialog-content-hide": "dialogContentHide var(--transition-short) cubic-bezier(0.7, 0, 0.84, 0) forwards",
        "dialog-overlay-show": "dialogOverlayShow var(--transition-medium) ease-out forwards",
        "dialog-overlay-hide": "dialogOverlayHide var(--transition-short) ease-in forwards",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        bounce: "bounce 1s infinite",
        spin: "spin 1s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeOut: {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(-8px)" },
        },
        slideInUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInDown: {
          "0%": { opacity: "0", transform: "translateY(-16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        revealHighlight: {
          "0%": { opacity: "0", transform: "scale(0)" },
          "50%": { opacity: "1" },
          "100%": { opacity: "0", transform: "scale(1.5)" },
        },
        dialogContentShow: {
          "0%": { opacity: "0", transform: "translate(-50%, -48%) scale(0.96)" },
          "100%": { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
        },
        dialogContentHide: {
          "0%": { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
          "100%": { opacity: "0", transform: "translate(-50%, -48%) scale(0.96)" },
        },
        dialogOverlayShow: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        dialogOverlayHide: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
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
        dropdown: "1000",
        sticky: "1020",
        fixed: "1030",
        "modal-backdrop": "1040",
        "modal-content": "1050",
        popover: "1060",
        tooltip: "1070",
        notification: "1080",
      },
    },
  },
  plugins: [
    function({ addUtilities, theme }) {
      addUtilities({
        '.fluent-acrylic': {
          'background-color': 'var(--color-bg-acrylic-base)',
          'backdrop-filter': 'blur(16px) saturate(1.8)',
          '-webkit-backdrop-filter': 'blur(16px) saturate(1.8)',
        },
        '.fluent-acrylic-navbar': {
          'background-color': 'var(--color-bg-acrylic-navbar)',
          'backdrop-filter': 'blur(24px) saturate(1.2)',
          '-webkit-backdrop-filter': 'blur(24px) saturate(1.2)',
        },
        '.fluent-acrylic-light': {
          'background-color': 'oklch(from var(--color-bg-layer-1) l c h / 0.5)',
          'backdrop-filter': 'blur(12px) saturate(1.5)',
          '-webkit-backdrop-filter': 'blur(12px) saturate(1.5)',
        },
        '.reveal-hover': {
          'position': 'relative',
          'overflow': 'hidden',
          '&::before': {
            'content': '""',
            'position': 'absolute',
            'top': '0',
            'left': '0',
            'width': '100%',
            'height': '100%',
            'background': 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), oklch(from white l c h / 0.07) 0%, oklch(from white l c h / 0) 40%)',
            'opacity': '0',
            'transition': 'opacity var(--transition-short) ease-out',
            'pointer-events': 'none',
          },
          '&:hover::before': {
            'opacity': '1',
          },
        },
        '.reveal-border-hover': {
          'position': 'relative',
          'overflow': 'hidden',
          '&::after': {
            'content': '""',
            'position': 'absolute',
            'top': '0',
            'left': '0',
            'width': '100%',
            'height': '100%',
            'border-radius': 'inherit',
            'border': '1px solid transparent',
            'background': 'linear-gradient(135deg, oklch(from white l c h / 0.1) 0%, transparent 50%, oklch(from white l c h / 0.05) 100%) border-box',
            'mask': 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
            'mask-composite': 'xor',
            '-webkit-mask-composite': 'xor',
            'opacity': '0',
            'transition': 'opacity var(--transition-short) ease-out',
            'pointer-events': 'none',
          },
          '&:hover::after': {
            'opacity': '1',
          },
        },
        '.fluent-scroll': {
          '&::-webkit-scrollbar': {
            'width': '8px',
            'height': '8px',
          },
          '&::-webkit-scrollbar-track': {
            'background': 'var(--color-bg-base)',
            'border-radius': 'var(--theme-radius-md)',
          },
          '&::-webkit-scrollbar-thumb': {
            'background-color': 'var(--color-bg-layer-2)',
            'border-radius': 'var(--theme-radius-md)',
            'border': '2px solid var(--color-bg-base)',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            'background-color': 'oklch(30% 0.006 240)',
          },
        },
        '.text-gradient-primary': {
          'background': 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-primary-hover))',
          'background-clip': 'text',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
        },
        '.border-gradient': {
          'border': '1px solid transparent',
          'background': 'linear-gradient(var(--color-bg-layer-1), var(--color-bg-layer-1)) padding-box, linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-primary-soft)) border-box',
        },
      });
    },
  ],
};