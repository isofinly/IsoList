import { Button } from "@/components/ui/button";
import { Card, CardContent, CardGlass } from "@/components/ui/card";
import { LogIn, Play, Star, TrendingUp, Users, Zap } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-var(--navbar-height))] bg-gradient-to-br from-bg-base via-bg-layer-1 to-bg-base">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container mx-auto px-4 py-16 lg:py-24 relative">
          <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
            {/* Main heading */}
            <div className="mb-8 animate-fade-in-up">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Welcome to{" "}
                <span className="text-gradient-primary bg-gradient-to-r from-accent-primary to-accent-primary-hover bg-clip-text text-transparent">
                  ISOVIEW
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-text-secondary mb-8 max-w-2xl mx-auto leading-relaxed">
                Your personal, bloat-free tracker for movies, series, and anime. 
                Experience entertainment tracking with beautiful design and seamless performance.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <Button asChild size="lg" variant="accent" className="group">
                <Link href="/ratings" className="flex items-center">
                  <Star className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-short" />
                  View My Ratings
                  <LogIn className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-short" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="group">
                <Link href="/add" className="flex items-center">
                  <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-short" />
                  Add New Media
                </Link>
              </Button>
            </div>

            {/* Features grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <CardGlass className="p-6 text-center hover:scale-105 transition-all duration-medium cursor-default">
                <div className="w-12 h-12 bg-accent-primary-soft rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-accent-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-text-primary">Smart Ratings</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Track and rate your favorite content with intelligent recommendations.
                </p>
              </CardGlass>

              <CardGlass className="p-6 text-center hover:scale-105 transition-all duration-medium cursor-default">
                <div className="w-12 h-12 bg-success-soft rounded-xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-success" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-text-primary">Progress Tracking</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Monitor your watching progress and discover viewing patterns.
                </p>
              </CardGlass>

              <CardGlass className="p-6 text-center hover:scale-105 transition-all duration-medium cursor-default">
                <div className="w-12 h-12 bg-info-soft rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-info" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-text-primary">Lightning Fast</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Optimized performance with modern design principles.
                </p>
              </CardGlass>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto fluent-surface-hover">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-text-primary mb-2">Your Entertainment Journey</h2>
                <p className="text-text-secondary">Start tracking your media consumption today</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent-primary mb-2">0</div>
                  <div className="text-sm text-text-secondary">Items Tracked</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-success mb-2">0</div>
                  <div className="text-sm text-text-secondary">Hours Watched</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-warning mb-2">0</div>
                  <div className="text-sm text-text-secondary">Ratings Given</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Terminal section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <CardGlass className="p-6 bg-bg-layer-2/30 border border-border-subtle">
              <div className="font-mono text-xs text-text-muted space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-success">$</span>
                  <span>ps aux | grep entertainment</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-success">$</span>
                  <span>cd ~/media/tracker && ls -la</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-accent-primary">→</span>
                  <span>Initializing IsoView v0.1.0</span>
                  <span className="terminal-caret"></span>
                </div>
              </div>
            </CardGlass>
          </div>
        </div>
      </section>

      {/* Quick navigation */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-2">Quick Navigation</h2>
            <p className="text-text-secondary">Jump to your favorite sections</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Button asChild variant="outline" className="h-16 flex-col group">
              <Link href="/ratings">
                <Star className="h-6 w-6 mb-1 group-hover:scale-110 transition-transform duration-short" />
                <span className="text-xs">Ratings</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 flex-col group">
              <Link href="/watchlist">
                <Play className="h-6 w-6 mb-1 group-hover:scale-110 transition-transform duration-short" />
                <span className="text-xs">Watchlist</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 flex-col group">
              <Link href="/calendar">
                <TrendingUp className="h-6 w-6 mb-1 group-hover:scale-110 transition-transform duration-short" />
                <span className="text-xs">Calendar</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 flex-col group">
              <Link href="/add">
                <Zap className="h-6 w-6 mb-1 group-hover:scale-110 transition-transform duration-short" />
                <span className="text-xs">Add New</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}