"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      // Base styles with Fluent Design principles
      "flex h-10 w-full items-center justify-between rounded-md px-3 py-2",
      "border border-border-subtle bg-bg-layer-1 text-sm text-text-primary",
      "transition-all duration-short ease-fluent-standard",

      // Hover and focus states
      "hover:border-border-interactive hover:bg-bg-layer-2",
      "focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-0",
      "focus:border-accent-primary focus:bg-bg-layer-1",

      // Disabled state
      "disabled:cursor-not-allowed disabled:opacity-50",
      "disabled:bg-bg-layer-1 disabled:border-border-subtle",

      // Placeholder styling
      "placeholder:text-text-muted",

      // Subtle inner shadow for depth
      "shadow-[inset_0_1px_2px_oklch(from_black_l_c_h_/_0.05)]",
      "focus:shadow-[inset_0_1px_2px_oklch(from_black_l_c_h_/_0.1)]",

      // Reveal effect
      "reveal-hover relative overflow-hidden",

      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50 transition-transform duration-short data-[state=open]:rotate-180" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      "text-text-muted hover:text-text-primary",
      "transition-colors duration-short",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      "text-text-muted hover:text-text-primary",
      "transition-colors duration-short",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        // Fixed positioning to prevent layout shifts
        "z-dropdown min-w-[8rem] overflow-hidden",

        // Fluent Design styling without backdrop filter
        "bg-bg-layer-1 rounded-lg border border-border-subtle",
        "shadow-fluent-popup",

        // Typography
        "text-text-primary",

        // Animations with Fluent timing
        "data-[state=open]:animate-fadeIn",
        "data-[state=closed]:animate-fadeOut",

        // Scroll styling
        "fluent-scroll",

        className
      )}
      position={position}
      sideOffset={4}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn(
      "py-1.5 pl-8 pr-2 text-sm font-semibold text-text-primary",
      className
    )}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      // Layout
      "relative flex w-full cursor-default select-none items-center rounded-md py-1.5 pl-8 pr-2",

      // Typography
      "text-sm outline-none",

      // States with Fluent Design principles
      "text-text-primary",
      "hover:bg-accent-primary-soft hover:text-accent-primary",
      "focus:bg-accent-primary-soft focus:text-accent-primary",
      "data-[state=checked]:bg-accent-primary-soft data-[state=checked]:text-accent-primary",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",

      // Transitions
      "transition-all duration-short ease-fluent-standard",

      // Reveal effect
      "reveal-hover",

      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-border-divider", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

// Simple select for basic use cases (without Radix)
const SimpleSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div className="relative">
      <select
        className={cn(
          // Base styles with Fluent Design principles
          "flex h-10 w-full appearance-none items-center justify-between rounded-md px-3 py-2",
          "border border-border-subtle bg-bg-layer-1 text-sm text-text-primary",
          "transition-all duration-short ease-fluent-standard",

          // Hover and focus states
          "hover:border-border-interactive hover:bg-bg-layer-2",
          "focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-0",
          "focus:border-accent-primary focus:bg-bg-layer-1",

          // Disabled state
          "disabled:cursor-not-allowed disabled:opacity-50",
          "disabled:bg-bg-layer-1 disabled:border-border-subtle",

          // Subtle inner shadow for depth
          "shadow-[inset_0_1px_2px_oklch(from_black_l_c_h_/_0.05)]",
          "focus:shadow-[inset_0_1px_2px_oklch(from_black_l_c_h_/_0.1)]",

          // Reveal effect
          "reveal-hover relative overflow-hidden",

          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted pointer-events-none" />
    </div>
  );
});
SimpleSelect.displayName = "SimpleSelect";

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  SimpleSelect,
};
