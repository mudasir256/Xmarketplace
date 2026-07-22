import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isSelectedLocation } from "@/lib/location";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: true, location: null });
  }

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("profiles")
      .select("preferred_location")
      .eq("id", user.id)
      .maybeSingle();

    const location = isSelectedLocation(data?.preferred_location) ? data.preferred_location : null;
    return NextResponse.json({ ok: true, location });
  } catch {
    return NextResponse.json({ ok: true, location: null });
  }
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as unknown;
  if (!isSelectedLocation(body)) {
    return NextResponse.json({ ok: false, message: "Invalid location" }, { status: 400 });
  }

  try {
    const admin = createAdminClient();
    await admin.from("profiles").upsert(
      {
        id: user.id,
        email: user.email ?? null,
        preferred_location: body,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
    return NextResponse.json({ ok: true, location: body });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Could not save location",
      },
      { status: 500 },
    );
  }
}
