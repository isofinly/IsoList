"use client";

import { AuthService } from "@/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function AuthCallback() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const router = useRouter();
  const searchParams = useSearchParams();
  const authService = AuthService.getInstance();
  const hasHandledCallback = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      if (hasHandledCallback.current) {
        console.log("Callback already handled, skipping");
        return;
      }
      hasHandledCallback.current = true;

      const code = searchParams.get("code");
      const error = searchParams.get("error");

      if (error) {
        console.error("OAuth error:", error);
        setStatus("error");
        setTimeout(() => router.push("/login"), 3000);
        return;
      }

      if (!code) {
        console.error("No authorization code received");
        setStatus("error");
        setTimeout(() => router.push("/login"), 3000);
        return;
      }

      const success = await authService.handleOAuthCallback(code);
      if (success) {
        setStatus("success");
        setTimeout(() => router.push("/"), 2000);
      } else {
        console.error("Authentication failed");
        setStatus("error");
        setTimeout(() => router.push("/login"), 3000);
      }
    };

    const timeoutId = setTimeout(handleCallback, 100);
    return () => clearTimeout(timeoutId);
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
