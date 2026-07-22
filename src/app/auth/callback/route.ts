import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/auth-utils";
import { getUserAvatarUrl, getUserDisplayName } from "@/lib/user-display";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const next = safeNextPath(searchParams.get("next"));

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.redirect(`${origin}/login?error=auth-not-configured`);
  }

  if (error) {
    const target = next === "/update-password" ? "/forgot-password" : "/login";
    const params = new URLSearchParams({
      error: "authentication-failed",
    });
    if (errorDescription) params.set("detail", errorDescription);
    return NextResponse.redirect(`${origin}${target}?${params.toString()}`);
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (!exchangeError) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        try {
          const admin = createAdminClient();
          await admin.from("profiles").upsert(
            {
              id: user.id,
              email: user.email ?? null,
              full_name: getUserDisplayName(user),
              avatar_path: getUserAvatarUrl(user),
            },
            { onConflict: "id" },
          );
        } catch (profileError) {
          console.error("Failed to sync profile on auth callback", profileError);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  const fallback = next === "/update-password" ? "/forgot-password" : "/login";
  return NextResponse.redirect(`${origin}${fallback}?error=authentication-failed`);
}
