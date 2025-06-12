"use client";

import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";
import * as React from "react";

interface SelectContextType {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  displayMap: Map<string, string>;
  setDisplayText: (value: string, displayText: string) => void;
}

const SelectContext = React.createContext<SelectContextType | undefined>(
  undefined
);

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({
  value = "",
  onValueChange,
  children,
}) => {
  const [open, setOpen] = React.useState(false);
  const [displayMap, setDisplayMap] = React.useState(new Map<string, string>());

  const setDisplayText = React.useCallback(
    (value: string, displayText: string) => {
      setDisplayMap((prev) => {
        const newMap = new Map(prev);
        newMap.set(value, displayText);
        return newMap;
      });
    },
    []
  );

  return (
    <SelectContext.Provider
      value={{
        value,
        onValueChange: onValueChange || (() => {}),
        open,
        setOpen,
        displayMap,
        setDisplayText,
      }}
    >
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
};

const useSelectContext = () => {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("Select components must be used within Select");
  }
  return context;
};

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const { open, setOpen } = useSelectContext();

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => setOpen(!open)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md px-3 py-2",
        "border border-border-subtle bg-bg-layer-1 text-sm text-text-primary",
        "transition-all duration-short ease-fluent-standard",
        "hover:border-border-interactive hover:bg-bg-layer-2",
        "focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-0",
        "focus:border-accent-primary focus:bg-bg-layer-1",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "disabled:bg-bg-layer-1 disabled:border-border-subtle",
        "placeholder:text-text-muted",
        "shadow-[inset_0_1px_2px_oklch(from_black_l_c_h_/_0.05)]",
        "focus:shadow-[inset_0_1px_2px_oklch(from_black_l_c_h_/_0.1)]",
        "reveal-hover relative overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown
        className={cn(
          "h-4 w-4 opacity-50 transition-transform duration-short shrink-0",
          open && "rotate-180"
        )}
      />
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

// TODO: Improve implementation
const SelectValue: React.FC<SelectValueProps> = ({
  placeholder,
  className,
}) => {
  const { value, displayMap } = useSelectContext();

  // Force component to re-render when displayMap changes
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  React.useEffect(() => {
    forceUpdate();
  }, [displayMap]);

  const displayText = React.useMemo(() => {
    if (!value) return "";

    const mappedText = displayMap.get(value);
    if (mappedText) return mappedText;

    if (value === "all") return "All Watchlist";
    if (value === "watching") return "Watching";
    if (value === "planned") return "Planned";
    if (value === "on-hold") return "On Hold";
    if (value === "premiereDate") return "Date (Premiere/Start)";
    if (value === "title") return "Title";
    if (value === "status") return "Status";

    // Only apply camelCase formatting to values that look like identifiers
    // Avoid formatting random IDs or complex strings
    if (value.length > 20 || /[0-9-_]{3,}/.test(value)) {
      return value;
    }

    return (
      value.charAt(0).toUpperCase() + value.slice(1).replace(/([A-Z])/g, " $1")
    );
  }, [value, displayMap]);

  return (
    <span className={cn("truncate", className)}>
      {displayText || placeholder}
    </span>
  );
};

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { open, setOpen } = useSelectContext();
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open, setOpen]);

  // Close on escape
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      className={cn(
        "absolute top-full left-0 z-50 mt-1 w-full",
        "min-w-[8rem] overflow-hidden",
        "fluent-glass rounded-lg border border-border-subtle",
        "shadow-fluent-popup",
        "text-text-primary",
        "animate-fadeIn",
        "fluent-scroll max-h-60",
        className
      )}
      {...props}
    >
      <div className="p-1">{children}</div>
    </div>
  );
});
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string;
    children: React.ReactNode;
  }
>(({ className, children, value, ...props }, ref) => {
  const {
    value: selectedValue,
    onValueChange,
    setOpen,
    setDisplayText,
  } = useSelectContext();
  const isSelected = value === selectedValue;

  // Register the display text for this value using useLayoutEffect for immediate registration
  React.useLayoutEffect(() => {
    const extractTextFromChildren = (children: React.ReactNode): string => {
      if (typeof children === "string") {
        return children;
      }
      if (typeof children === "number") {
        return String(children);
      }
      if (React.isValidElement(children)) {
        // If it's a React element, try to extract text from its children
        return extractTextFromChildren(children.props.children);
      }
      if (Array.isArray(children)) {
        return children.map(extractTextFromChildren).join("");
      }
      return "";
    };

    const displayText = extractTextFromChildren(children);
    setDisplayText(value, displayText);
  }, [value, children, setDisplayText]);

  const handleClick = () => {
    onValueChange(value);
    setOpen(false);
  };

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-md py-1.5 pl-8 pr-2",
        "text-sm outline-none",
        "text-text-primary",
        "hover:bg-accent-primary-soft hover:text-accent-primary cursor-pointer",
        "focus:bg-accent-primary-soft focus:text-accent-primary",
        isSelected && "bg-accent-primary-soft text-accent-primary",
        "transition-all duration-short ease-fluent-standard",
        "reveal-hover",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-4 w-4" />}
      </span>
      {children}
    </div>
  );
});
SelectItem.displayName = "SelectItem";

const SelectGroup = React.Fragment;
const SelectLabel = React.Fragment;
const SelectSeparator = React.Fragment;
const SelectScrollUpButton = React.Fragment;
const SelectScrollDownButton = React.Fragment;

const SimpleSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div className="relative">
      <select
        className={cn(
          "flex h-10 w-full appearance-none items-center justify-between rounded-md px-3 py-2",
          "border border-border-subtle bg-bg-layer-1 text-sm text-text-primary",
          "transition-all duration-short ease-fluent-standard",
          "hover:border-border-interactive hover:bg-bg-layer-2",
          "focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-0",
          "focus:border-accent-primary focus:bg-bg-layer-1",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "disabled:bg-bg-layer-1 disabled:border-border-subtle",
          "shadow-[inset_0_1px_2px_oklch(from_black_l_c_h_/_0.05)]",
          "focus:shadow-[inset_0_1px_2px_oklch(from_black_l_c_h_/_0.1)]",
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
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  SimpleSelect,
};
