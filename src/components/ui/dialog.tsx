"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      // Fluent Design overlay with backdrop blur
      "fixed inset-0 z-modal-backdrop",
      "bg-bg-base/60 backdrop-blur-md",
      // Smooth animations
      "data-[state=open]:animate-dialog-overlay-show",
      "data-[state=closed]:animate-dialog-overlay-hide",
      // Better backdrop for accessibility
      "backdrop-saturate-150",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-modal-backdrop",
        "bg-bg-base/60 backdrop-blur-md backdrop-saturate-150",
        "data-[state=open]:animate-dialog-overlay-show",
        "data-[state=closed]:animate-dialog-overlay-hide",
      )}
    />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        // Positioning
        "fixed left-[50%] top-[50%] z-modal-content",
        "translate-x-[-50%] translate-y-[-50%]",

        // Layout
        "grid w-full max-w-lg gap-4 p-6",

        // Fluent Design styling
        "fluent-glass rounded-xl border border-border-subtle",
        "shadow-fluent-dialog",

        // Typography
        "text-text-primary",

        // Animations with Fluent timing
        "data-[state=open]:animate-dialog-content-show",
        "data-[state=closed]:animate-dialog-content-hide",

        // Focus management
        "focus:outline-none",

        // Responsive design
        "sm:rounded-xl max-h-[85vh] overflow-auto",

        // Scroll styling
        "fluent-scroll",
        
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        className={cn(
          // Positioning
          "absolute right-4 top-4",

          // Fluent button styling
          "inline-flex h-8 w-8 items-center justify-center",
          "rounded-md border border-transparent",
          "bg-transparent text-text-muted",

          // Hover and focus states
          "hover:bg-bg-layer-2 hover:text-text-primary",
          "focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2",
          "focus:ring-offset-bg-base",

          // Transitions
          "transition-all duration-short ease-fluent-standard",

          // Disabled state
          "disabled:pointer-events-none disabled:opacity-50",

          // Reveal effect
          "reveal-hover",
        )}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      // Add some bottom spacing for better hierarchy
      "pb-2 border-b border-border-divider/30",
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      // Add some top spacing and subtle separator
      "pt-4 border-t border-border-divider/30",
      // Better gap management
      "gap-2 sm:gap-0",
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      // Typography following Fluent Design
      "text-xl font-semibold leading-tight tracking-tight",
      "text-text-primary",
      // Better spacing
      "mb-1",
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(
      "text-sm text-text-secondary leading-relaxed",
      // Better line height for readability
      "max-w-prose",
      className,
    )}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

// Additional dialog variants for specific use cases

const DialogConfirm = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive";
    onConfirm?: () => void;
    onCancel?: () => void;
  }
>(
  (
    {
      className,
      title,
      description,
      confirmText = "Confirm",
      cancelText = "Cancel",
      variant = "default",
      onConfirm,
      onCancel,
      children,
      ...props
    },
    ref,
  ) => (
    <DialogContent ref={ref} className={cn("max-w-md", className)} {...props}>
      <DialogHeader>
        <DialogTitle className="text-left">{title}</DialogTitle>
        {description && <DialogDescription className="text-left">{description}</DialogDescription>}
      </DialogHeader>

      {children}

      <DialogFooter>
        <DialogClose asChild>
          <button
            type="button"
            onClick={onCancel}
            className={cn(
              "inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium",
              "border border-border-subtle bg-bg-layer-1 text-text-primary",
              "hover:bg-bg-layer-2 hover:border-border-interactive",
              "focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2",
              "transition-all duration-short ease-fluent-standard",
              "reveal-hover",
            )}
          >
            {cancelText}
          </button>
        </DialogClose>
        <DialogClose asChild>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              "inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium",
              "transition-all duration-short ease-fluent-standard",
              "focus:outline-none focus:ring-2 focus:ring-offset-2",
              "reveal-hover",
              variant === "destructive"
                ? [
                    "bg-destructive text-text-on-destructive",
                    "hover:bg-destructive-hover",
                    "focus:ring-destructive",
                  ]
                : [
                    "bg-accent-primary text-text-on-accent",
                    "hover:bg-accent-primary-hover",
                    "focus:ring-accent-primary",
                  ],
            )}
          >
            {confirmText}
          </button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  ),
);
DialogConfirm.displayName = "DialogConfirm";

const DialogForm = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    title: string;
    description?: string;
  }
>(({ className, title, description, children, ...props }, ref) => (
  <DialogContent ref={ref} className={cn("max-w-2xl max-h-[90vh]", className)} {...props}>
    <DialogHeader>
      <DialogTitle>{title}</DialogTitle>
      {description && <DialogDescription>{description}</DialogDescription>}
    </DialogHeader>

    <div className="max-h-[60vh] overflow-auto fluent-scroll pr-2">{children}</div>
  </DialogContent>
));
DialogForm.displayName = "DialogForm";

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogConfirm,
  DialogForm,
};
