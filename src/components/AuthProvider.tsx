"use client";

import { AuthService } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AuthProviderProps {
  children: React.ReactNode;
}

const PUBLIC_ROUTES = ["/login", "/auth/callback", "/about", "/privacy", "/terms", "/help", "/contact"];

export function AuthProvider({ children }: AuthProviderProps) {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const authService = AuthService.getInstance();

  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = authService.isAuthenticated();
      const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

      if (isPublicRoute) {
        setIsCheckingAuth(false);
        return;
      }

      if (!isAuthenticated) {
        router.push("/login");
      } else if (pathname === "/login") {
        router.push("/");
      }

      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [pathname, router, authService]);

  if (isCheckingAuth && !PUBLIC_ROUTES.includes(pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
