import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { randomUrlSafeString, sha256Base64Url } from "@/lib/google-oauth";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const STATE_COOKIE = "g_state";
const VERIFIER_COOKIE = "g_verifier";

export async function GET(request: Request) {
  const { env } = await getCloudflareContext({ async: true });
  if (!env.GOOGLE_CLIENT_ID) {
    return new NextResponse(
      "Google OAuth is not configured yet (missing GOOGLE_CLIENT_ID). See README for setup.",
      { status: 500 }
    );
  }

  const state = randomUrlSafeString();
  const codeVerifier = randomUrlSafeString();
  const codeChallenge = await sha256Base64Url(codeVerifier);
  const redirectUri = new URL("/api/auth/google/callback", request.url).toString();

  const authUrl = new URL(GOOGLE_AUTH_URL);
  authUrl.searchParams.set("client_id", env.GOOGLE_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("code_challenge", codeChallenge);
  authUrl.searchParams.set("code_challenge_method", "S256");

  const store = await cookies();
  const cookieOptions = { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/api/auth/google", maxAge: 300 };
  store.set(STATE_COOKIE, state, cookieOptions);
  store.set(VERIFIER_COOKIE, codeVerifier, cookieOptions);

  return NextResponse.redirect(authUrl);
}
