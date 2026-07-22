import { createClient } from "@/lib/supabase/server";
import { getUserAvatarUrl, getUserDisplayName } from "@/lib/user-display";

export type AuthUserView = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
};

function isConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function getAuthUser(): Promise<AuthUserView | null> {
  if (!isConfigured()) return null;

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
}
