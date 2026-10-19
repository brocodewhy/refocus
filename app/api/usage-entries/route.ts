
import { NextRequest, NextResponse } from "next/server";
import { getCurrentFirebaseUser } from "@/lib/firebase-admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

async function currentUser(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (origin && origin !== new URL(request.url).origin) {
    return {
      error: NextResponse.json(
        { error: "Invalid origin." },
        { status: 403 }
      ),
    };
  }

  const user = await getCurrentFirebaseUser();

  if (!user) {
    return {
      error: NextResponse.json(
        { error: "Please sign in again." },
        { status: 401 }
      ),
    };
  }

  return { user };
}

export async function GET(request: NextRequest) {
  const auth = await currentUser(request);
  if ("error" in auth) return auth.error;

  try {
    const supabase = createAdminSupabaseClient();

    const { data, error } = await supabase
      .from("usage_entries")
      .select("id, app_name, minutes, entry_date")
      .eq("firebase_uid", auth.user.uid)
      .order("entry_date", { ascending: false })
      .limit(500);

    if (error) throw error;

    return NextResponse.json({ entries: data ?? [] });
  } catch (error) {
    console.error("[usage-entries] Load failed:", error);

    return NextResponse.json(
      { error: "Could not load usage entries." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await currentUser(request);
  if ("error" in auth) return auth.error;

  try {
    const body = await request.json();

    const appName =
      typeof body?.app_name === "string"
        ? body.app_name.trim().toLowerCase()
        : "";

    const minutes = Number(body?.minutes);

    const entryDate =
      typeof body?.entry_date === "string" ? body.entry_date : "";
    const mode = body?.mode === "add" ? "add" : "replace";

    if (
      !appName ||
      appName.length > 120 ||
      !Number.isInteger(minutes) ||
      minutes < 1 ||
      minutes > 1440 ||
      !/^\d{4}-\d{2}-\d{2}$/.test(entryDate)
    ) {
      return NextResponse.json(
        {
          error:
            "Enter a valid app/category, date, and duration between 1 and 1440 minutes.",
        },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    if (mode === "add") {
      const { data: existing, error: findError } = await supabase
        .from("usage_entries")
        .select("id, minutes")
        .eq("firebase_uid", auth.user.uid)
        .eq("app_name", appName)
        .eq("entry_date", entryDate)
        .maybeSingle();

      if (findError) throw findError;

      if (existing) {
        const { error } = await supabase
          .from("usage_entries")
          .update({ minutes: Math.min(1440, Number(existing.minutes) + minutes) })
          .eq("id", existing.id)
          .eq("firebase_uid", auth.user.uid);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("usage_entries").insert({
          firebase_uid: auth.user.uid,
          app_name: appName,
          minutes,
          entry_date: entryDate,
        });
        if (error) throw error;
      }
    } else {
      const { error } = await supabase
        .from("usage_entries")
        .upsert(
          { firebase_uid: auth.user.uid, app_name: appName, minutes, entry_date: entryDate },
          { onConflict: "firebase_uid,app_name,entry_date" }
        );
      if (error) throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[usage-entries] Save failed:", error);

    return NextResponse.json(
      { error: "Could not save usage entry." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await currentUser(request);
  if ("error" in auth) return auth.error;

  try {
    const body = await request.json();
    const id = typeof body?.id === "string" ? body.id : "";

    if (!id) {
      return NextResponse.json(
        { error: "Missing entry ID." },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    const { error } = await supabase
      .from("usage_entries")
      .delete()
      .eq("id", id)
      .eq("firebase_uid", auth.user.uid);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[usage-entries] Delete failed:", error);

    return NextResponse.json(
      { error: "Could not delete usage entry." },
      { status: 500 }
    );
  }
}
