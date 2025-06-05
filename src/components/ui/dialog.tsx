"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "./button";

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContextProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextProps | undefined>(undefined);

const useDialog = () => {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
};

const Dialog: React.FC<DialogProps> = ({ open: controlledOpen, onOpenChange, children }) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  return <DialogContext.Provider value={{ open, setOpen }}>{children}</DialogContext.Provider>;
};

const DialogTrigger = ({ children }: { children: React.ReactNode }) => {
  const { setOpen } = useDialog();
  return React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, {
        onClick: () => setOpen(true),
      });
    }
    return child;
  });
};

const DialogPortal = ({ children }: { children: React.ReactNode }) => {
  const { open } = useDialog();
  if (!open) return null;
  // In a real app, you'd use ReactDOM.createPortal here.
  // For simplicity in Next.js RSC/App Router without complex portal setup:
  return <>{children}</>;
};

const DialogOverlay = () => {
  const { open } = useDialog();
  return (
    <div
      className={cn(
        "fixed inset-0 z-40 bg-theme-background/80 backdrop-blur-sm",
        open ? "animate-fadeIn" : "hidden",
      )}
    />
  );
};

const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen } = useDialog();

    React.useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setOpen(false);
        }
      };
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }, [setOpen]);

    if (!open) return null;

    return (
      // Portal strategy:
      // This div would be portalled to document.body in a CSR app or with client-side portal logic.
      // For app router server components, true portalling is trickier.
      // We are styling it as fixed to appear like a modal.
      <>
        <DialogOverlay />
        <div
          ref={ref}
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-theme-border bg-theme-surface p-6 shadow-lg duration-200 sm:rounded-lg",
            "data-[state=open]:animate-dialog-content-show data-[state=closed]:animate-dialog-content-hide", // For potential future state-driven animation
            open ? "animate-dialog-content-show" : "hidden", // Simplified animation
            className,
          )}
          data-state={open ? "open" : "closed"}
          {...props}
        >
          {children}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-theme-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-theme-ring focus:ring-offset-2 disabled:pointer-events-none"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </>
    );
  },
);
DialogContent.displayName = "DialogContent";

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn(
        "text-lg font-mono font-semibold leading-none tracking-tight text-theme-foreground",
        className,
      )}
      {...props}
    />
  ),
);
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-theme-muted-foreground", className)} {...props} />
));
DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogTrigger,
  DialogPortal, // Note: This is a conceptual portal for App Router.
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
