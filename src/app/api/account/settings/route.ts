import { requireApiUser, jsonOk, jsonError } from "@/lib/account/api";
import { getSettings, updateSettings } from "@/lib/account/overview";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;
  const settings = await getSettings(auth.user.id);
  return jsonOk({ settings });
}

export async function PATCH(request: Request) {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return jsonError("Invalid JSON body");

  const result = await updateSettings(
    { id: auth.user.id, email: auth.user.email },
    {
      emailNotifications:
        body.emailNotifications == null ? undefined : Boolean(body.emailNotifications),
      smsNotifications: body.smsNotifications == null ? undefined : Boolean(body.smsNotifications),
      profileVisibility:
        body.profileVisibility === "private" || body.profileVisibility === "public"
          ? body.profileVisibility
          : undefined,
    },
  );

  if (!result.ok) return jsonError(result.message, 400);
  return jsonOk({ settings: result.settings });
}
