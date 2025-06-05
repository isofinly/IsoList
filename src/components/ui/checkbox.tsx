import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

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
          "flex h-5 w-5 cursor-pointer items-center justify-center rounded border border-theme-primary bg-theme-surface text-theme-primary-foreground transition-colors peer-checked:bg-theme-primary peer-checked:text-theme-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-theme-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-theme-background peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
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
