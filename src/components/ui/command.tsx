"use client";

import * as React from "react";
import { type DialogProps } from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import { Search, ArrowRight, Hash, User, Calendar, Film, Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-lg",
      "bg-bg-layer-1 text-text-primary",
      className,
    )}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

interface CommandDialogProps extends DialogProps {}

const CommandDialog = ({ children, ...props }: CommandDialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent
        className={cn(
          "overflow-hidden p-0 shadow-fluent-dialog",
          "fluent-glass border border-border-subtle",
          "max-w-[640px] w-full",
        )}
      >
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-text-muted [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b border-border-subtle px-4 py-3" cmdk-input-wrapper="">
    <Search className="mr-3 h-5 w-5 shrink-0 text-text-muted" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-md bg-transparent text-base text-text-primary",
        "placeholder:text-text-muted",
        "outline-none disabled:cursor-not-allowed disabled:opacity-50",
        "transition-all duration-short ease-fluent-standard",
        className,
      )}
      {...props}
    />
  </div>
));

CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden p-2", "fluent-scroll", className)}
    {...props}
  />
));

CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className={cn("py-6 text-center text-sm text-text-muted", className)}
    {...props}
  />
));

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden p-1 text-text-primary",
      "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-text-muted [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide",
      className,
    )}
    {...props}
  />
));

CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 h-px bg-border-divider my-2", className)}
    {...props}
  />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item> & {
    icon?: React.ReactNode;
    shortcut?: string;
  }
>(({ className, icon, shortcut, children, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-md px-3 py-2.5 text-sm outline-none",
      "text-text-primary",
      "aria-selected:bg-accent-primary-soft aria-selected:text-accent-primary",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "transition-all duration-short ease-fluent-standard",
      "reveal-hover",
      "hover:bg-accent-primary-soft hover:text-accent-primary",
      "gap-3",
      className,
    )}
    {...props}
  >
    {icon && <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">{icon}</div>}

    <div className="flex-grow min-w-0">{children}</div>

    {shortcut && (
      <div className="flex-shrink-0 ml-auto">
        <kbd
          className={cn(
            "pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border px-1.5 text-[10px] font-medium",
            "bg-bg-layer-2 text-text-muted border-border-subtle",
            "opacity-70",
          )}
        >
          {shortcut.split("+").map((key, index) => (
            <React.Fragment key={key}>
              {index > 0 && <span className="text-xs">+</span>}
              <span>{key}</span>
            </React.Fragment>
          ))}
        </kbd>
      </div>
    )}
  </CommandPrimitive.Item>
));

CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span className={cn("ml-auto text-xs tracking-widest text-text-muted", className)} {...props} />
  );
};
CommandShortcut.displayName = "CommandShortcut";

// Enhanced Command Menu with Fluent Design
interface CommandMenuProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
}

const CommandMenu = ({
  open,
  onOpenChange,
  placeholder = "Type a command or search...",
}: CommandMenuProps) => {
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange?.(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const navigationItems = [
    { icon: <Film className="w-4 h-4" />, label: "Movies", shortcut: "M", href: "/movies" },
    { icon: <Star className="w-4 h-4" />, label: "Ratings", shortcut: "R", href: "/ratings" },
    { icon: <Calendar className="w-4 h-4" />, label: "Calendar", shortcut: "C", href: "/calendar" },
    { icon: <User className="w-4 h-4" />, label: "Profile", shortcut: "P", href: "/profile" },
  ];

  const actions = [
    { icon: <Hash className="w-4 h-4" />, label: "Add New Item", shortcut: "⌘+N" },
    { icon: <Search className="w-4 h-4" />, label: "Search Media", shortcut: "⌘+/" },
  ];

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder={placeholder} value={searchQuery} onValueChange={setSearchQuery} />

      <CommandList>
        <CommandEmpty>
          <div className="flex flex-col items-center gap-2 py-4">
            <Search className="w-8 h-8 text-text-muted opacity-50" />
            <p className="text-sm text-text-muted">No results found for "{searchQuery}"</p>
          </div>
        </CommandEmpty>

        <CommandGroup heading="Navigation">
          {navigationItems.map((item) => (
            <CommandItem
              key={item.href}
              icon={item.icon}
              shortcut={item.shortcut}
              onSelect={() => {
                window.location.href = item.href;
                onOpenChange?.(false);
              }}
            >
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          {actions.map((action) => (
            <CommandItem
              key={action.label}
              icon={action.icon}
              shortcut={action.shortcut}
              onSelect={() => {
                console.log(`Action: ${action.label}`);
                onOpenChange?.(false);
              }}
            >
              {action.label}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Recent">
          <CommandItem icon={<Film className="w-4 h-4" />}>The Matrix (1999)</CommandItem>
          <CommandItem icon={<Film className="w-4 h-4" />}>Inception (2010)</CommandItem>
          <CommandItem icon={<Film className="w-4 h-4" />}>Interstellar (2014)</CommandItem>
        </CommandGroup>
      </CommandList>

      <div className="border-t border-border-subtle p-3">
        <div className="flex items-center justify-between text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-bg-layer-2 px-1.5 font-mono text-[10px] font-medium text-text-muted border-border-subtle">
              <Command className="h-3 w-3" />K
            </kbd>
            <span>to open</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-bg-layer-2 px-1.5 font-mono text-[10px] font-medium text-text-muted border-border-subtle">
              ↵
            </kbd>
            <span>to select</span>
          </div>
        </div>
      </div>
    </CommandDialog>
  );
};

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
  CommandMenu,
};
