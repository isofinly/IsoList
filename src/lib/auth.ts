import type { GoogleDriveService } from "./google-drive";

interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiry?: number;
}

export class AuthService {
  private static instance: AuthService;
  private user: GoogleUser | null = null;
  private driveService: GoogleDriveService | null = null;
  private codeVerifier = "";

  private constructor() {
    // Initialize driveService later to prevent circular dependency
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
      // TODO: Refactor such use
      // Import GoogleDriveService here to avoid circular dependency at module load time
      const { GoogleDriveService } = require("./google-drive");
      AuthService.instance.setDriveService(new GoogleDriveService(AuthService.instance));
    }
    return AuthService.instance;
  }

  // Generate PKCE code verifier and challenge
  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const base64String = btoa(String.fromCharCode.apply(null, Array.from(array)));
    return base64String.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest("SHA-256", data);
    const digestArray = new Uint8Array(digest);
    const base64String = btoa(String.fromCharCode.apply(null, Array.from(digestArray)));
    return base64String.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  }

  async initializeGoogleOAuth(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined") {
        reject(new Error("Google OAuth can only be initialized in the browser"));
        return;
      }

      // Check if script already exists
      if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.onload = () => {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            callback: this.handleCredentialResponse.bind(this),
            auto_select: false,
            cancel_on_tap_outside: true,
          });
        }
        resolve();
      };
      script.onerror = () => reject(new Error("Failed to load Google OAuth script"));
      document.head.appendChild(script);
    });
  }

  private async handleCredentialResponse(response: any) {
    try {
      const payload = JSON.parse(atob(response.credential.split(".")[1]));

      this.user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        accessToken: "", // Will be set through OAuth2 flow
      };

      localStorage.setItem("user", JSON.stringify(this.user));

      window.location.href = "/";
    } catch (error) {
      console.error("Authentication failed:", error);
    }
  }

  async signInWithGoogle(): Promise<void> {
    this.clearAuthData();
    sessionStorage.removeItem("code_verifier");

    this.codeVerifier = this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(this.codeVerifier);

    sessionStorage.setItem("code_verifier", this.codeVerifier);

    const oauth2Endpoint = "https://accounts.google.com/o/oauth2/v2/auth";
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      redirect_uri: `${window.location.origin}/auth/callback`,
      response_type: "code",
      scope:
        "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
      access_type: "offline",
      prompt: "consent", // Force consent to ensure refresh token
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    window.location.href = `${oauth2Endpoint}?${params}`;
  }

  async handleOAuthCallback(code: string): Promise<boolean> {
    try {
      const codeVerifier = sessionStorage.getItem("code_verifier");
      if (!codeVerifier) {
        console.error("Missing code verifier in session storage");
        throw new Error("Missing code verifier");
      }

      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, codeVerifier }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("API Error:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });
        throw new Error(
          `Token exchange failed: ${errorData.details || errorData.error || response.statusText}`,
        );
      }

      const { user, accessToken, refreshToken, expiresIn } = await response.json();

      this.user = {
        ...user,
        accessToken,
        refreshToken,
        tokenExpiry: Date.now() + expiresIn * 1000,
      };
      localStorage.setItem("user", JSON.stringify(this.user));

      sessionStorage.removeItem("code_verifier");

      await this.driveService?.initialize(accessToken);

      return true;
    } catch (error) {
      console.error("OAuth callback failed:", error);
      sessionStorage.removeItem("code_verifier");
      localStorage.removeItem("user");
      return false;
    }
  }

  setDriveService(driveService: GoogleDriveService): void {
    this.driveService = driveService;
  }

  getUser(): GoogleUser | null {
    if (!this.user && typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          this.user = JSON.parse(stored);
        } catch (error) {
          console.error("Failed to parse stored user data:", error);
          localStorage.removeItem("user");
        }
      }
    }
    return this.user;
  }

  async signOut(): Promise<void> {
    this.user = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("mediaItems");
      localStorage.removeItem("lastSync");
      localStorage.removeItem("hasLocalChanges");
      localStorage.removeItem("isolist-folder-id");
    }
    window.location.href = "/login";
  }

  isAuthenticated(): boolean {
    return this.getUser() !== null;
  }

  getDriveService(): GoogleDriveService {
    if (!this.driveService) {
      throw new Error("GoogleDriveService not initialized");
    }
    return this.driveService;
  }

  isTokenExpired(): boolean {
    const user = this.getUser();
    if (!user?.tokenExpiry) return true;

    const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;
    return user.tokenExpiry < fiveMinutesFromNow;
  }

  async refreshAccessToken(): Promise<boolean> {
    const user = this.getUser();
    if (!user?.refreshToken) {
      console.log("No refresh token available, need to re-authenticate");
      return false;
    }

    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: user.refreshToken }),
      });

      if (!response.ok) {
        console.error("Token refresh failed:", response.status);
        return false;
      }

      const { accessToken, expiresIn } = await response.json();

      this.user = {
        ...user,
        accessToken,
        tokenExpiry: Date.now() + expiresIn * 1000,
      };

      localStorage.setItem("user", JSON.stringify(this.user));

      await this.driveService?.initialize(accessToken);

      return true;
    } catch (error) {
      console.error("Token refresh error:", error);
      return false;
    }
  }

  async ensureValidToken(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      return false;
    }

    if (this.isTokenExpired()) {
      console.log("Token expired, attempting refresh...");
      const refreshed = await this.refreshAccessToken();

      if (!refreshed) {
        console.log("Token refresh failed, clearing invalid auth");
        this.clearAuthData();
        return false;
      }
    }

    return true;
  }

  private clearAuthData(): void {
    this.user = null;
    localStorage.removeItem("user");
    localStorage.removeItem("mediaItems");
    localStorage.removeItem("lastSync");
    localStorage.removeItem("hasLocalChanges");
    localStorage.removeItem("isolist-folder-id");
  }
}
