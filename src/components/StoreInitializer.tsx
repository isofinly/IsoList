"use client";

import { AuthService } from "@/lib/auth";
import { useMediaStore } from "@/lib/store";
import { useEffect, useState } from "react";

interface StoreInitializerProps {
  children: React.ReactNode;
}

export function StoreInitializer({ children }: StoreInitializerProps) {
  const { initializeStore, isLoading } = useMediaStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        const authService = AuthService.getInstance();

        if (typeof window !== "undefined") {
          try {
            await authService.initializeGoogleOAuth();
          } catch (error) {
            console.warn("Google OAuth initialization failed:", error);
          }
        }

        await initializeStore();

        setIsInitialized(true);
      } catch (error) {
        console.error("Store initialization failed:", error);
        setIsInitialized(true);
      }
    };

    initialize();
  }, [initializeStore]);

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
