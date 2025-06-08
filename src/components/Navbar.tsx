"use client";
import { Button } from "@/components/ui/button";
import { CommandMenu } from "@/components/ui/command";
import { AuthService } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  Command,
  Film,
  ListChecks,
  LogIn,
  Menu,
  PlusSquare,
  Search,
  Tv,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "/ratings", label: "Ratings", icon: <ListChecks size={18} /> },
  { href: "/watchlist", label: "Watchlist", icon: <Tv size={18} /> },
  { href: "/calendar", label: "Calendar", icon: <CalendarDays size={18} /> },
  { href: "/add", label: "Add Item", icon: <PlusSquare size={18} /> },
  { href: "/login", label: "Login", icon: <LogIn size={18} /> },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const authService = AuthService.getInstance();
    setIsAuthenticated(authService.isAuthenticated());
  }, [pathname]);

  return (
    <>
      <nav
        className={cn(
          "z-999",
          "fixed top-0 left-0 right-0 z-fixed h-navbar",
          "fluent-acrylic-navbar",
          "border-b transition-all duration-medium ease-fluent-standard",
          isScrolled ? "border-border-interactive shadow-fluent-popup" : "border-border-subtle/50",
          "reveal-hover",
        )}
      >
        <div className="container mx-auto flex h-full items-center justify-between px-4 lg:px-6">
          {/* Logo/Brand */}
          <Link
            href="/"
            className={cn(
              "flex items-center group transition-all duration-short ease-fluent-standard",
              "text-text-primary hover:text-accent-primary",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary",
              "focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base rounded-md",
              "px-2 py-1 -ml-2",
            )}
          >
            <div className="relative">
              <Film
                size={32}
                className={cn(
                  "text-accent-primary transition-all duration-short ease-fluent-standard",
                  "group-hover:scale-110 group-hover:text-accent-primary-hover",
                  "drop-shadow-sm",
                )}
              />
              <div
                className={cn(
                  "absolute inset-0 rounded-full bg-accent-primary/20 blur-md",
                  "opacity-0 group-hover:opacity-100 transition-opacity duration-medium",
                  "scale-150",
                )}
              />
            </div>
            <span
              className={cn(
                "ml-3 font-sans text-xl font-semibold tracking-tight",
                "bg-gradient-to-r from-text-primary to-accent-primary bg-clip-text",
                "group-hover:from-accent-primary group-hover:to-accent-primary-hover",
                "transition-all duration-medium ease-fluent-standard",
              )}
            >
              IsoList
            </span>
          </Link>

          {/* Search/Command Button */}
          <div className="hidden sm:flex items-center mr-4">
            <Button
              variant="ghost"
              onClick={() => setIsCommandOpen(true)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm text-text-secondary",
                "hover:text-text-primary hover:bg-bg-layer-1/80",
                "border border-border-subtle/50 rounded-lg min-w-[200px] justify-start",
                "transition-all duration-short ease-fluent-standard",
              )}
            >
              <Search size={16} className="text-text-muted" />
              <span className="text-text-muted">Search or command...</span>
              <div className="ml-auto flex items-center gap-1">
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-bg-layer-2 px-1.5 font-mono text-[10px] font-medium text-text-muted border-border-subtle">
                  <Command size={10} />K
                </kbd>
              </div>
            </Button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks
              .filter((link) => link.href !== "/login" || !isAuthenticated)
              .map((link) => {
                const isActive =
                  pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-lg text-sm font-medium",
                      "transition-all duration-short ease-fluent-standard",
                      "reveal-hover relative overflow-hidden",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary",
                      "focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base",
                      isActive
                        ? [
                            "bg-accent-primary-soft text-accent-primary border border-accent-primary/20",
                            "shadow-sm backdrop-blur-sm",
                          ]
                        : [
                            "text-text-secondary hover:text-text-primary border border-transparent",
                            "hover:bg-bg-layer-1/80 hover:backdrop-blur-sm",
                          ],
                      "hover:shadow-sm hover:scale-[1.02]",
                      "active:scale-[0.98] active:transition-transform active:duration-75",
                    )}
                    title={link.label}
                  >
                    <span
                      className={cn(
                        "transition-all duration-short ease-fluent-standard",
                        isActive ? "text-accent-primary" : "text-current",
                      )}
                    >
                      {link.icon}
                    </span>
                    <span className="ml-2 hidden lg:inline font-medium">{link.label}</span>

                    {/* Active indicator */}
                    {isActive && (
                      <div
                        className={cn(
                          "absolute bottom-0 left-1/2 -translate-x-1/2",
                          "w-1 h-1 bg-accent-primary rounded-full",
                          "animate-scale-in",
                        )}
                      />
                    )}
                  </Link>
                );
              })}
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCommandOpen(true)}
              className="text-text-secondary hover:text-text-primary hover:bg-bg-layer-1/80"
              aria-label="Open command palette"
            >
              <Search size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                "text-text-secondary hover:text-text-primary",
                "hover:bg-bg-layer-1/80 hover:backdrop-blur-sm",
                isMobileMenuOpen && "bg-accent-primary-soft text-accent-primary",
              )}
              aria-label="Toggle mobile menu"
            >
              <Menu size={20} />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "md:hidden absolute top-full left-0 right-0 z-dropdown",
            "fluent-acrylic border-b border-border-subtle",
            "transition-all duration-medium ease-fluent-standard",
            "shadow-fluent-popup",
            isMobileMenuOpen
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-2 pointer-events-none",
          )}
        >
          <div className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-2 gap-2">
              {navLinks
                .filter((link) => link.href !== "/login" || !isAuthenticated)
                .map((link) => {
                  const isActive =
                    pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex flex-col items-center px-4 py-3 rounded-lg text-sm font-medium",
                        "transition-all duration-short ease-fluent-standard",
                        "reveal-hover relative overflow-hidden",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary",
                        "focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base",
                        isActive
                          ? [
                              "bg-accent-primary-soft text-accent-primary border border-accent-primary/20",
                              "shadow-sm",
                            ]
                          : [
                              "text-text-secondary hover:text-text-primary border border-transparent",
                              "hover:bg-bg-layer-1/80",
                            ],
                        "hover:shadow-sm hover:scale-[1.02]",
                        "active:scale-[0.98] active:transition-transform active:duration-75",
                      )}
                    >
                      <span
                        className={cn(
                          "mb-1 transition-all duration-short ease-fluent-standard",
                          isActive ? "text-accent-primary scale-110" : "text-current",
                        )}
                      >
                        {link.icon}
                      </span>
                      <span className="text-xs font-medium">{link.label}</span>
                    </Link>
                  );
                })}
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-sticky bg-bg-base/20 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          onKeyDown={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Command Palette */}
      <CommandMenu
        open={isCommandOpen}
        onOpenChange={setIsCommandOpen}
        placeholder="Search media, navigate, or run commands..."
      />
    </>
  );
}
