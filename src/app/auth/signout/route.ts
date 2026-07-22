import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env-public";

export async function POST(request: NextRequest) {
  const origin = new URL(request.url).origin;

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(`${origin}/login`, { status: 303 });
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(`${origin}/login`, { status: 303 });
}
