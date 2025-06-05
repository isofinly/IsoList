import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "standard" | "subtle" | "destructive" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "standard", size = "md", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-short ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base disabled:pointer-events-none disabled:opacity-60";

    const variantStyles = {
      primary:
        "bg-accent-primary text-text-on-accent hover:bg-accent-primary-hover active:bg-accent-primary-active shadow-sm hover:shadow-md",
      standard:
        "bg-bg-layer-2 text-text-primary hover:bg-opacity-80 active:bg-opacity-90 border border-border-subtle shadow-sm hover:shadow-md",
      subtle: "bg-transparent text-text-primary hover:bg-accent-primary-soft active:bg-opacity-20", // Formerly ghost
      destructive:
        "bg-destructive text-text-on-destructive hover:bg-destructive-hover shadow-sm hover:shadow-md",
      outline:
        "border border-border-subtle text-text-primary hover:bg-bg-layer-2 hover:border-border-interactive active:bg-bg-layer-1",
      ghost: "text-text-primary hover:bg-bg-layer-2 hover:text-accent-primary", // True ghost for text-like buttons or icon buttons
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs",
      md: "h-9 px-4 text-sm", // Standard Fluent button height is around 32-36px, h-9 is 36px
      lg: "h-11 px-5 text-base",
      icon: "h-9 w-9",
    };

    return (
      <button
        className={cn(baseStyles, variantStyles[variant!], sizeStyles[size!], className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button };
