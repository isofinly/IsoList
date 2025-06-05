import { GoogleDriveService } from "./google-drive";

interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  accessToken: string;
}

export class AuthService {
  private static instance: AuthService;
  private user: GoogleUser | null = null;
  private driveService: GoogleDriveService;
  private codeVerifier: string = "";

  private constructor() {
    this.driveService = new GoogleDriveService();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Generate PKCE code verifier and challenge
  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    // Fix for TypeScript: convert to regular array first
    const charArray = Array.from(array).map((byte) => String.fromCharCode(byte));
    return btoa(charArray.join("")).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest("SHA-256", data);
    // Fix for TypeScript: convert to regular array first
    const digestArray = Array.from(new Uint8Array(digest));
    const charArray = digestArray.map((byte) => String.fromCharCode(byte));
    return btoa(charArray.join("")).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
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
      // Decode the JWT token to get user info
      const payload = JSON.parse(atob(response.credential.split(".")[1]));

      console.log("User authenticated:", payload);

      // Store user info (Note: This is just ID token, for Drive access we need OAuth2 flow)
      this.user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        accessToken: "", // Will be set through OAuth2 flow
      };

      // Save to localStorage
      localStorage.setItem("user", JSON.stringify(this.user));

      // Redirect to main app
      window.location.href = "/";
    } catch (error) {
      console.error("Authentication failed:", error);
    }
  }

  async signInWithGoogle(): Promise<void> {
    // Generate PKCE parameters
    this.codeVerifier = this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(this.codeVerifier);

    // Store code verifier for later use
    sessionStorage.setItem("code_verifier", this.codeVerifier);

    const oauth2Endpoint = "https://accounts.google.com/o/oauth2/v2/auth";
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      redirect_uri: `${window.location.origin}/auth/callback`,
      response_type: "code",
      scope:
        "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
      access_type: "offline",
      // PKCE parameters
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    window.location.href = `${oauth2Endpoint}?${params}`;
  }

  async handleOAuthCallback(code: string): Promise<boolean> {
    try {
      const codeVerifier = sessionStorage.getItem("code_verifier");
      if (!codeVerifier) throw new Error("Missing code verifier");

      // Exchange code for tokens using PKCE
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, codeVerifier }),
      });

      if (!response.ok) throw new Error("Token exchange failed");

      const { user, accessToken } = await response.json();

      this.user = { ...user, accessToken };
      localStorage.setItem("user", JSON.stringify(this.user));

      // Clean up
      sessionStorage.removeItem("code_verifier");

      // Initialize Drive service
      await this.driveService.initialize(accessToken);

      return true;
    } catch (error) {
      console.error("OAuth callback failed:", error);
      return false;
    }
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
    }
    window.location.href = "/login";
  }

  isAuthenticated(): boolean {
    return this.getUser() !== null;
  }

  getDriveService(): GoogleDriveService {
    return this.driveService;
  }
}
