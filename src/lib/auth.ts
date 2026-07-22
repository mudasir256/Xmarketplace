import { createClient } from "@/lib/supabase/server";

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

  const meta = user.user_metadata ?? {};
  const identityData = user.identities?.find((identity) => identity.provider === "google")?.identity_data;
  const fullName =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    (typeof identityData?.full_name === "string" && identityData.full_name) ||
    (typeof identityData?.name === "string" && identityData.name) ||
    user.email?.split("@")[0] ||
    "Account";
  const avatarUrl =
    (typeof meta.avatar_url === "string" && meta.avatar_url) ||
    (typeof meta.picture === "string" && meta.picture) ||
    (typeof identityData?.avatar_url === "string" && identityData.avatar_url) ||
    (typeof identityData?.picture === "string" && identityData.picture) ||
    null;

  return {
    id: user.id,
    email: user.email ?? "",
    fullName,
    avatarUrl,
  };
}
