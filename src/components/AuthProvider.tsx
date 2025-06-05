"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthService } from "@/lib/auth";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const authService = AuthService.getInstance();

  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = authService.isAuthenticated();
      const isLoginPage = pathname === "/login" || pathname === "/auth/callback";

      if (!isAuthenticated && !isLoginPage) {
        // Redirect to login if not authenticated and not on login page
        router.push("/login");
      } else if (isAuthenticated && pathname === "/login") {
        // Redirect to home if authenticated and on login page
        router.push("/");
      }

      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [pathname, router, authService]);

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
