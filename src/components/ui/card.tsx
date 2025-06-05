import React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        // Base Fluent card styling
        "rounded-lg border border-border-subtle bg-bg-layer-1 text-text-primary",
        // Fluent elevation and shadows
        "shadow-fluent-card",
        // Subtle background gradient for depth
        "bg-gradient-to-br from-bg-layer-1 to-bg-layer-2",
        // Reveal effect on hover
        "reveal-hover transition-all duration-medium ease-fluent-standard",
        // Hover state improvements
        "hover:border-border-interactive hover:shadow-fluent-popup hover:translate-y-[-1px]",
        // Better backdrop support
        "relative overflow-hidden",
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col space-y-2 p-6 pb-4",
        // Subtle bottom border for separation
        "border-b border-border-divider/50",
        className
      )}
      {...props}
    />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-lg font-semibold leading-none tracking-tight text-text-primary",
        // Better typography hierarchy
        "font-medium",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-text-secondary leading-relaxed",
      // Better line height for readability
      "max-w-prose",
      className
    )}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-6 py-4", className)}
      {...props}
    />
  ),
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center px-6 py-4 pt-2",
        // Subtle top border for separation
        "border-t border-border-divider/30",
        // Background slightly different from main card
        "bg-bg-layer-2/30 rounded-b-lg",
        className
      )}
      {...props}
    />
  ),
);
CardFooter.displayName = "CardFooter";

// Additional card variants for specific use cases
const CardInteractive = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & {
  pressed?: boolean;
}>(({ className, pressed = false, ...props }, ref) => (
  <Card
    ref={ref}
    className={cn(
      // Interactive states
      "cursor-pointer select-none",
      "hover:shadow-fluent-dialog hover:scale-[1.01]",
      "active:scale-[0.99] active:shadow-fluent-card",
      // Focus states
      "focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2",
      "focus-visible:ring-offset-bg-base",
      // Pressed state
      pressed && "scale-[0.99] shadow-fluent-card bg-bg-layer-2",
      className
    )}
    {...props}
  />
));
CardInteractive.displayName = "CardInteractive";

const CardGlass = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        // Glass morphism effect
        "fluent-glass rounded-lg shadow-fluent-dialog",
        "text-text-primary reveal-hover",
        "transition-all duration-medium ease-fluent-standard",
        "hover:shadow-fluent-flyout hover:translate-y-[-2px]",
        "relative overflow-hidden",
        className,
      )}
      {...props}
    />
  ),
);
CardGlass.displayName = "CardGlass";

const CardElevated = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & {
  elevation?: 1 | 2 | 3 | 4;
}>(({ className, elevation = 2, ...props }, ref) => {
  const elevationClass = {
    1: "shadow-sm",
    2: "shadow-md",
    3: "shadow-lg",
    4: "shadow-xl",
  }[elevation];

  return (
    <Card
      ref={ref}
      className={cn(
        elevationClass,
        "hover:shadow-fluent-popup",
        className
      )}
      {...props}
    />
  );
});
CardElevated.displayName = "CardElevated";

export { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  CardInteractive,
  CardGlass,
  CardElevated,
};