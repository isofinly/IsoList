"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-short ease-fluent-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 reveal-hover relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-accent-primary text-text-on-accent hover:bg-accent-primary-hover active:bg-accent-primary-active shadow-sm",
        primary:
          "bg-accent-primary text-text-on-accent hover:bg-accent-primary-hover active:bg-accent-primary-active shadow-sm",
        accent:
          "bg-gradient-to-r from-accent-primary to-accent-primary-hover text-text-on-accent hover:from-accent-primary-hover hover:to-accent-primary-active shadow-md",
        destructive:
          "bg-destructive text-text-on-destructive hover:bg-destructive-hover",
        outline:
          "border border-border-subtle bg-transparent text-text-primary hover:bg-bg-layer-1 hover:border-border-interactive",
        secondary:
          "bg-bg-layer-1 text-text-primary border border-border-subtle hover:bg-bg-layer-2 hover:border-border-interactive shadow-sm",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        subtle:
          "bg-transparent text-text-primary hover:bg-accent-primary-soft hover:text-accent-primary",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };