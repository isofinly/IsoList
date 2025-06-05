import Navbar from "@/components/Navbar";
import type { Metadata, Viewport } from "next";
import { Figtree, Fira_Code } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-figtree",
  display: "swap",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-fira-code",
  display: "swap",
});

export const metadata: Metadata = {
  title: "IsoView - Your Personal Media Tracker",
  description: "Track movies, series, and anime you've watched or want to watch with beautiful Fluent Design.",
  keywords: ["media tracker", "movies", "tv series", "anime", "ratings", "watchlist"],
  authors: [{ name: "IsoView Team" }],
  creator: "IsoView",
  publisher: "IsoView",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0066ff" },
    { media: "(prefers-color-scheme: dark)", color: "#0066ff" },
  ],
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="IsoView" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#0066ff" />
        <meta name="msapplication-tap-highlight" content="no" />
        

        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      
      <body className={`fluent-scroll ${figtree.variable} ${firaCode.variable}`}>
        {/* Skip to main content for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only fixed top-4 left-4 z-[9999] px-4 py-2 bg-accent-primary text-text-on-accent rounded-md transition-all duration-short focus:ring-2 focus:ring-accent-primary-hover focus:ring-offset-2 focus:ring-offset-bg-base"
        >
          Skip to main content
        </a>
        
        {/* Navigation */}
        <Navbar />
        
        {/* Main content area */}
        <main 
          id="main-content" 
          className="container mx-auto px-4 py-8 min-h-[calc(100vh-var(--navbar-height))] flex flex-col"
        >
          {/* Content wrapper with Fluent Design animations */}
          <div className="flex-grow">
            {children}
          </div>
          
          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-border-divider/30">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-text-muted">
              <div className="flex items-center gap-2">
                <span>© 2024 IsoView</span>
                <span>•</span>
                <span>Built with Fluent Design</span>
              </div>
              
              <div className="flex items-center gap-4">
                <a
                  href="/privacy"
                  className="hover:text-text-primary transition-colors duration-short"
                >
                  Privacy
                </a>
                <a
                  href="/terms"
                  className="hover:text-text-primary transition-colors duration-short"
                >
                  Terms
                </a>
                <a
                  href="/about"
                  className="hover:text-text-primary transition-colors duration-short"
                >
                  About
                </a>
              </div>
            </div>
          </footer>
        </main>
        
        {/* Background decorative elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div 
            className="absolute -top-[40vh] -right-[40vw] w-[80vw] h-[80vh] bg-accent-primary/[0.02] rounded-full blur-3xl"
            style={{
              background: 'radial-gradient(circle, oklch(60% 0.22 255 / 0.03) 0%, transparent 70%)'
            }}
          />
          <div 
            className="absolute -bottom-[40vh] -left-[40vw] w-[80vw] h-[80vh] bg-accent-primary/[0.01] rounded-full blur-3xl"
            style={{
              background: 'radial-gradient(circle, oklch(60% 0.22 255 / 0.02) 0%, transparent 70%)'
            }}
          />
        </div>
        
        {/* Global loading indicator */}
        <div id="global-loading" className="hidden fixed top-2 right-4 z-[9999]">
          <div className="fluent-glass px-3 py-2 rounded-lg shadow-fluent-popup flex items-center gap-2 text-sm text-text-primary">
            <div className="w-4 h-4 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
        
        {/* Toast notifications container */}
        <div 
          id="toast-container" 
          className="fixed top-20 right-4 z-notification flex flex-col gap-2 pointer-events-none"
          aria-live="polite"
          aria-label="Notifications"
        >
          {/* Toast notifications will be dynamically inserted here */}
        </div>
        

      </body>
    </html>
  );
}