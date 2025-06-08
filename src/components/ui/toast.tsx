"use client";

import { cn } from "@/lib/utils";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import * as React from "react";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive: "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type ToastProps = React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
  VariantProps<typeof toastVariants>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

const Toast = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Root>, ToastProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <ToastPrimitives.Root
        ref={ref}
        className={cn(
          "group pointer-events-auto relative flex w-full items-start gap-4",
          "overflow-hidden rounded-lg p-4 shadow-fluent-popup",
          "fluent-glass border border-border-subtle",
          "transition-all duration-medium ease-fluent-standard",
          "data-[state=open]:animate-slide-in-right",
          "data-[state=closed]:animate-slide-out-right",
          "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
          "data-[swipe=cancel]:translate-x-0",
          "data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
          "data-[swipe=move]:transition-none",
          "data-[swipe=end]:animate-slide-out-right",
          "hover:shadow-fluent-dialog hover:scale-[1.02]",
          "reveal-hover",

          className,
        )}
        {...props}
      />
    );
  },
);
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md px-3 text-sm font-medium",
      "bg-accent-primary text-text-on-accent",
      "hover:bg-accent-primary-hover",
      "focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2",
      "transition-all duration-short ease-fluent-standard",
      "reveal-hover",
      className,
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 opacity-70",
      "text-text-muted hover:text-text-primary",
      "hover:bg-bg-layer-2",
      "focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2",
      "transition-all duration-short ease-fluent-standard",
      "reveal-hover",
      className,
    )}
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold text-text-primary leading-tight", className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm text-text-secondary leading-relaxed", className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

interface ToastWithIconProps {
  title: string;
  description?: string;
  type: "success" | "error" | "warning" | "info";
  action?: React.ReactNode;
  duration?: number;
  onOpenChange?: (open: boolean) => void;
}

const ToastWithIcon = React.forwardRef<React.ElementRef<typeof Toast>, ToastWithIconProps>(
  ({ title, description, type, action, duration = 5000, onOpenChange, ...props }, ref) => {
    const getIcon = () => {
      switch (type) {
        case "success":
          return <CheckCircle className="h-5 w-5 text-success" />;
        case "error":
          return <AlertCircle className="h-5 w-5 text-destructive" />;
        case "warning":
          return <AlertTriangle className="h-5 w-5 text-warning" />;
        case "info":
          return <Info className="h-5 w-5 text-info" />;
      }
    };

    const getTypeStyles = () => {
      switch (type) {
        case "success":
          return "border-success/30 bg-success-soft/50";
        case "error":
          return "border-destructive/30 bg-destructive-soft/50";
        case "warning":
          return "border-warning/30 bg-warning-soft/50";
        case "info":
          return "border-info/30 bg-info-soft/50";
      }
    };

    return (
      <Toast
        ref={ref}
        duration={duration}
        className={cn(getTypeStyles())}
        onOpenChange={onOpenChange}
        {...props}
      >
        <div className="flex items-start gap-3 flex-1">
          <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
          <div className="flex-1 min-w-0">
            <ToastTitle>{title}</ToastTitle>
            {description && <ToastDescription className="mt-1">{description}</ToastDescription>}
          </div>
        </div>

        {action && <div className="flex-shrink-0">{action}</div>}

        <ToastClose />
      </Toast>
    );
  },
);
ToastWithIcon.displayName = "ToastWithIcon";

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  type: "success" | "error" | "warning" | "info";
  action?: React.ReactNode;
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const addToast = React.useCallback((toast: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);

    // Auto remove after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, toast.duration || 5000);

    return id;
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useMemo(
    () => ({
      success: (
        title: string,
        description?: string,
        options?: { duration?: number; action?: React.ReactNode },
      ) => addToast({ title, description, type: "success", ...options }),
      error: (
        title: string,
        description?: string,
        options?: { duration?: number; action?: React.ReactNode },
      ) => addToast({ title, description, type: "error", ...options }),
      warning: (
        title: string,
        description?: string,
        options?: { duration?: number; action?: React.ReactNode },
      ) => addToast({ title, description, type: "warning", ...options }),
      info: (
        title: string,
        description?: string,
        options?: { duration?: number; action?: React.ReactNode },
      ) => addToast({ title, description, type: "info", ...options }),
    }),
    [addToast],
  );

  return {
    toasts,
    toast,
    removeToast,
  };
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <ToastProvider>
      {toasts.map((toast) => (
        <ToastWithIcon
          key={toast.id}
          title={toast.title}
          description={toast.description}
          type={toast.type}
          action={toast.action}
          duration={toast.duration}
          onOpenChange={(open: boolean) => {
            if (!open) removeToast(toast.id);
          }}
        />
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}

export {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  ToastWithIcon,
  type ToastActionElement,
  type ToastProps,
};
