
import { NextRequest, NextResponse } from "next/server";
import { getCurrentFirebaseUser } from "@/lib/firebase-admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json(
      { error: "Invalid origin." },
      { status: 403 }
    );
  }

  const user = await getCurrentFirebaseUser();

  if (!user) {
    return NextResponse.json(
      { error: "Please sign in again." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const minutes = Number(body?.duration_minutes);

    if (
      !Number.isInteger(minutes) ||
      minutes < 1 ||
      minutes > 240
    ) {
      return NextResponse.json(
        { error: "Duration must be between 1 and 240 minutes." },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    const { data, error } = await supabase
      .from("focus_sessions")
      .insert({
        firebase_uid: user.uid,
        duration_minutes: minutes,
        completed_at: new Date().toISOString(),
      })
      .select("id, firebase_uid, duration_minutes, completed_at")
      .single();

    if (error) {
      console.error("[focus-sessions] Supabase save failed:", error);

      return NextResponse.json(
        { error: "Could not save focus session." },
        { status: 500 }
      );
    }

    console.log("[focus-sessions] Saved session:", data);

    return NextResponse.json({
      ok: true,
      session: data,
    });
  } catch (error) {
    console.error("[focus-sessions] Save failed:", error);

    return NextResponse.json(
      { error: "Could not save focus session." },
      { status: 500 }
    );
  }
}
