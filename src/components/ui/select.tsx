import React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            "flex h-10 w-full appearance-none items-center justify-between rounded-md border border-theme-border bg-theme-surface px-3 py-2 text-sm text-theme-foreground ring-offset-theme-background placeholder:text-theme-muted-foreground focus:outline-none focus:ring-2 focus:ring-theme-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-theme-muted-foreground pointer-events-none" />
      </div>
    );
  },
);
Select.displayName = "Select";

export { Select };
