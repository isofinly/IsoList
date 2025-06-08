import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { code, codeVerifier } = await request.json();

    const tokenRequestBody = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      code,
      grant_type: "authorization_code",
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    });

    if (codeVerifier) {
      tokenRequestBody.append("code_verifier", codeVerifier);
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: tokenRequestBody,
    });

    const tokenData = await tokenResponse.text();

    if (!tokenResponse.ok) {
      console.error("Google token error:", {
        status: tokenResponse.status,
        response: tokenData,
        requestParams: Object.fromEntries(tokenRequestBody.entries()),
      });
      return NextResponse.json(
        {
          error: "Token exchange failed",
          details: tokenData,
          status: tokenResponse.status,
        },
        { status: 400 },
      );
    }

    const tokens = JSON.parse(tokenData);

    const userInfoResponse = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokens.access_token}`,
    );

    if (!userInfoResponse.ok) {
      console.error("User info fetch failed:", userInfoResponse.status);
      return NextResponse.json({ error: "Failed to get user info" }, { status: 400 });
    }

    const userInfo = await userInfoResponse.json();
    console.log("User info received for:", userInfo.email);

    return NextResponse.json({
      user: {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
      },
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in || 3600,
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Authentication failed", message: String(error) },
      { status: 500 },
    );
  }
}
