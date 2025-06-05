"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
}

const VisuallyHidden = React.forwardRef<
  HTMLSpanElement,
  VisuallyHiddenProps
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? React.Fragment : "span";
  
  if (asChild && React.Children.count(props.children) === 1) {
    const child = React.Children.only(props.children) as React.ReactElement;
    return React.cloneElement(child, {
      ...child.props,
      className: cn(
        // Visually hidden but accessible to screen readers
        "absolute",
        "w-px h-px",
        "p-0 -m-px",
        "overflow-hidden",
        "clip-path-[inset(50%)]",
        "border-0",
        // Ensure it doesn't interfere with layout
        "whitespace-nowrap",
        child.props.className
      ),
      ref,
    });
  }

  return (
    <Comp
      ref={asChild ? undefined : ref}
      className={cn(
        // Visually hidden but accessible to screen readers
        "absolute",
        "w-px h-px", 
        "p-0 -m-px",
        "overflow-hidden",
        "clip-path-[inset(50%)]",
        "border-0",
        // Ensure it doesn't interfere with layout
        "whitespace-nowrap",
        className
      )}
      {...props}
    />
  );
});

VisuallyHidden.displayName = "VisuallyHidden";

export { VisuallyHidden };