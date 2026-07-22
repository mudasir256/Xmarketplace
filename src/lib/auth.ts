import { createClient } from "@/lib/supabase/server";
import { getUserAvatarUrl, getUserDisplayName } from "@/lib/user-display";
import { isSupabaseConfigured } from "@/lib/env-public";

export type AuthUserView = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
};

export async function getAuthUser(): Promise<AuthUserView | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    return {
      id: user.id,
      email: user.email ?? "",
      fullName: getUserDisplayName(user),
      avatarUrl: getUserAvatarUrl(user),
    };
  } catch (error) {
    console.error("Auth lookup failed", error);
    return null;
  }
}
