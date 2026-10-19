import { NextResponse } from "next/server";

// Supabase OAuth is no longer used. Firebase sign-in creates a server session at /api/auth/session.
export async function GET(request: Request) {
  return NextResponse.redirect(new URL("/login", request.url));
}
