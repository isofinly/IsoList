"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-short ease-fluent-standard focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-accent-primary text-text-on-accent hover:bg-accent-primary-hover shadow-sm",
        secondary:
          "border-transparent bg-bg-layer-2 text-text-secondary hover:bg-bg-layer-1 hover:text-text-primary",
        destructive:
          "border-transparent bg-destructive text-text-on-destructive hover:bg-destructive-hover shadow-sm",
        outline:
          "border-border-subtle text-text-primary hover:bg-accent-primary-soft hover:text-accent-primary hover:border-accent-primary/50",
        success:
          "border-transparent bg-success text-text-on-accent hover:bg-success/90 shadow-sm",
        warning:
          "border-transparent bg-warning text-black hover:bg-warning/90 shadow-sm",
        info:
          "border-transparent bg-info text-text-on-accent hover:bg-info/90 shadow-sm",
        accent:
          "border-transparent bg-gradient-to-r from-accent-primary to-accent-primary-hover text-text-on-accent hover:from-accent-primary-hover hover:to-accent-primary-active shadow-md",
        ghost:
          "border-transparent text-text-muted hover:bg-accent-primary-soft hover:text-accent-primary",
        soft:
          "border-accent-primary/20 bg-accent-primary-soft text-accent-primary hover:bg-accent-primary-soft-hover",
        "soft-destructive":
          "border-destructive/20 bg-destructive-soft text-destructive hover:bg-destructive-soft/80",
        "soft-success":
          "border-success/20 bg-success-soft text-success hover:bg-success-soft/80",
        "soft-warning":
          "border-warning/20 bg-warning-soft text-warning hover:bg-warning-soft/80",
        "soft-info":
          "border-info/20 bg-info-soft text-info hover:bg-info-soft/80",
      },
      size: {
        sm: "px-2 py-0.5 text-xs rounded-md",
        default: "px-2.5 py-0.5 text-xs rounded-full",
        lg: "px-3 py-1 text-sm rounded-full",
        xl: "px-4 py-1.5 text-sm rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, icon, dot, removable, onRemove, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          badgeVariants({ variant, size }),
          // Add reveal effect for interactive badges
          (removable || props.onClick) && "reveal-hover cursor-pointer",
          // Add subtle animation
          "animate-fade-in-up",
          className
        )}
        {...props}
      >
        {/* Status dot indicator */}
        {dot && (
          <div className={cn(
            "w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse",
            variant === "success" && "bg-success",
            variant === "destructive" && "bg-destructive",
            variant === "warning" && "bg-warning",
            variant === "info" && "bg-info",
            variant === "default" && "bg-accent-primary",
            (!variant || variant === "secondary" || variant === "outline" || variant === "ghost") && "bg-current"
          )} />
        )}

        {/* Icon */}
        {icon && (
          <div className="mr-1.5 flex-shrink-0">
            {React.cloneElement(icon as React.ReactElement, {
              className: cn("w-3 h-3", (icon as React.ReactElement).props?.className)
            })}
          </div>
        )}

        {/* Content */}
        <span className="truncate">{children}</span>

        {/* Remove button */}
        {removable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
            className={cn(
              "ml-1.5 flex-shrink-0 rounded-full p-0.5",
              "hover:bg-black/10 hover:text-current",
              "focus:outline-none focus:ring-1 focus:ring-current focus:ring-offset-1",
              "transition-all duration-short ease-fluent-standard",
              "dark:hover:bg-white/10"
            )}
            aria-label="Remove badge"
          >
            <svg
              className="w-2.5 h-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

Badge.displayName = "Badge";

// Status-specific badge components for convenience
const StatusBadge = React.forwardRef<HTMLDivElement, 
  Omit<BadgeProps, 'variant'> & { 
    status: 'completed' | 'watching' | 'planned' | 'on-hold' | 'dropped' | 'cancelled' | 'upcoming'
  }
>(({ status, ...props }, ref) => {
  const getVariantForStatus = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'watching':
        return 'info';
      case 'planned':
        return 'soft';
      case 'on-hold':
        return 'warning';
      case 'dropped':
      case 'cancelled':
        return 'destructive';
      case 'upcoming':
        return 'soft-info';
      default:
        return 'secondary';
    }
  };

  return (
    <Badge
      ref={ref}
      variant={getVariantForStatus(status) as any}
      dot
      {...props}
    >
      {status.replace('-', ' ')}
    </Badge>
  );
});

StatusBadge.displayName = "StatusBadge";

// Rating badge component
const RatingBadge = React.forwardRef<HTMLDivElement,
  Omit<BadgeProps, 'variant' | 'children'> & {
    rating: number;
    maxRating?: number;
  }
>(({ rating, maxRating = 10, ...props }, ref) => {
  const getVariantForRating = (rating: number, max: number) => {
    const percentage = (rating / max) * 100;
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'info';
    if (percentage >= 40) return 'warning';
    return 'destructive';
  };

  return (
    <Badge
      ref={ref}
      variant={getVariantForRating(rating, maxRating)}
      icon={
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      }
      {...props}
    >
      {rating}/{maxRating}
    </Badge>
  );
});

RatingBadge.displayName = "RatingBadge";

// Type badge for media types
const TypeBadge = React.forwardRef<HTMLDivElement,
  Omit<BadgeProps, 'variant' | 'icon'> & {
    type: 'movie' | 'series' | 'anime' | 'documentary' | 'short';
  }
>(({ type, ...props }, ref) => {
  const getConfigForType = (type: string) => {
    switch (type) {
      case 'movie':
        return {
          variant: 'soft' as const,
          icon: (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4zm2 0h1V9h-1v2zm1-4V5h-1v2h1zM5 5v2H4V5h1zm0 4H4v2h1V9zm-1 4h1v2H4v-2z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'series':
        return {
          variant: 'soft-info' as const,
          icon: (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
          )
        };
      case 'anime':
        return {
          variant: 'soft-warning' as const,
          icon: (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
          )
        };
      default:
        return {
          variant: 'secondary' as const,
          icon: (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          )
        };
    }
  };

  const config = getConfigForType(type);

  return (
    <Badge
      ref={ref}
      variant={config.variant}
      icon={config.icon}
      {...props}
    >
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </Badge>
  );
});

TypeBadge.displayName = "TypeBadge";

export { Badge, badgeVariants, StatusBadge, RatingBadge, TypeBadge };