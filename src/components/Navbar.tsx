"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Film, ListChecks, CalendarDays, PlusSquare, Tv, Menu } from "lucide-react"; // Added Menu for consistency

const navLinks = [
  { href: "/ratings", label: "Ratings", icon: <ListChecks size={20} /> },
  { href: "/watchlist", label: "Watchlist", icon: <Tv size={20} /> },
  { href: "/calendar", label: "Calendar", icon: <CalendarDays size={20} /> },
  { href: "/add", label: "Add Item", icon: <PlusSquare size={20} /> },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-30 h-navbar border-b border-border-subtle acrylic-navbar-bg">
      <div className="container mx-auto flex h-full items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center group text-text-primary hover:text-accent-primary transition-colors duration-short"
        >
          <Film size={28} className="text-accent-primary group-hover:opacity-80" />
          <span className="ml-2.5 font-sans text-xl font-semibold ">IsoView</span>
        </Link>
        <div className="flex items-center space-x-1 sm:space-x-2">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center px-2.5 py-1.5 rounded-md text-sm font-medium transition-all duration-short hover:bg-accent-primary-soft-hover",
                  isActive
                    ? "bg-accent-primary-soft text-accent-primary"
                    : "text-text-secondary hover:text-text-primary",
                )}
                title={link.label} // For accessibility on icon-only view
              >
                <span className="mr-0 sm:mr-1.5">{link.icon}</span>
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
