import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserAvatarUrl, getUserDisplayName } from "@/lib/user-display";

export type AccountUser = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
};

export async function requireApiUser(): Promise<
  { user: AccountUser; error?: undefined } | { user?: undefined; error: NextResponse }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 }) };
  }

  return {
    user: {
      id: user.id,
      email: user.email ?? "",
      fullName: getUserDisplayName(user),
      avatarUrl: getUserAvatarUrl(user),
    },
  };
}

export async function ensureProfile(user: { id: string; email?: string | null; fullName?: string }) {
  const admin = createAdminClient();
  await admin.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? null,
      full_name: user.fullName ?? null,
    },
    { onConflict: "id" },
  );
  return admin;
}

export function jsonOk<T extends Record<string, unknown>>(data: T, status = 200) {
  return NextResponse.json({ ok: true, ...data }, { status });
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}
