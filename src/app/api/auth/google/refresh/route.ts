import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      console.error("No refresh token provided");
      return NextResponse.json({ error: "Refresh token required" }, { status: 400 });
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    const tokenData = await tokenResponse.text();

    if (!tokenResponse.ok) {
      console.error("Google refresh failed:", {
        status: tokenResponse.status,
        response: tokenData,
      });
      return NextResponse.json(
        {
          error: "Token refresh failed",
          details: tokenData,
          status: tokenResponse.status,
        },
        { status: 400 },
      );
    }

    const tokens = JSON.parse(tokenData);

    return NextResponse.json({
      accessToken: tokens.access_token,
      expiresIn: tokens.expires_in || 3600,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return NextResponse.json({ error: "Token refresh failed", message: String(error) }, { status: 500 });
  }
}
