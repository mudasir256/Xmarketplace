import { createAdminClient } from "@/lib/supabase/admin";
import { ensureProfile } from "@/lib/account/api";

export async function getProfile(userId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("id, full_name, email, phone, avatar_path, role, account_status, created_at, updated_at")
    .eq("id", userId)
    .maybeSingle();
  return data;
}

export async function updateProfile(
  user: { id: string; email?: string | null },
  input: { fullName: string; phone?: string | null },
) {
  await ensureProfile({ id: user.id, email: user.email, fullName: input.fullName });
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .update({
      full_name: input.fullName,
      phone: input.phone?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)
    .select("id, full_name, email, phone, avatar_path")
    .single();

  if (error) return { ok: false as const, message: error.message };
  return { ok: true as const, profile: data };
}
