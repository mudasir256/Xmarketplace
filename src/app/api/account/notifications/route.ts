import { requireApiUser, jsonOk, jsonError } from "@/lib/account/api";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/account/overview";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;
  const notifications = await listNotifications(auth.user.id);
  return jsonOk({ notifications });
}

export async function PATCH(request: Request) {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;
  const body = (await request.json().catch(() => null)) as
    | { notificationId?: string; markAll?: boolean }
    | null;

  if (body?.markAll) {
    const result = await markAllNotificationsRead(auth.user.id);
    if (!result.ok) return jsonError(result.message, 400);
    return jsonOk({ updated: true });
  }

  if (!body?.notificationId) return jsonError("notificationId or markAll is required");
  const result = await markNotificationRead(auth.user.id, body.notificationId);
  if (!result.ok) return jsonError(result.message, 400);
  return jsonOk({ updated: true });
}
