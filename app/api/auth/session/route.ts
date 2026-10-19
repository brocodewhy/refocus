import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdminAuth, SESSION_COOKIE } from "@/lib/firebase-admin";

const SESSION_DURATION_MS = 5 * 24 * 60 * 60 * 1000;

function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  try {
    const body = await request.json();
    const idToken = typeof body?.idToken === "string" ? body.idToken : "";
    if (!idToken) return NextResponse.json({ error: "Missing Firebase ID token." }, { status: 400 });
    const auth = getFirebaseAdminAuth();
    await auth.verifyIdToken(idToken, true);
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: SESSION_DURATION_MS });
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: Math.floor(SESSION_DURATION_MS / 1000),
    });
    return response;
  } catch (error) {
    console.error("Firebase session creation failed:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "Could not create a session. Check Firebase Admin configuration." }, { status: 401 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  // Revoke refresh tokens when possible so a previously issued session cookie is rejected
  // by verifySessionCookie(..., true). A failure to revoke must not prevent clearing the browser cookie.
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = cookies();
    const existingCookie = cookieStore.get(SESSION_COOKIE)?.value;
    if (existingCookie) {
      const auth = getFirebaseAdminAuth();
      const decoded = await auth.verifySessionCookie(existingCookie, false);
      await auth.revokeRefreshTokens(decoded.uid);
    }
  } catch (error) {
    console.warn("Could not revoke Firebase session during logout:", error instanceof Error ? error.message : "unknown error");
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
