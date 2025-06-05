import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-var(--navbar-height)-4rem)] text-center">
      <h1 className="text-4xl sm:text-5xl font-mono font-bold mb-4">
        Welcome to <span className="text-theme-primary">ISOVIEW</span>
      </h1>
      <p className="text-lg text-theme-muted-foreground mb-8 max-w-md text-balance">
        Your personal, bloat-free tracker for movies, series, and anime. Dive into your lists or add
        something new.
      </p>
      <div className="space-y-4 sm:space-y-0 sm:space-x-4">
        <Button asChild size="lg" variant="primary">
          <Link href="/ratings">
            View My Ratings <LogIn className="ml-2 h-5 w-5" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="/add">Add New Media</Link>
        </Button>
      </div>
      <div className="mt-12 font-mono text-xs text-theme-muted-foreground">
        <p>ps aux | grep entertainment</p>
        <p>cd ~/media/tracker && ls -la</p>
        <p>
          Initializing IsoView v0.1.0<span className="terminal-caret"></span>
        </p>
      </div>
    </div>
  );
}
