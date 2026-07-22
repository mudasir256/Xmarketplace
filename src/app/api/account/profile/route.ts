import { requireApiUser, jsonOk, jsonError } from "@/lib/account/api";
import { getProfile, updateProfile } from "@/lib/account/profile";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;
  const profile = await getProfile(auth.user.id);
  return jsonOk({
    profile: profile ?? {
      id: auth.user.id,
      full_name: auth.user.fullName,
      email: auth.user.email,
      phone: null,
      avatar_path: auth.user.avatarUrl,
    },
  });
}

export async function PATCH(request: Request) {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;

  const body = (await request.json().catch(() => null)) as
    | { fullName?: string; phone?: string | null }
    | null;

  if (!body?.fullName?.trim()) return jsonError("fullName is required");

  const result = await updateProfile(
    { id: auth.user.id, email: auth.user.email },
    { fullName: body.fullName.trim(), phone: body.phone },
  );

  if (!result.ok) return jsonError(result.message, 500);
  return jsonOk({ profile: result.profile });
}
