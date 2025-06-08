import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import React from "react";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({ className, ...props }, ref) => {
  return (
    <div className="inline-flex items-center">
      <input
        type="checkbox"
        ref={ref}
        className="peer sr-only" // Hide original checkbox
        {...props}
      />
      <label
        htmlFor={props.id}
        className={cn(
          "flex h-5 w-5 cursor-pointer items-center justify-center rounded border border-border-subtle bg-bg-layer-1 text-text-primary transition-colors duration-short peer-checked:bg-accent-primary peer-checked:text-text-on-accent peer-checked:border-accent-primary peer-focus-visible:ring-2 peer-focus-visible:ring-accent-primary peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-bg-base peer-disabled:cursor-not-allowed peer-disabled:opacity-50 hover:border-border-interactive",
          className,
        )}
      >
        <Check className="h-4 w-4 hidden peer-checked:block" />
      </label>
    </div>
  );
});
Checkbox.displayName = "Checkbox";

export { Checkbox };
