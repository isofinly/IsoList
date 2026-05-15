"use client";

import { AuthService } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AuthProviderProps {
  children: React.ReactNode;
}

const PROTECTED_ROUTES = [
  "/tracker",
  "/ratings",
  "/watchlist",
  "/calendar",
  "/places",
  "/add",
];

export function AuthProvider({ children }: AuthProviderProps) {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const authService = AuthService.getInstance();

  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = authService.isAuthenticated();
      const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
        pathname.startsWith(route),
      );

      if (isProtectedRoute && !isAuthenticated) {
        router.push("/login");
      } else if (isAuthenticated && pathname === "/login") {
        router.push("/");
      }

      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [pathname, router, authService]);

  if (
    isCheckingAuth &&
    PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
