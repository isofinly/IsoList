"use client";

import { useEffect, useState } from "react";
import { AuthService } from "@/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallback() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const router = useRouter();
  const searchParams = useSearchParams();
  const authService = AuthService.getInstance();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const error = searchParams.get("error");

      if (error) {
        setStatus("error");
        setTimeout(() => router.push("/login"), 3000);
        return;
      }

      if (code) {
        const success = await authService.handleOAuthCallback(code);
        if (success) {
          setStatus("success");
          setTimeout(() => router.push("/"), 2000);
        } else {
          setStatus("error");
          setTimeout(() => router.push("/login"), 3000);
        }
      }
    };

    handleCallback();
  }, [searchParams, router, authService]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        {status === "loading" && (
          <>
            <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Completing authentication...</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-8 h-8 bg-success rounded-full mx-auto flex items-center justify-center">
              ✓
            </div>
            <p>Success! Redirecting...</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-8 h-8 bg-error rounded-full mx-auto flex items-center justify-center">
              ✗
            </div>
            <p>Authentication failed. Redirecting to login...</p>
          </>
        )}
      </div>
    </div>
  );
}
