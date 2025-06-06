"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthService } from "@/lib/auth";

interface AuthProviderProps {
  children: React.ReactNode;
}

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/login",
  "/auth/callback",
  "/about",
  "/privacy",
  "/terms",
  "/help",
  "/contact",
  // Add any other public routes here
];

export function AuthProvider({ children }: AuthProviderProps) {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const authService = AuthService.getInstance();

  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = authService.isAuthenticated();
      const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

      // Allow access to public routes without authentication
      if (isPublicRoute) {
        setIsCheckingAuth(false);
        return;
      }

      // For private routes, check authentication
      if (!isAuthenticated) {
        // Redirect to login if not authenticated and not on a public route
        router.push("/login");
      } else if (pathname === "/login") {
        // Redirect to home if authenticated and on login page
        router.push("/");
      }

      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [pathname, router, authService]);

  // Show loading while checking authentication (only for non-public routes)
  if (isCheckingAuth && !PUBLIC_ROUTES.includes(pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
