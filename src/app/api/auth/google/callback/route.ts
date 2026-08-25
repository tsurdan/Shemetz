import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { jwtVerify, createRemoteJWKSet } from "jose";
import { createSessionToken, setSessionCookie } from "@/lib/session";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));
const STATE_COOKIE = "g_state";
const VERIFIER_COOKIE = "g_verifier";

type GoogleIdTokenPayload = {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const store = await cookies();
  const expectedState = store.get(STATE_COOKIE)?.value;
  const codeVerifier = store.get(VERIFIER_COOKIE)?.value;
  store.delete(STATE_COOKIE);
  store.delete(VERIFIER_COOKIE);

  if (!code || !state || !expectedState || !codeVerifier || state !== expectedState) {
    return new NextResponse("כניסה נכשלה (state לא תואם). נסו שוב.", { status: 400 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const redirectUri = new URL("/api/auth/google/callback", request.url).toString();

  const tokenResponse = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
      code_verifier: codeVerifier,
    }),
  });

  if (!tokenResponse.ok) {
    return new NextResponse("כניסה נכשלה (שגיאה מול Google). נסו שוב.", { status: 400 });
  }

  const { id_token: idToken } = (await tokenResponse.json()) as { id_token: string };
  const { payload } = await jwtVerify<GoogleIdTokenPayload>(idToken, JWKS, {
    issuer: "https://accounts.google.com",
    audience: env.GOOGLE_CLIENT_ID,
  });

  if (!payload.email_verified) {
    return new NextResponse("כתובת האימייל שלכם אינה מאומתת ב-Google.", { status: 403 });
  }

  const user = await env.DB.prepare(
    `SELECT id, name, avatar_url, role FROM users WHERE email = ?1`
  )
    .bind(payload.email)
    .first<{ id: number; name: string; avatar_url: string | null; role: "writer" | "admin" }>();

  if (!user) {
    return new NextResponse(
      "כתובת האימייל שלכם אינה רשומה ככותבים באתר. פנו למנהל כדי שיוסיף אתכם.",
      { status: 403 }
    );
  }

  await env.DB.prepare(
    `UPDATE users SET google_sub = ?1, avatar_url = COALESCE(avatar_url, ?2) WHERE id = ?3`
  )
    .bind(payload.sub, payload.picture ?? null, user.id)
    .run();

  await setSessionCookie(
    await createSessionToken({
      userId: user.id,
      email: payload.email,
      name: user.name,
      avatarUrl: user.avatar_url ?? payload.picture ?? null,
      role: user.role,
    })
  );

  return NextResponse.redirect(new URL("/", request.url));
}
