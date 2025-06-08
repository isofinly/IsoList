import { cn } from "@/lib/utils";
import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  helperText?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, helperText, startAdornment, endAdornment, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative">
          {startAdornment && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-text-muted">
              {startAdornment}
            </div>
          )}

          <input
            type={type}
            className={cn(
              "flex h-10 w-full rounded-md border text-sm text-text-primary",
              "bg-bg-layer-1 transition-all duration-short ease-fluent-standard",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium",
              "placeholder:text-text-muted",
              "border-border-subtle",
              "hover:border-border-interactive hover:bg-bg-layer-2",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-0",
              "focus-visible:border-accent-primary focus-visible:bg-bg-layer-1",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-bg-layer-1",
              "disabled:border-border-subtle disabled:text-text-disabled",
              error && [
                "border-destructive focus-visible:ring-destructive",
                "focus-visible:border-destructive",
              ],
              startAdornment ? "pl-10" : "px-3",
              endAdornment ? "pr-10" : "px-3",
              "py-2",
              "shadow-[inset_0_1px_2px_oklch(from_black_l_c_h_/_0.05)]",
              "focus-visible:shadow-[inset_0_1px_2px_oklch(from_black_l_c_h_/_0.1)]",
              "reveal-hover",
              className,
            )}
            ref={ref}
            {...props}
          />

          {endAdornment && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-text-muted">
              {endAdornment}
            </div>
          )}
        </div>

        {helperText && (
          <p
            className={cn(
              "mt-1.5 text-xs leading-relaxed",
              error ? "text-destructive" : "text-text-muted",
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

const InputSearch = React.forwardRef<HTMLInputElement, Omit<InputProps, "type" | "startAdornment">>(
  ({ className, placeholder = "Search...", ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="search"
        placeholder={placeholder}
        startAdornment={
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        }
        className={cn(
          "bg-bg-layer-2 border-border-subtle",
          "hover:bg-bg-layer-1 focus-visible:bg-bg-layer-1",
          className,
        )}
        {...props}
      />
    );
  },
);
InputSearch.displayName = "InputSearch";

const InputPassword = React.forwardRef<HTMLInputElement, Omit<InputProps, "type" | "endAdornment">>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <Input
        ref={ref}
        type={showPassword ? "text" : "password"}
        endAdornment={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="p-1 hover:bg-bg-layer-2 rounded-sm transition-colors duration-short"
            tabIndex={-1}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {showPassword ? (
                <>
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                  <line x1="2" x2="22" y1="2" y2="22" />
                </>
              ) : (
                <>
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </>
              )}
            </svg>
          </button>
        }
        className={className}
        {...props}
      />
    );
  },
);
InputPassword.displayName = "InputPassword";

export { Input, InputPassword, InputSearch };
