"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardGlass } from "@/components/ui/card";
import { Chrome, Shield, LogIn, Sparkles, TrendingUp, Cloud } from "lucide-react";
import React, { useState, useEffect } from "react";
import { AuthService } from "@/lib/auth";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [authService] = useState(() => AuthService.getInstance());

  useEffect(() => {
    // Initialize Google OAuth when component mounts
    authService.initializeGoogleOAuth().catch(console.error);
  }, [authService]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await authService.signInWithGoogle();
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-var(--navbar-height))] flex items-center justify-center p-4 bg-gradient-to-br from-bg-base via-bg-layer-1 to-bg-layer-2 relative overflow-hidden z-0">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-accent-primary-soft rounded-full blur-xl opacity-30 animate-pulse" />
        <div
          className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-info-soft rounded-full blur-lg opacity-40 animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 right-1/3 w-16 h-16 bg-success-soft rounded-full blur-md opacity-50 animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] opacity-30" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        <CardGlass className="p-8 mb-6">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="mx-auto w-16 h-16 bg-accent-primary-soft rounded-2xl flex items-center justify-center mb-2">
              <LogIn size={32} className="text-accent-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-text-primary mb-2">
                Welcome to IsoList
              </CardTitle>
              <p className="text-text-secondary text-sm leading-relaxed">
                Track, rate, and discover your favorite movies, series, and anime with cloud sync
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              variant="outline"
              size="lg"
              className="w-full h-12 text-base font-medium group relative overflow-hidden border-border-interactive hover:border-accent-primary-soft hover:bg-accent-primary-soft/10 transition-all duration-medium"
            >
              <div className="flex items-center justify-center gap-3">
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Chrome
                    size={20}
                    className="text-text-secondary group-hover:text-accent-primary transition-colors duration-short"
                  />
                )}
                <span className="text-text-primary">
                  {isLoading ? "Signing in..." : "Continue with Google"}
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-divider" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-bg-layer-1 px-4 text-text-muted">Secure cloud storage</span>
              </div>
            </div>

            {/* Cloud sync feature highlight */}
            <div className="flex items-start gap-3 p-4 bg-info-soft/50 rounded-lg border border-info-soft">
              <Cloud size={20} className="text-info flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-text-primary font-medium mb-1">Cloud Sync</p>
                <p className="text-text-secondary text-xs leading-relaxed">
                  Your data syncs automatically to Google Drive. Access your lists from any device, even
                  offline.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-success-soft/50 rounded-lg border border-success-soft">
              <Shield size={20} className="text-success flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-text-primary font-medium mb-1">Privacy & Security</p>
                <p className="text-text-secondary text-xs leading-relaxed">
                  Your data is stored in your personal Google Drive. We only access files we create.
                </p>
              </div>
            </div>
          </CardContent>
        </CardGlass>

        {/* Features showcase with cloud sync */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="p-4 text-center group hover:bg-bg-layer-2/50 transition-all duration-medium">
            <div className="w-8 h-8 mx-auto mb-2 bg-success-soft rounded-lg flex items-center justify-center">
              <TrendingUp size={16} className="text-success" />
            </div>
            <p className="text-xs text-text-secondary group-hover:text-text-primary transition-colors duration-short">
              Track Progress
            </p>
          </Card>

          <Card className="p-4 text-center group hover:bg-bg-layer-2/50 transition-all duration-medium">
            <div className="w-8 h-8 mx-auto mb-2 bg-info-soft rounded-lg flex items-center justify-center">
              <Cloud size={16} className="text-info" />
            </div>
            <p className="text-xs text-text-secondary group-hover:text-text-primary transition-colors duration-short">
              Cloud Sync
            </p>
          </Card>

          <Card className="p-4 text-center group hover:bg-bg-layer-2/50 transition-all duration-medium">
            <div className="w-8 h-8 mx-auto mb-2 bg-accent-primary-soft rounded-lg flex items-center justify-center">
              <Sparkles size={16} className="text-accent-primary" />
            </div>
            <p className="text-xs text-text-secondary group-hover:text-text-primary transition-colors duration-short">
              Discover New
            </p>
          </Card>
        </div>

        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-4 text-xs text-text-muted">
            <a href="#" className="hover:text-accent-primary transition-colors duration-short">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="#" className="hover:text-accent-primary transition-colors duration-short">
              Terms of Service
            </a>
            <span>•</span>
            <a href="#" className="hover:text-accent-primary transition-colors duration-short">
              Support
            </a>
          </div>
          <p className="text-xs text-text-muted">
            Your entertainment data, synced securely across all devices
          </p>
        </div>
      </div>
    </div>
  );
}
